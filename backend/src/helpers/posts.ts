import { PostsAccess } from './postsAcess'
import { AttachmentUtils } from './attachmentUtils'
import { PostItem } from '../models/PostItem'
import { CreatePostRequest } from '../requests/CreatePostRequest'
import { UpdatePostRequest } from '../requests/UpdatePostRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'
//import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const logger = createLogger('Posts')
const postAccess = new PostsAccess()
const attachmentUtils= new AttachmentUtils()

export async function getPosts (topic: string): Promise<PostItem[]> {
  logger.info(`Getting posts`)
  return await postAccess.getPosts(topic)
}

export async function createPost (
  userId: string, 
  topic: string,
  postItem: CreatePostRequest
): Promise<PostItem> {
  logger.info(`Creating post with attributes ${postItem} for ${userId}`)
  const timestamp = new Date().toISOString()
  const postId = uuid.v4()
  const newItem = await postAccess.CreatePost(userId, topic, postItem, timestamp, postId)
  return newItem
}

export async function updatePost(
  userId: string, 
  postId: string, 
  topic: string,
  postItem: UpdatePostRequest
) {
  logger.info(`updating post ${postId} for ${userId} with ${JSON.stringify(postItem)}`)
  return postAccess.UpdatePost(userId, postId, topic, postItem)
}

export async function deletePost(topic: string, postId: string, userId: string) {
  logger.info(`Deleting posts ${postId} for ${userId}`)
  return postAccess.DeletePost(topic, postId, userId)
}

export async function createAttachmentPresignedUrl(postId: string) {
  logger.info(`Getting Upload URL for post ${postId}`)
   const uploadUrl = await attachmentUtils.getUploadUrl(postId)
   return uploadUrl
}

export async function updatePostAttachmentUrl(
  userId: string, 
  postId: string,
  topic: string
) {
  const attachmentUrl = attachmentUtils.getAttachmentUrl(postId)
  logger.info(`updating post ${postId} for ${userId} with ${attachmentUrl}`)
  return await postAccess.UpdatePostAttachmentUrl(userId, postId, topic, attachmentUrl)
}