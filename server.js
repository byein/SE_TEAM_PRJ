var express = require('express');
var app = express();
var qs = require('querystring');
var path = require('path');
var db = require('./router/db');
var sanitizeHtml = require('sanitize-html');

app.use(express.static('public'));
app.use(express.static('router'));

app.get('/signUp', function(request, response){
        response.sendfile(__dirname + '/views/signUp.html');
});

app.get('/add_product_admin', function(request, response){
        response.sendfile(__dirname + '/views/add_product_admin.html');
});

app.get('/product_list_admin', function(request, response){
        response.sendfile(__dirname + '/views/product_list_admin.html');
});

app.get('/product_list', function(request, response){
        response.sendfile(__dirname + '/views/product_list.html');
});

app.listen(3000, function(){
        console.log('App is listening 3000 port');
});