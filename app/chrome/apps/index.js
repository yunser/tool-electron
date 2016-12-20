/**
 * Apps
 */

const management = chrome.management;

management.getAll(function (result) {
    result.forEach((extInfo) => {
        if (!extInfo.isApp) { // TODO desp
            return;
        }

        console.log(extInfo.icons)
        let icon;
        if (extInfo.icons.length) {
            // get the max-size icon
            let maxSizeIndex = 0;
            let maxSize = extInfo.icons[0].size;
            for (let i = 0; i < extInfo.icons.length; i++) {
                if (extInfo.icons[i].size > maxSize) {
                    maxSizeIndex = i;
                }
            }
            icon = extInfo.icons[maxSizeIndex].url;
        } else {
            icon = '';//${extInfo.path}/${extInfo.browser_action.default_icon} default icon
        }
        
        let href = '';
        console.log(extInfo);
        // TODO url
        $('#ext-list').append(`
            <li class="ext-item" data-id="${extInfo.id}">
                <a href="#" data-ext="${extInfo}" title="${extInfo.name}" title="${extInfo.name}">
                    <img class="ext-icon" src="${icon}">
                </a>
            </li>
        `)
    })
});

$('#ext-list').on('click', '.ext-item', function (e) {
    e.preventDefault();
    let extId = '' + $(this).data('id');
    management.get(extId, (extInfo) => {
        management.launchApp(extInfo.id)
    })
});