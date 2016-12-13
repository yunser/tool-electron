/**
 * ui-im.css v16.11.29
 */

;(function (win, undefined) {
    'use strict';

    var ui = window.UI;
    var DEFAULT = {
        msgurl: '私信地址',
        chatlogurl: '聊天记录url前缀',
        aniTime: 200,
        right: -280,
        friendUrl: '../eim/friend.json', //好友列表接口
        groupUrl: '../eim/group.json', //群组列表接口
        chatlogUrl: '../eim/chatlog.json', //聊天记录接口
        groupsUrl: '../eim/groups.json', //群组成员接口
        sendUrl: '', //发送消息接口
        user: { //当前用户信息
            name: '游客',
            face: 'images/1.png'
        },
        chating: {},
        hosts: (function () {
            var dk = location.href.match(/\:\d+/);
            dk = dk ? dk[0] : '';
            return 'http://' + document.domain + dk + '/';
        })(),
        json: function (url, data, callback, error) {
            return $.ajax({
                type: 'get',
                url: url,
                data: data,
                dataType: 'json',
                success: callback,
                error: error
            });
        },
    };
    var config  = DEFAULT;
    var dom = [$(window), $(document), $('html'), $('body')];

    var eim = {};
    eim.curId = null;
    eim.curType = null;
    
    eim.callback = {}; // 回调函数

    // 节点
    eim.renode = function () {
        var node = eim.node = {
            tabs: $('#im-tab>span'),
            list: $('.chatbox-list'),
            online: $('.xxim_online'),
            setonline: $('.xxim_setonline'),
            onlinetex: $('#xxim_onlinetex'),
            xximSearch: $('#xxim_searchkey'),
            searchMian: $('#xxim_searchmain'),
            closeSearch: $('#xxim_closesearch'),
            minBtn: $('#layim_min')
        };
    };

    // 主界面缩放
    eim.expend = function () {
        if (eim.layimNode.attr('state') !== '1') {
            eim.hide();
        } else {
            eim.show();
        }
    };

    // 显示主界面
    eim.show = function() {
        eim.layimNode.stop().animate({right: 1}, config.aniTime, function () {
            try {
                localStorage.layimState = 2;
            } catch (e) {
            }
            eim.layimNode.removeAttr('state');
        });
    };

    // 隐藏主界面
    eim.hide = function() {
        eim.layimNode.stop().animate({right: config.right}, config.aniTime, function () {
            try {
                localStorage.layimState = 1;
            } catch (e) {
            }
            if (eim.callback.onclose) {
                eim.callback.onclose();
            }
            eim.layimNode.attr({state: 1});
        });
    };

    // 初始化窗口格局
    eim.initLayout = function () {
        var node = eim.node;

        //主界面
        try {
            if (!localStorage.layimState) {
                config.aniTime = 0;
                localStorage.layimState = 1;
            }
            if (localStorage.layimState === '1') {
                eim.layimNode.attr({state: 1}).css({right: config.right});
            }
        } catch (e) {
            ui.msg(e.message, 5, -1);
        }
    };

    // 聊天窗口
    eim.popchat = function (param) {
        var node = eim.node;
        var log = {};

        log.success = function (layero) {
            eim.chatbox = layero.find('#im-panel');
            log.chatlist = eim.chatbox.find('.layim_chatmore>ul');

            log.chatlist.html('<li class="im-panel-user-item" data-id="' + param.id + '" type="' + param.type + '"  id="layim_user' + param.type + param.id + '"><span>' + param.name + '</span><i class="icon icon-close"></i></li>')
            eim.tabchat(param, eim.chatbox);

            // 最小化聊天窗
            eim.chatbox.find('.layer_setmin').on('click', function () {
                var indexs = layero.attr('times');
                layero.hide();
                node.minBtn.text(eim.nowchat.name).show();
            });

            // 关闭窗口
            eim.chatbox.find('.icon-close').on('click', function () {
                var indexs = layero.attr('times');
                ui.close(indexs);
                eim.chatbox = null;
                config.chating = {};
                config.chatings = 0;
            });

            // 关闭某个聊天
            log.chatlist.on('click', '.icon-close', function (e) {
                var parents = $(this).parent(), dataType = parents.attr('type');
                var dataId = parents.attr('data-id'), index = parents.index();
                var chatlist = log.chatlist.find('li'), indexs;

                e.stopPropagation();

                delete config.chating[dataType + dataId];
                config.chatings--;

                parents.remove();
                $('#layim_area' + dataType + dataId).remove();
                if (dataType === 'group') {
                    $('#layim_group' + dataType + dataId).remove();
                }

                if (parents.hasClass('active')) {
                    if (index === config.chatings) {
                        indexs = index - 1;
                    } else {
                        indexs = index + 1;
                    }
                    eim.tabchat(config.chating[chatlist.eq(indexs).attr('type') + chatlist.eq(indexs).attr('data-id')]);
                }

                if (log.chatlist.find('li').length === 1) {
                    log.chatlist.parent().hide();
                }
            });

            // 点击聊天选项卡
            log.chatlist.on('click', 'li', function () {
                var othis = $(this), dataType = othis.attr('type'), dataId = othis.attr('data-id');
                eim.curId = dataId;
                eim.curType = dataType;
                eim.tabchat(config.chating[dataType + dataId]);
            });

            eim.transmit();
        };

        log.html = '<div class="im-panel" id="im-panel">'

            + '<div class="layim_chatmore" id="layim_chatmore">'
            + '    <ul class="im-panel-userlist"></ul>'
            + '</div>'

            + '<div class="layim_chat">'
            + '<h6 class="im-panel-header">'
            + '<span class="layim_move"></span>'
            + '    <a href="' + param.url + '" class="layim_face" target="_blank"><img src="' + param.face + '" ></a>'
            + '    <a href="' + param.url + '" class="layim_names" target="_blank">' + param.name + '</a>'
            + '    <span class="layim_rightbtn">'
            + '        <i class="icon icon-minus"></i>'
            + '        <i class="icon icon-close"></i>'
            + '    </span>'
            + '</h6>'
            + '    <div class="im-panel-body" id="layim_chatarea">'
            + '       <div class="layim_groups" id="layim_groups"></div>'
            + '        <ul class="layim_chatview layim_chatthis"  id="layim_area' + param.type + param.id + '"></ul>'
            + '    </div>'
            + '    <div class="im-panel-footer">'
            + '    <div class="im-panel-tool">'
            + '        <a class="tool-item" href="#"><i id="im-panel-exp" class="icon icon-face" title="发送表情"></i></a>'
            + '        <a class="tool-item" href="#"><i class="icon icon-photo" title="上传图片"></i></a>'
            + '        <a class="tool-item" href="#"><i class="icon icon-photo" title="上传附件"></i></a>'
            + '        <a class="chatlog" href="" target="_blank"><i class="icon icon-time"></i> 聊天记录</a>'
            + '    </div>'
            + '    <textarea class="im-panel-input" id="im-panel-input" placeholder="按 Ctrl+Enter 发送"></textarea>'
            + '    <div class="im-panel-send">'
            + '        <div class="btn btn-primary im-panel-sendbtn" id="im-panel-sendbtn">发送</div>'
            + '    </div>'
            + '</div>'
            + '</div></div>';

        if (config.chatings < 1) {
            ui.dialog({
                type: 1,
                border: [0],
                title: false,
                shade: 0,
                //area: ['800px'],
                move: '.im-panel-header',
                moveType: 1,
                closeBtn: false,
                offset: [(($(window).height() - 493) / 2) + 'px', ''],
                content: log.html,
                success: function (layero) {
                    log.success(layero);
                },
                draggable: { // TODO 不起作用
                    handle: '.im-panel-header'
                },
                zIndex: 10000
            });
        } else {
            log.chatmore = eim.chatbox.find('#layim_chatmore');
            log.chatarea = eim.chatbox.find('#layim_chatarea');

            log.chatmore.show();

            log.chatmore.find('ul>li').removeClass('active');
            log.chatmore.find('ul').append('<li class="im-panel-user-item" data-id="' + param.id + '" type="' + param.type + '" id="layim_user' + param.type + param.id + '" class="active">'
                +'<span>' + param.name + '</span><i class="icon icon-close"></i></li>');

            log.chatarea.find('.layim_chatview').removeClass('layim_chatthis');
            log.chatarea.append('<ul class="layim_chatview layim_chatthis" id="layim_area' + param.type + param.id + '"></ul>');

            eim.tabchat(param);
        }

        // 群组
        log.chatgroup = eim.chatbox.find('#layim_groups');
        if (param.type === 'group') {
            log.chatgroup.find('ul').removeClass('layim_groupthis');
            log.chatgroup.append('<ul class="layim_groupthis" id="layim_group' + param.type + param.id + '"></ul>');
            eim.getGroups(param);
        }
        //点击群员切换聊天窗
        log.chatgroup.on('click', 'ul>li', function () {
            eim.popchatbox($(this));
        });
    };

    // 定位到某个聊天队列
    eim.tabchat = function (param) {
        var node = eim.node, log = {}, keys = param.type + param.id;
        eim.nowchat = param;

        eim.chatbox.find('#layim_user' + keys).addClass('active').siblings().removeClass('active');
        eim.chatbox.find('#layim_area' + keys).addClass('layim_chatthis').siblings().removeClass('layim_chatthis');
        eim.chatbox.find('#layim_group' + keys).addClass('layim_groupthis').siblings().removeClass('layim_groupthis');

        eim.chatbox.find('.layim_face>img').attr('src', param.face);
        eim.chatbox.find('.layim_face, .layim_names').attr('href', param.href);
        eim.chatbox.find('.layim_names').text(param.name);

        eim.chatbox.find('.layim_seechatlog').attr('href', config.chatlogurl + param.id);

        log.groups = eim.chatbox.find('.layim_groups');
        if (param.type === 'group') {
            //log.groups.show();
        } else {
            console.log('隐藏')
            //log.groups.hide();
        }

        $('#im-panel-input').focus();

    };

    // 弹出聊天窗口
    eim.popchatbox = function ($childNode) {
        var dataId = $childNode.attr('data-id');
        var type = $childNode.attr('type'); // one or group
        var name = $childNode.find('.eim-user-item-name').text();  // 用户名
        var face = $childNode.find('.eim-user-item-avatar').attr('src');  // 用户头像
        var href = config.hosts + 'user/' + dataId; // 用户主页

        eim.popchatbox2(dataId, type, name, face, href);
    };

    eim.popchatbox2 = function(dataId, type, name, face, href) {
        var node = eim.node;
        eim.curId = dataId;
        eim.curType = type;

        var param = {
            id: dataId, // 用户ID
            type: type, // one or group
            name: name,  // 用户名
            face: face,  // 用户头像
            href: href // 用户主页
        }, key = param.type + dataId;
        if (!config.chating[key]) {
            eim.popchat(param);
            config.chatings++;
        } else {
            eim.tabchat(param);
        }
        config.chating[key] = param;

        var chatbox = $('#im-panel');
        if (chatbox[0]) {
            node.minBtn.hide();
            chatbox.parents('.xubox_layer').show();
        }
    };

    // 请求群员
    eim.getGroups = function (param) {
        var keys = param.type + param.id, str = '',
            groupss = eim.chatbox.find('#layim_group' + keys);
        groupss.addClass('loading');
        config.json(config.groupsUrl, {}, function (datas) {
            if (datas.code === 0) {
                var ii = 0, lens = datas.data.length;
                if (lens > 0) {
                    for (; ii < lens; ii++) {
                        str += '<li data-id="' + datas.data[ii].id + '" type="one"><img src="' + datas.data[ii].face + '"><span>' + datas.data[ii].name + '</span></li>';
                    }
                } else {
                    str = '<li class="layim_errors">没有群员</li>';
                }

            } else {
                str = '<li class="layim_errors">' + datas.msg + '</li>';
            }
            groupss.removeClass('loading');
            groupss.html(str);
        }, function () {
            groupss.removeClass('loading');
            groupss.html('<li class="layim_errors">请求异常</li>');
        });
    };

    // 消息传输
    eim.transmit = function () {
        var node = eim.node, log = {};
        node.sendbtn = $('#im-panel-sendbtn');
        node.input = $('#im-panel-input');

        //发送
        log.send = function () {
            var data = {
                content: node.input.val(),
                id: eim.nowchat.id,
                sign_key: '', //密匙
                _: +new Date
            };

            if ($('#im-panel-sendbtn').hasClass('disabled')) {
                return;
            }

            if (data.content.replace(/\s/g, '') === '') {
                ui.tips('说点啥呗！', '#im-panel-input', 2);
                node.input.focus();
                return;
            }

            if (eim.callback.onsend) {
                
                eim.callback.onsend();
                CHAT.sendObject({
                    from_id: CHAT.userid,
                    username: CHAT.username,
                    to_id: eim.curId,
                    type: eim.curType,
                    content: data.content,
                    time: new Date().getTime()
                });
            }

            //此处皆为模拟
            var keys = eim.nowchat.type + eim.nowchat.id;

            console.log('模拟')
            //聊天模版
            log.html = function (param, type) {
                return '<li class="' + (type === 'me' ? 'layim_chateme' : 'layim_chathe') + '">'
                    + function () {
                        if (type === 'me') {
                            return '<img class="chatmsg-avatar" src="' + param.face + '" >' +
                                '<div class="chatmsg-info">' +
                                '    <div class="chatmsg-name">' + param.name + '(' + param.time + ')</div>' +
                                '    <div class="chatmsg-content">' + param.content + '</div>' +
                                '</div>';
                        } else {
                            return '<img class="chatmsg-avatar" src="' + param.face + '" >' +
                                '<div class="chatmsg-info">' +
                                '    <div class="chatmsg-name">' + param.name + '(' + param.time + ')</div>' +
                                '    <div class="chatmsg-content">' + param.content + '</div>' +
                                '</div>';
                        }

                    }()
                    + '</li>';
            };

            log.imarea = eim.chatbox.find('#layim_area' + keys);

            log.imarea.append(log.html({
                time: '2014-04-26 0:37',
                name: config.user.name,
                face: config.user.face,
                content: data.content
            }, 'me'));

            node.input.val('').focus();
            log.imarea.scrollTop(log.imarea[0].scrollHeight);

        };
        node.sendbtn.on('click', log.send);

        node.input.keyup(function (e) {
            if (e.keyCode === 13) {
                log.send();
            }
        });
    };

    // 添加消息
    eim.addMessage = function(id, type, obj) {

        var key = '#layim_area' + type + id;

        //聊天模版
        var html = function (param, type) {
            return '<li class="' + (type === 'me' ? 'layim_chateme' : 'layim_chathe') + '">'
                + function () {
                    if (type === 'me') {
                        return '<img class="chatmsg-avatar" src="' + param.face + '" >' +
                            '<div class="chatmsg-info">' +
                            '    <div class="chatmsg-name">' + param.name + '(' + param.time + ')</div>' +
                            '    <div class="chatmsg-content">' + param.content + '</div>' +
                            '</div>';
                    } else {
                        return '<img class="chatmsg-avatar" src="' + param.face + '" >' +
                            '<div class="chatmsg-info">' +
                            '    <div class="chatmsg-name">' + param.name + '(' + param.time + ')</div>' +
                            '    <div class="chatmsg-content">' + param.content + '</div>' +
                            '</div>';
                    }

                }()
                + '</li>';
        };
        $(key).append(html({
            time: obj.time,
            name: obj.username,
            face: eim.nowchat.face, // TODO
            content: obj.content
        }));
        var $imarea = $(key);
        $imarea.animate({scrollTop: $imarea[0].scrollHeight + 'px'}, 800);
    };

    // 添加消息
    eim.systemMessage = function(id, type, content) {
        var $key = '#layim_area' + type + id;
        var html = '<li class="">'
        + '<div class="eim-message-system">' + content + '</div>'
        + '</li>';
        $($key).append(html);
        var $imarea = $($key);
        $imarea.animate({scrollTop: $imarea[0].scrollHeight + 'px'}, 800);
    };

    eim.disableSendButton = function() {
        $('#im-panel-sendbtn').addClass('disabled');
    };

    eim.enableSendButton = function() {
        $('#im-panel-sendbtn').removeClass('disabled');
    };

    // 事件
    eim.event = function () {
        var node = eim.node;
        // 关闭主界面
        $('.chatbox-header .icon-close').on('click', function() {
           eim.hide();
        });

        // 列表展收
        node.list.on('click', 'h5', function () {
            var $this = $(this), chat = $this.siblings('.xxim_chatlist'), parentss = $this.parent();
            if (parentss.hasClass('xxim_liston')) {
                chat.hide();
                parentss.removeClass('xxim_liston');
            } else {
                chat.show();
                parentss.addClass('xxim_liston');
            }
        });

        // 设置在线隐身
        node.online.on('click', function (e) {
            e.stopPropagation();
            node.setonline.show();
        });
        node.setonline.find('span').on('click', function (e) {
            var index = $(this).index();
            e.stopPropagation();
            if (index === 0) {
                node.online.removeClass('xxim_offline');
            } else if (index === 1) {
                node.online.addClass('xxim_offline');
            }
            node.setonline.hide();
        });

        // 搜索
        node.xximSearch.keyup(function () {
            var val = $(this).val().replace(/\s/g, '');
            if (val !== '') {
                node.searchMian.show();
                node.closeSearch.show();
                //此处的搜索ajax参考xxim.getDates
                node.list.eq(3).html('<li class="xxim_errormsg">没有符合条件的结果</li>');
            } else {
                node.searchMian.hide();
                node.closeSearch.hide();
            }
        });
        node.closeSearch.on('click', function () {
            $(this).hide();
            node.searchMian.hide();
            node.xximSearch.val('').focus();
        });

        // 弹出聊天窗口
        config.chatings = 0;
        node.list.on('click', '.xxim_childnode', function () {
            eim.popchatbox($(this));
        });

        // 关闭面板
        $('.im-panel-header .icon-close').on('click', function() {
            $('#im-panel').parents('.layer_layer').hide();
        });

        // 点击最小化栏
        node.minBtn.on('click', function () {
            $(this).hide();
            $('#im-panel').parents('.layer_layer').show();
        });

        // document事件
        dom[1].on('click', function () {
            node.setonline.hide();
        });
    };

    // 请求列表数据
    eim.getDates = function (index) {
        var api = [config.chatlogUrl, config.friendUrl, config.groupUrl],
            node = eim.node, myf = node.list.eq(index);
        myf.addClass('loading');
        config.json(api[index], {}, function (datas) {
            if (datas.code === 0) {
                var len = datas.data.length;
                var str = '';
                if (len > 1) {
                    if (index !== 0) {
                        for (var i = 0; i < len; i++) {
                            str += '<li data-id="' + datas.data[i].id + '" class="xxim_parentnode">'
                                + '<h5><i></i><span class="xxim_parentname">' + datas.data[i].name + '</span><em class="xxim_nums">（' + datas.data[i].nums + '）</em></h5>'
                                + '<ul class="xxim_chatlist">';
                            var item = datas.data[i].item;
                            for (var j = 0; j < item.length; j++) {
                                str += '<li data-id="' + item[j].id + '" class="xxim_childnode" type="'
                                    + (index === 1 ? 'one' : 'group') + '"><img src="' + item[j].image
                                    + '" class="eim-user-item-avatar"><span class="eim-user-item-name">' + item[j].name
                                    + '</span></li>';
                            }
                            str += '</ul></li>';
                        }
                    } else {
                        // 渲染消息列表
                        str += '<li class="xxim_liston">'
                            + '<ul class="xxim_chatlist">';
                        for (var i = 0; i < len; i++) {
                            str += '<li data-id="' + datas.data[i].id + '" class="xxim_childnode" type="' + datas.data[i].type + '">'
                                + '    <img src="' + datas.data[i].image + '"  class="eim-user-item-avatar">'
                                + '    <span  class="eim-user-item-name">' + datas.data[i].name + '</span>'
                                + '    <span  class="eim-user-item-text">' + datas.data[i].text + '</span>'
                                + '    <span class="xxim_time">' + datas.data[i].time + '</span></li>';
                        }
                        str += '</ul></li>';
                    }
                    myf.html(str);
                } else {
                    myf.html('<li class="xxim_errormsg">没有任何数据</li>');
                }
                myf.removeClass('loading');
            } else {
                myf.html('<li class="xxim_errormsg">' + datas.data + '</li>');
                myf.removeClass('loading');
            }
        }, function () {
            myf.html('<li class="xxim_errormsg">请求失败</li>');
            myf.removeClass('loading');
        });
    };

    //渲染骨架
    eim.init = function () {
        var xximNode = eim.layimNode = $('<div id="eim-chatbox" class="eim-chatbox">'
            + '<div class="chatbox-header">'
            + '    <i class="icon icon-close"></i>'
            + '    <span class="username">陈建杭</span>'
            + '    <p class="sign">程序猿一枚</p>'
            + '</div>'
            + '<div class="chatbox-body" id="chatbox-body">'
            + '  <div class="xxim_search"><i></i><input id="xxim_searchkey" /><span id="xxim_closesearch">×</span></div>'
            + '  <ul id="im-tab" class="nav im-tab">'
            + '    <li class="nav-item active"><a class="nav-link" href="#tab11" data-toggle="tab" title="最近聊天"><i class="icon icon-time"></i></a> </li>'
            + '    <li class="nav-item"><a class="nav-link" href="#tab12" data-toggle="tab" title="好友"><i class="icon icon-user"></i></a></li>'
            + '    <li class="nav-item"><a class="nav-link" href="#tab13" data-toggle="tab" title="群组"><i class="icon icon-group"></i></a></li>'
            + '  </ul>'
            + '  <div class="tab-content">'
            + '    <ul id="tab11" class="tab-pane fade in active chatbox-list" style="display:block"></ul>'
            + '    <ul id="tab12" class="tab-pane fade chatbox-list"></ul>'
            + '    <ul id="tab13" class="tab-pane fade chatbox-list"></ul>'
            + '    <ul class="tab-pane fade chatbox-list xxim_searchmain" id="xxim_searchmain"></ul>'
            + '  </div>'
            + '</div>'
            + '<ul class="chatbox-footer" id="xxim_bottom">'
            + '<li class="xxim_online" id="xxim_online">'
                + '<i class="icon icon-dot online"></i>'
                + '<div class="online">'
                + '<span><i class="icon icon-dot"></i>在线</span>'
                + '<span class="offline"><i class="icon icon-dot"></i>隐身</span>'
                + '</div>'
            + '</li>'
            + '<li id="xxim_mymsg" title="我的私信"><i class="icon icon-search"></i><a href="' + config.msgurl + '" target="_blank"></a></li>'
            + '<li id="xxim_seter" title="设置"><i class="icon icon-setting"></i></li>'
            + '</ul>'
            + '</div>');
        dom[3].append(xximNode);

        eim.renode();
        eim.getDates(0);
        eim.getDates(1);
        eim.getDates(2);
        eim.event();
        eim.initLayout();
    };

    eim.on = function(eventName, callback) {
        eim.callback['on' + eventName] = callback;
    };

    eim.config = function(options) {
        $.extend(config, DEFAULT, options);
    };

    window.eim = eim;
})(window);

