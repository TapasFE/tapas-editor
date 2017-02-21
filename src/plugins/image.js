/*
 * @desc Image plugin
 *
 * Settings:
 * - image_set_figcaption: {Boolean | String}
 *   If truthy, existed images will be transformed and wrapped in `<figures>`s.
 *   If a string is provided, the string will be set as default in `<figcaption>`.
 */

import tinymce from '../tinymce';
import {selectFiles, url2blob} from './base';

tinymce.PluginManager.add('t_image', editor => {
  // compatibility issue
  if (editor.settings.image_in_figure) {
    editor.settings.image_set_figcaption = true;
  }

  editor.addButton('t_image', {
    icon: 'image',
    tooltip: 'Insert image',
    onclick: () => {
      selectFiles({accept: 'image/*'}, file => {
        fireUpload(file);
      });
    },
  });
  editor.on('BeforePastePreProcess', e => {
    const html = e.content;
    const matches = html.match(/^<img src="(.*?)">$/);
    if (matches) {
      e.preventDefault();
      url2blob(matches[1]).then(fireUpload);
    }
  });

  // If `image_set_figcaption` is true, wrap all `<image>`s within `<figure>`s.
  editor.settings.image_set_figcaption && editor.on('change', e => {
    const {dom} = editor;
    editor.$('img').each((i, img) => {
      const block = dom.getParent(img, dom.isBlock);
      if (block.nodeName !== 'FIGURE') {
        const $figure = editor.$(img).wrap('<figure>').parent();
        $figure
        .append('<figcaption>')
        .find('figcaption').html('<br>');
        const figure = $figure[0];
        dom.split(block, figure, figure);
      }
    });
  });

  // Check `<figure>`s to ensure `<figcaption>` is the last element.
  // Otherwise, splice the rest of content and wrap them in `<p>`s.
  editor.on('change', e => {
    const $els = editor.$('figure>figcaption~*');
    if (!$els.length) return;
    const {dom} = editor;
    // The array should be reversed so that the last element will stay at last.
    for (let i = $els.length; i--; ) {
      const el = $els[i];
      editor.$(el.parentNode).after(el);
    }
    dom.replace(dom.create('p'), $els, true);
    const range = editor.selection.getRng();
    if (range.collapsed && range.endContainer.nodeName === 'FIGURE') {
      range.selectNode(range.endContainer.nextSibling);
      range.collapse();
      editor.selection.setRng(range);
    }
  });

  function fireUpload(file) {
    const callback = editor.settings.image_set_figcaption ? insertFigure : insertImage;
    editor.fire('TUploadImage', {
      data: file,
      callback,
    });
  }
  function isTextBlock(node) {
    const textBlockElements = editor.schema.getTextBlockElements();
    return textBlockElements[node.nodeName];
  }
  function insertImage(url) {
    const {dom} = editor;
    editor.insertContent(dom.createHTML('img', {src: url}));
  }
  function insertFigure(url, text) {
    if (text == null) {
      text = editor.settings.image_set_figcaption;
    }
    if (typeof text !== 'string') text = '';
    const {dom} = editor;
    const id = '__tapas_editor_figure';
    editor.selection.setContent(dom.createHTML('figure', {
      id,
      // contentEditable: false,
    }));
    const figure = dom.get(id);
    dom.setAttrib(figure, 'id', null);
    const img = dom.create('img', {src: url});
    figure.appendChild(img);
    figure.appendChild(dom.create('figcaption', {
      // contentEditable: true,
    }, text || '<br>'));
    const textBlock = dom.getParent(figure.parentNode, isTextBlock);
    if (textBlock) {
      dom.split(textBlock, figure, figure);
    }
  }
});
