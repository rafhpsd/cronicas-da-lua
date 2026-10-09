const test = require('node:test');
const assert = require('node:assert/strict');

const {
  applyCharacterDamage,
  applyCharacterSelection,
  applyPlayerVote,
  calculateCharacterStatus,
  consumeInventoryItem,
  declareCharacterDead,
  buildAdventureNarrativeContext,
  healCharacter,
  normalizePlayerState,
  validateHealthAmount,
} = require('../server.js');

function makePlayer(overrides = {}) {
  return normalizePlayerState({
    id: 'player-1',
    name: 'Rafael',
    character: 'Kael',
    vidaAtual: 32,
    vidaMaxima: 32,
    inventario: [{ id: 'pocao-cura', nome: 'Poção de cura', tipo: 'consumivel', quantidade: 1 }],
    ...overrides,
  });
}

test('calculateCharacterStatus follows the configured percentage thresholds', () => {
  assert.equal(calculateCharacterStatus(32, 32), 'Normal');
  assert.equal(calculateCharacterStatus(16, 32), 'Ferido');
  assert.equal(calculateCharacterStatus(8, 32), 'Crítico');
  assert.equal(calculateCharacterStatus(0, 32), 'Inconsciente');
});

test('damage reduces health, derives status, and never drops below zero', () => {
  const player = makePlayer();
  const firstDamage = applyCharacterDamage(player, 20);
  assert.equal(firstDamage.success, true);
  assert.equal(player.vidaAtual, 12);
  assert.equal(player.vida, 12);
  assert.equal(player.statusPersonagem, 'Ferido');

  const secondDamage = applyCharacterDamage(player, 999);
  assert.equal(secondDamage.success, true);
  assert.equal(player.vidaAtual, 0);
  assert.equal(player.statusPersonagem, 'Inconsciente');
  assert.equal(secondDamage.becameUnconscious, true);
});

test('health amounts reject negatives, decimals, NaN, and values above the limit', () => {
  for (const invalid of [-1, 0, 1.5, NaN, Infinity, 1000, true, ' ', 'not-a-number']) {
    assert.equal(validateHealthAmount(invalid), null);
    assert.equal(applyCharacterDamage(makePlayer(), invalid).success, false);
    assert.equal(healCharacter(makePlayer(), invalid).success, false);
  }
  assert.equal(validateHealthAmount('999'), 999);
});

test('AI narrative context receives life and status as descriptive context', () => {
  const player = makePlayer({ vidaAtual: 5 });
  const context = buildAdventureNarrativeContext({ jogadores: [player] }, null);
  assert.equal(context.jogadores[0].vidaAtual, 5);
  assert.equal(context.jogadores[0].vidaMaxima, 32);
  assert.equal(context.jogadores[0].status, 'Crítico');
});

test('healing caps at maximum life and restores an unconscious character status', () => {
  const player = makePlayer({ vidaAtual: 0, statusPersonagem: 'Inconsciente' });
  const result = healCharacter(player, 5);
  assert.equal(result.success, true);
  assert.equal(player.vidaAtual, 5);
  assert.equal(player.statusPersonagem, 'Crítico');

  const capped = healCharacter(player, 999);
  assert.equal(capped.success, true);
  assert.equal(player.vidaAtual, 32);
  assert.equal(player.statusPersonagem, 'Normal');
});

test('inconscious and dead players cannot vote or use a potion', () => {
  const player = makePlayer({ vidaAtual: 0 });
  const room = {
    jogadores: [player],
    votos: {},
    cenaAtual: { opcoes: [{ id: 'seguir-som', texto: 'Seguir o som' }] },
  };
  assert.equal(applyPlayerVote(room, player.id, 'seguir-som'), false);
  const potionResult = consumeInventoryItem(player, 'pocao-cura');
  assert.equal(potionResult.success, false);
  assert.equal(player.inventario[0].quantidade, 1);
});

test('only an unconscious character may be declared dead and dead characters cannot be healed', () => {
  const player = makePlayer({ vidaAtual: 0 });
  assert.equal(declareCharacterDead(player).success, true);
  assert.equal(player.statusPersonagem, 'Morto');
  assert.equal(healCharacter(player, 5).success, false);
  assert.equal(applyCharacterDamage(player, 1).success, false);
  assert.equal(declareCharacterDead(player).success, false);
});

test('character selection updates class and life on the server before the adventure starts', () => {
  const player = normalizePlayerState({ id: 'player-1', name: 'Rafael', character: 'Kael' });
  const room = { jogadores: [player], aventura: { status: 'lobby' } };
  const result = applyCharacterSelection(room, 'player-1', 'Brakk');
  assert.equal(result.success, true);
  assert.equal(player.character, 'Brakk');
  assert.equal(player.className, 'Guerreiro');
  assert.equal(player.vidaAtual, 40);
  assert.equal(player.vidaMaxima, 40);
});

test('character selection is rejected after the adventure begins', () => {
  const player = normalizePlayerState({ id: 'player-1', name: 'Rafael', character: 'Kael' });
  const room = { jogadores: [player], aventura: { status: 'active' } };
  assert.equal(applyCharacterSelection(room, 'player-1', 'Nyra').success, false);
  assert.equal(player.character, 'Kael');
});
