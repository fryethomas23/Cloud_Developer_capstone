import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger("attachmentUtils")

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4'
        }),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
        
    ) {}

    async getUploadUrl(postId: string) {
        try {
            const uploadUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: postId,
            Expires: Number(this.urlExpiration)
            })
            logger.info(`Upload URL generated. ${uploadUrl}`)
            return uploadUrl
        } catch (e) {
            logger.info(`Upload URL failed to generated. ${e}`)
            return ""
        }
    }

    getAttachmentUrl(attachmentId: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`
    }    



}


