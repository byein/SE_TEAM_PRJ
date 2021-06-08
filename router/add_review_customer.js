function check() {
    if (!check_recommand()) {
        return false;
    } else if (!check_delivery()) {
        return false;
    } else if (!check_review_score()) {
        return false;
    } else if (!check_review()) {
        return false;
    } else {
        alert("상품평이 성공적으로 등록되었습니다.");
        return true;
    }

}


function check_recommand(){
    var recommand = document.getElementById("recommand");

    if(recommand.value == "none") {
        alert("추천 정도를 선택해 주세요.");
        return false;
    } else {
        return true;
    }
}
function check_delivery(){
    var delivery_evaluation = document.getElementById("delivery_evaluation");

    if(delivery_evaluation.value == "none") {
        alert("배달 평가를 선택해 주세요.");
        return false;
    } else {
        return true;
    }
}
function check_review_score() {
    var starrate = document.getElementsByName("rPoint");
    var type_cnt = 0;
    for(var i = 0; i < starrate.length; i++){
        if(starrate[i].checked == true)
            type_cnt++;
    }

    if(starrate[0].value=="none"){
        alert("별점을 입력해 주세요.");
        return false;
    } else {
        return true;
    }
}

function check_review() {
    var review = document.getElementById("review");
    var lengthCheck = /^.{80,}$/;
    if (review.value == "") {
        alert("후기를 입력해 주세요.");
        return false;
    } else if(lengthCheck.test(review.value)){
        alert("후기는 80자 이내로 작성해 주세요.");
        return false;
    } else {
        return true;
    }
}