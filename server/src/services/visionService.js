export async function analyzeFridgeImage(buffer,mimetype){
 const key=process.env.GEMINI_API_KEY;
 if(!key) return {available:false,reason:'AI 키가 설정되지 않았습니다. 사진을 저장하지 않았으며 재료를 추측하지 않았습니다.',candidates:[]};
 const base64=buffer.toString('base64');
 const prompt=`냉장고 사진에서 시각적으로 명확하게 확인 가능한 식재료만 JSON으로 반환하세요. 보이지 않는 내용물을 추측하지 마세요. 불투명 봉지는 name을 "내용물 확인 필요"로, obscured true로 표기. 포장식품은 라벨 판독 여부와 closeLabel true 여부. 각 후보에 sourceRegion을 정규화된 0~1000 좌표 {x,y,width,height}로 포함. 수량/단위가 시각적으로 불명확하면 quantity와 unit은 null. 중복 물체를 반복 등록하지 마세요. JSON 스키마: {"candidates":[{"name":"...","quantity":null,"unit":null,"sourceRegion":{"x":0,"y":0,"width":100,"height":100},"obscured":false,"closeLabel":false,"note":"..."}]}`;
 const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:mimetype,data:base64}}]}],generationConfig:{responseMimeType:'application/json',temperature:0}})});
 if(!response.ok) throw new Error('Vision provider unavailable');
 const payload=await response.json(); const raw=payload.candidates?.[0]?.content?.parts?.[0]?.text;
 if(!raw) throw new Error('Empty vision response');
 const parsed=JSON.parse(raw);
 return {available:true,candidates:(parsed.candidates||[]).map((c,i)=>({...c,id:`candidate-${i}`,status:'pending',quantity:c.obscured?null:c.quantity,unit:c.obscured?null:c.unit}))};
}
