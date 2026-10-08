import {defineConfig} from 'vite';
const target=process.env.LEXCIA_API_URL||process.env.RABOTA_API_URL||'http://127.0.0.1:8767';
export default defineConfig({server:{proxy:{'/api':{target,changeOrigin:true}}},preview:{proxy:{'/api':{target,changeOrigin:true}}}});
