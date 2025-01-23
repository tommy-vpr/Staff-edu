import React from "react";
import Image from "next/image";
import Link from "next/link";

import type { StaticImageData } from "next/image";

type QuizItemProps = {
  label: string; // The label for the quiz item
  link: string; // The URL to navigate to
  iconLink?: StaticImageData | string; // Optional icon image source
  onClick?: () => void; // Optional click handler
};

const QuizItem: React.FC<QuizItemProps> = ({
  label,
  link,
  iconLink,
  onClick,
}) => {
  return (
    <Link
      href={link}
      onClick={onClick}
      className="dark:bg-white bg-[#f5f5f5] aspect-video p-2 rounded-sm flex flex-col items-center cursor-pointer hover:text-green-500 
      transition-transform duration-150 w-full group"
    >
      {iconLink && (
        <div className="w-full aspect-video relative bg-[#ddd] flex justify-center items-center">
          <Image
            src={iconLink}
            alt={`${label} Icon`}
            width={220}
            height={80}
            className="p-4 transition-transform duration-150 group-hover:scale-105"
          />
        </div>
      )}
      <span className="bg-[#111] text-white p-2 w-full text-center font-semibold transition-all duration-150 group-hover:text-green-500">
        {label}
      </span>
    </Link>
  );
};

export default QuizItem;
