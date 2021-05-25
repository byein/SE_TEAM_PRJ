function delete_check(){
  if(confirm("해당 상품을 정말 삭제하시겠습니까?")){
      //확인 버튼 클릭 시 이벤트
      alert("삭제되었습니다.");
      return true;
  }
  return false;
}

{/* <script type="text/javascript"> */}
var slide = document.getElementById('slide_box');
var slide_bt_L = document.getElementById('left_bt');
var slide_bt_R = document.getElementById('right_bt');
var s_itv;
var s_count = 0;
var s_posX = 0;

var sell_price;
var amount;

function func_confirm() {
  if(confirm("장바구니에 담으시겠습니까?") == true) {
    // 확인
    alert("장바구니 담기 성공!")

  } else {
    //
    return;
  }
}


function init() {
  sell_price = document.form.sell_price.value;
  amount = document.form.amount.value;
  document.form.sum.value = sell_price;
  change();
}

function add() {
  hm = document.form.amount;
  sum = document.form.sum;
  hm.value++;

  sum.value = parseInt(hm.value) * sell_price;
}

function del() {
  hm = document.form.amount;
  sum = document.form.sum;
  if (hm.value > 1) {
    hm.value--;
    sum.value = parseInt(hm.value) * sell_price;
  }
}

function change() {
  hm = document.form.amount;
  sum = document.form.sum;

  if (hm.value < 0) {
    hm.value = 0;
  }
  sum.value = parseInt(hm.value) * sell_price;
}


slide_bt_R.addEventListener('click', function () {
  if (s_count < 4) {
    clearInterval(s_itv);
    s_count++;
    S_ani_R();
  }
  if (s_count == 3) {
    slide_bt_R.style.display = "none";
  } else {
    slide_bt_L.style.display = "block";
  }
});
function S_ani_R() {
  s_itv = setInterval(frame, 1);
  function frame() {
    if (s_posX == s_count * -500) {
      clearInterval(s_itv);
    } else {
      s_posX -= 5;
      slide.style.left = s_posX + "px";
    }
  }
}


slide_bt_L.addEventListener('click', function () {
  if (s_count > 0) {
    clearInterval(s_itv);
    s_count--;
    S_ani_L();
  }
  if (s_count == 0) {
    slide_bt_L.style.display = "none";
  } else {
    slide_bt_R.style.display = "block";
  }
});
function S_ani_L() {
  s_itv = setInterval(frame, 1);
  function frame() {
    if (s_posX == s_count * -500) {
      clearInterval(s_itv);
    } else {
      s_posX += 5;
      slide.style.left = s_posX + "px";
    }
  }
}

{/* </script> */}


