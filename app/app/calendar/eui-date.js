/**
 * 时间选择控件 Date v1.2
 * https://github.com/cjhgit/eui-date
 */
let $ = jQuery;

let creat = 'createElement', tags = 'getElementsByTagName';
let win = window;
let doc = document;

let CLS_VOID = 'laydate_void';
let CLS_ACTIVE = 'active';

class Dates {

    constructor(element, options) {
        this.init(element, options);
    }

    reload() {
        var that = this;

        that.opts = $.extend({}, Dates.DEFAULTS, that.userOption);

        that.mins = that.opts.min.match(/\d+/g);
        that.maxs = that.opts.max.match(/\d+/g);

        that.viewDate(that.ymd[0], that.ymd[1], that.ymd[2]);
    }

    getDates() {
        return this;
    }

    init(element, userOptions) {
        var that = this;

        that.userOption = userOptions;

        that.elem = element;
        that.$elem = $(element);
        that.opts = $.extend({}, Dates.DEFAULTS, userOptions);

        that.mins = that.opts.min.match(/\d+/g);
        that.maxs = that.opts.max.match(/\d+/g);

        if (that.opts.getFestivalName) {
            that.getFestivalName = that.opts.getFestivalName;
        }
        
        var opts = that.opts;

        // 生成日期
        that.months = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // 设置初始值
        that.asElemv = /textarea|input/.test(that.elem.tagName.toLocaleLowerCase()) ? 'value' : 'innerHTML';
        if (opts.init && !that.getVal()) {
            that.setVal(Dates.now(null, opts.format));
        }

        that.view();

        that.stopMosup(opts.event, this);
        that.$elem.on(opts.event, function (ev) {
            ev.stopPropagation();
            that.reshow();
            that.show();
        });

    }

    // 渲染控件骨架
    view() {
        var that = this;
        var div, log = {};

        that.uid = Dates.getId();

        div = document.createElement('div');
        div.id = 'laydate_box' + that.uid;
        div.className = 'ui-date date-lg date-color ' + (that.opts.inline ? 'date-inline' : '');
        div.style.cssText = 'position: absolute;';

        div.innerHTML = log.html = `
        <div class="laydate-header">
            <div class="laydate_ym laydate_y">
                <a class="laydate_choose laydate_chprev laydate_tab" data-type="0"><cite></cite></a>
                <input class="laydate_y_input" readonly><label></label>
                <a class="laydate_choose laydate_chnext laydate_tab" data-type="1"><cite></cite></a>
                <div class="laydate_yms">
                    <a class="laydate_tab laydate_chtop" data-type="2"><cite></cite></a>
                    <ul class="laydate-year-list"></ul>
                    <a class="laydate_tab laydate_chdown" data-type="3"><cite></cite></a>
                </div>
            </div>
            <div class="laydate_ym laydate_m">
                <a class="laydate_choose laydate_chprev laydate_tab" data-type="0"><cite></cite></a>
                <input class="laydate_m_input" readonly><label></label>
                <a class="laydate_choose laydate_chnext laydate_tab" data-type="1"><cite></cite></a>
        `
            + '<div class="laydate_yms laydate_m_select">' + function () {
                var str = '';
                for (var i = 0; i < 12; i++) {
                    str += '<span m="' + i + '">' + Dates.digit(i + 1) + '月</span>';
                }
                return str;
            }() + '</div>'
            + '</div>'
            + '</div>'

            + that.viewtb()

            + `
            <div class="date-footer">
                <ul class="laydate_hms">
                    <li class="laydate_sj">时间</li>
                    <li><input readonly data-index="0">:</li>
                    <li><input readonly data-index="1">:</li>
                    <li><input readonly data-index="2"></li>
                </ul>
                <div class="laydate_time"></div>
                <div class="laydate_btn">
                    <a class="laydate_clear">清空</a>
                    <a class="laydate_today">今天</a>
                    <a class="laydate_ok">确认</a>
                    </div>
                </div>
            `;

        console.log(that.opts.container)
        var container = $(that.opts.container);
        if (!container.length) {
            console.log('container is not set success');
        }
        container.append(div);

        that.$box = $('#laydate_box' + that.uid);
        that.$timeSelector = that.$box.find('.laydate_hms');
        that.$footer = that.$box.find('.date-footer');

        if (!that.opts.inline) {
            that.$box.hide();
            that.follow(that.$box[0]);
        }

        that.events();




        that.$box.css('z-index', that.opts.zIndex);
        that.stopMosup('click', that.$box[0]);

        that.initDate();
        that.iswrite();
        that.check();
    }

