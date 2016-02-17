/**
 * @desc Autofloat plugin for TinyMCE
 *
 * This plugin floats the toolbar when page scrolls up.
 *
 * Settings:
 * - autofloat_top_offset {Number} default as 0
 *
 */

import tinymce from '../tinymce';

tinymce.PluginManager.add('t_autofloat', editor => {
  editor.on('init', () => {
    const topOffset = editor.settings.autofloat_top_offset || 0;
    const container = editor.getContainer();
    const toolbar = container.querySelector('.mce-toolbar-grp');
    const toolbarBody = toolbar.firstElementChild;
    let floated = false;
    window.addEventListener('scroll', onScroll, false);
    window.addEventListener('resize', onResize, false);
    editor.on('remove', () => {
      window.removeEventListener('scroll', onScroll, false);
      window.removeEventListener('resize', onResize, false);
    });

    function onResize() {
      if (!floated) return;
      const rect = toolbar.getBoundingClientRect();
      editor.$(toolbarBody).css('width', rect.width);
    }
    function onScroll() {
      const rect = toolbar.getBoundingClientRect();
      const prect = container.getBoundingClientRect();
      if (rect.top < topOffset && prect.bottom > topOffset + rect.height) floatToolbar();
      else fixToolbar();
    }
    function floatToolbar() {
      if (floated) return;
      floated = true;
      const rect = toolbarBody.getBoundingClientRect();
      const css = {
        position: 'fixed',
        left: rect.left,
        top: topOffset,
        width: rect.width,
        backgroundColor: '#f0f0f0',
        padding: '2px 0',
        borderBottom: '1px solid rgba(0,0,0,.2)',
        zIndex: 9999,
      };
      editor.$(toolbar).css('height', toolbarBody.offsetHeight);
      editor.$(toolbarBody).css(css);
    }
    function fixToolbar() {
      if (!floated) return;
      floated = false;
      editor.$(toolbarBody).attr('style', '');
      editor.$(toolbar).css('height', '');
    }
  });
});
