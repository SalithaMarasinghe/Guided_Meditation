import React from 'react';
import { MeditationProgram } from '../types';
import { Play, Settings } from 'lucide-react';

interface SidePanelProps {
  programs: MeditationProgram[];
  selectedProgram: MeditationProgram | null;
  onSelectProgram: (program: MeditationProgram) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  programs,
  selectedProgram,
  onSelectProgram
}) => {
  const renderProgramsList = () => {
    if (programs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No programs available</p>
        </div>
      );
    }

    return (
      <>
        {[...programs].reverse().map(program => (
          <button
            key={program.id}
            onClick={() => onSelectProgram(program)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 group ${
              selectedProgram?.id === program.id
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {program.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {program.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {program.pages.length} pages
                  </span>
                  {selectedProgram?.id === program.id && (
                    <Play className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </>
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Meditation</h1>
        <p className="text-gray-600 text-sm">Find your inner peace</p>
      </div>

      <div className="p-4 border-b border-gray-100">
        <a
          href="/admin/dashboard"
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Admin Dashboard</span>
        </a>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {renderProgramsList()}
        </div>
      </div>
    </div>
  );
};