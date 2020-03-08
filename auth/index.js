const express = require('express')

const router = express.Router()
const User = require('../db/user');

router.get('/', (req, res) => {
  res.json({
    message: '🍣'
  })
})

// * [x] Users can login to the app with valid email/password
// * [x] Users cannot login to the app with a blank or missing email
// * [x] Users cannot login to the app with a blank or incorrect password

function validateUser(user) {
  const validEmail = typeof user.email === 'string' &&
    user.email.trim() !== '';
  const validPassword = typeof user.password === 'string' &&
    user.password.trim() !== '' &&
    user.password.trim().length >= 6;
  return validEmail && validPassword;
}

router.post('/sign_up', (req, res, next) => {
  if (validateUser(req.body)) {
    User
      .getOneByEmail(req.body.email)
      .then(user => {
        if (!user) {
          // user not found mean unique
          res.json({
            message: '⚡'
          })
        }
        else {
          next(new Error('Email in use'))
        }
      })
  }
  else {
    // send an error
    next(new Error('Invalid User'))
  }
})

module.exports = router