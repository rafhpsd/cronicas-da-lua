const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');

async function waitFor(check) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const result = check();
    if (result) return result;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error('Timed out waiting for narrative event');
}

async function setup(t, { mode = 'success', environment = 'development', key = 'sk-test-narrative-secret' } = {}) {
  const child = spawn(process.execPath, ['--require', path.join(__dirname, 'fixtures', 'scene-openai.cjs'), 'server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT:'0', NODE_ENV:environment, OPENAI_API_KEY:key, SCENE_AI_TEST_MODE:mode },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  const clients = [];
  t.after(async () => {
    clients.forEach(client => client.socket.close());
    if (child.exitCode === null) {
      const closed = once(child, 'close');
      child.kill();
      await closed;
    }
  });
  const port = await waitFor(() => logs.match(/localhost:(\d+)/)?.[1]);
  const connect = async (name, role) => {
    const socket = new WebSocket('ws://127.0.0.1:' + port + '/socket.io/?EIO=4&transport=websocket');
    const client = { socket, events:[], connected:false, emit:(event, data) => socket.send('42'+JSON.stringify([event, data])) };
    clients.push(client);
    socket.addEventListener('message', ({ data }) => {
      const packet = String(data);
      if (packet.startsWith('0')) socket.send('40');
      else if (packet.startsWith('40')) client.connected = true;
      else if (packet === '2') socket.send('3');
      else if (packet.startsWith('42')) client.events.push(JSON.parse(packet.slice(2)));
    });
    await waitFor(() => client.connected);
    client.emit('join-room', { code:'P8EY', name, role });
    await waitFor(() => client.events.some(([event]) => event === 'room:update'));
    return client;
  };
  const master = await connect('Mestre', 'master');
  const player = await connect('Jogador', 'player');
  await waitFor(() => master.events.some(([event, state]) => event === 'room:update' && state.players.length === 2));
  const clear = () => clients.forEach(client => { client.events = []; });
  const event = (client, name, check = () => true) => waitFor(() => client.events.find(([type,data]) => type === name && check(data))?.[1]);
  const vote = async (client, option) => {
    client.emit('room:vote', { code:'P8EY', option });
    await event(client, 'room:vote:result', data => data.success);
    clear();
  };
  const advanced = async (title) => {
    for (const client of [master, player]) {
      const scene = await event(client, 'scene:update', scene => scene.titulo === title);
      assert.equal(scene.opcoes.length, 3);
      await event(client, 'room:update', state => state.scene.titulo === title && state.isGeneratingScene === false);
    }
  };
  clear();
  return { master, player, connect, event, clear, vote, advanced, logs:() => logs };
}

test('no votes offers the current options to the master without advancing', async t => {
  const flow = await setup(t);
  flow.master.emit('scene:advance', { code:'p8ey' });
  const choice = await flow.event(flow.master, 'scene:tie');
  assert.equal(choice.message, 'Nenhum voto registrado.');
  assert.deepEqual(choice.tieOptions.map(option=>option.id), ['seguir-som','investigar','voltar']);
  assert.equal(flow.master.events.some(([event])=>event==='scene:update'), false);
});

test('master can continue P8EY manually with no votes; both clients receive the validated AI scene', async t => {
  const flow = await setup(t);
  flow.master.emit('scene:advance', { code:'P8EY' });
  await flow.event(flow.master, 'scene:tie');
  flow.clear();
  flow.master.emit('scene:advance:manual', { code:'P8EY', selectedOption:'investigar' });
  await flow.advanced('Cena de integração');
  const scene = await flow.event(flow.player, 'scene:update', data=>data.titulo==='Cena de integração');
  assert.match(scene.narrativa, /investigar/);
  for (const marker of ['Mestre solicitou avanço','Sala: P8EY','Mestre validado','Votos atuais','Escolha vencedora','Chamando OpenAI','Resposta recebida','Cena validada','cenaAtual substituída','Emitindo nova cena','Nova cena enviada','loading liberado']) {
    await waitFor(()=>flow.logs().includes(marker));
  }
});

test('a valid winning vote advances normally in production', async t => {
  const flow = await setup(t, { environment:'production' });
  await flow.vote(flow.player, 'seguir-som');
  flow.master.emit('scene:advance', { code:'P8EY' });
  await flow.advanced('Cena de integração');
  assert.equal(flow.master.events.some(([name])=>name==='scene:tie'), false);
});

test('a tie allows only tied options and still reaches both clients', async t => {
  const flow = await setup(t);
  const other = await flow.connect('Outro jogador', 'player');
  flow.clear();
  await flow.vote(flow.player,'seguir-som');
  await flow.vote(other,'investigar');
  flow.master.emit('scene:advance',{code:'P8EY'});
  const tie = await flow.event(flow.master,'scene:tie');
  assert.equal(tie.message,'Há um empate. Escolha manualmente uma opção.');
  assert.deepEqual(tie.tieOptions.map(option=>option.id),['seguir-som','investigar']);
  flow.master.emit('scene:advance:manual',{code:'P8EY',selectedOption:'voltar'});
  await flow.event(flow.master,'scene:ai:error', data=>/permitidas/.test(data.message));
  flow.clear();
  flow.master.emit('scene:advance:manual',{code:'P8EY',selectedOption:'investigar'});
  await flow.advanced('Cena de integração');
});

test('non-master and unknown-room requests get explicit errors', async t => {
  const flow = await setup(t);
  flow.player.emit('scene:advance',{code:'P8EY'});
  await flow.event(flow.player,'scene:ai:error',data=>/Somente o mestre/.test(data.message));
  flow.master.emit('scene:advance',{code:'INEXISTENTE'});
  await flow.event(flow.master,'scene:ai:error',data=>data.message==='Sala não encontrada.');
});

for (const mode of ['failure','invalid','timeout']) {
  test('production '+mode+' reports an error, retains the scene, and releases loading', async t => {
    const flow = await setup(t,{mode,environment:'production'});
    await flow.vote(flow.player,'seguir-som');
    flow.master.emit('scene:advance',{code:'P8EY'});
    const error = await flow.event(flow.master,'scene:ai:error');
    assert.equal(error.message,'Erro ao gerar próxima cena.');
    assert.equal(error.developmentFallback,false);
    await flow.event(flow.master,'room:update',state=>state.isGeneratingScene===false&&state.scene.titulo==='Floresta Sombria');
    assert.equal(flow.master.events.some(([name,data])=>name==='scene:update'&&data.titulo==='Trilha Escura'),false);
    assert.equal(flow.logs().includes('sk-test-narrative-secret'),false);
    assert.match(flow.logs(),/\[OPENAI\]\[ERRO\]/);
  });
}

for (const key of ['', 'sk-test-narrative-secret']) {
  test('development fallback works '+(key?'after an API failure':'without an API key'),async t=>{
    const flow=await setup(t,{mode:'failure',key});
    await flow.vote(flow.player,'seguir-som');
    flow.master.emit('scene:advance',{code:'P8EY'});
    await flow.advanced('Trilha Escura');
    const error=await flow.event(flow.master,'scene:ai:error');
    assert.equal(error.developmentFallback,true);
    assert.equal(flow.logs().includes('sk-test-narrative-secret'),false);
  });
}
