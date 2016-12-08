var wallpaper = require('../../node/wallpaper.js');

console.log(wallpaper.getUrl((url) => {
    console.log(url);
}));

/**
 * Created by cjh1 on 2016/11/12.
 */
;(function ($) {
    function MultSelect(elem, option) {
        var that = this;

        that.opts = $.extend({}, {
            item: 'li'
        }, option);

        var down = false;
        var $select = $('#ui-mult-select');
        var startX;
        var startY;
        var $items = $(elem).find(that.opts.item);

        if (!$select.length) {
            $select = $('<div id="ui-mult-select" style="position: absolute; display: none; border: 1px dashed #000;opacity: .3;"></div>');
            $(document.body).append($select)
        }

        /*var startEvent = 'touchstart';
        var moveEvent = 'touchmove';
        var endEvent = 'touchend';*/
        var startEvent = 'mousedown';
        var moveEvent = 'mousemove';
        var endEvent = 'mouseup';

        $(document).on(startEvent, function (e) {
            down = true;
            startX = e.pageX;
            startY = e.pageY;
        });

        $(document).on(moveEvent, function (e) {
            if (!down) {
                return;
            }

            var endX = e.pageX;
            var endY = e.pageY;

            var x = Math.min(startX, endX);
            var y = Math.min(startY, endY);
            var w = Math.abs(startX - endX);
            var h = Math.abs(startY - endY);

            var x2 = startX < endX ? endX : startX;
            $select.css({
                width: w + 'px',
                height: h + 'px',
                left: x + 'px',
                top: y + 'px'
            })
            $select.show();

            i = 0;
            $items.each(function () {
               var $this = $(this);
                var left = $this.offset().left;
                var top = $this.offset().top;
                var width = $this.outerWidth();
                var height = $this.outerHeight();
                console.log(width, height);
                var xx = Math.abs((x + w / 2) - (left + width / 2));
                var yy = Math.abs((y + h / 2)  - (top + height / 2));
                if (i == 0) {
                }
                if ((xx < (w / 2 + width / 2)) && (yy < (h / 2 + height / 2))) {
                    $this.addClass('active');
                    //$this.hide();
                } else {
                    $this.removeClass('active');
                }
            });
        });

        $(document).on(endEvent, function () {
            if (down) {
                down = false;
                $select.hide();
            }
        });
        
    }

    $.fn.multSelect = function (option) {
        return $(this).each(function () {
            new MultSelect(this, option);
        })
    }
})(jQuery);

/*$('#tool-list').on('click', 'a', function (e) {
 e.preventDefault();
 ui.frame(this.href, {
 maxmin: true
 });
 });*/
$('#tool-list').on('click', '[data-target]', function (e) {
     e.preventDefault();
     ui.frame(this.href, {
         size: ['800px', '500px'],
         maxmin: true
     });
 });

$('#start-menu').on('click', function (e) {
    e.preventDefault();
    $('#start-box').toggle();
});

/*$('#tool-list').multSelect({
 item: '.list-item'
 });*/

document.onselectstart = function () {
    return false;
};

// 计算右下角时间
var date = new Date();
var dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
document.getElementById('date').innerHTML = dateStr;


var Canvas = {};

Canvas.cxt = document.getElementById('canvasId').getContext('2d');

Canvas.Point = function(x, y){
    this.x = x;
    this.y = y;
};

/*擦除canvas上的所有图形*/
Canvas.clearCxt = function(){
    var me = this;
    var canvas = me.cxt.canvas;
    me.cxt.clearRect(0,0, canvas.offsetWidth, canvas.offsetHeight);
};

/*时钟*/
Canvas.Clock = function(){
    var me = Canvas,
        c = me.cxt,
        radius = 150, /*半径*/
        scale = 20, /*刻度长度*/
        minangle = (1/30)*Math.PI, /*一分钟的弧度*/
        hourangle = (1/6)*Math.PI, /*一小时的弧度*/
        hourHandLength = radius/2, /*时针长度*/
        minHandLength = radius/3*2, /*分针长度*/
        secHandLength = radius/10*9 - 2, /*秒针长度*/
        center = new me.Point(c.canvas.width/2, c.canvas.height/2); /*圆心*/

    /*绘制圆心（表盘中心）*/
    function drawCenter(){
        c.save();

        c.translate(center.x, center.y);

        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(0, 0, radius/20, 0, 2*Math.PI);
        c.closePath();
        c.fill();
        c.stroke();

        c.restore();
    };

    /*通过坐标变换绘制表盘*/
    function drawBackGround(){
        c.save();

        c.translate(center.x, center.y); /*平移变换*/
        // 绘制刻度
        function drawScale(scale){
            c.moveTo(radius - scale, 0);
            c.lineTo(radius, 0);
        };

        c.strokeStyle = '#fff';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(0, 0, radius, 0, 2*Math.PI, true);
        c.closePath();

        for (var i = 1; i <= 12; i++) {
            var scale = ((i - 1) % 3 === 0) ? 18 : 12;
            drawScale(scale);
            c.rotate(hourangle); /*旋转变换*/
        };

        c.stroke();

        c.restore();
    };

    // 绘制时针
    this.drawHourHand = function(h){
        h = h === 0? 24: h;

        c.save();
        c.translate(center.x, center.y);
        c.rotate(3/2*Math.PI);

        c.rotate(h*hourangle);

        c.strokeStyle = '#fff';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(hourHandLength, 0);
        c.stroke();
        c.restore();
    };

    /*绘制分针（m: 当前分）*/
    this.drawMinHand = function(m){

        m = m === 0? 60: m;

        c.save();
        c.translate(center.x, center.y);
        c.rotate(3/2*Math.PI);

        c.rotate(m*minangle);

        c.strokeStyle = '#fff';
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(minHandLength, 0);
        c.stroke();
        c.restore();
    };

    /*绘制秒针（s：当前秒）*/
    this.drawSecHand = function(s){

        s = s === 0? 60: s;

        c.save();
        c.translate(center.x, center.y);
        c.rotate(3/2*Math.PI);

        c.rotate(s*minangle);

        c.strokeStyle = '#eb584d';
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(secHandLength, 0);
        c.stroke();
        c.restore();
    };

    /*依据本机时间绘制时钟*/
    this.drawClock = function(){
        var me = this;

        function draw(){
            var date = new Date();

            Canvas.clearCxt();

            drawBackGround();
            drawCenter();
            me.drawHourHand(date.getHours() + date.getMinutes()/60);
            me.drawMinHand(date.getMinutes() + date.getSeconds()/60);
            me.drawSecHand(date.getSeconds());

            // 显示时间数字
            var date = new Date();
            var timeStr = date.getHours() + ':' + date.getMinutes();
            document.getElementById('time').innerHTML = timeStr;
        }
        draw();
        setInterval(draw, 1000);
    };
};

var clock = new Canvas.Clock();
clock.drawClock();

$(document).contextmenu({
    content: '#global-menu'
});
$('#global-menu-about').on('click', function (e) {
    e.preventDefault();
    ui.alert('云桌面 v1.1');
});
$('#global-menu-help').on('click', function (e) {
    e.preventDefault();
    ui.msg('暂无帮助');
});

