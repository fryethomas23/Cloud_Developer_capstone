import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const logger = createLogger("attachmentUtils")

export async function AttachmentUtils(timestamp: string) {
    logger.info('Generating presigned URL for attachment upload')
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: timestamp,
        Expires: urlExpiration
    })
}