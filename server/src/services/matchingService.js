import { normalizeIngredient } from '../data/synonyms.js';

function cleanItems(items=[]){
 const seen=new Set();
 return items.map(x=>typeof x==='string'?x:x?.name).filter(Boolean).map(x=>String(x).trim()).filter(x=>{
  const key=normalizeIngredient(x);if(!key||seen.has(key))return false;seen.add(key);return true;
 });
}
function buildSteps(style, items, seasonings, tool){
 const names=items.join(', ');
 const seasoningText=seasonings.length?seasonings.join(', '):'추가 양념 없이';
 const hasOil=seasonings.some(x=>normalizeIngredient(x)==='식용유');
 const oilText=hasOil?'선택한 식용유를 조금 두르고':'재료에서 수분이 나오도록 약불에서';
 if(tool==='프라이팬'){
  if(style===0)return [
   {title:'재료 손질',instruction:`${names}을 먹기 좋은 크기로 자르거나 한입 크기로 준비합니다.`,timerSeconds:60},
   {title:'재료 볶기',instruction:`팬을 달군 뒤 ${oilText} ${names}을 넣고 골고루 볶습니다. 수분이 부족하면 불을 낮춰 타지 않게 해주세요.`,timerSeconds:240},
   {title:'간 맞추기',instruction:`${seasoningText}을 넣고 재료가 익을 때까지 볶아 마무리합니다.`,timerSeconds:90}
  ];
  if(style===1)return [
   {title:'재료 준비',instruction:`${names}을 얇거나 작게 썰어 익는 시간을 맞춥니다.`,timerSeconds:60},
   {title:'노릇하게 익히기',instruction:`팬에 ${hasOil?'선택한 식용유를 두르고':'재료를 겹치지 않게 올리고'} 중약불에서 앞뒤로 익힙니다. 단단한 재료는 뚜껑을 덮어 속까지 익혀주세요.`,timerSeconds:240},
   {title:'마무리',instruction:`${seasoningText}으로 가볍게 간을 하고 속까지 충분히 익었는지 확인합니다.`,timerSeconds:90}
  ];
  return [
   {title:'재료 볶기',instruction:`${names}을 팬에 넣고 중불에서 볶거나 익힙니다. ${hasOil?'식용유를 조금 더해도 좋아요.':'재료가 눌어붙지 않도록 약불로 조절하세요.'}`,timerSeconds:210},
   {title:'풍미 더하기',instruction:`${seasoningText}을 재료에 골고루 묻혀 볶습니다.`,timerSeconds:90},
   {title:'익힘 확인',instruction:'가장 두껍거나 단단한 재료를 잘라 속까지 익었는지 확인하고 불을 끕니다.',timerSeconds:60}
  ];
 }
 if(tool==='냄비'){
  if(style===0)return [
   {title:'재료 준비',instruction:`${names}을 먹기 좋은 크기로 썹니다.`,timerSeconds:60},
   {title:'끓이기',instruction:`냄비에 재료와 물을 넣고 끓입니다. 물은 재료가 잠길 정도로 넣고, 끓기 시작하면 중약불로 줄입니다.`,timerSeconds:300},
   {title:'간 맞추기',instruction:`${seasoningText}을 넣고 재료가 충분히 익을 때까지 끓입니다.`,timerSeconds:120}
  ];
  if(style===1)return [
   {title:'재료 담기',instruction:`${names}을 냄비에 넣고 물을 재료 높이의 1/3 정도 붓습니다.`,timerSeconds:60},
   {title:'자작하게 익히기',instruction:'뚜껑을 덮고 중약불에서 끓입니다. 중간에 한두 번 뒤집거나 저어 골고루 익혀주세요.',timerSeconds:300},
   {title:'졸이기',instruction:`${seasoningText}을 넣고 국물이 자작해질 때까지 졸입니다.`,timerSeconds:120}
  ];
  return [
   {title:'재료 넣기',instruction:`${names}을 냄비에 넣고 재료가 잠기지 않을 정도로 물을 붓습니다.`,timerSeconds:60},
   {title:'부드럽게 익히기',instruction:'끓으면 약불로 줄이고 재료가 부드러워질 때까지 천천히 익힙니다.',timerSeconds:360},
   {title:'마무리',instruction:`${seasoningText}으로 간을 조절하고 한 번 더 끓여 마무리합니다.`,timerSeconds:60}
  ];
 }
 return [
  {title:'재료 준비',instruction:`${names}을 전자레인지용 머그컵 또는 용기에 들어갈 크기로 자릅니다. 용기는 전자레인지 사용 가능 제품만 사용하세요.`,timerSeconds:60},
  {title:'전자레인지 조리',instruction:'재료를 용기에 담고 뚜껑을 느슨하게 덮거나 전자레인지용 덮개를 사용해 1분씩 나누어 가열합니다. 중간에 상태를 확인하고 잘 익을 때까지 추가 가열하세요.',timerSeconds:120},
  {title:'간 맞추기',instruction:`${seasoningText}을 넣어 골고루 섞고 뜨거운 김을 조심해 마무리합니다.`,timerSeconds:30}
 ];
}
export function matchRecipes({ingredients=[],seasonings=[],tool='프라이팬',prefer=[]}={}){
 const chosen=cleanItems(ingredients.filter(x=>x.status!=='rejected'));
 const pantry=cleanItems(seasonings);
 if(!chosen.length)return [];
 const ordered=[...chosen].sort((a,b)=>Number(prefer.map(normalizeIngredient).includes(normalizeIngredient(b)))-Number(prefer.map(normalizeIngredient).includes(normalizeIngredient(a))));
 const items=ordered.slice(0,5);
 const styles=[
  {suffix:'볶음',summary:'선택한 재료를 한 번에 익혀 만드는 간단한 한 끼'},
  {suffix:'구이·찜',summary:'재료의 식감과 맛을 살려 익히는 간단 요리'},
  {suffix:'간편 한 접시',summary:'양념을 더해 맛을 바꿔 즐기는 응용 요리'}
 ];
 const base=items.slice(0,2).join('·');
 return styles.map((style,i)=>({
  id:`quick-${i}-${items.map(x=>normalizeIngredient(x)).join('-')}`,
  title:tool==='냄비'?(i===0?`${base} 간단국`:i===1?`${base} 자작조림`:`${base} 한 냄비 요리`):tool==='전자레인지용 머그컵'?(i===0?`${base} 간편찜`:i===1?`${base} 머그컵 익힘요리`:`${base} 전자레인지 한 끼`):(i===0?`${base} 한 팬 볶음`:i===1?`${base} 노릇 구이`:`${base} 양념 볶음`),
  summary:style.summary,
  cookTime:tool==='전자레인지용 머그컵'?5:tool==='냄비'?15:10+i*2,
  tool,
  required:items.map(name=>({name,qty:1})),
  seasonings:pantry.map(name=>({name,qty:1})),
  optional:[],
  steps:buildSteps(i,items,pantry,tool),
  why:`선택한 재료 ${items.join('·')} 사용 · 선택한 양념만 반영`,
  source:{type:'재료 조합 추천',name:'한끼어때 조합 레시피',verified:false}
 }));
}
