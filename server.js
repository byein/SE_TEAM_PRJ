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
var url = require('url');
const { type } = require('os');
const { request, response } = require('express');
var product_user = require('./lib/product_user');
var product_admin = require('./lib/product_admin');
var coupon = require('./lib/coupon');
var payment = require('./lib/payment');

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
        db.query(`SELECT nIdx, nImg, nEndDate FROM notice WHERE nEndDate >= DATE(NOW())`, function(error, banner_imgs){
                db.query(`SELECT * FROM product WHERE pDelete=0 ORDER BY pDate DESC limit 5;`, function(error, new_products){
                        db.query('SELECT sum(od.product_quantity), od.product_id, p.pName, p.pPrice, p.pImg FROM product p, `order` o, order_detail od WHERE p.pIdx=od.product_id and o.oIdx=od.order_id and o.oStatus=3 GROUP BY od.product_id ORDER BY sum(od.product_quantity) DESC limit 5;', function(error2, top_products){
                        if(request.session.is_logined == true){
                                response.render('mainPage', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name,
                                        new_products : new_products,
                                        banner_imgs: banner_imgs,
                                        top_products : top_products
                                });
                        }else{
                                response.render('mainPage', {
                                        is_logined : false,
                                        new_products : new_products,
                                        banner_imgs: banner_imgs,
                                        top_products : top_products
                                });
                        }
                        });
                });
        });
});

app.get('/category/:categoryName/:page', function(request, response){
        product_user.category(request, response);
});

app.get('/sub_category/:categoryId/:page', function(request, response){
        product_user.sub_category(request, response);
});

app.get('/admin', function(request, response){
        console.log(request.session);
        db.query(`SELECT nImg FROM notice WHERE nEndDate >= DATE(NOW())`, function(error, banner_imgs){
                db.query(`SELECT * FROM product WHERE pDelete=0 ORDER BY pDate DESC limit 5;`, function(error, new_products){
                        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                                if(!admin[0]){
                                                response.send('<script>alert("접근 권한이 없 습니다"); window.location.href = `/`;</script>');
                                } else {
                                        if(request.session.is_logined == true){
                                                response.render('mainPage_admin', {
                                                        is_logined : request.session.is_logined,
                                                        name : request.session.name,
                                                        new_products : new_products,
                                                        banner_imgs: banner_imgs
                                                });
                                        }
                                }
                        });
                });
        });
});

app.get('/login', function(request, response){
        response.render('login');
});

app.post('/login_create', function(request, response){
        login.in(request,response);
});

app.get('/login_create/:userid/:userpw', function(request, response){
        login.in_direct(request,response);
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
        product_admin.add(request, response);
});

app.get('/update_product_admin/:productId', function(request, response){
        product_admin.update(request, response);
});

app.post('/update_product_admin_in', upload.fields([{name : 'pimg' }, {name : 'pdetail' }]), function(request, response){
        product_admin.update_in(request, response);
});

app.get('/delete_product_admin/:productId', function(request, response){
        var filteredId = path.parse(request.params.productId).base;
        db.query(`SELECT * FROM product p, stock s WHERE p.pIdx=s.product_id and p.pIdx=?`, [filteredId], function(error, product){
                db.query(`UPDATE product SET pDelete=? WHERE pIdx=?`, [1, filteredId], function(error, result){
                        response.redirect(`/product_list_admin`);
                });
        });
});

app.get('/product_list_admin', function(request, response){
        product_admin.list(request, response);
});

app.get('/search', function(request, response){
        product_user.search(request, response);
});

app.get('/product/:productId/:page', function(request, response){
        product_user.detail(request, response);
});

app.get('/product_admin/:productId/:page', function(request, response){
        product_admin.detail(request, response);
});

