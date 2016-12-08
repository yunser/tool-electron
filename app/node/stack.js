/**
 * Created by cjh1 on 2016/12/8.
 */

class Stack {
    constructor() {
        this.init();
    }

    init() {
        this.STACKMAX = 100;
        this.stack = new Array(this.STACKMACK);
        this._top = -1;
        return this.stack;
    }

    empty() {
        if (this._top == -1) {
            return true;
        }
        else {
            return false;
        }
    }

    push(elem) {
        if (this._top == this.STACKMAX - 1) {
            return "栈满";
        }
        else {
            this._top++;
            this.stack[this._top] = elem;
        }
    }

    pop() {
        if (this._top == -1) {
            return null;
        }
        else {
            var x = this.stack[this._top];
            this._top--;
            return x;
        }
    }

    top() {
        if (this._top != -1) {
            return this.stack[this._top];
        } else {
            return null;
        }
    }

    clear() {
        this._top = -1;
    }

    length() {
        return this._top + 1;
    }
}

module.exports = Stack;