-- ==============================================================================
-- مخطط قاعدة البيانات العلائقية (Relational Database Schema)
-- مشروع: المكتبة الجغرافية والتربوية الذكية
-- متوافق مع: PostgreSQL / Supabase / SQLite
-- ==============================================================================

-- 1. جدول المستخدمين (Users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'viewer')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول المراحل الدراسية (Educational Stages)
CREATE TABLE IF NOT EXISTS educational_stages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1
);

-- 3. جدول الصفوف الدراسية (Grades)
CREATE TABLE IF NOT EXISTS grades (
    id VARCHAR(64) PRIMARY KEY,
    stage_id VARCHAR(64) REFERENCES educational_stages(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1
);

-- 4. جدول المواد الدراسية (Subjects)
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL,
    color VARCHAR(32) DEFAULT '#0d9488',
    description TEXT
);

-- 5. جدول الفصول الدراسية (Semesters)
CREATE TABLE IF NOT EXISTS semesters (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1
);

-- 6. جدول الوحدات الدراسية (Units)
CREATE TABLE IF NOT EXISTS units (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    grade_id VARCHAR(64) REFERENCES grades(id) ON DELETE CASCADE,
    semester_id VARCHAR(64) REFERENCES semesters(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    description TEXT
);

-- 7. جدول الدروس (Lessons)
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(64) PRIMARY KEY,
    unit_id VARCHAR(64) REFERENCES units(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    objectives JSONB,
    concepts JSONB
);

-- 8. جدول المصادر والكتب (Resources)
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    publication_year INT,
    language VARCHAR(64) DEFAULT 'العربية',
    type VARCHAR(32) NOT NULL CHECK (type IN ('textbook', 'teacher_guide', 'reference', 'map', 'atlas', 'article', 'research', 'external_link')),
    format VARCHAR(32) NOT NULL CHECK (format IN ('pdf', 'docx', 'pptx', 'xlsx', 'txt', 'image', 'link')),
    source_url TEXT,
    license VARCHAR(255),
    description TEXT,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE SET NULL,
    stage_id VARCHAR(64) REFERENCES educational_stages(id) ON DELETE SET NULL,
    grade_id VARCHAR(64) REFERENCES grades(id) ON DELETE SET NULL,
    unit_id VARCHAR(64) REFERENCES units(id) ON DELETE SET NULL,
    lesson_id VARCHAR(64) REFERENCES lessons(id) ON DELETE SET NULL,
    reliability VARCHAR(32) DEFAULT 'official' CHECK (reliability IN ('official', 'academic', 'enrichment', 'unverified')),
    tags JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    file_size BIGINT DEFAULT 0,
    file_name VARCHAR(255),
    file_hash VARCHAR(64) NOT NULL, -- بصمة SHA-256 لمنع التكرار
    file_path TEXT,
    page_count INT DEFAULT 1,
    processing_status VARCHAR(32) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'indexed', 'failed', 'needs_ocr')),
    processing_error TEXT,
    ocr_applied BOOLEAN DEFAULT FALSE,
    ocr_confidence NUMERIC(4,3) DEFAULT 1.0,
    is_archived BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_hash ON resources(file_hash);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject_id);

-- 9. جدول صفحات المستندات (Document Pages)
CREATE TABLE IF NOT EXISTS document_pages (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) REFERENCES resources(id) ON DELETE CASCADE,
    page_number INT NOT NULL, -- رقم صفحة الملف
    printed_page_number INT, -- رقم الصفحة المطبوعة في الكتاب
    content TEXT NOT NULL,
    confidence NUMERIC(4,3) DEFAULT 1.0,
    is_ocr BOOLEAN DEFAULT FALSE,
    chapter_or_unit_title VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_doc_pages_res_num ON document_pages(resource_id, page_number);

