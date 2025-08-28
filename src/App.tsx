import React, { useState, useEffect } from 'react';
import { SidePanel } from './components/SidePanel';
import { ProgramPage } from './components/ProgramPage';
import { AdminDashboard } from './components/AdminDashboard';
import { FirebaseService } from './services/firebaseService';
import { MeditationProgram } from './types';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [programs, setPrograms] = useState<MeditationProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<MeditationProgram | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
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
    setIsAdminMode(false);
  };

  const handleNextPage = () => {
    if (selectedProgram && currentPageIndex < selectedProgram.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleVideoComplete = (videoId: string) => {
    setCompletedVideos(prev => 
      prev.includes(videoId) ? prev : [...prev, videoId]
    );
  };

  const handleAdminToggle = () => {
    setIsAdminMode(!isAdminMode);
    if (!isAdminMode) {
      setSelectedProgram(null);
    }
  };

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
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
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
        onAdminClick={handleAdminToggle}
        isAdminMode={isAdminMode}
      />
      
      {isAdminMode ? (
        <AdminDashboard
          programs={programs}
          onProgramsChange={refreshPrograms}
        />
      ) : selectedProgram ? (
        selectedProgram.pages.length > 0 ? (
          <div className="flex-1 flex flex-col">
            {/* Page Navigation Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Page {currentPageIndex + 1} of {selectedProgram.pages.length}
                  </h2>
                  <div className="flex items-center space-x-2">
                    {selectedProgram.pages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentPageIndex
                            ? 'bg-blue-600'
                            : index < currentPageIndex
                            ? 'bg-green-500'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPageIndex === 0}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPageIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPageIndex >= selectedProgram.pages.length - 1}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPageIndex >= selectedProgram.pages.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Program Page Content */}
            <ProgramPage
              programPage={selectedProgram.pages[currentPageIndex]}
              programName={selectedProgram.name}
              onNextPage={handleNextPage}
              hasNextPage={currentPageIndex < selectedProgram.pages.length - 1}
              onVideoComplete={handleVideoComplete}
              completedVideos={completedVideos}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Pages Available</h2>
              <p className="text-gray-600">This program doesn't have any pages yet.</p>
              {isAdminMode && (
                <p className="text-gray-500 text-sm mt-2">Add pages in the admin dashboard.</p>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Meditation Journey</h2>
            <p className="text-gray-600 mb-6">
              Select a meditation program from the sidebar to begin your mindful practice.
            </p>
            <div className="text-sm text-gray-500">
              {programs.length === 0 ? (
                <>
                  <p>No programs available yet.</p>
                  <p className="mt-2">Use the admin dashboard to create your first program.</p>
                </>
              ) : (
                <p>Choose from {programs.length} available programs</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;