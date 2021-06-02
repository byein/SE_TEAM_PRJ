var db = require('../router/db');
var path = require('path');
var url = require('url');

exports.payment_post = function(request, response){
        var post  = request.body;
        console.log(post);
        db.query(`SELECT * FROM member WHERE mId=?;`,[request.session.ID], function(err, memberInfo){
            if(err) throw err;
            else {
                db.query(`SELECT * FROM basket b, product p WHERE b.product_id=p.pIdx and b.member_id=?`, [request.session.ID], function(error, basket){
                    if(error) throw error;
                    else {
                        let sale = 0;
                        //if(!post == false){
                            db.query(`SELECT * FROM coupon cp WHERE cp.cpIdx=?`, [post.select_coupon], function(error2, coupon){
                                db.query(`SELECT * FROM coupon cp, category c WHERE cp.cpCategory=c.main_name and cp.cpIdx=?`, [post.select_coupon], function(error2, category_coupon){
                                    console.log(coupon);
                                    if(coupon[0].cpType == 0) {
                                        //카테 고리할인
                                        console.log(category_coupon);
                                        for(let i=0;i<basket.length;i++){
                                            if(basket[i].category_id==category_coupon[0].sub_id || basket[i].category_id==category_coupon[1].sub_id){
                                                sale += basket[i].pPrice * (category_coupon[0].cpCategorySale/100) ;
                                            } else {
                                            sale += 0;
                                            }
                                        }
                                        console.log(sale);
                                        if(sale >= category_coupon[0].cpCategoryMax){
                                            sale = category_coupon[0].cpCategoryMax;
                                            console.log(sale);
                                        }
                                    } else {
                                        //금액 할인
                                        sale += coupon[0].cpPriceSale;
                                    }
                                    console.log(sale);
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
                                            delivery_fee: delivery_fee,
                                            sale : sale
                                        });
                                });
                            });
                    }
                });
            }
        });
}

exports.payment_get = function(request, response){
        console.log(request.body);
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
                                delivery_fee: delivery_fee,
                                sale : 0
                            });
                        }
                });
            }
        });
}

exports.payment_direct = function(request, response){
        var filteredId = path.parse(request.params.productId).base;
        var post = request.body;
        console.log(request.body);
        var sale = 0;

        if(filteredId =='coupon'){
        var post = request.body;
        db.query(`SELECT * FROM member WHERE mId=?;`,[request.session.ID], function(err, memberInfo){
                if(err) throw err;
                else {
                        db.query(`SELECT * FROM product WHERE pIdx=?`, [post.pIdx0], function(error2, product){
                                db.query(`SELECT * FROM coupon cp WHERE cp.cpIdx=?`, [post.select_coupon], function(error2, coupon){
                                        db.query(`SELECT * FROM coupon cp, category c WHERE cp.cpCategory=c.main_name and cp.cpIdx=?`, [post.select_coupon], function(error2, category_coupon){
                                                console.log(product);
                                                console.log(coupon);
                                                console.log(category_coupon);
                                                let sum = 0;
                                                if(coupon[0].cpType == 0) {
                                                    sale += product[0].pPrice * (category_coupon[0].cpCategorySale /100);
                                                    if(sale >= category_coupon[0].cpCategoryMax){
                                                            sale = category_coupon[0].cpCategoryMax;
                                                    }
                                                } else {
                                                        sale = coupon[0].cpPriceSale;
                                                }
                                                sum = product[0].pPrice * post.amount;
                                                response.render('payment_direct', {
                                                        is_logined: true,
                                                        ID : request.session.ID,
                                                        mName: request.session.name,
                                                        email: memberInfo[0].mEmail,
                                                        mPost_code: memberInfo[0].mPost_code,
                                                        mRoad_address: memberInfo[0].mRoad_address,
                                                        mJibun_address: memberInfo[0].mJibun_address,
                                                        mDetail_address: memberInfo[0].mDetail_address,
                                                        mExtra_address: memberInfo[0].mExtra_address,
                                                        pSum : sum,
                                                        product : product,
                                                        post : post,
                                                        sale : sale
                                                });
                                        });
                                });
                        });
                }
        });
        }else {
        db.query(`SELECT * FROM member WHERE mId=?;`,[request.session.ID], function(err, memberInfo){
                if(err) throw err;
                else {
                        db.query(`SELECT * FROM product WHERE pIdx=?`, [filteredId], function(error2, product){

                                let sum = 0;
                                sum = product[0].pPrice * post.amount;
                                response.render('payment_direct', {
                                        is_logined: true,
                                        ID : request.session.ID,
                                        mName: request.session.name,
                                        email: memberInfo[0].mEmail,
                                        mPost_code: memberInfo[0].mPost_code,
                                        mRoad_address: memberInfo[0].mRoad_address,
                                        mJibun_address: memberInfo[0].mJibun_address,
                                        mDetail_address: memberInfo[0].mDetail_address,
                                        mExtra_address: memberInfo[0].mExtra_address,
                                        pSum : sum,
                                        product : product,
                                        post : post,
                                        sale : sale
                                });
                        });
                }
        });
        }
}