// remove page scrolling restraint when modal taller than viewport is closed
export const handleModalResetPageScrolling = () => {
  const appWrapper = document.querySelector('.app-wrapper');
  if (!appWrapper.hasAttribute('style')) return;
  appWrapper.removeAttribute('style');
};
