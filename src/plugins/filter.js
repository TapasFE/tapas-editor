/**
 * @desc Filter HTML to remove unexpected attributes
 */

import tinymce from '../tinymce';

const ignoreElements = tinymce.util.Tools.makeMap('script noscript style textarea video audio iframe object', ' ');
const schema = new tinymce.html.Schema();
const domParser = new tinymce.html.DomParser({}, schema);
const serializer = new tinymce.html.Serializer();
const shortEndedElements = schema.getShortEndedElements();
const blockElements = schema.getBlockElements();
const inlineFilters = {
  strong: filterInline,
  em: filterInline,
};
const tagFilters = Object.assign({
  br: filterBr,
  figure: filterFigure,
  img: filterImg,
}, inlineFilters);

function buildFigure(item) {
  return `<figure><img src="${item.image || ''}"><figcaption>${item.caption || '<br>'}</figcaption></figure>`;
}
function buildInline(item) {
  const html = `<${item.close ? '/' : ''}${item.name}>`;
}
function filterBr(node, ctx) {
  return {
    name: 'br',
    close: true,
    html(item) {
      return ctx.newLine;
    },
  };
}
function filterFigure(node, ctx) {
  const item = {
    name: 'figure',
    close: true,
    html: buildFigure,
  };
  for (let child = node.firstChild; child; child = child.next) {
    if (child.name === 'img') {
      item.image = child.attr('src');
    } else if (child.name === 'figcaption') {
      item.caption = filterNodeInline(ctx.editor, child);
    }
  }
  return item;
}
function filterImg(node, ctx) {
  return {
    name: 'figure',
    image: node.attr('src'),
    close: true,
    html: buildFigure,
  };
}
function filterInline(node, ctx, close) {
  return {
    name: node.name,
    data: node.firstChild,
    html: buildInline,
    close,
  };
}

function filterNode(editor, root, inline) {
  function walk(node) {
    const {name} = node;
    const filter = filters[name];

    if (filter) {
      const item = filter(node, ctx);
      contents.push(item);
      if (item.close) return;
    }

    if (node.type == 3) {
      contents.push({text: node.value});
    }

    if (!node.shortEnded) {
      for (let child = node.firstChild; child; child = child.next) {
        walk(child);
      }
    }

    if (filter) {
      const item = filter(node, ctx, true);
      contents.push(item);
      return;
    }

    if (blockElements[name] && node.next) {
      contents.push(filterBr(node, ctx));
    }
  }

  // Create start block html for example <p attr="value">
  const forcedRootBlockName = editor.settings.forced_root_block;
  let forcedRootBlockStartHtml;
  if (forcedRootBlockName && !inline) {
    forcedRootBlockStartHtml = editor.dom.createHTML(forcedRootBlockName, editor.settings.forced_root_block_attrs);
    forcedRootBlockStartHtml = forcedRootBlockStartHtml.substr(0, forcedRootBlockStartHtml.length - 3) + '>';
  }

  const filters = inline ? inlineFilters : tagFilters;
  const ctx = {editor, newLine: forcedRootBlockStartHtml || '<br>'};

  const contents = [];
  walk(root);

  const fragments = [];
  let block = [];
  const joinBlock = () => {
    if (block.length) {
      fragments.length && fragments.push(ctx.newLine);
      fragments.push(block.join(''));
      block = [];
    }
  };
  contents.forEach(item => {
    if (blockElements[item.name]) joinBlock();
    if (item.html) {
      block.push(item.html(item));
    } else if (item.text) {
      block.push(item.text);
    }
  });
  block.length && joinBlock();

  const startBlock = editor.dom.getParent(editor.selection.getStart(), editor.dom.isBlock);
  if ((startBlock && /^(PRE|DIV)$/.test(startBlock.nodeName)) || !forcedRootBlockName) {
  } else {
    // if (!fragments[0] || !fragments[0].startsWith(forcedRootBlockStartHtml)) {
    //   fragments.unshift(forcedRootBlockStartHtml);
    // }
  }
  const html = fragments.join('');
  console.log('filtered:', html);
  return html;
  // return serializer.serialize(root);
}

function filterNodeInline(editor, node) {
  return filterNode(editor, node, inlineFilters);
}

function filterHTML(editor, html) {
  console.log('filter html:', html);
  return filterNode(editor, domParser.parse(html));
}

function filterHTMLInline(editor, html) {
  console.log('filter inline:', html);
  return filterNodeInline(editor, domParser.parse(html));
}

tinymce.PluginManager.add('t_filter', editor => {
  editor.on('BeforePastePreProcess', function (e) {
    console.log('before paste');
    const rng = editor.selection.getRng();
    if (editor.dom.getParent(rng.endContainer, 'figcaption')) {
      e.content = filterHTMLInline(editor, e.content);
    } else {
      e.content = filterHTML(editor, e.content);
    }
  });

  editor.on('TFilterHtml', e => {
    console.log('filter html');
    editor.setContent(filterHTML(editor, e.data));
  });
});
