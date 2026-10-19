import json
import sys
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.models import (
    User, Subject, Chapter, Lesson, LessonMedia, Quiz, Question
)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def seed_database(db: Session):
    # Check if database already has users
    if db.query(User).first():
        print("Database already seeded with Khmer curriculum.")
        return

    print("Seeding Khmer Learning database with primary curriculum...")

    # 1. Users
    users_data = [
        {
            "username": "sothun",
            "password": "password123",
            "full_name": "សុធន់ សុវណ្ណ",
            "email": "sothun@school.edu.kh",
            "role": "student",
            "grade_level": 3,
            "avatar_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
        },
        {
            "username": "bopha",
            "password": "password123",
            "full_name": "បុប្ផា រតនា",
            "email": "bopha@school.edu.kh",
            "role": "student",
            "grade_level": 1,
            "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
        },
        {
            "username": "kru_dara",
            "password": "password123",
            "full_name": "លោកគ្រូ តារា",
            "email": "dara.teacher@school.edu.kh",
            "role": "teacher",
            "grade_level": None,
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        },
        {
            "username": "admin",
            "password": "password123",
            "full_name": "អ្នកគ្រប់គ្រង Khmer Learning",
            "email": "admin@khmerlearning.edu.kh",
            "role": "admin",
            "grade_level": None,
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
        }
    ]

    for u in users_data:
        user = User(
            username=u["username"],
            hashed_password=get_password_hash(u["password"]),
            full_name=u["full_name"],
            email=u["email"],
            role=u["role"],
            grade_level=u["grade_level"],
            avatar_url=u["avatar_url"]
        )
        db.add(user)
    db.commit()

    # 2. Define Subjects across all 6 grades
    SUBJECT_METAS = [
        {
            "code": "khmer",
            "name_km": "ភាសាខ្មែរ",
            "name_en": "Khmer Language",
            "description_km": "រៀនអាន សរសេរ អក្សរសិល្ប៍ និងវេយ្យាករណ៍ភាសាខ្មែរ",
            "icon_name": "BookOpen",
            "color": "blue"
        },
        {
            "code": "math",
            "name_km": "គណិតវិទ្យា",
            "name_en": "Mathematics",
            "description_km": "លេខ វិធីគណនា ធរណីមាត្រ និងដោះស្រាយចំណោទប្រចាំថ្ងៃ",
            "icon_name": "Calculator",
            "color": "emerald"
        },
        {
            "code": "english",
            "name_km": "ភាសាអង់គ្លេស",
            "name_en": "English",
            "description_km": "រៀនសន្ទនា ពាក្យគន្លឹះ និងវេយ្យាករណ៍ភាសាអង់គ្លេសបឋម",
            "icon_name": "Globe",
            "color": "purple"
        },
        {
            "code": "social_studies",
            "name_km": "សិក្សាសង្គម",
            "name_en": "Social Studies",
            "description_km": "ប្រវត្តិសាស្ត្រ ភូមិសាស្ត្រ សីលធម៌ពលរដ្ឋ និងបរិស្ថាន",
            "icon_name": "Compass",
            "color": "amber"
        }
    ]

    # Create subjects for grades 1-6
    created_subjects = {}
    for grade in range(1, 7):
        for meta in SUBJECT_METAS:
            sub = Subject(
                code=meta["code"],
                name_km=meta["name_km"],
                name_en=meta["name_en"],
                description_km=f"{meta['description_km']} សម្រាប់ថ្នាក់ទី {grade}",
                icon_name=meta["icon_name"],
                color=meta["color"],
                grade_level=grade
            )
            db.add(sub)
            db.flush()
            created_subjects[(grade, meta["code"])] = sub

    # 3. Create Sample Rich Lessons & Quizzes for key grades
    # --- Grade 1: Khmer Language (ព្យញ្ជនៈ និងស្រៈ) ---
    sub_k1 = created_subjects[(1, "khmer")]
    chap_k1 = Chapter(
        subject_id=sub_k1.id,
        chapter_number=1,
        title_km="ជំពូកទី ១៖ ព្យញ្ជនៈ និងស្រៈនិស្ស័យ",
        description_km="ស្វែងយល់និងហាត់អានព្យញ្ជនៈខ្មែរ និងការផ្សំស្រៈ",
        order_index=1
    )
    db.add(chap_k1)
    db.flush()

    les_k1 = Lesson(
        chapter_id=chap_k1.id,
        lesson_number=1,
        title_km="មេរៀនទី ១៖ ព្យញ្ជនៈពួក «អ» (ក ខ គ ឃ ង)",
        summary_km="ស្គាល់រូបរាង អូសដៃសរសេរ និងបញ្ចេញសំឡេងព្យញ្ជនៈ ៥ តួដំបូង",
        content_html="""
        <div class="space-y-4">
            <h3 class="text-xl font-bold text-blue-700">សូមស្វាគមន៍មកកាន់ការរៀនអក្សរខ្មែរ!</h3>
            <p>ព្យញ្ជនៈខ្មែរមានទាំងអស់ ៣៣ តួ ចែកចេញជា ២ ពួក គឺ <strong>ពួក «អ»</strong> និង <strong>ពួក «អ៊»</strong>។</p>
            <div class="grid grid-cols-5 gap-3 text-center my-4">
                <div class="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl shadow-sm">
                    <span class="text-4xl font-extrabold text-blue-600">ក</span>
                    <p class="text-sm text-slate-500 mt-1">ក-ក្អែក</p>
                </div>
                <div class="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl shadow-sm">
                    <span class="text-4xl font-extrabold text-blue-600">ខ</span>
                    <p class="text-sm text-slate-500 mt-1">ខ-ខ្លា</p>
                </div>
                <div class="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl shadow-sm">
                    <span class="text-4xl font-extrabold text-blue-600">គ</span>
                    <p class="text-sm text-slate-500 mt-1">គ-គោ</p>
                </div>
                <div class="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl shadow-sm">
                    <span class="text-4xl font-extrabold text-blue-600">ឃ</span>
                    <p class="text-sm text-slate-500 mt-1">ឃ-ឃ្មុំ</p>
                </div>
                <div class="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl shadow-sm">
                    <span class="text-4xl font-extrabold text-blue-600">ង</span>
                    <p class="text-sm text-slate-500 mt-1">ង-ងាវ</p>
                </div>
            </div>
            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                💡 <strong>ចំណាំសំខាន់៖</strong> ព្យញ្ជនៈ «ក» និង «ខ» បញ្ចេញសំឡេងក្នុងពួក «អ» (សំឡេងស្រាល)។
            </div>
        </div>
        """,
        estimated_minutes=10,
        order_index=1
    )
    db.add(les_k1)
    db.flush()

    # Media for les_k1
    db.add(LessonMedia(
        lesson_id=les_k1.id,
        media_type="image",
        url="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
        caption_km="រូបភាពអក្សរ ក ខ គ ឃ ង ជាមួយរូបសត្វតំណាង",
        audio_script_km="ក អើយ ក-ក្អែក, ខ អើយ ខ-ខ្លា, គ អើយ គ-គោ, ឃ អើយ ឃ-ឃ្មុំ, ង អើយ ង-ងាវ។"
    ))

    # Quiz for les_k1
    quiz_k1 = Quiz(
        lesson_id=les_k1.id,
        title_km="តេស្តវាស់សមត្ថភាព៖ ព្យញ្ជនៈ ក ខ គ ឃ ង",
        passing_score=60,
        duration_minutes=10
    )
    db.add(quiz_k1)
    db.flush()

    db.add(Question(
        quiz_id=quiz_k1.id,
        question_type="multiple_choice",
        question_text_km="តើព្យញ្ជនៈដំបូងគេបង្អស់នៃអក្ខរក្រមខ្មែរជាតួអក្សរអ្វី?",
        points=10,
        order_index=1,
        hint_km="តំណាងឲ្យសត្វក្អែក",
        explanation_km="«ក» គឺជាព្យញ្ជនៈដំបូងបង្អស់ក្នុងចំណោមព្យញ្ជនៈទាំង ៣៣ តួនៃភាសាខ្មែរ។",
        options_json=[
            {"id": "A", "text": "អក្សរ ក"},
            {"id": "B", "text": "អក្សរ ខ"},
            {"id": "C", "text": "អក្សរ ច"},
            {"id": "D", "text": "អក្សរ ដ"}
        ],
        correct_answer="A"
    ))

    db.add(Question(
        quiz_id=quiz_k1.id,
        question_type="true_false",
        question_text_km="តើព្យញ្ជនៈខ្មែរទាំងអស់មានចំនួន ៣៣ តួ មែនឬទេ?",
        points=10,
        order_index=2,
        hint_km="រាប់ពី ក ដល់ អ",
        explanation_km="ត្រូវហើយ! ព្យញ្ជនៈភាសាខ្មែរមានចំនួនសរុប ៣៣ តួ។",
        options_json=[
            {"id": "true", "text": "ត្រូវ (ពិតមែន)"},
            {"id": "false", "text": "ខុស (មិនពិតទេ)"}
        ],
        correct_answer="true"
    ))

    db.add(Question(
        quiz_id=quiz_k1.id,
        question_type="fill_blank",
        question_text_km="ចូរបំពេញចន្លោះ៖ «ក ខ គ ... ង»",
        points=10,
        order_index=3,
        hint_km="ឃ-ឃ្មុំ",
        explanation_km="តួអក្សរដែលបាត់គឺ «ឃ» (ក ខ គ ឃ ង)។",
        options_json=[],
        correct_answer="ឃ"
    ))

    # --- Grade 3: Mathematics (វិធីគុណលេខ) ---
    sub_m3 = created_subjects[(3, "math")]
    chap_m3 = Chapter(
        subject_id=sub_m3.id,
        chapter_number=1,
        title_km="ជំពូកទី ១៖ វិធីគុណ និងវិធីចែកលេខ",
        description_km="ការអនុវត្តវិធីគុណលេខពីរខ្ទង់ និងដោះស្រាយចំណោទគណិតវិទ្យា",
        order_index=1
    )
    db.add(chap_m3)
    db.flush()

    les_m3 = Lesson(
        chapter_id=chap_m3.id,
        lesson_number=1,
        title_km="មេរៀនទី ១៖ វិធីគុណលេខមួយខ្ទង់នឹងពីរខ្ទង់",
        summary_km="ស្វែងយល់ពីរបៀបគុណលេខតាមក្បួនតារាង និងការត្រួតពិនិត្យផលគុណ",
        content_html="""
        <div class="space-y-4">
            <h3 class="text-xl font-bold text-emerald-700">តើវិធីគុណជាអ្វី?</h3>
            <p>វិធីគុណ គឺជាការបូកចំនួនដដែលៗច្រើនដងយ៉ាងលឿន។</p>
            <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-2xl">
                <p class="font-bold text-emerald-900">ឧទាហរណ៍ជាក់ស្តែង៖</p>
                <p>សិស្ស ៣ នាក់ ក្នុងម្នាក់ៗមានសៀវភៅ ៤ ក្បាល។</p>
                <p class="text-lg font-bold text-emerald-700 mt-1">៤ + ៤ + ៤ = ៤ x ៣ = ១២ ក្បាល</p>
            </div>
            <h4 class="text-lg font-bold text-slate-800 mt-4">របៀបគុណលេខពីរខ្ទង់៖ ២៣ x ៣</h4>
            <ol class="list-decimal list-inside space-y-2 text-slate-700">
                <li>គុណខ្ទង់រាយ៖ ៣ x ៣ = ៩ (សរសេរលេខ ៩ នៅខ្ទង់រាយ)</li>
                <li>គុណខ្ទង់ដប់៖ ៣ x ២ = ៦ (សរសេរលេខ ៦ នៅខ្ទង់ដប់)</li>
                <li>លទ្ធផលផលគុណគឺ៖ <strong>៦៩</strong></li>
            </ol>
        </div>
        """,
        estimated_minutes=15,
        order_index=1
    )
    db.add(les_m3)
    db.flush()

    db.add(LessonMedia(
        lesson_id=les_m3.id,
        media_type="image",
        url="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80",
        caption_km="ឧទាហរណ៍រូបភាពក្រុមវត្ថុសម្រាប់វិធីគុណ",
        audio_script_km="វិធីគុណគឺជាវិធីបូកលេខដដែលៗ។ ឧទាហរណ៍ ២៣ គុណនឹង ៣ ស្មើនឹង ៦៩។"
    ))

    # Quiz for Math Grade 3
    quiz_m3 = Quiz(
        lesson_id=les_m3.id,
        title_km="តេស្តវាស់សមត្ថភាព៖ វិធីគុណលេខ",
        passing_score=60,
        duration_minutes=15
    )
    db.add(quiz_m3)
    db.flush()

    db.add(Question(
        quiz_id=quiz_m3.id,
        question_type="multiple_choice",
        question_text_km="តើ ៥ x ៦ ស្មើនឹងប៉ុន្មាន?",
        points=10,
        order_index=1,
        hint_km="មេលេខ ៥ ឬ មេលេខ ៦",
        explanation_km="៥ x ៦ = ៣០ (ប្រាំប្រាំមួយដងស្មើនឹងសាមសិប)។",
        options_json=[
            {"id": "A", "text": "២៥"},
            {"id": "B", "text": "៣០"},
            {"id": "C", "text": "៣៥"},
            {"id": "D", "text": "៤០"}
        ],
        correct_answer="B"
    ))

    db.add(Question(
        quiz_id=quiz_m3.id,
        question_type="multiple_choice",
        question_text_km="គណនា៖ ២៤ x ២ = ?",
        points=10,
        order_index=2,
        hint_km="គុណខ្ទង់រាយ ៤x២=៨, គុណខ្ទង់ដប់ ២x២=៤",
        explanation_km="២៤ x ២ = ៤៨។",
        options_json=[
            {"id": "A", "text": "៤៦"},
            {"id": "B", "text": "៤៨"},
            {"id": "C", "text": "៥០"},
            {"id": "D", "text": "៥៤"}
        ],
        correct_answer="B"
    ))

    db.add(Question(
        quiz_id=quiz_m3.id,
        question_type="true_false",
        question_text_km="តើ ០ គុណនឹងចំនួនណាក៏ដោយ តែងតែស្មើនឹង ០ ដែរ មែនឬទេ?",
        points=10,
        order_index=3,
        hint_km="ឧទាហរណ៍ ០ x ៩ = ០",
        explanation_km="ត្រូវហើយ! ចំនួនណាក៏ដោយគុណនឹងសូន្យ គឺស្មើនឹងសូន្យជានិច្ច។",
        options_json=[
            {"id": "true", "text": "ត្រូវ (ពិតមែន)"},
            {"id": "false", "text": "ខុស (មិនពិតទេ)"}
        ],
        correct_answer="true"
    ))

    # --- Grade 3: English (Greetings & School Life) ---
    sub_e3 = created_subjects[(3, "english")]
    chap_e3 = Chapter(
        subject_id=sub_e3.id,
        chapter_number=1,
        title_km="ជំពូកទី ១៖ ការសន្ទនា និងការស្វាគមន៍ (Greetings)",
        description_km="រៀនពាក្យស្វាគមន៍ ការណែនាំខ្លួនជាភាសាអង់គ្លេស",
        order_index=1
    )
    db.add(chap_e3)
    db.flush()

    les_e3 = Lesson(
        chapter_id=chap_e3.id,
        lesson_number=1,
        title_km="Lesson 1: Greetings and Introduction (ការស្វាគមន៍)",
        summary_km="រៀនពាក្យ Good morning, Good afternoon, My name is... ជាមួយសំឡេងអាន",
        content_html="""
        <div class="space-y-4">
            <h3 class="text-xl font-bold text-purple-700">Daily Greetings (ការស្វាគមន៍ប្រចាំថ្ងៃ)</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p class="font-bold text-purple-900">Good morning</p>
                    <p class="text-sm text-slate-600">អរុណសួស្តី (ពេលព្រឹក)</p>
                </div>
                <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p class="font-bold text-purple-900">Good afternoon</p>
                    <p class="text-sm text-slate-600">ទិវាសួស្តី (ពេលរសៀល)</p>
                </div>
                <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p class="font-bold text-purple-900">How are you?</p>
                    <p class="text-sm text-slate-600">តើអ្នកសុខសប្បាយជាទេ?</p>
                </div>
                <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p class="font-bold text-purple-900">I am fine, thank you!</p>
                    <p class="text-sm text-slate-600">ខ្ញុំសុខសប្បាយទេ អរគុណ!</p>
                </div>
            </div>
            <div class="mt-4 p-4 bg-slate-100 rounded-xl">
                <h4 class="font-bold text-slate-800">Sentence Practice (លំហាត់ល្បះ)</h4>
                <p class="text-purple-800 font-semibold mt-1">"Hello! My name is Dara. I am 8 years old."</p>
                <p class="text-sm text-slate-600">សួស្តី! ខ្ញុំឈ្មោះតារា។ ខ្ញុំមានអាយុ ៨ ឆ្នាំ។</p>
            </div>
        </div>
        """,
        estimated_minutes=12,
        order_index=1
    )
    db.add(les_e3)
    db.flush()

    db.add(LessonMedia(
        lesson_id=les_e3.id,
        media_type="audio",
        url="https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg",
        caption_km="សំឡេងអានប្រយោគ Good morning និង How are you?",
        audio_script_km="Good morning! How are you today? I am fine, thank you."
    ))

    quiz_e3 = Quiz(
        lesson_id=les_e3.id,
        title_km="English Quiz: Greetings",
        passing_score=60,
        duration_minutes=10
    )
    db.add(quiz_e3)
    db.flush()

    db.add(Question(
        quiz_id=quiz_e3.id,
        question_type="multiple_choice",
        question_text_km="តើពាក្យ «Good morning» មានន័យដូចម្តេចជាភាសាខ្មែរ?",
        points=10,
        order_index=1,
        hint_km="ប្រើសម្រាប់ស្វាគមន៍ពេលព្រឹក",
        explanation_km="Good morning ប្រែថា «អរុណសួស្តី» ឬ សួស្តីពេលព្រឹក។",
        options_json=[
            {"id": "A", "text": "អរុណសួស្តី (ពេលព្រឹក)"},
            {"id": "B", "text": "ទិវាសួស្តី (ពេលរសៀល)"},
            {"id": "C", "text": "រាត្រីសួស្តី (ពេលយប់)"},
            {"id": "D", "text": "លាហើយ"}
        ],
        correct_answer="A"
    ))

    db.add(Question(
        quiz_id=quiz_e3.id,
        question_type="fill_blank",
        question_text_km="Complete the phrase: «Thank ...» (អរគុណ)",
        points=10,
        order_index=2,
        hint_km="you",
        explanation_km="The correct phrase is «Thank you».",
        options_json=[],
        correct_answer="you"
    ))

    # --- Grade 3: Social Studies (សិក្សាសង្គម) ---
    sub_s3 = created_subjects[(3, "social_studies")]
    chap_s3 = Chapter(
        subject_id=sub_s3.id,
        chapter_number=1,
        title_km="ជំពូកទី ១៖ បរិស្ថាន និងធនធានធម្មជាតិកម្ពុជា",
        description_km="ការយល់ដឹងអំពីបរិស្ថាន ដើមឈើ និងការថែរក្សាអនាម័យសាលារៀន",
        order_index=1
    )
    db.add(chap_s3)
    db.flush()

    les_s3 = Lesson(
        chapter_id=chap_s3.id,
        lesson_number=1,
        title_km="មេរៀនទី ១៖ សារៈសំខាន់នៃដើមឈើ និងខ្យល់បរិសុទ្ធ",
        summary_km="ស្វែងយល់អំពីអត្ថប្រយោជន៍នៃរុក្ខជាតិក្នុងការស្រូបយកឧស្ម័នកាបូនិច និងបញ្ចេញអុកស៊ីសែន",
        content_html="""
        <div class="space-y-4">
            <h3 class="text-xl font-bold text-amber-700">ហេតុអ្វីបានជាដើមឈើមានសារៈសំខាន់?</h3>
            <p>ដើមឈើជាមិត្តដ៏ល្អបំផុតរបស់មនុស្សលោក និងសត្វលោកទាំងឡាយនៅលើផែនដី។</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
                <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <span class="text-2xl">🌳</span>
                    <h5 class="font-bold text-amber-900 mt-1">ផ្តល់ខ្យល់ដកដង្ហើម</h5>
                    <p class="text-sm text-slate-600">ដើមឈើស្រូបយកឧស្ម័នកាបូនិច និងបញ្ចេញអុកស៊ីសែន។</p>
                </div>
                <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <span class="text-2xl">🌦️</span>
                    <h5 class="font-bold text-amber-900 mt-1">ផ្តល់ម្លប់ និងភាពត្រជាក់</h5>
                    <p class="text-sm text-slate-600">ជួយកាត់បន្ថយកម្តៅ និងការពារដីពីការបាក់ស្រុត។</p>
                </div>
                <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <span class="text-2xl">🍎</span>
                    <h5 class="font-bold text-amber-900 mt-1">ផ្តល់ផ្លែផ្កា និងជម្រក</h5>
                    <p class="text-sm text-slate-600">ផ្តល់ចំណីអាហារដល់មនុស្ស និងជាជម្រកសត្វស្លាប។</p>
                </div>
            </div>
            <p class="font-medium text-slate-700">ដូច្នេះ យើងទាំងអស់គ្នាត្រូវចូលរួមដាំដើមឈើ និងមិនត្រូវកាប់បំផ្លាញព្រៃឈើឡើយ!</p>
        </div>
        """,
        estimated_minutes=15,
        order_index=1
    )
    db.add(les_s3)
    db.flush()

    db.add(LessonMedia(
        lesson_id=les_s3.id,
        media_type="image",
        url="https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80",
        caption_km="ព្រៃឈើធម្មជាតិដ៏ស្រស់បំព្រងក្នុងប្រទេសកម្ពុជា",
        audio_script_km="ដើមឈើផ្តល់អុកស៊ីសែន ម្លប់ត្រជាក់ និងការពារដីកុំឲ្យបាក់ស្រុត។ ចូរប្អូនៗរួមគ្នាថែរក្សាដើមឈើ!"
    ))

    quiz_s3 = Quiz(
        lesson_id=les_s3.id,
        title_km="តេស្តវាស់សមត្ថភាព៖ បរិស្ថាន និងដើមឈើ",
        passing_score=60,
        duration_minutes=10
    )
    db.add(quiz_s3)
    db.flush()

    db.add(Question(
        quiz_id=quiz_s3.id,
        question_type="multiple_choice",
        question_text_km="តើដើមឈើបញ្ចេញឧស្ម័នអ្វីសម្រាប់ឲ្យមនុស្ស និងសត្វដកដង្ហើម?",
        points=10,
        order_index=1,
        hint_km="ឧស្ម័នចាំបាច់សម្រាប់ជីវិត",
        explanation_km="ដើមឈើបញ្ចេញឧស្ម័នអុកស៊ីសែន (Oxygen) តាមរយៈរស្មីសំយោគ។",
        options_json=[
            {"id": "A", "text": "ឧស្ម័នអុកស៊ីសែន (Oxygen)"},
            {"id": "B", "text": "ឧស្ម័នកាបូនិច (Carbon Dioxide)"},
            {"id": "C", "text": "ផ្សែងពុល"},
            {"id": "D", "text": "ឧស្ម័នមេតាន"}
        ],
        correct_answer="A"
    ))

    db.add(Question(
        quiz_id=quiz_s3.id,
        question_type="true_false",
        question_text_km="ការកាប់បំផ្លាញព្រៃឈើបណ្តាលឲ្យកើតមានគ្រោះរាំងស្ងួត និងការប្រែប្រួលអាកាសធាតុ មែនឬទេ?",
        points=10,
        order_index=2,
        hint_km="ការបាត់បង់ព្រៃឈើធ្វើឲ្យក្តៅ",
        explanation_km="ពិតមែនហើយ ការកាប់បំផ្លាញព្រៃឈើធ្វើឲ្យបាត់បង់តុល្យភាពធម្មជាតិ និងបង្កជាគ្រោះធម្មជាតិ។",
        options_json=[
            {"id": "true", "text": "ត្រូវ (ពិតមែន)"},
            {"id": "false", "text": "ខុស (មិនពិតទេ)"}
        ],
        correct_answer="true"
    ))

    # Ensure every single subject in grades 1 through 6 has at least one chapter, lesson, and quiz
    for g in range(1, 7):
        for meta in SUBJECT_METAS:
            s_obj = created_subjects[(g, meta["code"])]
            existing_chaps = db.query(Chapter).filter(Chapter.subject_id == s_obj.id).all()
            if not existing_chaps:
                chap = Chapter(
                    subject_id=s_obj.id,
                    chapter_number=1,
                    title_km=f"ជំពូកទី ១៖ មូលដ្ឋានគ្រឹះ{meta['name_km']} ថ្នាក់ទី {g}",
                    description_km=f"មេរៀន និងលំហាត់អនុវត្ត{meta['name_km']} សម្រាប់សិស្សថ្នាក់ទី {g}",
                    order_index=1
                )
                db.add(chap)
                db.flush()

                color_text = "blue" if meta["code"] == "khmer" else "emerald" if meta["code"] == "math" else "purple" if meta["code"] == "english" else "amber"
                les = Lesson(
                    chapter_id=chap.id,
                    lesson_number=1,
                    title_km=f"មេរៀនទី ១៖ ចំណេះដឹង{meta['name_km']}សំខាន់ៗ ថ្នាក់ទី {g}",
                    summary_km=f"សេចក្តីសង្ខេបមេរៀន{meta['name_km']} ថ្នាក់ទី {g} តាមស្តង់ដារកម្មវិធីសិក្សាជាតិ",
                    content_html=f"""
                    <div class="space-y-4">
                        <h3 class="text-xl font-bold text-{color_text}-700">ស្វាគមន៍ការរៀន {meta['name_km']} ថ្នាក់ទី {g}!</h3>
                        <p>នៅក្នុងកម្រិតថ្នាក់ទី {g} នេះ ប្អូនៗនឹងបានរៀនអំពីចំណេះដឹងគន្លឹះ និងការអនុវត្តជាក់ស្តែងនៃមុខវិជ្ជា {meta['name_km']}។</p>
                        <div class="p-4 bg-{color_text}-50 rounded-2xl border border-{color_text}-200">
                            <p class="font-bold text-{color_text}-900">ចំណុចសំខាន់សម្រាប់ថ្នាក់ទី {g}៖</p>
                            <ul class="list-disc list-inside mt-2 text-slate-700 space-y-1">
                                <li>យកចិត្តទុកដាក់ស្តាប់ការពន្យល់របស់លោកគ្រូ-អ្នកគ្រូ</li>
                                <li>ហាត់អនុវត្តលំហាត់ និងកត់ត្រាខ្លឹមសារសំខាន់ៗ</li>
                                <li>សាកល្បងធ្វើតេស្តវាស់សមត្ថភាពដើម្បីពង្រឹងការចងចាំ</li>
                            </ul>
                        </div>
                    </div>
                    """,
                    estimated_minutes=15,
                    order_index=1
                )
                db.add(les)
                db.flush()

                # Add media
                db.add(LessonMedia(
                    lesson_id=les.id,
                    media_type="image",
                    url="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
                    caption_km=f"រូបភាពគំនូរជីវចលសម្រាប់មេរៀន {meta['name_km']} ថ្នាក់ទី {g}",
                    audio_script_km=f"ស្វាគមន៍ការរៀន {meta['name_km']} ថ្នាក់ទី {g}។ សូមប្អូនៗយកចិត្តទុកដាក់រៀនសូត្រ!"
                ))

                # Add quiz
                qz = Quiz(
                    lesson_id=les.id,
                    title_km=f"តេស្តសមត្ថភាព៖ {meta['name_km']} ថ្នាក់ទី {g}",
                    passing_score=60,
                    duration_minutes=15
                )
                db.add(qz)
                db.flush()

                db.add(Question(
                    quiz_id=qz.id,
                    question_type="multiple_choice",
                    question_text_km=f"តើការរៀនមុខវិជ្ជា {meta['name_km']} ជួយដល់ការអភិវឌ្ឍចំណេះដឹងយ៉ាងដូចម្តេច?",
                    points=10,
                    order_index=1,
                    hint_km="ជួយឲ្យមានចំណេះដឹងទូលំទូលាយ",
                    explanation_km=f"ការរៀន {meta['name_km']} ជួយពង្រីកការយល់ដឹង និងបណ្តុះបំណិនជីវិត។",
                    options_json=[
                        {"id": "A", "text": "ជួយពង្រីកការយល់ដឹង និងបណ្តុះបំណិនជីវិត"},
                        {"id": "B", "text": "គ្មានប្រយោជន៍អ្វីទេ"},
                        {"id": "C", "text": "ធ្វើឲ្យធុញទ្រាន់"},
                        {"id": "D", "text": "មិនជួយអ្វីទាំងអស់"}
                    ],
                    correct_answer="A"
                ))

                db.add(Question(
                    quiz_id=qz.id,
                    question_type="true_false",
                    question_text_km="ការអនុវត្តលំហាត់ញឹកញាប់ជួយឲ្យចងចាំមេរៀនបានល្អប្រសើរ មែនឬទេ?",
                    points=10,
                    order_index=2,
                    hint_km="ការខិតខំតែងតែផ្តល់លទ្ធផលល្អ",
                    explanation_km="ពិតប្រាកដណាស់ ការអនុវត្តលំហាត់ធ្វើឲ្យយើងយល់មេរៀនកាន់តែច្បាស់។",
                    options_json=[
                        {"id": "true", "text": "ត្រូវ (ពិតមែន)"},
                        {"id": "false", "text": "ខុស (មិនពិតទេ)"}
                    ],
                    correct_answer="true"
                ))

    db.commit()
    print("Seeding completed successfully!")

if __name__ == "__main__":
    from app.core.database import SessionLocal, Base, engine
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
