
import React from "react";
import { VideoPreviewProps } from "../types/types";
import { motion } from "framer-motion";
import { Clock, Video } from "lucide-react";

const VideoPreview: React.FC<VideoPreviewProps> = ({ 
  videoUrl, 
  duration,
  className = "" 
}) => {
  if (!videoUrl) {
    return null;
  }

  // Format the duration nicely
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className={`rounded-lg overflow-hidden shadow-lg bg-white ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 bg-blue-600 text-white font-medium flex justify-between items-center">
        <div className="flex items-center">
          <Video className="w-5 h-5 mr-2" />
          <span>Video Preview</span>
        </div>
        <div className="flex items-center text-sm">
          <Clock className="w-4 h-4 mr-1" />
          <span>Duration: {formatDuration(duration)}</span>
        </div>
      </div>
      <video 
        src={videoUrl}
        controls
        className="w-full aspect-video bg-black" 
      />
    </motion.div>
  );
};

export default VideoPreview;
