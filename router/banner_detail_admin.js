function delete_check(){
    if(confirm("해당 이벤트/공지사항을 정말 삭제하시겠습니까?")){
        //확인 버튼 클릭 시 이벤트
        alert("삭제되었습니다.");
        window.location.href="/views/banner_list_admin.html"
    }
}