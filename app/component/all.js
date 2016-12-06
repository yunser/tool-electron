/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Created by cjh1 on 2016/12/6.
	 */
	//require('./tab-ex.css'); // 载入 style.css
	__webpack_require__(2); //载入自身想要用的js
	__webpack_require__(3);

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * tab-ex.js v16.12
	 */

	var $ = jQuery;

	var TabEx = function () {
	    function TabEx(elem, option) {
	        _classCallCheck(this, TabEx);

	        var that = this;

	        that.elem = document.getElementById(elem);
	        that.$elem = $(elem);

	        that.opts = $.extend({}, TabEx.DEFAULTS, option);

	        var monitor = document.getElementById(that.opts.monitor);
	        $(that.opts.monitor).on('click', '[data-addtab]', function () {
	            that.add({
	                id: $(this).attr('data-addtab'),
	                title: $(this).attr('title') ? $(this).attr('title') : $(this).html(),
	                content: that.opts.content ? that.opts.content : $(this).attr('content'),
	                url: $(this).attr('url'),
	                ajax: $(this).attr('ajax') ? true : false
	            });
	        });

	        that.$elem.on('click', '.tab-close', function () {
	            var id = $(this).prev("a").attr("aria-controls");
	            that.close(id);
	        });

	        $(window).resize(function () {
	            that.drop();
	        });
	    }

	    _createClass(TabEx, [{
	        key: 'add',
	        value: function add(opts) {
	            var that = this;

	            var id = opts.id;
	            that.$elem.find('.active').removeClass('active');

	            //如果TAB不存在，创建一个新的TAB
	            if (!$("#nav-item-" + id)[0]) {
	                // 创建新TAB的title
	                var title = $('<li>', {
	                    'class': 'nav-item',
	                    'role': 'presentation',
	                    'id': 'nav-item-' + opts.id,
	                    'data-id': id
	                }).append($('<a>', {
	                    id: 'nav-link-' + id,
	                    'class': 'nav-link',
	                    'href': '#pane-' + id,
	                    'aria-controls': id,
	                    'role': 'tab',
	                    'data-toggle': 'tab'
	                }).html(opts.title));

	                // 是否允许关闭
	                if (that.opts.close) {
	                    title.append($('<i class="tab-close icon icon-close"></i>'));
	                }
	                // 创建新TAB的内容
	                var content = $('<div>', {
	                    'class': 'tab-pane',
	                    'id': 'pane-' + id
	                });

	                // 是否指定TAB内容
	                if (opts.content) {
	                    content.append(opts.content);
	                } else if (that.opts.iframeUse && !opts.ajax) {
	                    //没有内容，使用IFRAME打开链接
	                    content.append($('<iframe>', {
	                        'class': 'iframeClass',
	                        'height': that.opts.iframeHeight,
	                        'frameborder': "no",
	                        'border': "0",
	                        'src': opts.url
	                    }));
	                } else {
	                    $.get(opts.url, function (data) {
	                        content.append(data);
	                    });
	                }

	                // 加入TABS
	                that.$elem.children('.nav').append(title);
	                that.$elem.children(".tab-content").append(content);
	            }

	            // 激活TAB
	            $("#nav-item-" + id).addClass('active');
	            $("#pane-" + id).addClass("active");
	            that.drop();
	        }
	    }, {
	        key: 'close',
	        value: function close(id) {
	            var that = this;

	            // 如果关闭的是当前激活的TAB，激活他的前一个TAB
	            if (that.$elem.find("li.active").attr('id') == "nav-item-" + id) {
	                $("#nav-item-" + id).prev().addClass('active');
	                $("#pane-" + id).prev().addClass('active');
	            }

	            // 关闭TAB
	            $("#nav-item-" + id).remove();
	            $("#pane-" + id).remove();

	            that.drop();
	            that.opts.callback();
	        }
	    }, {
	        key: 'drop',
	        value: function drop() {
	            var that = this;

	            var element = that.$elem.find('.nav-tabs');
	            //创建下拉标签
	            var dropdown = $('<li>', {
	                'class': 'nav-item dropdown pull-right hide tabdrop'
	            }).append($('<a>', {
	                'class': 'nav-link dropdown-toggle',
	                'data-toggle': 'dropdown',
	                'href': '#'
	            }).append($('<i>', { 'class': "fa fa-trash" })).append($('<b>', { 'class': 'caret' }))).append($('<ul>', { 'class': "dropdown-menu" }));

	            //检测是否已增加
	            if (!$('.tabdrop').html()) {
	                dropdown.prependTo(element);
	            } else {
	                dropdown = element.find('.tabdrop');
	            }
	            //检测是否有下拉样式
	            if (element.parent().is('.tabs-below')) {
	                dropdown.addClass('dropup');
	            }
	            var collection = 0;

	            //检查超过一行的标签页
	            element.append(dropdown.find('li')).find('>li').not('.tabdrop').each(function () {
	                if (this.offsetTop > 0 || element.width() - $(this).position().left - $(this).width() < 53) {
	                    dropdown.find('ul').append($(this));
	                    collection++;
	                }
	            });

	            //如果有超出的，显示下拉标签
	            if (false) {
	                console.log('显示下拉菜单');
	                dropdown.removeClass('hide');
	                if (dropdown.find('.active').length == 1) {
	                    dropdown.addClass('active');
	                } else {
	                    dropdown.removeClass('active');
	                }
	            } else {
	                dropdown.addClass('hide');
	            }
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            // TODO
	        }
	    }]);

	    return TabEx;
	}();

	TabEx.DEFAULTS = {
	    content: '', // 直接指定所有页面TABS内容
	    close: true, // 是否可以关闭
	    monitor: 'body', // 监视的区域
	    iframeUse: true, // 使用iframe还是ajax
	    iframeHeight: $(document).height() - 107, //固定TAB中IFRAME高度,根据需要自己修改
	    method: 'init',
	    callback: function callback() {//关闭后回调函数
	    }
	};

	window.UI.TabEx = TabEx;

	exports.default = TabEx;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Created by cjh1 on 2016/12/6.
	 */
	Array.prototype.contains = Array.prototype.contains || function (obj) {
	    var i = this.length;
	    while (i--) {
	        if (this[i] === obj) {
	            return true;
	        }
	    }
	    return false;
	};

	String.prototype.contains = String.prototype.contains || function (str) {
	    return this.indexOf(str) >= 0;
	};

	String.prototype.startWith = String.prototype.startWith || function (str) {
	    var reg = new RegExp('^' + str);
	    return reg.test(this);
	};

	String.prototype.endWith = String.prototype.endWith || function (str) {
	    var reg = new RegExp(str + '$');
	    return reg.test(this);
	};

/***/ }
/******/ ]);