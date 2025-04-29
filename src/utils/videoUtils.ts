
import { SelectedImage } from "../types/types";

export const createVideoFromImages = async (
  images: SelectedImage[],
  fps: number = 1
): Promise<Blob> => {
  // In a real implementation, this would use a library like ffmpeg.wasm
  // For this demo, we'll simulate video creation with a timeout
  return new Promise((resolve) => {
    console.log("Creating video from images:", images);
    setTimeout(() => {
      // This is a placeholder - in a real app, you'd create an actual video file
      const videoBlob = new Blob(["video data would go here"], {
        type: "video/mp4",
      });
      resolve(videoBlob);
    }, 2000);
  });
};

export const shareToSocialMedia = (
  videoBlob: Blob,
  platform: "facebook" | "twitter" | "instagram"
) => {
  // In a real implementation, this would use the Web Share API or platform-specific APIs
  const url = URL.createObjectURL(videoBlob);
  
  // This is simplified - actual implementation would use platform SDKs
  console.log(`Sharing video to ${platform}`);
  console.log(`Video URL: ${url}`);
  
  // Example of how you might implement actual sharing
  if (navigator.share) {
    navigator
      .share({
        title: "My Fishing Catch",
        text: "Check out my latest catch!",
        url: url,
      })
      .then(() => console.log("Shared successfully"))
      .catch((error) => console.log("Error sharing:", error));
  } else {
    // Fallback for browsers that don't support the Web Share API
    window.open(`https://${platform}.com/share?url=${encodeURIComponent(url)}`, "_blank");
  }
};

export const downloadVideo = (videoBlob: Blob, fileName: string = "fishing-catch-video.mp4") => {
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

// Generate a random lake name for demonstration purposes
export const generateRandomLakeName = (): string => {
  const prefixes = ["Crystal", "Blue", "Silver", "Golden", "Deep", "Hidden", "Emerald", "Tranquil", "Misty", "Shadow"];
  const suffixes = ["Lake", "Pond", "Reservoir", "Waters", "Bay", "Cove", "Lagoon"];
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${randomPrefix} ${randomSuffix}`;
};
