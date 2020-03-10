const express = require('express')
const bcrypt = require('bcrypt');
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
          // hash password
          const myPlainPassword = req.body.password
          const saltRounds = 10
          bcrypt.hash(myPlainPassword, saltRounds)
            .then(hash => {
              // insert pws to db
              const user = {
                email: req.body.email,
                password: hash,
                created_at: new Date()
              }
              User.create(user).then(id => {

                res.json({
                  hash,
                  id,
                  message: '⚡'
                })
              })
              // redirect
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

router.post('/login', (req, res, next) => {
  if (validateUser(req.body)) {
    User.getOneByEmail(req.body.email).then(user => {
      if (user) {
        // compare password with hash password
        bcrypt.compare(req.body.password, user.password)
          .then(result => {
            if (result) {
              // set-cookie header
              const isSecure = req.app.get('env') !== 'development';
              res.cookie('user_id', user.id, {
                httpOnly: true,
                signed: true,
                secure: isSecure, // when production
              })
              res.json({
                result,
                message: 'Logging in...'
              })
            }
            else {
              next(new Error('Invalid login'))
            }
          })
      }
      else {
        next(new Error('Invalid login'))
      }
    })
  }
  else {
    next(new Error('Invalid login'))
  }

})

module.exports = router