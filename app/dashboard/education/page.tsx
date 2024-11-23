import { Play } from "lucide-react";
import React from "react";
import VideoModal from "@/components/my-components/VideoModal"; // Adjust import path based on your folder structure

const courses = [
  {
    title: "About LITTO",
    desc: `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos 
    odio dicta et amet debitis ea, fugit, officia repellat corrupti quidem cumque, 
    explicabo quis eaque nam. Odio omnis eligendi beatae iure.`,
  },
  {
    title: "What is hemp?",
    desc: `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum a quia delectus temporibus, ut, omnis 
    vitae repellendus nobis eius, cupiditate optio eaque! Neque ex iure velit minus! Facere, deleniti tempore.`,
  },
  {
    title: "What products do LITTO have?",
    desc: `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos 
    odio dicta et amet debitis ea, fugit, officia repellat corrupti quidem cumque, 
    explicabo quis eaque nam. Odio omnis eligendi beatae iure.`,
  },
  {
    title: "Which product is for who?",
    desc: `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos 
    odio dicta et amet debitis ea, fugit, officia repellat corrupti quidem cumque, 
    explicabo quis eaque nam. Odio omnis eligendi beatae iure.`,
  },
];

type Props = {
  title: string;
  desc: string;
  index: number;
};

const ContentBlock = ({ title, desc, index }: Props) => (
  <div className="rounded-lg shadow-md bg-gray-50 dark:bg-[#141414] flex overflow-hidden">
    <div className="p-8 flex items-center justify-center text-4xl bg-gray-100 dark:bg-[#222] aspect-square">
      {index + 1}
    </div>
    <div className="p-8">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p>{desc}</p>
      <VideoModal />
    </div>
  </div>
);

const Page = () => {
  return (
    <div className="flex flex-col gap-8 w-2/3 mx-auto">
      {courses.map((course, i) => (
        <ContentBlock
          key={course.title}
          title={course.title}
          desc={course.desc}
          index={i}
        />
      ))}
    </div>
  );
};

export default Page;
