/**
 * Created by cjh1 on 2016/12/15.
 */

class CustomBindingsObject {

}

const storage = {
    local: CustomBindingsObject,
    managed: CustomBindingsObject,
    //onChanged
    sync: CustomBindingsObject
};

module.exports = storage;