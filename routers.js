const express = require('express');

const dentroSiteController = require('./src/Controllers/dentroSiteController');
const signupController = require('./src/Controllers/SignupController');
const signinController = require('./src/Controllers/SigninController');
const auth = require('./src/middleware/auth');

const routes = express.Router();

routes.get('/', (req, res)=>{
    res.send('Método get funcionando');
});

//Cria usuário e token
routes.post('/signup', signupController.create);
//Cria novo token para usuário já cadastrado
routes.post('/signin', signinController.create);

//rota que necessita de autenticação para acesso
routes.get('/signin/auth', auth , dentroSiteController.index);

module.exports = routes;