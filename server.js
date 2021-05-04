var express = require('express');
var app = express();
var qs = require('querystring');
var path = require('path');
var db = require('./router/db');
var sanitizeHtml = require('sanitize-html');

app.use(express.static('public'));

app.get('/signUp', function(request, response){
        response.sendfile(__dirname + './views/signUp.html');
});

app.listen(3000, function(){
        console.log('App is listening 3000 port');
});