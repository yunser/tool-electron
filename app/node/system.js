/**
 * encapsulate electron here, you should't require electron in other Javascript file
 * Created by cjh1 on 2016/11/26.
 */

const remote = require('electron').remote;
const ipc = require("electron").ipcRenderer;
const http = require("http");
const fs = require('fs');
const path = require('path');
const async = require("async");
const Stack = require('./Stack');
const File = require('./File');
const fileUtil = require('./fileUtil');

function getExt(filename) {
    if (!filename) {
        return null;
    }
    if (filename.lastIndexOf(".") !== -1) {
        let ext = filename.toLowerCase().substr(filename.lastIndexOf(".") + 1);
        return ext;
    }
    return null;
}
function getNameFromPath(filename) {
    return filename.substr(filename.lastIndexOf('\\')+1);
}

function walk(dir, depth, done) {
    var results = [];
    function compare(a, b) {
       /* return a > b;
        if (/^\w/.test(a)) {
            return false;
        }*/
        return b.localeCompare(a);
    }
    function sortHandle(a, b) {
        if (a.isParent && !b.isParent) {
            return false;
        }
        if (b.isParent && !a.isParent) {
            return true;
        }
        if (a.isParent) {
        }
        /*if (a.isParent) {
            if (b.isParent) {
                return compare(a.name, b.name);
            } else {
                return false;
            }
        } else {
            if (b.isParent) {
                return true;
            } else {
                return compare(a.name, b.name);
            }
        }*/
        return compare(a.name, b.name);
    }
    function myDown(results) {
        done(null, results.sort(sortHandle));
    }
    fs.readdir(dir, function(err, list) {
       /* console.log(['123', 'a', 'c', 'd', '456', '中文', '呵呵'].sort(function (a, b) {
            return a.localeCompare(b);
        }));*/

        if (err) {
            return done(err);
        }

        var pending = list.length;
        if (!pending) {
            return myDown(results);
        }
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    var fileName = getNameFromPath(file);
                    if (fileName.charAt(0) !== '.') {
                        walk(file, depth + 1, function(err, res) {
                            results.push({
                                open: depth < 1,
                                file: file,
                                name: getNameFromPath(file),
                                isParent: true,
                                children: res,
                            });
                            if (!--pending) {
                                myDown(results);
                            }
                        });
                    } else {
                        if (!--pending) {
                            myDown(results);
                        }
                    }


                } else {
                    if (file.charAt(0) !== '.') {
                        var ext = getExt(file);
                        results.push({
                            file: file,
                            className: 'node-' + ext,
                            drop: false,
                            isParent: false,
                            name: getNameFromPath(file)
                        });
                    }

                    if (!--pending) {
                        myDown(results);
                    }
                }
            });
        });
    });
}

class System {

    constructor() {
        this.init();
    }

    loadFiles(path, done) {
        walk(path, 1, function (err, results) {

            let root = {
                open: true,
                file: path,
                name: getNameFromPath(path),
                isParent: true,
                children: results
            };
            done(err, [root]);
        });
    }

    init() {
        var that = this;
        ipc.on('open-directory', function (event, arg) {
            if (arg) {
                let file = new File();
                file.path = arg[0];
                // TODO

                typeof that.selectDirCall === 'function' && that.selectDirCall(null, arg[0]);
            }
        });

        ipc.on('open-file', function (event, arg) {
            if (arg) {
                typeof that.selectFileCall === 'function' && that.selectFileCall(arg[0]);
            }
        });

        this.filesObj = require('./files.json');

        /*// 高级调试
        console.log = (function(oriLogFunc){
            return function(str)
            {
                ipc.send('debug', [oriLogFunc, arguments]);
                //oriLogFunc.apply(console, arguments);
            }
        })(console.log);*/
    }

    readFile(path, call) {
        fs.readFile(path, 'utf8', call);
    }

    selectDir(call) {
        this.selectDirCall = call;
        ipc.send('open-files');
    }

    selectFile(call) {
        this.selectFileCall = call;
        ipc.send('open-file');
    }

    dealAppProtocol() {
        return this.getAppPath() + '/search/app.html';
    }
    
