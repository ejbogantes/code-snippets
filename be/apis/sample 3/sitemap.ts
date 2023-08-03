import { globby } from 'globby';
import path from 'path';

import { prismaRead } from '../../db';

export default async function handler(request, response) {
  const {
    headers: { host }
  } = request;
  const routes = await getPaths(host);
  const documentsRoutes = await getPublishedDocumentsPaths(host);

  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/xml');

  // generate sitemap here
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${routes}
    ${documentsRoutes}
    </urlset>`;

  response.end(xml);
}

const getPaths = async (host) => {
  let pagesDirectory = path.join(process.cwd(), 'pages');
  if (process.env.BASE_PATH_WEBAPP) {
    pagesDirectory = path.join(process.cwd(), process.env.BASE_PATH_WEBAPP || '', 'pages');
  }

  const pages = await globby([
    `${pagesDirectory}/**/*.tsx`,
    `!${pagesDirectory}/_*.tsx`,
    `!${pagesDirectory}/api`,
    `!${pagesDirectory}/404.tsx`,
    `!${pagesDirectory}/detail/[id].tsx`
  ]);

  return pages
    .map((page) => {
      const route = page.replace(pagesDirectory, '').replace('.tsx', '').replace('/index', '');

      return `
        <url>
            <loc>${`https://${host}${route}`}</loc>
        </url>
      `;
    })
    .join('');
};

const getPublishedDocumentsPaths = async (host) => {
  const domain = await prismaRead.domain.findFirst({
    where: { domain: host },
    select: { domain: true, configuration_id: true }
  });
  if (!domain) {
    return [];
  }

  const docs = await prismaRead.publishedDocument.findMany({
    where: { configuration_id: domain.configuration_id },
    select: { document_id: true }
  });
  if (!docs) {
    return [];
  }

  return docs
    .map((doc) => {
      return `
        <url>
            <loc>${`https://${host}/detail/${doc.document_id}`}</loc>
        </url>
      `;
    })
    .join('');
};
