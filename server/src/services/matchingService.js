import { RECIPES } from '../data/recipes.js';
import { normalizeIngredient } from '../data/synonyms.js';

function indexInventory(items=[]) {
 const map=new Map();
 for(const item of items){
  if(item.status!=='confirmed' || !item.name) continue;
  const name=normalizeIngredient(item.name); const qty=Number(item.quantity);
  if(!Number.isFinite(qty)||qty<=0) continue;
  const key=`${name}::${item.unit||''}`;
  map.set(key,(map.get(key)||0)+qty);
 }
 return map;
}
function available(map, req){return (map.get(`${normalizeIngredient(req.name)}::${req.unit}`)||0)>=req.qty;}
export function matchRecipes({ingredients=[],seasonings=[],tool='프라이팬',prefer=[]}={}){
 const inventory=indexInventory(ingredients);
 const pantry=indexInventory(seasonings.map(x=>({...x,status:'confirmed'})));
 const matches=RECIPES.filter(r=>r.source?.verified===true && r.tool===tool &&
  r.required.every(x=>available(inventory,x)) && r.seasonings.every(x=>available(pantry,x))
 ).map(r=>({...r,why:`확인한 ${r.required.map(x=>`${x.name} ${x.qty}${x.unit}`).join('·')} 사용 / ${r.tool} 1개 / ${r.cookTime}분`}));
 matches.sort((a,b)=>{
  const score=r=>r.required.reduce((n,x)=>n+(prefer.map(normalizeIngredient).includes(normalizeIngredient(x.name))?1:0),0);
  return score(b)-score(a)||a.cookTime-b.cookTime;
 });
 return matches.slice(0,3);
}
