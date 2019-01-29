/**
 * Created by cjh1 on 2016/12/8.
 */
const require = nodeRequire;
const system = require('../../node/system');

const clipboard = require('electron').clipboard;


$('#clipboard-list').on('click', '.copy', function (e) {
    let text = $(this).closest('li').find('.content').text();
    clipboard.writeText(text);
    //alert(text);
});
