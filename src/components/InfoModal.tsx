import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { InfoPage } from '@/content/types';

type InfoModalProps = {
  page: InfoPage;
  onClose: () => void;
};

export default function InfoModal({ page, onClose }: InfoModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="info-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
        <header className="info-modal-header">
          <h2 id="info-modal-title">{page.title}</h2>
          <button ref={closeButtonRef} type="button" className="info-close" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2.5} />
          </button>
        </header>
        <div className="info-modal-body">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
