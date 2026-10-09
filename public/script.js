const loginScreen = document.getElementById('loginScreen');
const createRoomScreen = document.getElementById('createRoomScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const characterScreen = document.getElementById('characterScreen');
const adventureScreen = document.getElementById('adventureScreen');
const masterScreen = document.getElementById('masterScreen');
const finalScreen = document.getElementById('finalScreen');
const loginForm = document.getElementById('loginForm');
const roomCodeInput = document.getElementById('roomCode');
const playerNameInput = document.getElementById('playerName');
const createRoomButton = document.getElementById('createRoomButton');
const enterMasterButton = document.getElementById('enterMasterButton');
const backToLoginButton = document.getElementById('backToLoginButton');
const createRoomForm = document.getElementById('createRoomForm');
const lobbyBackButton = document.getElementById('lobbyBackButton');
const copyRoomCodeButton = document.getElementById('copyRoomCodeButton');
const startAdventureButton = document.getElementById('startAdventureButton');
const selectCharacterButton = document.getElementById('selectCharacterButton');
const lobbyRoomName = document.getElementById('lobbyRoomName');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const playersList = document.getElementById('playersList');
const characterList = document.getElementById('characterList');
const selectedCharacterDetails = document.getElementById('selectedCharacterDetails');
const confirmCharacterButton = document.getElementById('confirmCharacterButton');
const characterBackButton = document.getElementById('characterBackButton');
const playerAvatar = document.getElementById('playerAvatar');
const playerNameDisplay = document.getElementById('playerNameDisplay');
const playerLevelDisplay = document.getElementById('playerLevelDisplay');
const playerLifeDisplay = document.getElementById('playerLifeDisplay');
const playerHealthBar = document.getElementById('playerHealthBar');
const playerEnergyDisplay = document.getElementById('playerEnergyDisplay');
const playerEnergyBar = document.getElementById('playerEnergyBar');
const playerDiceNumber = document.getElementById('playerDiceNumber');
const playerStatusDisplay = document.getElementById('playerStatusDisplay');
const characterStateMessage = document.getElementById('characterStateMessage');
const choiceStatus = document.getElementById('choiceStatus');
const confirmVoteButton = document.getElementById('confirmVoteButton');
const optionButtons = document.querySelectorAll('.option-button');
const narrativeText = document.getElementById('narrativeText');
const narrativeTitle = document.getElementById('narrativeTitle');
const playerCombatPanel = document.getElementById('playerCombatPanel');
const playerCombatRound = document.getElementById('playerCombatRound');
const playerCombatTurn = document.getElementById('playerCombatTurn');
const playerCombatEnemy = document.getElementById('playerCombatEnemy');
const playerCombatLog = document.getElementById('playerCombatLog');
const playerCombatFeedback = document.getElementById('playerCombatFeedback');
const combatAttackButton = document.getElementById('combatAttackButton');
const combatPassButton = document.getElementById('combatPassButton');
const combatStartForm = document.getElementById('combatStartForm');
const combatEnemyName = document.getElementById('combatEnemyName');
const combatEnemyLife = document.getElementById('combatEnemyLife');
const combatEnemyDefense = document.getElementById('combatEnemyDefense');
const startCombatButton = document.getElementById('startCombatButton');
const masterCombatFeedback = document.getElementById('masterCombatFeedback');
const masterCombatState = document.getElementById('masterCombatState');
const masterCombatLog = document.getElementById('masterCombatLog');
const endAdventureButton = document.getElementById('endAdventureButton');
const backToMenuButton = document.getElementById('backToMenuButton');
const finalRoomName = document.getElementById('finalRoomName');
const finalDuration = document.getElementById('finalDuration');
const finalSummaryText = document.getElementById('finalSummaryText');
const finalScenesCount = document.getElementById('finalScenesCount');
const finalDecisionsCount = document.getElementById('finalDecisionsCount');
const finalDiceCount = document.getElementById('finalDiceCount');
const finalSuccessCount = document.getElementById('finalSuccessCount');
const finalFailureCount = document.getElementById('finalFailureCount');
const finalCombatCount = document.getElementById('finalCombatCount');
const finalMomentsList = document.getElementById('finalMomentsList');
const finalSurvivorsList = document.getElementById('finalSurvivorsList');
const finalDeadList = document.getElementById('finalDeadList');
const inventoryList = document.getElementById('inventoryList');
const inventoryItemDetails = document.getElementById('inventoryItemDetails');
const selectedItemName = document.getElementById('selectedItemName');
const selectedItemMeta = document.getElementById('selectedItemMeta');
const useItemButton = document.getElementById('useItemButton');
const playerDicePanel = document.getElementById('playerDicePanel');
const diceRequestTitle = document.getElementById('diceRequestTitle');
const diceRequestDifficulty = document.getElementById('diceRequestDifficulty');
const diceRequestBonus = document.getElementById('diceRequestBonus');
const playerRollDiceButton = document.getElementById('playerRollDiceButton');
const playerDiceResult = document.getElementById('playerDiceResult');
const masterRoomCodeDisplay = document.getElementById('masterRoomCodeDisplay');
const masterRoomCode = document.getElementById('masterRoomCode');
const masterPlayersCount = document.getElementById('masterPlayersCount');
const masterNarrativeText = document.getElementById('masterNarrativeText');
const masterNarrativeTitle = document.getElementById('masterNarrativeTitle');
const voteList = document.getElementById('voteList');
const dicePlayerSelect = document.getElementById('dicePlayerSelect');
const diceTestName = document.getElementById('diceTestName');
const diceDifficulty = document.getElementById('diceDifficulty');
const diceBonus = document.getElementById('diceBonus');
const sendDiceTestButton = document.getElementById('sendDiceTestButton');
const masterDiceResult = document.getElementById('masterDiceResult');
const masterPlayerList = document.getElementById('masterPlayerList');
const masterPlayerDetail = document.getElementById('masterPlayerDetail');
const masterTargetItemSelect = document.getElementById('masterTargetItemSelect');
const masterItemSelect = document.getElementById('masterItemSelect');
const masterItemQuantity = document.getElementById('masterItemQuantity');
const giveItemButton = document.getElementById('giveItemButton');
const healthTargetSelect = document.getElementById('healthTargetSelect');
const healthAmountInput = document.getElementById('healthAmountInput');
const applyDamageButton = document.getElementById('applyDamageButton');
const healCharacterButton = document.getElementById('healCharacterButton');
const declareDeadButton = document.getElementById('declareDeadButton');
const healthActionFeedback = document.getElementById('healthActionFeedback');
const continueStoryButton = document.getElementById('continueStoryButton');
const masterSceneFeedback = document.getElementById('masterSceneFeedback');
const showAdventureMemoryButton = document.getElementById('showAdventureMemoryButton');
const adventureMemoryPanel = document.getElementById('adventureMemoryPanel');
const memorySummary = document.getElementById('memorySummary');
const memoryLocalAtual = document.getElementById('memoryLocalAtual');
const memoryObjetivoAtual = document.getElementById('memoryObjetivoAtual');
const memoryAcontecimentos = document.getElementById('memoryAcontecimentos');
const memoryNpcs = document.getElementById('memoryNpcs');
const memoryDescobertas = document.getElementById('memoryDescobertas');
const rollDiceButton = document.getElementById('rollDiceButton');
const secretEventButton = document.getElementById('secretEventButton');
const secretEventForm = document.getElementById('secretEventForm');
const secretEventTarget = document.getElementById('secretEventTarget');
const secretEventTitle = document.getElementById('secretEventTitle');
const secretEventText = document.getElementById('secretEventText');
const secretEventOption1 = document.getElementById('secretEventOption1');
const secretEventOption2 = document.getElementById('secretEventOption2');
const sendSecretEventButton = document.getElementById('sendSecretEventButton');
const masterSecretResponse = document.getElementById('masterSecretResponse');
const playerSecretEventPanel = document.getElementById('playerSecretEventPanel');
const playerSecretEventTitle = document.getElementById('playerSecretEventTitle');
const playerSecretEventText = document.getElementById('playerSecretEventText');
const secretOptionButton1 = document.getElementById('secretOptionButton1');
const secretOptionButton2 = document.getElementById('secretOptionButton2');
const secretEventAnswerStatus = document.getElementById('secretEventAnswerStatus');
const socket = io();

const SCREEN_IDS = [
  loginScreen,
  createRoomScreen,
  lobbyScreen,
  characterScreen,
  adventureScreen,
  masterScreen,
  finalScreen,
];

const PLAYER_STATUS = {
  READY: 'Pronto',
  SELECTING: 'Escolhendo',
};

let currentRoomCode = '';
let currentPlayers = [];
let currentPlayerName = '';
let currentScene = {
  id: 1,
  titulo: 'Floresta Sombria',
  texto: 'Vocês entram na floresta e escutam algo se movendo entre as árvores.',
  opcoes: [
    { id: 'seguir-som', texto: 'Seguir o som' },
    { id: 'investigar', texto: 'Investigar ao redor' },
    { id: 'voltar', texto: 'Voltar pelo caminho seguro' },
  ],
};

const mockPlayers = [
  { name: 'Rafael', character: 'Kael', className: 'Patrulheiro', status: 'selecting' },
  { name: 'Pedro', character: 'Nyra', className: 'Ladina', status: 'ready' },
  { name: 'João', character: 'Lyor', className: 'Elfo Mago', status: 'selecting' },
  { name: 'Lucas', character: 'Brakk', className: 'Guerreiro', status: 'ready' },
];

const characters = [
  {
    name: 'Kael',
    className: 'Patrulheiro',
    level: 3,
    life: 28,
    maxLife: 32,
    energy: 12,
    maxEnergy: 12,
    status: 'Normal',
    description: 'Um guardião da floresta que prefere a vigilância e a precisão.',
    avatar: 'K',
  },
  {
    name: 'Lyor',
    className: 'Elfo Mago',
    level: 2,
    life: 24,
    maxLife: 24,
    energy: 20,
    maxEnergy: 20,
    status: 'Normal',
    description: 'Um estudioso das artes arcanas e da magia antiga.',
    avatar: 'L',
  },
  {
    name: 'Brakk',
    className: 'Guerreiro',
    level: 4,
    life: 40,
    maxLife: 40,
    energy: 8,
    maxEnergy: 8,
    status: 'Normal',
    description: 'Um bruto de alta resistência, feito para o choque e a defesa.',
    avatar: 'B',
  },
  {
    name: 'Nyra',
    className: 'Ladina',
    level: 3,
    life: 28,
    maxLife: 28,
    energy: 14,
    maxEnergy: 14,
    status: 'Normal',
    description: 'Ágil, furtiva e sempre pronta para explorar caminhos ocultos.',
    avatar: 'N',
  },
];

let temporaryRoomData = null;
let selectedCharacter = null;
let selectedOption = null;
let voteConfirmed = false;
let votePending = false;
let pendingDiceRequest = null;
let lastDiceResult = null;
let currentSecretEvent = null;
let isGeneratingScene = false;
let selectedInventoryItem = null;
let selectedMasterPlayerName = '';
let currentCombat = null;
let isAdventureClosed = false;
let isMasterClient = false;
let requestedMasterEntry = false;

const voteOptionMap = {
  'Seguir o som': 'seguir-som',
  'Investigar ao redor': 'investigar',
  'Voltar pelo caminho seguro': 'voltar',
  'Entrar na cabana': 'entrar-cabana',
  'Observar pelas janelas': 'observar-janelas',
  'Dar a volta pelo local': 'contornar-cabana',
  'seguir-som': 'seguir-som',
  investigar: 'investigar',
  voltar: 'voltar',
  'entrar-cabana': 'entrar-cabana',
  'observar-janelas': 'observar-janelas',
  'contornar-cabana': 'contornar-cabana',
};

function showScreen(screenName) {
  SCREEN_IDS.forEach((screen) => {
    screen.classList.toggle('active', screen.id === screenName);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function resetRoomClientContext() {
  currentPlayers = [];
  currentCombat = null;
  selectedCharacter = null;
  selectedOption = null;
  voteConfirmed = false;
  votePending = false;
  selectedInventoryItem = null;
  selectedMasterPlayerName = '';
  currentSecretEvent = null;
  pendingDiceRequest = null;
  lastDiceResult = null;
  isGeneratingScene = false;
  isAdventureClosed = false;
  isMasterClient = false;
  requestedMasterEntry = false;
}

function normalizeStatus(status) {
  const safeStatus = String(status || '').trim();
  if (safeStatus === 'ready' || safeStatus === PLAYER_STATUS.READY) {
    return PLAYER_STATUS.READY;
  }

  return PLAYER_STATUS.SELECTING;
}

function getPlayerInitials(player) {
  const name = player?.name || player?.character || 'J';
  return String(name).charAt(0).toUpperCase();
}

function generateRoomCode() {
  const charactersSet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let index = 0; index < 4; index += 1) {
    const randomIndex = Math.floor(Math.random() * charactersSet.length);
    code += charactersSet[randomIndex];
  }

  return code;
}

function renderPlayers(players) {
  const safePlayers = Array.isArray(players) ? players : [];
  currentPlayers = safePlayers;
  playersList.innerHTML = '';

  if (safePlayers.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'waiting-text';
    emptyState.textContent = 'Aguardando jogadores...';
    playersList.appendChild(emptyState);
  }

  safePlayers.forEach((player) => {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = getPlayerInitials(player);

    const playerInfo = document.createElement('div');
    playerInfo.className = 'player-info';

    const playerName = document.createElement('p');
    playerName.className = 'player-name';
    playerName.textContent = player.name || 'Jogador';

    const playerCharacter = document.createElement('p');
    playerCharacter.className = 'player-character';
    const characterText = player.character || player.className || 'Sem personagem';
    playerCharacter.textContent = `${characterText}${player.className && player.character ? ` - ${player.className}` : ''}`;

    const status = document.createElement('span');
    const statusLabel = normalizeStatus(player.status);
    status.className = `player-status ${statusLabel === PLAYER_STATUS.READY ? 'ready' : 'selecting'}`;
    status.textContent = statusLabel;

    playerInfo.appendChild(playerName);
    playerInfo.appendChild(playerCharacter);
    playerCard.appendChild(avatar);
    playerCard.appendChild(playerInfo);
    playerCard.appendChild(status);
    playersList.appendChild(playerCard);
  });
}

function renderCharacters() {
  characterList.innerHTML = '';

  characters.forEach((character) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.setAttribute('aria-pressed', String(selectedCharacter?.name === character.name));
    option.className = `character-option ${selectedCharacter && selectedCharacter.name === character.name ? 'selected' : ''}`;

    option.innerHTML = `
      <div class="character-avatar">${character.avatar}</div>
      <div class="character-meta">
        <p class="character-name">${character.name}</p>
        <p class="character-class">${character.className}</p>
      </div>
      <span class="character-tag">${character.status}</span>
    `;

    option.addEventListener('click', () => {
      selectedCharacter = character;
      confirmCharacterButton.disabled = false;
      renderCharacterSummary();
      renderCharacters();
    });

    characterList.appendChild(option);
  });
}

function renderCharacterSummary() {
  if (!selectedCharacter) {
    selectedCharacterDetails.innerHTML = '<p>Nenhum personagem selecionado.</p>';
    return;
  }

  selectedCharacterDetails.innerHTML = `
    <p><strong>Nome:</strong> ${selectedCharacter.name}</p>
    <p><strong>Classe:</strong> ${selectedCharacter.className}</p>
    <p><strong>Vida:</strong> ${selectedCharacter.life} / ${selectedCharacter.maxLife}</p>
    <p><strong>Energia:</strong> ${selectedCharacter.energy} / ${selectedCharacter.maxEnergy}</p>
  `;
}

function showLobby(roomData) {
  const roomCode = roomData?.code || currentRoomCode || 'A7K9';
  currentRoomCode = roomCode;
  lobbyRoomName.textContent = roomData?.roomName || 'Sala de aventura';
  roomCodeDisplay.textContent = roomCode;
  renderPlayers(currentPlayers);
  showScreen('lobbyScreen');
}

function openCharacterSelection() {
  selectedCharacter = null;
  confirmCharacterButton.disabled = true;
  renderCharacterSummary();
  renderCharacters();
  showScreen('characterScreen');
}

function confirmCharacterSelection() {
  if (!selectedCharacter) {
    alert('Selecione um personagem antes de confirmar.');
    return;
  }

  if (!currentRoomCode) return;
  confirmCharacterButton.disabled = true;
  socket.emit('character:select', {
    code: currentRoomCode,
    characterName: selectedCharacter.name,
  });
  showScreen('lobbyScreen');
}

function renderAdventureScreen() {
  const serverCharacterName = getLocalPlayer()?.character;
  const activeCharacter = characters.find((character) => character.name === serverCharacterName)
    || selectedCharacter
    || characters.find((character) => character.name === 'Kael');

  if (!activeCharacter) {
    return;
  }

  playerAvatar.textContent = activeCharacter.avatar;
  playerNameDisplay.textContent = activeCharacter.name;
  playerLevelDisplay.textContent = `Nível ${activeCharacter.level}`;
  playerLifeDisplay.textContent = `${activeCharacter.life} / ${activeCharacter.maxLife}`;
  playerEnergyDisplay.textContent = `${activeCharacter.energy} / ${activeCharacter.maxEnergy}`;
  playerEnergyBar.style.width = `${Math.max(0, Math.min(100, activeCharacter.energy / activeCharacter.maxEnergy * 100))}%`;
  playerEnergyBar.setAttribute('aria-valuenow', String(activeCharacter.energy));
  playerEnergyBar.setAttribute('aria-valuemax', String(activeCharacter.maxEnergy));
  playerStatusDisplay.textContent = activeCharacter.status;
  renderPlayerHealthState();
}

function getLocalPlayer(players = currentPlayers) {
  return (players || []).find((player) => player.name === currentPlayerName)
    || (players || []).find((player) => player.name === 'Rafael')
    || (players || [])[0]
    || null;
}

function canLocalPlayerAct() {
  const player = getLocalPlayer();
  return !isAdventureClosed && (!player || !['Inconsciente', 'Morto'].includes(player.statusPersonagem));
}

function getCurrentCombatTurn() {
  return currentCombat?.ativo ? currentCombat.ordem?.[currentCombat.turnoAtual] || null : null;
}

function isLocalCombatTurn() {
  const turn = getCurrentCombatTurn();
  return Boolean(turn?.tipo === 'jogador' && turn.nome === currentPlayerName && canLocalPlayerAct());
}

function canLocalVote() {
  return canLocalPlayerAct() && !currentCombat?.ativo;
}

function canLocalUseItem() {
  return canLocalPlayerAct() && (!currentCombat?.ativo || isLocalCombatTurn());
}

function renderCombatLog(element, entries = []) {
  if (!element) return;
  element.replaceChildren();
  (entries || []).slice(-8).forEach((entry) => {
    const line = document.createElement('li');
    line.textContent = entry;
    element.appendChild(line);
  });
}

function renderCombatState(combat = currentCombat) {
  const wasActive = Boolean(currentCombat?.ativo);
  currentCombat = combat || null;
  const hasCombat = Boolean(currentCombat);
  const active = Boolean(currentCombat?.ativo);
  if (wasActive !== active) {
    selectedOption = null;
    voteConfirmed = false;
    optionButtons.forEach((button) => button.classList.remove('selected'));
  }
  const turn = getCurrentCombatTurn();
  const enemy = currentCombat?.inimigos?.[0] || null;
  const isMyTurn = active && isLocalCombatTurn();

  if (playerCombatPanel) playerCombatPanel.classList.toggle('hidden', !hasCombat);
  playerCombatTurn?.classList.toggle('is-current-turn', isMyTurn);
  masterCombatState?.classList.toggle('is-current-turn', active);
  const combatSection = masterCombatState?.closest('details');
  if (active && combatSection) combatSection.open = true;
  if (playerCombatRound) playerCombatRound.textContent = String(currentCombat?.rodada || 1);
  if (playerCombatTurn) {
    playerCombatTurn.textContent = isAdventureClosed
      ? 'A aventura foi encerrada.'
      : !active
      ? currentCombat?.mensagemFinal || 'Combate encerrado.'
      : isMyTurn
        ? 'É o seu turno. Você pode atacar, usar item ou passar.'
        : `Aguardando turno de ${turn?.exibicao || 'outro participante'}.`;
  }
  if (playerCombatEnemy) {
    playerCombatEnemy.textContent = enemy
      ? `${enemy.nome} — Vida ${enemy.vidaAtual}/${enemy.vidaMaxima} • Defesa ${enemy.defesa}`
      : currentCombat?.mensagemFinal || 'Nenhum inimigo.';
  }
  if (combatAttackButton) combatAttackButton.disabled = !isMyTurn;
  if (combatPassButton) combatPassButton.disabled = !isMyTurn;
  renderCombatLog(playerCombatLog, currentCombat?.log);

  if (combatStartForm) combatStartForm.classList.toggle('hidden', active);
  if (startCombatButton) startCombatButton.disabled = active || isAdventureClosed;
  if (masterCombatState) {
    if (!hasCombat) {
      masterCombatState.textContent = 'Sem combate ativo.';
    } else if (!active) {
      masterCombatState.textContent = currentCombat.mensagemFinal || 'Combate encerrado.';
    } else {
      masterCombatState.textContent = `Rodada ${currentCombat.rodada} • Turno de ${turn?.exibicao || '—'}${enemy ? ` • ${enemy.nome}: ${enemy.vidaAtual}/${enemy.vidaMaxima} PV • Defesa ${enemy.defesa}` : ''}`;
    }
  }
  renderCombatLog(masterCombatLog, currentCombat?.log);
  renderInventoryDetails(selectedInventoryItem);
}

function createFinalCharacterCard(character, isDead = false) {
  const card = document.createElement('article');
  card.className = `final-character-card${isDead ? ' is-dead' : ''}`;
  const title = document.createElement('strong');
  title.textContent = isDead
    ? `${character.nome} / ${character.personagem} — Morto`
    : `${character.nome} / ${character.personagem}`;
  card.appendChild(title);

  [
    `Classe: ${character.classe || 'Não registrada'}`,
    `Vida final: ${character.vidaAtual}/${character.vidaMaxima}`,
    `Status: ${isDead ? 'Morto' : character.status}`,
    `Itens: ${Number(character.itens) || 0}`,
  ].forEach((text) => {
    const detail = document.createElement('span');
    detail.textContent = text;
    card.appendChild(detail);
  });
  return card;
}

function renderFinalAdventure(summary) {
  if (!summary) return;
  isAdventureClosed = true;
  if (finalRoomName) finalRoomName.textContent = summary.nomeSala || 'Aventura';
  if (finalDuration) finalDuration.textContent = summary.duracao || '0min';
  if (finalSummaryText) finalSummaryText.textContent = summary.resumoFinal || 'Resumo final indisponível.';

  const stats = summary.estatisticas || {};
  if (finalScenesCount) finalScenesCount.textContent = String(stats.cenasJogadas ?? 0);
  if (finalDecisionsCount) finalDecisionsCount.textContent = String(stats.decisoesTomadas ?? 0);
  if (finalDiceCount) finalDiceCount.textContent = String(stats.testesDeDado ?? 0);
  if (finalSuccessCount) finalSuccessCount.textContent = String(stats.sucessos ?? 0);
  if (finalFailureCount) finalFailureCount.textContent = String(stats.falhas ?? 0);
  if (finalCombatCount) finalCombatCount.textContent = String(stats.combates ?? 0);

  if (finalMomentsList) {
    finalMomentsList.replaceChildren();
    const moments = Array.isArray(summary.momentosImportantes) ? summary.momentosImportantes : [];
    (moments.length > 0 ? moments : ['Nenhum momento importante foi registrado.']).forEach((moment) => {
      const item = document.createElement('li');
      item.textContent = moment;
      finalMomentsList.appendChild(item);
    });
  }

  const characters = Array.isArray(summary.personagens) ? summary.personagens : [];
  const survivors = Array.isArray(summary.sobreviventes)
    ? summary.sobreviventes
    : characters.filter((character) => character.status !== 'Morto');
  const deadCharacters = Array.isArray(summary.personagensMortos)
    ? summary.personagensMortos
    : characters.filter((character) => character.status === 'Morto');
  if (finalSurvivorsList) {
    finalSurvivorsList.replaceChildren();
    (survivors.length > 0 ? survivors : [{ nome: 'Nenhum personagem', personagem: 'sobreviveu', classe: '-', vidaAtual: 0, vidaMaxima: 0, status: '-', itens: 0 }])
      .forEach((character) => finalSurvivorsList.appendChild(createFinalCharacterCard(character)));
  }
  if (finalDeadList) {
    finalDeadList.replaceChildren();
    deadCharacters.forEach((character) => finalDeadList.appendChild(createFinalCharacterCard(character, true)));
    if (deadCharacters.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Nenhum personagem morreu.';
      finalDeadList.appendChild(empty);
    }
  }

  showScreen('finalScreen');
}

function renderPlayerHealthState(players = currentPlayers) {
  const player = getLocalPlayer(players);
  if (!player) return;

  const life = Math.max(0, Number(player.vidaAtual ?? player.vida) || 0);
  const maxLife = Math.max(1, Number(player.vidaMaxima) || 32);
  const status = player.statusPersonagem || (life === 0 ? 'Inconsciente' : 'Normal');
  const statusClass = status.toLowerCase().replace(/á/g, 'a').replace(/\s+/g, '-');
  const unavailable = status === 'Inconsciente' || status === 'Morto';

  if (unavailable && selectedOption) {
    selectedOption = null;
    voteConfirmed = false;
    optionButtons.forEach((button) => button.classList.remove('selected'));
  }

  if (playerLifeDisplay) playerLifeDisplay.textContent = `${life} / ${maxLife}`;
  if (playerStatusDisplay) {
    playerStatusDisplay.textContent = status;
    playerStatusDisplay.dataset.status = statusClass;
  }
  if (playerHealthBar) {
    playerHealthBar.style.width = `${Math.min(100, (life / maxLife) * 100)}%`;
    playerHealthBar.dataset.status = statusClass;
    playerHealthBar.setAttribute('aria-valuenow', String(life));
    playerHealthBar.setAttribute('aria-valuemax', String(maxLife));
  }
  if (characterStateMessage) {
    characterStateMessage.textContent = status === 'Morto'
      ? 'Seu personagem morreu. Você pode continuar acompanhando a aventura.'
      : status === 'Inconsciente'
        ? 'Seu personagem está inconsciente. Você pode voltar a participar se receber cura.'
        : '';
    characterStateMessage.classList.toggle('is-unavailable', status === 'Morto' || status === 'Inconsciente');
  }

  if (confirmVoteButton) confirmVoteButton.disabled = isAdventureClosed || unavailable || !selectedOption;
  optionButtons.forEach((button) => {
    button.disabled = !canLocalVote() || button.style.display === 'none';
  });
  renderInventoryDetails(selectedInventoryItem);
  renderDiceRequestPanel();
  updateVoteSelectionStatus();
}

function renderDicePlayerOptions(players = currentPlayers) {
  if (!dicePlayerSelect) {
    return;
  }

  const names = Array.from(new Set((players || []).map((player) => player.name).filter(Boolean)));
  const previousValue = dicePlayerSelect.value;

  dicePlayerSelect.innerHTML = '';

  if (names.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Nenhum jogador';
    dicePlayerSelect.appendChild(option);
    return;
  }

  names.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    dicePlayerSelect.appendChild(option);
  });

  if (names.includes(previousValue)) {
    dicePlayerSelect.value = previousValue;
  } else {
    dicePlayerSelect.value = names[0];
  }
}

