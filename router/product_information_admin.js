function search_period_check() {
    var search_period_start = document.getElementById("search_start");
    var search_period_end = document.getElementById("search_end");

    search_period_start = new Date(search_period_start.value);
    var year_start = search_period_start.getFullYear();
    var month_start = search_period_start.getMonth() + 1;
    var date_start = search_period_start.getDate();

    search_period_end = new Date(search_period_end.value);
    var year_end = search_period_end.getFullYear();
    var month_end = search_period_end.getMonth() + 1;
    var date_end = search_period_end.getDate();

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
    } else if (year_start > year_end || month_start > month_end || date_start > date_end) {
        alert("시작 날짜가 종료 날짜보다 더 늦습니다. 시작 날짜와 종료 날짜가 유효한지 다시 확인해 주세요.");
        return false;
    } else {
        return true;
    }
}
function change_order_processing(id){

    var tr = document.getElementsByClassName("check_order");
    var tds = tr[id-1].getElementsByTagName("td");

    console.log(tr.length);

    var sales_date = tds[0].firstChild.data;
    var sales_product = tds[1].firstChild.data;
    var sales_processing_phase = tds[2].firstChild.data;
    var sales_price = tds[3].firstChild.data;
    var sales_processing_btn = tds[4].firstChild.value;

    console.log(sales_date);
    console.log(sales_product);
    console.log(sales_processing_phase);
    console.log(sales_price);
    console.log(sales_processing_btn);


    if(sales_processing_btn == "배송하기"){
        if(sales_processing_phase == "결제완료"){
            tds[2].firstChild.data = "배송중";
            tds[4].firstChild.value = "배송완료";

            return true;
        }else{
            return false;
        }
    }else if(sales_processing_btn == "배송완료"){
        if(sales_processing_phase == "배송중"){
            tds[2].firstChild.data = "배송완료";
            tds[4].firstChild.value = "상품평";
            return true;
        }else{
            return false;
        }
    }else if(sales_processing_btn == "상품평"){
        /*4차 요구사항에 나온 상품평 기능 추가*/
        return true;
    }else{
        return false;
    }
}
