/**
 * Created by cjh1 on 2016/11/26.
 */
var require = nodeRequire;
var remote = require('remote');
var Menu = remote.require('menu');
var Tray = remote.require('tray');
var http = require("http");
var fs = require('fs');
var path = require('path');
var ipc = require("electron").ipcRenderer;

function walk(dir, done) {
    var results = [];
    function compare(a, b) {
        return a > b;
        if (/^\w/.test(a)) {
            return false;
        }
        return b.localeCompare(a);
    }
    function sortHandle(a, b) {
        if (a.isParent) {
            if (b.isParent) {
                return compare(a.name, b.name);
            } else {
                return false;
            }
        } else {
            if (b.isParent) {
                return true;
            } else {
                return compare(a.name, b.name);
            }
        }
        return true;
    }
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) {
            return done(null, results);
        }
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    var fileName = getNameFromPath(file);
                    if (fileName.charAt(0) !== '.') {
                        walk(file, function(err, res) {
                            results.push({
                                open: true,
                                id: 'asd121212',
                                file: file,
                                name: getNameFromPath(file),
                                isParent: true,
                                children: res
                            });
                            if (!--pending) {
                                done(null, results.sort(sortHandle));
                            }
                        });
                    } else {
                        if (!--pending) {
                            done(null, results.sort(sortHandle));
                        }
                    }


                } else {
                    if (file.charAt(0) !== '.') {
                        results.push({
                            id: 'asd121212',
                            file: file,
                            isParent: false,
                            name: getNameFromPath(file)
                        });
                    }

                    if (!--pending) {
                        done(null, results.sort(sortHandle));
                    }
                }
            });
        });
    });
}

function System() {
    this.init();
}

System.prototype.init = function () {
    var that = this;
    ipc.on('open-directory', function (event, arg) {
        if (arg) {
            typeof that.selectDirCall === 'function' && that.selectDirCall(arg[0]);
        }
    });

    ipc.on('open-file', function (event, arg) {
        if (arg) {
            typeof that.selectFileCall === 'function' && that.selectFileCall(arg[0]);
        }
    });
};

System.prototype.showMenu = function (trayMenuTemplate) {
    var trayMenu = null;
    trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
    Menu.setApplicationMenu(trayMenu);
};

System.prototype.on = function () {

};

System.prototype.readFile = function (path, call) {
    fs.readFile(path, 'utf8', call);
};

System.prototype.say = function () {

};

System.prototype.selectDir = function (call) {
    this.selectDirCall = call;
    ipc.send('open-files');
};

System.prototype.selectFile = function (call) {
    this.selectFileCall = call;
    ipc.send('open-file');
};

System.prototype.openUri = function (uri) {
    ipc.send('open-url', uri);
};

System.prototype.loadFiles = function (path, done) {
    walk(path, done);
};

System.prototype.mkdir = function (path, done) {
    fs.mkdir(path, 0777, done);
};

System.prototype.writeFile = function (path, content, done) {
    fs.writeFile(path, content, 'utf8', done);
};

System.instance = new System();
System.getInstance = function () {
    return System.instance;
};










/*var url = "http://s0.hao123img.com/res/img/logo/logonew.png";
 http.get(url, function(res){
 var imgData = "";
 console.log(res);
 res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
 res.on("data", function(chunk){
 imgData+=chunk;
 });
 res.on("end", function(){
 fs.writeFile(imagePath, imgData, "binary", function(err){
 if(err){
 console.log("down fail");
 }
 console.log("down success");
 });
 });
 });*/

var system = System.getInstance();
var trayMenuTemplate = [
    {
        label: '文件',
        //enabled: false
        submenu: [
            {
                label: '新建',
                click: function () {
                    curFile = null;
                    editor.setValue(''); // TODO
                }
            },
            {
                label: '打开文件',
                click: function () {
                    system.selectFile(function (uri) {
                        if (uri) {
                            openFile(uri);
                        }
                    });
                }
            },
            {
                label: '打开文件夹',
                click: function () {
                    openFolder();
                }
            },
            {
                label: '保存',
                click: function () {
                    save();
                    if (!curFile) {

                    }
                }
            },
            {
                label: '另存为',
                click: function () {
                    ui.msg('暂不支持');
                }
            }
        ]
    },
    {
        label: '更多',
        submenu: [
            {
                label: '设置',
                click: function () {
                    ui.frame('setting.html', {
                        title: '关于'
                    });
                }
            },
            {
                label: 'html转markdown',
                click: function () {
                    window.open('html2md.html');
                }
            }
        ]
    },
    {
        label: '帮助',
        submenu: [
            {
                label: '查看帮助',
                click: function () {
                    help();
                }
            },
            {
                label: '关于',
                //accelerator: 'CmdOrCtrl+M',
                //role: 'reload', minimize minimize
                click: function () {
                    ui.frame('about.html', {
                        title: '关于'
                    });
                }
            },
        ]
    }
];
system.showMenu(trayMenuTemplate);