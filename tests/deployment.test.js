const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');

function waitFor(check, message) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 5000;
    const poll = () => {
      const value = check();
      if (value) return resolve(value);
      if (Date.now() >= deadline) return reject(new Error(message));
      setTimeout(poll, 20);
    };
    poll();
  });
}

async function connectPlayer(baseUrl, name) {
  const socket = new WebSocket(baseUrl.replace('http:', 'ws:') + '/socket.io/?EIO=4&transport=websocket');
  const events = [];
  let connected = false;
  socket.addEventListener('message', ({ data }) => {
    const packet = String(data);
    if (packet.startsWith('0')) socket.send('40');
    else if (packet.startsWith('40')) connected = true;
    else if (packet === '2') socket.send('3');
    else if (packet.startsWith('42')) events.push(JSON.parse(packet.slice(2)));
  });
  try {
    await waitFor(() => connected, 'Socket.IO handshake did not complete');
    socket.send('42' + JSON.stringify(['join-room', { code: 'DEPLOY', name, role: 'player' }]));
    return { socket, events };
  } catch (error) {
    socket.close();
    throw error;
  }
}

test('production startup honors PORT, serves health and assets, and shares a room over WebSockets', { timeout: 15000 }, async (t) => {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '0', NODE_ENV: 'production', OPENAI_API_KEY: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  t.after(async () => {
    if (child.exitCode === null) {
      const closed = once(child, 'close');
      child.kill();
      await closed;
    }
  });
  const port = await waitFor(() => stdout.match(/http:\/\/localhost:(\d+)/)?.[1], 'Server did not start: ' + stderr);
  assert.notEqual(Number(port), 3000);
  const baseUrl = 'http://127.0.0.1:' + port;

  const health = await fetch(baseUrl + '/health');
  assert.equal(health.status, 200);
  assert.match(health.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await health.json(), { status: 'ok' });

  for (const [asset, type] of [['/', /text\/html/], ['/style.css', /text\/css/], ['/script.js', /javascript/], ['/socket.io/socket.io.js', /javascript/]]) {
    const response = await fetch(baseUrl + asset);
    assert.equal(response.status, 200, asset);
    assert.match(response.headers.get('content-type'), type);
    assert((await response.text()).length > 0, asset);
  }
  for (const secretPath of ['/.env', '/server.js', '/package.json']) {
    assert.equal((await fetch(baseUrl + secretPath)).status, 404, secretPath);
  }
  const polling = await fetch(baseUrl + '/socket.io/?EIO=4&transport=polling', { headers: { Origin: 'https://unrelated.example' } });
  assert.equal(polling.status, 200);
  assert.equal(polling.headers.get('access-control-allow-origin'), null);
  const handshake = await polling.text();
  assert.equal(handshake[0], '0');
  assert(JSON.parse(handshake.slice(1)).upgrades.includes('websocket'));

  const first = await connectPlayer(baseUrl, 'Celular A');
  t.after(() => first.socket.close());
  const second = await connectPlayer(baseUrl, 'Celular B');
  t.after(() => second.socket.close());
  for (const player of [first, second]) {
    const state = await waitFor(
      () => player.events.find(([event, data]) => event === 'room:update' && data.players?.length === 2)?.[1],
      'The two clients did not receive the same room'
    );
    assert.deepEqual(state.players.map((entry) => entry.name).sort(), ['Celular A', 'Celular B']);
  }
});
