'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdAddLink,
  MdOutlineFormatListNumbered,
  MdOutlineFormatListBulleted,
  MdOpenInNew,
  MdLinkOff,
} from 'react-icons/md';
import { MdEdit } from 'react-icons/md';

const RichTextEditor = () => {
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const linkBoxRef = useRef(null);
  const linkBoxInputRef = useRef(null);
  const updateLinkBoxRef = useRef(null);
  const boldButtonRef = useRef(null);
  const italicsButtonRef = useRef(null);
  const underlineButtonRef = useRef(null);

  const [selectedText, setSelectedText] = useState('');
  const [selectedLinkText, setSelectedLinkText] = useState('');
  const [selectedAnchorTag, setSelectedAnchorTag] = useState('');
  const [selectedLink, setSelectedLink] = useState('');

  const [currentTextNode, setCurrentTextNode] = useState('');
  const [currentTargetPosition, setCurrentTargetPosition] = useState(0);

  // put editor text selected by mouse into state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTextSelection = () => {
      setSelectedText(window.getSelection().toString());
    };

    editorRef.current.addEventListener('mouseup', handleTextSelection);

    return () =>
      editorRef?.current?.removeEventListener('mouseup', handleTextSelection);
  }, []);

  // remove selected state from toolbar when clicking off editor
  useEffect(() => {
    const handleRemoveToolbarSelectedState = (e) => {
      if (
        !editorRef.current.contains(e.target) &&
        !toolbarRef.current.contains(e.target)
      ) {
        boldButtonRef.current.classList.remove(
          'rich-text-editor__button--selected'
        );
        italicsButtonRef.current.classList.remove(
          'rich-text-editor__button--selected'
        );
        underlineButtonRef.current.classList.remove(
          'rich-text-editor__button--selected'
        );
      }
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('click', handleRemoveToolbarSelectedState);

      return () => {
        document.removeEventListener('click', handleRemoveToolbarSelectedState);
      };
    }
  }, []);

  // close link box when clicking off of it
  useEffect(() => {
    const handleCloseLinkBoxWhenClickOff = (e) => {
      if (
        !linkBoxRef.current.contains(e.target) &&
        e.target.dataset.buttonType !== 'hyperlink' &&
        e.target.dataset.buttonType !== 'update-hyperlink'
      ) {
        linkBoxRef.current.classList.remove('rich-text-editor__link-box--show');
      }
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('click', handleCloseLinkBoxWhenClickOff);

      return () => {
        document.removeEventListener('click', handleCloseLinkBoxWhenClickOff);
      };
    }
  }, []);

  // close update link box when clicking off of it
  useEffect(() => {
    const handleCloseUpdateLinkBoxWhenClickOff = (e) => {
      if (
        !updateLinkBoxRef.current.contains(e.target) &&
        e.target.dataset.anchor !== 'editor-anchor'
      ) {
        updateLinkBoxRef.current.classList.remove(
          'rich-text-editor__link-box--show'
        );
      }
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('click', handleCloseUpdateLinkBoxWhenClickOff);

      return () => {
        document.removeEventListener(
          'click',
          handleCloseUpdateLinkBoxWhenClickOff
        );
      };
    }
  }, []);

  // show update link box when clicking on hyperlinked text in editor
  useEffect(() => {
    const anchorTags = Array.from(editorRef.current.getElementsByTagName('a'));

    const handleEditorAnchorTagClick = (e) => {
      handleShowUpdateLinkBox();
      setSelectedLinkText(e.target.innerText);
      setSelectedLink(e.target.href);
      setSelectedAnchorTag(e.target.outerHTML);
    };

    anchorTags.forEach((item) => {
      item.addEventListener('click', handleEditorAnchorTagClick);
    });

    return () => {
      anchorTags.forEach((item) => {
        item.removeEventListener('click', handleEditorAnchorTagClick);
      });
    };
  }, [selectedText]);

  const createRange = (node, targetPosition) => {
    let range = document.createRange();
    range.selectNode(node);

    let pos = 0;
    const stack = [node];
    console.log('stack ', stack);
    while (stack.length > 0) {
      let current = stack.pop();

      if (current.nodeType === Node.TEXT_NODE) {
        console.log('current.textContent ', current.textContent);
        console.log('targetPosition ', targetPosition);
        const len = current.textContent.length;
        if (pos + len >= targetPosition) {
          console.log('pos ', pos);
          console.log('targetPosition - pos ', targetPosition - pos);
          /*    range.setStart(current, targetPosition - pos);
          range.setEnd(current, targetPosition - pos); */

          /*  const parser = new DOMParser();
          const el = parser.parseFromString(
            '<span class="rich-text-editor__editor-cursor">&#xFEFF; d</span>',
            'text/html'
          ).body;
          const frag = document.createDocumentFragment();
          frag.appendChild(el.firstChild); */

          /* const element = document.createElement('span');
          element.classList.add('rich-text-editor__editor-cursor');
          element.appendChild(document.createTextNode('\u00A0'));
          //const clonedRange = range.cloneRange();
          range.setStart(current, targetPosition - pos);
          range.collapse(true);
          range.insertNode(element);
          setCurrentTextNode(current);
          setCurrentTargetPosition(targetPosition - pos); */

          console.log('RANGE ', range);
          if (
            boldButtonRef.current.classList.contains(
              'rich-text-editor__button--selected'
            )
          ) {
            // document.querySelector('.rich-text-editor__editor-cursor').remove();
            const element = document.createElement('strong');
            element.appendChild(document.createTextNode('\u00A0'));

            range.setStart(current, targetPosition - pos);
            range.collapse(true);
            range.insertNode(element);
          } else {
            /*  console.log('    current.parentElement,', current.parentElement);
            console.log(
              '     current.parentElement.offest',
              current.parentElement.endOffset
            );
            range.setStart(
              current.parentElement,
              current.parentElement.endOffset
            );
            range.collapse(true); */
            console.log('parent,', current.parentElement);

            //const element = document.createTextNode('\u00A0');
            //const element = document.createElement('p');
            ////const poo = element.appendChild(document.createTextNode('\u00A0'));
            ///console.log('element', poo);
            const textNode = current.parentElement.insertAdjacentHTML(
              'afterend',
              document.createTextNode('\u00A0')
              // current.parentElement
            );
            console.log('textnode ', textNode);
            range.setStart(textNode, 1);
            range.collapse(true);
            //range.insertNode(element);
          }

          /*       if (
            boldButtonRef.current.classList.contains(
              'rich-text-editor__button--selected'
            )
          ) {
            const element = document.createElement('strong');
            element.appendChild(document.createTextNode('\u00A0'));

            range.setStart(current, targetPosition - pos);

            range.collapse(true);
            range.insertNode(element);
          }
 */
          /*   if (
            boldButtonRef.current.classList.contains(
              'rich-text-editor__button--selected'
            )
          ) {
            const element = document.createElement('strong');
            element.appendChild(document.createTextNode('\u00A0'));

            range.setStart(current, targetPosition - pos);

            range.collapse(true);
            range.insertNode(element);
          } else {
 */

          /*   range.setStart(current, range.endOffset);
            range.collapse(true);
            //range.setEnd(current, range.endOffset);
            const parser = new DOMParser();
            const el = parser.parseFromString(
              '<span class="rich-text-editor__editor-cursor">&#xFEFF;</span>',
              'text/html'
            ).body;
            const frag = document.createDocumentFragment();
            frag.appendChild(el.firstChild);
            range.insertNode(frag); 

            range.setStart();

            var dummyElement = document.createElement('span');
            dummyElement.appendChild(document.createTextNode('\u00A0'));

            node.appendChild(dummyElement);

            var nextElement =
              node.getElementsByTagName('strong')[0].nextElementSibling;
            range.setStart(nextElement.childNodes[0], 1);
            //range.setEnd(nextElement.childNodes[0], 1);
            //range.setStart(current, targetPosition - pos);
            range.collapse(true); */
          // }

          return range;
        }
        pos += len;
      } else if (current.childNodes && current.childNodes.length > 0) {
        for (let i = current.childNodes.length - 1; i >= 0; i--) {
          stack.push(current.childNodes[i]);
        }
      }
    }

    // The target position is greater than the
    // length of the contenteditable element.
    range.setStart(node, node.childNodes.length);
    range.setEnd(node, node.childNodes.length);
    return range;
  };

  const setPosition = (targetPosition) => {
    const range = createRange(editorRef.current, targetPosition);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const isTagInside = (node, nodeName) => {
    if (node.tagName === 'DIV') return false;
    if (node === document.body) return false;

    if (node.parentElement.nodeName === nodeName) {
      return node.parentElement;
    } else {
      return isTagInside(node.parentElement, nodeName);
    }
  };

  const removeTextFormatting = (node) => {
    const parent = node.parentElement;
    for (let i = 0; i < parent.childNodes.length; ++i) {
      if (parent.childNodes[i] === node) {
        while (node.childNodes[0]?.length > 0) {
          parent.insertBefore(node.firstChild, node);
        }
        parent.removeChild(node);
        return;
      }
    }
  };

  const handleTextFormattingOnSelection = (tagName) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    const startContainerNode = isTagInside(range.startContainer, tagName);
    const endContainerNode = isTagInside(range.endContainer, tagName);

    // add formatting to selected text
    if (!startContainerNode && !endContainerNode) {
      const htmlTag = document.createElement(tagName);
      htmlTag.appendChild(range.extractContents());
      range.insertNode(htmlTag);
    }

    // remove formatting from selected text
    if (startContainerNode && endContainerNode) {
      removeTextFormatting(startContainerNode);
    }
  };

  /*   const handleOnInput = () => {
    //if (document.querySelector('.rich-text-editor__editor-cursor')) {
    let range = document.createRange();
    range.selectNode(editorRef.current);

    if (
      boldButtonRef.current.classList.contains(
        'rich-text-editor__button--selected'
      ) &&
      document?.querySelector('.rich-text-editor__editor-cursor')
    ) {
      document?.querySelector('.rich-text-editor__editor-cursor')?.remove();
      const element = document.createElement('strong');
      element.appendChild(document.createTextNode('\u00A0'));
      //range.setStart(currentTextNode, currentTargetPosition);
      //range.collapse(true);
      //range.insertNode(element);
    } else if (
      !boldButtonRef.current.classList.contains(
        'rich-text-editor__button--selected'
      )
    ) {
      document?.querySelector('.rich-text-editor__editor-cursor')?.remove();

      // range.setStart(currentTextNode, currentTextNode.endOffset);
    }
  }; */

  // handle bold button
  const handleBold = () => {
    boldButtonRef.current.classList.toggle(
      'rich-text-editor__button--selected'
    );

    const selection = window.getSelection();
    const selectedTextLength = selection.toString().length;

    // handle click on bold button when no text selected
    if (selectedTextLength <= 0) {
      const range = selection.getRangeAt(0);
      const clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(editorRef.current);
      clonedRange.setEnd(range.endContainer, range.endOffset);
      const targetPosition = clonedRange.toString().length;
      setPosition(targetPosition);
    }

    // handle adding or removing bold when text selected and bold button clicked
    if (selectedTextLength >= 1) handleTextFormattingOnSelection('STRONG');
  };

  // handle italics button
  const handleItalics = () => {
    italicsButtonRef.current.classList.toggle(
      'rich-text-editor__button--selected'
    );

    // handle adding italics when selectd text
    if (selectedText) {
      handleTextFormattingOnSelection('em');
      /*   editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
        selectedText,
        `<i>${selectedText}</i>`
      );
      setSelectedText(''); */
    }
  };

  // handle underline button
  const handleUnderline = () => {
    underlineButtonRef.current.classList.toggle(
      'rich-text-editor__button--selected'
    );

    // handle adding underline when selectd text
    if (selectedText) {
      handleTextFormattingOnSelection('u');
      /*  editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
        selectedText,
        `<u>${selectedText}</u>`
      );
      setSelectedText(''); */
    }
  };

  // handle show link box button
  const handleShowAddLinkBox = () => {
    //if (!selectedText) return;
    console.log('show add box ');
    updateLinkBoxRef.current.classList.remove(
      'rich-text-editor__link-box--show'
    );

    linkBoxRef.current.classList.toggle('rich-text-editor__link-box--show');
    linkBoxInputRef.current.focus();
  };

  // handle show update link box
  const handleShowUpdateLinkBox = () => {
    updateLinkBoxRef.current.classList.toggle(
      'rich-text-editor__link-box--show'
    );
  };

  // handle adding link via link box
  const handleAddLink = () => {
    if (!selectedLink) return;

    let https = '';
    if (!selectedLink.includes('https://')) {
      https = 'https://';
    }

    // add hyperlink to selected text
    if (selectedText) {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
        selectedText,
        `<a href="${https}${selectedLink}" target="_blank" data-anchor="editor-anchor">${selectedText}</a>`
      );
      linkBoxRef.current.classList.remove('rich-text-editor__link-box--show');
      setSelectedText('');
    }

    // replace hyperlink using editing box
    if (selectedAnchorTag)
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
        selectedAnchorTag,
        `<a href="${https}${selectedLink}" target="_blank" data-anchor="editor-anchor">${selectedLinkText}</a>`
      );
    linkBoxRef.current.classList.remove('rich-text-editor__link-box--show');
    setSelectedAnchorTag('');
    setSelectedLinkText('');
  };

  // handle remove hyperlink using editing box
  const handleRemoveLink = () => {
    if (!selectedAnchorTag || !selectedLinkText) return;

    editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
      selectedAnchorTag,
      selectedLinkText
    );
    updateLinkBoxRef.current.classList.remove(
      'rich-text-editor__link-box--show'
    );
    setSelectedAnchorTag('');
    setSelectedLinkText('');
  };

  console.log('selected link ', selectedLink);
  console.log('selected anchor tag ', selectedAnchorTag);

  return (
    <div className='rich-text-editor'>
      <div className='rich-text-editor__toolbar' ref={toolbarRef}>
        <button
          onClick={handleBold}
          ref={boldButtonRef}
          type='button'
          title='bold'
          className='rich-text-editor__button'
        >
          <MdFormatBold />
        </button>
        <button
          onClick={handleItalics}
          ref={italicsButtonRef}
          type='button'
          title='italics'
          className='rich-text-editor__button'
        >
          <MdFormatItalic />
        </button>
        <button
          onClick={handleUnderline}
          ref={underlineButtonRef}
          type='button'
          title='underline'
          className='rich-text-editor__button'
        >
          <MdFormatUnderlined />
        </button>
        <button
          onClick={handleShowAddLinkBox}
          type='button'
          title='hyperlink'
          className='rich-text-editor__button'
          data-button-type='hyperlink'
        >
          <MdAddLink />
        </button>
        <button
          //onClick={handleShowAddLinkBox}
          type='button'
          title='ordered list'
          className='rich-text-editor__button'
        >
          <MdOutlineFormatListNumbered />
        </button>
        <button
          //onClick={handleShowAddLinkBox}
          type='button'
          title='unordered list'
          className='rich-text-editor__button'
        >
          <MdOutlineFormatListBulleted />
        </button>
      </div>
      <div
        ref={editorRef}
        className='rich-text-editor__editor'
        contentEditable='true'
        //onInput={handleOnInput}
      />
      {/* Add link box */}
      <div ref={linkBoxRef} className='rich-text-editor__link-box'>
        <input
          ref={linkBoxInputRef}
          value={selectedLink}
          onChange={(e) => setSelectedLink(e.target.value)}
          type='text'
          placeholder='Enter link'
        />
        <button
          onClick={handleAddLink}
          type='button'
          className='form-page__save-button'
        >
          Save
        </button>
      </div>
      {/* Update link box */}
      <div ref={updateLinkBoxRef} className='rich-text-editor__link-box'>
        <a href={selectedLink} target='_blank'>
          <MdOpenInNew />
          {selectedLink}
        </a>
        <button
          onClick={handleShowAddLinkBox}
          type='button'
          className='rich-text-editor__button rich-text-editor__button--update'
          data-button-type='update-hyperlink'
        >
          <MdEdit />
        </button>
        <button
          onClick={handleRemoveLink}
          type='button'
          className='rich-text-editor__button rich-text-editor__button--unlink'
        >
          <MdLinkOff />
        </button>
      </div>
    </div>
  );
};

export default RichTextEditor;
