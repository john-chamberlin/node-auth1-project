const express = require('express')
const router = express.Router()

const Users = require('./user-model')
const bcrypt = require('bcryptjs')

const checkPayload = (req, res, next) => {
	if (!req.body.username || !req.body.password) {
		res.status(404).json(`Please include username and password`)
	} else {
		next()
	}
}

const checkUser = (req, res, next) => {
	Users.findBy({ username: req.body.username })
		.then(user => {
			if (!user.length) {
				next()
			} else {
				res.status(401).json('Username already exists')
			}
		})
		.catch(err => {
			res.status(500).json(`Server error: ${err}`)
		})
}

const checkUserExists = (req, res, next) => {
	Users.findBy({ username: req.body.username })
		.then(user => {
			if (user.length) {
				req.userData = user[0]
				next()
			} else {
				res.status(401).json('Login error, please check credentials')
			}
		})
		.catch(err => {
			res.status(500).json(`Server error: ${err}`)
		})
}

router.post('/register', checkPayload, checkUser, (req, res) => {
	const hash = bcrypt.hashSync(req.body.password, 10)
	Users.add({ username: req.body.username, password: hash })
		.then(user => {
			res.status(201).json(user)
		})
		.catch(err => {
			res.status(500).json(`Server error : ${err}`)
		})
})

router.post('/login', checkPayload, checkUserExists, (req, res) => {
	try {
		const verified = bcrypt.compareSync(
			req.body.password,
			req.userData.password
		)
		if (verified) {
			req.session.user = req.userData
			res.json(`Welcome back ${req.userData.username}`)
		} else {
			res.status(401).json('Invalid username or password')
		}
	} catch (err) {
		res.status(500).json(`Server error: ${err}`)
	}
})

router.get('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy(err => {
			if (err) {
				res.json('issue logging out')
			} else {
				res.json('successfully logged out')
			}
		})
	} else {
		res.json('no session available')
	}
})

module.exports = router
