import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/posts'
import { createLogger } from '../../utils/logger'
import { updatePostAttachmentUrl } from '../../helpers/posts'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId
    const topic = event.queryStringParameters.topic
    logger.info(`Caller event ${JSON.stringify(event)}`)
    const userId = getUserId(event)
    if (!(userId)) {
      logger.error(`User Id required.`)
      return {
        statusCode: 403,
        body: JSON.stringify({})
      }
    }
    const uploadUrl = await createAttachmentPresignedUrl(postId)
    updatePostAttachmentUrl(userId, postId, topic)

    return {
      statusCode: 201,
      body: JSON.stringify({
        "uploadUrl": uploadUrl
      })
    }
  }
)

handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)
