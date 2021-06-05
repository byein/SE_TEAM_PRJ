function showDetails(index) {
    const lNum = 'inquiry-details'+index;
    if(document.getElementById(lNum).style.display === 'table-row')
        document.getElementById(lNum).style.display = 'none';
    else document.getElementById(lNum).style.display = 'table-row';
}

function saveAnswer() {
    const is_confirmed = confirm('답변을 등록하시겠습니까?');

    if(is_confirmed){
        alert('답변이 등록되었습니다.');
        location.reload();
        return true;
    }
    else return false;
}


// 간단한 유효성 검사
function onDateCheck() {
    const from_date = new Date(document.getElementById('search-date-from').value);
    const to_date = new Date(document.getElementById('search-date-to').value);
    const today = new Date();

    if(to_date===NULL || to_date > today) to_date = today;      // 끝 날짜가 설정되어있지 않거나 today보다 뒤인 끝날짜이면 today로 간주한다.
    if(from_date==NULL) from_date = today;                      // 시작날짜가 설정되어있지 않으면 today로 간주한다.

    if(from_date > to_date) {                   // 시작날짜가 끝날짜보다 더 뒤에 있으면 
        alert('기간 설정을 다시 해주세요.');
        return false; 
    }
    else return true;
}