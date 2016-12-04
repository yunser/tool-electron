var storage = {
    setItem: function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    getItem: function (key, value) {
        return JSON.parse(localStorage.getItem(key)); 
    }
};

var hideSummary = false;
if ('false') {
    console.log(212)
}
console.log(typeof storage.getItem('hideSummary'));
if (storage.getItem('hideSummary')) {
    hideSummary = true;
    $('#layout-summary').hide();
    $('#layout-content').css('left', '0');
}

$('#toggle-summary').on('click', function () {
    if (hideSummary) {
        $('#layout-summary').show();
        $('#layout-content').css('left', '300px');
        storage.setItem('hideSummary', false);
    } else {
        $('#layout-summary').hide();
        $('#layout-content').css('left', '0');
        storage.setItem('hideSummary', true);
    }
    hideSummary = !hideSummary;
});
