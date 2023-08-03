/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { Credentials, S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

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

// environment
const environment = process.env.SOOM_UNIVERSE_ENVIRONMENT;

// ******************************* Create Bucket ******************************* //

// the bucket create options
type CreateBucketOptions = {
  bucket: string;
};

export const createBucket = async (options: CreateBucketOptions) => {
  try {
    // we create the bucket
    const bucket = await s3
      .createBucket({
        Bucket: options.bucket,
        ACL: 'private',
        ObjectOwnership: 'ObjectWriter'
      })
      .promise();

    if (bucket) {
      // delete public access block
      const publicAccessBlock = await s3
        .deletePublicAccessBlock({
          Bucket: options.bucket
        })
        .promise();

      // access rules
      const allowedOrigins = ['dev', 'stg'].includes(environment)
        ? ['http://localhost:4200', `https://dashboard-${environment}.eifu.io`, `https://${environment}.soomportal.io`]
        : [`https://dashboard.eifu.io`, `https://www.soomportal.io`, `https://soomportal.io`];

      // updates cors permissions
      const cors = await s3
        .putBucketCors({
          Bucket: options.bucket,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedHeaders: ['Authorization', 'Content-Range', 'Accept', 'Content-Type', 'Origin', 'Range'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                AllowedOrigins: allowedOrigins,
                ExposeHeaders: ['Content-Range', 'Content-Length', 'ETag'],
                MaxAgeSeconds: 3000
              }
            ]
          }
        })
        .promise();

      return { bucket, publicAccessBlock, cors };
    }
  } catch (error) {
    console.error(error);
    return { error };
  }
};

// ******************************* Delete Bucket ******************************* //

// the bucket create options
type DeleteBucketOptions = {
  bucket: string;
};

export const deleteBucket = async (options: DeleteBucketOptions) => {
  try {
    // empty bucket
    await emptyBucket(options.bucket);
    // // empty versions
    // await deleteVersionMarkers(options.bucket);
    // delete bucket
    await s3.deleteBucket({ Bucket: options.bucket }).promise();

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const emptyBucket = async (Bucket: string, nextContinuationToken?: string, list = []) => {
  // list objects
  const { Contents, NextContinuationToken } = await s3
    .listObjectsV2({ Bucket, ContinuationToken: nextContinuationToken })
    .promise();

  // if has objects then delete it
  if (Contents.length && Contents.length > 0) {
    await s3
      .deleteObjects({
        Bucket,
        Delete: { Objects: Contents.map((item) => ({ Key: item.Key })) }
      })
      .promise();

    list = [...list, ...Contents.map((item) => item.Key)];
  }

  // if has next continuation token for list more objects
  if (NextContinuationToken) {
    return await emptyBucket(Bucket, NextContinuationToken, list);
  }

  // then return list of deleted objects
  return list;
};

// const deleteVersionMarkers = async (Bucket, nextKeyMarker, list = []) => {
//   // list objects
//   const { DeleteMarkers, Versions, NextKeyMarker } = await s3
//     .listObjectVersions({ Bucket, KeyMarker: nextKeyMarker })
//     .promise();
//   // if has markers objects
//   if (DeleteMarkers.length) {
//     await s3
//       .deleteObjects({
//         Bucket,
//         Delete: {
//           Objects: DeleteMarkers.map((item) => ({ Key: item.Key, VersionId: item.VersionId }))
//         }
//       })
//       .promise();
//     list = [...list, ...DeleteMarkers.map((item) => item.Key)];
//   }
//   // if has versions objects
//   if (Versions.length) {
//     await s3
//       .deleteObjects({
//         Bucket,
//         Delete: {
//           Objects: Versions.map((item) => ({ Key: item.Key, VersionId: item.VersionId }))
//         }
//       })
//       .promise();
//     list = [...list, ...Versions.map((item) => item.Key)];
//   }

//   // if has next key marker for list more objects
//   if (nextKeyMarker) {
//     return await deleteVersionMarkers(Bucket, NextKeyMarker, list);
//   }

//   return list;
// };

// ******************************* Get New Bucket Name ******************************* //

// the bucket create options
type NewBucketNameOptions = {
  name: string;
};

export const newBucketName = async (options: NewBucketNameOptions) => {
  const copyIndex = await getCopyIndex(options.name);
  return copyIndex !== 0 ? `${options.name}-${copyIndex}` : options.name;
};

const getCopyIndex = async (name: string, copyIndex = 0) => {
  const bucketName = copyIndex !== 0 ? `${name}-${copyIndex}` : name;
  const bucketExist = await existBucket(bucketName);

  if (bucketExist) {
    return await getCopyIndex(name, copyIndex + 1);
  }

  return copyIndex;
};

const existBucket = async (name: string) => {
  try {
    await s3.headBucket({ Bucket: name }).promise();
    return true;
  } catch (error) {
    if (error.statusCode === 403) {
      return true;
    }
    return false;
  }
};

// ******************************* Get URL for Upload Request ******************************* //

export const getImageUploadData = async (bucket: string, keyPrefix: string, imageExt: string, contentType: string) => {
  const signedUrlExpireSeconds = 60 * 15; // 15 mins to use the url
  const fileId = uuid();
  const fileKey = `${keyPrefix}${fileId}.${imageExt}`;

  try {
    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: bucket,
      Key: fileKey,
      ContentType: contentType,
      ACL: 'public-read',
      Expires: signedUrlExpireSeconds
    });

    return { url, key: fileKey, content_type: contentType };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getDocumentUploadUrl = async (bucket: string, key: string, contentType: string) => {
  const signedUrlExpireSeconds = 60 * 15; // 15 mins to use the url

  try {
    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'private',
      Expires: signedUrlExpireSeconds
    });

    return url;
  } catch (error) {
    console.error(error);
    return null;
  }
};
