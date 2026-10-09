const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const OpenAI = require('openai');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const rooms = {};
const imageCache = new Map();
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const ROOM_STATUS = {
  READY: 'Pronto',
  SELECTING: 'Escolhendo',
};
const CHARACTER_DATA = {
  Kael: { className: 'Patrulheiro', maxLife: 32 },
  Lyor: { className: 'Elfo Mago', maxLife: 24 },
  Brakk: { className: 'Guerreiro', maxLife: 40 },
  Nyra: { className: 'Ladina', maxLife: 28 },
};
const scenes = [
  {
    id: 1,
    titulo: 'Floresta Sombria',
    texto: 'Vocês entram na floresta e escutam algo se movendo entre as árvores.',
    imagem: null,
    opcoes: [
      { id: 'seguir-som', texto: 'Seguir o som' },
      { id: 'investigar', texto: 'Investigar ao redor' },
      { id: 'voltar', texto: 'Voltar pelo caminho seguro' },
    ],
  },
  {
    id: 2,
    titulo: 'Cabana Abandonada',
    texto: 'O grupo segue pela floresta e encontra uma cabana antiga iluminada por uma vela. A porta está entreaberta.',
    imagem: null,
    opcoes: [
      { id: 'entrar-cabana', texto: 'Entrar na cabana' },
      { id: 'observar-janelas', texto: 'Observar pelas janelas' },
      { id: 'contornar-cabana', texto: 'Dar a volta pelo local' },
    ],
  },
];
const validOptions = ['seguir-som', 'investigar', 'voltar', 'entrar-cabana', 'observar-janelas', 'contornar-cabana'];
const ITEM_CATALOG = {
  'pocao-cura': {
    id: 'pocao-cura',
    nome: 'Poção de cura',
    tipo: 'consumivel',
    descricao: 'Restaura 5 pontos de vida.',
    valor: 5,
  },
  'chave-antiga': {
    id: 'chave-antiga',
    nome: 'Chave antiga',
    tipo: 'chave',
    descricao: 'Este item será usado quando alguma situação permitir.',
    valor: 0,
  },
  'mapa-rasgado': {
    id: 'mapa-rasgado',
    nome: 'Mapa rasgado',
    tipo: 'mapa',
    descricao: 'Este item será usado quando alguma situação permitir.',
    valor: 0,
  },
  'adaga': {
    id: 'adaga',
    nome: 'Adaga',
    tipo: 'arma',
    descricao: 'Este item será usado quando alguma situação permitir.',
    valor: 0,
  },
};
const voteAliases = {
  'seguir o som': 'seguir-som',
  'investigar ao redor': 'investigar',
  'voltar pelo caminho seguro': 'voltar',
  'entrar na cabana': 'entrar-cabana',
  'observar pelas janelas': 'observar-janelas',
  'dar a volta pelo local': 'contornar-cabana',
  'seguir-som': 'seguir-som',
  investigar: 'investigar',
  voltar: 'voltar',
  'entrar-cabana': 'entrar-cabana',
  'observar-janelas': 'observar-janelas',
  'contornar-cabana': 'contornar-cabana',
};

function normalizeInventoryItem(item = {}) {
  const rawId = String(item?.id || item?.nome || '').trim();
  const normalizedId = rawId ? rawId.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '-') : '';
  const definition = ITEM_CATALOG[normalizedId] || ITEM_CATALOG[String(item?.tipo || '').trim().toLowerCase()] || null;
  const selectedId = definition ? definition.id : normalizedId || `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const selectedName = String(item?.nome || definition?.nome || selectedId).trim() || 'Item';
  const selectedType = String(item?.tipo || definition?.tipo || 'misc').trim().toLowerCase();
  const quantity = Number(item?.quantidade ?? 1);

  return {
    id: selectedId,
    nome: selectedName,
    tipo: selectedType,
    quantidade: Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1,
  };
}

function normalizeInventory(inventory = []) {
  if (!Array.isArray(inventory)) {
    return [];
  }

  return inventory
    .map((item) => normalizeInventoryItem(item))
    .filter((item) => item && item.id && item.nome)
    .slice(0, 20);
}

function addInventoryItem(player, itemId, quantity = 1) {
  if (!player) {
    return player;
  }

  const safeQuantity = Number(quantity) || 1;
  const normalizedPlayer = player;
  const inventory = normalizeInventory(normalizedPlayer.inventario || []);
  const normalizedItemId = String(itemId || '').trim().toLowerCase();
  const existing = inventory.find((item) => item.id === normalizedItemId || item.nome.toLowerCase() === normalizedItemId);

  if (existing) {
    existing.quantidade += Math.max(1, Math.floor(safeQuantity));
  } else {
    inventory.push(normalizeInventoryItem({
      id: ITEM_CATALOG[normalizedItemId]?.id || normalizedItemId,
      nome: ITEM_CATALOG[normalizedItemId]?.nome || String(itemId || 'Item').trim(),
      tipo: ITEM_CATALOG[normalizedItemId]?.tipo || 'misc',
      quantidade: Math.max(1, Math.floor(safeQuantity)),
    }));
  }

  normalizedPlayer.inventario = normalizeInventory(inventory);
  return normalizedPlayer;
}

function removeInventoryItem(player, itemId, quantity = 1) {
  if (!player) {
    return player;
  }

  const inventory = normalizeInventory(player.inventario || []);
  const normalizedItemId = String(itemId || '').trim().toLowerCase();
  const itemIndex = inventory.findIndex((item) => item.id === normalizedItemId || item.nome.toLowerCase() === normalizedItemId);

  if (itemIndex < 0) {
    return player;
  }

  const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  inventory[itemIndex].quantidade = Math.max(0, inventory[itemIndex].quantidade - safeQuantity);

  if (inventory[itemIndex].quantidade === 0) {
    inventory.splice(itemIndex, 1);
  }

  player.inventario = normalizeInventory(inventory);
  return player;
}

function consumeInventoryItem(player, itemId) {
  if (!player) {
    return { success: false, message: 'Jogador não encontrado.' };
  }

  const characterStatus = player.statusPersonagem || calculateCharacterStatus(player.vidaAtual ?? player.vida, player.vidaMaxima);
  if (['Inconsciente', 'Morto'].includes(characterStatus)) {
    return { success: false, message: 'Seu personagem não pode usar itens neste estado.' };
  }

  const inventory = normalizeInventory(player.inventario || []);
  const normalizedItemId = String(itemId || '').trim().toLowerCase();
  const item = inventory.find((entry) => entry.id === normalizedItemId || entry.nome.toLowerCase() === normalizedItemId);

  if (!item) {
    return { success: false, message: 'Você não possui este item.' };
  }

  if (item.tipo !== 'consumivel') {
    return { success: false, message: 'Este item não pode ser usado agora.' };
  }

  if (item.id !== 'pocao-cura' && item.nome.toLowerCase() !== 'poção de cura') {
    return { success: false, message: 'Este item não possui efeito ativo.' };
  }

  const maxLife = Number(player.vidaMaxima) || 32;
  const before = Number(player.vidaAtual ?? player.vida) || 0;
  const healAmount = Number(ITEM_CATALOG['pocao-cura']?.valor || 5);
  const after = Math.min(maxLife, before + healAmount);
  const effect = after - before;

  if (item.quantidade <= 0) {
    return { success: false, message: 'Você não possui poções suficientes.' };
  }

  item.quantidade -= 1;
  player.vidaAtual = after;
  player.vida = after;
  updateCharacterHealthStatus(player);

  if (item.quantidade <= 0) {
    const trimmedInventory = inventory.filter((entry) => entry.quantidade > 0);
    player.inventario = normalizeInventory(trimmedInventory);
  } else {
    player.inventario = normalizeInventory(inventory);
  }

  return {
    success: true,
    itemId: item.id,
    effect,
    before,
    after,
    message: 'Poção de cura usada com sucesso.',
  };
}

function calculateCharacterStatus(currentLife, maxLife) {
  const safeMaxLife = Number(maxLife) > 0 ? Number(maxLife) : 32;
  const safeLife = Math.max(0, Math.min(Number(currentLife) || 0, safeMaxLife));
  const percentage = (safeLife / safeMaxLife) * 100;

  if (safeLife === 0) return 'Inconsciente';
  if (percentage > 50) return 'Normal';
  if (percentage >= 26) return 'Ferido';
  return 'Crítico';
}

function updateCharacterHealthStatus(player) {
  if (!player || player.statusPersonagem === 'Morto') {
    return player?.statusPersonagem || null;
  }

  player.statusPersonagem = calculateCharacterStatus(player.vidaAtual ?? player.vida, player.vidaMaxima);
  return player.statusPersonagem;
}

function validateHealthAmount(value) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) {
    return null;
  }
  const amount = Number(value);
  return Number.isInteger(amount) && amount >= 1 && amount <= 999 ? amount : null;
}

function applyCharacterDamage(player, rawAmount) {
  const amount = validateHealthAmount(rawAmount);
  if (!player || amount === null) {
    return { success: false, message: 'Informe um valor de dano entre 1 e 999.' };
  }
  if (player.statusPersonagem === 'Morto') {
    return { success: false, message: 'Um personagem morto não pode receber dano.' };
  }

  const before = Math.max(0, Number(player.vidaAtual ?? player.vida) || 0);
  player.vidaAtual = Math.max(0, before - amount);
  player.vida = player.vidaAtual;
  const previousStatus = player.statusPersonagem;
  updateCharacterHealthStatus(player);
  const appliedAmount = before - player.vidaAtual;

  return {
    success: true,
    amount: appliedAmount,
    before,
    after: player.vidaAtual,
    status: player.statusPersonagem,
    becameUnconscious: previousStatus !== 'Inconsciente' && player.statusPersonagem === 'Inconsciente',
    message: `${player.character || player.name} recebeu ${appliedAmount} de dano.`,
  };
}

function healCharacter(player, rawAmount) {
  const amount = validateHealthAmount(rawAmount);
  if (!player || amount === null) {
    return { success: false, message: 'Informe um valor de cura entre 1 e 999.' };
  }
  if (player.statusPersonagem === 'Morto') {
    return { success: false, message: 'Um personagem morto não pode ser curado nesta versão.' };
  }

  const before = Math.max(0, Number(player.vidaAtual ?? player.vida) || 0);
  const maxLife = Number(player.vidaMaxima) || 32;
  player.vidaAtual = Math.min(maxLife, before + amount);
  player.vida = player.vidaAtual;
  updateCharacterHealthStatus(player);

  return {
    success: true,
    amount: player.vidaAtual - before,
    before,
    after: player.vidaAtual,
    status: player.statusPersonagem,
    message: `${player.character || player.name} foi curado em ${player.vidaAtual - before}.`,
  };
}

function declareCharacterDead(player) {
  if (!player || player.statusPersonagem !== 'Inconsciente' || Number(player.vidaAtual ?? player.vida) !== 0) {
    return { success: false, message: 'Somente um personagem inconsciente pode ser declarado morto.' };
  }

  player.statusPersonagem = 'Morto';
  return {
    success: true,
    status: player.statusPersonagem,
    message: `${player.character || player.name} foi declarado morto.`,
  };
}

function rollCombatDie(sides, random = Math.random) {
  return Math.min(sides - 1, Math.floor(random() * sides)) + 1;
}

function getCombatPlayers(room) {
  return (room?.jogadores || []).filter((player) => (
    player.id !== room.mestreId
    && Number(player.vidaAtual ?? player.vida) > 0
    && !['Inconsciente', 'Morto'].includes(player.statusPersonagem)
  ));
}

function buildCombatOrder(room) {
  const players = getCombatPlayers(room).map((player) => ({
    tipo: 'jogador',
    jogadorId: player.id,
    nome: player.name,
    personagem: player.character || 'Personagem',
    exibicao: `${player.name} / ${player.character || 'Personagem'}`,
  }));
  const enemy = room?.combat?.inimigos?.[0];

  if (enemy) {
    players.push({
      tipo: 'inimigo',
      inimigoId: enemy.id,
      nome: enemy.nome,
      exibicao: enemy.nome,
    });
  }

  return players;
}

function appendCombatLog(combat, message) {
  if (!combat || !message) return;
  combat.log = [...(combat.log || []), String(message)].slice(-8);
}

function finishCombat(room, outcome, message) {
  const combat = room?.combat;
  if (!combat || !combat.ativo) return false;
  combat.ativo = false;
  combat.resultado = outcome;
  combat.mensagemFinal = message;
  appendCombatLog(combat, message);
  room.historicoCombates = room.historicoCombates || [];
  room.historicoCombates = [...room.historicoCombates, {
    inimigo: combat.inimigos?.[0]?.nome || 'Inimigo',
    resultado: outcome,
    rodadaFinal: combat.rodada,
    log: (combat.log || []).slice(-8),
  }].slice(-20);
  return true;
}

function startCombat(room, rawName, rawLife, rawDefense) {
  if (!room) return { success: false, message: 'Sala não encontrada.' };
  if (room.combat?.ativo) return { success: false, message: 'Já existe um combate ativo nesta sala.' };

  const name = String(rawName || '').trim().slice(0, 60);
  const life = validateHealthAmount(rawLife);
  const defense = validateHealthAmount(rawDefense);
  if (!name || life === null || defense === null) {
    return { success: false, message: 'Informe nome, vida e defesa válidos (1 a 999).'};
  }
  if (getCombatPlayers(room).length === 0) {
    return { success: false, message: 'Não há jogadores vivos e conscientes para iniciar o combate.' };
  }

  room.combat = {
    ativo: true,
    rodada: 1,
    turnoAtual: 0,
    ordem: [],
    inimigos: [{
      id: `enemy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nome: name,
      vidaAtual: life,
      vidaMaxima: life,
      defesa: defense,
    }],
    log: [],
    resultado: null,
    mensagemFinal: '',
  };
  room.combat.ordem = buildCombatOrder(room);
  room.votos = {};
  ensureSessionStats(room).combates += 1;
  appendCombatLog(room.combat, `Combate iniciado contra ${name}.`);
  return { success: true, message: `Combate iniciado contra ${name}.` };
}

