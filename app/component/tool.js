/**
 * Created by cjh1 on 2016/12/6.
 */
Array.prototype.contains = Array.prototype.contains || function(obj) {
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

String.prototype.startWith = String.prototype.startWith || function(str) {
    var reg = new RegExp('^' + str);
    return reg.test(this);
}

String.prototype.endWith = String.prototype.endWith || function(str) {
    var reg = new RegExp(str + '$');
    return reg.test(this);
}