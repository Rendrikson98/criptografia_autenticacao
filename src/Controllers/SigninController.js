const database = require('../database/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    async create(request, response, next){
        try {
            const userReq = request.body
            let user
        
            findUser(userReq)
                .then(foundUser => {
                user = foundUser
                return checkPassword(userReq.password, foundUser)
                })
                .then(() => {
                delete user.password_digest
                response.status(200).json({user, token: createTokenUser(user.id)})
                })
                .catch((err) => console.error(err))
        } catch (error) {
            console.log('o erro está aqui: '+error);
            next();
        }
    }
}

const findUser = async (userReq) => {
    const selectUser = await database.raw("SELECT * FROM users WHERE username = ?", [userReq.username])
    .then((data) => data.rows[0]);
    
    return selectUser;  
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

const createTokenUser = (userId)=>{
    return jwt.sign({id: userId}, 'teste', {expiresIn:'15s'});
}
