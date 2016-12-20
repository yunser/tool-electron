/**
 * Created by cjh1 on 2016/12/12.
 */

if (window.require) {
    const system = require('../../node/system');
    const tool = require('../../node/tool');
    const ipc = require("electron").ipcRenderer;
    const path = require('path');

    $(document).on('click', 'a', function (e) {
        if (!e.isDefaultPrevented()) {
            if (this.href.startWith('app://')) {
                let appName = this.href.substring(6);
                console.log(appName);

                let url = 'file:///' + path.resolve(system.getAppPath(), `app/${appName}/index.html`);
                if ($(this).attr('target') === '_blank') {
                    window.open(url);
                } else {
                    location.href = url;
                }
                console.log('内部组织')
                e.preventDefault();
            }

            /*if (this.href.indexOf('app://') !== -1) {
             //mainWindow.webContents.send('will-navigate', url);
             e.preventDefault();
             ipc.send('will-navigate2', this.href);
             //location.href = system.dealAppProtocol();
             }*/
        }
    });
}

$(document).on('mousedown', '.btn', function (e) {
    let $btn = $(this);
    let wavesDiv = $btn.find("div");

    // 第一次没有涟漪div，动态生成
    if (!wavesDiv.length){
        var div = "<div class='waves-effect'></div>";
        $btn.prepend(div);
        wavesDiv = $btn.find("div");
    }

    // 设置按钮样式为’waves-effect‘即去掉动画样式’waves-effect-animation‘
    wavesDiv[0].className = 'waves-effect';

    // 计算涟漪坐标（折算成左上角坐标而非中心点），涟漪大小（取外标签最长边）
    var wH = $btn.width() > $btn.height() ? $btn.width() : $btn.height();
    var iX = e.pageX - $btn.offset().left;
    var iY = e.pageY - $btn.offset().top;
    var nX = iX - wH / 2;
    var nY = iY - wH / 2;

    // 设置涟漪div样式，准备播放动画
    wavesDiv.css({
        width: wH,
        height: wH,
        left: nX,
        top: nY
    }).addClass("waves-effect-animation"); // 播放动画
});