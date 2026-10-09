const { requestSceneFromOpenAI, logOpenAIError } = require('../server.js');

console.log(`OpenAI configurada: ${process.env.OPENAI_API_KEY ? 'SIM' : 'NÃO'}`);

// Isolated backend diagnostic: no room, Socket.IO clients, images or fallback.
requestSceneFromOpenAI({
  pedido: 'Gere uma cena curta de fantasia com exatamente três opções.',
}).then((scene) => {
  console.log('[OPENAI] Teste isolado OK:', {
    titulo: scene.titulo,
    narrativaPresente: Boolean(scene.narrativa),
    descricaoVisualPresente: Boolean(scene.descricaoVisual),
    opcoes: scene.opcoes.length,
  });
}).catch((error) => {
  logOpenAIError(error);
  process.exitCode = 1;
});
