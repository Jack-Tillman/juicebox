const express = require('express');
const usersRouter = express.Router();
const {getAllUsers, getUserByUsername, createUser} = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

//apiRouter will try to match /users first, then pass to usersRouter to fire off any middleware

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.post('/register', async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'That username is already taken!'
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign({
      id:user.id,
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });
      
    res.send({
      message: "Thank you for signing up!",
      token
    });
  } catch ({name, message}){
    next({name, message})
  }
})

usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      // create token & return to user
      const token = jwt.sign({ 
        id: user.id, 
        username: user.username, 
        password:user.password 
      }, process.env.JWT_SECRET,
      { expiresIn: '1h' });

      res.send({ message: "you're logged in!", token });
    } else {
      next({ 
        name: 'IncorrectCredentialsError', 
        message: 'Username or password is incorrect'
      });
    }
  } catch(error) {
    console.log(error);
    next(error);
  }
});




//middleware will fire when a GET request is made to /api/users, and return a simple object with an empty array 
usersRouter.get('/', async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users
  });
});

module.exports = usersRouter;

/*

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJzeXp5Z3lzIiwiaWF0IjoxNjg4OTI1NDk4LCJleHAiOjE2ODk1MzAyOTh9.n7Mz2OSGPQL41Fb0J9YaihE7uFwBVYfGQf9zXxF4Qxo

*/