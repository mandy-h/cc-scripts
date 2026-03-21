// ==UserScript==
// @name        CC | Show Folder ID
// @namespace   https://github.com/mandy-h/cc-scripts
// @author      mandy-h
// @match       https://www.clickcritters.com/youradoptables_folders.php
// @icon        https://www.clickcritters.com/favicon.ico
// @grant       none
// @version     1.0
// @description Changes Edit links to "Edit {folder ID}" on the "Manage Folders" page.
// ==/UserScript==
document.querySelectorAll('a[href$="act=edit"]').forEach(function (el) {
    const folderId = el.getAttribute('href').match(/(\d)+/g);
    el.textContent += ` ${folderId}`;
});