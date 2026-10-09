const test = require('node:test');
const assert = require('node:assert/strict');

const { applyPlayerVote, normalizeDiceRequest } = require('../server.js');

test('one player can replace their active vote without creating a second vote', () => {
  const room = {
    cenaAtual: { opcoes: [{ id: 'seguir-som' }, { id: 'investigar' }] },
    votos: { player1: 'seguir-som', player2: 'investigar' },
  };

  assert.equal(applyPlayerVote(room, 'player1', 'investigar'), true);
  assert.deepEqual(room.votos, { player1: 'investigar', player2: 'investigar' });
  assert.equal(Object.keys(room.votos).filter((playerId) => playerId === 'player1').length, 1);
});

test('dice request validation rejects invalid client-supplied target parameters', () => {
  assert.deepEqual(normalizeDiceRequest('Percepção', 12, 2), {
    testName: 'Percepção',
    difficulty: 12,
    bonus: 2,
  });
  assert.equal(normalizeDiceRequest('Teste', 0, 0), null);
  assert.equal(normalizeDiceRequest('Teste', 31, 0), null);
  assert.equal(normalizeDiceRequest('Teste', 12.5, 0), null);
  assert.equal(normalizeDiceRequest('Teste', 12, Infinity), null);
  assert.equal(normalizeDiceRequest('Teste', 12, 100), null);
});
