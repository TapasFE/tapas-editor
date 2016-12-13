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
    editor.fire('TUploadImage', {
      data: file,
      callback: insertImage,
    });
  }
  function insertImage(url) {
    editor.insertContent(editor.dom.createHTML('img', {src: url}));
  }
});
