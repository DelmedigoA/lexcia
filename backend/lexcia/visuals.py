"""Reviewed answer visuals: the model selects a preset, never invents its figures."""
from decimal import Decimal, ROUND_HALF_UP

# Fixed USD planning ranges; conversion provenance is kept in docs/answer-visuals.md.
PRICE_RANGES_USD = {'early': ((810,2430),(80,240)), 'standard': ((3240,8090),(320,810))}
CONTACT_EMAIL = 'delmedigo.asaf@gmail.com'
COST_PER_THOUSAND = (Decimal('1.82'), Decimal('3.05'))
VISUAL_FORMAT = '''You can attach one reviewed visual to an answer by adding "visual" to the
[[FOLLOWUPS]] JSON object. Choose "integration_diagram" for ease-of-integration questions;
"integration_flow" for detailed onboarding steps, workflow or parallel work questions;
"pricing_table" for setup/subscription pricing; "api_cost_chart" specifically for additional
API-request costs or usage estimates. Choose "contact_form" ONLY when the latest
visitor message explicitly asks to contact/email/write to the Lexcia team or requests
this contact form. This is an opt-in exception, never a proactive lead form. Do not
show it for general product/pricing/API/integration questions, demo scheduling,
incidental email mentions, requests to write to someone else, negated or hypothetical
contact requests, or quoted examples. A demo request stays in the scheduling flow.
The form opens the visitor's email app; this chat never sends an email. Do not say
that an email was sent, received or submitted, and do not invent form content from
the visitor's organization. For contact_form, return no follow-up suggestions.
Use null for other answers. Select from the actual
question and conversation, including contextual follow-ups, not keywords alone. The server
supplies the reviewed data, so never output a UI tree, SVG, HTML or invented chart figures.
Keep the normal answer to one or two sentences; do not repeat every visual row in prose.
API estimates count answered visitor questions, not individual provider calls. Explain that
these are sample-based model-token estimates and other paid operations can add costs.'''

def api_cost(questions, rate):
    return float((Decimal(questions)*rate/1000).quantize(Decimal('.01'), rounding=ROUND_HALF_UP))

def reviewed_visual(name, hebrew=False):
    def label(en,he): return he if hebrew else en
    if name == 'contact_form':
        return {'$type':'ContactForm','title':label('Contact us','יצירת קשר'),'to':CONTACT_EMAIL,
                'language':'he' if hebrew else 'en'}
    if name == 'pricing_table':
        rows=[]
        for key,title in [('early',label('Early customers','לקוחות ראשונים')),('standard',label('Future standard pricing','תמחור רגיל עתידי'))]:
            setup,monthly=PRICE_RANGES_USD[key]
            money=lambda values:f'${values[0]:,}–${values[1]:,}'
            rows.append({'plan':title,'setup':money(setup),'monthly':money(monthly)})
        return {'$type':'DataTable','title':label('Planned pricing · approximate USD','תמחור מתוכנן · דולר ארה״ב בקירוב'),
                'columns':[{'key':'plan','label':label('Terms','מסלול')},{'key':'setup','label':label('One-time setup','הקמה חד-פעמית')},{'key':'monthly','label':label('Per month','לחודש')}], 'rows':rows,
                'source':label('Planning ranges, not a quote. API usage is separate. All amounts are in US dollars. Scope affects pricing.','טווחי תכנון, לא הצעת מחיר. שימוש ב-API מחויב בנפרד. כל הסכומים בדולר ארה״ב. המחיר תלוי בהיקף.')}
    if name == 'api_cost_chart':
        return {'$type':'Chart','title':label('Estimated additional API model-token cost','אומדן עלות נוספת לטוקנים של מודל ה-API'),
                'unit':'USD / month','variant':'line', 'seriesLabels':[label('Answered questions','שאלות שנענו'),label('Tool-using questions','שאלות עם שימוש בכלים')],
                'data':[{'label':f'{n:,}','value':api_cost(n,COST_PER_THOUSAND[0]),'highValue':api_cost(n,COST_PER_THOUSAND[1])} for n in [0,250,750,1000,5000]],
                'source':label('X: answered questions/month. Historical sample: $1.82–$3.05 per 1,000 questions; at 750: $1.37–$2.29. GPT-6 Luna repricing of a small development sample (Oct 11, 2026), not a live tariff or benchmark. No cache savings. Search, indexing, hosting, paid tools, added protection and support are extra.','ציר X: שאלות שנענו בחודש. מדגם היסטורי: $1.82–$3.05 לכל 1,000 שאלות; ב-750: $1.37–$2.29. תמחור מחדש לפי GPT-6 Luna למדגם פיתוח קטן (11.10.2026), לא מחירון חי או מבחן ביצועים. ללא חיסכון ממטמון. חיפוש, אינדוקס, אחסון, כלים בתשלום, הגנה נוספת ותמיכה הם עלויות נוספות.')}
    if name == 'integration_diagram':
        return {'$type':'Diagram','title':label('Simple proposed integration','שילוב פשוט — הגישה המוצעת'),
                'steps':[{'title':label('Your existing website','האתר הקיים שלכם'),'detail':label('Pages, documents and knowledge','עמודים, מסמכים וידע')},
                         {'title':label('Lexcia prepares the assistant','Lexcia מכינה את העוזר'),'detail':label('Knowledge setup, design and testing','הכנת הידע, עיצוב ובדיקות')},
                         {'title':label('Add the embed snippet','מוסיפים קטע קוד להטמעה'),'detail':label('The typical customer step','השלב הטיפוסי מצד הלקוח')},
                         {'title':label('Try it together and refine','מנסים יחד ומשפרים'),'detail':label('Agree the experience before launch','מסכימים על החוויה לפני ההשקה')}],
                'source':label('Proposed onboarding approach. Lexcia handles preparation and operation; the customer typically adds a lightweight JavaScript snippet.','גישת ההטמעה המוצעת. Lexcia מטפלת בהכנה ובהפעלה; הלקוח בדרך כלל מוסיף קטע JavaScript קצר.')}
    if name == 'integration_flow':
        nodes=[('scope','Agree scope','הגדרת ההיקף',0,1),('knowledge','Prepare knowledge','הכנת הידע',1,0),('design','Tailor interface','התאמת הממשק',1,2),('test','Test together','בדיקה משותפת',2,1),('embed','Add snippet','הוספת קטע הקוד',3,1),('refine','Operate & refine','הפעלה ושיפור',4,1)]
        return {'$type':'FlowGraph','title':label('Proposed onboarding workflow','תהליך ההטמעה המוצע'),
                'nodes':[{'id':key,'label':label(en,he),'column':col,'row':row,'state':'pending'} for key,en,he,col,row in nodes],
                'edges':[{'from':a,'to':b} for a,b in [('scope','knowledge'),('scope','design'),('knowledge','test'),('design','test'),('test','embed'),('embed','refine')]],
                'source':label('Illustrative workflow, not live progress. Lexcia prepares knowledge and interface; the customer typically adds the snippet. Exact sequencing is agreed together.','תהליך להמחשה, לא התקדמות בפועל. Lexcia מכינה את הידע והממשק; הלקוח בדרך כלל מוסיף את קטע הקוד. סדר השלבים המדויק נקבע יחד.')}
    return None
