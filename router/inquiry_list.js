function showDetails(index) {
    const lNum = index;
    if(document.getElementById('inquiry-details'+lNum).style.display === 'table-row')
        document.getElementById('inquiry-details'+lNum).style.display = 'none';
    else document.getElementById('inquiry-details'+lNum).style.display = 'table-row';
}