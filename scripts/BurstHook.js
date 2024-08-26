//v1.1.1 BurstFlex system. Ranged weapon check + Burst Fire shenanigans check

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
        if (!isStandardAttack) { // Anything other than normal or aimed attack ends the script.
          //console.log(`CPR Burst Module ======== Isn't a Standard Attack`); // Uncomment to turn on logs
          return;
        };

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

      if (!item.system.isRanged || (item.system.weaponType === 'bow' || item.system.weaponType === 'grenadeLauncher' || 
        item.system.weaponType === 'rocketLauncher') || item.system.variety === 'grenade') {
        return; //Check to see if the weapon is ranged, or if the weapon is a grenade or some weapon type that shouldn't use burst fire, then exit out. 
      }
        
      const upgrades = item.system.upgrades; 
      const burstFireUpgrade = upgrades.find(upgrade => upgrade.name && upgrade.name.toLowerCase().includes('burst fire')); //Looking for Burst Fire # mod

      // Extract the name using destructuring
      const burstFireFlexible = burstFireUpgrade?.name; // Optional chaining to handle cases where no upgrade is found
      
      
      if (!upgrades || !burstFireUpgrade || !burstFireFlexible) { //Let's check to see if any of that errored out and where it errored out
      console.log(`Upgrades missing: ${!upgrades} | burstFireUpgrade: ${!burstFireUpgrade} | burstFireFlexible: ${!burstFireFlexible}`);
      return;
      }

      //BurstFlex(tm) Calulating the integer inside of a Burst Mod # upgrade and storing that as an integer

      const match = burstFireFlexible.match(/\d+/);
      let burstInteger = match ? parseInt(match[0]) : null;
      //console.log('Burst Fire Mod Amount ' + burstInteger); //Uncomment for logging
      if (!Number.isInteger(burstInteger)) {
        console.log('Burst Fire mod has no integer in its name try again');
        return;
      };

      burstInteger = burstInteger - 1; //This modifies a standard or aimed attack so we need to account for the system firing that bullet. 
      
      if (burstInteger < 1) { //Check to see if someone is sneaky and trying to add ammo or use a burst fire 1 mod
        ui.notifications.info(`Burst fire don't work that way choom, Burst Fire 2 is minimum upgrade`);
        return;
      }

      let ammoCount = item.system.magazine.value; 
        ammoCount = ammoCount - burstInteger;
        if (ammoCount < 0) {
            await item.update({"system.magazine.value":0});
            //ui.notifications.info(`*CLICK* Ran out of ammo mid-burst choom!`); // Uncomment if you want to turn on logs
            const chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: '<p><i><strong>*CLICK*</strong></i> Ran out of ammo mid-burst!</p>',
             };
            ChatMessage.create(chatData, {});         
        } else {
        await item.update({"system.magazine.value":ammoCount});
        }

});
