import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import api from './routes/api.js';

const app=express();
const PORT=process.env.PORT||5001;

app.disable('x-powered-by');
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS')return res.sendStatus(204);
  next();
});
app.use(express.json({limit:'1mb'}));
app.use('/api',api);
app.get('/health',(_req,res)=>res.json({status:'ok',service:'hankki-eottae'}));

const here=path.dirname(fileURLToPath(import.meta.url));
const dist=path.resolve(here,'../../client/dist');
app.use(express.static(dist));
app.get('*',(req,res)=>{
  if(req.path.startsWith('/api/'))return res.status(404).json({success:false,message:'Not found'});
  res.sendFile(path.join(dist,'index.html'),err=>{
    if(err)res.status(404).send('Frontend build not found. Run npm run build.');
  });
});
app.listen(PORT,'0.0.0.0',()=>console.log(`Hankki-Eot-Tae listening on ${PORT}`));
