'use client';

import { useState, useEffect, useRef } from 'react';

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
    <div ref={promptRef} className='settings-prompt'>
      {children}
      <button onClick={handleGotItButton} className=''>
        Got It
      </button>
    </div>
  );
};

export default SettingsNewUserPrompt;
