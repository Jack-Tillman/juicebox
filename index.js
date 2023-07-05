// this is where express app will be 

const PORT = 3000;
const express = require('express');
const server = express();
const apiRouter = require('./api');
const morgan = require('morgan');

//logs out incoming requests to get the method, route, HTTP response code, and time it takes 
server.use(morgan('dev'));
//reads incoming JSON from requests, as long as the request's header has Content-Type: application/json 
server.use(express.json());
//body logging
server.use('/', (req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<_____Body Logger END_____>");

  next();
});
//any request made to a path starting with /api will be handled by apiRouter 
server.use('/api', apiRouter);





const { client } = require('./db');
client.connect();

server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});











//sudo service postgresql restart
//psql -U postgres
// in /etc/postgresql/14/main/ i think
//SELECT pg_reload_conf()
// * useful commands 
// \dt -> list all tables 
// \c database_name -> connect to a database 
// \q -> quit PSQL 
// \conninfo -> print info about current db connection