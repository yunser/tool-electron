/**
 * Created by cjh1 on 2016/12/6.
 */
const require = nodeRequire;
const electron = require('electron');
const {remote, ipcRenderer, webFrame} = require('electron');
const chromeExtensions = require('../../node/extension/extension');
const path = require('path');
const tool = require('../../node/tool.js');
const TabEx = require('../../node/TabEx.js');
const system = require('../../node/system');
const fileUtil = require('../../node/FileUtil');
const {download} = require('electron-dl');
const isDev = require('electron-is-dev');
//const run = require('./chrome/run');
//const newTabUrl = 'yunser://blank/';
//const newTabUrl = 'app://search';
const newTabUrl = 'app://extensions';

//webFrame.setZoomFactor(2)
//webFrame.setZoomLevelLimits(0.25, 5);

let tabs = {};
let curTabId;
let tabNum = 0;

console.log('electron version: ' + process.versions.electron);


function delUnusedElements(menuTpl) {
    let notDeletedPrevEl;
    return menuTpl.filter(el => el.visible !== false).filter((el, i, arr) => {
        const toDelete = el.type === 'separator' && (!notDeletedPrevEl || i === arr.length - 1 || arr[i + 1].type === 'separator');
        notDeletedPrevEl = toDelete ? notDeletedPrevEl : el;
        return !toDelete;
    });
}

const appPath = system.getAppPath();


function simpleText(text) {
    if (text.length > 20) {
        return text.substring(0, 20) + '...';
    }
    return text;
}

function initWebview(webview, id) {

}

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

let tab = new TabEx('#tabs', {
    //monitor: '.topbar',
    callback: function (id, newId) {
        curTabId = newId;
        console.log(newId, '===')
        tabNum--;
        if (tabNum === 0) {
            ipcRenderer.send('win-close');
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

    return id;
}

$('#add-tab').on('click', function () {
    addTab(newTabUrl);
});

ipcRenderer.on('new-window', function(event, message) {
    addTab(message);
});

ipcRenderer.on('debug', function(event, message) {
    alert(message);
    message[0].apply(console, message[1]);
    //addTab(message);
});

ipcRenderer.on('will-navigate', function(event, message) {
    loadUrl(message);
});



var id = addTab(newTabUrl);

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



$(document).on('click', function (e, delta) {
    // TODO impotent
    console.log('click');
});



// TODO 菜单不起作用
$('#ext-list').on('click', '[data-ext]', () => {
    let ext = $(this).data('ext');
});
