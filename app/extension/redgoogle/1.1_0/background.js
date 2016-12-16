/**
 * Created by cjh1 on 2016/12/15.
 */
var child1 = chrome.contextMenus.create(
    {
        "title": "google",
        "onclick": function () {
            alert('hello google');
        }
    });

console.log('这是背景啊啊啊')