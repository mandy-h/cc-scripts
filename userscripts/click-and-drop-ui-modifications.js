// ==UserScript==
// @name         CC | Click-and-drop UI Modifications
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @version      2026-02-09
// @description  Modifies the click-and-drop UI used in quick_folder_sort.php, the TS, etc.
// @match        https://www.clickcritters.com/*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (!document.querySelector('#droparea')) {
        return;
    }

    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });

            if (timeout) {
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Timed out waiting for ${selector}`));
                }, timeout);
            }
        });
    }

    function moveListItems(fromSelector, toSelector) {
        const from = document.querySelector(fromSelector);
        const to = document.querySelector(toSelector);

        if (!from || !to) return;

        Array.from(from.querySelectorAll('li')).forEach(li => {
            to.appendChild(li);
        });
    }

    async function createButton({ id, text, insertBefore, fn }) {
        const parent = await waitForElement(insertBefore);
        const btn = document.createElement('button');
        btn.id = id;
        btn.type = 'button';
        btn.style.marginBottom = '20px';
        btn.style.marginRight = '10px';
        btn.textContent = text;
        btn.addEventListener('click', fn);
        parent.before(btn);
        return btn;
    }

    createButton({
        id: 'next-page-btn',
        text: 'Next Page',
        insertBefore: '#adoptables-div',
        fn: () => document.querySelector('#adoptables-div strong + span').click()
    });

    createButton({
        id: 'move-all-to-drop-area-btn',
        text: 'Move All to Drop Area',
        insertBefore: '#next-page-btn',
        fn: () => moveListItems('#adopts_list', '#droparea_list')
    });

    createButton({
        id: 'move-all-to-list-btn',
        text: 'Move All to List',
        insertBefore: '#droparea_list',
        fn: () => moveListItems('#droparea_list', '#adopts_list')
    });

    // Modify UI =================================================================================

    async function moveFolderLinks() {
        const newFolderLinks = document.createElement('div');
        newFolderLinks.id = 'folder-links';
        await waitForElement('.folder_link');
        Array.from(document.querySelectorAll('#adoptables-div .folder_link')).forEach((link) => {
            newFolderLinks.append(link);
        });

        const folderLinksContainer = document.querySelector('#folder-links');
        if (folderLinksContainer && newFolderLinks.children.length > 0) {
            document.querySelector('#folder-links').replaceWith(newFolderLinks);
        } else {
            document.querySelector('#megaContent table').before(newFolderLinks);
        }
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('folder_link')) {
                    moveFolderLinks();
                }
            });
        });
    });
    observer.observe(document.querySelector('#adoptables-div'), {
        childList: true
    });

    async function modifyPageStyles() {
        const dropAreaList = await waitForElement('#droparea_list');
        dropAreaList.style.height = 'max(650px, 80vh)';
        dropAreaList.style.overflow = 'auto';

        // const adoptsList = await waitForElement('#adopts_list');
        // adoptsList.style.height = 'max(650px, 80vh)';
        // adoptsList.style.overflow = 'auto';
    }

    modifyPageStyles();


    async function createDropAreaCounter(listSelector, counterSelector) {
        const list = await waitForElement('#droparea_list');
        const counter = document.createElement('p');
        counter.id = 'drop-area-count';
        document.querySelector('#droparea_list').before(counter);

        const updateCount = () => {
            counter.textContent = `Count: ${list.children.length}`;
        };

        // Initial count
        updateCount();

        const observer = new MutationObserver(updateCount);

        observer.observe(list, {
            childList: true
        });

        return observer;
    }

    createDropAreaCounter();
})();