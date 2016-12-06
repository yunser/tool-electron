const electron = require('electron');
const {app, protocol, BrowserWindow} = require('electron');
/*const {app} = electron;*/
/*const {BrowserWindow} = electron;*/
const {dialog} = require('electron');
const remote = require('electron').remote;
const ipcMain = require('electron').ipcMain;
const {shell} = require('electron');
const path = require('path');

ipcMain.on('asynchronous-message', function (event, arg) {
    event.sender.send('asynchronous-reply', 'pong')
});

ipcMain.on('synchronous-message', function (event, arg) {
    event.returnValue = 'pong'
});
// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let mainWindow;
// 注册私有协议


function createWindow () {
    protocol.registerFileProtocol('yunser', (request, callback) => {
        console.log(request.url);
        const url = request.url.substr(9)
        console.log(path.normalize(`${__dirname}/chrome/${url}`))
        callback({path: path.normalize(`${__dirname}/chrome/${url}/index.html`)})
    }, (error) => {
        if (error) console.error('Failed to register protocol')
    });

    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        icon: "icon.png",
        titleBarStyle: 'hidden',
        frame: false,
        /*webPreferences: {
            nodeIntegration: false
        }*/
        //fullscreen: true isFullScreen()
    }/*{width: 800, height: 600}*/);

    mainWindow.setMenuBarVisibility(false);
    mainWindow.webContents.openDevTools();

    console.log('122');
    mainWindow.webContents.on('new-window', function (event,url,fname,disposition,options) {
        var exec = require('child_process').exec; //加载node模块  url是将要跳转的地址

        mainWindow.setMenuBarVisibility(false);
        //拦截url调用外部浏览器打开
        //exec('start '+url, function(err,stdout,stderr){});

        /*var win = new BrowserWindow({
            x: 0,
            y: 0,
            width: 1300,
            height: 700,
            /!*width: 300,
             height: 300,*!/
            show: false,
            /!*webPreferences: {
                nodeIntegration: false
            },*!/
            autoHideMenuBar: true
        });
        win.webContents.closeDevTools();*/

        /*if (url.indexOf('chrome://') !== -1) {
            url = url.replace('chrome://', '');
            if (url.charAt(url.length - 1) === '/') {
                url = url.substr(0, url.length - 1);
            }
            win.loadURL('file://' + __dirname + '/chrome' + url + ''); // 新窗口
            win.show();
        } else {
            win.loadURL(url); // 新窗口
            win.show();
        }*/
        console.log('拦截')
        mainWindow.webContents.send('new-window', url);

        event.preventDefault();
    });

    mainWindow.on('closed', function () {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        mainWindow = null
    });

    //mainWindow.loadURL(`file://${__dirname}/app/files/index.html`);
    //mainWindow.loadURL(`file://${__dirname}/app/markdown/index.html`);
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // 设置窗口
    var presWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: 1300,
        height: 700,
        show: false,
        frame: true,
        webPreferences: {
            nodeIntegration: false
        },
        autoHideMenuBar: true
    });
    presWindow.onbeforeunload = function (e) {
        console.log('I do not want to be closed')
        event.preventDefault();
        // Unlike usual browsers, in which a string should be returned and the user is
        // prompted to confirm the page unload, Electron gives developers more options.
        // Returning empty string or false would prevent the unloading now.
        // You can also use the dialog API to let the user confirm closing the application.
        e.returnValue = false;
    }
    presWindow.on('closed', function (event) {
        presWindow = null;
    });

    ipcMain.on('open-settings-window', function (event, arg) {
        //presWindow.show()
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

    // 打开外部网址
    ipcMain.on('open-url', function (event, arg) {
        shell.openExternal(arg);
    });

    ipcMain.on('win-min', function (event, arg) {
        mainWindow.minimize();
    });

    ipcMain.on('win-max', function (event, arg) {
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    });

    ipcMain.on('win-close', function (event, arg) {
        mainWindow.close();
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

