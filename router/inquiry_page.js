function check() {
    const confirm_cancel = confirm('문의를 등록하시겠습니까?');

    if(confirm_cancel){
        alert('등록되었습니다.');
        location.reload();
        return true;
    }
    else return false;
}

function cancel() {
    const confirm_cancel = confirm('문의 등록을 취소하시겠습니까?');
    if(confirm_cancel){
        alert('문의 등록을 취소하셨습니다.');
        location.reload();
    }
}