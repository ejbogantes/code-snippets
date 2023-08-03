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

// the bucket create options
type CreateBucketOptions = {
    bucket: string
}

export async function createBucket(options: CreateBucketOptions) {
    try {
        // we create the bucket
        const bucket = await s3.createBucket({
            Bucket: options.bucket,
            ACL: 'private',
        }).promise();

        if (bucket) {
            // updates cors permissions 
            const cors = await s3.putBucketCors(
                {
                    Bucket: options.bucket,
                    CORSConfiguration: {
                        CORSRules: [
                            {
                                AllowedHeaders: ["Authorization",
                                    "Content-Range",
                                    "Accept",
                                    "Content-Type",
                                    "Origin",
                                    "Range"],
                                AllowedMethods: ["GET",
                                    "PUT",
                                    "POST",
                                    "DELETE",
                                    "HEAD"],
                                AllowedOrigins: ["http://localhost:4200",
                                    "https://dashboard-dev.eifu.io",
                                    "https://dev.soomportal.io",
                                    "https://dashboard-stg.eifu.io",
                                    "https://stg.soomportal.io"],
                                ExposeHeaders: [
                                    "Content-Range",
                                    "Content-Length",
                                    "ETag"
                                ],
                                MaxAgeSeconds: 3000
                            },
                        ]
                    }
                },
            ).promise();
            return { bucket, cors }
        }

    } catch (error) {
        console.error(error);
        return { error }
    }
}