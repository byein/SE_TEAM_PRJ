var express = require('express');
var app = express();
var qs = require('querystring');
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./router/db');
var ejs = require('ejs');
var sanitizeHtml = require('sanitize-html');
var signUp = require('./router/signUp');

app.use(express.static('public'));
app.use(express.static('router'));

//ejs 설정
app.set('views', __dirname + '/views');
app.set('view engine','ejs');

//body-parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/signUp', function(request, response){
        response.render('signUp');
});

app.post('/signUp_create', function(request, response){
        signUp.create(request,response);
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