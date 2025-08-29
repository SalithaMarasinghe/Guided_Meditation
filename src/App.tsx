import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SidePanel } from './components/SidePanel';
import { ProgramPage } from './components/ProgramPage';
import { AdminDashboard } from './components/NewAdminDashboard';
import { FirebaseService } from './services/firebaseService';
import { MeditationProgram } from './types';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Main App Component with Authentication
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

// Component to handle routing
const AppRoutes = () => {
  const location = useLocation();
  
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute>
            <AdminApp />
          </ProtectedRoute>
        } 
      />
      <Route path="/*" element={<UserApp />} />
    </Routes>
  );
};

// Component for Admin Interface
const AdminApp = () => {
  const [programs, setPrograms] = useState<MeditationProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseService.onProgramsChange((newPrograms) => {
      setPrograms(newPrograms);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshPrograms = async () => {
    try {
      const newPrograms = await FirebaseService.getPrograms();
      setPrograms(newPrograms);
    } catch (error) {
      console.error('Error refreshing programs:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard 
        programs={programs}
        onProgramsChange={refreshPrograms}
      />
    </div>
  );
};

// Component for User Interface
const UserApp = () => {
  const [programs, setPrograms] = useState<MeditationProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<MeditationProgram | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseService.onProgramsChange((newPrograms) => {
      setPrograms(newPrograms);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSelectProgram = (program: MeditationProgram) => {
    setSelectedProgram(program);
    setCurrentPageIndex(0);
    setCompletedVideos([]);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top when page changes
  useEffect(() => {
    scrollToTop();
  }, [currentPageIndex]);

  const scrollToVideoPlayer = () => {
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer) {
      videoPlayer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (!selectedProgram) return;
    if (currentPageIndex < selectedProgram.pages.length - 1) {
      setCurrentPageIndex(prev => {
        // Use setTimeout to ensure the new content is rendered before scrolling
        setTimeout(scrollToVideoPlayer, 0);
        return prev + 1;
      });
    }
  };

  const handlePreviousPage = () => {
    if (!selectedProgram) return;
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => {
        // Use setTimeout to ensure the new content is rendered before scrolling
        setTimeout(scrollToVideoPlayer, 0);
        return prev - 1;
      });
    }
  };

  const handleVideoComplete = (videoId: string) => {
    setCompletedVideos(prev => 
      prev.includes(videoId) ? prev : [...prev, videoId]
    );
  };

  // Admin toggle is handled by navigation in the SidePanel component

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading meditation programs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidePanel
        programs={programs}
        selectedProgram={selectedProgram}
        onSelectProgram={handleSelectProgram}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {selectedProgram ? (
          <div className="max-w-4xl mx-auto">
            <ProgramPage 
              programPage={{
                ...selectedProgram.pages[currentPageIndex],
                programResources: selectedProgram.resources
              }} 
              programName={selectedProgram.name}
              onNextPage={handleNextPage}
              hasNextPage={currentPageIndex < selectedProgram.pages.length - 1}
              onVideoComplete={handleVideoComplete}
              completedVideos={completedVideos}
            />
            <div className="mt-8 flex justify-between">
              <button
                onClick={handlePreviousPage}
                disabled={currentPageIndex === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="inline mr-1" /> Previous Page
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPageIndex >= selectedProgram.pages.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                Next Page <ChevronRight className="inline ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <BookOpen className="w-12 h-12 mb-4 opacity-50" />
            <p>Select a program to get started</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;