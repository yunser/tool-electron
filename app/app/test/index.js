/**
 * Created by cjh1 on 2016/12/8.
 */
const require = nodeRequire;
const system = require('../../node/system');

let $input = $('#search-input');

function doSearch (keyword) {
    let url = system.getSearchUrl(keyword);
    window.open(url);
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
