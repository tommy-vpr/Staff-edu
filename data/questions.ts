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
    question: "What is LITTO about?",
    answers: [
      { text: "Collecting vintage bongs", correct: false },
      {
        text: "Perfecting the art of rolling the world's tiniest joints",
        correct: false,
      },
      { text: "Inventing a strain that tastes like nothing", correct: false },
      { text: "Hitting new highs", correct: true },
    ],
  },
  {
    question: "What makes LITTO Cannabis unique?",
    answers: [
      { text: "Only synthetic flavors", correct: false },
      { text: "Tobacco-based terpene blends", correct: false },
      { text: "True to flower palate", correct: true },
      { text: "Only available in hybrid strains", correct: false },
    ],
  },
  {
    question: "What feature helps prevent clogging in LITTO vapes?",
    answers: [
      { text: "Replaceable coil system", correct: false },
      { text: "Built-in anti-clog feature", correct: true },
      { text: "Preheat mode for wax", correct: false },
      { text: "Double wick technology", correct: false },
    ],
  },
  {
    question: "How many strains does LITTO offer?",
    answers: [
      { text: "10 strains", correct: false },
      { text: "25 strains", correct: false },
      { text: "5 strains", correct: false },
      { text: "19 strains", correct: true },
    ],
  },
  {
    question: "What is the THC percentage of LITTO Cannabis?",
    answers: [
      { text: "Always below 70%", correct: false },
      { text: "Exactly 50%", correct: false },
      { text: "Lab tested at 85%+", correct: true },
      { text: "Varies between 40% and 55%", correct: false },
    ],
  },
  {
    question: "What experience does LITTO provide from start to finish?",
    answers: [
      { text: "Consistent flavor from beginning to end", correct: true },
      { text: "Starts strong but fades quickly", correct: false },
      {
        text: "Strong taste at first, but no flavor after a few hits",
        correct: false,
      },
      { text: "Only menthol flavors last longer", correct: false },
    ],
  },
];
