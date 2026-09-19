'use client';

import { useState, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';

const Tabs = ({ tabs, panelsHeight, children }) => {
  const panelsRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [previousSelection, setPreviousSelection] = useState('');

  // On page load add a data attribute to each tab with a value corresponding to a CTA
  useEffect(() => {
    const panels = Array.from(panelsRef.current.children);

    let i = 0;
    for (const panel of panels) {
      panel.setAttribute(
        'data',
        `data-tab=${tabs[i].replace(/' '/g, '-').toLowerCase()}`,
      );
      panel.setAttribute('id', `panel-${i + 1}`);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `tab-${i + 1}`);
      i++;
    }
  }, []);

  // Handle panel tabbing
  useEffect(() => {
    const panels = Array.from(panelsRef.current.children);
    for (const panel of panels) {
      const inputs = Array.from(
        panel.querySelectorAll('input, button, select, a'),
      );
      for (const input of inputs) {
        input.setAttribute('tabIndex', isOpen ? '0' : '-1');
      }
    }

    // Quill
    const quillWrapper = document?.querySelector(
      '.form-field__quill-wrapper--toolbar',
    );
    if (!quillWrapper) return;

    const handleQuillTabbing = () => {
      const inputs = Array.from(
        quillWrapper?.querySelectorAll('input, button, select, a'),
      );
      if (!inputs?.length) return;
      for (const input of inputs) {
        input.setAttribute('tabIndex', isOpen ? '0' : '-1');
      }
      const quillTextArea = quillWrapper.querySelector('.ql-editor');
      quillTextArea.setAttribute('contenteditable', isOpen ? 'true' : 'false');
    };

    handleQuillTabbing();

    const observer = new MutationObserver(() => {
      handleQuillTabbing();
    });

    observer.observe(quillWrapper, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isOpen]);

  // Switch tab view & open and close tab wrapper
  const handleCloseOpenTabs = (e) => {
    const panels = Array.from(panelsRef.current.children);
    for (const panel of panels) {
      panel.setAttribute('style', 'display:none');

      if (panel.id.split('-')[1] === e.currentTarget.id.split('-')[1]) {
        panel.setAttribute('style', 'display:block');
      }
    }

    if (!isOpen) setIsOpen(true);

    if (isOpen && previousSelection === e.currentTarget.id) {
      setIsOpen(false);
    }
  };

  return (
    <div className='tabs'>
      <div
        className='tabs__ctas-wrapper'
        role='tablist'
        aria-label='Additional item options'
      >
        {tabs.map((title, index) => (
          <button
            className={`tabs__toggle ${`tab-${index + 1}` === previousSelection && isOpen && 'tabs__toggle--selected'}`}
            onClick={(e) => {
              handleCloseOpenTabs(e);
              setPreviousSelection(e.currentTarget.id);
            }}
            type='button'
            data-tab-cta={title.replace(/' '/g, '-').toLowerCase()}
            aria-label={`${title} tab`}
            key={`tab__${index}`}
            role='tab'
            aria-selected={
              `tab-${index + 1}` === previousSelection ? 'true' : 'false'
            }
            id={`tab-${index + 1}`}
          >
            <IoClose />
            <p>{title}</p>
          </button>
        ))}
      </div>
      <div
        ref={panelsRef}
        className='tabs__panels-wrapper'
        style={
          isOpen
            ? {
                height: `${panelsHeight}px`,
              }
            : { height: '0px' }
        }
      >
        {children}
      </div>
    </div>
  );
};

export default Tabs;
