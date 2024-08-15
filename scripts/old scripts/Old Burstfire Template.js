/* Burst fire ammo adjuster
This script will deduct ammunition from a specified gun when run. To use it, fire your gun with a single shot, then run this script to finish deducting ammunition.
Instructions: Make a copy of this template and name it something unique to identify your gun. "Noob's Stolbovoy SBP-68" or whatever. Assign to hotbar.
Please enter the UUID of the gun inbetween the quotes below. You can find the UUID by dragging the gun from your character sheet to the chat window. Everthing between the square brackets [] is the UUID.
Do *not* use a gun from the item tab or a compendium. That is a template, not *your* gun. */

gunUuid = "gun UUID here";

// Please enter the *total* number of bullets that this gun fires in a burst. Default is 3, minimum is 2

var burstCount = 3;

// Begin Script

if (gunUuid === undefined)
    return ui.notifications.error(`Gun UUID improperly configured. Edit the script and try again.`);
const burstGunId = await fromUuid(gunUuid);
var ammoCount = burstGunId.system.magazine.value;


if (burstCount < 2) {
    return ui.notifications.error("Burst fires more than one bullet, choom. Edit the script and try again.");
};

let d = new Dialog({
    title: "Burst Fire",
    content: `<center>Did you already shoot a basic shot?`,
    buttons: {
        "confirm": {
            label: 'Yes',
            callback: () => {
                burstFire(burstGunId);
            }
  
        },
        "cancel": {
            label: 'Not Yet',
        }
    },
    default: "cancel"
  }).render(true);


async function burstFire(item){
    additionalBurst = burstCount - 1;
        var ammoRemaining = ammoCount - additionalBurst;
        if (ammoRemaining < 0) {
           ui.notifications.info(`*CLICK* Ran out of ammo mid-burst choom!`);
           const chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: '<p><i><strong>*POP* *CLICK*</strong></i> Ran out of ammo mid-burst!</p>',
            };
          ChatMessage.create(chatData, {});
           await item.update({"system.magazine.value":0});           
        } else {
        await item.update({"system.magazine.value":ammoRemaining});
        return ui.notifications.info("*POP POP POP* You have "+ ammoRemaining + " rounds in the mag still.")
    }
}