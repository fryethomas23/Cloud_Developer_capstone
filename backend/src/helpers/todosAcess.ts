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
        private readonly todosTable = process.env.TODOS_TABLE,
    ){}
    
    async getTodos(userId: String): Promise<TodoItem[]> {
        logger.info("Getting all User todos")
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId= :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async CreateTodo(
        userId: string, 
        todoItem: CreateTodoRequest,
        timestamp: string,
        todoId: string,
        uploadUrl: string = ""
    ): Promise <TodoItem> {
        logger.info("Creating todo")
        if (uploadUrl) {
            await this.docClient.put({
                TableName: this.todosTable,
                Item: {
                    "userId": userId,
                    "todoId": todoId,
                    "createdAt": timestamp,
                    "name": todoItem.name,
                    "dueDate": todoItem.dueDate,
                    "done": false,
                    "attachmentUrl": uploadUrl
                }
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

        logger.info("Getting created todo")
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                "userId": {
                    "S": userId
                },
                "createdAt": {
                    "S": timestamp
                }
            },
            ConsistentRead: true
        }).promise()
        return result.Item as TodoItem
    }

    async UpdateTodo(userId:string, todoId:string, todoItem: TodoUpdate) {
        logger.info("Updating todo")
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": {
                    "S": userId
                },
                "todoId": {
                    "S": todoId
                }
            },
            ExpressionAttributeValues: {
                "name": {
                    "S": todoItem.name
                },
                "dueDate": {
                    "S": todoItem.dueDate
                },
                "done":{
                    "BOOL": todoItem.done
                }
            }
        }).promise()
        return
    }

    async DeleteTodo(userId:string, todoId:string) {
        logger.info("Deleting todo")
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "userId": {
                    "S": userId
                },
                "todoId": {
                    "S": todoId
                }
            }
        }).promise()
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

