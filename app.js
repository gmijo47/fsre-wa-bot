const qrcode = require('qrcode-terminal');
const scrp = require('./scraper')
const fs = require('fs');

const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config/config');
const date = require('date-and-time');
let dataConf = JSON.parse(fs.readFileSync('./config/data.json', 'utf8'));

const client = new Client({
    authStrategy: new LocalAuth()
});
 


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
    if(scrp.getData()){
     console.log("Raw data is writed, proceeding to parse");

    }else {
      console.log("Raw data isn't writed, aborting parsing");
    }
});

client.on('message', async (msg) => {

      const chat = await msg.getChat();

      //Register group chanell
      if(chat.isGroup){
        if(msg.body == "!register" && msg.author == config.super_admin.id){

          //Check if chanell is registered
            if(dataConf.group.id == ""){
                //Not registered
                dataConf.group.id = chat.id._serialized;
                try{
                fs.writeFileSync('config/data.json', JSON.stringify(dataConf, null, "\t"));
                msg.react("✅")
                msg.reply("✅ - Kanal registrovan!\n Obavještenja će stizati ovdje!")
                }catch(err){
                  msg.reply("❌ - Došlo je do problema\n Kanal nije registrovan!")
                  msg.react("❌");
                  console.log(err);
                }
            }else {
              //Registered
              msg.reply("❌ - Neki kanal je već registrovan!\n Koristite !unregister za uklanjanje kanala.")
              msg.react("❌");
            }
            return;
        }else if(msg.body == "!register" || msg.body == "!unregister"  && msg.author != config.super_admin.id){

          msg.reply("⛔ - Nemate dozvolu da izvršavate dev komande");
          msg.react("⛔")

        }else if(msg.body == "!unregister" && msg.author == config.super_admin.id){
          //Unregister group chanell
          if(dataConf.group.id == ""){
              //Chanell not registered
              msg.reply("❌ - Došlo je do problema\n Kanal nije registrovan!");
              msg.react("❌")
        }else {
          //Chanell registered
          dataConf.group.id = "";
          try{
            fs.writeFileSync('config/data.json', JSON.stringify(dataConf, null, "\t"));
            msg.react("✅")
            msg.reply("✅ - Kanal UNregistrovan!\n Obavještenja neće stizati više ovdje!")
          }catch(err){
            msg.reply("❌ - Došlo je do problema\n Kanal nije UNregistrovan!")
            msg.react("❌");
            console.log(err);
          }
        }
        return;
      }
    }else {
      //Private chats
      if(msg.body.startsWith('!')){
        //Command
        var days = [ 'Nedelja', 'Ponedeljak', 'Utorak', 'Srijeda', 'Cetvrtak', 'Petak', 'Subota']
        let day;
        switch(msg.body.substring(1, msg.body.length)){
          case "rd":{
            const message = [];
            let data =  JSON.parse(fs.readFileSync(('./data/timetable_today.json')));
            if(data.class.length == 0){
              //No classes
              day = new Date().getDay();
              var title = ("❇️ ```Raspored - " + days[day] + "``` ❇️\n" + "        " + date.format(new Date(), 'DD.MM.YYYY') + "\n\n");
              message.push(title);
              class_data = "*Nema sati za prikazati!* "
              message.push(class_data); 
            }else {
              //Have classes
              day = date.parse(data.class[0].date, "YYYY-MM-DD").getDay();
              let i = 0;
              var title = ("❇️ ```Raspored - " + days[day] + "``` ❇️\n" + "        " + date.format(new Date(), 'DD.MM.YYYY') + "\n\n");
              message.push(title);
              data.class.forEach(function(entry) {
                class_data = ("*"+data.class[i].name + "*\n" + " 🔸 Profesor: " + getTeacher(data.class[i].teacher) + "\n 🕐 Početak: " + data.class[i].starttime + "\n 🕐 Kraj: " + data.class[i].endtime + "\n 🚪 Sala: " + getRoom(data.class[i].classroom) + "\n\n\n");
                message.push(class_data);
              i++;
              });
            }
            msg.reply((message.toString()).replace(',', " "));
        
            break;
          }w
          default:{
            
            msg.reply("🆘 Nepoznata komanda, kucajte !pomoc za pomoć");
          }
        }
      }else{
        return;
      }
    }
      
  
});

function getTeacher(id){
  let teacherConf = JSON.parse(fs.readFileSync('./data/teacher.json', 'utf8'));
  let teacher = teacherConf.data_rows[id].short
  return teacher;

}

function getRoom(id){
  let roomConf = JSON.parse(fs.readFileSync('./data/classroom.json', 'utf8'));
  let room = roomConf.data_rows[id].short
  return room;
}


client.initialize();
 