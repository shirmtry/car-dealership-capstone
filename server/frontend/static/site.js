'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const panel = document.querySelector('[data-auth]');
  if (!panel) {
    return;
  }
  try {
    const response = await fetch('/djangoapp/session', { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error('Account status is unavailable');
    }
    const session = await response.json();
    if (session.isAuthenticated) {
      panel.replaceChildren();
      const username = document.createElement('span');
      username.className = 'username';
      username.textContent = session.userName;
      const button = document.createElement('button');
      button.className = 'nav-button';
      button.textContent = 'Logout';
      button.addEventListener('click', async () => {
        button.disabled = true;
        const result = await fetch('/djangoapp/logout', {
          method: 'POST', credentials: 'same-origin'
        });
        if (result.ok) {
          location.assign('/');
        } else {
          button.disabled = false;
        }
      });
      panel.append(username, button);
    }
  } catch (error) {
    panel.textContent = error.message;
  }
});
