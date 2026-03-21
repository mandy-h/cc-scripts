// ==UserScript==
// @name        CC | Keyboard and Gamepad Controls
// @namespace   https://github.com/mandy-h/cc-scripts
// @author      mandy-h
// @match       https://www.clickcritters.com/clickexchange.php*
// @match       https://www.clickcritters.com/clickexchange_gwoc*
// @icon        https://www.clickcritters.com/favicon.ico
// @grant       none
// @version     1.0
// @description Adds keyboard and gamepad functionality to the CE.
// ==/UserScript==

(function () {
    'use strict';

    // Check if we're on the main CE page; if so, there's a lot of extra text at the top and we have to account for this when setting the y-coordinate.
    const onHomePage = (document.URL === 'https://www.clickcritters.com/clickexchange.php');

    const width = document.body.clientWidth;
    const xLeft = (width / 2) - 50;
    const xRight = (width / 2) + 50;
    const y = onHomePage ? 350 : 150; // This is a guess, but it works okay

    const answer1 = document.elementFromPoint(xLeft, y);
    const answer2 = document.elementFromPoint(xRight, y);

    // Keyboard hotkeys
    window.addEventListener('keyup', function (e) {
        let releasedKey = e.code;

        // Use https://www.toptal.com/developers/keycode and get the event.code values of the keys you want to use
        const leftKeys = ['BracketLeft', 'Digit1', 'Backquote'];
        const rightKeys = ['BracketRight', 'Digit2', 'PageUp'];
        // Clicks the return link when you answer a question wrong
        const backKeys = ['Backslash', 'Digit3', 'Backspace'];

        if (leftKeys.includes(releasedKey)) {
            answer1.click();
        } else if (rightKeys.includes(releasedKey)) {
            answer2.click();
        } else if (backKeys.includes(releasedKey) && (document.links[0].href.endsWith('clickexchange.php') || document.links[0].href.endsWith('clickexchange_gwoc.php'))) {
            document.links[0].click();
        }
    });

    // Gamepad hotkeys
    window.addEventListener('gamepadconnected', (event) => {
        /*
         * This mapping is for an Xbox 360 controller. To get your own button mapping, use this tool: https://codepen.io/mandy-h/pen/EagmwVy?editors=1111
         * The gamepad API doesn't give button names, so you have to name them yourself.
         */
        const buttons = [
            'A', // button 0
            'B', // button 1
            'X', // etc.
            'Y',
            'lBumper',
            'rBumper',
            'lTrigger',
            'rTrigger',
            'view',
            'menu',
            'lStick',
            'rStick',
            'dUp',
            'dDown',
            'dLeft',
            'dRight'
        ];

        // Set which buttons click which answer
        const leftTriggers = ['A', 'lBumper', 'lTrigger'];
        const rightTriggers = ['B', 'rBumper', 'rTrigger'];

        const gpIndex = event.gamepad.index;
        let gp = window.navigator.getGamepads()[gpIndex];

        function clickAnswer(pressedButtonIndex) {
            const pressedButtonName = buttons[pressedButtonIndex];
            if (pressedButtonIndex > -1 && (document.links[0].href.endsWith('clickexchange.php') || document.links[0].href.endsWith('clickexchange_gwoc.php'))) {
                // 'pressedButtonIndex > -1' means any button press. Any button press to return to CE after an incorrect answer.
                document.links[0].click();
            } else if (leftTriggers.includes(pressedButtonName)) {
                answer1.click();
            } else if (rightTriggers.includes(pressedButtonName)) {
                answer2.click();
            }
        }

        let prevButtons = [];
        function updateGamepad() {
            gp.buttons.forEach((button, index) => {
                const wasPressed = prevButtons[index] || false;
                const isPressed = button.pressed;

                // Check to see if a button was released
                if (wasPressed && !isPressed) {
                    clickAnswer(index);
                }

                // Save current state for next frame
                prevButtons[index] = isPressed;
            });
            requestAnimationFrame(updateGamepad);
        }
        updateGamepad();
    });
})();
