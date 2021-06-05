let oInfo = {
    oName: '',
    phone: '',
    addr: '',
    postnum: '',
    price:'',
    pName:'',
    email:''
};

function setDeliveryInfo() {
    oInfo.oName = document.getElementById('get-oName').value;
    oInfo.phone = document.getElementById('get-phone-num').value;
    oInfo.addr = document.getElementById('sample4_roadAddress').value + document.getElementById('sample4_jibunAddress').value + document.getElementById('sample4_detailAddress').value;
    oInfo.postnum = document.getElementById('sample4_postcode').value;

    alert('배송지 정보가 저장되었습니다.');
}

// iamport를 이용해서 결제 진행
function requestPay() {
    oInfo.oName = document.getElementById('get-oName').value;
    oInfo.phone = document.getElementById('get-phone-num').value;
    oInfo.addr = document.getElementById('sample4_roadAddress').value + document.getElementById('sample4_jibunAddress').value + document.getElementById('sample4_detailAddress').value;
    oInfo.postnum = document.getElementById('sample4_postcode').value;
    oInfo.price = document.getElementById('pSum').value;
    basket_length = document.getElementById('basket_length').value;
    ID = document.getElementById('ID').value;
    if(basket_length>1){
        productNum = basket_length -1;
        oInfo.pName = document.getElementById('pName').value + ' 외 ' + productNum + '개';
    } else {
        oInfo.pName = document.getElementById('pName').value;
    }
    oInfo.email = document.getElementById('email').value;
    const IMP = window.IMP;
    IMP.init("imp15169128"); // 발급받은 "가맹점 식별코드"를 사용

    IMP.request_pay({
        pg : 'kakaopay', // version 1.1.0부터 지원.
        pay_method : 'card',
        merchant_uid : 'merchant_' + new Date().getTime(),      // 주문번호
        name : oInfo.pName,
        amount : oInfo.price,
        buyer_email : oInfo.email, //mEmail,
        buyer_name : oInfo.oName,
        buyer_tel : oInfo.phone,
        buyer_addr : oInfo.addr,
        buyer_postcode : oInfo.postnum
    }, function(rsp) {
        if ( rsp.success ) {
            let data = {
                oName : oInfo.pName,
                buyer_email : oInfo.email, //mEmail,
                buyer_name : oInfo.oName,
                basket_length : basket_length,
                phonenum : oInfo.phone,
                addr : oInfo.addr,
                ID : ID,
                Sum : oInfo.price,
            };
        for(let i=0;i<basket_length;i++){
                data['pIdx'+i] = document.getElementById('pIdx'+i).value;
                data['pQuantity'+i] = document.getElementById('pQuantity'+i).value;
        }
                jQuery.ajax({
                        url:"/order_create",
                        type :"post",
                        data : data,
                        dataType : "text"
                }).done(function(data){
                        var msg = '결제가 완료되었습니다.\n';
                        msg += '고유ID : ' + rsp.imp_uid;
                        msg += '\n상점 거래ID : ' + rsp.merchant_uid;
                        msg += '\n결제 금액 : ' + rsp.paid_amount;
                })
        } else {
            var msg = "결제 실패";
            msg += rsp.error_msg + '.';
        }
        if(msg!=undefined){
            alert(msg);
        } else {
            var msg = '결제가 완료되었습니다.\n';
            msg += '고유ID : ' + rsp.imp_uid;
            msg += '\n상점 거래ID : ' + rsp.merchant_uid;
            msg += '\n결제 금액 : ' + rsp.paid_amount;
            alert(msg);
            window.location.href="/order_detail/1";
        }
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