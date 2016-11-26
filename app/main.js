const electron = require('electron')
// 控制应用生命周期的模块。
const {app} = electron;
// 创建原生浏览器窗口的模块。
const {BrowserWindow} = electron;
const {dialog} = require('electron');
const remote = require('electron').remote;
const ipcMain = require('electron').ipcMain;

ipcMain.on('asynchronous-message', function (event, arg) {
    event.sender.send('asynchronous-reply', 'pong')
});

ipcMain.on('synchronous-message', function (event, arg) {
    event.returnValue = 'pong'
});
// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let mainWindow;

function createWindow () {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow(/*{width: 800, height: 600}*/);
    mainWindow.loadURL(`file://${__dirname}/markdown.html`);
    //mainWindow.loadURL(`file://${__dirname}/index.html`);
    //mainWindow.loadURL('https://github.com')
    //mainWindow.setMenuBarVisibility(false);
    // 启用开发工具。
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        mainWindow = null
    });

    // 设置窗口
    var presWindow = new BrowserWindow({
        width: 300,
        height: 300,
        show: false
    });

    presWindow.loadURL('file://' + __dirname + '/setting.html'); // 新窗口

    ipcMain.on('open-settings-window', function (event, arg) {
        presWindow.show()
    });

    // 打开文件
    ipcMain.on('open-file', function (event, arg) {
        var ret = dialog.showOpenDialog({properties: ['openFile']})
        event.sender.send('open-file', ret);
    });

    // 打开文件夹
    ipcMain.on('open-files', function (event, arg) {
        var ret = dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']})
        event.sender.send('open-directory', ret);
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // 在 macOS 上，当点击 dock 图标并且该应用没有打开的窗口时，
    // 绝大部分应用会重新创建一个窗口。
    if (mainWindow === null) {
        createWindow()
    }
});