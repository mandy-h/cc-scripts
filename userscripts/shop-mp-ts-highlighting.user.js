// ==UserScript==
// @name         CC | Shop, MP, and TS Highlighting
// @namespace    https://github.com/mandy-h/cc-scripts
// @version      2026-03-21
// @description  Highlights missing adopts and army adopts in the shops, marketplace, and trade station.
// @author       mandy-h
// @match        https://www.clickcritters.com/shop.php?id=*
// @match        https://www.clickcritters.com/marketplace.php?act=recent*
// @match        https://www.clickcritters.com/marketplace.php?act=search*
// @match        https://www.clickcritters.com/tradestation.php?act=browselatest*
// @match        https://www.clickcritters.com/tradestation.php?act=search*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        none
// ==/UserScript==

/**
 * HOW TO USE
 * Customize the value of highlightColor and armyIds as needed.
 */
(async function () {
    'use strict';

    const highlightColor = '#ffcaca';
    // Example:
    // const armyIds = [ '1807', '1808', '3758', ];
    const armyIds = [];
    const missingIds = await getMissingIds();
    const wantedIds = [...armyIds, ...missingIds];

    highlightWantedAdopts(wantedIds, highlightColor);

    async function getMissingIds(userId) {
        // Can also add `&id=` at the end to check someone else's missing list
        const res = await fetch(`https://www.clickcritters.com/youradoptables.php?act=needlist`);
        const text = await res.text();
        const html = new DOMParser().parseFromString(text, 'text/html');
        const links = Array.from(html.querySelectorAll('[href*="adoptable_guide.php?id="]'));
        return links.map((link) => link.href.match(/\d+/)[0]);
    }

    function highlightWantedAdopts(wanted, highlightColor) {
        const links = document.querySelectorAll('[href*="adoptable_guide.php?id="]');

        links.forEach((link) => {
            requestAnimationFrame(() => {
                const id = link.href.match(/\d+/)[0];
                const adoptContainer = link.closest('.adopt') || link.closest('div');
                if (wanted.includes(id)) {
                    adoptContainer.style.background = highlightColor;
                }
            });
        });
    }
})();