import React from "react";
import QuizItem from "@/components/my-components/QuizItem"; // Adjust the import path as needed

// import cannabisIcon from "@/assets/images/cannabis-icon.webp";
// import hempIcon from "@/assets/images/hemp-icon.webp";
// import strainIcon from "@/assets/images/strain-icon.webp";
import takeTestImage from "@/assets/images/take-test-hero.webp";
import { usePathname } from "next/navigation";

const QuizList: React.FC = () => {
  const pathName = usePathname();

  const handleQuizClick = (quiz: string) => {
    console.log(`${quiz} clicked`);
    // Add your navigation logic here if needed
  };

  return (
    <div className="flex gap-4 w-full flex-col md:flex-row">
      <QuizItem
        label="Cannabis Quiz"
        link={`${pathName}/quiz`}
        // iconLink={cannabisIcon}
        thumbNail={takeTestImage}
        onClick={() => handleQuizClick("Cannabis Quiz")}
      />
    </div>
  );
};

export default QuizList;
