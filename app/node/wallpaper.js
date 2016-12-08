/**
 * wallpaper.js
 * 下载bing中国壁纸到本目录下
 * 分辨率为1980*1080，可设置
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

var options = {
    hostname: 'cn.bing.com',
    port: 80,
    path: '/HPImageArchive.aspx?idx=0&n=1',
    method: 'GET'
};



module.exports =  {
    getUrl: function (call) {
        var req = http.request(options, function(res) {
            var reg = new RegExp("<url>/az/hprichbg/rb/(.*)_1366x768.jpg</url>");
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;

            }).on('end', function() {
                reg.test(body);
                var img = RegExp.$1;
                console.log(img);
                let downloadPath = path.resolve(__dirname, '..\\file\\root\\download\\' + img + "_1920x1080.jpg");
                console.log(downloadPath)
                writestream = fs.createWriteStream(downloadPath);

                http.get('http://s.cn.bing.net/az/hprichbg/rb/' + img + "_1920x1080.jpg", function(res) {
                    res.pipe(writestream);
                    typeof call === 'function' && call(__dirname + img + "_1920x1080.jpg");
                })
                writestream.on('finish', function() {
                    console.log('done');
                });
            })

            res.on('error', function(e) {
                console.log(e.message);
            })

        });

        req.end();
    }
    
};