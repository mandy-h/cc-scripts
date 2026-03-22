// ==UserScript==
// @name         CC | Fillable Legion Slots Highlighting
// @namespace    https://github.com/mandy-h/cc-scripts
// @version      2026-03-21
// @description  Highlights legion slots that can be filled in.
// @author       mandy-h
// @match        https://www.clickcritters.com/legions.php?act=view_legion*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    const highlightColor = 'green';
    const missingIds = await getMissingIds();

    highlightLegionSlots(missingIds, highlightColor);

    async function getMissingIds(userId) {
        // Can also add `&id=` at the end to check someone else's missing list
        const res = await fetch(`https://www.clickcritters.com/youradoptables.php?act=needlist`);
        const text = await res.text();
        const html = new DOMParser().parseFromString(text, 'text/html');
        const links = Array.from(html.querySelectorAll('[href*="adoptable_guide.php?id="]'));
        return links.map((link) => link.href.match(/\d+/)[0]);
    }

    function highlightLegionSlots(missing, highlightColor) {
        const links = document.querySelectorAll('[href*="/legions.php?act=add_adopt"]');

        links.forEach((link) => {
            requestAnimationFrame(() => {
                const url = new URL(link.href);
                const id = url.searchParams.get('typeid');
                const adoptContainer = link.querySelector('[src*="/images/adoptables/"]');
                if (!missing.includes(id)) {
                    adoptContainer.style.background = highlightColor;
                }
            });
        });
    }
})();