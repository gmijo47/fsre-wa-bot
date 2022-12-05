const utils = require('./../utilFunctions')
const process = require('process');
const fs = require('fs');
const pack = require('./../package.json')
const config = require('./../config/config');
const date = require('date-and-time');
let dataConf = JSON.parse(fs.readFileSync('./config/data.json', 'utf8'));

var days = ['Nedelja', 'Ponedeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota']


async function handleMessage(msgb, author, msg, group, chatid){
//Register group chanell
if (group){
         if (msgb == "!sub" && author == config.super_admin.id) {
 
             //Check if chanell is registered
 
             if (dataConf.group.id == "") {
 
                 //Not registered
                 dataConf.group.id = chatid._serialized
                 try {
 
                     fs.writeFileSync('config/data.json', JSON.stringify(dataConf, null, "\t"));
                     msg.react("✅")
                     msg.reply("✅ - Kanal registrovan!\n Obavještenja će stizati ovdje!")
 
                 } catch (err) {
 
                     msg.reply("❌ - Došlo je do problema\n Kanal nije registrovan!")
                     msg.react("❌");
                     console.log(err);
 
                 }
             } else {
 
                 //Registered
                 msg.reply("❌ - Neki kanal je već registrovan!\n Koristite !unregister za uklanjanje kanala.")
                 msg.react("❌");
 
             }
             return;
         } else if (msgb == "!sub" || msgb == "!unsub" && author != config.super_admin.id) {
 
             msg.reply("⛔ - Nemate dozvolu da izvršavate admin komande");
             msg.react("⛔")
 
         } else if (msgb == "!unsub" && author == config.super_admin.id) {
 
             //Unregister group chanell
             if (dataConf.group.id == "") {
 
                 //Chanell not registered
                 msg.reply("❌ - Došlo je do problema\n Kanal nije registrovan!");
                 msg.react("❌")
 
             } else {
 
                 //Chanell registered
                 dataConf.group.id = "";
                 try {
 
                     fs.writeFileSync('config/data.json', JSON.stringify(dataConf, null, "\t"));
                     msg.react("✅")
                     msg.reply("✅ - Kanal UNregistrovan!\n Obavještenja neće stizati više ovdje!")
 
                 } catch (err) {
 
                     msg.reply("❌ - Došlo je do problema\n Kanal nije UNregistrovan!")
                     msg.react("❌");
                     console.log(err);
 
                 }
             }
             return;
         }
     } else {
         //Private chats
         if (msgb.startsWith('!')) {
 
             if (msgb.split(" ").length > 1) {
 
                 //Multiple arg command
                 let args = new Array();
                 args = msgb.split(" ");
                 switch (args[0].replace("!", "")) {
                     case "rs":
                         {
 
                             //Check arg lenght
                             if (args.length == 2) {
 
                                 //Check if date is valid, and change format
                                 try {
 
                                     let clientDate = date.parse(args[1], "DD.MM.YYYY");
 
                                     if (clientDate instanceof Date && !isNaN(clientDate.valueOf())) {
 
                                         const message = [];
 
                                         let clientFormatData = date.format(clientDate, "YYYY-MM-DD");
                                         const data = await utils.getDayTT(clientFormatData);
                                         if (data.class.length == 0) {
 
                                             //No classes
                                             day = clientDate.getDay();
                                             var title = ("❇️ ```Raspored - " + days[day] + "``` ❇️\n" + "        " + date.format(clientDate, 'DD.MM.YYYY') + "\n\n");
                                             message.push(title);
                                             class_data = "*Nema sati za prikazati!* "
                                             message.push(class_data);
 
                                         } else {
 
                                             //Have classes
                                             day = date.parse(data.class[0].date, "YYYY-MM-DD").getDay();
                                             let i = 0;
                                             var title = ("❇️ ```Raspored - " + days[day] + "``` ❇️\n" + "        " + date.format(clientDate, 'DD.MM.YYYY') + "\n\n");
                                             message.push(title);
                                             data.class.forEach(function(entry) {
                                                 class_data = ("*" + data.class[i].name + "*\n" + " 🔸 Profesor: " + utils.getTeacher(data.class[i].teacher) + "\n 🕐 Početak: " + data.class[i].starttime + "\n 🕐 Kraj: " + data.class[i].endtime + "\n 🚪 Sala: " + utils.getRoom(data.class[i].classroom) + "\n\n\n");
                                                 message.push(class_data);
                                                 i++;
                                             });
 
                                         }
                                         msg.reply(message.join(" "));
 
                                     } else {
 
                                         msg.reply("❌ -Format datuma nevažeči\n Molimo koristite formad DD.MM.GGGG!")
                                         msg.react("❌");
 
                                     }
 
                                 } catch (err) {
 
                                     console.log("error " + err);
 
 
                                 }
                             } else {
 
                                 msg.reply("🆘 Previše argumenata !pomoć za pomoć");
                                 msg.react("🆘");
 
                             }
 
                             break;
 
                         }
                     default:
                         {
 
                             msg.reply("🆘 Nepoznata komanda, kucajte !pomoć za pomoć");
                             msg.react("🆘")
 
                         }
                 }
 
             } else {
 
                 //Single arg command
                 let day;
                 switch (msgb.substring(1, msgb.length)) {
                     case "rd":
                         {
                             const message = [];
                             let data = JSON.parse(fs.readFileSync(('./data/timetable_today.json')));
 
                             if (data.class.length == 0) {
 
                                 //No classes
                                 day = new Date().getDay();
                                 var title = ("❇️ ```Raspored - " + days[day] + "``` ❇️\n" + "        " + date.format(new Date(), 'DD.MM.YYYY') + "\n\n");
                                 message.push(title);
                                 class_data = "*Nema sati za prikazati!* "
                                 message.push(class_data);
 
                             } else {
 
                                 //Have classes
                                 day = date.parse(data.class[0].date, "YYYY-MM-DD").getDay();
                                 let i = 0;
                                 var title = ("❇️ ```Raspored - " + days[day] + "``` ❇️\n" + "        " + date.format(new Date(), 'DD.MM.YYYY') + "\n\n");
                                 message.push(title);
                                 data.class.forEach(function(entry) {
                                     class_data = ("*" + data.class[i].name + "*\n" + " 🔸 Profesor: " + utils.getTeacher(data.class[i].teacher) + "\n 🕐 Početak: " + data.class[i].starttime + "\n 🕐 Kraj: " + data.class[i].endtime + "\n 🚪 Sala: " + utils.getRoom(data.class[i].classroom) + "\n\n\n");
                                     message.push(class_data);
                                     i++;
                                 });
 
                             }
 
                             msg.reply(message.join(" "));
                             break;
                         }
                     case "rw":
                         {
                            
                            const message = [];
 
                            let data = JSON.parse(fs.readFileSync(('./data/timetable_week.json')));
                            let body = JSON.parse(fs.readFileSync(('./config/timetable-body.json')));
 
                            let starDateRaw = body.__args[1].datefrom
                            let endDateRaw = body.__args[1].dateto
 
                            let startDateUnp = date.parse(starDateRaw, 'YYYY-MM-DD');
                            let endDateUnp = date.parse(endDateRaw, 'YYYY-MM-DD');
 
                            var title = ("❇️     ```Tjedni raspored```     ❇️\n        " + date.format(startDateUnp, 'DD.MM.YYYY') + " - " + date.format(endDateUnp, 'DD.MM.YYYY') + "\n\n");
                            message.push(title);
 
                            for(let i = 1; i <= 6; i++){
 
                                     let dayTTUnp = date.addDays(startDateUnp, i);
                                     let dayTTPar = date.format(dayTTUnp, 'YYYY-MM-DD');
 
                                     let subMess = "";
                                     
                                     let dayCount = new Array();
                                     dayCount[i] = 0;
 
                                     subMess = "   *🟢 " + days[i] + "*\n\n";
 
                                     for(let k = 0; k < data.class.length; k++){
 
                                              if(dayTTPar == data.class[k].date){
                                                       
                                                       dayCount[i]++;
                                                       subMess += ("      " + data.class[k].name + "\n" + "        ⏲️ " + data.class[k].starttime + " do " + data.class[k].endtime + "\n\n");
                                                      
 
                                              
                                     //	class_data = ("*" + data.class[i].name + "*\n" + " 🔸 Profesor: " + utils.getTeacher(data.class[i].teacher) + "\n 🕐 Početak: " + data.class[i].starttime + "\n 🕐 Kraj: " + data.class[i].endtime + "\n 🚪 Sala: " + utils.getRoom(data.class[i].classroom) + "\n\n\n");
                                          }
 
                                     }
 
                                     if (dayCount[i] < 1){
                                              
                                              subMess = subMess + "        _Nema sati za prikazati_\n\n";
                                              subMess = subMess.replace("🟢 ", "🔴 ")
                                     
                                     }else {
                                              let clientDate = date.format(dayTTUnp, "DD.MM.YYYY");
                                              subMess += "        _Detalnije *!rs " + clientDate + "*_\n\n"
                                     }
 
                                     message.push(subMess);
                                     
                                     
                            }
                            /* ```Tjedni raspored```
                                15.11.2022  do 21.11.2022
 
                                  *Ponedeljak - 15.12.2022*
 
 
 */
                            msg.reply(message.join(" "));
                            break;
                         }
                     case "rw+":
                         {
                            const message = [];
 
                            let data = JSON.parse(fs.readFileSync(('./data/timetable_next_week.json')));
                            let body = JSON.parse(fs.readFileSync(('./config/timetable-body-n.json')));
 
                            let starDateRaw = body.__args[1].datefrom
                            let endDateRaw = body.__args[1].dateto
 
                            let startDateUnp = date.parse(starDateRaw, 'YYYY-MM-DD');
                            let endDateUnp = date.parse(endDateRaw, 'YYYY-MM-DD');
 
                            var title = ("❇️     ```Tjedni raspored```     ❇️\n        " + date.format(startDateUnp, 'DD.MM.YYYY') + " - " + date.format(endDateUnp, 'DD.MM.YYYY') + "\n\n");
                            message.push(title);
 
                            for(let i = 1; i <= 6; i++){
 
                                     let dayTTUnp = date.addDays(startDateUnp, i);
                                     let dayTTPar = date.format(dayTTUnp, 'YYYY-MM-DD');
 
                                     let subMess = "";
                                     
                                     let dayCount = new Array();
                                     dayCount[i] = 0;
 
                                     subMess = "   *🟢 " + days[i] + "*\n\n";
 
                                     for(let k = 0; k < data.class.length; k++){
 
                                              if(dayTTPar == data.class[k].date){
                                                       
                                                       dayCount[i]++;
                                                       subMess += ("      " + data.class[k].name + "\n" + "        ⏲️ " + data.class[k].starttime + " do " + data.class[k].endtime + "\n\n");
 
                                              
                                     //	class_data = ("*" + data.class[i].name + "*\n" + " 🔸 Profesor: " + utils.getTeacher(data.class[i].teacher) + "\n 🕐 Početak: " + data.class[i].starttime + "\n 🕐 Kraj: " + data.class[i].endtime + "\n 🚪 Sala: " + utils.getRoom(data.class[i].classroom) + "\n\n\n");
                                          }
 
                                     }
 
                                     if (dayCount[i] < 1){
                                              
                                              subMess = subMess + "        _Nema sati za prikazati_\n\n";
                                              subMess = subMess.replace("🟢 ", "🔴 ")
                                     
                                     }else {
                                              let clientDate = date.format(dayTTUnp, "DD.MM.YYYY");
                                              subMess += "        _Detalnije *!rs " + clientDate + "*_\n\n"
                                     }
 
                                     message.push(subMess);
                                     
                                     
                            }
                            /* ```Tjedni raspored```
                                15.11.2022  do 21.11.2022
 
                                  *Ponedeljak - 15.12.2022*
 
 
 */
                            msg.reply(message.join(" "));
                            break;
                         }
                     case "pomoć":
                         {
                             msg.reply("🆘 ```Pomoć - lista komandi``` 🆘\n\n      *!rd* - prikaz rasporeda za danas\n      *!rw* - prikaz rasporeda za tekuči tjedan\n      *!rw+* - prikaz rasporeda za nadolazeći tjedan\n      *!rs 01.01.2022* - pretraga rasporeda za određeni datum\n      *!info* - prikaz osnovnih informacija o botu\n")
                             break;
                         }
                     case "info":
                         {
                             msg.reply("ℹ️ ```Informacije o botu``` ℹ️\n\n      *👨‍💻 Autor:* " + pack.author + "\n      *📶 Verzija:* " + pack.version + "\n      *⏱️ Uptime:* " + utils.getUptime() + "\n      *💾 Memory usage:* " + Math.round((process.memoryUsage().rss / 1000000), 2) + "MB\n      *💻 OS:* " + (process.platform).toUpperCase() + "\n      *⚙️ RTE:* Node " + process.version + "\n      *📝 Opis:* " + pack.description + "\n")
                             break;
                         }
                     default:
                         {
 
                             msg.reply("🆘 Nepoznata komanda, kucajte !pomoć za pomoć");
                             msg.react("🆘")
 
                         }
                 }
             }
         } else {
             return;
         }
     }
}
module.exports = {
         handleMessage
}