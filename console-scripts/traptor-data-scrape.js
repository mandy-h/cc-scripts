/**
 * Utility scripts for Traptor spreadsheets.
 */

// Un-comment to use
// getCsv(7);
// sumTagPageQuantities();

/**
 * Converts adoptable quantities on a tag page to CSV format.
 */
function getCsv(columnCount) {
  /*
    Change firstId and lastId to match the range of IDs you want included.
    Then run this script on any tag page that has all the Traptors you're targeting, e.g. "Tropical", "Traptor".
    Tropical Traptor range: 11634-12508
    Mythical Traptor range: 14347-15221
  */
  const firstId = 11634;
  const lastId = 12508;
  const tropicalTraptors = Array.from(document.querySelectorAll('a[href*="/youradoptables.php?act=collection&id=')).filter((el) => {
    const searchParams = new URLSearchParams(el.href);
    const typeId = Number(searchParams.get('typeid'));
    if (typeId >= firstId && typeId <= lastId) {
      return el;
    }
  });

  const str = tropicalTraptors.reduce((accumulator, el, index) => {
    if ((index + 1) % columnCount === 0) {
      return accumulator + el.innerText.match(/\d+/)[0] + '\n';
    } else {
      return accumulator + el.innerText.match(/\d+/)[0] + ',';
    }
  }, '');

  console.log(str);
}

/**
 * Sums up the owned quantity of adopts on any tag page.
 */
function sumTagPageQuantities() {
  const sum = Array.from(document.querySelectorAll('a[href*="/youradoptables.php?act=collection&id=')).reduce((accumulator, el) => {
    return accumulator + Number(el.innerText.match(/\d+/)[0]);
  }, 0);
  console.log(sum);
}
