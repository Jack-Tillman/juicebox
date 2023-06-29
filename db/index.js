/* 
This file provides the utility functions that are used throughout the application.
They will be called by both the seed file, as well as our main application file. 
This file is also where we listen to the front-end code making AJAX requests to 
certain routes, and will need to make our own requests to our database. 
*/

const {Client} = require ('pg'); // imports the pg module

//supply the database name and location
const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers(){ 
    const { rows } = await client.query(
        `SELECT id, username, password
        FROM users;`
    );

    return rows;
}

async function createUser({ username, password }) {
    try {
        //the pg package translates below into the SQL query:
        //INSERT INTO users (username, password) VALUES ('some_name', 'some_password');
        const result = await client.query(`
            INSERT INTO users (username, password) 
            VALUES ($1, $2)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
      `, [ username, password ]);

        const { rows } = await client.query(`
            SELECT id, username, password
            FROM users;
        `);

        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    client,
    getAllUsers,
    createUser,
}