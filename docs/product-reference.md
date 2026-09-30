# PRD ECC Future Quest
SIAP IMPACT 2026

Versi 0.2 • 12 September 2026 • Rancangan V1 untuk pembahasan ECC dan tim pengembang

Website menjadi tempat peserta menjalankan journey bootcamp, mengumpulkan tugas, menerima feedback, dan melihat hasil seleksi. Dokumen ini menyatukan kebutuhan produk dan rancangan data agar ECC serta dua developer mempunyai acuan yang sama sebelum implementasi.

## 1 Problem dan Solution

### 1.1 Masalah yang ingin diselesaikan

Pengumpulan tugas melalui form dan kanal terpisah membuat peserta sulit melihat apa yang harus dikerjakan berikutnya. Mentor perlu mencocokkan identitas, bukti, dan nilai secara manual. Panitia membutuhkan rekap yang dapat ditelusuri untuk menyeleksi peserta secara bertahap.

ECC juga ingin bootcamp terasa lebih menarik daripada rangkaian Zoom dan pengumpulan tugas biasa. Gamifikasi perlu mendorong aksi nyata dan kualitas bukti; jumlah klik atau XP saja belum menunjukkan kualitas peserta.

| Masalah | Solusi V1 | Manfaat yang dituju |
| --- | --- | --- |
| Instruksi dan progres tersebar | Dashboard journey, tugas, tenggat, dan status dalam satu akun. | Peserta mengetahui langkah berikutnya. |
| Pengumpulan tugas bergantung bantuan panitia | Draft tersimpan, upload bukti, validasi, dan tanda terima. | Peserta dapat submit mandiri. |
| Review dan rekap mentor dilakukan terpisah | Antrean tugas, rubrik, feedback, serta riwayat versi. | Mentor mudah memeriksa bukti dan nilai. |
| Keputusan seleksi sulit ditelusuri | Rekap skor, validasi kuota, keputusan admin, dan audit. | Panitia dapat menjelaskan hasil seleksi. |
| Partisipasi mudah menurun | Progres visual dan XP dari aktivitas terverifikasi. | Peserta terdorong menyelesaikan misi. |

### 1.2 Pengguna dan tanggung jawab

Peserta mengerjakan kuis dan misi. Mentor ECC memeriksa bukti serta memberi nilai. Admin ECC menyiapkan program, akun, mentor, dan publikasi hasil. Tim pengembang membangun serta mendukung sistem; isi program dan keputusan kelulusan tetap milik ECC.

### 1.3 Batas dan asumsi dasar

Pendaftaran, asesmen, serta seleksi awal berlangsung di luar website. V1 menerima sekitar 100 peserta terpilih, satu event, dan tiga jalur: Profesional, Social Impact, serta Bisnis. Akun diasumsikan disiapkan ECC. Tiga finalis per jalur masih merupakan asumsi; total akhir sembilan peserta. Peluang hiring dan talent pool adalah hasil program, belum menjadi modul V1.

## 2 Alur Aplikasi

### 2.1 Struktur journey

| Tahap | Tanggal sesi | Kegiatan rancangan client | Seleksi |
| --- | --- | --- | --- |
| Onboarding | Sebelum 15 Okt | Aktivasi akun, profil awal, pilihan jalur. | 100 peserta terpilih |
| Tahap 1 | 15 Okt 2026 | Discover and Empathize; observasi atau wawancara serta insight masalah. | 100 → 50 |
| Tahap 2 | 22 Okt 2026 | Define, Ideate and Prototype; prototipe, feedback pengguna, perbaikan. | 50 → 25 |
| Tahap 3 | 29 Okt 2026 | Test, Refine and Pitch; pengujian dan pitch deck. | 25 → 9 |
| Final | 5 Nov 2026 | Pitching offline di Jakarta. | 9 finalis |

Jadwal sesi mengikuti slide client. Jam tenggat dan pengumuman perlu ditetapkan ECC; zona waktu usulan Asia/Jakarta. Catatan awal menyebut Level 1–4, sedangkan slide berisi tiga minggu bootcamp dan final. Baseline V1 memakai tiga tahap tugas dan satu milestone final; penamaan level dapat disesuaikan setelah disepakati.

### 2.2 Alur peserta

1. Peserta menerima undangan akun dari ECC, mengaktifkan akses, lalu login. Sistem menampilkan pesan pemulihan jika undangan kedaluwarsa atau akun belum siap.

2. Peserta melengkapi Future Base ringkas dan memilih satu jalur jika ECC belum menetapkannya. Usulan: pilihan dikunci setelah konfirmasi; perubahan berikutnya hanya melalui admin dengan alasan. Pemilihan oleh peserta atau penetapan oleh ECC masih perlu diputuskan.

