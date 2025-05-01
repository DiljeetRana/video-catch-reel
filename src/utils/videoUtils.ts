
import { SelectedImage } from "../types/types";

export const createVideoFromImages = async (
  images: SelectedImage[],
  fps: number = 1,
  onProgress?: (progress: number) => void
): Promise<{ videoBlob: Blob; videoUrl: string }> => {
  // In a real implementation, this would use a library like ffmpeg.wasm
  // For this demo, we'll create a simple video from an HTML canvas
  return new Promise((resolve) => {
    console.log("Creating video from images:", images, "with fps:", fps);
    
    // Create a canvas element to draw our video frames
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 640;
    const height = 480;
    
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
        
        // Draw the overlay information - similar to ImageOverlay component
        ctx!.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx!.fillRect(0, height - 70, width, 70);
        
        // Draw lake name at the top
        ctx!.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx!.fillRect(0, 0, width, 40);
        ctx!.fillStyle = "white";
        ctx!.font = "bold 18px sans-serif";
        ctx!.textAlign = "left";
        ctx!.fillText(image.lakeName, 15, 26);
        
        // Draw date on bottom left
        const formattedDate = new Date(image.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        ctx!.font = "14px sans-serif";
        ctx!.fillText(formattedDate, 15, height - 35);
        
        // Draw weight on bottom right
        ctx!.textAlign = "right";
        ctx!.font = "14px sans-serif";
        ctx!.fillText("Weight:", width - 75, height - 35);
        ctx!.font = "bold 16px sans-serif";
        ctx!.fillText(`${image.weight} lbs`, width - 15, height - 35);
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
  platform: "facebook" | "twitter" | "instagram"
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
