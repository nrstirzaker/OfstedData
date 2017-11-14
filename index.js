const csv = require('csv-parser');
const fs = require('fs');
const moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";


var schools = [];
fs.createReadStream('data/Management information - Schools - 31 May 2014.csv')
    .pipe(csv())
    .on('data', function (data) {

        if (data['Local Authority'] === 'Surrey'){

            var schoolInspection = {};

            schoolInspection.urn = data.urn;
            schoolInspection.schoolName = data['School name'];

            var rawDate = data['Latest inspection date'];
            schoolInspection.inspectionDate = rawDate;
            let dateAsId = moment(rawDate,'DD/MM/YYYY').format( 'YYYYMMDD');
            schoolInspection.id = data.urn + "-" + dateAsId;
            
            schoolInspection.overallRate = codeToRating(data);

            console.log('schoolInspection:' +  JSON.stringify( schoolInspection ) );
            schools.push( schoolInspection );
        }
    
})

function codeToRating( data ){

    var code = getRatingCode( data )

    var rating = "";

    switch(code) {
        case 1:
            rating = 'Outstanding';
            break;
        case 2:
            rating = 'Good';
            break;
        case 3:
            rating = 'Requires Improvement';
            break;
        case 4:
            rating = 'Inadequate';
            break;
        default:
            console.log("code: " + code);
            rating = "WFT"
    }
    return rating;
}


function getRatingCode(data){

    var oldFormatOE = data['Overall effectiveness: how good is the school'];
    var newFormatOE = data['Overall effectiveness'];

    return parseInt( oldFormatOE  || newFormatOE );

}

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    for (var i = 0 ; i < schools.length ; i++){

        var school = schools[ i ];
        db.collection("schools").insertOne(school, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });
    }

  });