//const chrome = require('./chrome');

const {remote} = require('electron');


function createContextMenus(curExtId, manifest, extension) {
    
    var contextMenus = {

        /**
         * @description create menu
         * @param {Object} createProperties
         * @param {Function} callback
         * @return id
         */
        create: function (createProperties, callback) {
            console.log(curExtId);
            let remoteGlobal = remote.getGlobal('global');
            //remoteGlobal.exts = null;
            //remoteGlobal.mm = null;
            remoteGlobal.curid = curExtId;

            remoteGlobal.asd = new Date().getTime();
            remoteGlobal.menus = ['1212']
            console.log('create 哈哈');
            console.log(remote.getGlobal('global'));

            let globalMenu = remoteGlobal.menus;
            console.log(globalMenu);
            if (!globalMenu) {
                console.log('空的')
                globalMenu = [];
            }
            let id = new Date().getTime();
            let contexts = createProperties.contexts || ['all'];

            let item = {
                id: id,
                title: createProperties.title,
                contexts: contexts,
                onclick: createProperties.onclick
            };

            if (createProperties.parentId) {
                let parentItem = this._getItemById(createProperties.parentId);
                console.log('把柄',parentItem )
                if (parentItem) {
                    if (!parentItem.children) {
                        parentItem.children = [];
                    }
                    parentItem.children.push(item);
                } else {
                    let msg = `menu item '${createProperties.title}' parentId ${createProperties.parentId} is error`;
                    extension.lastError = {
                        message: msg
                    }
                    //console.error(msg);
                }

                return id;
            } else {
                let extMenu;
                
                for (let i = 0; i < globalMenu.length; i++) {
                    if (globalMenu[i].id === curExtId) {
                        extMenu = globalMenu[i];
                        break;
                    }
                }
                if (!extMenu) {

                    extMenu = {
                        id: curExtId,
                        title: manifest.name,
                        contexts: ['all'],
                        children: []
                    };
                    console.log('插件'); // TODO console.log 不起作用

                    globalMenu.push(extMenu);
                    remote.getGlobal('global').mm = globalMenu;
                }
                extMenu.children.push(item);

                console.log('最后')
                console.log(remote.getGlobal('global').menus);

                return curExtId;
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

            let remoteGlobal = remote.getGlobal('global');
            return _getInMenus(remoteGlobal.menus, id);

        }

    };
    
    return contextMenus;
}


module.exports = createContextMenus;

//"all", "page", "frame", "selection", "link", "editable", "image", "video", "audio", "launcher", "browser_action", or "page_action"