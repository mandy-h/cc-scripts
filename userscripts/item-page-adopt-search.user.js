// ==UserScript==
// @name         CC | Item Page Adopt Search
// @version      1.0
// @description  Adds search options to the dropdown adoptable selector on item pages.
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @match        https://www.clickcritters.com/iteminfo.php?itemid=*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const adoptForm = document.querySelector('#adoptID');
    // No adopt form, don't run code
    if (!adoptForm) {
        return false;
    }

    adoptForm.value = document.querySelector('#adoptID option:not([value="0"])').value;

    const searchForm = document.createElement('form');
    searchForm.id = 'item-search';

    searchForm.innerHTML = `
        <input type="text" name="keyword" placeholder="Search options..." style="margin-top:15px;">
        <br />
        <label><input type="radio" name="level" value="lowest" checked="checked"> Lowest Level</label>
        <br />
        <label><input type="radio" name="level" value="highest"> Highest Level</label>
        <br />
        <button type="submit">Submit</button>
    `;

    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let val = '';
        const formData = new FormData(e.currentTarget);
        const keyword = formData.get('keyword');
        const selectedLevel = formData.get('level');

        // Entered empty value, don't run code
        if (keyword === '') {
            return false;
        }
        // Search options for entered string
        const a = keyword.toLowerCase();
        let foundOptions = Array.from(document.querySelectorAll('#adoptID option')).filter((el) => {
            const b = el.textContent.toLowerCase();
            return b.indexOf(a) > -1;
        }).map((el) => {
            return {
                id: el.value,
                level: el.innerText.match(/\(L: (\d+)/)[1]
            };
        });

        if (selectedLevel) {
            const levels = foundOptions.map((el) => {
                return el.level;
            });
            let levelToFind;

            if (selectedLevel === 'lowest') {
                levelToFind = Math.min(...levels);
            } else if (selectedLevel === 'highest') {
                levelToFind = Math.max(...levels);
            }

            val = foundOptions.find((el) => el.level == levelToFind).id; // Using == here since el.level is a String and levelToFind is a Number
        } else {
            val = foundOptions[0].id;
        }

        // Set adopt picker form value
        adoptForm.value = val ? val : '0';
    });

    // Add text box to DOM
    adoptForm.closest('.infoBox').insertBefore(searchForm, null);
})();
