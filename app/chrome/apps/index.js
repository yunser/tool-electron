/**
 * Created by cjh1 on 2016/12/7.
 */
let require = nodeRequire;
let chromeExtensions = require('../../extension');
let path = require('path');

var appPath = path.resolve(__dirname, '../../app');
chromeExtensions.load(appPath, (err, extensions) => {
    extensions.forEach((extension) => {
        console.log(extension);
        if (!extension.browser_action) {
            console.log(extension.name + ' plugin is not valid');
            return;
        }
        $('#app-list').append(`<a href="#" data-ext="${extension}" title="${extension.name}">
            <img src="${extension.path}/${extension.browser_action.default_icon}">
        </a>`)
    })
});