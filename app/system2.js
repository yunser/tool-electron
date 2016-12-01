/**
 * Created by cjh1 on 2016/12/1.
 */
function System() {
    this.init();
}

System.prototype.init = function () {
};

System.prototype.showMenu = function (trayMenuTemplate) {
};

System.prototype.on = function () {

};

System.prototype.readFile = function (path, call) {
    var content = localStorage.getItem('content');
    call(null, content);
};

System.prototype.say = function () {

};

System.prototype.selectDir = function (call) {
};

System.prototype.selectFile = function (call) {
};

System.prototype.openUri = function (uri) {
};

System.prototype.loadFiles = function (path, done) {
};

System.prototype.mkdir = function (path, done) {
};

System.prototype.writeFile = function (path, content, done) {
    localStorage.setItem('content', content);
    ui.msg('本地保存成功');
};

System.instance = new System();
System.getInstance = function () {
    return System.instance;
};