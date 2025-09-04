import Link from 'next/link';

/**
 *
 * @param text {string} text for button or anchor and aria fallback
 * @param type {string} button or anchor, button being the default
 * @param href {string} path for anchor
 * @param className {string} button or anchor css such as cta-button cta-button--medium cta-button--purple
 * @param id {string} id for JavaScript logic
 * @param btnType {string} for buttons - can be button or submit, button being the default
 * @param ariaLabel {string} accessibility label, text being the fallback
 * @param isDisabled {boolean} disable button, false being the default
 * @param showSpinner {boolean} used for button to show loading spinner, default false
 * @param handleClick {function} for click event on button
 * @returns Call to Action component
 */

const CTA = ({
  text,
  type = 'button',
  href,
  className,
  id,
  btnType = 'button',
  ariaLabel,
  isDisabled = false,
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
          {...(id && { id: id })}
          {...(isDisabled && { disabled: true })}
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
          {...(id && { id: id })}
        >
          {text}
        </Link>
      )}
    </>
  );
};

export default CTA;
