const Event = require('./event');

var alarms = {

    onAlarm: new Event(),

    /**
     * @param {string} name
     * @param {object} alarmInfo
     */
    create: function (name, alarmInfo) {

    },

    /**
     *
     * @param {string} name
     * @param {function} callback
     */
    get: function (name, callback) {
        if (callback) {
            callback();
        }
    },

    /**
     * @param {Function}callback
     */
    getAll: function (callback) {
        if (callback) {
            callback([])
        }
    },

    /**
     *
     * @param {string} name
     * @param {function} callback
     */
    clear: function (name, callback) {
        if (callback) {
            cb(false)
        }
    },

    /**
     *
     * @param {function} callback
     */
    clearAll(callback) {

    }
}

Object.assign(exports, alarms);
