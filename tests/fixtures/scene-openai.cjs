const Module = require('node:module');
const originalLoad = Module._load;

// Loaded only by narrative integration tests; never contacts the OpenAI API.
class FakeOpenAI {
  constructor() {
    this.responses = { create: async (request, options) => {
      if (options?.timeout !== 30000 || options?.maxRetries !== 0) {
        throw new Error('Narrative calls must have a bounded timeout without retries');
      }
      if (request.text.format.name === 'rpg_adventure_memory') return { output_text: '{}' };
      const mode = process.env.SCENE_AI_TEST_MODE;
      if (mode === 'failure') throw new Error('Simulated API failure: ' + process.env.OPENAI_API_KEY);
      if (mode === 'timeout') { const error = new Error('Simulated API timeout'); error.name = 'APIConnectionTimeoutError'; throw error; }
      if (mode === 'invalid') return { output_text: '{"titulo":"Incomplete"}' };
      const context = JSON.parse(request.input[0].content[0].text);
      return { output_text: JSON.stringify({
        titulo: 'Cena de integração',
        narrativa: 'O grupo avançou usando a escolha ' + context.decisaoAtual + '.',
        descricaoVisual: 'Uma trilha entre árvores antigas',
        opcoes: [{ id:'avancar',texto:'Avançar' },{ id:'observar',texto:'Observar' },{ id:'esperar',texto:'Esperar' }],
      }) };
    } };
    this.images = { generate: async () => ({ data: [] }) };
  }
}
Module._load = function(request, parent, isMain) {
  return request === 'openai' ? FakeOpenAI : originalLoad.call(this, request, parent, isMain);
};
