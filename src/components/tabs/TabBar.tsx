import { CloseButton } from '@mantine/core';
import type { KeyboardEvent, ReactNode } from 'react';
import classes from './TabBar.module.css';

export interface TabBarItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface TabBarProps {
  tabs: TabBarItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  /** Omit to hide close buttons. */
  onClose?: (id: string) => void;
}

/** Browser-style tab strip. The close button shows on the active tab and on hover. */
export function TabBar({ tabs, activeId, onSelect, onClose }: TabBarProps) {
  const handleKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div className={classes.bar} role="tablist">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <div
            key={tab.id}
            role="tab"
            tabIndex={0}
            aria-selected={active}
            title={tab.label}
            className={classes.tab}
            data-active={active || undefined}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, tab.id)}
          >
            {tab.icon && <span className={classes.icon}>{tab.icon}</span>}
            <span className={classes.label}>{tab.label}</span>
            {onClose && (
              <CloseButton
                size={18}
                iconSize={12}
                className={classes.close}
                aria-label={`Close ${tab.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(tab.id);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