function getCurrentCombatTurn(room) {
  const combat = room?.combat;
  return combat?.ativo ? combat.ordem?.[combat.turnoAtual] || null : null;
}

function isCombatPlayerTurn(room, playerId) {
  const currentTurn = getCurrentCombatTurn(room);
  const player = (room?.jogadores || []).find((entry) => entry.id === playerId);
  return Boolean(
    currentTurn?.tipo === 'jogador'
    && currentTurn.jogadorId === playerId
    && player
    && Number(player.vidaAtual ?? player.vida) > 0
    && !['Inconsciente', 'Morto'].includes(player.statusPersonagem)
  );
}

function resolveEnemyTurn(room, random = Math.random) {
  const combat = room?.combat;
  const enemy = combat?.inimigos?.[0];
  const targets = getCombatPlayers(room);

  if (!combat?.ativo) return { success: false, message: 'Não há combate ativo.' };
  if (!targets.length) {
    finishCombat(room, 'derrota', 'O grupo foi derrotado.');
    return { success: true, ended: true, message: combat.mensagemFinal };
  }
  if (!enemy || enemy.vidaAtual <= 0) {
    finishCombat(room, 'vitoria', 'Inimigo derrotado.');
    return { success: true, ended: true, message: combat.mensagemFinal };
  }

  const target = targets[Math.min(targets.length - 1, Math.floor(random() * targets.length))];
  const die = rollCombatDie(20, random);
  const total = die + 2;
  if (total >= 12) {
    const damage = rollCombatDie(6, random);
    const damageResult = applyCharacterDamage(target, damage);
    appendCombatLog(combat, `${enemy.nome} atacou ${target.character || target.name}. d20: ${die} + 2 = ${total}. Acertou; dano: ${damageResult.amount}.`);
    if (damageResult.becameUnconscious) {
      appendCombatLog(combat, `${target.character || target.name} ficou inconsciente.`);
    }
  } else {
    appendCombatLog(combat, `${enemy.nome} atacou ${target.character || target.name}. d20: ${die} + 2 = ${total}. Errou.`);
  }

  if (getCombatPlayers(room).length === 0) {
    finishCombat(room, 'derrota', 'O grupo foi derrotado.');
    return { success: true, ended: true, message: combat.mensagemFinal };
  }

  combat.rodada += 1;
  combat.ordem = buildCombatOrder(room);
  combat.turnoAtual = 0;
  return { success: true, ended: false };
}

function advanceCombatTurn(room, random = Math.random) {
  const combat = room?.combat;
  if (!combat?.ativo) return { success: false, message: 'Não há combate ativo.' };

  combat.turnoAtual += 1;
  while (combat.turnoAtual < combat.ordem.length) {
    const nextTurn = combat.ordem[combat.turnoAtual];
    if (nextTurn.tipo === 'inimigo') {
      return resolveEnemyTurn(room, random);
    }
    if (isCombatPlayerTurn(room, nextTurn.jogadorId)) {
      return { success: true, ended: false };
    }
    combat.turnoAtual += 1;
  }

  if (getCombatPlayers(room).length === 0) {
    finishCombat(room, 'derrota', 'O grupo foi derrotado.');
    return { success: true, ended: true, message: combat.mensagemFinal };
  }

  return resolveEnemyTurn(room, random);
}

function performCombatAttack(room, playerId, random = Math.random) {
  if (!room?.combat?.ativo) return { success: false, message: 'Não há combate ativo.' };
  if (!isCombatPlayerTurn(room, playerId)) return { success: false, message: 'Não é o seu turno de combate.' };

  const player = room.jogadores.find((entry) => entry.id === playerId);
  const enemy = room.combat.inimigos?.[0];
  if (!enemy || enemy.vidaAtual <= 0) return { success: false, message: 'Não há inimigo disponível para atacar.' };

  const die = rollCombatDie(20, random);
  const criticalHit = die === 20;
  const criticalMiss = die === 1;
  const total = die + 2;
  const hit = criticalHit || (!criticalMiss && total >= enemy.defesa);
  let damage = 0;

  if (hit) {
    damage = rollCombatDie(6, random);
    if (criticalHit) damage += rollCombatDie(6, random);
    const appliedDamage = Math.min(damage, enemy.vidaAtual);
    enemy.vidaAtual = Math.max(0, enemy.vidaAtual - damage);
    damage = appliedDamage;
  }

  const attackLine = `${player.character || player.name} atacou ${enemy.nome}. Resultado: ${die} + 2 = ${total}. ${criticalHit ? 'Acerto crítico.' : criticalMiss ? 'Falha crítica.' : hit ? 'Acertou.' : 'Errou.'}${hit ? ` Dano: ${damage}.` : ''}`;
  appendCombatLog(room.combat, attackLine);

  if (enemy.vidaAtual === 0) {
    finishCombat(room, 'vitoria', 'Inimigo derrotado.');
  } else {
    advanceCombatTurn(room, random);
  }

  return {
    success: true,
    jogador: player.character || player.name,
    inimigo: enemy.nome,
    d20: die,
    bonus: 2,
    total,
    acerto: hit,
    critico: criticalHit,
    falhaCritica: criticalMiss,
    dano: damage,
    vidaInimigo: enemy.vidaAtual,
    mensagem: attackLine,
  };
}

function passCombatTurn(room, playerId, random = Math.random) {
  if (!room?.combat?.ativo) return { success: false, message: 'Não há combate ativo.' };
  if (!isCombatPlayerTurn(room, playerId)) return { success: false, message: 'Não é o seu turno de combate.' };
  const player = room.jogadores.find((entry) => entry.id === playerId);
  appendCombatLog(room.combat, `${player.character || player.name} passou o turno.`);
  advanceCombatTurn(room, random);
  return { success: true, message: `${player.character || player.name} passou o turno.` };
}

