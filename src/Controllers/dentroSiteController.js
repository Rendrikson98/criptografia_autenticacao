module.exports = {
    index(request, response){
        console.log(response.locals.auth_data);
        response.send('Estou dentro do site');
    }
}