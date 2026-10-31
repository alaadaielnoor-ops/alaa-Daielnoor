import fs from 'fs';
import path from 'path';

const coversDir = path.join(process.cwd(), 'public', 'covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

interface CoverConfig {
  filename: string;
  category: 'textbook' | 'teacher_guide' | 'atlas' | 'ped_oman' | 'ped_global';
  title: string;
  subtitle: string;
  grade?: string;
  author?: string;
  themeColor1: string;
  themeColor2: string;
  accentColor: string;
  badgeText: string;
  iconType: 'book' | 'cap' | 'compass' | 'globe' | 'brain' | 'tree' | 'layers' | 'tech';
}

function getIconSvg(type: string, accent: string): string {
  switch (type) {
    case 'cap':
      return `
        <!-- Graduation Cap Icon -->
        <g transform="translate(170, 240) scale(1.5)" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </g>`;
    case 'compass':
      return `
        <!-- Compass Rose / Cartography Icon -->
        <g transform="translate(160, 230) scale(1.8)" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" stroke="${accent}" stroke-opacity="0.6"/>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="${accent}" fill-opacity="0.3"/>
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="4" y2="12"/>
          <line x1="20" y1="12" x2="22" y2="12"/>
        </g>`;
    case 'globe':
      return `
        <!-- Globe / World Icon -->
        <g transform="translate(165, 235) scale(1.6)" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </g>`;
    case 'brain':
      return `
        <!-- Cognition / Learning Icon -->
        <g transform="translate(165, 235) scale(1.6)" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z"/>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z"/>
        </g>`;
    case 'tech':
      return `
        <!-- Technology & AI Icon -->
        <g transform="translate(165, 235) scale(1.6)" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
          <circle cx="12" cy="10" r="3" fill="${accent}" fill-opacity="0.3"/>
        </g>`;
    case 'layers':
      return `
        <!-- Curriculum Design / Taxonomy Layers -->
        <g transform="translate(165, 235) scale(1.6)" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </g>`;
    case 'tree':
      return `
        <!-- History & Foundation Icon -->
        <g transform="translate(165, 235) scale(1.6)" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22v-8"/>
          <path d="M12 8c2.5 0 4.5-2 4.5-4.5S14.5 0 12 0 7.5 1.5 7.5 3.5 9.5 8 12 8z"/>
          <path d="M8 14a4 4 0 0 1-4-4c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
          <path d="M16 14a4 4 0 0 0 4-4c0-2.2-1.8-4-4-4s-4 1.8-4 4"/>
        </g>`;
    case 'book':
    default:
      return `
        <!-- Open Book Icon -->
        <g transform="translate(165, 235) scale(1.6)" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </g>`;
  }
}

function generateSvgCover(cfg: CoverConfig): string {
  // Break title into lines if too long
  const titleWords = cfg.title.split(' ');
  let titleLine1 = cfg.title;
  let titleLine2 = '';
  if (titleWords.length > 4) {
    const half = Math.ceil(titleWords.length / 2);
    titleLine1 = titleWords.slice(0, half).join(' ');
    titleLine2 = titleWords.slice(half).join(' ');
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="100%" height="100%" dir="rtl">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad_${cfg.filename.replace(/[^a-zA-Z0-9]/g, '_')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cfg.themeColor1}" />
      <stop offset="60%" stop-color="${cfg.themeColor2}" />
      <stop offset="100%" stop-color="#0a0f1d" />
    </linearGradient>

    <!-- Metallic Gold Foil Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>

    <!-- Spine Shadow -->
    <linearGradient id="spineShadow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.65)" />
      <stop offset="4%" stop-color="rgba(255,255,255,0.25)" />
      <stop offset="7%" stop-color="rgba(0,0,0,0.4)" />
      <stop offset="12%" stop-color="rgba(0,0,0,0.05)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </linearGradient>

    <!-- Subtle Pattern -->
    <pattern id="islamicPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="${cfg.accentColor}" stroke-opacity="0.07" stroke-width="1"/>
      <circle cx="20" cy="20" r="6" fill="none" stroke="${cfg.accentColor}" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Base Cover Rectangle -->
  <rect width="400" height="560" rx="16" fill="url(#bgGrad_${cfg.filename.replace(/[^a-zA-Z0-9]/g, '_')})" />

  <!-- Background Pattern -->
  <rect width="400" height="560" rx="16" fill="url(#islamicPattern)" />

  <!-- Outer Decorative Border Frame -->
  <rect x="18" y="18" width="364" height="524" rx="12" fill="none" stroke="${cfg.accentColor}" stroke-opacity="0.3" stroke-width="1.5" />
  <rect x="24" y="24" width="352" height="512" rx="8" fill="none" stroke="${cfg.accentColor}" stroke-opacity="0.2" stroke-width="1" stroke-dasharray="6,4" />

  <!-- Corner Flourishes -->
  <g stroke="${cfg.accentColor}" stroke-width="2" fill="none" stroke-opacity="0.6">
    <path d="M 28 45 L 28 28 L 45 28" />
    <path d="M 372 45 L 372 28 L 355 28" />
    <path d="M 28 515 L 28 532 L 45 532" />
    <path d="M 372 515 L 372 532 L 355 532" />
  </g>

  <!-- Top Official Header -->
  <g text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif">
    <text x="200" y="55" font-size="12" font-weight="900" fill="${cfg.accentColor}" letter-spacing="1">
      سلطنة عُمان
    </text>
    <text x="200" y="74" font-size="11" font-weight="700" fill="#f8fafc" opacity="0.9">
      وزارة التربية والتعليم
    </text>
    <line x1="120" y1="84" x2="280" y2="84" stroke="${cfg.accentColor}" stroke-opacity="0.4" stroke-width="1" />
  </g>

  <!-- Category & Grade Pill -->
  <g transform="translate(100, 100)">
    <rect x="0" y="0" width="200" height="30" rx="15" fill="${cfg.accentColor}" fill-opacity="0.2" stroke="${cfg.accentColor}" stroke-opacity="0.6" stroke-width="1" />
    <text x="100" y="19" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff">
      ${cfg.badgeText}
    </text>
  </g>

  ${cfg.grade ? `
  <!-- Grade Level Banner -->
  <text x="200" y="160" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="url(#goldGrad)">
    ★ ${cfg.grade} ★
  </text>` : ''}

  <!-- Central Illustrated Medallion -->
  <circle cx="200" cy="270" r="62" fill="#030712" fill-opacity="0.45" stroke="${cfg.accentColor}" stroke-opacity="0.4" stroke-width="2" />
  <circle cx="200" cy="270" r="54" fill="none" stroke="${cfg.accentColor}" stroke-opacity="0.2" stroke-width="1" stroke-dasharray="4,4" />
  ${getIconSvg(cfg.iconType, cfg.accentColor)}

  <!-- Book Main Title Box -->
  <g text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif">
    ${titleLine2 ? `
      <text x="200" y="375" font-size="20" font-weight="900" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">
        ${titleLine1}
      </text>
      <text x="200" y="405" font-size="18" font-weight="900" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">
        ${titleLine2}
      </text>
    ` : `
      <text x="200" y="390" font-size="21" font-weight="900" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">
        ${titleLine1}
      </text>
    `}

    <!-- Subtitle / Subject Info -->
    <text x="200" y="440" font-size="12" font-weight="600" fill="#cbd5e1" opacity="0.95">
      ${cfg.subtitle}
    </text>

    ${cfg.author ? `
    <!-- Author / Source -->
    <text x="200" y="465" font-size="11" font-weight="500" fill="${cfg.accentColor}" opacity="0.9">
      ${cfg.author}
    </text>` : ''}
  </g>

  <!-- Bottom Official Stamp / Ribbon -->
  <g transform="translate(40, 485)">
    <rect x="0" y="0" width="320" height="34" rx="8" fill="#000000" fill-opacity="0.4" stroke="${cfg.accentColor}" stroke-opacity="0.3" stroke-width="1" />
    <text x="160" y="21" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#f1f5f9">
      المكتبة الرقمية العمانية • مصرح ومطابق للمواصفات
    </text>
  </g>

  <!-- Left Side Spine 3D Effect for Realistic Book Feel -->
  <rect x="0" y="0" width="36" height="560" rx="16" fill="url(#spineShadow)" />
  <line x1="36" y1="0" x2="36" y2="560" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
  <line x1="38" y1="0" x2="38" y2="560" stroke="rgba(0,0,0,0.5)" stroke-width="1" />
</svg>`;
}

// Map each resource to its cover definition
const COVER_DEFINITIONS: Record<string, CoverConfig> = {
  // Textbooks
  'res-om-grd1-tb': {
    filename: 'cover_om_grd1_tb.svg',
    category: 'textbook',
    title: 'المهارات الحياتية والبيئة',
    subtitle: 'كتاب الطالب والأنشطة المتكاملة',
    grade: 'الصف الأول الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#065f46',
    themeColor2: '#047857',
    accentColor: '#34d399',
    badgeText: 'كتاب الطالب والأنشطة',
    iconType: 'book'
  },
  'res-om-grd1-tg': {
    filename: 'cover_om_grd1_tg.svg',
    category: 'teacher_guide',
    title: 'المهارات الحياتية والأنشطة',
    subtitle: 'دليل المعلم واستراتيجيات التدريس',
    grade: 'الصف الأول الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#4c1d95',
    themeColor2: '#5b21b6',
    accentColor: '#fbbf24',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-grd2-tb': {
    filename: 'cover_om_grd2_tb.svg',
    category: 'textbook',
    title: 'بيئتي ومجتمعي العماني',
    subtitle: 'كتاب الطالب والأنشطة الاستقصائية',
    grade: 'الصف الثاني الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#047857',
    themeColor2: '#0f766e',
    accentColor: '#2dd4bf',
    badgeText: 'كتاب الطالب والأنشطة',
    iconType: 'book'
  },
  'res-om-grd2-tg': {
    filename: 'cover_om_grd2_tg.svg',
    category: 'teacher_guide',
    title: 'منهج الحلقة الأولى والأنشطة',
    subtitle: 'دليل المعلم التأسيسي والتقويم',
    grade: 'الصف الثاني الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#312e81',
    themeColor2: '#4338ca',
    accentColor: '#f59e0b',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-grd3-tb': {
    filename: 'cover_om_grd3_tb.svg',
    category: 'textbook',
    title: 'الدراسات الاجتماعية: وطني عمان',
    subtitle: 'كتاب الطالب - الجغرافيا والمجتمع',
    grade: 'الصف الثالث الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#0f766e',
    themeColor2: '#0e7490',
    accentColor: '#38bdf8',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'book'
  },
  'res-om-grd3-tg': {
    filename: 'cover_om_grd3_tg.svg',
    category: 'teacher_guide',
    title: 'الدراسات الاجتماعية: وطني عمان',
    subtitle: 'دليل المعلم والخطط الإجرائية',
    grade: 'الصف الثالث الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#581c87',
    themeColor2: '#6b21a8',
    accentColor: '#facc15',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-grd4-tb': {
    filename: 'cover_om_grd4_tb.svg',
    category: 'textbook',
    title: 'الدراسات الاجتماعية: مجتمعي وبيئتي',
    subtitle: 'كتاب الطالب والأنشطة التطبيقية',
    grade: 'الصف الرابع الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#0e7490',
    themeColor2: '#0369a1',
    accentColor: '#67e8f9',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'book'
  },
  'res-om-grd4-tg': {
    filename: 'cover_om_grd4_tg.svg',
    category: 'teacher_guide',
    title: 'الدراسات الاجتماعية: مجتمعي وبيئتي',
    subtitle: 'دليل المعلم واستراتيجيات الاستقصاء',
    grade: 'الصف الرابع الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#4a044e',
    themeColor2: '#701a75',
    accentColor: '#e879f9',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-grd5-tb': {
    filename: 'cover_om_grd5_tb.svg',
    category: 'textbook',
    title: 'الدراسات الاجتماعية: محافظات عمان',
    subtitle: 'كتاب الطالب - الجغرافيا الطبيعية والبشرية',
    grade: 'الصف الخامس الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#065f46',
    themeColor2: '#047857',
    accentColor: '#6ee7b7',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'book'
  },
  'res-om-grd5-tg': {
    filename: 'cover_om_grd5_tg.svg',
    category: 'teacher_guide',
    title: 'الدراسات الاجتماعية: محافظات عمان',
    subtitle: 'دليل المعلم واستراتيجيات التعلم النشط',
    grade: 'الصف الخامس الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#3730a3',
    themeColor2: '#4338ca',
    accentColor: '#fbbf24',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-105': {
    filename: 'cover_om_grd6_tb.svg',
    category: 'textbook',
    title: 'الدراسات الاجتماعية: الموارد والبيئة',
    subtitle: 'كتاب الطالب - الفصلين الأول والثاني',
    grade: 'الصف السادس الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#0f766e',
    themeColor2: '#115e59',
    accentColor: '#5eead4',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'book'
  },
  'res-om-grd6-tg': {
    filename: 'cover_om_grd6_tg.svg',
    category: 'teacher_guide',
    title: 'الدراسات الاجتماعية: الموارد والبيئة',
    subtitle: 'دليل المعلم والتقويم الصفي المستمر',
    grade: 'الصف السادس الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#581c87',
    themeColor2: '#4c1d95',
    accentColor: '#facc15',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-grd7-tb': {
    filename: 'cover_om_grd7_tb.svg',
    category: 'textbook',
    title: 'الدراسات الاجتماعية: شبه الجزيرة العربية',
    subtitle: 'كتاب الطالب - الجغرافيا التاريخية والاقتصادية',
    grade: 'الصف السابع الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#1e3a8a',
    themeColor2: '#1d4ed8',
    accentColor: '#93c5fd',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'book'
  },
  'res-om-grd7-tg': {
    filename: 'cover_om_grd7_tg.svg',
    category: 'teacher_guide',
    title: 'الدراسات الاجتماعية: شبه الجزيرة العربية',
    subtitle: 'دليل المعلم والأنشطة الاستقصائية',
    grade: 'الصف السابع الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#312e81',
    themeColor2: '#3730a3',
    accentColor: '#fbbf24',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-grd8-tb': {
    filename: 'cover_om_grd8_tb.svg',
    category: 'textbook',
    title: 'الدراسات الاجتماعية: قارات العالم والبيئة',
    subtitle: 'كتاب الطالب - التضاريس والمناخ والتنمية',
    grade: 'الصف الثامن الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#064e3b',
    themeColor2: '#047857',
    accentColor: '#34d399',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'book'
  },
  'res-om-grd8-tg': {
    filename: 'cover_om_grd8_tg.svg',
    category: 'teacher_guide',
    title: 'الدراسات الاجتماعية: قارات العالم والبيئة',
    subtitle: 'دليل المعلم وأدوات القياس والتقويم',
    grade: 'الصف الثامن الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#581c87',
    themeColor2: '#6b21a8',
    accentColor: '#facc15',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-grd9-tb': {
    filename: 'cover_om_grd9_tb.svg',
    category: 'textbook',
    title: 'الدراسات الاجتماعية: الجغرافيا الإقليمية',
    subtitle: 'كتاب الطالب - العالم الإسلامي والوطن العربي',
    grade: 'الصف التاسع الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#0f766e',
    themeColor2: '#0d9488',
    accentColor: '#2dd4bf',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'book'
  },
  'res-om-grd9-tg': {
    filename: 'cover_om_grd9_tg.svg',
    category: 'teacher_guide',
    title: 'الدراسات الاجتماعية: الجغرافيا الإقليمية',
    subtitle: 'دليل المعلم وبناء الاختبارات القصيرة',
    grade: 'الصف التاسع الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#4338ca',
    themeColor2: '#4f46e5',
    accentColor: '#fbbf24',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-grd10-tb': {
    filename: 'cover_om_grd10_tb.svg',
    category: 'textbook',
    title: 'الدراسات الاجتماعية: جغرافية عمان والعالم',
    subtitle: 'كتاب الطالب - نظم المعلومات والموارد',
    grade: 'الصف العاشر الأساسي',
    author: 'المديرية العامة لتطوير المناهج',
    themeColor1: '#111827',
    themeColor2: '#0f766e',
    accentColor: '#38bdf8',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'book'
  },
  'res-om-grd10-tg': {
    filename: 'cover_om_grd10_tg.svg',
    category: 'teacher_guide',
    title: 'الدراسات الاجتماعية: جغرافية عمان والعالم',
    subtitle: 'دليل المعلم واستراتيجيات حل المشكلات',
    grade: 'الصف العاشر الأساسي',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#4c1d95',
    themeColor2: '#3b0764',
    accentColor: '#f59e0b',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-103': {
    filename: 'cover_om_grd11_tb.svg',
    category: 'textbook',
    title: 'الجغرافيا والتقنيات الحديثة',
    subtitle: 'كتاب الطالب - الاستشعار عن بعد ونظم GIS',
    grade: 'الصف الحادي عشر',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#0e7490',
    themeColor2: '#155e75',
    accentColor: '#67e8f9',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'compass'
  },
  'res-om-104': {
    filename: 'cover_om_grd11_tg.svg',
    category: 'teacher_guide',
    title: 'الجغرافيا والتقنيات الحديثة',
    subtitle: 'دليل المعلم والتطبيقات المعملية GIS',
    grade: 'الصف الحادي عشر',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#3730a3',
    themeColor2: '#312e81',
    accentColor: '#facc15',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-101': {
    filename: 'cover_om_grd12_tb.svg',
    category: 'textbook',
    title: 'هذا وطني: تاريخ وجغرافية عُمان',
    subtitle: 'كتاب الطالب - دبلوم التعليم العام',
    grade: 'الصف الثاني عشر',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#831843',
    themeColor2: '#9f1239',
    accentColor: '#fbcfe8',
    badgeText: 'كتاب دبلوم التعليم العام',
    iconType: 'book'
  },
  'res-om-102': {
    filename: 'cover_om_grd12_tg.svg',
    category: 'teacher_guide',
    title: 'مادة هذا وطني: تاريخ وجغرافية عُمان',
    subtitle: 'دليل المعلم ونماذج الاختبارات الوطنية',
    grade: 'الصف الثاني عشر',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#4a044e',
    themeColor2: '#581c87',
    accentColor: '#facc15',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-econ12-tb': {
    filename: 'cover_om_econ12_tb.svg',
    category: 'textbook',
    title: 'الجغرافيا الاقتصادية والموارد العالمية',
    subtitle: 'كتاب الطالب - الطاقة والصناعة والتجارة الدولية',
    grade: 'الصف الثاني عشر (اختياري)',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#064e3b',
    themeColor2: '#065f46',
    accentColor: '#34d399',
    badgeText: 'كتاب الطالب المعتمد',
    iconType: 'globe'
  },
  'res-om-econ12-tg': {
    filename: 'cover_om_econ12_tg.svg',
    category: 'teacher_guide',
    title: 'مادة الجغرافيا الاقتصادية',
    subtitle: 'دليل المعلم والتحليل الإحصائي للخرائط',
    grade: 'الصف الثاني عشر',
    author: 'وزارة التربية والتعليم',
    themeColor1: '#1e1b4b',
    themeColor2: '#312e81',
    accentColor: '#fbbf24',
    badgeText: 'دليل المعلم المعتمد',
    iconType: 'cap'
  },
  'res-om-106': {
    filename: 'cover_om_atlas.svg',
    category: 'atlas',
    title: 'أطلس سلطنة عمان المدرسي المصور',
    subtitle: 'الخرائط المعتمدة ومحافظات عمان الـ 11',
    grade: 'مرجع شامل لكافة الصفوف',
    author: 'المركز الوطني للإحصاء ووزارة التربية',
    themeColor1: '#0c4a6e',
    themeColor2: '#0369a1',
    accentColor: '#38bdf8',
    badgeText: 'أطلس الخرائط المعتمد',
    iconType: 'compass'
  },

  // Omani Pedagogical References
  'res-ped-om-01': {
    filename: 'cover_ped_om_01.svg',
    category: 'ped_oman',
    title: 'فلسفة التعليم في سلطنة عُمان',
    subtitle: 'وتطبيقاتها التربوية الحديثة ورؤية عمان 2040',
    grade: 'مرجع تربوي قيادي',
    author: 'د. سعيد بن محمد البوسعيدي وخبراء التطوير التربوي',
    themeColor1: '#064e3b',
    themeColor2: '#047857',
    accentColor: '#fbbf24',
    badgeText: 'مرجع تربوي عماني معتمد',
    iconType: 'tree'
  },
  'res-ped-om-02': {
    filename: 'cover_ped_om_02.svg',
    category: 'ped_oman',
    title: 'استراتيجيات التدريس والتعلم النشط',
    subtitle: 'دليل المعلم التطبيقي في المنهج العماني',
    grade: 'أدلة المعلم والمشرفين',
    author: 'د. ناصر بن راشد العبري',
    themeColor1: '#0f766e',
    themeColor2: '#115e59',
    accentColor: '#facc15',
    badgeText: 'مرجع استراتيجيات التدريس',
    iconType: 'layers'
  },
  'res-ped-om-03': {
    filename: 'cover_ped_om_03.svg',
    category: 'ped_oman',
    title: 'المعايير المهنية الوطنية للمعلمين',
    subtitle: 'وقادة المدارس بسلطنة عُمان',
    grade: 'التطوير المهني والقيادي',
    author: 'المعهد التخصصي للتدريب المهني للمعلمين',
    themeColor1: '#1e3a8a',
    themeColor2: '#1e40af',
    accentColor: '#60a5fa',
    badgeText: 'المعايير الوطنية المعتمدة',
    iconType: 'cap'
  },
  'res-ped-om-04': {
    filename: 'cover_ped_om_04.svg',
    category: 'ped_oman',
    title: 'دليل التقويم التربوي الشامل والمستمر',
    subtitle: 'جداول المواصفات والاختبارات وبنوك الأسئلة',
    grade: 'إدارة التقويم والامتحانات',
    author: 'دائرة تقويم تعلم المواد الدراسية',
    themeColor1: '#3730a3',
    themeColor2: '#4338ca',
    accentColor: '#fbbf24',
    badgeText: 'دليل التقويم والاختبارات',
    iconType: 'layers'
  },
  'res-ped-om-05': {
    filename: 'cover_ped_om_05.svg',
    category: 'ped_oman',
    title: 'تاريخ التعليم في عُمان: مسيرة النهضة',
    subtitle: 'تطور المناهج المدرسية وتوثيق التجربة العمانية',
    grade: 'سجل التوثيق والبحوث',
    author: 'لجنة البحوث التربوية وتوثيق المناهج',
    themeColor1: '#78350f',
    themeColor2: '#92400e',
    accentColor: '#fde047',
    badgeText: 'سجل تاريخ المناهج العمانية',
    iconType: 'tree'
  },

  // Global Pedagogical References in Arabic
  'res-ped-glb-01': {
    filename: 'cover_ped_glb_01.svg',
    category: 'ped_global',
    title: 'نظريات التعلم الحديثة',
    subtitle: 'وتطبيقاتها في الغرفة الصفية (بياجيه، فيجوتسكي، برونر)',
    grade: 'علم النفس التربوي والنمو',
    author: 'د. يوسف قطامي و د. منى الصمادي',
    themeColor1: '#1e1b4b',
    themeColor2: '#2e1065',
    accentColor: '#c084fc',
    badgeText: 'مرجع عالمي مترجم للعربية',
    iconType: 'brain'
  },
  'res-ped-glb-02': {
    filename: 'cover_ped_glb_02.svg',
    category: 'ped_global',
    title: 'تصميم التدريس الفعال',
    subtitle: 'مدخل النظم ومنهجية دِك وكاري ونموذج ADDIE',
    grade: 'هندسة المناهج والتصميم',
    author: 'والتر دِك، لو كاري، وجيمس كاري',
    themeColor1: '#0c4a6e',
    themeColor2: '#164e63',
    accentColor: '#38bdf8',
    badgeText: 'مرجع التصميم التعليمي',
    iconType: 'layers'
  },
  'res-ped-glb-03': {
    filename: 'cover_ped_glb_03.svg',
    category: 'ped_global',
    title: 'بيداغوجيا التفكير: تصنيف بلوم المطور',
    subtitle: 'لمهارات التفكير العليا وصياغة النواتج التعليمية',
    grade: 'مهارات التفكير والتحليل',
    author: 'لورين أندرسون وديفيد كراثوول',
    themeColor1: '#831843',
    themeColor2: '#701a75',
    accentColor: '#f472b6',
    badgeText: 'تصنيف بلوم والأهداف',
    iconType: 'brain'
  },
  'res-ped-glb-04': {
    filename: 'cover_ped_glb_04.svg',
    category: 'ped_global',
    title: 'الإدارة الصفية الفعالة',
    subtitle: 'استراتيجيات قيادة الفصل وبناء البيئة الآمنة',
    grade: 'إدارة السلوك والبيئة المدرسية',
    author: 'روبرت مارزانو وفريق الباحثين',
    themeColor1: '#064e3b',
    themeColor2: '#065f46',
    accentColor: '#4ade80',
    badgeText: 'إدارة الصف ومارزانو',
    iconType: 'layers'
  },
  'res-ped-glb-05': {
    filename: 'cover_ped_glb_05.svg',
    category: 'ped_global',
    title: 'الفهم عن طريق التصميم (UbD)',
    subtitle: 'والتقويم البديل في المناهج المدرسية',
    grade: 'التخطيط العكسي والمخرجات',
    author: 'جرانت ويجنز وجاي ماكتاي',
    themeColor1: '#312e81',
    themeColor2: '#1e3a8a',
    accentColor: '#a5b4fc',
    badgeText: 'منهجية الفهم بالتصميم UbD',
    iconType: 'layers'
  },
  'res-ped-glb-06': {
    filename: 'cover_ped_glb_06.svg',
    category: 'ped_global',
    title: 'دمج التقنية والذكاء الاصطناعي',
    subtitle: 'في التعليم المدرسي وفق نموذج SAMR وإطار TPACK',
    grade: 'التحول الرقمي والذكاء الاصطناعي',
    author: 'د. روبن بوينتدورا ود. ماثيو كولر',
    themeColor1: '#111827',
    themeColor2: '#1e1b4b',
    accentColor: '#38bdf8',
    badgeText: 'التقنية والذكاء الاصطناعي',
    iconType: 'tech'
  }
};

// Generate and write all SVGs to public/covers/
console.log('Generating high-quality SVG book covers...');
let count = 0;
for (const [resId, cfg] of Object.entries(COVER_DEFINITIONS)) {
  const svg = generateSvgCover(cfg);
  const outPath = path.join(coversDir, cfg.filename);
  fs.writeFileSync(outPath, svg, 'utf8');
  count++;
}
console.log(`Generated ${count} book cover SVGs in public/covers/`);

// Update database.json with coverImageUrl for each resource
const dbPath = path.join(process.cwd(), 'data', 'database.json');
if (fs.existsSync(dbPath)) {
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let updatedCount = 0;
  for (const r of dbData.resources) {
    if (COVER_DEFINITIONS[r.id]) {
      r.coverImageUrl = `/covers/${COVER_DEFINITIONS[r.id].filename}`;
      updatedCount++;
    } else {
      // Default fallback cover based on type
      if (r.type === 'teacher_guide') {
        r.coverImageUrl = '/covers/cover_om_grd5_tg.svg';
      } else if (r.type === 'atlas') {
        r.coverImageUrl = '/covers/cover_om_atlas.svg';
      } else if (r.type === 'reference') {
        r.coverImageUrl = '/covers/cover_ped_om_01.svg';
      } else {
        r.coverImageUrl = '/covers/cover_om_grd5_tb.svg';
      }
      updatedCount++;
    }
  }
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`Updated database.json with covers for ${updatedCount} resources`);
}
