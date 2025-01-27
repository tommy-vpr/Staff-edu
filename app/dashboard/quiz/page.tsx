"use client";

import React, { useEffect, useState, useRef } from "react";
import QuizComponentA from "@/components/my-components/QuizComponent-A";
import { useCustomSession } from "@/lib/SessionContext";
import { PartyPopper } from "lucide-react";
import Confetti from "react-confetti";

const Page = () => {
  const { session } = useCustomSession();
  const [hasTakenQuizA, setHasTakenQuizA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const parentRef = useRef<HTMLDivElement>(null); // Create a ref for the parent div

  useEffect(() => {
    const updateDimensions = () => {
      if (parentRef.current) {
        const rect = parentRef.current.getBoundingClientRect(); // Get the dimensions of the parent div
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions(); // Set initial dimensions
    window.addEventListener("resize", updateDimensions); // Update on resize

    if (session?.user?.testsTaken) {
      setHasTakenQuizA(session.user.testsTaken.includes("quiz-a"));
      setLoading(false);
    } else if (session?.user?.role === "admin") {
      setLoading(false);
    } else {
      setLoading(true);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      ref={parentRef} // Attach the ref to this parent div
      className="flex justify-center items-center relative h-full"
    >
      {hasTakenQuizA ? (
        <>
          <div className="flex flex-col items-center -translate-y-1/2">
            <div className="rounded-full bg-green-400 p-4 mb-4">
              <PartyPopper size={36} className="text-gray-800" />
            </div>
            <p>You have successfully completed this quiz.</p>
            <p>A coupon has been sent to your email.</p>
          </div>
          {/* Confetti with parentRef dimensions */}
          {dimensions.width > 0 && dimensions.height > 0 && (
            <Confetti
              width={dimensions.width} // Use the parent div's width
              height={dimensions.height} // Use the parent div's height
              gravity={0.1} // Adjust the gravity for slower speed
              recycle={false}
              className="absolute inset-0"
            />
          )}
        </>
      ) : (
        <div className="w-full h-full flex justify-center items-center">
          <QuizComponentA />
        </div>
      )}
    </div>
  );
};

export default Page;
