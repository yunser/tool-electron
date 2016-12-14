const require = nodeRequire;
const system = require('../../node/system');

let $images = $('.docs-pictures');
let $toggles = $('.docs-toggles');
let $buttons = $('.docs-buttons');
let options = {
    //inline: true,
    url: 'data-original',
    build: function (e) {
        console.log(e.type);
    },
    built: function (e) {
        console.log(e.type);
    },
    show: function (e) {
        console.log(e.type);
    },
    shown: function (e) {
        console.log(e.type);
    },
    hide: function (e) {
        console.log(e.type);
    },
    hidden: function (e) {
        console.log(e.type);
    },
    view: function (e) {
        console.log(e.type);
    },
    viewed: function (e) {
        console.log(e.type);
    }
};

function toggleButtons(mode) {
    if (/modal|inline|none/.test(mode)) {
        $buttons.find('button[data-enable]').prop('disabled', true).filter('[data-enable*="' + mode + '"]').prop('disabled', false);
    }
}



let url = system.getParam(window.location.search, 'url');
if (url) {
    $images.empty();

    $images.html(`<li><img data-original="${url}" src="${url}" alt=""></li>`);
    $images.on({
        'build.viewer': function (e) {
            console.log(e.type);
        },
        'built.viewer': function (e) {
            console.log(e.type);
        },
        'show.viewer': function (e) {
            console.log(e.type);
        },
        'shown.viewer': function (e) {
            console.log(e.type);
        },
        'hide.viewer': function (e) {
            console.log(e.type);
        },
        'hidden.viewer': function (e) {
            console.log(e.type);
        },
        'view.viewer': function (e) {
            console.log(e.type);
        },
        'viewed.viewer': function (e) {
            console.log(e.type);
        }
    }).viewer(options);
    $images.viewer('show');
} else {
    $images.on({
        'build.viewer': function (e) {
            console.log(e.type);
        },
        'built.viewer': function (e) {
            console.log(e.type);
        },
        'show.viewer': function (e) {
            console.log(e.type);
        },
        'shown.viewer': function (e) {
            console.log(e.type);
        },
        'hide.viewer': function (e) {
            console.log(e.type);
        },
        'hidden.viewer': function (e) {
            console.log(e.type);
        },
        'view.viewer': function (e) {
            console.log(e.type);
        },
        'viewed.viewer': function (e) {
            console.log(e.type);
        }
    }).viewer(options);
    $images.viewer('show');
}


