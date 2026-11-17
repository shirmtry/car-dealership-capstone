'use strict';

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function launchBrowser() {
  const chromePath = process.env.CAPSTONE_CHROME ||
    'C:/Program Files/Google/Chrome/Application/chrome.exe';
  if (!fs.existsSync(chromePath)) {
    throw new Error('Set CAPSTONE_CHROME to the installed Chrome or Edge executable.');
  }
  const port = 9336;
  const profile = path.join(root, '.local', 'chrome-' + Date.now());
  fs.mkdirSync(profile, { recursive: true });
  fs.mkdirSync(path.join(profile, 'Default'), { recursive: true });
  fs.writeFileSync(path.join(profile, 'Default', 'Preferences'), JSON.stringify({
    credentials_enable_service: false,
    profile: { password_manager_enabled: false }
  }));
  const browserProcess = spawn(chromePath, [
    '--new-window', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-save-password-bubble', '--force-device-scale-factor=1',
    '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=' + port,
    '--user-data-dir=' + profile, '--window-size=1440,900',
    '--window-position=10,10', 'about:blank'
  ], { stdio: 'ignore' });
  let target;
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
      target = targets.find((item) => item.type === 'page');
      if (target) { break; }
    } catch (error) { /* Chrome is still starting. */ }
    await sleep(200);
  }
  if (!target) { browserProcess.kill(); throw new Error('Chrome did not expose a page target.'); }
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 1;
  const pending = new Map();
  socket.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response.id && pending.has(response.id)) {
      const promise = pending.get(response.id);
      clearTimeout(promise.timer);
      pending.delete(response.id);
      if (response.error) { promise.reject(new Error(JSON.stringify(response.error))); }
      else { promise.resolve(response.result); }
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 20000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) { throw new Error(JSON.stringify(response.exceptionDetails)); }
    return response.result.value;
  };
  const waitFor = async (expression, description, timeout = 30000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await evaluate(expression).catch(() => false)) { return; }
      await sleep(150);
    }
    throw new Error('UI timeout: ' + description + '\n' + await evaluate('document.body.innerText'));
  };
  const goto = async (url) => {
    console.log('NAVIGATE ' + url);
    await send('Page.navigate', { url });
    await waitFor('location.href === ' + JSON.stringify(url) + ' && document.readyState === "complete"', 'document loaded at the requested URL');
  };
  const fill = async (selector, value) => {
    await evaluate('(() => { const input = document.querySelector(' + JSON.stringify(selector) + '); if (!input) { throw new Error("Input not found"); } input.focus(); if (input.select) { input.select(); } })()');
    await send('Input.insertText', { text: String(value) });
  };
  const nativeValue = async (selector, value) => {
    await evaluate('(() => { const input = document.querySelector(' + JSON.stringify(selector) + '); const prototype = input.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, "value").set.call(input, ' + JSON.stringify(String(value)) + '); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); })()');
  };
  const click = async (selector) => {
    await evaluate('(() => { const element = document.querySelector(' + JSON.stringify(selector) + '); if (!element) { throw new Error("Control not found"); } element.click(); })()');
  };
  const capture = async (filename) => {
    await send('Page.bringToFront');
    await evaluate('document.activeElement && document.activeElement.blur()');
    await sleep(250);
    const location = await evaluate('location.href');
    const output = path.resolve(root, filename);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const result = spawnSync('powershell.exe', [
      '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'window.ps1'),
      '-BrowserProcessId', String(browserProcess.pid), '-OutputPath', output
    ], { encoding: 'utf8', windowsHide: true });
    if (result.status !== 0) { throw new Error(result.stdout + result.stderr); }
    const metadata = JSON.parse(result.stdout.trim());
    if (metadata.width < 1280 || metadata.height < 800) { throw new Error('Capture is below the rubric resolution.'); }
    metadata.url = location;
    metadata.capturedAt = new Date().toISOString();
    console.log('CAPTURE ' + JSON.stringify(metadata));
    const historyPath = path.join(root, '.local', 'capture-metadata.json');
    const history = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, 'utf8')) : [];
    history.push(metadata);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + '\n');
    return metadata;
  };
  await send('Page.enable');
  await send('Runtime.enable');
  return { goto, fill, nativeValue, click, waitFor, evaluate, capture,
    close: () => { socket.close(); browserProcess.kill(); } };
}

module.exports = { launchBrowser };
