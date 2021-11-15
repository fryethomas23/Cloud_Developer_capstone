import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deletePost } from '../../helpers/posts'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deletePosts')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Caller event ${JSON.stringify(event)}`)
    const postId = event.pathParameters.postId
    const topic = event.queryStringParameters.topic
    const userId = getUserId(event)
    if (!(userId)) {
      logger.error(`User Id required.`)
      return {
        statusCode: 403,
        body: JSON.stringify({})
      }
    }
    deletePost(topic, postId, userId)
    
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
