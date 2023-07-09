const express = require('express');
const postsRouter = express.Router();
const {getAllPosts, createPost, updatePost, getPostById} = require('../db');
const { requireUser } = require('./utils');

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  //Remove spaces from tags, convert string into array 
  const tagArr = tags.trim().split(/\s+/);
  const postData = {};
  
  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }
  console.log('postData is:', postData);
  try {
    if (req.user) {
    postData.authorId = req.user.id;  
    }
    
    if (title) {
      postData.title = title;
    }

    if (content) {
      postData.content = content;
    }
    // add authorId, title, content to postData object
    const post = await createPost(postData);
    // this will create the post and the tags for us
    // if the post comes back, 
    res.send({ post });
    // otherwise, next an appropriate error object 
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};
  //only add tags if they exist
  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if(originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not your own.'
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");
  
    next();
  });


postsRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts
  });
});

module.exports = postsRouter;


/*
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwiaWF0IjoxNjg4OTI3NTkxLCJleHAiOjE2ODg5MzExOTF9.3lEGW8AXNqTultgftYxqBAkhQZttfbToEbhZ5O2eMgw

curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwiaWF0IjoxNjg4OTI3NTkxLCJleHAiOjE2ODg5MzExOTF9.3lEGW8AXNqTultgftYxqBAkhQZttfbToEbhZ5O2eMgw' -H 'Content-Type: application/json' -d '{"title": "test post", "content": "how is this?", "tags": " #once #twice    #happy"}'
curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwiaWF0IjoxNjg4OTI3NTkxLCJleHAiOjE2ODg5MzExOTF9.3lEGW8AXNqTultgftYxqBAkhQZttfbToEbhZ5O2eMgw' -H 'Content-Type: application/json' -d '{"title": "I still do not like tags", "content": "CMON! why do people use them?"}'
curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwiaWF0IjoxNjg4OTI3NTkxLCJleHAiOjE2ODg5MzExOTF9.3lEGW8AXNqTultgftYxqBAkhQZttfbToEbhZ5O2eMgw' -H 'Content-Type: application/json' -d '{"title": "I am quite frustrated"}'


curl http://localhost:3000/api/posts/1 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwiaWF0IjoxNjg4OTI3NTkxLCJleHAiOjE2ODg5MzExOTF9.3lEGW8AXNqTultgftYxqBAkhQZttfbToEbhZ5O2eMgw' -H 'Content-Type: application/json' -d '{"title": "updating my old stuff", "tags": "#oldisnewagain"}'

curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwiaWF0IjoxNjg4OTI3NTkxLCJleHAiOjE2ODg5MzExOTF9.3lEGW8AXNqTultgftYxqBAkhQZttfbToEbhZ5O2eMgw' -H 'Content-Type: application/json' -d '{"title": "I am quite frustrated"}'

*/