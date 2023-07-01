/* 
This file provides the utility functions that are used throughout the application.
They will be called by both the seed file, as well as our main application file. 
This file also listens to the front-end code making AJAX requests to 
certain routes, and make requests to the database as well.
*/

const { Client } = require("pg"); // imports the pg module

//supply the database name and location
const client = new Client("postgres://localhost:5432/juicebox-dev");

async function createUser({ username, password, name, location }) {
  try {
    //the pg package translates below into the SQL query:
    //INSERT INTO users (username, password) VALUES ('some_name', 'some_password');
    const { rows: [user] } = await client.query(`
        INSERT INTO users(username, password, name, location) 
        VALUES($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, password, name, location]);
    console.log(user);
    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        UPDATE users
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  try {

    const { rows } = await client.query(`
    SELECT id, username, name, location, active
    FROM users;
    `);
      
      return rows;
    } catch (error) {
      throw error;
    }
}

async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(`
    SELECT id, username, name, location, active 
    FROM users
    WHERE id=${ userId };
    `);
    //quickly escape function if user does not exist
    if(!user) {
      return null;
    }

    user.posts = await getPostsByUser(userId);

    return user;
  } catch (error) {
    throw error;
  }
}


async function createPost({ authorId, title, content }) {
  try {
    const {rows: [post] } = await client.query(`
      INSERT INTO posts("authorId", title, content) 
      VALUES($1, $2, $3)
      RETURNING *;
    `,[authorId, title, content]);

    console.log(post);
    return post;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [post]
    } = await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `,
      Object.values(fields));

    return post;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(
      `SELECT *
       FROM posts;`);
  
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM posts
      WHERE "authorId"=${ userId };
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}


async function createTags(tagList) {
  //escape immediately if no tags in tag list
  if (tagList.length === 0) {
    return;
  }

 // build the set string
  const insertValues = tagList.map(
  (_, index) => `$${index + 1}`).join('), (');

  const selectValues = tagList.map(
    (_, index) => `$${index + 1}`).join(', ');

  try {
      console.log("Beginning to create tags...");

      await client.query(`
      INSERT INTO tags(name)
      VALUES (${insertValues})
      ON CONFLICT (name) DO NOTHING;
      `, tagList);

      const { rows } = await client.query(`
      SELECT * FROM tags
      WHERE name
      IN (${selectValues});
      `, tagList);

      return rows;
  } catch (error) {
      console.error(error);
      throw error;
  }
}


module.exports = {
  client,
  createUser,
  updateUser,
  getAllUsers,
  createPost,
  updatePost,
  getAllPosts,
  getUserById,
  createTags
};
