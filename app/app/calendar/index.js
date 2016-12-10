/**
 * Created by cjh1 on 2016/12/8.
 */
const require = nodeRequire;
const system = require('../../node/system');
const CalendarConverter = require('./calendar-converter');

let $input = $('#search-input');

$('#search-input').date({
    inline: true,
    container: '#box',
    istoday: true,
    issure: false,
    startSunday: false,
    select: function (year, month, day) {
        console.log('select');


        var date = new Date();
        date.setFullYear(year, month - 1, day);
        let lunar = new CalendarConverter().solar2lunar(date);
        console.log(year, month, date, lunar);
        $('#date-and-week').text(`${year}-${month}-${day} 星期${lunar.week}`);
        $('#date').text(day);
        $('#lunar-date').text(`${lunar.lunarMonth}月${lunar.lunarDay}`);
        $('#lunar-year').text(`${lunar.cYear}年 【${lunar.lunarYear}年】`);
        $('#lunar-date2').text(`${lunar.cMonth}月 ${lunar.cDay}日`);

    },
    festival: function (year, month, day) {
        let str = null;

        var date = new Date();
        date.setFullYear(year, month, day);
        let lunar = new CalendarConverter().solar2lunar(date);
        console.log(lunar);
        if (lunar.solarFestival) {
            str = lunar.solarFestival;
        } else if (lunar.lunarFestival) {
            str = lunar.lunarFestival;
        } else if (lunar.solarTerms) {
            str = lunar.solarTerms;
        }
        return str;
    }
});

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
