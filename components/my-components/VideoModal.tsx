"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"; // Adjust import path
import { Play } from "lucide-react";
import { VisuallyHidden } from "@reach/visually-hidden"; // Install @reach/visually-hidden if needed

const VideoModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span
          onClick={() => setIsOpen(true)}
          className="text-xs flex gap-2 items-center border border-gray-500 p-2 px-4 rounded-full w-fit mt-4 
            justify-self-end dark:hover:bg-white dark:hover:text-[#101010] hover:bg-[#101010] hover:text-white cursor-pointer"
        >
          Watch Video <Play size={14} />
        </span>
      </DialogTrigger>

      <DialogContent className="p-8 w-2/3 max-w-none">
        {/* Visually hidden title and description for accessibility */}
        <DialogTitle>
          <VisuallyHidden>Watch Video</VisuallyHidden>
        </DialogTitle>
        <DialogDescription>
          <VisuallyHidden>
            This video provides additional information and context related to
            the content above.
          </VisuallyHidden>
        </DialogDescription>

        <video
          src="https://res.cloudinary.com/drhy6wylu/video/upload/v1722468062/5365340-hd_1366_720_25fps_1_elwbck.mp4"
          controls
          autoPlay
          className="rounded-lg w-full h-auto"
        />
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
