/**
 * 上下文菜单插件
 */

let $ = jQuery;
let ui = window.UI;

ui.$curContextElem = null; // 全局唯一上下文菜单

function Context(elem, option) {
    var that = this;
    that.opts = $.extend({}, Context.DEFAULTS, option);
    that.elem = elem;
    var $menu = $(that.opts.content);

    function handle(elem, e) {
        e.preventDefault();
        e.stopPropagation();

        ui.contextmenu($menu[0], e.clientX, e.clientY);
        
        that.opts.show && that.opts.show(elem);
    }

    if (that.opts.item) {
        $(elem).on('contextmenu', that.opts.item, function (e) {
            handle(this, e);
            return true;
        });
    } else {
        $(elem).on('contextmenu', function (e) {
            handle(this, e);
            return true;
        });
    }


    $menu.on('contextmenu', function () {
        return false;
    });


}

Context.DEFAULTS = {
    //content
    show: function (ui) {},
    hide: function (ui) {}
};

$.fn.contextmenu = function (option) {
    return $(this).each(function (e) {
        new Context(this, option);
    });
}

$(document).on('click', function (e) {
    if ($(e.target).parents(".context-active").length == 0
        || $(e.target).is('.dropdown-menu a')) {
        if (ui.$curContextElem) {
            ui.$curContextElem.hide();
            ui.$curContextElem.removeClass('context-active');
            ui.$curContextElem = null;
        }
    }
});

ui.contextmenu = function (elem, x, y) {
    var $elem = $(elem);
    var width = $elem.outerWidth();
    var height = $elem.outerHeight();
    var winWidth = $(window).width();
    var winHeight = $(window).height();
    var ptX = x;
    var ptY = y;

    if (ptY < winHeight - height) {

    } else if (ptY > height) {
        ptY = y - height;
    } else {
        ptY = winHeight - height;
    }

    if (ptX < winWidth - width) {

    } else if (ptX > width) {
        ptX = x - width;
    } else {
        ptX = winWidth - width;
    }

    // 如果已经显示了上下文菜单，则关闭
    if (ui.$curContextElem) {
        ui.$curContextElem.hide();
        ui.$curContextElem.removeClass('context-active');
        ui.$curContextElem = null;
    }
    
    // 显示新的菜单
    $elem.css({
        'left': ptX,
        'top': ptY
    });
    $elem.css('zIndex', 10000001);
    $elem.show();
    $elem.addClass('context-active');
    ui.$curContextElem = $elem;
};

export default Context;