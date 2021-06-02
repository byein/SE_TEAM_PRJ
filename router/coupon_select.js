function check(){
    var radio = document.getElementsByName('select_coupon');
    var chk_cnt=0;
    for(var i=0;i<radio.length;i++){
            if(radio[i].checked==true) chk_cnt++;
    }
    if(chk_cnt<1){
            alert("쿠폰을 선택하세요");
            return false;
    }
}