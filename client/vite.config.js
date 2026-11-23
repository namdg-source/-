import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const apiTarget = process.env.API_PROXY_TARGET || `http://127.0.0.1:${process.env.API_PORT || 5001}`;
export default defineConfig({plugins:[react(),tailwindcss()],server:{proxy:{'/api':{target:apiTarget,changeOrigin:true},'/health':{target:apiTarget,changeOrigin:true}}}});
