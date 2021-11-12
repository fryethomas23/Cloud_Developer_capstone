import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')
//import { DocumentClient, PutItemInput } from 'aws-sdk/clients/dynamodb'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
//import { getUserId } from '../lambda/utils'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ){}
    
    async getTodos(userId: String): Promise<TodoItem[]> {
        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId= :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        logger.info(`${userId} todos ${JSON.stringify(result.Items)}`)
        return result.Items as TodoItem[]
    }

    async CreateTodo(
        userId: string, 
        todoItem: CreateTodoRequest,
        timestamp: string,
        todoId: string,
        uploadUrl: string = ""
    ): Promise <TodoItem> {
        const newTodo = {
            todoId: todoId,
            userId: userId,
            done: false,
            attachmentUrl: uploadUrl,
            createdAt: timestamp,
            name: todoItem.name,
            dueDate: todoItem.dueDate
        }
        try {
            if (uploadUrl) {
                await this.docClient.put({
                    TableName: this.todosTable,
                    Item: newTodo
                }).promise()
            } else {
                await this.docClient.put({
                    TableName: this.todosTable,
                    Item: {
                        "userId": userId,
                        "todoId": todoId,
                        "createdAt": timestamp,
                        "name": todoItem.name,
                        "dueDate": todoItem.dueDate,
                        "done": false
                    }
                }).promise()
            }
        } catch (e) {
            logger.error(`todo ${todoId} creation failed. ${e}`)
        }
        logger.info(`Todo ${JSON.stringify(newTodo)} creation successful for ${userId}`)
        return newTodo
    }

    async UpdateTodo(userId:string, todoId:string, todoItem: TodoUpdate) {
        logger.info("Updating todo")
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            ExpressionAttributeValues: {
                "name": todoItem.name,
                "dueDate": todoItem.dueDate,
                "done": todoItem.done
            }
        }).promise()
        return
    }

    async DeleteTodo(userId:string, todoId:string) {
        try {
            await this.docClient.delete({
                TableName: this.todosTable,
                Key: {
                    "userId": userId,
                    "todoId": todoId
                }
            }).promise()
        } catch(e) {
            logger.error(`todo ${todoId} deletion failed. ${e}`)
        }
        return
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    
    return new XAWS.DynamoDB.DocumentClient()
}

