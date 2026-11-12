import type { InfoPage } from './types';

export const privacyPage: InfoPage = {
  title: 'Privacy',
  sections: [
    {
      heading: 'Your information',
      paragraphs: [
        'Nutritiodle does not ask you to create an account or enter personal information.',
        'Your guesses and scores exist only in your browser while you play. Refreshing the page or starting a new game clears them.',
      ],
    },
  ],
};
