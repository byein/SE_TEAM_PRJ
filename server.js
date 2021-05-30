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
        var filteredId = path.parse(request.params.categoryName).base;
        var sortby = url.parse(request.url, true).query.sortby;
	if (sortby == undefined){
		sortby = "p.pDate DESC";
	}
	if (sortby == "pName-asc")
	{
		sortby = "p.pName ASC";
	}
	if (sortby == "pName-desc")
	{
		sortby = "p.pName DESC";
	}
	if (sortby == "pPrice-asc"){
		sortby = "p.pPrice ASC";
	}
	if (sortby == "pPrice-desc"){
		sortby = "p.pPrice DESC";
	}
	if (sortby == "pDate-asc"){
		sortby = "p.pDate ASC";
	}
	if (sortby == "pDate-desc"){
		sortby = "p.pDate DESC";
	}

        var page = request.params.page;
        db.query(`SELECT * FROM product p, category c WHERE p.category_id = c.sub_id and c.main_name=? and p.pDelete=0 ORDER BY `+sortby, [filteredId], function(error, products){
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
                                        page_num : 24,
                                        sortby : sortby,
                                        search : 0
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
                                        page_num : 24,
                                        sortby : sortby,
                                        search : 0
                                });
                                console.log(products.length-1);
                        }

                }
        });
});

app.get('/sub_category/:categoryId/:page', function(request, response){
        var filteredId = path.parse(request.params.categoryId).base;
        var sortby = url.parse(request.url, true).query.sortby;
	if (sortby == undefined){
		sortby = "p.pDate DESC";
	}
	if (sortby == "pName-asc")
	{
		sortby = "p.pName ASC";
	}
	if (sortby == "pName-desc")
	{
		sortby = "p.pName DESC";
	}
	if (sortby == "pPrice-asc"){
		sortby = "p.pPrice ASC";
	}
	if (sortby == "pPrice-desc"){
		sortby = "p.pPrice DESC";
	}
	if (sortby == "pDate-asc"){
		sortby = "p.pDate ASC";
	}
	if (sortby == "pDate-desc"){
		sortby = "p.pDate DESC";
	}
        var page = request.params.page;
        db.query(`SELECT * FROM product p, category c WHERE p.category_id = c.sub_id and p.pDelete=0 and c.sub_id=? ORDER BY `+sortby, [filteredId], function(error, products){
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
                                                page_num : 24,
                                                sortby : sortby,
                                                search : 0
                                        });
                                } else {
                                        response.render('product_list', {
                                                is_logined : false,
                                                products : products,
                                                main_name : sub[0].main_name,
                                                sub : sub,
                                                page : page,
                                                length : products.length-1,
                                                page_num : 24,
                                                sortby : sortby,
                                                search : 0
                                        });
                                }
                        });
                }
        });
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

