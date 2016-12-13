/**
 * EUI: editor.js v1.3.0
 *
 * 兼容IE9+
 */

(function (factory) {
    if (typeof window.define === 'function') {
        if (window.define.amd) {
            // AMD模式
            window.define('eEditor', ["jquery"], factory);
        } else if (window.define.cmd) {
            // CMD模式
            window.define(function (require, exports, module) {
                return factory;
            });
        } else {
            // 全局模式
            factory(window.jQuery);
        }
    } else if (typeof module === "object" && typeof module.exports === "object") {
        // commonjs

        // 引用 css —— webapck
        window.eEditorCssPath ? require(window.eEditorCssPath) : require('../dist/css/eEditor.css');
        module.exports = factory(
            // 传入 jquery ，支持使用 npm 方式或者自己定义jquery的路径
            window.eEditorJQueryPath ? require(window.eEditorJQueryPath) : require('jquery')
        );
    } else {
        // 全局模式
        factory(window.jQuery);
    }
})(function($){
    
    // 验证是否引用jquery
    if (!jQuery) {
        alert('在引用 editor.js 之前，先引用jQuery，否则无法使用 editor');
        return;
    }

    // 定义扩展函数
    var _e = function (fn) {
        var E = window.EDITOR;
        if (E) {
            // 执行传入的函数
            fn(E, $);
        }
    };
    // 定义构造函数
    (function (window, $) {
        if (window.EDITOR) {
            // 重复引用
            alert('一个页面不能重复引用 editor.js ！！！');
            return;
        }

        // 编辑器（整体）构造函数
        var E = function (elem, option) {
            // 支持 id 和 element 两种形式
            if (typeof elem === 'string') {
                elem = '#' + elem;
            }

            // ---------------获取基本节点------------------
            var $elem = $(elem);
            if ($elem.length !== 1) {
                return;
            }
            this.opts = $.extend({}, E.DEFAULTS, option);
            var nodeName = $elem[0].nodeName;
            if (nodeName !== 'TEXTAREA' && nodeName !== 'DIV') {
                // 只能是 textarea 和 div ，其他类型的元素不行
                return;
            }
            this.lock = false;
            this.valueNodeName = nodeName.toLowerCase();
            this.$valueContainer = $elem;

            // 记录 elem 的 prev 和 parent（最后渲染 editor 要用到）
            this.$prev = $elem.prev();
            this.$parent = $elem.parent();

            // ------------------初始化------------------
            this.init();
        };

        E.DEFAULTS = {
            simple: false
        };

        E.fn = E.prototype;

        E.$body = $('body');
        E.$document = $(document);
        E.$window = $(window);
        E.userAgent = navigator.userAgent;
        E.getComputedStyle = window.getComputedStyle;
        E.w3cRange = typeof document.createRange === 'function';
        E.hostname = location.hostname.toLowerCase();
        E.websiteHost = 'eeditor.github.io|www.eeditor.com|eeditor.coding.me';
        E.isOnWebsite = E.websiteHost.indexOf(E.hostname) >= 0;
        E.isOnWebsite = true;
        // 暴露给全局对象
        window.Editor = window.EDITOR = E;

        // 注册 plugin 事件，用于用户自定义插件
        // 用户在引用 editor.js 之后，还可以通过 E.plugin() 注入自定义函数，
        // 该函数将会在 editor.create() 方法的最后一步执行
        E.plugin = function (fn) {
            if (!E._plugins) {
                E._plugins = [];
            }

            if (typeof fn === 'function') {
                E._plugins.push(fn);
            }
        };

    })(window, $);
    // editor 绑定事件
    _e(function (E, $) {

        // 增加 container
        E.fn.addEditorContainer = function () {
            this.$editorContainer = $('<div class="eEditor-container"></div>');
        };

        // 增加编辑区域对象
        E.fn.addTxt = function () {
            var editor = this;
            var txt = new E.Txt(editor);

            editor.txt = txt;
        };

        // 初始化 editor 默认配置
        E.fn.initDefaultConfig0 = function () {
            var editor = this;
            editor.config = $.extend({}, E.config);
        };

        E.fn.init = function () {


            this.readyFns = [];

            this.initDefaultConfig0();
            this.initDefaultConfig && this.initDefaultConfig();

            // 增加container
            if (!this.opts.simple) {
                this.addEditorContainer && this.addEditorContainer();
            }

            // 增加编辑区域
            this.addTxt && this.addTxt();

            // 处理ready事件
            this.readyHeadler();
            E.readyHeadler.call(this);

            // 初始化commandHooks
            this.commandHooks();

            this.initUi && this.initUi();
        };

        E.fn.triggerChange = function () {
            if (!this.lock) {
                this.trigger('stateChange');
            }
        };
    });
    // editor api
    _e(function (E, $) {

        // 预定义 ready 事件
        E.fn.ready = function (fn) {

            if (!this.readyFns) {

            }

            this.readyFns.push(fn);
        };

        // 处理ready事件
        E.fn.readyHeadler = function () {
            var fns = this.readyFns;

            while (fns.length) {
                fns.shift().call(this);
            }
        };

        // 更新内容到 $valueContainer
        E.fn.updateValue = function () {
            var editor = this;
            var $txt = editor.txt.$txt;

            if (editor.$valueContainer === $txt) {
                // 传入生成编辑器的div，即是编辑区域
                return;
            }

            var value = $txt.html();
            editor.$valueContainer.val(value);
        };

        // 获取初始化的内容
        E.fn.getInitValue = function () {
            var editor = this;
            var currentValue = '';
            var nodeName = editor.valueNodeName;
            if (nodeName === 'div') {
                currentValue = editor.$valueContainer.html();
            } else if (nodeName === 'textarea') {
                currentValue = editor.$valueContainer.val();
            }

            return currentValue;
        };

    });
    // selection range API
    _e(function (E, $) {

        // 用到 w3c range 的函数，如果检测到浏览器不支持 w3c range，则赋值为空函数
        var ieRange = !E.w3cRange;
        function emptyFn() {}

        // 调试用的
        E.fn.test = function () {

        };

        // 设置或读取当前的range
        E.fn.currentRange = function (cr){
            if (cr) {
                this._rangeData = cr;
            } else {
                return this._rangeData;
            }
        };

        // 将当前选区折叠
        E.fn.collapseRange = function (range, opt) {
            // opt 参数说明：'start'-折叠到开始; 'end'-折叠到结束
            opt = opt || 'end';
            opt = opt === 'start' ? true : false;

            range = range || this.currentRange();

            if (range) {
                // 合并，保存
                range.collapse(opt);
                this.currentRange(range);
            }
        };

        // 获取选区的文字
        E.fn.getRangeText = ieRange ? emptyFn : function (range) {
            range = range || this.currentRange();
            if (!range) {
                return;
            }
            return range.toString();
        };

        // 获取选区对应的DOM对象
        E.fn.getRangeElem = ieRange ? emptyFn : function (range) {
            range = range || this.currentRange();
            var dom = range.commonAncestorContainer;

            if (dom.nodeType === 1) {
                return dom;
            } else {
                return dom.parentNode;
            }
        };

        // 选区内容是否为空？
        E.fn.isRangeEmpty = ieRange ? emptyFn : function (range) {
            range = range || this.currentRange();



            if (range && range.startContainer) {
                if (range.startContainer === range.endContainer) {
                    if (range.startOffset === range.endOffset) {
                        return true;
                    }
                }
            }

            return false;
        };

        // 保存选区数据
        E.fn.saveSelection = ieRange ? emptyFn : function (range) {
            var self = this,
                _parentElem,
                selection,
                txt = self.txt.$txt.get(0);

            if (range) {
                _parentElem = range.commonAncestorContainer;
            } else {
                selection = document.getSelection();
                if (selection.getRangeAt && selection.rangeCount) {
                    range = document.getSelection().getRangeAt(0);
                    _parentElem = range.commonAncestorContainer;
                }
            }
            // 确定父元素一定要包含在编辑器区域内
            if (_parentElem && ($.contains(txt, _parentElem) || txt === _parentElem) ) {
                // 保存选择区域
                self.currentRange(range);
            }
        };

        // 恢复选中区域
        E.fn.restoreSelection = ieRange ? emptyFn : function (range) {
            var selection;

            range = range || this.currentRange();

            if (!range) {
                return;
            }

            // 使用 try catch 来防止 IE 某些情况报错
            try {
                selection = document.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (ex) {
                E.error('执行 editor.restoreSelection 时，IE可能会有异常，不影响使用');
            }
        };

        // 根据elem恢复选区
        E.fn.restoreSelectionByElem = ieRange ? emptyFn : function (elem, opt) {
            // opt参数说明：'start'-折叠到开始，'end'-折叠到结束，'all'-全部选中
            if (!elem) {
                return;
            }
            opt = opt || 'end'; // 默认为折叠到结束

            // 根据elem获取选区
            this.setRangeByElem(elem);

            // 根据 opt 折叠选区
            if (opt === 'start') {
                this.collapseRange(this.currentRange(), 'start');
            }
            if (opt === 'end') {
                this.collapseRange(this.currentRange(), 'end');
            }

            // 恢复选区
            this.restoreSelection();
        };

        // 初始化选区
        E.fn.initSelection = ieRange ? emptyFn : function () {
            var editor = this;
            if( editor.currentRange() ){
                //如果currentRange有值，则不用再初始化
                return;
            }

            var range;
            var $txt = editor.txt.$txt;
            var $firstChild = $txt.children().first();

            if ($firstChild.length) {
                editor.restoreSelectionByElem($firstChild.get(0));
            }
        };

        // 根据元素创建选区
        E.fn.setRangeByElem = ieRange ? emptyFn : function (elem) {
            var editor = this;
            var txtElem = editor.txt.$txt.get(0);
            if (!elem || !$.contains(txtElem, elem)) {
                return;
            }

            // 找到elem的第一个 textNode 和 最后一个 textNode
            var firstTextNode = elem.firstChild;
            while (firstTextNode) {
                if (firstTextNode.nodeType === 3) {
                    break;
                }
                // 继续向下
                firstTextNode = firstTextNode.firstChild;
            }
            var lastTextNode = elem.lastChild;
            while (lastTextNode) {
                if (lastTextNode.nodeType === 3) {
                    break;
                }
                // 继续向下
                lastTextNode = lastTextNode.lastChild;
            }

            var range = document.createRange();
            if (firstTextNode && lastTextNode) {
                // 说明 elem 有内容，能取到子元素
                range.setStart(firstTextNode, 0);
                range.setEnd(lastTextNode, lastTextNode.textContent.length);
            } else {
                // 说明 elem 无内容
                range.setStart(elem, 0);
                range.setEnd(elem, 0);
            }

            // 保存选区
            editor.saveSelection(range);
        };

    });

    // editor command hooks
    _e(function (E, $) {

        E.fn.commandHooks = function () {
            var editor = this;
            var commandHooks = {};

            // insertHtml
            commandHooks.insertHtml = function (html) {
                var $elem = $(html);
                var rangeElem = editor.getRangeElem();
                var targetElem;

                targetElem = editor.getLegalTags(rangeElem);
                if (!targetElem) {
                    return;
                }

                $(targetElem).after($elem);
            };

            // 保存到对象
            editor.commandHooks = commandHooks;
        };

    });
    // editor command API
    _e(function (E, $) {

        // 基本命令
        E.fn.command = function (e, commandName, commandValue, callback) {
            var editor = this;
            var hooks;

            function commandFn() {
                if (!commandName) {
                    return;
                }
                if (editor.queryCommandSupported(commandName)) {
                    // 默认命令
                    document.execCommand(commandName, false, commandValue);
                } else {
                    // hooks 命令
                    hooks = editor.commandHooks;
                    if (commandName in hooks) {
                        hooks[commandName](commandValue);
                    }
                }
            }

            this.customCommand(e, commandFn, callback);
        };

        // 针对一个elem对象执行基础命令
        E.fn.commandForElem = function (elemOpt, e, commandName, commandValue, callback) {
            // 取得查询elem的查询条件和验证函数
            var selector;
            var check;
            if (typeof elemOpt === 'string') {
                selector = elemOpt;
            } else {
                selector = elemOpt.selector;
                check = elemOpt.check;
            }

            // 查询elem
            var rangeElem = this.getRangeElem();
            rangeElem = this.getSelfOrParentByName(rangeElem, selector, check);

            // 根据elem设置range
            if (rangeElem) {
                this.setRangeByElem(rangeElem);
            }

            // 然后执行基础命令
            this.command(e, commandName, commandValue, callback);
        };

        // 自定义命令
        E.fn.customCommand = function (e, commandFn, callback) {
            var editor = this;
            var range = editor.currentRange();

            if (!range) {
                // 目前没有选区，则无法执行命令
                e && e.preventDefault();
                return;
            }
            // 记录内容，以便撤销（执行命令之前就要记录）
            editor.undoRecord && editor.undoRecord();

            // 恢复选区（有 range 参数）
            this.restoreSelection(range);

            // 执行命令事件
            commandFn.call(editor);

            // 保存选区（无参数，要从浏览器直接获取range信息）
            this.saveSelection();
            // 重新恢复选区（无参数，要取得刚刚从浏览器得到的range信息）
            this.restoreSelection();

            // 执行 callback
            if (callback && typeof callback === 'function') {
                callback.call(editor);
            }

            // 最后插入空行
            editor.txt.insertEmptyP();

            // 包裹暴露的img和text
            editor.txt.wrapImgAndText();

            // 更新内容
            editor.updateValue();

            // 更新菜单样式
            editor.updateMenuStyle && editor.updateMenuStyle(); // TODO
            editor.triggerChange();

            if (e) {
                e.preventDefault();
            }
        };

        E.fn.queryCommandState = function (cmd) {
            if (E.cmds[cmd] && E.cmds[cmd].queryState) {
                var result = E.cmds[cmd].queryState(this);
                return result;
            }

            var cmdName = cmd;
            if (E.cmds[cmd] && E.cmds[cmd].systemCmd) {
                cmdName = E.cmds[cmd].systemCmd;
            }

            var result = false;
            try {
                result = document.queryCommandState(cmdName);
            } catch (ex) {

            }
            return result;
        };

        // 封装 document.queryCommandSupported 函数
        E.fn.queryCommandSupported = function (commandName) {
            var result = false;
            try {
                result = document.queryCommandSupported(commandName);
            } catch (ex) {

            }
            return result;
        };

    });
    // dom selector
    _e(function (E, $) {

        var matchesSelector;

        // matchesSelector hook
        function _matchesSelectorForIE(selector) {
            var elem = this;
            var $elems = $(selector);
            var result = false;

            // 用jquery查找 selector 所有对象，如果其中有一个和传入 elem 相同，则证明 elem 符合 selector
            $elems.each(function () {
                if (this === elem) {
                    result = true;
                    return false;
                }
            });

            return result;
        }

        // 从当前的elem，往上去查找合法标签 如 p head table blockquote ul ol 等
        E.fn.getLegalTags = function (elem) {
            var legalTags = this.config.legalTags;
            if (!legalTags) {
                E.error('配置项中缺少 legalTags 的配置');
                return;
            }
            return this.getSelfOrParentByName(elem, legalTags);
        };

        // 根据条件，查询自身或者父元素，符合即返回
        E.fn.getSelfOrParentByName = function (elem, selector, check) {

            if (!elem || !selector) {
                return;
            }

            if (!matchesSelector) {
                // 定义 matchesSelector 函数
                matchesSelector = elem.webkitMatchesSelector ||
                                  elem.mozMatchesSelector ||
                                  elem.oMatchesSelector ||
                                  elem.matchesSelector;
            }
            if (!matchesSelector) {
                // 如果浏览器本身不支持 matchesSelector 则使用自定义的hook
                matchesSelector = _matchesSelectorForIE;
            }

            var txt = this.txt.$txt.get(0);

            while (elem && txt !== elem && $.contains(txt, elem)) {
                if (matchesSelector.call(elem, selector)) {
                    // 符合 selector 查询条件

                    if (!check) {
                        // 没有 check 验证函数，直接返回即可
                        return elem;
                    }

                    if (check(elem)) {
                        // 如果有 check 验证函数，还需 check 函数的确认
                        return elem;
                    }
                }

                // 如果上一步没经过验证，则将跳转到父元素
                elem = elem.parentNode;
            }

            return;
        };

    });

    // 工具函数
    _e(function (E, $) {

        // console.log && console.warn && console.error
        var console = window.console;
        var emptyFn = function () {};
        $.each(['info', 'log', 'warn', 'error'], function (key, value) {
            if (console == null) {
                E[value] = emptyFn;
            } else {
                E[value] = function (info) {
                    // 通过配置来控制打印输出
                    if (E.config && E.config.printLog) {
                        console[value]('editor提示: ' + info);
                    }
                };
            }
        });

        // 获取随机数
        E.random = function () {
            return Math.random().toString().slice(2);
        };
    });
    // 语言包
    _e(function (E, $) {
        E.langs = {};

        // 中文
        E.langs['zh-cn'] = {
            bold: '粗体',
            underline: '下划线',
            italic: '斜体',
            forecolor: '文字颜色',
            bgcolor: '背景色',
            strikethrough: '删除线',
            eraser: '清空格式',
            source: '源码',
            quote: '引用',
            fontfamily: '字体',
            fontsize: '字号',
            head: '标题',
            orderlist: '有序列表',
            unorderlist: '无序列表',
            alignleft: '左对齐',
            aligncenter: '居中',
            alignright: '右对齐',
            link: '链接',
            text: '文本',
            submit: '提交',
            cancel: '取消',
            unlink: '取消链接',
            table: '表格',
            emotion: '表情',
            img: '图片',
            video: '视频',
            'width': '宽',
            'height': '高',
            location: '位置',
            loading: '加载中',
            searchlocation: '搜索位置',
            dynamicMap: '动态地图',
            clearLocation: '清除位置',
            langDynamicOneLocation: '动态地图只能显示一个位置',
            insertcode: '插入代码',
            undo: '撤销',
            redo: '重复',
            fullscreen: '全屏',
            openLink: '打开链接'
        };

        // 英文
        E.langs.en = {
            bold: 'Bold',
            underline: 'Underline',
            italic: 'Italic',
            forecolor: 'Color',
            bgcolor: 'Backcolor',
            strikethrough: 'Strikethrough',
            eraser: 'Eraser',
            source: 'Codeview',
            quote: 'Quote',
            fontfamily: 'Font family',
            fontsize: 'Font size',
            head: 'Head',
            orderlist: 'Ordered list',
            unorderlist: 'Unordered list',
            alignleft: 'Align left',
            aligncenter: 'Align center',
            alignright: 'Align right',
            link: 'Insert link',
            text: 'Text',
            submit: 'Submit',
            cancel: 'Cancel',
            unlink: 'Unlink',
            table: 'Table',
            emotion: 'Emotions',
            img: 'Image',
            video: 'Video',
            'width': 'width',
            'height': 'height',
            location: 'Location',
            loading: 'Loading',
            searchlocation: 'search',
            dynamicMap: 'Dynamic',
            clearLocation: 'Clear',
            langDynamicOneLocation: 'Only one location in dynamic map',
            insertcode: 'Insert Code',
            undo: 'Undo',
            redo: 'Redo',
            fullscreen: 'Full screnn',
            openLink: 'open link'
        };
    });
    // 全局配置
    _e(function (E, $) {

        E.config = {};

        // 全屏时的 z-index
        E.config.zindex = 10000;

        // 是否打印log
        E.config.printLog = true;

        // 编辑源码时，过滤 javascript
        E.config.jsFilter = true;

        // 编辑器允许的标签
        E.config.legalTags = 'p,h1,h2,h3,h4,h5,h6,blockquote,table,ul,ol,pre';

        // 语言包
        E.config.lang = E.langs['zh-cn'];






        // 是否过滤粘贴内容
        E.config.pasteFilter = true;

        // 是否粘贴纯文本，当 editor.config.pasteFilter === false 时候，此配置将失效
        E.config.pasteText = false;
    });

    // txt 构造函数
    _e(function (E, $) {

        // 定义构造函数
        var Txt = function (editor) {
            this.editor = editor;

            // 初始化
            this.init();
        };

        Txt.fn = Txt.prototype;

        E.Txt = Txt;
    });
    // Txt.fn bind fn
    _e(function (E, $) {

        var Txt = E.Txt;

        // 初始化
        Txt.fn.init = function () {
            var self = this;
            var editor = self.editor;
            var $valueContainer = editor.$valueContainer;
            var currentValue = editor.getInitValue();
            var $txt;

            if ($valueContainer.get(0).nodeName === 'DIV') {
                // 如果传入生成编辑器的元素就是div，则直接使用
                $txt = $valueContainer;
                $txt.addClass("eEditor-txt");
                $txt.attr('contentEditable', 'true');
                console.log('是');
            } else {
                console.log('不是');
                // 如果不是div（是textarea），则创建一个div
                $txt = $(
                    '<div class="eEditor-txt" contentEditable="true">' +
                    currentValue +
                    '</div>'
                );
            }

            // 试图最后插入一个空行，ready之后才行
            editor.ready(function () {
                self.insertEmptyP();
            });

            self.$txt = $txt;

            // 删除时，如果没有内容了，就添加一个 <p><br></p>
            self.contentEmptyHandle();

            // enter时，不能使用 div 换行
            self.bindEnterForDiv();

            // enter时，用 p 包裹 text
            self.bindEnterForText();

            // tab 插入4个空格
            self.bindTabEvent();

            // 处理粘贴内容
            self.bindPasteFilter();

            // $txt.formatText() 方法
            self.bindFormatText();

            // 定义 $txt.html() 方法
            self.bindHtml();
        };

        // 删除时，如果没有内容了，就添加一个 <p><br></p>
        Txt.fn.contentEmptyHandle = function () {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;
            var $p;

            $txt.on('keydown.ui.editor', function (e) {
                if (e.keyCode !== 8) {
                    return;
                }
                var txtHtml = $.trim($txt.html().toLowerCase());
                if (txtHtml === '<p><br></p>') {
                    // 如果最后还剩余一个空行，就不再继续删除了
                    e.preventDefault();
                    return;
                }
            });

            $txt.on('keyup.ui.editor', function (e) {
                if (e.keyCode !== 8) {
                    return;
                }
                var txtHtml = $.trim($txt.html().toLowerCase());
                // ff时用 txtHtml === '<br>' 判断，其他用 !txtHtml 判断
                if (!txtHtml || txtHtml === '<br>') {
                    // 内容空了
                    $p = $('<p><br/></p>');
                    $txt.html(''); // 一定要先清空，否则在 ff 下有问题
                    $txt.append($p);
                    editor.restoreSelectionByElem($p.get(0));
                }
            });
        };

        // enter时，不能使用 div 换行
        Txt.fn.bindEnterForDiv = function () {
            var tags = E.config.legalTags; // 配置中编辑器要求的合法标签，如 p head table blockquote ul ol 等
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;

            var $keydownDivElem;
            function divHandler() {
                if (!$keydownDivElem) {
                    return;
                }

                var $pElem = $('<p>' + $keydownDivElem.html() + '</p>');
                $keydownDivElem.after($pElem);
                $keydownDivElem.remove();
            }

            $txt.on('keydown.ui.editor keyup.ui.editor', function (e) {
                if (e.keyCode !== 13) {
                    return;
                }
                // 查找合法标签
                var rangeElem = editor.getRangeElem();
                var targetElem = editor.getLegalTags(rangeElem);
                var $targetElem;
                var $pElem;

                if (!targetElem) {
                    // 没找到合法标签，就去查找 div
                    targetElem = editor.getSelfOrParentByName(rangeElem, 'div');
                    if (!targetElem) {
                        return;
                    }
                    $targetElem = $(targetElem);

                    if (e.type === 'keydown') {
                        // 异步执行（同步执行会出现问题）
                        $keydownDivElem = $targetElem;
                        setTimeout(divHandler, 0);
                    }

                    if (e.type === 'keyup') {
                        // 将 div 的内容移动到 p 里面，并移除 div
                        $pElem = $('<p>' + $targetElem.html() + '</p>');
                        $targetElem.after($pElem);
                        $targetElem.remove();

                        // 如果是回车结束，将选区定位到行首
                        editor.restoreSelectionByElem($pElem.get(0), 'start');
                    }
                }
            });
        };

        // enter时，用 p 包裹 text
        Txt.fn.bindEnterForText = function () {
            var self = this;
            var $txt = self.$txt;
            var handle;
            $txt.on('keyup.ui.editor', function (e) {
                if (e.keyCode !== 13) {
                    return;
                }
                if (!handle) {
                    handle = function() {
                        self.wrapImgAndText();
                    };
                }
                setTimeout(handle);
            });
        };

        // tab 时，插入4个空格
        Txt.fn.bindTabEvent = function () {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;

            $txt.on('keydown.ui.editor', function (e) {
                if (e.keyCode !== 9) {
                    // 只监听 tab 按钮
                    return;
                }
                // 如果浏览器支持 insertHtml 则插入4个空格。如果不支持，就不管了
                if (editor.queryCommandSupported('insertHtml')) {
                    editor.command(e, 'insertHtml', '&nbsp;&nbsp;&nbsp;&nbsp;');
                }
            });
        };

        // 处理粘贴内容
        Txt.fn.bindPasteFilter = function () {
            var self = this;
            var editor = self.editor;
            var resultHtml = '';  //存储最终的结果
            var $txt = self.$txt;
            var legalTags = editor.config.legalTags;
            var legalTagArr = legalTags.split(',');

            $txt.on('paste.ui.editor', function (e) {
                if (!editor.config.pasteFilter) {
                    // 配置中取消了粘贴过滤
                    return;
                }

                var currentNodeName = editor.getRangeElem().nodeName;
                if (currentNodeName === 'TD' || currentNodeName === 'TH') {
                    // 在表格的单元格中粘贴，忽略所有内容。否则会出现异常情况
                    return;
                }

                resultHtml = ''; // 先清空 resultHtml

                var pasteHtml, $paste;
                var data = e.clipboardData || e.originalEvent.clipboardData;
                var ieData = window.clipboardData;

                if (editor.config.pasteText) {
                    // 只粘贴纯文本

                    if (data && data.getData) {
                        // w3c
                        pasteHtml = data.getData('text/plain');
                    } else if (ieData && ieData.getData) {
                        // IE
                        pasteHtml = ieData.getData('text');
                    } else {
                        // 其他情况
                        return;
                    }

                    // 拼接为 <p> 标签
                    if (pasteHtml) {
                        resultHtml = '<p>' + pasteHtml + '</p>';
                    }

                } else {
                    // 粘贴过滤了样式的、只有标签的 html

                    if (data && data.getData) {
                        // w3c

                        // 获取粘贴过来的html
                        pasteHtml = data.getData('text/html');
                        if (pasteHtml) {
                            // 创建dom
                            $paste = $('<div>' + pasteHtml + '</div>');
                            // 处理，并将结果存储到 resultHtml 『全局』变量
                            handle($paste.get(0));
                        } else {
                            // 得不到html，试图获取text
                            pasteHtml = data.getData('text/plain');
                            if (pasteHtml) {
                                // 替换特殊字符
                                pasteHtml = pasteHtml.replace(/[ ]/g, '&nbsp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/\n/g, '</p><p>');
                                // 拼接
                                resultHtml = '<p>' + pasteHtml + '</p>';

                                // 查询链接
                                resultHtml = resultHtml.replace(/<p>(https?:\/\/.*?)<\/p>/ig, function (match, link) {
                                    return '<p><a href="' + link + '" target="_blank">' + link + '</p>';
                                });
                            }
                        }

                    } else if (ieData && ieData.getData) {
                        // IE 直接从剪切板中取出纯文本格式
                        resultHtml = ieData.getData('text');
                        if (!resultHtml) {
                            return;
                        }
                        // 拼接为 <p> 标签
                        resultHtml = '<p>' + resultHtml + '</p>';
                        resultHtml = resultHtml.replace(new RegExp('\n', 'g'), '</p><p>');
                    } else {
                        // 其他情况
                        return;
                    }
                }

                // 执行命令
                if (resultHtml) {
                    editor.command(e, 'insertHtml', resultHtml);

                    // 删除内容为空的 p 和嵌套的 p
                    self.clearEmptyOrNestP();
                }
            });

            // 处理粘贴的内容
            function handle(elem) {
                if (!elem || !elem.nodeType || !elem.nodeName) {
                    return;
                }
                var $elem;
                var nodeName = elem.nodeName.toLowerCase();
                var nodeType = elem.nodeType;

                // 只处理文本和普通node标签
                if (nodeType !== 3 && nodeType !== 1) {
                    return;
                }

                $elem = $(elem);

                // 如果是容器，则继续深度遍历
                if (nodeName === 'div') {
                    $.each(elem.childNodes, function () {
                        // elem.childNodes 可获取TEXT节点，而 $elem.children() 就获取不到
                        handle(this);
                    });
                    return;
                }

                if (legalTagArr.indexOf(nodeName) >= 0) {
                    // 如果是合法标签之内的，则根据元素类型，获取值
                    resultHtml += getResult(elem);
                } else if (nodeType === 3) {
                    // 如果是文本，则直接插入 p 标签
                    resultHtml += '<p>' + elem.textContent + '</p>';
                } else if (nodeName === 'br') {
                    // <br>保留
                    resultHtml += '<br/>';
                }
                else {
                    // 忽略的标签
                    if (['meta', 'style', 'script', 'object', 'form', 'iframe', 'hr'].indexOf(nodeName) >= 0) {
                        return;
                    }
                    // 其他标签，移除属性，插入 p 标签
                    $elem = $(removeAttrs(elem));
                    // 注意，这里的 clone() 是必须的，否则会出错
                    resultHtml += $('<div>').append($elem.clone()).html();
                }
            }

            // 获取元素的结果
            function getResult(elem) {
                var nodeName = elem.nodeName.toLowerCase();
                var $elem;
                var htmlForP = '';
                var htmlForLi = '';

                if (['blockquote'].indexOf(nodeName) >= 0) {

                    // 直接取出元素text即可
                    $elem = $(elem);
                    return '<' + nodeName + '>' + $elem.text() + '</' + nodeName + '>';

                } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5'].indexOf(nodeName) >= 0) {

                    //p head 取出 text 和链接
                    elem = removeAttrs(elem);
                    $elem = $(elem);
                    htmlForP = $elem.html();

                    // 剔除 a img 之外的元素
                    htmlForP = htmlForP.replace(/<.*?>/ig, function (tag) {
                        if (tag === '</a>' || tag.indexOf('<a ') === 0 || tag.indexOf('<img ') === 0) {
                            return tag;
                        } else {
                            return '';
                        }
                    });

                    return '<' + nodeName + '>' + htmlForP + '</' + nodeName + '>';

                } else if (['ul', 'ol'].indexOf(nodeName) >= 0) {

                    // ul ol元素，获取子元素（li元素）的text link img，再拼接
                    $elem = $(elem);
                    $elem.children().each(function () {
                        var $li = $(removeAttrs(this));
                        var html = $li.html();

                        html = html.replace(/<.*?>/ig, function (tag) {
                            if (tag === '</a>' || tag.indexOf('<a ') === 0 || tag.indexOf('<img ') === 0) {
                                return tag;
                            } else {
                                return '';
                            }
                        });

                        htmlForLi += '<li>' + html + '</li>';
                    });
                    return '<' + nodeName + '>' + htmlForLi + '</' + nodeName + '>';

                } else {

                    // 其他元素，移除元素属性
                    $elem = $(removeAttrs(elem));
                    return $('<div>').append($elem).html();
                }
            }

            // 移除一个元素（子元素）的attr
            function removeAttrs(elem) {
                var attrs = elem.attributes || [];
                var attrNames = [];
                var exception = ['href', 'target', 'src', 'alt', 'rowspan', 'colspan']; //例外情况

                // 先存储下elem中所有 attr 的名称
                $.each(attrs, function (key, attr) {
                    if (attr && attr.nodeType === 2) {
                        attrNames.push(attr.nodeName);
                    }
                });
                // 再根据名称删除所有attr
                $.each(attrNames, function (key, attr) {
                    if (exception.indexOf(attr) < 0) {
                        // 除了 exception 规定的例外情况，删除其他属性
                        elem.removeAttribute(attr);
                    }
                });


                // 递归子节点
                var children = elem.childNodes;
                if (children.length) {
                    $.each(children, function (key, value) {
                        removeAttrs(value);
                    });
                }

                return elem;
            }
        };

        // 绑定 $txt.formatText() 方法
        Txt.fn.bindFormatText = function () {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;
            var legalTags = E.config.legalTags;
            var legalTagArr = legalTags.split(',');
            var length = legalTagArr.length;
            var regArr = [];

            // 将 E.config.legalTags 配置的有效字符，生成正则表达式
            $.each(legalTagArr, function (k, tag) {
                var reg = '\>\\s*\<(' + tag + ')\>';
                regArr.push(new RegExp(reg, 'ig'));
            });

            // 增加 li
            regArr.push(new RegExp('\>\\s*\<(li)\>', 'ig'));

            // 增加 tr
            regArr.push(new RegExp('\>\\s*\<(tr)\>', 'ig'));

            // 增加 code
            regArr.push(new RegExp('\>\\s*\<(code)\>', 'ig'));

            // 生成 formatText 方法
            $txt.formatText = function () {
                var $temp = $('<div>');
                var html = $txt.html();

                // 去除空格
                html = html.replace(/\s*</ig, '<');

                // 段落、表格之间换行
                $.each(regArr, function (k, reg) {
                    if (!reg.test(html)) {
                        return;
                    }
                    html = html.replace(reg, function (matchStr, tag) {
                        return '>\n<' + tag + '>';
                    });
                });

                $temp.html(html);
                return $temp.text();
            };
        };

        // 定制 $txt.html 方法
        Txt.fn.bindHtml = function () {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;
            var $valueContainer = editor.$valueContainer;
            var valueNodeName = editor.valueNodeName;

            $txt.html = function (html) {
                var result;

                if (valueNodeName === 'div') {
                    // div 生成的编辑器，取值、赋值，都直接触发jquery的html方法
                    result = $.fn.html.call($txt, html);
                }

                // textarea 生成的编辑器，则需要考虑赋值时，也给textarea赋值

                if (html === undefined) {
                    // 取值，直接触发jquery原生html方法
                    result = $.fn.html.call($txt);

                    // 替换 html 中，src和href属性中的 & 字符。
                    // 因为 .html() 或者 .innerHTML 会把所有的 & 字符都改成 &amp; 但是 src 和 href 中的要保持 &
                    result = result.replace(/(href|src)\=\"(.*)\"/igm, function (a, b, c) {
                        return b + '="' + c.replace('&amp;', '&') + '"';
                    });
                } else {
                    // 赋值，需要同时给 textarea 赋值
                    result = $.fn.html.call($txt, html);
                    $valueContainer.val(html);
                }

                if (html === undefined) {
                    return result;
                } else {
                    // 手动触发 change 事件，因为 $txt 监控了 change 事件来判断是否需要执行 editor.onchange
                    $txt.change();
                }
            };
        };
    });
    // Txt.fn api
    _e(function (E, $) {

        var Txt = E.Txt;

        var txtChangeEventNames = 'propertychange change click keyup input paste';

        // 计算高度
        Txt.fn.initHeight = function () {
            var editor = this.editor;
            var $txt = this.$txt;
            var valueContainerHeight = editor.$valueContainer.height();
            var menuHeight = editor.menuContainer.height();
            var txtHeight = valueContainerHeight - menuHeight;

            // 限制最小为 50px
            txtHeight = txtHeight < 50 ? 50 : txtHeight;

            $txt.height(txtHeight);

            // 记录原始高度
            editor.valueContainerHeight = valueContainerHeight;

            // 设置 max-height
            this.initMaxHeight(txtHeight, menuHeight);
        };

        // 计算最大高度
        Txt.fn.initMaxHeight = function (txtHeight, menuHeight) {
            var editor = this.editor;
            var $menuContainer = editor.menuContainer.$menuContainer;
            var $txt = this.$txt;
            var $wrap = $('<div>');

            // 需要浏览器支持 max-height，否则不管
            if (window.getComputedStyle && 'max-height'in window.getComputedStyle($txt.get(0))) {
                // 获取 max-height 并判断是否有值
                var maxHeight = parseInt(editor.$valueContainer.css('max-height'));
                if (isNaN(maxHeight)) {
                    return;
                }

                // max-height 和『全屏』暂时有冲突
                if (editor.menus.fullscreen) {
                    E.warn('max-height和『全屏』菜单一起使用时，会有一些问题尚未解决，请暂时不要两个同时使用');
                    return;
                }

                // 标记
                editor.useMaxHeight = true;

                // 设置maxheight
                $wrap.css({
                    'max-height': (maxHeight - menuHeight) + 'px',
                    'overflow-y': 'auto'
                });
                $txt.css({
                    'height': 'auto',
                    'overflow-y': 'visible',
                    'min-height': txtHeight + 'px'
                });

                // 滚动式，菜单阴影
                $wrap.on('scroll', function () {
                    if ($txt.parent().scrollTop() > 10) {
                        $menuContainer.addClass('eEditor-menu-shadow');
                    } else {
                        $menuContainer.removeClass('eEditor-menu-shadow');
                    }
                });

                if (!this.opts.simple) {
                    // 需在编辑器区域外面再包裹一层
                    $txt.wrap($wrap);
                }

            }
        };

        // 保存选区
        Txt.fn.saveSelectionEvent = function () {
            var $txt = this.$txt;
            var editor = this.editor;
            var timeoutId;
            var dt = Date.now();

            function save() {
                editor.saveSelection();
            }

            // 同步保存选区
            function saveSync() {
                // 100ms之内，不重复保存
                if (Date.now() - dt < 100) {
                    return;
                }

                dt = Date.now();
                save();
            }

            // 异步保存选区
            function saveAync() {
                // 节流，防止高频率重复操作
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(save, 300);
            }

            // txt change 、focus、blur 时随时保存选区
            $txt.on(txtChangeEventNames + ' focus blur', function (e) {
                // 先同步保存选区，为了让接下来就马上要执行 editor.getRangeElem() 的程序
                // 能够获取到正确的 rangeElem
                saveSync();

                // 再异步保存选区，为了确定更加准确的选区，为后续的操作做准备
                saveAync();
            });

            // 鼠标拖拽选择时，可能会拖拽到编辑器区域外面再松手，此时 $txt 就监听不到 click事件了
            $txt.on('mousedown.ui.editor', function () {
                $txt.on('mouseleave.saveSelection', function (e) {
                    // 先同步后异步，如上述注释
                    saveSync();
                    saveAync();

                    // 顺道吧菜单状态也更新了
                    editor.updateMenuStyle && editor.updateMenuStyle();
                    editor.triggerChange();
                });
            }).on('mouseup.ui.editor', function () {
                $txt.off('mouseleave.saveSelection');
            });

        };

        // 随时更新 value
        Txt.fn.updateValueEvent = function () {
            var $txt = this.$txt;
            var editor = this.editor;
            var timeoutId, oldValue;

            // 触发 onchange 事件
            function doOnchange() {
                var val = $txt.html();
                if (oldValue === val) {
                    // 无变化
                    return;
                }

                // 触发 onchange 事件
                if (editor.onchange && typeof editor.onchange === 'function') {
                    editor.onchange.call(editor);
                }

                // 更新内容
                editor.updateValue();

                // 记录最新内容
                oldValue = val;
            }

            // txt change 时随时更新内容
            $txt.on(txtChangeEventNames, function (e) {
                // 初始化
                if (oldValue == null) {
                    oldValue = $txt.html();
                }

                // 监控内容变化（停止操作 100ms 之后立即执行）
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(doOnchange, 100);
            });
        };

        // 随时更新 menustyle
        Txt.fn.updateMenuStyleEvent = function () {
            var $txt = this.$txt;
            var editor = this.editor;

            // txt change 时随时更新内容
            $txt.on(txtChangeEventNames, function (e) {
                editor.updateMenuStyle && editor.updateMenuStyle (); // TODO
                editor.triggerChange();
            });
        };

        // 最后插入试图插入 <p><br><p>
        Txt.fn.insertEmptyP = function () {
            var $txt = this.$txt;
            var $children = $txt.children();

            if ($children.length === 0) {
                $txt.append($('<p><br></p>'));
                return;
            }

            if ($.trim($children.last().html()).toLowerCase() !== '<br>') {
                $txt.append($('<p><br></p>'));
            }
        };

        // 将编辑器暴露出来的文字和图片，都用 p 来包裹
        Txt.fn.wrapImgAndText = function () {
            var $txt = this.$txt;
            var $imgs = $txt.children('img');
            var txt = $txt[0];
            var childNodes = txt.childNodes;
            var childrenLength = childNodes.length;
            var i, childNode, p;

            // 处理图片
            $imgs.length && $imgs.each(function () {
                $(this).wrap('<p>');
            });

            // 处理文字
            for (i = 0; i < childrenLength; i++) {
                childNode = childNodes[i];
                if (childNode.nodeType === 3 && childNode.textContent && $.trim(childNode.textContent)) {
                    $(childNode).wrap('<p>');
                }
            }
        };

        // 清空内容为空的<p>，以及重复包裹的<p>（在windows下的chrome粘贴文字之后，会出现上述情况）
        Txt.fn.clearEmptyOrNestP = function () {
            var $txt = this.$txt;
            var $pList = $txt.find('p');

            $pList.each(function () {
                var $p = $(this);
                var $children = $p.children();
                var childrenLength = $children.length;
                var $firstChild;
                var content = $.trim($p.html());

                // 内容为空的p
                if (!content) {
                    $p.remove();
                    return;
                }

                // 嵌套的p
                if (childrenLength === 1) {
                    $firstChild = $children.first();
                    if ($firstChild.get(0) && $firstChild.get(0).nodeName === 'P') {
                        $p.html( $firstChild.html() );
                    }
                }
            });
        };

        // 获取 scrollTop
        Txt.fn.scrollTop = function (val) {
            var self = this;
            var editor = self.editor;
            var $txt = self.$txt;

            if (editor.useMaxHeight) {
                return $txt.parent().scrollTop(val);
            } else {
                return $txt.scrollTop(val);
            }
        };

        // 鼠标hover时候，显示p、head的高度
        Txt.fn.showHeightOnHover = function () {
            var editor = this.editor;
            var $editorContainer = editor.$editorContainer;
            var menuContainer = editor.menuContainer;
            var $txt = this.$txt;
            var $tip = $('<i class="height-tip"><i>');
            var isTipInTxt = false;

            function addAndShowTip($target) {
                if (!isTipInTxt) {
                    $editorContainer.append($tip);
                    isTipInTxt = true;
                }

                var txtTop = $txt.position().top;
                var txtHeight = $txt.outerHeight();

                var height = $target.height();
                var top = $target.position().top;
                var marginTop = parseInt($target.css('margin-top'), 10);
                var paddingTop = parseInt($target.css('padding-top'), 10);
                var marginBottom = parseInt($target.css('margin-bottom'), 10);
                var paddingBottom = parseInt($target.css('padding-bottom'), 10);

                // 计算初步的结果
                var resultHeight = height + paddingTop + marginTop + paddingBottom + marginBottom;
                var resultTop = top + menuContainer.height();

                // var spaceValue;

                // // 判断是否超出下边界
                // spaceValue = (resultTop + resultHeight) - (txtTop + txtHeight);
                // if (spaceValue > 0) {
                //     resultHeight = resultHeight - spaceValue;
                // }

                // // 判断是否超出了下边界
                // spaceValue = txtTop > resultTop;
                // if (spaceValue) {
                //     resultHeight = resultHeight - spaceValue;
                //     top = top + spaceValue;
                // }

                // 按照最终结果渲染
                $tip.css({
                    height: height + paddingTop + marginTop + paddingBottom + marginBottom,
                    top: top + menuContainer.height()
                });
            }
            function removeTip() {
                if (!isTipInTxt) {
                    return;
                }
                $tip.remove();
                isTipInTxt = false;
            }

            $txt.on('mouseenter.ui.editor', 'ul,ol,blockquote,p,h1,h2,h3,h4,h5,table,pre', function (e) {
                addAndShowTip($(e.currentTarget));
            }).on('mouseleave.ui.editor', function () {
                removeTip();
            });
        };

    });

    // 暴露给用户的 API
    _e(function (E, $) {

        // 创建编辑器
        E.fn.create = function () {
            var editor = this;

            // 检查 E.$body 是否有值
            // 如果在 body 之前引用了 js 文件，body 尚未加载，可能没有值
            if (!E.$body || E.$body.length === 0) {
                E.$body = $('body');
                E.$document = $(document);
                E.$window = $(window);
            }




            editor.createMenu && editor.createMenu();
            editor.eventTxt();
            editor.renderTxt();
            editor.renderEditorContainer();

            // 初始化选区
            editor.initSelection();

            // $txt 快捷方式
            editor.$txt = editor.txt.$txt;

            // 执行用户自定义事件，通过 E.ready() 添加
            var _plugins = E._plugins;
            if (_plugins && _plugins.length) {
                $.each(_plugins, function (k, val) {
                    val.call(editor);
                });
            }

            this.trigger('ready');
        };

        // 禁用编辑器
        E.fn.disable = function () {
            this.txt.$txt.removeAttr('contenteditable');
            this.disableMenusExcept();

            // 先禁用，再记录状态
            this._disabled = true;
        };
        // 启用编辑器
        E.fn.enable = function () {
            // 先解除状态记录，再启用
            this._disabled = false;
            this.txt.$txt.attr('contenteditable', 'true');
            this.enableMenusExcept();
        };

        // 销毁编辑器
        E.fn.destroy = function () {
            var $valueContainer = this.$valueContainer;
            var $editorContainer = this.$editorContainer;
            var valueNodeName = this.valueNodeName;

            if (this.opts.simple) {
                $valueContainer.removeAttr('contenteditable');
            } else {
                if (valueNodeName === 'div') {
                    // div 生成的编辑器
                    $valueContainer.removeAttr('contenteditable');
                    $editorContainer.after($valueContainer);
                    $editorContainer.hide();
                } else {
                    // textarea 生成的编辑器
                    $valueContainer.show();
                    $editorContainer.hide();
                }
            }

            var $txt = this.txt.$txt;
            $txt.children().last().remove(); // 删除末尾空行
            $txt.removeClass('eEditor-txt');
            $txt.off('.ui.editor');
        };

        // 清空内容的快捷方式
        E.fn.clear = function () {
            var editor = this;
            var $txt = editor.txt.$txt;
            $txt.html('<p><br></p>');
            editor.restoreSelectionByElem($txt.find('p').get(0));
        };

        // 渲染 txt
        E.fn.renderTxt = function () {

            var txt = this.txt;

            if (!this.opts.simple) {
                var $editorContainer = this.$editorContainer;
                $editorContainer.append(this.$txt);
            }

            // ready 时候，计算txt的高度
            this.ready(function () {
                txt.initHeight();
            });
        };

        // 编辑区域事件
        E.fn.eventTxt = function () {

            var txt = this.txt;

            // txt内容变化时，保存选区
            txt.saveSelectionEvent();

            // txt内容变化时，随时更新 value
            txt.updateValueEvent();

            // txt内容变化时，随时更新 menu style
            txt.updateMenuStyleEvent();

            // // 鼠标hover时，显示 p head 高度（暂时关闭这个功能）
            // if (!/ie/i.test(E.userAgent)) {
            //     // 暂时不支持IE
            //     txt.showHeightOnHover();
            // }
        };

        // 渲染 container
        E.fn.renderEditorContainer = function () {

            var editor = this;
            var $valueContainer = editor.$valueContainer;
            var $editorContainer = editor.$editorContainer;
            var $txt = editor.txt.$txt;
            var $prev, $parent;

            // 将编辑器渲染到页面中
            if ($valueContainer === $txt) {
                $prev = editor.$prev;
                $parent = editor.$parent;

                if ($prev && $prev.length) {
                    // 有前置节点，就插入到前置节点的后面
                    $prev.after($editorContainer);
                } else {
                    // 没有前置节点，就直接插入到父元素
                    $parent.prepend($editorContainer);
                }

            } else {
                $valueContainer.after($editorContainer);
                $valueContainer.hide();
            }

            // 设置宽度（这样设置宽度有问题）
            // $editorContainer.css('width', $valueContainer.css('width'));
        };
    });

    return window.EDITOR;
});

