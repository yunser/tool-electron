/**
 * Extensions manager
 */

var persissions = {
    'host permissions': '',
    'appNotifications': '',
    'background': '读取和更改您在访问的网站上的所有数据',
    'bookmarks': '读取和更改您的书签',
    'clipboardRead': '读取您复制和粘贴的数据',
    'clipboardWrite': '',
    'contentSettings': '',
    'contextMenus': '读取和更改您在访问的网站上的所有数据',
    'cookies': '更改您用于控制一下内容的设置：网站对于cookie等功能的使用权限',
    'debugger': '访问页面调试程序后端、读取和更改您在访问的网站上的所有数据',
    'history': '读取和更改您的浏览记录',
    'idle': '读取和更改您在访问的网站上的所有数据',
    'management': '管理您的应用、拓展程序和主题背景',
    'notifications': '显示通知',
    'pageCapture': '',
    'tabs': '读取您的浏览记录',
    'topSites': '读取和更改您在访问的网站上的所有数据',
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
    } else {
        html = '此应用不需要任何特殊权限';
    }
    return html;
}

let allextension;

chrome.management.getAll(function (result) {
    result.forEach((extInfo) => {
        let icon;
        if (extInfo.icons.lenght) {
            icon = extInfo.icons[0].url;
        } else {
            icon = '';//${extInfo.path}/${extInfo.browser_action.default_icon}
        }

        let persissionHtml = getPermissionHtml(extInfo);
        $('#ext-list').append(`
            <li class="ext-item" data-id="${extInfo.id}">
                <a href="#" data-ext="${extInfo}" title="${extInfo.name}">
                    <img class="ext-icon" src="${icon}">
                </a>
                <div>
                    <span>${extInfo.name}</span>
                    <span>${extInfo.version}</span>
                    <span><label><input type="checkbox"> 启用</label></span>
                    <a class="delete" href="#">删除</a>
                    </div>
                <div>${extInfo.description}</div>
                <div><a class="show-detail" href="#">详细信息</a></div>
                <ul class="detail">
                    <h4>概述</h4>
                    <div>${extInfo.description}</div>
                    <a href="${extInfo.homepageUrl}">开发者网站</a>
                    <div>大小: xxx</div>
                    <div>版本: ${extInfo.version}</div>
                    ${persissionHtml}
                </ul>
                <div>ID: ${extInfo.id}</div>
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

$('#ext-list').on('click', '.show-detail', function (e) {
    e.preventDefault();
    $(this).closest('li').find('.detail').show();
});