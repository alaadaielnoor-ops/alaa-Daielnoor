import {
  Resource, DocumentPage, DocumentChunk, SystemStats,
  GeneratedLesson, Worksheet, Assessment, PresentationDeck,
  GeographicResource, ExternalReference, Conversation,
  AuditLog, BackupJob, User, RoleType,
  AnnualPlan, WeeklyTimetable, OfficialLetter, SchoolProfile,
  WhatsAppConfig, WhatsAppMessageLog, OmanVision2040Goal,
  EducationalCalendarEvent, Student, StudentGradeRecord,
  StudentAttendanceRecord, StudentPedagogicalNote, StudentOfficialLetterRef,
  StudentPerformanceAlert,
  GroundedPlace, GroundedWebSource, ChatbotPersona, ChatbotPersonaId
} from '../types/index.ts';
import { offlineDB } from './indexedDB.ts';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        }
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      // If network error, handle offline fallback
      console.warn(`API call failed for ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --- Stats ---
  public async getStats(): Promise<{ success: boolean; stats: SystemStats; hasGeminiKey: boolean }> {
    return this.request('/api/stats');
  }

  // --- Users ---
  public async getUsers(): Promise<{ success: boolean; users: User[] }> {
    return this.request('/api/users');
  }

  public async updateUser(id: string, updates: Partial<User>, requesterId?: string): Promise<{ success: boolean; user: User; message: string }> {
    return this.request<{ success: boolean; user: User; message: string }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, requesterId })
    });
  }

  public async addUser(userData: { name: string; email?: string; role: RoleType; avatarUrl?: string }, requesterId?: string): Promise<{ success: boolean; user: User; message: string }> {
    return this.request<{ success: boolean; user: User; message: string }>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ ...userData, requesterId })
    });
  }

  public async deleteUser(id: string, requesterId?: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ requesterId })
    });
  }

  // --- Image Upload (Avatars & Book Covers) ---
  public async uploadImage(dataUrl: string, filename: string, category: 'avatar' | 'cover' = 'cover'): Promise<{ success: boolean; url: string; message: string }> {
    return this.request<{ success: boolean; url: string; message: string }>('/api/upload-image', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename, category })
    });
  }

  // --- Taxonomy ---
  public async getTaxonomy(): Promise<{ success: boolean; taxonomy: any }> {
    return this.request('/api/taxonomy');
  }

  public async addSubject(name: string, code: string, color: string, description?: string): Promise<{ success: boolean; item?: any }> {
    return this.request<{ success: boolean; item?: any }>('/api/taxonomy/subject', {
      method: 'POST',
      body: JSON.stringify({ name, code, color, description })
    });
  }

  public async addUnit(subjectId: string, gradeId: string, semesterId: string, title: string, order: number, description?: string): Promise<{ success: boolean; item?: any }> {
    return this.request<{ success: boolean; item?: any }>('/api/taxonomy/unit', {
      method: 'POST',
      body: JSON.stringify({ subjectId, gradeId, semesterId, title, order, description })
    });
  }

  public async addLesson(unitId: string, title: string, order: number, objectives?: string[], concepts?: string[]): Promise<{ success: boolean; item?: any }> {
    return this.request<{ success: boolean; item?: any }>('/api/taxonomy/lesson', {
      method: 'POST',
      body: JSON.stringify({ unitId, title, order, objectives, concepts })
    });
  }

  // --- Resources (Digital Library) ---
  public async getResources(filters?: {
    subjectId?: string;
    gradeId?: string;
    type?: string;
    format?: string;
    search?: string;
    includeArchived?: boolean;
    includeDeleted?: boolean;
  }): Promise<{ success: boolean; resources: Resource[] }> {
    const params = new URLSearchParams();
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.gradeId) params.append('gradeId', filters.gradeId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.format) params.append('format', filters.format);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.includeArchived) params.append('includeArchived', 'true');
    if (filters?.includeDeleted) params.append('includeDeleted', 'true');

    try {
      const res = await this.request<{ success: boolean; resources: Resource[] }>(`/api/resources?${params.toString()}`);
      // Cache resources in IndexedDB for offline access
      if (res.resources) {
        for (const item of res.resources) {
          await offlineDB.setItem('resources', item);
        }
      }
      return res;
    } catch (e) {
      // Offline fallback: load from IndexedDB
      const cached = await offlineDB.getAll('resources');
      return { success: true, resources: cached };
    }
  }

  public async getResourceDetails(id: string): Promise<{
    success: boolean;
    resource: Resource;
    pages: DocumentPage[];
    chunks: DocumentChunk[];
  }> {
    return this.request(`/api/resources/${id}`);
  }

  public async generateResourcePages(id: string): Promise<{
    success: boolean;
    message?: string;
    pages: DocumentPage[];
    chunks: DocumentChunk[];
  }> {
    return this.request(`/api/resources/${id}/generate-pages`, {
      method: 'POST'
    });
  }

  public async uploadResource(payload: {
    filename: string;
    base64Content: string;
    title: string;
    author?: string;
    type?: Resource['type'];
    format?: Resource['format'];
    subjectId?: string;
    gradeId?: string;
    stageId?: string;
    unitId?: string;
    lessonId?: string;
    userId: string;
  }) {
    return this.request<{
      success: boolean;
      resource: Resource;
      isDuplicate: boolean;
      job: any;
      message: string;
    }>('/api/resources/upload', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async updateResource(id: string, updates: Partial<Resource>, userId?: string) {
    return this.request<{ success: boolean; resource: Resource }>(`/api/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, userId })
    });
  }

  public async archiveResource(id: string, userId?: string) {
    return this.request<{ success: boolean; isArchived: boolean }>(`/api/resources/${id}/archive`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  public async deleteResource(id: string, permanent: boolean = false, userId?: string) {
    return this.request<{ success: boolean; message: string }>(`/api/resources/${id}?permanent=${permanent}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId })
    });
  }

  public async restoreResource(id: string, userId?: string) {
    return this.request<{ success: boolean; message: string }>(`/api/resources/${id}/restore`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  // --- Search ---
  public async searchLibrary(query: string, scope?: string[], subjectId?: string, gradeId?: string) {
    const params = new URLSearchParams({ q: query });
    if (scope && scope.length > 0) params.append('scope', scope.join(','));
    if (subjectId) params.append('subjectId', subjectId);
    if (gradeId) params.append('gradeId', gradeId);

    return this.request<{
      success: boolean;
      results: Array<{
        chunk: DocumentChunk;
        resource: Resource;
        score: number;
        highlightedSnippet: string;
        pageNumber: number;
        printedPageNumber?: number;
      }>;
      count: number;
    }>(`/api/search?${params.toString()}`);
  }

  // --- Pedagogical Assistant (Multi-Turn Chat, Personas, Search Grounding & Maps Grounding) ---
  public async getPersonas(): Promise<{ success: boolean; personas: ChatbotPersona[] }> {
    return this.request<{ success: boolean; personas: ChatbotPersona[] }>('/api/assistant/personas');
  }

  public async sendChatMessage(
    messageOrOptions: string | {
      message: string;
      scopeResourceIds?: string[];
      conversationId?: string;
      userId?: string;
      useMapsGrounding?: boolean;
      useSearchGrounding?: boolean;
      latLng?: { latitude: number; longitude: number };
      personaId?: ChatbotPersonaId;
      model?: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';
    },
    scopeResourceIds?: string[],
    conversationId?: string,
    userId?: string,
    useMapsGrounding?: boolean,
    latLng?: { latitude: number; longitude: number },
    useSearchGrounding?: boolean,
    personaId?: ChatbotPersonaId,
    model?: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'
  ) {
    let payload: any;
    if (typeof messageOrOptions === 'object') {
      payload = messageOrOptions;
    } else {
      payload = {
        message: messageOrOptions,
        scopeResourceIds,
        conversationId,
        userId,
        useMapsGrounding,
        latLng,
        useSearchGrounding,
        personaId,
        model
      };
    }

    return this.request<{
      success: boolean;
      answer: string;
      citations: Array<{
        resourceId: string;
        resourceTitle: string;
        pageNumber: number;
        printedPageNumber?: number;
        snippet: string;
        confidence: number;
      }>;
      places?: GroundedPlace[];
      sources?: GroundedWebSource[];
      searchQueries?: string[];
      modelUsed?: string;
      personaId?: ChatbotPersonaId;
    }>('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async exploreMaps(query: string, latLng?: { latitude: number; longitude: number }, scopeResourceIds?: string[]) {
    return this.request<{
      success: boolean;
      answer: string;
      places: GroundedPlace[];
      citations: Array<{
        resourceId: string;
        resourceTitle: string;
        pageNumber: number;
        printedPageNumber?: number;
        snippet: string;
        confidence: number;
      }>;
    }>('/api/assistant/maps-explore', {
      method: 'POST',
      body: JSON.stringify({ query, latLng, scopeResourceIds })
    });
  }

  public async exploreSearch(query: string, scopeResourceIds?: string[], personaId?: ChatbotPersonaId) {
    return this.request<{
      success: boolean;
      answer: string;
      sources: GroundedWebSource[];
      searchQueries: string[];
      citations: Array<{
        resourceId: string;
        resourceTitle: string;
        pageNumber: number;
        printedPageNumber?: number;
        snippet: string;
        confidence: number;
      }>;
    }>('/api/assistant/search-explore', {
      method: 'POST',
      body: JSON.stringify({ query, scopeResourceIds, personaId })
    });
  }

  public async getConversations(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request<{ success: boolean; conversations: Conversation[] }>(`/api/assistant/conversations${params}`);
  }

  public async createConversation(title?: string, scopeResourceIds?: string[], userId?: string) {
    return this.request<{ success: boolean; conversation: Conversation }>('/api/assistant/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, scopeResourceIds, userId })
    });
  }

  public async deleteConversation(id: string) {
    return this.request<{ success: boolean }>(`/api/assistant/conversations/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Lesson Plans ---
  public async getLessons(): Promise<{ success: boolean; lessons: GeneratedLesson[] }> {
    try {
      const res = await this.request<{ success: boolean; lessons: GeneratedLesson[] }>('/api/lessons');
      if (res.lessons) {
        for (const item of res.lessons) {
          await offlineDB.setItem('lessons', item);
        }
      }
      return res;
    } catch (e) {
      const cached = await offlineDB.getAll('lessons');
      return { success: true, lessons: cached };
    }
  }

  public async generateLesson(params: {
    subjectName: string;
    stageName: string;
    gradeName: string;
    unitTitle: string;
    lessonTitle: string;
    durationMinutes: number;
    teachingStrategy?: string;
    pedagogicalTheory?: string;
    resourceIds?: string[];
    userId: string;
  }) {
    return this.request<{ success: boolean; lesson: GeneratedLesson }>('/api/lessons/generate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public async saveLesson(lesson: GeneratedLesson) {
    return this.request<{ success: boolean; lesson: GeneratedLesson }>('/api/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson)
    });
  }

  public async deleteLesson(id: string) {
    return this.request<{ success: boolean }>(`/api/lessons/${id}`, { method: 'DELETE' });
  }

  // --- Worksheets ---
  public async getWorksheets(): Promise<{ success: boolean; worksheets: Worksheet[] }> {
    try {
      const res = await this.request<{ success: boolean; worksheets: Worksheet[] }>('/api/worksheets');
      if (res.worksheets) {
        for (const item of res.worksheets) {
          await offlineDB.setItem('worksheets', item);
        }
      }
      return res;
    } catch (e) {
      const cached = await offlineDB.getAll('worksheets');
      return { success: true, worksheets: cached };
    }
  }

  public async generateWorksheet(params: {
    subjectName: string;
    gradeName: string;
    unitTitle: string;
    targetObjective: string;
    difficulty: 'mixed' | 'beginner' | 'intermediate' | 'advanced';
    userId: string;
  }) {
    return this.request<{ success: boolean; worksheet: Worksheet }>('/api/worksheets/generate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public async saveWorksheet(ws: Worksheet) {
    return this.request<{ success: boolean; worksheet: Worksheet }>('/api/worksheets', {
      method: 'POST',
      body: JSON.stringify(ws)
    });
  }

  public async deleteWorksheet(id: string) {
    return this.request<{ success: boolean }>(`/api/worksheets/${id}`, { method: 'DELETE' });
  }

  // --- Assessments ---
  public async getAssessments(): Promise<{ success: boolean; assessments: Assessment[] }> {
    try {
      const res = await this.request<{ success: boolean; assessments: Assessment[] }>('/api/assessments');
      if (res.assessments) {
        for (const item of res.assessments) {
          await offlineDB.setItem('assessments', item);
        }
      }
      return res;
    } catch (e) {
      const cached = await offlineDB.getAll('assessments');
      return { success: true, assessments: cached };
    }
  }

  public async generateAssessment(params: {
    subjectName: string;
    gradeName: string;
    unitTitle: string;
    questionCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    userId: string;
  }) {
    return this.request<{ success: boolean; assessment: Assessment }>('/api/assessments/generate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public async saveAssessment(asmt: Assessment) {
    return this.request<{ success: boolean; assessment: Assessment }>('/api/assessments', {
      method: 'POST',
      body: JSON.stringify(asmt)
    });
  }

  public async deleteAssessment(id: string) {
    return this.request<{ success: boolean }>(`/api/assessments/${id}`, { method: 'DELETE' });
  }

  // --- Presentations ---
  public async getPresentations() {
    return this.request<{ success: boolean; presentations: PresentationDeck[] }>('/api/presentations');
  }

  public async savePresentation(pres: PresentationDeck) {
    return this.request<{ success: boolean; presentation: PresentationDeck }>('/api/presentations', {
      method: 'POST',
      body: JSON.stringify(pres)
    });
  }

  // --- الخطط السنوية والفصلية (Annual Plans) ---
  public async getAnnualPlans() {
    return this.request<{ success: boolean; annualPlans: AnnualPlan[] }>('/api/annual-plans');
  }

  public async getAnnualPlanById(id: string) {
    return this.request<{ success: boolean; annualPlan: AnnualPlan }>(`/api/annual-plans/${id}`);
  }

  public async saveAnnualPlan(plan: Partial<AnnualPlan>) {
    return this.request<{ success: boolean; annualPlan: AnnualPlan }>('/api/annual-plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    });
  }

  public async deleteAnnualPlan(id: string) {
    return this.request<{ success: boolean }>(`/api/annual-plans/${id}`, { method: 'DELETE' });
  }

  // --- جدول الحصص الأسبوعي (Weekly Timetables) ---
  public async getTimetables() {
    return this.request<{ success: boolean; timetables: WeeklyTimetable[] }>('/api/timetables');
  }

  public async getTimetableById(id: string) {
    return this.request<{ success: boolean; timetable: WeeklyTimetable }>(`/api/timetables/${id}`);
  }

  public async saveTimetable(tt: Partial<WeeklyTimetable>) {
    return this.request<{ success: boolean; timetable: WeeklyTimetable }>('/api/timetables', {
      method: 'POST',
      body: JSON.stringify(tt)
    });
  }

  public async deleteTimetable(id: string) {
    return this.request<{ success: boolean }>(`/api/timetables/${id}`, { method: 'DELETE' });
  }

  // --- المراسلات والخطابات الرسمية (Official Letters) ---
  public async getOfficialLetters(recipientType?: string) {
    const params = recipientType && recipientType !== 'all' ? `?type=${recipientType}` : '';
    return this.request<{ success: boolean; letters: OfficialLetter[] }>(`/api/letters${params}`);
  }

  public async getOfficialLetterById(id: string) {
    return this.request<{ success: boolean; letter: OfficialLetter }>(`/api/letters/${id}`);
  }

  public async saveOfficialLetter(letter: Partial<OfficialLetter>) {
    return this.request<{ success: boolean; letter: OfficialLetter }>('/api/letters', {
      method: 'POST',
      body: JSON.stringify(letter)
    });
  }

  public async deleteOfficialLetter(id: string) {
    return this.request<{ success: boolean }>(`/api/letters/${id}`, { method: 'DELETE' });
  }

  // --- Educational Calendar (التقويم التربوي وجدولة الاختبارات والأنشطة) ---
  public async getCalendarEvents(): Promise<{ success: boolean; events: EducationalCalendarEvent[] }> {
    return this.request<{ success: boolean; events: EducationalCalendarEvent[] }>('/api/calendar/events');
  }

  public async getCalendarEventById(id: string): Promise<{ success: boolean; event: EducationalCalendarEvent }> {
    return this.request<{ success: boolean; event: EducationalCalendarEvent }>(`/api/calendar/events/${id}`);
  }

  public async saveCalendarEvent(eventData: Partial<EducationalCalendarEvent>): Promise<{ success: boolean; event: EducationalCalendarEvent }> {
    return this.request<{ success: boolean; event: EducationalCalendarEvent }>('/api/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  public async updateCalendarEvent(id: string, updates: Partial<EducationalCalendarEvent>): Promise<{ success: boolean; event: EducationalCalendarEvent }> {
    return this.request<{ success: boolean; event: EducationalCalendarEvent }>(`/api/calendar/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteCalendarEvent(id: string): Promise<{ success: boolean; deleted: boolean }> {
    return this.request<{ success: boolean; deleted: boolean }>(`/api/calendar/events/${id}`, {
      method: 'DELETE'
    });
  }

  public async seedDefaultCalendarEvents(): Promise<{ success: boolean; events: EducationalCalendarEvent[]; message: string }> {
    return this.request<{ success: boolean; events: EducationalCalendarEvent[]; message: string }>('/api/calendar/seed-defaults', {
      method: 'POST'
    });
  }

  public async dispatchCalendarToWhatsApp(toPhone?: string, filterType?: 'all' | 'exams' | 'activities'): Promise<{ success: boolean; message: string; data?: any }> {
    return this.request<{ success: boolean; message: string; data?: any }>('/api/whatsapp/dispatch-calendar', {
      method: 'POST',
      body: JSON.stringify({ toPhone, filterType })
    });
  }

  // --- Student Management (سجل وملفات الطلاب الشاملة) ---
  public async getStudents(gradeId?: string, section?: string): Promise<{ success: boolean; students: Student[] }> {
    const params = new URLSearchParams();
    if (gradeId && gradeId !== 'all') params.append('gradeId', gradeId);
    if (section && section !== 'all') params.append('section', section);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ success: boolean; students: Student[] }>(`/api/students${queryString}`);
  }

  public async getStudentById(id: string): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>(`/api/students/${id}`);
  }

  public async saveStudent(studentData: Partial<Student>): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  public async updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteStudent(id: string): Promise<{ success: boolean; deleted: boolean }> {
    return this.request<{ success: boolean; deleted: boolean }>(`/api/students/${id}`, {
      method: 'DELETE'
    });
  }

  public async addStudentGrade(studentId: string, gradeData: Omit<StudentGradeRecord, 'id'>): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>(`/api/students/${studentId}/grades`, {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  }

  public async deleteStudentGrade(studentId: string, gradeId: string): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>(`/api/students/${studentId}/grades/${gradeId}`, {
      method: 'DELETE'
    });
  }

  public async addStudentAttendance(studentId: string, attendanceData: Omit<StudentAttendanceRecord, 'id'>): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>(`/api/students/${studentId}/attendance`, {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  }

  public async addStudentNote(studentId: string, noteData: Omit<StudentPedagogicalNote, 'id'>): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>(`/api/students/${studentId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  }

  public async deleteStudentNote(studentId: string, noteId: string): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>(`/api/students/${studentId}/notes/${noteId}`, {
      method: 'DELETE'
    });
  }

  public async addStudentLetter(studentId: string, letterData: Omit<StudentOfficialLetterRef, 'id'>): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>(`/api/students/${studentId}/letters`, {
      method: 'POST',
      body: JSON.stringify(letterData)
    });
  }

  public async addStudentCustomField(studentId: string, fieldName: string, fieldValue: string): Promise<{ success: boolean; student: Student }> {
    return this.request<{ success: boolean; student: Student }>(`/api/students/${studentId}/custom-fields`, {
      method: 'POST',
      body: JSON.stringify({ fieldName, fieldValue })
    });
  }

  public async seedDefaultStudents(): Promise<{ success: boolean; students: Student[]; message: string }> {
    return this.request<{ success: boolean; students: Student[]; message: string }>('/api/students/seed-defaults', {
      method: 'POST'
    });
  }

  public async dispatchStudentReportToWhatsApp(studentId: string, toPhone?: string): Promise<{ success: boolean; message: string; data?: any }> {
    return this.request<{ success: boolean; message: string; data?: any }>('/api/whatsapp/dispatch-student-report', {
      method: 'POST',
      body: JSON.stringify({ studentId, toPhone })
    });
  }

  // --- Student Performance Alerts (تنبيهات انحدار الأداء ومقارنة متوسط الصف) ---
  public async getStudentAlerts(params?: {
    unreadOnly?: boolean;
    severity?: string;
    studentId?: string;
    section?: string;
  }): Promise<{
    success: boolean;
    alerts: StudentPerformanceAlert[];
    stats: { total: number; unread: number; critical: number; warning: number; notice: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.unreadOnly) searchParams.append('unreadOnly', 'true');
    if (params?.severity && params.severity !== 'all') searchParams.append('severity', params.severity);
    if (params?.studentId) searchParams.append('studentId', params.studentId);
    if (params?.section && params.section !== 'all') searchParams.append('section', params.section);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/api/students/alerts${queryString}`);
  }

  public async computeStudentAlerts(): Promise<{
    success: boolean;
    alerts: StudentPerformanceAlert[];
    stats: { total: number; unread: number; critical: number; warning: number; notice: number };
  }> {
    return this.request('/api/students/alerts/compute', { method: 'POST' });
  }

  public async markStudentAlertRead(alertId: string, isRead: boolean = true): Promise<{ success: boolean; alert: StudentPerformanceAlert }> {
    return this.request(`/api/students/alerts/${alertId}/read`, {
      method: 'POST',
      body: JSON.stringify({ isRead })
    });
  }

  public async markAllStudentAlertsRead(): Promise<{ success: boolean; updatedCount: number }> {
    return this.request('/api/students/alerts/mark-all-read', { method: 'POST' });
  }

  public async generateStudentAlertRemedialPlan(alertId: string): Promise<{ success: boolean; alert: StudentPerformanceAlert; remedialPlan: string }> {
    return this.request(`/api/students/alerts/${alertId}/remedial-plan`, { method: 'POST' });
  }

  public async notifyStudentAlertViaWhatsApp(alertId: string, customMessage?: string): Promise<{
    success: boolean;
    alert: StudentPerformanceAlert;
    messageText: string;
    targetPhone: string;
    sendResult: { success: boolean; message: string };
  }> {
    return this.request(`/api/students/alerts/${alertId}/notify-whatsapp`, {
      method: 'POST',
      body: JSON.stringify({ customMessage })
    });
  }

  // --- Geographic Center ---
  public async getGeographicResources(category?: string) {
    const params = category ? `?category=${category}` : '';
    return this.request<{ success: boolean; geographicResources: GeographicResource[] }>(`/api/geographic${params}`);
  }

  public async addGeographicResource(geo: Partial<GeographicResource>) {
    return this.request<{ success: boolean; geographicResource: GeographicResource }>('/api/geographic', {
      method: 'POST',
      body: JSON.stringify(geo)
    });
  }

  public async analyzeMap(params: {
    base64Data: string;
    mimeType?: string;
    title?: string;
    customPrompt?: string;
    userId?: string;
  }) {
    return this.request<{
      success: boolean;
      analysis: {
        summary: string;
        cartographicElements: {
          hasTitle: boolean;
          titleDetected?: string;
          hasLegend: boolean;
          legendDetails?: string;
          hasScale: boolean;
          scaleType?: string;
          hasCoordinates: boolean;
          hasNorthArrow: boolean;
        };
        spatialAnalysis: string;
        vision2040Relevance: string;
        curriculumLinkage: string;
        suggestedQuestions: Array<{
          level: 'معرفة' | 'تطبيق' | 'قدرات عليا';
          question: string;
          answerKey: string;
          points: number;
        }>;
      };
    }>('/api/geography/analyze-map', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }


  // --- External References ---
  public async getExternalReferences() {
    return this.request<{ success: boolean; externalReferences: ExternalReference[] }>('/api/external-references');
  }

  public async addExternalReference(ref: Partial<ExternalReference>) {
    return this.request<{ success: boolean; reference: ExternalReference }>('/api/external-references', {
      method: 'POST',
      body: JSON.stringify(ref)
    });
  }

  // --- Bookmarks ---
  public async getBookmarks(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request<{ success: boolean; bookmarks: any[] }>(`/api/bookmarks${params}`);
  }

  public async addBookmark(bookmark: any) {
    return this.request<{ success: boolean; bookmark: any }>('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify(bookmark)
    });
  }

  public async deleteBookmark(id: string) {
    return this.request<{ success: boolean }>(`/api/bookmarks/${id}`, { method: 'DELETE' });
  }

  // --- Backup & Restore ---
  public async getBackups(): Promise<{ success: boolean; backups: BackupJob[] }> {
    return this.request('/api/backup/list');
  }

  public async createBackup(): Promise<{ success: boolean; backup: BackupJob }> {
    return this.request('/api/backup/create', { method: 'POST' });
  }

  public async restoreBackup(filename: string): Promise<{ success: boolean; message: string; verifiedChecksum?: boolean }> {
    return this.request('/api/backup/restore', {
      method: 'POST',
      body: JSON.stringify({ filename })
    });
  }

  // --- Offline Sync Queue Dispatcher ---
  public async syncOfflineQueue(): Promise<{ success: boolean; appliedCount: number }> {
    const pending = await offlineDB.getPendingSyncQueue();
    if (pending.length === 0) return { success: true, appliedCount: 0 };

    const operations = pending.map(item => ({
      id: item.id,
      entityType: item.entityType,
      entityId: item.entityId,
      operation: item.operation,
      payload: item.payload,
      clientTimestamp: item.clientTimestamp
    }));

    const res = await this.request<{ success: boolean; appliedCount: number }>('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ operations })
    });

    if (res.success) {
      await offlineDB.clearSyncQueue();
    }
    return res;
  }

  // --- Audit Logs ---
  public async getAuditLogs(): Promise<{ success: boolean; auditLogs: AuditLog[] }> {
    return this.request('/api/audit-logs');
  }

  // --- School Profile & Letterhead ---
  public async getSchoolProfile(): Promise<{ success: boolean; schoolProfile: SchoolProfile }> {
    return this.request('/api/school-profile');
  }

  public async updateSchoolProfile(profile: Partial<SchoolProfile>, cascade: boolean = true, userId?: string): Promise<{ success: boolean; schoolProfile: SchoolProfile }> {
    return this.request('/api/school-profile', {
      method: 'PUT',
      body: JSON.stringify({ profile, cascade, userId })
    });
  }

  // --- WhatsApp Integration & Assistant Bot ---
  public async getWhatsAppConfig(): Promise<{ success: boolean; config: WhatsAppConfig }> {
    return this.request('/api/whatsapp/config');
  }

  public async updateWhatsAppConfig(updates: Partial<WhatsAppConfig>, requesterId?: string): Promise<{ success: boolean; config: WhatsAppConfig; message: string }> {
    return this.request('/api/whatsapp/config', {
      method: 'PUT',
      body: JSON.stringify({ updates, requesterId })
    });
  }

  public async getWhatsAppLogs(): Promise<{ success: boolean; logs: WhatsAppMessageLog[] }> {
    return this.request('/api/whatsapp/logs');
  }

  public async clearWhatsAppLogs(): Promise<{ success: boolean; message: string }> {
    return this.request('/api/whatsapp/logs', {
      method: 'DELETE'
    });
  }

  public async simulateWhatsAppMessage(data: { message: string; fromPhone?: string; senderName?: string }): Promise<{
    success: boolean;
    result: {
      replyText: string;
      intent: WhatsAppMessageLog['intent'];
      generatedLessonId?: string;
      lesson?: any;
      authorized: boolean;
      status: 'replied' | 'failed';
    };
  }> {
    return this.request('/api/whatsapp/simulate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async sendLiveWhatsAppTest(data: {
    toPhone: string;
    messageText?: string;
    phoneNumberId?: string;
    accessToken?: string;
    sendLesson?: boolean;
    useTemplate?: boolean;
  }): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    return this.request('/api/whatsapp/send-test', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- Document PDF Upload (for WhatsApp sharing and permanent archival) ---
  public async uploadDocumentPdf(dataUrl: string, filename: string): Promise<{ success: boolean; url: string; fullUrl: string; filename: string; message: string }> {
    return this.request('/api/documents/upload-pdf', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename })
    });
  }

  public async dispatchLessonToWhatsApp(data: {
    toPhone?: string;
    lessonTitle?: string;
    lessonContent?: string;
    grade?: string;
    subject?: string;
    pdfUrl?: string;
    pdfFilename?: string;
  }): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    return this.request('/api/whatsapp/dispatch-lesson', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async dispatchAnnualPlanToWhatsApp(data: {
    toPhone?: string;
    planId?: string;
    planData?: any;
    pdfUrl?: string;
    pdfFilename?: string;
  }): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    return this.request('/api/whatsapp/dispatch-annual-plan', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async dispatchTimetableToWhatsApp(data: {
    toPhone?: string;
    dayFilter?: 'today' | 'all';
    pdfUrl?: string;
    pdfFilename?: string;
  }): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    return this.request('/api/whatsapp/dispatch-timetable', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async dispatchLetterToWhatsApp(data: {
    toPhone?: string;
    letterId?: string;
    letterData?: any;
    pdfUrl?: string;
    pdfFilename?: string;
  }): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    return this.request('/api/whatsapp/dispatch-letter', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async sendCustomWhatsAppMessage(data: {
    toPhone: string;
    messageText: string;
    useTemplate?: boolean;
  }): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    return this.request('/api/whatsapp/send-test', {
      method: 'POST',
      body: JSON.stringify({ ...data, useTemplate: data.useTemplate ?? false })
    });
  }

  public async sendDirectInboundWhatsAppMessage(data: {
    message: string;
    fromPhone?: string;
    senderName?: string;
  }): Promise<{
    success: boolean;
    result?: any;
    metaDispatched?: boolean;
    metaError?: string;
    message?: string;
    error?: string;
  }> {
    return this.request('/api/whatsapp/inbound-receive', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async testWebhookPing(): Promise<{
    success: boolean;
    token: string;
    challengeReturned: string;
    message: string;
    error?: string;
  }> {
    return this.request('/api/whatsapp/test-webhook-ping');
  }

  // --- Oman Vision 2040 Education Framework ---
  public async getVision2040Goals(): Promise<{
    success: boolean;
    goals: OmanVision2040Goal[];
    stats?: {
      totalLessons: number;
      alignedLessons: number;
      lessonAlignmentRate: number;
      totalResources: number;
      alignedResources: number;
      resourceAlignmentRate: number;
      goalStats: Array<{
        code: string;
        title: string;
        priority: string;
        pillar: string;
        lessonCount: number;
        resourceCount: number;
      }>;
    };
  }> {
    return this.request('/api/vision2040');
  }

  public async updateLessonVision2040(lessonId: string, vision2040Goals: Array<{ code: string; goalTitle: string; applicationInLesson: string }>, userId?: string): Promise<{ success: boolean; lesson: GeneratedLesson }> {
    return this.request(`/api/lessons/${lessonId}/vision2040`, {
      method: 'PUT',
      body: JSON.stringify({ vision2040Goals, userId })
    });
  }

  public async updateResourceVision2040(resourceId: string, vision2040Tags: string[], userId?: string): Promise<{ success: boolean; resource: Resource }> {
    return this.request(`/api/resources/${resourceId}/vision2040`, {
      method: 'PUT',
      body: JSON.stringify({ vision2040Tags, userId })
    });
  }
}

export const api = new ApiClient();

