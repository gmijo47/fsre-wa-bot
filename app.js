const qrcode = require('qrcode-terminal');
const scrp = require('./scraper')
const process = require('process');
const fs = require('fs');
const pack = require('./package.json')

const {
    Client,
    LocalAuth
} = require('whatsapp-web.js');
const config = require('./config/config');
const date = require('date-and-time');
let dataConf = JSON.parse(fs.readFileSync('./config/data.json', 'utf8'));

var days = ['Nedelja', 'Ponedeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota']
var starttime = new Date()
    //Create client with local auth
const client = new Client({
    authStrategy: new LocalAuth()
},
{puppeteer: {args: ["--no-sandbox"]}});

//Generate qr code for sign in
client.on('qr', qr => {
    qrcode.generate(qr, {
        small: true
    });
});

//When client ready scrape data from timetable
client.on('ready', () => {
    console.log('Client is ready!');
    if (scrp.getData()) {
        console.log("Raw data is writed, proceeding to parse");

    } else {
        console.log("Raw data isn't writed, aborting parsing");
    }
});

//Client commands
client.on('message', async(msg) => {

    const chat = await msg.getChat();

    //Register group chanell
    if (chat.isGroup) {
        if (msg.body == "!sub" && msg.author == config.super_admin.id) {

            //Check if chanell is registered

            if (dataConf.group.id == "") {

                //Not registered
                dataConf.group.id = chat.id._serialized;
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
        } else if (msg.body == "!sub" || msg.body == "!unsub" && msg.author != config.super_admin.id) {

            msg.reply("⛔ - Nemate dozvolu da izvršavate dev komande");
            msg.react("⛔")

        } else if (msg.body == "!unsub" && msg.author == config.super_admin.id) {

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
        if (msg.body.startsWith('!')) {

            if (msg.body.split(" ").length > 1) {

                //Multiple arg command
                let args = new Array();
                args = msg.body.split(" ");
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
                                        const data = await scrp.getDayTT(clientFormatData);
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
                                                class_data = ("*" + data.class[i].name + "*\n" + " 🔸 Profesor: " + getTeacher(data.class[i].teacher) + "\n 🕐 Početak: " + data.class[i].starttime + "\n 🕐 Kraj: " + data.class[i].endtime + "\n 🚪 Sala: " + getRoom(data.class[i].classroom) + "\n\n\n");
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
                switch (msg.body.substring(1, msg.body.length)) {
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
                                    class_data = ("*" + data.class[i].name + "*\n" + " 🔸 Profesor: " + getTeacher(data.class[i].teacher) + "\n 🕐 Početak: " + data.class[i].starttime + "\n 🕐 Kraj: " + data.class[i].endtime + "\n 🚪 Sala: " + getRoom(data.class[i].classroom) + "\n\n\n");
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
						console.log(subMess);

					
				//	class_data = ("*" + data.class[i].name + "*\n" + " 🔸 Profesor: " + getTeacher(data.class[i].teacher) + "\n 🕐 Početak: " + data.class[i].starttime + "\n 🕐 Kraj: " + data.class[i].endtime + "\n 🚪 Sala: " + getRoom(data.class[i].classroom) + "\n\n\n");
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
						console.log(subMess);

					
				//	class_data = ("*" + data.class[i].name + "*\n" + " 🔸 Profesor: " + getTeacher(data.class[i].teacher) + "\n 🕐 Početak: " + data.class[i].starttime + "\n 🕐 Kraj: " + data.class[i].endtime + "\n 🚪 Sala: " + getRoom(data.class[i].classroom) + "\n\n\n");
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
                            console.log(process.memoryUsage());
                            console.log(process.platform);

                            msg.reply("ℹ️ ```Informacije o botu``` ℹ️\n\n      *👨‍💻 Autor:* " + pack.author + "\n      *📶 Verzija:* " + pack.version + "\n      *⏱️ Uptime:* " + getUptime() + "\n      *💾 Memory usage:* " + Math.round((process.memoryUsage().rss / 1000000), 2) + "MB\n      *💻 OS:* " + (process.platform).toUpperCase() + "\n      *⚙️ RTE:* Node " + process.version + "\n      *📝 Opis:* " + pack.description + "\n")
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


});

function getTeacher(id) {
    let teacherConf = JSON.parse(fs.readFileSync('./data/teacher.json', 'utf8'));
    let teacher = teacherConf.data_rows[id].short
    return teacher;

}

function getUptime() {
    var ut_sec = process.uptime();
    var ut_min = ut_sec / 60;
    var ut_hour = ut_min / 60;
    var ut_day = ut_min / 24;

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

function getRoom(id) {
    let roomConf = JSON.parse(fs.readFileSync('./data/classroom.json', 'utf8'));
    let room = roomConf.data_rows[id].short
    return room;
}


client.initialize();