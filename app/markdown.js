var require = nodeRequire;
var fs = require('fs');
var path = require('path');
var ipc = require("electron").ipcRenderer;
var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var http = require("http");

Array.prototype.contains = Array.prototype.contains || function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

// 上下文菜单插件
;(function ($) {
    UI.$curContextElem = null;

    function Context(elem, option) {
        var that = this;
        that.opts = $.extend({}, Context.DEFAULTS, option);
        that.elem = elem;
        var $menu = $(that.opts.content);
        $menu.css('zIndex', 10000001);

        function pot($elem, x, y) {
            var width = $elem.outerWidth();
            var height = $elem.outerHeight();
            var winWidth = $(window).width();
            var winHeight = $(window).height();
            var ptX = x;
            var ptY = y;

            if (ptY < winHeight - height) {

            } else if (ptY > height) {
                ptY = y - height;
            } else {
                ptY = winHeight - height;
            }

            if (ptX < winWidth - width) {

            } else if (ptX > width) {
                ptX = x - width;
            } else {
                ptX = winWidth - width;
            }

            $elem.css({
                'left': ptX,
                'top': ptY
            });
        }

        function handle(elem, e) {
            e.preventDefault();
            e.stopPropagation();

            if (UI.$curContextElem) {
                UI.$curContextElem.hide();
            }
            UI.$curContextElem = $menu;

            pot($menu, e.clientX, e.clientY);

            //$overlay.show();
            $menu.show();
            that.opts.show && that.opts.show(elem);

            $menu.addClass('context-active');

            UI.$curContextElem = $menu;

        }

        if (that.opts.item) {
            $(elem).on('contextmenu', that.opts.item, function (e) {
                handle(this, e);
                return true;
            });
        } else {
            $(elem).on('contextmenu', function (e) {
                handle(this, e);
                return true;
            });
        }


        $menu.on('contextmenu', function () {
            return false;
        });


    }

    Context.DEFAULTS = {
        //content
        show: function (ui) {},
        hide: function (ui) {}
    };

    $.fn.contextmenu = function (option) {
        return $(this).each(function (e) {
            new Context(this, option);
        });
    }

    $(document).on('click', function (e) {
        if ($(e.target).parents(".context-active").length == 0
            || $(e.target).is('.dropdown-menu a')) {
            if (UI.$curContextElem) {
                UI.$curContextElem.hide();
                UI.$curContextElem.removeClass('context-active');
                UI.$curContextElem = null;
            }
        }
    });
})(jQuery);

;(function () {
    function MdEditor(option) {
        var that = this;
        this.opts = $.extend({}, MdEditor.DEFAULTS, option);

        // 五分钟自动保存一次
        if (that.opts.autoSave) {
            setInterval(function () {
                save();
            }, 5 * 60 * 1000);
        }
    }

    MdEditor.DEFAULTS = {
        autoSave: false
    };

    window.MdEditor = MdEditor;
})();


var mdeditor = new MdEditor({
    autoSave: true
});

$(document).contextmenu({
    content: '#global-menu'
});
$('#layout-preview').contextmenu({
    item: 'img',
    content: '#image-menu'
})

$('#global-menu-about').on('click', function () {
    ui.alert('markdown编辑器 v2016.11.26');
});
$('#global-menu-help').on('click', function () {
    ui.frame('help.html', {
        title: '帮助'
    });
});

var editor = CodeMirror.fromTextArea(document.getElementById("text-input"), {
    //theme: 'emd',
    mode: 'gfm',
    selectionPointer: true,
    //lineNumbers: true,
    matchBrackets: true,
    indentUnit: 4,
    indentWithTabs: true,
    onChange: function () {

    }
});
editor.setOption('lineWrapping', true);

function setEditorTheme(theme) {
    editor.setOption("theme", theme);
    if (!$('#style-' + theme).length) {
        $('head').append($('<link id="style-' + theme + '" rel="stylesheet" href="asset/lib/codemirror/theme/' + theme + '.css">'));
    }
}
setEditorTheme('emd')

$('#theme-select').on('change', function () {

    console.log(this.options[this.selectedIndex].text);
    var theme = this.options[this.selectedIndex].text;
    setEditorTheme(theme);
});