3. Dashboard menampilkan tahap aktif, tugas berikutnya, tenggat, progres, XP, dan tautan materi atau Zoom. Tahap yang belum terbuka memperlihatkan alasan terkunci.

4. Peserta membaca materi dan mengerjakan kuis. Server memeriksa jawaban; batas percobaan dan syarat kelulusan mengikuti konfigurasi ECC. Kuis hanya mengunci misi bila aturan tersebut diaktifkan.

5. Peserta mengerjakan misi di luar Zoom, menulis ringkasan/refleksi, mengunggah bukti atau menambahkan tautan, kemudian menyimpan draft. Saat submit, sistem memeriksa kelengkapan serta tenggat dan menampilkan nomor submission serta waktu kirim.

6. Peserta melihat status review dan feedback yang sudah dirilis. Jika mentor meminta revisi, peserta mengirim versi baru dalam tenggat revisi. Bukti dan penilaian versi sebelumnya tetap tercatat.

7. Setelah admin menerbitkan hasil, peserta yang lolos mendapat akses tahap berikutnya saat jadwalnya dibuka. Peserta gugur diasumsikan tetap dapat membaca materi dan hasil yang sebelumnya berhak diakses; tidak mengirim tugas baru. Finalis melihat informasi pitching.

### 2.3 Alur mentor dan admin

Mentor login dan melihat antrean peserta yang ditugaskan kepadanya. Mentor membuka versi tugas terkirim, memeriksa bukti, mengisi rubrik serta feedback, lalu menyimpan draft atau menyelesaikan review. Permintaan revisi wajib menyertakan alasan dan tenggat. Usulan V1: satu mentor aktif per peserta per tahap.

Admin menyiapkan event, tiga jalur, tahap, quest, rubrik, dan kuota. Admin mengimpor daftar peserta, menangani undangan gagal, dan menetapkan mentor. Menjelang seleksi, admin memeriksa tugas yang belum dinilai serta input yang belum lengkap, lalu menghasilkan draft rekap.

Rekap tidak langsung menjadi keputusan. Admin memeriksa skor, kuota, dan nilai seri, mencatat keputusan yang berbeda dari urutan skor dengan alasan sesuai otoritas ECC, lalu menerbitkan hasil. Publikasi memperbarui hasil peserta, status kelulusan, dan akses tahap dalam satu transaksi.

### 2.4 Status dan kondisi khusus

| Objek | Status atau kejadian | Perilaku aplikasi |
| --- | --- | --- |
| Tugas | draft → submitted → in_review → reviewed | Draft dapat diubah; versi terkirim dibekukan. |
| Revisi | changes_requested → draft baru → submitted | Versi baru tidak menimpa bukti lama. |
| File | pending → ready atau rejected | Submit ditolak jika lampiran wajib belum ready. |
| Seleksi | draft → ready → published | Data belum lengkap atau seri belum selesai memblokir publikasi. |
| Koneksi terputus | Upload atau submit diulang | Retry melanjutkan proses tanpa menggandakan kiriman atau XP. |
| Dua tab | Draft lama mencoba menimpa versi baru | Tolak konflik versi dan minta peserta memuat data terbaru. |
| Tenggat lewat | Peserta belum mengirim | Tampilkan tugas belum lengkap; tidak otomatis menyatakan gugur. |
| Nilai berubah | Rekap sudah dibuat | Rekap ditandai kedaluwarsa; hitung ulang sebelum publish. |

### 2.5 Bedakan progres XP dan skor seleksi

Progres menggambarkan pekerjaan yang telah selesai. XP memberi umpan balik atas aktivitas yang diverifikasi sistem. Skor seleksi berasal dari rubrik dan aturan ECC. Ketiganya ditampilkan sebagai ukuran berbeda; XP tidak otomatis menentukan kelulusan.

Slide mengusulkan bobot kuis 10, penyelesaian 40, kualitas bukti 30, serta dukungan rekan 20. Prototipe memiliki rancangan komponen berbeda. Bobot, agregasi nilai antartahap, batas percobaan, aturan seri, dan kuota per jalur belum boleh dianggap final. Jika kontribusi rekan wajib dinilai sementara modul sosial ditunda, ECC perlu menyetujui input manual mentor dengan bukti atau memasukkan fitur sosial ke V1.

## 3 Database Schema

Rancangan berikut adalah schema logis untuk PostgreSQL. Kolom inti, tipe data, dan constraint menjadi acuan implementasi; belum merupakan migration SQL siap dijalankan. Rekomendasi stack tetap mengikuti PRD teknis sebelumnya: Next.js, TypeScript, Supabase, dan hosting yang disepakati tim.

