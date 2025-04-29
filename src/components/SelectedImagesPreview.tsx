
import React from "react";
import { SelectedImage, ImageOverlayProps } from "../types/types";
import ImageOverlay from "./ImageOverlay";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface SelectedImagesPreviewProps {
  selectedImages: SelectedImage[];
  onRemoveImage: (id: number) => void;
  onUpdateImageDetails: (id: number, details: Partial<ImageOverlayProps>) => void;
}

const SelectedImagesPreview: React.FC<SelectedImagesPreviewProps> = ({
  selectedImages,
  onRemoveImage,
  onUpdateImageDetails,
}) => {
  if (!selectedImages.filter(img => img.selected).length) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No images selected</p>
        <p className="text-sm text-gray-400 mt-1">
          Select images from the gallery below to create your video
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {selectedImages
          .filter((image) => image.selected)
          .map((image, index) => (
            <motion.div
              key={image.id}
              className="relative aspect-square rounded-lg overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <img
                src={image.src}
                alt={`Selected fishing image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              <ImageOverlay 
                timestamp={image.timestamp} 
                lakeName={image.lakeName} 
                weight={image.weight} 
              />
              
              <button
                onClick={() => onRemoveImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2 text-xs">
                  <button 
                    className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded hover:bg-white/30 text-white"
                    onClick={() => onUpdateImageDetails(image.id, { 
                      lakeName: prompt("Enter lake name:", image.lakeName) || image.lakeName 
                    })}
                  >
                    Edit Lake
                  </button>
                  <button 
                    className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded hover:bg-white/30 text-white"
                    onClick={() => {
                      const weight = prompt("Enter catch weight (lbs):", image.weight.toString());
                      if (weight) {
                        onUpdateImageDetails(image.id, { weight: parseFloat(weight) });
                      }
                    }}
                  >
                    Edit Weight
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default SelectedImagesPreview;
