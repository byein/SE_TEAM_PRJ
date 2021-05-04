function check() {
    if (!PRegDateCheck()) {
        return false;
    } else if (!PCodeCheck()) {
        return false;
    } else if (!PNameCheck()) {
        return false;
    } else if (!PPriceCheck()) {
        return false;
    } else if (!PCntCheck()) {
        return false;
    } else if (!PExplainCheck()) {
        return false;
    } else if (!PImgCheck()) {
        return false;
    } else {
        alert("상품이 성공적으로 등록되었습니다.");
        return true;
    }
}

function PCodeCheck() {
    var objpCode = document.getElementById("pcode");
    var regPCode = /^[A-Z]{2}[0-9]{4}$/;

    if (objpCode.value == "") {
        alert("상품 코드를 입력해 주세요.");
        return false;
    } else if (!regPCode.test(objpCode.value)) {
        alert("상품코드를 영문 대문자 2자 숫자 4자의 조합으로 만들어주세요. ex)AC1234");
        objpCode.value == "";
        return false;
    } else {
        return true;
    }
}
function PNameCheck() {
    var objpName = document.getElementById("pname");

    if (objpName.value == "") {
        alert("상품 이름를 입력해 주세요.");
        return false;
    } else {
        return true;
    }
}
function PImgCheck() {
    var objpImg = document.getElementById("pimg").value;

    var fileForm = /(.*?)\.(jpg|jpeg|png|gif|bmp|pdf)$/i;
    var maxSize = 5 * 1024 * 1024;
    var fileSize;

    if (objpImg == "") {
        alert("상품 이미지를 추가해 주세요.");
        return false;
    } else {
        fileSize = document.getElementById("pimg").files[0].size;
        if (!fileForm.test(objpImg)) {
            alert("이미지 파일만 업로드 가능합니다.");
            return false;
        } else if (fileSize >= maxSize) {
            alert("파일 사이즈는 5MB까지 가능합니다.");
            return false;
        }
        return true;
    }
}
function PPriceCheck() {
    var objpPrice = document.getElementById("pprice");
    var regPPrice = /^\d.?\d*$/;

    if (objpPrice.value == "") {
        alert("상품 가격을 입력해 주세요.");
        return false;
    } else if (!regPPrice.test(objpPrice.value)) {
        alert("상품 가격은 숫자로만 입력해 주세요.");
        objpCode.value == "";
        return false;
    } else {
        return true;
    }
}
function PCntCheck() {
    var objpCnt = document.getElementById("pcnt");

    if (objpCnt.value == "") {
        alert("상품 수량을 입력해 주세요.");
        return false;
    } else {
        return true;
    }
}
function PExplainCheck() {
    var objpExplain = document.getElementById("pexplain");

    if (objpExplain.value == "") {
        alert("상품 설명을 입력해 주세요.");
        return false;
    } else {
        return true;
    }
}
function PRegDateCheck() {
    var objpRegDate = document.getElementById("pregdate");

    objpRegDate = new Date(objpRegDate.value);
    var year = objpRegDate.getFullYear();
    var month = objpRegDate.getMonth() + 1;
    var date = objpRegDate.getDate();

    if (isNaN(year) || isNaN(month) || isNaN(date)) {
        year = 0;
        month = 0;
        date = 0;
    }

    var today = new Date();
    var todayYear = today.getFullYear();
    var todayMonth = today.getMonth() + 1;
    var todayDate = today.getDate();

    if (year==0&&month==0&date==0) {
        alert("등록 날짜를 입력해 주세요.");
        return false;
    } else if (todayYear != year || todayMonth != month || todayDate != date) {
        alert("등록 날짜는 오늘만 가능합니다.");
        objpRegDate.value == "";
        return false;
    } else {
        return true;
    }
}
