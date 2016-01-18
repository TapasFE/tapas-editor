/**
 * @desc Cursor plugin for TinyMCE
 *
 * This plugin moves cursor out of certain tags to avoid unexpected formatted
 * text.
 *
 * Settings:
 * - cursor_out_of {String | Array} CSS selector or array of CSS selectors
 *
 */

import tinymce from '../tinymce';

// U+200B is a zero-width space
const MAGIC_SPACE = '\u200b';
const RE_MAGIC_SPACE = new RegExp(MAGIC_SPACE, 'g');

tinymce.PluginManager.add('t_cursor', (editor) => {
  let magicSpace;

  let cursorOutOf = editor.settings.cursor_out_of;
  if (!Array.isArray(cursorOutOf)) cursorOutOf = [cursorOutOf];
  cursorOutOf.reverse();

  if (cursorOutOf.length) {
    editor.on('NodeChange', moveCursor);

    editor.on('keydown', onKeyDown);

    editor.on('GetContent', (e) => {
      e.content = e.content.replace(RE_MAGIC_SPACE, '');
    });
  }

  function onKeyDown(e) {
    if (e.keyCode === 8 || e.keyCode === 37) {
      const range = editor.selection.getRng();
      if (!range.collapsed) return;
      const cursor = {
        container: range.endContainer,
        offset: range.endOffset,
      };
      let index, n = -1;
      const hasMagicSpace = cursor.container.contains(magicSpace);
      const indexOf = Array.prototype.indexOf;
      if (hasMagicSpace) {
        if (cursor.container === magicSpace) {
          if (magicSpace.nodeValue.replace(RE_MAGIC_SPACE, '')) {
            if (cursor.offset) cursor.offset --;
          } else {
            cursor.container = magicSpace.parentNode;
            cursor.offset = indexOf.call(cursor.container.childNodes, magicSpace);
          }
        } else {
          n = cursor.container.childNodes.length;
          let magicSpaceContainer = magicSpace;
          while (magicSpaceContainer && magicSpaceContainer.parentNode !== cursor.container)
            magicSpaceContainer = magicSpaceContainer.parentNode;
          index = indexOf.call(cursor.container.childNodes, magicSpaceContainer);
        }
        removeMagicSpace();
        if (~index) {
          if (cursor.container.childNodes.length < n && index < cursor.offset) cursor.offset --;
        } else {
          // index should not be -1
          console.warn('There might be compliant problems with your browser!');
        }
      }
      range.setStart(cursor.container, cursor.offset);
      range.setEnd(cursor.container, cursor.offset);
      editor.selection.setRng(range);
    }
  }

  function moveCursor() {
    let i, j;
    for (j = 20; j --; ) {
      for (i = cursorOutOf.length; i --; ) {
        const selector = cursorOutOf[i];
        if (moveOut(selector)) break;
      }
      if (i < 0) break;
    }
    if (!j) {
      console.warn('Node change iterations reached maximum limit!');
    }
  }

  function moveOut(selector) {
    const range = editor.selection.getRng();
    if (!range.collapsed) return;
    const dom = editor.dom;
    const tag = dom.getParent(range.endContainer, selector);
    let cursorMoved = false;
    if (tag) {
      if (tag === range.endContainer.parentNode) {
        if (!range.endOffset) {
          setCursor(tag, range);
          cursorMoved = true;
        } else if (range.endOffset === range.endContainer.length) {
          setCursor(tag, range, true);
          cursorMoved = true;
        }
      }
    }
    return cursorMoved;
  }

  function setCursor(el, range, after) {
    range = range || editor.selection.getRng();
    if (after) {
      range.setStartAfter(el);
      range.setEndAfter(el);
    } else {
      range.setStartBefore(el);
      range.setEndBefore(el);
    }

    const doc = editor.contentDocument;
    const temp = doc.createTextNode(MAGIC_SPACE);
    range.insertNode(temp);
    removeMagicSpace();
    range.selectNode(temp);
    range.collapse();
    editor.selection.setRng(range);
    magicSpace = temp;
  }

  function removeMagicSpace() {
    if (magicSpace) {
      magicSpace.nodeValue = magicSpace.nodeValue.replace(RE_MAGIC_SPACE, '');
      magicSpace.nodeValue || magicSpace.remove();
      magicSpace = null;
    }
  }
});
