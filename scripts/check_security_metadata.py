#!/usr/bin/env python3
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sys
path=Path(sys.argv[1]) if len(sys.argv)>1 else Path('public/.well-known/security.txt')
fields={}
for raw in path.read_text(encoding='utf-8').splitlines():
    if ':' not in raw: continue
    key,value=raw.split(':',1); fields[key.strip()]=value.strip()
required={'Contact','Expires','Canonical','Policy'}
missing=required-fields.keys()
if missing: raise SystemExit(f"security.txt missing required fields: {', '.join(sorted(missing))}")
try: expires=datetime.fromisoformat(fields['Expires'].replace('Z','+00:00'))
except ValueError as exc: raise SystemExit(f"security.txt Expires is invalid: {exc}")
if expires - datetime.now(timezone.utc) < timedelta(days=90): raise SystemExit('security.txt expires in less than 90 days')
print(f"security.txt valid through {expires.date().isoformat()}")
