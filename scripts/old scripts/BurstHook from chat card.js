// Create Initialization Message
Hooks.on("ready", () => {console.info("🎯 ▪💨 ▪💨 ▪💨 🔫 Burst Fire Module Script Loaded");
});

// Pull the gun from the attack

Hooks.on('closeCPRRollDialog', async (CPRRollDialog) => {
  // Check if CPRRollDialog object exists and has rollData
  if (!CPRRollDialog) {
    console.error("Missing CPRRollDialog");
    return; // Exit the function if data is missing
      } else {
      // Pull the actor & the equipped gun from this hook, assemble the full UUID, and then pull the gun's object
      var actorUuid = CPRRollDialog.rollData.entityData?.actor;
      var equippedGunUuid = CPRRollDialog.rollData.entityData?.item;
      var fullUuid = "Actor." + actorUuid + ".Item." + equippedGunUuid;
      console.info(`Gun UUID: ` + fullUuid)
      const burstGunId = await fromUuid(fullUuid);
}
});

// We have the Gun object. Now let's see if we need to use it.

// Post-single firing. We're at the end of the process. 
  Hooks.on('renderChatMessage', async (ChatMessage) => {
    // Check if renderChatMessage & ChatMessage.content exist
    if (!ChatMessage || !ChatMessage.content) {
      console.error("Missing ChatMessage or content property");
      return; // Exit the function if data is missing
      // We only want to evaluate if the chat card includes the word "attack" as that's unique to the standard attack
    } else if ( ChatMessage.content.includes(`Attack`) ) {
      console.warn(`Standard Attack Detected!`)
        // We have the gun's ID, so we can take a look at 
        //If there's a burst fire modification, launch the relevant function
            if (CPRRollDialog.item.system.upgrades.includes(`Burst Fire 2`)) {
              console.warn(`Burst Fire 2 detected!`);
             burstFireTwo(burstGunId);
            } else if (CPRRollDialog.item.system.upgrades.includes(`Burst Fire 3`)) {
              console.warn(`Burst Fire 3 detected!`)
             burstFireThree(burstGunId);
             } else {
               return console.warn(`No Burst Fire`);
             }
    } else {

        return console.warn(`Not a standard attack role- no burst fire`);
    }
  });
  
// Burst Fire 2
async function burstFireTwo(item){
        var ammoCount = burstGunId.system.magazine.value;
        var ammoRemaining = ammoCount - 1;
        if (ammoRemaining <= 0) {
           ui.notifications.info(`*CLICK* Ran out of ammo mid-burst choom!`);
           const chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: '<p><i><strong>*CLICK*</strong></i> Ran out of ammo mid-burst!</p>',
            };
          ChatMessage.create(chatData, {});
           await item.update({"system.magazine.value":1});           
        } else {
        await item.update({"system.magazine.value":ammoRemaining});
        ui.notifications.info("*POP POP POP* You have "+ ammoRemaining + " rounds in the mag still.")
    }
};

// Burst Fire 3
async function burstFireThree(item){
    var ammoCount = burstGunId.system.magazine.value;
    var ammoRemaining = ammoCount - 2;
    if (ammoRemaining <= 0) {
       ui.notifications.info(`*CLICK* Ran out of ammo mid-burst choom!`);
       const chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: '<p><i><strong>*CLICK*</strong></i> Ran out of ammo mid-burst!</p>',
        };
      ChatMessage.create(chatData, {});
       await item.update({"system.magazine.value":1});           
    } else {
    await item.update({"system.magazine.value":ammoRemaining});
    ui.notifications.info("*POP POP POP* You have "+ ammoRemaining + " rounds in the mag still.")
}
};

/* Note: I may need to tweak this. This script runs before the ammo is deducted I think for the basic shot- the item update hook comes later. 
I think I compensated for this in my script but if not I may have to fix it. */