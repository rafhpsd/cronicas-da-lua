const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

function isolated(mode, key = 'sk-test-do-not-log') {
  const result = spawnSync(process.execPath, [
    '--require', path.join(__dirname,'fixtures','openai-http.cjs'),
    path.join(__dirname,'..','scripts','test-openai.js'),
  ], {
    env:{...process.env,OPENAI_API_KEY:key,OPENAI_HTTP_TEST_CASE:mode},
    encoding:'utf8',timeout:10000,
  });
  assert.equal(result.error,undefined);
  assert.equal((result.stdout+result.stderr).includes('sk-test-do-not-log'),false);
  return result;
}

test('real SDK serializes Responses structured output and parses output_text correctly',()=>{
  const result=isolated('success');
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/Teste isolado OK/);
  assert.match(result.stdout,/opcoes: 3/);
});

for(const [mode,status,code] of [
  ['auth',401,'invalid_api_key'],['quota',429,'insufficient_quota'],
  ['model',404,'model_not_found'],['schema',400,'invalid_json_schema'],
]) {
  test('isolated diagnostic reports HTTP '+status+' and '+code+' without exposing credentials',()=>{
    const result=isolated(mode);
    assert.equal(result.status,1);
    assert.match(result.stderr,new RegExp('status: '+status));
    assert.match(result.stderr,new RegExp(code));
    assert.match(result.stderr,/\[OPENAI\]\[ERRO\]/);
    assert.match(result.stderr,/tipo:/);
  });
}
for(const mode of ['invalid-options','empty-title','empty-option','parsing']) {
  test('isolated diagnostic rejects '+mode,()=>{
    const result=isolated(mode);
    assert.equal(result.status,1);
    assert.match(result.stderr,/OPENAI_(SCENE|JSON)_INVALID/);
  });
}
test('missing process variable produces a configuration error before HTTP',()=>{
  const result=isolated('success','');
  assert.equal(result.status,1);
  assert.match(result.stderr,/OPENAI_KEY_MISSING/);
  assert.match(result.stderr,/status: null/);
});
