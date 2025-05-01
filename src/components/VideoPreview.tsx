
import React from "react";
import { VideoPreviewProps } from "../types/types";
import { motion } from "framer-motion";
import { Clock, Video, LoaderCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const VideoPreview: React.FC<VideoPreviewProps & { isLoading?: boolean }> = ({ 
  videoUrl, 
  duration,
  isLoading = false,
  className = "" 
}) => {
  const isMobile = useIsMobile();
  
  // Format the duration nicely
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className={`rounded-lg overflow-hidden shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`p-${isMobile ? '2' : '4'} bg-blue-600 text-white font-medium flex justify-between items-center`}>
        <div className="flex items-center">
          <Video className={`${isMobile ? 'w-4 h-4 mr-1' : 'w-5 h-5 mr-2'}`} />
          <span className={`${isMobile ? 'text-sm' : ''}`}>Video Preview</span>
        </div>
        <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <Clock className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1'}`} />
          <span>Duration: {formatDuration(duration)}</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center bg-black w-full h-40 text-white p-4">
          <LoaderCircle className="animate-spin h-10 w-10 mb-2" />
          <p>Generating video preview...</p>
        </div>
      ) : videoUrl ? (
        <video 
          src={videoUrl}
          controls
          controlsList="nodownload" 
          className="w-full h-full bg-black" 
          playsInline // Better for mobile
        />
      ) : (
        <div className="bg-gray-800 w-full h-40 flex items-center justify-center text-gray-400">
          <p>No video available</p>
        </div>
      )}
    </motion.div>
  );
};

export default VideoPreview;
