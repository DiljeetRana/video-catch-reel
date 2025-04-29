
import React from "react";
import { VideoPreviewProps } from "../types/types";
import { motion } from "framer-motion";

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl }) => {
  if (!videoUrl) {
    return null;
  }

  return (
    <motion.div 
      className="rounded-lg overflow-hidden shadow-lg bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 bg-blue-600 text-white font-medium">
        Video Preview
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