-- 10. جدول المقاطع النصية للاسترجاع (Document Chunks / RAG)
CREATE TABLE IF NOT EXISTS document_chunks (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) REFERENCES resources(id) ON DELETE CASCADE,
    page_id VARCHAR(64) REFERENCES document_pages(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    printed_page_number INT,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    char_length INT NOT NULL,
    heading VARCHAR(255),
    keywords JSONB DEFAULT '[]'::jsonb,
    embedding VECTOR(1536), -- لدعم pgvector للبحث الدلالي
    subject_name VARCHAR(128),
    grade_name VARCHAR(128),
    unit_title VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_chunks_res ON document_chunks(resource_id);

-- 11. جدول مهام المعالجة والفهرسة (Processing Jobs)
CREATE TABLE IF NOT EXISTS processing_jobs (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) REFERENCES resources(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    progress INT DEFAULT 0,
    pages_processed INT DEFAULT 0,
    total_pages INT DEFAULT 1,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 12. جدول مركز الجغرافيا والخرائط (Geographic Resources)
CREATE TABLE IF NOT EXISTS geographic_resources (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) REFERENCES resources(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('physical_map', 'political_map', 'topographic', 'satellite', 'climate_chart', 'demographic', 'field_photo')),
    region_name VARCHAR(255) NOT NULL,
    country VARCHAR(128),
    coordinates JSONB, -- { "lat": 24.5, "lng": 39.5, "zoom": 6 }
    scale VARCHAR(64),
    projection VARCHAR(64),
    year INT,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    educational_applications JSONB DEFAULT '[]'::jsonb,
    license VARCHAR(255),
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. جدول المراجع والمواقع الخارجية (External References)
CREATE TABLE IF NOT EXISTS external_references (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    author_or_entity VARCHAR(255),
    publish_date DATE,
    access_date DATE NOT NULL,
    topic VARCHAR(255) NOT NULL,
    reliability VARCHAR(32) DEFAULT 'official',
    license VARCHAR(255),
    teacher_notes TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_accessible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. جدول المحادثات والمساعد التربوي (Conversations & Messages)
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    scope_resource_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. جدول الخطط والدروس المولدة (Generated Lessons)
CREATE TABLE IF NOT EXISTS generated_lessons (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_name VARCHAR(128) NOT NULL,
    stage_name VARCHAR(128),
    grade_name VARCHAR(128) NOT NULL,
    unit_title VARCHAR(255) NOT NULL,
    lesson_title VARCHAR(255) NOT NULL,
    duration_minutes INT DEFAULT 45,
    objectives JSONB NOT NULL,
    concepts_and_terms JSONB DEFAULT '[]'::jsonb,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    tools_and_resources JSONB DEFAULT '[]'::jsonb,
    hook TEXT,
    procedures JSONB NOT NULL,
    assessment_methods JSONB NOT NULL,
    differentiation JSONB NOT NULL,
    homework TEXT,
    referenced_sources JSONB DEFAULT '[]'::jsonb,
    is_template BOOLEAN DEFAULT FALSE,
    created_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. جدول أوراق العمل (Worksheets)
CREATE TABLE IF NOT EXISTS worksheets (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_name VARCHAR(128) NOT NULL,
    grade_name VARCHAR(128) NOT NULL,
    unit_title VARCHAR(255),
    target_objective TEXT NOT NULL,
    time_minutes INT DEFAULT 20,
    instructions TEXT,
    difficulty_levels VARCHAR(32) DEFAULT 'mixed',
    activities JSONB NOT NULL,
    referenced_sources JSONB DEFAULT '[]'::jsonb,
    created_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. جدول الاختبارات والتقويم (Assessments)
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_name VARCHAR(128) NOT NULL,
    grade_name VARCHAR(128) NOT NULL,
    unit_title VARCHAR(255),
    total_points INT DEFAULT 20,
    time_limit_minutes INT DEFAULT 45,
    instructions TEXT,
    questions JSONB NOT NULL,
    grading_rubric JSONB DEFAULT '[]'::jsonb,
    created_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. جدول العروض التقديمية (Presentations)
CREATE TABLE IF NOT EXISTS presentations (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_name VARCHAR(128) NOT NULL,
    grade_name VARCHAR(128) NOT NULL,
    unit_title VARCHAR(255) NOT NULL,
    slides JSONB NOT NULL,
    summary_cards JSONB DEFAULT '[]'::jsonb,
    created_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. جدول المفضلة والإشارات المرجعية (Bookmarks)
CREATE TABLE IF NOT EXISTS bookmarks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    resource_id VARCHAR(64) REFERENCES resources(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    note TEXT,
    color VARCHAR(32) DEFAULT '#0d9488',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. جدول سجلات التدقيق الأمني (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. جدول النسخ الاحتياطي (Backup Jobs)
CREATE TABLE IF NOT EXISTS backup_jobs (
    id VARCHAR(64) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL,
    item_counts JSONB NOT NULL,
    status VARCHAR(32) NOT NULL,
    checksum VARCHAR(64) NOT NULL, -- SHA-256 Checksum
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. جدول طابور المزامنة المحلية (Sync Operations)
CREATE TABLE IF NOT EXISTS sync_operations (
    id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    payload JSONB NOT NULL,
    client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(32) DEFAULT 'pending'
);