var markdownString = '```js\n console.log("hello"); \n```';

var marked = require('./asset/lib/marked/marked.js');

// Async highlighting with pygmentize-bundled
/*marked.setOptions({
    highlight: function (code, lang, callback) {
        require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
            callback(err, result.toString());
        });
    }
});*/

// Using async version of marked
/*marked(markdownString, function (err, content) {
    if (err) throw err;
});*/

// Synchronous highlighting with highlight.js
/*marked.setOptions({
    highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});*/

//editor.setSize('auto', 'auto');
var preview = document.getElementById("preview");
editor.on("change", function (cm, event) {
    var html = editor.getValue();

    //preview.innerHTML = markdown.toHTML(html);
    preview.innerHTML = marked(html, {});

    // 字数统计

    var p = $('#preview').find('p').length;
    $('#status').text(html.replace(/\s/g, '').length + '字符, ' + p + '段落');

});
editor.on("scroll", function (cm, event) {
    //var html = editor.mirror.currentLine();
    //var scrollTop = $('#layout-preview').height() * cm.getScrollInfo().top / cm.getScrollInfo().height;
    //scrollTop = cm.getScrollInfo().top;
    //$('#layout-preview').scrollTop(scrollTop);
    console.log();
    var info = cm.getScrollInfo();
    var percent = info.top / (info.height - info.clientHeight);
    console.log(percent);
    //console.log(info);
    var scrollTop = ($('#layout-preview')[0].scrollHeight - $('#layout-preview')[0].clientHeight) * percent;
    $('#layout-preview').scrollTop(scrollTop);

});
$('#layout-preview').on('scroll', function () {
    console.log(this.scrollTop / (this.scrollHeight - this.clientHeight))

    var range = this.scrollHeight - this.clientHeight;
});

function blobToFile(theBlob, fileName){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}
editor.on("paste", function (cm, e) {
    console.log(e)
    var clipboard = e.clipboardData;
    var text, textType = 'text/plain';
    if (clipboard) { // w3c(webkit,opera...)
        console.log(text = clipboard.getData(textType));
        if (clipboard.types && clipboard.types.contains(textType)) {
            //e.preventDefault();
            text = clipboard.getData(textType);
            //this.replaceText(range, text)
        }

        if ( e.clipboardData.items ) {
            // google-chrome
            console.log('support clipboardData.items(chrome ...)');
            var ele = e.clipboardData.items
            for (var i = 0; i < ele.length; ++i) {
                if ( ele[i].kind == 'file' && ele[i].type.indexOf('image/') !== -1 ) {
                    console.log(ele[i]);

                    var blob = ele[i].getAsFile();
                    console.log(blob);

                    window.URL = window.URL || window.webkitURL;
                    var blobUrl = window.URL.createObjectURL(blob);
                    console.log(blobUrl);

                    var imagePath = basePath + '\\data\\img\\123.jpg';
                    console.log(111);
                    var buf = new Buffer(blob, 'base64'); // decode
                    console.log(222);
                    fs.writeFile(imagePath, blob, function(err) {

                    })

                    /*fs.writeFile(imagePath, blob, "binary", function(err){
                        if(err){
                            console.log("down fail");
                        }
                        console.log("down success");
                    });*/

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
                }
            }
        } else {
            alert('non-chrome');
        }
    }

});


