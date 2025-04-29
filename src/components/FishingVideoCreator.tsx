
import React, { useState } from "react";
import { SelectedImage, ImageOverlayProps } from "../types/types";
import { createVideoFromImages, downloadVideo, shareToSocialMedia } from "../utils/videoUtils";
import ImageSelector from "./ImageSelector";
import SelectedImagesPreview from "./SelectedImagesPreview";
import VideoPreview from "./VideoPreview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Facebook, Twitter, Instagram, Video, Download, Play, Share, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Sample placeholder images - in a real app, these would come from an API or local storage
const sampleImages = [
  "https://images.unsplash.com/photo-1493787039806-2edcbe808750?w=500&h=500&q=80",
  "https://images.unsplash.com/photo-1516552925356-6e81487d370a?w=500&h=500&q=80",
  "https://images.unsplash.com/photo-1516305352227-74de5d775393?w=500&h=500&q=80",
  "https://images.unsplash.com/photo-1507808973436-a4ed7b5e87c9?w=500&h=500&q=80",
  "https://images.unsplash.com/photo-1513036191774-b2badb8fcb76?w=500&h=500&q=80",
  "https://images.unsplash.com/photo-1593625015177-84077ee97523?w=500&h=500&q=80",
  "https://images.unsplash.com/photo-1525683879097-0258d2e342f5?w=500&h=500&q=80",
  "https://images.unsplash.com/photo-1460648304944-4235e39314b9?w=500&h=500&q=80",
];

const FishingVideoCreator: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [createdVideoBlob, setCreatedVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [secondsPerFrame, setSecondsPerFrame] = useState<number>(2);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const { toast } = useToast();

  // Calculate the estimated video duration based on the number of images and seconds per frame
  const calculateVideoDuration = () => {
    return selectedImages.length * secondsPerFrame;
  };

  const handleSelectImage = (image: SelectedImage) => {
    if (image.selected) {
      // Add new image
      setSelectedImages((prev) => [...prev, image]);
    } else {
      // Remove image
      setSelectedImages((prev) => 
        prev.filter((img) => img.id !== image.id)
      );
    }
  };

  const handleRemoveImage = (id: number) => {
    setSelectedImages((prev) =>
      prev.filter((image) => image.id !== id)
    );
  };

  const handleUpdateImageDetails = (id: number, details: Partial<ImageOverlayProps>) => {
    setSelectedImages((prev) =>
      prev.map((image) =>
        image.id === id ? { ...image, ...details } : image
      )
    );
  };

  const handleCreateVideo = async () => {
    if (selectedImages.filter(img => img.selected).length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to create a video",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingVideo(true);
    try {
      // Calculate FPS as 1/secondsPerFrame
      const fps = 1 / secondsPerFrame;
      const { videoBlob, videoUrl } = await createVideoFromImages(selectedImages, fps);
      setCreatedVideoBlob(videoBlob);
      setVideoUrl(videoUrl);
      
      // Set video duration
      const duration = calculateVideoDuration();
      setVideoDuration(duration);
      
      toast({
        title: "Video created successfully!",
        description: "Your fishing catch video is ready to share or download.",
      });
    } catch (error) {
      toast({
        title: "Error creating video",
        description: "There was an error creating your video. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating video:", error);
    } finally {
      setIsCreatingVideo(false);
    }
  };

  const handleShareVideo = (platform: "facebook" | "twitter" | "instagram") => {
    if (!videoUrl) {
      toast({
        title: "No video to share",
        description: "Please create a video first",
        variant: "destructive",
      });
      return;
    }

    shareToSocialMedia(videoUrl, platform);
    toast({
      title: "Sharing video",
      description: `Opening ${platform} share dialog...`,
    });
  };

  const handleDownloadVideo = () => {
    if (!createdVideoBlob) {
      toast({
        title: "No video to download",
        description: "Please create a video first",
        variant: "destructive",
      });
      return;
    }

    downloadVideo(createdVideoBlob);
    toast({
      title: "Downloading video",
      description: "Your video download has started",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-blue-700">
          Fishing Catch Video Creator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select images of your fishing catches, add details, and create shareable videos to showcase your best moments on the water
        </p>
      </motion.div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Selected Images</h2>
        <SelectedImagesPreview
          selectedImages={selectedImages}
          onRemoveImage={handleRemoveImage}
          onUpdateImageDetails={handleUpdateImageDetails}
        />
      </div>

      {/* Video settings section */}
      <div className="mb-8 bg-white rounded-lg p-5 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Video Settings
        </h2>
        
        <div className="mb-4">
          <Label htmlFor="secondsPerFrame" className="mb-2 block">
            Seconds per Frame: {secondsPerFrame}s
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">0.5s</span>
            <Slider
              id="secondsPerFrame"
              defaultValue={[2]}
              min={0.5}
              max={5}
              step={0.5}
              value={[secondsPerFrame]}
              onValueChange={(value) => setSecondsPerFrame(value[0])}
              className="max-w-xs"
            />
            <span className="text-sm text-gray-500">5s</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 flex items-center">
          <span>Estimated video duration: </span>
          <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            {selectedImages.length > 0 ? `${calculateVideoDuration()} seconds` : "0 seconds"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 justify-center sm:justify-start">
        <Button
          onClick={handleCreateVideo}
          disabled={isCreatingVideo || selectedImages.filter(img => img.selected).length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          {isCreatingVideo ? (
            <>Creating Video...</>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Create Video
            </>
          )}
        </Button>

        {videoUrl && (
          <>
            <Button onClick={handleDownloadVideo} variant="outline" className="border-blue-500 text-blue-500">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleShareVideo("facebook")} 
                variant="outline"
                className="border-blue-600 text-blue-600"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={() => handleShareVideo("twitter")} 
                variant="outline"
                className="border-sky-500 text-sky-500"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={() => handleShareVideo("instagram")} 
                variant="outline"
                className="border-pink-600 text-pink-600"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {videoUrl && (
        <div className="mb-8">
          <VideoPreview videoUrl={videoUrl} duration={videoDuration} />
        </div>
      )}

      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
          <TabsTrigger value="info">How It Works</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gallery">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Select Images for Your Video
            </h2>
            <ImageSelector
              images={sampleImages}
              selectedImages={selectedImages}
              onSelectImage={handleSelectImage}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="info">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">How To Create Your Fishing Video</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div>
                  <h3 className="font-medium">Select Images</h3>
                  <p className="text-gray-600 text-sm">Click on images in the gallery to add them to your video. Selected images will be marked with a checkmark.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div>
                  <h3 className="font-medium">Customize Details</h3>
                  <p className="text-gray-600 text-sm">Hover over selected images and click "Edit Lake" or "Edit Weight" to customize the details shown on your video.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div>
                  <h3 className="font-medium">Create & Share</h3>
                  <p className="text-gray-600 text-sm">Click "Create Video" to generate your fishing video, then download or share it to your favorite social media platforms.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FishingVideoCreator;
