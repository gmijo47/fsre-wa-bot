const qrcode = require('qrcode-terminal');
const scrp = require('./scraper')
const events = require('./events/messageHandler')
const {Client, LocalAuth} = require('whatsapp-web.js');




    //Create client with local auth
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {args: ["--no-sandbox"]}
    });

//Generate qr code for sign in
client.on('qr', qr => {
    qrcode.generate(qr, {
        small: true
    });
});

//When client ready scrape data from timetable
client.on('ready', () => {
    console.log('Client is ready!');
    if (scrp.getData(client)) {

        console.log("Raw data is writed, proceeding to parse");

    } else {

        console.log("Raw data isn't writed, aborting parsing");
    }
});

//Client commands and chat
client.on('message', async(msg) => {
    if(msg.body.startsWith('!')){
    events.handleMessage(msg.body, msg.author, msg, (await msg.getChat()).isGroup, (await msg.getChat()).id)
    }


});

client.on("group_join", async(group) =>{
        group.reply("👩‍🚀 *FSRE Bot* 👩‍🚀\n\n Ovaj nalog kontroliše bot, te šalje obavještenja o promjeni rasporeda, ukoliko kojim slučajem se nešto zezne, izbacite me iz grupe, budući da sam još uvijek u beta fazi. Također možete mi se javiti privatno, te vidjeti sve opcije tako što će te mi poslati poruku *!pomoć*. \n\nVaš FSRE Bot ⚙️");
});

client.initialize();

module.exports.client = client;