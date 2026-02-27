Hooks.once("ready", () => {
  console.info("🎯 Burst Fire Module Script Loaded (v12)");
 });

Hooks.on("createChatMessage", async function (message) {
  // console.log("BurstHook: ChatMessage hook triggered.");
  // Uncomment above to log when the hook is triggered

  if (game.userId !== message.author?.id || !message || !message.content) {
    // console.log("BurstHook: Message not from current user or missing content.");
    // Uncomment above to log if the message is not from the current user or missing content
    return;
  }

  const DIV = document.createElement("DIV");
  DIV.innerHTML = message.content;
  // console.log("BurstHook: Parsed message HTML.", DIV);
  // Uncomment above to log the parsed HTML of the chat message

  const isAttack = DIV.querySelector(
    `[data-tooltip='${game.i18n.localize("CPR.actorSheets.commonActions.rollDamage")}']`
  );
  const data = DIV.querySelector("[data-action=rollDamage]")?.dataset;
  console.log("BurstHook: isAttack:", isAttack);
  // console.log("BurstHook: data:", data);
  // Uncomment above to log detection of attack roll and extracted data

  if (!isAttack || !data) {
    // console.log("BurstHook: Either no isAttack or no data. Exiting.");
    // Uncomment above to log if the attack or data is missing
    return;
  }

  // "Standard attack" is defined as anything that is NOT autofire or suppressive for future-proofing
  const isStandardAttack = !(
    message.content.toLowerCase().includes("autofire") ||
    message.content.toLowerCase().includes("suppressive")
  );
  // console.log("BurstHook: isStandardAttack:", isStandardAttack);
  // Uncomment above to log if the attack is standard or not
  if (!isStandardAttack) {
    // console.log("BurstHook: Not a standard attack. Exiting.");
    // Uncomment above to log if the attack is not standard
    return;
  }

  let token =
    canvas.scene?.tokens?.get(message.speaker?.token) ||
    canvas.scene?.tokens?.get(data.tokenId) ||
    canvas.scene?.tokens?.getName(message.speaker?.alias);
  const actor = token?.actor ?? game.actors.get(data.actorId);
  const item = actor?.items?.get(data.itemId);

  // console.log("BurstHook: token:", token);
  // console.log("BurstHook: actor:", actor);
  // console.log("BurstHook: item:", item);
  // console.log("BurstHook: item.system:", item.system);
  // Uncomment above to log the token, actor, item, and item system data

  if (!actor || !item) {
    console.log(
      `BurstHook: Actor missing: ${!actor}\nItem missing: ${!item}`
    );
    // Uncomment above to log if the actor or item is missing
    return;
  }

  if (
    !item.system.isRanged ||
    ["bow", "grenadeLauncher", "rocketLauncher"].includes(item.system.weaponType) ||
    item.system.variety === "grenade"
  ) {
    console.log("BurstHook: Weapon is not eligible for burst fire. Exiting.");
    // Uncomment above to log if the weapon is not eligible for burst fire
    return;
  }

  const upgradeIds = item.system.installedItems?.list || [];
  // console.log("BurstHook: upgradeIds:", upgradeIds);
  // Uncomment above to log the list of installed upgrade IDs

  const upgrades = upgradeIds
    .map(id => actor.items.get(id))
    .filter(upg => upg && upg.type === "itemUpgrade");
  // console.log("BurstHook: upgrades found:", upgrades);
  // Uncomment above to log the found upgrades

  // === Burst Fire Upgrade Validation ===
  const burstFireUpgrades = upgrades.filter(
    upg => upg.name && upg.name.toLowerCase().includes("burst fire")
  );
  if (burstFireUpgrades.length > 1) {
    ui.notifications.warn("Two burst fire upgrade modules installed—Pick one choom!");
    console.log("BurstHook: Multiple burst fire upgrades detected. Aborting burst fire logic.");
    // Uncomment above to log if multiple burst fire upgrades are detected
    return;
  }
  // =====================================

  const burstFireUpgrade = burstFireUpgrades[0];
  const burstFireFlexible = burstFireUpgrade?.name;
  // console.log("BurstHook: burstFireUpgrade:", burstFireUpgrade);
  // console.log("BurstHook: burstFireFlexible:", burstFireFlexible);
  // Uncomment above to log the burst fire upgrade and its name

  if (!upgrades.length || !burstFireUpgrade || !burstFireFlexible) {
    console.log(
       `BurstHook: Upgrades missing: ${!upgrades.length}\nburstFireUpgrade: ${!burstFireUpgrade}\nburstFireFlexible: ${!burstFireFlexible}`
    );
    // Uncomment above to log if upgrades are missing
    return;
  }

  const match = burstFireFlexible.match(/\d+/);
  let burstInteger = match ? parseInt(match[0]) : null;
  // console.log("BurstHook: burstInteger extracted:", burstInteger);
  // Uncomment above to log the extracted burst integer

  if (!Number.isInteger(burstInteger)) {
    // console.log("BurstHook: Burst Fire mod has no integer in its name, try again.");
    // Uncomment above to log if the burst fire mod name is invalid
    return;
  }
  burstInteger = burstInteger - 1; // Compensates for the 1 round already deducted by the CPR system when the attack roll fires
  // console.log("BurstHook: burstInteger after subtracting 1:", burstInteger);
  // Uncomment above to log the adjusted burst integer

  if (burstInteger < 1) {
    ui.notifications.info(`Burst fire doesn't work that way choom, Burst Fire 2 is minimum upgrade`);
    console.log("BurstHook: Burst integer < 1. Exiting.");
    // Uncomment above to log if the burst integer is less than 1
    return;
  }

  // Defensive checks for magazine/value
  // console.log("BurstHook: item.system.magazine:", item.system.magazine);
  // Uncomment above to log the magazine structure

  if (!item.system.magazine || typeof item.system.magazine.value !== "number") {
    // console.log("BurstHook: Magazine or value missing from item.system.");
    // Uncomment above to log if magazine or value is missing
    return;
  }

  let ammoCount = item.system.magazine.value;
  // console.log("BurstHook: ammoCount before deduction:", ammoCount);
  // Uncomment above to log ammo count before deduction
  ammoCount = ammoCount - burstInteger;
  // console.log("BurstHook: ammoCount after deduction:", ammoCount);
  // Uncomment above to log ammo count after deduction

  if (ammoCount < 0) {
    await item.update({ "system.magazine.value": 0 });
    const chatData = {
      user: game.userId,
      speaker: ChatMessage.getSpeaker(),
      content: '<p><i><strong>*CLICK*</strong></i> Ran out of ammo mid-burst!</p>',
    };
    ChatMessage.create(chatData, {});
    // console.log("BurstHook: Ran out of ammo mid-burst. Magazine set to 0.");
    // Uncomment above to log when ammo runs out mid-burst
  } else {
    await item.update({ "system.magazine.value": ammoCount });
    // console.log("BurstHook: Magazine updated to:", ammoCount);
    // Uncomment above to log the updated magazine value
  }
});