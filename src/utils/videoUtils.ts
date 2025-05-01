
import { SelectedImage } from "../types/types";

// Define video aspect ratio options for different platforms
export type VideoAspectRatio = "square" | "landscape" | "portrait" | "widescreen";

export interface VideoFormat {
  name: string;
  width: number;
  height: number;
  aspectRatio: VideoAspectRatio;
  platformHint?: string;
}

export const VIDEO_FORMATS: Record<string, VideoFormat> = {
  square: {
    name: "Square (1:1)",
    width: 640,
    height: 640,
    aspectRatio: "square",
    platformHint: "Instagram, Facebook"
  },
  landscape: {
    name: "Landscape (4:3)",
    width: 640,
    height: 480,
    aspectRatio: "landscape",
    platformHint: "Facebook, Twitter"
  },
  portrait: {
    name: "Portrait (9:16)",
    width: 540,
    height: 960,
    aspectRatio: "portrait",
    platformHint: "Instagram Stories, TikTok"
  },
  widescreen: {
    name: "Widescreen (16:9)",
    width: 960,
    height: 540,
    aspectRatio: "widescreen",
    platformHint: "YouTube, Twitter"
  }
};

export const createVideoFromImages = async (
  images: SelectedImage[],
  fps: number = 1,
  videoFormat: VideoFormat = VIDEO_FORMATS.landscape,
  onProgress?: (progress: number) => void
): Promise<{ videoBlob: Blob; videoUrl: string }> => {
  // In a real implementation, this would use a library like ffmpeg.wasm
  // For this demo, we'll create a simple video from an HTML canvas
  return new Promise((resolve) => {
    console.log("Creating video from images:", images, "with fps:", fps, "and format:", videoFormat);
    
    // Create a canvas element to draw our video frames
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = videoFormat.width;
    const height = videoFormat.height;
    
    canvas.width = width;
    canvas.height = height;
    
    // Create a MediaRecorder to capture the canvas as video
    const stream = canvas.captureStream();
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 5000000
    });
    
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      // Combine all chunks to create the final video
      const videoBlob = new Blob(chunks, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(videoBlob);
      
      // Report 100% progress when done
      if (onProgress) onProgress(100);
      
      resolve({ videoBlob, videoUrl });
    };
    
    // Start recording
    mediaRecorder.start();
    
    let frameIndex = 0;
    const totalFrames = images.length;
    const frameDuration = 1000 / fps; // Convert fps to milliseconds between frames
    
    // Function to draw the next frame
    const drawNextFrame = async () => {
      if (frameIndex >= images.length) {
        mediaRecorder.stop();
        return;
      }
      
      // Report progress percentage
      if (onProgress) {
        const progress = Math.round((frameIndex / totalFrames) * 100);
        onProgress(progress);
      }
      
      const image = images[frameIndex];
      ctx!.clearRect(0, 0, width, height);
      
      // Load and draw the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw the image centered on the canvas
        const aspectRatio = img.width / img.height;
        let drawWidth = width;
        let drawHeight = width / aspectRatio;
        
        if (drawHeight > height) {
          drawHeight = height;
          drawWidth = height * aspectRatio;
        }
        
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;
        
        ctx!.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Background overlay for entire image
        ctx!.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx!.fillRect(0, 0, width, height);
        
        // Bottom overlay for date and weight
        ctx!.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx!.fillRect(0, height - 70, width, 70);
        
        // Format date
        const formattedDate = new Date(image.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        
        // Draw lake name, date and weight in bottom overlay (UPDATED LAYOUT)
        ctx!.fillStyle = "white";
        
        // Lake name on top line
        ctx!.font = `bold ${Math.max(14, Math.round(width * 0.025))}px sans-serif`;
        ctx!.textAlign = "left";
        ctx!.fillText(image.lakeName, 15, height - 45);
        
        // Date on bottom left
        ctx!.font = `${Math.max(12, Math.round(width * 0.022))}px sans-serif`;
        ctx!.fillText(formattedDate, 15, height - 20);
        
        // Weight on bottom right
        ctx!.textAlign = "right";
        ctx!.font = `${Math.max(12, Math.round(width * 0.022))}px sans-serif`;
        ctx!.fillText("Weight:", width - 75, height - 20);
        ctx!.font = `bold ${Math.max(14, Math.round(width * 0.025))}px sans-serif`;
        ctx!.fillText(`${image.weight} lbs`, width - 15, height - 20);
        
        ctx!.textAlign = "left"; // Reset alignment
        
        // Move to the next frame after the frame duration
        frameIndex++;
        setTimeout(drawNextFrame, frameDuration);
      };
      
      img.onerror = () => {
        console.error("Error loading image:", image.src);
        frameIndex++;
        setTimeout(drawNextFrame, 10);
      };
      
      img.src = image.src;
    };
    
    // Start the frame drawing process
    drawNextFrame();
  });
};

export const shareToSocialMedia = (
  videoUrl: string,
  platform: "facebook" | "twitter" | "instagram" | "youtube"
) => {
  // Implement sharing functionality based on platform
  let shareUrl = "";
  
  switch (platform) {
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
      break;
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent("Check out my latest fishing catch!")}`;
      break;
    case "youtube":
      // YouTube doesn't support direct URL sharing via web API, show instruction toast instead
      alert("To share on YouTube: Save the video first, then upload it through YouTube Studio");
      return;
    case "instagram":
      // Instagram doesn't support direct URL sharing via web, show instruction toast instead
      alert("To share on Instagram: Save the video first, then upload it through the Instagram app");
      return;
  }
  
  // Open the sharing URL in a new window
  if (shareUrl) {
    window.open(shareUrl, "_blank", "width=600,height=400");
  }
};

export const downloadVideo = (videoBlob: Blob, fileName: string = "fishing-catch-video.webm") => {
  const url = URL.createObjectURL(videoBlob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const copyVideoLink = async (videoUrl: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(videoUrl);
    return true;
  } catch (error) {
    console.error("Failed to copy video link:", error);
    return false;
  }
};

// Generate a random lake name for demonstration purposes
export const generateRandomLakeName = (): string => {
  const prefixes = ["Crystal", "Blue", "Silver", "Golden", "Deep", "Hidden", "Emerald", "Tranquil", "Misty", "Shadow"];
  const suffixes = ["Lake", "Pond", "Reservoir", "Waters", "Bay", "Cove", "Lagoon"];
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${randomPrefix} ${randomSuffix}`;
};
