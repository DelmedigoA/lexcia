import { z } from 'zod';
const text = z.string().max(4000);
const cell = z.union([text, z.number().finite(), z.boolean(), z.null()]);
export const schemas = {
  Card: z.object({ title: text }),
  Row: z.object({}),
  Text: z.object({ text }),
  Fact: z.object({ label: text, value: text, detail: text.optional() }),
  Chart: z.object({ title: text, unit: text, variant: z.enum(['area','line','bars']).default('area'), data: z.array(z.object({label: text, value: z.number().finite()})).max(100), source: text }),
  DataTable: z.object({ title: text, columns: z.array(z.object({key: z.string().regex(/^[a-zA-Z][\w]*$/).max(60), label: text, format: z.enum(['text','number','currency','percent']).default('text')})).min(1).max(12), rows: z.array(z.record(z.string(), cell)).max(200), source: text }),
  Source: z.object({ title: text, url: z.url().refine(url => new URL(url).protocol === 'https:', 'Only HTTPS sources are supported') }),
};
// Validate before rendering: no arbitrary elements, scripts, styles, actions or URLs.
export function validateUI(tree) {
  let nodes = 0;
  function visit(node, depth = 0) {
    if (++nodes > 80 || depth > 8) throw Error('Answer layout is too large.');
    if (!node || typeof node !== 'object' || Array.isArray(node) || !Object.hasOwn(schemas, node.$type)) throw Error('Unsupported answer component.');
    const {$type, children, ...props} = node;
    const parsed = schemas[$type].strict().parse(props);
    if (children !== undefined && !['Card','Row'].includes($type)) throw Error('Only layout components accept children.');
    if (children !== undefined && !Array.isArray(children)) throw Error('Children must be an array.');
    return {$type, ...parsed, ...(children ? {children: children.map(child => visit(child, depth+1))} : {})};
  }
  return visit(tree);
}
