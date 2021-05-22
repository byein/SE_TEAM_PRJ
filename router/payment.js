//const db = require('./db');

/*const Iamport = require('iamport');
const imp = new Iamport({
    impKey: '8154164751177019',
    impSecrete: 'Aye54LXUSxm0dNKKXSuFSFE1eQGa0W1AvgFz1CuUaQVoEG8ByDhriWtxN9HN6JoBZ4a1HFWRvRfayoM7'
});
*/

// db에서 이름, 전화번호, 우편번호, 이메일 얻어오기
/*exports.in = function(request, response){
    var post = request.body;
    db.query(`SELECT * FROM member WHERE mId=?`, [post.userid], function(error, results){
            if ( error ){
                console.log(error);
            }
            else {
                const mPhone_num = results.mPhone_num;
                const mName = results.mName;
                const mPost_num = results.mPost_num;
                const mEmail = results.mEmail;
            }
       });
};*/

// iamport를 이용해서 결제 진행
function requestPaywithCard() {
    const IMP = window.IMP; 
    IMP.init("imp15169128"); // 발급받은 "가맹점 식별코드"를 사용

    IMP.request_pay({
        pg : 'inicis', // version 1.1.0부터 지원.
        pay_method : 'card',
        merchant_uid : 'merchant_' + new Date().getTime(),      // 주문번호
        name : '단가라 원피스',
        amount : 14000,
        buyer_email : 'dlqjdgus99@naver.com', //mEmail,
        buyer_name : '이정현', //mName,
        buyer_tel : '010-2345-6789',//mPhone_num,
        buyer_addr : '주소',
        buyer_postcode : '12345',//mPost_num,
        m_redirect_url : 'http://3.36.117.232:3000/views/payment' // 카드결제 완료시 이동할 페이지
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

function requestPaywithKakao() {

}