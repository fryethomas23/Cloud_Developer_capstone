import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    console.log('Caller event,', event)
    const userId = getUserId(event)
    const todos = await getTodosForUser(userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        Items: todos
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

