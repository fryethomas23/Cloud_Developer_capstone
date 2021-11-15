# Serverless Discussion Board

# Functionality of the application

This application will allow creating/removing/updating/fetching discussion posts. Each POST item can optionally have an attachment image. Everyone can see all posts. Each user only has access to create, update, and delete posts that he/she has created.

# TODO items

The application stores POST items, and each POST item contains the following fields:

* `postId` (string) - a unique id for an item
* `createdAt` (string) - date and time when an item was created
* `userId` (string) - id of the user who created the item
* `post` (string) - post contents
* `topic` (string) - topic the discussion post is under
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a TODO item

You might also store an id of a user who created a TODO item.

## Endpoints

Get - https://{{apiId}}.execute-api.us-east-1.amazonaws.com/dev/posts?topic={topic} - Gets all posts for a topic
Post - https://{{apiId}}.execute-api.us-east-1.amazonaws.com/dev/posts?topic={topic} - Creates a post for a user on a topic
Patch - https://{{apiId}}.execute-api.us-east-1.amazonaws.com/dev/posts/{{postId}}?topic=soccer - Updates a specified post for a user on a topic
Del - https://{{apiId}}.execute-api.us-east-1.amazonaws.com/dev/posts/{{postId}}?topic=soccer - Deletes a specified post for a user on a topic
Post - https://{{apiId}}.execute-api.us-east-1.amazonaws.com/dev/posts/{{postId}}/attachment?topic=soccer - Generates an upload url for an image and updates a specified post with the image url for a user on a topic

# Postman collection

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

1. Get all topic posts using "Get all topic posts"
2. Sign in using the collection authorization tab
3. Create a post uinsg "Create post"
4. Add postId from previous step to collection variables
5. Update post using "Update post"
6. Get attachment URL using "Get upload URL"
7. Add upload URL from previous step to uploadUrl in collection
8. Add an image and upload it using "Upload attachment"
9. Get all topic posts using "Get all topic posts" to verify post and updates
10. Delete post using "Delete post"
11. Get all topic posts using "Get all topic posts" to verify post deletion
12. Check authorization using "POSTS unauthorized" group

