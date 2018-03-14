require('dotenv').config();

const xss = require('xss');

const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

async function addUser(user) {
  const {
    username,
    password,
  } = user;
  
  const client = new Client({ connectionString });
  await client.connect();
  
  const query = 'INSERT INTO users(username, password) VALUES($1, $2) RETURNING *';
  const values = [
    username,
    password
  ];

  try {
    const result = await client.query(query, values);
    
    const { rows } = result;
    return rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
}

async function findUserByUsername(username) {
  const client = new Client({ connectionString });
  await client.connect();
  const query = 'SELECT * FROM users WHERE username = $1';
  const values = [username];

  try {
    const result = await client.query(query, values);
    const { rows } = result;
    return rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.end();
  }
}

module.exports = {
  addUser,
  findUserByUsername,
};