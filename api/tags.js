const express = require('express');
const tagsRouter = express.Router();
const {
  getAllTags,
  getPostById,
  getPostsByTagName
} = require('../db');

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /tags");
  
    next();
  });


tagsRouter.get('/', async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags
  });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  // read the tagname from the params
  const { tagName } = req.params;

  try {
    const taggedPosts = await getPostsByTagName(tagName);
    // use our method to get posts by tag name from the db
    if (taggedPosts) {
      const posts = taggedPosts.filter(post => {
        return (post.active) || (req.user && post.author.id === req.user.id);
    })
    res.send({
      posts
    });
    } else {
      next({
        name:'NoPosts',
        message: 'No posts with that tag name were found.'
      });
    }
    // send out an object to the client { posts: // the posts }
  } catch ({ name, message }) {
    // forward the name and message to the error handler
    next({ name, message });
  }
});

module.exports = tagsRouter;