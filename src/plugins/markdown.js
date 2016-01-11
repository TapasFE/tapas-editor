import './markdown.css';
import marked from 'marked';
import toMarkdown from 'to-markdown';

tinymce.PluginManager.add('t_md', function (editor) {
  // inline mode is not supported
  if (editor.settings.inline) return;

  var state = false;
  var md;
  editor.addButton('t_md', {
    text: 'MD',
    tooltip: 'Markdown',
    onPostRender: function () {
      this.active(state);
    },
    onclick: function () {
      this.active(state = !state);
      state ? initMD() : removeMD();
      editor.execCommand('mceAutoResize');
    },
  });
  editor.on('change', getMarkdown);

  function initMD() {
    if (md) return;
    md = tinymce.ui.Factory.create({
      type: 'panel',
      classes: 'panel-t-md',
      html: '<div><pre></pre><textarea></textarea></div>',
      border: '0 1 0 0',
    });
    var container = editor.getContentAreaContainer();
    var iframe = container.querySelector('iframe');
    md.renderBefore(iframe);
    if (editor.settings.height) md.$el.css('height', editor.settings.height);
    var $textarea = md.$el.find('textarea');
    md.textarea = $textarea[0];
    md.$helper = md.$el.find('pre');
    $textarea.on('keyup change', function (e) {
      setHelperText(e.target.value);
      parseMarkdown();
    });
    getMarkdown();
  }
  function removeMD() {
    if (md) {
      md.remove();
      md = null;
    }
  }
  function getMarkdown() {
    if (md) {
      var text = toMarkdown(editor.getContent(), {gfm: true});
      setHelperText(text);
      md.textarea.value = text;
    }
  }
  function setHelperText(text) {
    // Ensure there is a new line with non-space characters in placeholder
    // so that the scrollbar will not appear when appending text to the textarea.
    md.$helper.text(text + '\n.');
  }
  function parseMarkdown() {
    md && editor.setContent(marked(md.textarea.value, {gfm: true}));
  }
});
