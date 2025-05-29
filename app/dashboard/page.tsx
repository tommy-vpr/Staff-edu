"use client";

import { useSession } from "next-auth/react";

import { Play } from "lucide-react";
import Link from "next/link";

import videoThumb from "@/assets/images/video-thumbnail-v2.webp";
import VideoModal from "@/components/my-components/EducationalVideo"; // Adjust path if necessary

import Image from "next/image";
import { useEffect, useState } from "react";
import QuizList from "@/components/my-components/QuizList";

type Video = {
  title: string;
  duration: string;
  src: string;
};

const Dashboard = () => {
  // State to handle video modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if the user is on a mobile device
    const mobileCheck =
      /android|avantgo|blackberry|bada|bb|meego|mobile|opera mini|phone|palm|symbian|tablet|windows ce|windows phone|ipod|ipad|iphone/i.test(
        navigator.userAgent
      );
    setIsMobile(mobileCheck);
  }, []);

  const openVideoModal = (videoSrc: string, videoTitle: string) => {
    setCurrentVideo(videoSrc);
    setCurrentVideoTitle(videoTitle);
    setIsModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsModalOpen(false);
    setCurrentVideo("");
    setCurrentVideoTitle("");
  };

  const videos: Video[] = [
    {
      title: "LITTO Cannabis",
      duration: "1:51",
      src: "https://cdn.shopify.com/videos/c/o/v/eeb10cb216c14ed9b24e65a2bc340083.mp4",
    },
  ];

  return (
    <div className="max-w-[1200px] m-auto p-4 md:p-6 lg:p-8">
      <h3 className="text-2xl lg:text-4xl font-semibold uppercase mt-4 lg:mb-8 text-green-500">
        LITTO 101
      </h3>
      <div className="flex lg:flex-row flex-col gap-8">
        <div className="w-full lg:w-1/2 aspect-video">
          {/*autoPlay muted loop*/}
          <video
            autoPlay={!isMobile}
            controls={isMobile}
            muted
            loop
            className="w-full h-auto"
          >
            <source
              src="https://cdn.shopify.com/videos/c/o/v/d8a05164335a4c9d8ec5a5ac6bd5fe0b.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-4 mt-6 lg:mt-0">
          <p>
            You’re about to take your LITTO skills to the next level! Learn what
            makes our products hit different and why we stay ahead of the game.
            To make it worth your time, we're hooking you up with an{" "}
            <strong className="text-green-500">$80 coupon</strong> just for
            learning!
          </p>
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <p className="text-green-500 font-semibold">Here’s how it works:</p>
            <ul className="space-y-2 text-sm">
              <li>1. Check out the video - Get the lowdown on LITTO.</li>
              <li>2. Take the quiz - Test your LITTO knowledge.</li>
              <li>
                3. Claim your{" "}
                <strong className="text-green-500">$80 coupon</strong> - Rep
                LITTO the right way.
              </li>
            </ul>
          </div>
          <p>Simple, right? Tap in, and let’s get started!</p>
        </div>
      </div>
      {/* Educational Videos Section */}
      <div className="flex lg:flex-row flex-col gap-8">
        <div className="mt-12 w-full">
          <h3 className="font-semibold uppercase text-lg mb-2">
            <span className="font-normal text-gray-400">Step 1:</span> Watch
            Educational Video
          </h3>
          <div className="w-full flex flex-col lg:flex-row gap-4">
            {videos.map((video, index) => (
              <div key={index} className="w-full">
                <div
                  className="aspect-video rounded-md overflow-hidden relative group cursor-pointer"
                  onClick={() => openVideoModal(video.src, video.title)}
                >
                  <div
                    className="bg-[#101010]/70 h-12 w-12 rounded-full absolute top-1/2 left-1/2 
                    -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center group-hover:scale-110
                    transition duration-150"
                  >
                    <Play color="#ddd" />
                  </div>
                  <Image
                    src={videoThumb}
                    alt={video.title}
                    fill
                    objectFit="cover"
                    className="object-top"
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
          videoTitle={currentVideoTitle || null}
          isOpen={isModalOpen}
          onClose={closeVideoModal}
        />

        <div className="my-12 w-full">
          <h3 className="font-semibold uppercase text-lg mb-2">
            <span className="font-normal text-gray-400">Step 2:</span> Take a
            quiz
          </h3>
          <div className="flex gap-4">
            <QuizList />
          </div>
        </div>

        {/* <Link
          href="https://itslitto.com/"
          className="bg-green-500 text-[#333] font-semibold text-sm py-3 px-4 rounded-sm
            transition-all duration-150 hover:bg-green-600"
        >
          Check out our website
        </Link> */}
      </div>
    </div>
  );
};

export default Dashboard;
