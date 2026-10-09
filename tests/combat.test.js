const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildCombatOrder,
  getCurrentCombatTurn,
  normalizePlayerState,
  passCombatTurn,
  performCombatAttack,
  startCombat,
  useCombatItem,
} = require('../server.js');

function makeRoom(players) {
  return {
    mestreId: 'master',
    jogadores: [
      normalizePlayerState({ id: 'master', name: 'Mestre', character: 'Mestre', vidaAtual: 32, vidaMaxima: 32 }),
      ...players.map((player) => normalizePlayerState(player)),
    ],
    combat: null,
  };
}

function sequence(...values) {
  let index = 0;
  return () => values[index++] ?? 0;
}

function roll(value, sides) {
  return (value - 1) / sides;
}

function start(room, life = 20, defense = 12) {
  return startCombat(room, 'Lobo Sombrio', life, defense);
}

test('combat order includes conscious players in room order followed by enemy, not master', () => {
  const room = makeRoom([
    { id: 'p1', name: 'Rafael', character: 'Kael', vidaAtual: 32, vidaMaxima: 32 },
    { id: 'p2', name: 'Pedro', character: 'Nyra', vidaAtual: 28, vidaMaxima: 28 },
  ]);
  assert.equal(start(room).success, true);
  assert.deepEqual(buildCombatOrder(room).map((turn) => turn.exibicao), [
    'Rafael / Kael',
    'Pedro / Nyra',
    'Lobo Sombrio',
  ]);
  assert.equal(getCurrentCombatTurn(room).jogadorId, 'p1');
});

test('only the current player can attack; hit uses d20 plus two and 1d6 damage', () => {
  const room = makeRoom([
    { id: 'p1', name: 'Rafael', character: 'Kael', vidaAtual: 32, vidaMaxima: 32 },
    { id: 'p2', name: 'Pedro', character: 'Nyra', vidaAtual: 28, vidaMaxima: 28 },
  ]);
  start(room);

  assert.equal(performCombatAttack(room, 'p2').success, false);
  const result = performCombatAttack(room, 'p1', sequence(roll(17, 20), roll(4, 6)));
  assert.equal(result.success, true);
  assert.equal(result.total, 19);
  assert.equal(result.acerto, true);
  assert.equal(result.dano, 4);
  assert.equal(room.combat.inimigos[0].vidaAtual, 16);
  assert.equal(getCurrentCombatTurn(room).jogadorId, 'p2');
});

test('natural 1 is an automatic critical miss and combat setup rejects invalid values', () => {
  const room = makeRoom([
    { id: 'p1', name: 'Rafael', character: 'Kael', vidaAtual: 32, vidaMaxima: 32 },
  ]);
  assert.equal(startCombat(room, 'Lobo Sombrio', 0, 12).success, false);
  assert.equal(start(room).success, true);
  const result = performCombatAttack(room, 'p1', sequence(roll(1, 20), 0, roll(1, 20)));
  assert.equal(result.falhaCritica, true);
  assert.equal(result.acerto, false);
  assert.equal(result.dano, 0);
  assert.equal(room.combat.inimigos[0].vidaAtual, 20);
});

test('natural 20 deals 2d6 and ends combat when the enemy reaches zero', () => {
  const room = makeRoom([
    { id: 'p1', name: 'Rafael', character: 'Kael', vidaAtual: 32, vidaMaxima: 32 },
  ]);
  start(room, 3, 12);
  const result = performCombatAttack(room, 'p1', sequence(roll(20, 20), roll(2, 6), roll(2, 6)));

  assert.equal(result.critico, true);
  assert.equal(result.dano, 3);
  assert.equal(room.combat.ativo, false);
  assert.equal(room.combat.resultado, 'vitoria');
  assert.equal(room.combat.mensagemFinal, 'Inimigo derrotado.');
});

test('passing through both players triggers an automatic enemy turn and advances the round', () => {
  const room = makeRoom([
    { id: 'p1', name: 'Rafael', character: 'Kael', vidaAtual: 32, vidaMaxima: 32 },
    { id: 'p2', name: 'Pedro', character: 'Nyra', vidaAtual: 28, vidaMaxima: 28 },
  ]);
  start(room);
  passCombatTurn(room, 'p1');
  assert.equal(getCurrentCombatTurn(room).jogadorId, 'p2');
  passCombatTurn(room, 'p2', sequence(0, roll(19, 20), roll(3, 6)));

  assert.equal(room.combat.rodada, 2);
  assert.equal(getCurrentCombatTurn(room).jogadorId, 'p1');
  assert.equal(room.jogadores.find((player) => player.id === 'p1').vidaAtual, 29);
  assert.match(room.combat.log.at(-1), /dano: 3/);
});

test('combat potion reuses inventory healing and consumes the active player turn', () => {
  const room = makeRoom([
    {
      id: 'p1', name: 'Rafael', character: 'Kael', vidaAtual: 20, vidaMaxima: 32,
      inventario: [{ id: 'pocao-cura', nome: 'Poção de cura', tipo: 'consumivel', quantidade: 1 }],
    },
    { id: 'p2', name: 'Pedro', character: 'Nyra', vidaAtual: 28, vidaMaxima: 28 },
  ]);
  start(room);

  assert.equal(useCombatItem(room, 'p2', 'pocao-cura').success, false);
  const result = useCombatItem(room, 'p1', 'pocao-cura');
  assert.equal(result.success, true);
  assert.equal(room.jogadores.find((player) => player.id === 'p1').vidaAtual, 25);
  assert.equal(room.jogadores.find((player) => player.id === 'p1').inventario.length, 0);
  assert.equal(getCurrentCombatTurn(room).jogadorId, 'p2');
});

test('enemy defeat ends combat when its automatic attack incapacitates the last player', () => {
  const room = makeRoom([
    { id: 'p1', name: 'Rafael', character: 'Kael', vidaAtual: 1, vidaMaxima: 32 },
  ]);
  start(room);
  passCombatTurn(room, 'p1', sequence(0, roll(10, 20), roll(1, 6)));

  assert.equal(room.jogadores.find((player) => player.id === 'p1').statusPersonagem, 'Inconsciente');
  assert.equal(room.combat.ativo, false);
  assert.equal(room.combat.resultado, 'derrota');
  assert.equal(room.combat.mensagemFinal, 'O grupo foi derrotado.');
});
