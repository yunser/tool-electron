const require = nodeRequire;
const TabEx = require('../../node/TabEx.js');
const storage  = require('../../node/storage');
const ContextMenu = require('../../node/contextmenu');
const tool  = require('../../node/tool');
const system = require('../../node/system.js');
const path = require('path');
const fileUtil = require('../../node/FileUtil');

const isInline = token => token && token.type === 'inline';
const isParagraph = token => token && token.type === 'paragraph_open';
const isListItem = token => token && token.type === 'list_item_open';
const startsWithTodoMarkdown = token => token && /^\[( |x|X)\]/.test(token.content);

function isTodoItem(tokens, index) {
    return isInline(tokens[index]) &&
        isParagraph(tokens[index - 1]) &&
        isListItem(tokens[index - 2]) &&
        startsWithTodoMarkdown(tokens[index])
}

function setAttr(token, name, value) {
    const index = token.attrIndex(name)
    const attr = [name, value]

    if (index < 0) {
        token.attrPush(attr)
    } else {
        token.attrs[index] = attr
    }
}

function parentToken(tokens, index) {
    const targetLevel = tokens[index].level - 1
    for (let i = index - 1; i >= 0; i--) {
        if (tokens[i].level === targetLevel) {
            return i
        }
    }
    return -1
}

function todoify(token, TokenConstructor) {
    token.children.unshift(createTodoItem(token, TokenConstructor))

    const sliceIndex = '[ ]'.length
    token.content = token.content.slice(sliceIndex)
    token.children[1].content = token.children[1].content.slice(sliceIndex)
}

function createTodoItem(token, TokenConstructor) {
    const todo = new TokenConstructor('html_inline', '', 0)
    if (/^\[ \]/.test(token.content)) {
        todo.content = '<input type="checkbox">'
    } else if (/^\[(x|X)\]/.test(token.content)) {
        todo.content = '<input type="checkbox" checked>'
    }
    return todo
}

class FileManager {
    constructor() {
        this.rootFile = 'F:\\Users\\cjh1\\Desktop\\note'; // 根目录
        this.selectFile = null; // 选择的文件
        this.curFile = null; // 当前正在编辑的文件
        this.treeObj = null;
    }

    refresh () {
        this.openFolder(this.rootFile);
    }

