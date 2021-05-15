var db = require('./db');

exports.in = function(request, response){ //alert가 안됨
        var post = request.body;
        db.query(`SELECT * FROM member WHERE mId=?`, [post.userid], function(error, results){
                        if (!results[0]){
                                console.log("아이디 또는 비밀번호가 일치하지 않습니다.");
                                response.redirect(`/login`); //두개의 response가 되는 문제 발생
                        } else if (post.userpw != results[0].mPwd){
                                console.log("비번 틀림");
                                response.redirect(`/login`);
                        } else if (error){
                                console.log(error);
                        } else {
                                console.log(results);
                                console.log(results[0]);
                                console.log(results[0].mId);
                                request.session.is_logined = true;
                                request.session.name = results[0].mName;
                                request.session.id = results[0].mId;
                                request.session.pw = results[0].mPwd;

                                request.session.save(function(){
                                        response.render('mainPage', {
                                                name    : results[0].mName,
                                                id      : results[0].mId,
                                                is_logined      : true
                                        });
                                });
                                response.redirect(`/`);
                        }
        });
}

function check() { //db.query가 안됨
    var objId = document.getElementById("userid");
    var objPw = document.getElementById("userpw");

    if(objId.value == ""){
            alert("ID를 입력해 주세요.");
            return false;
    } else if (objPw.value == ""){
            alert("PW를 입력해 주세요.");
            return false;
    } else {
            return true;
    }
}