/**
 * Created by cjh1 on 2016/12/17.
 */
console.log(chrome);
let ee = new chrome.Event();
console.log(ee);
chrome.app.runtime.onLaunched.addListener(function() {
    console.log('onLaunched');
    chrome.app.window.create('window.html', {
        'outerBounds': {
            'width': 400,
            'height': 500
        }
    });
});