function renderDiceRequestPanel() {
  if (!playerDicePanel || !diceRequestTitle || !diceRequestDifficulty || !diceRequestBonus || !playerRollDiceButton || !playerDiceResult) {
    return;
  }

  if (!pendingDiceRequest) {
    playerDicePanel.style.display = 'none';
    playerDiceResult.textContent = 'Aguardando mestre...';
    playerRollDiceButton.classList.remove('is-loading');
    playerRollDiceButton.setAttribute('aria-busy', 'false');
    playerRollDiceButton.disabled = true;
    return;
  }

  playerRollDiceButton.classList.remove('is-loading');
  playerRollDiceButton.setAttribute('aria-busy', 'false');
  const isRolled = Boolean(pendingDiceRequest.rolled || lastDiceResult?.rollId === pendingDiceRequest.rollId);
  playerDicePanel.style.display = 'block';
  diceRequestTitle.textContent = pendingDiceRequest.testName || 'Teste';
  diceRequestDifficulty.textContent = `Dificuldade ${pendingDiceRequest.difficulty || 10}`;
  diceRequestBonus.textContent = `Bônus ${pendingDiceRequest.bonus >= 0 ? '+' : ''}${pendingDiceRequest.bonus || 0}`;
  playerRollDiceButton.disabled = isRolled || !canLocalPlayerAct() || Boolean(currentCombat?.ativo);
  playerRollDiceButton.textContent = isRolled ? 'Teste concluído' : 'Rolar dado';
  const result = lastDiceResult?.rollId === pendingDiceRequest.rollId ? lastDiceResult : null;
  playerDiceNumber.textContent = result ? String(result.dado) : '—';
  playerDiceResult.dataset.result = result ? (result.success ? 'success' : 'failure') : '';
  playerDiceResult.textContent = result
    ? `${result.status} — d20: ${result.dado}, bônus: ${result.bonus >= 0 ? '+' : ''}${result.bonus}, total: ${result.total}`
    : isRolled
      ? 'Este teste já foi respondido.'
      : 'Clique para rolar o dado.';
}

