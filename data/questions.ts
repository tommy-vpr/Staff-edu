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
      { text: "Hitting new highs", correct: true },
      { text: "Collecting vintage bongs", correct: false },
      {
        text: "Pefecting the art of rolling the worlds tiniest joints",
        correct: false,
      },
      { text: "Inventing a strain that tastes like pizza", correct: false },
    ],
  },
  {
    question: "How did LITTO start off?",
    answers: [
      { text: "As the California cannabis plug", correct: false },
      { text: "In California as a cannabis brand", correct: true },
      {
        text: "As a California cannabis grower",
        correct: false,
      },
      { text: "As a California hydro store", correct: false },
    ],
  },
  {
    question: "Why did we get into the hemp space?",
    answers: [
      {
        text: `After we saw success with our all-in-one
cannabis vape pens in California`,
        correct: true,
      },
      {
        text: `We wanted to stop being the California 
cannabis plug`,
        correct: false,
      },
      {
        text: "We wanted to to get into the cannabis industry",
        correct: false,
      },
      { text: "We wanted to stop growing cannabis", correct: false },
    ],
  },
  {
    question: "How do you turn the LITTO device on and off?",
    answers: [
      { text: "Roll the device into a blunt.", correct: false },
      {
        text: "Wave a lighter in front of it",
        correct: false,
      },
      { text: "Hold it with a roach clip for 5 seconds.", correct: false },
      { text: "Click the button fast 5 times", correct: true },
    ],
  },
  {
    question: "How does the LITTO device unclog itself?",
    answers: [
      { text: "Click it fast 2 times", correct: true },
      { text: "Suck it until you taste distillate", correct: false },
      {
        text: "Blow into it",
        correct: false,
      },
      { text: "Throw it in the microwave", correct: false },
    ],
  },
  {
    question: "What blend is KTFO?",
    answers: [
      { text: "THC", correct: false },
      {
        text: "THC-P",
        correct: false,
      },
      { text: "THC-A", correct: true },
      { text: "THC-A Live Resin", correct: false },
    ],
  },
  {
    question: "What blend is Zooted?",
    answers: [
      { text: "THC", correct: false },
      { text: "THC-P", correct: true },
      {
        text: "HHC+H4 Live Resin",
        correct: false,
      },
      { text: "THC-A", correct: false },
    ],
  },
  {
    question: "What blend is Faded?",
    answers: [
      { text: "HHC+H4 Live Resin", correct: true },
      { text: "THC", correct: false },
      {
        text: "THC-P",
        correct: false,
      },
      { text: "THC-A Live Resin", correct: false },
    ],
  },
  {
    question: "What blend is Smacked?",
    answers: [
      { text: "THC", correct: false },
      {
        text: "THC-P",
        correct: false,
      },
      { text: "THC-A", correct: false },
      { text: "THC-A Live Resin", correct: true },
    ],
  },
  {
    question: "What sizes do our prerolls come in?",
    answers: [
      { text: "1 gram and 3 grams", correct: true },
      {
        text: "4 grams and 20 grams",
        correct: false,
      },
      { text: "7 grams and 10 grams", correct: false },
      { text: "Eighth of a gram and eighth of an ounce", correct: false },
    ],
  },
  {
    question: "How do we cultivate our preroll flowers?",
    answers: [
      { text: "Sprayed flower", correct: false },
      {
        text: "We smoke it first",
        correct: false,
      },
      { text: "Infused flower", correct: true },
      { text: "We grind it and throw it into paper", correct: false },
    ],
  },
  {
    question: "How are our hemp products tested?",
    answers: [
      { text: "FBI forenic labs", correct: false },
      { text: "DEA certified labs", correct: true },
      {
        text: "The homie with the test kit",
        correct: false,
      },
      { text: "23 and Me", correct: false },
    ],
  },
];