Konvensi: PK = primary key; FK = foreign key; UQ = unique. Setiap tabel memakai id UUID PK kecuali PK lain disebut eksplisit. Semua rekaman mempunyai created_at timestamptz; rekaman yang dapat diubah juga updated_at. Tanda ? berarti nullable. Status adalah text dengan CHECK atau enum. Waktu disimpan sebagai timestamptz dan ditampilkan menurut zona event.

### 3.1 Akun program dan akses

| Tabel | Kolom inti dan tipe | Constraint atau aturan |
| --- | --- | --- |
| profiles | id UUID PK/FK auth.users; name text; role text; account_status text; city text? | Role: participant, mentor, admin. Status: enabled, disabled. Password dikelola Auth. |
| events | code text; title text; timezone text; starts_at timestamptz; ends_at timestamptz; features jsonb | UQ(code). Satu event aktif dikelola UI V1. |
| paths | event_id UUID FK; code text; title text; description text | UQ(event_id, code). Tiga jalur event. |
| stages | event_id UUID FK; ordinal smallint; title text; quota_total int; opens_at, due_at, review_due_at, announcement_at timestamptz | UQ(event_id, ordinal); quota_total ≥ 0; jadwal harus valid. |
| enrollments | event_id, profile_id UUID FK; path_id UUID FK?; status text; activated_at timestamptz?; path_locked_at timestamptz? | UQ(event_id, profile_id). path_id boleh kosong selama onboarding. |
| stage_access | enrollment_id, stage_id UUID FK; eligibility text; decided_by_run_id UUID FK? | Composite PK(enrollment_id, stage_id). eligible, locked, read_only. |
| future_bases | enrollment_id UUID FK; direction text; target_90d text; skills jsonb; support text; version int | UQ(enrollment_id). version untuk mencegah draft saling menimpa. |
| mentor_assignments | mentor_id, enrollment_id, stage_id UUID FK; active boolean | Hanya satu assignment aktif per peserta/tahap pada baseline V1. |

Status enrollment: invited, active, eliminated, finalist, withdrawn. Akun enabled dengan enrollment eliminated masih dapat mengakses informasi read-only sesuai stage_access. Hanya enrollment active dengan jalur terpilih, stage eligible, dan waktu yang sesuai dapat mengirim pekerjaan baru.

Lokasi cukup kota/kabupaten yang diisi peserta; tidak menyimpan koordinat presisi. Tampilan direktori antarpeserta ditunda sampai scope sosial dan data yang boleh terlihat disepakati.

### 3.2 Quest kiriman dan bukti

| Tabel | Kolom inti dan tipe | Constraint atau aturan |
| --- | --- | --- |
| quests | path_id, stage_id UUID FK; code text; kind text; required boolean | kind: quiz atau mission. UQ(path_id, stage_id, code). |
| quest_versions | quest_id UUID FK; number int; title text; payload jsonb; published_at timestamptz? | UQ(quest_id, number). Versi published tidak diedit. |
| private.quiz_keys | quest_version_id UUID PK/FK; answers jsonb | Schema privat; tidak dikirim ke browser peserta. |
| quiz_attempts | enrollment_id, quest_version_id UUID FK; attempt_no int; answers jsonb; score numeric?; status text; submitted_at timestamptz? | UQ(enrollment_id, quest_version_id, attempt_no). Batas attempt berlaku per quest, termasuk pergantian versi. |
| submissions | enrollment_id, quest_id UUID FK; current_version_id UUID FK?; workflow_status text; row_version int | UQ(enrollment_id, quest_id). Satu akar submission sepanjang revisi. |
| submission_versions | submission_id, quest_version_id UUID FK; number int; payload jsonb; submitted_at timestamptz?; revision_due_at timestamptz? | UQ(submission_id, number). Maksimal satu draft aktif; versi terkirim immutable. |
| file_assets | owner_id UUID FK profiles; upload_version_id UUID FK; object_key text; original_name text; bytes bigint; mime text; state text | UQ(object_key); bytes > 0. pending, ready, rejected, abandoned. |
| submission_files | version_id, asset_id UUID FK | Composite PK(version_id, asset_id). Hanya file ready milik peserta terkait. |

### Aturan konsistensi tugas

current_version_id harus menunjuk versi dari submission yang sama. quest_versions yang dirujuk suatu submission harus milik quest tersebut. File terikat pada versi tugas, bukan hanya akun; draft revisi dapat memakai kembali file lama yang kepemilikannya telah diperiksa server.

