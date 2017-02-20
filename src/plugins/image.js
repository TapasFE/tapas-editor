/*
 * @desc Image plugin
 *
 * Settings:
 * - image_in_figure: whether to wrap images in `<figure>` to enable figcaption
 */

import tinymce from '../tinymce';
import {selectFiles, url2blob} from './base';

tinymce.PluginManager.add('t_image', editor => {
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

  function fireUpload(file) {
    const callback = editor.settings.image_in_figure ? insertFigure : insertImage;
    editor.fire('TUploadImage', {
      data: file,
      callback,
    });
  }
  function isTextBlock(node) {
    return editor.schema.getTextBlockElements()[node.nodeName];
  }
  function insertImage(url) {
    editor.insertContent(editor.dom.createHTML('img', {src: url}));
  }
  function insertFigure(url, text) {
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
    }, text));
    const textBlock = dom.getParent(figure.parentNode, isTextBlock);
    if (textBlock) {
      dom.split(textBlock, figure, figure);
    }
  }
});
