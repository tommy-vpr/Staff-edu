"use client";

import { Check, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/data/questions";
import { useCustomSession } from "@/lib/SessionContext";
import GenerateCodeSendEmail from "./GenerateCodeSendEmail";

const QuizComponentA: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(0); // Tracks answered questions

  const { session, updateSession } = useCustomSession();
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerClick = (isCorrect: boolean, answerText: string) => {
    setSelectedAnswer(answerText);

    // Increment answered questions
    setAnsweredQuestions((prev) => prev + 1);

    // Increment correct answers only if the answer is correct
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    const nextQuestion = currentQuestionIndex + 1;

    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setGeneratedCode(null);
    setAnsweredQuestions(0);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full -translate-y-1/3 lg:w-1/2">
      <div className="w-full max-w-lg rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 flex justify-between">
          Quiz{" "}
          <span className="text-sm text-gray-500 font-normal">
            {currentQuestionIndex + 1} of {questions.length}
          </span>
        </h1>

        {showScore ? (
          <div>
            <p className="text-xl mb-4">
              You scored {score} out of {questions.length}!
            </p>
            {score === questions.length ? (
              <>
                <p className="text-lg text-green-400 mb-3">
                  Congratulations! You got all the answers correct.
                </p>
                <GenerateCodeSendEmail quiz={"quiz-a"} />
              </>
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
                  {/* Show icon only if this button is selected */}
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

export default QuizComponentA;
