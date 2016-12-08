/**
 * Created by cjh1 on 2016/12/8.
 */

// you can config the search engine here
let config = {
    inputEncoding: 'UTF-8',
    default: 'baidu', // default search engine
    engine: {
        baidu: 'http://www.baidu.com/s?ie={inputEncoding}&wd=%s',
        google: 'https://www.google.com/search?q=%s'
    }
};


let $input = $('#search-input');

function doSearch (keyword) {
    console.log(1);
    let url = config.engine[config.default].replace('{inputEncoding}', config.inputEncoding)
        .replace('%s', keyword);
    console.log(2);
    window.location.href = url;
    console.log(3);
}

$input.on('keydown', (e) => {
   if (e.keyCode === 13) {
       let keyword = $input.val();
       doSearch(keyword);
   }
});

$('#search-btn').on('click', (e) => {
    let keyword = $input.val();
    doSearch(keyword);
});
