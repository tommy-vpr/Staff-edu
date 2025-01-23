import React from "react";
import QuizItem from "@/components/my-components/QuizItem"; // Adjust the import path as needed

import cannabisIcon from "@/assets/images/cannabis-icon.webp";
import hempIcon from "@/assets/images/hemp-icon.webp";
import strainIcon from "@/assets/images/strain-icon.webp";
import { usePathname } from "next/navigation";

const QuizList: React.FC = () => {
  const pathName = usePathname();

  const handleQuizClick = (quiz: string) => {
    console.log(`${quiz} clicked`);
    // Add your navigation logic here if needed
  };

  console.log(pathName);

  return (
    <div className="flex gap-4 w-full lg:w-1/2 flex-col md:flex-row">
      <QuizItem
        label="Cannabis Quiz"
        link={`${pathName}/quiz-b`}
        iconLink={cannabisIcon}
        onClick={() => handleQuizClick("Cannabis Quiz")}
      />
      {/* <QuizItem
        label="Hemp Quiz"
        link={`${pathName}/quiz-a`}
        iconLink={hempIcon}
        onClick={() => handleQuizClick("Hemp Quiz")}
      /> */}
      {/* <QuizItem
        label="What Strain Are You?"
        link={`${pathName}/quiz-c`}
        iconLink={strainIcon}
        onClick={() => handleQuizClick("Strain Quiz")}
      /> */}
    </div>
  );
};

export default QuizList;