Simpan isi form tetap dalam payload JSONB, misalnya summary, reflection, dan evidence_links. Identitas, relasi, status, serta waktu tetap menjadi kolom bertipe. Dengan demikian sistem dapat mencari tugas terlambat atau belum dinilai tanpa membaca seluruh JSON.

### Aturan file

Usulan awal: JPEG, PNG, WebP, PDF, DOCX, dan PPTX; maksimum 20 MiB per file dan lima file per versi tugas. Video berupa tautan. File berada di storage privat; database menyimpan metadata dan object_key. Download diberikan setelah pemeriksaan akses. Batas dan retensi perlu disepakati ECC.

Upload yang belum selesai tidak dianggap bukti valid. Server memeriksa ukuran serta tipe aktual. Versi terkirim dan file rujukannya tidak boleh ditimpa atau dihapus oleh peserta. Validasi format tidak boleh diklaim sebagai pemeriksaan antivirus.

### 3.3 Penilaian seleksi dan operasi

| Tabel | Kolom inti dan tipe | Constraint atau aturan |
| --- | --- | --- |
| rubric_versions | event_id UUID FK; code text; number int; components jsonb; published_at timestamptz? | UQ(event_id, code, number). Rubrik published immutable. |
| reviews | version_id, assignment_id, rubric_id UUID FK; scores jsonb; feedback text; status text; opened_at, finalized_at timestamptz?; supersedes_id UUID FK? | Satu final efektif per assignment/versi tugas. Koreksi menjadi review baru. |
| score_policies | stage_id UUID FK; number int; components jsonb; aggregation jsonb; path_quotas jsonb; tie_rule text?; published_at timestamptz? | UQ(stage_id, number). Bobot total 100; kuota mengacu jalur event yang sama. |
| score_inputs | enrollment_id, policy_id UUID FK; component_code text; value numeric; evidence_ref text; reason text; entered_by UUID FK | UQ(enrollment_id, policy_id, component_code). Input manual dengan bukti/alasan dan audit perubahan. |
| selection_runs | stage_id, policy_id UUID FK; revision int; source_digest text; state text; published_by UUID FK?; published_at timestamptz? | UQ(stage_id, revision). Satu published efektif per tahap. |
| selection_candidates | run_id, enrollment_id UUID FK; input_snapshot jsonb; total numeric; decision text; reason text? | UQ(run_id, enrollment_id). Keputusan dan skor dibekukan saat published. |
| activity_ledger | enrollment_id UUID FK; event_type text; source_id UUID; points int; reversal_of UUID FK? | UQ(enrollment_id, event_type, source_id). XP dihitung server; koreksi melalui reversal. |
| announcements | event_id UUID FK; stage_id, run_id UUID FK?; title text; body text; published_at timestamptz? | Hasil seleksi hanya tampil dari run published. |
| audit_logs | actor_id UUID FK?; action text; entity_type text; entity_id UUID; changes jsonb; request_id UUID | Append-only. changes difilter dari token dan data rahasia. |
| analytics_events | event_id UUID FK; enrollment_id, stage_id UUID FK?; name text; operation_id UUID; properties jsonb | UQ(operation_id, name). Properti allowlist tanpa isi tugas atau file. |

Tabel pendukung implementasi: import_batches dan provisioning_rows menyimpan progres impor serta undangan per baris; idempotency_keys menyimpan request_hash dan response_ref untuk retry; rate_limits menyimpan counter dengan window waktu. Ketiganya mengikuti kontrak teknis dan tidak ditampilkan sebagai fitur peserta.

Foreign key, constraint komposit, atau trigger wajib menolak relasi lintas event, jalur, dan tahap. Hindari cascade delete pada bukti serta penilaian. Hak akses diperiksa di API dan database; perubahan role, skor, dan hasil hanya melalui operasi server terotorisasi.

## 4 Data yang Disimpan dan Representasi Objek

### 4.1 Pemetaan data ke tampilan aplikasi

| Data | Sumber penyimpanan | Representasi pada aplikasi |
| --- | --- | --- |
| Identitas dan jalur | Auth, profiles, enrollments, paths | Nama, jalur terpilih, status onboarding. |
| Future Base | future_bases | Form arah karier, target, skill, dukungan. |
| Journey | stages, stage_access, quests | Tahap aktif, tugas terkunci, tenggat, langkah berikutnya. |
| Materi dan kuis | quest_versions; quiz_attempts | Instruksi, pilihan jawaban, hasil milik peserta. |
| Kiriman dan file | submissions, submission_versions, file_assets, submission_files | Draft, daftar lampiran, waktu kirim, riwayat versi. |
| Nilai dan feedback | reviews, rubric_versions | Feedback dan nilai yang sudah dirilis. |
| Progres dan XP | Status tugas; activity_ledger | Jumlah tugas selesai, progress bar, total XP. |
| Hasil seleksi | selection_runs, selection_candidates | Lolos/gugur/finalis setelah publikasi. |
| Operasi dan pengukuran | audit_logs, analytics_events | Audit admin serta rekap metrik V1. |

