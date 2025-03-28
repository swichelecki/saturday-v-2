'use client';

import { useState, useEffect, useRef } from 'react';
import { MdOutlineClear } from 'react-icons/md';

const SettingsNewUserPrompt = ({ handleGotItButton, children }) => {
  const promptRef = useRef(null);

  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (showPrompt) promptRef.current.classList.add('show-prompt');

    const showUserPrompt = setTimeout(() => {
      setShowPrompt(true);
    }, 500);

    return () => clearTimeout(showUserPrompt);
  }, [showPrompt]);

  return (
    <>
      <div className='prompt__new-user-background-overlay' />
      <div ref={promptRef} className='prompt'>
        {children}
        <button onClick={handleGotItButton}>
          <MdOutlineClear />
        </button>
      </div>
    </>
  );
};

export default SettingsNewUserPrompt;
