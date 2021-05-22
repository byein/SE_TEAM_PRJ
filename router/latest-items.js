const db = require('./db');

exports.in = function(request, response){ //alert가 안됨
    var post = request.body;
    db.query(`SELECT TOP 5 pName, pImg, pPrice FROM product ORDER BY pDate DESC`, [post.userid], function(error, results){
        for(let i=0; i<5; i++) {
            request.session.pName[i] = results[i].pName;
            request.session.pPrice[i] = results[i].pPrice;
            request.session.pImg[i] = results[i].pImg;
        }
    });
};
