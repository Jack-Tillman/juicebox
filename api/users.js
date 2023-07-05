const express = require('express');
const usersRouter = express.Router();
const {getAllUsers} = require('../db');

//apiRouter will try to match /users first, then pass to usersRouter to fire off any middleware

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});
//middleware will fire when a GET request is made to /api/users, and return a simple object with an empty array 
usersRouter.get('/', async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users
  });
});
  

module.exports = usersRouter;