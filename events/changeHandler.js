const wa = require('../app')
const config = require('./../config/data');
const dat = require('date-and-time');

async function handleEvent(WAevent, oldObj, newObj){
        if(new Date().getDay() == 0){

        }else {
         var add =  {};
         var rm = {}
         var set = {}
         const key = "edit"
         add[key] = [];
         set[key] = [];
         rm[key] = [];

         var days = ['Nedelja', 'Ponedeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota']

        let removed = false;
        let added = false;
        let modifyed = false;

        const message = [];
        let addedmess;
        let rmedmess;
        let editedmess;

        message.push("⚠️ ```Nove izmjene na rasporedu``` ⚠️\n\n");

        var addttl = "🟢 *Dodano*\n\n"
        var mfttl = "🖊️ *Izmjenjeno*\n\n"
        var rmttl = "🔴 *Uklonjeno*\n\n"

         //Seperate per events
         WAevent.forEach(function(entry) {
                  switch(entry.type){
                           case 'add':{

                                    added = true;
                                    add[key].push(entry);
                                    break;
                           }
                           case 'set':{

                                    modifyed = true;
                                    set[key].push(entry);
                                    break;
                           }
                           case 'rm':{

                                    removed = true;
                                    rm[key].push(entry);
                                    break;
                           }
                  }
              });

              console.log(set[key]);
              if(added){

                addedmess = addttl
                add[key].forEach(function(entry) {

                    if(Object.entries(entry.vals).length === 1){
                        let data = JSON.parse(JSON.stringify(entry.vals));
                        let startDateUnp = dat.parse(data[0].date, 'YYYY-MM-DD');
                        addedmess += ("*" + data[0].name + "*" + "\n📆 " + days[startDateUnp.getDay()]  + " - " + dat.format(startDateUnp, 'DD.MM.YYYY')+ "\n 🕐 Od: " + data[0].starttime + "\n 🕐 Do: " + data[0].endtime + "\n\n");

                    }else {

                        entry.vals.forEach(function(entry){
                            let data = JSON.parse(JSON.stringify(entry));
                            let startDateUnp = dat.parse(data.date, 'YYYY-MM-DD');
                            addedmess += ("*" + data.name + "*" + "\n📆 " + days[startDateUnp.getDay()]  + " - " + dat.format(startDateUnp, 'DD.MM.YYYY')+ "\n 🕐 Od: " + data.starttime + "\n 🕐 Do: " + data.endtime + "\n\n");

                        });
                    }
                   
                });
               
               
              }

              if(removed){
               rmedmess = rmttl
                rm[key].forEach(function(entry) {

                    if(Object.entries(entry.vals).length === 1){
                        let data = JSON.parse(JSON.stringify(entry.vals));
                        let startDateUnp = dat.parse(data[0].date, 'YYYY-MM-DD');
                        rmedmess += ("*" + data[0].name + "*" + "\n📆 " + days[startDateUnp.getDay()]  + " - " + dat.format(startDateUnp, 'DD.MM.YYYY')+ "\n 🕐 Od: " + data[0].starttime + "\n 🕐 Do: " + data[0].endtime + "\n\n");

                    }else {

                        entry.vals.forEach(function(entry){
                            let data = JSON.parse(JSON.stringify(entry));
                            let startDateUnp = dat.parse(data.date, 'YYYY-MM-DD');
                            rmedmess += ("*" + data.name + "*" + "\n📆 " + days[startDateUnp.getDay()]  + " - " + dat.format(startDateUnp, 'DD.MM.YYYY')+ "\n 🕐 Od: " + data.starttime + "\n 🕐 Do: " + data.endtime + "\n\n");

                        });
                    }
                   
                });
              }

             
              if(modifyed){
               
                let wrote = false;
                let wrote2 = false;
                let contained = []

                set[key].forEach(function(entry){
                    if(entry.path.length == 3){
                                  
                                //Not repeating
                                if(!contained.includes(entry.path[1])){

                                    if(!wrote2){
                                        editedmess = mfttl;
                                        wrote2 = true;
                                    }

                                        editedmess += ("*" + oldObj.class[entry.path[1]].name + "*"  + "\n⏲️ Promjena termina\n📆 "  + days[dat.parse(oldObj.class[entry.path[1]].date, "YYYY-MM-DD").getDay()] +  " - " + dat.format(dat.parse(oldObj.class[entry.path[1]].date, "YYYY-MM-DD"), 'DD.MM.YYYY') + "\n🕐 Od: " + newObj.class[entry.path[1]].starttime + " do " + newObj.class[entry.path[1]].endtime + "\n\n");
                                        contained.push(entry.path[1]);   

                                }
                    }else {

                        //Added and deleted
                        
                        if(!wrote){
                            rmedmess = rmttl;
                            addedmess = addttl;
                            wrote = true;
                        }

                        //Create messages
                        rmedmess += ("*" + oldObj.class[entry.path[1]].name + "*" + "\n📆 " + days[dat.parse(oldObj.class[entry.path[1]].date, "YYYY-MM-DD").getDay()]  + " - " + dat.format(dat.parse(oldObj.class[entry.path[1]].date, "YYYY-MM-DD"), 'DD.MM.YYYY')+ "\n 🕐 Od: " + oldObj.class[entry.path[1]].starttime + "\n 🕐 Do: " + oldObj.class[entry.path[1]].endtime + "\n\n");
                        addedmess += ("*" + entry.val.name + "*" + "\n📆 " + days[dat.parse(entry.val.date, "YYYY-MM-DD").getDay()]  + " - " + dat.format(dat.parse(entry.val.date, "YYYY-MM-DD"), 'DD.MM.YYYY')+ "\n 🕐 Od: " + entry.val.starttime + "\n 🕐 Do: " +entry.val.endtime + "\n\n");

                    }
                });
              }
            
            //Push submessages and send
            message.push(addedmess, rmedmess, editedmess);
            wa.client.sendMessage(config.group.id, message.join(" "));
            
            }

};
module.exports = {
         handleEvent
}