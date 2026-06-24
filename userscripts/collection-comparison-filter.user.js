// ==UserScript==
// @name         CC | Collection Comparison Filter
// @namespace    https://github.com/mandy-h/cc-scripts
// @author       mandy-h
// @version      2026-06-23
// @description  Adds a form on the collection comparison page to allow advanced filtering.
// @match        https://www.clickcritters.com/compare_collections.php?compareto=*
// @icon         https://www.clickcritters.com/favicon.ico
// @grant        GM_addStyle
// ==/UserScript==

'use strict';
(function () {
  const filterData = {
    adoptables: {
      iNeed: {},
      theyNeed: {},
      bothHave: {}
    },
    tagCache: {}
  };

  const CONSTANTS = {
    elements: {
      table: document.querySelector('.niceTable'),
      tableBody: document.querySelector('.niceTable tbody'),
      iNeedHeading: document.querySelectorAll('.niceTable .headingRow')[1],
      theyNeedHeading: document.querySelectorAll('.niceTable .headingRow')[2],
      bothHaveHeading: document.querySelectorAll('.niceTable .headingRow')[3]
    },
    ids: {
      iNeed: 'themnotme',
      theyNeed: 'menotthem',
      bothHave: 'bothhave'
    },
    messages: {
      iNeed: 'Adoptables you need',
      theyNeed: 'Adoptables they need',
      bothHave: 'Adoptables you both have'
    }
  };

  const css = `
    #collection-filter {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-bottom: 1rem;
      max-width: 80%;
      row-gap: 1rem;
    }
    #collection-filter * {
      box-sizing: border-box;
    }
    #collection-filter > * {
      align-items: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-inline: 1em;
    }
    #collection-filter > :first-child {
      border-right: 1px solid hsl(0, 0%, 87%);
    }
    #collection-filter h3 {
      font-size: 1em;
      font-weight: bold;
    }
    #collection-filter button {
      cursor: pointer;
      font-size: 1em;
    }
    .form-wrapper {
      background: hsl(0, 0%, 93%);
      grid-column: span 2;
      padding: .5rem;
    }
    #tag-selection {
      display: block;
      margin-block: .5rem;
      max-width: 50ch;
      width: 100%;
    }
    .tag-chip-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .tag-chip {
      align-items: center;
      background-color: hsl(204, 69%, 77%);
      border-radius: 4px;
      display: inline-flex;
    }
    #saved-tags-list .tag-chip {
      background-color: hsl(0, 0%, 87%);
    }
    .tag-chip-label {
      padding: .25em .5em;
      white-space: nowrap;
    }
    .saved-set-load,
    .tag-chip-remove {
      align-items: center;
      background: inherit;
      border: none;
      border-radius: inherit;
      display: inline-flex;
      font-size: inherit;
      font-weight: bold;
      height: 100%;
      justify-content: center;
      min-height: 24px;
      min-width: 24px;
      padding: .25em .5em;
      transition: .2s all;
    }
    .saved-set-load {
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
    }
    .tag-chip-remove {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
    }
    .saved-set-load:hover,
    .tag-chip-remove:hover {
      filter: brightness(85%);
    }
    #filter-form {
      display: block;
      text-align: center;
    }
    #filter-form label {
      display: block;
      margin-bottom: 4px;
    }
    .filter-submit {
      margin-top: 8px;
    }
    .filter-loader {
      background-color: hsl(0, 0%, 83%);
      height: 8px;
      margin: 8px auto;
      max-width: 200px;
      overflow: hidden;
      position: relative;
      visibility: hidden;
    }
    .filter-loader.is-shown {
      visibility: visible;
    }
    .filter-loader__foreground {
      animation: loading 1.2s ease-in-out forwards infinite;
      animation-play-state: paused;
      border-left: 24px solid #00bcd4;
      height: 100%;
      position: absolute;
      width: 100%;
    }
    .filter-loader.is-shown > .filter-loader__foreground {
      animation-play-state: running;
    }

    @keyframes loading {
      0% {
        transform: translateX(-24px);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `;

  GM_addStyle(css);

  /* ========== Utility functions ========== */

  const filterUtils = {
    /**
     * Renders a large number of rows in chunks so that it doesn't make the UI unresponsive for too long.
     * @param {Array} array
     * @param {Function} cb - A callback function that returns a table row
     * @param {Number} maxTimePerChunk - Time per chunk, in milliseconds
     * @param {Number} [index = 0] - Starts processing the array from here
     * @returns {Promise}
     */
    processLargeArray(array, cb, maxTimePerChunk = 100, index = 0) {
      function now() {
        return new Date().getTime();
      }

      function processChunk() {
        const startTime = now();
        const fragment = new DocumentFragment();
        while (index < array.length && (now() - startTime) <= maxTimePerChunk) {
          const row = cb(array[index], index, array);
          row && fragment.appendChild(row);
          index++;
        }
        CONSTANTS.elements.tableBody.appendChild(fragment);

        return new Promise((resolve) => {
          if (index < array.length) {
            // Do next chunk
            return setTimeout(() => resolve(processChunk(), 0));
          } else {
            // Number of rows processed
            return resolve(index);
          }
        });
      }

      return processChunk();
    },

    getTags() {
      return fetch('./adoptable_guide.php')
        .then((res) => res.text())
        .then((text) => {
          const parser = new DOMParser();
          const tags = Array.from(parser.parseFromString(text, 'text/html').body
            .querySelectorAll('a[href*="/adoptable_guide.php?tag="]'))
            .map((link) => link.textContent);
          return tags;
        });
    },

    getIdsInTag(tag) {
      return fetch(`./adoptable_guide.php?tag=${tag}`)
        .then((res) => res.text())
        .then((text) => {
          const parser = new DOMParser();
          const idsInTag = Array.from(parser.parseFromString(text, 'text/html').body
            .querySelectorAll('a[href*="/adoptable_guide.php?id="]'))
            .map((link) => link.href.match(/\d+/)[0]);
          return idsInTag;
        });
    },

    /**
     * Processes all data rows for a single table section, i.e. "You need", "They need", "You both have".
     * @param {Object} destination - Where the processed data will be appended
     * @param {Node} startingHeading - Rows after this heading row will be processed
     */
    processAdoptableRows(destination, startingHeading) {
      const destCopy = { ...destination };
      let row = startingHeading.nextElementSibling;

      while (row !== null && !row.matches('.headingRow')) {
        const [col1, col2, col3] = [...row.children];
        const idSeparatorIndex = col1.textContent.indexOf('.');
        const adoptableId = col1.textContent.slice(0, idSeparatorIndex);

        const obj = {
          id: adoptableId,
          name: col1.textContent.slice(idSeparatorIndex + 2).trim(),
          mine: col2.textContent.trim() || 0,
          theirs: col3.textContent.trim() || 0
        };

        destCopy[adoptableId] = obj;
        row = row.nextElementSibling;
      }
      return destCopy;
    },

    /**
     * Creates a <tr> element with the provided adoptable object.
     * @param {Object} adoptable
     * @returns {Node}
     */
    createTableRow(adoptable) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="text-align: left;">${adoptable.id}. ${adoptable.name}<a href="https://www.clickcritters.com/adoptable_guide.php?id=${adoptable.id}"><img src="https://www.clickcritters.com/images/magnify.png"></a></td>
        <td>
          <a href="https://www.clickcritters.com/youradoptables.php?act=collection&amp;id=${filterData.myId}&amp;typeid=${adoptable.id}">${adoptable.mine} <img src="https://www.clickcritters.com/images/alertbox_${adoptable.mine ? 'green' : 'red'}.png" height="15"></a>
        </td>
        <td>
          <a href="https://www.clickcritters.com/youradoptables.php?act=collection&amp;id=${filterData.theirId}&amp;typeid=${adoptable.id}">${adoptable.theirs} <img src="https://www.clickcritters.com/images/alertbox_${adoptable.theirs ? 'green' : 'red'}.png" height="15"></a>
        </td>
      `;
      return row;
    },

    /**
     * Goes through a list of adoptables and returns the HTML based on the selected options.
     * @param {Object} params
     * @param {Object} params.adopts - All adoptables in a particular section; i.e. "I Need", "They Need", "Both Have"
     * @param {Array} [params.idsInTag = Object.keys(params.adopts)] - All adoptable IDs in the selected tag. If empty or undefined, then no tag was selected.
     * @param {Boolean} [params.mySparesChecked] - Check box value for "My collection - only spares and missing"
     * @param {Boolean} [params.theirSparesChecked] - Check box value for "Their collection - only spares and missing"
     * @returns {Promise}
     */
    getFilteredAdoptables({ adopts, idsInTag = [], mySparesChecked, theirSparesChecked }) {
      const processAllAdopts = idsInTag.length === 0 && !mySparesChecked && !theirSparesChecked;
      if (idsInTag.length === 0) {
        idsInTag = Object.keys(adopts);
      }

      return filterUtils.processLargeArray(idsInTag, (id, index, array) => {
        if (processAllAdopts) {
          return filterUtils.createTableRow(adopts[id]);
        }

        if (Object.hasOwnProperty.call(adopts, id)) {
          if (
            (mySparesChecked && theirSparesChecked && adopts[id].mine != 1 && adopts[id].theirs != 1)
            || (!mySparesChecked && !theirSparesChecked)
            || (!mySparesChecked && adopts[id].theirs != 1)
            || (!theirSparesChecked && adopts[id].mine != 1)
          ) {
            return filterUtils.createTableRow(adopts[id]);
          } else {
            return null;
          }
        }
      });
    },

    /**
     * @param {('iNeed'|'theyNeed'|'bothHave')} section
     */
    createTableHeading(section) {
      const text = CONSTANTS.messages[section];
      const id = CONSTANTS.ids[section];
      const el = document.createElement('tr');
      el.classList.add('headingRow');
      el.id = id;
      el.innerHTML = `<td colspan="3">${text}</td>`;
      CONSTANTS.elements.tableBody.appendChild(el);
    },

    clearTable() {
      function now() {
        return new Date().getTime();
      }

      function removeRows() {
        const startTime = now();
        const maxTimePerChunk = 100;
        let rowCount = CONSTANTS.elements.tableBody.children.length;
        while (rowCount > 1 && (now() - startTime) <= maxTimePerChunk) {
          CONSTANTS.elements.tableBody.removeChild(CONSTANTS.elements.tableBody.lastChild);
          rowCount--;
        }

        return new Promise((resolve) => {
          if (CONSTANTS.elements.tableBody.children.length > 1) {
            return setTimeout(() => resolve(removeRows(), 0));
          } else {
            return resolve();
          }
        });
      }

      return removeRows();
    },

    setLoaderVisibility(state) {
      const loader = document.querySelector('.filter-loader');
      if (state === 'show') {
        CONSTANTS.elements.table.ariaBusy = true;
        loader.classList.add('is-shown');
        document.querySelector('#filter-form [type="submit"]').disabled = true;
      } else if (state === 'hide') {
        CONSTANTS.elements.table.ariaBusy = false;
        loader.classList.remove('is-shown');
        document.querySelector('#filter-form [type="submit"]').disabled = false;
      }
    }
  };

  const savedSetsKey = 'savedTagSets';
  const savedSetUtils = {
    getAll() {
      return JSON.parse(localStorage.getItem(savedSetsKey)) ?? {};
    },

    save(name, tags) {
      const sets = savedSetUtils.getAll();
      sets[name] = [...tags];
      localStorage.setItem(savedSetsKey, JSON.stringify(sets));
    },

    delete(name) {
      const sets = savedSetUtils.getAll();
      delete sets[name];
      localStorage.setItem(savedSetsKey, JSON.stringify(sets));
    }
  };

  /* ========== Main code ========== */

  (function init() {
    CONSTANTS.elements.table.ariaLive = 'polite';
    CONSTANTS.elements.table.ariaBusy = false;

    // Append form elements to page
    const filterWrapper = document.createElement('div');
    filterWrapper.id = 'collection-filter';
    filterWrapper.innerHTML = `
      <form id="tag-search-form" novalidate>
        <label style="width: 100%;">Search for a tag: <input list="tag-list" id="tag-selection" name="tag-selection" /></label>
        <datalist id="tag-list"></datalist>
        <button type="submit">
          Add Tag
        </button>
      </form>
      <section>
        <h3>Saved Tag Sets</h3>
        <div id="saved-tags-list" class="tag-chip-wrapper" role="group" aria-label="Saved Tag Sets" aria-live="polite"></div>
        <button id="save-tags-btn" type="button">Save Currently Selected Tags</button>
      </section>
      <div class="form-wrapper">
        <section>
          <h3>Selected Tags</h3>
          <div id="selected-tags" class="tag-chip-wrapper" role="group" aria-label="Selected Tags" aria-live="polite"></div>
        </section>
        <form id="filter-form">
          <label>My collection - only spares and missing: <input type="checkbox" name="my-spares-only"/></label>
          <label>Their collection - only spares and missing: <input type="checkbox" name="their-spares-only"/></label>
          <button type="submit" class="filter-submit">
            Filter
          </button>
          <div class="filter-loader"><div class="filter-loader__foreground"></div></div>
        </div>
      </form>
    `;
    document.querySelector('#megaContent center').insertBefore(filterWrapper, CONSTANTS.elements.table);

    let cached = JSON.parse(localStorage.getItem('guideTags'));
    const p = new Promise((resolve) => {
      // Get adoptable guide tags
      const currentTime = new Date().getTime();
      if (cached === null || currentTime > cached.expiry) {
        filterUtils.getTags().then((tags) => {
          localStorage.setItem('guideTags', JSON.stringify({
            data: tags,
            expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
          }));
          resolve();
        });
      } else {
        resolve();
      }
    });

    p.then(() => {
      // Append tags to dropdown
      const tagsFragment = new DocumentFragment();
      cached.data.forEach((tag) => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagsFragment.appendChild(option);
      });
      document.querySelector('#tag-list').appendChild(tagsFragment);
    });

    // Get user IDs being compared
    const myCollectionQueryParams = new URL(document.querySelector('.niceTable tr > td:nth-child(2) > a').href).searchParams;
    const theirCollectionQueryParams = new URL(document.querySelector('.niceTable tr > td:nth-child(3) > a').href).searchParams;
    filterData.myId = myCollectionQueryParams.get('id');
    filterData.theirId = theirCollectionQueryParams.get('id');

    // Construct JS object out of the table
    filterData.adoptables.iNeed = filterUtils.processAdoptableRows(filterData.adoptables.iNeed, CONSTANTS.elements.iNeedHeading);
    filterData.adoptables.theyNeed = filterUtils.processAdoptableRows(filterData.adoptables.theyNeed, CONSTANTS.elements.theyNeedHeading);
    filterData.adoptables.bothHave = filterUtils.processAdoptableRows(filterData.adoptables.bothHave, CONSTANTS.elements.bothHaveHeading);

    const selectedTagsSet = new Set();

    const renderTagChips = () => {
      const container = document.querySelector('#selected-tags');
      if (selectedTagsSet.size === 0) {
        container.innerHTML = 'No tags selected';
        return;
      }
      container.innerHTML = '';
      selectedTagsSet.forEach((tag) => {
        const chip = document.createElement('div');
        chip.className = 'tag-chip';
        chip.innerHTML = `<span class="tag-chip-label">${tag}</span><button type="button" class="tag-chip-remove" aria-label="Remove ${tag}">×</button>`;
        chip.querySelector('.tag-chip-remove').addEventListener('click', () => {
          selectedTagsSet.delete(tag);
          renderTagChips();
        });
        container.appendChild(chip);
      });
    };

    // Tag search handler
    document.querySelector('#tag-search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.querySelector('#tag-selection');

      // Clear out errors between submissions
      input.setCustomValidity('');

      const validTags = [...document.querySelectorAll('#tag-list option')].map(o => o.value);
      const selectedTag = input.value.trim();

      if (!selectedTag) {
        return;
      }

      if (!validTags.includes(selectedTag)) {
        input.setCustomValidity('Please select a valid tag from the list.');
        input.reportValidity();
        return;
      }

      input.reportValidity();
      selectedTagsSet.add(selectedTag);
      renderTagChips();
      input.value = '';
    });

    const renderTagSets = () => {
      const container = document.querySelector('#saved-tags-list');
      const sets = savedSetUtils.getAll();
      const setEntries = Object.entries(sets);

      if (setEntries.length === 0) {
        container.innerHTML = 'No sets saved';
        return;
      }

      container.innerHTML = '';

      setEntries.forEach(([name, tags]) => {
        const el = document.createElement('div');
        el.classList.add('tag-chip');
        el.innerHTML = `
          <button type="button" class="tag-chip-label saved-set-load" aria-label="Load ${name}">${name}</span>
          <button type="button" class="tag-chip-remove" aria-label="Delete ${name}">×</button>
        `;

        el.querySelector('.saved-set-load').addEventListener('click', () => {
          const confirmation = window.confirm('Are you sure you want to replace all currently applied tags with tag set?');
          if (!confirmation) {
            return;
          }
          selectedTagsSet.clear();
          tags.forEach((tag) => selectedTagsSet.add(tag));
          renderTagChips();
        });

        el.querySelector('.tag-chip-remove').addEventListener('click', () => {
          const confirmation = window.confirm('Are you sure you want to delete this tag set?');
          if (!confirmation) {
            return;
          }
          savedSetUtils.delete(name);
          renderTagSets();
        });

        container.appendChild(el);
      });
    };

    document.querySelector('#save-tags-btn').addEventListener('click', (e) => {
      e.preventDefault();

      if (selectedTagsSet.size === 0) {
        return;
      }

      const name = window.prompt('Enter a name for this tag set:')?.trim();
      if (!name) {
        return;
      }

      savedSetUtils.save(name, selectedTagsSet);
      renderTagSets();
    });

    renderTagSets();
    renderTagChips();

    // Form submit handler
    document.querySelector('#filter-form').addEventListener('submit', (e) => {
      e.preventDefault();
      filterUtils.setLoaderVisibility('show');

      // Defer all the stuff in here to give the loader a chance to appear on the page first
      setTimeout(async () => {
        const adoptableData = filterData.adoptables;
        const filterFormData = new FormData(document.querySelector('#filter-form'));
        const mySparesChecked = filterFormData.get('my-spares-only');
        const theirSparesChecked = filterFormData.get('their-spares-only');

        let idsInTag;

        const p1 = filterUtils.clearTable();

        // Fetching adoptable IDs in the tag, or re-using cached data
        if (selectedTagsSet.size > 0) {
          const fetchPromises = [...selectedTagsSet].map((tag) => {
            if (Object.hasOwn(filterData.tagCache, tag)) {
              return Promise.resolve(filterData.tagCache[tag]);
            }

            return filterUtils.getIdsInTag(tag).then((ids) => {
              filterData.tagCache[tag] = ids;
              return ids;
            });
          });

          const results = await Promise.all([p1, ...fetchPromises]);
          // results[0] is p1 (clearTable), rest are ID arrays per tag
          const idArrays = results.slice(1);

          // Union all tag ID sets
          idsInTag = [...new Set(idArrays.flat())];
        } else {
          await p1;
          idsInTag = [];
        }

        const createASection = (section) => {
          filterUtils.createTableHeading([section]);
          return filterUtils.getFilteredAdoptables({
            adopts: adoptableData[section],
            idsInTag,
            mySparesChecked,
            theirSparesChecked
          });
        };

        await createASection('iNeed');
        await createASection('theyNeed');
        await createASection('bothHave');

        filterUtils.setLoaderVisibility('hide');
      }, 0);
    });
  })();
}());
