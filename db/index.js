/* 
This file provides the utility functions that are used throughout the application.
They will be called by both the seed file, as well as our main application file. 
This file is also where we listen to the front-end code making AJAX requests to 
certain routes, and will need to make our own requests to our database. 
*/

const {Client} = require ('pg'); // imports the pg module

//supply the database name and location
const client = new Client('postgres://localhost:5432/juicebox-dev');


async function createUser({
    username,
    password,
    name,
    location }) {
    try {
        //the pg package translates below into the SQL query:
        //INSERT INTO users (username, password) VALUES ('some_name', 'some_password');
        const { rows }= await client.query(`
        INSERT INTO users (username, password, name, location) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [ username, password, name, location ]);

        return rows;
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
    // each key in the fields object must match a column name for our table 
    // map turns each key into a string, key name in quotes and a parameter whose value is 1 greater than the index of that specific key
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    //return early if this is called without fields
    if (setString.length === 0) {
        return;
    }

    try {
        const {result} = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${id}
        RETURNING *;
        `, Object.values(fields));

        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
}