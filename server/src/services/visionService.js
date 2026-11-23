const MODELS=['gemini-3.8-flash','gemini-3.5-flash-lite'];
async function requestGemini({key,model,base64,mimetype,prompt}){
 const response=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{
  method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key,'Api-Revision':'2026-05-20'},
  signal:AbortSignal.timeout(25000),
  body:JSON.stringify({model,input:[{type:'text',text:prompt},{type:'image',data:base64,mime_type:mimetype}],response_format:{type:'text',mime_type:'application/json'}})
 });
 if(!response.ok){const body=await response.text();let detail=body;try{detail=JSON.parse(body).error?.message||body;}catch{}const e=new Error(`Gemini ${model} HTTP ${response.status}: ${detail.slice(0,700)}`);e.status=response.status;throw e;}
 const payload=await response.json();
 const raw=payload.output_text||payload.steps?.filter(s=>s.type==='model_output').flatMap(s=>s.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('\\n');
 if(!raw)throw new Error(`Gemini ${model} returned no text output`);
 let parsed;try{parsed=JSON.parse(raw);}catch{throw new Error(`Gemini ${model} returned invalid JSON output`);}return parsed;
}
export async function analyzeFridgeImage(buffer,mimetype){
 const key=process.env.GEMINI_API_KEY;
 if(!key)return {available:false,reason:'AI 키가 설정되지 않았습니다. 사진을 저장하지 않았으며 재료를 추측하지 않았습니다.',candidates:[]};
 const base64=buffer.toString('base64');
 const prompt=`냉장고 사진에서 시각적으로 명확하게 확인 가능한 식재료만 JSON으로 반환하세요. 보이지 않는 내용물을 추측하지 마세요. 불투명 봉지는 name을 "내용물 확인 필요"로, obscured true로 표기. 각 재료 confidence를 0~1 숫자로 포함하세요. confidence는 사진 속 물체가 해당 식재료라는 AI 판단 확신도이며, 0.5 이상이면 자동 확정에 사용됩니다. 모호하면 0.5 미만으로 낮추세요. quantity는 식재료 개수 기준으로 추정하고 0.5 단위로 표현하세요(예: 계란 2, 양파 0.5, 밥 1). 수량을 알 수 없으면 1로 추정하되 confidence는 낮추세요. 각 후보에 sourceRegion을 정규화된 0~1000 좌표 {x,y,width,height}로 포함. 중복 물체를 반복 등록하지 마세요. JSON 스키마: {"candidates":[{"name":"...","confidence":0.0,"quantity":1,"sourceRegion":{"x":0,"y":0,"width":100,"height":100},"obscured":false,"note":"..."}]}`;
 const failures=[];
 for(const model of MODELS){try{const parsed=await requestGemini({key,model,base64,mimetype,prompt});return {available:true,candidates:(parsed.candidates||[]).map((c,i)=>({...c,id:`candidate-${i}`,status:'pending',confidence:Math.max(0,Math.min(1,Number(c.confidence)||0)),quantity:c.obscured?null:(Number(c.quantity)>0?Math.round(Number(c.quantity)*2)/2:1)}))};}catch(error){failures.push(`Gemini ${model}: ${error.name==='TimeoutError'||error.name==='AbortError'?'request timed out':error.message}`);}}
 throw new Error(`모든 Gemini 모델 요청 실패: ${failures.join(' | ')}`);
}
