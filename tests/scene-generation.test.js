const test = require('node:test');
const assert = require('node:assert/strict');

const {
  determineWinningVote,
  normalizeGeneratedScene,
  normalizeInventoryItem,
  addInventoryItem,
  consumeInventoryItem,
} = require('../server.js');

test('determineWinningVote returns the option with the highest vote count', () => {
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
      player2: 'seguir-som',
      player3: 'investigar',
    },
  };

  const result = determineWinningVote(room);

  assert.deepEqual(result, {
    winner: 'seguir-som',
    tieOptions: [],
    votes: {
      'seguir-som': 2,
      investigar: 1,
      voltar: 0,
    },
  });
});

test('determineWinningVote reports a tie without picking a winner', () => {
  const room = {
    cenaAtual: {
      opcoes: [
        { id: 'seguir-som', texto: 'Seguir o som' },
        { id: 'investigar', texto: 'Investigar ao redor' },
      ],
    },
    votos: {
      player1: 'seguir-som',
      player2: 'investigar',
    },
  };

  const result = determineWinningVote(room);

  assert.deepEqual(result, {
    winner: null,
    tieOptions: ['seguir-som', 'investigar'],
    votes: {
      'seguir-som': 1,
      investigar: 1,
    },
  });
});

test('normalizeGeneratedScene validates and sanitizes the AI response', () => {
  const rawScene = {
    titulo: 'Cabana Abandonada',
    narrativa: 'O grupo segue pela floresta em silêncio.',
    opcoes: [
      { id: 'entrar-cabana', texto: 'Entrar na cabana' },
      { id: 'observar-janelas', texto: 'Observar pelas janelas' },
      { id: 'contornar-cabana', texto: 'Dar a volta pelo local' },
    ],
  };

  const sanitized = normalizeGeneratedScene(rawScene);

  assert.equal(sanitized.titulo, 'Cabana Abandonada');
  assert.equal(sanitized.narrativa, 'O grupo segue pela floresta em silêncio.');
  assert.equal(sanitized.opcoes.length, 3);
  assert.deepEqual(
    sanitized.opcoes.map((option) => option.texto),
    ['Entrar na cabana', 'Observar pelas janelas', 'Dar a volta pelo local'],
  );
});

test('normalizeGeneratedScene keeps the visual description when provided', () => {
  const rawScene = {
    titulo: 'Câmara de Pedra',
    narrativa: 'O grupo entra em uma sala antiga e úmida.',
    descricaoVisual: 'Uma câmara subterrânea de pedra, iluminação fraca, ambiente sombrio e cinematográfico.',
    opcoes: [
      { id: 'examinar-paredes', texto: 'Examinar as paredes' },
      { id: 'seguir-corredor', texto: 'Seguir pelo corredor' },
      { id: 'voltar-escada', texto: 'Voltar pela escada' },
    ],
  };

  const sanitized = normalizeGeneratedScene(rawScene);

  assert.equal(sanitized.descricaoVisual, 'Uma câmara subterrânea de pedra, iluminação fraca, ambiente sombrio e cinematográfico.');
  assert.equal(sanitized.opcoes.length, 3);
});

test('consumeInventoryItem heals the player without exceeding max life and updates the inventory', () => {
  const player = {
    id: 'player-1',
    vida: 25,
    vidaMaxima: 32,
    inventario: [
      { id: 'pocao-cura', nome: 'Poção de cura', tipo: 'consumivel', quantidade: 2 },
    ],
  };

  const result = consumeInventoryItem(player, 'pocao-cura');

  assert.equal(result.success, true);
  assert.equal(player.vida, 30);
  assert.equal(player.inventario[0].quantidade, 1);
  assert.equal(result.effect, 5);
});

test('addInventoryItem increases the quantity for an item that already exists', () => {
  const player = {
    id: 'player-1',
    inventario: [
      { id: 'pocao-cura', nome: 'Poção de cura', tipo: 'consumivel', quantidade: 1 },
    ],
  };

  const updatedPlayer = addInventoryItem(player, 'pocao-cura', 2);

  assert.equal(updatedPlayer.inventario[0].quantidade, 3);
  assert.equal(normalizeInventoryItem({ id: 'pocao-cura', nome: 'Poção de cura' }).nome, 'Poção de cura');
});
