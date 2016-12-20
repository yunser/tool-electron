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
const {createChrome} = require('../api/chrome');

const selfBrowserWindow = remote.getCurrentWindow();
const selfId = selfBrowserWindow.id;

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
else if (window.location.href.indexOf('chrome-extension://') !== -1) {
    protocol = 'chrome-extension';
    protocolPath = path.join(__dirname, '../../../..', 'extension');
}

let remoteGlobal = remote.getGlobal('global');


function getExtensionById(id) {
    for (let i = 0; i < remoteGlobal.exts.length; i++) {
        if (remoteGlobal.exts[i].id === id) {
            return remoteGlobal.exts[i];
        }
    }
    return null;
}

if (protocol) {
    let extPath;
    if (protocol === 'chrome') {
        let extName = window.location.href.replace(protocol + '://', '').split('/', 2)[0];
        extPath = path.join(protocolPath, extName); // TODO
    } else if (protocol === 'chrome-extension') {
        let extId = window.location.href.replace(protocol + '://', '').split('/', 2)[0];
        extPath = getExtensionById(extId).path;
    }


    const tool = require('../../../../node/tool.js');
    //const TabEx = require('../../../../node/TabEx.js');
    const system = require('../../../../node/system');
    const fileUtil = require('../../../../node/FileUtil');
    //let gl = require('./chrome/main/gl');


    console.log('createChrome:'+extPath);
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

if (/^file:\/\//.test(window.location.href)) {

} else {
    //window.nodeRequire = require;
    delete window.require;
    delete window.exports;
    delete window.module;
}