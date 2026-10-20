import time

import httpx
from typing import Tuple, List
from app.core.config import settings

KHMER_SYSTEM_PROMPT = """
អ្នកគឺជា «គ្រូឆ្លាត» (AI Tutor) ដែលជាគ្រូបង្រៀននិម្មិតប្រកបដោយភាពកក់ក្តៅ រួសរាយ និងឆ្លាតវៃ សម្រាប់បង្រៀនសិស្សានុសិស្សកម្រិតបឋមសិក្សាកម្ពុជា (ថ្នាក់ទី ១ ដល់ ទី ៦)។
គោលការណ៍ណែនាំ៖
១. ភាសា៖ ត្រូវឆ្លើយជាភាសាខ្មែរជានិច្ច ដោយប្រើពាក្យពេចន៍ងាយស្រួលយល់ សមរម្យសម្រាប់កុមារ លើកទឹកចិត្ត និងគួរសម (ប្រើពាក្យ «កូន», «ប្អូន» ឬ «សិស្សតូច»)។ ភាសាអង់គ្លេសប្រើតែពេលពន្យល់មេរៀនភាសាអង់គ្លេសប៉ុណ្ណោះ។
២. កម្រិតថ្នាក់៖ បន្ស៊ាំការពន្យល់ទៅតាមកម្រិតថ្នាក់ (ថ្នាក់ទី ១-២ ត្រូវពន្យល់ខ្លី ឧទាហរណ៍ជាក់ស្តែង ថ្នាក់ទី ៥-៦ អាចស៊ីជម្រៅជាង)។
៣. រចនាសម្ព័ន្ធ៖
   - ជំរាបសួរ និងសរសើរ
   - ពន្យល់ខ្លឹមសារសំខាន់ៗដោយខ្លី និងងាយចាំ
   - លើកឧទាហរណ៍ជាក់ស្តែង
   - ផ្តល់លំហាត់អនុវត្តសប្បាយៗ ១ ឬ ២ សំណួរដើម្បីសាកល្បង
៤. សុវត្ថិភាពកុមារ៖ ហាមនិយាយពីរឿងហិង្សា អាសអាភាស ឬខ្លឹមសារមិនសមរម្យសម្រាប់កុមារ។ ប្រសិនបើសួរក្រៅពីការសិក្សា ត្រូវបង្វែរមកការរៀនសូត្រវិញដោយសុភាព។
"""

