import { useEffect, useRef, type ReactNode } from 'react';

export function JourneyDialog({ titleId, className = '', onClose, children }: {
  titleId: string; className?: string; onClose: () => void; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const heading = dialog.querySelector('h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      const map = document.querySelector<HTMLElement>('.game-viewport');
      if (map?.isConnected) map.focus({ preventScroll: true });
      else if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} className={`journey-dialog ${className}`} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); closeRef.current(); }}
    onMouseDown={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeRef.current();
    }}>
    {children}
  </dialog>;
}