app.get('/banner_list_admin', function(request, response){
        var sortBy = url.parse(request.url, true).query.sortBy;
        var query = url.parse(request.url, true).query.query;
        if (sortBy == undefined && query == undefined){
               query = ''
               sortBy = ''
        }

        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습 니다"); window.location.href = `/`;</script>');
                } else {
                        if(request.session.is_logined == true){
                                if (sortBy == 'nTitle-asc')
                                {
                                        var sql = "SELECT * FROM notice WHERE nTitle like" + "'%"+ query +"%'" +"ORDER BY nTitle asc ";
                                }
                                else if(sortBy == 'nTitle-desc')
                                {
                                        var sql = "SELECT * FROM notice WHERE nTitle like" + "'%"+ query +"%'" + "ORDER BY nTitle desc";
                                }
                                else if(sortBy == 'nEndDate-asc')
                                {
                                        var sql = "SELECT * FROM notice  WHERE nTitle like" + "'%"+ query +"%'" + "ORDER BY nEndDate asc";
                                }
                                else if(sortBy == 'nEndDate-desc'){
                                var sql =  "SELECT * FROM notice  WHERE nTitle like" + "'%"+ query +"%'" + "ORDER BY nEndDate desc ";
                                }
                                else {
                                var sql = "SELECT * FROM notice WHERE nTitle like" + "'%"+ query +"%'";
                                }

                                db.query(sql, function(err, result, fields){
                                        if(err) throw err;

                                response.render('banner_list_admin', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.name,
                                        notice : result
                                });
                        });
                }
        }
        });
});

app.get('/banner_list_customer', function(request, response){
        var sortBy = url.parse(request.url, true).query.sortBy;
        var query = url.parse(request.url, true).query.query;
        if (sortBy == undefined && query == undefined){
               // var sql = "SELECT * FROM notice";
               query = ''
               sortBy = ''
        }

        if (sortBy == 'nTitle-asc')
        {
                var sql = "SELECT * FROM notice WHERE nEndDate >= DATE(NOW()) and nTitle like" + "'%"+ query +"%'" +"ORDER BY nTitle asc ";
        }
        else if(sortBy == 'nTitle-desc')
        {
                var sql = "SELECT * FROM notice WHERE nEndDate >= DATE(NOW()) and nTitle like" + "'%"+ query +"%'" + "ORDER BY nTitle desc";
        }
        else if(sortBy == 'nEndDate-asc')
        {
                var sql = "SELECT * FROM notice  WHERE nEndDate >= DATE(NOW()) and nTitle like" + "'%"+ query +"%'" + "ORDER BY nEndDate asc";
        }
        else if(sortBy == 'nEndDate-desc'){
        var sql =  "SELECT * FROM notice  WHERE nEndDate >= DATE(NOW()) and nTitle like" + "'%"+ query +"%'" + "ORDER BY nEndDate desc ";
        }
        else {
        var sql = "SELECT * FROM notice WHERE nEndDate >= DATE(NOW()) and nTitle like" + "'%"+ query +"%'";
        }


        db.query(sql, function(err, result, fields){
                if(err) throw err;
        response.render('banner_list_customer', {
                                notice : result,
                                is_logined : request.session.is_logined,
                                name : request.session.name,
                                ID : request.session.name
        });
        });
});

app.get('/banner_detail_admin/:nIdx', function(request, response){
        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
        if(!admin[0]){
                response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
        } else {
                if(request.session.is_logined == true){
                        const sql = "SELECT * FROM notice where nIdx=?"
                        db.query(sql, [request.params.nIdx], function(err, result, fields){
                                if (err) throw err;
                                response.render('banner_detail_admin',{
                                        is_logined :request.session.is_logined,
                                        notice : result,
                                        name : request.session.name,
                                        ID : request.session.name
                                });
                        });
                };
        };
});
});

app.get('/banner_detail_customer/:nIdx', function(request, response){
        const sql = "SELECT * FROM notice where nIdx=?"
        console.log(sql);
        db.query(sql, [request.params.nIdx], function(err, result, fields){
                if(err) throw err;
                response.render('banner_detail_customer', {
                        notice : result,
                        is_logined : request.session.is_logined,
                        ID : request.session.name,
                        name : request.session.name
                });
        });
});

