const electron = require('electron');
const {app, protocol, BrowserWindow, dialog, remote, ipcMain, shell} = require('electron');
const path = require('path');
var fs = require('fs');
var context = require('./node/electron-context-menu.js');

let appName = 'music';

//let mainUrl = `file://${__dirname}/index.html`;
let mainUrl = `file://${__dirname}/app/${appName}/index.html`;

//mainWindow.loadURL(`file://${__dirname}/app/files/index.html`);
//mainWindow.loadURL(`file://${__dirname}/app/markdown/index.html`);
//.loadURL(`file://${__dirname}/app/desktop/index.html`);
//mainWindow.loadURL('yunser://settings');
//mainWindow.loadURL(`file://${__dirname}/app/files/index.html`);
//mainWindow.loadURL(`file://${__dirname}/app/_img/index.html`);
//mainWindow.loadURL(`file://${__dirname}/app/im/index.html`);
//mainWindow.loadURL(`file://${__dirname}/app/search/index.html`);
//mainWindow.loadURL(`file://${__dirname}/app/apps/index.html`);
//mainWindow.loadURL(`file://${__dirname}/app/music/index.html`);
//mainWindow.loadURL(`file://${__dirname}/index.html`);




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
        console.log('================')
        console.log(request.url);
        const url = request.url.substr(9);
        var resPath;
        if (url.indexOf('resources') !== -1) {
            resPath = path.normalize(`${__dirname}/${url}`.replace('resources/', ''));
        } else if (url.indexOf('.') !== -1) { // TODO
            resPath = path.normalize(`${__dirname}/chrome/${url}`);
        } else {
            resPath = path.normalize(`${__dirname}/chrome/${url}/index.html`);
        }
        console.log(resPath);
        callback({
            path: resPath
        });
    }, (error) => {
        if (error) {
            console.error('Failed to register protocol');
        }
    });

    let screen = electron.screen;
    var size = screen.getPrimaryDisplay().workAreaSize;
    
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        icon: "icon.png",
        titleBarStyle: 'hidden',
        frame: false,
        /*webPreferences: {
            nodeIntegration: false
        }*/
        //fullscreen: true isFullScreen()
    }/*{width: 800, height: 600}*/);

    console.log('呵呵')
    
    
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
    mainWindow.webContents.on('will-navigate', function (e, url) {
        mainWindow.webContents.send('will-navigate', url);
        console.log('已结发送')
        e.preventDefault();    
    });
    
    mainWindow.on('leave-full-screen', function () {
        mainWindow.webContents.send('leave-full-screen');
    });
    mainWindow.on('leave-html-full-screen', function () {
        mainWindow.webContents.send('leave-full-screen');
    });

    mainWindow.on('enter-full-screen', function () {
        mainWindow.webContents.send('enter-full-screen');
    });
    mainWindow.on('enter-html-full-screen', function () {
        mainWindow.webContents.send('enter-full-screen');
    });

    mainWindow.webContents.session.on('will-download', (e, item) => {
        //获取文件的总大小
        const totalBytes = item.getTotalBytes();
        console.log('总大小',totalBytes);
        //设置文件的保存路径，此时默认弹出的 save dialog 将被覆盖
        const filePath = path.join(app.getPath('downloads'), item.getFilename());
        console.log(filePath);
        item.setSavePath(filePath);

        //监听下载过程，计算并设置进度条进度
        item.on('updated', () => {
            console.log(item.getReceivedBytes() / totalBytes)
            mainWindow.setProgressBar(item.getReceivedBytes() / totalBytes);
        });

        //监听下载结束事件
        item.on('done', (e, state) => {
            //如果窗口还在的话，去掉进度条
            if (!mainWindow.isDestroyed()) {
                mainWindow.setProgressBar(-1);
            }

            //下载被取消或中断了
            if (state === 'interrupted') {
                electron.dialog.showErrorBox('下载失败', `文件 ${item.getFilename()} 因为某些原因被中断下载`);
            }

            //下载完成，让 dock 上的下载目录Q弹一下下
            if (state === 'completed') {
                console.log('下载完成')
            }
        });
    });
    mainWindow.on('closed', function () {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        mainWindow = null
    });



    mainWindow.loadURL(mainUrl);

    context({
        window: mainWindow,
        prepend: (params, browserWindow) => [{
            label: 'Rainbow',
            // only show it when right-clicking images
            visible: params.mediaType === 'image'
        }]
    });
    
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

    ipcMain.on('win-reload', function (event, arg) {
        mainWindow.reload();
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

