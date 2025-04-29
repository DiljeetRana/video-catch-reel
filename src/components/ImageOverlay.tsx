
import React from "react";
import { ImageOverlayProps } from "../types/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ImageOverlay: React.FC<ImageOverlayProps> = ({ timestamp, lakeName, weight }) => {
  const formattedDate = new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  
  const formattedTime = new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
      <motion.div 
        className="bg-black bg-opacity-50 p-3 rounded-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <motion.div 
            className="text-left"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h3 className="font-bold text-lg tracking-wide">{lakeName}</h3>
            <p className="text-sm opacity-90">{formattedDate} • {formattedTime}</p>
          </motion.div>
          
          <motion.div 
            className={cn(
              "flex items-center justify-center rounded-full h-16 w-16 bg-blue-500 shadow-lg",
              "border-2 border-white font-bold"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 15, 0] }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
          >
            <div>
              <div className="text-sm leading-none">CATCH</div>
              <div className="text-xl">{weight} <span className="text-xs">LBS</span></div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageOverlay;
