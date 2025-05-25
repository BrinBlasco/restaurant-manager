const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    mainWindow.setTitle("Quick Serve App");

    mainWindow.maximize();

    mainWindow.loadURL("https://quickserveapp.ddns.net/");

    mainWindow.setMenuBarVisibility(false);
});
