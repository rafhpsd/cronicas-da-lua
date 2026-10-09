const test = require('node:test');
const assert = require('node:assert/strict');

const { buildAdventureNarrativeContext, normalizeAdventureState } = require('../server.js');

test('buildAdventureNarrativeContext keeps memory compact without sending full history', () => {
  const room = {
    estadoAventura: {
      resumo: 'O grupo entrou na floresta e encontrou uma cabana.',
      localAtual: 'Cabana Abandonada',
      objetivoAtual: 'Explorar o porão.',
      acontecimentosImportantes: ['Encontraram a cabana'],
      npcsConhecidos: ['Eldrin'],
      locaisConhecidos: ['Floresta Sombria'],
      descobertas: ['Chave antiga'],
    },
    historico: Array.from({ length: 10 }, (_, index) => ({
      cena: { titulo: `Cena ${index + 1}` },
      escolhaDoGrupo: 'seguir-som',
    })),
    cenaAtual: {
      titulo: 'Porão da Cabana',
      texto: 'Há um cheiro de mofo e uma escada ao fundo.',
      opcoes: [
        { id: 'descer-escada', texto: 'Descer a escada' },
        { id: 'investigar-paredes', texto: 'Investigar as paredes' },
        { id: 'voltar', texto: 'Voltar' },
      ],
    },
    jogadores: [{ name: 'Rafael', character: 'Kael' }],
    votos: { player1: 'descer-escada' },
  };

  const context = buildAdventureNarrativeContext(room, 'descer-escada');

  assert.equal(context.memoria.resumo, 'O grupo entrou na floresta e encontrou uma cabana.');
  assert.equal(context.ultimasTresCenas.length, 3);
  assert.equal(Array.isArray(context.historico), false);
  assert.equal(context.decisaoAtual, 'descer-escada');
});

test('normalizeAdventureState keeps the memory state valid and compact', () => {
  const rawState = {
    resumo: 'O grupo entrou na floresta.',
    localAtual: 'Floresta Sombria',
    objetivoAtual: 'Procurar a cabana.',
    acontecimentosImportantes: ['Entraram na floresta'],
    npcsConhecidos: ['Eldrin'],
    locaisConhecidos: ['Floresta Sombria'],
    descobertas: ['Uma chave antiga'],
  };

  const normalized = normalizeAdventureState(rawState);

  assert.equal(normalized.resumo.length > 0, true);
  assert.equal(Array.isArray(normalized.acontecimentosImportantes), true);
  assert.equal(Array.isArray(normalized.npcsConhecidos), true);
  assert.equal(Array.isArray(normalized.locaisConhecidos), true);
  assert.equal(Array.isArray(normalized.descobertas), true);
});
