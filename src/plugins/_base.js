import tinymce from '../tinymce';

/**
 * @desc Build a string transformer with given char transformer.
 * @param {Function(char):char} transformChar
 */
export function stringTransformer(transformChar) {
  return function (str) {
    var result = '', len = str.length;
    for (let i = 0; i < len; i ++) {
      result += transformChar(str[i]);
    }
    return result;
  };
};

/**
 * @desc Walk through all nodes and transform the text with a string transformer.
 * @param {Object} editor A TinyMCE Editor instance.
 * @param {Function(string):string} transform
 */
export function traversalTransform(editor, transform) {
  const parser = editor.parser;
  const root = parser.parse(editor.getContent());
  let node = root;
  while ((node = node.walk())) {
    if (node.type === 3) {
      node.value = transform(node.value);
    }
  }
  const serializer = new tinymce.html.Serializer;
  editor.setContent(serializer.serialize(root));
  editor.fire('change');
};

/**
 * @desc Build a tag filter function.
 * @param {RegExp} pattern Matches three groups: prefix, content, suffix.
 */
export function tagFilter(editor, pattern) {
  return function ($el) {
    const html = $el.html();
    const matches = pattern.exec(html);
    let text;
    const range = editor.selection.getRng();
    if (matches) {
      const el = $el[0];
      if (matches[1]) {
        text = editor.dom.createFragment(matches[1]);
        el.parentNode.insertBefore(text, el);
      }
      if (matches[3]) {
        text = editor.dom.createFragment(matches[3]);
        el.parentNode.insertBefore(text, el.nextSibling);
      }
      if (text) {
        $el.html(matches[2]);
        if (range) {
          range.setStartAfter(text);
          range.setEndAfter(text);
        }
      }
    } else {
      const next = $el[0].nextSibling;
      const parent = $el[0].parentNode;
      $el.replaceWith(html);
      if (range) {
        if (next) {
          range.setStartBefore(next);
          range.setEndBefore(next);
        } else {
          const last = parent.lastChild;
          range.setStartAfter(last);
          range.setEndAfter(last);
        }
      }
    }
    range && editor.selection.setRng(range);
  };
};

/**
 * @desc Move next to `targetEl` according to `policy`.
 * @param {tinymce.Editor} editor
 * @param {Element} floatEl The element to be moved.
 * @param {Element} targetEl The target element.
 * @param {String} policy Relative position, e.g. 'bl-tl'.
 * @param {Object} offset (Optional)
 */
export function move(editor, floatEl, targetEl, policy, offset) {
  const rect = editor.dom.getRect(targetEl);
  const pos = tinymce.DOM.getPos(editor.getContentAreaContainer());
  rect.x += pos.x;
  rect.y += pos.y;
  const relRect = tinymce.geom.Rect.relativePosition({w: 0, h: 0}, rect, policy);
  offset = offset || {};
  floatEl.moveTo(relRect.x + (offset.x || 0), relRect.y + (offset.y || 0));
};

/**
 * @desc Select files and callback.
 * @param {Object} options
 *     - options.accept {String}
 *     - options.multiple {Boolean}
 * @param {Function(File|Array[File])} callback
 */
export function selectFiles(options, cb) {
  options = options || {};
  const file = document.createElement('input');
  file.setAttribute('type', 'file');
  if (options.accept)
    file.setAttribute('accept', options.accept);
  if (options.multiple)
    file.multiple = true;
  file.onchange = function () {
    if (this.files && this.files.length) {
      cb(options.multiple ? this.files : this.files[0]);
    }
  };

  // IE fix: `input[file]` MUST be attached to DOM
  file.setAttribute('style', 'display:none');
  document.body.appendChild(file);

  file.click();
  document.body.removeChild(file);
};

/**
 * @desc Transform a DataURL to Blob or File.
 * @param {String} url
 * @return {Blob}
 */
export function dataURL2Blob(url) {
  const parts = url.split(',');
  const byteString = atob(parts[1]);
  const mimeType = parts[0].split(':')[1].split(';')[0];
  const buf = [];
  for (let i = byteString.length; i --;) {
    buf[i] = byteString.charCodeAt(i);
  }
  return new Blob([new Uint8Array(buf)], {type: mimeType});
};
