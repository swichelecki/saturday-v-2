'use client';

import { AppWrapper } from 'context';

const GloablContext = ({ children }) => {
  return <AppWrapper>{children}</AppWrapper>;
};

export default GloablContext;