    initDate() {
        var that = this;
        var opts = this.opts;

        var De = new Date();
        var ymd = that.getVal().match(/\d+/g) || [];
        if (ymd.length < 3) {
            ymd = opts.start.match(/\d+/g) || [];
            if (ymd.length < 3) {
                ymd = [De.getFullYear(), De.getMonth() + 1, De.getDate()];
            }
        }

        that.inymd = ymd;
        that.viewDate(ymd[0], ymd[1] - 1, ymd[2]);
    }

    // 阻断mouseup
    stopMosup(evt, elem) {
        if (evt !== 'mouseup') {
            $(elem).on('mouseup', function (ev) {
                ev.stopPropagation();
            });
        }
    }

    // 检测是否在有效期
    checkVoid(YY, MM, DD) {
        var that = this;

        var back = [];
        YY = YY | 0;
        MM = MM | 0;
        DD = DD | 0;
        if (YY < that.mins[0]) {
            back = ['y'];
        } else if (YY > that.maxs[0]) {
            back = ['y', 1];
        } else if (YY >= that.mins[0] && YY <= that.maxs[0]) {
            if (YY == that.mins[0]) {
                if (MM < that.mins[1]) {
                    back = ['m'];
                } else if (MM == that.mins[1]) {
                    if (DD < that.mins[2]) {
                        back = ['d'];
                    }
                }
            }
            if (YY == that.maxs[0]) {
                if (MM > that.maxs[1]) {
                    back = ['m', 1];
                } else if (MM == that.maxs[1]) {
                    if (DD > that.maxs[2]) {
                        back = ['d', 1];
                    }
                }
            }
        }
        return back;
    }

    // 时分秒的有效检测
    timeVoid(times, index) {
        var that = this;

        if (that.ymd[1] + 1 == that.mins[1] && that.ymd[2] == that.mins[2]) {
            if (index === 0 && (times < that.mins[3])) {
                return 1;
            } else if (index === 1 && times < that.mins[4]) {
                return 1;
            } else if (index === 2 && times < that.mins[5]) {
                return 1;
            }
        } else if (that.ymd[1] + 1 == that.maxs[1] && that.ymd[2] == that.maxs[2]) {
            if (index === 0 && times > that.maxs[3]) {
                return 1;
            } else if (index === 1 && times > that.maxs[4]) {
                return 1;
            } else if (index === 2 && times > that.maxs[5]) {
                return 1;
            }
        }
        if (times > (index ? 59 : 23)) {
            return 1;
        }
    }

    // 检测日期是否合法
    check() {

        var that = this;
        var opts = this.opts;

        var reg = opts.format.replace(/YYYY|MM|DD|hh|mm|ss/g, '\\d+\\').replace(/\\$/g, '');
        var exp = new RegExp(reg), value = that.getVal();
        var arr = value.match(/\d+/g) || [], isvoid = that.checkVoid(arr[0], arr[1], arr[2]);
        if (value.replace(/\s/g, '') !== '') {
            if (!exp.test(value)) {
                that.setVal('');
                that.msg('日期不符合格式，请重新选择。');
                return 1;
            } else if (isvoid[0]) {
                that.setVal('');
                that.msg('日期不在有效期内，请重新选择。');
                return 1;
            } else {

                isvoid.value = that.getVal().match(exp).join();
                arr = isvoid.value.match(/\d+/g);
                if (arr[1] < 1) {
                    arr[1] = 1;
                    isvoid.auto = 1;
                } else if (arr[1] > 12) {
                    arr[1] = 12;
                    isvoid.auto = 1;
                } else if (arr[1].length < 2) {
                    isvoid.auto = 1;
                }
                if (arr[2] < 1) {
                    arr[2] = 1;
                    isvoid.auto = 1;
                } else if (arr[2] > that.months[(arr[1] | 0) - 1]) {
                    arr[2] = 31;
                    isvoid.auto = 1;
                } else if (arr[2].length < 2) {
                    isvoid.auto = 1;
                }
                if (arr.length > 3) {
                    if (that.timeVoid(arr[3], 0)) {
                        isvoid.auto = 1;
                    }

                    if (that.timeVoid(arr[4], 1)) {
                        isvoid.auto = 1;
                    }

                    if (that.timeVoid(arr[5], 2)) {
                        isvoid.auto = 1;
                    }
                }
                if (isvoid.auto) {
                    that.creation([arr[0], arr[1] | 0, arr[2] | 0], 1);
                } else if (isvoid.value !== that.getVal()) {
                    that.setVal(isvoid.value);
                }
            }
        }
    }

