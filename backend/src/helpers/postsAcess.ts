import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')
//import { DocumentClient, PutItemInput } from 'aws-sdk/clients/dynamodb'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { PostItem } from '../models/PostItem'
import { PostUpdate } from '../models/PostUpdate';
import { CreatePostRequest } from '../requests/CreatePostRequest'
//import { getUserId } from '../lambda/utils'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('PostsAccess')

export class PostsAccess {
    
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly postsTable = process.env.POSTS_TABLE,
    ){}
    
    async getPosts(topic: string): Promise<PostItem[]> {
        
        const result = await this.docClient.query({
            TableName: this.postsTable,
            IndexName: "CreatedAtIndex",
            KeyConditionExpression: 'topic= :topic',
            ExpressionAttributeValues: {
                ':topic': topic
            }
        }).promise()
        logger.info(`Posts retrieved ${JSON.stringify(result.Items)}`)
        return result.Items as PostItem[]
    }

    async CreatePost(
        userId: string,
        topic: string,
        postItem: CreatePostRequest,
        timestamp: string,
        postId: string
    ): Promise <PostItem> {
        const newPost = {
            topic: topic,
            postId: postId,
            userId: userId,
            createdAt: timestamp,
            post: postItem.post
        }
        try {
            await this.docClient.put({
                TableName: this.postsTable,
                Item: newPost
            }).promise()
        } catch (e) {
            logger.error(`post ${postId} creation failed. ${e}`)
        }
        
        logger.info(`Post ${JSON.stringify(newPost)} creation successful for ${userId}`)
        return newPost
    }

    async UpdatePost(userId:string, postId:string, topic: string, postItem: PostUpdate) {
        logger.info("Updating post")
        try {
            const oldItem = await this.docClient.update({
                TableName: this.postsTable,
                Key: {
                    "topic": topic,
                    "postId": postId
                },
                ConditionExpression: "userId = :userId",
                UpdateExpression: "set post=:post",
                ExpressionAttributeValues: {
                    ":post": postItem.post,
                    ":userId": userId
                },
                ReturnValues: "ALL_OLD"
            }).promise()
            if (oldItem) {
                logger.info(`Post ${postId} successful updated for ${userId} with ${postItem}`)
            } else{
                logger.error(`post update for post ${postId} failed. User ${userId} is not authorized to perform this action`)
            }
        } catch (e) {
            logger.error(`post update for post ${postId} failed. ${e}`)
        }
        return
    }

    async DeletePost(topic:string, postId:string, userId: string) {
        try {
            const oldItem = await this.docClient.delete({
                TableName: this.postsTable,
                Key: {
                    "topic": topic,
                    "postId": postId
                },
                ConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": userId
                },
                ReturnValues: "ALL_OLD"
            }).promise()
            if (oldItem) {
                logger.info(`Post ${postId} successful deleted for ${userId}`)
            } else{
                logger.error(`Deletion failed for post ${postId}. User ${userId} is not authorized to perform this action`)
            }
        } catch(e) {
            logger.error(`post ${postId} deletion failed. ${e}`)
        }
        return
    }

    async UpdatePostAttachmentUrl(userId:string, postId:string, topic: string, attachmentUrl: string) {
        try{
            const oldItem = await this.docClient.update({
                TableName: this.postsTable,
                Key: {
                    "topic": topic,
                    "postId": postId
                },
                UpdateExpression: "set attachmentUrl=:attachmentUrl",
                ConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":attachmentUrl": attachmentUrl,
                    ":userId": userId
                },
                ReturnValues: "ALL_OLD"
            }).promise()
            if (oldItem) {
                logger.info(`Post ${postId} successful updated for ${userId} with ${attachmentUrl}`)
            } else{
                logger.error(`post update for post ${postId} failed. User ${userId} is not authorized to perform this action`)
            }
        } catch (e) {
            logger.error(`Unable to update post ${postId} for user ${userId} with attachmentUrl ${attachmentUrl}. ${e}`)
        }
        logger.info(`Post ${postId} update successful for ${userId} with attachment url ${attachmentUrl}`)
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

