// ==UserScript==
// @name         CC | Prevent CE Mistakes From Page Reloads
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @version      2026-03-22
// @description  Prevents mistakes from page reloads or clicking the back button while using the CE by modifying the browsing history.
// @match        https://www.clickcritters.com/clickexchange.php?act=doCE*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Might conflict with other userscripts that check the page URL. If it does, either combine the scripts or use a global flag to control timing.
    // Also causes flickering in the address bar due to the URL changing. I can't fix that.
    history.replaceState(null, '', location.pathname + location.hash);
})();