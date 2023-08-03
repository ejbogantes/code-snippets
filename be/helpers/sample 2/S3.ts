/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { Credentials, S3 } from 'aws-sdk';

const s3Credentials = new Credentials({
  accessKeyId: process.env['AWS_S3_ACCESS_KEY_ID'] || '',
  secretAccessKey: process.env['AWS_S3_SECRET_ACCESS_KEY'] || ''
});

// s3 instance
const s3 = new S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4',
  credentials: s3Credentials
});

export const getSignedUrl = async (bucket: string, key: string) => {
  const signedUrlExpireSeconds = 60 * 15; // 15 mins to use the url

  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Key: key,
      Expires: signedUrlExpireSeconds
    });

    return url;
  } catch (error) {
    console.error(error);
    return null;
  }
};
