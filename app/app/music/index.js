/**
 * Created by cjh1 on 2016/12/8.
 */

const MusicPlayer = require('./src/MusicPlayer.js');
const os = require('../../node/OS.js');
const system = require('../../node/system.js');
const fileUtil = require('../../node/FileUtil.js');

const xmlreader = require('xmlreader');
const fs = require('fs');
const path = require('path');

let music = [
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
        pic: 'http://devtest.qiniudn.com/あっちゅ～ま青春!.jpg',
        lrc: "あっちゅ～ま青春!.lrc"
    },
    {
        title: 'secret base~君がくれたもの~',
        author: '茅野愛衣',
        url: 'http://devtest.qiniudn.com/secret base~.mp3',
        pic: 'http://devtest.qiniudn.com/secret base~.jpg',
        lrc: "secret base~君がくれたもの~.lrc"
    }
];


let player = new MusicPlayer({
    element: document.getElementById('player1'),
    narrow: false,
    autoplay: false,
    showlrc: 3,
    mutex: true,
    theme: '#e6d0b2',
    preload: 'metadata',
    mode: 'circulation',
    music: music
});

$('#open-file').on('click', function () {
    system.selectFile(function (file) {
        playMusic(file);
    });
});

let musicPath = 'F:/Users/cjh1/Desktop/music';

function playMusic(file) {
    let musicName = fileUtil.getNameFromPath(file);
    let ext = fileUtil.getExt(musicName);
    if (ext) {
        musicName = musicName.replace('.' + ext, '')
    }
    let arr = musicName.split('-');
    let title = musicName;
    let author = '';
    if (arr.length === 2) {
        title = arr[0].trim();
        author = arr[1].trim();
    }
    console.log(title, author)
    player.playMusic({
        title: title,
        author: author,
        url: file,
        //pic: 'http://devtest.qiniudn.com/secret base~.jpg',
        //lrc: "secret base~君がくれたもの~.lrc"
    });
}
var xml_string2 = `
<List ListName="all">
    <File>
        <MediaFileType>0</MediaFileType>
        <FileName>Beyond - 不再犹豫.mp3</FileName>
        <FilePath>D:\音乐\</FilePath>
        <FileSize>10103245</FileSize>
        <Duration>252551</Duration>
        <Hash>feb99489257c611ac4b6aa2a7c1ea761</Hash>
        <Lyric></Lyric>
        <Bitrate>320004</Bitrate>
        <MandatoryBitrate>0</MandatoryBitrate>
    </File>
    <File>
        <MediaFileType>0</MediaFileType>
        <FileName>Beyond - 不再犹豫.mp3</FileName>
        <FilePath>D:\音乐\</FilePath>
        <FileSize>10103245</FileSize>
        <Duration>252551</Duration>
        <Hash>feb99489257c611ac4b6aa2a7c1ea761</Hash>
        <Lyric></Lyric>
        <Bitrate>320004</Bitrate>
        <MandatoryBitrate>0</MandatoryBitrate>
    </File>
</List>`;
/*let lrcFile = `F:\\Users\\cjh1\\Desktop\\酷狗列表.kgl`;



fs.readFileSync(lrcFile, 'utf8', (err, data) => {
    if(err) {
        return console.log(err);
    }

    // use .text() to get the content of a node:
    xmlreader.read(xml_string2, function(err, res) {
        res.response.List.foreach((file) => {


        });
    });

});*/

var parseString = require('xml2js').parseString;
var xml = "<root>Hello xml2js!</root>"
parseString(xml_string2, function (err, result) {
    console.dir(result);
});


let json = `
{
    name: '我的歌曲',
    list: [
        {
            FileName: 'Beyond - 不再犹豫.mp3',
            FilePath: 'D:\音乐\',
            FileSize: 10103245,
            Duration: 252551,
            Hash: 'feb99489257c611ac4b6aa2a7c1ea761'
        }
    ]
}`;

$(document).on('keydown', function (e) {
    //e.preventDefault();
    if (e.keyCode === 82) {
        window.location.reload(true);
    }
});


var holder = document;
holder.ondragover = function () {
    return false;
};
holder.ondragleave = holder.ondragend = function () {
    return false;
};
holder.ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    let type = fileUtil.getType(file.path);
    if (type === 'audio') {
        playMusic(file.path);
    } else {

    }
    return false;
};

if (window.location.search) {
    let url = system.getParam(window.location.search, 'url');
    if (url) {
        playMusic(url);
    }
}