### 4.2 Bentuk data di database dan API

Database menyimpan data dalam tabel yang saling berelasi. API menyusun beberapa tabel menjadi objek sesuai layar; objek dashboard bukan tabel baru. Status kelulusan berasal dari keputusan published, bukan dihitung kembali oleh browser. Signed URL dibuat saat akses dan tidak disimpan sebagai alamat file permanen.

Contoh berikut memakai ID pendek seperti enr_001 untuk memudahkan pembacaan; implementasi memakai UUID. Semua nama, konten, waktu, dan nilai pada contoh adalah data ilustrasi, bukan data peserta atau aturan ECC yang telah disahkan.

### Contoh objek peserta setelah onboarding

```json
{
  "enrollment_id": "enr_001",
  "profile": {
    "id": "usr_001",
    "name": "Peserta Contoh",
    "city": "Yogyakarta"
  },
  "event_id": "evt_2026",
  "path": {
    "id": "path_social",
    "code": "social_impact"
  },
  "status": "active",
  "future_base": {
    "direction": "Membangun program dampak sosial",
    "target_90d": "Menguji satu solusi bersama pengguna",
    "skills": ["wawancara", "presentasi"],
    "support": "Feedback terhadap ide solusi"
  }
}
```

### 4.3 Contoh objek tugas dan kiriman

Objek quest menggabungkan quests dan quest_versions. Contoh mission ini meminta ringkasan dan bukti. Daftar field wajib berada pada versi konten yang diterbitkan admin.

```json
{
  "quest_id": "q_001",
  "quest_version_id": "qv_001",
  "stage_id": "stage_1",
  "path_id": "path_social",
  "kind": "mission",
  "title": "Wawancara dan insight masalah",
  "required": true,
  "payload": {
    "required_fields": ["summary", "reflection"],
    "min_files": 1,
    "instructions": "Kumpulkan temuan wawancara dan bukti."
  }
}
```

Objek submission untuk layar peserta menggabungkan root, versi, dan metadata file. Ringkasan tidak disalin ke tabel peserta. Byte file berada pada storage privat; object_key hanya digunakan internal server.

```json
{
  "submission_id": "sub_001",
  "enrollment_id": "enr_001",
  "quest_id": "q_001",
  "workflow_status": "submitted",
  "row_version": 3,
  "current_version": {
    "id": "sv_001",
    "number": 1,
    "quest_version_id": "qv_001",
    "submitted_at": "2026-10-19T08:30:00Z",
    "payload": {
      "summary": "Tiga narasumber menjelaskan hambatan akses.",
      "reflection": "Perlu validasi kebutuhan prioritas.",
      "evidence_links": []
    },
    "files": [
      {
        "asset_id": "file_001",
        "name": "catatan-wawancara.pdf",
        "mime": "application/pdf",
        "bytes": 1048576,
        "state": "ready"
      }
    ]
  }
}
```

submitted_at dicatat server, bukan dari jam perangkat. File terunggah saja belum berarti tugas terkirim. Tombol submit hanya berhasil setelah seluruh bukti yang diwajibkan berstatus ready dan aturan deadline terpenuhi.

### 4.4 Contoh objek penilaian dan hasil

Review menunjuk satu versi tugas dan versi rubrik tertentu. Skor komponen berikut bersifat ilustratif; komponennya harus tersedia pada rubric_001 saat implementasi.

```json
{
  "review_id": "rev_001",
  "version_id": "sv_001",
  "assignment_id": "assign_001",
  "rubric_id": "rubric_001",
  "scores": {
    "problem_clarity": 4,
    "evidence_quality": 3
  },
  "feedback": "Perjelas hubungan temuan dengan masalah.",
  "status": "final",
  "finalized_at": "2026-10-20T07:00:00Z"
}
```

Objek hasil peserta hanya tersedia setelah publikasi. Contoh 79,00 berasal dari bobot slide: kuis 80% × 10, penyelesaian 100% × 40, kualitas 70% × 30, dukungan 50% × 20. Nilai komponen ini merupakan contoh perhitungan terpisah; belum merupakan agregasi review di atas.

```json
{
  "run_id": "run_001",
  "enrollment_id": "enr_001",
  "stage_id": "stage_1",
  "state": "published",
  "policy_id": "policy_demo_001",
  "selection_score": "79.00",
  "decision": "advance",
  "next_stage_id": "stage_2",
  "published_at": "2026-10-21T03:00:00Z"
}
```

