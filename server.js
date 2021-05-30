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
        db.query(`SELECT nIdx, nImg FROM notice WHERE nEndDate >= DATE(NOW())`, function(error, banner_imgs){
                db.query(`SELECT * FROM product WHERE pDelete=0 ORDER BY pDate DESC limit 5;`, function(error, new_products){
                        if(request.session.is_logined == true){
                                response.render('mainPage', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name,
                                        new_products : new_products,
                                        banner_imgs: banner_imgs
                                });
                        }else{
                                response.render('mainPage', {
                                        is_logined : false,
                                        new_products : new_products,
                                        banner_imgs: banner_imgs
                                });
                        }
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
                                                response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
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

app.get('/product/:productId', function(request, response){
        product_user.detail(request, response);
});

app.get('/product_admin/:productId', function(request, response){
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
                        response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
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
                        response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
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
        db.query(`SELECT * FROM member WHERE mId=?;`,[request.session.ID], function(err, memberInfo){
                if(err) throw err;
                else {
                        db.query(`SELECT * FROM basket b, product p WHERE b.product_id=p.pIdx and b.member_id=?`, [request.session.ID], function(error, basket){
                                if(error) throw error;
                                else {
                                        let sum = 0;
                                        let delivery_fee = 0;
                                        for(let i = 0; i<basket.length; i++) {
                                                sum = sum + (basket[i].bQuantity * basket[i].pPrice);
                                                if(delivery_fee <= basket[i].pDeliveryfee){
                                                        delivery_fee = basket[i].pDeliveryfee;
                                                }
                                        }
                                        response.render('payment', {
                                                is_logined: true,
                                                ID : request.session.ID,
                                                mName: request.session.name,
                                                email: memberInfo[0].mEmail,
                                                mPost_code: memberInfo[0].mPost_code,
                                                mRoad_address: memberInfo[0].mRoad_address,
                                                mJibun_address: memberInfo[0].mJibun_address,
                                                mDetail_address: memberInfo[0].mDetail_address,
                                                mExtra_address: memberInfo[0].mExtra_address,
                                                basket: basket,
                                                pSum: sum,
                                                delivery_fee: delivery_fee
                                        });
                                }
                        });
                }
        });
});

app.post('/order_create', function(request, response){
        console.log(request.body);
        var post = request.body;
        var sum = parseInt(post.sum);
        var addr = post.road + post.jibun + post.detail;
        db.query('INSERT INTO `order`(member_id, oStatus, oDate, oTotal_price, oPhone_num, oAddress) VALUES(?, ?, NOW(), ?, ?, ?)',[post.ID, 0, sum, post.phonenum, addr], function(error, result){
            if(error) throw error;
            console.log(result);
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
	db.query(`SELECT * FROM address WHERE member_id= ?`, [request.session.ID], function(error, address, fields){
			
		console.log(address);

        	if(request.session.is_logined == true){
			response.render('delivery_address',{
			is_logined : request.session.is_logined,
			name : request.session.name,
			ID : request.session.ID,
			address : address	
		});
		};
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
        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                } else {
                        if(request.session.is_logined == true){
                                response.render('product_information_admin', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name
                                });
                        }
                }
        });
});

// inquiry 테이블 필요
// 임의 컬럼네임과 테이블네임 사용
app.get('/inquiry_page', function(request, response){
        const body = request.body;
        let type = '';
        for(let i = 0; i<body.select_type.length; i++){
                if(body.select_type[i].checked){
                        type = body.select_type[i];
                        break;
                }
        }
        db.query(`INSERT INTO inquiry (mId, iId, subject, content, type, status, iDate) VALUES (?, ?, ?, ?, ?, ?, NOW())`, 
                [request.session.ID, iId, body.subject, body.content, type, '미등록'], function(err, result){
                        response.redirect('/inquiry_list');
                });
});

app.get('/inquiry_list', function(request, response){
        db.query(`SELECT iId, subject, content, type, iDate, status, FROM inquiry WHERE mId=?`, [request.session.ID], function(err, inquiry){
                if(err) throw err;
                else {
                        response.render('inquiry_list', {
                                inquiry: inquiry
                        });
                }

        });
});


app.listen(3000, function(){
        console.log('3000 port');
});
