// Run after npm ci and after dependency updates: node scripts/license-notices.mjs
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const lock=JSON.parse(readFileSync(join(root,'package-lock.json'),'utf8'));
const sections=['Lexcia website — third-party runtime dependency notices\n\nGenerated from package-lock.json by scripts/license-notices.mjs. Includes all\nnon-development dependencies, even packages that may be removed by tree shaking.\nCopied assistant-ui components are covered separately by assistant-ui.txt.\n\nSee docs/assistant-ui-licenses.md for scope and outstanding upstream notice gaps.'];
const missing=[];
for(const [path,pkg] of Object.entries(lock.packages).sort(([a],[b])=>a.localeCompare(b))){
  if(!path||pkg.dev)continue;
  const name=path.replace(/^node_modules\//,'');
  const files=readdirSync(join(root,path)).filter(name=>/^(licen[cs]e|copying|notice)([.\-]|$)/i.test(name)).sort();
  let notice=files.map(file=>`${file}\n\n${readFileSync(join(root,path,file),'utf8').trim()}`).join('\n\n');
  if(!notice){
    missing.push(`${name}@${pkg.version}`);
    const metadata=JSON.parse(readFileSync(join(root,path,'package.json'),'utf8'));
    const repo=typeof metadata.repository==='string'?metadata.repository:metadata.repository?.url;
    notice=`Package declares ${pkg.license||'UNKNOWN'}; its published package contains no license file.\nUpstream repository: ${repo||'not specified'}\nAttribution text requires upstream verification; see the audit.`;
  }
  sections.push(`${name}@${pkg.version}\nDeclared license: ${pkg.license||'UNKNOWN'}\n\n${notice}`);
}
writeFileSync(join(root,'public/licenses/runtime-dependencies.txt'),sections.join('\n\n'+'='.repeat(72)+'\n\n')+'\n');
console.log(`Generated notices for ${sections.length-1} runtime packages.`);
if(missing.length)console.warn('Missing published license files: '+missing.join(', '));
