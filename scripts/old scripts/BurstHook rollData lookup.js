// Create Initialization Message
Hooks.on("ready", () => {console.info("🎯 ▪💨 ▪💨 ▪💨 🔫 Burst Fire Module Script Loaded");
});

// Pulling multiple attributes from one hook

  Hooks.on('closeCPRRollDialog', async (CPRRollDialog) => {
    console.log(typeof CPRRollDialog.rollData);
  })
