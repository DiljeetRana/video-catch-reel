
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

  return (
    <div className="absolute inset-0 flex flex-col justify-end p-2 text-white pointer-events-none">
      <motion.div 
        className="bg-black bg-opacity-40 p-2 rounded-md backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-0.5">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h3 className="font-medium text-sm tracking-wide text-white">{lakeName}</h3>
          </motion.div>
          
          <motion.div 
            className="flex justify-between items-center text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <span className="text-gray-200">{formattedDate}</span>
            <div className="text-gray-200">
              <span>Weight: </span>
              <span className="font-semibold text-white">{weight} lbs</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageOverlay;
