/**
 * @desc Filter HTML to remove unexpected attributes
 */

import tinymce from '../tinymce';

function filterHTML(editor, html) {
  var schema = new tinymce.html.Schema(), domParser = new tinymce.html.DomParser({}, schema), text = '';
  var shortEndedElements = schema.getShortEndedElements();
  var ignoreElements = tinymce.util.Tools.makeMap('script noscript style textarea video audio iframe object', ' ');
  var blockElements = schema.getBlockElements();

  function walk(node) {
    var name = node.name, currentNode = node;

    if (name === 'br') {
      text += '\n';
      return;
    }

    if (name === 'img') {
      text += '\x02img\x02' + node.attr('src') + '\x02\n';
      return;
    }

    if (name === 'strong') {
      text += '\x03strong\x03';
    }

    // img/input/hr
    if (shortEndedElements[name]) {
      text += ' ';
    }

    // Ingore script, video contents
    if (ignoreElements[name]) {
      text += ' ';
      return;
    }

    if (node.type == 3) {
      text += node.value;
    }

    // Walk all children
    if (!node.shortEnded) {
      if ((node = node.firstChild)) {
        do {
          walk(node);
        } while ((node = node.next));
      }
    }

    if (name === 'strong') {
      text += '\x03/strong\x03';
      return;
    }

    // Add \n or \n\n for blocks or P
    if (blockElements[name] && currentNode.next) {
      text += '\n';

      if (name == 'p') {
        text += '\n';
      }
    }
  }
  function filter(text, rules) {
    rules.forEach(function (rule) {
      text = text.replace(rule[0], rule[1]);
    });
    return text;
  }

  html = filter(html, [
    [/<!\[[^\]]+\]>/g, ''],
  ]);

  walk(domParser.parse(html));

  text = editor.dom.encode(text).replace(/\r\n/g, '\n');

  var startBlock = editor.dom.getParent(editor.selection.getStart(), editor.dom.isBlock);

  // Create start block html for example <p attr="value">
  var forcedRootBlockName = editor.settings.forced_root_block;
  var forcedRootBlockStartHtml;
  if (forcedRootBlockName) {
    forcedRootBlockStartHtml = editor.dom.createHTML(forcedRootBlockName, editor.settings.forced_root_block_attrs);
    forcedRootBlockStartHtml = forcedRootBlockStartHtml.substr(0, forcedRootBlockStartHtml.length - 3) + '>';
  }

  var images = {};
  /* eslint-disable no-control-regex */
  var imgFilter = [/\x02img\x02(.*?)\x02/g, function (_match, url) {
    images[url] = 1;
    return editor.dom.createHTML('img', {src: url}) + '\n';
  }];
  var tagFilter = [/\x03(\/?\w+)\x03/g, function (_match, tag) {
    return '<' + tag + '>';
  }];

  if ((startBlock && /^(PRE|DIV)$/.test(startBlock.nodeName)) || !forcedRootBlockName) {
    text = filter(text, [
      imgFilter,
      tagFilter,
      [/\n/g, '<br>'],
    ]);
  } else {
    text = filter(text, [
      imgFilter,
      tagFilter,
      [/\n\n/g, '</p>' + forcedRootBlockStartHtml],
      [/^(.*<\/p>)(<p>)$/, forcedRootBlockStartHtml + '$1'],
      [/\n/g, '<br />'],
    ]);

    if (text.indexOf('<p>') != -1) {
      text = forcedRootBlockStartHtml + text;
    }
  }

  return text;
}

tinymce.PluginManager.add('t_filter', editor => {
  editor.on('BeforePastePreProcess', function (e) {
    e.content = filterHTML(editor, e.content);
  });

  editor.on('TFilterHtml', e => {
    editor.setContent(filterHTML(editor, e.data));
  });
});
