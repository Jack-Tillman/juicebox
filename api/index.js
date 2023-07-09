require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;
const apiRouter = express.Router();

// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
  
    if (!auth) { // nothing to see here
      next();
    } else if (auth.startsWith(prefix)) { // header set with Bearer 
      const token = auth.slice(prefix.length);
  
      try {
        const { id } = jwt.verify(token, JWT_SECRET);
  
        if (id) {
          req.user = await getUserById(id);
          next();
        }
      } catch ({ name, message }) {
        next({ name, message });
      }
    } else {
      next({
        name: 'AuthorizationHeaderError',
        message: `Authorization token must start with ${ prefix }`
      });
    }
  });

  apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user);
    }
  
    next();
  });

/* 
ROUTERS
*/


const usersRouter = require('./users');
const postsRouter = require('./posts');
const tagsRouter = require('./tags');

apiRouter.use('/users', usersRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/tags', tagsRouter);
// Using server as API, so error messages are better served as JSON error object
apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message
  });
});

module.exports = apiRouter;
 
/*

curl http://localhost:3000/api -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwiaWF0IjoxNjg4OTI0ODM5LCJleHAiOjE2ODg5Mjg0Mzl9.xPQr3QYyQz-OEZcGYJMZGMso11xXuwmhsGL5Rt4WwTA'
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJwYXNzd29yZCI6ImJlcnRpZTk5IiwiaWF0IjoxNjg4OTI0ODM5LCJleHAiOjE2ODg5Mjg0Mzl9.xPQr3QYyQz-OEZcGYJMZGMso11xXuwmhsGL5Rt4WwTA
*/