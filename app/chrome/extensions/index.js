/**
 * Extensions manager
 */
const require = nodeRequire;
const chromeExtensions = require('../../node/extension/extension');
const system = require('../../node/system');
const appPath = system.getAppPath();

var persissions = {
    'host permissions': '',
    'appNotifications': '',
    'background': '',
    'bookmarks': '读取和更改您的书签',
    'clipboardRead': '读取您复制和粘贴的数据',
    'clipboardWrite': '',
    'contentSettings': '',
    'contextMenus': '',
    'cookies': '更改您用于控制一下内容的设置：网站对于cookie等功能的使用权限',
    'debugger': '',
    'history': '读取和更改您的浏览记录',
    'idle': '',
    'management': '',
    'notifications': '显示通知',
    'pageCapture': '',
    'tabs': '',
    'topSites': '',
    'webNavigation': '',
    'webRequest': '',
    'webRequestBlocking': ''
};// 管理您的应用、拓展程序和主题背景
function getPermissionDesc(name) {
    if (persissions[name]) {
        return persissions[name];
    } else {
        return '???xxx';
    }
}

function getPermissionHtml(extension) {
    let html = '';
    if (extension.permissions) {

        extension.permissions.forEach((persission) => {
            html += `<li>${getPermissionDesc(persission)}</li>`;
        });
    }
    return html;
}

let allextension;

chromeExtensions.load(appPath + '/extension', (err, extensions) => {
    allextension = extensions;
    
    extensions.forEach((extension) => {
        console.log(extension);

        if (!extension.browser_action) {
            console.log(`extendsion (${extension.name}) browser_action error`);
            return;
        }
        let persissionHtml = getPermissionHtml(extension);
        $('#ext-list').append(`
            <li class="ext-item" data-id="${extension.id}">
                <a href="#" data-ext="${extension}" title="${extension.name}">
                    <img class="ext-icon" src="${extension.path}/${extension.browser_action.default_icon}">
                </a>
                <div>
                    <span>${extension.name}</span>
                    <span>${extension.version}</span>
                    <span><label><input type="checkbox"> 启用</label></span>
                    <a class="delete" href="#">删除</a>
                    </div>
                <div>${extension.description}</div>
                <div><a href="#">详细信息</a></div>
                <ul class="detail">
                    <h4>概述</h4>
                    <div>${extension.description}</div>
                    <a href="${extension.homepage_url}">开发者网站</a>
                    <div>大小: xxx</div>
                    <div>版本: ${extension.version}</div>
                    ${persissionHtml}
                </ul>
                <div>ID: xxx</div>
            </li>
        `)
    })
});

$('#ext-list').on('click', '.delete', function (e) {
    e.preventDefault();
    let extId = '' + $(this).closest('li').attr('data-id');
    allextension.forEach((ext) => {
        if (ext.id === extId) {
            // TODO 回调不起作用
            ui.confirm(`要删除 "${ext.name}" 吗?`, {
                title: '确认删除',
                yes: function () {
                    console.log('删除'+ext.path);
                    // TODO 删除逻辑
                } // TODO 去掉yes
            });
            return;
        }
    });
    
});