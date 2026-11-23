// 식약처 COOKRCP01 원천 수집기. 원천 데이터는 곧바로 추천에 넣지 않고 검수 대기 상태로 반환합니다.
// 제목·재료표·전체 조리단계 및 도구/분량 대조 후 RECIPES에 명시적으로 승인해야 합니다.
export async function fetchCookRcpCandidates({start=1,end=100}={}){
 const key=process.env.MFDS_COOKRCP_API_KEY;
 if(!key)throw new Error('MFDS_COOKRCP_API_KEY is not configured');
 const url=`https://openapi.foodsafetykorea.go.kr/api/${encodeURIComponent(key)}/COOKRCP01/json/${start}/${end}`;
 const response=await fetch(url);if(!response.ok)throw new Error(`COOKRCP01 HTTP ${response.status}`);
 const body=await response.json();const rows=body.COOKRCP01?.row||[];
 return rows.map(row=>({source:'식품의약품안전처 COOKRCP01',recipeId:row.RCP_SEQ,title:row.RCP_NM,ingredientsText:row.RCP_PARTS_DTLS,steps:[1,2,3,4,5,6,7,8,9,10].map(i=>row[`MANUAL${String(i).padStart(2,'0')}`]).filter(Boolean),reviewStatus:'pending',approved:false}));
}
