const express = require('express')
const server = express()

const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)

const authRouter = require('./auth/auth-router')
const Users = require('../api/auth/user-model')

const config = {
	name: 'sessionId',
	secret: 'keep it secret, keep it safe',
	cookie: {
		maxAge: 1000 * 60 * 60,
		secure: false,
		httpOnly: true
	},
	resave: false,
	saveUninitialized: false,
	store: new KnexSessionStore({
		knex: require('../data/dbConfig'),
		tablename: 'sessions',
		sidfieldname: 'sid',
		createTable: true,
		clearInterval: 1000 * 60 * 60
	})
}

server.use(session(config))
server.use(express.json())
server.use('/api/auth', authRouter)

const restricted = (req, res, next) => {
	if (req.session.user) {
		next()
	} else {
		res.status(401).json(`unauthorized`)
	}
}

server.get('/api/users', restricted, (req, res) => {
	Users.find()
		.then(users => {
			res.status(200).json(users)
		})
		.catch(err => res.send(err))
})

module.exports = server
