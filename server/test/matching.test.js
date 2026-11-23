import test from 'node:test';import assert from 'node:assert/strict';import{matchRecipes}from'../src/services/matchingService.js';
const ing=(name,quantity=1,unit='개',status='confirmed')=>({name,quantity,unit,status});
const oil=ing('식용유',5,'큰술');const sugar=ing('설탕',5,'작은술');
test('김치만 확인하면 부침가루 필수 김치전은 추천하지 않는다',()=>{const r=matchRecipes({ingredients:[ing('김치',500,'g')],tool:'프라이팬'});assert.ok(!r.some(x=>x.id==='kimchi-pancake'));});
test('라면사리만 확인하면 분말스프가 필요한 봉지라면은 추천하지 않는다',()=>{const r=matchRecipes({ingredients:[ing('라면사리',1,'개')],tool:'냄비'});assert.ok(!r.some(x=>x.id==='ramen-complete'));});
test('미확인 가림 봉지 재료는 어떤 추천에도 사용하지 않는다',()=>{const r=matchRecipes({ingredients:[ing('김치',100,'g'),ing('밥',1,'공기'),ing('계란',2,'개','pending')],seasonings:[oil,sugar],tool:'프라이팬'});assert.ok(r.every(x=>!x.required.some(y=>y.name==='계란')));});
test('계란 1개로 2개 필수 레시피를 추천하지 않는다',()=>{const r=matchRecipes({ingredients:[ing('계란',1,'개'),ing('밥',1,'공기'),ing('대파',20,'g')],seasonings:[oil,ing('소금',2,'꼬집')],tool:'프라이팬'});assert.ok(!r.some(x=>x.id==='egg-fried-rice'));});
test('양념이 확인되지 않으면 김치볶음밥도 추천하지 않는다',()=>{const r=matchRecipes({ingredients:[ing('김치',100,'g'),ing('밥',1,'공기')],tool:'프라이팬'});assert.ok(!r.some(x=>x.id==='kimchi-rice'));});
