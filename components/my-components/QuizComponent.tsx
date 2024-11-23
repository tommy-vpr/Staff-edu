"use client";
import { Check, Cross, X } from "lucide-react";
import React, { useState } from "react";

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
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerClick = (isCorrect: boolean, answerText: string) => {
    setSelectedAnswer(answerText);
    if (isCorrect) {
      setScore((prev) => prev + 1);
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
            <button
              onClick={resetQuiz}
              className="bg-red-400 border-red-500 text-white px-4 py-2 rounded-md"
            >
              Retake Quiz
            </button>
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
