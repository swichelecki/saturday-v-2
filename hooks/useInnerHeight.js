import { useState, useEffect } from 'react';

export const useInnerHeight = () => {
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    setInnerHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setInnerHeight(window.innerHeight);
    });

    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, [innerHeight]);

  return innerHeight;
};
