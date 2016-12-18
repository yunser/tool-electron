let require = window.nodeRequire;

const { remote, shell } = require("electron");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const os = require("os").platform();
const _ = require("lodash");

const system = chrome.ex.system;
const fileUtil = chrome.ex.fileUtil;
const Context = require('../../node/contextmenu');
const QiniuDevice = require('./QiniuDevice');
const LocalDevice = require('./LocalDevice.js');

let localDevice = new LocalDevice(); // local file device
let qiniuDevice = new QiniuDevice(); // Qiniu Device
let curDevice = localDevice; // current device

let lastDir = null
let currentDir = null
let config = require("./config.json")
let selectedFile = null;

let platform =
    os === "darwin" ? "mac" :
    os === "win32"  ? "win" :
    os === "linux"  ? "linux" : "unknown"

let fileType = function(filename) {
    let types = require("./modules/files.json")
    let split = filename.toLowerCase().split(".")
    let last = split[split.length - 1]

    if (last in types) {
        return "file_" + types[last]
    } else {
        return "file"
    }
}

let isHidden = function(path) {
    let blacklist = require("./modules/hidden.json")
    let check = (/(^|\/)\.[^\/\.]/g).test(path)

    if (blacklist[platform].indexOf(path) >= 0) {
        return true
    } else if (check) {
        return true
    } else {
        return false
    }
}

let normalizeSize = function(bytes) {
    if (bytes === 0) return "0.00 B"
    var e = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, e))) + " " + " KMGTP".charAt(e) + "B"
}

let openFile = function(filedir) {
    //path.resolve(system.getUserPath(),
    system.openFile(filedir);
}

let upDir = function(dirname) {
    if (dirname === path.join(dirname, "..")) {
        return;
    }
    openDir(path.join(dirname, "..").replace(/\\/, '/'));
}

let openDir = function(dirname) {
    currentDir = dirname
    curDevice.list(dirname, (err, list) => {
        if (err) {
            ui.msg('can not open the directory');
            return;
            //throw error;
        }

        let $title = $("#path").val(dirname);
        let $list = $("#file-list");
        $list.empty();

        list.forEach((file) => {
            let $contain = $("<li></li>")
            let $name = $("<span class='file-name'></span>")
            let $size = $("<span class='file-size'></span>")
            let $modif = $("<span class='file-time'></span>")

            if (file.invisible) {
                $name.addClass("invisible")
                $size.addClass("invisible")
                $modif.addClass("invisible")
                $name.html(`<span class="file_icon"><img src="res/${file.icon}_invisible.svg"></span>${file.name}`)
            } else {
                $name.html(`<span class="file_icon"><img src="res/${file.icon}.svg"></span>${file.name}`)
            }

            $size.text(file.size)
            $modif.text(file.modified)

            $contain.attr("data-location", file.location);
            $contain.attr("data-url", file.url);
            $contain.attr("data-type", file.type);
            $contain.append($name)
            $contain.append($size)
            $contain.append($modif)
            $list.append($contain)

        });

    });
}

let setSidebar = function(object) {
    let icon = "home"
    let title = "Home"

    let $container = $("<li></li>")
    let $template = $(`<span class="file_icon"><img src="res/${icon}.svg"></span>${title}`);

    $container.append($template)
    //$container.append(`<span class="file_icon"><img src="res/${icon}.svg"></span>${title}`)
}

$('#file-list').on('click', 'li', function(e) {
    let $this = $(this);
    let type = $this.data('type');

    if (type === "folder") {
        openDir($this.data('location'))
    } else if (type === "file") {
        openFile($this.data('url'));
    }
});

$('#file-list').contextmenu({
    item: 'li',
    content: '#file-menu',
    show(ui) {
        selectedFile = $(ui).data('location');
    }
});

$('#file-content').contextmenu({
    content: '#content-menu',
    show(ui) {

    }
});