function updateVoteSelectionStatus() {
  optionButtons.forEach((button) => {
    const selected = selectedOption === button.dataset.option;
    button.classList.toggle('confirmed', selected && voteConfirmed);
    button.setAttribute('aria-pressed', String(selected));
  });
  confirmVoteButton?.classList.toggle('is-loading', votePending);
  confirmVoteButton?.setAttribute('aria-busy', String(votePending));
  if (!confirmVoteButton) {
    return;
  }

  if (!canLocalPlayerAct()) {
    confirmVoteButton.disabled = true;
    if (choiceStatus) {
      choiceStatus.textContent = isAdventureClosed
        ? 'A aventura foi encerrada.'
        : 'Seu personagem não pode votar neste estado.';
    }
    return;
  }

  if (currentCombat?.ativo) {
    confirmVoteButton.disabled = true;
    if (choiceStatus) choiceStatus.textContent = 'A votação fica pausada durante o combate.';
    return;
  }

  if (votePending) {
    confirmVoteButton.disabled = true;
    if (choiceStatus) choiceStatus.textContent = 'Enviando escolha...';
    return;
  }

  if (!selectedOption) {
    confirmVoteButton.disabled = true;
    if (choiceStatus) {
      choiceStatus.textContent = 'Selecione uma opção.';
    }
    return;
  }

  confirmVoteButton.disabled = voteConfirmed;
  if (choiceStatus) {
    choiceStatus.textContent = voteConfirmed
      ? 'Escolha confirmada.'
      : 'Opção selecionada. Confirme sua escolha.';
  }
}