### 4.5 Penyimpanan dan visibilitas

Nilai decimal dapat dikirim sebagai string untuk mempertahankan presisi. Server menghitung total setelah normalisasi sesuai policy. Nilai belum tersedia disimpan sebagai null atau status missing, bukan otomatis 0. Perhitungan serta keputusan final tidak menerima total_score atau role dari input peserta.

| Kategori | Yang dapat melihat | Yang tidak boleh ikut payload peserta |
| --- | --- | --- |
| Profil dan tugas | Pemilik, mentor yang ditugaskan, admin berwenang. | Profil privat serta bukti peserta lain. |
| Kuis | Peserta menerima soal dan hasil sesuai aturan. | Kunci jawaban sebelum rilis yang disepakati. |
| Penilaian | Mentor/admin; peserta setelah feedback atau hasil dirilis. | Draft nilai internal dan catatan keputusan privat. |
| Operasi | Admin atau operator berwenang. | Secret key, password, token, signed URL dalam log. |

Usulan retensi: 90 hari setelah event untuk data operasional dan bukti, mengikuti keputusan ECC termasuk backup. Penggunaan lanjutan untuk talent pool memerlukan tujuan, persetujuan peserta, hak akses, serta masa simpan tersendiri sebelum dibangun.

## 5 Tabel Relasi

Tabel ini menjelaskan hubungan antarobjek dan foreign key penghubung. 1:N berarti satu induk dapat memiliki banyak anak; untuk dua induk, berlaku bagi masing-masing. N:M direpresentasikan melalui tabel penghubung. Kolom FK nullable dapat membuat hubungan bersifat opsional selama onboarding atau sebelum publikasi.

| Induk → anak | Relasi | Foreign key atau penghubung |
| --- | --- | --- |
| Auth user → profile | 1:0..1 | profiles.id → auth.users.id |
| Event → path dan stage | 1:N | paths.event_id; stages.event_id |
| Profile ↔ event | N:M | enrollments(profile_id, event_id) |
| Path → enrollment | 1:N | enrollments.path_id; nullable sebelum memilih jalur |
| Enrollment → Future Base | 1:0..1 | future_bases.enrollment_id unik |
| Enrollment ↔ stage | N:M | stage_access(enrollment_id, stage_id) |
| Mentor → assignment | 1:N | mentor_assignments.mentor_id → profiles.id |
| Enrollment dan stage → assignment | 1:N | mentor_assignments.enrollment_id dan stage_id |
| Path dan stage → quest | 1:N | quests.path_id dan stage_id |
| Quest → versi quest | 1:N | quest_versions.quest_id |
| Versi quiz → kunci | 1:0..1 | private.quiz_keys.quest_version_id |
| Enrollment dan versi quiz → attempt | 1:N | quiz_attempts.enrollment_id dan quest_version_id |
| Enrollment dan quest → submission | 1:N | submissions.enrollment_id dan quest_id |
| Submission → versi kiriman | 1:N | submission_versions.submission_id |
| Versi kiriman ↔ file | N:M | submission_files(version_id, asset_id) |
| Assignment dan versi kiriman → review | 1:N | reviews.assignment_id dan version_id |
| Versi rubrik → review | 1:N | reviews.rubric_id |
| Stage → score policy → selection run | 1:N lalu 1:N | score_policies.stage_id; selection_runs.policy_id |
| Policy dan enrollment → input manual | 1:N | score_inputs.policy_id dan enrollment_id |
| Selection run ↔ enrollment | N:M | selection_candidates(run_id, enrollment_id) |
| Enrollment → XP dan analytics | 1:N | activity_ledger.enrollment_id; analytics_events.enrollment_id |
| Selection run → pengumuman dan akses | 1:N | announcements.run_id; stage_access.decided_by_run_id |

Satu published run efektif ditetapkan per stage. selection_runs.stage_id wajib sesuai stage policy yang dipakai. path_quotas pada JSON policy divalidasi terhadap paths dari event yang sama. Ref polimorfik seperti audit entity_id dan ledger source_id diperiksa fungsi domain; bukan FK bebas ke semua tabel.

## 6 Lingkup V1 Metrik dan Pengembangan Pasca V1

### 6.1 Lingkup V1 yang termasuk

V1 atau MVP harus mendukung satu rangkaian utuh: akun peserta → journey → kuis/misi → bukti tersimpan → penilaian mentor → keputusan seleksi → hasil serta akses tahap berikutnya. Rancangan lingkup ini perlu disepakati ECC sebelum menjadi komitmen delivery.

