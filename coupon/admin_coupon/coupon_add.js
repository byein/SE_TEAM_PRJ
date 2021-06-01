// $(function() {
//     // 금액할인 적용 시 %할인 비활성화
//     $(document).on("change", "select[name=coupon_name]", function(){
//         var value = $(this).find("option:selected").val();
//         var inputNumber1 = $(this).closest('.selectBox').find('#cdisper');
//         var inputNumber3 = $(this).closest('.selectBox').find('#climit')
//         var flag = false;
//         if(value == 0) {
//             flag = true;
//             $(inputNumber1).val('');
//             $(inputNumber3).val('');

//         }

//         $(inputNumber1).attr("disabled", flag);
//         $(inputNumber3).attr("disabled", flag);
//     });

//     // %할인 적용 시 금액할인 비활성화
//     $(document).on("change", "select[name=coupon_name]", function(){
//         var value = $(this).find("option:selected").val();
//         var inputNumber2 = $(this).closest('.selectBox').find('#cdiscash')
//         var flag = false;
//         if(value ==1){
//             flag = true;
//             $(inputNumber2).val('');
//         }

//         $(inputNumber2).attr("disabled", flag);

//     });
// })