function renderSceneImage(scene = currentScene) {
  document.querySelectorAll('.scene-image').forEach((element) => {
    const title = scene?.titulo || 'Cena';
    element.setAttribute('aria-label', title);
    const label = document.createElement('span');
    label.textContent = title;
    if (!scene?.imagem) {
      element.replaceChildren(label);
      return;
    }
    const image = document.createElement('img');
    image.alt = title;
    image.decoding = 'async';
    image.addEventListener('error', () => element.replaceChildren(label), { once: true });
    image.src = scene.imagem;
    element.replaceChildren(image);
  });
}

function renderScene(scene = currentScene) {
  currentScene = scene || currentScene;

  if (narrativeTitle) {
    narrativeTitle.textContent = currentScene.titulo || 'Cena';
  }

  if (narrativeText) {
    narrativeText.textContent = currentScene.texto || currentScene.narrativa || 'Narrativa indisponível.';
  }

  renderSceneImage(currentScene);

  optionButtons.forEach((button, index) => {
    const option = currentScene.opcoes?.[index];

    if (!option) {
      button.style.display = 'none';
      button.disabled = true;
      button.dataset.option = '';
      button.textContent = '';
      return;
    }

    button.style.display = 'block';
    button.disabled = !canLocalVote();
    button.dataset.option = option.id;
    button.textContent = option.texto;
    button.classList.toggle('selected', selectedOption === option.id);
  });

  renderPlayerHealthState();
  updateVoteSelectionStatus();
}

function getSceneIdentity(scene) {
  if (!scene) return '';
  return String(scene.id ?? `${scene.titulo || ''}|${scene.texto || scene.narrativa || ''}`);
}

function setCurrentScene(scene) {
  const nextScene = scene || currentScene;
  const sceneChanged = getSceneIdentity(nextScene) !== getSceneIdentity(currentScene);
  currentScene = nextScene;
  if (sceneChanged) {
    selectedOption = null;
    voteConfirmed = false;
    votePending = false;
    optionButtons.forEach((button) => button.classList.remove('selected'));
  }
}

function setupAdventureOptions() {
  optionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!canLocalVote()) return;

      const optionLabel = button.textContent.trim();
      const optionId = voteOptionMap[optionLabel] || voteOptionMap[button.dataset.option] || String(button.dataset.option || '').trim();

      selectedOption = optionId;
      voteConfirmed = false;
      votePending = false;
      optionButtons.forEach((option) => option.classList.toggle('selected', option === button));
      updateVoteSelectionStatus();
    });
  });

  if (confirmVoteButton) {
    confirmVoteButton.addEventListener('click', () => {
      if (!selectedOption || !currentRoomCode || !canLocalVote()) {
        return;
      }

      votePending = true;
      updateVoteSelectionStatus();
      socket.emit('room:vote', { code: currentRoomCode, option: selectedOption });
    });
  }
}

function renderMasterVotes(roomState = null) {
  voteList.innerHTML = '';

  const counts = roomState?.voteCounts || {};
  const voteOptions = Array.isArray(roomState?.scene?.opcoes) ? roomState.scene.opcoes : [
    { id: 'seguir-som', texto: 'Seguir o som' },
    { id: 'investigar', texto: 'Investigar ao redor' },
    { id: 'voltar', texto: 'Voltar pelo caminho seguro' },
  ];

  voteOptions.forEach((vote) => {
    const votes = counts[vote.id] || 0;
    const voteItem = document.createElement('div');
    voteItem.className = 'vote-item';
    const optionText = document.createElement('strong');
    optionText.textContent = vote.texto || 'Opção';
    const voteCount = document.createElement('span');
    voteCount.textContent = `${votes} voto${votes !== 1 ? 's' : ''}`;
    voteItem.append(optionText, voteCount);
    voteList.appendChild(voteItem);
  });
}

function renderPlayerInventory(roomState = null) {
  const players = roomState?.players || currentPlayers || [];
  const localPlayer = getLocalPlayer(players);
  const inventory = Array.isArray(localPlayer?.inventario) ? localPlayer.inventario : [];

  if (!inventoryList) {
    return;
  }

  inventoryList.innerHTML = '';
  selectedInventoryItem = selectedInventoryItem
    ? inventory.find((item) => item.id === selectedInventoryItem.id) || null
    : null;
  if (inventory.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'inventory-item empty';
    emptyState.textContent = 'Sem itens no inventário.';
    inventoryList.appendChild(emptyState);
    if (inventoryItemDetails) {
      inventoryItemDetails.classList.add('hidden');
    }
    return;
  }

  inventory.forEach((item) => {
    const inventoryButton = document.createElement('button');
    inventoryButton.type = 'button';
    inventoryButton.className = 'inventory-item-button';
    inventoryButton.textContent = `${item.nome} x${item.quantidade}`;
    inventoryButton.addEventListener('click', () => {
      selectedInventoryItem = item;
      renderInventoryDetails(item);
    });
    inventoryList.appendChild(inventoryButton);
  });

  if (!selectedInventoryItem && inventory.length > 0) {
    selectedInventoryItem = inventory[0];
  }

  if (selectedInventoryItem) {
    renderInventoryDetails(selectedInventoryItem);
  }
}

