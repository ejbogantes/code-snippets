/* eslint-disable dot-notation */
import { Credentials, S3 } from 'aws-sdk';
import { orderBy } from 'lodash';

const s3Credentials = new Credentials({
  accessKeyId: process.env['AWS_S3_ACCESS_KEY_ID'] || '',
  secretAccessKey: process.env['AWS_S3_SECRET_ACCESS_KEY'] || ''
});

const s3 = new S3({
  credentials: s3Credentials
});

export async function initializeMultipartUpload(options: { [key: string]: string }) {
  try {
    const { bucket, name, contentType, isPrivate } = options;
    const multipartParams = {
      Bucket: bucket,
      Key: name,
      ACL: isPrivate ? 'private' : 'public-read',
      ContentType: contentType
    };

    const multipartUpload = await s3.createMultipartUpload(multipartParams).promise();

    return {
      valid: true,
      data: {
        fileId: multipartUpload.UploadId,
        fileKey: multipartUpload.Key
      }
    };
  } catch (error) {
    console.error(error);
    return { valid: false, error };
  }
}

export async function getMultipartPreSignedUrls(options: { [key: string]: string | number }) {
  try {
    const { bucket, fileKey, fileId, parts } = options;

    const multipartParams = {
      Bucket: bucket,
      Key: fileKey,
      UploadId: fileId
    };

    const promises = [];

    for (let index = 0; index < parts; index++) {
      promises.push(
        s3.getSignedUrlPromise('uploadPart', {
          ...multipartParams,
          PartNumber: index + 1
        })
      );
    }

    const signedUrls = await Promise.all(promises);

    const partSignedUrlList = signedUrls.map((signedUrl, index) => {
      return {
        signedUrl,
        PartNumber: index + 1
      };
    });

    return {
      valid: true,
      data: {
        parts: partSignedUrlList
      }
    };
  } catch (error) {
    console.error(error);
    return { valid: false, error };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function finalizeMultipartUpload(options: { [key: string]: string | any }) {
  try {
    const { bucket, fileId, fileKey, parts } = options;

    const multipartParams = {
      Bucket: bucket,
      Key: fileKey,
      UploadId: fileId,
      MultipartUpload: {
        // ordering the parts to make sure they are in the right order
        Parts: orderBy(parts, ['PartNumber'], ['asc'])
      }
    };

    await s3.completeMultipartUpload(multipartParams).promise();

    return {
      valid: true,
      data: {}
    };
  } catch (error) {
    console.error(error);
    return { valid: false, error };
  }
}