function createDir() {
    //是否显示导航栏
    var showNavBar = true;
    //是否展开导航栏
    var expandNavBar = true;

    var h1s = $("#preview").find("h1");
    var h2s = $("#preview").find("h2");
    var h3s = $("#preview").find("h3");
    var h4s = $("#preview").find("h4");
    var h5s = $("#preview").find("h5");
    var h6s = $("#preview").find("h6");

    var headCounts = [h1s.length, h2s.length, h3s.length, h4s.length, h5s.length, h6s.length];
    var vH1Tag = null;
    var vH2Tag = null;
    for(var i = 0; i < headCounts.length; i++){
        if(headCounts[i] > 0){
            if(vH1Tag == null){
                vH1Tag = 'h' + (i + 1);
            }else{
                vH2Tag = 'h' + (i + 1);
            }
        }
    }
    if(vH1Tag == null){
        return;
    }

    console.log('开始');
    $("#toc").append('<div class="BlogAnchor">' +
        '<span style="color:red;position:absolute;top:-6px;left:0px;cursor:pointer;" onclick="$(\'.BlogAnchor\').hide();">×</span>' +
        '<p>' +
        '<b id="AnchorContentToggle" title="收起" style="cursor:pointer;">目录▲</b>' +
        '</p>' +
        '<div class="AnchorContent" id="AnchorContent"> </div>' +
        '</div>' );

    var vH1Index = 0;
    var vH2Index = 0;
    $("#preview").find("h1,h2,h3,h4,h5,h6").each(function(i,item){
        var id = '';
        var name = '';
        var tag = $(item).get(0).tagName.toLowerCase();
        var className = '';
        if(tag == vH1Tag){
            id = name = ++vH1Index;
            name = id;
            vH2Index = 0;
            className = 'item_h1';
        }else if(tag == vH2Tag){
            id = vH1Index + '_' + ++vH2Index;
            name = vH1Index + '.' + vH2Index;
            className = 'item_h2';
        }
        $(item).attr("id","wow"+id);
        $(item).addClass("wow_head");
        $("#AnchorContent").css('max-height', ($(window).height() - 180) + 'px');
        $("#AnchorContent").append('<li><a class="nav_item '+className+' anchor-link" onclick="return false;" href="#" link="#wow'+id+'">'+name+" · "+$(this).text()+'</a></li>');
    });

    $("#AnchorContentToggle").click(function(){
        var text = $(this).html();
        if(text=="目录▲"){
            $(this).html("目录▼");
            $(this).attr({"title":"展开"});
        }else{
            $(this).html("目录▲");
            $(this).attr({"title":"收起"});
        }
        $("#AnchorContent").toggle();
    });
    $(".anchor-link").click(function(){
        $("html,body").animate({scrollTop: $($(this).attr("link")).offset().top}, 500);
    });

    var headerNavs = $(".BlogAnchor li .nav_item");
    var headerTops = [];
    $(".wow_head").each(function(i, n){
        headerTops.push($(n).offset().top);
    });
    $(window).scroll(function(){
        var scrollTop = $(window).scrollTop();
        $.each(headerTops, function(i, n){
            var distance = n - scrollTop;
            if(distance >= 0){
                $(".BlogAnchor li .nav_item.current").removeClass('current');
                $(headerNavs[i]).addClass('current');
                return false;
            }
        });
    });

    if(!showNavBar){
        $('.BlogAnchor').hide();
    }
    if(!expandNavBar){
        $(this).html("目录▼");
        $(this).attr({"title":"展开"});
        $("#AnchorContent").hide();
    }
}

function openFile(path) {
    curFile = path;
    fs.readFile(path,'utf8',function(err,data){
        editor.setValue(data);
    });
    var html = editor.getValue();
    preview.innerHTML = markdown.toHTML(html);
    console.log('1212')
    createDir();
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
        showFolder(arg[0]);
    }

});
ipc.on('open-file', function (event, arg) {
});
ipc.send('asynchronous-message', 'ping')

var btn = document.getElementById('open-file');

function openFolder() {
    ipc.send('open-files');
}

$(document).on('keydown', function (e) {
    console.log(e.keyCode)
    if (e.ctrlKey) {

        switch (e.keyCode) {
            case 66: // b
                editor.replaceSelection('**' + editor.getSelection() + '**');
                break;
            case 73: // i
                editor.replaceSelection('*' + editor.getSelection() + '*');
                break;
            case 82: // r
                window.location.reload(true);
                break;
            case 83: // s
                save();
                break;
            case 191: // /
                help();
                break;
        }
    }
});
var curFile;
var basePath = 'F:\\Users\\cjh1\\Desktop\\note';
var curFolder = basePath;
var holder = document.getElementById('layout-editor');
holder.ondragover = function () {
    return false;
};
holder.ondragleave = holder.ondragend = function () {
    return false;
};

function getExt(filename) {
    return filename.toLowerCase().substr(filename.lastIndexOf(".") + 1);
}

