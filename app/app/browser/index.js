/**
 * Created by cjh1 on 2016/12/6.
 */
const require = nodeRequire;
const electron = require('electron');
const {remote} = require('electron');
const ipc = require("electron").ipcRenderer;
const chromeExtensions = require('../../node/extension');
const path = require('path');
const tool = require('../../node/tool.js');
const TabEx = require('../../node/TabEx.js');
const system = require('../../node/system');
const fileUtil = require('../../node/FileUtil');
const {download} = require('electron-dl');
const isDev = require('electron-is-dev');

let tabs = {};
let curTabId;
let tabNum = 0;

console.log(process.versions.electron);


function delUnusedElements(menuTpl) {
    let notDeletedPrevEl;
    return menuTpl.filter(el => el.visible !== false).filter((el, i, arr) => {
        const toDelete = el.type === 'separator' && (!notDeletedPrevEl || i === arr.length - 1 || arr[i + 1].type === 'separator');
        notDeletedPrevEl = toDelete ? notDeletedPrevEl : el;
        return !toDelete;
    });
}

const appPath = system.getAppPath();

chromeExtensions.load(appPath + '/extension', (err, extensions) => {
    extensions.forEach((extension) => {
        if (!extension.browser_action) {
            return;
        }
        $('#exts').append(`<a href="#" data-ext="${extension}" title="${extension.name}">
            <img src="${extension.path}/${extension.browser_action.default_icon}">
        </a>`)
    })
});

$('#exts').on('click', '[data-ext]', () => {
    let ext = $(this).data('ext');
});