function renderInventoryDetails(item) {
  if (!inventoryItemDetails || !selectedItemName || !selectedItemMeta || !useItemButton) {
    return;
  }

  if (!item) {
    inventoryItemDetails.classList.add('hidden');
    return;
  }

  const isUsable = item.tipo === 'consumivel' && item.id === 'pocao-cura';
  selectedItemName.textContent = item.nome || 'Item';
  selectedItemMeta.textContent = `Quantidade: ${item.quantidade} • Tipo: ${item.tipo || 'misc'}`;
  useItemButton.textContent = isUsable ? 'Usar item' : 'Item não utilizável';
  useItemButton.disabled = !isUsable || !canLocalUseItem();
  inventoryItemDetails.classList.remove('hidden');
}

function renderMasterPlayers(roomState = null) {
  masterPlayerList.innerHTML = '';

  const players = roomState?.players || currentPlayers || [];

  players.forEach((player) => {
    const item = document.createElement('div');
    item.className = 'master-player-item';
    const totalItemCount = (player.inventario || []).reduce((sum, entry) => sum + Number(entry.quantidade || 0), 0);
    const playerInfo = document.createElement('div');
    const playerName = document.createElement('strong');
    playerName.textContent = player.name || 'Jogador';
    const playerSummary = document.createElement('small');
    playerSummary.textContent = `${player.character || 'Sem personagem'} • Vida ${player.vidaAtual ?? player.vida ?? 0}/${player.vidaMaxima || 32}`;
    playerInfo.append(playerName, document.createElement('br'), playerSummary);

    const actions = document.createElement('div');
    actions.className = 'master-player-actions';
    const statusBadge = document.createElement('span');
    const characterStatus = player.statusPersonagem || 'Normal';
    statusBadge.className = 'master-player-badge health-status-badge';
    statusBadge.dataset.status = characterStatus.toLowerCase();
    statusBadge.textContent = characterStatus;
    const detailButton = document.createElement('button');
    detailButton.type = 'button';
    detailButton.className = 'secondary-button master-detail-button';
    detailButton.textContent = 'Ver personagem';
    actions.append(statusBadge, detailButton);
    item.append(playerInfo, actions);

    detailButton.addEventListener('click', () => {
      selectedMasterPlayerName = player.name;
      renderMasterPlayerDetail(players);
    });

    if (totalItemCount > 0) {
      const itemCountBadge = document.createElement('small');
      itemCountBadge.className = 'master-item-count';
      itemCountBadge.textContent = `${totalItemCount} item${totalItemCount !== 1 ? 's' : ''}`;
      item.appendChild(itemCountBadge);
    }

    masterPlayerList.appendChild(item);
  });

  renderMasterPlayerDetail(players);

  if (masterTargetItemSelect) {
    const previousTarget = masterTargetItemSelect.value;
    masterTargetItemSelect.innerHTML = '';
    players.forEach((player) => {
      const option = document.createElement('option');
      option.value = player.name;
      option.textContent = player.name;
      masterTargetItemSelect.appendChild(option);
    });
    if (players.length > 0) {
      masterTargetItemSelect.value = previousTarget || players[0].name;
    }
  }

  if (healthTargetSelect) {
    const previousTarget = healthTargetSelect.value;
    healthTargetSelect.innerHTML = '';
    players.forEach((player) => {
      const option = document.createElement('option');
      option.value = player.name;
      option.textContent = `${player.name} — ${player.character || 'Sem personagem'}`;
      healthTargetSelect.appendChild(option);
    });
    if (players.length > 0) {
      healthTargetSelect.value = players.some((player) => player.name === previousTarget) ? previousTarget : players[0].name;
    }
    updateDeclareDeadAvailability(players);
  }
}

function updateDeclareDeadAvailability(players = currentPlayers) {
  if (!declareDeadButton || !healthTargetSelect) return;
  const target = (players || []).find((player) => player.name === healthTargetSelect.value);
  declareDeadButton.disabled = !target || target.statusPersonagem !== 'Inconsciente';
}

function renderMasterPlayerDetail(players = currentPlayers) {
  if (!masterPlayerDetail) {
    return;
  }

  const selectedPlayer = players.find((player) => player.name === selectedMasterPlayerName)
    || players[0]
    || null;

  if (!selectedPlayer) {
    masterPlayerDetail.classList.add('hidden');
    masterPlayerDetail.innerHTML = '';
    return;
  }

  const itemText = Array.isArray(selectedPlayer.inventario) && selectedPlayer.inventario.length > 0
    ? selectedPlayer.inventario.map((item) => `${item.nome} x${item.quantidade}`).join(', ')
    : 'Nenhum item';
  masterPlayerDetail.replaceChildren();
  const playerName = document.createElement('strong');
  playerName.textContent = selectedPlayer.name || 'Jogador';
  masterPlayerDetail.appendChild(playerName);
  [
    `Vida: ${selectedPlayer.vidaAtual ?? selectedPlayer.vida ?? 0}/${selectedPlayer.vidaMaxima || 32}`,
    `Status: ${selectedPlayer.statusPersonagem || 'Normal'}`,
    `Itens: ${itemText}`,
  ].forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    masterPlayerDetail.appendChild(paragraph);
  });
  masterPlayerDetail.classList.remove('hidden');
}

function updateMasterGenerationState(generating, message = '') {
  isGeneratingScene = Boolean(generating);
  continueStoryButton?.classList.toggle('is-loading', isGeneratingScene);
  continueStoryButton?.setAttribute('aria-busy', String(isGeneratingScene));
  choiceStatus?.classList.toggle('is-loading', isGeneratingScene);

  if (continueStoryButton) {
    continueStoryButton.disabled = isGeneratingScene;
    continueStoryButton.textContent = isGeneratingScene
      ? /imagem/i.test(message) ? 'Criando imagem...' : 'Gerando próxima cena...'
      : 'Continuar história';
  }

  if (masterSceneFeedback) {
    masterSceneFeedback.textContent = message;
    masterSceneFeedback.classList.toggle('is-loading', isGeneratingScene);
  }
}

function renderAdventureMemoryPanel(roomState = null) {
  const memory = (roomState && roomState.adventureState) || {
    resumo: '',
    localAtual: '',
    objetivoAtual: '',
    acontecimentosImportantes: [],
    npcsConhecidos: [],
    descobertas: [],
  };

  if (memorySummary) {
    memorySummary.textContent = memory.resumo || 'Sem memória registrada.';
  }

  if (memoryLocalAtual) {
    memoryLocalAtual.textContent = memory.localAtual || '-';
  }

  if (memoryObjetivoAtual) {
    memoryObjetivoAtual.textContent = memory.objetivoAtual || '-';
  }

  if (memoryAcontecimentos) {
    memoryAcontecimentos.textContent = (memory.acontecimentosImportantes || []).length > 0 ? memory.acontecimentosImportantes.join('; ') : '-';
  }

  if (memoryNpcs) {
    memoryNpcs.textContent = (memory.npcsConhecidos || []).length > 0 ? memory.npcsConhecidos.join('; ') : '-';
  }

  if (memoryDescobertas) {
    memoryDescobertas.textContent = (memory.descobertas || []).length > 0 ? memory.descobertas.join('; ') : '-';
  }
}

function renderMasterPanel(roomState = null) {
  const state = roomState || {
    players: currentPlayers.length > 0 ? currentPlayers : [],
    voteCounts: {},
    totalPlayers: currentPlayers.length,
    scene: currentScene,
    isGeneratingScene,
    adventureState: {
      resumo: '',
      localAtual: '',
      objetivoAtual: '',
      acontecimentosImportantes: [],
      npcsConhecidos: [],
      descobertas: [],
    },
  };
  const roomCode = temporaryRoomData?.code || currentRoomCode || 'A7K9';

  masterRoomCodeDisplay.textContent = roomCode;
  masterRoomCode.textContent = roomCode;
  masterPlayersCount.textContent = String(state.totalPlayers ?? state.players?.length ?? 0);

  if (continueStoryButton) {
    const generating = Boolean(state.isGeneratingScene ?? isGeneratingScene);
    continueStoryButton.disabled = generating || isAdventureClosed;
    continueStoryButton.classList.toggle('is-loading', generating);
    continueStoryButton.setAttribute('aria-busy', String(generating));
    continueStoryButton.textContent = isAdventureClosed
      ? 'Aventura encerrada'
      : generating ? 'Gerando próxima cena...' : 'Continuar história';
  }
  if (endAdventureButton) endAdventureButton.disabled = isAdventureClosed;

  if (masterNarrativeTitle) {
    masterNarrativeTitle.textContent = state.scene?.titulo || currentScene.titulo || 'Cena';
  }

  if (masterNarrativeText) {
    masterNarrativeText.textContent = state.scene?.texto || state.scene?.narrativa || currentScene.texto || currentScene.narrativa || 'Narrativa indisponível.';
  }

  renderSceneImage(state.scene || currentScene);

  if (secretEventTarget) {
    const names = Array.from(new Set((state.players || []).map((player) => player.name).filter(Boolean)));
    const previousValue = secretEventTarget.value;
    secretEventTarget.innerHTML = '';

    if (names.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Nenhum jogador';
      secretEventTarget.appendChild(option);
    } else {
      names.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        secretEventTarget.appendChild(option);
      });
      if (names.includes(previousValue)) {
        secretEventTarget.value = previousValue;
      } else {
        secretEventTarget.value = names[0];
      }
    }
  }

  renderDicePlayerOptions(state.players || currentPlayers);
  renderMasterVotes(state);
  renderMasterPlayers(state);
  renderAdventureMemoryPanel(state);
  renderPlayerInventory(state);
}

