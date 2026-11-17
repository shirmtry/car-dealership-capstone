export async function api(path, options = {}) {
  const token = document.cookie.split('; ').find((item) => item.startsWith('csrftoken='));
  const headers = { ...options.headers };
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token && options.method && options.method !== 'GET') {
    headers['X-CSRFToken'] = decodeURIComponent(token.split('=')[1]);
  }
  const response = await fetch('/djangoapp/' + path, {
    ...options, headers, credentials: 'same-origin'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed (' + response.status + ')');
  }
  return data;
}
