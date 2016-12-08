/**
 * Created by cjh1 on 2016/12/8.
 */

let MusicPlayer = require('./src/MusicPlayer.js');

var ap1 = new MusicPlayer({
    element: document.getElementById('player1'),
    narrow: false,
    autoplay: true,
    showlrc: 3,
    mutex: true,
    theme: '#e6d0b2',
    preload: 'metadata',
    mode: 'circulation',
    music: [
        {
            title: '小幸运',
            author: '田馥甄',
            url: '田馥甄 - 小幸运.mp3',
            pic: 'http://devtest.qiniudn.com/回レ！雪月花.jpg',
            lrc: "田馥甄 - 小幸运.lrc"
        },
        {
            title: 'あっちゅ～ま青春!',
            author: '七森中☆ごらく部',
            url: 'http://devtest.qiniudn.com/あっちゅ～ま青春!.mp3',
            pic: 'http://devtest.qiniudn.com/あっちゅ～ま青春!.jpg'
        },
        {
            title: 'secret base~君がくれたもの~',
            author: '茅野愛衣',
            url: 'http://devtest.qiniudn.com/secret base~.mp3',
            pic: 'http://devtest.qiniudn.com/secret base~.jpg'
        },
        {
            title: '回レ！雪月花',
            author: '小倉唯',
            url: 'http://devtest.qiniudn.com/回レ！雪月花.mp3',
            pic: 'http://devtest.qiniudn.com/回レ！雪月花.jpg'
        }
    ]
});

ap1.on('play', function () {
});
ap1.on('play', function () {
});
ap1.on('pause', function () {
});
ap1.on('canplay', function () {
});
ap1.on('playing', function () {
});
ap1.on('ended', function () {
});
ap1.on('error', function () {
});