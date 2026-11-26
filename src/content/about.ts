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
        'Each guess is scored out of 100. For larger nutrients (15g or more), you lose points by percentage: 10% off scores 90, 25% off scores 75. For smaller values, points are lost per gram instead, so being 1g off barely costs you. Your final score is the average of your scores for every food in today\'s game.',
      ],
    },
  ],
};
