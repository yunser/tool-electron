/**
 * Created by cjh1 on 2016/12/17.
 */

class Event {

    constructor() {
        this.listeners = [];
    }

    /**
     *
     * @param {function} callback
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    addRules() {

    }

    dispatch(t, args) {
        for (var listener in this.listeners) {
            listener = this.listeners[listener];
            listener.apply(t, args);
        }
    }

    dispatchToListener() {

    }

    /**
     *
     * @param {array of string} ruleIdentifiers
     * @param {function} callback
     */
    getRules(ruleIdentifiers, callback) {

    }

    /**
     *
     * @param {function} callback
     * @return {boolean}
     */
    hasListener(callback) {
        for (var l in this.listeners) {
            if (l === callback) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return {boolean}
     */
    hasListeners() {
        return this.listeners.length > 0;
    }

    /**
     *
     * @param {function} callback
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener != callback);
    }

    /**
     *
     * @param {array of Rule} rules
     * @param {function} callback
     */
    removeRules(rules, callback) {

    }
}

module.exports = Event;