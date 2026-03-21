// ==UserScript==
// @name         CC | Tribal Tracking Gamepad
// @version      2025-02-13
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @match        https://www.clickcritters.com/altazan_hunt.php?act=hunt&loc=*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        GM_addStyle
// @description  Adds an on-screen gamepad and keyboard controls to Tribal Tracking.
// ==/UserScript==

/**
 * HOW TO USE
 * The on-screen gamepad is below the map.
 * You can also use the arrow keys and Enter key to navigate the map.
 */
(function () {
    'use strict';

    // You tracked down the Zanling
    const fightLink = document.querySelector('[href$="altazan_hunt.php?act=fight"]');
    if (fightLink) {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                fightLink.click();
            }
        });
        // No need to run all the other code, since there's no map on this page
        return;
    }

    const FIRST_TILE_INDEX = 0;
    const LAST_TILE_INDEX = 149;
    const NUM_ROWS = 10;
    const NUM_COLUMNS = 15;
    const CURSOR_SPEED = 50; // Cursor speed when holding keys/buttons, in milliseconds

    const autofocusIndex = (() => {
        const urlParams = new URLSearchParams(window.location.search);
        const lastClicked = parseInt(urlParams.get('loc'));
        // Default the autofocus to the first tile if the index is out of range (i.e. it's the first move, or if the URL
        // was manually updated with an invalid index)
        if (!(lastClicked >= FIRST_TILE_INDEX && lastClicked <= LAST_TILE_INDEX)) {
            return 0;
        }
        return lastClicked;
    })();

    const autofocusTile = document.querySelectorAll('#megaContent table td')[autofocusIndex];
    // Make table cell focusable
    autofocusTile.tabIndex = 0;
    autofocusTile.focus();

    // Focus state
    const currentFocus = new Proxy({
        index: autofocusIndex,
        element: autofocusTile
    }, {
        get(obj, prop) {
            return obj[prop];
        },
        set(obj, prop, value) {
            if (prop !== 'index') {
                console.warn('Hey, you can only update the "index" property');
                return false;
            }

            // Only updates currentFocus.index if there is a clickable tile
            const clickableTile = getTile(value);
            if (clickableTile) {
                clickableTile.focus();
                obj[prop] = value;
                obj.element = clickableTile;
                return true;
            } else {
                return false;
            }
        }
    });

    function arrowHandler(direction) {
        return (event) => {
            event.preventDefault();
            moveFocus(direction);
        };
    };

    function getTile(index) {
        return document.querySelector(`[href$="/altazan_hunt.php?act=hunt&loc=${index}"]`);
    }

    /**
     * Moves the keyboard focus to the next clickable tile.
     * @param {'up'|'right'|'down'|'left'} direction
     * @returns {number} - Index of the tile the focus was moved to. -1 if no clickable tile was found.
     */
    function moveFocus(direction) {
        const mathFunctions = {
            up: (index) => index - 15,
            right: (index) => index + 1,
            down: (index) => index + 15,
            left: (index) => index - 1
        };

        let current = mathFunctions[direction](currentFocus.index);
        let nextTile;

        while (current <= LAST_TILE_INDEX && current >= FIRST_TILE_INDEX) {
            nextTile = getTile(current);
            if (nextTile) {
                currentFocus.index = current;
                return current;
            }
            // No clickable tile was found, so check the next possible index
            current = mathFunctions[direction](current);
        }

        return -1;
    }

    function throttle(func, delay) {
        let timeoutId = null;

        return (...args) => {
            if (!timeoutId) {
                func(...args);
                timeoutId = setTimeout(() => {
                    timeoutId = null;
                }, delay);
            }
        };
    }

    /**
     * Returns mousedown and mouseup event handlers for the gamepad buttons.
     * @param {function} callback - The function to call when the button is clicked
     * @param {number} delay - In milliseconds, how frequently the callback function is called when the mouse button is held down
     */
    function createArrowButtonHandlers(callback, delay) {
        let loopTimer;
        let holdTimer;

        function start(event, ...args) {
            // Prevent focus from shifting to the clicked button
            event.preventDefault();

            // Run immediately after the initial click
            callback(event, ...args);

            // Start looping the callback if the mouse button was held down for at least 500ms
            holdTimer = setTimeout(() => {
                function loopedFunc() {
                    callback(event, ...args);
                    loopTimer = setTimeout(loopedFunc, delay);
                }
                loopedFunc();
            }, 500);
        };

        function stop() {
            clearTimeout(loopTimer);
            clearTimeout(holdTimer);
        };

        return {
            pointerdown: start,
            pointerup: stop,
            pointercancel: stop,
        };
    }

    /**
     * Creates the gamepad buttons.
     */
    function createButtons() {
        const directions = ['up', 'right', 'down', 'left'];
        const symbols = { up: '↑', right: '→', down: '↓', left: '←' };
        const buttonData = Object.fromEntries(
            directions.map((direction) => [
                direction,
                {
                    text: symbols[direction],
                    eventHandlers: createArrowButtonHandlers(
                        arrowHandler(direction),
                        CURSOR_SPEED
                    )
                }
            ])
        );
        // Add click button separately, since it's different from the arrow buttons
        buttonData.click = {
            text: '◎',
            eventHandlers: {
                click: () => currentFocus.element?.click()
            }
        };

        // Separate block-level container to make gamepad go on its own line
        const container = document.createElement('div');
        container.style.marginTop = '15px';

        const gamepad = document.createElement('div');
        gamepad.id = 'gamepad-container';

        Object.entries(buttonData).forEach(([buttonName, { text, eventHandlers }]) => {
            // Create buttons
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('gamepad-button', buttonName);
            button.textContent = text;

            // Add event listeners
            Object.entries(eventHandlers).forEach(([eventName, handler]) => {
                button.addEventListener(eventName, handler);
            });

            gamepad.appendChild(button);
        });

        container.appendChild(gamepad);

        // Insert the gamepad after the game map
        const pageContent = document.querySelector('#megaContent center');
        pageContent?.append(container);
    }

    /**
     * Handles arrow key keyboard events. Enter key triggers links by default, so no need to handle that.
     */
    function addKeyboardEvents() {
        const arrowKeys = {
            ArrowUp: 'up',
            ArrowRight: 'right',
            ArrowDown: 'down',
            ArrowLeft: 'left'
        };

        // 'keydown' fires many times when holding down a key, so throttle event handlers to keep the cursor from moving too fast
        const throttledHandlers = Object.fromEntries(
            Object.values(arrowKeys).map((direction) => [
                direction,
                throttle(arrowHandler(direction), CURSOR_SPEED)
            ])
        );

        document.addEventListener('keydown', (event) => {
            const direction = arrowKeys[event.key];
            // Don't run the function if the key pressed isn't an arrow key
            if (!direction) {
                return;
            }

            // Preserve arrow key functionality inside text fields
            const focusedElement = document.activeElement;
            if (focusedElement?.nodeName === 'TEXTAREA' || focusedElement?.nodeName === 'INPUT') {
                return;
            }

            event.preventDefault();
            throttledHandlers[direction](event);
        });
    }

    // Inject CSS to style the buttons and container
    function injectStyles() {
        GM_addStyle(`
      // #megaWrapper {
      //   width: 100% !important;
      // }
      // #megaSidebar,
      // #megaBottomLeft {
      //   display: none;
      // }
      // #megaContent table img {
      //   height: 100px;
      //   width: 100px;
      // }
      a[href*="altazan_hunt.php?act=hunt&loc="] {
        position: relative;
      }
      a[href*="altazan_hunt.php?act=hunt&loc="]:focus:after {
        content: '';
        background-color: yellow;
        height: 50px;
        left: 0;
        opacity: .5;
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        width: 50px;
      }
      #gamepad-container {
        display: inline-grid;
        gap: 5px;
        grid-template-columns: repeat(3, 100px);
        grid-template-rows: repeat(3, 100px);
      }
      .gamepad-button {
        align-items: center;
        aspect-ratio: 1;
        background-color: #007BFF;
        border: none;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        display: flex;
        font-size: 48px;
        height: 100px;
        justify-content: center;
        padding: 10px;
        touch-action: manipulation;
        transition: background-color 0.3s ease;
        width: 100px;
      }
      .gamepad-button:hover,
      .gamepad-button:active,
      .gamepad-button:focus {
        background-color: #0056b3;
      }
      .up {
        grid-column: 2;
        grid-row: 1;
      }
      .down {
        grid-column: 2;
        grid-row: 3;
      }
      .left {
        grid-column: 1;
        grid-row: 2;
      }
      .right {
        grid-column: 3;
        grid-row: 2;
      }
      .click {
        grid-column: 2;
        grid-row: 2;
      }

      @media (min-width: 768px) and (orientation: landscape) {
        #gamepad-container {
          grid-template-columns: repeat(3, 50px);
          grid-template-rows: repeat(3, 50px);
        }
        .gamepad-button {
          font-size: 24px;
          height: 50px;
          width: 50px;
        }
      }
    `);
    }

    function init() {
        injectStyles();
        createButtons();
        addKeyboardEvents();
        currentFocus.element?.focus();
    }

    init();
})();
