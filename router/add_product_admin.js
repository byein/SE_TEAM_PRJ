function check() {
    if (!PRegDateCheck()) {
        return false;
    } else if (!PCategoryCheck()) {
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

function PCategoryCheck(){
    var objpMainCategory = document.getElementById("main_category");
    var objpSubCategory = document.getElementById("sub_category");


    if(objpMainCategory.value == "") {
        alert("메인 카테고리를 선택해 주세요.");
        return false;
    } else if(objpSubCategory.value == "") {
        alert("서브 카테고리를 선택해 주세요");
        return false
    } else {
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


$(document).ready(function() {
        
    //****************이부분은 DB로 셋팅하세요.
    //Main 카테고리 셋팅 (DB에서 값을 가져와 셋팅 하세요.)
    var mainCategoryArray = new Array();
    var mainCategoryObject = new Object();
    
    mainCategoryObject = new Object();
    mainCategoryObject.main_category_id = "1";
    mainCategoryObject.main_category_name = "상의";
    mainCategoryArray.push(mainCategoryObject);
    
    mainCategoryObject = new Object();
    mainCategoryObject.main_category_id = "2";
    mainCategoryObject.main_category_name = "하의";
    mainCategoryArray.push(mainCategoryObject);

    mainCategoryObject = new Object();
    mainCategoryObject.main_category_id = "3";
    mainCategoryObject.main_category_name = "원피스";
    mainCategoryArray.push(mainCategoryObject);

    mainCategoryObject = new Object();
    mainCategoryObject.main_category_id = "4";
    mainCategoryObject.main_category_name = "잡화";
    mainCategoryArray.push(mainCategoryObject);

    mainCategoryObject = new Object();
    mainCategoryObject.main_category_id = "5";
    mainCategoryObject.main_category_name = "악세서리";
    mainCategoryArray.push(mainCategoryObject);
    
    //Sub 카테고리 셋팅 (DB에서 값을 가져와 셋팅 하세요.)
    var subCategoryArray = new Array();
    var subCategoryObject = new Object();
    
    //상의에 해당하는 sub category 리스트
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "1";
    subCategoryObject.sub_category_id = "1"
    subCategoryObject.sub_category_name = "반팔"    
    subCategoryArray.push(subCategoryObject);
    
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "1";
    subCategoryObject.sub_category_id = "2"
    subCategoryObject.sub_category_name = "긴팔"    
    subCategoryArray.push(subCategoryObject);
    
    //하의에 해당하는 sub category 리스트
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "2";
    subCategoryObject.sub_category_id = "1"
    subCategoryObject.sub_category_name = "반바지"    
    subCategoryArray.push(subCategoryObject);
    
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "2";
    subCategoryObject.sub_category_id = "2"
    subCategoryObject.sub_category_name = "긴바지"    
    subCategoryArray.push(subCategoryObject);
    
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "2";
    subCategoryObject.sub_category_id = "3"
    subCategoryObject.sub_category_name = "치마"    
    subCategoryArray.push(subCategoryObject);
    
    //원피스에 해당하는 sub category 리스트
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "3";
    subCategoryObject.sub_category_id = "1"
    subCategoryObject.sub_category_name = "롱"    
    subCategoryArray.push(subCategoryObject);
    
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "3";
    subCategoryObject.sub_category_id = "2"
    subCategoryObject.sub_category_name = "숏"    
    subCategoryArray.push(subCategoryObject);
    
    //잡화에 해당하는 sub category 리스트
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "4";
    subCategoryObject.sub_category_id = "1"
    subCategoryObject.sub_category_name = "양말"    
    subCategoryArray.push(subCategoryObject);
    
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "4";
    subCategoryObject.sub_category_id = "2"
    subCategoryObject.sub_category_name = "가방"    
    subCategoryArray.push(subCategoryObject);
    
    //악세서리에 해당하는 sub category 리스트
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "5";
    subCategoryObject.sub_category_id = "1"
    subCategoryObject.sub_category_name = "목걸이"    
    subCategoryArray.push(subCategoryObject);
    
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "5";
    subCategoryObject.sub_category_id = "2"
    subCategoryObject.sub_category_name = "귀걸이"    
    subCategoryArray.push(subCategoryObject);
    
    subCategoryObject = new Object();
    subCategoryObject.main_category_id = "5";
    subCategoryObject.sub_category_id = "3"
    subCategoryObject.sub_category_name = "팔찌"    
    subCategoryArray.push(subCategoryObject);
    //****************이부분은 DB로 셋팅하세요.
    
    
    //메인 카테고리 셋팅
    var mainCategorySelectBox = $("select[name='main_category']");
    
    for(var i=0;i<mainCategoryArray.length;i++){
        mainCategorySelectBox.append("<option value='"+mainCategoryArray[i].main_category_id+"'>"+mainCategoryArray[i].main_category_name+"</option>");
    }
    
    //*********** 1depth카테고리 선택 후 2depth 생성 START ***********
    $(document).on("change","select[name='main_category']",function(){
        
        //두번째 셀렉트 박스를 삭제 시킨다.
        var subCategorySelectBox = $("select[name='sub_category']");
        subCategorySelectBox.children().remove(); //기존 리스트 삭제
        
        //선택한 첫번째 박스의 값을 가져와 일치하는 값을 두번째 셀렉트 박스에 넣는다.
        $("option:selected", this).each(function(){
            var selectValue = $(this).val(); //main category 에서 선택한 값
            subCategorySelectBox.append("<option value=''>전체</option>");
            for(var i=0;i<subCategoryArray.length;i++){
                if(selectValue == subCategoryArray[i].main_category_id){       
                    subCategorySelectBox.append("<option value='"+subCategoryArray[i].sub_category_id+"'>"+subCategoryArray[i].sub_category_name+"</option>");
                }
            }
        });        
    });
    //*********** 1depth카테고리 선택 후 2depth 생성 END ***********
        
});