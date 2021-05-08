
    var mysql = require('mysql'); // mysql 모듈 가져오기

    var connection = mysql.createConnection({
        host        :'127.0.0.1',
        user        :'root',
        password    :'1234',
        database    :'ShoppingMall'
    });

    connection.connect();

    let MAX;

    connection.query('SELECT count(*) FROM category', function(err, results){	
        if(err){
    	    console.log(error);
        }

        MAX = results;
        console.log(MAX);
    });

    var form = document.getElementById('category-ul');
    
    function returnCategory() {
        connection.query('SELECT main_name FROM category', function(err, results) {
            for(let i=0;i<MAX;i++) {
                console.log(results[i]);
                form.createElement('li'); 
                form.append(results[i]);
            }
        })
    }

export default returnCategory;