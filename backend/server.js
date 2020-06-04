const express = require('express');
const app = express();

const User = require('./models/user');
const auth = require('./middleware/auth');

app.use(express.json());

app.get('/', (req, res)=>{
    res.send('Método get funcionando');
}),

//Cria usuário e token
app.post('/signup', User.signup);
//Cria novo token para usuário já cadastrado
app.post('/signin', User.signin);

//rota que necessita de autenticação para acesso
app.get('/signin/auth', auth ,(req, res)=>{
    console.log(res.locals.auth_data);
    res.send('auth oioioi')
})

app.listen(3001, function(){
    console.log('Servidor Online')
})