function useCombatItem(room, playerId, itemId, random = Math.random) {
  if (!room?.combat?.ativo) return { success: false, message: 'Não há combate ativo.' };
  if (!isCombatPlayerTurn(room, playerId)) return { success: false, message: 'Não é o seu turno de combate.' };
  const player = room.jogadores.find((entry) => entry.id === playerId);
  const result = consumeInventoryItem(player, itemId);
  if (!result.success) return result;

  appendCombatLog(room.combat, `${player.character || player.name} usou ${ITEM_CATALOG[result.itemId]?.nome || 'um item'}.`);
  advanceCombatTurn(room, random);
  return result;
}

function normalizeVoteOption(option) {
  const normalized = String(option || '').trim().toLowerCase();
  return voteAliases[normalized] || normalized;
}

function createDefaultAdventureState() {
  return {
    resumo: '',
    localAtual: '',
    objetivoAtual: '',
    acontecimentosImportantes: [],
    npcsConhecidos: [],
    locaisConhecidos: [],
    descobertas: [],
  };
}

function normalizeAdventureState(state = {}) {
  const safeState = state || {};

  return {
    resumo: String(safeState.resumo || '').trim(),
    localAtual: String(safeState.localAtual || '').trim(),
    objetivoAtual: String(safeState.objetivoAtual || '').trim(),
    acontecimentosImportantes: Array.isArray(safeState.acontecimentosImportantes)
      ? safeState.acontecimentosImportantes.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 8)
      : [],
    npcsConhecidos: Array.isArray(safeState.npcsConhecidos)
      ? safeState.npcsConhecidos.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 8)
      : [],
    locaisConhecidos: Array.isArray(safeState.locaisConhecidos)
      ? safeState.locaisConhecidos.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 8)
      : [],
    descobertas: Array.isArray(safeState.descobertas)
      ? safeState.descobertas.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 8)
      : [],
  };
}

function applyPlayerVote(room, socketId, option) {
  if (!room || !socketId) {
    return false;
  }

  const normalizedOption = normalizeVoteOption(option);
  const player = (room.jogadores || []).find((entry) => entry.id === socketId);
  if (player && ['Inconsciente', 'Morto'].includes(player.statusPersonagem)) {
    return false;
  }
  const validSceneOptions = getSceneOptionIds(room.cenaAtual || scenes[0]);

  if (!normalizedOption || !validSceneOptions.includes(normalizedOption)) {
    return false;
  }

  room.votos = room.votos || {};
  room.votos[socketId] = normalizedOption;
  return true;
}

function createRoom(roomCode) {
  return {
    codigo: roomCode,
    nome: `Sala ${roomCode}`,
    jogadores: [],
    votos: {},
    mestreId: null,
    cenaAtual: scenes[0],
    historico: [],
    estadoAventura: createDefaultAdventureState(),
    rolls: {},
    secretEvents: {},
    secretEventsByPlayer: {},
    combat: null,
    aventura: {
      status: 'lobby',
      startedAt: null,
      endedAt: null,
      durationMs: 0,
    },
    estatisticas: {
      cenasJogadas: 0,
      decisoesTomadas: 0,
      testesDeDado: 0,
      sucessos: 0,
      falhas: 0,
      combates: 0,
    },
    decisoesPrincipais: [],
    historicoCombates: [],
    resumoFinal: null,
    gerandoCena: false,
  };
}

function normalizePlayerState(player = {}) {
  const normalized = player || {};
  const maxLife = Number(normalized.vidaMaxima) > 0 ? Number(normalized.vidaMaxima) : 32;
  const rawLife = Number(normalized.vidaAtual ?? normalized.vida ?? maxLife);
  const vidaAtual = Math.max(0, Math.min(Number.isFinite(rawLife) ? rawLife : maxLife, maxLife));
  const statusPersonagem = normalized.statusPersonagem === 'Morto'
    ? 'Morto'
    : calculateCharacterStatus(vidaAtual, maxLife);

  return {
    ...normalized,
    vida: vidaAtual,
    vidaAtual,
    vidaMaxima: maxLife,
    statusPersonagem,
    inventario: normalizeInventory(normalized.inventario || []),
  };
}

function applyCharacterSelection(room, socketId, characterName) {
  const characterData = CHARACTER_DATA[String(characterName || '').trim()];
  const player = (room?.jogadores || []).find((entry) => entry.id === socketId);
  if (!room || isAdventureClosed(room) || room.aventura?.status === 'active' || !player || !characterData) {
    return { success: false, message: 'Não foi possível selecionar esse personagem nesta sala.' };
  }

  player.character = String(characterName).trim();
  player.className = characterData.className;
  player.vidaMaxima = characterData.maxLife;
  player.vidaAtual = characterData.maxLife;
  player.vida = characterData.maxLife;
  player.statusPersonagem = 'Normal';
  return { success: true, player };
}

function ensureRoom(roomCode) {
  if (!rooms[roomCode]) {
    rooms[roomCode] = createRoom(roomCode);
  }

  return rooms[roomCode];
}

function isAdventureClosed(room) {
  return room?.aventura?.status === 'closed';
}

function ensureSessionStats(room) {
  if (!room.estatisticas) {
    room.estatisticas = {
      cenasJogadas: 0,
      decisoesTomadas: 0,
      testesDeDado: 0,
      sucessos: 0,
      falhas: 0,
      combates: 0,
    };
  }
  return room.estatisticas;
}

function startAdventureSession(room, startedAt = Date.now()) {
  if (!room || room.aventura?.status === 'closed') return false;
  if (room.aventura?.status === 'active') return false;

  room.aventura = {
    status: 'active',
    startedAt,
    endedAt: null,
    durationMs: 0,
  };
  const stats = ensureSessionStats(room);
  stats.cenasJogadas = Math.max(1, Number(stats.cenasJogadas) || 0);
  return true;
}

function formatSessionDuration(durationMs) {
  const minutes = Math.max(0, Math.floor((Number(durationMs) || 0) / 60000));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours > 0 ? `${hours}h ${remainder}min` : `${minutes}min`;
}

function buildFinalAdventureSnapshot(room) {
  const startedAt = Number(room?.aventura?.startedAt) || null;
  const endedAt = Number(room?.aventura?.endedAt) || Date.now();
  const durationMs = startedAt ? Math.max(0, endedAt - startedAt) : 0;
  const players = (room?.jogadores || []).map((entry) => normalizePlayerState(entry));
  const characters = players.map((player) => ({
    nome: player.name || 'Jogador',
    personagem: player.character || 'Sem personagem',
    classe: player.className || CHARACTER_DATA[player.character]?.className || 'Não registrada',
    vidaAtual: player.vidaAtual,
    vidaMaxima: player.vidaMaxima,
    status: player.statusPersonagem,
    itens: (player.inventario || []).reduce((total, item) => total + (Number(item.quantidade) || 0), 0),
  }));
  const stats = ensureSessionStats(room);
  const momentosImportantes = normalizeAdventureState(room?.estadoAventura).acontecimentosImportantes.slice(-5);
  const combates = [...(room?.historicoCombates || [])];
  if (room?.combat?.ativo) {
    combates.push({
      inimigo: room.combat.inimigos?.[0]?.nome || 'Inimigo',
      resultado: 'aventura-encerrada',
      log: (room.combat.log || []).slice(-5),
    });
  }

  return {
    nomeSala: room?.nome || `Sala ${room?.codigo || ''}`,
    startedAt,
    endedAt,
    duracaoMs: durationMs,
    duracao: formatSessionDuration(durationMs),
    estatisticas: {
      cenasJogadas: Number(stats.cenasJogadas) || 0,
      decisoesTomadas: Number(stats.decisoesTomadas) || 0,
      testesDeDado: Number(stats.testesDeDado) || 0,
      sucessos: Number(stats.sucessos) || 0,
      falhas: Number(stats.falhas) || 0,
      combates: Number(stats.combates) || 0,
    },
    sobreviventes: characters.filter((character) => character.status !== 'Morto'),
    personagensMortos: characters.filter((character) => character.status === 'Morto'),
    personagens: characters,
    momentosImportantes,
    decisoesPrincipais: (room?.decisoesPrincipais || []).slice(-20),
    combates,
    memoria: normalizeAdventureState(room?.estadoAventura),
  };
}

function buildFallbackFinalSummary(snapshot) {
  const paragraphs = [];
  const memorySummary = snapshot.memoria?.resumo;
  if (memorySummary) {
    paragraphs.push(memorySummary);
  }

  const decisionLines = (snapshot.decisoesPrincipais || []).map((decision) => decision.escolha).filter(Boolean);
  if (decisionLines.length > 0) {
    paragraphs.push(`As decisões registradas pelo grupo foram: ${decisionLines.join('; ')}.`);
  }

  const combatLines = (snapshot.combates || []).map((combat) => {
    const result = combat.resultado === 'vitoria'
      ? 'inimigo derrotado'
      : combat.resultado === 'derrota'
        ? 'grupo derrotado'
        : combat.resultado === 'aventura-encerrada'
          ? 'combate ativo quando a aventura foi encerrada'
          : 'resultado não registrado';
    return `${combat.inimigo}: ${result}`;
  });
  if (combatLines.length > 0) {
    paragraphs.push(`Combates registrados: ${combatLines.join('; ')}.`);
  }

  const deadNames = (snapshot.personagensMortos || []).map((character) => character.personagem).join(', ');
  const survivorNames = (snapshot.sobreviventes || []).map((character) => character.personagem).join(', ');
  if (deadNames || survivorNames) {
    paragraphs.push(`Sobreviventes: ${survivorNames || 'nenhum registrado'}. Mortos: ${deadNames || 'nenhum registrado'}.`);
  }

  if (paragraphs.length === 0) {
    paragraphs.push(`A aventura em ${snapshot.nomeSala} foi encerrada. Não há acontecimentos narrativos adicionais registrados na memória.`);
  }
  return paragraphs.slice(0, 6).join('\n\n');
}

