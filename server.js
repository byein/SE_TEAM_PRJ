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
var multer = require('multer');

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

var upload = multer({
        storage : multer.diskStorage({
                destination : function(request, file, cb){
                        cb(null, './public/uploads/');
                },
                filename : function(request, file, cb){
                        cb(null, file.originalname);
                }
        })
});

app.get('/', function(request, response){
        console.log('메인페이지 작동');
        console.log(request.session);
        db.query(`SELECT eImg FROM event WHERE eDate + ePeriod <= DATE(NOW())`, function(error, banner_imgs){
                response.render('mainPage', {
                        banner_imgs: banner_imgs
                })
        });
        db.query(`SELECT * FROM product WHERE pDelete=0 ORDER BY pDate DESC limit 5;`, function(error, new_products){
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

app.get('/category/:categoryName/:page', function(request, response){
        var filteredId = path.parse(request.params.categoryName).base;
        var page = request.params.page;
        db.query(`SELECT * FROM product p, category c WHERE p.category_id = c.sub_id and c.main_name=? and p.pDelete=0 ORDER BY p.pDate DESC;`, [filteredId], function(error, products){
                if(error) throw error;
                else {
                        if(request.session.is_logined == true){
                                response.render('product_list', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name,
                                        products : products,
                                        sub : false,
                                        main_name : filteredId,
                                        page : page,
                                        length : products.length-1,
                                        page_num : 24
                                });
                                console.log(products.length-1);
                        } else {
                                response.render('product_list', {
                                        is_logined : false,
                                        products : products,
                                        sub : false,
                                        main_name : filteredId,
                                        page : page,
                                        length : products.length-1,
                                        page_num : 24
                                });
                                console.log(products.length-1);
                        }

                }
        });
});

app.get('/sub_category/:categoryId/:page', function(request, response){
        var filteredId = path.parse(request.params.categoryId).base;
        var page = request.params.page;
        db.query(`SELECT * FROM product p, category c WHERE p.category_id = c.sub_id and p.pDelete=0 and c.sub_id=? ORDER BY p.pDATE DESC;`, [filteredId], function(error, products){
                if(error) throw error;
                else {
                        db.query(`SELECT * FROM category WHERE sub_id=?`, [filteredId], function(error2, sub){
                                if(request.session.is_logined == true){
                                        response.render('product_list', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name,
                                                products : products,
                                                main_name : sub[0].main_name,
                                                sub : sub,
                                                page : page,
                                                length : products.length-1,
                                                page_num : 24
                                        });
                                } else {
                                        response.render('product_list', {
                                                is_logined : false,
                                                products : products,
                                                main_name : sub[0].main_name,
                                                sub : sub,
                                                page : page,
                                                length : products.length-1,
                                                page_num : 24
                                        });
                                }
                        });
                }
        });
});

app.get('/admin', function(request, response){
        console.log(request.session);
        db.query(`SELECT * FROM product WHERE pDelete=0 ORDER BY pDate DESC limit 5;`, function(error, new_products){
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

app.get('/add_product_admin', function(request, response){
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

app.post('/add_product_admin_in', upload.fields([{name : 'pimg' }, {name : 'pdetail' }]), function(request, response){
        var body = request.body;
        var file = request.files;
        var img = new Array();
        for(var i=0; i<file['pimg'].length; i++){
                img[i] = '/uploads/'+`${file['pimg'][i].filename}`;
        }
        var detail = '/uploads/' + `${file['pdetail'][0].filename}`;

        db.query(`INSERT INTO product (category_id, pName, pPrice, pImg, pImg2, pImg3, pImg4, pImg5, pDetail,  pDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [body.sub_category, body.pname, body.pprice, img[0], img[1], img[2], img[3], img[4], detail], function(error2, result){
                db.query(`INSERT INTO stock (product_id, sQuantity) VALUES (?, ?)`, [result.insertId, body.pquantity], function(error3, results){
                response.redirect(`/product/${result.insertId}`);
                });
        });
});

app.get('/update_product_admin/:productId', function(request, response){
        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                } else {
                        var filteredId = path.parse(request.params.productId).base;
                        db.query(`SELECT * FROM product p, stock s WHERE p.pIdx=s.product_id and p.pIdx=?`, [filteredId], function(error, product){
                                if(request.session.is_logined == true){
                                        response.render('update_product_admin', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name,
                                                product : product
                                        });
                                }
                        });
                }
        });
});

app.post('/update_product_admin_in', upload.fields([{name : 'pimg' }, {name : 'pdetail' }]), function(request, response){
        var body = request.body;
        var file = request.files;
        var img = new Array();
        for(var i=0; i<file['pimg'].length; i++){
                img[i] = '/uploads/'+`${file['pimg'][i].filename}`;
        }
        var detail = '/uploads/' + `${file['pdetail'][0].filename}`;

        db.query(`UPDATE product SET category_id=?, pName=?, pPrice=?, pImg=?, pImg2=?, pImg3=?, pImg4=?, pImg5=?, pDetail=? WHERE pIdx=?`, [body.sub_category, body.pname, body.pprice, img[0], img[1], img[2], img[3], img[4], detail, body.pIdx], function(error2, result){
                db.query(`UPDATE stock SET sQuantity=? WHERE product_id=?`, [body.pquantity, body.pIdx], function(error3, results){
                response.redirect(`/product_admin/${body.pIdx}`);
                });
        });
});

app.get('/delete_product_admin/:productId', function(request, response){
        var filteredId = path.parse(request.params.productId).base;
        db.query(`SELECT * FROM product p, stock s WHERE p.pIdx=s.product_id and p.pIdx=?`, [filteredId], function(error, product){
                db.query(`UPDATE product SET pDelete=? WHERE pIdx=?`, [1, filteredId], function(error, result){
                        response.redirect(`/product_list_admin`);
                });
        });
});

app.get('/product_list_admin/:page', function(request, response){
        var page = request.params.page;
        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                } else {
                        db.query(`SELECT * FROM product WHERE pDelete=0 ORDER BY pDate DESC;`, function(error, products){
                                if(error2) throw error2;
                                else {
                                        response.render('product_list_admin', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name,
                                                products        : products,
                                                page : page,
                                                length : products.length-1,
                                                page_num : 24

                                        });
                                }
                        });
                }
        });
});

app.get('/product/:productId', function(request, response){
        var filteredId = path.parse(request.params.productId).base;
        db.query(`SELECT * FROM product WHERE pIdx=?`, [filteredId], function(error, product){
                if(error) throw error;
                else {
                        if(request.session.is_logined == true){
                                response.render('detail_page', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name,
                                        ID : request.session.ID,
                                        product : product
                                });
                        } else {
                                response.render('detail_page', {
                                        is_logined : request.session.is_logined,
                                        ID : false,
                                        product : product
                                });
                        }
                }
        });
});

app.get('/product_admin/:productId', function(request, response){
        var filteredId = path.parse(request.params.productId).base;
        db.query(`SELECT * FROM product WHERE pIdx=?`, [filteredId], function(error, product){
                if(error) throw error;
                else {
                        if(request.session.is_logined == true){
                                response.render('detail_page_admin', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name,
                                        ID : request.session.name,
                                        product : product
                                });
                        } else {
                                response.render('detail_page_admin', {
                                        is_logined : request.session.is_logined,
                                        ID : false,
                                        product : product
                                });
                        }
                }
        });
});

app.get('/banner_list_admin', function(request, response){
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

app.get('/banner_detail_admin', function(request, response){
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

app.get('/basket', function(request, response){
        db.query(`SELECT * FROM basket b, product p WHERE b.product_id=p.pIdx and b.member_id=?`, [request.session.ID], function(error, basket){
                if(request.session.is_logined == true){
                        response.render('basket_page', {
                                is_logined : request.session.is_logined,
                                name : request.session.name,
                                basket : basket
                        });
                }
        });  
});

app.post('/basket_in', function(request, response){
        var post = request.body;
        if(post.userid=='false'){
                response.send('<script>alert("로그인이 필요합니다."); window.location.href = `/login` ; </script>');
        } else {
                db.query(`INSERT INTO basket (member_id, product_id, bQuantity) VALUES (?,?,?)`, [post.userid, post.productid, post.amount], function(error, result){
                        response.redirect('/basket');
                });
        }
});

app.post('/basket_update', function(request, response){
        var post = request.body;
        var p_num = new Array();
        var b_id = new Array();
        db.query(`SELECT * FROM basket WHERE member_id=?`, [post.userid], function(error, result){
                for(let i=0; i<result.length; i++){
                        p_num[i] = eval('post.p_num'+i);
                        b_id[i] = eval('post.b_id'+i);
                        if(p_num[i]==undefined){
                                db.query(`DELETE FROM basket WHERE bIdx=?;`, [result[i].bIdx], function(error2, results){
                                        console.log("delete");
                                });
                        } else {
                                db.query(`UPDATE basket SET bQuantity=? WHERE bIdx=?`, [p_num[i], b_id[i]], function(error3, update){
                                        console.log("update");
                                });
                        }
                }
                response.redirect('/basket');
        });
});

app.get('/payment', function(request, response) {
        // 주문자 정보 및 배송 정보 채워넣기
        db.query(`SELECT * FROM member WHERE mId=?`,[request.session.ID], function(err, memberInfo){
                if(err) throw err;
                else {
                        response.render('payment', {
                                is_logined: true,
                                mName: request.session.name,
                                email: memberInfo.mEmail,
                                mPost_code: memberInfo.mPost_code,
                                mRoad_address: memberInfo.mRoad_address,
                                mJibun_address: memberInfo.mJibun_address,
                                mDetail_address: memberInfo.mDetail_address
                        });
                }
        });

        // 장바구니 프로덕트 가져오기
        db.query(`SELECT product_id, bQuentity FROM basket WHERE mId=? ORDER BY product_id`, [request.session.ID],function (error, basket){
                response.render('payment',{
                        basket: basket
                });
                db.query(`SELECT pName, pPrice, pImg FROM product WHERE pIdx in (?) ORDER BY pIdx`, [basket.product_id], function(err, products){
                        response.render('payment',{
                                products: products
                        });                
                });
        });
});

app.listen(3000, function(){
        console.log('3000 port');
});
