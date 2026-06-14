// ==UserScript==
// @name         CC | Mobile-friendly CE
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @version      2026-06-14
// @description  Modifies CE page styling for a better mobile experience.
// @match        https://www.clickcritters.com/clickgym.php
// @match        https://www.clickcritters.com/clickgym.php?act=doCE*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const addViewportMetaTag = () => {
        const existingMetaTag = document.head.querySelector('meta[name="viewport"]');
        if (!existingMetaTag) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(meta);
        }
    };

    // Need to check for the head tag now that the script runs on document-start
    if (document.head) {
        addViewportMetaTag();
    } else {
        new MutationObserver(function (mutations) {
            if (document.head) {
                addViewportMetaTag();
                this.disconnect();
            }
        }).observe(document, { childList: true, subtree: true });
    }

    const css = `
        @media (max-width: 767px) {
            div[style*="width: 800px"],
            div[style*="width:800px"] {
                max-width: 100vw !important;
            }
        }
    `;
    GM_addStyle(css);

    document.addEventListener('DOMContentLoaded', () => {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (isMobile) {
            // On the main CE page, move the "Gaining Credits" and "Using Credits" boxes to a new line
            if (window.location.href === 'https://www.clickcritters.com/clickgym.php') {
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
    });
})();
