
export interface SelectedImage {
  id: number;
  src: string;
  timestamp: Date;
  lakeName: string;
  weight: number;
  selected: boolean;
}

export interface ImageOverlayProps {
  timestamp: Date;
  lakeName: string;
  weight: number;
}
