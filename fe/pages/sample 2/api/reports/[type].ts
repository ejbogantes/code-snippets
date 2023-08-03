import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import path from 'path';
import { promises as fs } from 'fs';
import md5 from 'crypto-js/md5';
import { get as _get } from 'lodash';

// docx search and replace
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

// service to convert from docx to pdf
import CloudmersiveConvertApiClient from 'cloudmersive-convert-api-client';

import { prismaRead } from '../../../db';

import SignPDF from '../../../helpers/pdf-signer/SignPDF.class';

const defaultClient = CloudmersiveConvertApiClient.ApiClient.instance;
const apiInstance = new CloudmersiveConvertApiClient.ConvertDocumentApi();
const Apikey = defaultClient.authentications.Apikey;
Apikey.apiKey = process.env.CLOUDMERSIVE_API_KEY;

const certPassword = process.env.SIGN_PDF_CERT_PASSWORD || '';
const certReason = 'Soom Inc';

const todayDate = new Date().toISOString().slice(0, 10);
const reportsTitles = { iq: `_Installation_Qualification_${todayDate}`, oq: `_Operational_Qualification_${todayDate}` };
const versions = process.env.VERSION_DASHBOARD.replace('v', '');
const reportsVersions = { iq: versions, oq: versions };
const reportsCreatedAt = {
  iq: { date: 'June 16, 2023', time: '1pm EST' },
  oq: { date: 'June 16, 2023', time: '1pm EST' }
};

// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
// function replaceErrors(key, value) {
//   if (value instanceof Error) {
//     return Object.getOwnPropertyNames(value).reduce(function (error, key) {
//       error[key] = value[key];
//       return error;
//     }, {});
//   }
//   return value;
// }

// function errorHandler(error) {
//   console.log(JSON.stringify(error, replaceErrors));

//   if (error.properties && error.properties.errors instanceof Array) {
//     const errorMessages = error.properties.errors
//       .map(function (error) {
//         return error.properties.explanation;
//       })
//       .join('\n');
//     console.log('errorMessages', errorMessages);
//     // errorMessages is a humanly readable message looking like this :
//     // 'The tag beginning with "foobar" is unopened'
//   }
//   throw error;
// }

const loadProfile = async (session) => {
  const defaultResult = { profile_id: '', first_name: '', last_name: '', email: '', company: '' };
  try {
    const email = _get(session, 'user.email', null);

    const result = await prismaRead.profile.findFirst({
      where: { email: email.toLowerCase(), enabled: true, deleted_at: null },
      select: {
        profile_id: true,
        first_name: true,
        last_name: true,
        email: true,
        company: true
      }
    });
    if (!result) {
      return defaultResult;
    }

    return result;
  } catch (error) {
    console.error(error);
    return defaultResult;
  }
};

export default withApiAuthRequired(async function handler(request, response) {
  const { method, query } = request;
  const type = query.type.toString();
  const signature = md5(`${query.cl}+${process.env.ENCRYPTION_KEY}`).toString();

  switch (method) {
    case 'GET':
      try {
        if (!query.cl || !query.admin || !(query.cfs && signature === query.checksum)) {
          return response.status(404).json({ message: 'Not supported' });
        }

        const session = await getSession(request, response);
        const user = await loadProfile(session);
        const labelUser = `${user.first_name} ${user.last_name} (${user.email})`;
        const timestamp = new Date().toISOString();
        const version = reportsVersions[type] || '';
        const createdAtDate = reportsCreatedAt[type] ? reportsCreatedAt[type].date : '';
        const createdAtTime = reportsCreatedAt[type] ? reportsCreatedAt[type].time : '';

        // TODO: check this path
        let directory = path.join(process.cwd(), 'reports');
        if (process.env.BASE_PATH_DASHBOARD) {
          directory = path.join(process.cwd(), process.env.BASE_PATH_DASHBOARD || '', 'reports');
        }

        const certBuffer = await fs.readFile(directory + `/cert.p12`);
        const pdfContents = await fs.readFile(directory + `/${type}.docx`, 'binary');
        const zip = new PizZip(pdfContents);

        const doc = new Docxtemplater(zip);
        doc.setData({
          Client_Name: query.cl,
          Provide_Dashboard_URL: process.env.SOOM_EIFU_DASHBOARD + query.admin,
          Provide_CFS_URL: query.cfs,
          OrganizationSlug: query.slug,
          User: labelUser,
          Date: timestamp,
          Version: version,
          Created_At_Date: createdAtDate,
          Created_At_Time: createdAtTime
        });
        doc.render();
        const buffer = doc.getZip().generate({ type: 'nodebuffer' });
        const pdfBuffer = await new Promise((resolve, reject) => {
          // convert to pdf
          apiInstance.convertDocumentDocxToPdf(buffer, (error, data, res) => {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              resolve(data);
            }
          });
        });

        // sign pdf
        const signPDF = new SignPDF(pdfBuffer, certBuffer, certPassword, certReason);
        const signedPDF = await signPDF.signPDF();

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader(
          'Content-Disposition',
          `attachment; filename=${query.cl.toString().replace(' ', '_')}${reportsTitles[type]}.pdf`
        );
        response.status(200);
        response.send(signedPDF);
        return;
      } catch (e) {
        // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
        // errorHandler(e);
        console.error(e);
        response.status(500).json({});
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
