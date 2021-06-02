var db = require('../router/db');
var path = require('path');
var url = require('url');

exports.category = function(request, response){
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
                        }

                }
        });
}

exports.sub_category = function(request, response){
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
}

exports.search = function(request, response){
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


}

exports.detail = function(request, response){
        var filteredId = path.parse(request.params.productId).base;
        db.query(`SELECT * FROM product WHERE pIdx=?`, [filteredId], function(error, product){
                if(error) throw error;
                else {
                        db.query(`select sum(bQuantity) sum from basket b, member m where b.member_id=m.mId and b.product_id=? and m.mId=? GROUP BY b.product_id;`, [filteredId, request.session.ID], function(error2, basket){
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
}