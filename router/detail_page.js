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
    return true;

  } else {
    //
    return false;
  }
}

function init() {
   /////////////이름 마스킹 js
   var tr = document.getElementById("review_table").getElementsByTagName("tr");
   console.log(tr.length);
   let maskingFunc = {
     checkNull : function (str){ 
       if(typeof str == "undefined" || str == null || str == ""){ 
         return true; 
       } else{ 
         return false; 
       } 
     },
   
     name : function(str){ 
       let originStr = str; 
       let maskingStr; 
       let strLength; 
       if(this.checkNull(originStr) == true){ 
         return originStr; 
       } 
       
       strLength = originStr.length; 
       
       if(strLength < 3){ 
         maskingStr = originStr.replace(/(?<=.{1})./gi, "*"); 
       }else { 
         maskingStr = originStr.replace(/(?<=.{2})./gi, "*"); 
       } 
       
       return maskingStr; 
     }
   }
   for (var i = 1; i < tr.length; i++) {
     var tds = tr[i].getElementsByTagName("td");
     var uid = tds[4];
     tds[4].firstChild.textContent = maskingFunc.name(uid.textContent);
   }
   //////////////이름 마스킹 종료

   
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
  if(s_count < count) {
    clearInterval(s_itv);
    s_count++;
    S_ani_R();
    slide_bt_L.style.display = "block";
  }
  if(s_count == count-1) {
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
    slide_bt_R.style.display = "block";
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



////////////이름 마스킹 작업 js
/*
let maskingFunc = {
  checkNull : function (str){ 
    if(typeof str == "undefined" || str == null || str == ""){ 
      return true; 
    } else{ 
      return false; 
    } 
  },

  name : function(str){ 
    let originStr = str; 
    let maskingStr; 
    let strLength; 
    if(this.checkNull(originStr) == true){ 
      return originStr; 
    } 
    
    strLength = originStr.length; 
    
    if(strLength < 3){ 
      maskingStr = originStr.replace(/(?<=.{1})./gi, "*"); 
    }else { 
      maskingStr = originStr.replace(/(?<=.{2})./gi, "*"); 
    } 
    
    return maskingStr; 
  }
}

/////////////////처음 페이지 로드 시 마스킹 작업 실행
document.addEventListener('DOMContentLoaded', function() {
  var tr = document.getElementById("review_table").getElementsByTagName("tr");
  console.log(tr.length);

  for (var i = 0; i < tr.length; i++) {
    var tds = tr[i].getElementsByTagName("td");
    var uid = tds[4].firstChild;
    tds[4].firstChild.textContent = maskingFunc.name(uid.textContent);
  }
}, false);
*/

{/* </script> */}
