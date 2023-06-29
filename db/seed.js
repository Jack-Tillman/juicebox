/*
This file will build and rebuild tables and fill them with starting data 

*/


// grab our client with destructuring from the export in index.js
const {
    client,
    getAllUsers,
    createUser,
    updateUser
 } = require('./index');

async function createInitialUsers() {
    try {
        console.log("Starting to create users...");

        const albert = await createUser(
            { username: 'albert', password: 'bertie99', name: "albert", location:"albert-house" });

        const sandra = await createUser(
            {username: 'sandra', password: '2sandy4me', name: "sandy", location:"beach"});
        
            const glamgal = await createUser(
                {username:'glamgal', password: 'soglam', name: "glamgorl", location:"glam-house"});
            
        console.log("Finished creating users");
    } catch (error) {
        console.error("Error creating users!");
        throw error;
    }
}

// async function updateCurrentUser() {
//     try {
//         console.log("Starting to update users...");

//         const newUser = await updateUser(
//             {id: 'id', fields: '{fields}'}
//             )
//     }
// }
 
//this will drop all tables within our database - use CAREFULLY
async function dropTables() {
    try {
        console.log("Starting to drop tables...");

        await client.query(`
        DROP TABLE IF EXISTS users; 
        `);
        
        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error; // pass error up to the function that calls dropTables 
    }
}

async function createTables() {
    try {
        console.log("Starting to build tables...");
        //setting DEFAULT true for active means that our table will set the value of
        // active for us automatically when the user is inserted 
        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
        `);

        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error; // pass error up to the function that calls createTables
    }
}

async function rebuildDB() {
    try{
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
    } catch (error) {
        throw error;
    } 
}

async function testDB() {
    try {
      console.log("Starting to test database...");
        
      const users = await getAllUsers();
      console.log("getAllUsers:", users);
  
      console.log("Calling updateUser on users[0]");
      const updateUserResult = await updateUser(users[0].id, {
        name: "Newname Sogood",
        location: "Lesterville, KY"
      });
      console.log("Result:", updateUserResult);

      console.log("Finished database tests!");
    } catch (error) {
      console.error("Error testing database!");
      throw error;
    }
  }


rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());