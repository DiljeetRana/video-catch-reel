import { SelectedImage } from "../types/types";

export const createVideoFromImages = async (
  images: SelectedImage[],
  fps: number = 1
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
      resolve({ videoBlob, videoUrl });
    };
    
    // Start recording
    mediaRecorder.start();
    
    let frameIndex = 0;
    const frameDuration = 1000 / fps; // Convert fps to milliseconds between frames
    
    // Function to draw the next frame
    const drawNextFrame = async () => {
      if (frameIndex >= images.length) {
        mediaRecorder.stop();
        return;
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
        
        // Draw the overlay information
        ctx!.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx!.fillRect(0, height - 100, width, 100);
        
        // Draw lake name
        ctx!.fillStyle = "white";
        ctx!.font = "bold 24px Arial";
        ctx!.fillText(image.lakeName, 20, height - 60);
        
        // Draw date and time
        const formattedDate = new Date(image.timestamp).toLocaleDateString();
        const formattedTime = new Date(image.timestamp).toLocaleTimeString();
        ctx!.font = "16px Arial";
        ctx!.fillText(`${formattedDate} • ${formattedTime}`, 20, height - 30);
        
        // Draw weight badge
        ctx!.save();
        ctx!.beginPath();
        ctx!.arc(width - 60, height - 50, 40, 0, Math.PI * 2);
        ctx!.fillStyle = "#3b82f6";
        ctx!.fill();
        ctx!.strokeStyle = "white";
        ctx!.lineWidth = 2;
        ctx!.stroke();
        
        ctx!.fillStyle = "white";
        ctx!.font = "10px Arial";
        ctx!.textAlign = "center";
        ctx!.fillText("CATCH", width - 60, height - 60);
        ctx!.font = "bold 18px Arial";
        ctx!.fillText(`${image.weight} LBS`, width - 60, height - 40);
        ctx!.restore();
        
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