    openFile(path) {
        let ext = fileUtil.getExt(path);
        let appName = this.filesObj[ext];
        if (appName === 'system') {
            ipc.send('open-url', path);
        } else {
            let appPath = this.getAppPath() + '/app/' + this.filesObj[ext] + '/index.html?url='
            + encodeURI(path);
            window.open(appPath);
        }
        /*ui.prompt({
            title: '打开'+ext,
            value: '123'
        }, function (name, index) {
            if (!name) {
                ui.msg('请输入文件名');
                return;
            }
            ui.close(index);
            //system.rename(fm.selectFile, fm.selectFile.replace(fileName, name));
            //fm.refresh();
        })*/
        //
    }

    getParam(search, name) {
        if (!search) {
            return null;
        }
        let param = search.split('?')[1];
        let path = param.split('&')[0];
        if (path.split('=')[0] === 'url') {
            //return ;
            return decodeURI(path.split('=')[1]);
        } else {
            return null;
        }
    }

    openUri(uri) {
        ipc.send('open-url', uri);
    }

    mkdir(path, done) {
        fs.mkdir(path, 777, done);
    }

    writeFile(path, content, done) {
        fs.writeFile(path, content, 'utf8', done);
    }

    rename(path, dest) {
        fs.rename(path, dest);
    }

    createDoc(bookPath) {
        let resPath = path.join(__dirname, 'res');
        let tplPath = path.join(resPath, 'template.html');
        let assetPath = path.join(resPath, 'asset');

        let destPath = path.join(bookPath, '_book'); // 存放所有文件的目录
        let summaryPath = path.join(bookPath, 'SUMMARY.md');

        // 如果文件夹不存在，创建文件夹
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, 777);
        }

        // 复制资源文件
        copyDir(assetPath, destPath + '\\asset', function (err) {
            if (err) {
                console.dir(err);
            } else {

            }
        });

        var summary = fs.readFileSync(summaryPath, 'utf-8');
        let sObj = summaryObj(summary);

        dealFiles.unshift('README.md');
        // 遍历目录
        dealFiles.forEach(function (file) {
            var mdFile = path.join(bookPath, file);
            if (!fs.existsSync(mdFile)) {
                return;
            }
            let markdown = fs.readFileSync(mdFile, 'utf8');

            //var htmlFile = mdFile.replace(/\.md$/, '.html');
            var htmlFile = path.join(destPath, file).replace(/\.md$/, '.html')
                .replace(/(README)|(readme)/, 'index');

            var template = fs.readFileSync(tplPath, 'utf8');

            let filePath = path.join(destPath, 'index.html');
            let html = marked(markdown, {});

            var relative = htmlFile.replace(destPath, '');
            var pathCount = 0;
            for (var i = 0; i < relative.length; i++) {
                if (relative.charAt(i) === path.sep) {
                    pathCount++;
                }
            }
            var relativePath = '';
            for (var i = 0; i < pathCount - 1; i++) {
                relativePath += '../'
            }

            var summary = dealSummary(sObj, relativePath);
            html = template.replace('{{title}}', '无题').replace('{{content}}', html)
                .replace('{{summary}}', summary).replace(/\{\{path\}\}/g, relativePath)
                .replace('{{theme}}', 'book');
            // 如果文件夹不存在，创建文件夹
            if (!fs.existsSync(path.dirname(htmlFile))) {
                fs.mkdirSync(path.dirname(htmlFile), 777);
            }


            fs.writeFileSync(htmlFile, html, 'utf8');


        });

        window.open(path.join(destPath, 'index.html'));
    }

    getUserPath() {
        const username = 'lucy';
        // TODO
        return path.resolve('G:/install/apache2.4/htdocs/yunser/tool/note/app/file/user/' + username, '.');
    }

    getSearchUrl(keyword) {
        if (keyword.startWith('@')) {
            let appName = keyword.substring(1);
            return `file:///G:/install/apache2.4/htdocs/yunser/tool/note/app/app/${appName}/index.html`; // TODO
        } else {
            return config.engine[config.default].replace('{inputEncoding}', config.inputEncoding)
                .replace('%s', keyword);
        }
    }

    removeFile(path, call) {
        if (!fs.existsSync(path)) {
            return;
        }
        fs.stat(path, function(err, stat) {
            if (stat && stat.isDirectory()) {
                deleteFolderRecursive(path);
                typeof call === 'function' && call();
            } else {
                fs.unlink(path, call);
            }
        });
    }
    
    getAppPath() {
        return path.resolve(__dirname, '..');
    }
}

