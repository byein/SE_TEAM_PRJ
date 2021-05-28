// db에서 이름, 전화번호, 우편번호, 이메일 얻어오기
/*exports.get = function(request, response){
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

// 합계 보여주는 함수(완성중)
let sum = 0;
getSum();

function getSum(){
    const dom_sum = document.getElementById('sum');
    dom_sum.innerHTML = '합계 : ' + sum + '원';
}

// iamport를 이용해서 결제 진행
function requestPaywithCard() {
    const IMP = window.IMP; 

    IMP.init("imp15169128"); // 발급받은 "가맹점 식별코드"를 사용
    
    /*const bName = 
    const phone = document.getElementById('get-phone-num').value;
    const addr = document.getElementById('sample4_roadAddress').value
    + document.getElementById().value
    + document.getElementById().value
    + document.getElementById().value;
    const postnum = document.getElementById('sample4_postcode').value;
    */
    IMP.request_pay({
        pg : 'inicis', // version 1.1.0부터 지원.
        pay_method : 'card',
        merchant_uid : 'merchant_' + new Date().getTime(),      // 주문번호
        name : '단가라 원피스',
        amount : 14000,
        buyer_email : 'dlqjdgus99@naver.com', //mEmail,
        buyer_name : '이정현',//bName,
        buyer_tel : '000-0000-0000',//phone,
        buyer_addr : '주소',
        buyer_postcode : '11111', //postnum,
        m_redirect_url : 'http://3.36.117.232:3000/payment' // 카드결제 완료시 이동할 페이지
    }, function(rsp) {
        if ( rsp.success ) {
            var msg = '결제가 완료되었습니다.';
            msg += '고유ID : ' + rsp.imp_uid;
            msg += '상점 거래ID : ' + rsp.merchant_uid;
            msg += '결제 금액 : ' + rsp.paid_amount;
            msg += '카드 승인번호 : ' + rsp.apply_num;
        } else {
            var msg = rsp.error_msg + '.';
        }
        alert(msg);
    });
}


// 우편번호 및 주소 찾기
function sample4_execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function (data) {
            // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

            // 도로명 주소의 노출 규칙에 따라 주소를 표시한다.
            // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
            var roadAddr = data.roadAddress; // 도로명 주소 변수
            var extraRoadAddr = ''; // 참고 항목 변수

            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                extraRoadAddr += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if (data.buildingName !== '' && data.apartment === 'Y') {
                extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if (extraRoadAddr !== '') {
                extraRoadAddr = ' (' + extraRoadAddr + ')';
            }

            // 우편번호와 주소 정보를 해당 필드에 넣는다.
            document.getElementById('sample4_postcode').value = data.zonecode;
            document.getElementById("sample4_roadAddress").value = roadAddr;
            document.getElementById("sample4_jibunAddress").value = data.jibunAddress;

            // 참고항목 문자열이 있을 경우 해당 필드에 넣는다.
            if (roadAddr !== '') {
                document.getElementById("sample4_extraAddress").value = extraRoadAddr;
            } else {
                document.getElementById("sample4_extraAddress").value = '';
            }

            var guideTextBox = document.getElementById("guide");
            // 사용자가 '선택 안함'을 클릭한 경우, 예상 주소라는 표시를 해준다.
            if (data.autoRoadAddress) {
                var expRoadAddr = data.autoRoadAddress + extraRoadAddr;
                guideTextBox.innerHTML = '(예상 도로명 주소 : ' + expRoadAddr + ')';
                guideTextBox.style.display = 'block';

            } else if (data.autoJibunAddress) {
                var expJibunAddr = data.autoJibunAddress;
                guideTextBox.innerHTML = '(예상 지번 주소 : ' + expJibunAddr + ')';
                guideTextBox.style.display = 'block';
            } else {
                guideTextBox.innerHTML = '';
                guideTextBox.style.display = 'none';
            }
        }
    }).open();
}
