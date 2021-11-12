import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
// import { updateTodo } from '../../helpers/todos'
// import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info(`Caller event ${JSON.stringify(event)}`)
    const uploadUrl = await createAttachmentPresignedUrl(todoId)
    
    // const userId = getUserId(event)
    // const todoItem = {
    //   "name": todoItem.name,
    //   "dueDate": todoItem.dueDate,
    //   "done": todoItem.done
    // }
    // updateTodo(userId, todoId, todoItem)
    console.log(uploadUrl)
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
