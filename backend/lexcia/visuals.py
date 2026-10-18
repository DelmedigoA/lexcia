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
The form's Send button is fictional: it stays on this page, opens nothing, and sends
no email or contact request. Briefly introduce the form; do not explain preview mechanics
unless asked. Do not say
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
        return {'$type':'Diagram','title':label('Bringing Lexcia to your website','משלבים את Lexcia באתר שלכם'),
                'steps':[{'icon':'network','title':label('Mapping & connections','מיפוי וחיבורים'),'detail':label('We map your content and connect the sources.','אנחנו ממפים את התוכן ומחברים את מקורות הידע.')},
                         {'icon':'palette','title':label('Made for your organization','מותאם לארגון שלכם'),'detail':label('UI, branding and a name chosen together.','ממשק, מיתוג ושם שבוחרים יחד.')},
                         {'icon':'code','title':label('Embed on your website','הטמעה באתר שלכם'),'detail':label('Add the lightweight JavaScript snippet.','מוסיפים את קטע ה-JavaScript הקצר.')},
                         {'icon':'check','title':label("You're ready to go",'מוכנים לצאת לדרך'),'detail':label('Your tailored assistant is ready for visitors.','העוזר המותאם שלכם מוכן למבקרים.')}],
                'source':label('Our team maps and connects your knowledge, builds the experience with you, and prepares it for embedding and launch.','הצוות שלנו ממפה ומחבר את הידע, בונה איתכם את החוויה ומכין אותה להטמעה ולהשקה.')}
    if name == 'integration_flow':
        nodes=[('mapping','Map the content','מיפוי התוכן',0,1),('connections','Connect sources','חיבור מקורות',1,0),('design','UI, brand & name','ממשק, מיתוג ושם',1,2),('test','Test together','בדיקה משותפת',2,1),('embed','Embed on site','הטמעה באתר',3,1),('ready','Ready to go','מוכנים לצאת לדרך',4,1)]
        return {'$type':'FlowGraph','title':label('Your path to launch','הדרך שלכם להשקה'),
                'nodes':[{'id':key,'label':label(en,he),'column':col,'row':row,'state':'pending','icon':{'mapping':'network','connections':'database','design':'palette','test':'check','embed':'code','ready':'check'}[key]} for key,en,he,col,row in nodes],
                'edges':[{'from':a,'to':b} for a,b in [('mapping','connections'),('mapping','design'),('connections','test'),('design','test'),('test','embed'),('embed','ready')]],
                'source':label('An onboarding overview, not live progress. We connect the knowledge and build the UI with you, test together, embed, and get you ready to go.','סקירה של תהליך ההטמעה, לא התקדמות בפועל. מחברים את הידע ובונים איתכם את הממשק, בודקים יחד, מטמיעים ומוכנים לצאת לדרך.')}
    return None
