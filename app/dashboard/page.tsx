"use client";

import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";

import { authOptions } from "@/lib/authOptions";
import { Check, Play, SquarePen, VideoOff } from "lucide-react";
import Link from "next/link";

import videoThumb from "@/assets/images/video-thumbnail.webp";
import VideoModal from "@/components/my-components/EducationalVideo"; // Adjust path if necessary

import Image from "next/image";
import { useEffect, useState } from "react";
import QuizCard from "@/components/my-components/QuizItem";
import QuizList from "@/components/my-components/QuizList";

type Video = {
  title: string;
  duration: string;
  src: string;
};

const Dashboard = () => {
  // const session = await getServerSession(authOptions);

  const { data: session, status } = useSession();

  const firstName = session?.user.name?.split(" ")[0];

  console.log(firstName);

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
      title: "LITTO Cannibis",
      duration: "1:51",
      src: "https://cdn.shopify.com/videos/c/o/v/eeb10cb216c14ed9b24e65a2bc340083.mp4",
    },
  ];

  return (
    <div className="max-w-[1200px] m-auto p-4 md:p-6 lg:p-8">
      <h3 className="text-2xl lg:text-3xl font-semibold uppercase mb-4">
        {/* {firstName || session?.user.name}'s Dashboard */}
        STAFF EDU
      </h3>
      <div className="flex lg:flex-row flex-col gap-8">
        <div className="w-full lg:w-1/2 aspect-video rounded-lg overflow-hidden">
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
        <div>
          <h3 className="font-semibold uppercase text-xl lg:text-2xl mb-2 text-green-500">
            Budtender Perks
          </h3>
          <ul className="space-y-2 text-sm mb-8">
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
            className="bg-green-500 text-[#333] font-semibold text-sm py-3 px-4 rounded-sm
            transition-all duration-150 hover:bg-green-600"
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
        <div className="w-full lg:w-1/2 flex flex-col lg:flex-row gap-4">
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

      <div className="my-12">
        <h3 className="font-semibold uppercase text-lg mb-2">Take a quiz</h3>
        <div className="flex gap-4">
          <QuizList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
