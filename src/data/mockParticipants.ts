import { SelectionCandidate, PathCode } from '../types';

export interface TalentProfile {
  id: string;
  name: string;
  city: string;
  pathCode: PathCode;
  pathTitle: string;
  status: 'eliminated' | 'finalist' | 'active';
  totalXp: number;
  stageReached: number;
  direction: string;
  target90d: string;
  skills: string[];
  submissionExcerpt: string;
  badges: string[];
}

export const INITIAL_TALENT_POOL: TalentProfile[] = [
  // Finalists (3 from Professional, 3 from Social Impact, 3 from Business)
  {
    id: 'finalist-p1',
    name: 'Raden Arya Baskoro',
    city: 'Yogyakarta',
    pathCode: 'professional',
    pathTitle: 'Profesional',
    status: 'finalist',
    totalXp: 980,
    stageReached: 3,
    direction: 'Mengembangkan sistem tata kelola risiko rantai pasok manufaktur berkelanjutan',
    target90d: 'Mengimplementasikan pilot project audit ESG di 2 pabrik mitra daerah',
    skills: ['Audit Mutu', 'Risk Governance', 'Stakeholder Alignment', 'Financial Modeling'],
    submissionExcerpt: 'Dokumentasi audit lapangan komprehensif dengan mitigasi kepatuhan sertifikasi ISO.',
    badges: ['Top 3 Finalist Jakarta', 'Empathy Titan Vanquisher', 'Risk Master']
  },
  {
    id: 'finalist-p2',
    name: 'Dian Permata Kusuma',
    city: 'Surabaya',
    pathCode: 'professional',
    pathTitle: 'Profesional',
    status: 'finalist',
    totalXp: 940,
    stageReached: 3,
    direction: 'Optimalisasi manajemen talenta dan retensi karyawan di industri logistik',
    target90d: 'Menguji framework kompetensi kepemimpinan agile untuk 40 manajer lini pertama',
    skills: ['Talent Architecture', 'Change Management', 'People Analytics', 'KPI Structuring'],
    submissionExcerpt: 'Kompilasi wawancara mendalam 15 supervisor dan framework KPI berbasis kompetensi.',
    badges: ['Top 3 Finalist Jakarta', 'Feasibility Specialist', 'Strategic Leader']
  },
  {
    id: 'finalist-p3',
    name: 'Hendra Gunawan',
    city: 'Bandung',
    pathCode: 'professional',
    pathTitle: 'Profesional',
    status: 'finalist',
    totalXp: 920,
    stageReached: 3,
    direction: 'Transformasi tata kelola procurement digital B2B transparan',
    target90d: 'Menyelesaikan modul pengadaan cerdas dengan verifikasi vendor otomatis',
    skills: ['B2B Operations', 'Contract Optimization', 'Compliance Risk', 'Workflow Automation'],
    submissionExcerpt: 'Pitch deck analisis penghematan anggaran belanja operasional hingga 18%.',
    badges: ['Top 3 Finalist Jakarta', 'Problem Solver V1', 'Executive Communicator']
  },

  // Social Impact Finalists (3)
  {
    id: 'finalist-s1',
    name: 'Siti Nur Aisyah',
    city: 'Malang',
    pathCode: 'social_impact',
    pathTitle: 'Social Impact',
    status: 'finalist',
    totalXp: 990,
    stageReached: 3,
    direction: 'Pemberdayaan kelompok tani perempuan melalui sentra pengolahan kopi terpadu',
    target90d: 'Mendirikan koperasi mikro beranggotakan 60 petani wanita di lereng Bromo',
    skills: ['Community Organizing', 'SROI Impact Assessment', 'Gender Inclusion', 'Agro-processing'],
    submissionExcerpt: 'Laporan pengukuran dampak sosial dengan proyeksi peningkatan pendapatan petani 35%.',
    badges: ['Top 3 Finalist Jakarta', 'Empathy Pioneer', 'Community Champion']
  },
  {
    id: 'finalist-s2',
    name: 'Fauzi Rahman',
    city: 'Semarang',
    pathCode: 'social_impact',
    pathTitle: 'Social Impact',
    status: 'finalist',
    totalXp: 950,
    stageReached: 3,
    direction: 'Platform bank sampah terdesentralisasi dan edukasi pemilahan rumah tangga',
    target90d: 'Mengedukasi 500 kepala keluarga di 3 kelurahan pilot penyerapan sampah plastik',
    skills: ['Circular Economy', 'Citizen Advocacy', 'Field Facilitation', 'Waste Metrics'],
    submissionExcerpt: 'Prototipe alur timbang digital dan data partisipasi 120 warga percontohan.',
    badges: ['Top 3 Finalist Jakarta', 'Green Innovator', 'Grassroots Hero']
  },
  {
    id: 'finalist-s3',
    name: 'Nadia Safitri',
    city: 'Makassar',
    pathCode: 'social_impact',
    pathTitle: 'Social Impact',
    status: 'finalist',
    totalXp: 910,
    stageReached: 3,
    direction: 'Akses literasi maritim dan modul pembelajaran pulau terluar',
    target90d: 'Mendistribusikan 15 modul bimbingan dan melatih 10 relawan guru pesisir',
    skills: ['Inclusive Education', 'Curriculum Adaptation', 'Island Logistics', 'Youth Engagement'],
    submissionExcerpt: 'Koleksi dokumentasi uji keterbacaan materi di 2 pulau kepulauan Spermonde.',
    badges: ['Top 3 Finalist Jakarta', 'Empathy Titan Vanquisher', 'Island Vanguard']
  },

  // Business Finalists (3)
  {
    id: 'finalist-b1',
    name: 'Bima Satria Wicaksono',
    city: 'Jakarta',
    pathCode: 'business',
    pathTitle: 'Bisnis',
    status: 'finalist',
    totalXp: 995,
    stageReached: 3,
    direction: 'Platform agregator logistik muatan balik untuk armada truk ekspedisi',
    target90d: 'Membukukan GMV Rp 250 juta dari 80 transaksi ritel muatan balik antar kota',
    skills: ['Market Sizing', 'Unit Economics', 'B2B Sales Velocity', 'Growth Strategy'],
    submissionExcerpt: 'Validasi model komisi 7% dan kesepakatan awal (LOI) dengan 4 asosiasi transporter.',
    badges: ['Top 3 Finalist Jakarta', 'Pitch Overlord Slayer', 'Traction Maestro']
  },
  {
    id: 'finalist-b2',
    name: 'Anisa Ristiyani',
    city: 'Solo',
    pathCode: 'business',
    pathTitle: 'Bisnis',
    status: 'finalist',
    totalXp: 960,
    stageReached: 3,
    direction: 'Brand makanan sehat siap saji berbasis komoditas lokal sorgum dan kelor',
    target90d: 'Meluncurkan 3 varian SKU dan ekspansi ke 15 jaringan toko organik Jawa Tengah',
    skills: ['FMCG Product Development', 'Cost of Goods Sold (COGS)', 'Brand Storytelling', 'Retail Channel'],
    submissionExcerpt: 'Laporan uji organoleptik 200 tester konsumen dan estimasi marjin kotor 48%.',
    badges: ['Top 3 Finalist Jakarta', 'Feasibility Specialist', 'Product Artisan']
  },
  {
    id: 'finalist-b3',
    name: 'Kuncoro Adi Pratama',
    city: 'Medan',
    pathCode: 'business',
    pathTitle: 'Bisnis',
    status: 'finalist',
    totalXp: 935,
    stageReached: 3,
    direction: 'Software as a Service (SaaS) manajemen inventaris terintegrasi kasir grosir pasar',
    target90d: 'Mengakuisisi 35 toko grosir aktif berlangganan bulanan di pasar induk',
    skills: ['SaaS Metrics', 'Customer Retention', 'Direct Field Selling', 'Product Roadmapping'],
    submissionExcerpt: 'Pitch deck analisis payback period 4 bulan dan retensi penggunaan 91%.',
    badges: ['Top 3 Finalist Jakarta', 'Problem Hunter', 'Market Disruptor']
  },

  // Eliminated Participants (Valuable Talent in Talent Pool)
  {
    id: 'elim-p1',
    name: 'Taufiq Hidayat',
    city: 'Semarang',
    pathCode: 'professional',
    pathTitle: 'Profesional',
    status: 'eliminated',
    totalXp: 620,
    stageReached: 2,
    direction: 'Digitalisasi alur pelaporan insiden keselamatan kerja (K3) berbasis formulir instan',
    target90d: 'Menguji coba prototipe K3 digital di laboratorium teknik kampus',
    skills: ['Safety Compliance', 'System Documentation', 'Incident Analysis'],
    submissionExcerpt: 'Analisis 45 lembar pelaporan K3 konvensional dan perancangan form ringkas.',
    badges: ['Stage 2 Pioneer', 'Empathy Titan Vanquisher', 'Talent Pool Verified']
  },
  {
    id: 'elim-s1',
    name: 'Dewi Lestari Utami',
    city: 'Denpasar',
    pathCode: 'social_impact',
    pathTitle: 'Social Impact',
    status: 'eliminated',
    totalXp: 580,
    stageReached: 2,
    direction: 'Pendampingan kesehatan mental remaja berbasis peer-counselor komunitas',
    target90d: 'Membentuk grup dukungan sebaya untuk 30 siswa SMA',
    skills: ['Mental Health Facilitation', 'Youth Empathy', 'Workshop Design'],
    submissionExcerpt: 'Dokumentasi focus group discussion 12 remaja tentang kecemasan akademik.',
    badges: ['Stage 2 Pioneer', 'Empathy Titan Vanquisher', 'Talent Pool Verified']
  },
  {
    id: 'elim-b1',
    name: 'Gilang Ramadhan',
    city: 'Palembang',
    pathCode: 'business',
    pathTitle: 'Bisnis',
    status: 'eliminated',
    totalXp: 510,
    stageReached: 2,
    direction: 'Layanan katering harian bergizi seimbang untuk pekerja kantoran shift malam',
    target90d: 'Menjual 100 paket langganan mingguan di kawasan perkantoran pusat',
    skills: ['Direct Marketing', 'Culinary Operations', 'Customer Service'],
    submissionExcerpt: 'Survei preferensi menu dan kalkulasi paket harga harian terjangkau.',
    badges: ['Stage 1 Achiever', 'Talent Pool Verified']
  },
  {
    id: 'elim-p2',
    name: 'Rian Syahputra',
    city: 'Balikpapan',
    pathCode: 'professional',
    pathTitle: 'Profesional',
    status: 'eliminated',
    totalXp: 340,
    stageReached: 1,
    direction: 'Manajemen efisiensi pergudangan suku cadang alat berat',
    target90d: 'Menstandarkan kode barcode untuk 500 jenis spare parts',
    skills: ['Inventory Control', 'Warehouse Management'],
    submissionExcerpt: 'Dokumentasi wawancara operator gudang mengenai keterlambatan penemuan barang.',
    badges: ['SIAP IMPACT Explorer', 'Talent Pool Verified']
  },
  {
    id: 'elim-s2',
    name: 'Fitria Handayani',
    city: 'Padang',
    pathCode: 'social_impact',
    pathTitle: 'Social Impact',
    status: 'eliminated',
    totalXp: 380,
    stageReached: 1,
    direction: 'Sentra literasi anak nelayan di pesisir barat Sumatera',
    target90d: 'Mengumpulkan 300 buku bacaan anak dan mendirikan pojok baca',
    skills: ['Reading Campaign', 'Local Partnership'],
    submissionExcerpt: 'Survei ketersediaan fasilitas baca pada 3 desa pesisir.',
    badges: ['SIAP IMPACT Explorer', 'Talent Pool Verified']
  },
  {
    id: 'elim-b2',
    name: 'Yoga Pratama',
    city: 'Cirebon',
    pathCode: 'business',
    pathTitle: 'Bisnis',
    status: 'eliminated',
    totalXp: 390,
    stageReached: 1,
    direction: 'Kerajinan rotan modern siap ekspor dengan kemasan modular',
    target90d: 'Menghasilkan 5 sampel produk furnitur modular kompak',
    skills: ['Product Design', 'Supplier Negotiation'],
    submissionExcerpt: 'Wawancara dengan 4 perajin rotan lokal mengenai hambatan penjualan retail.',
    badges: ['SIAP IMPACT Explorer', 'Talent Pool Verified']
  }
];
