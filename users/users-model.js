// add functionality for edit as well

const db = require('../data/connection.js');

module.exports = {
  add,
  find,
  findBy,
  findById,
};

function find() {
  return db('users').select('id', 'username').orderBy('id');
}

function findBy(filter) {
  return db('users')
    .where(filter)
    .select('id', 'username', 'password')
    .orderBy('id');
}

async function add(user) {
  try {
    const [id] = await db('users').insert(user, 'id');
    return findById(id);
  } catch (error) {
    throw error;
  }
}

function findById(id) {
  return db('users').where({ id }).first();
}
