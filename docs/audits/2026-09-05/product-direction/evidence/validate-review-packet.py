"""Validate local review links, source locations, ticket coverage and dependencies."""
from pathlib import Path
import collections,csv,json,re,sys
from urllib.parse import unquote
root=Path(__file__).resolve().parents[5]
packet=root/'docs/audits/2026-09-05/product-direction'
tasks=root/'docs/tasks/learning-product'
tickets=json.loads((packet/'tickets.json').read_text())
findings=json.loads((packet/'findings.json').read_text())
errors=[];links=0;source_locations=0
files=list(packet.glob('*.md'))+list(tasks.glob('TASK-LP-*.md'))
def anchors(text):
 result=set(re.findall(r'<a id="([^"]+)"',text))
 for heading in re.findall(r'^#{1,6}\s+(.+)$',text,re.M):
  heading=re.sub(r'[^\w\- ]','',heading.lower()).replace(' ','-')
  result.add(heading)
 return result
for p in files:
 text=p.read_text()
 for raw in re.findall(r'\]\(([^)]+)\)',text):
  raw=raw.strip().strip('<>')
  if re.match(r'^[a-z]+://',raw) or raw.startswith('mailto:'):continue
  links+=1
  path,_,anchor=unquote(raw).partition('#')
  target=(p.parent/path).resolve() if path else p
  if not target.exists():errors.append(f'{p.relative_to(root)}: missing {raw}');continue
  if anchor and target.is_file():
   if re.fullmatch(r'L\d+',anchor):
    source_locations+=1
    if int(anchor[1:])>len(target.read_text().splitlines()):errors.append(f'{p.name}: invalid line {raw}')
   elif target.suffix=='.md' and anchor not in anchors(target.read_text()):errors.append(f'{p.name}: missing anchor {raw}')
ids=[t['id'] for t in tickets];fids=[f['id'] for f in findings];byid={t['id']:t for t in tickets}
if len(ids)!=76 or len(set(ids))!=76:errors.append('ticket count/uniqueness')
if len(fids)!=44 or len(set(fids))!=44:errors.append('finding count/uniqueness')
if len(set(t['epic'] for t in tickets))!=10:errors.append('epic count')
required=['## Problem and intended outcome','## Implementation scope','## Acceptance criteria','## Validation and evidence','## Rollout, migration, and recovery','## Source evidence','## Definition of done']
for t in tickets:
 p=(packet/t['path']).resolve()
 if not p.exists():errors.append(f'missing ticket {t["id"]}');continue
 text=p.read_text()
 for heading in required:
  if heading not in text:errors.append(f'{t["id"]}: {heading}')
 if text.lower().count('**given**')<2 or text.lower().count('**when**')<2 or text.lower().count('**then**')<2:errors.append(f'{t["id"]}: acceptance structure')
 for d in t['dependencies']:
  if d not in byid:errors.append(f'{t["id"]}: unknown dependency {d}')
 for f in t['findings']:
  if f not in fids:errors.append(f'{t["id"]}: unknown finding {f}')
for f in findings:
 if not f['tickets']:errors.append(f'{f["id"]}: no follow-up')
 for t in f['tickets']:
  if t not in byid:errors.append(f'{f["id"]}: unknown ticket {t}')
  elif f['id'] not in byid[t]['findings']:errors.append(f'{f["id"]}: reverse mapping missing from {t}')
 for t in tickets:
  if f['id'] in t['findings'] and t['id'] not in f['tickets']:errors.append(f'{t["id"]}: reverse mapping missing from {f["id"]}')
visiting=set();visited=set()
def visit(i):
 if i in visiting:errors.append('dependency cycle: '+i);return
 if i in visited or i not in byid:return
 visiting.add(i)
 for d in byid[i]['dependencies']:visit(d)
 visiting.remove(i);visited.add(i)
for i in ids:visit(i)
with (packet/'tickets.csv').open() as f:csvrows=list(csv.DictReader(f))
if len(csvrows)!=len(tickets):errors.append('CSV count differs')
for name in ['ticket-index.md','epics.md']:
 content=(packet/name).read_text()
 for i in ids:
  if i not in content:errors.append(f'{name}: missing {i}')
result={'date':'2026-09-05','markdown_files_checked':len(files),'local_links_checked':links,'source_line_links_checked':source_locations,'tickets':len(tickets),'findings':len(findings),'epics':len(set(t['epic'] for t in tickets)),'priority_counts':dict(collections.Counter(t['priority'] for t in tickets)),'dependency_graph_acyclic':not any('cycle' in e for e in errors),'bidirectional_finding_coverage_valid':not any('mapping' in e or 'follow-up' in e for e in errors),'errors':errors,'passed':not errors}
(packet/'evidence/document-validation.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2));sys.exit(bool(errors))
