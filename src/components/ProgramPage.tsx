import React, { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { ChevronRight, BookOpen, Download } from 'lucide-react';
import { Timer } from './Timer';
import { ProgramPage as ProgramPageType, Video, Resource } from '../types';
import { ResourcesDownload } from './ResourcesDownload';

interface ProgramPageProps {
  programPage: ProgramPageType & {
    programResources?: Resource[];
  };
  programName: string;
  onNextPage?: () => void;
  hasNextPage?: boolean;
  onVideoComplete?: (videoId: string) => void;
  completedVideos: string[];
}

export const ProgramPage: React.FC<ProgramPageProps> = ({
  programPage,
  programName,
  onNextPage,
  hasNextPage,
  onVideoComplete,
  completedVideos = []
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(programPage.videos[0] || null);
  
  const handleVideoEnd = (video: Video) => {
    onVideoComplete?.(video.id);
  };

  // Debug log the video data
  console.log('Selected Video:', selectedVideo);
  console.log('All Videos:', programPage.videos);

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Program Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{programName}</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Instructions for This Session</h2>
              <div className="prose prose-blue max-w-none">
                {programPage.instructions.split('\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {selectedVideo && (
        <div className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Video</h3>
            <VideoPlayer
              video={selectedVideo}
              onEnded={() => handleVideoEnd(selectedVideo)}
              className="mb-4"
            />
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">{selectedVideo.name}</h4>
              <p className="text-gray-600">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video List */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Page Videos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programPage.videos.map((video, index) => (
            <div
              key={video.id}
              className={`bg-white rounded-lg p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
                selectedVideo?.id === video.id 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-100 hover:border-gray-200'
              } ${completedVideos.includes(video.id) ? 'bg-green-50' : ''}`}
            >
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">Video {index + 1}</span>
                    {completedVideos.includes(video.id) && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{video.name}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                </div>
                {selectedVideo?.id === video.id && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-3 mt-1"></div>
                )}
              </div>
              
              {/* Download Button for Individual Video */}
              {video.downloadUrl && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = video.downloadUrl!;
                      link.download = video.downloadFileName || `${video.name}-resources.zip`;
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all duration-200 w-full justify-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Resources</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resources Section */}
      <div className="mt-8 space-y-8">
        {((programPage.resources && programPage.resources.length > 0) || (programPage.programResources && programPage.programResources.length > 0)) && (
          <div>
            <ResourcesDownload 
              resources={[
                ...(programPage.resources || []),
                ...(programPage.programResources || [])
              ]} 
            />
          </div>
        )}
        
        {/* Timer Section */}
        <div>
          <Timer />
        </div>
      </div>

      {/* Next Page Button */}
      {hasNextPage && onNextPage && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={onNextPage}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next Page
            <ChevronRight className="ml-2 -mr-1 w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};