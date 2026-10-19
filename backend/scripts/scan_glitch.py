"""Temporary scan: stray scripts and Latin words inside Khmer curriculum text."""
import glob
import json
import os
import re
import sys

CURRICULUM_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "app", "seeds", "curriculum")

STRAY = re.compile(r"[\u0e00-\u0eff\u3040-\u30ff\u4e00-\u9fff\u0400-\u04ff]")
TAG = re.compile(r"<[^>]+>")
LATIN_WORD = re.compile(r"[A-Za-z]{3,}")
KHMER = re.compile(r"[\u1780-\u17ff]")


def texts(lesson):
    yield "title_km", lesson["title_km"]
    yield "summary_km", lesson.get("summary_km") or ""
    yield "content_html", lesson["content_html"]
    for i, q in enumerate(lesson["questions"]):
        yield f"q{i}.text_km", q["text_km"]
        yield f"q{i}.explanation_km", q.get("explanation_km") or ""
        yield f"q{i}.hint_km", q.get("hint_km") or ""
        for o in q.get("options") or []:
            yield f"q{i}.opt", o["text"]


def main():
    wanted = sys.argv[1:]
    out = open(os.path.join(os.path.dirname(CURRICULUM_DIR), "..", "scratch_glitch.txt"), "w", encoding="utf-8")
    for path in sorted(glob.glob(os.path.join(CURRICULUM_DIR, "*.json"))):
        base = os.path.basename(path)
        if wanted and base.split("_g")[0] not in wanted:
            continue
        data = json.load(open(path, encoding="utf-8"))
        for ci, chapter in enumerate(data["chapters"], 1):
            for li, lesson in enumerate(chapter["lessons"], 1):
                for field, text in texts(lesson):
                    plain = TAG.sub(" ", text)
                    for m in STRAY.finditer(plain):
                        s, e = max(0, m.start() - 25), min(len(plain), m.end() + 25)
                        out.write(f"{base} c{ci}l{li} {field} STRAY: ...{plain[s:e]}...\n")
                    if KHMER.search(plain):
                        for m in LATIN_WORD.finditer(plain):
                            s, e = max(0, m.start() - 25), min(len(plain), m.end() + 25)
                            out.write(f"{base} c{ci}l{li} {field} LATIN: ...{plain[s:e]}...\n")
    out.close()
    print("done")


if __name__ == "__main__":
    main()
