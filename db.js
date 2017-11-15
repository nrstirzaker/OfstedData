var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var db = function(){

    function loadData(schools){

        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            for (var i = 0 ; i < schools.length ; i++){
        
                var school = schools[ i ];
                if ( !db.collection("schools").find({id: school.id}).limit(1)){
                    db.collection("schools").insertOne(school, function(err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");
                        db.close();
                      });
                }
            }
        
          });
    
    };

    return{
        loadData : loadData
    }



}();


exports.loadData = db.loadData;

