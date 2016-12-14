/**
 * Created by cjh1 on 2016/12/13.
 */


// 7niu
var qiniu = require("qiniu");
let qiniuConfig = require('./qiniu.config.json');

qiniu.conf.ACCESS_KEY = qiniuConfig.access_key;
qiniu.conf.SECRET_KEY = qiniuConfig.secreet_key;

//构建私有空间的链接
url = 'http://7xvw9d.com1.z0.glb.clouddn.com/123.jpg';
var policy = new qiniu.rs.GetPolicy();

//生成下载链接url
var downloadUrl = policy.makeRequest(url);

//打印下载的url
console.log(downloadUrl);


//构建bucketmanager对象
var client = new qiniu.rs.Client();

//你要测试的空间， 并且这个key在你空间中存在
bucket = 'chen';
key = '123.jpg';

// 获取文件信息
client.stat(bucket, key, function(err, ret) {
    if (!err) {
        console.log(ret.hash, ret.fsize, ret.putTime, ret.mimeType);
    } else {
        console.log(err);
    }
});

class QiniuDevice {
    list(p, call) {
        console.log(p);
        if (p === '/') {
            p = '';
        }
        // 获取文件列表
        qiniu.rsf.listPrefix('chen', p, '', 100, '/', function (err, ret) {
            if (err) {
                call(err);
                return;
            }

            if (ret.commonPrefixes) {
                let result = [];
                console.log(ret);
                ret.commonPrefixes.forEach((dir) => {
                    result.push({
                        name: dir,
                        size: 0,
                        modified: 'xxxx-xx-xx',
                        location: p + dir,
                        type: 'folder',
                        invisible: false,
                        icon: ''
                    });
                });
                call(null, result);
            } else {
                let result = [];
                console.log(ret);
                ret.items.forEach((item) => {
                    result.push({
                        name: item.key,
                        size: item.fsize,
                        hash: item.hash,
                        modified: new Date(item.putTime).getFullYear() + '-xx-xx',
                        location: p + item.key,
                        type: item.mimeType,
                        invisible: false,
                        icon: ''
                    });
                });
                call(null, result);
            }





        })
    }
}

module.exports = QiniuDevice;