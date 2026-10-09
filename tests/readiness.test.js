const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(check, label = 'event') {
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await pause(20);
  }
  throw Error('Timeout: ' + label);
}

async function setup(t, extraEnv = {}) {
  const child = spawn(process.execPath, ['--require', path.join(__dirname, 'fixtures/readiness-openai.cjs'), 'server.js'], {
    cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: '0', NODE_ENV: 'production', OPENAI_API_KEY: 'test-readiness', ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  const clients = [];
  t.after(async () => {
    clients.forEach(client => client.socket.close());
    if (child.exitCode === null) { const closed = once(child, 'close'); child.kill(); await closed; }
  });
  const port = await waitFor(() => logs.match(/localhost:(\d+)/)?.[1], 'startup');
  const event = (client, name, check = () => true) => waitFor(() => client.events.find(([type, data]) => type === name && check(data))?.[1], name);
  const connect = async (name, role = 'player', code = 'QA26') => {
    const socket = new WebSocket(`ws://127.0.0.1:${port}/socket.io/?EIO=4&transport=websocket`);
    const client = { socket, events: [], connected: false, emit: (type, data) => socket.send('42' + JSON.stringify(data === undefined ? [type] : [type, data])) };
    clients.push(client);
    socket.addEventListener('message', ({ data }) => {
      const packet = String(data);
      if (packet.startsWith('0')) socket.send('40');
      else if (packet.startsWith('40')) { client.connected = true; client.id = JSON.parse(packet.slice(2)).sid; }
      else if (packet === '2') socket.send('3');
      else if (packet.startsWith('42')) client.events.push(JSON.parse(packet.slice(2)));
    });
    await waitFor(() => client.connected, 'connection');
    client.emit('join-room', { code, name, role });
    await event(client, 'room:update', state => state.players.some(player => player.id === client.id));
    return client;
  };
  const master = await connect('Mestre QA', 'master');
  const p1 = await connect('Jogador 1');
  const p2 = await connect('Jogador 2');
  await event(master, 'room:update', state => state.players.length === 3);
  const clear = () => clients.forEach(client => { client.events = []; });
  clear();
  return { child, port, master, p1, p2, connect, event, clear, logs: () => logs };
}

test('readiness: complete adventure with master, two players, isolated secrets, dice, inventory and combat', async t => {
  const f = await setup(t);
  assert.deepEqual(await (await fetch(`http://127.0.0.1:${f.port}/health`)).json(), { status: 'ok' });
  assert.equal((await fetch(`http://127.0.0.1:${f.port}/`)).status, 200);
  const outsider = await f.connect('Outra sala', 'master', 'OUT26');
  f.p1.emit('character:select', { code: 'QA26', characterName: 'Brakk' });
  await f.event(f.p1, 'character:select:result', data => data.success);
  f.p2.emit('character:select', { code: 'QA26', characterName: 'Lyor' });
  await f.event(f.p2, 'character:select:result', data => data.success);
  f.clear();
  f.master.emit('adventure:start', { code: 'QA26' });
  for (const client of [f.master, f.p1, f.p2]) await f.event(client, 'room:update', state => state.aventura.status === 'active');
  f.p1.emit('room:vote', { code: 'QA26', option: 'seguir-som' });
  await f.event(f.p1, 'room:vote:result', data => data.success);
  await f.event(f.master, 'room:update', state => state.voteCounts['seguir-som'] === 1);
  f.clear();
  f.master.emit('scene:advance', { code: 'QA26' });
  for (const client of [f.master, f.p1, f.p2]) {
    const scene = await f.event(client, 'scene:update', data => data.titulo === 'Cabana QA');
    assert.equal(scene.opcoes.length, 3);
    assert.match(scene.imagem, /^data:image\/png;base64,/);
    const state = await f.event(client, 'room:update', data => !data.isGeneratingScene && data.adventureState.resumo.includes('cabana'));
    assert.equal(state.historico.length, 1);
    assert.equal(state.votedCount, 0);
  }
  assert.equal(outsider.events.length, 0);
  f.clear();
  f.master.emit('dice:request', { code: 'QA26', targetPlayerName: 'Jogador 1', testName: 'Percepcao', difficulty: 12, bonus: 2 });
  const roll = await f.event(f.p1, 'dice:request');
  f.p2.emit('dice:roll', { code: 'QA26', rollId: roll.rollId });
  await pause(80);
  assert.equal(f.master.events.some(([name]) => name === 'dice:result'), false);
  f.p1.emit('dice:roll', { code: 'QA26', rollId: roll.rollId });
  const result = await f.event(f.master, 'dice:result');
  assert.ok(result.dado >= 1 && result.dado <= 20);
  await f.event(f.p1, 'dice:result');
  f.p1.emit('dice:roll', { code: 'QA26', rollId: roll.rollId });
  await pause(80);
  assert.equal(f.master.events.filter(([name]) => name === 'dice:result').length, 1);
  assert.equal(f.p2.events.some(([name]) => name === 'dice:request' || name === 'dice:result'), false);
  f.clear();
  f.master.emit('secret:event:create', { code: 'QA26', targetPlayerName: 'Jogador 1', title: 'Segredo QA', text: 'Somente jogador 1', options: ['Aceitar', 'Recusar'] });
  const secret = await f.event(f.p1, 'secret:event');
  f.p2.emit('secret:event:answer', { code: 'QA26', secretEventId: secret.secretEventId, option: 'opcao-1' });
  await pause(80);
  assert.equal(f.master.events.some(([name]) => name === 'secret:event:response'), false);
  f.p1.emit('secret:event:answer', { code: 'QA26', secretEventId: secret.secretEventId, option: 'opcao-1' });
  await f.event(f.master, 'secret:event:response');
  assert.equal(f.p2.events.some(([name]) => name.startsWith('secret:')), false);
  assert.equal(outsider.events.length, 0);
  f.clear();
  f.master.emit('health:damage', { code: 'QA26', targetPlayerName: 'Jogador 1', amount: 10 });
  await f.event(f.p1, 'character:update', data => data.vidaAtual === 30);
  f.master.emit('inventory:give-item', { code: 'QA26', targetPlayerName: 'Jogador 1', itemId: 'pocao-cura', quantity: 1 });
  await f.event(f.p1, 'inventory:give-item:result', data => data.success);
  f.p1.emit('inventory:use', { code: 'QA26', itemId: 'pocao-cura' });
  const potion = await f.event(f.p1, 'inventory:use:result', data => data.success);
  assert.equal(potion.player.vidaAtual, 35);
  assert.equal(potion.player.inventario.some(item => item.id === 'pocao-cura' && item.quantidade > 0), false);
  f.master.emit('health:heal', { code: 'QA26', targetPlayerName: 'Jogador 1', amount: 10 });
  await f.event(f.p2, 'character:update', data => data.vidaAtual === 40);
  f.clear();
  f.master.emit('combat:start', { code: 'QA26', enemyName: 'Inimigo QA', enemyLife: 1, enemyDefense: 1 });
  const combat = await f.event(f.p1, 'combat:update', data => data?.ativo);
  assert.equal(combat.ordem.length, 3);
  f.p2.emit('combat:attack', { code: 'QA26' });
  await f.event(f.p2, 'combat:action:result', data => data.success === false);
  f.p1.emit('combat:pass', { code: 'QA26' });
  await f.event(f.p2, 'combat:update', data => data?.ativo && data.turnoAtual === 1);
  f.p2.emit('combat:pass', { code: 'QA26' });
  await f.event(f.master, 'combat:update', data => data?.ativo && data.rodada === 2);
  for (let attempt = 0; attempt < 20 && !f.master.events.some(([name]) => name === 'combat:ended'); attempt++) {
    f.p1.emit('combat:attack', { code: 'QA26' });
    await pause(50);
    if (!f.master.events.some(([name]) => name === 'combat:ended')) { f.p2.emit('combat:attack', { code: 'QA26' }); await pause(50); }
  }
  await f.event(f.master, 'combat:ended');
  f.clear();
  f.master.emit('adventure:end', { code: 'QA26' });
  for (const client of [f.master, f.p1, f.p2]) await f.event(client, 'adventure:ended');
  f.clear();
  for (const [name, payload] of [
    ['adventure:start', {}], ['scene:advance', {}], ['dice:request', { targetPlayerName: 'Jogador 1' }],
    ['secret:event:create', { targetPlayerName: 'Jogador 1', options: ['A', 'B'] }],
    ['health:damage', { targetPlayerName: 'Jogador 1', amount: 1 }], ['health:heal', { targetPlayerName: 'Jogador 1', amount: 1 }],
    ['inventory:give-item', { targetPlayerName: 'Jogador 1', itemId: 'pocao-cura' }],
    ['combat:start', { enemyName: 'Depois', enemyLife: 1, enemyDefense: 1 }],
  ]) f.master.emit(name, { code: 'QA26', ...payload });
  f.p1.emit('room:vote', { code: 'QA26', option: 'entrar' });
  await f.event(f.p1, 'room:vote:result', data => !data.success);
  f.p1.emit('inventory:use', { code: 'QA26', itemId: 'pocao-cura' });
  f.p1.emit('combat:attack', { code: 'QA26' });
  f.p1.emit('dice:roll', { code: 'QA26', rollId: roll.rollId });
  f.p1.emit('secret:event:answer', { code: 'QA26', secretEventId: secret.secretEventId, option: 'opcao-2' });
  await pause(160);
  assert.equal(f.master.events.some(([name]) => ['character:update', 'combat:update', 'secret:event:response', 'dice:result', 'scene:update'].includes(name)), false);
  assert.equal((await fetch(`http://127.0.0.1:${f.port}/health`)).status, 200);
});

test('readiness: disconnect removes player and vote; rejoin and room change do not leak broadcasts', async t => {
  const f = await setup(t);
  f.p2.emit('room:vote', { code: 'QA26', option: 'investigar' });
  await f.event(f.master, 'room:update', state => state.votedCount === 1);
  f.clear();
  f.p2.socket.close();
  await f.event(f.master, 'room:update', state => state.players.length === 2 && state.votedCount === 0);
  const rejoined = await f.connect('Jogador 2');
  assert.notEqual(rejoined.id, f.p2.id);
  await f.event(f.master, 'room:update', state => state.players.length === 3);
  f.clear();
  rejoined.emit('join-room', { code: 'OUT26', name: 'Jogador 2', role: 'player' });
  await f.event(rejoined, 'room:update', state => state.roomCode === 'OUT26');
  await f.event(f.master, 'room:update', state => state.players.length === 2);
  f.clear();
  f.p1.emit('room:vote', { code: 'QA26', option: 'seguir-som' });
  await f.event(f.master, 'room:update', state => state.votedCount === 1);
  await pause(80);
  assert.equal(rejoined.events.length, 0);
});

test('readiness: image failure preserves narrative and synchronizes null image', async t => {
  const f = await setup(t, { READINESS_IMAGE_FAILURE: '1' });
  f.p1.emit('room:vote', { code: 'QA26', option: 'seguir-som' });
  await f.event(f.p1, 'room:vote:result', data => data.success);
  f.master.emit('scene:advance', { code: 'QA26' });
  for (const client of [f.master, f.p1, f.p2]) {
    const scene = await f.event(client, 'scene:update', data => data.titulo === 'Cabana QA');
    assert.equal(scene.imagem, null);
    await f.event(client, 'room:update', state => !state.isGeneratingScene && state.scene.titulo === 'Cabana QA');
  }
  assert.equal((await fetch(`http://127.0.0.1:${f.port}/health`)).status, 200);
});

test('readiness: malformed socket payloads cannot crash the server', async t => {
  const f = await setup(t);
  for (const event of ['join-room', 'adventure:start', 'room:vote', 'health:damage', 'secret:event:create']) {
    for (const payload of [undefined, null, 42, 'invalid', []]) f.p1.emit(event, payload);
  }
  await pause(180);
  assert.equal(f.child.exitCode, null, f.logs());
  assert.equal((await fetch(`http://127.0.0.1:${f.port}/health`)).status, 200);
});

test('readiness: final summary timeout uses fallback and reaches all clients', async t => {
  const f = await setup(t, { READINESS_SUMMARY_FAILURE: '1' });
  f.master.emit('adventure:start', { code: 'QA26' });
  await f.event(f.master, 'room:update', state => state.aventura.status === 'active');
  f.master.emit('adventure:end', { code: 'QA26' });
  for (const client of [f.master, f.p1, f.p2]) {
    const summary = await f.event(client, 'adventure:ended');
    assert.equal(summary.fonteResumo, 'fallback');
    assert.ok(summary.resumoFinal.trim());
  }
  assert.match(f.logs(), /APIConnectionTimeoutError/);
  assert.equal((await fetch(`http://127.0.0.1:${f.port}/health`)).status, 200);
});
