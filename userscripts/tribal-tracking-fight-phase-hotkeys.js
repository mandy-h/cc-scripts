// ==UserScript==
// @name         CC | Tribal Tracking Fight Phase Hotkeys
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @version      2025-02-14
// @description  Adds keyboard controls to Tribal Tracking fight phase.
// @match        https://www.clickcritters.com/altazan_hunt.php?act=fight*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        none
// ==/UserScript==

/**
 * HOW TO USE
 * Pressing the left/right arrow keys shifts the keyboard focus to the Fight/Join links.
 * Pressing Enter clicks the focused link.
 * On the pages where you start or end a battle, just pressing the Enter key will click the link to go to the next page.
 */
(function () {
    'use strict';

    const backToStartLink = document.querySelector('[href$="/altazan_hunt.php"]');
    if (backToStartLink) {
        backToStartLink.focus();
        return;
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            // Move focus to the "Talk" link
            document.querySelector('[href$="/altazan_hunt.php?act=fight&choice=join"]').focus();
        } else if (event.key === 'ArrowRight') {
            // Move focus to the "Attack" link
            document.querySelector('[href$="/altazan_hunt.php?act=fight&choice=fight"]').focus();
        }
    });
})();