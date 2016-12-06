const electron = require('electron')
const {app} = electron;
const {BrowserWindow} = electron;

var window = null;

app.on('ready', () => {
  window = new BrowserWindow;
  window.loadURL('file://' + __dirname + '/index.html');
  window.openDevTools();
  window.on('closed', () => window = null);
});

