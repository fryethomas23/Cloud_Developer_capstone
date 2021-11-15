import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updatePost } from '../../helpers/posts'
import { UpdatePostRequest } from '../../requests/UpdatePostRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updatePosts')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId
    const topic = event.queryStringParameters.topic
    const updatedPost: UpdatePostRequest = JSON.parse(event.body)

    logger.info(`Caller event ${JSON.stringify(event)}`)
    const userId = getUserId(event)
    if (!(userId)) {
      logger.error(`User Id required.`)
      return {
        statusCode: 403,
        body: JSON.stringify({})
      }
    }
    await updatePost(userId, postId, topic, updatedPost)

    return {
      statusCode: 201,
      body: JSON.stringify({})
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
