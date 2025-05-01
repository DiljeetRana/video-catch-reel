
import React, { useState } from "react";
import { SelectedImage, ImageOverlayProps } from "../types/types";
import { createVideoFromImages, downloadVideo, shareToSocialMedia } from "../utils/videoUtils";
import ImageSelector from "./ImageSelector";
import SelectedImagesPreview from "./SelectedImagesPreview";
import VideoPreview from "./VideoPreview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Facebook, Twitter, Instagram, Video, Download, Play, Images, Clock } from "lucide-react";
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
  const [showVideoSection, setShowVideoSection] = useState(false);
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

  const handleExportVideo = () => {
    setShowVideoSection(true);
  };

  const selectedCount = selectedImages.length;

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

      {/* Catch Images Section - Always shown prominently */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-blue-700 flex items-center">
                <Images className="mr-2 h-6 w-6" />
                Catch Images
              </h2>
              
              {selectedCount > 0 && (
                <Button
                  onClick={handleExportVideo}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Video className="mr-2 h-5 w-5" />
                  Export {selectedCount} {selectedCount === 1 ? 'Image' : 'Images'} to Video
                </Button>
              )}
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p className="flex items-center text-blue-700">
                <span className="inline-flex items-center justify-center w-5 h-5 mr-2 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">i</span>
                Select images to include in your video. {selectedCount > 0 ? `${selectedCount} ${selectedCount === 1 ? 'image' : 'images'} selected.` : ''}
              </p>
            </div>
            
            <ImageSelector
              images={sampleImages}
              selectedImages={selectedImages}
              onSelectImage={handleSelectImage}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Images Section */}
      {selectedImages.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8"
        >
          <Card className="border shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-600">Selected Images ({selectedCount})</h2>
              
              {!showVideoSection && (
                <Button
                  onClick={handleExportVideo}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Video className="mr-2 h-5 w-5" />
                  Export to Video
                </Button>
              )}
            </div>
            
            <SelectedImagesPreview
              selectedImages={selectedImages}
              onRemoveImage={handleRemoveImage}
              onUpdateImageDetails={handleUpdateImageDetails}
            />
          </Card>
        </motion.div>
      )}

      {/* Video Settings and Creation Section - Only shown after Export to Video is clicked */}
      {showVideoSection && (
        <>
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Video Settings
              </h2>
              
              <div className="mb-4">
                <Label htmlFor="secondsPerFrame" className="mb-2 block">
                  Seconds per Image: {secondsPerFrame}s
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
              
              <div className="text-sm flex items-center mb-4">
                <span className="mr-2">Estimated video duration:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {selectedImages.length > 0 ? `${calculateVideoDuration()} seconds` : "0 seconds"}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4">
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
            </Card>
          </motion.div>

          {videoUrl && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <VideoPreview videoUrl={videoUrl} duration={videoDuration} />
            </motion.div>
          )}
        </>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="info">How It Works</TabsTrigger>
          </TabsList>
          
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
                    <p className="text-gray-600 text-sm">Click "Export to Video", adjust your seconds per image setting, then click "Create Video" to generate your fishing video. You can then download or share it.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default FishingVideoCreator;
