import Link from 'next/link';

/**
 *
 * @param text {string} text for button or anchor and aria fallback
 * @param type {string} button or anchor, button being the default
 * @param href {string} path for anchor
 * @param className {string} button or anchor css such as cta-button cta-button--medium cta-button--purple
 * @param btnType {string} for buttons - can be button or submit, button being the default
 * @param ariaLabel {string} accessibility label, text being the fallback
 * @param showSpinner {boolean} used for button to show loading spinner, default false
 * @param handleClick {function} for click event on button
 * @returns Call to Action component
 */

const CTA = ({
  text,
  type = 'button',
  href,
  className,
  btnType = 'button',
  ariaLabel,
  showSpinner = false,
  handleClick,
}) => {
  const anchor = 'anchor';
  const button = 'button';

  if (!text) return;
  if (type === anchor && !href) return;
  if (type === button && btnType === button && !handleClick) return;

  const ariaText = ariaLabel || text;

  return (
    <>
      {type === button && (
        <button
          onClick={handleClick}
          type={btnType}
          className={className}
          aria-label={ariaText}
        >
          {showSpinner && <div className='loader'></div>}
          {text}
        </button>
      )}
      {type === anchor && (
        <Link
          href={href}
          onClick={handleClick}
          className={className}
          aria-label={ariaText}
        >
          {text}
        </Link>
      )}
    </>
  );
};

export default CTA;
