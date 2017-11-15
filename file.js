const csv = require('csv-parser');
const fs = require('fs');
const db = require('./db');
const moment = require('moment');

var file = function () {

    var loadFile = function (filename) {

        var schools = [];
        fs.createReadStream('data/' + filename)
            .pipe(csv())
            .on('data', function (data) {

                if (data['Local Authority'] === 'Surrey') {


                    var schoolInspection = createSchoolInspection( data );
                    schools.push(schoolInspection);
                }
    
            })
            .on('end', function(data){
                db.loadData(schools);
                console.log('loaded');
            })
                
    
}


function createSchoolInspection(data) {
    var schoolInspection = {};

    schoolInspection.urn = data.urn;
    schoolInspection.schoolName = data['School name'];

    var rawDate = data['Latest inspection date'];
    schoolInspection.inspectionDate = rawDate;
    let dateAsId = moment(rawDate, 'DD/MM/YYYY').format('YYYYMMDD');
    schoolInspection.id = data.urn + "-" + dateAsId;

    schoolInspection.overallRate = codeToRating(data);

    return schoolInspection;

}

function codeToRating(data) {

    var code = getRatingCode(data)

    var rating = "";

    switch (code) {
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

function getRatingCode(data) {

    var oldFormatOE = data['Overall effectiveness: how good is the school'];
    var newFormatOE = data['Overall effectiveness'];

    return parseInt(oldFormatOE || newFormatOE);

}
return {
    loadFile: loadFile
}

}();

exports.loadFile = file.loadFile;