holder.ondrop = function (e) {
    console.log(112);
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    if (/image\/*/.test(file.type)) {


        var imagePath = basePath + '\\data\\img';
        fs.exists(imagePath, function(exists) {
            if (!exists) {
                fs.mkdirSync(imagePath, 0777);
            }

            var newImageFile = imagePath + '\\' + new Date().getTime() + '.' + getExt(file.path);
            fs.writeFileSync(newImageFile, fs.readFileSync(file.path));

            editor.replaceSelection('![](' + newImageFile + ')');
        });


        console.log(curFolder);
    } else {
        fs.stat(file.path, function(err, stat) {
            if (stat && stat.isDirectory()) {
                showFolder(file.path);
            } else {
                openFile(file.path);
            }
        });
    }



    console.log(file);

    //openFile(file.path);
    return false;
};
$('#show-files').on('click', function (e) {
    e.preventDefault();
    $('#layout-file').show();
});
$('#hide-files').on('click', function (e) {
    e.preventDefault();
    $('#layout-file').hide();
});

$('#files-refresh').on('click', function (e) {
    e.preventDefault();
    showFolder(curFolder);
});

function save() {
    if (curFile) {
        fs.writeFileSync(curFile, editor.getValue(), 'utf8');
        ui.msg('保存成功');
    }
}
$('#save').on('click', function (e) {
    e.preventDefault();
    save();
});
$('#remove-file').on('click', function () {
    ui.confirm('删除' + curFile, function (index) {
        ui.close(index);
        fs.unlink(curFile, function () {
            console.log('刷新')
            showFolder(basePath);
        });
        console.log('刷新2')
    });
});
$('#remame').on('click', function () {
    var fileName = getNameFromPath(curFile);
    ui.prompt({
        title: '新的名称',
        value: fileName
    }, function (name, index) {
        if (!name) {
            ui.msg('请输入文件名');
            return;
        }
        ui.close(index);
        fs.rename(curFile, curFile.replace(fileName, name));
    })
});
$('#add-file').on('click', function () {
    ui.prompt({
        title: '文件名',
    }, function (name, index) {
        if (!name) {
            ui.msg('请输入文件名');
            return;
        }
        ui.close(index);
        fs.writeFile(curFolder + '\\' + name, '', function () {
            ui.msg('添加成功');
            showFolder(basePath);
        });
    })
});
$('#add-folder').on('click', function () {
    ui.prompt({
        title: '文件夹名',
    }, function (name, index) {
        if (!name) {
            ui.msg('请输入文件夹名');
            return;
        }
        ui.close(index);
        fs.mkdir(curFolder + '\\' + name, 0777, function () {
            ui.msg('添加成功');
            showFolder(basePath);
        });
    })
});

showFolder(basePath);
openFile(basePath + '\\readme.md');



function showFolder(path) {
    curFolder = path;
    walk(path, function(err, results) {

        if (err) throw err;

        var zTreeObj;
        // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
        var setting = {
            view: {
                showLine: false,
                dblClickExpand: false,
            },
            callback: {
                onClick: function (event, treeId, treeNode, clickFlag) {
                    if (treeNode.children) {
                        curFolder = treeNode.file;
                    } else {
                        openFile(treeNode.file);
                        //$('#layout-file').hide();
                    }

                }
            }

        };
        // zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）
        var zNodes = [
            {
                id: '1212',
                name:"test1",
                open:true,
                children:[
                    {name:"test1_1"}, {name:"test1_2"}
                ]
            },
            {
                id: '1aaa',
                name:"test2",
                open:true,
                children: [
                    {
                        name:"test2_1"}, {name:"test2_2"}]}
        ];
        zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, results);
    });
}

function getNameFromPath(filename) {
    return filename.substr(filename.lastIndexOf('\\')+1);
}
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
        console.log('长度'+pending)
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


function help() {
    ui.frame('help.html', {
        title: '帮助'
    });
}

var    textarea = document.getElementsByTagName('textarea')[0],
    read_btn = document.getElementById('read_btn'),
    write_btn = document.getElementById('write_btn');

var trayMenu = null;
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
trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
Menu.setApplicationMenu(trayMenu);

$('#preview').on('click', 'a', function (e) {
    e.preventDefault();
    ipc.send('open-url', this.href);
});
