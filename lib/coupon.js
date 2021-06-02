var db = require('../router/db');
var path = require('path');
var url = require('url');

exports.select = function(request, response){
        var post = request.body;
        console.log(post);
        var category_coupon = '';
        for(let i=0; i<post.basket_length;i++){
                var Idx = 'pIdx';
                var Idx = Idx+i;
                var pIdx = eval('post.'+Idx);
                db.query(`SELECT * FROM product p, category c WHERE p.category_id=c.sub_id and p.pIdx=?`,[pIdx],function(error, category){
                        category_coupon +=  category[0].main_name+'-';
                });
        }
        db.query(`SELECT * FROM coupon_user cu, coupon cp WHERE cu.coupon_id=cp.cpIdx and cp.cpType=1 and cp.cpMiniPrice<=? and cu.member_id=?`,[post.coupon_sum, post.ID], function(error, coupon){
                console.log(category_coupon);
                var string = category_coupon.split('-');
                var sql='';
                for(let i=0;i<string.length-2;i++){
                        sql += `cp.cpCategory= '` + string[i]+ `' or ` ;
                }
                        sql += `cp.cpCategory= '` + string[string.length-2]+ `' ); ` ;


                console.log(sql);
                db.query(`SELECT * FROM coupon_user cu, coupon cp WHERE (cu.coupon_id=cp.cpIdx) and (cp.cpType=0) and (cu.member_id=?) and (`+sql, [post.ID], function(error,c_coupon){
                        console.log(c_coupon);
                        console.log(coupon);
                        if(!coupon[0]){
                                if(!c_coupon[0]){
                                response.render('coupon_select', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.ID,
                                        c_coupon : false,
                                        coupon : false,
                                        post : post
                                });
                                } else {
                                response.render('coupon_select', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.ID,
                                        c_coupon : c_coupon,
                                        coupon : false,
                                        post : post
                                });
                                }

                        }else {
                                if(!c_coupon[0]){
                                response.render('coupon_select', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.ID,
                                        c_coupon : false,
                                        coupon : coupon,
                                        post : post
                                });
                                } else {
                                response.render('coupon_select', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.ID,
                                        c_coupon : c_coupon,
                                        coupon : coupon,
                                        post : post
                                });
                                }
                        }
                });
        });
}

exports.select_direct = function(request, response){
        var post = request.body;
        console.log(post);
        console.log(post.pIdx0);
        var category_coupon = 0;
        db.query(`SELECT * FROM product p, category c WHERE p.category_id=c.sub_id and p.pIdx=?`,[post.pIdx0],function(error, category){
                category_coupon =  category[0].main_name;
        });
        db.query(`SELECT * FROM coupon_user cu, coupon cp WHERE cu.coupon_id=cp.cpIdx and cp.cpType=1 and cp.cpMiniPrice<=? and cu.member_id=?`,[post.coupon_sum, post.ID], function(error, coupon){
                console.log(category_coupon);
                db.query(`SELECT * FROM coupon_user cu, coupon cp WHERE (cu.coupon_id=cp.cpIdx) and (cp.cpType=0) and (cu.member_id=?) and (cp.cpCategory=?)`, [post.ID, category_coupon], function(error,c_coupon){
                        console.log(c_coupon);
                        console.log(coupon);
                        if(!coupon[0]){
                                if(!c_coupon[0]){
                                response.render('coupon_select_direct', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.ID,
                                        c_coupon : false,
                                        coupon : false,
                                        post : post
                                });
                                } else {
                                response.render('coupon_select_direct', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.ID,
                                        c_coupon : c_coupon,
                                        coupon : false,
                                        post : post
                                });
                                }

                        }else {
                                if(!c_coupon[0]){
                                response.render('coupon_select_direct', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.ID,
                                        c_coupon : false,
                                        coupon : coupon,
                                        post : post
                                });
                                } else {
                                response.render('coupon_select_direct', {
                                        is_logined : request.session.is_logined,
                                        name :request.session.name,
                                        ID : request.session.ID,
                                        c_coupon : c_coupon,
                                        coupon : coupon,
                                        post : post
                                });
                                }
                        }
                });
        });
}