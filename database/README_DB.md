# ការរៀបចំប្រព័ន្ធទិន្នន័យ (Database Setup) - Khmer Learning

ឯកសារនេះពន្យល់អំពីរបៀបកំណត់រចនាសម្ព័ន្ធមូលទិន្នន័យ PostgreSQL និង SQLite សម្រាប់ដំណើរការប្រព័ន្ធ Khmer Learning។

---

### ១. ការប្រើប្រាស់ SQLite (លំនាំដើមសម្រាប់ Local Development)
កម្មវិធីត្រូវបានរៀបចំឡើងយ៉ាងងាយស្រួល អាចដំណើរការភ្លាមៗជាមួយ SQLite ដោយស្វ័យប្រវត្តិកាលណាគ្មាន PostgreSQL៖
- ប្រព័ន្ធនឹងបង្កើតឯកសារ `backend/khmer_learning.db` ដោយស្វ័យប្រវត្តិ។
- ទិន្នន័យគំរូ (Seed Data) គ្រប់មុខវិជ្ជា និងគ្រប់ថ្នាក់ (ថ្នាក់ទី ១ ដល់ ទី ៦) នឹងត្រូវបញ្ចូលដោយស្វ័យប្រវត្តិនៅពេល Backend ចាប់ផ្ដើមដំបូង។

---

### ២. ការកំណត់ប្រើប្រាស់ PostgreSQL (សម្រាប់ Production ឬ Database Server)
ប្រសិនបើអ្នកចង់ប្រើ PostgreSQL សូមអនុវត្តតាមជំហានខាងក្រោម៖

#### ជំហានទី ១៖ បង្កើត Database នៅក្នុង PostgreSQL
ចូលទៅកាន់ `psql` ឬ pgAdmin រួចដំណើរការ៖
```sql
CREATE DATABASE khmer_learning_db WITH ENCODING 'UTF8';
```

#### ជំហានទី ២៖ បង្កើតតារាង (Tables Schema)
ដំណើរការឯកសារ SQL តាមរយៈ Terminal (PowerShell):
```powershell
psql -U postgres -d khmer_learning_db -f "database\init.sql"
```

#### ជំហានទី ៣៖ កំណត់អថេរបរិស្ថាន (.env) ក្នុង backend
បើកឯកសារ `backend/.env` និងកែប្រែ៖
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/khmer_learning_db
```

---

### ៣. រចនាសម្ព័ន្ធតារាងទិន្នន័យ (Database Schema Structure)
| ឈ្មោះតារាង (Table) | ការពិពណ៌នា (Description) |
|---|---|
| `users` | គណនីសិស្ស គ្រូបង្រៀន និងអ្នកគ្រប់គ្រង (Role, Grade level) |
| `classes` | ថ្នាក់រៀនដែលគ្រប់គ្រងដោយលោកគ្រូ-អ្នកគ្រូ |
| `enrollments` | ការចុះឈ្មោះសិស្សចូលក្នុងថ្នាក់រៀន |
| `subjects` | មុខវិជ្ជាសិក្សាទាំង ៤ (ភាសាខ្មែរ, គណិត, អង់គ្លេស, សិក្សាសង្គម) តាមថ្នាក់ទី ១-៦ |
| `chapters` | ជំពូកមេរៀនតាមមុខវិជ្ជានីមួយៗ |
| `lessons` | មេរៀនលម្អិត រួមមានខ្លឹមសារ សេចក្តីសង្ខេប |
| `lesson_media` | រូបភាពគំនូរជីវចល និងសំឡេងអាន/ពន្យល់ |
| `quizzes` | កម្រងលំហាត់តេស្តវាស់សមត្ថភាពតាមមេរៀន |
| `questions` | សំណួរលំហាត់ (ពហុជ្រើសរើស, ត្រូវ/ខុស, បំពេញចន្លោះ) |
| `quiz_attempts` | កំណត់ត្រាពិន្ទុ និងលទ្ធផលប្រឡងរបស់សិស្ស |
| `quiz_answers` | ចម្លើយលម្អិតដែលសិស្សបានជ្រើសរើស |
| `lesson_progress` | វឌ្ឍនភាពនៃការរៀនចប់មេរៀននីមួយៗ |
| `tutor_conversations` | ប្រវត្តិការសន្ទនាជាមួយ AI Tutor គ្រូឆ្លាត |
| `tutor_messages` | សារសំណួរនិងចម្លើយជាមួយ AI |
