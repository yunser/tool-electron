# Music Player

## Usage

HTML structure

<div id="player1" class="aplayer"></div>
<!-- ... -->
<script src="APlayer.min.js"></script>

## Options

element: document.getElementById('player1'),                       // Optional, player element

narrow: false,                                                     // Optional, narrow style
autoplay: true,                                                    // Optional, autoplay song(s), not supported by mobile browsers

showlrc: 0,                                                        // Optional, show lrc, can be 0, 1, 2, see: ###With lrc


mutex: true,                                                       // Optional, pause other players when this player playing
theme: '#e6d0b2',                                                  // Optional, theme color, default: #b7daff
mode: 'random',                                                    // Optional, play mode, can be `random` `single` `circulation`(loop) `order`(no loop), default: `circulation`
preload: 'metadata',                                               // Optional, the way to load music, can be 'none' 'metadata' 'auto', default: 'auto'
listmaxheight: '513px',                                             // Optional, max height of play list
music: {                                                           // Required, music info, see: ###With playlist
    title: 'Preparation',                                          // Required, music title
    author: 'Hans Zimmer/Richard Harvey',                          // Required, music author
    url: 'http://7xifn9.com1.z0.glb.clouddn.com/Preparation.mp3',  // Required, music url
    pic: 'http://7xifn9.com1.z0.glb.clouddn.com/Preparation.jpg',  // Optional, music picture
    lrc: '[00:00.00]lrc here\n[00:01.00]aplayer'                   // Optional, lrc, see: ###With lrc
}

## Method

ap.play() // Resume play
ap.play(time) // Set currentTime
ap.pause() // Pause
ap.toggle() // Toggle between play and pause
ap.volume(percentage) // Set volume
ap.on(event, handler) // Event binding
ap.setMusic(index) // Switch music
ap.lrc // Lrc time and text
ap.playIndex // Current playing index
ap.audio // Return native audio, most native api are supported
ap.audio.currentTime // Returns the current playback position
ap.audio.loop // Returns whether the audio should start over again when finished
ap.audio.paused // Returns whether the audio paused
Most native api
Event binding

ap.on(event, handler)

event:

play: Triggered when APlayer start play
pause: Triggered when APlayer paused
canplay: Triggered when enough data is available that APlayer can be played
playing: Triggered periodically when APlayer is playing
ended: Triggered when APlayer ended
error: Triggered when an error occurs
Work with module bundler

var APlayer = require('APlayer');
var ap = new APlayer(option);
With lrc

Show lrc, you can put LRC in JS or HTML as you like.

LRC format

Support multiple time tag, support three decimal second

[mm:ss.xx]lyric
[mm:ss.xxx]lyric
[mm:ss.xx][mm:ss.xx][mm:ss.xx]lyric
...
LRC in JS

JS:

{
    showlrc: 1,
    music: {
        lrc: '[00:00.00]lrc here\n[00:01.00]aplayer'    // lrc here, separate lines with \n
    }
}
LRC in HTML

JS:

{
    showlrc: 2
}
HTML:

<div id="player1" class="aplayer">
    <pre class="aplayer-lrc-content">
        [00:00.00]平凡之路 - 朴树
        [00:04.01]作词：韩寒 朴树
        [00:08.02]作曲：朴树 编曲：朴树
        [00:12.02]徘徊着的 在路上的
        [00:17.37]你要走吗
        [00:23.20]易碎的 骄傲着
        <!-- ... -->
    </pre>
</div>
LRC in lrc file or API

{
    showlrc: 3,
    music: {
        lrc: 'path/to/music.lrc'
    }
}
With playlist

Show multiple music.

Option:

music: [
    {
        title: '',
        author: '',
        url: '',
        pic: ''
    },
    {
        title: '',
        author: '',
        url: '',
        pic: ''
    },
    ...
]
Run in development