/**
 * 插入地图
 */
;(function () {
    var E = window.EDITOR;

    E.cmds = {}; // 所有命令

    E.addCommand = function (cmd) {
        E.cmds[cmd.name] = {
            name: cmd.name,
            value: null,
            handler: cmd.handler,
            queryState: cmd.queryState
        };
    };

    E.fn.execCommand = function (cmd, value) {
        if (E.cmds[cmd]) {
            E.cmds[cmd].handler.call(this, this, value);
        }
    };

    E.fn.queryCommandValue = function (cmd) {
        var cmdName = cmd;
        if (E.cmds[cmd] && E.cmds[cmd].systemCmd) {
            cmdName = E.cmds[cmd].systemCmd;
        }

        var result = '';
        try {
            result = document.queryCommandValue(cmdName);
        } catch (ex) {

        }
        return result;
    };
}());

// 事件及自定义事件的支持
;(function () {
    var E = window.EDITOR;


    E.fn.on = function (eventName, hanlder) {
        if (!this.eventHandlers) {
            this.eventHandlers = {};
        }
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(hanlder);
    };

    E.fn.trigger = function (eventName) {
        if (this.eventHandlers && this.eventHandlers[eventName]) {
            var hadnlers = this.eventHandlers[eventName];
            for (var i = 0; i < hadnlers.length; i++) {
                hadnlers[i]();
            }
        }
    };

    // 预定义 ready 事件
    E.ready = function (fn) {

        if (!E.readyFns) {
            E.readyFns = [];
        }

        E.readyFns.push(fn);
    };

    // 处理ready事件
    E.readyHeadler = function () {
        var fns = E.readyFns;

        if (fns) {
            for (var i = 0; i < fns.length; i++) {
                fns[i].call(this);
            }
            /* while (fns.length) {
             fns.shift().call(this);
             }*/
        }

    };
}());


