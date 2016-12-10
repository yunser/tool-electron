/**
 * Created by cjh1 on 2016/12/6.
 */
const require = nodeRequire;
const {remote} = require('electron');
const ipc = require("electron").ipcRenderer;
const chromeExtensions = require('./node/extension');
const tool = require('./node/tool.js');
const TabEx = require('./node/TabEx.js');
const system = require('./node/system');
const fileUtil = require('./node/FileUtil');

let tabs = {};
let curTabId;
let tabNum = 0;

chromeExtensions.load(__dirname + '/extension', (err, extensions) => {
    extensions.forEach((extension) => {
        console.log(extension);
        if (!extension.browser_action) {
            console.log(extension.name + ' plugin is not valid');
            return;
        }
        $('#exts').append(`<a href="#" data-ext="${extension}" title="${extension.name}">
            <img src="${extension.path}/${extension.browser_action.default_icon}">
        </a>`)
    })
});

$('#exts').on('click', '[data-ext]', () => {
    let ext = $(this).data('ext');
    console.log(ext);
});

function initWebview(webview, id) {
    webview.addEventListener('did-start-loading', (e) => {
        ;
    });
    webview.addEventListener('page-title-updated', (e) => {
        let $link = $('#nav-link-' + id);
        $link.text(webview.getTitle());
        $link.attr('title', webview.getTitle());
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
        console.log('aaa')
    });
    webview.addEventListener('dom-ready', () => {
        chromeExtensions.load(__dirname + '/extension', (err, extensions) => {
            extensions.forEach((extension) => {
                //console.log(extension);
                chromeExtensions.addToWebview(webview, extension, (err) => {
                    //console.log(err);
                })
            })
        })
    });
}

$(document).on('keydown', function (e) {
    if (e.ctrlKey) {
        console.log(e.keyCode);
        switch (e.keyCode) {
            case 73:
                document.getElementById('webview-' + curTabId).openDevTools();
                return false;
            case 81: // q
                ipc.send('win-reload');
                return false;
            case 82: // r
                let webview = document.getElementById('webview-' + curTabId);
                webview.reload();
                return false;
        }
    }
});

function loadUrl(url) {
    let webview = document.getElementById('webview-' + curTabId);
    webview.loadURL(url);
    tabs[curTabId].url = url;
    $('#url-input').val(url);
}

$('#url-input').on('keydown', function (e) {
    if (e.keyCode == 13) {
        let url;
        if (this.value.startWith('http') || this.value.startWith('file://')
            || this.value.startWith('yunser://')) {
            url = this.value;
        } else if (this.value.contains('.')) { // TODO
            url = 'http://' + this.value;
        } else {
            url = system.getSearchUrl(this.value);
        }
        loadUrl(url);
    }
});

$('#forward').on('click', function (e) {
    e.preventDefault();
    let webview = document.getElementById('webview-' + curTabId);
    if (webview.canGoForward()) {
        webview.goForward();
    }
});
$('#back').on('click', function (e) {
    e.preventDefault();
    let webview = document.getElementById('webview-' + curTabId);
    if (webview.canGoBack()) {
        webview.goBack();
    }
});
$('#reload').on('click', function (e) {
    e.preventDefault();
    let webview = document.getElementById('webview-' + curTabId);
    webview.reload();
});

let tab = new TabEx('#tabs', {
    //monitor: '.topbar',
    callback: function () {
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
    addTab('yunser://blank/');
});



ipc.on('new-window', function(event, message) {
    addTab(message);
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
    console.log(id);
    curTabId = id;

    // 获取前一个激活的标签页的名称
    var previousTab = $(e.relatedTarget).text();
    $(".active-tab span").html(activeTab);
    $(".previous-tab span").html(previousTab);
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