function readLines(input, func) {
    var remaining = '';
    input.on('data', function(data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        while (index > -1) {
            var line = remaining.substring(0, index);
            remaining = remaining.substring(index + 1);
            func(line);
            index = remaining.indexOf('\n');
        }

    });

    input.on('end', function() {
        if (remaining.length > 0) {
            func(remaining);
        }
    });
}

function func(data) {
    container.push(data);
}


// cursively make dir
function mkdirs(p, mode, f, made) {
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 777 & (~process.umask());
    }
    if (!made)
        made = null;

    var cb = f || function () {};
    if (typeof mode === 'string')
        mode = parseInt(mode, 8);
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirs(path.dirname(p), mode, function (er, made) {
                    if (er) {
                        cb(er, made);
                    } else {
                        mkdirs(p, mode, cb, made);
                    }
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) {
                        cb(er, made);
                    } else {
                        cb(null, made)
                    };
                });
                break;
        }
    });
}
// single file copy
function copyFile(file, toDir, cb) {
    async.waterfall([
        function (callback) {
            fs.exists(toDir, function (exists) {
                if (exists) {
                    callback(null, false);
                } else {
                    callback(null, true);
                }
            });
        }, function (need, callback) {
            if (need) {
                mkdirs(path.dirname(toDir), callback);
            } else {
                callback(null, true);
            }
        }, function (p, callback) {
            var reads = fs.createReadStream(file);
            var writes = fs.createWriteStream(path.join(path.dirname(toDir), path.basename(file)));
            reads.pipe(writes);
            //don't forget close the  when  all the data are read
            reads.on("end", function () {
                writes.end();
                callback(null);
            });
            reads.on("error", function (err) {
                callback(true, err);
            });

        }
    ], cb);

}

// cursively count the  files that need to be copied

function _ccoutTask(from, to, cbw) {
    async.waterfall([
        function (callback) {
            fs.stat(from, callback);
        },
        function (stats, callback) {
            if (stats.isFile()) {
                cbw.addFile(from, to);
                callback(null, []);
            } else if (stats.isDirectory()) {
                fs.readdir(from, callback);
            }
        },
        function (files, callback) {
            if (files.length) {
                for (var i = 0; i < files.length; i++) {
                    _ccoutTask(path.join(from, files[i]), path.join(to, files[i]), cbw.increase());
                }
            }
            callback(null);
        }
    ], cbw);

}
// wrap the callback before counting
function ccoutTask(from, to, cb) {
    var files = [];
    var count = 1;

    function wrapper(err) {
        count--;
        if (err || count <= 0) {
            cb(err, files)
        }
    }
    wrapper.increase = function () {
        count++;
        return wrapper;
    }
    wrapper.addFile = function (file, dir) {
        files.push({
            file : file,
            dir : dir
        });
    }

    _ccoutTask(from, to, wrapper);
}


function copyDir(from, to, cb) {
    if(!cb){
        cb=function(){};
    }
    async.waterfall([
        function (callback) {
            fs.exists(from, function (exists) {
                if (exists) {
                    callback(null, true);
                } else {
                    callback(true);
                }
            });
        },
        function (exists, callback) {
            fs.stat(from, callback);
        },
        function (stats, callback) {
            if (stats.isFile()) {
                // one file copy
                copyFile(from, to, function (err) {
                    if (err) {
                        // break the waterfall
                        callback(true);
                    } else {
                        callback(null, []);
                    }
                });
            } else if (stats.isDirectory()) {
                ccoutTask(from, to, callback);
            }
        },
        function (files, callback) {
            // prevent reaching to max file open limit
            async.mapLimit(files, 10, function (f, cb) {
                copyFile(f.file, f.dir, cb);
            }, callback);
        }
    ], cb);
}