/**
 * Created by cjh1 on 2016/10/19.
 */
(function () {


    // 定义扩展函数
    var _e = function (fn) {
        var E = window.EDITOR;
        if (E) {
            // 执行传入的函数
            fn(E, $);
        }
    };

    _e(function (E, $) {

        // 菜单吸顶：false - 不吸顶；number - 吸顶，值为top值
        E.config.menuFixed = 0;

        // 菜单配置
        E.config.menus = [
            'source',
            '|',
            'bold',
            'underline',
            'italic',
            'strikethrough',
            'eraser',
            'forecolor',
            'bgcolor',
            '|',
            'quote',
            'fontfamily',
            'fontsize',
            'head',
            'unorderlist',
            'orderlist',
            'alignleft',
            'aligncenter',
            'alignright',
            '|',
            'link',
            'unlink',
            'table',
            'emotion',
            '|',
            'img',
            'video',
            'location',
            'insertcode',
            '|',
            'undo',
            'redo',
            'fullscreen'
        ];

        E.fn.initUi = function () {

            // 增加menuContainer
            this.addMenuContainer();

            // 初始化菜单集合
            this.menus = {};
        };



        // 触发菜单updatestyle
        E.fn.updateMenuStyle = function () {

            var menus = this.menus;
            $.each(menus, function (k, menu) {
                menu.updateSelected();
            });

            // 隐藏 dropPanel dropList modal  设置 200ms 间隔
            function hidePanelAndModal() {
                editor.hideDropPanelAndModal();
            }
            setTimeout(hidePanelAndModal, 200);
        };

        // 除了传入的 menuIds，其他全部启用
        E.fn.enableMenusExcept = function (menuIds) {
            if (this._disabled) {
                // 编辑器处于禁用状态，则不执行改操作
                return;
            }
            // menuIds参数：支持数组和字符串
            menuIds = menuIds || [];
            if (typeof menuIds === 'string') {
                menuIds = [menuIds];
            }

            $.each(this.menus, function (k, menu) {
                if (menuIds.indexOf(k) >= 0) {
                    return;
                }
                menu.disabled(false);
            });
        };

        // 除了传入的 menuIds，其他全部禁用
        E.fn.disableMenusExcept = function (menuIds) {
            if (this._disabled) {
                // 编辑器处于禁用状态，则不执行改操作
                return;
            }
            // menuIds参数：支持数组和字符串
            menuIds = menuIds || [];
            if (typeof menuIds === 'string') {
                menuIds = [menuIds];
            }

            $.each(this.menus, function (k, menu) {
                if (menuIds.indexOf(k) >= 0) {
                    return;
                }
                menu.disabled(true);
            });
        };

        // 隐藏所有 dropPanel droplist modal
        E.fn.hideDropPanelAndModal = function () {
            var menus = this.menus;

            $.each(menus, function (k, menu) {
                var m = menu.dropPanel || menu.dropList || menu.modal;
                if (m && m.hide) {
                    m.hide();
                }
            });
        };
    });

    // 创建菜单
    _e(function (E, $) {

        E.fn.createMenu = function () {
            editor = this;

            // 执行 addMenus 之前：
            // 1. 允许用户修改 editor.UI 自定义配置UI
            // 2. 允许用户通过修改 editor.menus 来自定义配置菜单
            // 因此要在 create 时执行，而不是 init
            editor.addMenus();

            // 渲染
            editor.renderMenus();
            editor.renderMenuContainer();


            // 绑定事件
            editor.eventMenus();
            editor.eventMenuContainer();

        };

    });
    // menuContainer 构造函数
    _e(function (E, $) {

        // 定义构造函数
        var MenuContainer = function (editor) {
            this.editor = editor;
            this.init();
        };

        MenuContainer.fn = MenuContainer.prototype;

        E.MenuContainer = MenuContainer;

    });
    // MenuContainer.fn bind fn
    _e(function (E, $) {

        var MenuContainer = E.MenuContainer;

        // 初始化
        MenuContainer.fn.init = function () {
            var self = this;
            var $menuContainer = $('<div class="eEditor-menu-container clearfix"></div>');

            self.$menuContainer = $menuContainer;

            // change shadow
            self.changeShadow();
        };

        // 编辑区域滚动时，增加shadow
        MenuContainer.fn.changeShadow = function () {
            var $menuContainer = this.$menuContainer;
            var editor = this.editor;
            var $txt = editor.txt.$txt;

            $txt.on('scroll', function () {
                if ($txt.scrollTop() > 10) {
                    $menuContainer.addClass('eEditor-menu-shadow');
                } else {
                    $menuContainer.removeClass('eEditor-menu-shadow');
                }
            });
        };

    });
    // MenuContainer.fn API
    _e(function (E, $) {

        var MenuContainer = E.MenuContainer;

        MenuContainer.fn.render = function () {
            var $menuContainer = this.$menuContainer;
            var $editorContainer = this.editor.$editorContainer;

            $editorContainer.append($menuContainer);
        };

        // 获取菜单栏的高度
        MenuContainer.fn.height = function () {
            var $menuContainer = this.$menuContainer;
            return $menuContainer.height();
        };

        // 添加菜单
        MenuContainer.fn.appendMenu = function (groupIdx, menu) {
            // 判断是否需要新增一个菜单组
            this._addGroup(groupIdx);
            // 增加菜单（返回 $menuItem）
            return this._addOneMenu(menu);
        };
        MenuContainer.fn._addGroup = function (groupIdx) {
            var $menuContainer = this.$menuContainer;
            var $menuGroup;
            if (!this.$currentGroup || this.currentGroupIdx !== groupIdx) {
                $menuGroup = $('<div class="menu-group clearfix"></div>');
                $menuContainer.append($menuGroup);

                this.$currentGroup = $menuGroup;
                this.currentGroupIdx = groupIdx;
            }
        };
        MenuContainer.fn._addOneMenu = function (menu) {
            var $menuNormal = menu.$domNormal;
            var $menuSelected = menu.$domSelected;

            var $menuGroup = this.$currentGroup;
            var $item = $('<div class="menu-item clearfix" title="' + menu.title + '"></div>');
            $menuSelected.hide();
            $item.append($menuNormal).append($menuSelected);
            $menuGroup.append($item);

            return $item;
        };

    });
    // menu 构造函数
    _e(function (E, $) {

        // 定义构造函数
        var Menu = function (opt) {
            this.editor = opt.editor;
            this.id = opt.id;
            this.title = opt.title;
            this.$domNormal = opt.$domNormal;
            this.$domSelected = opt.$domSelected || opt.$domNormal;

            // document.execCommand 的参数
            this.commandName = opt.commandName;
            this.commandValue = opt.commandValue;
            this.commandNameSelected = opt.commandNameSelected || opt.commandName;
            this.commandValueSelected = opt.commandValueSelected || opt.commandValue;
        };

        Menu.fn = Menu.prototype;

        E.Menu = Menu;
    });
    // Menu.fn 初始化绑定的事件
    _e(function (E, $) {

        var Menu = E.Menu;

        // 初始化UI
        Menu.fn.initUI = function () {
            var editor = this.editor;
            var uiConfig = editor.UI.menus;
            var menuId = this.id;
            var menuUI = uiConfig[menuId];

            if (this.$domNormal && this.$domSelected) {
                // 自定义的菜单中，已经传入了 $dom 无需从配置文件中查找生成
                return;
            }

            if (menuUI == null) {
                E.warn('editor.UI配置中，没有菜单 "' + menuId + '" 的UI配置，只能取默认值');

                // 必须写成 uiConfig['default'];
                // 写成 uiConfig.default IE8会报错
                menuUI = uiConfig['default'];
            }

            // 正常状态
            this.$domNormal = $(menuUI.normal);

            // 选中状态
            if (/^\./.test(menuUI.selected)) {
                // 增加一个样式
                this.$domSelected = this.$domNormal.clone().addClass(menuUI.selected.slice(1));
            } else {
                // 一个新的dom对象
                this.$domSelected = $(menuUI.selected);
            }
        };

    });
    // Menu.fn API
    _e(function (E, $) {

        var Menu = E.Menu;

        // 渲染菜单
        Menu.fn.render = function (groupIdx) {
            // 渲染UI
            this.initUI();



            var editor = this.editor;
            var menuContainer = editor.menuContainer;
            var $menuItem = menuContainer.appendMenu(groupIdx, this);
            var onRender = this.onRender;

            // 执行 onRender 函数
            if (onRender && typeof onRender === 'function') {
                onRender.call(this);
            }
        };

        // 绑定事件
        Menu.fn.bindEvent = function () {

            var self = this;

            var $domNormal = self.$domNormal;
            var $domSelected = self.$domSelected;

            // 试图获取该菜单定义的事件（未selected），没有则自己定义
            var clickEvent = self.clickEvent;
            if (!clickEvent) {
                clickEvent = function (e) {
                    // -----------dropPanel dropList modal-----------
                    var dropObj = self.dropPanel || self.dropList || self.modal;
                    if (dropObj && dropObj.show) {
                        if (dropObj.isShowing) {
                            dropObj.hide();
                        } else {
                            dropObj.show();
                        }
                        return;
                    }

                    // -----------command-----------
                    var editor = self.editor;
                    var commandName;
                    var commandValue;

                    var selected = self.selected;
                    if (selected) {
                        commandName = self.commandNameSelected;
                        commandValue = self.commandValueSelected;
                    } else {
                        commandName = self.commandName;
                        commandValue = self.commandValue;
                    }

                    if (commandName) {
                        // 执行命令
                        console.log(commandName, commandValue);
                        editor.command(e, commandName, commandValue);
                    } else {
                        // 提示
                        E.warn('菜单 "' + self.id + '" 未定义click事件');
                        e.preventDefault();
                    }
                };
            }
            // 获取菜单定义的selected情况下的点击事件
            var clickEventSelected = self.clickEventSelected || clickEvent;

            // 将事件绑定到菜单dom上
            $domNormal.click(function (e) {
                if (!self.disabled()) {
                    clickEvent.call(self, e);
                    self.updateSelected();
                }
                e.preventDefault();
            });
            $domSelected.click(function (e) {
                if (!self.disabled()) {
                    clickEventSelected.call(self, e);
                    self.updateSelected();
                }
                e.preventDefault();
            });
        };

        // 更新选中状态
        Menu.fn.updateSelected = function () {
            var self = this;
            var editor = self.editor;

            // 试图获取用户自定义的判断事件
            var updateSelectedEvent = self.updateSelectedEvent;
            if (!updateSelectedEvent) {
                // 用户未自定义，则设置默认值
                updateSelectedEvent = function () {
                    var self = this;
                    var editor = self.editor;
                    var commandName = self.commandName;
                    var commandValue = self.commandValue;

                    if (commandValue) {
                        if (document.queryCommandValue(commandName).toLowerCase() === commandValue.toLowerCase()) {
                            return true;
                        }
                    } else if (document.queryCommandState(commandName)) {
                        return true;
                    }

                    return false;
                };
            }

            // 获取结果
            var result = updateSelectedEvent.call(self);
            result = !!result;

            // 存储结果、显示效果
            self.changeSelectedState(result);
        };

        // 切换选中状态、显示效果
        Menu.fn.changeSelectedState = function (state) {
            var self = this;
            var selected = self.selected;

            if (state != null && typeof state === 'boolean') {
                if (selected === state) {
                    // 计算结果和当前的状态一样
                    return;
                }

                // 存储结果
                self.selected = state;

                // 切换菜单的显示
                if (state) {
                    // 选中
                    self.$domNormal.hide();
                    self.$domSelected.show();
                    //if (self.onSelected)
                } else {
                    // 未选中
                    self.$domNormal.show();
                    self.$domSelected.hide();
                }
            } // if
        };

        // 点击菜单，显示了 dropPanel modal 时，菜单的状态
        Menu.fn.active = function (active) {
            if (active == null) {
                return this._activeState;
            }
            this._activeState = active;
        };
        Menu.fn.activeStyle = function (active) {
            var selected = this.selected;
            var $dom = this.$domNormal;
            var $domSelected = this.$domSelected;

            if (active) {
                $dom.addClass('active');
                $domSelected.addClass('active');
            } else {
                $dom.removeClass('active');
                $domSelected.removeClass('active');
            }

            // 记录状态 （ menu hover 时会取状态用 ）
            this.active(active);
        };

        // 菜单的启用和禁用
        Menu.fn.disabled = function (opt) {
            // 参数为空，取值
            if (opt == null) {
                return !!this._disabled;
            }

            if (this._disabled === opt) {
                // 要设置的参数值和当前参数只一样，无需再次设置
                return;
            }

            var $dom = this.$domNormal;
            var $domSelected = this.$domSelected;

            // 设置样式
            if (opt) {
                $dom.addClass('disable');
                $domSelected.addClass('disable');
            } else {
                $dom.removeClass('disable');
                $domSelected.removeClass('disable');
            }

            // 存储
            this._disabled = opt;
        };

    });
    // dropList 构造函数
    _e(function (E, $) {

        // 定义构造函数
        var DropList = function (editor, menu, opt) {
            this.editor = editor;
            this.menu = menu;

            // list 的数据源，格式 {'commandValue': 'title', ...}
            this.data = opt.data;
            // 要为每个item自定义的模板
            this.tpl = opt.tpl;
            // 为了执行 editor.commandForElem 而传入的elem查询方式
            this.selectorForELemCommand = opt.selectorForELemCommand;

            // 执行事件前后的钩子
            this.beforeEvent = opt.beforeEvent;
            this.afterEvent = opt.afterEvent;

            // 初始化
            this.init();
        };

        DropList.fn = DropList.prototype;

        E.DropList = DropList;
    });
    // dropList fn bind
    _e(function (E, $) {

        var DropList = E.DropList;

        // init
        DropList.fn.init = function () {
            var self = this;

            // 生成dom对象
            self.initDOM();

            // 绑定command事件
            self.bindEvent();

            // 声明隐藏的事件
            self.initHideEvent();
        };

        // 初始化dom结构
        DropList.fn.initDOM = function () {
            var self = this;
            var data = self.data;
            var tpl = self.tpl || '<span>{#title}</span>';
            var $list = $('<div class="eEditor-drop-list clearfix"></div>');

            var itemContent;
            var $item;
            $.each(data, function (commandValue, title) {
                itemContent = tpl.replace(/{#commandValue}/ig, commandValue).replace(/{#title}/ig, title);
                $item = $('<a href="#" commandValue="' + commandValue + '"></a>');
                $item.append(itemContent);
                $list.append($item);
            });

            self.$list = $list;
        };

        // 绑定事件
        DropList.fn.bindEvent = function () {
            var self = this;
            var editor = self.editor;
            var menu = self.menu;
            var commandName = menu.commandName;
            var selectorForELemCommand = self.selectorForELemCommand;
            var $list = self.$list;

            // 执行事件前后的钩子函数
            var beforeEvent = self.beforeEvent;
            var afterEvent = self.afterEvent;

            $list.on('click', 'a[commandValue]', function (e) {
                // 正式命令执行之前
                if (beforeEvent && typeof beforeEvent === 'function') {
                    beforeEvent.call(e);
                }

                // 执行命令
                var commandValue = $(e.currentTarget).attr('commandValue');
                if (menu.selected && editor.isRangeEmpty() && selectorForELemCommand) {
                    // 当前处于选中状态，并且选中内容为空
                    editor.commandForElem(selectorForELemCommand, e, commandName, commandValue);
                } else {
                    // 当前未处于选中状态，或者有选中内容。则执行默认命令
                    editor.command(e, commandName, commandValue);
                }

                // 正式命令之后的钩子
                if (afterEvent && typeof afterEvent === 'function') {
                    afterEvent.call(e);
                }
            });
        };

        // 点击其他地方，立即隐藏 droplist
        DropList.fn.initHideEvent = function () {
            var self = this;

            // 获取 list elem
            var thisList = self.$list.get(0);

            E.$body.on('click', function (e) {
                if (!self.isShowing) {
                    return;
                }
                var trigger = e.target;

                // 获取菜单elem
                var menu = self.menu;
                var menuDom;
                if (menu.selected) {
                    menuDom = menu.$domSelected.get(0);
                } else {
                    menuDom = menu.$domNormal.get(0);
                }

                if (menuDom === trigger || $.contains(menuDom, trigger)) {
                    // 说明由本菜单点击触发的
                    return;
                }

                if (thisList === trigger || $.contains(thisList, trigger)) {
                    // 说明由本list点击触发的
                    return;
                }

                // 其他情况，隐藏 list
                self.hide();
            });

            E.$window.scroll(function () {
                self.hide();
            });

            E.$window.on('resize', function () {
                self.hide();
            });
        };

    });
    // dropListfn api
    _e(function (E, $) {

        var DropList = E.DropList;

        // 渲染
        DropList.fn._render = function () {
            var self = this;
            var editor = self.editor;
            var $list = self.$list;

            // 渲染到页面
            editor.$editorContainer.append($list);

            // 记录状态
            self.rendered = true;
        };

        // 定位
        DropList.fn._position = function () {
            var self = this;
            var $list = self.$list;
            var editor = self.editor;
            var menu = self.menu;
            var $menuContainer = editor.menuContainer.$menuContainer;
            var $menuDom = menu.selected ? menu.$domSelected : menu.$domNormal;
            // 注意这里的 offsetParent() 要返回 .menu-item 的 position
            // 因为 .menu-item 是 position:relative
            var menuPosition = $menuDom.offsetParent().position();

            // 取得 menu 的位置、尺寸属性
            var menuTop = menuPosition.top;
            var menuLeft = menuPosition.left;
            var menuHeight = $menuDom.offsetParent().height();
            var menuWidth = $menuDom.offsetParent().width();

            // 取得 list 的尺寸属性
            var listWidth = $list.outerWidth();
            // var listHeight = $list.outerHeight();

            // 取得 $txt 的尺寸
            var txtWidth = editor.txt.$txt.outerWidth();

            // ------------开始计算-------------

            // 初步计算 list 位置属性
            var top = menuTop + menuHeight;
            var left = menuLeft + menuWidth/2;
            var marginLeft = 0 - menuWidth/2;

            // 如果超出了有边界，则要左移（且和右侧有间隙）
            var valWithTxt = (left + listWidth) - txtWidth;
            if (valWithTxt > -10) {
                marginLeft = marginLeft - valWithTxt - 10;
            }
            // 设置样式
            $list.css({
                top: top,
                left: left,
                'margin-left': marginLeft
            });

            // 如果因为向下滚动而导致菜单fixed，则再加一步处理
            if (editor._isMenufixed) {
                top = top + (($menuContainer.offset().top + $menuContainer.outerHeight()) - $list.offset().top);

                // 重新设置top
                $list.css({
                    top: top
                });
            }
        };

        // 显示
        DropList.fn.show = function () {
            var self = this;
            var menu = self.menu;
            if (!self.rendered) {
                // 第一次show之前，先渲染
                self._render();
            }

            if (self.isShowing) {
                return;
            }

            var $list = self.$list;
            $list.show();

            // 定位
            self._position();

            // 记录状态
            self.isShowing = true;

            // 菜单状态
            menu.activeStyle(true);
        };

        // 隐藏
        DropList.fn.hide = function () {
            var self = this;
            var menu = self.menu;
            if (!self.isShowing) {
                return;
            }

            var $list = self.$list;
            $list.hide();

            // 记录状态
            self.isShowing = false;

            // 菜单状态
            menu.activeStyle(false);
        };
    });
    // dropPanel 构造函数
    _e(function (E, $) {

        // 定义构造函数
        var DropPanel = function (editor, menu, opt) {
            this.editor = editor;
            this.menu = menu;
            this.$content = opt.$content;
            this.width = opt.width || 200;
            this.height = opt.height;
            this.onRender = opt.onRender;

            // init
            this.init();
        };

        DropPanel.fn = DropPanel.prototype;

        E.DropPanel = DropPanel;
    });
    // dropPanel fn bind
    _e(function (E, $) {

        var DropPanel = E.DropPanel;

        // init
        DropPanel.fn.init = function () {
            var self = this;

            // 生成dom对象
            self.initDOM();

            // 声明隐藏的事件
            self.initHideEvent();
        };

        // init DOM
        DropPanel.fn.initDOM = function () {
            var self = this;
            var $content = self.$content;
            var width = self.width;
            var height = self.height;
            var $panel = $('<div class="eEditor-drop-panel clearfix"></div>');
            var $triangle = $('<div class="tip-triangle"></div>');

            $panel.css({
                width: width,
                height: height ? height : 'auto'
            });
            $panel.append($triangle);
            $panel.append($content);

            // 添加对象数据
            self.$panel = $panel;
            self.$triangle = $triangle;
        };

        // 点击其他地方，立即隐藏 dropPanel
        DropPanel.fn.initHideEvent = function () {
            var self = this;

            // 获取 panel elem
            var thisPanle = self.$panel.get(0);

            E.$body.on('click', function (e) {
                if (!self.isShowing) {
                    return;
                }
                var trigger = e.target;

                // 获取菜单elem
                var menu = self.menu;
                var menuDom;
                if (menu.selected) {
                    menuDom = menu.$domSelected.get(0);
                } else {
                    menuDom = menu.$domNormal.get(0);
                }

                if (menuDom === trigger || $.contains(menuDom, trigger)) {
                    // 说明由本菜单点击触发的
                    return;
                }

                if (thisPanle === trigger || $.contains(thisPanle, trigger)) {
                    // 说明由本panel点击触发的
                    return;
                }

                // 其他情况，隐藏 panel
                self.hide();
            });

            E.$window.scroll(function (e) {
                self.hide();
            });

            E.$window.on('resize', function () {
                self.hide();
            });
        };

    });
    // dropPanel fn api
    _e(function (E, $) {

        var DropPanel = E.DropPanel;

        // 渲染
        DropPanel.fn._render = function () {
            var self = this;
            var onRender = self.onRender;
            var editor = self.editor;
            var $panel = self.$panel;

            // 渲染到页面
            editor.$editorContainer.append($panel);

            // 渲染后的回调事件
            onRender && onRender.call(self);

            // 记录状态
            self.rendered = true;
        };

        // 定位
        DropPanel.fn._position = function () {
            var self = this;
            var $panel = self.$panel;
            var $triangle = self.$triangle;
            var editor = self.editor;
            var $menuContainer = editor.menuContainer.$menuContainer;
            var menu = self.menu;
            var $menuDom = menu.selected ? menu.$domSelected : menu.$domNormal;
            // 注意这里的 offsetParent() 要返回 .menu-item 的 position
            // 因为 .menu-item 是 position:relative
            var menuPosition = $menuDom.offsetParent().position();

            // 取得 menu 的位置、尺寸属性
            var menuTop = menuPosition.top;
            var menuLeft = menuPosition.left;
            var menuHeight = $menuDom.offsetParent().height();
            var menuWidth = $menuDom.offsetParent().width();

            // 取得 panel 的尺寸属性
            var panelWidth = $panel.outerWidth();
            // var panelHeight = $panel.outerHeight();

            // 取得 $txt 的尺寸
            var txtWidth = editor.txt.$txt.outerWidth();

            // ------------开始计算-------------

            // 初步计算 panel 位置属性
            var top = menuTop + menuHeight;
            var left = menuLeft + menuWidth/2;
            var marginLeft = 0 - panelWidth/2;
            var marginLeft2 = marginLeft;  // 下文用于和 marginLeft 比较，来设置三角形tip的位置

            // 如果超出了左边界，则移动回来（要和左侧有10px间隙）
            if ((0 - marginLeft) > (left - 10)) {
                marginLeft = 0 - (left - 10);
            }

            // 如果超出了有边界，则要左移（且和右侧有10px间隙）
            var valWithTxt = (left + panelWidth + marginLeft) - txtWidth;
            if (valWithTxt > -10) {
                marginLeft = marginLeft - valWithTxt - 10;
            }

            // 设置样式
            $panel.css({
                top: top,
                left: left,
                'margin-left': marginLeft
            });

            // 如果因为向下滚动而导致菜单fixed，则再加一步处理
            if (editor._isMenufixed) {
                top = top + (($menuContainer.offset().top + $menuContainer.outerHeight()) - $panel.offset().top);

                // 重新设置top
                $panel.css({
                    top: top
                });
            }

            // 设置三角形 tip 的位置
            $triangle.css({
                'margin-left': marginLeft2 - marginLeft - 5
            });
        };

        // focus 第一个 input
        DropPanel.fn.focusFirstInput = function () {
            var self = this;
            var $panel = self.$panel;
            $panel.find('input[type=text],textarea').each(function () {
                var $input = $(this);
                if ($input.attr('disabled') == null) {
                    $input.focus();
                    return false;
                }
            });
        };

        // 显示
        DropPanel.fn.show = function () {
            var self = this;
            var menu = self.menu;
            if (!self.rendered) {
                // 第一次show之前，先渲染
                self._render();
            }

            if (self.isShowing) {
                return;
            }

            var $panel = self.$panel;
            $panel.show();

            // 定位
            self._position();

            // 记录状态
            self.isShowing = true;

            // 菜单状态
            menu.activeStyle(true);

            self.focusFirstInput();
        };

        // 隐藏
        DropPanel.fn.hide = function () {
            var self = this;
            var menu = self.menu;
            if (!self.isShowing) {
                return;
            }

            var $panel = self.$panel;
            $panel.hide();

            // 记录状态
            self.isShowing = false;

            // 菜单状态
            menu.activeStyle(false);
        };

    });
    // modal 构造函数
    _e(function (E, $) {

        // 定义构造函数
        var Modal = function (editor, menu, opt) {
            this.editor = editor;
            this.menu = menu;
            this.$content = opt.$content;

            this.init();
        };

        Modal.fn = Modal.prototype;

        E.Modal = Modal;
    });
    // modal fn bind
    _e(function (E, $) {

        var Modal = E.Modal;

        Modal.fn.init = function () {
            var self = this;

            // 初始化dom
            self.initDom();

            // 初始化隐藏事件
            self.initHideEvent();
        };

        // 初始化dom
        Modal.fn.initDom = function () {
            var self = this;
            var $content = self.$content;
            var $modal = $('<div class="eEditor-modal"></div>');
            var $close = $('<div class="eEditor-modal-close"><i class="icon icon-close"></i></div>');

            $modal.append($close);
            $modal.append($content);

            // 记录数据
            self.$modal = $modal;
            self.$close = $close;
        };

        // 初始化隐藏事件
        Modal.fn.initHideEvent = function () {
            var self = this;
            var $close = self.$close;
            var modal = self.$modal.get(0);

            // 点击 $close 按钮，隐藏
            $close.click(function () {
                self.hide();
            });

            // 点击其他部分，隐藏
            E.$body.on('click', function (e) {
                if (!self.isShowing) {
                    return;
                }
                var trigger = e.target;

                // 获取菜单elem
                var menu = self.menu;
                var menuDom;
                if (menu) {
                    if (menu.selected) {
                        menuDom = menu.$domSelected.get(0);
                    } else {
                        menuDom = menu.$domNormal.get(0);
                    }

                    if (menuDom === trigger || $.contains(menuDom, trigger)) {
                        // 说明由本菜单点击触发的
                        return;
                    }
                }

                if (modal === trigger || $.contains(modal, trigger)) {
                    // 说明由本panel点击触发的
                    return;
                }

                // 其他情况，隐藏 panel
                self.hide();
            });
        };
    });
    // modal fn api
    _e(function (E, $) {

        var Modal = E.Modal;

        // 渲染
        Modal.fn._render = function () {
            var self = this;
            var editor = self.editor;
            var $modal = self.$modal;

            // $modal的z-index，在配置的z-index基础上再 +10
            $modal.css('z-index', editor.config.zindex + 10 + '');

            // 渲染到body最后面
            E.$body.append($modal);

            // 记录状态
            self.rendered = true;
        };

        // 定位
        Modal.fn._position = function () {
            var self = this;
            var $modal = self.$modal;
            var top = $modal.offset().top;
            var width = $modal.outerWidth();
            var height = $modal.outerHeight();
            var marginLeft = 0 - (width / 2);
            var marginTop = 0 - (height / 2);
            var sTop = E.$window.scrollTop();

            // 保证modal最顶部，不超过浏览器上边框
            if ((height / 2) > top) {
                marginTop = 0 - top;
            }

            $modal.css({
                'margin-left': marginLeft + 'px',
                'margin-top': (marginTop + sTop) + 'px'
            });
        };

        // 显示
        Modal.fn.show = function () {
            var self = this;
            var menu = self.menu;
            if (!self.rendered) {
                // 第一次show之前，先渲染
                self._render();
            }

            if (self.isShowing) {
                return;
            }
            // 记录状态
            self.isShowing = true;

            var $modal = self.$modal;
            $modal.show();

            // 定位
            self._position();

            // 激活菜单状态
            menu && menu.activeStyle(true);
        };

        // 隐藏
        Modal.fn.hide = function () {
            var self = this;
            var menu = self.menu;
            if (!self.isShowing) {
                return;
            }
            // 记录状态
            self.isShowing = false;

            // 隐藏
            var $modal = self.$modal;
            $modal.hide();

            // 菜单状态
            menu && menu.activeStyle(false);
        };
    });

    // 全局UI
    _e(function (E, $) {

        E.UI = {};

        // 为菜单自定义配置的UI
        E.UI.menus = {
            // 这个 default 不加引号，在 IE8 会报错
            'default': {
                normal: '<a href="#" tabindex="-1"><i class="icon icon-dot"></i></a>',
                selected: '.selected'
            },
        };

    });
    // 对象配置
    _e(function (E, $) {

        E.fn.initDefaultConfig = function () {
            var editor = this;
            editor.UI = $.extend({}, E.UI);
        };



        // 增加menuContainer对象
        E.fn.addMenuContainer = function () {
            var editor = this;
            editor.menuContainer = new E.MenuContainer(editor);
        };

    });
    // 增加menus
    _e(function (E, $) {

        // 存储创建菜单的函数
        E.createMenuFns = [];
        E.createMenu = function (fn) {
            E.createMenuFns.push(fn);
        };

        // 创建所有菜单
        E.fn.addMenus = function () {
            var editor = this;
            var menuIds = editor.config.menus;

            // 检验 menuId 是否在配置中存在
            function check(menuId) {
                if (menuIds.indexOf(menuId) >= 0) {
                    return true;
                }
                return false;
            }

            // 遍历所有的菜单创建函数，并执行
            $.each(E.createMenuFns, function (k, createMenuFn) {
                createMenuFn.call(editor, check);
            });
        };

    });
    // 渲染menus
    _e(function (E, $) {

        E.fn.renderMenus = function () {

            var editor = this;
            var menus = editor.menus;
            var menuIds = editor.config.menus;
            var menuContainer = editor.menuContainer;

            var menu;
            var groupIdx = 0;
            $.each(menuIds, function (k, v) {
                if (v === '|') {
                    groupIdx++;
                    return;
                }

                menu = menus[v];
                if (menu) {
                    menu.render(groupIdx);
                }
            });
        };

        // 渲染menus
        E.fn.renderMenuContainer = function () {

            var editor = this;
            var menuContainer = editor.menuContainer;
            var $editorContainer = editor.$editorContainer;

            menuContainer.render();

        };



        // 菜单事件
        // 绑定每个菜单的click事件
        E.fn.eventMenus = function () {

            var menus = this.menus;

            // 绑定菜单的点击事件
            $.each(menus, function (k, v) {
                v.bindEvent();
            });

        };

        // 菜单container事件
        E.fn.eventMenuContainer = function () {

        };





        // 编辑区域 link toolbar
        E.plugin(function () {
            var editor = this;
            var lang = editor.config.lang;
            var $txt = editor.txt.$txt;

            // 当前命中的链接
            var $currentLink;

            var $toolbar = $('<div class="txt-toolbar"></div>');
            var $triangle = $('<div class="tip-triangle"></div>');
            var $triggerLink = $('<a href="#" target="_blank"><i class="icon icon-link"></i> ' + lang.openLink + '</a>');
            var isRendered;

            // 记录当前的显示/隐藏状态
            var isShow = false;

            var showTimeoutId, hideTimeoutId;
            var showTimeoutIdByToolbar, hideTimeoutIdByToolbar;

            // 渲染 dom
            function render() {
                if (isRendered) {
                    return;
                }

                $toolbar.append($triangle)
                    .append($triggerLink);

                editor.$editorContainer.append($toolbar);

                isRendered = true;
            }

            // 定位
            function setPosition() {
                if (!$currentLink) {
                    return;
                }

                var position = $currentLink.position();
                var left = position.left;
                var top = position.top;
                var height = $currentLink.height();

                // 初步计算top值
                var topResult = top + height + 5;

                // 判断 toolbar 是否超过了编辑器区域的下边界
                var menuHeight = editor.menuContainer.height();
                var txtHeight = editor.txt.$txt.outerHeight();
                if (topResult > menuHeight + txtHeight) {
                    topResult = menuHeight + txtHeight + 5;
                }

                // 最终设置
                $toolbar.css({
                    top: topResult,
                    left: left
                });
            }

            // 显示 toolbar
            function show() {
                if (isShow) {
                    return;
                }

                if (!$currentLink) {
                    return;
                }

                render();

                $toolbar.show();

                // 设置链接
                var href = $currentLink.attr('href');
                $triggerLink.attr('href', href);

                // 定位
                setPosition();

                isShow = true;
            }

            // 隐藏 toolbar
            function hide() {
                if (!isShow) {
                    return;
                }

                if (!$currentLink) {
                    return;
                }

                $toolbar.hide();
                isShow = false;
            }

            // $txt 绑定事件
            $txt.on('mouseenter', 'a', function (e) {
                // 延时 500ms 显示toolbar
                if (showTimeoutId) {
                    clearTimeout(showTimeoutId);
                }
                showTimeoutId = setTimeout(function () {
                    var a = e.currentTarget;
                    var $a = $(a);
                    $currentLink = $a;

                    var $img = $a.children('img');
                    if ($img.length) {
                        // 该链接下包含一个图片

                        // 图片点击时，隐藏toolbar
                        $img.click(function (e) {
                            hide();
                        });

                        if ($img.hasClass('clicked')) {
                            // 图片还处于clicked状态，则不显示toolbar
                            return;
                        }
                    }

                    // 显示toolbar
                    show();
                }, 500);
            }).on('mouseleave', 'a', function (e) {
                // 延时 500ms 隐藏toolbar
                if (hideTimeoutId) {
                    clearTimeout(hideTimeoutId);
                }
                hideTimeoutId = setTimeout(hide, 500);
            }).on('click keydown scroll', function (e) {
                setTimeout(hide, 100);
            });
            // $toolbar 绑定事件
            $toolbar.on('mouseenter', function (e) {
                // 先中断掉 $txt.mouseleave 导致的隐藏
                if (hideTimeoutId) {
                    clearTimeout(hideTimeoutId);
                }
            }).on('mouseleave', function (e) {
                // 延时 500ms 显示toolbar
                if (showTimeoutIdByToolbar) {
                    clearTimeout(showTimeoutIdByToolbar);
                }
                showTimeoutIdByToolbar = setTimeout(hide, 500);
            });
        });
    });

})();
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // alignleft 菜单
    E.createMenu(function (check) {
        var menuId = 'alignleft';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.alignleft,
            commandName: 'JustifyLeft'
        });

        // 定义 update selected 事件
        menu.updateSelectedEvent = function () {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'p,h1,h2,h3,h4,h5,li', function (elem) {
                var cssText;
                if (elem && elem.style && elem.style.cssText != null) {
                    cssText = elem.style.cssText;
                    if (cssText && /text-align:\s*left;/.test(cssText)) {
                        return true;
                    }
                }
                if ($(elem).attr('align') === 'left') {
                    // ff 中，设置align-left之后，会是 <p align="left">xxx</p>
                    return true;
                }
                return false;
            });
            if (rangeElem) {
                return true;
            }
            return false;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-align-left"></i></a>',
            selected: '.selected'
        };
    });

    // aligncenter 菜单
    E.createMenu(function (check) {
        var menuId = 'aligncenter';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.aligncenter,
            commandName: 'JustifyCenter'
        });

        // 定义 update selected 事件
        menu.updateSelectedEvent = function () {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'p,h1,h2,h3,h4,h5,li', function (elem) {
                var cssText;
                if (elem && elem.style && elem.style.cssText != null) {
                    cssText = elem.style.cssText;
                    if (cssText && /text-align:\s*center;/.test(cssText)) {
                        return true;
                    }
                }
                if ($(elem).attr('align') === 'center') {
                    // ff 中，设置align-center之后，会是 <p align="center">xxx</p>
                    return true;
                }
                return false;
            });
            if (rangeElem) {
                console.log('不肯把')
                return true;
            }
            return false;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-align-center"></i></a>',
            selected: '.selected'
        };

    });

    // alignright 菜单
    E.createMenu(function (check) {
        var menuId = 'alignright';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.alignright,
            commandName: 'JustifyRight'
        });

        // 定义 update selected 事件
        menu.updateSelectedEvent = function () {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'p,h1,h2,h3,h4,h5,li', function (elem) {
                var cssText;
                if (elem && elem.style && elem.style.cssText != null) {
                    cssText = elem.style.cssText;
                    if (cssText && /text-align:\s*right;/.test(cssText)) {
                        return true;
                    }
                }
                if ($(elem).attr('align') === 'right') {
                    // ff 中，设置align-right之后，会是 <p align="right">xxx</p>
                    return true;
                }
                return false;
            });
            if (rangeElem) {
                return true;
            }
            return false;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-align-right"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // bold菜单
    E.createMenu(function (check) {
        var menuId = 'bold';
        if (!check(menuId)) {
            return;
        }

        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.bold,
            commandName: 'Bold'
        });

        // 定义选中状态下的click事件
        menu.clickEventSelected = function (e) {
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'Bold');
            } else {
                // 如果选区没有内容
                console.log('呵呵');
                editor.commandForElem('b,strong,h1,h2,h3,h4,h5', e, 'Bold');
            }
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-bold"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // 表情包
    E.config.emotionsShow = 'icon'; // 显示项，默认为'icon'，也可以配置成'value'
    E.config.emotions = {
        // 'default': {
        //     title: '默认',
        //     data: './emotions.data'
        // },
        'weibo': {
            title: '微博表情',
            data: [
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/7a/shenshou_thumb.gif',
                    value: '[草泥马]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/60/horse2_thumb.gif',
                    value: '[神马]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/bc/fuyun_thumb.gif',
                    value: '[浮云]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/c9/geili_thumb.gif',
                    value: '[给力]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/f2/wg_thumb.gif',
                    value: '[围观]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/70/vw_thumb.gif',
                    value: '[威武]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/6e/panda_thumb.gif',
                    value: '[熊猫]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/81/rabbit_thumb.gif',
                    value: '[兔子]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/bc/otm_thumb.gif',
                    value: '[奥特曼]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/15/j_thumb.gif',
                    value: '[囧]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/89/hufen_thumb.gif',
                    value: '[互粉]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/c4/liwu_thumb.gif',
                    value: '[礼物]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/ac/smilea_thumb.gif',
                    value: '[呵呵]'
                },
                {
                    icon: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/0b/tootha_thumb.gif',
                    value: '[哈哈]'
                }
            ]
        }
    };

    // emotion 菜单
    E.createMenu(function (check) {
        var menuId = 'emotion';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var config = editor.config;
        var lang = config.lang;
        var configEmotions = config.emotions;
        var emotionsShow = config.emotionsShow;

        // 记录每一个表情图片的地址
        editor.emotionUrls = [];

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.emotion
        });

        // 添加表情图片的函数
        function insertEmotionImgs(data, $tabContent) {
            // 添加表情图片
            $.each(data, function (k, emotion) {
                var src = emotion.icon || emotion.url;
                var value = emotion.value || emotion.title;
                // 通过配置 editor.config.emotionsShow 的值来修改插入到编辑器的内容（图片/value）
                var commandValue = emotionsShow === 'icon' ? src : value;
                var $command = $('<a href="#" commandValue="' + commandValue + '"></a>');
                var $img = $('<img>');
                $img.attr('_src', src);  // 先将 src 复制到 '_src' 属性，先不加载

                $command.append($img);
                $tabContent.append($command);

                // 记录下每一个表情图片的地址
                editor.emotionUrls.push(src);
            });
        }

        // 拼接 dropPanel 内容
        var $panelContent = $('<div class="panel-tab"></div>');
        var $tabContainer = $('<div class="tab-container"></div>');
        var $contentContainer = $('<div class="content-container emotion-content-container"></div>');
        $.each(configEmotions, function (k, emotion) {
            var title = emotion.title;
            var data = emotion.data;

            E.log('正在处理 ' + title + ' 表情的数据...');

            // 增加该组表情的tab和content
            var $tab = $('<a href="#">' + title +' </a>');
            $tabContainer.append($tab);
            var $tabContent = $('<div class="content"></div>');
            $contentContainer.append($tabContent);

            // tab 切换事件
            $tab.click(function (e) {
                $tabContainer.children().removeClass('selected');
                $contentContainer.children().removeClass('selected');
                $tabContent.addClass('selected');
                $tab.addClass('selected');
                e.preventDefault();
            });

            // 处理data
            if (typeof data === 'string') {
                // url 形式，需要通过ajax从该url获取数据
                E.log('将通过 ' + data + ' 地址ajax下载表情包');
                $.get(data, function (result) {
                    result = $.parseJSON(result);
                    E.log('下载完毕，得到 ' + result.length + ' 个表情');
                    insertEmotionImgs(result, $tabContent);
                });

            } else if ( Object.prototype.toString.call(data).toLowerCase().indexOf('array') > 0 ) {
                // 数组，即 data 直接就是表情包数据
                insertEmotionImgs(data, $tabContent);
            } else {
                // 其他情况，data格式不对
                E.error('data 数据格式错误，请修改为正确格式');
                return;
            }
        });
        $panelContent.append($tabContainer).append($contentContainer);

        // 默认显示第一个tab
        $tabContainer.children().first().addClass('selected');
        $contentContainer.children().first().addClass('selected');

        // 插入表情command事件
        $contentContainer.on('click', 'a[commandValue]', function (e) {
            var $a = $(e.currentTarget);
            var commandValue = $a.attr('commandValue');
            var img;

            // commandValue 有可能是图片url，也有可能是表情的 value，需要区别对待

            if (emotionsShow === 'icon') {
                // 插入图片
                editor.command(e, 'InsertImage', commandValue);
            } else {
                // 插入value
                editor.command(e, 'insertHtml', '<span>' + commandValue + '</span>');
            }

            e.preventDefault();
        });

        // 添加panel
        menu.dropPanel = new E.DropPanel(editor, menu, {
            $content: $panelContent,
            width: 350
        });

        // 定义click事件（异步加载表情图片）
        menu.clickEvent = function (e) {
            var menu = this;
            var dropPanel = menu.dropPanel;

            // -------------隐藏-------------
            if (dropPanel.isShowing) {
                dropPanel.hide();
                return;
            }

            // -------------显示-------------
            dropPanel.show();

            // 异步加载图片
            if (menu.imgLoaded) {
                return;
            }
            $contentContainer.find('img').each(function () {
                var $img = $(this);
                var _src = $img.attr('_src');
                $img.on('error', function () {
                    E.error('加载不出表情图片 ' + _src);
                });
                $img.attr('src', _src);
                $img.removeAttr('_src');
            });
            menu.imgLoaded = true;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-smile"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // eraser 菜单
    E.createMenu(function (check) {
        var menuId = 'eraser';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.eraser,
            commandName: 'RemoveFormat'
        });

        // 定义点击事件
        menu.clickEvent = function (e) {
            var isRangeEmpty = editor.isRangeEmpty();

            if (!isRangeEmpty) {
                // 选区不是空的，则执行默认命令
                editor.command(e, 'RemoveFormat');
                return;
            }

            var $clearElem;

            // 自定义的命令函数
            function commandFn() {
                var editor = this;
                var rangeElem;
                var pElem, $pElem;
                var quoteElem, $quoteElem;
                var listElem, $listElem;

                // 获取选区 elem
                rangeElem = editor.getRangeElem();
                // 第一步，获取 quote 父元素
                quoteElem = editor.getSelfOrParentByName(rangeElem, 'blockquote');
                if (quoteElem) {
                    $quoteElem = $(quoteElem);
                    $clearElem = $('<p>' + $quoteElem.text() + '</p>');
                    $quoteElem.after($clearElem).remove();
                }
                // 第二步，获取 p h 父元素
                pElem = editor.getSelfOrParentByName(rangeElem, 'p,h1,h2,h3,h4,h5');
                if (pElem) {
                    $pElem = $(pElem);
                    $clearElem = $('<p>' + $pElem.text() + '</p>');
                    $pElem.after($clearElem).remove();
                }
                // 第三步，获取list
                listElem = editor.getSelfOrParentByName(rangeElem, 'ul,ol');
                if (listElem) {
                    $listElem = $(listElem);
                    $clearElem = $('<p>' + $listElem.text() + '</p>');
                    $listElem.after($clearElem).remove();
                }
            }

            // 自定义 callback 事件
            function callback() {
                // callback中，设置range为clearElem
                var editor = this;
                if ($clearElem) {
                    editor.restoreSelectionByElem($clearElem.get(0));
                }
            }

            // 执行自定义命令
            editor.customCommand(e, commandFn, callback);
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-eraser"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // 字体
    E.config.familys = [
        '宋体', '黑体', '楷体', '微软雅黑',
        'Arial', 'Verdana', 'Georgia',
        'Times New Roman', 'Microsoft JhengHei',
        'Trebuchet MS', 'Courier New', 'Impact', 'Comic Sans MS', 'Consolas'
    ];

    // 字体 菜单
    E.createMenu(function (check) {
        var menuId = 'fontfamily';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;
        var configFamilys = editor.config.familys;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.fontfamily,
            commandName: 'fontName'
        });

        // 初始化数据
        var data  = {};
        /*
         data 需要的结构
         {
         'commandValue': 'title'
         ...
         }
         */
        $.each(configFamilys, function (k, v) {
            // configFamilys 是数组，data 是对象
            data[v] = v;
        });

        // 创建droplist
        var tpl = '<span style="font-family:{#commandValue};">{#title}</span>';
        menu.dropList = new E.DropList(editor, menu, {
            data: data,
            tpl: tpl,
            selectorForELemCommand: 'font[face]'  // 为了执行 editor.commandForElem 而传入的elem查询方式
        });

        // 定义 update selected 事件
        menu.updateSelectedEvent = function () {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'font[face]');
            if (rangeElem) {
                return true;
            }
            return false;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-font"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // 字号
    E.config.fontsizes = {
        // 格式：'value': 'title'
        1: '12px',
        2: '13px',
        3: '16px',
        4: '18px',
        5: '24px',
        6: '32px',
        7: '48px'
    };

    // 字号 菜单
    E.createMenu(function (check) {
        var menuId = 'fontsize';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;
        var configSize = editor.config.fontsizes;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.fontsize,
            commandName: 'fontSize'
        });

        // 初始化数据
        var data  = configSize;
        /*
         data 需要的结构
         {
         'commandValue': 'title'
         ...
         }
         */

        // 创建droplist
        var tpl = '<span style="font-size:{#title};">{#title}</span>';
        menu.dropList = new E.DropList(editor, menu, {
            data: data,
            tpl: tpl,
            selectorForELemCommand: 'font[size]'  // 为了执行 editor.commandForElem 而传入的elem查询方式
        });

        // 定义 update selected 事件
        menu.updateSelectedEvent = function () {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'font[size]');
            if (rangeElem) {
                return true;
            }
            return false;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-font-size"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // 颜色配置
    E.config.colors = {
        // 'value': 'title'
        '#880000': '暗红色',
        '#800080': '紫色',
        '#ff0000': '红色',
        '#ff00ff': '鲜粉色',
        '#000080': '深蓝色',
        '#0000ff': '蓝色',
        '#00ffff': '湖蓝色',
        '#008080': '蓝绿色',
        '#008000': '绿色',
        '#808000': '橄榄色',
        '#00ff00': '浅绿色',
        '#ffcc00': '橙黄色',
        '#808080': '灰色',
        '#c0c0c0': '银色',
        '#000000': '黑色',
        '#ffffff': '白色'
    };

    E.createMenu(function (check) {
        var menuId = 'forecolor';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;
        var configColors = editor.config.colors;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.forecolor
        });

        // 创建 dropPanel
        var $content = $('<div></div>');
        $.each(configColors, function (k, v) {
            $content.append(
                [
                    '<a href="#" class="color-item"',
                    '    title="' + v + '" commandValue="' + k + '" ',
                    '    style="color: ' + k + '" ',
                    '><i class="icon icon-dot"></i></a>'
                ].join('')
            );
        });
        $content.on('click', 'a[commandValue]', function (e) {
            // 执行命令
            var $elem = $(this);
            var commandValue = $elem.attr('commandValue');

            if (menu.selected && editor.isRangeEmpty()) {
                // 当前处于选中状态，并且选中内容为空
                editor.commandForElem('font[color]', e, 'forecolor', commandValue);
            } else {
                // 当前未处于选中状态，或者有选中内容。则执行默认命令
                editor.command(e, 'forecolor', commandValue);
            }
        });
        menu.dropPanel = new E.DropPanel(editor, menu, {
            $content: $content,
            width: 125
        });

        // 定义 update selected 事件
        menu.updateSelectedEvent = function () {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'font[color]');
            if (rangeElem) {
                return true;
            }
            return false;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-font-color"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // head 菜单
    E.createMenu(function (check) {
        var menuId = 'head';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.head,
            commandName: 'formatBlock'
        });

        // 初始化数据
        var data  = {
            '<h1>': '标题1',
            '<h2>': '标题2',
            '<h3>': '标题3',
            '<h4>': '标题4',
            '<h5>': '标题5'
        };

        var isOrderedList;
        function beforeEvent(e) {
            if (editor.queryCommandState('InsertOrderedList')) {
                isOrderedList = true;

                // 先取消有序列表
                editor.command(e, 'InsertOrderedList');
            } else {
                isOrderedList = false;
            }
        }

        function afterEvent(e) {
            if (isOrderedList) {
                // 再设置有序列表
                editor.command(e, 'InsertOrderedList');
            }
        }

        // 创建droplist
        var tpl = '{#commandValue}{#title}';
        menu.dropList = new E.DropList(editor, menu, {
            data: data,
            tpl: tpl,
            // 对 ol 直接设置 head，会出现每个 li 的 index 都变成 1 的问题，因此要先取消 ol，然后设置 head，最后再增加上 ol
            beforeEvent: beforeEvent,
            afterEvent: afterEvent
        });

        // 定义 update selected 事件
        menu.updateSelectedEvent = function () {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'h1,h2,h3,h4,h5');
            if (rangeElem) {
                return true;
            }
            return false;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-head"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 编辑器区域 img toolbar插件
 */
;(function ($) {

    var E = window.EDITOR;

    if (E.userAgent.indexOf('MSIE 8') > 0) {
        return;
    }

    E.plugin(function () {
        var editor = this;
        var lang = editor.config.lang;
        var txt = editor.txt;
        var $txt = txt.$txt;
        // 说明：设置了 max-height 之后，$txt.parent() 负责滚动处理
        var $currentTxt = editor.useMaxHeight ? $txt.parent() : $txt;
        var $editorContainer = editor.$editorContainer;
        var $currentImg;
        var currentLink = '';

        // 用到的dom节点
        var isRendered = false;
        var $dragPoint = $('<div class="img-drag-point"></div>');

        var $toolbar = $('<div class="txt-toolbar"></div>');
        var $triangle = $('<div class="tip-triangle"></div>');

        var $menuContainer = $('<div></div>');
        var $delete = $('<a href="#"><i class="icon icon-trash"></i></a>');
        var $zoomSmall = $('<a href="#"><i class="icon icon-search-minus"></i></a>');
        var $zoomBig = $('<a href="#"><i class="icon icon-search-plus"></i></a>');
        // var $floatLeft = $('<a href="#"><i class="icon icon-align-left"></i></a>');
        // var $noFloat = $('<a href="#"><i class="icon icon-align-center"></i></a>');
        // var $floatRight = $('<a href="#"><i class="icon icon-align-right"></i></a>');
        var $alignLeft = $('<a href="#"><i class="icon icon-align-left"></i></a>');
        var $alignCenter = $('<a href="#"><i class="icon icon-align-center"></i></a>');
        var $alignRight = $('<a href="#"><i class="icon icon-align-right"></i></a>');
        var $link = $('<a href="#"><i class="icon icon-link"></i></a>');
        var $unLink = $('<a href="#"><i class="icon icon-unlink"></i></a>');

        var $linkInputContainer = $('<div style="display:none;"></div>');
        var $linkInput = $('<input type="text" style="height:26px; margin-left:10px; width:200px;"/>');
        var $linkBtnSubmit = $('<button class="right">' + lang.submit + '</button>');
        var $linkBtnCancel = $('<button class="right gray">' + lang.cancel + '</button>');

        // 记录是否正在拖拽
        var isOnDrag = false;

        // 获取 / 设置 链接
        function imgLink(e, url) {
            if (!$currentImg) {
                return;
            }
            var commandFn;
            var callback = function () {
                // 及时保存currentLink
                if (url != null) {
                    currentLink = url;
                }
            };
            var $link;
            var inLink = false;
            var $parent = $currentImg.parent();
            if ($parent.get(0).nodeName.toLowerCase() === 'a') {
                // 父元素就是图片链接
                $link = $parent;
                inLink = true;
            } else {
                // 父元素不是图片链接，则重新创建一个链接
                $link = $('<a target="_blank"></a>');
            }

            if (url == null) {
                // url 无值，是获取链接
                return $link.attr('href') || '';
            } else if (url === '') {
                // url 是空字符串，是取消链接
                if (inLink) {
                    commandFn = function () {
                        $currentImg.unwrap();
                    };
                }
            } else {
                // url 有值，是设置链接
                if (url === currentLink) {
                    return;
                }
                commandFn = function () {
                    $link.attr('href', url);

                    if (!inLink) {
                        // 当前图片未包含在链接中，则包含进来
                        $currentImg.wrap($link);
                    }
                };
            }

            // 执行命令
            if (commandFn) {
                editor.customCommand(e, commandFn, callback);
            }
        }

        // 渲染到页面
        function render() {
            if (isRendered) {
                return;
            }

            // 绑定事件
            bindToolbarEvent();
            bindDragEvent();

            // 菜单放入 container
            $menuContainer.append($delete)
                .append($zoomSmall)
                .append($zoomBig)
                // .append($floatLeft)
                // .append($noFloat)
                // .append($floatRight);
                .append($alignLeft)
                .append($alignCenter)
                .append($alignRight)
                .append($link)
                .append($unLink);

            // 链接input放入container
            $linkInputContainer.append($linkInput)
                .append($linkBtnCancel)
                .append($linkBtnSubmit);

            // 拼接 渲染到页面上
            $toolbar.append($triangle)
                .append($menuContainer)
                .append($linkInputContainer);

            editor.$editorContainer.append($toolbar).append($dragPoint);
            isRendered = true;
        }

        // 绑定toolbar事件
        function bindToolbarEvent() {
            // 统一执行命令的方法
            var commandFn;
            function customCommand(e, callback) {
                if (commandFn) {
                    editor.customCommand(e, commandFn, callback);
                }
            }

            // 删除
            $delete.click(function (e) {
                // 删除之前先unlink
                imgLink(e, '');

                // 删除图片
                commandFn = function () {
                    $currentImg.remove();
                };
                customCommand(e, function () {
                    setTimeout(hide, 100);
                });
            });

            // 放大
            $zoomBig.click(function (e) {
                commandFn = function () {
                    var img = $currentImg.get(0);
                    var width = img.width;
                    var height = img.height;
                    width = width * 1.1;
                    height = height * 1.1;

                    $currentImg.css({
                        width: width + 'px',
                        height: height + 'px'
                    });
                };
                customCommand(e, function () {
                    setTimeout(show);
                });
            });

            // 缩小
            $zoomSmall.click(function (e) {
                commandFn = function () {
                    var img = $currentImg.get(0);
                    var width = img.width;
                    var height = img.height;
                    width = width * 0.9;
                    height = height * 0.9;

                    $currentImg.css({
                        width: width + 'px',
                        height: height + 'px'
                    });
                };
                customCommand(e, function () {
                    setTimeout(show);
                });
            });

            // // 左浮动
            // $floatLeft.click(function (e) {
            //     commandFn = function () {
            //         $currentImg.css({
            //             float: 'left'
            //         });
            //     };
            //     customCommand(e, function () {
            //         setTimeout(hide, 100);
            //     });
            // });

            // alignLeft
            $alignLeft.click(function (e) {
                commandFn = function () {
                    // 如果 img 增加了链接，那么 img.parent() 就是 a 标签，设置 align 没用的，因此必须找到 P 父节点来设置 align
                    $currentImg.parents('p').css({
                        'text-align': 'left'
                    }).attr('align', 'left');
                };
                customCommand(e, function () {
                    setTimeout(hide, 100);
                });
            });

            // // 右浮动
            // $floatRight.click(function (e) {
            //     commandFn = function () {
            //         $currentImg.css({
            //             float: 'right'
            //         });
            //     };
            //     customCommand(e, function () {
            //         setTimeout(hide, 100);
            //     });
            // });

            // alignRight
            $alignRight.click(function (e) {
                commandFn = function () {
                    // 如果 img 增加了链接，那么 img.parent() 就是 a 标签，设置 align 没用的，因此必须找到 P 父节点来设置 align
                    $currentImg.parents('p').css({
                        'text-align': 'right'
                    }).attr('align', 'right');
                };
                customCommand(e, function () {
                    setTimeout(hide, 100);
                });
            });

            // // 无浮动
            // $noFloat.click(function (e) {
            //     commandFn = function () {
            //         $currentImg.css({
            //             float: 'none'
            //         });
            //     };
            //     customCommand(e, function () {
            //         setTimeout(hide, 100);
            //     });
            // });

            // alignCenter
            $alignCenter.click(function (e) {
                commandFn = function () {
                    // 如果 img 增加了链接，那么 img.parent() 就是 a 标签，设置 align 没用的，因此必须找到 P 父节点来设置 align
                    $currentImg.parents('p').css({
                        'text-align': 'center'
                    }).attr('align', 'center');
                };
                customCommand(e, function () {
                    setTimeout(hide, 100);
                });
            });

            // link
            // 显示链接input
            $link.click(function (e) {
                e.preventDefault();

                // 获取当前链接，并显示
                currentLink = imgLink(e);
                $linkInput.val(currentLink);

                $menuContainer.hide();
                $linkInputContainer.show();
            });
            // 设置链接
            $linkBtnSubmit.click(function (e) {
                e.preventDefault();

                var url = $.trim($linkInput.val());
                if (url) {
                    // 设置链接，同时会自动更新 currentLink 的值
                    imgLink(e, url);
                }

                // 隐藏 toolbar
                setTimeout(hide);
            });
            // 取消设置链接
            $linkBtnCancel.click(function (e) {
                e.preventDefault();

                // 重置链接 input
                $linkInput.val(currentLink);

                $menuContainer.show();
                $linkInputContainer.hide();
            });

            // unlink
            $unLink.click(function (e) {
                e.preventDefault();

                // 执行 unlink
                imgLink(e, '');

                // 隐藏 toolbar
                setTimeout(hide);
            });
        }

        // 绑定drag事件
        function bindDragEvent() {
            var _x, _y;
            var dragMarginLeft, dragMarginTop;
            var imgWidth, imgHeight;

            function mousemove (e) {
                var diffX, diffY;

                // 计算差额
                diffX = e.pageX - _x;
                diffY = e.pageY - _y;

                // --------- 计算拖拽点的位置 ---------
                var currentDragMarginLeft = dragMarginLeft + diffX;
                var currentDragMarginTop = dragMarginTop + diffY;
                $dragPoint.css({
                    'margin-left': currentDragMarginLeft,
                    'margin-top': currentDragMarginTop
                });

                // --------- 计算图片的大小 ---------
                var currentImgWidth = imgWidth + diffX;
                var currentImggHeight = imgHeight + diffY;
                $currentImg && $currentImg.css({
                    width: currentImgWidth,
                    height: currentImggHeight
                });
            }

            $dragPoint.on('mousedown', function(e){
                if (!$currentImg) {
                    return;
                }
                // 当前鼠标位置
                _x = e.pageX;
                _y = e.pageY;

                // 当前拖拽点的位置
                dragMarginLeft = parseFloat($dragPoint.css('margin-left'), 10);
                dragMarginTop = parseFloat($dragPoint.css('margin-top'), 10);

                // 当前图片的大小
                imgWidth = $currentImg.width();
                imgHeight = $currentImg.height();

                // 隐藏 $toolbar
                $toolbar.hide();

                // 绑定计算事件
                E.$document.on('mousemove._dragResizeImg', mousemove);
                E.$document.on('mouseup._dragResizeImg', function (e) {
                    // 取消绑定
                    E.$document.off('mousemove._dragResizeImg');
                    E.$document.off('mouseup._dragResizeImg');

                    // 隐藏，并还原拖拽点的位置
                    hide();
                    $dragPoint.css({
                        'margin-left': dragMarginLeft,
                        'margin-top': dragMarginTop
                    });

                    // 记录
                    isOnDrag = false;
                });

                // 记录
                isOnDrag = true;
            });
        }

        // 显示 toolbar
        function show() {
            if (editor._disabled) {
                // 编辑器已经被禁用，则不让显示
                return;
            }
            if ($currentImg == null) {
                return;
            }
            $currentImg.addClass('clicked');
            var imgPosition = $currentImg.position();
            var imgTop = imgPosition.top;
            var imgLeft = imgPosition.left;
            var imgHeight = $currentImg.outerHeight();
            var imgWidth = $currentImg.outerWidth();


            // --- 定位 dragpoint ---
            $dragPoint.css({
                top: imgTop + imgHeight,
                left: imgLeft + imgWidth
            });

            // --- 定位 toolbar ---

            // 计算初步结果
            var top = imgTop + imgHeight;
            var left = imgLeft;
            var marginLeft = 0;

            var txtTop = $currentTxt.position().top;
            var txtHeight = $currentTxt.outerHeight();
            if (top > (txtTop + txtHeight)) {
                // top 不得超出编辑范围
                top = txtTop + txtHeight;
            } else {
                // top 超出编辑范围，dragPoint就不显示了
                $dragPoint.show();
            }

            // 显示（方便计算 margin）
            $toolbar.show();

            // 计算 margin
            var width = $toolbar.outerWidth();
            marginLeft = imgWidth / 2 - width / 2;

            // 定位
            $toolbar.css({
                top: top + 5,
                left: left,
                'margin-left': marginLeft
            });
            // 如果定位太靠左了
            if (marginLeft < 0) {
                // 得到三角形的margin-left
                $toolbar.css('margin-left', '0');
                $triangle.hide();
            } else {
                $triangle.show();
            }

            // disable 菜单
            editor.disableMenusExcept();
        }

        // 隐藏 toolbar
        function hide() {
            if ($currentImg == null) {
                return;
            }
            $currentImg.removeClass('clicked');
            $currentImg = null;

            $toolbar.hide();
            $dragPoint.hide();

            // enable 菜单
            editor.enableMenusExcept();
        }

        // 判断img是否是一个表情
        function isEmotion(imgSrc) {
            var result = false;
            if (!editor.emotionUrls) {
                return result;
            }
            $.each(editor.emotionUrls, function (index, url) {
                var flag = false;
                if (imgSrc === url) {
                    result = true;
                    flag = true;
                }
                if (flag) {
                    return false;  // break 循环
                }
            });
            return result;
        }

        // click img 事件
        $currentTxt.on('mousedown', 'img', function (e) {
            e.preventDefault();
        }).on('click', 'img', function (e) {
            var $img = $(e.currentTarget);
            var src = $img.attr('src');

            // 如果是表情图标则不处理
            if (!src || isEmotion(src)) {
                return;
            }

            // 渲染
            render();

            if ($currentImg && ($currentImg.get(0) === $img.get(0))) {
                setTimeout(hide, 100);
                return;
            }

            // 显示 toolbar
            $currentImg = $img;
            show();

            // 默认显示menuContainer，其他默认隐藏
            $menuContainer.show();
            $linkInputContainer.hide();

            // 阻止冒泡
            e.preventDefault();
            e.stopPropagation();

        }).on('click keydown scroll', function (e) {
            if (!isOnDrag) {
                setTimeout(hide, 100);
            }
        });

    });


}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // link 菜单
    E.createMenu(function (check) {
        var menuId = 'link';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.link
        });

        // 创建 dropPanel
        var $content = $('<div></div>');
        var $div1 = $('<div style="margin:20px 10px;" class="clearfix"></div>');
        var $div2 = $div1.clone();
        var $div3 = $div1.clone().css('margin', '0 10px');
        var $textInput = $('<input type="text" class="block" placeholder="' + lang.text + '"/>');
        var $urlInput = $('<input type="text" class="block" placeholder="' + lang.link + '"/>');
        var $btnSubmit = $('<button class="right">' + lang.submit + '</button>');
        var $btnCancel = $('<button class="right gray">' + lang.cancel + '</button>');

        $div1.append($textInput);
        $div2.append($urlInput);
        $div3.append($btnSubmit).append($btnCancel);
        $content.append($div1).append($div2).append($div3);

        menu.dropPanel = new E.DropPanel(editor, menu, {
            $content: $content,
            width: 300
        });

        // 定义click事件
        menu.clickEvent = function (e) {
            var menu = this;
            var dropPanel = menu.dropPanel;

            // -------------隐藏----------------
            if (dropPanel.isShowing) {
                dropPanel.hide();
                return;
            }

            // -------------显示----------------

            // 重置 input
            $textInput.val('');
            $urlInput.val('http://');

            // 获取url
            var url = '';
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'a');
            if (rangeElem) {
                url = rangeElem.href || '';
            }

            // 获取 text
            var text = '';
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 选区不是空
                text = editor.getRangeText() || '';
            } else if (rangeElem) {
                // 如果选区空，并且在 a 标签之内
                text = rangeElem.textContent || rangeElem.innerHTML;
            }

            // 设置 url 和 text
            url && $urlInput.val(url);
            text && $textInput.val(text);

            // 如果有选区内容，textinput 不能修改
            if (!isRangeEmpty) {
                $textInput.attr('disabled', true);
            } else {
                $textInput.removeAttr('disabled');
            }

            // 显示（要设置好了所有input的值和属性之后再显示）
            dropPanel.show();
        };

        // 定义 update selected 事件
        menu.updateSelectedEvent = function () {
            var rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'a');
            if (rangeElem) {
                return true;
            }
            return false;
        };

        // 『取消』 按钮
        $btnCancel.click(function (e) {
            e.preventDefault();
            menu.dropPanel.hide();
        });

        // 『确定』按钮
        $btnSubmit.click(function (e) {
            e.preventDefault();
            var rangeElem = editor.getRangeElem();
            var targetElem = editor.getSelfOrParentByName(rangeElem, 'a');
            var isRangeEmpty = editor.isRangeEmpty();

            var $linkElem, linkHtml;
            var commandFn, callback;
            var $txt = editor.txt.$txt;
            var $oldLinks, $newLinks;
            var uniqId = 'link' + E.random();

            // 获取数据
            var url = $.trim($urlInput.val());
            var text = $.trim($textInput.val());

            if (!url) {
                menu.dropPanel.focusFirstInput();
                return;
            }
            if (!text) {
                text = url;
            }

            if (!isRangeEmpty) {
                // 选中区域有内容，则执行默认命令

                // 获取目前 txt 内所有链接，并为当前链接做一个标记
                $oldLinks = $txt.find('a');
                $oldLinks.attr(uniqId, '1');

                // 执行命令
                editor.command(e, 'createLink', url);

                // 去的没有标记的链接，即刚刚插入的链接
                $newLinks = $txt.find('a').not('[' + uniqId + ']');
                $newLinks.attr('target', '_blank'); // 增加 _blank

                // 去掉之前做的标记
                $oldLinks.removeAttr(uniqId);

            } else if (targetElem) {
                // 无选中区域，在 a 标签之内，修改该 a 标签的内容和链接
                $linkElem = $(targetElem);
                commandFn = function () {
                    $linkElem.attr('href', url);
                    $linkElem.text(text);
                };
                callback = function () {
                    var editor = this;
                    editor.restoreSelectionByElem(targetElem);
                };
                // 执行命令
                editor.customCommand(e, commandFn, callback);
            } else {
                // 无选中区域，不在 a 标签之内，插入新的链接

                linkHtml = '<a href="' + url + '" target="_blank">' + text + '</a>';
                if (E.userAgent.indexOf('Firefox') > 0) {
                    linkHtml += '<span>&nbsp;</span>';
                }
                editor.command(e, 'insertHtml', linkHtml);
            }

        });

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-link"></i></a>',
            selected: '.selected'
        };
    });

    // unlink 菜单
    E.createMenu(function (check) {
        var menuId = 'unlink';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.unlink,
            commandName: 'unLink'
        });

        // click 事件
        menu.clickEvent = function  (e) {
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 有选中区域，或者IE8，执行默认命令
                editor.command(e, 'unLink');
                return;
            }

            // 无选中区域...

            var rangeElem = editor.getRangeElem();
            var aElem = editor.getSelfOrParentByName(rangeElem, 'a');
            if (!aElem) {
                // 不在 a 之内，返回
                e.preventDefault();
                return;
            }

            // 在 a 之内
            var $a = $(aElem);
            var $span = $('<span>' + $a.text() + '</span>');
            function commandFn() {
                $a.after($span).remove();
            }
            function callback() {
                editor.restoreSelectionByElem($span.get(0));
            }
            editor.customCommand(e, commandFn, callback);
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-unlink"></i></a>',
            selected: '.selected'
        };
    });


}(jQuery));
/**
 * 编辑器区域 table toolbar
 */
