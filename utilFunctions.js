/*       Util functions file        */
const fs = require('fs');
const { default: fetch } = require('node-fetch');

//Function for parsing json into regular variable
async function parseRawDataToVariable(json){

         const timetable = {};
         var key = 'class'
         timetable[key] = []
     
         //Loop trought all items in json object
         json.r.ttitems[0];
         json.r.ttitems.forEach(function(entry) {
             var timetable_data = {
     
                 starttime: entry.starttime,
                 endtime: entry.endtime,
                 date: entry.date,
                 name: entry.name,
                 teacher: entry.teacherids[0],
                 classroom: entry.classroomids[0]
     
             }
             timetable[key].push(timetable_data);
         });
     
         return timetable;
     
}

//Function for getting timetable data for specific date
async function getDayTT(date){

         //Request body
         let body = {
             "__args": [
                 null,
                 {
                     "year": new Date().getFullYear(),
                     "datefrom": date,
                     "dateto": date,
                     "table": "classes",
                     "id": "-53",
                     "showColors": true,
                     "showIgroupsInClasses": false,
                     "showOrig": true,
                     "log_module": "CurrentTTView"
                 }
             ],
             "__gsh": "00000000"
         }
         
         //Post request response
         response = await fetch('https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', {
             method: 'post',
             body: JSON.stringify(body),
             headers: {'Content-Type': 'application/json'}
         });
         
         //Calling parser, and returning data
         tttoday = await response.json();
         return await parseRawDataToVariable(tttoday);
}

function getTeacher(id) {
         let teacherConf = JSON.parse(fs.readFileSync('./data/teacher.json', 'utf8'));
         let teacher = teacherConf.data_rows[id].short
         return teacher;
     
}

function getRoom(id) {
         let roomConf = JSON.parse(fs.readFileSync('./data/classroom.json', 'utf8'));
         let room = roomConf.data_rows[id].short
         return room;
     }
function getUptime() {

    var ut_sec = process.uptime();
    
    var ut_min = ut_sec / 60;
    var ut_hour = ut_min / 60;
    var ut_day = ut_hour / 24;

    ut_sec = Math.floor(ut_sec);
    ut_min = Math.floor(ut_min);
    ut_hour = Math.floor(ut_hour);
    ut_day = Math.floor(ut_day);

    ut_day = ut_day % 24;
    ut_hour = ut_hour % 60;
    ut_min = ut_min % 60;
    ut_sec = ut_sec % 60;

    let messgae = ut_day + " d " + ut_hour + " h " + ut_min + " m " + ut_sec + " s.";
    return messgae;
}

module.exports = {
         parseRawDataToVariable,
         getDayTT,
         getTeacher,
         getRoom,
         getUptime
}