app.post('/create_banner', upload.single('nImg'), function(request, response){
        var file = request.file;
        var post = request.body;
        var nImg = '/uploads/' +`${file.filename}`;
        db.query(`INSERT INTO notice (nCat, nTitle, nDetail, nImg, nStartDate, nEndDate, nDate) VALUES (?, ?, ?, ?, ?, ?, NOW()) `, [post.nCat, post.nTitle, post.nDetail, nImg, post.nStartDate, post.nEndDate], function(err, result, fields){
                if(err) throw err;
                response.redirect('/banner_list_admin');
        });
});

app.get('/edit_banner_admin/:nIdx', function(request, response){
        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습 니다"); window.location.href = `/`;</script>');
                } else {
                        if(request.session.is_logined == true){
                                const sql = "SELECT * FROM notice where nIdx=?"
                                db.query(sql, [request.params.nIdx], function(err, result, fields){
                                        if (err) throw err;
                                        response.render('edit_banner_admin',{
                                                is_logined :request.session.is_logined,
                                                notice : result,
                                                ID : request.session.name,
                                                name : request.session.name

                                        });
                                });
                        };
                };
        });
});

app.post('/banner_update/:nIdx', upload.single('nImg'), function(request, response){
        var file = request.file;
        var post = request.body;
        var nImg = '/uploads/' +`${file.filename}`;
        const sql = "UPDATE notice SET ? WHERE nIdx =" + request.params.nIdx;
        db.query(`UPDATE notice SET nTitle=?, nDetail=?, nImg=?, nStartDate=?, nEndDate=? WHERE nIdx=?`,[post.nTitle, post.nDetail, nImg, post.nStartDate, post.nEndDate, request.params.nIdx],function (err, result, fields) {
                if(err) throw  err;
                console.log(result);
                response.redirect('/banner_list_admin');
        });
});

app.get('/banner_delete/:nIdx', function(request, response){
        const sql = "DELETE FROM notice WHERE nIdx=?"
        db.query(sql, request.params.nIdx, function(err, result, fields){
                if(err) throw err;
                response.redirect('/banner_list_admin');
        });
});

app.get('/coupon_list_admin', function(request, response){
        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습 니다"); window.location.href = `/`;</script>');
                } else {
                        if(request.session.is_logined == true){
                                db.query(`SELECT * FROM coupon`, function(error, coupon){
                                        response.render('coupon_list_admin', {
                                                is_logined : request.session.is_logined,
                                                name :request.session.name,
                                                ID : request.session.name,
                                                coupon : coupon
                                        });
                                });
                        }
                }
        });
});

app.get('/coupon_add_admin', function(request, response){
        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습 니다"); window.location.href = `/`;</script>');
                } else {
                        if(request.session.is_logined == true){
                                response.render('coupon_add_admin', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.name
                                });
                        }
                }
        });
});

app.post('/coupon_add_admin_in', function(request, response){
        var post = request.body;
        console.log(post);
        if(post.cpType == 1 ) {
                db.query(`INSERT INTO coupon (cpName, cpType, cpMiniPrice, cpPriceSale) VALUES (?, ?, ?, ?)`, [post.cpName, post.cpType, post.cpMiniPrice, post.cpPriceSale], function(error, result){
                        response.redirect('/coupon_list_admin');
                });
        } else {
                db.query(`INSERT INTO coupon (cpName, cpType, cpCategory, cpCategorySale, cpCategoryMax) VALUES (?, ?, ?, ?, ?)`, [post.cpName, post.cpType, post.cpCategory, post.cpCategorySale, post.cpCategoryMax], function(error, result){
                        response.redirect('/coupon_list_admin');
                });
        }
});

app.get('/coupon_update_admin/:cpIdx', function(request, response){
        console.log(request.body);
        var filteredId = path.parse(request.params.cpIdx).base;
        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습 니다"); window.location.href = `/`;</script>');
                } else {
                        if(request.session.is_logined == true){
                                db.query(`SELECT * FROM coupon WHERE cpIdx=?`, [filteredId], function(error, coupon){
                                        response.render('coupon_update_admin', {
                                                is_logined : request.session.is_logined,
                                                name :request.session.name,
                                                ID : request.session.name,
                                                coupon : coupon
                                        });
                                });
                        }
                }
        });
});