app.get('/add_product_admin_in', upload.fields([{name : 'pimg' }, {name : 'pdetail' }]), function(request, response){
        var body = request.body;
        var file = request.files;
        var img = new Array();
        for(var i=0; i<file['pimg'].length; i++){
                img[i] = '/uploads/'+`${file['pimg'][i].filename}`;
        }
        var detail = '/uploads/' + `${file['pdetail'][0].filename}`;

        db.query(`INSERT INTO product (category_id, pName, pPrice, pImg, pImg2, pImg3, pImg4, pImg5, pDetail,  pDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [body.sub_category, body.pname, body.pprice, img[0], img[1], img[2], img[3], img[4], detail], function(error2, result){
                db.query(`INSERT INTO stock (product_id, sQuantity) VALUES (?, ?)`, [result.insertId, body.pquantity], function(error3, results){
                response.redirect(`/product_admin/${result.insertId}`);
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

app.get('/product_list_admin', function(request, response){
        var query = url.parse(request.url, true).query.query;
        var sortBy = url.parse(request.url, true).query.sortBy;
        var sprice = url.parse(request.url, true).query.sprice;
        var eprice = url.parse(request.url, true).query.eprice;

        if (query == undefined){
                query = ''; }
        if (sortBy == undefined){
                sortBy ='';
        }
        if(eprice == undefined){
                eprice='';
        }
        if(sprice == undefined){
                sprice='';
        }
        if (sprice == ''){
               var sprice = '1';
        }
        if (eprice == ''){
               eprice = '100000000';
        }

        console.log(query, sortBy, sprice, eprice);

        db.query(`SELECT * FROM admin WHERE aId=?`, [request.session.name], function(error2, admin){
                if(!admin[0]){
                        response.send('<script>alert("접근 권한이 없습니다"); window.location.href = `/`;</script>');
                } else {
                         if (sortBy == "asc"){
                                 var sql = "SELECT * FROM product WHERE pDelete=0 AND pName like '%" + query + "%' AND pPrice>=" + sprice + " AND pPrice<=" + eprice + " ORDER BY pPrice ASC";}
                        else if (sortBy == "desc") {
                                var sql = "SELECT * FROM product WHERE pDelete=0 AND pName like '%" + query + "%' AND pPrice>=" + sprice + " AND pPrice<=" + eprice +" ORDER BY pPrice DESC";

                        } else{
                                var sql = "SELECT * FROM product WHERE pDelete=0 AND pName like '%" + query + "%' AND pPrice>=" + sprice + " AND pPrice<=" + eprice +" ORDER BY pDate DESC";
                              }
                        db.query(sql, function(err2, products, fields){
                                if (err2) throw err2;
                                else{
                                        response.render('product_list_admin', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name,
                                                products : products
                                        });
                                }
                        });
                }
        });
});

app.get('/search', function(request, response){
        var category = url.parse(request.url, true).query.category;
        var query = url.parse(request.url, true).query.query;
        var sprice = url.parse(request.url, true).query.sprice;
        var eprice = url.parse(request.url, true).query.eprice;

        if(sprice == ""){
                sprice ='0';
        }
        if (eprice == ""){
                eprice ='1000000000';
        }

        if (category == "all"){
                var sql = "SELECT * FROM product WHERE pDelete=0 AND pName LIKE '%" + query + "%' AND pPrice >=" + sprice + " AND pPrice <=" + eprice;
		category = "TOP" + "BOTTOM" + "DRESS" + "BAG&SOCKS" + "ACC" ;
	}
        else if (category == "top"){
                var sql = "SELECT * FROM product WHERE pDelete=0 AND (category_id=0 OR category_id=1) AND pName LIKE '%" + query + "%' AND pPrice >=" + sprice + " AND pPrice <=" + eprice;

        }
        else if (category == "bottom"){
                var sql = "SELECT * FROM product WHERE pDelete=0 AND (category_id=2 OR category_id=3 OR category_id= 4) AND pName LIKE '%" + query + "%' AND pPrice >=" + sprice + " AND pPrice <=" + eprice;

        }
        else if (category == "dress"){
                var sql = "SELECT * FROM product WHERE pDelete=0 AND (category_id=5 OR category_id=6) AND pName LIKE '%" + query + "%' AND pPrice >=" + sprice + " AND pPrice <=" + eprice;
        }
        else if (category == "goods"){
                var sql = "SELECT * FROM product WHERE pDelete=0 AND (category_id=7 OR category_id=8 OR category_id=9) AND pName LIKE '%" + query + "%' AND pPrice >=" + sprice + " AND pPrice <=" + eprice;
		category = "BAG&SOCKS";
        }
        else {
                var sql = "SELECT * FROM product WHERE pDelete=0 AND (category_id=10 OR category_id=11) AND pName LIKE '%" + query + "%' AND pPrice >=" + sprice + " AND pPrice <=" + eprice;
        }

        db.query(sql, function(err, result, field){
                if (err) throw err;
                else{
                        if(request.session.is_logined == true){
                                response.render('product_list', {
                                        is_logined : request.session.is_logined,
                                        name : request.session.name,
                                        products : result,
                                        main_name : category,
					sub : false,
                                        page : 1,
                                        page_num : 24,
                                        length : result.length-1,
                                        sortby : 'p.pDate DESC',
                                        search : 1
                                });
                        } else {
                                response.render('product_list', {
                                        is_logined : false,
                                        products : result,
					main_name : category,
                                        sub : false,
                                        page : 1,
                                        page_num : 24,
                                        length : result.length-1,
                                        sortby : 'p.pDate DESC',
                                        search : 1
                                });
                        }
                }
        });

        
});

app.get('/product/:productId', function(request, response){
        var filteredId = path.parse(request.params.productId).base;
        db.query(`SELECT * FROM product WHERE pIdx=?`, [filteredId], function(error, product){
                if(error) throw error;
                else {
                        db.query(`select sum(bQuantity) sum from basket b, member m where b.member_id=m.mId and b.product_id=? GROUP BY b.product_id;`, [filteredId], function(error2, basket){
                                if(request.session.is_logined == true){
                                        response.render('detail_page', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name,
                                                ID : request.session.ID,
                                                product : product,
                                                basket : basket
                                        });
                                } else {
                                        response.render('detail_page', {
                                                is_logined : request.session.is_logined,
                                                ID : false,
                                                product : product,
                                                basket : basket
                                        });
                                }
                        });
                }
        });
});

app.get('/product_admin/:productId', function(request, response){
        var filteredId = path.parse(request.params.productId).base;
        db.query(`SELECT * FROM product WHERE pIdx=?`, [filteredId], function(error, product){
                db.query(`SELECT * FROM category WHERE sub_id=?`,[product[0].category_id],function(error2, category){
                        if(error) throw error;
                        else {
                                if(request.session.is_logined == true){
                                        response.render('detail_page_admin', {
                                                is_logined : request.session.is_logined,
                                                name : request.session.name,
                                                ID : request.session.name,
                                                product : product,
                                                category : category
                                        });
                                } else {
                                        response.render('detail_page_admin', {
                                                is_logined : request.session.is_logined,
                                                ID : false,
                                                product : product,
                                                category : category
                                        });
                                }
                        }
                });
        });
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
                // pDeliveryfee 추가해주세요!
                db.query(`SELECT pName, pPrice, pImg FROM product WHERE pIdx in (?) ORDER BY pIdx`, [basket.product_id], function(err, products){
                        for(let i = 0; i<basket.length; i++) {
                                let sum = 0;
                                let delivery_fee = 0;

                                sum = sum + (basket.bQuentity[i] * produects.pPrice[i]); }
                        response.render('payment',{
                                products: products,
                                pSum: sum,
                                delivery_fee: delivery_fee
                        });                
                });
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
