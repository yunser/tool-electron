chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('app.html', {
        minWidth: 320,
        minHeight: 135,
        maxWidth: 320,
        maxHeight: 135,
        width: 320,
        height: 135
    });
});