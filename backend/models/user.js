const environment     = process.env.NODE_ENV || 'development';    // set environment
const configuration   = require('../knexfile')[environment];   // pull in correct db with env configs
const database        = require('knex')(configuration);           // define database based on above
const bcrypt          = require('bcrypt')                         // bcrypt will encrypt passwords to be saved in db
const crypto          = require('crypto')                         // built-in encryption node module
const jwt = require('jsonwebtoken');

const signup = (request, response) => {
    const user = request.body;
    console.log(user)
    hashPassword(user.password)
      .then((hashedPassword) => {
        delete user.password
        user.password_digest = hashedPassword
      })
      .then(() => createUser(user))
      .then(user => {
        delete user.password_digest
        response.status(201).json({ user, token: createTokenUser(user.id) })
      })
      .catch((err) => console.error(err))
  }

  const signin = (request, response) =>{
    const userReq = request.body
    let user

    findUser(userReq)
        .then(foundUser => {
        user = foundUser
        return checkPassword(userReq.password, foundUser)
        })
        /*.then((res) => createTokenUser(userReq.id))
        .then(token => updateUserToken(token, user))*/
        .then(() => {
        delete user.password_digest
        response.status(200).json({user, token: createTokenUser(user.id)})
        })
        .catch((err) => console.error(err))
  }

  
  // don't forget to export!
  module.exports = {
    signup,
    signin,
  }
const hashPassword = (password) => {
    return new Promise((resolve, reject) =>
        bcrypt.hash(password, 10, (err, hash) => {
        err ? reject(err) : resolve(hash)
        })
    )
    }
    
    // user will be saved to db - we're explicitly asking postgres to return back helpful info from the row created
    const createUser = (user) => {
    return database.raw(
        "INSERT INTO users (username, password_digest, created_at) VALUES (?, ?, ?) RETURNING id, username, created_at",
        [user.username, user.password_digest, new Date()]
    )
    .then((data) => data.rows[0])
    }
    
    // crypto ships with node - we're leveraging it to create a random, secure token
    const createToken = () => {
        new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, data) => {
            err ? reject(err) : resolve(data.toString('base64'))
            })
        })
    }
    const createTokenUserCreate = (userId )=>{
        return jwt.sign({id: userId}, 'teste', {expiresIn:'15s'});
    }

    const createTokenUser = (userId)=>{
        return jwt.sign({id: userId}, 'teste', {expiresIn:'15s'});
    }

    //signin
    const findUser = (userReq) => {
    return database.raw("SELECT * FROM users WHERE username = ?", [userReq.username])
        .then((data) => data.rows[0])
    }
    
    const checkPassword = (reqPassword, foundUser) => {
    return new Promise((resolve, reject) =>
        bcrypt.compare(reqPassword, foundUser.password_digest, (err, response) => {
                if (err) {
                reject(err)
                }
                else if (response) {
                resolve(response)
                } else {
                reject(new Error('Passwords do not match.'))
                }
        })
    )
    }
    
    const updateUserToken = (token, user) => {
    return database.raw("UPDATE users SET token = ? WHERE id = ? RETURNING id, username, token", [token, user.id])
        .then((data) => data.rows[0])
    }

    const authenticate = (userReq) => {
        findByToken(userReq.token)
          .then((user) => {
            if (user.username == userReq.username) {
              return true
            } else {
              return false
            }
          })
      }
      
      const findByToken = (token) => {
        return database.raw("SELECT * FROM users WHERE token = ?", [token])
          .then((data) => data.rows[0])
      }

