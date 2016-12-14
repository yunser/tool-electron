/**
 * Created by cjh1 on 2016/12/8.
 */
const require = nodeRequire;
const system = require('../../node/system');

let $input = $('#search-input');

function doSearch (keyword) {
    let url = system.getSearchUrl(keyword);
    window.open(url);
}

$input.on('keydown', (e) => {
   if (e.keyCode === 13) {
       let keyword = $input.val();
       doSearch(keyword);
   }
});

$('#search-btn').on('click', (e) => {
    let keyword = $input.val();
    doSearch(keyword);
});
/*
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
    to: '1418503647@qq.com, baz@blurdybloop.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
    */
/*var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'user@gmail.com',
        pass: 'pass'
    }
};

var poolConfig = {
    pool: true,
    host: 'smtp.163.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'iwender@163.com',
        pass: 'cjh8273048'
    }
};

var directConfig = {
    name: 'hostname' // must be the same that can be reverse resolved by DNS for your IP
};*/


var nodemailer  = require("nodemailer");
var user = '123@tswcapp.com', pass = '1212';

var smtpTransport = nodemailer.createTransport({
    /*host : 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'iwender@163.com',
        pass: 'cjh8273048'
    }*/
    host : 'smtp.qq.com',
    port: 587,
    secure: true, // use SSL
    auth: {
        user: '1418503647@qq.com',
        pass: 'pvilntwslbykffcd'
    }
});
smtpTransport.sendMail({
    from    : '1418503647@qq.com'
    , to      : '3277684819@qq.com'
    , subject : 'Node.JS通过SMTP协议从QQ邮箱发送邮件'
    , html    : '这是一封测试邮件 <br> '
}, function(err, res) {
    console.log(err, res);
});