    // Y, M, D is the active date
    viewDate (Y, M, D) {

        var that = this;

        var log = {};
        Y < (that.mins[0] | 0) && (Y = (that.mins[0] | 0));
        Y > (that.maxs[0] | 0) && (Y = (that.maxs[0] | 0));

        let today = new Date();
        let year = parseInt(Y);
        let month = parseInt(M);
        let day = parseInt(D);


        that.months[1] = Dates.isLeap(year) ? 29 : 28;

        var date = new Date();
        date.setFullYear(year, month, 1)
        log.FDay = date.getDay() - (that.opts.startSunday ? 0 : 1); //
        log.PDay = that.months[M === 0 ? 11 : M - 1] - log.FDay + 1; // start date of last month
        let nextMonthDay = 1;
        console.log(log.PDay, log.FDay)

        // render day
        that.$box.find('.date-table td').each(function (i, elem) {
            let $td = $(elem);

            let YY = year;
            let MM = month + 1;
            let DD;
            elem.className = '';
            if (i < log.FDay) {
                // last month
                DD = i + log.PDay;
                $td.html(DD);
                $td.addClass('laydate_nothis');
                MM === 1 && (YY -= 1);
                MM = MM === 1 ? 12 : MM - 1;
            } else if (i >= log.FDay && i < log.FDay + that.months[month]) {
                // this month
                DD = i - log.FDay + 1;
                $td.html(DD);
                console.log(DD)

                // active day
                if (DD === day) {
                    $td.addClass(CLS_ACTIVE);
                    log.thisDay = elem;
                    typeof that.opts.select === 'function' && that.opts.select(YY, MM, DD);
                }

                // today
                if (DD === today.getDate() && year === today.getFullYear()
                    && month === today.getMonth()) {
                    $td.addClass('date-today');
                }
            } else {
                // next month
                DD = nextMonthDay++;
                $td.html(DD);
                $td.addClass('laydate_nothis');
                MM === 12 && (YY += 1);
                MM = MM === 12 ? 1 : MM + 1;
            }

            if (that.checkVoid(YY, MM, DD)[0]) {
                $(elem).addClass(CLS_VOID);
            }

            if (typeof that.opts.mark == 'function' && that.opts.mark(YY, MM, DD)) {
                $(elem).addClass('laydate_mark');
            }

            // festival
            if (that.opts.festival) {
                var str = that.opts.festival(YY, MM - 1, DD);
                if (str) {
                    $(elem).addClass('date-festival');
                    elem.innerHTML = str;
                }
            }

            elem.setAttribute('y', YY);
            elem.setAttribute('m', MM);
            elem.setAttribute('d', DD);
        });

        that.valid = !$(log.thisDay).hasClass(CLS_VOID);
        that.ymd = [year, month, day];

        // 锁定年月
        that.$year.val(that.ymd[0] + '年');
        that.$month.val(Dates.digit(that.ymd[1] + 1) + '月');

        //定位月
        that.$mms.each(function (i, elem) {
            var $elem = $(elem);
            var getCheck = that.checkVoid(that.ymd[0], (elem.getAttribute('m') | 0) + 1);
            if (getCheck[0] === 'y' || getCheck[0] === 'm') {
                $elem.addClass(CLS_VOID);
            } else {
                $elem.removeClass(CLS_VOID);
            }
            $elem.removeClass(CLS_ACTIVE);
        });
        $(that.$mms[0][that.ymd[1]]).addClass(CLS_ACTIVE);

        //定位时分秒
        log.times = [
            that.inymd[3] | 0 || 0,
            that.inymd[4] | 0 || 0,
            that.inymd[5] | 0 || 0
        ];
        for (var i = 0; i < 3; i++) {
            that.hmsin[i].value = Dates.digit(that.timeVoid(log.times[i], i) ? that.mins[i + 3] | 0 : log.times[i] | 0);
        }

        //确定按钮状态
        that.valid ? that.$ok.removeClass(CLS_VOID) : that.$ok.addClass(CLS_VOID);
    }