function buildFinalSummaryInstructions() {
  return [
    'Você escreve o epílogo de uma aventura cooperativa de RPG.',
    'Use exclusivamente os fatos presentes no JSON fornecido; não invente cenas, falas, resultados, mortes ou relações causais.',
    'Use a memória, escolhas registradas, personagens e logs/resultados de combate para produzir um resumo épico, coerente e curto, com 3 a 6 parágrafos breves.',
    'Não calcule nem altere estatísticas, vida, sobreviventes, status ou duração; esses dados pertencem ao servidor.',
    'Se algum dado não estiver registrado, não o preencha com suposições. Responda apenas com o texto do resumo.',
  ].join(' ');
}

async function generateFinalSummaryText(snapshot) {
  const fallback = buildFallbackFinalSummary(snapshot);
  if (!openai) return { texto: fallback, fonte: 'fallback' };

  try {
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      instructions: buildFinalSummaryInstructions(),
      input: [{
        role: 'user',
        content: [{ type: 'input_text', text: JSON.stringify(snapshot, null, 2) }],
      }],
    }, { timeout: 30_000, maxRetries: 0 });
    const summary = String(response.output_text || '').trim();
    return summary ? { texto: summary, fonte: 'ia' } : { texto: fallback, fonte: 'fallback' };
  } catch (error) {
    logOpenAIError(error);
    return { texto: fallback, fonte: 'fallback' };
  }
}

