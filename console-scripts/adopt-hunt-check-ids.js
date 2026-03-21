/**
 * This script checks the adopts in your folder to see if their IDs meet the minimum ID requirement for the adopt hunt.
 * THIS IS ONLY FOR CHECKING IDS, it doesn't doesn't check for any other requirements.
 *
 * HOW TO USE
 * Change minId to whatever the minimum ID requirement is for the current adopt hunt.
 * Run the script on your adopt hunt folder page.
 */

var minId = 16002068;
var failCount = 0;
var adopts = Array.from(document.querySelectorAll('#megaContent .adopt'));

adopts.forEach((adopt, index) => {
  const currentId = Number(adopt.src.match(/\d+/g)[0]);

  if (currentId < minId) {
    failCount++;

    console.log(
      `Adopt #${index + 1} with ID ${currentId} doesn't meet the minimum ID requirement`,
    );

    const adoptImage = document.querySelector(
      `img[src="https://www.clickcritters.com/images/adoptables/${currentId}.gif"]`,
    );
    adoptImage.style.border = '2px dashed red';
    adoptImage.style.background = '#ffcaca';
  }
});

console.log(`${failCount} ineligible IDs found`);
