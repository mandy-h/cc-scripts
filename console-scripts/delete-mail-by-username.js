/**
 * HOW TO USE
 * Change the `usernames` variable to the name(s) of the sender you want to delete mail from.
 * Once mail is deleted, it's gone forever, so make sure you want to delete all these messages before you press the Enter key.
 * Once the mail is deleted, a message will be printed to the console. Refresh the page to see the updated inbox.
 */
var usernames = [
  'Cherry',
  'ClickCritters',
  'goclickcritters',
  'Ringmaster Riley',
];
var selector = usernames
  .map((username) => `#mail_heading [href*="/user/${username}"]`)
  .join(',');
var profileLinks = document.querySelectorAll(selector);

var requests = Array.from(profileLinks).map((link) => {
  const mailToDelete = link.parentElement.nextElementSibling.querySelector('a').href;
  return fetch(mailToDelete);
});

Promise.all(requests).then(() => {
  console.log('Deleted ' + profileLinks.length + ' messages');
});