;(function ($) {

    var E = window.EDITOR;

    E.plugin(function () {
        var editor = this;
        var txt = editor.txt;
        var $txt = txt.$txt;
        // 说明：设置了 max-height 之后，$txt.parent() 负责滚动处理
        var $currentTxt = editor.useMaxHeight ? $txt.parent() : $txt;
        var $currentTable;

        // 用到的dom节点
        var isRendered = false;
        var $toolbar = $('<div class="txt-toolbar"></div>');
        var $triangle = $('<div class="tip-triangle"></div>');
        var $delete = $('<a href="#"><i class="icon icon-trash"></i></a>');
        var $zoomSmall = $('<a href="#"><i class="icon icon-search-minus"></i></a>');
        var $zoomBig = $('<a href="#"><i class="icon icon-search-plus"></i></a>');

        // 渲染到页面
        function render() {
            if (isRendered) {
                return;
            }

            // 绑定事件
            bindEvent();

            // 拼接 渲染到页面上
            $toolbar.append($triangle)
                .append($delete)
                .append($zoomSmall)
                .append($zoomBig);
            editor.$editorContainer.append($toolbar);
            isRendered = true;
        }

        // 绑定事件
        function bindEvent() {
            // 统一执行命令的方法
            var commandFn;
            function command(e, callback) {
                if (commandFn) {
                    editor.customCommand(e, commandFn, callback);
                }
            }

            // 删除
            $delete.click(function (e) {
                commandFn = function () {
                    $currentTable.remove();
                };
                command(e, function () {
                    setTimeout(hide, 100);
                });
            });

            // 放大
            $zoomBig.click(function (e) {
                commandFn = function () {
                    $currentTable.css({
                        width: '100%'
                    });
                };
                command(e, function () {
                    setTimeout(show);
                });
            });

            // 缩小
            $zoomSmall.click(function (e) {
                commandFn = function () {
                    $currentTable.css({
                        width: 'auto'
                    });
                };
                command(e, function () {
                    setTimeout(show);
                });
            });
        }

        // 显示 toolbar
        function show() {
            if (editor._disabled) {
                // 编辑器已经被禁用，则不让显示
                return;
            }
            if ($currentTable == null) {
                return;
            }
            $currentTable.addClass('clicked');
            var tablePosition = $currentTable.position();
            var tableTop = tablePosition.top;
            var tableLeft = tablePosition.left;
            var tableHeight = $currentTable.outerHeight();
            var tableWidth = $currentTable.outerWidth();

            // --- 定位 toolbar ---

            // 计算初步结果
            var top = tableTop + tableHeight;
            var left = tableLeft;
            var marginLeft = 0;

            var txtTop = $currentTxt.position().top;
            var txtHeight = $currentTxt.outerHeight();
            if (top > (txtTop + txtHeight)) {
                // top 不得超出编辑范围
                top = txtTop + txtHeight;
            }

            // 显示（方便计算 margin）
            $toolbar.show();

            // 计算 margin
            var width = $toolbar.outerWidth();
            marginLeft = tableWidth / 2 - width / 2;

            // 定位
            $toolbar.css({
                top: top + 5,
                left: left,
                'margin-left': marginLeft
            });
            // 如果定位太靠左了
            if (marginLeft < 0) {
                // 得到三角形的margin-left
                $toolbar.css('margin-left', '0');
                $triangle.hide();
            } else {
                $triangle.show();
            }
        }

        // 隐藏 toolbar
        function hide() {
            if ($currentTable == null) {
                return;
            }
            $currentTable.removeClass('clicked');
            $currentTable = null;
            $toolbar.hide();
        }

        // click table 事件
        $currentTxt.on('click', 'table', function (e) {
            var $table = $(e.currentTarget);

            // 渲染
            render();

            if ($currentTable && ($currentTable.get(0) === $table.get(0))) {
                setTimeout(hide, 100);
                return;
            }

            // 显示 toolbar
            $currentTable = $table;
            show();

            // 阻止冒泡
            e.preventDefault();
            e.stopPropagation();

        }).on('click keydown scroll', function (e) {
            setTimeout(hide, 100);
        });
        E.$body.on('click keydown scroll', function (e) {
            setTimeout(hide, 100);
        });
    });
}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // 缩进 菜单插件
    E.createMenu(function (check) {

        // 定义菜单id，不要和其他菜单id重复。编辑器自带的所有菜单id，可通过『参数配置-自定义菜单』一节查看
        var menuId = 'indent';

        // check将检查菜单配置（『参数配置-自定义菜单』一节描述）中是否该菜单id，如果没有，则忽略下面的代码。
        if (!check(menuId)) {
            return;
        }

        // this 指向 editor 对象自身
        var editor = this;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,  // 编辑器对象
            id: menuId,  // 菜单id
            title: '缩进', // 菜单标题

            // 正常状态和选中装下的dom对象，样式需要自定义
            $domNormal: $('<a href="#" tabindex="-1"><i class="icon icon-indent"></i></a>'),
            $domSelected: $('<a href="#" tabindex="-1" class="selected"><i class="icon icon-indent"></i></a>')
        });

        // 菜单正常状态下，点击将触发该事件
        menu.clickEvent = function (e) {
            var elem = editor.getRangeElem();
            var p = editor.getSelfOrParentByName(elem, 'p');
            var $p;

            if (!p) {
                // 未找到 p 元素，则忽略
                return e.preventDefault();
            }
            $p = $(p);

            // 使用自定义命令
            function commandFn() {
                $p.css('text-indent', '2em');
            }
            editor.customCommand(e, commandFn);
        };

        // 菜单选中状态下，点击将触发该事件
        menu.clickEventSelected = function (e) {
            var elem = editor.getRangeElem();
            var p = editor.getSelfOrParentByName(elem, 'p');
            var $p;

            if (!p) {
                // 未找到 p 元素，则忽略
                return e.preventDefault();
            }
            $p = $(p);

            // 使用自定义命令
            function commandFn() {
                $p.css('text-indent', '0');
            }
            editor.customCommand(e, commandFn);
        };

        // 根据当前选区，自定义更新菜单的选中状态或者正常状态
        menu.updateSelectedEvent = function () {
            // 获取当前选区所在的父元素
            var elem = editor.getRangeElem();
            var p = editor.getSelfOrParentByName(elem, 'p');
            var $p;
            var indent;

            if (!p) {
                // 未找到 p 元素，则标记为未处于选中状态
                return false;
            }
            $p = $(p);
            indent = $p.css('text-indent');

            if (!indent || indent === '0px') {
                // 得到的p，text-indent 属性是 0，则标记为未处于选中状态
                return false;
            }

            // 找到 p 元素，并且 text-indent 不是 0，则标记为选中状态
            return true;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // italic 菜单
    E.createMenu(function (check) {
        var menuId = 'italic';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.italic,
            commandName: 'Italic'
        });

        // 定义选中状态下的click事件
        menu.clickEventSelected = function (e) {
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'Italic');
            } else {
                // 如果选区没有内容
                editor.commandForElem('i', e, 'Italic');
            }
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-italic"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // 行高 菜单插件
    // 用 createMenu 方法创建菜单
    E.createMenu(function (check) {

        // 定义菜单id，不要和其他菜单id重复。编辑器自带的所有菜单id，可通过『参数配置-自定义菜单』一节查看
        var menuId = 'lineheight';

        // check将检查菜单配置（『参数配置-自定义菜单』一节描述）中是否该菜单id，如果没有，则忽略下面的代码。
        if (!check(menuId)) {
            return;
        }

        // this 指向 editor 对象自身
        var editor = this;

        // 由于浏览器自身不支持 lineHeight 命令，因此要做一个hook
        editor.commandHooks.lineHeight = function (value) {
            var rangeElem = editor.getRangeElem();
            var targetElem = editor.getSelfOrParentByName(rangeElem, 'p,h1,h2,h3,h4,h5,pre');
            if (!targetElem) {
                return;
            }
            $(targetElem).css('line-height', value + '');
        };

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,  // 编辑器对象
            id: menuId,  // 菜单id
            title: '行高', // 菜单标题
            commandName: 'lineHeight', // 命令名称

            // 正常状态和选中装下的dom对象，样式需要自定义
            $domNormal: $('<a href="#" tabindex="-1"><i class="icon icon-lineheight"></i></a>'),
            $domSelected: $('<a href="#" tabindex="-1" class="selected"><i class="icon-lineheight"></i></a>')
        });

        // 数据源
        var data  = {
            // 格式： 'value' : 'title'
            '1.0': '1.0倍',
            '1.5': '1.5倍',
            '1.8': '1.8倍',
            '2.0': '2.0倍',
            '2.5': '2.5倍',
            '3.0': '3.0倍'
        };

        // 为menu创建droplist对象
        var tpl = '<span style="line-height:{#commandValue}">{#title}</span>';
        menu.dropList = new E.DropList(editor, menu, {
            data: data,  // 传入数据源
            tpl: tpl  // 传入模板
        });

        // 增加到editor对象中
        editor.menus[menuId] = menu;

    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // orderlist 菜单
    E.createMenu(function (check) {
        var menuId = 'orderlist';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.orderlist,
            commandName: 'InsertOrderedList'
        });

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-list-number"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // quote 菜单

    E.createMenu(function (check) {
        var menuId = 'quote';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.quote,
            commandName: 'formatBlock',
            commandValue: 'blockquote'
        });

        // 定义click事件
        menu.clickEvent = function (e) {
            var rangeElem = editor.getRangeElem();
            var $rangeElem;
            if (!rangeElem) {
                e.preventDefault();
                return;
            }
            var currentQuote = editor.getSelfOrParentByName(rangeElem, 'blockquote');
            var $quote;

            if (currentQuote) {
                // 说明当前在quote之内，不做任何处理
                e.preventDefault();
                return;
            }

            rangeElem = editor.getLegalTags(rangeElem);
            $rangeElem = $(rangeElem);

            // 无文字，则不允许执行引用
            if (!$rangeElem.text()) {
                return;
            }


            if (!rangeElem) {
                // 执行默认命令
                // IE8 下执行此处（不过，经测试代码无效，也不报错）
                editor.command(e, 'formatBlock', 'blockquote');
                return;
            }

            // 自定义command事件
            function commandFn() {
                $quote = $('<p>' + $rangeElem.text() + '</p>');
                $rangeElem.after($quote).remove();
                $quote.wrap('<blockquote>');
            }

            // 自定义 callback 事件
            function callback() {
                // callback中，设置range为quote
                var editor = this;
                if ($quote) {
                    editor.restoreSelectionByElem($quote.get(0));
                }
            }

            // 执行自定义命令
            editor.customCommand(e, commandFn, callback);
        };

        // 定义选中状态下的click事件
        menu.clickEventSelected = function (e) {
            var rangeElem;
            var quoteElem;
            var $lastChild;

            // 获取当前选区的elem，并试图往上找 quote 元素
            rangeElem = editor.getRangeElem();
            quoteElem = editor.getSelfOrParentByName(rangeElem, 'blockquote');
            if (!quoteElem) {
                // 没找到，则返回
                e.preventDefault();
                return;
            }

            // 自定义的command事件
            function commandFn() {
                var $quoteElem;
                var $children;

                $quoteElem = $(quoteElem);
                $children = $quoteElem.children();
                if ($children.length) {
                    $children.each(function (k) {
                        var $item = $(this);
                        if ($item.get(0).nodeName === 'P') {
                            $quoteElem.after($item);
                        } else {
                            $quoteElem.after('<p>' + $item.text() + '</p>');
                        }
                        $lastChild = $item;  // 记录最后一个子元素，用于callback中的range定位
                    });
                    $quoteElem.remove();
                    return;
                }
            }

            // 自定义的callback函数
            function callback() {
                // callback中，设置range为lastChild
                var editor = this;
                if ($lastChild) {
                    editor.restoreSelectionByElem($lastChild.get(0));
                }
            }

            // 执行自定义命令
            editor.customCommand(e, commandFn, callback);
        };

        // 定义更新选中状态的事件
        menu.updateSelectedEvent = function () {
            var self = this; //菜单对象
            var editor = self.editor;
            var rangeElem;

            rangeElem = editor.getRangeElem();
            rangeElem = editor.getSelfOrParentByName(rangeElem, 'blockquote');

            if (rangeElem) {
                return true;
            }

            return false;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-quote-left"></i></a>',
            selected: '.selected'
        };

        // --------------- 两次点击 enter 跳出引用 ---------------
        editor.ready(function () {
            var editor = this;
            var $txt = editor.txt.$txt;
            var isPrevEnter = false;  // 是不是刚刚在quote中按了 enter 键
            $txt.on('keydown', function (e) {
                if (e.keyCode !== 13) {
                    // 不是 enter 键
                    isPrevEnter = false;
                    return;
                }

                var rangeElem = editor.getRangeElem();
                rangeElem = editor.getSelfOrParentByName(rangeElem, 'blockquote');
                if (!rangeElem) {
                    // 选区不是 quote
                    isPrevEnter = false;
                    return;
                }

                if (!isPrevEnter) {
                    // 最近没有在qote中按enter键
                    isPrevEnter = true;
                    return;
                }

                var currentRangeElem = editor.getRangeElem();
                var $currentRangeElem = $(currentRangeElem);
                if ($currentRangeElem.length) {
                    $currentRangeElem.parent().after($currentRangeElem);
                }

                // 设置选区
                editor.restoreSelectionByElem(currentRangeElem, 'start');

                isPrevEnter = false;
                // 阻止默认行文
                e.preventDefault();

            });
        }); // editor.ready(

        // --------------- 处理quote中无内容时不能删除的问题 ---------------
        editor.ready(function () {
            var editor = this;
            var $txt = editor.txt.$txt;
            var $rangeElem;

            function commandFn() {
                $rangeElem && $rangeElem.remove();
            }
            function callback() {
                if (!$rangeElem) {
                    return;
                }
                var $prev = $rangeElem.prev();
                if ($prev.length) {
                    // 有 prev 则定位到 prev 最后
                    editor.restoreSelectionByElem($prev.get(0));
                } else {
                    // 无 prev 则初始化选区
                    editor.initSelection();
                }
            }

            $txt.on('keydown', function (e) {
                if (e.keyCode !== 8) {
                    // 不是 backspace 键
                    return;
                }

                var rangeElem = editor.getRangeElem();
                rangeElem = editor.getSelfOrParentByName(rangeElem, 'blockquote');
                if (!rangeElem) {
                    // 选区不是 quote
                    return;
                }
                $rangeElem = $(rangeElem);

                var text = $rangeElem.text();
                if (text) {
                    // quote 中还有内容
                    return;
                }
                editor.customCommand(e, commandFn, callback);

            }); // $txt.on
        }); // editor.ready(
    });


}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // source 菜单
    E.createMenu(function (check) {
        var menuId = 'source';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;
        var txtHtml;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.source
        });

        menu.isShowCode = false;

        // 更新内容
        function updateValue() {
            var $code = menu.$codeTextarea;
            var $txt = editor.txt.$txt;
            var value = $.trim($code.val()); // 取值

            if (!value) {
                value = '<p><br></p>';
            }

            // 过滤js代码
            if (editor.config.jsFilter) {

                value = value.replace(/<script[\s\S]*?<\/script>/ig, '');
            }
            // 赋值
            $txt.html(value);
        }

        // 定义click事件
        menu.clickEvent = function (e) {
            var self = this;
            var editor = self.editor;
            var $txt = editor.txt.$txt;
            var txtOuterHeight = $txt.outerHeight();
            var txtHeight = $txt.height();

            if (!self.$codeTextarea) {
                self.$codeTextarea = $('<textarea class="code-textarea"></textarea>');
            }
            var $code = self.$codeTextarea;
            $code.css({
                height: txtHeight,
                'margin-top': txtOuterHeight - txtHeight
            });

            // 赋值
            $code.val($txt.html());

            // 渲染
            $txt.after($code).hide();
            $code.show();

            // 更新状态
            menu.isShowCode = true;

            // 执行 updateSelected 事件
            this.updateSelected();

            // 禁用其他菜单
            editor.disableMenusExcept('source');

            // 记录当前html值
            txtHtml = $txt.html();
        };

        // 定义选中状态下的click事件
        menu.clickEventSelected = function (e) {
            var self = this;
            var editor = self.editor;
            var $txt = editor.txt.$txt;
            var $code = self.$codeTextarea;
            var value;

            if (!$code) {
                return;
            }

            // 更新内容
            updateValue();

            // 渲染
            $code.after($txt).hide();
            $txt.show();

            // 更新状态
            menu.isShowCode = false;

            // 执行 updateSelected 事件
            this.updateSelected();

            // 启用其他菜单
            editor.enableMenusExcept('source');

            // 判断是否执行 onchange 事件
            if ($txt.html() !== txtHtml) {
                if (editor.onchange && typeof editor.onchange === 'function') {
                    editor.onchange.call(editor);
                }
            }
        };

        // 定义切换选中状态事件
        menu.updateSelectedEvent = function () {
            return this.isShowCode;
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-code"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // strikethrough 菜单
    E.createMenu(function (check) {
        var menuId = 'strikethrough';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.strikethrough,
            commandName: 'StrikeThrough'
        });

        // 定义选中状态下的click事件
        menu.clickEventSelected = function (e) {
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'StrikeThrough');
            } else {
                // 如果选区没有内容
                editor.commandForElem('strike', e, 'StrikeThrough');
            }
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-strikethrough"></i></a>',
            selected: '.selected'
        };
    });


}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // underline菜单
    E.createMenu(function (check) {
        var menuId = 'underline';
        if (!check(menuId)) {
            return;
        }

        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.underline,
            commandName: 'Underline'
        });

        // 定义选中状态下的click事件
        menu.clickEventSelected = function (e) {
            var isRangeEmpty = editor.isRangeEmpty();
            if (!isRangeEmpty) {
                // 如果选区有内容，则执行基础命令
                editor.command(e, 'Underline');
            } else {
                // 如果选区没有内容
                editor.commandForElem('u,a', e, 'Underline');
            }
        };

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus.underline = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-underline"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // 定义扩展函数
    var _e = function (fn) {
        var E = window.EDITOR;
        if (E) {
            // 执行传入的函数
            fn(E, $);
        }
    };

    // undo redo
    _e(function (E, $) {

        var length = 20;  // 缓存的最大长度
        function _getRedoList(editor) {
            if (editor._redoList == null) {
                editor._redoList = [];
            }
            return editor._redoList;
        }
        function _getUndoList(editor) {
            if (editor._undoList == null) {
                editor._undoList = [];
            }
            return editor._undoList;
        }

        // 数据处理
        function _handle(editor, data, type) {
            // var range = data.range;
            // var range2 = range.cloneRange && range.cloneRange();
            var val = data.val;
            var html = editor.txt.$txt.html();

            if(val == null) {
                return;
            }

            if (val === html) {
                if (type === 'redo') {
                    editor.redo();
                    return;
                } else if (type === 'undo') {
                    editor.undo();
                    return;
                } else {
                    return;
                }
            }

            // 保存数据
            editor.txt.$txt.html(val);
            // 更新数据到textarea（有必要的话）
            editor.updateValue();

            // onchange 事件
            if (editor.onchange && typeof editor.onchange === 'function') {
                editor.onchange.call(editor);
            }

            // ?????
            // 注释：$txt 被重新赋值之后，range会被重置，cloneRange() 也不好使
            // // 重置选区
            // if (range2) {
            //     editor.restoreSelection(range2);
            // }
        }

        // 记录
        E.fn.undoRecord = function () {
            var editor = this;
            var $txt = editor.txt.$txt;
            var val = $txt.html();
            var undoList = _getUndoList(editor);
            var redoList = _getRedoList(editor);
            var currentVal = undoList.length ? undoList[0] : '';

            if (val === currentVal.val) {
                return;
            }

            // 清空 redolist
            if (redoList.length) {
                redoList = [];
            }

            // 添加数据到 undoList
            undoList.unshift({
                range: editor.currentRange(),  // 将当前的range也记录下
                val: val
            });

            // 限制 undoList 长度
            if (undoList.length > length) {
                undoList.pop();
            }
        };

        // undo 操作
        E.fn.undo = function () {
            var editor = this;
            var undoList = _getUndoList(editor);
            var redoList = _getRedoList(editor);

            if (!undoList.length) {
                return;
            }

            // 取出 undolist 第一个值，加入 redolist
            var data = undoList.shift();
            redoList.unshift(data);

            // 并修改编辑器的内容
            _handle(this, data, 'undo');
        };

        // redo 操作
        E.fn.redo = function () {
            var editor = this;
            var undoList = _getUndoList(editor);
            var redoList = _getRedoList(editor);
            if (!redoList.length) {
                return;
            }

            // 取出 redolist 第一个值，加入 undolist
            var data = redoList.shift();
            undoList.unshift(data);

            // 并修改编辑器的内容
            _handle(this, data, 'redo');
        };
    });

    // undo 菜单
    _e(function (E, $) {

        E.createMenu(function (check) {
            var menuId = 'undo';
            if (!check(menuId)) {
                return;
            }
            var editor = this;
            var lang = editor.config.lang;

            // 创建 menu 对象
            var menu = new E.Menu({
                editor: editor,
                id: menuId,
                title: lang.undo
            });

            // click 事件
            menu.clickEvent = function (e) {
                editor.undo();
            };

            // 增加到editor对象中
            editor.menus[menuId] = menu;
            E.UI.menus.undo = {
                normal: '<a href="#" tabindex="-1"><i class="icon icon-undo"></i></a>',
                selected: '.selected'
            };

            // ------------ 初始化时、enter 时、打字中断时，做记录 ------------
            // ------------ ctrl + z 是调用记录撤销，而不是使用浏览器默认的撤销 ------------
            editor.ready(function () {
                var editor = this;
                var $txt = editor.txt.$txt;
                var timeoutId;

                // 执行undo记录
                function undo() {
                    editor.undoRecord();
                }

                $txt.on('keydown', function (e) {
                    var keyCode = e.keyCode;

                    // 撤销 ctrl + z
                    if (e.ctrlKey && keyCode === 90) {
                        editor.undo();
                        return;
                    }

                    if (keyCode === 13) {
                        // enter 做记录
                        undo();
                    } else {
                        // keyup 之后 1s 之内不操作，则做一次记录
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        timeoutId = setTimeout(undo, 1000);
                    }
                });

                // 初始化做记录
                editor.undoRecord();
            });
        });

    });
    // redo 菜单
    _e(function (E, $) {

        E.createMenu(function (check) {
            var menuId = 'redo';
            if (!check(menuId)) {
                return;
            }
            var editor = this;
            var lang = editor.config.lang;

            // 创建 menu 对象
            var menu = new E.Menu({
                editor: editor,
                id: menuId,
                title: lang.redo
            });

            // click 事件
            menu.clickEvent = function (e) {
                editor.redo();
            };

            // 增加到editor对象中
            editor.menus[menuId] = menu;
            E.UI.menus[menuId] = {
                normal: '<a href="#" tabindex="-1"><i class="icon icon-redo"></i></a>',
                selected: '.selected'
            };

        });

    });
}(jQuery));
/**
 * 插入地图
 */
;(function ($) {

    var E = window.EDITOR;

    // unorderlist 菜单
    E.createMenu(function (check) {
        var menuId = 'unorderlist';
        if (!check(menuId)) {
            return;
        }
        var editor = this;
        var lang = editor.config.lang;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,
            id: menuId,
            title: lang.unorderlist,
            commandName: 'InsertUnorderedList'
        });

        // 增加到editor对象中
        editor.menus[menuId] = menu;
        E.UI.menus[menuId] = {
            normal: '<a href="#" tabindex="-1"><i class="icon icon-list"></i></a>',
            selected: '.selected'
        };
    });

}(jQuery));