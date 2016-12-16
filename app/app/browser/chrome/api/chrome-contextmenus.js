//const chrome = require('./chrome');

var contextMenus = {

    /**
     * @description create menu
     * @param {Object} createProperties
     * @param {Function} callback
     * @return id
     */
    create: function (createProperties, callback) {
        if (!this.menus) {
            this.menus = [];
        }
        let id = new Date().getTime();
        let contexts = createProperties.contexts || ['all'];

        let item = {
            id: id,
            title: createProperties.title,
            contexts: contexts,
            onclick: createProperties.onclick
        };

        console.log(chrome.curExt.id + '$')
        if (createProperties.parentId) {
            let parentItem = this._getItemById(createProperties.parentId);
            console.log('把柄',parentItem )
            if (parentItem) {
                if (!parentItem.children) {
                    parentItem.children = [];
                }
                parentItem.children.push(item);
            } else {
                console.error(`menu item '${createProperties.title}' parentId ${createProperties.parentId} is error`);
            }

            return id;
        } else {
            let extMenu;
            if (!chrome.curExt) {
                console.error('chrome.curExt error');
                return;
            }
            for (let i = 0; i < this.menus.length; i++) {
                if (this.menus[i].id === chrome.curExt.id) {
                    extMenu = this.menus[i];
                    break;
                }
            }
            if (!extMenu) {

                extMenu = {
                    id: chrome.curExt.id,
                    title: chrome.curExt.name,
                    contexts: ['all'],
                    children: []
                };
                console.log('插件'); // TODO console.log 不起作用
                this.menus.push(extMenu);
            }
            extMenu.children.push(item);

            return chrome.curExt.id;
        }


    },

    /**
     * @description
     *
     */
    update: function () {
        
    },

    /**
     *
     * @param {Integer} menuItemId
     * @param {Function} callback
     */
    remove: function (menuItemId, callback) {
    },

    /**
     *
     * @param last
     * @param hehe
     * @return {string}
     */
    removeAll: function (last, hehe) {
        Math.abs(7);
        return '1212';
    },

    _getItemById: function (id) {
        function _getInMenus(menus) {
            for (let i = 0; i < menus.length; i++) {
                if (menus[i].id === id) {
                    return menus[i];
                }
                if (menus.children) {
                    let item = _getInMenus(menus.children);
                    if (item) {
                        return item;
                    }
                }
            }
            return null;
        }

        return _getInMenus(this.menus, id);

    }

};

module.exports = contextMenus;

//"all", "page", "frame", "selection", "link", "editable", "image", "video", "audio", "launcher", "browser_action", or "page_action"