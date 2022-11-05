const { default: fetch } = require('node-fetch');
const fs = require('fs');
const config = require('./config/config');
const date = require('date-and-time');

let timetable_body;
let timetableday_body;
let timetable_body_n;

let timetable_data;
let timetable_data_n;
let tttoday;


//Run post request every 30 mins
 async function getData(){

    console.log("Function getData() called!");

     timetable_body = JSON.parse(fs.readFileSync('./config/timetable-body.json', 'utf8'));
     timetableday_body = JSON.parse(fs.readFileSync('./config/timetable-body-today.json', 'utf8'));
     timetable_body_n = JSON.parse(fs.readFileSync('./config/timetable-body-n.json', 'utf8'));

     await configureBody();
          
    //This week 
    response = await fetch('https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', {
        method: 'post',
        body: JSON.stringify(timetable_body),
        headers: {'Content-Type': 'application/json'}
    });
    timetable_data = await response.json();

    //Next week
    response = await fetch('https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', {
        method: 'post',
        body: JSON.stringify(timetable_body_n),
        headers: {'Content-Type': 'application/json'}
    });
    timetable_data_n = await response.json();

    //Today
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

    if (new Date().getDay() == 0){
            //Sunday

            //Current week
            let start = date.format(new Date(), 'YYYY-MM-DD');
            let endunf = date.addDays(new Date(), 6)
            let end = date.format(endunf, 'YYYY-MM-DD');

            //Next week
            let start2unf = new Date();
            let end2unf = date.addDays(start2unf, 6);

            let start2 = date.format(start2unf, 'YYYY-MM-DD');
            let end2 = date.format(end2unf, 'YYYY-MM-DD');
            

            timetable_body_n.__args[1].datefrom = start2; 
            timetable_body_n.__args[1].dateto = end2; 

            timetable_body.__args[1].datefrom = start; 
            timetable_body.__args[1].dateto = end; 

    }else {
        //Every other day
        let day = new Date().getDay() / -1;
        
        //This week
        let startunf = date.addDays(new Date(), day);
        let start = date.format(startunf, 'YYYY-MM-DD');

        let endunf = date.addDays(startunf, 6)
        let end = date.format(endunf, 'YYYY-MM-DD');

        //Next week
        let start2unf = date.addDays(startunf, 7);
        let end2unf = date.addDays(endunf, 7);

        let start2 = date.format(start2unf, 'YYYY-MM-DD');
        let end2 = date.format(end2unf, 'YYYY-MM-DD');

        timetable_body.__args[1].datefrom = start; 
        timetable_body.__args[1].dateto = end; 

        timetable_body_n.__args[1].datefrom = start2; 
        timetable_body_n.__args[1].dateto = end2;
    }
    
    try{

        fs.writeFileSync('./config/timetable-body-today.json', JSON.stringify(timetableday_body, null, "\t"));
        fs.writeFileSync('./config/timetable-body.json', JSON.stringify(timetable_body, null, "\t"));
        fs.writeFileSync('./config/timetable-body-n.json', JSON.stringify(timetable_body_n, null, "\t"));

        console.log("Succes while configuring body");

      }catch(err){

        console.log("Error while configuring body");
        console.log(err);

      }
    
}

async function parseRawData(){
    //TODO problem
    if(fs.existsSync('./data/timetable_today.json') && fs.existsSync('./data/timetable_week.json') && fs.existsSync('./data/timetable_next_week.json')){

        console.log("Found old files, renaming it!")

        fs.renameSync('./data/timetable_today.json', './data/timetable_today_old.json');
        fs.renameSync('./data/timetable_week.json', './data/timetable_week_old.json');
        fs.renameSync('./data/timetable_next_week.json', './data/timetable_next_week_old.json');

    }else {
        console.log("Old files not forund!")
    }
    try{
    const timetable_today = {};
    const timetable_week = {}
    const timetable_next_week = {}
    var key = 'class'
    timetable_today[key] = []
    timetable_week[key] = []
    timetable_next_week[key] = []

    //Today
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

    //Next week
    timetable_data_n.r.ttitems[0];
    timetable_data_n.r.ttitems.forEach(function(entry) {
        var timetable_data = {

            starttime: entry.starttime,
            endtime: entry.endtime,
            date: entry.date,
            name: entry.name,
            teacher: entry.teacherids[0],
            classroom: entry.classroomids[0]
            
        }
        timetable_next_week[key].push(timetable_data);
    });
    fs.writeFileSync('./data/timetable_next_week.json', JSON.stringify(timetable_next_week, null, "\t"));

    //This week
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
async function parseRawDataToVariable(json){
    const timetable = {};
    var key = 'class'
    timetable[key] = []

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

    return timetable

}
async function getDayTT(date){
    let dayTT;
    let body = {
        "__args": [
            null,
            {
                "year": config.year,
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
    response = await fetch('https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    });

    tttoday = await response.json();
    return await parseRawDataToVariable(tttoday);
}
module.exports = {
    getData,
    getDayTT
};