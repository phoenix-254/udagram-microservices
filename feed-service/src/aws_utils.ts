import AWS from 'aws-sdk';

import { config } from './config';

// Configure AWS credentials
const credentials = new AWS.SharedIniFileCredentials({
    profile: 'default'
});
AWS.config.credentials = credentials;

// Configure S3 bucket
export const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: config.aws_region,
    params: {
        Bucket: config.aws_media_bucket
    },
});

// 5 minutes expiry time.
const signedUrlLifetimeInSeconds = 300;

// Generates an AWS signed URL for retrieving objects
export function getGetSignedUrl( key: string ): string {
    return s3.getSignedUrl('getObject', {
        Bucket: config.aws_media_bucket,
        Key: key,
        Expires: signedUrlLifetimeInSeconds,
    });
}

// Generates an AWS signed URL for uploading objects
export function getPutSignedUrl( key: string ): string {
    return s3.getSignedUrl('putObject', {
        Bucket: config.aws_media_bucket,
        Key: key,
        Expires: signedUrlLifetimeInSeconds,
    });
}