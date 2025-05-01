
import React from "react";
import { SelectedImage } from "../types/types";
import { generateRandomLakeName } from "../utils/videoUtils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import ImageOverlay from "./ImageOverlay";

interface ImageSelectorProps {
  images: string[];
  selectedImages: SelectedImage[];
  onSelectImage: (image: SelectedImage) => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  images,
  selectedImages,
  onSelectImage,
}) => {
  const handleImageClick = (imageSrc: string) => {
    const existingImage = selectedImages.find((img) => img.src === imageSrc);
    
    if (existingImage) {
      // Deselect the image
      onSelectImage({ ...existingImage, selected: false });
    } else {
      // Select the image with new random data
      const newImage: SelectedImage = {
        id: Date.now(),
        src: imageSrc,
        timestamp: new Date(),
        lakeName: generateRandomLakeName(),
        weight: parseFloat((Math.random() * 20 + 1).toFixed(1)), // Random weight between 1-21 lbs
        selected: true,
      };
      onSelectImage(newImage);
    }
  };

  const isSelected = (imageSrc: string) => {
    return selectedImages.some((img) => img.src === imageSrc && img.selected);
  };

  const getImageDetails = (imageSrc: string) => {
    const selectedImage = selectedImages.find((img) => img.src === imageSrc);
    if (selectedImage) {
      return {
        timestamp: selectedImage.timestamp,
        lakeName: selectedImage.lakeName,
        weight: selectedImage.weight
      };
    }
    
    // For unselected images, generate temporary details just for display
    return {
      timestamp: new Date(),
      lakeName: generateRandomLakeName(),
      weight: parseFloat((Math.random() * 20 + 1).toFixed(1))
    };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => {
        const imageDetails = getImageDetails(image);
        return (
          <motion.div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleImageClick(image)}
          >
            <img
              src={image}
              alt={`Fishing image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            <ImageOverlay 
              timestamp={imageDetails.timestamp} 
              lakeName={imageDetails.lakeName} 
              weight={imageDetails.weight} 
            />
            
            <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity group-hover:bg-opacity-30" />
            
            {isSelected(image) && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ImageSelector;
