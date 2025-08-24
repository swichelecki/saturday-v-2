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
  const anchorType = 'anchor';
  const buttonType = 'button';

  if (!text) return;
  if (type === anchorType && !href) return;
  if (type === buttonType && btnType === buttonType && !handleClick) return;

  const ariaText = ariaLabel || text;

  return (
    <>
      {type === buttonType && (
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
      {type === anchorType && (
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
