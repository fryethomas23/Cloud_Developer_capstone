import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'
//import { DocumentClient } from 'aws-sdk/clients/dynamodb';
// TODO: Implement businessLogic

const logger = createLogger('Todos')
const todoAccess = new TodosAccess()
export async function getTodosForUser (userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodos(userId)
}

export async function createTodo (
  userId: string, 
  todoItem: CreateTodoRequest,
  uploadUrl: string = ""
): Promise<TodoItem> {
  logger.info('Generating todo item information')
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
  return todoAccess.UpdateTodo(userId, todoId, todoItem)
}

export async function deleteTodo(userId: string, todoId: string) {
  return todoAccess.DeleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(todoId: string) {
   const uploadUrl = await AttachmentUtils(todoId)
   return {
     uploadUrl: uploadUrl
   }
}