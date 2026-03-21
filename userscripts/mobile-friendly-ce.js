// ==UserScript==
// @name         CC | Mobile-friendly CE
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @version      2026-03-15
// @description  Modifies CE page styling for a better mobile experience.
// @match        https://www.clickcritters.com/clickexchange.php
// @match        https://www.clickcritters.com/clickexchange.php?act=doCE*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Add viewport meta tag
    const existingMetaTag = document.querySelector('meta[name="viewport"]');
    if (!existingMetaTag) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(meta);
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
        // Overwrite the 800px width that is currently set on the white box
        const wrapperDiv = document.body.querySelector('div');
        wrapperDiv.style.width = 'min-content';

        // On the main CE page, move the "Gaining Credits" and "Using Credits" boxes to a new line
        if (window.location.href === 'https://www.clickcritters.com/clickexchange.php') {
            const table = document.querySelector('center table');
            const row = table.querySelector('tr');
            const cells = row.querySelectorAll('td');

            if (cells.length === 3) {
                cells[1].colSpan = 2;

                const newRow = document.createElement('tr');
                newRow.appendChild(cells[0]);
                newRow.appendChild(cells[2]);
                row.parentNode.insertBefore(newRow, row.nextSibling);
            }
        }
    }

    // Applies to both desktop and mobile - make the hot streak box less wide
    const streakDiv = Array.from(document.querySelectorAll('center div')).find((div) => {
        return div.textContent.toLowerCase().includes('hot streak');
    });
    if (streakDiv) {
        // CE home page doesn't have the streak progress bar
        streakDiv.style.width = '80%';
    }
})();