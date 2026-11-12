import { useCallback, useState } from 'react';
import InfoModal from '@/components/InfoModal';
import { aboutPage } from '@/content/about';
import { disclaimerText } from '@/content/disclaimer';
import { privacyPage } from '@/content/privacy';
import type { InfoPage } from '@/content/types';

const pages: Record<'about' | 'privacy', InfoPage> = {
  about: aboutPage,
  privacy: privacyPage,
};

export default function SiteFooter() {
  const [openPage, setOpenPage] = useState<keyof typeof pages | null>(null);
  const closePage = useCallback(() => setOpenPage(null), []);

  return (
    <footer className="site-footer">
      <nav className="footer-links" aria-label="Site information">
        <button type="button" onClick={() => setOpenPage('about')}>About</button>
        <button type="button" onClick={() => setOpenPage('privacy')}>Privacy</button>
      </nav>
      <p className="disclaimer">{disclaimerText}</p>
      {openPage && <InfoModal page={pages[openPage]} onClose={closePage} />}
    </footer>
  );
}
