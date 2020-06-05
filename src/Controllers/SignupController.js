const database = require('../database/index');
const bcrypt = require('bcrypt')                         // bcrypt will encrypt passwords to be saved in db
const jwt = require('jsonwebtoken');

module.exports = {
    async create(request, response, next){
        try {
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
              
        } catch (error) {
            console.log('Error dado: '+error)
            next()
        }
    }
}

const hashPassword = (password) => {
    return new Promise((resolve, reject) =>
        bcrypt.hash(password, 10, (err, hash) => {
        err ? reject(err) : resolve(hash)
        })
    )
  }
      
  // user will be saved to db - we're explicitly asking postgres to return back helpful info from the row created
  const createUser = async (user) => {
    const createtdata = await database.raw(
        "INSERT INTO users (username, password_digest, created_at) VALUES (?, ?, ?) RETURNING id, username, created_at",
        [user.username, user.password_digest, new Date()]
    )
    .then((data) => data.rows[0])
    
    return createtdata; 
    }

  const createTokenUser = (userId)=>{
      return jwt.sign({id: userId}, 'teste', {expiresIn:'15s'});
  }
  