    // 节日
    festival(td, year, month, day) {

    }

    // 生成年列表
    viewYears(YY) {
        var that = this;
        var str = '';
        for (var i = 0; i < 14; i++) {
            if (i === 7) {
                str += '<li ' + (parseInt(that.$year.val()) === YY ? 'class="' + CLS_ACTIVE + '"' : '') + ' y="' + YY + '">' + YY + '年</li>';
            } else {
                str += '<li y="' + (YY - 7 + i) + '">' + (YY - 7 + i) + '年</li>';
            }
        }
        var $yearList = that.$box.find('.laydate-year-list');
        $yearList.html(str);
        // TODO
        $yearList.find('li').each(function (i, elem) {
            if (that.checkVoid(elem.getAttribute('y'))[0] === 'y') {
                $(elem).addClass(CLS_VOID);
            } else {
                $(elem).on('click', function (e) {
                    e.stopPropagation();
                    that.reshow();
                    that.viewDate(this.getAttribute('y') | 0, that.ymd[1], that.ymd[2]);
                });
            }
        });
    }

    // 是否显示零件
    iswrite() {
        var that = this;

        that.opts.istime ? that.$timeSelector.show() : that.$timeSelector.hide();
        that.opts.isclear ? that.$clear.show() : that.$clear.hide();
        that.opts.issure ? that.$ok.show() : that.$ok.hide();
        that.opts.istoday ? that.$today.show() : that.$today.hide();
    }

    // 吸附定位
    follow(obj) {
        var that = this;

        that.$box.pot({
            //position: 'fixed',
            position: that.opts.fixed ? 'fixed' : 'absolute',
            relativeTo: that.$elem,
            x: 'leftEdge',
            y: 'bottom'
        });
    }

    // 生成表格
    viewtb() {
        var tr, view = [];
        let weeks;
        if (this.opts.startSunday) {
            weeks = ['日', '一', '二', '三', '四', '五', '六'];
        } else {
            weeks = ['一', '二', '三', '四', '五', '六', '日'];
        }
        var log = {}, table = doc[creat]('table'), thead = doc[creat]('thead');
        thead.appendChild(doc[creat]('tr'));
        log.creath = function (i) {
            var th = doc[creat]('th');
            th.innerHTML = weeks[i];
            thead[tags]('tr')[0].appendChild(th);
        };

        for (var i = 0; i < 6; i++) {
            view.push([]);
            tr = table.insertRow(0);
            for (var j = 0; j < 7; j++) {
                view[i][j] = 0;
                i === 0 && log.creath(j);
                tr.insertCell(j);
            }
        }

        table.insertBefore(thead, table.children[0]);
        table.className = 'date-table';
        return table.outerHTML.toLowerCase();
    }

    // 显示
    show() {
        this.$box.show();
    }

    // 关闭日期选择器
    close() {
        this.reshow();
        if (!this.opts.inline) {
            this.$box.hide();
        }
    }

    // 隐藏内部弹出元素
    reshow () {
        this.$box.find('.laydate_show').removeClass('laydate_show');
        return this;
    }

    // 返回最终日期
    creation(ymd, hide) {
        var that = this;
        var hms = that.hmsin;
        var getDates = Dates.parse(ymd, [hms[0].value, hms[1].value, hms[2].value], that.opts.format);
        that.setVal(getDates);
        if (!hide) {
            that.close();
            typeof that.opts.choose === 'function' && that.opts.choose(getDates);
        }
    }

    setVal(value) {
        this.elem[this.asElemv] = value;
    }

    getVal() {
        return this.elem[this.asElemv];
    }

