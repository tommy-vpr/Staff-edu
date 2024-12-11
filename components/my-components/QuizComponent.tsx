"use client";
import { Check, Cross, Loader, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { generatedCoupon } from "@/lib/generateCoupon";
import { getUserCoupon } from "@/lib/getShopifyCoupon";

interface Answer {
  text: string;
  correct: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}

const questions: Question[] = [
  {
    question: "What is 1 + 1?",
    answers: [
      { text: "2", correct: true },
      { text: "3", correct: false },
      { text: "4", correct: false },
      { text: "5", correct: false },
    ],
  },
  {
    question: "What is 1 + 2?",
    answers: [
      { text: "4", correct: false },
      { text: "7", correct: false },
      { text: "3", correct: true },
      { text: "6", correct: false },
    ],
  },
  {
    question: "What is 1 + 3?",
    answers: [
      { text: "2", correct: false },
      { text: "3", correct: false },
      { text: "4", correct: true },
      { text: "5", correct: false },
    ],
  },
  {
    question: "What is 1 + 4?",
    answers: [
      { text: "4", correct: false },
      { text: "7", correct: false },
      { text: "5", correct: true },
      { text: "6", correct: false },
    ],
  },
  // Add more questions as needed
];

const QuizComponent: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!session?.user?.id) {
        setError("User ID is not available.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/getCoupon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ staffId: session.user.id }),
        });

        const result = await response.json();

        if (result.success) {
          setCouponCode(result.code);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Error fetching coupon:", err);
        setError("Failed to fetch coupon");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [session?.user?.id, session?.user?.takenTest]);

  if (session?.user?.takenTest) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg">
          <p>Thank you for taking the test.</p>
          <p>
            Coupon <b>{couponCode}</b> was issued to you.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerClick = (isCorrect: boolean, answerText: string) => {
    setSelectedAnswer(answerText);

    // Increment correct answers only if the answer is correct
    if (isCorrect) {
      // Increment the score for every answered question
      setScore((prev) => prev + 1);
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    console.log(correctAnswers, questions.length);
    setSelectedAnswer(null);
    const nextQuestion = currentQuestionIndex + 1;

    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);

      // Check if all answers are correct dynamically
      if (correctAnswers === questions.length) {
        handleGenerateCode();
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setGeneratedCode(null);
  };

  const handleGenerateCode = async () => {
    try {
      const response = await fetch("/api/updateCoupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ staffId: session?.user?.id }), // Pass the session user ID
      });

      const result = await response.json();

      if (result.success && result.code) {
        setGeneratedCode(result.code); // Set the generated code in state
      } else {
        console.error(result.error || "Failed to generate coupon code.");
      }
    } catch (err) {
      console.error("Error in handleGenerateCode:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-36">
      <div className="w-full max-w-md rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">Budtender Quiz</h1>

        {showScore ? (
          <div>
            <p className="text-xl mb-4">
              You scored {score} out of {questions.length}!
            </p>
            {score === questions.length && generatedCode ? (
              <>
                <p className="text-lg text-green-400">
                  Congratulations! Here's your coupon
                </p>
                <p className="text-lg text-green-400">{generatedCode}</p>
              </>
            ) : score === questions.length ? (
              <p className="text-lg text-gray-600">
                <Loader className="animate-spin text-2xl" />
                Generating your coupon code...
              </p>
            ) : (
              <p className="text-lg text-red-400">
                Great effort! All answers need to be correct to pass the test.
                Give it another try—you’ve got this!
              </p>
            )}
            {correctAnswers !== questions.length && (
              <button
                onClick={resetQuiz}
                className="mt-4 bg-red-400 border-red-500 text-white px-4 py-2 rounded-md"
              >
                Retake Quiz
              </button>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl mb-4">{currentQuestion.question}</h2>

            <div className="space-y-4">
              {currentQuestion.answers.map((answer) => (
                <button
                  key={answer.text}
                  className={`w-full text-left px-4 py-2 border rounded-md flex justify-between items-center ${
                    selectedAnswer === answer.text
                      ? answer.correct
                        ? "bg-green-400 border-green-400 text-green-700"
                        : "bg-red-400 border-red-400 text-red-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() =>
                    !selectedAnswer &&
                    handleAnswerClick(answer.correct, answer.text)
                  }
                  disabled={!!selectedAnswer}
                >
                  <span>{answer.text}</span>
                  {/* Only show icon if this button is the selected one */}
                  {selectedAnswer === answer.text && (
                    <span className="ml-2">
                      {answer.correct ? (
                        <Check className="text-green-700" />
                      ) : (
                        <X className="text-red-700" />
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {selectedAnswer && (
              <button
                onClick={handleNextQuestion}
                className="mt-6 bg-green-400 text-green-700 px-4 py-2 rounded-md"
              >
                Next Question
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