function normalizeSceneChoiceId(rawId) {
  return String(rawId || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `opcao-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function determineWinningVote(room) {
  const scene = room?.cenaAtual || scenes[0];
  const optionIds = getSceneOptionIds(scene);
  const votes = {};

  optionIds.forEach((optionId) => {
    votes[optionId] = 0;
  });

  Object.values(room?.votos || {}).forEach((optionId) => {
    if (votes[optionId] !== undefined) {
      votes[optionId] += 1;
    }
  });

  const winnerOptions = Object.entries(votes)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (winnerOptions.length === 0) {
    return { winner: null, tieOptions: [], votes };
  }

  const maxVotes = winnerOptions[0][1];
  const tied = winnerOptions.filter(([, count]) => count === maxVotes).map(([optionId]) => optionId);

  if (tied.length > 1) {
    return { winner: null, tieOptions: tied, votes };
  }

  return { winner: tied[0], tieOptions: [], votes };
}

function normalizeGeneratedScene(rawScene) {
  const titulo = String(rawScene?.titulo || '').trim();
  const narrativa = String(rawScene?.narrativa || '').trim();
  const descricaoVisual = String(rawScene?.descricaoVisual || '').trim();
  const opcoes = Array.isArray(rawScene?.opcoes) ? rawScene.opcoes : [];

  if (!titulo || !narrativa || opcoes.length !== 3) {
    return null;
  }

  const sanitizedOptions = [];
  const seenIds = new Set();

  opcoes.forEach((option, index) => {
    const texto = String(option?.texto || '').trim();
    if (!texto) {
      return;
    }

    let optionId = String(option?.id || '').trim();
    if (!optionId) {
      optionId = normalizeSceneChoiceId(texto);
    }

    let finalId = normalizeSceneChoiceId(optionId);
    if (seenIds.has(finalId)) {
      finalId = normalizeSceneChoiceId(`${texto}-${index + 1}`);
    }

    seenIds.add(finalId);
    sanitizedOptions.push({ id: finalId, texto });
  });

  if (sanitizedOptions.length !== 3) {
    return null;
  }

  return {
    titulo,
    narrativa,
    descricaoVisual,
    opcoes: sanitizedOptions,
  };
}

function buildAdventureNarrativeContext(room, selectedOptionId) {
  const currentScene = room?.cenaAtual || scenes[0];
  const previousScenes = Array.isArray(room?.historico) ? room.historico.slice(-3) : [];
  const memory = normalizeAdventureState(room?.estadoAventura);

  return {
    memoria: memory,
    ultimasTresCenas: previousScenes.map((entry) => ({
      titulo: entry?.cena?.titulo || 'Cena anterior',
      texto: entry?.cena?.texto || '',
      escolhaDoGrupo: entry?.escolhaDoGrupo || null,
    })),
    cenaAtual: {
      titulo: currentScene?.titulo || 'Cena atual',
      texto: currentScene?.texto || 'Sem resumo disponível.',
      opcoes: Array.isArray(currentScene?.opcoes) ? currentScene.opcoes.map((option) => ({
        id: option?.id || normalizeSceneChoiceId(option?.texto || 'opcao'),
        texto: option?.texto || 'Opção sem texto',
      })) : [],
    },
    decisaoAtual: selectedOptionId || null,
    jogadores: (room?.jogadores || []).map((player) => {
      const maxLife = Number(player?.vidaMaxima) || 32;
      const currentLife = Number(player?.vidaAtual ?? player?.vida ?? maxLife);
      return {
        nome: player?.name || 'Jogador',
        personagem: player?.character || 'Sem personagem',
        status: player?.statusPersonagem || calculateCharacterStatus(currentLife, maxLife),
        statusSala: player?.status || 'Pronto',
        vidaAtual: Number.isFinite(currentLife) ? currentLife : maxLife,
        vida: Number.isFinite(currentLife) ? currentLife : maxLife,
        vidaMaxima: maxLife,
        inventario: normalizeInventory(player?.inventario || []),
        inventarioResumo: normalizeInventory(player?.inventario || []).map((item) => `${item.nome} x${item.quantidade}`),
      };
    }),
  };
}

function buildAdventureSummaryPrompt(room, newScene, selectedOptionId) {
  const memory = normalizeAdventureState(room?.estadoAventura);
  const recentScenes = Array.isArray(room?.historico) ? room.historico.slice(-3) : [];

  return {
    memoria: memory,
    novaCena: {
      titulo: newScene?.titulo || '',
      narrativa: newScene?.narrativa || newScene?.texto || '',
      opcoes: Array.isArray(newScene?.opcoes) ? newScene.opcoes.map((option) => ({
        id: option?.id || normalizeSceneChoiceId(option?.texto || 'opcao'),
        texto: option?.texto || 'Opção sem texto',
      })) : [],
    },
    decisaoAtual: selectedOptionId || null,
    ultimasTresCenas: recentScenes.map((entry) => ({
      titulo: entry?.cena?.titulo || 'Cena anterior',
      escolhaDoGrupo: entry?.escolhaDoGrupo || null,
    })),
  };
}

function emitSceneStatus(roomCode, generating, message = '') {
  if (!rooms[roomCode] || isAdventureClosed(rooms[roomCode])) {
    return;
  }

  io.to(roomCode).emit('scene:generating', {
    isGenerating: generating,
    message,
  });
}

function getAiPromptInstructions() {
  return [
    'Você é o mestre narrador de um RPG de fantasia sombria cooperativo.',
    'Respeite a memória da aventura e não contradiga fatos importantes já ocorridos.',
    'Continue diretamente a história anterior e respeite a escolha do grupo.',
    'Lembre-se de locais visitados, NPCs apresentados, descobertas relevantes e decisões anteriores.',
    'Não crie novamente um evento já resolvido como se fosse novo.',
    'Não ressuscite personagens mortos nem destrua a continuidade da aventura.',
    'A narrativa deve ser curta, imersiva e em 2 a 4 parágrafos curtos.',
    'Gere exatamente 3 opções diferentes e úteis para a continuidade da aventura.',
    'Crie uma descrição visual curta em uma frase, focada em ambiente e atmosfera, não em personagens.',
    'Use um estilo “dark fantasy, cinematic, realistic fantasy environment, atmospheric lighting, no text, no UI, no logos, no characters looking at camera”.',
    'As opções não devem matar personagens sem motivo narrativo ou mecânico.',
    'Use vida atual e status apenas como contexto para narrar consequências coerentes; nunca altere vida, cura, morte, ressurreição ou status dos personagens.',
    'Não revele informações secretas sem necessidade.',
    'Retorne apenas um JSON válido com as chaves titulo, narrativa, descricaoVisual e opcoes.',
  ].join(' ');
}

function getAdventureMemoryInstructions() {
  return [
    'Você atualiza a memória narrativa de um RPG de fantasia sombria cooperativo.',
    'Resuma apenas fatos importantes e relevantes do progresso da aventura.',
    'Mantenha o texto curto e objetivo, em uma frase ou duas.',
    'Inclua locais visitados, objetivos, NPCs conhecidos, e descobertas relevantes.',
    'Não invente eventos fora do contexto já estabelecido.',
    'Retorne apenas um JSON válido com as chaves resumo, localAtual, objetivoAtual, acontecimentosImportantes, npcsConhecidos, locaisConhecidos, descobertas.',
  ].join(' ');
}

function buildSceneImagePrompt(descricaoVisual, titulo) {
  const cleanDescription = String(descricaoVisual || titulo || '').trim();

  if (!cleanDescription) {
    return 'dark fantasy cinematic fantasy environment atmospheric lighting, no text, no UI, no logos';
  }

  return `${cleanDescription}, dark fantasy, cinematic, realistic fantasy environment, atmospheric lighting, no text, no UI, no logos, no characters looking at camera`;
}

// Temporary API diagnostics: only explicit fields are logged, never headers.
function logOpenAIError(error) {
  const redact = (value) => {
    if (value === null || value === undefined) return null;
    let text = String(value);
    if (process.env.OPENAI_API_KEY) text = text.split(process.env.OPENAI_API_KEY).join('[chave omitida]');
    return text.replace(/sk-[A-Za-z0-9_-]+/g, '[chave omitida]')
      .replace(/Bearer\s+[^\s,;]+/gi, 'Bearer [omitido]');
  };
  console.error('[OPENAI][ERRO]', {
    status: Number.isInteger(error?.status) ? error.status : null,
    tipo: redact(error?.type || error?.name || 'Error'),
    mensagem: redact(error?.message || 'Erro sem mensagem.'),
    codigo: redact(error?.code),
  });
}

async function generateSceneImage(scene) {
  if (!scene || !openai) {
    return null;
  }

  const description = String(scene.descricaoVisual || scene.titulo || '').trim();

  if (!description) {
    return null;
  }

  const cacheKey = description.toLowerCase().slice(0, 160);
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: buildSceneImagePrompt(description, scene.titulo),
      size: '1024x1024',
      quality: 'low',
      response_format: 'b64_json',
    }, { timeout: 30_000, maxRetries: 0 });

    const imageData = response?.data?.[0]?.b64_json;
    if (!imageData) {
      return null;
    }

    const dataUrl = `data:image/png;base64,${imageData}`;
    imageCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (error) {
    logOpenAIError(error);
    return null;
  }
}

async function updateAdventureMemory(roomCode, generatedScene, selectedOptionId) {
  const room = rooms[roomCode];

  if (!room || isAdventureClosed(room) || !openai) {
    return;
  }

  const prompt = buildAdventureSummaryPrompt(room, generatedScene, selectedOptionId);

  try {
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      instructions: getAdventureMemoryInstructions(),
      input: [{
        role: 'user',
        content: [{
          type: 'input_text',
          text: JSON.stringify(prompt, null, 2),
        }],
      }],
      text: {
        format: {
          type: 'json_schema',
          name: 'rpg_adventure_memory',
          schema: {
            type: 'object',
            properties: {
              resumo: { type: 'string' },
              localAtual: { type: 'string' },
              objetivoAtual: { type: 'string' },
              acontecimentosImportantes: { type: 'array', items: { type: 'string' } },
              npcsConhecidos: { type: 'array', items: { type: 'string' } },
              locaisConhecidos: { type: 'array', items: { type: 'string' } },
              descobertas: { type: 'array', items: { type: 'string' } },
            },
            required: ['resumo', 'localAtual', 'objetivoAtual', 'acontecimentosImportantes', 'npcsConhecidos', 'locaisConhecidos', 'descobertas'],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    }, { timeout: 30_000, maxRetries: 0 });

    if (rooms[roomCode] !== room || isAdventureClosed(room)) return;

    const parsedMemory = JSON.parse(response.output_text || '{}');
    const nextMemory = normalizeAdventureState(parsedMemory);

    room.estadoAventura = normalizeAdventureState({
      ...normalizeAdventureState(room.estadoAventura),
      ...nextMemory,
      resumo: nextMemory.resumo || normalizeAdventureState(room.estadoAventura).resumo,
      localAtual: nextMemory.localAtual || generatedScene?.titulo || normalizeAdventureState(room.estadoAventura).localAtual,
      objetivoAtual: nextMemory.objetivoAtual || normalizeAdventureState(room.estadoAventura).objetivoAtual || 'Continuar a aventura.',
    });

    console.log('[server] Memória da aventura atualizada');
    emitRoomState(roomCode);
  } catch (error) {
    logOpenAIError(error);
  }
}

function createFallbackScene(room) {
  if (!Array.isArray(scenes) || scenes.length === 0) return null;
  const currentIndex = scenes.findIndex((scene) => scene.id === room?.cenaAtual?.id);
  const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % scenes.length;
  const fallback = scenes[nextIndex];
  return normalizeGeneratedScene({
    titulo: fallback.titulo,
    narrativa: fallback.texto,
    descricaoVisual: '',
    opcoes: fallback.opcoes,
  });
}

// DEVELOPMENT ONLY: verifies transport and rendering without a working AI service.
function createDevelopmentFallbackScene() {
  return {
    ...normalizeGeneratedScene({
      titulo: 'Trilha Escura',
      narrativa: 'O grupo avança pela floresta e encontra uma trilha coberta por névoa.',
      opcoes: [
        { id: 'seguir-trilha', texto: 'Seguir pela trilha' },
        { id: 'investigar-arredores', texto: 'Investigar os arredores' },
        { id: 'retornar', texto: 'Retornar' },
      ],
    }),
    id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

async function commitGeneratedScene(roomCode, room, scene, selectedOptionId, image = null, updateMemory = true) {
  if (rooms[roomCode] !== room || isAdventureClosed(room)) return false;

  if (room.aventura?.status !== 'active') startAdventureSession(room);
  const stats = ensureSessionStats(room);
  stats.cenasJogadas += 1;
  stats.decisoesTomadas += 1;
  const selectedOptionText = (room.cenaAtual?.opcoes || []).find((option) => option.id === selectedOptionId)?.texto || selectedOptionId;
  room.decisoesPrincipais = [...(room.decisoesPrincipais || []), {
    cena: room.cenaAtual?.titulo || 'Cena',
    escolha: selectedOptionText,
    proximaCena: scene.titulo,
  }].slice(-50);

  const historyEntry = {
    cena: {
      ...room.cenaAtual,
      opcoes: Array.isArray(room.cenaAtual?.opcoes) ? room.cenaAtual.opcoes.map((option) => ({
        id: option.id,
        texto: option.texto,
      })) : [],
    },
    escolhaDoGrupo: selectedOptionId,
  };

  room.historico = [...(room.historico || []), historyEntry].slice(-5);
  room.cenaAtual = { ...scene, imagem: image || null };
  console.log('[CENA] cenaAtual substituída:', roomCode, scene.titulo);
  room.votos = {};
  room.gerandoCena = true;
  emitSceneStatus(roomCode, true, 'Atualizando memória da aventura...');
  console.log('[CENA] Emitindo nova cena:', roomCode);
  emitRoomState(roomCode);
  console.log('[CENA] Nova cena enviada:', roomCode);

  if (updateMemory) {
    await updateAdventureMemory(roomCode, room.cenaAtual, selectedOptionId);
  }
  if (rooms[roomCode] !== room || isAdventureClosed(room)) return false;

  room.gerandoCena = false;
  emitSceneStatus(roomCode, false, '');
  emitRoomState(roomCode);
  return true;
}

async function requestSceneFromOpenAI(context) {
  if (!openai) {
    const error = new Error('OPENAI_API_KEY não configurada no processo Node.');
    error.name = 'ConfigurationError';
    error.code = 'OPENAI_KEY_MISSING';
    throw error;
  }
  console.log('[OPENAI] Chamando Responses API: gpt-4o-mini');
  const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    instructions: getAiPromptInstructions(),
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify(context, null, 2),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'rpg_next_scene',
        schema: {
          type: 'object',
          properties: {
            titulo: { type: 'string' },
            narrativa: { type: 'string' },
            descricaoVisual: { type: 'string' },
            opcoes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  texto: { type: 'string' },
                },
                required: ['id', 'texto'],
                additionalProperties: false,
              },
            },
          },
          required: ['titulo', 'narrativa', 'descricaoVisual', 'opcoes'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  }, { timeout: 30_000, maxRetries: 0 });
  console.log('[OPENAI] Resposta recebida:', response.id || 'sem id');

  if (!response.output_text?.trim()) {
    const error = new Error('A resposta da OpenAI não contém output_text.');
    error.name = 'ParsingError';
    error.code = 'OPENAI_OUTPUT_EMPTY';
    throw error;
  }
  let parsedScene;
  try {
    parsedScene = JSON.parse(response.output_text);
  } catch {
    const error = new Error('O output_text da OpenAI não contém JSON válido.');
    error.name = 'ParsingError';
    error.code = 'OPENAI_JSON_INVALID';
    throw error;
  }
  const scene = normalizeGeneratedScene(parsedScene);

  if (!scene) {
    const error = new Error('Resposta da IA inválida: título, narrativa ou três opções ausentes.');
    error.name = 'ValidationError';
    error.code = 'OPENAI_SCENE_INVALID';
    throw error;
  }

  console.log('[OPENAI] Cena real validada: gpt-4o-mini');
  return scene;
}

async function generateSceneFromAI(roomCode, selectedOptionId) {
  const room = rooms[roomCode];
  if (!room || isAdventureClosed(room)) return;
  let failure = null;
  let developmentFallback = false;

  try {
    const context = buildAdventureNarrativeContext(room, selectedOptionId);
    console.log('[CENA] Chamando OpenAI:', roomCode);
    const scene = await requestSceneFromOpenAI(context);

    console.log('[CENA] Cena validada:', roomCode, scene.titulo);
    if (rooms[roomCode] !== room || isAdventureClosed(room)) return;

    emitSceneStatus(roomCode, true, 'Criando imagem do cenário...');
    const generatedImage = await generateSceneImage(scene);

    if (rooms[roomCode] !== room || isAdventureClosed(room)) return;
    await commitGeneratedScene(roomCode, room, scene, selectedOptionId, generatedImage);
  } catch (error) {
    failure = error;
    logOpenAIError(error);
    if (rooms[roomCode] !== room || isAdventureClosed(room)) return;
    if ((process.env.NODE_ENV || 'development') === 'development') {
      console.warn('[OPENAI] Usando fallback');
      try {
        await commitGeneratedScene(roomCode, room, createDevelopmentFallbackScene(), selectedOptionId, null, false);
        developmentFallback = true;
      } catch (fallbackError) {
        logOpenAIError(fallbackError);
      }
    }
  } finally {
    if (rooms[roomCode] === room && !isAdventureClosed(room)) {
      room.gerandoCena = false;
      emitSceneStatus(roomCode, false, '');
      emitRoomState(roomCode);
      if (failure && room.mestreId) {
        io.to(room.mestreId).emit('scene:ai:error', {
          message: 'Erro ao gerar próxima cena.',
          developmentFallback,
        });
      }
      console.log('[CENA] Avanço finalizado; loading liberado:', roomCode);
    }
  }
}

function createRollId() {
  return `roll-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeDiceRequest(testName, difficulty, bonus) {
  const safeDifficulty = difficulty === undefined ? 10 : Number(difficulty);
  const safeBonus = bonus === undefined ? 0 : Number(bonus);
  if (!Number.isInteger(safeDifficulty) || safeDifficulty < 1 || safeDifficulty > 30
    || !Number.isInteger(safeBonus) || safeBonus < -99 || safeBonus > 99) {
    return null;
  }
  return {
    testName: String(testName || 'Teste').trim().slice(0, 80) || 'Teste',
    difficulty: safeDifficulty,
    bonus: safeBonus,
  };
}

function createSecretEventId() {
  return `secret-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSceneOptionIds(scene) {
  if (!scene || !Array.isArray(scene.opcoes)) {
    return validOptions;
  }

  const ids = scene.opcoes
    .map((option) => String(option.id || '').trim())
    .filter(Boolean);

  return ids.length > 0 ? ids : validOptions;
}

function buildRoomState(roomCode) {
  const room = rooms[roomCode];

  if (!room) {
    return {
      roomCode,
      players: [],
      votes: {},
      voteCounts: {},
      totalPlayers: 0,
      votedCount: 0,
      scene: scenes[0],
      masterId: null,
      rolls: {},
      combat: null,
    };
  }

  const sceneOptions = getSceneOptionIds(room.cenaAtual || scenes[0]);
  const voteCounts = {};

  sceneOptions.forEach((optionId) => {
    voteCounts[optionId] = 0;
  });

  Object.values(room.votos || {}).forEach((option) => {
    if (voteCounts[option] !== undefined) {
      voteCounts[option] += 1;
    }
  });

  const votedCount = Object.keys(room.votos || {}).filter((socketId) => (room.jogadores || []).some((player) => player.id === socketId)).length;

  return {
    roomCode,
    players: (room.jogadores || []).map((player) => normalizePlayerState(player)),
    votes: room.votos || {},
    voteCounts,
    totalPlayers: (room.jogadores || []).length,
    votedCount,
    scene: room.cenaAtual || scenes[0],
    masterId: room.mestreId || null,
    rolls: room.rolls || {},
    historico: room.historico || [],
    adventureState: normalizeAdventureState(room.estadoAventura),
    isGeneratingScene: Boolean(room.gerandoCena),
    combat: room.combat ? { ...room.combat, resultadoEmitido: undefined } : null,
    aventura: room.aventura || { status: 'lobby', startedAt: null, endedAt: null, durationMs: 0 },
    estatisticas: room.estatisticas || ensureSessionStats(room),
    resumoFinal: room.resumoFinal || null,
  };
}

function emitRoomState(roomCode) {
  if (!rooms[roomCode]) {
    return;
  }

  const roomState = buildRoomState(roomCode);
  io.to(roomCode).emit('room:update', roomState);
  io.to(roomCode).emit('scene:update', roomState.scene);
  io.to(roomCode).emit('combat:update', roomState.combat);

  const room = rooms[roomCode];
  if (room.combat?.resultado && !room.combat.resultadoEmitido) {
    room.combat.resultadoEmitido = true;
    io.to(roomCode).emit('combat:ended', {
      resultado: room.combat.resultado,
      mensagem: room.combat.mensagemFinal,
    });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((error, req, res, next) => {
  console.error('[server] erro HTTP:', error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

io.on('connection', (socket) => {
  // Reject malformed packets before handlers destructure their payloads.
  socket.use(([event, payload], next) => {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)
      || typeof payload.code !== 'string') return;
    const textFields = ['name', 'character', 'status', 'role', 'roomName', 'characterName',
      'targetPlayerName', 'testName', 'rollId', 'title', 'text', 'secretEventId', 'option',
      'enemyName', 'itemId', 'selectedOption'];
    if (textFields.some(field => payload[field] !== undefined && typeof payload[field] !== 'string')) return;
    const numberFields = ['difficulty', 'bonus', 'amount', 'quantity', 'enemyLife', 'enemyDefense'];
    if (numberFields.some(field => payload[field] !== undefined
      && !['number', 'string'].includes(typeof payload[field]))) return;
    if (payload.options !== undefined && (!Array.isArray(payload.options)
      || payload.options.some(option => typeof option !== 'string'
        && (!option || typeof option.texto !== 'string')))) return;
    next();
  });
  socket.on('join-room', ({ code, name, character, status, role, roomName }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const playerName = String(name || '').trim();
    const requestedRole = String(role || 'player').trim().toLowerCase();

    if (!roomCode || !playerName) {
      return;
    }

    const requestedRoom = rooms[roomCode];
    if (roomName && requestedRoom) {
      socket.emit('join-room:error', { message: 'Esse código de sala já está em uso. Tente criar a sala novamente.' });
      return;
    }
    if (requestedRoom?.aventura?.status === 'closed') {
      socket.join(roomCode);
      if (requestedRoom.resumoFinal) {
        socket.emit('adventure:ended', requestedRoom.resumoFinal);
      } else {
        socket.emit('adventure:closing', { roomName: requestedRoom.nome });
      }
      return;
    }

    const duplicateName = (requestedRoom?.jogadores || []).some((player) => (
      player.id !== socket.id && String(player.name || '').trim().toLowerCase() === playerName.toLowerCase()
    ));
    if (duplicateName) {
      socket.emit('join-room:error', { message: 'Esse nome já está sendo usado nesta sala.' });
      return;
    }

    Object.keys(rooms).forEach((existingRoomCode) => {
      const room = rooms[existingRoomCode];

      if (!room) {
        return;
      }

      if (existingRoomCode === roomCode) return;

      if (room.aventura?.status === 'closed') {
        socket.leave(existingRoomCode);
        return;
      }

      socket.leave(existingRoomCode);
      room.jogadores = (room.jogadores || []).filter((player) => player.id !== socket.id);
      delete room.votos[socket.id];

      if (room.mestreId === socket.id) {
        room.mestreId = (room.jogadores[0] && room.jogadores[0].id) || null;
      }

      if (room.jogadores.length === 0 && Object.keys(room.votos).length === 0 && !room.mestreId) {
        delete rooms[existingRoomCode];
        return;
      }
      emitRoomState(existingRoomCode);
    });

    const room = ensureRoom(roomCode);
    if (roomName) room.nome = String(roomName).trim().slice(0, 80) || room.nome;
    room.jogadores = (room.jogadores || []).filter((player) => player.id !== socket.id);
    delete room.votos[socket.id];

    if (requestedRole === 'master' && !room.mestreId) {
      room.mestreId = socket.id;
    }

    const characterName = CHARACTER_DATA[character]?.className ? character : 'Kael';
    const characterData = CHARACTER_DATA[characterName];
    room.jogadores.push(normalizePlayerState({
      id: socket.id,
      name: playerName,
      character: characterName,
      className: characterData.className,
      status: status || ROOM_STATUS.READY,
      vida: characterData.maxLife,
      vidaAtual: characterData.maxLife,
      vidaMaxima: characterData.maxLife,
      statusPersonagem: 'Normal',
      inventario: [],
    }));

    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.isMaster = room.mestreId === socket.id;
    socket.data.playerName = playerName;

    console.log(`[server] jogador entrou: ${playerName} (${socket.id}) na sala ${roomCode}`);
    emitRoomState(roomCode);
  });

  socket.on('adventure:start', ({ code }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = roomCode ? rooms[roomCode] : null;
    if (!room || room.aventura?.status === 'closed'
      || !(room.jogadores || []).some((player) => player.id === socket.id)) {
      return;
    }

    if (startAdventureSession(room)) {
      console.log(`[adventure] aventura iniciada na sala ${roomCode}`);
    }
    emitRoomState(roomCode);
  });

  socket.on('character:select', ({ code, characterName }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = roomCode ? rooms[roomCode] : null;
    const result = applyCharacterSelection(room, socket.id, characterName);

    if (!result.success) {
      socket.emit('character:select:result', result);
      return;
    }

    socket.emit('character:select:result', { success: true, message: `${result.player.character} selecionado.` });
    emitRoomState(roomCode);
  });

  socket.on('adventure:end', async ({ code }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = roomCode ? rooms[roomCode] : null;
    if (!room || isAdventureClosed(room) || socket.id !== room.mestreId) return;

    const endedAt = Date.now();
    room.aventura = {
      ...(room.aventura || {}),
      status: 'closed',
      endedAt,
      durationMs: room.aventura?.startedAt ? Math.max(0, endedAt - room.aventura.startedAt) : 0,
    };
    room.gerandoCena = false;
    const snapshot = buildFinalAdventureSnapshot(room);
    io.to(roomCode).emit('adventure:closing', { nomeSala: room.nome, endedAt });
    emitRoomState(roomCode);

    const generatedSummary = await generateFinalSummaryText(snapshot);
    if (rooms[roomCode] !== room) return;

    room.resumoFinal = {
      ...snapshot,
      resumoFinal: generatedSummary.texto,
      fonteResumo: generatedSummary.fonte,
    };
    console.log(`[adventure] aventura encerrada na sala ${roomCode}`);
    io.to(roomCode).emit('adventure:ended', room.resumoFinal);
    if (room.mestreId) {
      io.to(room.mestreId).emit('adventure:end:result', { success: true, message: 'A aventura foi encerrada.' });
    }
    emitRoomState(roomCode);
  });

  socket.on('dice:request', ({ code, targetPlayerName, testName, difficulty, bonus }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = rooms[roomCode];

    if (!room || isAdventureClosed(room) || socket.id !== room.mestreId) {
      return;
    }

    const normalizedTargetName = String(targetPlayerName || '').trim();
    const targetPlayer = (room.jogadores || []).find((player) => player.name === normalizedTargetName);

    if (!targetPlayer || ['Inconsciente', 'Morto'].includes(targetPlayer.statusPersonagem)) {
      if (targetPlayer && room.mestreId) {
        io.to(room.mestreId).emit('health:action:result', { success: false, message: `${targetPlayer.character || targetPlayer.name} não pode rolar testes neste estado.` });
      }
      return;
    }

    const diceRequest = normalizeDiceRequest(testName, difficulty, bonus);
    if (!diceRequest) {
      socket.emit('dice:request:error', { message: 'Dificuldade deve ser de 1 a 30 e bônus de -99 a 99.' });
      return;
    }

    const nextRollId = createRollId();
    const request = {
      rollId: nextRollId,
      roomCode,
      targetPlayerId: targetPlayer.id,
      targetPlayerName: targetPlayer.name,
      testName: diceRequest.testName,
      difficulty: diceRequest.difficulty,
      bonus: diceRequest.bonus,
      status: 'pending',
      createdAt: Date.now(),
    };

    room.rolls = room.rolls || {};
    room.rolls[nextRollId] = request;
    io.to(targetPlayer.id).emit('dice:request', request);
    io.to(room.mestreId).emit('dice:request-sent', { rollId: nextRollId, targetPlayerName: targetPlayer.name, testName: request.testName });
  });

  socket.on('dice:roll', ({ code, rollId }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = rooms[roomCode];
    const activeRoll = room && room.rolls ? room.rolls[String(rollId || '')] : null;
    const player = room && (room.jogadores || []).find((entry) => entry.id === socket.id);

    if (!room || isAdventureClosed(room) || !player || ['Inconsciente', 'Morto'].includes(player.statusPersonagem) || !activeRoll || activeRoll.targetPlayerId !== socket.id || activeRoll.resolved) {
      return;
    }

    const dado = Math.floor(Math.random() * 20) + 1;
    const bonus = Number(activeRoll.bonus) || 0;
    const total = dado + bonus;
    const naturalCritSuccess = dado === 20;
    const naturalCritFailure = dado === 1;
    const success = naturalCritSuccess ? true : naturalCritFailure ? false : total >= Number(activeRoll.difficulty || 10);
    const status = naturalCritSuccess ? 'SUCESSO CRÍTICO' : naturalCritFailure ? 'FALHA CRÍTICA' : success ? 'SUCESSO' : 'FALHA';

    const result = {
      rollId: activeRoll.rollId,
      roomCode,
      player: activeRoll.targetPlayerName,
      testName: activeRoll.testName,
      dado,
      bonus,
      total,
      difficulty: Number(activeRoll.difficulty || 10),
      success,
      status,
      createdAt: Date.now(),
    };

    activeRoll.resolved = true;
    activeRoll.result = result;
    const stats = ensureSessionStats(room);
    stats.testesDeDado += 1;
    if (success) stats.sucessos += 1;
    else stats.falhas += 1;

    io.to(socket.id).emit('dice:result', result);
    if (room.mestreId && room.mestreId !== socket.id) {
      io.to(room.mestreId).emit('dice:result', result);
    }
  });

  socket.on('secret:event:create', ({ code, targetPlayerName, title, text, options }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = rooms[roomCode];

    if (!room || isAdventureClosed(room) || socket.id !== room.mestreId) {
      return;
    }

    const normalizedTargetName = String(targetPlayerName || '').trim();
    const targetPlayer = (room.jogadores || []).find((player) => player.name === normalizedTargetName);

    if (!targetPlayer) {
      return;
    }

    const pendingEventId = room.secretEventsByPlayer && room.secretEventsByPlayer[targetPlayer.id];
    const existingPendingEvent = pendingEventId && room.secretEvents && room.secretEvents[pendingEventId];

    if (existingPendingEvent && existingPendingEvent.status === 'pendente') {
      io.to(room.mestreId).emit('secret:event:error', {
        message: `${targetPlayer.name} já possui um evento secreto pendente.`,
      });
      return;
    }

    const safeOptions = Array.isArray(options) ? options.slice(0, 2) : [];
    const sanitizedOptions = safeOptions
      .map((option, index) => {
        const textValue = String(option && option.texto ? option.texto : option || '').trim();
        if (!textValue) {
          return null;
        }

        return {
          id: `opcao-${index + 1}`,
          texto: textValue,
        };
      })
      .filter(Boolean);

    if (sanitizedOptions.length < 2) {
      io.to(room.mestreId).emit('secret:event:error', {
        message: 'É necessário preencher duas opções para o evento secreto.',
      });
      return;
    }

    const secretEventId = createSecretEventId();
    const event = {
      secretEventId,
      roomCode,
      targetPlayerId: targetPlayer.id,
      targetPlayerName: targetPlayer.name,
      titulo: String(title || '').trim() || 'Evento secreto',
      texto: String(text || '').trim() || 'Você recebe uma mensagem confidencial.',
      opcoes: sanitizedOptions,
      resposta: null,
      status: 'pendente',
      createdAt: Date.now(),
    };

    room.secretEvents = room.secretEvents || {};
    room.secretEventsByPlayer = room.secretEventsByPlayer || {};
    room.secretEvents[secretEventId] = event;
    room.secretEventsByPlayer[targetPlayer.id] = secretEventId;

    io.to(targetPlayer.id).emit('secret:event', event);
    io.to(room.mestreId).emit('secret:event:sent', {
      secretEventId,
      targetPlayerName: targetPlayer.name,
      titulo: event.titulo,
    });
  });

  socket.on('secret:event:answer', ({ code, secretEventId, option }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = rooms[roomCode];

    if (!room || isAdventureClosed(room)) {
      return;
    }

    const event = room.secretEvents && room.secretEvents[String(secretEventId || '')];

    if (!event || event.targetPlayerId !== socket.id || event.status !== 'pendente') {
      return;
    }

    const selectedOption = String(option || '').trim();
    const matchingOption = event.opcoes.find((optionItem) => optionItem.texto === selectedOption || optionItem.id === selectedOption);

    if (!matchingOption) {
      return;
    }

    event.resposta = matchingOption.texto;
    event.status = 'respondido';
    delete room.secretEventsByPlayer[event.targetPlayerId];

    io.to(socket.id).emit('secret:event:answer-confirmed', {
      secretEventId: event.secretEventId,
      resposta: event.resposta,
      status: event.status,
    });

    if (room.mestreId && room.mestreId !== socket.id) {
      io.to(room.mestreId).emit('secret:event:response', {
        secretEventId: event.secretEventId,
        player: event.targetPlayerName,
        resposta: event.resposta,
        titulo: event.titulo,
      });
    }
  });

  socket.on('room:vote', ({ code, option }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = roomCode ? rooms[roomCode] : null;

    if (!room) {
      socket.emit('room:vote:result', { success: false, message: 'Sala não encontrada.' });
      return;
    }

    if (isAdventureClosed(room) || room.combat?.ativo || !room.jogadores || !room.jogadores.some((player) => player.id === socket.id)) {
      socket.emit('room:vote:result', { success: false, message: isAdventureClosed(room)
        ? 'A aventura foi encerrada.'
        : room.combat?.ativo
          ? 'A votação fica pausada durante o combate.'
          : 'Você não pertence a esta sala.' });
      return;
    }

    if (!applyPlayerVote(room, socket.id, option)) {
      socket.emit('room:vote:result', { success: false, message: 'Voto inválido ou personagem impedido de votar.' });
      return;
    }

    emitRoomState(roomCode);
    socket.emit('room:vote:result', { success: true, message: 'Escolha confirmada.' });
  });

  socket.on('combat:start', ({ code, enemyName, enemyLife, enemyDefense }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = roomCode ? rooms[roomCode] : null;
    if (!room || isAdventureClosed(room) || socket.id !== room.mestreId) return;

    const result = startCombat(room, enemyName, enemyLife, enemyDefense);
    io.to(room.mestreId).emit('combat:start:result', result);
    if (result.success) {
      console.log(`[combat] ${result.message}`);
      io.to(roomCode).emit('combat:action:result', { tipo: 'inicio', mensagem: result.message });
      emitRoomState(roomCode);
    }
  });

  socket.on('combat:attack', ({ code }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = roomCode ? rooms[roomCode] : null;
    if (!room || isAdventureClosed(room)) return;

    const result = performCombatAttack(room, socket.id);
    if (!result.success) {
      socket.emit('combat:action:result', result);
      return;
    }
    console.log(`[combat] ${result.mensagem}`);
    io.to(roomCode).emit('combat:action:result', result);
    emitRoomState(roomCode);
  });

  socket.on('combat:pass', ({ code }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = roomCode ? rooms[roomCode] : null;
    if (!room || isAdventureClosed(room)) return;

    const result = passCombatTurn(room, socket.id);
    if (!result.success) {
      socket.emit('combat:action:result', result);
      return;
    }
    io.to(roomCode).emit('combat:action:result', { tipo: 'passar', mensagem: result.message });
    emitRoomState(roomCode);
  });

  function handleMasterHealthAction(roomCode, targetPlayerName, operation, amount) {
    const room = roomCode ? rooms[roomCode] : null;
    if (!room || isAdventureClosed(room) || socket.id !== room.mestreId) {
      return;
    }

    const player = (room.jogadores || []).find((entry) => entry.name === String(targetPlayerName || '').trim());
    if (!player) {
      io.to(room.mestreId).emit('health:action:result', { success: false, message: 'Jogador não encontrado.' });
      return;
    }

    let result;
    if (operation === 'damage') {
      result = applyCharacterDamage(player, amount);
      if (result.success && player.statusPersonagem === 'Inconsciente') {
        delete room.votos[player.id];
      }
    } else if (operation === 'heal') {
      result = healCharacter(player, amount);
    } else {
      result = declareCharacterDead(player);
    }

    io.to(room.mestreId).emit('health:action:result', result);
    if (!result.success) {
      return;
    }

    console.log(`[health] ${result.message}`);
    if (result.becameUnconscious) {
      console.log(`[health] ${player.character || player.name} ficou inconsciente`);
      delete room.votos[player.id];
    }

    if (room.combat?.ativo && getCombatPlayers(room).length === 0) {
      finishCombat(room, 'derrota', 'O grupo foi derrotado.');
    }
    const currentTurn = getCurrentCombatTurn(room);
    if (room.combat?.ativo && currentTurn?.tipo === 'jogador' && currentTurn.jogadorId === player.id
      && (Number(player.vidaAtual ?? player.vida) <= 0 || ['Inconsciente', 'Morto'].includes(player.statusPersonagem))) {
      appendCombatLog(room.combat, `${player.character || player.name} não pode agir neste turno.`);
      advanceCombatTurn(room);
    }

    const updatedCharacter = {
      id: player.id,
      name: player.name,
      character: player.character,
      vidaAtual: player.vidaAtual,
      vida: player.vidaAtual,
      vidaMaxima: player.vidaMaxima,
      statusPersonagem: player.statusPersonagem,
      inventario: normalizeInventory(player.inventario || []),
    };
    io.to(roomCode).emit('character:update', updatedCharacter);
    emitRoomState(roomCode);
  }

  socket.on('health:damage', ({ code, targetPlayerName, amount }) => {
    handleMasterHealthAction(String(code || '').trim().toUpperCase(), targetPlayerName, 'damage', amount);
  });

  socket.on('health:heal', ({ code, targetPlayerName, amount }) => {
    handleMasterHealthAction(String(code || '').trim().toUpperCase(), targetPlayerName, 'heal', amount);
  });

  socket.on('health:declare-dead', ({ code, targetPlayerName }) => {
    handleMasterHealthAction(String(code || '').trim().toUpperCase(), targetPlayerName, 'declare-dead');
  });

  socket.on('inventory:use', ({ code, itemId }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = roomCode ? rooms[roomCode] : null;
    const player = room && (room.jogadores || []).find((entry) => entry.id === socket.id);

    if (!room || isAdventureClosed(room) || !player) {
      return;
    }

    if (['Inconsciente', 'Morto'].includes(player.statusPersonagem)) {
      io.to(socket.id).emit('inventory:use:result', {
        code: roomCode,
        success: false,
        message: player.statusPersonagem === 'Morto'
          ? 'Seu personagem morreu. Você pode continuar acompanhando a aventura.'
          : 'Seu personagem está inconsciente e não pode usar itens.',
      });
      return;
    }

    const result = room.combat?.ativo
      ? useCombatItem(room, socket.id, itemId)
      : consumeInventoryItem(player, itemId);

    if (result.success) {
      console.log(`[health] ${player.character || player.name} foi curado em ${result.effect}`);
      if (room.combat?.ativo) {
        io.to(roomCode).emit('combat:action:result', { tipo: 'item', mensagem: `${player.character || player.name} usou ${ITEM_CATALOG[result.itemId]?.nome || 'um item'}.` });
      }
      io.to(roomCode).emit('character:update', {
        id: player.id,
        name: player.name,
        character: player.character,
        vidaAtual: player.vidaAtual,
        vida: player.vidaAtual,
        vidaMaxima: player.vidaMaxima,
        statusPersonagem: player.statusPersonagem,
        inventario: normalizeInventory(player.inventario || []),
      });
    }

    emitRoomState(roomCode);

    io.to(socket.id).emit('inventory:use:result', {
      code: roomCode,
      success: result.success,
      message: result.message,
      itemId: result.itemId || String(itemId || '').trim(),
      before: result.before,
      after: result.after,
      effect: result.effect,
      player: {
        id: player.id,
        name: player.name,
        vidaAtual: player.vidaAtual,
        vida: player.vida,
        vidaMaxima: player.vidaMaxima,
        statusPersonagem: player.statusPersonagem,
        inventario: normalizeInventory(player.inventario || []),
      },
    });

    if (room.mestreId && room.mestreId !== socket.id) {
      io.to(room.mestreId).emit('inventory:use:result', {
        code: roomCode,
        success: result.success,
        message: result.message,
        itemId: result.itemId || String(itemId || '').trim(),
        before: result.before,
        after: result.after,
        effect: result.effect,
        player: {
          id: player.id,
          name: player.name,
          vidaAtual: player.vidaAtual,
          vida: player.vida,
          vidaMaxima: player.vidaMaxima,
          statusPersonagem: player.statusPersonagem,
          inventario: normalizeInventory(player.inventario || []),
        },
      });
    }
  });

  socket.on('inventory:give-item', ({ code, targetPlayerName, itemId, quantity }) => {
    const roomCode = String(code || '').trim().toUpperCase();
    const room = roomCode ? rooms[roomCode] : null;

    if (!room || isAdventureClosed(room) || socket.id !== room.mestreId) {
      return;
    }

    const selectedPlayer = (room.jogadores || []).find((player) => player.name === String(targetPlayerName || '').trim());
    const normalizedItemId = String(itemId || '').trim().toLowerCase();
    const itemQuantity = Math.max(1, Math.floor(Number(quantity) || 1));

    if (!selectedPlayer || !normalizedItemId) {
      return;
    }

    addInventoryItem(selectedPlayer, normalizedItemId, itemQuantity);
    emitRoomState(roomCode);

    io.to(selectedPlayer.id).emit('inventory:give-item:result', {
      code: roomCode,
      success: true,
      message: `${ITEM_CATALOG[normalizedItemId]?.nome || 'Item'} adicionado ao inventário.`,
      itemId: normalizedItemId,
      quantity: itemQuantity,
      player: {
        id: selectedPlayer.id,
        name: selectedPlayer.name,
        inventario: normalizeInventory(selectedPlayer.inventario || []),
      },
    });

    if (room.mestreId !== selectedPlayer.id) {
      io.to(room.mestreId).emit('inventory:give-item:result', {
        code: roomCode,
        success: true,
        message: `${selectedPlayer.name} recebeu ${ITEM_CATALOG[normalizedItemId]?.nome || 'item'} x${itemQuantity}.`,
        itemId: normalizedItemId,
        quantity: itemQuantity,
        player: {
          id: selectedPlayer.id,
          name: selectedPlayer.name,
          inventario: normalizeInventory(selectedPlayer.inventario || []),
        },
      });
    }
  });

  async function advanceScene({ code, selectedOption } = {}, manual = false) {
    const roomCode = String(code || '').trim().toUpperCase();
    console.log('[CENA] Mestre solicitou avanço:', socket.id, manual ? '(manual)' : '');
    console.log('[CENA] Sala:', roomCode);
    const room = rooms[roomCode];
    const reject = (message, isGenerating = false) => {
      console.warn('[CENA][ERRO]', roomCode, message);
      socket.emit('scene:ai:error', { message, isGenerating });
    };

    if (!room) return reject('Sala não encontrada.');
    if (socket.id !== room.mestreId || !socket.rooms.has(roomCode)) {
      return reject('Somente o mestre desta sala pode continuar a história.');
    }
    console.log('[CENA] Mestre validado:', socket.id);
    if (isAdventureClosed(room)) return reject('A aventura foi encerrada.');
    if (room.gerandoCena) return reject('A próxima cena já está sendo gerada.', true);
    if (room.combat?.ativo) return reject('Encerre o combate antes de continuar a história.');

    const outcome = determineWinningVote(room);
    console.log('[CENA] Votos atuais:', outcome.votes);
    const currentOptions = room.cenaAtual?.opcoes || [];
    const manualOptions = outcome.tieOptions.length
      ? currentOptions.filter((option) => outcome.tieOptions.includes(option.id))
      : currentOptions;
    let choice = outcome.winner;

    if (!choice && !manual) {
      const message = outcome.tieOptions.length
        ? 'Há um empate. Escolha manualmente uma opção.'
        : 'Nenhum voto registrado.';
      console.log('[CENA]', message);
      socket.emit('scene:generating', { isGenerating: false, message });
      socket.emit('scene:tie', { message, tieOptions: manualOptions });
      return;
    }
    if (!choice) {
      choice = normalizeVoteOption(selectedOption);
      if (!manualOptions.some((option) => option.id === choice)) {
        return reject('Selecione uma das opções permitidas para a cena atual.');
      }
    }
    if (!currentOptions.some((option) => option.id === choice)) {
      return reject('A escolha vencedora não pertence à cena atual.');
    }
    console.log('[CENA] Escolha vencedora:', choice);
    startAdventureSession(room);
    room.gerandoCena = true;
    emitSceneStatus(roomCode, true, 'Gerando próxima cena...');
    await generateSceneFromAI(roomCode, choice);
  }

  socket.on('scene:advance', (payload) => advanceScene(payload));
  socket.on('scene:advance:manual', (payload) => advanceScene(payload, true));

  socket.on('disconnect', () => {
    Object.keys(rooms).forEach((roomCode) => {
      const room = rooms[roomCode];

      if (!room) {
        return;
      }

      if (isAdventureClosed(room)) return;

      room.jogadores = (room.jogadores || []).filter((player) => player.id !== socket.id);
      delete room.votos[socket.id];

      if (room.mestreId === socket.id) {
        room.mestreId = (room.jogadores[0] && room.jogadores[0].id) || null;
      }

      if (room.combat?.ativo) {
        if (getCombatPlayers(room).length === 0) {
          finishCombat(room, 'derrota', 'O grupo foi derrotado.');
        } else if (getCurrentCombatTurn(room)?.tipo === 'jogador'
          && (getCurrentCombatTurn(room).jogadorId === socket.id || getCurrentCombatTurn(room).jogadorId === room.mestreId)) {
          appendCombatLog(room.combat, 'O turno foi pulado porque o jogador não está disponível.');
          advanceCombatTurn(room);
        }
      }

      Object.keys(room.rolls || {}).forEach((rollId) => {
        const roll = room.rolls[rollId];
        if (!roll) {
          return;
        }

        if (roll.targetPlayerId === socket.id || room.mestreId === socket.id && roll.createdBy === socket.id) {
          delete room.rolls[rollId];
        }
      });

      if (room.jogadores.length === 0 && Object.keys(room.votos).length === 0 && !room.mestreId) {
        delete rooms[roomCode];
        return;
      }

      emitRoomState(roomCode);
    });
  });
});

if (require.main === module) {
  console.log(`OpenAI configurada: ${openai ? 'SIM' : 'NÃO'}`);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${server.address().port}`);
  });
}

module.exports = {
  requestSceneFromOpenAI,
  logOpenAIError,
  rooms,
  scenes,
  normalizeGeneratedScene,
  determineWinningVote,
  normalizeVoteOption,
  applyPlayerVote,
  buildAdventureNarrativeContext,
  normalizeAdventureState,
  normalizeInventoryItem,
  addInventoryItem,
  consumeInventoryItem,
  calculateCharacterStatus,
  normalizePlayerState,
  applyCharacterDamage,
  healCharacter,
  declareCharacterDead,
  validateHealthAmount,
  startCombat,
  buildCombatOrder,
  getCurrentCombatTurn,
  performCombatAttack,
  passCombatTurn,
  resolveEnemyTurn,
  useCombatItem,
  startAdventureSession,
  formatSessionDuration,
  buildFinalAdventureSnapshot,
  buildFallbackFinalSummary,
  isAdventureClosed,
  createFallbackScene,
  normalizeDiceRequest,
  applyCharacterSelection,
};
