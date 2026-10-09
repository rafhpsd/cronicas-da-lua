const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

// Browser QA via Chrome DevTools; API fixture only, no external API requests.
const root = path.join(__dirname, '..');
const debugUrl = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9222';
const output = path.join(os.tmpdir(), 'rpg-stage26-qa');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(check, label = 'browser condition') {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    const value = await check();
    if (value) return value;
    await pause(40);
  }
  throw Error('Timeout: ' + label);
}

class Browser {
  constructor(url) {
    this.id = 0;
    this.pending = new Map();
    this.errors = [];
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => { this.socket.onopen = resolve; this.socket.onerror = reject; });
    this.socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const handler = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (handler) {
          clearTimeout(handler.timer);
          message.error ? handler.reject(Error(JSON.stringify(message.error))) : handler.resolve(message.result);
        }
      } else if (message.method === 'Runtime.exceptionThrown') this.errors.push(message.params.exceptionDetails);
      else if (message.method === 'Page.javascriptDialogOpening') {
        this.call('Page.handleJavaScriptDialog', { accept: true, promptText: '1' }).catch(error => this.errors.push(error.message));
      }
    };
  }
  async call(method, params = {}) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const timer = setTimeout(() => { this.pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 6000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const result = await this.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async click(selector) {
    await this.call('Page.bringToFront');
    await this.eval(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await pause(120);
    const point = await this.eval(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});const r=el.getBoundingClientRect();if(el.disabled||!r.width||!r.height)throw Error('Unavailable control: '+${JSON.stringify(selector)});const x=r.x+r.width/2,y=r.y+r.height/2;const hit=document.elementFromPoint(x,y);if(!el.contains(hit))throw Error('Obscured control: '+${JSON.stringify(selector)}+' by '+hit?.outerHTML);return {x,y};})()`);
    await this.call('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
    await this.call('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
  }
}

async function run(imageFailure) {
  const child = spawn(process.execPath, ['--require', path.join(root, 'tests/fixtures/readiness-openai.cjs'), 'server.js'], {
    cwd: root, env: { ...process.env, PORT: '0', NODE_ENV: 'production', OPENAI_API_KEY: 'test-readiness', READINESS_IMAGE_FAILURE: imageFailure ? '1' : '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  child.stdout.on('data', data => { logs += data; });
  child.stderr.on('data', data => { logs += data; });
  const clients = [];
  const measurements = [];
  const checkLayout = async (client, stage) => {
    for (const width of [360, 390, 768, 1440]) {
      await client.call('Emulation.setDeviceMetricsOverride', { width, height: width >= 768 ? 900 : 844, deviceScaleFactor: 1, mobile: width < 768 });
      await pause(60);
      const size = await client.eval('({width:innerWidth,scroll:document.documentElement.scrollWidth,screen:document.querySelector(".screen.active")?.id})');
      measurements.push({ stage, viewport: width, ...size });
      assert.ok(size.scroll <= size.width, JSON.stringify({ stage, viewport: width, ...size }));
    }
    await client.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  };
  const screenshot = async (client, name) => {
    await client.call('Page.bringToFront');
    await client.eval('window.scrollTo(0,0)');
    await pause(120);
    const shot = await client.call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
  };
  try {
    const port = await waitFor(() => logs.match(/localhost:(\d+)/)?.[1], 'server startup');
    for (let i = 0; i < 3; i++) {
      const page = await (await fetch(debugUrl + '/json/new?about:blank', { method: 'PUT' })).json();
      const client = new Browser(page.webSocketDebuggerUrl);
      clients.push(client);
      await client.call('Runtime.enable');
      await client.call('Page.enable');
      await client.call('Page.navigate', { url: `http://127.0.0.1:${port}` });
      await waitFor(() => client.eval('document.readyState === "complete" && typeof renderScene === "function" && socket.connected'));
      await client.eval('window.qaInitialListeners=Object.fromEntries(Object.entries(socket._callbacks).map(([key,list])=>[key,list.length]));window.qaVotes=0;socket.on("room:vote:result",()=>window.qaVotes++);void 0;');
    }
    const [master, p1, p2] = clients;
    await checkLayout(master, 'initial');
    await master.click('#createRoomButton');
    await checkLayout(master, 'create');
    await master.eval('document.getElementById("roomName").value="Prontidao QA";document.getElementById("hostName").value="Mestre QA";');
    await master.click('#createRoomForm button[type=submit]');
    await waitFor(() => master.eval('isMasterClient && currentPlayers.length===1'));
    const code = await master.eval('currentRoomCode');
    assert.match(code, /^[A-Z0-9]{4}$/);
    for (const [client, name] of [[p1, 'Jogador 1'], [p2, 'Jogador 2']]) {
      await client.eval(`roomCodeInput.value=${JSON.stringify(code)};playerNameInput.value=${JSON.stringify(name)};`);
      await client.click('#loginForm button[type=submit]');
      await waitFor(() => client.eval('currentPlayers.some(p=>p.name===currentPlayerName)'));
    }
    await waitFor(() => master.eval('currentPlayers.length===3'));
    await checkLayout(master, 'lobby');
    for (const [client, index, name] of [[p1, 2, 'Brakk'], [p2, 1, 'Lyor']]) {
      await client.click('#selectCharacterButton');
      assert.equal(await client.eval('confirmCharacterButton.disabled'), true);
      await checkLayout(client, 'character');
      await client.click(`.character-option:nth-child(${index + 1})`);
      assert.equal(await client.eval('document.querySelectorAll(".character-option.selected").length'), 1);
      await client.click('#confirmCharacterButton');
      await waitFor(() => client.eval(`getLocalPlayer()?.character===${JSON.stringify(name)}`));
    }
    await master.click('#startAdventureButton');
    await waitFor(() => master.eval('masterScreen.classList.contains("active")'));
    for (const client of [p1, p2]) await waitFor(() => client.eval('adventureScreen.classList.contains("active")'));
    await checkLayout(master, 'master');
    await checkLayout(p1, 'adventure');
    await p1.click('[data-option=seguir-som]');
    assert.equal(await p1.eval('document.querySelectorAll(".option-button.selected").length'), 1);
    await p1.click('#confirmVoteButton');
    await waitFor(() => p1.eval('voteConfirmed'));
    assert.equal(await p1.eval('qaVotes'), 1);
    await waitFor(() => master.eval('voteList.textContent.includes("1 voto")'));
    await master.click('#continueStoryButton');
    await waitFor(() => master.eval('continueStoryButton.disabled && isGeneratingScene'), 'narrative loading');
    for (const client of clients) await waitFor(() => client.eval('currentScene.titulo==="Cabana QA" && !isGeneratingScene'));
    const image = await master.eval('currentScene.imagem');
    for (const client of clients) assert.equal(await client.eval('currentScene.imagem'), image);
    assert.equal(Boolean(image), !imageFailure);
    await master.click('#showAdventureMemoryButton');
    assert.match(await master.eval('memorySummary.textContent'), /cabana/);
    await checkLayout(master, 'memory');
    await master.click('#rollDiceButton');
    await master.eval('dicePlayerSelect.value="Jogador 1";diceTestName.value="Percepcao QA";');
    await master.click('#sendDiceTestButton');
    await waitFor(() => p1.eval('pendingDiceRequest?.testName==="Percepcao QA"'));
    assert.equal(await p2.eval('pendingDiceRequest'), null);
    await p1.click('#playerRollDiceButton');
    await waitFor(() => master.eval('masterDiceResult.textContent.includes("d20:")'));
    await master.click('#secretEventButton');
    await master.eval('secretEventTarget.value="Jogador 1";secretEventTitle.value="Segredo QA";secretEventText.value="Apenas jogador 1";secretEventOption1.value="Aceitar";secretEventOption2.value="Recusar";');
    await master.click('#sendSecretEventButton');
    await waitFor(() => p1.eval('currentSecretEvent?.titulo==="Segredo QA"'));
    assert.equal(await p2.eval('currentSecretEvent'), null);
    await p1.click('#secretOptionButton1');
    await waitFor(() => master.eval('masterSecretResponse.textContent.includes("Aceitar")'));
    await master.eval('document.querySelector(".master-section:has(#healthTargetSelect)").open=true;healthTargetSelect.value="Jogador 1";healthAmountInput.value="10";');
    await master.click('#applyDamageButton');
    await waitFor(() => p1.eval('getLocalPlayer()?.vidaAtual===30'));
    await master.eval('document.querySelector(".master-section:has(#giveItemButton)").open=true;masterTargetItemSelect.value="Jogador 1";masterItemSelect.value="pocao-cura";masterItemQuantity.value="1";');
    await master.click('#giveItemButton');
    await waitFor(() => p1.eval('inventoryList.querySelector("button")!==null'), 'inventory delivery');
    await p1.click('#inventoryList button');
    await p1.click('#useItemButton');
    await waitFor(() => p1.eval('getLocalPlayer()?.vidaAtual===35'));
    await master.click('#healCharacterButton');
    await waitFor(() => p1.eval('getLocalPlayer()?.vidaAtual===40'));
    await master.eval('document.querySelector(".combat-master-section").open=true;combatEnemyName.value="Inimigo QA";combatEnemyLife.value="1";combatEnemyDefense.value="1";');
    await master.click('#startCombatButton');
    await waitFor(() => p1.eval('currentCombat?.ativo && !combatPassButton.disabled'));
    assert.equal(await p2.eval('combatAttackButton.disabled'), true);
    await checkLayout(p1, 'combat');
    await p1.click('#combatPassButton');
    await waitFor(() => p2.eval('!combatPassButton.disabled'));
    await p2.click('#combatPassButton');
    await waitFor(() => p1.eval('currentCombat?.rodada===2'));
    for (let attempt = 0; attempt < 20 && await master.eval('currentCombat?.ativo'); attempt++) {
      const actor = await p1.eval('!combatAttackButton.disabled') ? p1 : p2;
      await actor.click('#combatAttackButton');
      await pause(100);
    }
    await waitFor(() => master.eval('currentCombat && !currentCombat.ativo'));
    await p2.click('[data-option=entrar]');
    await p2.click('#confirmVoteButton');
    await waitFor(() => p2.eval('voteConfirmed'));
    await p2.eval('window.qaPreviousId=socket.id;socket.io.engine.close();void 0;');
    await waitFor(() => master.eval('currentPlayers.length===2'), 'disconnect cleanup');
    await waitFor(() => p2.eval('socket.connected && socket.id!==qaPreviousId && currentPlayers.length===3'), 'automatic rejoin');
    await waitFor(() => master.eval('currentPlayers.length===3'), 'master receives rejoin');
    assert.equal(await p2.eval('voteConfirmed'), false, 'Removed vote must not remain confirmed after reconnect');
    await p2.click('[data-option=observar]');
    await p2.click('#confirmVoteButton');
    await waitFor(() => p2.eval('voteConfirmed && qaVotes===2'), 'new vote after reconnect');
    for (const client of clients) {
      assert.equal(await client.eval('Object.entries(qaInitialListeners).every(([key,count])=>socket._callbacks[key]?.length===count+(key==="$room:vote:result"?1:0))'), true);
      assert.deepEqual(client.errors, []);
    }
    await screenshot(master, imageFailure ? 'master-placeholder' : 'master');
    await screenshot(p1, imageFailure ? 'player-placeholder' : 'player');
    await master.click('#endAdventureButton');
    for (const client of clients) await waitFor(() => client.eval('finalScreen.classList.contains("active") && !finalSummaryText.textContent.includes("Preparando")'));
    for (const client of clients) assert.equal(await client.eval('isAdventureClosed && confirmVoteButton.disabled && continueStoryButton.disabled && combatAttackButton.disabled'), true);
    await checkLayout(master, 'final');
    await screenshot(master, imageFailure ? 'final-placeholder' : 'final');
    console.log(JSON.stringify({ imageFailure, code, clients: 3, layoutChecks: measurements.length, horizontalOverflow: false, automaticRejoin: true, duplicateListeners: false, runtimeErrors: clients.flatMap(client => client.errors), screenshotDirectory: output }));
  } catch (error) {
    for (const [index, client] of clients.entries()) {
      await screenshot(client, 'failure-' + index).catch(() => {});
      console.error('Browser state', index, await client.eval('({screen:document.querySelector(".screen.active")?.id,players:currentPlayers,feedback:healthActionFeedback.textContent,inventory:inventoryList.textContent,target:masterTargetItemSelect.value,errors:window.qaVotes})').catch(() => null));
    }
    console.error(logs);
    throw error;
  } finally {
    for (const client of clients) {
      try { await client.eval('socket.disconnect();void 0;'); await client.call('Page.close'); } catch {}
      client.socket.close();
    }
    if (child.exitCode === null) { const closed = once(child, 'close'); child.kill(); await closed; }
  }
}

fs.mkdirSync(output, { recursive: true });
(async () => { await run(false); await run(true); })().catch(error => { console.error(error); process.exitCode = 1; });
