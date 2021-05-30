function showDetails() {
    if(document.getElementById('inquiry-details').style.display === 'table-row')
        document.getElementById('inquiry-details').style.display = 'none';
    else document.getElementById('inquiry-details').style.display = 'table-row';
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


// 미완성
function onDateCheck() {
    const from_date = new Date(document.getElementById('search-date-from').value);
    const to_date = new Date(document.getElementById('search-date-to').value);
    const today = new Date();


}