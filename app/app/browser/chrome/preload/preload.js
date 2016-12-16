/**
 * Created by cjh1 on 2016/12/12.
 */
console.info('preload start');

if (navigator.userAgent.indexOf('Electron') == -1) {
    return;
}
let gl = require('../main/gl');

const {remote, desktopCapturer, webFrame, shell, ipcRenderer} = require('electron');
const {Menu, MenuItem, BrowserWindow} = remote;
const {app} = remote;
const path = require('path');
const fs = require('fs');

/*webFrame.registerURLSchemeAsSecure('chrome-extension');
webFrame.registerURLSchemeAsBypassingCSP('chrome-extension');
webFrame.registerURLSchemeAsPrivileged('chrome-extension');*/

const selfBrowserWindow = remote.getCurrentWindow();
const selfId = selfBrowserWindow.id;

window.extCache = window.extCache2;

let chromeCache = {};

function deepCopy(o, t) {
    for (var k in o) {
        var v = o[k];
        if (v.constructor == Object)
            t[k] = deepCopy(v, {});
        else
            t[k] = v;
    }
    return t;
}

function getManifestVersion(runtimePath) {
    return JSON.parse(fs.readFileSync(path.join(runtimePath, 'manifest.json')).toString()).version;
}

function createChrome(extensionPath) {
    if (chromeCache[extensionPath]) {
        return chromeCache[extensionPath];
    }

    const manifest = require(path.join(extensionPath, 'manifest.json'));
    console.log('manifest', manifest);

    let message;
    let messagePath;
    // 搜索用户首选语言对应的消息文件
    let userLocale = 'zh_CN';
    let commonLocale;
    if (userLocale.indexOf('_') !== -1) {
        commonLocale = userLocale.split('_')[0];
    }
    console.log(commonLocale);
    if (fs.existsSync(messagePath = path.join(extensionPath, `_locales/${userLocale}/messages.json`))) {
        message = JSON.parse(fs.readFileSync(messagePath));
    } else if (commonLocale && fs.existsSync(messagePath = path.join(extensionPath, `_locales/${commonLocale}/messages.json`))) {
        message = JSON.parse(fs.readFileSync(messagePath));
    } else if (manifest.default_locale && fs.existsSync(messagePath = path.join(extensionPath, `_locales/${manifest.default_locale}/messages.json`))) {
        message = JSON.parse(fs.readFileSync(messagePath));
    }

    console.log('消息', message);

    // check version and update
    var myManifestVersion = getManifestVersion(extensionPath);
    console.log('verson: ' + myManifestVersion);

    // common
    let chrome = {
        id: extensionPath,
        Event: function () {

        },
        //app: {

        //},
        csi: function () {

        },
        runtime: {
            OnInstalledReason: {
                CHROME_UPDATE: 'chrome_update',
                INSTALL: 'install',
                SHARED_MODULE_UPDATE: 'shared_module_update',
                UPDATE: 'update'
            },
            OnRestartRequiredReason: {
                APP_UPDATE: 'app_update',
                OS_UPDATE: 'os_update',
                PERIODIC: 'periodic'
            },
            PlatformArch: {
                ARM: 'arm',
                X86_32: 'x86-32',
                X86_64: 'x86-64'
            },
            PlatformNaclArch: {
                ARM: 'arm',
                X86_32: 'x86-32',
                X86_64: 'x86-64'
            },
            RequestUpdateCheckStatus: {
                NO_UPDATE: 'no_update',
                THROTTLED: 'throttled',
                UPDATE_AVAILABLE: 'update_available'
            },
            PlatformOs: {
                ANDROID: 'android',
                CROS: 'cros',
                LINUX: 'linux',
                MAC: 'mac',
                OPENBSD: 'openbsd',
                WIN: 'win'
            },
            id: '123' + new Date().getTime(), // TODO
            /**
             * @return {object}
             */
            getManifest: function () {
                return manifest;
            },
            /**
             * Converts a relative path within an app/extension install directory to a fully-qualified URL
             * @param {string} path
             *      A path to a resource within an app/extension expressed relative to its install directory
             * @return {string}
             */
            getURL: function (path) {
                return `chrome-extension://${this.id}/${path}`;
            },
            /**
             * @param {string} extensionId
             * @param {any} message
             * @param {object} options
             * @param {function} responseCallback
             * Since Chrome 26
             */
            sendMessage(extensionId, message, options, responseCallback) {
                console.error('dropping message on the floor', arguments);
            },
            /**
             * @param {string} (optional)extensionId
             * @param {object} (optional)connectInfo
             * @return {Port}
             */
            connect(extensionId, connectInfo) {

            }
        },
        i18n: {
            /**
             * @param {string} text
             * @param {function} callback
             */
            detectLanguage: function (text, callback) {
                // TODO
            },

            /**
             * @param {function} callback
             */
            getAcceptLanguages: function (callback) {
                callback(['zh_CN', 'zh']); // TODO
            },

            /**
             * @param {String} messageName
             * @param {*} substitutions
             * @return {string}
             */
            getMessage: function (messageName, substitutions) {
                if (message && message[messageName]) {
                    return message[messageName].message;
                }
                return '';
            },

            /**
             * @return {string}
             */
            getUILanguage: function () {
                return 'zh-CN'; // TODO
            }
        },
        loadTimes: {

        }
    };

    chrome.desktopCapture = require('./chrome-desktopcapture.js');

    // difference
//chrome.app = require('./chrome-app.js');
    chrome.system = require('../api/chrome-system.js');
    //chrome.alarms = require('../api/chrome-alarms.js');
//chrome.idle = require('./chrome-idle.js');

//chrome.contextMenus = require('./chrome-contextmenus.js');
//chrome.storage = require('./chrome-storage.js');
    chrome.syncFileSystem = {
    }
    chrome.storage = require('../api/chrome-storage');
    chrome.browser = require('../api/chrome-browser');
    chrome.contextMenus = require('../api/chrome-contextmenus.js');
    chrome.notifications = require('../api/chrome-notifications.js');

    //const identity = require('../api/chrome-identity');
    //chrome.identity = identity.identity;

    chrome.fileSystem = {
    }

    chrome.extension = {
        ViewType: {
            POPUP: 'popup',
                TAB: 'tab',
        },
        connect: function () {

        },

        // onConnect
        // onMessage
        // onRequest
        //lastError: null,
        sendMessage: function () {

        },
        sendRequest: function () {

        }
    };

    chromeCache[extensionPath] = chrome;
    return chrome;
}

window.createChrome = createChrome;

//window.chrome = chrome;
//window.require = require;


// allow jquery to load
delete window.module;

console.info('preload finished');
/*
if (window.require) {
    window.nodeRequire = require;
    delete window.require;
    delete window.exports;
    delete window.module;
}*/