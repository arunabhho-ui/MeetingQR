export const CONFIG = {

  event: {
    name: "Meeting 1",
    date: "2026-02-15",
    startTime: "10:00",
    durationMinutes: 60
  },

  location: {
    latitude: 12.9716,
    longitude: 77.5946,
    radius: 100
  },

  mailerScriptURL: "https://script.google.com/macros/s/AKfycbzPO-3LL7T-hIPhjxesWsV3eGloT7Jb2R5IHNK0nmdPERFxZhCK-Fw2tqyDxRMP1Ba9yw/exec"

};

// Make it globally available for non-module scripts
window.CONFIG = CONFIG;