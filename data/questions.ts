export interface Answer {
  text: string;
  correct: boolean;
}

export interface Question {
  question: string;
  answers: Answer[];
}

export const questions: Question[] = [
  {
    question: "What is LITTO all about?",
    answers: [
      { text: "Hitting new highs.", correct: true },
      { text: "Collecting vintage bongs", correct: false },
      {
        text: "Perfecting the art of rolling the world’s tiniest joints.",
        correct: false,
      },
      { text: "Inventing a strain that tastes like nothing", correct: false },
    ],
  },
  {
    question: "How many strains does LITTO offer?",
    answers: [
      { text: "15", correct: false },
      { text: "710", correct: false },
      { text: "22", correct: false },
      { text: "19 and counting", correct: true },
    ],
  },
  {
    question:
      "What is the minimum concentration percentage used in LITTO’s all-in-one devices?",
    answers: [
      { text: "420%", correct: false },
      { text: "85%", correct: true },
      { text: "50%", correct: false },
      { text: "35%", correct: false },
    ],
  },
  {
    question: "What are the different LITTO all-in-one lines?",
    answers: [
      { text: "Live Resin", correct: false },
      { text: "Original", correct: false },
      { text: "Exotics", correct: false },
      { text: "All of the above", correct: true },
    ],
  },
  {
    question: "How do you turn the LITTO device on and off?",
    answers: [
      { text: "Wave a lighter in front of it", correct: false },
      { text: "Hold it with a roach clip for 5 seconds", correct: false },
      { text: "Click the button fast 5 times", correct: true },
      { text: "Roll the device to blunt", correct: false },
    ],
  },
  {
    question: "How does the LITTO device unclog itself?",
    answers: [
      { text: "Click it fast 2 times", correct: true },
      { text: "Suck it until you taste distillate", correct: false },
      { text: "Blow into it", correct: false },
      { text: "Throw it in the microwave", correct: false },
    ],
  },
  {
    question: "What are LITTO Bites package options?",
    answers: [
      { text: "1 and 10", correct: true },
      { text: "4 and 20", correct: false },
      { text: "7 and 10", correct: false },
      { text: "9 and 10", correct: false },
    ],
  },
  {
    question: "How many flavors does LITTO Bites offer?",
    answers: [
      { text: "20", correct: false },
      { text: "5", correct: true },
      { text: "4", correct: false },
      { text: "19", correct: false },
    ],
  },
  {
    question: "How much THC is in each LITTO Bites gummy?",
    answers: [
      { text: "28 grams", correct: false },
      { text: "1 ounce", correct: false },
      { text: "An eighth of a gram", correct: false },
      { text: "10mg", correct: true },
    ],
  },
  {
    question: "Are LITTO Bites gummy vegan and gluten-free?",
    answers: [
      { text: "No", correct: false },
      { text: "Yes", correct: true },
      { text: "Maybe", correct: false },
      { text: "I’ll answer you after I take one", correct: false },
    ],
  },
];
