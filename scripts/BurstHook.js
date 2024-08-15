// Create Initialization Message
Hooks.once("ready", () => {console.info("🎯 ▪💨 ▪💨 ▪💨 🔫 Burst Fire Module Script Loaded");
});

Hooks.on("createChatMessage", async function (message) {
    if (
        game.userId != message._source.user || !message || !message.content
      )
        return;
        const DIV = document.createElement("DIV");
        DIV.innerHTML = message.content;
        const isAttack = DIV.querySelector(
          `[data-tooltip='${game.i18n.localize(
            "CPR.actorSheets.commonActions.rollDamage"
          )}']`
        );
        
        // Pulling information from the chat message
        const data = DIV.querySelector("[data-action=rollDamage]")?.dataset;
        if (!isAttack || !data) {
          return console.log("CPR Burst Module ======= Either no isAttack or no data" );
        };
        let isStandardAttack = false
        //console.log('is autofire? '+ message.content.toLowerCase().includes(`autofire`)); // Uncomment if you want to turn on logs
        //console.log('is suppressive? '+ message.content.toLowerCase().includes(`suppressive`)); // Uncomment if you want to turn on logs
        isStandardAttack = !(message.content.toLowerCase().includes(`autofire`) || message.content.toLowerCase().includes('suppressive'));
        //console.log('is standard attack? ' + isStandardAttack)  // Uncomment if you want to turn on logs

        let token =
        message.speaker?.token ||
        canvas.scene.tokens.get(data.tokenId) ||
        canvas.scene.tokens.getName(message.speaker?.alias);
        const actor = token?.actor ?? game.actors.get(data.actorId);
        const item = actor?.items?.get(data.itemId);
    
      if (!token || !actor || !item) {
        console.log(
          `CPR Burst Fire Module ===== Token missing: ${!token} | Actor missing: ${!actor} | Item missing: ${!item}`
        );
        return;
      }

      const foundBurstTwo = !!item.system.upgrades.find(upgrade => {
          return upgrade.name && upgrade.name.toLowerCase().includes('burst fire 2');
        });

      const foundBurstThree = !!item.system.upgrades.find(upgrade => {
          return upgrade.name && upgrade.name.toLowerCase().includes('burst fire 3');
        });

        if (item && foundBurstThree && isStandardAttack) {
          //console.warn(`Burst Three detected!`); // Uncomment if you want to turn on logs
          burstFireThree(item);
      } else if (item && foundBurstTwo && isStandardAttack) {
          //console.warn('Burst Two Detected'); // Uncomment if you want to turn on logs
          burstFireTwo(item);
      } else {
          return //console.log('No Burst Mod Detected') // Uncomment if you want to turn on logs

      }
});





// Burst Fire 2
async function burstFireTwo(item) {
        let ammoCount = item.system.magazine.value;
        let ammoRemaining = ammoCount - 1;
        if (ammoRemaining < 0) {
            await item.update({"system.magazine.value":0});
            //ui.notifications.info(`*CLICK* Ran out of ammo mid-burst choom!`); // Uncomment if you want to turn on logs
            const chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: '<p><i><strong>*CLICK*</strong></i> Ran out of ammo mid-burst!</p>',
             };
            ChatMessage.create(chatData, {});         
        } else {
        await item.update({"system.magazine.value":ammoRemaining});
        }
    }

// Burst Fire 3
async function burstFireThree(item) {
    let ammoCount = item.system.magazine.value;
    let ammoRemaining = ammoCount - 2;
    if (ammoRemaining <= 0) {
      await item.update({"system.magazine.value":0}); 
       //ui.notifications.info(`*CLICK* Ran out of ammo mid-burst choom!`); // Uncomment if you want to turn on logs
       const chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: '<p><i><strong>*CLICK*</strong></i> Ran out of ammo mid-burst!</p>',
        };
      ChatMessage.create(chatData, {});     
    } else {
    await item.update({"system.magazine.value":ammoRemaining});
    }
}
