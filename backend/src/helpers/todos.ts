import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { getUserId } from '../lambda/utils';
import * as uuid from 'uuid'
//import * as createError from 'http-errors'
//import { DocumentClient } from 'aws-sdk/clients/dynamodb';
// TODO: Implement businessLogic
import { APIGatewayProxyEvent} from 'aws-lambda'

const logger = createLogger('Todos')
const todoAccess = new TodosAccess()
const attachmentUtils= new AttachmentUtils()

export async function getTodosForUser (event: APIGatewayProxyEvent): Promise<TodoItem[]> {
  const userId = getUserId(event)
  logger.info(`Getting todos for ${userId}`)
  return await todoAccess.getTodos(userId)
}

export async function createTodo (
  userId: string, 
  todoItem: CreateTodoRequest,
  uploadUrl: string = ""
): Promise<TodoItem> {
  logger.info(`Creating todo with attributes ${todoItem} for ${userId}`)
  const timestamp = new Date().toISOString()
  const todoId = uuid.v4()
  const newItem = await todoAccess.CreateTodo(userId, todoItem, timestamp, todoId, uploadUrl)
  return newItem
}

export async function updateTodo(
  userId: string, 
  todoId: string, 
  todoItem: UpdateTodoRequest
) {
  logger.info(`updating todo ${todoId} for ${userId} with ${JSON.stringify(todoItem)}`)
  return todoAccess.UpdateTodo(userId, todoId, todoItem)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`Deleting todos ${todoId} for ${userId}`)
  return todoAccess.DeleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(todoId: string) {
  logger.info(`Getting Upload URL for todo ${todoId}`)
   const uploadUrl = await attachmentUtils.getUploadUrl(todoId)
   return uploadUrl
}