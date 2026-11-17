'use strict';

const fs = require('fs');
const path = require('path');
const { launchBrowser } = require('./browser');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const group = args[args.indexOf('--group') + 1] || 'local';
const credentials = JSON.parse(fs.readFileSync(path.join(root, '.local', 'credentials.json'), 'utf8').replace(/^\uFEFF/, ''));

async function login(tab, base, username, password) {
  await tab.goto(base + '/login');
  await tab.waitFor('!!document.querySelector("#login-username")', 'login form');
  await tab.fill('#login-username', username);
  await tab.fill('#login-password', password);
  await tab.click('button[type="submit"]');
  await tab.waitFor('location.pathname === "/dealers" && document.body.innerText.includes(' + JSON.stringify(username) + ')', 'authenticated dealer page');
  const session = await tab.evaluate('fetch("/djangoapp/session").then(response => response.json())');
  if (!session.isAuthenticated || session.userName !== username) {
    throw new Error('The server session did not authenticate.');
  }
  console.log('AUTHENTICATED real Django session: ' + session.userName);
}

async function register(tab, base, username) {
  await tab.goto(base + '/register');
  await tab.waitFor('!!document.querySelector("#register-username")', 'registration form');
  for (const [selector, value] of [
    ['#register-username', username], ['#register-firstname', 'Casey'],
    ['#register-lastname', 'Morgan'], ['#register-email', username + '@example.com'],
    ['#register-password', 'UiDemo!2026Only'], ['#register-confirm', 'UiDemo!2026Only']
  ]) { await tab.fill(selector, value); }
  await tab.click('button[type="submit"]');
  await tab.waitFor('location.pathname === "/dealers" && document.body.innerText.includes(' + JSON.stringify(username) + ')', 'registered and authenticated user');
  const session = await tab.evaluate('fetch("/djangoapp/session").then(response => response.json())');
  if (!session.isAuthenticated || session.userName !== username) { throw new Error('Registration did not establish a session.'); }
  console.log('REGISTERED through real React form: ' + username);
  return session;
}

async function review(tab, base, text, beforeFilename, afterFilename) {
  await tab.goto(base + '/postreview/15');
  await tab.waitFor('document.querySelector("#cars") && document.querySelector("#cars").options.length > 5', 'ORM car choices');
  await tab.fill('#review', text);
  await tab.evaluate('(() => { const select = document.querySelector("#cars"); const option = Array.from(select.options).find(item => item.textContent === "Audi A6"); if (!option) { throw new Error("Audi A6 is missing"); } select.value = option.value; select.dispatchEvent(new Event("change", { bubbles: true })); })()');
  await tab.nativeValue('#purchase-date', '2026-11-10');
  await tab.nativeValue('#car-year', '2021');
  await tab.waitFor('document.querySelector("#review").value.length > 10 && document.querySelector("#purchase-date").value === "2026-11-10" && document.querySelector("#car-year").value === "2021"', 'filled review form');
  if (beforeFilename) { await tab.capture(beforeFilename); }
  await tab.click('button.postreview');
  await tab.waitFor('location.pathname === "/dealer/15" && document.body.innerText.includes(' + JSON.stringify(text) + ')', 'review persisted and displayed');
  await tab.capture(afterFilename);
  console.log('POSTED through the real review UI: ' + text);
}

async function main() {
  const tab = await launchBrowser();
  const local = 'http://127.0.0.1:8000';
  try {
    if (group === 'qa') {
      await tab.goto(local + '/about');
      await tab.waitFor('Array.from(document.images).every(image => image.complete && image.naturalWidth > 0)', 'About images loaded');
      await tab.capture('.local/about-page.png');
      await tab.goto(local + '/contact');
      await tab.waitFor('Array.from(document.images).every(image => image.complete && image.naturalWidth > 0)', 'Contact image loaded');
      await tab.capture('.local/contact-page.png');
    } else if (group === 'admin') {
      await tab.goto(local + '/admin/login/?next=/admin/');
      await tab.waitFor('!!document.querySelector("#id_username")', 'real Django admin login form');
      await tab.fill('#id_username', credentials.adminUsername);
      await tab.fill('#id_password', credentials.adminPassword);
      await tab.click('input[type="submit"]');
      await tab.waitFor('document.body.innerText.includes("Site administration") && document.body.innerText.toLowerCase().includes("root")', 'root logged into Django admin');
      await tab.capture('screenshots/admin_login.png');
      await tab.click('#logout-form button');
      await tab.waitFor('document.body.innerText.includes("Logged out")', 'real admin logout page');
      await tab.capture('screenshots/admin_logout.png');
    } else if (group === 'register') {
      const username = 'ui_capstone_' + Date.now();
      const session = await register(tab, local, username);
      fs.writeFileSync(path.join(root, '.local', 'registration-verification.json'), JSON.stringify(session, null, 2));
      await tab.capture('.local/register-success.png');
    } else if (group === 'local') {
      await tab.goto(local + '/dealers');
      await tab.waitFor('document.querySelectorAll("tbody tr").length === 50 && document.body.innerText.includes("Login")', 'logged-out dealers');
      await tab.capture('screenshots/get_dealers.png');
      await login(tab, local, credentials.username, credentials.password);
      await tab.waitFor('document.body.innerText.includes("Review Dealer")', 'authenticated review links');
      await tab.capture('screenshots/get_dealers_loggedin.png');
      await tab.evaluate('(() => { const state = document.querySelector("#state"); state.value = "Kansas"; state.dispatchEvent(new Event("change", { bubbles: true })); })()');
      await tab.waitFor('location.search.includes("Kansas") && document.querySelectorAll("tbody tr").length === 1 && document.body.innerText.includes("Topeka")', 'real Kansas filter and URL');
      await tab.capture('screenshots/dealersbystate.png');
      await tab.goto(local + '/dealer/15');
      await tab.waitFor('document.body.innerText.includes("Berkly Shepley")', 'dealer details and seeded reviews');
      await tab.capture('screenshots/dealer_id_reviews.png');
      await review(tab, local, 'Fantastic services! The staff was helpful and made buying my Audi A6 easy.',
        'screenshots/dealership_review_submission.png', 'screenshots/added_review.png');
    } else if (group === 'deployed') {
      const base = fs.readFileSync(path.join(root, 'deploymentURL'), 'utf8').trim().replace(/\/$/, '');
      if (!base.startsWith('https://')) { throw new Error('A verified HTTPS deployment URL is required.'); }
      await tab.goto(base + '/');
      await tab.waitFor('document.body.innerText.includes("Welcome to our Dealerships!")', 'real deployed landing page', 60000);
      await tab.capture('screenshots/deployed_landingpage.png');
      const username = 'deploy_capstone_' + Date.now();
      await register(tab, base, username);
      fs.writeFileSync(path.join(root, '.local', 'deployed-demo.json'), JSON.stringify({ username, password: 'UiDemo!2026Only', base }, null, 2));
      await tab.waitFor('document.body.innerText.includes("Review Dealer")', 'deployed authenticated dealer links');
      await tab.capture('screenshots/deployed_loggedin.png');
      await tab.goto(base + '/dealer/15');
      await tab.waitFor('document.body.innerText.includes("Berkly Shepley")', 'deployed backend reviews');
      await tab.capture('screenshots/deployed_dealer_detail.png');
      await review(tab, base, 'Fantastic services on the deployed app. Friendly staff and a smooth car purchase.', null,
        'screenshots/deployed_add_review.png');
    } else { throw new Error('Unknown capture group: ' + group); }
  } finally { tab.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
