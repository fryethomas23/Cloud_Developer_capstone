import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreatePostRequest } from '../../requests/CreatePostRequest'
import { getUserId } from '../utils';
import { createPost } from '../../helpers/posts'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createPosts')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Caller event ${JSON.stringify(event)}`)
    const newPost: CreatePostRequest = JSON.parse(event.body)
    let topic: string
    try {
      topic = event.queryStringParameters.topic
    } catch (e) {
      logger.info(`${e}. continuing with default topic`)
      topic = "CurrentEvents"
    }
    const userId = getUserId(event)
    if (!(userId)) {
      logger.error(`User Id required.`)
      return {
        statusCode: 403,
        body: JSON.stringify({})
      }
    }
    const post = await createPost(userId, topic, newPost) 
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: post
      })
    }
})

handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)