    // 生成时分秒或警告信息
    msg(i, title) {
        var that = this;
        var log = {};
        log.times = that.$box.find('.laydate_time')[0];
        that.hmsin = log.hmsin = that.$timeSelector.find('input');
        log.hmsarr = [];

        var str = '<div class="laydte_hsmtex">' + (title || '提示') + '<span>×</span></div>';
        if (typeof i === 'string') {
            str += '<p>' + i + '</p>';
            that.$box.show();
            $(log.times).removeClass('laydate_time1').addClass('laydate_msg');
        } else {
            if (!log.hmsarr[i]) {
                str += '<div class="laydate_hmsno">';
                $.each(new Array(i === 0 ? 24 : 60), function (j) {
                    str += '<span>' + j + '</span>';
                });
                str += '</div>';
                log.hmsarr[i] = str;
            } else {
                str = log.hmsarr[i];
            }
            $(log.times).removeClass('laydate_msg');
            i === 0 ? $(log.times).removeClass('laydate_time1') : $(log.times).addClass('laydate_time1');
        }
        $(log.times).addClass('laydate_show');
        log.times.innerHTML = str;
    }

    // 重置定位
    reset() {
        var that = this;
        (that.$box[0] && that.elem) && Dates.pt.follow(that.$box[0]);
    }

    // 事件
    events() {
        var that = this;
        var log = {};

        that.$mms = that.$box.find('.laydate_m_select span');
        that.$year = that.$box.find('.laydate_y_input');
        that.$month = that.$box.find('.laydate_m_input');

        // 显示更多年月
        that.$box.find('.laydate_ym').on('click', function (e) {
            e.stopPropagation();
            that.reshow();

            $(this[tags]('div')[0]).addClass('laydate_show');
            log.YY = parseInt(that.$year.val());
            that.viewYears(log.YY);
        });

        that.$box.on('click', function () {
            that.reshow();
        });

        // 切换年
        log.tabYear = function (type) {
            if (type === 0) {
                that.ymd[0]--;
            } else if (type === 1) {
                that.ymd[0]++;
            } else if (type === 2) {
                log.YY -= 14;
            } else {
                log.YY += 14;
            }
            if (type === 0 || type === 1) {
                that.viewDate(that.ymd[0], that.ymd[1], that.ymd[2]);
                that.reshow();
            } else {
                that.viewYears(log.YY);
            }
        };
        that.$box.find('.laydate_y .laydate_tab').on('click', function (e) {
            e.stopPropagation();
            log.tabYear($(this).data('type'));
        });


        // 切换月
        log.tabMonth = function (type) {
            if (type === 1) {
                that.ymd[1]++;
                if (that.ymd[1] === 12) {
                    that.ymd[0]++;
                    that.ymd[1] = 0;
                }
            } else {
                that.ymd[1]--;
                if (that.ymd[1] === -1) {
                    that.ymd[0]--;
                    that.ymd[1] = 11;
                }
            }
            that.viewDate(that.ymd[0], that.ymd[1], that.ymd[2]);
        };

        that.$box.find('.laydate_m .laydate_tab').on('click', function (e) {
            e.stopPropagation();
            that.reshow();
            log.tabMonth($(this).data('type'));
        });

        // 选择月
        that.$box.find('.laydate_m_select').on('click', 'span', function (e) {
            e.stopPropagation();
            that.reshow();
            if (!$(this).hasClass(CLS_VOID)) {
                that.viewDate(that.ymd[0], this.getAttribute('m') | 0, that.ymd[2]);
            }
        });

        // 选择日
        that.$box.find('.date-table').on('click', 'td', function (e) {
            if (!$(this).hasClass(CLS_VOID)) {
                e.stopPropagation();
                let year = this.getAttribute('y') | 0;
                let month = this.getAttribute('m') | 0;
                let date = this.getAttribute('d') | 0;
                that.creation([year, month, date]);
                that.$box.find('.active').removeClass(CLS_ACTIVE);
                $(this).addClass(CLS_ACTIVE);
                typeof that.opts.select === 'function' && that.opts.select(year, month, date)
            }
        });

        // clear button
        that.$clear = that.$footer.find('.laydate_clear');
        that.$clear.on('click', function () {
            that.setVal('');
            that.close();
        });

        // today button
        that.$today = that.$footer.find('.laydate_today');
        that.$today.on('click', function () {
            var now = new Date();
            that.viewDate(now.getFullYear(), now.getMonth(), now.getDate());
            that.creation([now.getFullYear(), now.getMonth() + 1, now.getDate()]);
        });

        // sure button
        that.$ok = that.$footer.find('.laydate_ok');
        that.$ok.on('click', function () {
            if (that.valid) {
                that.creation([that.ymd[0], that.ymd[1] + 1, that.ymd[2]]);
            }
        });

        // 选择时分秒
        log.times = that.$box.find('.laydate_time')[0];
        that.hmsin = log.hmsin = that.$timeSelector.find('input');
        log.hmss = ['小时', '分钟', '秒数'];
        log.hmsarr = [];

        log.hmson = function (input, index) {
            var $span = that.$box.find('.laydate_hmsno span'), set = that.valid ? null : 1;
            $span.each(function (i, elem) {
                var $elem = $(elem);
                if (set) {
                    $elem.addClass(CLS_VOID);
                } else if (that.timeVoid(i, index)) {
                    $elem.addClass(CLS_VOID);
                } else {
                    $(elem).on('click', function () {
                        if (!$(this).hasClass(CLS_VOID)) {
                            input.value = Dates.digit(this.innerHTML | 0);
                        }
                    });
                }
            });
            $span.addClass(CLS_ACTIVE);
        };

        // 点击时间展开选择
        $(log.hmsin).on('click', function (e) {
            e.stopPropagation();
            that.reshow();
            var i = $(this).data('index');
            that.msg(i, log.hmss[i]);
            log.hmson(this, i);
        });

        $(doc).on('mouseup', function () {
            var box = that.$box[0];
            if (box && box.style.display !== 'none') {
                that.check() || that.close();
            }
        }).on('keydown', function (e) {
            var codes = e.keyCode;

            // 如果在日期显示的时候按回车
            if (codes === 13 && that.elem) {
                that.creation([that.ymd[0], that.ymd[1] + 1, that.ymd[2]]);
            }
        });
    }
}

