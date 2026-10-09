const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildFallbackFinalSummary,
  buildFinalAdventureSnapshot,
  createFallbackScene,
  formatSessionDuration,
  isAdventureClosed,
  startAdventureSession,
} = require('../server.js');

function makeRoom() {
  return {
    codigo: 'LUA123',
    nome: 'Sala do Pântano',
    aventura: { status: 'active', startedAt: 1000, endedAt: 5521000, durationMs: 5520000 },
    estatisticas: {
      cenasJogadas: 4,
      decisoesTomadas: 3,
      testesDeDado: 5,
      sucessos: 3,
      falhas: 2,
      combates: 1,
    },
    estadoAventura: {
      resumo: 'O grupo encontrou a passagem sob o pântano.',
      acontecimentosImportantes: ['Encontraram uma chave', 'Abriram a passagem'],
    },
    decisoesPrincipais: [
      { cena: 'Margem do pântano', escolha: 'Seguir as luzes', proximaCena: 'Ruínas' },
    ],
    historicoCombates: [
      { inimigo: 'Lobo Sombrio', resultado: 'vitoria', log: ['Kael acertou o Lobo Sombrio.'] },
    ],
    jogadores: [
      {
        id: 'p1', name: 'Rafael', character: 'Kael', className: 'Patrulheiro',
        vidaAtual: 0, vidaMaxima: 32, statusPersonagem: 'Inconsciente',
        inventario: [{ id: 'pocao-cura', nome: 'Poção de cura', tipo: 'consumivel', quantidade: 2 }],
      },
      {
        id: 'p2', name: 'Pedro', character: 'Nyra', className: 'Ladina',
        vidaAtual: 0, vidaMaxima: 28, statusPersonagem: 'Morto', inventario: [],
      },
    ],
  };
}

test('adventure start is idempotent and records the initial scene and timestamp', () => {
  const room = { estatisticas: { cenasJogadas: 0 }, aventura: { status: 'lobby', startedAt: null } };
  assert.equal(startAdventureSession(room, 12345), true);
  assert.equal(startAdventureSession(room, 99999), false);
  assert.equal(room.aventura.startedAt, 12345);
  assert.equal(room.estatisticas.cenasJogadas, 1);
});

test('duration formatting handles minutes and hours', () => {
  assert.equal(formatSessionDuration(0), '0min');
  assert.equal(formatSessionDuration(59 * 60000), '59min');
  assert.equal(formatSessionDuration(92 * 60000), '1h 32min');
});

test('final snapshot uses authoritative metrics and counts unconscious characters as survivors', () => {
  const snapshot = buildFinalAdventureSnapshot(makeRoom());
  assert.equal(snapshot.nomeSala, 'Sala do Pântano');
  assert.equal(snapshot.duracaoMs, 5520000);
  assert.equal(snapshot.duracao, '1h 32min');
  assert.equal(snapshot.estatisticas.cenasJogadas, 4);
  assert.equal(snapshot.estatisticas.testesDeDado, 5);
  assert.deepEqual(snapshot.sobreviventes.map((character) => character.personagem), ['Kael']);
  assert.deepEqual(snapshot.personagensMortos.map((character) => character.personagem), ['Nyra']);
  assert.equal(snapshot.sobreviventes[0].status, 'Inconsciente');
  assert.equal(snapshot.sobreviventes[0].itens, 2);
  assert.deepEqual(snapshot.momentosImportantes, ['Encontraram uma chave', 'Abriram a passagem']);
});

test('fallback recap uses only registered memory, decisions, and combat outcomes', () => {
  const fallback = buildFallbackFinalSummary(buildFinalAdventureSnapshot(makeRoom()));
  assert.match(fallback, /passagem sob o pântano/);
  assert.match(fallback, /Seguir as luzes/);
  assert.match(fallback, /Lobo Sombrio: inimigo derrotado/);
  assert.match(fallback, /Sobreviventes: Kael/);
  assert.match(fallback, /Mortos: Nyra/);
});

test('closed status is detected from the server-owned session lifecycle', () => {
  assert.equal(isAdventureClosed({ aventura: { status: 'closed' } }), true);
  assert.equal(isAdventureClosed({ aventura: { status: 'active' } }), false);
});

test('scene generation fallback selects an authored scene with valid choices', () => {
  const fallback = createFallbackScene({ cenaAtual: { id: 1, titulo: 'Floresta Sombria' } });
  assert.equal(fallback.titulo, 'Cabana Abandonada');
  assert.equal(fallback.narrativa.length > 0, true);
  assert.equal(fallback.opcoes.length, 3);
});
