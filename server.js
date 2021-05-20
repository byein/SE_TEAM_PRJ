const https = require('https')
var express = require('express');
var app = express();
var qs = require('querystring');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var FileStore = require('session-file-store')(session); //세션을 파일에 저장
var cookieParser = require('cookie-parser');
var db = require('./router/db');
var ejs = require('ejs');
var sanitizeHtml = require('sanitize-html');
var signUp = require('./router/signUp');
var login = require('./router/login');

app.use(express.static('public'));
app.use(express.static('router'));

//ejs 설정
app.set('views', __dirname + '/views');
app.set('view engine','ejs');

//body-parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//session
app.use(session({
        secret  : 'blackzat',
        resave  : false,
        saveUninitialized : true,
        store   : new FileStore()
}));

app.get('/', function(request, response){
        console.log('메인페이지 작동');
        console.log(request.session);
        if(request.session.is_logined == true){
                response.render('mainPage', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }else{
                response.render('mainPage', {
                        is_logined : false
                });
        }
});

app.get('/admin', function(request, response){
        console.log(request.session);
        if(request.session.is_logined == true){
                response.render('mainPage_admin', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }
});

app.get('/login', function(request, response){
        response.render('login');
});

app.post('/login_create', function(request, response){
        login.in(request,response);
});

app.get('/logout', function(request, response){
        request.session.destroy(function(error){
                response.redirect('/');
        });
});

app.get('/signUp', function(request, response){
        response.render('signUp');
});

app.post('/signUp_create', function(request, response){
        signUp.create(request,response);
});

app.get('/add_banner_admin', function(request, response){
        if(request.session.is_logined == true){
                response.render('add_banner_admin', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }
});

app.get('/add_product_admin', function(request, response){
        if(request.session.is_logined == true){
                response.render('add_product_admin', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }
});


app.get('/product_list_admin', function(request, response){
        if(request.session.is_logined == true){
                response.render('product_list_admin', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }
});

app.get('/banner_list_admin', function(request, response){
        if(request.session.is_logined == true){
                response.render('banner_list_admin', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }
});

app.get('/banner_detail_admin', function(request, response){
        if(request.session.is_logined == true){
                response.render('bannner_datail_admin', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }
});

app.get('/product_list', function(request, response){
        response.render('product_list');
});

app.listen(3000, function(){
        console.log('3000 port');
});
