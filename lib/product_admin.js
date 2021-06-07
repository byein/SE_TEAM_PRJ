var db = require('../router/db');
var path = require('path');
var url = require('url');

exports.add = function(request, response){
        var body = request.body;
        var file = request.files;
        var img = new Array();
        for(var i=0; i<file['pimg'].length; i++){
                img[i] = '/uploads/'+`${file['pimg'][i].filename}`;
        }
        var detail = '/uploads/' + `${file['pdetail'][0].filename}`;

        db.query(`INSERT INTO product (category_id, pName, pPrice, pImg, pImg2, pImg3, pImg4, pImg5, pDetail,  pDate, pDeliveryfee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`, [body.sub_category, body.pname, body.pprice, img[0], img[1], img[2], img[3], img[4], detail, body.pDeliveryfee], function(error2, result){
                db.query(`INSERT INTO stock (product_id, sQuantity) VALUES (?, ?)`, [result.insertId, body.pquantity], function(error3, results){
                response.redirect(`/product_admin/${result.insertId}`);
                });
        });
}

exports.update = function(request, response){
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
}

exports.update_in = function(request, response){
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
}

exports.list = function(request, response){
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
}

exports.detail = function(request, response){
        var page = request.params.page;
        var filteredId = path.parse(request.params.productId).base;
        db.query(`SELECT * FROM product WHERE pIdx=?`, [filteredId], function(error, product){
                db.query(`SELECT * FROM category WHERE sub_id=?`,[product[0].category_id],function(error2, category){
                        if(error) throw error;
                        else {
                                db.query(`SELECT * FROM review WHERE product_id=?`, [filteredId], function(error2, review){

                                        if(request.session.is_logined == true){
                                                response.render('detail_page_admin', {
                                                        is_logined : request.session.is_logined,
                                                        name : request.session.name,
                                                        ID : request.session.name,
                                                        product : product,
                                                        category : category,
                                                        review : review,
                                                        page : page,
                                                        length : review.length-1,
                                                        page_num : 5
                                                });
                                        }else {
                                                response.render('detail_page_admin', {
                                                        is_logined : request.session.is_logined,
                                                        ID : false,
                                                        product : product,
                                                        category : category,
                                                        review : review,
                                                        page : page,
                                                        length : review.length-1,
                                                        page_num : 5
                                                });
                                        }
                                });
                        }
                });
        });
}
