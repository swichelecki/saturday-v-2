'use client';

import { useState, useEffect, useRef } from 'react';

import { handleHiddenHeight } from '../../utilities';
import { IoClose } from 'react-icons/io5';

const Accordion = ({ title, children }) => {
  const accordionRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [accordionContentHeight, setAccordionContentHeight] = useState(0);

  // set accordion content height for when item is open
  useEffect(() => {
    setAccordionContentHeight(handleHiddenHeight(accordionRef.current));
  }, []);

  // If an accordion is open, close it before opening another accordion
  const handleCloseOpenAccordion = () => {
    const accordions = document.querySelectorAll('.accordion__toggle');
    for (const item of accordions) {
      if (
        item.dataset.accordion !== title &&
        item.getAttribute('aria-expanded') === 'open'
      ) {
        item.click();
      }
    }
  };

  return (
    <div className='accordion'>
      <button
        className='accordion__toggle'
        onClick={() => {
          setIsOpen(!isOpen);
          handleCloseOpenAccordion();
        }}
        type='button'
        data-accordion={title}
        aria-label='Select or create item category'
        aria-expanded={isOpen ? 'open' : 'closed'}
      >
        <IoClose style={isOpen && { transform: 'unset' }} />
        <p>{title}</p>
      </button>
      <div
        ref={accordionRef}
        // className={`accordion__content ${isOpen && 'accordion__content--open'}`}
        className='accordion__content'
        style={
          isOpen
            ? {
                height: `${accordionContentHeight}px`,
              }
            : { height: '0px' }
        }
      >
        {children}
      </div>
    </div>
  );
};

export default Accordion;
