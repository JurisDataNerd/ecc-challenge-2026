import React from 'react';
import { X } from '@phosphor-icons/react';

interface PixelModalFrameProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  variant?: 'slate' | 'gold' | 'parchment';
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const PixelModalFrame: React.FC<PixelModalFrameProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = '#d97706',
  icon,
  onClose,
  variant = 'gold',
  maxWidth = 'max-w-4xl',
  children,
  footer
}) => {
  const windowClass = 
    variant === 'parchment'
      ? 'rpg-window-parchment text-amber-950'
      : variant === 'gold'
      ? 'rpg-window-gold text-slate-100'
      : 'rpg-window text-slate-100';

  const headerBgClass =
    variant === 'parchment'
      ? 'bg-[#edd9af] border-b-2 border-[#b45309]'
      : variant === 'gold'
      ? 'bg-gradient-to-r from-[#172033] via-[#0f172a] to-[#172033] border-b-2 border-amber-600/70'
      : 'bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#1e293b] border-b-2 border-slate-700';

  const footerBgClass =
    variant === 'parchment'
      ? 'bg-[#edd9af] border-t-2 border-[#b45309]'
      : 'bg-[#080d1a] border-t-2 border-amber-900/60';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className={`w-full ${maxWidth} ${windowClass} rounded-none flex flex-col max-h-[92vh] overflow-hidden`}>
        {/* 4 Golden Corner Rivets */}
        <span className="rpg-corner-stud-tl" />
        <span className="rpg-corner-stud-tr" />
        <span className="rpg-corner-stud-bl" />
        <span className="rpg-corner-stud-br" />

        {/* Modal Plaque Header */}
        <div className={`flex items-center justify-between px-5 py-3.5 ${headerBgClass} relative shrink-0`}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-slate-950/80 border-2 border-amber-500/80 shadow-[1px_1px_0_#000] text-amber-400">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {badge && (
                  <span 
                    className="font-pixel text-[9px] uppercase px-2 py-0.5 border shadow-[1px_1px_0_#000]"
                    style={{ 
                      backgroundColor: `${badgeColor}25`, 
                      borderColor: badgeColor,
                      color: badgeColor 
                    }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <h2 className="font-rpg text-lg md:text-xl font-bold tracking-wide text-amber-300 drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[11px] font-mono text-slate-300 line-clamp-1 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Retro [X] Button */}
          <button
            onClick={onClose}
            title="Tutup (ESC)"
            className="rpg-btn rpg-btn-crimson px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer"
          >
            <X size={14} weight="bold" />
            <span className="font-pixel text-[9px]">ESC</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className={`px-5 py-3 ${footerBgClass} flex items-center justify-between shrink-0`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
