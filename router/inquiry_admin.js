function showDetails(index) {
    const lNum = index;
    if(document.getElementById('inquiry-details'+lNum).style.display === 'table-row')
        document.getElementById('inquiry-details'+lNum).style.display = 'none';
    else document.getElementById('inquiry-details'+lNum).style.display = 'table-row';
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