| ID | Fitur V1 | Batas penerimaan |
| --- | --- | --- |
| V1-01 | Akun dan onboarding | Impor peserta ECC, undangan, login/reset, Future Base ringkas, satu jalur per peserta. |
| V1-02 | Journey tiga jalur | Dashboard, tiga tahap tugas, milestone final, jadwal, materi serta tautan Zoom. |
| V1-03 | Kuis objektif | Soal, percobaan sesuai aturan, penilaian server, hasil dan prasyarat opsional. |
| V1-04 | Misi dan bukti | Draft tersimpan, file/tautan, validasi, konfirmasi submit, serta riwayat revisi. |
| V1-05 | Dashboard mentor | Penugasan, antrean review, rubrik, feedback, permintaan revisi dan nilai final. |
| V1-06 | Seleksi dan hasil | Skor terkonfigurasi, draft rekap, kuota, resolusi seri, publikasi admin, akses lolos/gugur. |
| V1-07 | Gamifikasi dasar | Progres visual bertema membangun fondasi hingga atap, XP terverifikasi; tanpa animasi kompleks. |
| V1-08 | Operasi admin | Kelola konten, akun, mentor, pengumuman, ekspor CSV, dan audit. |
| V1-09 | Kualitas dan pengukuran | Tampilan mobile, kontrol akses, retry, backup/restore, rekap metrik melalui query atau CSV. |

### 6.2 Tidak termasuk V1 dasar

Pendaftaran publik, asesmen awal dan essay challenge; aplikasi mobile native; banyak event atau banyak organisasi; chat realtime; Guild kompleks; penjadwalan meetup; leaderboard publik; animasi game kompleks; integrasi API Zoom; portal perusahaan, hiring, serta talent pool; penilaian otomatis AI; sistem hadiah atau pembayaran otomatis.

### 6.3 Fitur bersyarat

Tombol minta bantuan, peer feedback, validasi bantuan, dan direktori peserta satu jalur belum masuk V1 dasar. Fitur tersebut dapat masuk V1 jika aturan, validasi poin, visibilitas data, dan waktu implementasinya disepakati sebelum scope dikunci. Jika dukungan rekan tetap menjadi komponen wajib skor, pengganti input manual mentor harus disetujui ECC; tidak boleh menghapus atau mengubah bobot secara diam-diam.

### 6.4 Metrik Keberhasilan V1

Angka berikut adalah target usulan untuk disepakati, bukan hasil yang telah tercapai. Ukur per tahap dan per jalur dengan menampilkan pembilang serta penyebut. Peserta yang sudah gugur tidak dihitung sebagai peserta eligible pada tahap berikutnya; penurunan 100 menjadi 9 bukan kegagalan retensi produk.

| Metrik | Definisi dan sumber | Target usulan |
| --- | --- | --- |
| Aktivasi akun | Peserta yang menyelesaikan aktivasi ÷ peserta valid yang diundang. Sumber: provisioning_rows dan enrollments.activated_at. Ukur H-1. | ≥95%; sisanya ditindaklanjuti ECC. |
| Peserta aktif bermakna | Peserta eligible yang melakukan minimal satu quiz submit, draft save, atau mission submit ÷ seluruh peserta eligible pada tahap. Sumber: analytics_events. | ≥85% per tahap. |
| Submit mandiri | Peserta eligible yang berhasil submit minimal satu misi tanpa operator mengunggah atas namanya ÷ peserta eligible yang punya misi wajib. Sumber: submission dan audit actor. | ≥85% per tahap. |
| Kelengkapan tepat waktu | Peserta eligible dengan seluruh misi wajib terkirim sebelum deadline masing-masing ÷ peserta eligible yang punya misi wajib. Sumber: versi kiriman dan jadwal efektif. | ≥80% per tahap; mutu dinilai terpisah. |
| Keberhasilan submit teknis | Operasi submit valid yang tersimpan dalam 5 menit setelah percobaan awal ÷ operasi submit valid unik. Sumber: telemetry dan operasi server. | ≥99%; retry dengan operation_id sama dihitung sekali. |
| Review sesuai jadwal | Kiriman yang memerlukan review dan selesai dinilai sebelum review_due_at ÷ seluruh kiriman yang harus direview pada putaran itu. Sumber: review dan assignment. | ≥95%; 100% input seleksi lengkap sebelum publish. |
| Efisiensi mentor | Median waktu kerja aktif per review dibanding simulasi alur form, untuk tugas/rubrik setara. Catat manual sampel minimal 10 review per alur. | Baseline saat UAT; target penurunan disepakati setelah baseline. |
| Kemudahan penggunaan | Jawaban survei “Saya dapat mengumpulkan tugas tanpa bantuan” skala 1–5. Laporkan rata-rata dan jumlah respons. | Rata-rata ≥4; respons ≥60% peserta yang diundang survei. |
| Integritas keputusan | Jumlah hasil published yang berbeda dari keputusan final ECC akibat kesalahan sistem. Sumber: rekonsiliasi hasil dan audit. | 0 kesalahan; 100% hasil dapat ditelusuri. |