function renderSecretEventPanel() {
  if (!playerSecretEventPanel || !playerSecretEventTitle || !playerSecretEventText || !secretOptionButton1 || !secretOptionButton2 || !secretEventAnswerStatus) {
    return;
  }

  if (!currentSecretEvent) {
    playerSecretEventPanel.classList.add('hidden');
    secretEventAnswerStatus.textContent = 'Aguardando sua resposta.';
    return;
  }

  const [optionOne, optionTwo] = currentSecretEvent.opcoes || [];
  playerSecretEventPanel.classList.remove('hidden');
  playerSecretEventTitle.textContent = currentSecretEvent.titulo || 'Evento secreto';
  playerSecretEventText.textContent = currentSecretEvent.texto || 'Mensagem confidencial.';
  secretOptionButton1.textContent = optionOne?.texto || 'Opção 1';
  secretOptionButton2.textContent = optionTwo?.texto || 'Opção 2';
  secretOptionButton1.disabled = Boolean(currentSecretEvent.resposta || currentSecretEvent.status === 'respondido');
  secretOptionButton2.disabled = Boolean(currentSecretEvent.resposta || currentSecretEvent.status === 'respondido');

  if (currentSecretEvent.resposta || currentSecretEvent.status === 'respondido') {
    secretEventAnswerStatus.textContent = 'Escolha enviada ao mestre.';
    return;
  }

  secretEventAnswerStatus.textContent = 'Apenas você pode ver este evento.';
}

function renderMasterDiceResult(result) {
  if (!masterDiceResult) {
    return;
  }

  if (!result) {
    masterDiceResult.textContent = 'Nenhum teste enviado ainda.';
    return;
  }

  masterDiceResult.dataset.result = result.success ? 'success' : 'failure';
  const bonusText = result.bonus >= 0 ? `+${result.bonus}` : String(result.bonus);
  masterDiceResult.replaceChildren();
  [
    { text: result.player, strong: true },
    { text: result.testName },
    { text: `d20: ${result.dado}` },
    { text: `bônus: ${bonusText}` },
    { text: `total: ${result.total}` },
    { text: `dificuldade: ${result.difficulty}` },
    { text: result.status, strong: true },
  ].forEach((entry) => {
    const line = entry.strong ? document.createElement('strong') : document.createElement('span');
    line.textContent = entry.text || '';
    if (entry.text === `d20: ${result.dado}`) line.classList.add('dice-number');
    masterDiceResult.append(line, document.createElement('br'));
  });
}

socket.on('scene:update', (scene) => {
  console.log('[CENA] Nova cena recebida:', currentRoomCode, scene?.titulo);
  setCurrentScene(scene);
  renderScene(currentScene);
  if (isMasterClient) {
    masterNarrativeTitle.textContent = narrativeTitle.textContent;
    masterNarrativeText.textContent = narrativeText.textContent;
  }
  console.log('[CENA] Cena renderizada:', isMasterClient ? 'mestre' : 'jogador');
});

socket.on('room:vote:result', ({ success, message }) => {
  votePending = false;
  voteConfirmed = Boolean(success);
  if (choiceStatus && message) choiceStatus.textContent = message;
  updateVoteSelectionStatus();
});

socket.on('scene:generating', ({ isGenerating, message }) => {
  updateMasterGenerationState(isGenerating, message || (isGenerating ? 'Gerando próxima cena...' : ''));
  console.log('[CENA] Estado de geração:', isGenerating, message || '');

  if (choiceStatus) {
    choiceStatus.textContent = message || 'O mestre está preparando a próxima cena...';
  }
});

socket.on('scene:tie', ({ tieOptions = [], message = 'Há um empate. Escolha manualmente uma opção.' }) => {
  updateMasterGenerationState(false, message);
  const optionList = tieOptions.map((option, index) => `${index + 1}. ${option.texto}`).join('\n');
  const chosenValue = window.prompt(`${message}\nEscolha uma opção pelo número ou texto:\n${optionList}`, '');
  if (!chosenValue) return;
  const input = chosenValue.trim().toLowerCase();
  const matchedOption = tieOptions.find((option, index) => (
    String(index + 1) === input
    || String(option.texto || '').trim().toLowerCase() === input
    || String(option.id || '').trim().toLowerCase() === input
  ));
  if (!matchedOption) {
    updateMasterGenerationState(false, 'Selecione uma das opções listadas.');
    return;
  }
  updateMasterGenerationState(true, 'Gerando próxima cena...');
  console.log('[CENA] Emitindo scene:advance:manual:', currentRoomCode, matchedOption.id);
  socket.emit('scene:advance:manual', { code: currentRoomCode, selectedOption: matchedOption.id });
});

socket.on('scene:ai:error', ({ message, isGenerating = false }) => {
  const feedback = message || 'Erro ao gerar próxima cena.';
  console.error('[CENA][ERRO]', feedback);
  updateMasterGenerationState(isGenerating, feedback);
  if (choiceStatus) choiceStatus.textContent = feedback;
});

let rejoinAfterDisconnect = false;
socket.on('connect', () => {
  if (!rejoinAfterDisconnect || !currentRoomCode || !currentPlayerName || isAdventureClosed) return;
  rejoinAfterDisconnect = false;
  const player = getLocalPlayer();
  socket.emit('join-room', {
    code: currentRoomCode,
    name: currentPlayerName,
    character: player?.character || selectedCharacter?.name || 'Kael',
    role: isMasterClient ? 'master' : 'player',
  });
});

socket.on('disconnect', () => {
  rejoinAfterDisconnect = Boolean(currentRoomCode && currentPlayerName && !isAdventureClosed);
  votePending = false;
  voteConfirmed = false;
  selectedOption = null;
  updateVoteSelectionStatus();
  if (isGeneratingScene) updateMasterGenerationState(false, 'Conexão interrompida. Tente novamente após reconectar.');
});

socket.on('secret:event', (event) => {
  currentSecretEvent = event;
  renderSecretEventPanel();
});

socket.on('secret:event:sent', ({ targetPlayerName, titulo }) => {
  if (masterSecretResponse) {
    masterSecretResponse.textContent = `Evento enviado para ${targetPlayerName}: ${titulo}`;
  }
});

socket.on('secret:event:answer-confirmed', ({ resposta }) => {
  if (!currentSecretEvent) {
    return;
  }

  currentSecretEvent.resposta = resposta;
  currentSecretEvent.status = 'respondido';
  renderSecretEventPanel();
});

socket.on('secret:event:response', ({ player, resposta, titulo }) => {
  if (masterSecretResponse) {
    masterSecretResponse.textContent = `${player} respondeu: ${resposta} — ${titulo}`;
  }
});

socket.on('secret:event:error', ({ message }) => {
  if (masterSecretResponse) {
    masterSecretResponse.textContent = message;
  }
});

socket.on('inventory:use:result', ({ success, message, player }) => {
  if (message && choiceStatus) {
    choiceStatus.textContent = message;
  }

  if (player && player.name === currentPlayerName) {
    currentPlayers = currentPlayers.map((entry) => entry.name === player.name ? { ...entry, ...player } : entry);
    renderPlayerInventory({ players: currentPlayers });
    renderPlayerHealthState();
  }
});

socket.on('inventory:give-item:result', ({ success, message, player }) => {
  if (masterSecretResponse && message) {
    masterSecretResponse.textContent = message;
  }

  if (player && currentPlayers.length > 0) {
    currentPlayers = currentPlayers.map((entry) => entry.name === player.name ? { ...entry, ...player } : entry);
    renderPlayerInventory({ players: currentPlayers });
  }
});

socket.on('health:action:result', ({ success, message }) => {
  if (healthActionFeedback) {
    healthActionFeedback.textContent = message || (success ? 'Ação aplicada.' : 'A ação não foi aplicada.');
    healthActionFeedback.dataset.success = String(Boolean(success));
  }
});

socket.on('combat:update', (combat) => {
  renderCombatState(combat);
  renderPlayerHealthState();
});

socket.on('combat:start:result', ({ success, message }) => {
  if (masterCombatFeedback) {
    masterCombatFeedback.textContent = message || (success ? 'Combate iniciado.' : 'Não foi possível iniciar o combate.');
  }
});

socket.on('combat:action:result', (result) => {
  const message = result?.mensagem || result?.message || '';
  if (playerCombatFeedback && message) playerCombatFeedback.textContent = message;
  if (masterCombatFeedback && message) masterCombatFeedback.textContent = message;
});

