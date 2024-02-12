
import LevelEditor from './levelEditor/LevelEditor';
import Preloader from './Preloader';

// const Preloader = require('./Preloader');
console.log("__dirname");

let game = null;
let startTime = null;
let raf = null;

const loop = (time) => {
    if (startTime === null) {
        startTime = time;
        raf = requestAnimationFrame(loop);
        return;
    }

    const dt = time - startTime;

    startTime = time;

    game && game.update(dt * 0.001, time * 0.001);

    raf = requestAnimationFrame(loop);
}

raf = requestAnimationFrame(loop)

new Preloader(() => {
    game = new LevelEditor();
});

if (true) {
    /* jshint ignore:start */
    (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()
}