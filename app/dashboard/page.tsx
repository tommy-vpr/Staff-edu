"use client";

import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";

import { authOptions } from "@/lib/authOptions";
import { Check, Play, SquarePen, VideoOff } from "lucide-react";
import Link from "next/link";

import videoThumb from "@/assets/images/video-thumbnail.webp";
import VideoModal from "@/components/my-components/EducationalVideo"; // Adjust path if necessary

import Image from "next/image";
import { useState } from "react";

type Video = {
  title: string;
  duration: string;
  src: string;
};

const Dashboard = () => {
  // const session = await getServerSession(authOptions);

  const { data: session, status } = useSession();

  const firstName = session?.user.name?.split(" ")[0];

  // State to handle video modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  const openVideoModal = (videoSrc: string) => {
    setCurrentVideo(videoSrc);
    setIsModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsModalOpen(false);
    setCurrentVideo("");
  };

  const videos: Video[] = [
    {
      title: "Hemp",
      duration: "3:58",
      src: "https://res.cloudinary.com/drhy6wylu/video/upload/v1722468062/5365340-hd_1366_720_25fps_1_elwbck.mp4",
    },
    {
      title: "Cannabis",
      duration: "5:19",
      src: "https://res.cloudinary.com/drhy6wylu/video/upload/v1722468062/5365340-hd_1366_720_25fps_1_elwbck.mp4",
    },
    {
      title: "What Strain Are You?",
      duration: "3:34",
      src: "https://res.cloudinary.com/drhy6wylu/video/upload/v1722468062/5365340-hd_1366_720_25fps_1_elwbck.mp4",
    },
  ];

  return (
    <div>
      <h3 className="text-3xl font-semibold uppercase mb-8">
        {firstName || session?.user.name}'s Dashboard
      </h3>
      <div className="flex gap-8">
        <div className="w-1/2 rounded-lg overflow-hidden">
          <video autoPlay muted loop className="w-full h-auto">
            <source
              src="https://cdn.shopify.com/videos/c/o/v/d8a05164335a4c9d8ec5a5ac6bd5fe0b.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div>
          <h3 className="font-semibold uppercase text-3xl mb-2 text-green-400">
            Budtender Perks
          </h3>
          <ul className="space-y-2 text-sm mb-4">
            <li className="flex gap-1">
              <Check size={14} />
              Exclusive Discounts or Promotions
            </li>
            <li className="flex gap-1">
              <Check size={14} />
              Access to Exclusive Content
            </li>
            <li className="flex gap-1">
              <Check size={14} />
              Early Access
            </li>
            <li className="flex gap-1">
              <Check size={14} />
              Community Perks
            </li>
          </ul>
          <Link
            href="https://itslitto.com/"
            className="bg-green-400 text-[#333] font-semibold text-sm py-2 px-4 rounded-sm hover:bg-green-500"
          >
            Check out our website
          </Link>
        </div>
      </div>
      {/* Educational Videos Section */}
      <div className="mt-12">
        <h3 className="font-semibold uppercase text-lg mb-2">
          Educational Videos
        </h3>
        <div className="flex gap-4">
          {videos.map((video, index) => (
            <div key={index} className="w-full">
              <div
                className="w-full h-52 rounded-md overflow-hidden relative group cursor-pointer"
                onClick={() => openVideoModal(video.src)}
              >
                <div
                  className="bg-[#101010]/70 h-12 w-12 rounded-full absolute top-1/2 left-1/2 
                    -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center group-hover:scale-110
                    transition duration-150"
                >
                  <Play />
                </div>
                <Image
                  src={videoThumb}
                  alt={video.title}
                  fill
                  objectFit="cover"
                />
              </div>
              <div className="flex justify-between items-center gap-1 mt-2">
                <h3>{video.title}</h3>
                <span className="text-gray-500">{video.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        videoSrc={currentVideo || null} // Pass null if currentVideo is empty
        isOpen={isModalOpen}
        onClose={closeVideoModal}
      />

      <div className="mt-12">
        <h3 className="font-semibold uppercase text-lg mb-2">Take a quiz</h3>
        <div className="flex gap-4">
          <div className="bg-[#333] p-4 rounded-sm flex items-center gap-2 cursor-pointer hover:text-green-500 transition-all duration-150">
            <SquarePen size={14} />
            Hemp Quiz
          </div>
          <div className="bg-[#333] p-4 rounded-sm flex items-center gap-2 cursor-pointer hover:text-green-500 transition-all duration-150">
            <SquarePen size={14} />
            Cannabis Quiz
          </div>
          <div className="bg-[#333] p-4 rounded-sm flex items-center gap-2 cursor-pointer hover:text-green-500 transition-all duration-150">
            <SquarePen size={14} />
            Strain Quiz
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
