/**
 * New Tab Extension
 * Created by cjhgit on 2016/12/17.
 */

let {i18n} = chrome;

document.title = i18n.getMessage('title');

$('[i18n-content]').each(function () {
   $(this).text(i18n.getMessage($(this).attr('i18n-content')));
});