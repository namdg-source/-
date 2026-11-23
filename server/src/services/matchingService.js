import { RECIPES } from '../data/recipes.js';
import { normalizeIngredient } from '../data/synonyms.js';
function indexInventory(items=[],includeUnit=true){
 const map=new Map();
 for(const item of items){if(item.status!=='confirmed'||!item.name)continue;const name=normalizeIngredient(item.name),qty=Number(item.quantity);if(!Number.isFinite(qty)||qty<=0)continue;const key=includeUnit?`${name}::${item.unit||''}`:name;map.set(key,(map.get(key)||0)+qty);}
 return map;
}
function available(map,req,includeUnit=true){const key=includeUnit?`${normalizeIngredient(req.name)}::${req.unit}`:normalizeIngredient(req.name);return(map.get(key)||0)>=req.qty;}
export function matchRecipes({ingredients=[],seasonings=[],tool='프라이팬',prefer=[]}={}){
 const inventory=indexInventory(ingredients,false),pantry=indexInventory(seasonings,true);
 const matches=RECIPES.filter(r=>r.source?.verified===true&&r.tool===tool&&r.required.every(x=>available(inventory,x,false))&&r.seasonings.every(x=>available(pantry,x,true))).map(r=>({...r,why:`확인한 ${r.required.map(x=>`${x.name} ${x.qty}`).join('·')} 사용 / ${r.tool} 1개 / ${r.cookTime}분`}));
 matches.sort((a,b)=>{const score=r=>r.required.reduce((n,x)=>n+(prefer.map(normalizeIngredient).includes(normalizeIngredient(x.name))?1:0),0);return score(b)-score(a)||a.cookTime-b.cookTime;});
 return matches.slice(0,3);
}
