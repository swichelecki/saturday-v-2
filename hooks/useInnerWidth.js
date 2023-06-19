import { useState, useEffect } from 'react';

export const useInnerWidth = () => {
  const [innerWidth, setInnerWidth] = useState(0);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setInnerWidth(window.innerWidth);
    });
    return () => {
      window.removeEventListener('resize', () => {
        setInnerWidth(window.innerWidth);
      });
    };
  }, [innerWidth]);

  return innerWidth;
};
