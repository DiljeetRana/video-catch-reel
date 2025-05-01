import React, { useState } from "react";
import { SelectedImage, ImageOverlayProps } from "../types/types";
import { 
  createVideoFromImages, 
  downloadVideo, 
  shareToSocialMedia, 
  copyVideoLink,
  VIDEO_FORMATS,
  VideoFormat
} from "../utils/videoUtils";
import ImageSelector from "./ImageSelector";
import SelectedImagesPreview from "./SelectedImagesPreview";
import VideoPreview from "./VideoPreview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Facebook, Twitter, Instagram, Video, Download, Play, Images, Clock, Trash2, Copy, LoaderCircle, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<VideoFormat>(VIDEO_FORMATS.landscape);
  const [showVideoSettings, setShowVideoSettings] = useState(true);
  const [isVideoPreviewLoading, setIsVideoPreviewLoading] = useState(false);
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

  const handleClearSelection = () => {
    setSelectedImages([]);
    toast({
      title: "Selection cleared",
      description: "All selected images have been removed",
    });
  };

  const handleUpdateImageDetails = (id: number, details: Partial<ImageOverlayProps>) => {
    setSelectedImages((prev) =>
      prev.map((image) =>
        image.id === id ? { ...image, ...details } : image
      )
    );
  };

  // New function to move images up or down in the sequence
  const handleMoveImage = (id: number, direction: "up" | "down") => {
    const currentImages = [...selectedImages];
    const currentIndex = currentImages.findIndex(img => img.id === id);
    
    if (currentIndex === -1) return;
    
    // Calculate the target index
    const targetIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(currentImages.length - 1, currentIndex + 1);
    
    // Don't do anything if we're already at the boundary
    if (targetIndex === currentIndex) return;
    
    // Swap the elements
    const temp = currentImages[targetIndex];
    currentImages[targetIndex] = currentImages[currentIndex];
    currentImages[currentIndex] = temp;
    
    setSelectedImages(currentImages);
    
    toast({
      title: `Image moved ${direction}`,
      description: `Reordered images sequence (${currentIndex + 1} → ${targetIndex + 1})`,
    });
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
    setProgress(0);
    setIsVideoPreviewLoading(true);
    
    try {
      // Calculate FPS as 1/secondsPerFrame
      const fps = 1 / secondsPerFrame;
      const { videoBlob, videoUrl } = await createVideoFromImages(
        selectedImages, 
        fps,
        selectedVideoFormat,
        (progressValue) => {
          setProgress(progressValue);
        }
      );
      setCreatedVideoBlob(videoBlob);
      setVideoUrl(videoUrl);
      
      // Set video duration
      const duration = calculateVideoDuration();
      setVideoDuration(duration);
      
      // Hide the video settings after successful creation
      setShowVideoSettings(false);
    } catch (error) {
      toast({
        title: "Error creating video",
        description: "There was an error creating your video. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating video:", error);
    } finally {
      setIsCreatingVideo(false);
      setIsVideoPreviewLoading(false);
    }
  };

  const handleShareVideo = (platform: "facebook" | "twitter" | "instagram" | "youtube") => {
    if (!videoUrl) {
      toast({
        title: "No video to share",
        description: "Please create a video first",
        variant: "destructive",
      });
      return;
    }

    shareToSocialMedia(videoUrl, platform);
    // No toast here to avoid interfering with the dialog
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
    // No toast here to avoid interfering with the dialog
  };

  const handleCopyVideoLink = async () => {
    if (!videoUrl) {
      toast({
        title: "No video to copy",
        description: "Please create a video first",
        variant: "destructive",
      });
      return;
    }

    const success = await copyVideoLink(videoUrl);
    
    if (success) {
      // Use a more subtle notification that doesn't interfere with the dialog
      console.log("Video link copied to clipboard");
    } else {
      toast({
        title: "Copy failed",
        description: "Could not copy video link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleExportVideo = () => {
    setVideoDialogOpen(true);
  };

  const handleEditSettings = () => {
    setShowVideoSettings(true);
  };

  const selectedCount = selectedImages.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportVideo}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Video className="mr-2 h-5 w-5" />
                    Export {selectedCount} {selectedCount === 1 ? 'Image' : 'Images'} to Video
                  </Button>
                  
                  <Button
                    onClick={handleClearSelection}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    Clear Selection
                  </Button>
                </div>
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
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleExportVideo}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Video className="mr-2 h-5 w-5" />
                  Export to Video
                </Button>
                
                <Button
                  onClick={handleClearSelection}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p className="flex items-center text-blue-700">
                <span className="inline-flex items-center justify-center w-5 h-5 mr-2 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">i</span>
                Click the arrow buttons to reorder images. The sequence shown here will be used in the video.
              </p>
            </div>
            
            <SelectedImagesPreview
              selectedImages={selectedImages}
              onRemoveImage={handleRemoveImage}
              onUpdateImageDetails={handleUpdateImageDetails}
              onMoveImage={handleMoveImage}
            />
          </Card>
        </motion.div>
      )}

      {/* Video Creation Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center">
              <Video className="mr-2 h-5 w-5" />
              Create Fishing Video
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 my-4">
            {/* Video Settings Section - Collapsible */}
            <Collapsible 
              open={showVideoSettings} 
              onOpenChange={setShowVideoSettings}
              className={`${!showVideoSettings && videoUrl ? 'border-b pb-4 mb-4' : ''}`}
            >
              <CollapsibleContent>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 text-blue-600 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Video Settings
                  </h3>
                  
                  {/* Duration settings */}
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
                  
                  {/* Video format/aspect ratio selection */}
                  <div className="mb-4">
                    <Label className="mb-2 block">Video Format</Label>
                    <ToggleGroup 
                      type="single" 
                      value={selectedVideoFormat.aspectRatio} 
                      onValueChange={(value) => {
                        if (value && VIDEO_FORMATS[value]) {
                          setSelectedVideoFormat(VIDEO_FORMATS[value]);
                        }
                      }}
                      className="justify-start flex-wrap gap-2 mt-1"
                    >
                      {Object.values(VIDEO_FORMATS).map((format) => (
                        <ToggleGroupItem 
                          key={format.aspectRatio} 
                          value={format.aspectRatio}
                          className="flex flex-col items-center p-2 h-auto data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 border"
                        >
                          <div className="w-20 mb-1 bg-blue-50 overflow-hidden">
                            <AspectRatio 
                              ratio={format.width / format.height}
                              className="bg-blue-200 flex items-center justify-center text-xs text-blue-800"
                            >
                              {format.width}x{format.height}
                            </AspectRatio>
                          </div>
                          <span className="text-xs font-medium">{format.name}</span>
                          {format.platformHint && (
                            <span className="text-[10px] text-gray-500">{format.platformHint}</span>
                          )}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                  
                  <div className="text-sm flex items-center">
                    <span className="mr-2">Estimated video duration:</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                      {selectedImages.length > 0 ? `${calculateVideoDuration()} seconds` : "0 seconds"}
                    </span>
                  </div>
                </div>
                
                {/* Create Video Button */}
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={handleCreateVideo}
                    disabled={isCreatingVideo || selectedImages.filter(img => img.selected).length === 0}
                    className="bg-green-600 hover:bg-green-700 w-full max-w-sm"
                    size="lg"
                  >
                    {isCreatingVideo ? (
                      <span className="flex items-center">
                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                        Creating Video...
                      </span>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Create Video
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Progress bar */}
                {isCreatingVideo && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Processing frames...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-blue-200" />
                  </div>
                )}
              </CollapsibleContent>

              {/* Video Preview Section - Now displays immediately and properly handles loading state */}
              {(videoUrl || isVideoPreviewLoading) && (
                <div className="mt-4">
                  {!showVideoSettings && (
                    <Button 
                      onClick={handleEditSettings} 
                      variant="outline" 
                      size="sm"
                      className="mb-3 text-blue-600 border-blue-300"
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      Edit Video Settings
                    </Button>
                  )}
                  
                  <div className="relative mx-auto bg-black">
                    <AspectRatio 
                      ratio={selectedVideoFormat.width / selectedVideoFormat.height}
                      className="max-w-lg mx-auto"
                    >
                      <VideoPreview 
                        videoUrl={videoUrl || ""} 
                        duration={videoDuration} 
                        isLoading={isVideoPreviewLoading}
                        className="w-full h-full" 
                      />
                    </AspectRatio>
                  </div>
                  
                  {videoUrl && (
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                      <Button onClick={handleDownloadVideo} variant="outline" className="border-blue-500 text-blue-500">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      
                      <Button onClick={handleCopyVideoLink} variant="outline" className="border-purple-500 text-purple-500">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button 
                          onClick={() => handleShareVideo("facebook")} 
                          variant="outline"
                          className="border-blue-600 text-blue-600"
                        >
                          <Facebook className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Facebook</span>
                        </Button>
                        
                        <Button 
                          onClick={() => handleShareVideo("twitter")} 
                          variant="outline"
                          className="border-sky-500 text-sky-500"
                        >
                          <Twitter className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Twitter</span>
                        </Button>
                        
                        <Button 
                          onClick={() => handleShareVideo("instagram")} 
                          variant="outline"
                          className="border-pink-600 text-pink-600"
                        >
                          <Instagram className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Instagram</span>
                        </Button>
                        
                        <Button 
                          onClick={() => handleShareVideo("youtube")} 
                          variant="outline"
                          className="border-red-600 text-red-600"
                        >
                          <Youtube className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">YouTube</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Collapsible>
          </div>
        </DialogContent>
      </Dialog>

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