socket.on('combat:ended', ({ mensagem }) => {
  if (playerCombatFeedback) playerCombatFeedback.textContent = mensagem || '';
  if (masterCombatFeedback) masterCombatFeedback.textContent = mensagem || '';
});

socket.on('adventure:closing', () => {
  isAdventureClosed = true;
  renderCombatState(currentCombat);
  renderPlayerHealthState();
  if (masterCombatFeedback) masterCombatFeedback.textContent = 'A aventura está sendo encerrada...';
});

socket.on('adventure:ended', (summary) => {
  renderFinalAdventure(summary);
});

socket.on('adventure:end:result', ({ success, message }) => {
  if (masterCombatFeedback) masterCombatFeedback.textContent = message || (success ? 'Aventura encerrada.' : 'Não foi possível encerrar a aventura.');
});

socket.on('character:update', (updatedCharacter) => {
  if (!updatedCharacter || !updatedCharacter.name) return;
  currentPlayers = currentPlayers.map((player) => player.name === updatedCharacter.name
    ? { ...player, ...updatedCharacter }
    : player);
  renderPlayerHealthState();
  renderPlayerInventory({ players: currentPlayers });
  renderMasterPlayers({ players: currentPlayers });
});

socket.on('dice:request', (request) => {
  pendingDiceRequest = request;
  pendingDiceRequest.rolled = false;
  renderDiceRequestPanel();
});

socket.on('dice:request-sent', () => {
  if (masterDiceResult) {
    masterDiceResult.dataset.result = '';
    masterDiceResult.textContent = 'Teste enviado para o jogador selecionado.';
    document.getElementById('masterDiceSection').open = true;
  }
});

socket.on('dice:request:error', ({ message }) => {
  if (masterDiceResult) masterDiceResult.textContent = message || 'O pedido de teste foi rejeitado.';
});

socket.on('dice:result', (result) => {
  lastDiceResult = result;

  if (result.player === currentPlayerName) {
    pendingDiceRequest = pendingDiceRequest || {};
    pendingDiceRequest.rolled = true;
    pendingDiceRequest.rollId = result.rollId;
    playerDiceResult.textContent = `${result.status} — d20: ${result.dado}, total: ${result.total}`;
    renderDiceRequestPanel();
  }

  if (masterDiceResult) {
    renderMasterDiceResult(result);
  }
});

socket.on('room:update', (roomState) => {
  const state = roomState && typeof roomState === 'object' && Array.isArray(roomState.players)
    ? roomState
    : {
        players: Array.isArray(roomState) ? roomState : [],
        voteCounts: {},
        totalPlayers: Array.isArray(roomState) ? roomState.length : 0,
        scene: currentScene,
      };

  currentPlayers = state.players || [];
  const wasMasterClient = isMasterClient;
  isMasterClient = Boolean(socket.id && state.masterId === socket.id);
  if (requestedMasterEntry) {
    requestedMasterEntry = false;
    if (!isMasterClient) {
      showScreen('lobbyScreen');
      alert('Esta sala já possui outro mestre.');
    }
  } else if (!wasMasterClient && isMasterClient && state.aventura?.status === 'active') {
    showScreen('masterScreen');
  } else if (wasMasterClient && !isMasterClient && masterScreen.classList.contains('active')) {
    showScreen('lobbyScreen');
  }
  isAdventureClosed = state.aventura?.status === 'closed';
  if (state.aventura?.status === 'active' && !isAdventureClosed) {
    if (isMasterClient) {
      if (!finalScreen.classList.contains('active')) showScreen('masterScreen');
    } else if (lobbyScreen.classList.contains('active') || characterScreen.classList.contains('active')) {
      renderAdventureScreen();
      showScreen('adventureScreen');
    }
  }
  renderCombatState(state.combat || null);
  renderPlayers(currentPlayers);
  renderMasterPanel(state);
  renderDicePlayerOptions(state.players || currentPlayers);
  renderPlayerInventory(state);
  renderPlayerHealthState(state.players || currentPlayers);
  if (state.scene) {
    setCurrentScene(state.scene);
    renderScene(currentScene);
  }
});

socket.on('join-room:error', ({ message }) => {
  isMasterClient = false;
  requestedMasterEntry = false;
  showScreen('loginScreen');
  alert(message || 'Não foi possível entrar nesta sala.');
});

socket.on('character:select:result', ({ success, message }) => {
  if (!success) {
    confirmCharacterButton.disabled = false;
    alert(message || 'Não foi possível selecionar esse personagem.');
  }
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const roomCode = roomCodeInput.value.trim();
  const playerName = playerNameInput.value.trim();

  if (!roomCode || !playerName) {
    alert('Preencha o código da sala e o seu nome para continuar.');
    return;
  }

  resetRoomClientContext();
  currentRoomCode = roomCode.toUpperCase();
  currentPlayerName = playerName;
  isAdventureClosed = false;
  lobbyRoomName.textContent = `Sala ${currentRoomCode}`;
  roomCodeDisplay.textContent = currentRoomCode;

  socket.emit('join-room', {
    code: currentRoomCode,
    name: playerName,
    character: 'Kael',
    status: 'Pronto',
    role: 'player',
  });

  showScreen('lobbyScreen');
});

createRoomButton.addEventListener('click', () => {
  showScreen('createRoomScreen');
});

enterMasterButton.addEventListener('click', () => {
  const roomCode = roomCodeInput.value.trim();
  const playerName = playerNameInput.value.trim();

  if (!roomCode || !playerName) {
    alert('Preencha o código da sala e o seu nome para entrar como mestre.');
    return;
  }

  resetRoomClientContext();
  currentRoomCode = roomCode.toUpperCase();
  currentPlayerName = playerName;
  isAdventureClosed = false;
  requestedMasterEntry = true;
  socket.emit('join-room', {
    code: currentRoomCode,
    name: playerName,
    character: 'Kael',
    status: 'Pronto',
    role: 'master',
  });

  renderMasterPanel();
  showScreen('masterScreen');
});

backToLoginButton.addEventListener('click', () => {
  showScreen('loginScreen');
});

lobbyBackButton.addEventListener('click', () => {
  showScreen('createRoomScreen');
});

selectCharacterButton.addEventListener('click', () => {
  openCharacterSelection();
});

copyRoomCodeButton.addEventListener('click', async () => {
  const roomCode = roomCodeDisplay.textContent.trim();

  try {
    await navigator.clipboard.writeText(roomCode);
    alert(`Código ${roomCode} copiado para a área de transferência.`);
  } catch (error) {
    alert('Não foi possível copiar o código automaticamente.');
  }
});

startAdventureButton.addEventListener('click', () => {
  if (!currentRoomCode || isAdventureClosed) return;
  socket.emit('adventure:start', { code: currentRoomCode });
  renderPlayers(currentPlayers);
  selectedCharacter = characters.find((character) => character.name === getLocalPlayer()?.character) || selectedCharacter;
  renderAdventureScreen();
  choiceStatus.textContent = 'Escolha registrada.';
  console.log('Aventura iniciada');
  if (isMasterClient) {
    renderMasterPanel();
    showScreen('masterScreen');
  } else {
    showScreen('adventureScreen');
  }
});

if (endAdventureButton) {
  endAdventureButton.addEventListener('click', () => {
    if (!currentRoomCode || isAdventureClosed) return;
    if (!window.confirm('Tem certeza que deseja encerrar a aventura?')) return;
    endAdventureButton.disabled = true;
    socket.emit('adventure:end', { code: currentRoomCode });
  });
}

if (backToMenuButton) {
  backToMenuButton.addEventListener('click', () => {
    currentRoomCode = '';
    currentPlayerName = '';
    currentPlayers = [];
    currentCombat = null;
    isAdventureClosed = false;
    selectedOption = null;
    voteConfirmed = false;
    showScreen('loginScreen');
  });
}

continueStoryButton.addEventListener('click', () => {
  console.log('[CENA] Clique em Continuar história:', currentRoomCode);
  if (isGeneratingScene || isAdventureClosed) return;
  if (!currentRoomCode || !socket.connected || !isMasterClient) {
    updateMasterGenerationState(false, 'Não foi possível solicitar avanço. Confira a conexão e o mestre da sala.');
    return;
  }
  updateMasterGenerationState(true, 'Gerando próxima cena...');
  const code = currentRoomCode.trim().toUpperCase();
  console.log('[CENA] Emitindo scene:advance:', code, socket.id);
  socket.emit('scene:advance', { code });
});

if (useItemButton) {
  useItemButton.addEventListener('click', () => {
    if (!selectedInventoryItem || !currentRoomCode || isAdventureClosed) {
      return;
    }

    socket.emit('inventory:use', {
      code: currentRoomCode,
      itemId: selectedInventoryItem.id,
    });
  });
}

