import tinymce from '../tinymce';

/**
 * @desc Build a string transformer with given char transformer.
 * @param {Function(char):char} transformChar
 */
export function stringTransformer(transformChar) {
  return function (str) {
    var result = '', len = str.length;
    for (var i = 0; i < len; i ++) {
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
  var parser = editor.parser;
  var root = parser.parse(editor.getContent());
  var node = root;
  while ((node = node.walk())) {
    if (node.type === 3) {
      node.value = transform(node.value);
    }
  }
  var serializer = new tinymce.html.Serializer;
  editor.setContent(serializer.serialize(root));
  editor.fire('change');
};

/**
 * @desc Build a tag filter function.
 * @param {RegExp} pattern Matches three groups: prefix, content, suffix.
 */
export function tagFilter(editor, pattern) {
  return function ($el) {
    var html = $el.html();
    var matches = pattern.exec(html);
    var text;
    var range = editor.selection.getRng();
    if (matches) {
      var el = $el[0];
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
      var next = $el[0].nextSibling;
      var parent = $el[0].parentNode;
      $el.replaceWith(html);
      if (range) {
        if (next) {
          range.setStartBefore(next);
          range.setEndBefore(next);
        } else {
          var last = parent.lastChild;
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
  var rect = editor.dom.getRect(targetEl);
  var pos = tinymce.DOM.getPos(editor.getContentAreaContainer());
  rect.x += pos.x;
  rect.y += pos.y;
  var relRect = tinymce.geom.Rect.relativePosition({w: 0, h: 0}, rect, policy);
  offset = offset || {};
  floatEl.moveTo(relRect.x + (offset.x || 0), relRect.y + (offset.y || 0));
};
