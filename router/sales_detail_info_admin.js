window.onload = function(){
    addRow();
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
}

//이 함수 설정 시 동적 행 추가 가능할 겁니다.
function addRow() {
    var table = document.getElementById("sales_detail_list");

    /**sales_count = 상품 종류 수*/
    for(var i=0;i<sales_count;i++){
        var newRow = table.insertRow();

        var sales_product = newRow.insertCell(0);   //상품목록
        var sales_product_count = newRow.insertCell(1); //상품개수
        var sales_product_price = newRow.insertCell(2); //상품금액

        //이 부분은 잘 전달되는지 콘솔로 확인하려고 추가했습니다.
        console.log(sales_product);
        console.log(sales_product_count);
        console.log(sales_product_price);

        //이 부분 값을 데이터 배열로 설정하면 될 것 같습니다.
        sales_product.innerHTML = "박스티";
        sales_product_count.innerHTML = "2";
        sales_product_price.innerHTML = "30,000원";

    }

    //////db 데이터들 아래 형식처럼 추가하면 됩니다.
    /*
    sales_product.innerHTML = "박스티";
    sales_count.innerHTML = "2";
    sales_product_price.innerHTML = "30,000원";
    */
}