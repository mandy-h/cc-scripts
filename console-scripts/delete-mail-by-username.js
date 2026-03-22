/**
 * HOW TO USE
 * Change the `usernames` variable to the name(s) of the sender you want to delete mail from.
 * Once mail is deleted, it's gone forever, so make sure you want to delete all these messages before you press the Enter key.
 * Once the mail is deleted, a message will be printed to the console. Refresh the page to see the updated inbox.
 */

(async function () {
  const usernames = [
    'Cherry',
    'ClickCritters',
    'goclickcritters',
    'Ringmaster Riley',
  ];

  const selector = usernames
    .map((username) => `#mail_heading [href*="/user/${username}"]`)
    .join(',');
  const links = document.querySelectorAll(selector);
  let savedMailCount = 0;

  const mailToDelete = Array.from(links).reduce((acc, link) => {
    const heading = link.closest('#mail_heading');
    const isMailSaved = heading.textContent.toLowerCase().includes('(saved)');
    if (isMailSaved) {
      savedMailCount++;
    } else {
      acc.push(heading.querySelector('[href*="mail.php?deleteid="]').href);
    }
    return acc;
  }, []);

  console.log('Found', links.length, 'messages');
  await batchProcess(mailToDelete);
  console.log('Deleted', (links.length - savedMailCount), 'messages');
  console.log('Ignored', savedMailCount, 'saved messages');
  console.log('Refresh the page to see the updated inbox');
})();

async function batchProcess(tasks, batchSize = 5) {
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    await Promise.all(batch.map(handleLink));
  }
}

async function handleLink(url) {
  try {
    await fetch(url);
  } catch (err) {
    console.error('Failed:', url, err);
  }
}
