const {
  contextBridge,
  ipcRenderer,
} = require("electron");

contextBridge.exposeInMainWorld("proctorx", {
  isDesktop: true,

  getPlatform: () => process.platform,

  getVersion: () => process.versions.electron,

  sendEvent: (eventType, data = {}) => {
    ipcRenderer.send("proctorx:event", {
      eventType,
      data,
    });
  },

  onWindowEvent: (callback) => {
    const handler = (_event, data) => {
      callback(data);
    };

    ipcRenderer.on(
      "proctorx:window-event",
      handler
    );

    return () => {
      ipcRenderer.removeListener(
        "proctorx:window-event",
        handler
      );
    };
  },
});