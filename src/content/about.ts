import type { InfoPage } from './types';

export const aboutPage: InfoPage = {
  title: 'About',
  sections: [
    {
      heading: 'What is Nutritiodle?',
      paragraphs: [
        'Nutritiodle is a daily guessing game. Each day you are shown a featured food and try to guess its fat, sugars, and protein content in grams.',
      ],
    },
    {
      heading: 'How scoring works',
      paragraphs: [
        'Each guess is scored by how close it is to the real number. Your final score is the average of your scores for every food in today\'s game.',
      ],
    },
  ],
};