# Fallback smart knowledge base for when offline or no API key is set
SAMPLE_RESPONSES = {
    "math": {
        1: "សួស្តីកូន! សម្រាប់គណិតវិទ្យាថ្នាក់ទី ១ យើងរៀនអំពីរាប់លេខពី ១ ដល់ ២០ និងការបូកដកងាយៗ។ ឧទាហរណ៍៖ កូនមានផ្លែប៉ោម ២ ផ្លែ ប៉ាម៉ាក់ឲ្យ ៣ ផ្លែទៀត តើកូនមានសរុបប៉ុន្មានផ្លែ? (២ + ៣ = ៥ ផ្លែ)។ សាកឆ្លើយលំហាត់នេះមើល៍៖ ១ + ៤ = ?",
        2: "ពូកែណាស់កូន! គណិតវិទ្យាថ្នាក់ទី ២ យើងរៀនមេលេខគុណ និងការបូកដកលេខខ្ទង់រយ។ ឧទាហរណ៍ មេលេខ ២៖ ២ x ១ = ២, ២ x ២ = ៤, ២ x ៣ = ៦! តើកូនអាចប្រាប់លោកគ្រូបានទេថា ២ x ៤ ស្មើនឹងប៉ុន្មាន?",
        3: "សួស្តីសិស្សពូកែ! ក្នុងថ្នាក់ទី ៣ យើងរៀនការគុណលេខពីរខ្ទង់ និងប្រភាគងាយៗ។ ឧទាហរណ៍៖ នំខេកមួយកាត់ជា ៤ ចំណែកស្មើគ្នា បើយើងញ៉ាំ ១ ចំណែក គឺស្មើនឹង ១/៤ នៃនំ! សាកល្បង៖ ២៥ x ២ = ?",
        4: "ជំរាបសួរកូន! គណិតវិទ្យាថ្នាក់ទី ៤ ផ្តោតលើវិធីចែកលេខ ការវាស់ប្រវែង (ម៉ែត្រ សង់ទីម៉ែត្រ) និងធរណីមាត្រ (ចតុកោណកែង ការ៉េ)។ រូបមន្តផ្ទៃក្រឡាចតុកោណកែង = បណ្តោយ x ទទឹង។",
        5: "សួស្តីកូន! ថ្នាក់ទី ៥ យើងសិក្សាចំនួនទសភាគ ភាគរយ (%) និងធរណីមាត្រកម្រិតខ្ពស់។ ឧទាហរណ៍៖ ០.៥ គឺស្មើនឹងកន្លះ ឬ ៥០%។ តើកូនចង់ឲ្យលោកគ្រូពន្យល់ចំណុចណា?",
        6: "ជំរាបសួរប្អូន! គណិតវិទ្យាថ្នាក់ទី ៦ ត្រៀមប្រឡងបញ្ចប់ភូមិសិក្សា យើងរៀនអំពីសមាមាត្រ ផ្ទៃក្រឡារង្វង់ មាឌព្រីស និងស្ថិតិក្រាហ្វិក។ រូបមន្តបរិមាត្ររង្វង់ = ២ x π x r (π ≈ ៣.១៤)។",
    },
    "khmer": {
        1: "សួស្តីកូនៗ! ភាសាខ្មែរថ្នាក់ទី ១ យើងរៀនព្យញ្ជនៈ ៣៣ តួ (ក ខ គ ឃ ង...) និងស្រៈនិស្ស័យ ២៣ តួ (ា ិ ី ឹ ឺ ុ ូ ួ...)។ ចូរសាកល្បងអានផ្សំ៖ ក + ា = កា, ខ + ា = ខា! កូនពូកែណាស់!",
        2: "ជំរាបសួរកូន! ភាសាខ្មែរថ្នាក់ទី ២ យើងរៀនព្យញ្ជនៈផ្ញើជើង (ដូចជា ខ្មែរ, ផ្លែឈើ, ស្រឡាញ់) និងការតែងល្បះខ្លីៗ។ តើកូនអាចរកពាក្យដែលមានជើង «ម» បានទេ?",
        3: "សួស្តីកូន! ភាសាខ្មែរថ្នាក់ទី ៣ យើងរៀនអំពីនាម កិរិយាសព្ទ និងសញ្ញាវណ្ណយុត្តិ (ខណ្ឌ, ក្បៀស, ឧទានសញ្ញា)។ ឧទាហរណ៍៖ «សុខា រត់ ទៅសាលារៀន» -> សុខា (នាម), រត់ (កិរិយាសព្ទ)។",
        4: "ជំរាបសួរប្អូន! ថ្នាក់ទី ៤ យើងរៀនអត្ថបទកំណាព្យកាកគតិ បទពាក្យ ៧ និងការសរសេរតែងសេចក្តីពណ៌នាអំពីរូបភាព និងធម្មជាតិ។",
        5: "សួស្តីកូន! ថ្នាក់ទី ៥ យើងសិក្សាសព្ទន័យដូច ន័យផ្ទុយ និងវេយ្យាករណ៍ខ្មែរកម្រិតខ្ពស់ (គុណនាម កិរិយាវិសេសនៈ)។",
        6: "ជំរាបសួរប្អូន! ភាសាខ្មែរថ្នាក់ទី ៦ យើងរៀនតែងសេចក្តីបែបពន្យល់ ពិភាក្សា និងអក្សរសិល្ប៍ខ្មែរដ៏មានតម្លៃ ដូចជារឿងព្រេងនិទានប្រជាប្រិយខ្មែរ។",
    },
    "english": {
        1: "Hello little friend! សួស្តីកូន! ថ្នាក់ទី ១ យើងរៀនអក្សរ A B C និងពាក្យស្វាគមន៍៖ Hello (សួស្តី), Goodbye (លាហើយ), Thank you (អរគុណ)។ Let's say: 'Good morning!'",
        2: "Hello! ថ្នាក់ទី ២ យើងរៀនអំពីពណ៌ (Colors) និងសត្វ (Animals)៖ Red (ក្រហម), Blue (ខៀវ), Cat (ឆ្មា), Dog (ឆ្កែ)។ What color do you like? កូនចូលចិត្តពណ៌អ្វីដែរ?",
        3: "Hello! Grade 3 learners! ថ្នាក់ទី ៣ យើងរៀន Present Simple: I like apples (ខ្ញុំចូលចិត្តផ្លែប៉ោម), He likes milk (គាត់ចូលចិត្តទឹកដោះគោ)។ Can you make a sentence?",
        4: "Welcome to Grade 4 English! យើងរៀនអំពី Days of the week (ថ្ងៃនៃសប្តាហ៍) និង Past Tense ងាយៗ (I went, I played)។",
        5: "Hello! Grade 5 English covers comparative adjectives (bigger than, smaller than) and reading short stories in English with Khmer translation.",
        6: "Greetings! Grade 6 English prepares you for secondary school with reading comprehension, questions with Who/What/Where/When/Why, and writing simple emails.",
    },
    "social_studies": {
        1: "សួស្តីកូន! សិក្សាសង្គមថ្នាក់ទី ១ យើងរៀនអំពីអនាម័យខ្លួនប្រាណ (លាងដៃមុនញ៉ាំបាយ) ការគោរពចាស់ទុំ និងស្រឡាញ់ក្រុមគ្រួសារ។",
        2: "ជំរាបសួរកូន! ថ្នាក់ទី ២ យើងរៀនអំពីភូមិឋាន សាលារៀន និងទង់ជាតិកម្ពុជាដែលមាន ៣ ពណ៌ (ខៀវ ក្រហម ខៀវ) និងប្រាសាទអង្គរវត្តនៅចំកណ្តាល។",
        3: "សួស្តីកូន! សិក្សាសង្គមថ្នាក់ទី ៣ យើងរៀនអំពីបរិស្ថានជុំវិញខ្លួន ធនធានទឹក និងការដាំដើមឈើដើម្បីឲ្យផែនដីត្រជាក់ និងមានខ្យល់បរិសុទ្ធ។",
        4: "ជំរាបសួរប្អូន! ថ្នាក់ទី ៤ យើងរៀនអំពីប្រវត្តិសាស្ត្រខ្មែរ រមណីយដ្ឋានវប្បធម៌ និងការសន្សំសំចៃក្នុងជីវភាពរស់នៅ។",
        5: "សួស្តីកូន! ថ្នាក់ទី ៥ យើងសិក្សាអំពីភូមិសាស្ត្រប្រទេសកម្ពុជា ទន្លេមេគង្គ បឹងទន្លេសាប និងខេត្ត-រាជធានីទាំង ២៥។",
        6: "ជំរាបសួរប្អូន! សិក្សាសង្គមថ្នាក់ទី ៦ យើងរៀនអំពីច្បាប់ចរាចរណ៍ សិទ្ធិកុមារ និងសម្បត្តិបេតិកភណ្ឌពិភពលោករបស់កម្ពុជា។",
    }
}

