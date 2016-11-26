var require = nodeRequire;
var fs = require('fs');
var path = require('path');
var ipc = require("electron").ipcRenderer;
var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');


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
    function MdEditor() {

    }

    MdEditor.DEFAULTS = {

    };
})();

$(document).contextmenu({
    content: '#global-menu'
});
$('#global-menu-about').on('click', function () {
    ui.alert('markdown编辑器 v2016.11.26');
});
$('#global-menu-help').on('click', function () {
    ui.frame('help.html', {
        title: '帮助'
    });
});

var editor = CodeMirror.fromTextArea(document.getElementById("text-input"), {
    theme: 'ambiance',
    mode: 'gfm',
    selectionPointer: true,
    lineNumbers: true,
    matchBrackets: true,
    indentUnit: 4,
    indentWithTabs: true,
    onChange: function () {

    }
});
editor.setOption('lineWrapping', true);



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
marked(markdownString, function (err, content) {
    if (err) throw err;
    console.log(content);
});

// Synchronous highlighting with highlight.js
/*marked.setOptions({
    highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});*/

//editor.setSize('auto', 'auto');
var preview = document.getElementById("preview");
editor.on("change", function (cm, event) {
    console.log(123)
    var html = editor.getValue();

    //preview.innerHTML = markdown.toHTML(html);
    preview.innerHTML = marked(html, {});
});

function openFile(path) {
    console.log(path);
    curFile = path;
    fs.readFile(path,'utf8',function(err,data){
        editor.setValue(data);
    });
    var html = editor.getValue();
    preview.innerHTML = markdown.toHTML(html);
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
    console.log(arg) // prints "pong"
});
ipc.send('asynchronous-message', 'ping')

var btn = document.getElementById('open-file');

function openFolder() {
    ipc.send('open-files');
}



$(document.body).on('keydown', function (e) {
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
var holder = document.getElementById('layout-editor');
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
$('#show-files').on('click', function (e) {
    e.preventDefault();
    console.log('显示目录')
    $('#layout-file').show();
});
$('#hide-files').on('click', function (e) {
    e.preventDefault();
    $('#layout-file').hide();
});
var basePath = 'F:\\Users\\cjh1\\Desktop\\note';
$('#files-refresh').on('click', function (e) {
    e.preventDefault();
    showFolder(basePath);
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


showFolder(basePath);
openFile(basePath + '\\other\\readme.md');



function showFolder(path) {
    walk(path, function(err, results) {
        console.log('最终结果', results);

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
                        return;
                    }
                    console.log(treeNode);
                    console.log(clickFlag)
                    openFile(treeNode.file);
                    //$('#layout-file').hide();
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
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        console.log('目录',getNameFromPath(file));
                        results.push({
                            open: true,
                            id: 'asd121212',
                            file: file,
                            name: getNameFromPath(file),
                            isParent: true,
                            children: res
                        });
                        if (!--pending) done(null, results);
                    });
                } else {
                    console.log('文件',getNameFromPath(file))
                    results.push({
                        id: 'asd121212',
                        file: file,
                        name: getNameFromPath(file)
                    });
                    if (!--pending) done(null, results);
                }
            });
        });
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
        ]
    },
    {
        label: '帮助',
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