    openFolder(path) {
        let that = this;
        this.rootFile = path;
        this.curFile = null;
        system.loadFiles(path, function(err, results) {
            if (err) {
                throw err;
            }


            // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
            var setting = {
                view: {
                    /*showLine: false,*/
                    dblClickExpand: false,
                },
                callback: {
                    onClick: function (event, treeId, treeNode, clickFlag) {
                        var ext = fileUtil.getExt(treeNode.file);
                        var type = fileUtil.getType(treeNode.file);
                        if (type === 'text') {
                            if (!treeNode.children) {
                                openFile(treeNode.file);
                            }
                        } else if (type === 'image') {
                            system.openUri(treeNode.file);
                        } else {
                            ui.msg('unsupported format')
                        }

                    },
                    onRightClick: function (e, treeId, treeNode) {
                        if (!treeNode) {
                            return false;
                        }

                        fm.selectedNode = treeNode;
                        fm.selectFile = treeNode.file;
                        ui.contextmenu($('#file-menu')[0], e.clientX, e.clientY);
                        /*var ext = fileUtil.getExt(treeNode.file);
                         var type = fileUtil.getType(treeNode.file);
                         if (type === 'text') {
                         if (treeNode.children) {
                         fm.selectFile = treeNode.file;
                         } else {
                         openFile(treeNode.file);
                         //$('#layout-file').hide();
                         }
                         } else if (type === 'image') {
                         system.openUri(treeNode.file);
                         } else {
                         ui.msg('暂不支持打开此类型的文件')
                         }*/
                        return false;
                    },
                    beforeDrop: function(treeId, treeNodes, targetNode, moveType) {
                        return targetNode ? targetNode.drop !== false : true;
                    },
                    onDrop: function(event, treeId, treeNodes, targetNode, moveType, isCopy) {
                        if (targetNode) {
                            treeNodes.forEach(function (node) {
                                var fileName = fileUtil.getNameFromPath(node.file);
                                var newName = targetNode.file + '\\' + fileName ;
                                system.rename(node.file, newName);
                                node.file = newName;
                            });

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
            that.treeObj = $.fn.zTree.init($("#treeDemo"), setting, results);
        });
    }

    removeSelectFile() {
        system.removeFile(this.selectFile, () => {
            this.treeObj.removeNode(this.selectedNode);
        });
    }

    addFile(path) {
        system.writeFile(path, '', () => {
            ui.msg('添加成功');
            this.treeObj.addNodes(this.selectedNode, {
                name: fileUtil.getNameFromPath(path),
                isParent: false,
                file: path
            });
            //fm.openFolder(fm.rootFile);
        });
    }
}



let preview = document.getElementById("preview");

let editor = CodeMirror.fromTextArea(document.getElementById("text-input"), {
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

let fm = new FileManager();
fm.openFolder(fm.rootFile);
openFile(fm.rootFile + '\\readme.md');

;(function () {
    function MdEditor(option) {
        let that = this;
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


let mdeditor = new MdEditor({
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
    content: '#files-menu'
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



editor.setOption('lineWrapping', true);

function setEditorTheme(theme) {
    editor.setOption("theme", theme);
    if (!$('#style-' + theme).length) {
        $('head').append($('<link id="style-' + theme + '" rel="stylesheet" href="asset/lib/codemirror/theme/' + theme + '.css">'));
    }
}
setEditorTheme('emd')

$('#theme-select').on('change', function () {
    let theme = this.options[this.selectedIndex].text;
    setEditorTheme(theme);
});


editor.on("change", function (cm, event) {
    let text = editor.getValue();
    let md = window.markdownit();
    md.core.ruler.after('inline', 'evernote-todo', state => {
        const tokens = state.tokens
        for (let i = 0; i < tokens.length; i++) {
            if (isTodoItem(tokens, i)) {
                todoify(tokens[i], state.Token)
                setAttr(tokens[i - 2], 'class', 'task-list-item')
                setAttr(tokens[parentToken(tokens, i - 2)], 'class', 'task-list')
            }
        }
    })
    //md.use(require('markdown-it-enml-todo'))
    preview.innerHTML = md.render(text);

    // 字数统计
    let p = $('#preview').find('p').length;
    $('#status').text(text.replace(/\s/g, '').length + '字符, ' + p + '段落');
});

editor.on("scroll", function (cm, event) {
    let info = cm.getScrollInfo();
    let percent = info.top / (info.height - info.clientHeight);
    let scrollTop = ($('#layout-preview')[0].scrollHeight - $('#layout-preview')[0].clientHeight) * percent;
    $('#layout-preview').scrollTop(scrollTop);

});

$('#layout-preview').on('scroll', function () {
    let range = this.scrollHeight - this.clientHeight;
});

function blobToFile(theBlob, fileName){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}
editor.on("paste", function (cm, e) {
    let clipboard = e.clipboardData;
    let text, textType = 'text/plain';
    if (clipboard) { // w3c(webkit,opera...)
        if (clipboard.types && clipboard.types.contains(textType)) {
            //e.preventDefault();
            text = clipboard.getData(textType);
            //this.replaceText(range, text)
        }

        if ( e.clipboardData.items ) {
            // google-chrome
            let ele = e.clipboardData.items
            for (let i = 0; i < ele.length; ++i) {
                if ( ele[i].kind == 'file' && ele[i].type.indexOf('image/') !== -1 ) {

                    let blob = ele[i].getAsFile();

                    window.URL = window.URL || window.webkitURL;
                    let blobUrl = window.URL.createObjectURL(blob);

                    let imagePath = fm.rootFile + '\\data\\img\\123.jpg';
                    let buf = new Buffer(blob, 'base64'); // decode
                    /*fs.writeFile(imagePath, blob, function(err) {

                     })*/

                    /*fs.writeFile(imagePath, blob, "binary", function(err){
                     if(err){
                     }
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
    let showNavBar = true;
    //是否展开导航栏
    let expandNavBar = true;

    let h1s = $("#preview").find("h1");
    let h2s = $("#preview").find("h2");
    let h3s = $("#preview").find("h3");
    let h4s = $("#preview").find("h4");
    let h5s = $("#preview").find("h5");
    let h6s = $("#preview").find("h6");

    let headCounts = [h1s.length, h2s.length, h3s.length, h4s.length, h5s.length, h6s.length];
    let vH1Tag = null;
    let vH2Tag = null;
    for(let i = 0; i < headCounts.length; i++){
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
    fm.curFile = path;
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
            fm.openFolder(path);
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
    if (/image*/.test(file.type)) {
        var imagePath = fm.rootFile + '\\data\\img';
        fs.exists(imagePath, function(exists) {
            if (!exists) {
                fs.mkdirSync(imagePath, 777);
            }

            var newImageFile = imagePath + '\\' + new Date().getTime() + '.' + fileUtil.getExt(file.path);
            fs.writeFileSync(newImageFile, fs.readFileSync(file.path));

            editor.replaceSelection('![](' + newImageFile + ')');
        });
    } else {
        fs.stat(file.path, function(err, stat) {
            if (stat && stat.isDirectory()) {
                fm.openFolder(file.path);
            } else {
                openFile(file.path);
            }
        });
    }
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
    fm.openFolder(fm.rootFile);
});

function save() {
    if (fm.curFile) {
        system.writeFile(fm.curFile, editor.getValue(), function () {
            ui.msg('保存成功');
        });
    }
}
$('#save').on('click', function (e) {
    e.preventDefault();
    save();
});
$('#remove-file').on('click', function () {
    let fileName = fileUtil.getNameFromPath(fm.selectFile);
    ui.confirm('删除  ' + fileName, function (index) {
        ui.close(index);
        fm.removeSelectFile();
    });
});
$('#remame').on('click', function () {
    var fileName = fileUtil.getNameFromPath(fm.selectFile);
    ui.prompt({
        title: 'New Filename',
        value: fileName
    }, function (name, index) {
        if (!name) {
            ui.msg('请输入文件名');
            return;
        }
        ui.close(index);
        system.rename(fm.selectFile, fm.selectFile.replace(fileName, name));
        fm.refresh();
    })
});

$('#add-file').on('click', () => {
    // set date as filename if use want to keep a diary
    let value = '';
    if (fileUtil.getNameFromPath(fm.selectFile).contains('diary')) {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) {
            month = '0' + month
        }
        let day = date.getDate();
        if (day < 10) {
            day = '0' + day;
        }
        value = `${year}-${month}-${day}.md`;
    }

    ui.prompt({
        title: '文件名',
        value: value
    }, function (name, index) {
        if (!name) {
            ui.msg('请输入文件名');
            return;
        }
        ui.close(index);
        fm.addFile(fm.selectFile + '\\' + name);
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
        system.mkdir(fm.selectFile + '\\' + name, function () {
            ui.msg('添加成功');
            fm.openFolder(fm.rootFile);
        });
    })
});

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
        label: 'File',
        //enabled: false
        submenu: [
            {
                label: 'New',
                click: function () {
                    fm.curFile = null;
                    editor.setValue(''); // TODO
                }
            },
            {
                label: 'Open File',
                click: function () {
                    system.fm.selectFile(function (uri) {
                        if (uri) {
                            openFile(uri);
                        }
                    });
                }
            },
            {
                label: 'Open Folder',
                click: function () {
                    openFolder();
                }
            },
            {
                label: 'Save',
                click: function () {
                    save();
                    if (!fm.curFile) {

                    }
                }
            },
            {
                label: 'Save As...',
                click: function () {
                    ui.msg('暂不支持');
                }
            }
        ]
    },
    {
        label: 'More',
        submenu: [
            {
                label: 'Setting',
                click: function () {
                    ui.frame('setting.html', {
                        title: 'About'
                    });
                }
            },
            {
                label: 'Html To Markdown',
                click: function () {
                    window.open('html2md.html');
                }
            },
            {
                label: 'Export As Webpage',
                click: function () {

                }
            }
        ]
    },
    {
        label: 'Tools',
        submenu: [
            {
                label: 'Generate Document',
                click: function () {
                    system.selectDir(function (path) {
                        system.createDoc(path);
                    });
                }
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'View Help',
                click: function () {
                    help();
                }
            },
            {
                label: 'About',
                //accelerator: 'CmdOrCtrl+M',
                //role: 'reload', minimize minimize
                click: function () {
                    ui.frame('about.html', {
                        title: 'About'
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