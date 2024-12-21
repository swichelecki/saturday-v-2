import { useEffect } from 'react';

export const useScrollToError = (
  pageRef,
  scrollToErrorMessage,
  setScrollToErrorMessage
) => {
  useEffect(() => {
    if (!scrollToErrorMessage) return;
    const errorArray = Array.from(
      pageRef.current.querySelectorAll('.form-field--error')
    );
    const firstErrorNode = errorArray[0];
    window.scrollTo({
      top: firstErrorNode.offsetTop - 24,
      behavior: 'smooth',
    });
    setScrollToErrorMessage(false);
  }, [pageRef, scrollToErrorMessage, setScrollToErrorMessage]);
};
