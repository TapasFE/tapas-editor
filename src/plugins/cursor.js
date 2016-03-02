/**
 * @desc Cursor plugin for TinyMCE
 *
 * This plugin keeps cursor out of tags as expected when `setRng` is
 * called.
 *
 */

import tinymce from '../tinymce';

// U+200B is a zero-width space
const MAGIC_SPACE = '\u200b';
const RE_MAGIC_SPACE = new RegExp(MAGIC_SPACE, 'g');

tinymce.PluginManager.add('t_cursor', editor => {
  let magicSpace;
  let noMagic = false;

  editor.on('keydown', onKeyDown);

  editor.on('GetContent', e => {
    e.content = e.content.replace(RE_MAGIC_SPACE, '');
  });

  editor.on('SetSelectionRange', onBeforeSetRange);

  function onBeforeSetRange(e) {
    const rng = e.range;
    let addMagic = !noMagic && rng.collapsed && rng.endContainer.nodeType === 1 && rng.endOffset;
    if (addMagic) {
      // ignore case: `<p><br>|</p>`
      const prev = rng.endContainer.childNodes[rng.endOffset - 1];
      if (prev && prev.tagName && prev.tagName.toLowerCase() === 'br') addMagic = false;
    }
    if (addMagic) {
      // ignore case: `<body>...|</body>`
      if (rng.endContainer === editor.getDoc().body) addMagic = false;
    }
    if (addMagic) {
      const doc = editor.contentDocument;
      const temp = doc.createTextNode(MAGIC_SPACE);
      rng.insertNode(temp);
      removeMagicSpace();
      rng.selectNode(temp);
      rng.collapse();
      magicSpace = temp;
    }
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
      noMagic = true;
      editor.selection.setRng(range);
      noMagic = false;
    }
  }

  function removeMagicSpace() {
    if (magicSpace) {
      magicSpace.nodeValue = magicSpace.nodeValue.replace(RE_MAGIC_SPACE, '');
      magicSpace.nodeValue || magicSpace.remove();
      magicSpace = null;
    }
  }
});
