import React from "react";
import Image from "next/image";
import Link from "next/link";

import type { StaticImageData } from "next/image";

type QuizItemProps = {
  label: string; // The label for the quiz item
  link: string; // The URL to navigate to
  thumbNail?: StaticImageData | string; // Optional icon image source
  onClick?: () => void; // Optional click handler
};

const QuizItem: React.FC<QuizItemProps> = ({
  label,
  link,
  thumbNail,
  onClick,
}) => {
  return (
    <Link
      href={link}
      onClick={onClick}
      className="aspect-video rounded-sm flex flex-col items-center cursor-pointer 
      transition-transform duration-150 w-full group"
    >
      {thumbNail && (
        <div className="w-full aspect-video relative bg-[#ddd] flex justify-center items-center overflow-hidden rounded-md">
          <Image
            src={thumbNail}
            alt={`${label}`}
            width={800}
            height={500}
            className="transition-transform duration-150 group-hover:scale-105"
          />
        </div>
      )}
      <span className="text-white p-2 w-full transition-all duration-150">
        {label}
      </span>
    </Link>
  );
};

export default QuizItem;
