/**
 * Created by cjh1 on 2016/11/28.
 */

$('#refresh').on('click', function () {
   window.location.reload(true);
});

$('#create').on('click', function () {
    var toMarkdown = require('to-markdown');
    var md = toMarkdown('<h1>Hello world!</h1>');
    alert(md);
});