# ទម្រង់ឯកសារមេរៀន (Curriculum JSON schema)

ឯកសារ៖ `backend/app/seeds/curriculum/<subject_code>_g<grade>.json`
ឧទាហរណ៍ឈ្មោះ៖ `khmer_g3.json`, `math_g1.json`, `english_g5.json`, `social_studies_g6.json`

`subject_code` មាន ៤ ប៉ុណ្ណោះ៖ `khmer` (ភាសាខ្មែរ), `math` (គណិតវិទ្យា), `english` (ភាសាអង់គ្លេស), `social_studies` (សិក្សាសង្គម)។
`grade` ពី 1 ដល់ 6។

## រចនាសម្ព័ន្ធ

```json
{
  "subject": "math",
  "grade": 1,
  "chapters": [
    {
      "title_km": "ការបូក និងការដកលេខពី ១ ដល់ ២០",
      "description_km": "រៀនបូកដកលេខតូចៗដោយប្រើម្រាមដៃ និងវត្ថុជុំវិញខ្លួន",
      "lessons": [
        {
          "title_km": "រាប់លេខពី ១ ដល់ ២០",
          "summary_km": "សិស្សរាប់ និងសរសេរលេខពី ១ ដល់ ២០ បានត្រឹមត្រូវ",
          "content_html": "<h3>១. ការរាប់លេខ</h3><p>លេខពី ១ ដល់ ២០ យើងអាចរាប់ដោយប្រើម្រាមដៃ...</p><h3>២. ឧទាហរណ៍</h3><ul><li>១ ២ ៣ ៤ ៥</li><li>៦ ៧ ៨ ៩ ១០</li></ul><h3>៣. សង្ខេប</h3><p>លេខពី ១ ដល់ ២០ មាន ២០ តួ។ យើងត្រូវរាប់ឲ្យបានញឹកញាប់។</p>",
          "estimated_minutes": 15,
          "questions": [
            {
              "type": "multiple_choice",
              "text_km": "លេខបន្ទាប់ពី ៩ គឺលេខអ្វី?",
              "options": [
                {"id": "A", "text": "៨"},
                {"id": "B", "text": "១០"},
                {"id": "C", "text": "១១"},
                {"id": "D", "text": "៧"}
              ],
              "correct": "B",
              "explanation_km": "លេខបន្ទាប់ពី ៩ គឺ ១០ ព្រោះយើងរាប់ជាលំដាប់ ៨, ៩, ១០។",
              "hint_km": "រាប់ម្រាមដៃទាំងសងខាង"
            },
            {
              "type": "true_false",
              "text_km": "លេខ ២០ ធំជាងលេខ ១៥",
              "correct": "true",
              "explanation_km": "២០ សិទ្យពីរខ្ទង់ធំជាង ១៥"
            },
            {
              "type": "fill_blank",
              "text_km": "បំពេញលេខបាត់៖ ៧, ៨, __, ១០",
              "correct": "៩",
              "explanation_km": "ចន្លោះ ៧,៨ រួច ៩ បន្ទាប់មក ១០"
            }
          ]
        }
      ]
    }
  ]
}
```

## ច។បាប់ត្រូវអនុវត្ត

1. វាលចាំបាច់៖ `subject`, `grade`, `chapters[].title_km`, `chapters[].lessons[].title_km`,
   `lessons[].content_html`, `questions[].text_km`, `questions[].correct`។
2. `content_html` ជាអក្សរខ្មែរ 100% (លើកលែងតែមុខវិជ្ជា អង់គ្លេស) ប្រើតែ `<h3> <p> <ul> <li> <ol> <strong> <em> <table> <thead> <tbody> <tr> <td> <blockquote>`។
   ត្រូវមានយ៉ាងតិច ៣ ផ្នែក៖ មាតិកា/ពន្យល់, ឧទាហរណ៍ជាក់ស្ដែង, សង្ខេប ឬលំហាត់។
3. ប្រើខ្ទង់លេខខ្មែរ (០-៩) សម្រាប់មេរ្ួនខ្មែរ សិក្សាសង្គម និងគណិត (កុំប្រើ 0-9 ឡាតាំង)។
4. ប្រភេទសំណួរបាន ៣ ប៉ុណ្ណោះ៖
   - `multiple_choice` ត្រូវមាន `options` ៤ (id A,B,C,D) និង `correct` ជា id (ឧ. "B")។
   - `true_false` គ្មាន `options` ទេ, `correct` ជា `"true"` ឬ `"false"`។
   - `fill_blank` គ្មាន `options`, `correct` ជាពាក្យ/លេខពិតប្រាកដ (សរសេរជាខ្មែរ)។
5. រាល់មេរ្ួនត្រូវមានសំណួរ ៤ ឬ ៥ ហើយបន្សំប្រភេទទាំង ៣ ប្រសិនបើអាច។
6. `explanation_km` ត្រូវមានជានិច្ច (ក្មេងអានយល់)។
7. 10 មេរ្ួនក្នុងមួយឯកសារ បែងជា ២ ឬ ៣ chapters។
8. ឯកសារត្រូវជា UTF-8 ត្រឹមត្រូវ ហើយ `json.load` មិនប៉ះពាល់ (គ្មាន trailing comma)។
