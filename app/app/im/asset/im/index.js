/**
 * Created by cjh1 on 2016/11/29.
 */
eim.config({
    chatlogUrl: 'json/chatlog.json',
    //chatlogUrl: 'json/chatlog2.json',
    friendUrl: 'json/friend.json',
    groupUrl: 'json/group.json',
    groupsUrl: 'json/groups.json'
});
eim.init();
//eim.tabs(0);
//eim.popchatbox2('1', 'one', '聊天室', 'asset/im/images/1.png', 'asd');
//eim.popchatbox2('2', 'one', '在线', 'images/1.png', 'asd');
//eim.systemMessage('1', 'one', '点击左侧连接开始聊天');
/*eim.expend();
eim.inline('#inline');*/
eim.show();

$('#toggle').on('click', function() {
    eim.expend();
});
$('#close').on('click', function() {
    eim.hide();
});
$('#inline').on('click', function() {
    eim.inline('#inline-box');
});
$('#connect').on('click', function() {
    ui.prompt({ // TODO + 文档
        title: '输入昵称',
    }, function (val, id) {
        if (!val) {
            ui.msg('请输入昵称');
            return;
        }
        CHAT.init(val);

        ui.close(id); // TODO
    })
});
$('#connect').click();
$('#show').on('click', function() {
    eim.show();
});
$('#service').on('click', function() {
    eim.popchatbox2('1', 'one', '在线客服', 'asset/im/images/1.png', 'asd');
});
$('#add-message').on('click', function() {
    eim.addMessage('1', 'one', '在线客服1231312');
});
$('#system-message').on('click', function() {
    eim.systemMessage('1', 'one', '小明加入聊天室');
});
eim.on('close', function(){
    console.log('关闭主面板');
});

eim.on('send', function(msg){
    console.log('send', msg)
    
});

//eim.disableSendButton();

$("#chatpanel-input").eface({
    showTab: true,
    animation: 'fade',
    position: 'top',
    button: '#chatpanel-exp',
    icons: [{
        name: "贴吧表情",
        path: "img/tieba/",
        maxNum: 50,
        file: ".jpg",
        placeholder: ":{alias}:",
        alias: {
            1: "hehe",
            2: "haha",
            3: "tushe",
            4: "a",
            5: "ku",
            6: "lu",
            7: "kaixin",
            8: "han",
            9: "lei",
            10: "heixian",
            11: "bishi",
            12: "bugaoxing",
            13: "zhenbang",
            14: "qian",
            15: "yiwen",
            16: "yinxian",
            17: "tu",
            18: "yi",
            19: "weiqu",
            20: "huaxin",
            21: "hu",
            22: "xiaonian",
            23: "neng",
            24: "taikaixin",
            25: "huaji",
            26: "mianqiang",
            27: "kuanghan",
            28: "guai",
            29: "shuijiao",
            30: "jinku",
            31: "shengqi",
            32: "jinya",
            33: "pen",
            34: "aixin",
            35: "xinsui",
            36: "meigui",
            37: "liwu",
            38: "caihong",
            39: "xxyl",
            40: "taiyang",
            41: "qianbi",
            42: "dnegpao",
            43: "chabei",
            44: "dangao",
            45: "yinyue",
            46: "haha2",
            47: "shenli",
            48: "damuzhi",
            49: "ruo",
            50: "OK"
        },
        title: {
            1: "呵呵",
            2: "哈哈",
            3: "吐舌",
            4: "啊",
            5: "酷",
            6: "怒",
            7: "开心",
            8: "汗",
            9: "泪",
            10: "黑线",
            11: "鄙视",
            12: "不高兴",
            13: "真棒",
            14: "钱",
            15: "疑问",
            16: "阴脸",
            17: "吐",
            18: "咦",
            19: "委屈",
            20: "花心",
            21: "呼~",
            22: "笑脸",
            23: "冷",
            24: "太开心",
            25: "滑稽",
            26: "勉强",
            27: "狂汗",
            28: "乖",
            29: "睡觉",
            30: "惊哭",
            31: "生气",
            32: "惊讶",
            33: "喷",
            34: "爱心",
            35: "心碎",
            36: "玫瑰",
            37: "礼物",
            38: "彩虹",
            39: "星星月亮",
            40: "太阳",
            41: "钱币",
            42: "灯泡",
            43: "茶杯",
            44: "蛋糕",
            45: "音乐",
            46: "haha",
            47: "胜利",
            48: "大拇指",
            49: "弱",
            50: "OK"
        }
    }, {
        path: "img/qq/",
        maxNum: 91,
        excludeNums: [41, 45, 54],
        file: ".gif",
        placeholder: "#qq_{alias}#"
    }]
});
