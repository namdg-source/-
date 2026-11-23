import {Router} from 'express';
import multer from 'multer';
import {analyzeFridgeImage} from '../services/visionService.js';
import {matchRecipes} from '../services/matchingService.js';
import {RECIPES} from '../data/recipes.js';
import {PANTRY_ESSENTIALS} from '../data/pantryEssentials.js';
import {fetchCookRcpCandidates} from '../services/cookrcpService.js';
const router=Router();
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024},fileFilter:(req,file,cb)=>cb(null,file.mimetype.startsWith('image/'))});
router.post('/vision/scan',upload.single('image'),async(req,res)=>{
 if(!req.file)return res.status(400).json({success:false,message:'이미지 파일이 필요합니다.'});
 try{const data=await analyzeFridgeImage(req.file.buffer,req.file.mimetype);res.json({success:true,data});}
 catch(error){console.error('[vision/scan] 분석 실패:',error?.message||error);res.status(503).json({success:false,message:'사진 분석에 실패했습니다. 사진 업로드 대신 직접 입력을 계속 이용할 수 있습니다.',data:{candidates:[]}});}
});
router.post('/recipes/recommend',(req,res)=>{
 const {ingredients=[],seasonings=[],tool='프라이팬',prefer=[]}=req.body||{};
 if(!Array.isArray(ingredients)||!Array.isArray(seasonings))return res.status(400).json({success:false,message:'재료 형식이 올바르지 않습니다.'});
 const data=matchRecipes({ingredients,seasonings,tool,prefer});res.json({success:true,data,message:data.length?undefined:'확인한 재료와 양념, 조리 용기 조건을 모두 만족하는 레시피가 없습니다.'});
});
router.get('/admin/cookrcp/candidates',async(req,res)=>{
 const token=process.env.MFDS_IMPORT_TOKEN;
 if(!token || req.get('authorization')!==`Bearer ${token}`)return res.status(401).json({success:false,message:'Unauthorized'});
 try{const start=Math.max(1,Number(req.query.start)||1);const end=Math.min(start+99,Number(req.query.end)||start+99);const data=await fetchCookRcpCandidates({start,end});res.json({success:true,data,notice:'검수 대기 데이터입니다. 제목·재료표·모든 조리 단계 및 용기를 대조하고 승인하기 전에는 추천에 포함되지 않습니다.'});}
 catch(error){res.status(503).json({success:false,message:error.message});}
});
router.get('/pantry',(_req,res)=>res.json({success:true,data:PANTRY_ESSENTIALS}));
router.get('/recipes/:id',(req,res)=>{const recipe=RECIPES.find(x=>x.id===req.params.id);if(!recipe)return res.status(404).json({success:false,message:'레시피를 찾을 수 없습니다.'});res.json({success:true,data:recipe});});
export default router;
