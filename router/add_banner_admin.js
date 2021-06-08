function check() {
    if (!banner_title_check()) {
        return false;
    } else if (!banner_type_check()) {
        return false;
    } else if (!banner_period_start_check()) {
        return false;
    } else if (!banner_img_check()) {
        return false;
    } else {
        alert("상품이 성공적으로 등록되었습니다.");
        return true;
    }
}

function banner_title_check() {
    var banner_title = document.getElementById("banner_title");


    if (banner_title.value == "") {
        alert("배너의 제목을 입력해 주세요.");
        return false;
    } else {
        return true;
    }
}

function banner_type_check() {
    var banner_type = document.getElementsByName("nCat");
    var type_cnt = 0;
    for(var i = 0; i < banner_type.length; i++){
        if(banner_type[i].checked == true) 
            type_cnt++;
    }

    if(type_cnt<1){
        alert("배너 종류를 선택해 주세요.");
        return false;
    } else {
        return true;
    }
}

function banner_img_check() {
    var banner_img = document.getElementById("banner_img").value;

    var fileForm = /(.*?)\.(jpg|jpeg|png|gif|bmp|pdf)$/i;
    var maxSize = 5 * 1024 * 1024;
    var fileSize;

    if (banner_img == "") {
        alert("배너 이미지를 추가해 주세요.");
        return false;
    } else {
        fileSize = document.getElementById("banner_img").files[0].size;
        if (!fileForm.test(banner_img)) {
            alert("이미지 파일만 업로드 가능합니다.");
            return false;
        } else if (fileSize >= maxSize) {
            alert("파일 사이즈는 5MB까지 가능합니다.");
            return false;
        }
        return true;
    }
}
function banner_period_start_check() {
    var banner_period_start = document.getElementById("banner_period_start");
    var banner_period_end = document.getElementById("banner_period_end");

    banner_period_start = new Date(banner_period_start.value);
    var year_start = banner_period_start.getFullYear();
    var month_start = banner_period_start.getMonth() + 1;
    var date_start = banner_period_start.getDate();

    banner_period_end = new Date(banner_period_end.value);
    var year_end = banner_period_end.getFullYear();
    var month_end = banner_period_end.getMonth() + 1;
    var date_end = banner_period_end.getDate();

    if (isNaN(year_start) || isNaN(month_start) || isNaN(date_start)) {
        year_start = 0;
        month_start = 0;
        date_start = 0;
    }
    if (isNaN(year_end) || isNaN(month_end) || isNaN(date_end)) {
        year_end = 0;
        month_end = 0;
        date_end = 0;
    }

    if (year_start==0&&month_start==0&date_start==0) {
        alert("시작 날짜를 입력해 주세요.");
        return false;
    } else if (year_end==0&&month_end==0&date_end==0) {
        alert("종료 날짜를 입력해 주세요.");
        return false;
    } else if (year_start > year_end || ((year_start >= year_end) 
                && (month_start > month_end)) || ((year_start >= year_end)
                && (month_start >= month_end) && (date_start > date_end))) {
        alert("시작 날짜가 종료 날짜보다 더 늦습니다. 시작 날짜와 종료 날짜가 유효한지 다시 확인해 주세요.");
        return false;
    } else {
        return true;
    }
}
