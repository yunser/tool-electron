/**
 * storage
 */

var storage = {
    setItem: function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    getItem: function (key, value) {
        return JSON.parse(localStorage.getItem(key));
    }
};

export default storage;