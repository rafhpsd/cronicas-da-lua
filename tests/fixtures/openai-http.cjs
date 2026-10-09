const assert = require('node:assert/strict');

// HTTP fixture for the real OpenAI SDK. No network request leaves this process.
global.fetch = async (url, init) => {
  assert.match(String(url), /\/responses$/);
  const request = JSON.parse(init.body);
  assert.equal(request.model, 'gpt-4o-mini');
  assert.equal(request.text.format.type, 'json_schema');
  assert.equal(request.text.format.strict, true);
  assert.equal(request.text.format.schema.additionalProperties, false);
  assert.deepEqual(request.text.format.schema.required, ['titulo','narrativa','descricaoVisual','opcoes']);
  const mode = process.env.OPENAI_HTTP_TEST_CASE;
  const failures = {
    auth: [401, 'invalid_api_key', 'invalid_request_error'],
    quota: [429, 'insufficient_quota', 'insufficient_quota'],
    model: [404, 'model_not_found', 'invalid_request_error'],
    schema: [400, 'invalid_json_schema', 'invalid_request_error'],
  };
  if (failures[mode]) {
    const [status, code, type] = failures[mode];
    return new Response(JSON.stringify({error:{message:'Simulated error '+process.env.OPENAI_API_KEY,code,type}}), {status,headers:{'content-type':'application/json'}});
  }
  const scene = {
    titulo:'Cabana Abandonada',narrativa:'O grupo continua pela floresta.',
    descricaoVisual:'Uma cabana antiga.',opcoes:[
      {id:'entrar',texto:'Entrar na cabana'},{id:'observar',texto:'Observar'},{id:'contornar',texto:'Contornar'},
    ],
  };
  if (mode === 'invalid-options') scene.opcoes.pop();
  if (mode === 'empty-title') scene.titulo = ' ';
  if (mode === 'empty-option') scene.opcoes[0].texto = '';
  const output = mode === 'parsing' ? 'not JSON' : JSON.stringify(scene);
  return new Response(JSON.stringify({
    id:'resp_test',object:'response',status:'completed',
    output:[{type:'message',role:'assistant',content:[{type:'output_text',text:output,annotations:[]}]}],
  }), {status:200,headers:{'content-type':'application/json'}});
};
