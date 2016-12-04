import {asd} from './es6';
import TabEx from './tab-ex';


var system = System.getInstance();

Array.prototype.contains = Array.prototype.contains || function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

String.prototype.contains = String.prototype.contains || function (str) {
    return this.indexOf(str) >= 0;
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
});
$('#layout-file').contextmenu({
    content: '#file-menu'
});

$('#global-menu-about').on('click', function () {
    ui.alert('markdown编辑器 v2016.11.26');
});
$('#global-menu-help').on('click', function () {
    ui.frame('help.html', {
        title: '帮助'
    });
});
$('#global-menu-close-preview').on('click', function () {
    $('#layout-preview').hide();
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

var preview = document.getElementById("preview");
editor.on("change", function (cm, event) {
    var html = editor.getValue();
    preview.innerHTML = marked(html, {});

    // 字数统计
    var p = $('#preview').find('p').length;
    $('#status').text(html.replace(/\s/g, '').length + '字符, ' + p + '段落');
});

editor.on("scroll", function (cm, event) {
    var info = cm.getScrollInfo();
    var percent = info.top / (info.height - info.clientHeight);
    var scrollTop = ($('#layout-preview')[0].scrollHeight - $('#layout-preview')[0].clientHeight) * percent;
    $('#layout-preview').scrollTop(scrollTop);

});

$('#layout-preview').on('scroll', function () {
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
                    /*fs.writeFile(imagePath, blob, function(err) {

                    })*/

                    /*fs.writeFile(imagePath, blob, "binary", function(err){
                        if(err){
                            console.log("down fail");
                        }
                        console.log("down success");
                    });*/


                }
            }
        } else {
            alert('non-chrome');
        }
    }

    return true;
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
    system.readFile(path, function(err, data) {
        editor.setValue(data);
    });
    
    
    var html = editor.getValue();
    preview.innerHTML = markdown.toHTML(html);
    createDir();
}





var btn = document.getElementById('open-file');

function openFolder() {
    system.selectDir(function (path) {
        if (path) {
            showFolder(path);
        }
    });
}

