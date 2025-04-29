
import React from "react";
import { VideoPreviewProps } from "../types/types";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, duration }) => {
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
      className="rounded-lg overflow-hidden shadow-lg bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 bg-blue-600 text-white font-medium flex justify-between items-center">
        <span>Video Preview</span>
        <div className="flex items-center text-sm">
          <Clock className="w-4 h-4 mr-1" />
          <span>Duration: {formatDuration(duration)}</span>
        </div>
      </div>
      <video 
        src={videoUrl}
        controls
        className="w-full aspect-video bg-black" 
        autoPlay
      />
    </motion.div>
  );
};

export default VideoPreview;