app.post('/coupon_update_admin_in/:cpIdx', function(request, response){
        var filteredId = path.parse(request.params.cpIdx).base;
        var post = request.body;
        if(post.cpType == 1 ) {
                db.query(`UPDATE coupon SET cpName=?, cpType=?, cpMiniPrice=?, cpPriceSale=? WHERE cpIdx=?`, [post.cpName, post.cpType, post.cpMiniPrice, post.cpPriceSale, filteredId], function(error, result){
                        response.redirect('/coupon_list_admin');
                });
        } else {
                db.query(`UPDATE coupon SET cpName=?, cpType=?, cpCategory=?, cpCategorySale=?, cpCategoryMax=? WHERE cpIdx=?`, [post.cpName, post.cpType, post.cpCategory, post.cpCategorySale, post.cpCategoryMax, filteredId], function(error, result){
                        response.redirect('/coupon_list_admin');
                });
        }
});

app.get('/coupon_delete_admin/:cpIdx', function(request, response){
        var filteredId = path.parse(request.params.cpIdx).base;
        db.query(`DELETE FROM coupon WHERE cpIdx=?`, [filteredId], function(error, result){
                response.redirect('/coupon_list_admin');
        });
});

app.post('/coupon_select', function(request, response){
        coupon.select(request, response);
});

app.post('/coupon_select_direct', function(request, response){
        coupon.select_direct(request, response);
});

app.get('/coupon_user_download', function(request, response){
        db.query(`SELECT * FROM coupon`, function(error, coupon){
                response.render('coupon_user_download', {
                        is_logined : request.session.is_logined,
                        name :request.session.name,
                        ID : request.session.ID,
                        coupon :coupon
                });
        });
});

