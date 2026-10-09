const Module = require('node:module');
const originalLoad = Module._load;
const pixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';

// Test fixture only: deterministic API responses without network calls.
class ReadinessOpenAI {
  constructor() {
    this.responses = { create: async (request, options) => {
      if (options?.timeout !== 30000 || options?.maxRetries !== 0) throw Error('Missing bounded API timeout');
      await new Promise(resolve => setTimeout(resolve, 80));
      const name = request.text?.format?.name;
      if (name === 'rpg_adventure_memory') return { output_text: JSON.stringify({
        resumo: 'O grupo encontrou uma cabana.', localAtual: 'Cabana QA', objetivoAtual: 'Explorar a cabana',
        acontecimentosImportantes: ['Cabana descoberta'], npcsConhecidos: [], locaisConhecidos: ['Floresta', 'Cabana'], descobertas: ['Uma trilha'],
      }) };
      if (name !== 'rpg_next_scene') {
        if (process.env.READINESS_SUMMARY_FAILURE === '1') {
          const error = Error('Simulated final summary timeout');
          error.name = 'APIConnectionTimeoutError';
          throw error;
        }
        return { output_text: 'A jornada chegou ao fim.' };
      }
      return { output_text: JSON.stringify({ titulo: 'Cabana QA', narrativa: 'O grupo segue pela trilha e encontra uma cabana.',
        descricaoVisual: 'Uma cabana na floresta', opcoes: [
          { id: 'entrar', texto: 'Entrar' }, { id: 'observar', texto: 'Observar' }, { id: 'retornar', texto: 'Retornar' },
        ] }) };
    } };
    this.images = { generate: async () => {
      if (process.env.READINESS_IMAGE_FAILURE === '1') throw Error('Simulated image failure');
      return { data: [{ b64_json: pixel }] };
    } };
  }
}
Module._load = function(request, parent, isMain) {
  return request === 'openai' ? ReadinessOpenAI : originalLoad.call(this, request, parent, isMain);
};
