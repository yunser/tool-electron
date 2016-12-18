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
const createChrome = require('../api/chrome');

const selfBrowserWindow = remote.getCurrentWindow();
const selfId = selfBrowserWindow.id;

/*function createChrome(extensionPath) {
    if (chromeCache[extensionPath]) {
        return chromeCache[extensionPath];
    }

    const manifest = require(path.join(extensionPath, 'manifest.json'));

    let message;
    let messagePath;
    // 搜索用户首选语言对应的消息文件
    let userLocale = 'en'; // en, zh_CN
    let commonLocale;
    if (userLocale.indexOf('_') !== -1) {
        commonLocale = userLocale.split('_')[0];
    }
    if (fs.existsSync(messagePath = path.join(extensionPath, `_locales/${userLocale}/messages.json`))) {
        message = JSON.parse(fs.readFileSync(messagePath));
    } else if (commonLocale && fs.existsSync(messagePath = path.join(extensionPath, `_locales/${commonLocale}/messages.json`))) {
        message = JSON.parse(fs.readFileSync(messagePath));
    } else if (manifest.default_locale && fs.existsSync(messagePath = path.join(extensionPath, `_locales/${manifest.default_locale}/messages.json`))) {
        message = JSON.parse(fs.readFileSync(messagePath));
    }

    // check version and update
    var myManifestVersion = getManifestVersion(extensionPath);

    const AppWindow = require('../api/window.js');
    const Event = require('../api/event.js');
    
    // common
    let chrome = {
        id: extensionPath,
        Event: Event,
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
            /!**
             * @return {object}
             *!/
            getManifest: function () {
                return manifest;
            },
            /!**
             * Converts a relative path within an app/extension install directory to a fully-qualified URL
             * @param {string} path
             *      A path to a resource within an app/extension expressed relative to its install directory
             * @return {string}
             *!/
            getURL: function (path) {
                return `chrome-extension://${this.id}/${path}`;
            },
            /!**
             * @param {string} extensionId
             * @param {any} message
             * @param {object} options
             * @param {function} responseCallback
             * Since Chrome 26
             *!/
            sendMessage(extensionId, message, options, responseCallback) {
                console.error('dropping message on the floor', arguments);
            },
            /!**
             * @param {string} (optional)extensionId
             * @param {object} (optional)connectInfo
             * @return {Port}
             *!/
            connect(extensionId, connectInfo) {

            }
        },
        i18n: {
            /!**
             * @param {string} text
             * @param {function} callback
             *!/
            detectLanguage: function (text, callback) {
                // TODO
            },

            /!**
             * @param {function} callback
             *!/
            getAcceptLanguages: function (callback) {
                callback(['zh_CN', 'zh']); // TODO
            },

            /!**
             * @param {String} messageName
             * @param {*} substitutions
             * @return {string}
             *!/
            getMessage: function (messageName, substitutions) {
                if (message && message[messageName]) {
                    return message[messageName].message;
                }
                return '';
            },

            /!**
             * @return {string}
             *!/
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
    };
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
    
    if (manifest.app) {
        chrome.app = {
            runtime: {
                LaunchSource: {
                    ABOUT_PAGE: "about_page",
                    APP_LAUNCHER: "app_launcher",
                    BACKGROUND: "background",
                    CHROME_INTERNAL: "chrome_internal",
                    COMMAND_LINE: "command_line",
                    EPHEMERAL_APP: "ephemeral_app",
                    EXTENSIONS_PAGE: "extensions_page",
                    FILE_HANDLER: "file_handler",
                    KEYBOARD: "keyboard",
                    KIOSK: "kiosk",
                    LOAD_AND_LAUNCH: "load_and_launch",
                    MANAGEMENT_API: "management_api",
                    NEW_TAB_PAGE: "new_tab_page",
                    RELOAD: "reload",
                    RESTART:"restart",
                    SYSTEM_TRAY: "system_tray",
                    TEST: "test",
                    URL_HANDLER: "url_handler"
                },
                onLaunched: new Event(),
                onEmbedRequested: new Event(),
                onRestarted: new Event()
            },
            window: {
                /!**
                 *
                 * @param {string} url
                 * @param {CreateWindowOptions} options
                 * @param {function} callback
                 *!/
                create: function(url, options, callback) {

                },
                /!**
                 * @return {AppWindow}
                 *!/
                current: function () {

                },
                /!**
                 * @return array of AppWindow
                 *!/
                getAll: function () {

                },
                /!**
                 * @param {string} id
                 * @return {AppWindow}
                 *!/
                get(id) {

                },
                /!**
                 * @return {boolean}
                 *!/
                canSetVisibleOnAllWorkspaces: function () {

                }

            }
        }
    } else {
        chrome.app = {
            getDetails: function () {
                return null;
            },
            getIsInstalled: function () {
                return false;
            },
            installState: function () {

            },
            isInstalled: function () {
                return false;
            },
            runningState: function () {
                return 'cannot_run';
            }
        };
    }


    chromeCache[extensionPath] = chrome;
    return chrome;
}*/

window.createChrome = createChrome;

let protocol;
let protocolPath;
if (window.location.href.indexOf('chrome://') !== -1) {
    protocol = 'chrome';
    protocolPath = path.join(__dirname, '../../../..', 'chrome');
} else if (window.location.href.indexOf('app://') !== -1) {
    protocol = 'app';
    protocolPath = path.join(__dirname, '../../../..', 'app');
}

if (protocol) {
    let extName = window.location.href.replace(protocol + '://', '');
    let extPath = path.join(protocolPath, extName); // TODO

    const tool = require('../../../../node/tool.js');
    //const TabEx = require('../../../../node/TabEx.js');
    const system = require('../../../../node/system');
    const fileUtil = require('../../../../node/FileUtil');
    //let gl = require('./chrome/main/gl');



    window.chrome = createChrome(extPath);
    if (protocol === 'app') {
        chrome.ex = {
            tool: tool,
            system: system,
            fileUtil: fileUtil,
            //Context: Context
        }
        chrome.require = require;
        // allow jquery to load
        delete window.module;

        //window.$ = window.jQuery = require("jquery");
        //const Context = require('../../../../node/contextmenu');
    }

}

//window.chrome = chrome;
//window.require = require;


console.info('preload finished');
/*
if (window.require) {
    window.nodeRequire = require;
    delete window.require;
    delete window.exports;
    delete window.module;
}*/