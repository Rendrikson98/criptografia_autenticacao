const express = require('express');
const routes = require('./routers');
const app = express();

app.use(express.json());
app.use(routes);

app.listen(3001, function(){
    console.log('Servidor Online')
})