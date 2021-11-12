import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { updateTodoAttachmentUrl } from '../../helpers/todos'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info(`Caller event ${JSON.stringify(event)}`)
    const uploadUrl = await createAttachmentPresignedUrl(todoId)
    
    const userId = getUserId(event)
    updateTodoAttachmentUrl(userId, todoId)

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