$("#control_updir").on("click", (e) => {
    upDir(currentDir)
})

$("#window_minimize").on("click", (e) => {
    let window = remote.getCurrentWindow()
    let minimize = window.minimize()
})

$("#window_maximize").on("click", (e) => {
    let window = remote.getCurrentWindow()
    let maximize = !window.isMaximized() ? window.maximize() : window.unmaximize()
})

let isHome = true;

$("#window_close").on("click", (e) => {
    let window = remote.getCurrentWindow()
    let close = window.close()
})


$('#path').on('focus', function (e) {
    this.select();
});

$('#path').on('keydown', function (e) {
    if (e.keyCode === 13) {
        let file = this.value;
        fs.stat(file, function (err, stat) {
            if (err) {
                ui.msg('input error');
                return;
            }

            if (stat.isDirectory()) {
                openDir(file);
            } else {
                //
                ui.msg('暂未实现打开功能');
            }
        })
    }

});

//setSidebar();

$('#home').on('click', (e) => {
    let userPath = system.getUserPath();
    curDevice = localDevice;
    openDir('/');
});

$('#download').on('click', (e) => {
    let userPath = system.getUserPath();
    openDir('/Downloads');
});

$('#network').on('click', (e) => {
    let userPath = system.getUserPath();
    curDevice = qiniuDevice;
    openDir('/qiniu');
});

// if the url has parameter path, open the path TODO
if (window.location.search) {
    let param = window.location.search.split('?')[1];
    let path = param.split('&')[0];
    path = path.split('=')[1];
    openDir(path);
} else {
    /*if (platform === "win") {
        changeDir(process.env.USERPROFILE);
    }
    else if (platform === "mac") {
        changeDir(process.env.HOME)
    }
    else {
        changeDir(process.env.PWD)
    }*/
    openDir('/');
}

$('#add').on('click', function (e) {

});

$('#content-menu-add-file').on('click', function (e) {
    ui.prompt({
        title: 'Filename',
    }, function (name, index) {
        if (!name) {
            ui.msg('Please input filename');
            return;
        }

        if (/\/|\\|:|\*|\?|\"|<|>\|/.test(name)) {
            ui.msg('文件名不能包含下列任何字符：/\\:*?"<>|');
            return;
        }

        ui.close(index);
        curDevice.addFile(currentDir + '/' + name);
        openDir(currentDir);
    })
});

$('#content-menu-add-folder').on('click', function (e) {
    ui.prompt({
        title: 'Folder Name',
    }, function (name, index) {
        if (!name) {
            ui.msg('Please input folder name');
            return;
        }
        if (/\/|\\|:|\*|\?|\"|<|>\|/.test(name)) {
            ui.msg('文件夹名不能包含下列任何字符：/\\:*?"<>|');
            return;
        }
        ui.close(index);
        curDevice.addFolder(currentDir + '/' + name);
        openDir(currentDir);
    })
});

$('#content-menu-refresh').on('click', function (e) {
    console.log(currentDir)
    openDir(currentDir);
});

$('#file-menu-remove').on('click', function (e) {
    let fileName = fileUtil.getNameFromPath(selectedFile);
    ui.confirm('Remove  ' + fileName, function (index) {
        ui.close(index);
        curDevice.removeFile(selectedFile, () => {
            openDir(currentDir);
        });
    });
});

$('#file-menu-rename').on('click', function (e) {
    let fileName = fileUtil.getNameFromPath(selectedFile);
    ui.prompt({
        title: 'New Name',
    }, function (name, index) {
        if (!name) {
            ui.msg('Please input new name');
            return;
        }
        if (/\/|\\|:|\*|\?|\"|<|>\|/.test(name)) {
            ui.msg('文件夹名不能包含下列任何字符：/\\:*?"<>|');
            return;
        }
        ui.close(index);
        curDevice.renameFile(selectedFile, currentDir + '/' + name);
        openDir(currentDir);
    })
});
