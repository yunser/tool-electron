require = window.nodeRequire;
window.$ = window.jQuery = require("jquery")
const { remote, shell } = require("electron")
const moment = require("moment")
const path = require("path")
const fs = require("fs")
const os = require("os").platform()
const _ = require("lodash")

let Context = require('./../../node/contextmenu');

let lastDir = null
let currentDir = null
let config = require("./config.json")

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

    //shell.openItem(filedir)
}

let upDir = function(dirname) {
    if (dirname === path.join(dirname, "../")) return
    changeDir(path.join(dirname, "../"))
}

let changeDir = function(dirname) {
    currentDir = dirname
    //lastDir = !lastDir ? dirname : ""

    fs.readdir(dirname, (error, files) => {
        if (error) throw error

        console.log(1);
        let $title = $("#path").val(dirname)
        let $parent = $("#files")

        _.forEach(files.sort(), (files) => {
            let name = files
            let file = dirname + "/" + files
            let home = os.platform === "win32" ? process.env.USERPROFILE : process.env.HOME

            fs.stat(file, function(err, stats) {
                let type = function() {
                    if (stats.isFile()) {
                        return "file"
                    } else if (stats.isDirectory()) {
                        let split = name.toLowerCase().split(".")
                        let last = split[split.length - 1]

                        if (last === "app") {
                            return "file"
                        } else {
                            return "folder"
                        }
                    } else {
                        return undefined
                    }
                }

                let location = file
                let size = type() == "folder" ? "—" : normalizeSize(stats.size)
                let modified = moment(stats.mtime).format("MMM D, YYYY")
                let invisible = isHidden(name)
                let check = type() == "file" ? fileType(name) : null
                let icon = function() {
                    if (type() === "file" && !invisible) {
                        return `${fileType(name)}`
                    } else if (type() === "folder") {
                        if (dirname === home && name === "Google Drive") {
                            return "folder_google_drive"
                        } else {
                            return "folder"
                        }
                    } else {
                        return "file"
                    }
                }

                if (!config.showHiddenFiles && invisible) return

                let $contain = $("<li></li>")
                let $name = $("<span class='file-name'></span>")
                let $size = $("<span class='file-size'></span>")
                let $modif = $("<span class='file-time'></span>")

                if (invisible) {
                    $name.addClass("invisible")
                    $size.addClass("invisible")
                    $modif.addClass("invisible")
                    $name.html(`<span class="file_icon"><img src="res/${icon()}_invisible.svg"></span>${name}`)
                } else {
                    $name.html(`<span class="file_icon"><img src="res/${icon()}.svg"></span>${name}`)
                }

                $size.text(size)
                $modif.text(modified)

                $contain.attr("data-location", location)
                $contain.attr("data-type", type)

                $contain.on("click", function(e) {
                    let location = e.currentTarget.attributes[0].value
                    let type = e.currentTarget.attributes[1].value

                    console.log(location);
                    if (type === "folder") {
                        changeDir(location)
                    } else if (type === "file") {
                        openFile(location)
                    }
                })

                $contain.append($name)
                $contain.append($size)
                $contain.append($modif)
                $parent.append($contain)
            })
        })

        $("#files").empty()
    })
}

let setSidebar = function(object) {
    let icon = "home"
    let title = "Home"

    let $container = $("<li></li>")
    let $template = $(`<span class="file_icon"><img src="res/${icon}.svg"></span>${title}`);

    $container.append($template)
    //$container.append(`<span class="file_icon"><img src="res/${icon}.svg"></span>${title}`)
}

$(function() {
    $("#path").on('keydown', (e) => {
        if (e.keyCode === 73) {
            alert(1);
        }
    });

    $('#files').contextmenu({
        item: 'li',
        content: '#file-menu'
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

    $("#window_close").on("click", (e) => {
        let window = remote.getCurrentWindow()
        let close = window.close()
    })

    if      (platform === "win") changeDir(process.env.USERPROFILE)
    else if (platform === "mac") changeDir(process.env.HOME)
    else                         changeDir(process.env.PWD)


    //setSidebar();

    $('#home').on('click', (e) => {
        changeDir('F:/Users/cjh1/Desktop/');
    });

    $('#download').on('click', (e) => {
        changeDir('G:/install/apache2.4/htdocs/yunser/tool/note/app/file/root/download');
    });

})

$(".waves").mousedown(function(e) {

    var box = $(this);


    var wavesDiv = box.find("div");

    //第一次没有涟漪div，动态生成
    if(wavesDiv[0] == null){
        var div = "<div class='waves-effect'></div>";
        box.append(div);
        wavesDiv = box.find("div");
    }


    //设置按钮样式为’waves-effect‘即去掉动画样式’waves-effect-animation‘
    wavesDiv[0].className = 'waves-effect';

    //计算涟漪坐标（折算成左上角坐标而非中心点），涟漪大小（取外标签最长边）
    var wH = box.width() > box.height() ? box.width() : box.height();
    var iX = e.pageX - box.offset().left;
    var iY = e.pageY - box.offset().top;
    var nX = iX - wH/2;
    var nY = iY - wH/2;

    //设置涟漪div样式，准备播放动画
    wavesDiv.css({
        width: wH,
        height: wH,
        left: nX,
        top: nY
    }).addClass("waves-effect-animation");//播放动画
});