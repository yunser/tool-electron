'use strict';

var os = require('os');
var fs = require('fs');
var async = require('async');
const tool = require('./tool');
const gl = require('./main/gl');

exports.defaultPath = getExtensionsPath();
exports.load = load;
exports.addToWebview = addToWebview;

function getExtensionsPath() {
    if (os.type() === 'Darwin') {
        return process.env.HOME + '/Library/Application Support/Google/Chrome/Default/Extensions'
    } else if (os.type() === 'Windows_NT') {
        return process.env.USER_PROFILE + '/AppData/Local/Google/Chrome/User Data/Default'
    } else { // Linux
        return process.env.HOME + '/.config/google-chrome/Default/Extensions/'
    }
}

function load(path, callback) {
    fs.readdir(path, (err, extensionIds) => {
        if (err) {
            return callback(err);
        }
        async.map(extensionIds, (id, cb) => loadVersions(path + '/' + id, cb), (err, extensions) => {
            callback(err, [].concat.apply([], extensions))
        })
    })
}

function loadVersions(path, callback) {
    fs.readdir(path, (err, extensionVersions) => {
        if (err) return callback(null, {versions: []});
        async.map(extensionVersions, (version, cb) => loadExtension(path + '/' + version, cb), callback)
    })
}

var Allpersissions = ['background', 'bookmarks', 'clipboardRead', 'clipboardWrite',
    'contentSettings', 'contextMenus', 'cookies', 'debugger', 'history', 'idle', 'management',
    'notifications', 'pageCapture', 'tabs', 'topSites', 'webNavigation', 'webRequest',
    'webRequestBlocking', 'storage', 'activeTab'
];

function getIdByPath(path) {
    let arr = path.replace(/\\/g, '/').split('/');
    return arr[arr.length - 2];
}

function loadExtension(path, callback) {
    path = path.replace(/\\/g, '/');

    fs.readFile(path + '/manifest.json', (err, contents) => {
        if (err) {
            return callback(null, {
                name: err.name,
                description: err.message
            });
        }

        var manifest = JSON.parse(contents);

        if (!manifest) {
            return callback({
                name: 'default_locale error',
                description: '清单文件缺失或不可读。'
            });
        }
        //console.log('load extension ' + manifest.name);

        console.log(manifest.name);
        checkManifest(manifest);

        if (fs.existsSync(path + '/_locales')) {
            console.log('存在'+manifest.default_locale)
            if (!manifest.default_locale) {
                return callback(null, {
                    name: 'default_locale error',
                    description: '已使用本地化功能，但未在清单中指定 default_locale。'
                });
            }
        }

        let extension = manifest;
        extension.id = getIdByPath(path);
        extension.path = path;

        localizeStrings(extension, callback);
    })
}

// check whether the manifest file is valid
function checkManifest(manifest) {
    // check permissions
    if (manifest.permissions) {
        manifest.permissions.forEach((permission) => {
            if (!Allpersissions.contains(permission) && !/^http/.test(permission)) {
                console.error(`permission '${permission}' is unknown`);
                return false;
            }
        });
    }
    if (!manifest.name) {
        console.error("Required value 'name' is missing or invalid.");
        return false;
    }
    if (manifest.manifest_version !== 2) {
        console.error("The 'manifest_version' key must be present and set to 2 (without quotes). See developer.chrome.com/extensions/manifestVersion.html for details.");
        return false;
    }
    if (manifest.description && manifest.description.length > 500) {
        console.error("Required value 'description' is invalid.");
        return false;
    }
    return true;
}

function localizeStrings(extension, callback) {
    var file = extension.path + '/_locales/en/messages.json';
    fs.readFile(file, (err, contents) => {
        if (err) {
            return callback(null, extension); // return as-is
        }
        if (extension.name.startsWith('__MSG_')) {
            var msgName = extension.name.substring(6, extension.name.length - 2);
            var messages = JSON.parse(contents);
            if (messages[msgName]) extension.name = messages[msgName].message;
            else if (messages[msgName.toLowerCase()]) extension.name = messages[msgName.toLowerCase()].message;
            else console.log(`No ${msgName} found in ${JSON.stringify(messages)}`)
        }
        callback(null, extension);
    })
}

function addToWebview(webview, extension, callback) {
    // handle content_scripts
    let scripts = extension.content_scripts || [];
    let url = webview.src || webview.getURL();
    scripts = getMatchingContentScripts(scripts, url);
    scripts = getIncludedContentScripts(scripts, url);
    // ToDo: check exclude_globs
    if (scripts.length === 0) {
        return callback(null);
    }

    let jsPath = [];
    for (let i = 0; i < scripts.length; i++) {
        console.log(scripts[i]);
        for (let j = 0; j < scripts[i].js.length; j++) {
            jsPath.push(path.resolve(extension.path, scripts[i].js[j]));
        }
    }
    for (let i = 0; i < jsPath.length; i++) {
        console.info(jsPath[i]);
    }

   getAllScriptCode(extension, scripts, (err, code) => {
        if (err) {
            return callback(err);
        }
        console.log('executeJavaScript');
        window.curAppPath = new Date().getTime();
        webview.getWebContents().executeJavaScript(code, false, (result) => {
            console.log('Loaded extension', extension.name);
            callback(null);
        })
    });
}

function getMatchingContentScripts(scripts, url) {
    return scripts.filter((script) => {
        return script.matches.some((match) => {
            let pattern = match.replace(/\*/g, '.*')
            return url.match(pattern)
        })
    })
}

function getIncludedContentScripts(scripts, url) {
    return scripts.filter((script) => {
        if (!script.include_globs) return false
        return script.include_globs.some((glob) => {
            let pattern = glob.replace(/\*/g, '.*')
            return url.match(pattern)
        })
    })
}

function getAllScriptCode(extension, content_scripts, callback) {
    async.map(content_scripts, (content_script, cb) => getContentScriptCode(extension, content_script.js, cb), (err, scripts) => {
        let chromeJs = path.resolve(__dirname, 'preload.js');
        /*getScript(chromeJs, (chromeJs) => {
            
        })*/
        callback(err, scripts.join('\n'))
    })
}

window.extCache2 = {

};

function getContentScriptCode(extension, content_script_js, callback) {
    async.map(content_script_js, (path, cb) => getScript(extension.path + '/' + path, cb), (err, scripts) => {
        let extScriptCode = scripts.join('\n'); // 插件所有代码

        let cacheId = new Date().getTime();
        window.extCache2[cacheId] = extension;

        // 把插件的代码放到闭包里面执行
        console.log(`"${extension.path}"`);

        let code = `
        (function (chrome) {
        ${extScriptCode}
        })(window.createChrome("${extension.path.replace(/\\/g, '/')}"));
        `
        callback(err, code)
    })
}

function getScript(url, callback) {
    fs.readFile(url, (err, contents) => {
        callback(err, contents);
    })
}