Telemetry mencatat operation_id, jenis operasi, waktu, dan kode hasil; tidak menyimpan isi jawaban atau bukti. Penolakan yang benar seperti file invalid, deadline lewat, dan akses terlarang dikeluarkan dari denominator submit valid lalu dilaporkan terpisah. UAT perlu menguji bahwa operasi gagal sebelum tersimpan juga terukur; jangan menghitung success rate hanya dari tabel kiriman sukses.

Traffic publik dan jumlah hiring dilaporkan sebagai konteks program jika ECC mempunyai datanya. Keduanya bukan KPI utama V1 karena pendaftaran serta rekrutmen berlangsung di luar website. Target partisipasi belum membuktikan pengaruh gamifikasi tanpa pembanding yang layak.

### 6.5 Rencana Pengembangan Pasca V1

Prioritas setelah V1 ditentukan dari hasil event, permintaan ECC, dan kapasitas tim. Roadmap berikut merupakan opsi pengembangan; belum masuk harga, jadwal, atau kontrak V1.

| Tahap | Pengembangan | Syarat untuk diprioritaskan |
| --- | --- | --- |
| V1.1 | Perbaikan UX submit, notifikasi pengingat, dan analitik operasional yang lebih mudah dibaca. | Data V1 menunjukkan titik gagal atau beban mentor; kanal notifikasi disepakati. |
| V1.1 sosial | Peer feedback, permintaan bantuan, konfirmasi bantuan, serta moderasi. | ECC menyepakati bukti kontribusi, anti-duplikasi, batas poin, dan privasi profil. |
| V1.2 | Guild, leaderboard sesuai aturan, achievement, dan pengalaman journey lebih interaktif. | Alur inti stabil; ada tujuan partisipasi terukur dan kapasitas moderasi. |
| V2 integrasi | Integrasi Zoom, pengelolaan beberapa event, serta templat program. | Ada kebutuhan berulang, akses API, anggaran, dan pemilik integrasi. |
| V2 karier | Profil portofolio, talent pool, akses perusahaan, dan proses hiring. | ECC menetapkan proses bisnis, persetujuan peserta, izin perusahaan, serta retensi data. |

### 6.6 Rencana menuju peluncuran V1

| Waktu usulan | Hasil yang harus tersedia |
| --- | --- |
| 12–20 September | Scope, schema, fondasi akun, onboarding, dan journey awal. |
| 21–27 September | Alur kuis → draft → upload → submit → review berjalan di staging. |
| 28 September–4 Oktober | Penilaian, seleksi, admin, gamifikasi dasar, dan metrik; feature freeze 4 Oktober. |
| 5–8 Oktober | UAT ECC, uji hak akses, submit bersamaan, file, skor, serta pemulihan backup. |
| 9–14 Oktober | Perbaikan, konfigurasi produksi, konten, pelatihan mentor/admin, dan onboarding. |
| 15 Oktober dan selama event | Dukungan operasional, pemantauan submit, review, dan pengumuman sesuai PIC. |

Rencana mengasumsikan dua developer dan masih perlu disesuaikan jam kerja serta budget. Satu orang memiliki tiap task, orang lain mereview perubahan penting. Dukungan selama event, waktu respons, dan PIC harus disepakati sebelum peluncuran.

### 6.7 Syarat rilis dan keputusan yang masih dibutuhkan

Rilis memerlukan seluruh alur V1 lulus UAT, tidak ada kebocoran/kehilangan data atau kesalahan skor kritis yang terbuka, backup database dan file dapat dipulihkan, serta konten awal dan akun tersedia. ECC perlu mengesahkan kuota jalur, rubrik/bobot, aturan kuis, deadline, revisi, akses gugur, fitur sosial, dan otoritas publikasi. Tim perlu menetapkan domain, hosting, email akun, budget, kapasitas kerja, serta dukungan event.

Dasar produk: catatan meeting, slide Alur Proses SIAP IMPACT 2026, klarifikasi tim, PRD bisnis v0.1, dan PRD teknis v0.1. Referensi prototipe client: https://future-quest-siap-impact.ecccoid.chatgpt.site/. Dokumen ini merapikan struktur kebutuhan; asumsi yang belum disahkan tetap terbuka untuk pembahasan.
