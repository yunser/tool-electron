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
        console.log(extension);
        $('#exts').append(`<a href="#" title="${extension.name}">${extension.name}</a>`)
    })
})

function initWebview(webview, id) {
    webview.addEventListener('did-start-loading', function (e) {
        ;
    });
    webview.addEventListener('page-title-updated', function (e) {
        console.log(webview.getTitle());
        var $link = $('#nav-link-' + id);
        $link.text(webview.getTitle());
        $link.attr('title', webview.getTitle());
    });
    webview.addEventListener('new-window', function (e) {
        require('electron').shell.openExternal(e.url)
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
    console.log(e.keyCode);
    if (e.ctrlKey) {
        switch (e.keyCode) {
            case 73:
                document.getElementById('webview-' + curTabId).openDevTools();
                return false;
        }
    }
});

$('#url-input').on('keydown', function (e) {
    console.log(e.keyCode)
    if (e.keyCode == 13) {
        console.log(curTabId);
        let webview = document.getElementById('webview-' + curTabId);
        if (this.value.startWith('http') || this.value.startWith('file://')
            || this.value.startWith('yunser://')) {
            webview.loadURL(this.value);
        } else {
            webview.loadURL('http://' + this.value);
        }
    }
});
$('#forward').on('click', function (e) {
    e.preventDefault();
    if (webview.canGoForward()) {
        webview.goForward();
    }
});
$('#back').on('click', function (e) {
    e.preventDefault();
    if (webview.canGoBack()) {
        webview.goBack();
    }
});
$('#reload').on('click', function (e) {
    e.preventDefault();
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
              <webview id="webview-${id}" class="webview" autosize="on"  src="${url}" style="height: 100%" ${nodeintegration}></webview>
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

var id = addTab('yunser://blank/');


$('a[data-toggle="tab"]').on('shown.ui.tab', function (e) {
    // 获取已激活的标签页的名称
    var activeTab = $(e.target).text();
    console.log();
    var id = e.target.parentNode.getAttribute('data-id');
    console.log(typeof id)

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