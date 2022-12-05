const { default: fetch } = require('node-fetch');
const fs = require('fs');
const config = require('./config/config');
const date = require('date-and-time');
const handler = require('./events/changeHandler')
var odiff = require('odiff');

let clientCache;

//Global variables
let timetable_body;
let timetableday_body;
let timetable_body_n;

let timetable_data;
let timetable_data_n;
let tttoday;

//Run post request every 30 mins
 async function getData(client){

    clientCache = client;

    console.log("Function getData() called!");

    //Read body placeholders for post request
     timetable_body = JSON.parse(fs.readFileSync('./config/timetable-body.json', 'utf8'));
     timetableday_body = JSON.parse(fs.readFileSync('./config/timetable-body-today.json', 'utf8'));
     timetable_body_n = JSON.parse(fs.readFileSync('./config/timetable-body-n.json', 'utf8'));
    
     //Configure body date & etc
     await configureBody();
    
    //Get data for this week
    response = await fetch('https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', {
        method: 'post',
        body: JSON.stringify(timetable_body),
        headers: {'Content-Type': 'application/json'}
    });
    timetable_data = await response.json();

    //Get data for next week
    response = await fetch('https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', {
        method: 'post',
        body: JSON.stringify(timetable_body_n),
        headers: {'Content-Type': 'application/json'}
    });
    timetable_data_n = await response.json();

    //Get data for today
    response = await fetch('https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', {
        method: 'post',
        body: JSON.stringify(timetableday_body),
        headers: {'Content-Type': 'application/json'}
    });
    tttoday = await response.json();

    //Try to parse and save data into json files
    if(parseRawData()){

        return true;

    }else {

        return false;

    }
}

//Set interval for function loop
setInterval(getData, config.delay.post_request);


//Function for body configuration
async function configureBody(){

    console.log("Function configureBody() called!");

    //Get current date
    const now = date.format(new Date(), 'YYYY-MM-DD');
    timetableday_body.__args[1].datefrom = now;
    timetableday_body.__args[1].dateto = now;

    //Prepare  for this and next week
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
            
            //Set values into objects
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

        //Set wariables into objects
        timetable_body.__args[1].datefrom = start; 
        timetable_body.__args[1].dateto = end; 

        timetable_body_n.__args[1].datefrom = start2; 
        timetable_body_n.__args[1].dateto = end2;
    }

    try{

        //Try to save data into json files
        fs.writeFileSync('./config/timetable-body-today.json', JSON.stringify(timetableday_body, null, "\t"));
        fs.writeFileSync('./config/timetable-body.json', JSON.stringify(timetable_body, null, "\t"));
        fs.writeFileSync('./config/timetable-body-n.json', JSON.stringify(timetable_body_n, null, "\t"));

        //Saving sucessfully done
        console.log("Succes while configuring body");

      }catch(err){

        //Saving un-sucessfully done
        console.log("Error while configuring body");
        console.log(err);

      } 
}

//Function for parsing raw data from response (post request)
async function parseRawData(){

    try{

    //Define variables
    const timetable_today = {};
    const timetable_week = {}
    const timetable_next_week = {}
    var key = 'class'
    timetable_today[key] = []
    timetable_week[key] = []
    timetable_next_week[key] = []

    //Parsing for today
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

    //Parsing for next week
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

    //Parsing for this week
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

    //Get old data, and difference
    var old = JSON.parse(fs.readFileSync('./data/timetable_week.json', 'utf-8'));
    var diff = odiff(old, timetable_week);
  
    //Check if there are changes in timetable
    if(Object.entries(diff).length === 0){

        //No changes, do not triggen nothing
        console.log("No changes, staying silent!")

    }else {

        console.log("Changes detected, calling event handler");

        //Handling changes
        handler.handleEvent(diff, old, timetable_week);

        //Write new data to storage
        fs.writeFileSync('./data/timetable_week.json', JSON.stringify(timetable_week, null, "\t"));
    }

    }catch(err){

    //Handle error
    console.log("An error occured " + err);
    return false;

    }
}

module.exports = {
    getData
};