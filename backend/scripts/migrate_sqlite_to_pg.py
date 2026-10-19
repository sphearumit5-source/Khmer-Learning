"""Copy the local SQLite curriculum/progress into the Postgres DATABASE_URL target.

Usage (run from backend/):
    DATABASE_URL=postgresql://... python scripts/migrate_sqlite_to_pg.py [--dry-run]

Source defaults to ./khmer_learning.db (override with --sqlite PATH).
Inserts use ON CONFLICT (id) DO NOTHING, so re-running is safe.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.database import Base, DATABASE_URL, engine
import app.models.models  # noqa: F401  (registers every table on Base.metadata)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sqlite", default="khmer_learning.db")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if DATABASE_URL.startswith("sqlite"):
        sys.exit("Set DATABASE_URL to the Postgres target before migrating.")

    source = create_engine(
        f"sqlite:///{args.sqlite}", connect_args={"check_same_thread": False}
    )

    if not args.dry_run:
        Base.metadata.create_all(engine)
        print("created tables in target")

    with source.connect() as src, engine.connect() as dst:
        count = lambda t: select(func.count()).select_from(t)  # noqa: E731
        for table in Base.metadata.sorted_tables:
            rows = [dict(r) for r in src.execute(table.select()).mappings().all()]
            src_count = src.execute(count(table)).scalar_one()
            head = f"{table.name:20} sqlite={src_count:4}"
            if args.dry_run:
                print(f"{head}  would insert {len(rows)}")
                continue

            dst_count = dst.execute(count(table)).scalar_one()
            print(f"{head}  pg_before={dst_count:4}", end="")

            if rows:
                chunk = 200
                for i in range(0, len(rows), chunk):
                    dst.execute(pg_insert(table).on_conflict_do_nothing(), rows[i:i + chunk])
                dst.commit()
                after = dst.execute(count(table)).scalar_one()
                print(f"  -> pg_after={after:4} {'OK' if after == src_count else 'MISMATCH'}")
            else:
                print()


if __name__ == "__main__":
    main()
