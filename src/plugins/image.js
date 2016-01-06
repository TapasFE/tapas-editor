import tinymce from '../tinymce';
import {selectFiles, dataURL2Blob} from './_base';

tinymce.PluginManager.add('t_image', editor => {
  editor.addButton('t_image', {
    icon: 'image',
    tooltip: '插入图片',
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
      const file = dataURL2Blob(matches[1]);
      fireUpload(file);
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