function getBlankCount(str) {
    var count = 0;
    for (let i = 0; i < str.length; i++) {
        if (str.charAt(0) === ' ') {
            count++;
        } else {
            return count;
        }
    }
    return count;
}
var dealFiles = [];

function summaryObj(summary) {
    var arr = summary.split('\n');
    var htmlObj = [];
    var stack = new Stack();
    var lastLi = null;
    var top;
    arr.forEach(function (data) {
        if (data.trim().startsWith('*')) {
            var mat = /.*?\[(.*?)\]\((.*?)\)/.exec(data);
            dealFiles.push(mat[2]);
            if (mat) {
                var blankCount = getBlankCount(data);
                if ((top = stack.top())) {
                    if (blankCount >= top.blankCount) {
                        stack.push({
                            text: mat[1],
                            url: mat[2],
                            blankCount: blankCount
                        });
                    } else {
                        var children = [];
                        var count = 1;
                        while (stack.top() && stack.top().blankCount !== blankCount) {
                            count++;
                            if (count > 10) {
                                return;
                            }
                            children.push(stack.pop());
                        }
                        if (stack.top() && children.length) {
                            var pop = stack.pop();
                            pop.children = children.reverse();
                            stack.push(pop);
                        }
                        stack.push({
                            text: mat[1],
                            url: mat[2],
                            blankCount: blankCount
                        });
                    }
                } else {
                    stack.push({
                        text: mat[1],
                        url: mat[2],
                        blankCount: blankCount
                    });
                }
                /*htmlObj.push({
                    text: mat[1],
                    url: mat[2]
                })*/
            }
        }
    });

    var stack2 = new Stack();

    var topLength = stack.top().blankCount;
    while (stack.top() && stack.top().blankCount === topLength) {
        stack2.push(stack.pop());
    }
    if (stack.top()) {
        var children = [];
        while (top = stack2.top()) {
            children.push(stack2.pop());
        }
        var pop = stack.pop();
        pop.children = children.reverse();
        stack.push(pop);
        while (top = stack.top()) {
            htmlObj.push(stack.pop());
        }
    } else {
        while (top = stack2.top()) {
            htmlObj.push(stack2.pop());
        }
    }
    return htmlObj.reverse();
}

function cal(item, relativePath) {
    var href = item.children ? '#' : (relativePath + item.url.replace(/\.md$/, '.html'));
    return `<li><a href="${href}">${item.text}`
        + function () {

            if (item.children) {
                var childHtml = '<ul>'
                item.children.forEach(function (item2) {
                    childHtml += cal(item2, relativePath);
                });
                childHtml += '</ul>';
                return childHtml;
            } else {
                return '';
            }
        }()
        + `</a>`;
}

function dealSummary(htmlObj, relativePath) {
    var html = '<ul class="summary-list">';
    htmlObj.forEach(function (item) {
        html += cal(item, relativePath);
    });
    html += '</ul>';
    return html;
}

// you can config the search engine here
let config = {
    inputEncoding: 'UTF-8',
    default: 'baidu', // default search engine
    engine: {
        google: 'https://www.google.com/search?q=%s',
        // some good engine in China
        baidu: 'http://www.baidu.com/s?ie={inputEncoding}&wd=%s',
        zhihu: 'https://www.zhihu.com/search?type=content&q=%s',
        sogou: 'https://www.sogou.com/web?query=%s',
    }
};



var deleteFolderRecursive = function(path) {

    var files = [];

    if( fs.existsSync(path) ) {

        files = fs.readdirSync(path);

        files.forEach(function(file,index){

            var curPath = path + "/" + file;

            if(fs.statSync(curPath).isDirectory()) { // recurse

                deleteFolderRecursive(curPath);

            } else { // delete file

                fs.unlinkSync(curPath);

            }

        });

        fs.rmdirSync(path);

    }

};



let system = new System();

module.exports = system;

/*var url = "http://s0.hao123img.com/res/img/logo/logonew.png";
 http.get(url, function(res){
 var imgData = "";
 console.log(res);
 res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
 res.on("data", function(chunk){
 imgData+=chunk;
 });
 res.on("end", function(){
 fs.writeFile(imagePath, imgData, "binary", function(err){
 if(err){
 console.log("down fail");
 }
 console.log("down success");
 });
 });
 });*/