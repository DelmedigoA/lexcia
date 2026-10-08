import { defineConfig } from 'vite';
const target = process.env.ARCHIVELENS_URL || 'http://127.0.0.1:8766';
const proxy = { '/api': {target,changeOrigin:true}, '/documents': {target,changeOrigin:true} };
export default defineConfig({server:{proxy},preview:{proxy}});
