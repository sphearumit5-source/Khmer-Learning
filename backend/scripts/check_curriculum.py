"""Validate curriculum JSON files before loading them into the database.

Usage: python scripts/check_curriculum.py [subject_code ...]

Checks structure (counts, required keys, option ids), that every multiple_choice
answer points at a real option, question/explanation coverage, and flags
non-Khmer/non-ASCII stray characters inside Khmer fields.
"""
import glob
import json
import os
import re
import sys

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CURRICULUM_DIR = os.path.join(BACKEND, "app", "seeds", "curriculum")

sys.stdout.reconfigure(encoding="utf-8")

ALLOWED_TAGS = re.compile(r"</?(h3|p|ul|ol|li|strong|em|table|thead|tbody|tr|td|blockquote)[^>]*>")
ANY_TAG = re.compile(r"</?([a-zA-Z0-9]+)")
STRAY_SCRIPT = re.compile(r"[\u0e00-\u0eff\u3040-\u30ff\u4e00-\u9fff\u0400-\u04ff]")
KHMER = re.compile(r"[\u1780-\u17ff]")
LATIN = re.compile(r"[A-Za-z]")


def check_lesson(lesson, where, errors):
    for key in ("title_km", "content_html"):
        if not lesson.get(key, "").strip():
            errors.append(f"{where}: missing {key}")

    content = lesson.get("content_html", "")
    if content.count("<h3") < 3:
        errors.append(f"{where}: only {content.count('<h3')} <h3> sections (need 3+)")
    for tag in set(ANY_TAG.findall(content)) - {"h3", "p", "ul", "ol", "li", "strong", "em", "table", "thead", "tbody", "tr", "td", "blockquote"}:
        errors.append(f"{where}: disallowed tag <{tag}>")

    questions = lesson.get("questions", [])
    if len(questions) < 4:
        errors.append(f"{where}: {len(questions)} questions (need 4+)")
    for qi, q in enumerate(questions, start=1):
        qwhere = f"{where} q{qi}"
        qtype = q.get("type", "multiple_choice")
        if qtype not in ("multiple_choice", "true_false", "fill_blank"):
            errors.append(f"{qwhere}: unknown type {qtype}")
        if not q.get("text_km", "").strip():
            errors.append(f"{qwhere}: empty text_km")
        if not str(q.get("correct", "")).strip():
            errors.append(f"{qwhere}: empty correct")
        if not q.get("explanation_km", "").strip():
            errors.append(f"{qwhere}: missing explanation_km")
        if qtype == "multiple_choice":
            options = q.get("options", [])
            if len(options) != 4:
                errors.append(f"{qwhere}: {len(options)} options (need 4)")
            ids = {o.get("id") for o in options}
            if q.get("correct") not in ids:
                errors.append(f"{qwhere}: correct '{q.get('correct')}' not in {sorted(ids)}")
        if qtype == "true_false" and str(q.get("correct")).lower() not in ("true", "false"):
            errors.append(f"{qwhere}: true_false correct must be true/false")
        for field in ("text_km", "explanation_km"):
            value = q.get(field, "")
            if STRAY_SCRIPT.search(value):
                errors.append(f"{qwhere}: stray script in {field}")

    whole = json.dumps(lesson, ensure_ascii=False)
    stray = STRAY_SCRIPT.findall(whole)
    if stray:
        errors.append(f"{where}: stray non-Khmer/Latin characters {''.join(set(stray))[:20]}")
    if not KHMER.search(lesson.get("title_km", "")):
        errors.append(f"{where}: title has no Khmer letters")


def check_file(path):
    errors = []
    with open(path, encoding="utf-8") as handle:
        data = json.load(handle)

    name = os.path.basename(path)
    lessons = [l for c in data.get("chapters", []) for l in c.get("lessons", [])]
    if data.get("subject") not in ("khmer", "math", "english", "social_studies"):
        errors.append(f"{name}: bad subject {data.get('subject')}")
    if not 1 <= int(data.get("grade", 0)) <= 6:
        errors.append(f"{name}: bad grade {data.get('grade')}")
    if len(lessons) != 10:
        errors.append(f"{name}: {len(lessons)} lessons (expected 10)")
    if not 1 <= len(data.get("chapters", [])) <= 3:
        errors.append(f"{name}: {len(data.get('chapters', []))} chapters (expected 1-3)")

    questions = 0
    for ci, chapter in enumerate(data.get("chapters", []), start=1):
        if not chapter.get("title_km", "").strip():
            errors.append(f"{name}: chapter {ci} missing title_km")
        for li, lesson in enumerate(chapter.get("lessons", []), start=1):
            questions += len(lesson.get("questions", []))
            check_lesson(lesson, f"{name} c{ci}l{li}", errors)

    if len(set(l["title_km"] for c in data.get("chapters", []) for l in c["lessons"])) != len(lessons):
        errors.append(f"{name}: duplicate lesson titles")

    return name, len(lessons), questions, errors


def main():
    wanted = sys.argv[1:]
    files = sorted(glob.glob(os.path.join(CURRICULUM_DIR, "*.json")))
    if wanted:
        files = [f for f in files if os.path.basename(f).split("_g")[0] in wanted]
    if not files:
        sys.exit(f"no files in {CURRICULUM_DIR}")

    total_lessons = total_questions = bad = 0
    for path in files:
        name, lessons, questions, errors = check_file(path)
        total_lessons += lessons
        total_questions += questions
        status = "OK" if not errors else f"{len(errors)} problem(s)"
        print(f"{name:28} lessons={lessons:2} questions={questions:3}  {status}")
        for err in errors[:12]:
            print(f"    - {err}")
        bad += bool(errors)

    print(f"\n{len(files)} file(s), {total_lessons} lessons, {total_questions} questions, {bad} with problems")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