SUGGESTED_QUESTIONS_MAP = {
    "math": [
        "តើធ្វើដូចម្តេចដើម្បីចាំមេលេខគុណបានលឿន?",
        "ពន្យល់អំពីវិធីបូកដកលេខខ្ទង់រយ",
        "តើប្រភាគគឺជាអ្វី? លើកឧទាហរណ៍ងាយៗ",
        "តើរូបមន្តរកផ្ទៃក្រឡាចតុកោណកែងជាអ្វី?"
    ],
    "khmer": [
        "តើព្យញ្ជនៈខ្មែរមានប៉ុន្មានតួ និងចែកជាប៉ុន្មានពួក?",
        "តើស្រៈពេញតួ និងស្រៈនិស្ស័យខុសគ្នាយ៉ាងណា?",
        "ពន្យល់ពីរបៀបប្រើសញ្ញាវណ្ណយុត្តិខ្មែរ",
        "តើពាក្យ «ខ្មែរ» មានព្យញ្ជនៈផ្ញើជើងអ្វីខ្លះ?"
    ],
    "english": [
        "How do I say 'អរគុណច្រើន' in English?",
        "What are the 7 days of the week in English?",
        "Explain the difference between 'am', 'is', and 'are'",
        "Help me translate: ខ្ញុំចូលចិត្តអានសៀវភៅ"
    ],
    "social_studies": [
        "តើទង់ជាតិកម្ពុជាមានប៉ុន្មានពណ៌ និងមានអត្ថន័យដូចម្តេច?",
        "តើទន្លេសាបមានសារៈសំខាន់យ៉ាងណាចំពោះប្រទេសកម្ពុជា?",
        "ហេតុអ្វីបានជាយើងត្រូវថែរក្សាអនាម័យបរិស្ថាន?",
        "តើប្រាសាទអង្គរវត្តស្ថិតនៅក្នុងខេត្តណា?"
    ]
}

