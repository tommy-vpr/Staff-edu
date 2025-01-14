"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Adjust the import path
import { VisuallyHidden } from "@reach/visually-hidden"; // Install if needed

type VideoModalProps = {
  videoSrc: string | null;
  isOpen: boolean;
  onClose: () => void;
};

const VideoModal: React.FC<VideoModalProps> = ({
  videoSrc,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-8 w-full lg:w-2/3 max-w-none">
        {/* Accessibility */}
        <DialogTitle>
          <VisuallyHidden>Watch Video</VisuallyHidden>
        </DialogTitle>
        <DialogDescription>
          <VisuallyHidden>Playing selected video</VisuallyHidden>
        </DialogDescription>

        {/* Video Player */}
        <video controls autoPlay className="rounded-lg w-full h-auto">
          {videoSrc ? (
            <source src={videoSrc} type="video/mp4" />
          ) : (
            <p>No video selected. Please choose a video.</p>
          )}
        </video>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
