/* 
This file provides the utility functions that are used throughout the application.
They will be called by both the seed file, as well as our main application file. 
This file also listens to the front-end code making AJAX requests to 
certain routes, and make requests to the database as well.
*/

const {Client} = require ('pg'); // imports the pg module

//supply the database name and location
const client = new Client(
    'postgres://localhost:5432/juicebox-dev'
    );

// this is incomplete and not working. 
async function createPost({
    authorId,
    title,
    content
}) {
    try {
        const { rows: [ posts ]} = await client.query(`
        INSERT INTO posts (authorId, title, content) 
        VALUES ( 23, 'postTitle', 'Here be content')
        ON CONFLICT (authorId) DO NOTHING
        RETURNING *;
        `, [ authorId, title, content ]);

        return posts;

    } catch (error) {
        throw error;
    }
}


async function createUser({
    username,
    password,
    name,
    location }) {
    try {
        //the pg package translates below into the SQL query:
        //INSERT INTO users (username, password) VALUES ('some_name', 'some_password');
        const { rows: [ user ]} = await client.query(`
        INSERT INTO users (username, password, name, location) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [ username, password, name, location ]);

        return user;
    } catch (error) {
        throw error;
    }
};

async function getAllUsers(){ 
    const { rows } = await client.query(
        `SELECT id, username, password, name, location, active
        FROM users;`
    );

    return rows;
}

async function updateUser(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ user ]} = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${id}
        RETURNING *;
      `, Object.values(fields));
  
      return user;
    } catch (error) {
      throw error;
    }
  }

module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost
}