app.get('/coupon_download/:cpIdx', function(request, response){
        var filteredId = path.parse(request.params.cpIdx).base;
        db.query(`SELECT * FROM coupon_user WHERE coupon_id=? and member_id=?`, [filteredId, request.session.ID], function(error, mycoupon){
                if(!mycoupon[0]){
                        db.query(`INSERT INTO coupon_user (coupon_id, member_id) VALUES (?, ?)`, [filteredId, request.session.ID], function(error2, result){
                                response.send('<script>alert("쿠폰이 발급되었습니다."); window.location.href="/coupon_user_download"; </script>');
                        });
                } else {
                        response.send('<script>alert("이미 발급된 쿠폰 입니다."); window.location.href="/coupon_user_download"; </script>');
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
                        response.redirect(`/product/`+post.productid+'/1');
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

app.post('/payment', function(request, response) {
        payment.payment_post(request, response);
});

app.get('/payment', function(request, response) {
        payment.payment_get(request, response);
});

app.post('/payment_direct/:productId', function(request, response) {
        payment.payment_direct(request, response);
});

app.post('/order_create', function(request, response){
        var post = request.body;
        var sum = parseInt(post.Sum);
        db.query('INSERT INTO `order`(member_id, oStatus, oDate, oTotal_price, oPhone_num, oAddress, oName) VALUES(?, ?, NOW(), ?, ?, ?, ?)',[post.ID, 0, sum, post.phonenum, post.addr, post.oName], function(error, result){
                if(error) throw error;
                for(let i=0; i<post.basket_length; i++){
                        var Idx = 'pIdx';
                        var Idx = Idx+i;
                        var Quantity = 'pQuantity';
                        var Quantity = Quantity+i;
                        var pIdx = eval('post.'+Idx);
                        var pQuantity = eval('post.'+Quantity);
                        db.query('INSERT INTO order_detail(order_id, product_id, product_quantity) VALUES(?, ?, ?)', [result.insertId, pIdx, pQuantity], function(error2, result2){
                                console.log(result2);
                        });
                }
        });
});

app.get('/order_detail/:page', function(request, response){
        var page = request.params.page;
        var duration = url.parse(request.url, true).query.duration;

        if(duration == undefined){
                duration = 'AND oDate between date_add(NOW(), interval -1 week) and NOW();';
        }
        if (duration == 'day'){
                duration = 'AND oDate between date_add(NOW(), interval -1 day) and NOW();';
        }
        if (duration == 'week'){
                duration = 'AND oDate between date_add(NOW(), interval -1 week) and NOW();';
        }
        if (duration == 'month'){
                duration = 'AND oDate between date_add(NOW(), interval -1 month) and NOW();';
        }
        if (duration == 'year'){
                duration = 'AND oDate between date_add(NOW(), interval -1 year) and NOW();';
        }
        if (duration == 'hour'){
                duration = 'AND oDate between date_add(NOW(), interval -1 hour) and NOW();';
        }

        db.query("SELECT * FROM `order` WHERE member_id=? "+duration, [request.session.ID], function(error, order){
                        if(request.session.is_logined == true){
                                response.render('order_detail', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name,
                                        order : order,
                                        page : page,
                                        length : order.length-1,
                                        page_num : 5,
                                        duration : duration
                                });
                        }else{
                                response.render('order_detail', {
                                        is_logined : false,
                                        order : order,
                                        page : page,
                                        length : order.length-1,
                                        page_num : 5,
                                        duration : duration
                                });
                        }
                });
});

app.post('/oStatus_update', function(request, response){
        var post = request.body;
        console.log(post);
        db.query('UPDATE `order` SET oStatus=? WHERE oIdx=?', [post.status, post.oIdx], function(error, result){
                response.redirect('/order_detail/1');
        });
});

app.get('/order_product_detail/:orderId', function(request, response){
        var filteredId = path.parse(request.params.orderId).base;
        console.log(filteredId);
        db.query('SELECT * FROM `order` o, order_detail od, product p WHERE od.product_id=p.pIdx and o.oIdx=od.order_id and o.member_id=? and od.order_id=?', [request.session.ID, filteredId], function(error2, od){
                        if(request.session.is_logined == true){
                                response.render('sales_detail_info', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name,
                                        od : od
                                });
                        }else{
                                response.render('sales_detail_info', {
                                        is_logined : false,
                                        od : od
                                });
                        }
                });
});

app.get('/use', function(request, response){
        if(request.session.is_logined == true){
                response.render('use', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }else{
                response.render('use', {
                        is_logined : false
                });
        }
});

app.get('/privacy', function(request, response){
        if(request.session.is_logined == true){
                response.render('privacy', {
                        is_logined : request.session.is_logined,
                        name : request.session.name
                });
        }else{
                response.render('privacy', {
                        is_logined : false
                });
        }
});

app.get('/delivery_address', function(request, response){
        console.log(request.session);
        db.query(`SELECT mName, mRoad_address, mJibun_address, mDetail_address FROM member WHERE mId=?`, request.session.ID, function(error, address1){
        db.query(`SELECT * FROM address WHERE member_id= ?`, [request.session.ID], function(error, address, fields){


                if(request.session.is_logined == true){
                        response.render('delivery_address',{
                        is_logined : request.session.is_logined,
                        name : request.session.name,
                        ID : request.session.ID,
                        address : address,
                        address1 : address1
                });
                };
        });
        });
});

app.get('/edit_address/:adIdx', function(request, response) {
        const sql = "SELECT * FROM address WHERE adIdx=?";
        console.log(request.params.adIdx);
        db.query(sql,[request.params.adIdx], function(err, result, fields){
                if (err) throw err;
                response.render('edit_address',{ address : result });
        });
});

app.post('/address_update/:adIdx', function(request, response){
        const sql = "UPDATE address SET ? WHERE adIdx =" + request.params.adIdx;
        console.log(sql);
        db.query(sql, request.body, function (err, result, fields) {
                if(err) throw  err;
                console.log(result);
                response.redirect('/delivery_address');
        });
})



app.get('/pop_up', function(request, response){
        response.render('pop_up');
})


app.post('/create_address', function(request, response){
        const sql = "INSET INTO address SET ?"
        db.query = (sql, request.body, function(err, result, fields){
                if(err) throw err;
                response.redirect('/delivery_address');

        })
})

app.get('/delete_address/:adIdx', function(request, response){
        const sql = "DELETE FROM address WHERE adIdx=?"
        db.query(sql, request.params.adIdx, function(err, result, fields){
                if(err) throw err;
                response.redirect('/delivery_address');
        })
});

app.get('/product_information_admin', function(request, response){
        var sdate = url.parse(request.url, true).query.sdate;
        var edate = url.parse(request.url, true).query.edate;
        console.log(sdate,edate);
        if(sdate == undefined){
                sdate = "1900-01-01";
        }
        if(edate == undefined){
                edate = "2200-12-31";
        }
        if(sdate ==""){
                sdate = "1900-01-01";
        }
        if(edate ==""){
                edate = "2200-12-31";
        }
        console.log(sdate,edate);

        db.query("SELECT SUM(oTotal_price) sum FROM `order` WHERE oStatus=3 AND oDate >=date('" +sdate+ "') AND oDate <= date('" +edate+"');", function(error, sales){
                db.query("SELECT sum(od.product_quantity) sum, od.product_id, p.pName, p.pPrice FROM product p, `order` o, order_detail od WHERE (p.pIdx=od.product_id) and (o.oIdx = od.order_id) and (o.oStatus=3) and (o.oDate>='"+sdate+"') AND (o.oDate<='"+edate+"') GROUP BY od.product_id ORDER BY sum(od.product_quantity) DESC limit 3;", function(error, product){
                        db.query("SELECT p.category_id, od.order_id, c.main_name, c.sub_name, sum(od.product_quantity) sum FROM product p, `order` o, order_detail od, category c WHERE (p.pIdx=od.product_id) and (o.oIdx=od.order_id) and (o.oStatus=3) and (c.sub_id=p.category_id) and (o.oDate>='"+sdate+"') AND (o.oDATE<='"+edate+"') GROUP BY p.category_id ORDER BY sum(od.product_quantity) DESC limit 3; ", function(error, category){
                db.query("SELECT * FROM `order` WHERE oDate >=date('" + sdate +"') AND oDate <= date('" +edate+ "');"  , function(error, order){
                        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                                if(!admin[0]){
                                        response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                                } else {
                                        if(request.session.is_logined == true){
                                                response.render('product_information_admin', {
                                                        is_logined : request.session.is_logined,
                                                        name : request.session.name,
                                                        order : order,
                                                        length : order.length,
                                                        sales : sales,
                                                        product : product,
                                                        category : category
                                                });
                                        }
                                }
                        });
                });
                });
                });
        });


});

app.post('/oStatus_update_admin',function(request, response){
        var post = request.body;
        console.log(post);
        db.query('UPDATE `order` SET oStatus=? WHERE oIdx=?', [post.status, post.oIdx], function(error,result){
                response.redirect('/product_information_admin');
        });
});


app.get('/sales_detail_info_admin/:orderId', function(request, response){
        var filteredId = path.parse(request.params.orderId).base;
        console.log(filteredId);
        db.query("SELECT * FROM `order` o, order_detail od, product p  WHERE od.product_id=p.pIdx and o.oIdx=od.order_id and od.order_id=?", [filteredId], function(error2, od){
                db.query("SELECT * FROM review r, product p WHERE p.pIdx=r.product_id and r.order_id=?", [filteredId], function(error1, review){
                        //if (review == undefined){
                                //review = []; }else {
                                console.log(od);
                                console.log(review);
                        if(request.session.is_logined == true){
                                response.render('sales_detail_info_admin', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name,
                                        od : od,
                                        review : review
                                });
                        }else{
                                response.render('sales_detail_info_admin', {
                                        is_logined : false
                                });
                        }
                                //}
                });
        });
});


app.get('/add_review_customer/:orderId', function(request, response){
        var filteredId = path.parse(request.params.orderId).base;
        console.log(filteredId);
        const sql = "SELECT * FROM order_detail od, product p WHERE od.order_id='" +filteredId+"'AND p.pIdx=od.product_id;"
        console.log(sql);
        db.query(sql, function(error2, od){
        console.log(od);
                if (request.session.is_logined == true){
                response.render('add_review_customer',{
                        is_logined : request.session.is_logined,
                        name : request.session.name,
                        od : od
                });
        }else{
                response.render('add_review_customer',{
                        is_logined : false,
                        od : od
                });
        }
});
})

app.post('/create_review', function(request, response){
        var post = request.body;
        console.log(post);
        db.query(`INSERT INTO review (product_id, rRecommand, rDelivery, rPoint, rReview, rDate, rName, order_id) VALUES (?, ?, ?, ?, ? , NOW(), ?, ?)`, [post.product_id, post.rRecommand, post.rDelivery, post.rPoint, post.rReview, request.session.name, post.order_id], function(err, result ,fields){

                name : request.session.name
                if (err) throw err;
                response.redirect('/');
        })
})




// inquiry 테이블 필요
// 임의 컬럼네임과 테이블네임 사용
app.get('/inquiry_page/:oIdx', function(request, response){
        var filteredId = request.params.oIdx;
        db.query('SELECT * FROM inquiry iq, `order` o WHERE iq.order_id=o.oIdx and o.oIdx=?', [filteredId], function(err, inquiry){
                if(!inquiry[0]){
                        if(request.session.is_logined==true){
                                response.render('inquiry_page', {
                                        name : request.session.name,
                                        ID : request.session.ID,
                                        is_logined : true,
                                        oIdx : filteredId
                                });
                        }
                }else {
                        response.redirect('/inquiry_list');
                }
        });
});

app.get('/inquiry_page/plus/:oIdx', function(request, response){
        var filteredId = request.params.oIdx;
        if(request.session.is_logined==true){
                response.render('inquiry_page', {
                        name : request.session.name,
                        ID : request.session.ID,
                        is_logined : true,
                        oIdx : filteredId
                });
        }else {
                response.send('<script>alert("로그인이 필요합니다."); window.location.href="/login"; </script>');
        }
});

app.post('/inquiry_page_in', function(request, response){
        var post = request.body;
        console.log(post);
        db.query(`INSERT INTO inquiry (order_id, iqName, iqDetail, iqDate) VALUES (?, ?, ?, NOW())`, [post.oIdx, post.subject, post.content], function(error, result){
                response.redirect('/inquiry_list');
        });
});

app.get('/inquiry_list', function(request, response){
        db.query('SELECT * FROM inquiry iq, `order` o WHERE iq.order_id=o.oIdx and o.member_id=?', [request.session.ID], function(err, inquiry){
                if(err) throw err;
                else {
                        if (request.session.is_logined == true){
                                response.render('inquiry_list', {
                                        inquiry: inquiry,
                                        name : request.session.name,
                                        ID : request.session.ID,
                                        is_logined : true
                                });
                        } else {
                                response.send('<script>alert("로그인이 필요합니다."); window.location.href="/login"; </script>');
                        }
                }

        });
});

app.get('/inquiry_admin/:page', function(request, response){
        var page = request.params.page;
        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습 니다"); window.location.href = `/`;</script>');
                } else {
                        db.query('SELECT * FROM inquiry iq, `order` o WHERE iq.order_id=o.oIdx ORDER BY iq.iqDate DESC',  function(err, inquiry){
                                if(err) throw err;
                                else {
                                        response.render('inquiry_admin', {
                                                inquiry: inquiry,
                                                name : request.session.name,
                                                ID : request.session.name,
                                                is_logined : true,
                                                page : page,
                                                length : inquiry.length-1,
                                                page_num : 5
                                        });
                                }
                        });
                }

        });
});

app.post('/inquiry_admin_in', function(request, response){
        var post = request.body;
        console.log(post);
        db.query(`UPDATE inquiry SET iqAnswer=?, iqSolved=?  WHERE iqIdx=?`, [post.answer, 1,post.iqIdx], function(error, result){
                console.log(result);
                response.redirect('/inquiry_admin/1');
        });
});


app.listen(3000, function(){
        console.log('3000 port');
});