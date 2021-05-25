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
        db.query(`SELECT * FROM event WHERE eDate + Period <= 오늘날짜`, function(error, banner_imgs){
                response.render('mainPage', {
                        banner_imgs: banner_imgs
                })
        });
        db.query(`SELECT * FROM product ORDER BY pDate DESC limit 5;`, function(error, new_products){
                if(request.session.is_logined == true){
                        response.render('mainPage', {
                                is_logined : request.session.is_logined,
                                name : request.session.name,
                                new_products : new_products
                        });
                }else{
                        response.render('mainPage', {
                                is_logined : false,
                                new_products : new_products
                        });
                }
        });
});

app.get('/category/:categoryName', function(request, response){
        var filteredId = path.parse(request.params.categoryName).base;
        db.query(`SELECT * FROM product p, category c WHERE p.category_id = c.sub_id and c.main_name=?`, [filteredId], function(error, products){
                if(error) throw error;
                else {
                        response.render('product_list', {
                                is_logined : request.session.is_logined,
                                name : request.session.name,
                                products : products
                        });
                }
        });
});

app.get('/admin', function(request, response){
        console.log(request.session);
        db.query(`SELECT * FROM product ORDER BY pDate DESC limit 5;`, function(error, new_products){
                db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                        if(!admin[0]){
                                response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                        } else {
                                if(request.session.is_logined == true){
                                        response.render('mainPage_admin', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name,
                                                new_products : new_products
                                        });
                                }
                        }
                });
        });
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
        db.query(`SELECT * FROM product ORDER BY pDate DESC limit 5;`, function(error, new_products){
                db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                        if(!admin[0]){
                                response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                        } else {
                                if(request.session.is_logined == true){
                                        response.render('add_banner_admin', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name
                                        });
                                }
                        }
                });
        });
        
});

app.get('/add_product_admin', function(request, response){
        db.query(`SELECT * FROM product ORDER BY pDate DESC limit 5;`, function(error, new_products){
                db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                        if(!admin[0]){
                                response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                        } else {
                                if(request.session.is_logined == true){
                                        response.render('add_product_admin', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name
                                        });
                                }
                        }
                });
        });
});


app.get('/product_list_admin', function(request, response){
        db.query(`SELECT * FROM product ORDER BY pDate DESC limit 5;`, function(error, new_products){
                db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                        if(!admin[0]){
                                response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                        } else {
                                db.query(`SELECT * FROM product ORDER BY pDate`, function(error, products){                    
                                        if(error2) throw error2;
                                        else {
                                                response.render('product_list_admin', {
                                                        is_logined : request.session.is_logined,
                                                        name : request.session.name,
                                                        products        : products
                                                });
                                        }
                                });
                        }
                });
        });
        
});

app.get('/product/:productId', function(request, response){
        var filteredId = path.parse(request.params.productId).base;
        db.query(`SELECT * FROM product WHERE pIdx=?`, [filteredId], function(error, product){
                if(error) throw error;
                else {
                        response.render('detail_page', {
                                is_logined : request.session.is_logined,
                                name : request.session.name,
                                product : product
                        });
                }
        });
});

app.get('/banner_list_admin', function(request, response){
        db.query(`SELECT * FROM product ORDER BY pDate DESC limit 5;`, function(error, new_products){
                db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                        if(!admin[0]){
                                response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                        } else {
                                if(request.session.is_logined == true){
                                        response.render('banner_list_admin', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name
                                        });
                                }
                        }
                });
        });
        
});

app.get('/banner_detail_admin', function(request, response){
        db.query(`SELECT * FROM product ORDER BY pDate DESC limit 5;`, function(error, new_products){
                db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                        if(!admin[0]){
                                response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                        } else {
                                if(request.session.is_logined == true){
                                        response.render('bannner_datail_admin', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name
                                        });
                                }
                        }
                });
        });
        
});

app.get('/basket', function(request, response){
        if(request.session.is_logined == true){
                response.render('basket_page', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }  
});

app.get('/product_list', function(request, response){
        response.render('product_list');
});

app.get('/payment', function(request, response) {
        response.render('payment', {
                is_logined: true,
                mName : request.session.name,
                pPrice: request.session.mPrice,
                pImg: request.session.mImg,
                pName: request.session.pName
        })
})

app.listen(3000, function(){
        console.log('3000 port');
});
