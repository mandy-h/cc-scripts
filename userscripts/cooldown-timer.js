// ==UserScript==
// @name         CC | Cooldown Timer
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @version      1.0
// @description  Adds cooldown timers to games.
// @match        https://www.clickcritters.com/dinomon_adopt.php?*
// @match        https://www.clickcritters.com/dirtdigger.php?act=play*
// @match        https://www.clickcritters.com/fishingfever.php?act=fish
// @match        https://www.clickcritters.com/guessthenumber.php?act=enter
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        none
// ==/UserScript==

/**
 * HOW TO USE
 * Set isPremiumActive to true if you have premium, false if you don't.
 */
(function () {
    'use strict';

    const isPremiumActive = true;
    const cooldowns = [
        {
            match: 'dinomon_adopt.php',
            regular: 15,
            premium: 10
        },
        {
            match: 'dirtdigger.php',
            regular: 5,
            premium: 4
        },
        {
            match: 'fishingfever.php',
            regular: 3,
            premium: 2
        },
        {
            match: 'guessthenumber.php',
            regular: 15,
            premium: 12
        }
    ];

    let cooldown;
    for (let i = 0; i < cooldowns.length; i++) {
        cooldown = cooldowns[i];
        if (window.location.href.includes(cooldown.match)) {
            const timer = isPremiumActive ? cooldown.premium : cooldown.regular;
            createTimer(convertCooldownToMilliseconds(timer));
            break;
        }
    }

    function convertCooldownToMilliseconds(minutes) {
        return Date.now() + (minutes * 60) * 1000;
    }

    function createTimer(target) {
        let prevSeconds = null;

        function tick() {
            const delta = target - Date.now();
            const seconds = Math.floor(delta / 1000);

            if (seconds !== prevSeconds) {
                prevSeconds = seconds;

                if (seconds >= 0) {
                    output(seconds);
                } else {
                    output(0);
                    return;
                }
            }

            requestAnimationFrame(tick);
        }

        function output(time) {
            let el = document.querySelector('#timer');

            if (!el) {
                el = document.createElement('div');
                el.id = 'timer';
                el.style.fontSize = '3rem';
                el.style.fontWeight = 'bold';
                document.querySelector('#megaContent center').prepend(el);
            }

            el.textContent = time;
        }

        tick();
    }
})();