$(document).on('keydown', function (e) {
    if (e.ctrlKey) {

        switch (e.keyCode) {
            case 66: // b
                editor.replaceSelection('**' + editor.getSelection() + '**');
                return false;
            case 73: // i
                editor.replaceSelection('*' + editor.getSelection() + '*');
                return false;
            case 82: // r
                window.location.reload(true);
                return false;
            case 83: // s
                save();
                return false;
            case 191: // /
                help();
                return false;
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
function getNameFromPath(filename) {
    return filename.substr(filename.lastIndexOf('\\')+1);
}

function getType(filename) {
    var ext = getExt(filename);
    if (!ext) {
        return null;
    }
    if ('txt|css|md'.contains(ext)) {
        return 'text';
    } else if ('png|jpg|gif'.contains(ext)) {
        return 'image'
    } else if ('mp4'.contains(ext)) {
        return 'video';
    } else if ('mp3'.contains(ext)) {
        return 'audio';
    }

    return 'text'; // TODO
    //text/plain
    //text/html
    //application
}

holder.ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    /*if (/image\/!*!/.test(file.type)) {


        var imagePath = basePath + '\\data\\img';
        fs.exists(imagePath, function(exists) {
            if (!exists) {
                fs.mkdirSync(imagePath, 0777);
            }

            var newImageFile = imagePath + '\\' + new Date().getTime() + '.' + getExt(file.path);
            fs.writeFileSync(newImageFile, fs.readFileSync(file.path));

            editor.replaceSelection('![](' + newImageFile + ')');
        });
    } else {
        fs.stat(file.path, function(err, stat) {
            if (stat && stat.isDirectory()) {
                showFolder(file.path);
            } else {
                openFile(file.path);
            }
        });
    }*/
    //openFile(file.path);
    return false;
};
$('#show-files').on('click', function (e) {
    e.preventDefault();
    $('#layout-file').show();
});

$('#global-menu-toggle').on('click', function (e) {
    e.preventDefault();
    if ($('#layout-file').is(':hidden')) {
        $('#layout-file').show();
        $('#layout-editor').css({
            'width': '40%',
            'left': '20%'
        });
        $('#layout-preview').css('width', '40%');
    } else {
        $('#layout-file').hide();
        $('#layout-editor').css({
            'width': '50%',
            'left': '0'
        });
        $('#layout-preview').css('width', '50%');
    }

});

$('#files-refresh').on('click', function (e) {
    e.preventDefault();
    showFolder(curFolder);
});

function save() {
    if (curFile) {
        system.writeFile(curFile, editor.getValue(), function () {
            ui.msg('保存成功');
        });
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
            showFolder(basePath);
        });
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
        system.rename(curFile, curFile.replace(fileName, name));
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
        system.writeFile(curFolder + '\\' + name, '', function () {
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
        system.mkdir(curFolder + '\\' + name, function () {
            ui.msg('添加成功');
            showFolder(basePath);
        });
    })
});

showFolder(basePath);
openFile(basePath + '\\readme.md');



function showFolder(path) {
    curFolder = path;
    system.loadFiles(path, function(err, results) {

        if (err) throw err;

        var zTreeObj;
        // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
        var setting = {
            view: {
                /*showLine: false,*/
                dblClickExpand: false,
            },
            callback: {
                onClick: function (event, treeId, treeNode, clickFlag) {
                    var ext = getExt(treeNode.file);
                    var type = getType(treeNode.file);
                    if (type === 'text') {
                        if (treeNode.children) {
                            curFolder = treeNode.file;
                        } else {
                            openFile(treeNode.file);
                            //$('#layout-file').hide();
                        }
                    } else if (type === 'image') {
                        system.openUri(treeNode.file);
                    } else {
                        ui.msg('暂不支持打开此类型的文件')
                    }

                },
                beforeDrop: function(treeId, treeNodes, targetNode, moveType) {
                    return targetNode ? targetNode.drop !== false : true;
                },
                onDrop: function(event, treeId, treeNodes, targetNode, moveType, isCopy) {
                    if (targetNode) {
                        console.log(treeNodes, targetNode);
                        var fileName = getNameFromPath(treeNodes[0].file);
                        var newName = targetNode.file + '\\' + fileName ;
                        console.log('把' + treeNodes[0].file + '重命名' + newName);
                        system.rename(treeNodes[0].file, newName);
                    }

                }
            },
            edit: {
                enable: true,
                showRemoveBtn: false,
                showRenameBtn: false,
                drag: {
                    isMove: true
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



function help() {
    ui.frame('help.html', {
        title: '帮助'
    });
}

var    textarea = document.getElementsByTagName('textarea')[0],
    read_btn = document.getElementById('read_btn'),
    write_btn = document.getElementById('write_btn');

$('#preview').on('click', 'a', function (e) {
    e.preventDefault();
    system.openUri(this.href);
});

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
            },
            {
                label: '导出为网页',
                click: function () {

                }
            }
        ]
    },
    {
        label: '工具',
        submenu: [
            {
                label: '生成文档',
                click: function () {
                    system.selectDir(function (path) {
                        system.createDoc(path);
                    });
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

var menuevent = {};
function showMenu(menu) {
    var html = '';
    for (var i = 0; i < menu.length; i++) {
        var item = menu[i];

        html += '<li class="nav-item dropdown dropdown-hover">' +
            '<a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown" data-id="' + i + '-0">' +
            item.label + '<i class="caret"></i>' +
            '</a>' +
            (function () {
                if (item.submenu) {
                    var submenu = '<ul class="dropdown-menu">';
                    for (var j = 0; j < item.submenu.length; j++) {
                        submenu += '<li><a data-id="' + i + (j + 1)+ '" href="#">' + item.submenu[j].label + '</a></li>';
                        if (item.submenu[j].click) {
                            menuevent[i + '' + (j + 1)] = item.submenu[j].click;
                        }
                    }
                    submenu += '</ul>';
                    return submenu;

                } else {
                    return '';
                }

            })() + '</li>';
        if (item.click) {
            menuevent[i + '0'] = click;
        }
    }
    $('#menu-layoutit')[0].innerHTML = html;
    $('#menu-layoutit').on('click', 'a', function () {
        var id = $(this).data('id');
        if (menuevent[id]) {
            menuevent[id]();
        }
    })
}

showMenu(trayMenuTemplate);

var tab = new TabEx('#tabs', {
    //monitor: '.topbar'
});

//$('#tabs').addtabs({});

var iddd = 123;
function getIdd() {
    return iddd++;
}

var id = getIdd();
/*tab.add({
    id: $(this).attr('addtabs'),
    title: '标题',
    content: '<textarea id="' + id + '"></textarea>',
})
var editor = CodeMirror.fromTextArea(document.getElementById(id), {
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
 */