Dates.pt = Dates.prototype;

Dates.VERSION = '1.2.0'
Dates.v = 1.20;

Dates.DEFAULTS = {
    format: 'YYYY-MM-DD', //日期格式
    min: '1900-01-01 00:00:00', //最小时间
    max: '2099-12-31 23:59:59', //最大时间
    init: true, //
    fixed: false, //是否固定在可视区域
    istime: false, // 是否显示时间选择
    start: '', // start date
    //start: '2014-6-15 23:00:00',    //开始日期
    isclear: false, // 是否显示清空按钮
    issure: true, // 是否显示确认按钮
    istoday: true, // 是否显示今天按钮
    zIndex: 'auto', // css z-index
    festival: false, // 是否显示节日
    event: 'click', //响应事件
    container: 'body', // 容器的jquery选择器，日期选择插件会随着容器的滚动而滚动（如果插件不随页面滚动，可能是改参数未正确设置）
    startSunday: true, // whether the first day of week is sunday
};

// 补齐数位
Dates.digit = function (num) {
    return num < 10 ? '0' + (num | 0) : num;
};

Dates.scroll = function (type) {
    type = type ? 'scrollLeft' : 'scrollTop';
    return doc.body[type] | doc.documentElement[type];
};

Dates.winarea = function (type) {
    return document.documentElement[type ? 'clientWidth' : 'clientHeight']
};

// 判断闰年
Dates.isLeap = function (year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

Dates.id = 0;
Dates.getId = function () {
    return Dates.id++;
};

// 转换日期格式
Dates.parse = function (ymd, hms, format) {
    ymd = ymd.concat(hms);
    format = format || this.opts.format;
    return format.replace(/YYYY|MM|DD|hh|mm|ss/g, function () {
        ymd.index = ++ymd.index | 0;
        return Dates.digit(ymd[ymd.index]);
    });
};

// 返回指定日期
Dates.now = function (timestamp, format) {

    format = format || Dates.DEFAULTS.format;

    var msOfDay = 86400000; // 一天的毫秒数
    var De = new Date((timestamp | 0) ? function (tamp) {
        return tamp < msOfDay ? (+new Date + tamp * msOfDay) : tamp;
    }(parseInt(timestamp)) : +new Date);
    return Dates.parse(
        [De.getFullYear(), De.getMonth() + 1, De.getDate()],
        [De.getHours(), De.getMinutes(), De.getSeconds()],
        format
    );
};

function Plugin(option) {
    return this.each(function () {
        var $this = $(this);
        var data = $this.data('laydate');
        if (!data) {
            $this.data('laydate', (data = new Dates(this, option)));
        }

        if (typeof option == 'string') {
            data[option]();
        }

    });
};

$.fn.date = Plugin;

win.eui = win.eui || {};
win.eui.Date = Dates;