if (giveItemButton) {
  giveItemButton.addEventListener('click', () => {
    if (!currentRoomCode || isAdventureClosed || !masterTargetItemSelect || !masterItemSelect) {
      return;
    }

    const targetPlayerName = masterTargetItemSelect.value;
    const itemId = masterItemSelect.value;
    const quantity = Math.max(1, Number(masterItemQuantity.value) || 1);

    if (!targetPlayerName || !itemId) {
      return;
    }

    socket.emit('inventory:give-item', {
      code: currentRoomCode,
      targetPlayerName,
      itemId,
      quantity,
    });
  });
}

if (healthTargetSelect) {
  healthTargetSelect.addEventListener('change', () => updateDeclareDeadAvailability());
}

function submitHealthAction(eventName) {
  if (!currentRoomCode || isAdventureClosed || !healthTargetSelect || !healthAmountInput) return;
  const amount = Number(healthAmountInput.value);
  if (!Number.isInteger(amount) || amount < 1 || amount > 999) {
    if (healthActionFeedback) healthActionFeedback.textContent = 'Informe um valor inteiro entre 1 e 999.';
    return;
  }
  socket.emit(eventName, {
    code: currentRoomCode,
    targetPlayerName: healthTargetSelect.value,
    amount,
  });
}

if (applyDamageButton) {
  applyDamageButton.addEventListener('click', () => submitHealthAction('health:damage'));
}

if (healCharacterButton) {
  healCharacterButton.addEventListener('click', () => submitHealthAction('health:heal'));
}

if (declareDeadButton) {
  declareDeadButton.addEventListener('click', () => {
    if (!currentRoomCode || isAdventureClosed || !healthTargetSelect || declareDeadButton.disabled) return;
    socket.emit('health:declare-dead', {
      code: currentRoomCode,
      targetPlayerName: healthTargetSelect.value,
    });
  });
}

if (startCombatButton) {
  startCombatButton.addEventListener('click', () => {
    if (!currentRoomCode || isAdventureClosed || !combatEnemyName || !combatEnemyLife || !combatEnemyDefense) return;
    const enemyName = combatEnemyName.value.trim();
    const enemyLife = Number(combatEnemyLife.value);
    const enemyDefense = Number(combatEnemyDefense.value);
    if (!enemyName || !Number.isInteger(enemyLife) || enemyLife < 1 || enemyLife > 999
      || !Number.isInteger(enemyDefense) || enemyDefense < 1 || enemyDefense > 999) {
      if (masterCombatFeedback) masterCombatFeedback.textContent = 'Informe nome e valores inteiros de 1 a 999.';
      return;
    }
    socket.emit('combat:start', {
      code: currentRoomCode,
      enemyName,
      enemyLife,
      enemyDefense,
    });
  });
}

if (combatAttackButton) {
  combatAttackButton.addEventListener('click', () => {
    if (currentRoomCode && !isAdventureClosed && isLocalCombatTurn()) {
      socket.emit('combat:attack', { code: currentRoomCode });
    }
  });
}

if (combatPassButton) {
  combatPassButton.addEventListener('click', () => {
    if (currentRoomCode && !isAdventureClosed && isLocalCombatTurn()) {
      socket.emit('combat:pass', { code: currentRoomCode });
    }
  });
}

if (showAdventureMemoryButton && adventureMemoryPanel) {
  showAdventureMemoryButton.addEventListener('click', () => {
    adventureMemoryPanel.classList.toggle('hidden');
    showAdventureMemoryButton.setAttribute('aria-expanded', String(!adventureMemoryPanel.classList.contains('hidden')));
    if (!adventureMemoryPanel.classList.contains('hidden')) adventureMemoryPanel.scrollIntoView({ block: 'start' });
  });
}

rollDiceButton.addEventListener('click', () => {
  const section = document.getElementById('masterDiceSection');
  section.open = true;
  section.scrollIntoView({ block: 'start' });
  dicePlayerSelect.focus({ preventScroll: true });
});

sendDiceTestButton.addEventListener('click', () => {
  if (!currentRoomCode || isAdventureClosed || !isMasterClient) {
    return;
  }

  const targetPlayerName = dicePlayerSelect.value;
  const testName = diceTestName.value.trim() || 'Teste';
  const difficulty = Number(diceDifficulty.value) || 10;
  const bonus = Number(diceBonus.value) || 0;

  if (!targetPlayerName || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 30
    || !Number.isInteger(bonus) || bonus < -99 || bonus > 99) {
    if (masterDiceResult) masterDiceResult.textContent = 'Selecione um jogador e use dificuldade 1–30 e bônus -99–99.';
    return;
  }

  socket.emit('dice:request', {
    code: currentRoomCode,
    targetPlayerName,
    testName,
    difficulty,
    bonus,
  });

  if (masterDiceResult) {
    masterDiceResult.textContent = `Teste enviado para ${targetPlayerName}.`;
  }
});

playerRollDiceButton.addEventListener('click', () => {
  if (!pendingDiceRequest || !currentRoomCode || isAdventureClosed) {
    return;
  }

  playerRollDiceButton.disabled = true;
  playerRollDiceButton.textContent = 'Rolando dado...';
  playerRollDiceButton.classList.add('is-loading');
  playerRollDiceButton.setAttribute('aria-busy', 'true');
  socket.emit('dice:roll', {
    code: currentRoomCode,
    rollId: pendingDiceRequest.rollId,
  });
});

secretEventButton.addEventListener('click', () => {
  if (!secretEventForm) {
    return;
  }

  secretEventForm.classList.toggle('hidden');
  secretEventButton.setAttribute('aria-expanded', String(!secretEventForm.classList.contains('hidden')));
  if (!secretEventForm.classList.contains('hidden')) secretEventForm.scrollIntoView({ block: 'start' });
});

sendSecretEventButton.addEventListener('click', () => {
  if (!currentRoomCode || isAdventureClosed || !secretEventTarget || !secretEventTitle || !secretEventText || !secretEventOption1 || !secretEventOption2) {
    return;
  }

  const targetPlayerName = secretEventTarget.value;
  const title = secretEventTitle.value.trim();
  const text = secretEventText.value.trim();
  const optionOne = secretEventOption1.value.trim();
  const optionTwo = secretEventOption2.value.trim();

  if (!targetPlayerName || !title || !text || !optionOne || !optionTwo) {
    alert('Preencha todos os campos do evento secreto antes de enviar.');
    return;
  }

  socket.emit('secret:event:create', {
    code: currentRoomCode,
    targetPlayerName,
    title,
    text,
    options: [
      { texto: optionOne },
      { texto: optionTwo },
    ],
  });

  secretEventForm.classList.add('hidden');
  secretEventTitle.value = '';
  secretEventText.value = '';
  secretEventOption1.value = '';
  secretEventOption2.value = '';
});

secretOptionButton1.addEventListener('click', () => {
  if (!currentSecretEvent || currentSecretEvent.status === 'respondido') {
    return;
  }

  socket.emit('secret:event:answer', {
    code: currentRoomCode,
    secretEventId: currentSecretEvent.secretEventId,
    option: secretOptionButton1.textContent.trim(),
  });

  currentSecretEvent.status = 'respondido';
  currentSecretEvent.resposta = secretOptionButton1.textContent.trim();
  renderSecretEventPanel();
});

secretOptionButton2.addEventListener('click', () => {
  if (!currentSecretEvent || currentSecretEvent.status === 'respondido') {
    return;
  }

  socket.emit('secret:event:answer', {
    code: currentRoomCode,
    secretEventId: currentSecretEvent.secretEventId,
    option: secretOptionButton2.textContent.trim(),
  });

  currentSecretEvent.status = 'respondido';
  currentSecretEvent.resposta = secretOptionButton2.textContent.trim();
  renderSecretEventPanel();
});

characterBackButton.addEventListener('click', () => {
  showScreen('lobbyScreen');
});

confirmCharacterButton.addEventListener('click', () => {
  confirmCharacterSelection();
});

createRoomForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const roomName = document.getElementById('roomName').value.trim();
  const hostName = document.getElementById('hostName').value.trim();

  if (!roomName || !hostName) {
    alert('Preencha o nome da sala e o seu nome para criar a partida.');
    return;
  }

  const voteSystem = document.querySelector('input[name="voteSystem"]:checked').value;
  const privacy = document.querySelector('input[name="privacy"]:checked').value;
  const maxPlayers = document.getElementById('maxPlayers').value;
  const diceSystem = document.getElementById('diceSystem').value;
  const generatedCode = generateRoomCode();

  temporaryRoomData = {
    roomName,
    hostName,
    maxPlayers,
    diceSystem,
    voteSystem,
    privacy,
    code: generatedCode,
  };

  resetRoomClientContext();
  currentRoomCode = generatedCode;
  currentPlayerName = hostName;
  isAdventureClosed = false;
  socket.emit('join-room', {
    code: currentRoomCode,
    name: hostName,
    character: 'Kael',
    roomName,
    status: 'Pronto',
    role: 'master',
  });

  console.log('Sala criada:', temporaryRoomData);
  console.log('Código da sala:', generatedCode);

  showLobby(temporaryRoomData);
});

setupAdventureOptions();
renderPlayers(mockPlayers);
renderCharacterSummary();
renderCharacters();
renderAdventureScreen();
renderScene(currentScene);
renderSecretEventPanel();
renderMasterPanel();
