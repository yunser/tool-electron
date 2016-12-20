/**
 * Created by cjh1 on 2016/12/18.
 */
/*alert(1);*/
console.log(chrome);
chrome.management.getAll(function (all) {
    console.log(all);
})
console.log(chrome.extension.getURL('asd.html'));

chrome.tabs.query({
    active: true
}, function(tabArray){
    console.log(tabArray);
    //document.getElementById('qrcode').src='http://pan.baidu.com/share/qrcode?w=180&h=180&url='+tabArray[0].url;
});