/**
 * tab-ex.js v16.12
 */

let $ = jQuery;

class TabEx {
    
    constructor(elem, option) {
        var that = this;

        this.tabNum = 0;

        that.elem = document.getElementById(elem);
        that.$elem = $(elem);
        that.$nav = that.$elem.children('.nav');
        that.$content = that.$elem.children(".tab-content");

        that.opts = $.extend({}, TabEx.DEFAULTS, option);

        var monitor = document.getElementById(that.opts.monitor);
        $(that.opts.monitor).on('click', '[data-addtab]', () => {
            that.add({
                id: $(this).attr('data-addtab'),
                title: $(this).attr('title') ? $(this).attr('title') : $(this).html(),
                content: that.opts.content ? that.opts.content : $(this).attr('content'),
                url: $(this).attr('url'),
                ajax: $(this).attr('ajax') ? true : false
            });
        });

        // TODO
        that.$elem.on('click', '.tab-close', function () {
            var id = $(this).parent().data('id');
            that.close(id);
        });

        that.$elem.on('shown.ui.tab', 'a[data-toggle="tab"]', function (e) {
            // 获取已激活的标签页的名称
            var activeTab = $(e.target).text();
            var id = e.target.parentNode.getAttribute('data-id');

            that.curTabId = id;
        });

        $(window).resize(() => {
            that.drop();
        });
    }

    add (opts) {
        var that = this;

        var id = opts.id;
        that.$elem.find('.active').removeClass('active');
        that.tabNum++;
        that.curTabId = id;

        //如果TAB不存在，创建一个新的TAB
        if (!$("#nav-item-" + id)[0]) {
            // 创建新TAB的title
            var title = $('<li>', {
                'class': 'nav-item',
                'role': 'presentation',
                'id': 'nav-item-' + opts.id,
                'data-id': id
            }).html(`<a id="nav-link-${id}" class="nav-link" href="#pane-${id}" aria-controls="${id}"
                role="tab" data-toggle="tab">
                    <i class="logo"></i>
                    <span class="title">${opts.title}</span>
                </a>`);

            // 是否允许关闭
            if (that.opts.close) {
                title.append($('<i class="tab-close icon icon-close"></i>'));
            }
            // 创建新TAB的内容
            var content = $('<div>', {
                'class': 'tab-pane',
                'id': 'pane-' + id,
            });

            // 是否指定TAB内容
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
                $.get(opts.url, (data) => {
                    content.append(data);
                });
            }
            
            // 加入TABS
            that.$nav.append(title);
            that.$content.append(content);
        }

        // 激活TAB
        $("#nav-item-" + id).addClass('active');
        $("#pane-" + id).addClass("active");
        that.drop();
    }

    getCurTabId() {
        return this.curTabId;
    }
    
    next() {
        let that = this;
        let id = that.curTabId;

        // active the next tab or first tab
        if ($("#nav-item-" + id).next().length) {
            $("#nav-item-" + id).next().children().tab('show');
        } else if (that.$nav.children().length) {
            that.$nav.children().eq(0).children().tab('show');
        }

        that.drop();
    }

    close (id) {
        var that = this;

        that.tabNum--;

        // 如果关闭的是当前激活的TAB，激活他的前一个TAB
        if (that.$elem.find("li.active").attr('id') == "nav-item-" + id) {
            if ($("#nav-item-" + id).prev().length) {
                $("#nav-item-" + id).prev().addClass('active');
                $("#pane-" + id).prev().addClass('active');
                that.curTabId = $("#nav-item-" + id).prev().data('id');
            } else if ($("#nav-item-" + id).next().length) {
                $("#nav-item-" + id).next().addClass('active');
                $("#pane-" + id).next().addClass('active');
                that.curTabId = $("#nav-item-" + id).next().data('id');
            }

        }

        // 关闭TAB
        $("#nav-item-" + id).remove();
        $("#pane-" + id).remove();

        that.drop();
        that.opts.onClose('' + id, '' + that.curTabId);
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
    
    destroy () {
        // TODO
    }
}

TabEx.DEFAULTS = {
    content: '', // 直接指定所有页面TABS内容
    close: true, // 是否可以关闭
    monitor: 'body', // 监视的区域
    iframeUse: true, // 使用iframe还是ajax
    iframeHeight: $(document).height() - 107, //固定TAB中IFRAME高度,根据需要自己修改
    method: 'init',
    onClose: (id, newId) => {} // 关闭后回调函数

};

window.UI.TabEx = TabEx;

var aaa = '123';

//export default TabEx;
module.exports = TabEx;


