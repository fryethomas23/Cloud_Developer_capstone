import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getPosts } from '../../helpers/posts'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getPosts')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Caller event ${JSON.stringify(event)}`)
    let topic: string
    try {
      topic = event.queryStringParameters.topic
    } catch (e) {
      logger.info(`${e}. Continuing with default topic`)
      topic = "currentEvents"
    }
    const posts = await getPosts(topic) 

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: posts
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

