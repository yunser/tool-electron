var fs = require('fs');
var ipc = require("electron").ipcRenderer;
var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var path = require('path');

//console.log(ipc.sendSync('synchronous-message', 'ping')) // prints "pong"

function openFile(path) {
    console.log(path)
    curFile = path;
    fs.readFile(path,'utf8',function(err,data){
        editor.txt.$txt.html(data);
    });
}
ipc.on('asynchronous-reply', function (event, arg) {
});
ipc.on('open-file', function (event, arg) {
    if (arg) {
        openFile(arg[0]);
    }
});
ipc.on('open-directory', function (event, arg) {
    if (arg) {
        walk(arg[0], function(err, results) {
            if (err) throw err;

            console.log(results);
            var $list = $('#file-list');
            $list.empty();
            var html = '';
            for (var i = 0; i < results.length; i++) {
                html += '<li class="file-item" data-url="' + results[i] + '"><a class="file-link" href="">' + results[i] + '</a> </li>'
            }
            $list[0].innerHTML = html;
        });
    }

});
ipc.on('open-file', function (event, arg) {
    console.log(arg) // prints "pong"
});
ipc.send('asynchronous-message', 'ping')

var btn = document.getElementById('open-file');

function openFolder() {
    ipc.send('open-files');
}

$(document).on('keydown', function (e) {
    console.log(e.keyCode);
    if (e.ctrlKey) {
        switch (e.keyCode) {
            case 82:
                window.location.reload(true);
                break;
            case 83: // s
                save();
                break;
        }
    }
});
var curFile;
var holder = document.getElementById('editor');
holder.ondragover = function () {
    return false;
};
holder.ondragleave = holder.ondragend = function () {
    return false;
};
holder.ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    openFile(file.path);
    return false;
};
$('#file-list').on('click', '.file-link', function (e) {
    e.preventDefault();
    var url = this.parentNode.getAttribute('data-url');
    openFile(url);
});
function save() {
    if (curFile) {
        fs.writeFileSync(curFile, editor.txt.$txt.html(), 'utf8');
        ui.msg('保存成功');
    }
}
$('#save').on('click', function (e) {
    e.preventDefault();
    save();
});

var editor = new Editor('editor');
editor.create();

var dir = 'e:\\note';

var fs = require('fs');
var path = require('path');
var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};



var    textarea = document.getElementsByTagName('textarea')[0],
    read_btn = document.getElementById('read_btn'),
    write_btn = document.getElementById('write_btn');

var trayMenu = null;
var trayMenuTemplate = [
    {
        label: '文件',
        /*enabled: false*/
        submenu: [
            {
                label: '新建',
                //accelerator: 'CmdOrCtrl+N',
                click: function () {
                    curFile = null;
                    editor.txt.$txt.html('<p><br></p>'); // TODO
                }
            },
            {
                label: '打开文件',
                click: function () {
                    ipc.send('open-file');
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
        ]
    },
    {
        label: '帮助',
        /*click: function () {
            ipc.send('close-main-window');
        },*/
        submenu: [
            {
                label: '查看帮助',
                click: function () {
                    ui.frame('help.html', {
                        title: '帮助'
                    });
                }
            },
            {
                label: '关于',
                click: function () {
                    ui.frame('about.html', {
                        title: '关于'
                    });
                }
            },
            /*{
                label: '查看帮助',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize'
            },*/
            /*{
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                role: 'reload',
                //role: 'close'
            }*/
        ]
    }
];
trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
Menu.setApplicationMenu(trayMenu);

/*


 var menu = new Menu();
 menu.append(new MenuItem({ label: 'MenuItem1', click: function() { console.log('item 1 clicked'); } }));
 menu.append(new MenuItem({ type: 'separator' }));
 menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));

 window.addEventListener('contextmenu', function (e) {
 e.preventDefault();
 menu.popup(remote.getCurrentWindow());
 }, false);*/
