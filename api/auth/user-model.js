const db = require('../../data/dbConfig')

function findBy(filter) {
	return db('users').where(filter).orderBy('id')
}

function findById(id) {
	return db('users').where('id', id).first()
}

async function add(user) {
	const [id] = await db('users').insert(user, 'id')
	return findById(id)
}

function find() {
	return db('users')
}

module.exports = {
	findBy,
	add,
	find
}
