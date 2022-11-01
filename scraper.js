const { default: fetch } = require('node-fetch');
const fs = require('fs');
const config = require('./config/config');
const date = require('date-and-time');

let timetable_body;
let teacher_body;
let timetableday_body;

let timetable_data;
let tttoday;


//Run post request every 30 mins
 async function getData(){

    console.log("Function getData() called!");
 
     const start = date.format(new Date("2022-10-24"), 'YYYY-MM-DD');
     const end = date.format(new Date("2022-10-30"), 'YYYY-MM-DD');

     timetable_body = JSON.parse(fs.readFileSync('./config/timetable-body.json', 'utf8'));
     teacher_body = JSON.parse(fs.readFileSync('./config/teacher-body.json', 'utf8'));
     timetableday_body = JSON.parse(fs.readFileSync('./config/timetable-body-today.json', 'utf8'));

     await configureBody();
          
    response = await fetch('https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', {
        method: 'post',
        body: JSON.stringify(timetable_body),
        headers: {'Content-Type': 'application/json'}
    });
    timetable_data = await response.json();
    response = await fetch('https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', {
        method: 'post',
        body: JSON.stringify(timetableday_body),
        headers: {'Content-Type': 'application/json'}
    });
    tttoday = await response.json();
    if(parseRawData()){
        return true;
    }else {
        return false;
    }
}
setInterval(getData, config.delay.post_request);

async function configureBody(){
    console.log("Function configureBody() called!");
    const now = date.format(new Date(), 'YYYY-MM-DD');
    timetableday_body.__args[1].datefrom = now;
    timetableday_body.__args[1].dateto = now;
    try{
        fs.writeFileSync('./config/timetable-body-today.json', JSON.stringify(timetableday_body, null, "\t"));
        console.log("Succes while configuring body");
      }catch(err){
        console.log("Error while configuring body");
        console.log(err);
      }
    
}

async function parseRawData(){

    if(fs.existsSync('./data/timetable_today.json') && fs.existsSync('./data/timetable_week.json')){
        console.log("Found old files, renaming it!")
        fs.renameSync('./data/timetable_today.json', './data/timetable_today_old.json');
        fs.renameSync('./data/timetable_week.json', './data/timetable_week_old.json');

    }else {
        console.log("Old files not forund!")
    }
    try{
    const timetable_today = {};
    const timetable_week = {}
    var key = 'class'
    timetable_today[key] = []
    timetable_week[key] = []

    tttoday.r.ttitems[0];
    tttoday.r.ttitems.forEach(function(entry) {
        var timetable_data = {

            starttime: entry.starttime,
            endtime: entry.endtime,
            date: entry.date,
            name: entry.name,
            teacher: entry.teacherids[0],
            classroom: entry.classroomids[0]

        }
        timetable_today[key].push(timetable_data);
    });
    fs.writeFileSync('./data/timetable_today.json', JSON.stringify(timetable_today, null, "\t"));

    timetable_data.r.ttitems[0];
    timetable_data.r.ttitems.forEach(function(entry) {
        var timetable_data = {

            starttime: entry.starttime,
            endtime: entry.endtime,
            date: entry.date,
            name: entry.name,
            teacher: entry.teacherids[0],
            classroom: entry.classroomids[0]
            
        }
        timetable_week[key].push(timetable_data);
    });
    fs.writeFileSync('./data/timetable_week.json', JSON.stringify(timetable_week, null, "\t"));
    console.log("Parsing successfull!")
    return true;
}catch(err){
    console.log("An error occured " + err);
    return false;
}
    
}
module.exports.getData = getData;