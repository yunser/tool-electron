/**
 * Created by cjh1 on 2016/12/6.
 */
var chromeExtensions = nodeRequire('./extension');
var require = nodeRequire;
var remote = require('electron').remote;
var ipc = require("electron").ipcRenderer;

/*var tabs = [
    {
        id: 'home2',
        name: '123',

    }
];*/
let tabs = {};
let curTabId;

chromeExtensions.load(__dirname + '/extension', function (err, extensions) {
    extensions.forEach(function (extension) {
        $('#exts').append(`<a href="#" title="${extension.name}">${extension.name}</a>`)
    })
})

function initWebview(webview, id) {
    webview.addEventListener('did-start-loading', function (e) {
        ;
    });
    webview.addEventListener('page-title-updated', function (e) {
        var $link = $('#nav-link-' + id);
        $link.text(webview.getTitle());
        $link.attr('title', webview.getTitle());
    });
    webview.addEventListener('new-window', function (e) {
        addTab(e.url);
    });
    webview.addEventListener('new-page-favicon-updated', function (favicons) {
        console.log('aaa')
    });
    webview.addEventListener('dom-ready', function () {
        chromeExtensions.load(__dirname + '/extension', function (err, extensions) {
            extensions.forEach(function (extension) {
                //console.log(extension);
                chromeExtensions.addToWebview(webview, extension, function (err) {
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
}

$('#url-input').on('keydown', function (e) {
    if (e.keyCode == 13) {
        if (this.value.startWith('http') || this.value.startWith('file://')
            || this.value.startWith('yunser://')) {
            loadUrl(this.value);
        } else {
            loadUrl('http://' + this.value);
        }
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

var tab = new ui.TabEx('#tabs', {
    //monitor: '.topbar'
});


var iddd = 123;
function getIdd() {
    return iddd++;
}

function addTab(url) {
    var id = getIdd();

    $('#url-input').val(url);

    curTabId = id;

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


$('a[data-toggle="tab"]').on('shown.ui.tab', function (e) {
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