function initWebview(webview, id) {


    webview.addEventListener('did-finish-load', (e) => {
        updateNavIcon();
    });
    webview.addEventListener('found-in-page', (e, result) => {
        $('#find-info').text(`第 ${e.result.activeMatchOrdinal} 条, 共 ${e.result.matches} 条`);
    });
    webview.addEventListener('did-start-loading', (e) => {
        ;
    });
    webview.addEventListener('page-title-updated', (e) => {
        let $link = $('#nav-link-' + id);
        $link.find('.title').text(webview.getTitle());
        $link.attr('title', webview.getTitle());
    });
    webview.addEventListener('page-favicon-updated', (e) => {
        let $link = $('#nav-link-' + id);
        $link.find('.logo').css('background-image', 'url("' + e.favicons[0] + '")');
    });

    webview.addEventListener('did-fail-load', (e) => {
        let type = fileUtil.getType( webview.getURL());
        if (type === 'audio') {
            // 暂时使用默认播放器
        } else {
            webview.loadURL('yunser://404');
        }
    });
    webview.addEventListener('new-window', (e) => {
        addTab(e.url);
    });
    webview.addEventListener('new-page-favicon-updated', (favicons) => {
    });
    webview.addEventListener('dom-ready', () => {
        webview.getWebContents().on('will-navigate', function (e, url) {
            //webview.getWebContents().send('will-navigate', url);
            e.preventDefault();
        });
        webview.getWebContents().on('will-navigate2', function (e, url) {
            //webview.getWebContents().send('will-navigate', url);
            e.preventDefault();
        });

        chromeExtensions.load(appPath + '/extension', (err, extensions) => {
            extensions.forEach((extension) => {
                //console.log(extension);
                chromeExtensions.addToWebview(webview, extension, (err) => {
                    //console.log(err);
                })
            })
        });

        webview.getWebContents().on('context-menu', (e, props) => {

            var opts = {};
            const editFlags = props.editFlags;
            const hasText = props.selectionText.trim().length > 0;
            const can = type => editFlags[`can${type}`] && hasText;

            let curWebview = document.getElementById('webview-' + curTabId);
            let menuTpl = [
                {
                    id: 'back',
                    label: 'Back',
                    enabled: curWebview.canGoBack(),
                    click() {
                        curWebview.goBack();
                    }
                },
                {
                    id: 'forward',
                    label: 'Forward',
                    enabled: curWebview.canGoForward(),
                    click() {
                        curWebview.goForward();
                    }
                },
                {
                    id: 'reload',
                    label: 'Reload',
                    click() {
                        curWebview.reload();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    id: 'cut',
                    label: 'Cut',
                    // needed because of macOS limitation:
                    // https://github.com/electron/electron/issues/5860
                    role: can('Cut') ? 'cut' : '',
                    enabled: can('Cut'),
                    visible: props.isEditable
                },
                {
                    id: 'copy',
                    label: 'Copy',
                    role: can('Copy') ? 'copy' : '',
                    enabled: can('Copy'),
                    visible: props.isEditable || hasText
                },
                {
                    id: 'searchText',
                    label: 'Search',
                    click() {
                        let url = system.getSearchUrl(props.selectionText);
                        window.open(url);
                    },
                    visible: props.isEditable || hasText
                },
                {
                    id: 'paste',
                    label: 'Paste',
                    role: editFlags.canPaste ? 'paste' : '',
                    enabled: editFlags.canPaste,
                    visible: props.isEditable
                },
                {
                    type: 'separator'
                }
            ];

            if (props.mediaType === 'image') {
                menuTpl = [{
                    type: 'separator'
                }, {
                    id: 'save',
                    label: 'Save Image',
                    click(item, win) {
                        download(win, props.srcURL);
                    }
                }, {
                    type: 'separator'
                }];
            }

            if (props.linkURL && props.mediaType === 'none') {
                menuTpl = [
                    {
                        type: 'separator'
                    },
                    {
                        id: 'copyLink',
                        label: 'Copy Link',
                        click() {
                            if (process.platform === 'darwin') {
                                electron.clipboard.writeBookmark(props.linkText, props.linkURL);
                            } else {
                                electron.clipboard.writeText(props.linkURL);
                            }
                        }
                    },
                    {
                        type: 'separator'
                    }];
            }

            if (opts.prepend) {
                const result = opts.prepend(props, win);

                if (Array.isArray(result)) {
                    menuTpl.unshift(...result);
                }
            }

            if (opts.append) {
                const result = opts.append(props, win);

                if (Array.isArray(result)) {
                    menuTpl.push(...result);
                }
            }

            if (opts.showInspectElement || (opts.showInspectElement !== false && isDev)) {
                menuTpl.push(
                    {
                        type: 'separator'
                    },
                    {
                        id: 'view-source',
                        label: 'View source',
                        click() {
                            ui.msg('the function is not achieve');
                        }
                    },
                    {
                        id: 'inspect',
                        label: 'Inspect Element',
                        click(item, win) {
                            //webview.getWebContents().Contents.inspectElement(props.x, props.y);

                            webview.getWebContents().openDevTools({
                                //undocked: false,
                                //detach: false,
                                mode: 'right'
                            });

                            /*webview.inspectServiceWorker();
                            if (webview.getWebContents().isDevToolsOpened()) {
                                webview.getWebContents().devToolsWebContents.focus();
                            } else {

                            }*/
                        }
                    },
                    {
                        type: 'separator'
                    }
                );
            }

            // apply custom labels for default menu items
            if (opts.labels) {
                for (const menuItem of menuTpl) {
                    if (opts.labels[menuItem.id]) {
                        menuItem.label = opts.labels[menuItem.id];
                    }
                }
            }

            // filter out leading/trailing separators
            // TODO: https://github.com/electron/electron/issues/5869
            menuTpl = delUnusedElements(menuTpl);

            if (menuTpl.length > 0) {
                const menu = (electron.Menu || electron.remote.Menu).buildFromTemplate(menuTpl);

                /*
                 * When electron.remote is not available this runs in the browser process.
                 * We can safely use win in this case as it refers to the window the
                 * context-menu should open in.
                 * When this is being called from a webView, we can't use win as this
                 * would refere to the webView which is not allowed to render a popup menu.
                 */
                menu.popup(electron.remote ? electron.remote.getCurrentWindow() : win);
            }
        });


    });

    webview.addEventListener('contextmenu', (e) => {
    });


}

$(document).on('keydown', function (e) {
    if (e.ctrlKey) {
        switch (e.keyCode) {
            case 9: // tab
                tab.next();
                return false;
            case 70: // f
                $('#find-box').show();
                $('#find-input')[0].select();
                return false;
            case 73: // i
                document.getElementById('webview-' + curTabId).openDevTools();
                return false;
            case 81: // q
                ipc.send('win-reload');
                return false;
            case 82: // r
                let webview = document.getElementById('webview-' + curTabId);
                webview.reload();
                return false;
            case 87: // w
                tab.close(curTabId);
                return false;
        }
    }
});

function dealUrl(url) {
    // TODO
    if (url.startWith('app://')) {
        let appName = url.substring(6);
        url =  'file:///' + path.resolve(system.getAppPath(), `app/${appName}/index.html`);
    }

    return url;
}

function loadUrl(url) {
    url = dealUrl(url);

    let webview = document.getElementById('webview-' + curTabId);
    webview.loadURL(url);
    tabs[curTabId].url = url;
    $('#url-input').val(url);

    updateNavIcon();
}

$('#url-input').on('focus', function (e) {
    this.select();
});

(function () {
    let $linkUrl = $('#link-url');
    $(document).on('mouseover', 'a', function () {
        $linkUrl.text(this.href);
        $linkUrl.fadeIn();
    });

    $(document).on('mouseout', 'a', function () {
        $linkUrl.fadeOut();
    });
})();


$('#url-input').on('keydown', function (e) {
    if (e.keyCode == 13) {
        if (this.value.startWith('http') || this.value.startWith('file://')
            || this.value.startWith('yunser://')) {
            let url = this.value;
            loadUrl(url);
        } else {
            // if the keyword is  file path
            if (/^\w:/.test(this.value)) {
            /*if (this.value.startWith('C:') || this.value.startWith('D:')
                || this.value.startWith('E:') || this.value.startWith('F:')) {*/
                let ext = fileUtil.getExt(this.value);
                if (!ext) {
                    // TODO
                    let url = 'file:///G:/install/apache2.4/htdocs/yunser/tool/note/app/app/files/index.html'
                        + '?path=' + this.value;
                    window.open(url);
                } else {
                    console.log('unkne', this.value, ext);
                }
                /*if (fs.existsSync(keyword)) {

                 } */
            } else if (this.value.startWith('app://')) {
                let appName = this.value.substring(6);
                let url =  'file:///' + path.resolve(system.getAppPath(), `app/${appName}/index.html`);
                loadUrl(url);
                //
            } else if (this.value.contains('.')) { // TODO
                    let url = 'http://' + this.value;
                    loadUrl(url);
            } else {
                let url = system.getSearchUrl(this.value);
                window.open(url);
            }


        }

    }
});

$('#forward').on('click', function (e) {
    e.preventDefault();
    if ($(this).hasClass('disabled')) {
        return;
    }

    let webview = document.getElementById('webview-' + curTabId);
    if (webview.canGoForward()) {
        webview.goForward();
        updateNavIcon();
    }
});
$('#back').on('click', function (e) {
    e.preventDefault();
    if ($(this).hasClass('disabled')) {
        return;
    }

    let webview = document.getElementById('webview-' + curTabId);
    if (webview.canGoBack()) {
        webview.goBack();
        updateNavIcon();
    }
});
$('#reload').on('click', function (e) {
    e.preventDefault();
    if ($(this).hasClass('disabled')) {
        return;
    }

    let webview = document.getElementById('webview-' + curTabId);
    webview.reload();
});

let tab = new TabEx('#tabs', {
    //monitor: '.topbar',
    callback: function (id, newId) {
        curTabId = newId;
        console.log(newId, '===')
        tabNum--;
        if (tabNum === 0) {
            ipc.send('win-close');
        }
    }
});

var iddd = 123;
function getIdd() {
    return iddd++;
}

function addTab(url) {
    url = dealUrl(url);
    
    var id = getIdd();

    $('#url-input').val(url);

    curTabId = id;
    tabNum += 1;

    tabs['' + id] = {
        url: url
    };

    let nodeintegration = (url.startWith('yunser://') || url.startWith('file://')) ? ' nodeintegration' : '';

    tab.add({
        id: id,
        title: '新标签页',
        content: `
        <div class="webview-box">
              <webview id="webview-${id}" class="webview" autosize="on"  src="${url}" style="height: 100%" ${nodeintegration} preload="./preload.js"></webview>
        </div>`,
    });

    initWebview(document.getElementById('webview-' + id), id);

    return id;
}

$('#add-tab').on('click', function () {
    //const newTabUrl = 'yunser://blank/';
    const newTabUrl = 'app://search';

    addTab(newTabUrl);
});

ipc.on('new-window', function(event, message) {
    addTab(message);
});

ipc.on('debug', function(event, message) {
    alert(message);
    message[0].apply(console, message[1]);
    //addTab(message);
});

ipc.on('will-navigate', function(event, message) {
    loadUrl(message);
});

ipc.on('leave-full-screen', function(event, message) {
    $('#tab-nav').show();
    $('#layout-header').show();
    $('#tab-tool').show();
    $('#tab-content').css('top', '110px');
});

ipc.on('enter-full-screen', function(event, message) {
    $('#tab-nav').hide();
    $('#layout-header').hide();
    $('#tab-tool').hide();
    $('#tab-content').css('top', '0');
});

var id = addTab('yunser://blank/');

$(document).on('shown.ui.tab', 'a[data-toggle="tab"]', function (e) {

    // 获取已激活的标签页的名称
    var activeTab = $(e.target).text();
    var id = e.target.parentNode.getAttribute('data-id');

    $('#url-input').val(tabs[id].url);
    curTabId = id;

    // 获取前一个激活的标签页的名称
    var previousTab = $(e.relatedTarget).text();
    $(".active-tab span").html(activeTab);
    $(".previous-tab span").html(previousTab);
});

function updateNavIcon() {
    var webview = document.getElementById('webview-' + curTabId);
    if (webview.canGoBack()) {
        $('#back').removeClass('disabled');
    } else {
        $('#back').addClass('disabled');
    }

    if (webview.canGoForward()) {
        $('#forward').removeClass('disabled');
    } else {
        $('#forward').addClass('disabled');
    }
}
$(document).on('mousewheel', function (e, delta) {
    if (e.ctrlKey) {
        let curWebview = document.getElementById('webview-' + curTabId);
        if (delta > 0) {

        } else {
            curWebview
        }
    }

});
$('#win-min').on('click', function (e) {
    e.preventDefault();
    ipc.send('win-min');
});
$('#win-max').on('click', function (e) {
    e.preventDefault();
    ipc.send('win-max');
});
$('#win-close').on('click', function (e) {
    e.preventDefault();
    ipc.send('win-close');
});

// collection
let bookmark = [
    {
        text: 'chat',
        url: 'app://chat'
    },
    {
        text: 'Mail',
        url: 'app://mail'
    },
    {
        text: 'Collections',
        url: 'app://apps'
    },
    {
        text: 'Apps',
        url: 'app://apps'
    },
    {
        text: 'Markdown Editor',
        url: 'app://markdown'
    },
    {
        text: 'File Manager',
        url: 'app://files'
    },
    {
        text: 'App Store',
        url: 'app://store'
    },
    {
        text: 'Desktop',
        url: 'app://desktop'
    },
    {
        text: 'Baidu',
        url: 'http://www.baidu.com'
    },
    {
        text: 'Search',
        url: 'app://search'
    },
    {
        text: 'Photos',
        url: 'app://photos'
    },
    {
        text: 'Guide',
        url: 'app://guide'
    },
    {
        text: 'Music',
        url: 'app://music'
    },
    {
        text: 'Downloads',
        url: 'app://downloads'
    },
    {
        text: 'Cnlendar',
        url: 'app://calendar',
    },
    {
        text: 'Editor',
        url: 'app://editor'
    },
    {
        text: 'download file',
        url: 'http://sw.bos.baidu.com/sw-search-sp/software/0b57a709db50a/Baidu_Setup_4384_3.1.0.2950_10000001.exe'
    },
    {
        text: 'Todo',
        url: 'app://todo'
    },
    {
        text: 'Reader',
        url: 'app://reader',
    }
];

let html = [];
bookmark.forEach((item) => {
    html.push(`<a href="${item.url}">${item.text}</a>`);
});
$('#collection').html(html.join(''));

// find in page
let findId;
$('#find-input').on('input', function () {
    let curWebview = document.getElementById('webview-' + curTabId);
    if (this.value) {
        findId = curWebview.getWebContents().findInPage(this.value);
    } else {
        curWebview.getWebContents().stopFindInPage('clearSelection');
    }
});
$('#find-close').on('click', function (e) {
    e.preventDefault();
    $('#find-box').hide();
});
$('#find-prev').on('click', function (e) {
    e.preventDefault();
    let curWebview = document.getElementById('webview-' + curTabId);
    findId = curWebview.getWebContents().findInPage($('#find-input').val(), {
        forward: false,
        //findNext: true
    });
});
$('#find-next').on('click', function (e) {
    e.preventDefault();
    let curWebview = document.getElementById('webview-' + curTabId);
    findId = curWebview.getWebContents().findInPage($('#find-input').val(), {
        findNext: true
    });
});
$('#find-close').on('click', function (e) {
    e.preventDefault();
    $('#find-box').hide();
});


// ajax test
/*
$.ajax({
    url: '123.json',
    type: 'GET',
    dataType: 'html',
    success: function (data) {
        alert(data);
    },
    error(a, b, c) {
        console.log('error', a, b, c)
    }
})*/
$.ajax({
    url:"123.json",
    dataType: 'html',
    success:function(result){
        $("#div1").html(result);
    },
    error(a, b, c) {
        console.log('error', a, b, c)
    }
});

// 7niu
var qiniu = require("qiniu");
let config = require('./qiniu.config.json');

qiniu.conf.ACCESS_KEY = config.access_key;
qiniu.conf.SECRET_KEY = config.secreet_key;

//构建私有空间的链接
url = 'http://7xvw9d.com1.z0.glb.clouddn.com/123.jpg';
var policy = new qiniu.rs.GetPolicy();

//生成下载链接url
var downloadUrl = policy.makeRequest(url);

//打印下载的url
console.log(downloadUrl);


//构建bucketmanager对象
var client = new qiniu.rs.Client();

//你要测试的空间， 并且这个key在你空间中存在
bucket = 'chen';
key = '123.jpg';

//获取文件信息
client.stat(bucket, key, function(err, ret) {
    if (!err) {
        console.log(ret.hash, ret.fsize, ret.putTime, ret.mimeType);
    } else {
        console.log(err);
    }
});


// 获取文件列表
qiniu.rsf.listPrefix('chen', '', '', 100, '/', function (a, b) {
    console.log(a, b);
})


console.log()