def _answer_from_lessons(message, grade_level, subject_key, db, suggested, note=None):
    """Ground the reply in real stored lessons; None when nothing matches."""
    if db is None:
        return None
    from app.services.lesson_search import compose_reply, search_lessons

    results = search_lessons(db, message, subject_key, grade_level)
    if not results:
        return None
    reply = compose_reply(message, grade_level, results)
    if note:
        reply = note + "\n\n" + reply
    return (
        reply,
        False,
        f"មេរៀនក្នុងសៀវភៅ ({len(results)} ត្រូវនឹងសំណួរ)",
        suggested,
        "lessons",
    )


async def generate_tutor_response(
    message: str,
    grade_level: int,
    subject_code: str,
    db=None
) -> Tuple[str, bool, str, List[str]]:
    """
    Returns: (reply_text, is_fallback, model_name, suggested_questions, answer_source)
    answer_source is "ai_live" | "lessons" | "built_in" so the UI can label the
    origin of the answer truthfully.
    """
    api_key = settings.AI_API_KEY.strip()
    subject_key = subject_code.lower() if subject_code else "khmer"
    suggested = SUGGESTED_QUESTIONS_MAP.get(subject_key, SUGGESTED_QUESTIONS_MAP["khmer"])

    # No API key: answer from the curriculum stored in the database, and only
    # fall back to the static notes when no lesson matches the question.
    if not api_key:
        from_lessons = _answer_from_lessons(message, grade_level, subject_key, db, suggested)
        if from_lessons:
            return from_lessons

        subject_data = SAMPLE_RESPONSES.get(subject_key, SAMPLE_RESPONSES["khmer"])
        grade_text = subject_data.get(grade_level, subject_data.get(3, ""))

        reply = (
            f"សួស្តីកូនៗសិស្សថ្នាក់ទី {grade_level}! លោកគ្រូឆ្លាតសូមជួយពន្យល់៖\n\n"
            f"{grade_text}\n\n"
            f"ចំពោះសំណួររបស់កូន «{message}»៖ សូមជ្រើសរើសសំណួរគំរូខាងក្រោម ឬប្រាប់លោកគ្រូឲ្យដឹងមេរៀនណាដែលកូនកំពុងរៀនណា៎កូន!"
        )
        return reply, True, "Khmer Learning Smart Rule-Based Engine", suggested, "built_in"

    # Live call to Gemini via Google AI Studio REST endpoint. The free-tier daily
    # quota runs out on the main model, so try a cheaper one before losing the
    # live answer entirely.
    models = list(dict.fromkeys([
        settings.AI_MODEL.strip() or "gemini-flash-latest",
        settings.AI_MODEL_FALLBACK.strip(),
    ]))
    
    prompt = f"""
{KHMER_SYSTEM_PROMPT}

[បរិបទសិស្ស]
- កម្រិតថ្នាក់៖ ថ្នាក់ទី {grade_level} (បឋមសិក្សាកម្ពុជា)
- មុខវិជ្ជា៖ {subject_code}

[សំណួរពីសិស្ស]
«{message}»

ចូរបកស្រាយជាភាសាខ្មែរ ដោយភាពទន់ភ្លន់ លើកទឹកចិត្ត និងសមរម្យសម្រាប់កុមារថ្នាក់ទី {grade_level}៖
"""

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            # thinking models spend most of a small budget on hidden reasoning and
            # return a cut-off answer, so leave plenty of room for the visible text
            "maxOutputTokens": 8192
        }
    }

    note = ""
    # one ceiling for all attempts: past it the platform (Vercel) would kill the
    # request, and the child is better served by an instant lesson-based answer
    deadline = time.perf_counter() + max(2.0, float(settings.AI_BUDGET_SECONDS))
    for model in models:
        remaining = deadline - time.perf_counter()
        if remaining <= 1.0:
            note = f"⚠️ [AI យឺតពេលលើសពី {int(settings.AI_BUDGET_SECONDS)} វិនាទី]"
            break
        timeout = min(float(settings.AI_TIMEOUT_SECONDS), remaining)
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(timeout, connect=10.0)) as client:
                resp = await client.post(gemini_url, json=payload)
        except Exception as e:
            # some httpx/SSL exceptions stringify to "" — the type name is the only clue
            reason = str(e)[:60] or type(e).__name__
            note = f"⚠️ [ពុំអាចទាក់ទង AI Server បាន: {reason}]"
            continue

        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                # Gemini splits a long answer across several parts
                ai_text = "".join(p.get("text", "") for p in parts).strip()
                if ai_text:
                    return ai_text, False, f"Google {model} (ផ្សាយផ្ទាល់)", suggested, "ai_live"
                # no text: surface why (safety block / empty model reply) instead of silence
                why = (
                    candidates[0].get("finishReason")
                    or data.get("promptFeedback", {}).get("blockReason")
                    or "no text in response"
                )
                note = f"⚠️ [AI មិនបានផ្ដល់ចម្លើយ: {why}]"
                continue

        hint = {
            400: "AI_API_KEY ខុស ឬម៉ូដែល AI_MODEL មិនត្រឹមត្រូវ",
            403: "AI_API_KEY ត្រូវបានបដិសេធ (សូមពិនិត្យ key របស់អ្នក)",
            404: f"ម៉ូដែល «{model}» មិនមាន (សូមកំណត់ AI_MODEL ថ្មីក្នុង .env)",
            429: "អស់កម្រិតប្រើប្រចាំថ្ងៃរបស់ AI (quota) — សូមប្តូរម៉ូដែល ឬសាកថ្ងៃស្អែក",
        }.get(resp.status_code, "")
        note = f"⚠️ [AI Provider ឆ្លើយ Status {resp.status_code}] {hint}"

    # no live answer from any model: keep it real by using the stored lessons
    from_lessons = _answer_from_lessons(
        message, grade_level, subject_key, db, suggested, note=note
    )
    if from_lessons:
        return from_lessons

    err_msg = (
        note
        + "\n\nចម្លើយទូទៅសម្រាប់កម្រិតថ្នាក់នេះ៖\n\n"
        + SAMPLE_RESPONSES.get(subject_key, {}).get(grade_level, "សូមអភ័យទោស សូមសាកល្បងសួរសារជាថ្មី!")
    )
    return err_msg, True, "Offline Fallback Mode", suggested, "built_in"
