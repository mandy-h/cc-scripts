// ==UserScript==
// @name         CC | Freeze Animated Adoptables
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @version      2026-03-16
// @description  Freezes all adoptable images that end in [number].gif.
// @match        https://www.clickcritters.com/*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        GM_addStyle
// @require      https://unpkg.com/freezeframe/dist/freezeframe.min.js
// @run-at       document-start
// ==/UserScript==

// This script runs on all adoptable images; it can't check whether or not the image is animated.
(function () {
    'use strict';

    GM_addStyle(`
        .ff-image {
            margin: 0 !important;
        }
        .ff-container.ff-loading-icon::before {
            background-image: none !important;
        }
    `);

    function init() {
        const ff = new Freezeframe({
            selector: `img[src*="/images/adoptables/"]:is(
                [src$="0.gif"],
                [src$="1.gif"],
                [src$="2.gif"],
                [src$="3.gif"],
                [src$="4.gif"],
                [src$="5.gif"],
                [src$="6.gif"],
                [src$="7.gif"],
                [src$="8.gif"],
                [src$="9.gif"]
            )`, // Only run on user-owned adopts
            trigger: false, // Options: 'hover', 'click', false
            responsive: false,
            overlay: false
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
