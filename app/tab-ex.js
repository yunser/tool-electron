/**
 * tab-ex.js v16.12
 */

;(function ($) {

})(jQuery);

class TabEx {
    
    constructor(elem, option) {
        var that = this;

        that.elem = document.getElementById(elem);
        that.$elem = $(elem);

        that.opts = $.extend({}, TabEx.DEFAULTS, option);

        var monitor = document.getElementById(that.opts.monitor);
        $(that.opts.monitor).on('click', '[data-addtab]', function () {
            that.add({
                id: $(this).attr('data-addtab'),
                title: $(this).attr('title') ? $(this).attr('title') : $(this).html(),
                content: that.opts.content ? that.opts.content : $(this).attr('content'),
                url: $(this).attr('url'),
                ajax: $(this).attr('ajax') ? true : false
            });
        });

        that.$elem.on('click', '.close-tab', function () {
            var id = $(this).prev("a").attr("aria-controls");
            that.close(id);
        });

        $(window).resize(function () {
            that.drop();
        });
    }

    add (opts) {
        var that = this;

        var id = 'tab_' + opts.id;
        that.$elem.find('.active').removeClass('active');
        //如果TAB不存在，创建一个新的TAB
        if (!$("#" + id)[0]) {
            //创建新TAB的title
            console.log('不存在');

            var title = $('<li>', {
                'class': 'nav-item',
                'role': 'presentation',
                'id': 'tab_' + id
            }).append(
                $('<a>', {
                    'class': 'nav-link',
                    'href': '#' + id,
                    'aria-controls': id,
                    'role': 'tab',
                    'data-toggle': 'tab'
                }).html(opts.title)
            );

            //是否允许关闭
            if (that.opts.close) {
                title.append(
                    $('<i>',{class:'close-tab icon icon-close'})
                );
            }
            //创建新TAB的内容
            var content = $('<div>', {
                'class': 'tab-pane',
                'id': id,
                'role': 'tabpanel'
            });

            //是否指定TAB内容
            if (opts.content) {
                content.append(opts.content);
            } else if (that.opts.iframeUse && !opts.ajax) {//没有内容，使用IFRAME打开链接
                content.append(
                    $('<iframe>', {
                        'class': 'iframeClass',
                        'height': that.opts.iframeHeight,
                        'frameborder': "no",
                        'border': "0",
                        'src': opts.url
                    })
                );
            } else {
                $.get(opts.url, function (data) {
                    content.append(data);
                });
            }
            //加入TABS
            that.$elem.children('.nav').append(title);
            that.$elem.children(".tab-content").append(content);
        }

        //激活TAB
        $("#tab_" + id).addClass('active');
        $("#" + id).addClass("active");
        that.drop();
    }

    close (id) {
        var that = this;

        //如果关闭的是当前激活的TAB，激活他的前一个TAB
        if (that.$elem.find("li.active").attr('id') == "tab_" + id) {
            $("#tab_" + id).prev().addClass('active');
            $("#" + id).prev().addClass('active');
        }
        //关闭TAB
        $("#tab_" + id).remove();
        $("#" + id).remove();
        that.drop();
        that.opts.callback();
    }

    drop () {
        var that = this;

        var element = that.$elem.find('.nav-tabs');
        //创建下拉标签
        var dropdown = $('<li>', {
            'class': 'nav-item dropdown pull-right hide tabdrop'
        }).append(
            $('<a>', {
                'class': 'nav-link dropdown-toggle',
                'data-toggle': 'dropdown',
                'href': '#'
            }).append(
                $('<i>', {'class': "fa fa-trash"})
            ).append(
                $('<b>', {'class': 'caret'})
            )
        ).append(
            $('<ul>', {'class': "dropdown-menu"})
        )

        //检测是否已增加
        if (!$('.tabdrop').html()) {
            dropdown.prependTo(element);
        } else {
            dropdown = element.find('.tabdrop');
        }
        //检测是否有下拉样式
        if (element.parent().is('.tabs-below')) {
            dropdown.addClass('dropup');
        }
        var collection = 0;

        //检查超过一行的标签页
        element.append(dropdown.find('li'))
            .find('>li')
            .not('.tabdrop')
            .each(function () {
                if (this.offsetTop > 0 || element.width() - $(this).position().left - $(this).width() < 53) {
                    dropdown.find('ul').append($(this));
                    collection++;
                }
            });

        //如果有超出的，显示下拉标签
        if (false) {
            console.log('显示下拉菜单');
            dropdown.removeClass('hide');
            if (dropdown.find('.active').length == 1) {
                dropdown.addClass('active');
            } else {
                dropdown.removeClass('active');
            }
        } else {
            dropdown.addClass('hide');
        }
    }
}

TabEx.DEFAULTS = {
    content: '', //直接指定所有页面TABS内容
    close: true, //是否可以关闭
    monitor: 'body', //监视的区域
    iframeUse: true, //使用iframe还是ajax
    iframeHeight: $(document).height() - 107, //固定TAB中IFRAME高度,根据需要自己修改
    method: 'init',
    callback: function () { //关闭后回调函数
    }
};

window.UI.TabEx = TabEx;

export default TabEx;


