const test = require('node:test');
const assert = require('node:assert/strict');

const { applyPlayerVote } = require('../server.js');

test('applyPlayerVote accepts a valid option and replaces a previous vote', () => {
  const room = {
    cenaAtual: {
      opcoes: [
        { id: 'seguir-som', texto: 'Seguir o som' },
        { id: 'investigar', texto: 'Investigar ao redor' },
        { id: 'voltar', texto: 'Voltar pelo caminho seguro' },
      ],
    },
    votos: {
      player1: 'seguir-som',
    },
  };

  const result = applyPlayerVote(room, 'player1', 'investigar');

  assert.equal(result, true);
  assert.equal(room.votos.player1, 'investigar');
});

test('applyPlayerVote rejects a vote outside the current scene options', () => {
  const room = {
    cenaAtual: {
      opcoes: [
        { id: 'seguir-som', texto: 'Seguir o som' },
        { id: 'investigar', texto: 'Investigar ao redor' },
      ],
    },
    votos: {},
  };

  const result = applyPlayerVote(room, 'player2', 'entrar-cabana');

  assert.equal(result, false);
  assert.deepEqual(room.votos, {});
});
