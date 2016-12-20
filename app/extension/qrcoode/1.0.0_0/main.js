chrome.tabs.query({
    active: true
}, function(tabArray){
    console.log(tabArray[0])
    document.getElementById('qrcode').src='http://pan.baidu.com/share/qrcode?w=180&h=180&url='+tabArray[0].url;
});