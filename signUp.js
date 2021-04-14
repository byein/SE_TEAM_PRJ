function check() {
    var objName = document.getElementById("userName");//이름 id
    var regname = /^[가-힣]{2,}$/; //이름에 사용할 정규 표현식

    if (!IdPwCheck()) { //아이디 비밀번호 검사
        return false;
    } else if (!EmailCheck()) { //이메일 검사
        return false;
    } else if (!regname.test(objName.value)) { //이름 검사
        alert("이름을 잘못 입력하셨습니다.");
        return false;
    } else { //유효성 검사 완료시 회원가입 진행
        alert("회원가입이 완료되었습니다.");
        return true;
    }
}

function IdPwCheck() {
    var objId = document.getElementById("userid"); //아이디 id
    var objPw = document.getElementById("userpw"); //비밀번호 id
    var objPwCheck = document.getElementById("userpwcheck"); //비밀번호확인id
    var regId = /^[a-zA-Z0-9]{5,20}$/; //아이디에 사용할 정규표현식
    var regPw = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/; //비밀번호에 사용할 정규표현식

    if (objId.value == "") { //ID가 공백일 경우 false 반환
        alert("ID를 입력해 주세요.");
        return false;
    } else if (!regId.test(objId.value)) { //아이디의 값을 검사해 true or false 반환
        alert("ID를 5~20자의 영문 대소문자와 숫자로만 입력해주세요.");
        objId.value == "";
        return false;
    } else if (objPw.value == "") {
        alert("PW를 입력해 주세요.");
        return false;
    } else if (objPwCheck == "") {
        alert("비밀번호 확인을 입력해 주세요.");
        return false;
    } else if (objPw.value != objPwCheck.value) { //비밀번호 확인이 다를 경우 false 반환
        alert("비밀번호와 비밀번호 확인이 다릅니다.");
        return false;
    } else if (objPw.value == objId.value) { //아이디 비밀번호가 같을 경우 false 반환
        alert("아이디와 비밀번호를 다르게 만들어주세요.");
        return false;
    } else if (!regPw.test(objPw.value)) { //비밀번호 정규표현식 검사
        alert("비밀번호를 8자 이상의 영문 대소문자와 숫자, 특수문자를 1자 이상 사용하여 입력해주세요.");
        return false;
    } else {
        return true;
    }
} //Id/Pw 검사 end

function EmailCheck() { //이메일 확인 함수
    var objEmail = document.getElementById("usermail"); //usermail text 할당
    var regEmail = /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!regEmail.test(objEmail.value)) { //이메일 값을 정규표현식과 비교하여 true or false 반환
        alert("이메일을 다시 입력해주세요.");
        return false;
    } else { //검사 통과시 true 반환
        return true;
    }
} //이메일 검사 end
