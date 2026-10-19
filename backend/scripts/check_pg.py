"""Read-only check of the target Postgres database.

Usage: DATABASE_URL=... python check_pg.py
Prints server version, existing tables in `public`, and row counts.
Performs no writes.
"""
import os
import sys

url = os.getenv("DATABASE_URL")
if not url:
    sys.exit("DATABASE_URL is not set")

import psycopg2

conn = psycopg2.connect(url)
conn.set_session(readonly=True, autocommit=True)
cur = conn.cursor()

cur.execute("select version()")
print("server:", cur.fetchone()[0])

cur.execute("""
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
""")
tables = [r[0] for r in cur.fetchall()]
print("tables in public:", len(tables))
for t in tables:
    cur.execute(f'select count(*) from public."{t}"')
    print(f"  {t}: {cur.fetchone()[0]} rows")

cur.close()
conn.close()
