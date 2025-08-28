import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react';
import { Video } from '../types';

interface VideoPlayerProps {
  video: Video;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  className?: string;
  showDownload?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onProgress,
  onEnded,
  className = '',
  showDownload = false
}) => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    setProgress(state.played);
    onProgress?.(state.played);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = clickX / rect.width;
    playerRef.current?.seekTo(newProgress);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

return (
    <div className="space-y-4">
      <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`} ref={containerRef}>
      <ReactPlayer
        ref={playerRef}
        url={video.url}
        playing={playing}
        muted={muted}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        style={{ aspectRatio: '16/9' }}
      />
      
      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Main Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-all duration-200 backdrop-blur-sm"
          >
            {playing ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div 
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setMuted(!muted)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="bg-black/50 text-white text-sm px-2 py-1 rounded border border-white/20"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              <span className="text-white text-sm">
                {formatTime(progress * duration)} / {formatTime(duration)}
              </span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
};