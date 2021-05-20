const db = require('./db');

const IMP = window.IMP; // 생략해도 괜찮습니다.
IMP.init("imp15169128"); // 발급받은 "가맹점 식별코드"를 사용합니다.

/*const Iamport = require('iamport');
const imp = new Iamport({
    impKey: '8154164751177019',
    impSecrete: 'Aye54LXUSxm0dNKKXSuFSFE1eQGa0W1AvgFz1CuUaQVoEG8ByDhriWtxN9HN6JoBZ4a1HFWRvRfayoM7'
});
*/

exports.in = function(request, response){ //alert가 안됨
    var post = request.body;
    db.query(`SELECT * FROM member WHERE mId=?`, [post.userid], function(error, results){
               if (!results[0]){
                       if (!admin[0]){
                               response.send('<script>alert("아이디 또는 비밀번호가 일치하지 않습니다."); window.location.href = `/login`;</script>');
                       } else {
                               if(post.userpw != admin[0].aPwd){
                                       response.send('<script>alert("아이디 또는 비밀번호가 일치하지 않습니다."); window.location.href = `/login`;</script>');
                               } else {
                               request.session.is_logined = true;
                               request.session.name = admin[0].aId;
                               request.session.pw = admin[0].aPwd;
                               request.session.save(function(){
                                       response.render('mainPage_admin', {
                                               name    : admin[0].aId,
                                               is_logined      : true
                                       });
                               });
                               response.redirect(`/admin`);
                               }
                       }
               } else if (error){
                       console.log(error);
               } else {
                const mPhone_num = results[0].mPhone_num;
                const mName = results[0].mPhone_num;
                       request.session.is_logined = true;
                       request.session.name = results[0].mName;
                       request.session.id = results[0].mId;
                       request.session.pw = results[0].mPwd;
                       request.session.save(function(){
                               response.render('mainPage', {
                                       name    : results[0].mName,
                                       id      : results[0].mId,
                                       is_logined      : true
                               });
                       });
                       response.redirect(`/`);
               }
       });
}

function requestPay() {
    IMP.request_pay({
        pg : 'inicis', // version 1.1.0부터 지원.
        pay_method : 'card',
        merchant_uid : 'merchant_' + new Date().getTime(),
        name : '단가라 원피스',
        amount : 14000,
        buyer_email : 'iamport@siot.do',
        buyer_name : '구매자이름',
        buyer_tel : '010-1234-5678',
        buyer_addr : '서울특별시 강남구 삼성동',
        buyer_postcode : '123-456',
        m_redirect_url : 'https://www.yourdomain.com/payments/complete'
    }, function(rsp) {
        if ( rsp.success ) {
            var msg = '결제가 완료되었습니다.';
            msg += '고유ID : ' + rsp.imp_uid;
            msg += '상점 거래ID : ' + rsp.merchant_uid;
            msg += '결제 금액 : ' + rsp.paid_amount;
            msg += '카드 승인번호 : ' + rsp.apply_num;
        } else {
            var msg = '결제에 실패하였습니다.';
            msg += '에러내용 : ' + rsp.error_msg;
        }
        alert(msg);
    });
}

function success () {

}  

function cancle () {

}