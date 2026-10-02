const {
  app,
  BrowserWindow,
  session,
  globalShortcut,
  ipcMain,
} = require("electron");

const path = require("path");

let mainWindow;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,

    title: "PROCTORX",

    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: isDev,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../dist/index.html")
    );
  }

  mainWindow.setFullScreen(true);

  mainWindow.webContents.setWindowOpenHandler(() => {
    return {
      action: "deny",
    };
  });

  mainWindow.on("minimize", () => {
    mainWindow.webContents.send(
      "proctorx:window-event",
      {
        type: "minimized",
      }
    );
  });

  mainWindow.on("restore", () => {
    mainWindow.webContents.send(
      "proctorx:window-event",
      {
        type: "restored",
      }
    );
  });

  mainWindow.on("blur", () => {
    mainWindow.webContents.send(
      "proctorx:window-event",
      {
        type: "blur",
      }
    );
  });

  mainWindow.on("focus", () => {
    mainWindow.webContents.send(
      "proctorx:window-event",
      {
        type: "focus",
      }
    );
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const allowedPermissions = ["media"];

      callback(
        allowedPermissions.includes(permission)
      );
    }
  );

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});