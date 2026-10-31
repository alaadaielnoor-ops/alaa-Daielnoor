import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Sidebar } from './components/Layout/Sidebar.tsx';
import { Header } from './components/Layout/Header.tsx';
import { ToastContainer } from './components/Layout/ToastContainer.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { UploadModal } from './components/Library/UploadModal.tsx';
import { EditUserModal } from './components/Users/EditUserModal.tsx';

// Views
import { DashboardView } from './components/Dashboard/DashboardView.tsx';
import { LibraryView } from './components/Library/LibraryView.tsx';
import { TaxonomyView } from './components/Taxonomy/TaxonomyView.tsx';
import { AnnualPlansView } from './components/AnnualPlans/AnnualPlansView.tsx';
import { WeeklyTimetableView } from './components/Timetable/WeeklyTimetableView.tsx';
import { EducationalCalendarView } from './components/EducationalCalendar/EducationalCalendarView.tsx';
import { StudentsManagementView } from './components/Students/StudentsManagementView.tsx';
import { OfficialLettersView } from './components/Letters/OfficialLettersView.tsx';
import { SearchView } from './components/Search/SearchView.tsx';
import { AssistantView } from './components/Assistant/AssistantView.tsx';
import { LessonStudioView } from './components/LessonStudio/LessonStudioView.tsx';
import { WorksheetStudioView } from './components/WorksheetStudio/WorksheetStudioView.tsx';
import { AssessmentStudioView } from './components/AssessmentStudio/AssessmentStudioView.tsx';
import { PresentationStudioView } from './components/PresentationStudio/PresentationStudioView.tsx';
import { GeographyCenterView } from './components/GeographyCenter/GeographyCenterView.tsx';
import { OmanWaterAtlasView } from './components/OmanWaterAtlas3D/OmanWaterAtlasView.tsx';
import { GeologicalMapsGallery } from './components/GeologicalMaps/GeologicalMapsGallery.tsx';
import { Geological3DStudio } from './components/Geology3D/Geological3DStudio.tsx';
import { ExternalReferencesView } from './components/ExternalReferences/ExternalReferencesView.tsx';
import { BookmarksView } from './components/Bookmarks/BookmarksView.tsx';
import { SyncBackupView } from './components/SyncBackup/SyncBackupView.tsx';
import { SettingsView } from './components/Settings/SettingsView.tsx';
import { UsersManagementView } from './components/Users/UsersManagementView.tsx';
import { ErrorBoundary } from './components/Common/ErrorBoundary.tsx';
import { EditSchoolProfileModal } from './components/Common/EditSchoolProfileModal.tsx';
import { WhatsAppIntegrationHub } from './components/Settings/WhatsAppIntegrationHub.tsx';
import { PedagogicalFrameworkView } from './components/Pedagogy/PedagogicalFrameworkView.tsx';

const AppContent: React.FC = () => {
  const {
    activeView,
    refreshStats,
    isEditUserModalOpen,
    closeEditUserModal,
    userToEdit,
    isSchoolProfileModalOpen,
    closeSchoolProfileModal
  } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onOpenUpload={() => setUploadModalOpen(true)} />;
      case 'library':
        return <LibraryView onOpenUpload={() => setUploadModalOpen(true)} />;
      case 'users':
        return <UsersManagementView />;
      case 'students':
        return <StudentsManagementView />;
      case 'taxonomy':
        return <TaxonomyView />;
      case 'annual_plans':
        return <AnnualPlansView />;
      case 'timetable':
        return <WeeklyTimetableView />;
      case 'educational_calendar':
        return <EducationalCalendarView />;
      case 'letters':
        return <OfficialLettersView />;
      case 'search':
        return <SearchView />;
      case 'assistant':
        return <AssistantView />;
      case 'lesson_studio':
        return <LessonStudioView />;
      case 'worksheets':
        return <WorksheetStudioView />;
      case 'assessments':
        return <AssessmentStudioView />;
      case 'presentations':
        return <PresentationStudioView />;
      case 'geography':
        return <GeographyCenterView />;
      case 'water_atlas_3d':
        return <OmanWaterAtlasView />;
      case 'geological_maps':
        return <GeologicalMapsGallery />;
      case 'geological_3d':
        return <Geological3DStudio />;
      case 'external_references':
        return <ExternalReferencesView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'sync_backup':
        return <SyncBackupView />;
      case 'settings':
        return <SettingsView />;
      case 'whatsapp':
        return <WhatsAppIntegrationHub />;
      case 'pedagogy':
        return <PedagogicalFrameworkView />;
      default:
        return <DashboardView onOpenUpload={() => setUploadModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-teal-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace (Offset for RTL right sidebar on desktop: mr-72) */}
      <div className="flex-1 flex flex-col min-w-0 md:mr-72 transition-all duration-300">
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
          onOpenUploadModal={() => setUploadModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {renderActiveView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          refreshStats();
        }}
      />

      {/* Persistent Offline & Sync Status Indicator */}
      <OfflineIndicator />

      {/* Global Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={closeEditUserModal}
        user={userToEdit}
      />

      {/* Global Edit School Profile & Letterhead Modal */}
      <EditSchoolProfileModal
        isOpen={isSchoolProfileModalOpen}
        onClose={closeSchoolProfileModal}
      />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
