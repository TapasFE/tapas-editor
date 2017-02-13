import React from 'react';
import ReactDOM from 'react-dom';
import 'tinymce';
import 'tinymce/themes/modern/theme';
import 'tinymce/skins/lightgray/skin.min.css';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/searchreplace';
import TapasEditor from '../lib';

const config = {
  statusbar: false,
  resize: false,
  menubar: '',
  toolbar: 'undo redo | bold removeformat searchreplace t_image',
  plugins: 'autoresize paste searchreplace t_image t_autofloat t_cursor t_filter',
  content_style: 'img{max-width:100%;}table{width:100%}figure{border:1px solid #ddd;text-align:center}',
  extended_valid_elements: 'a[href|href-id|target=_blank|title]',
  // paste_as_text: true,
  autoresize_min_height: 500,
  // autofloat_top_offset: 50,
  image_in_figure: true,
  setup,
};

function setup(editor) {
  editor.on('NodeChange SelectionChange', e => {
    const range = editor.selection.getRng();
    if (!range.collapsed) return;
    const dom = editor.dom;
    const el = dom.getParent(range.endContainer, 'strong');
    let cursorMoved;
    if (el) {
      if (el === range.endContainer.parentNode) {
        if (!range.endOffset) {
          range.setStartBefore(el);
          range.setEndBefore(el);
          cursorMoved = true;
        } else if (range.endOffset === range.endContainer.length) {
          range.setStartAfter(el);
          range.setEndAfter(el);
          cursorMoved = true;
        }
      }
    }
    cursorMoved && editor.selection.setRng(range);
  });
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: this.content = 'content',
    };
    setTimeout(() => {
      this.setState({
        content: this.content = 'content changed',
      });
    }, 1000);
  }

  handleChange = (content) => {
    console.log('content changed to:', content);
    this.setState({
      content,
    });
  }

  handleUpload(e, editor) {
    const file = e.data;

    // Upload the image and callback with the URL.
    // We will just create an object URL in this demo.
    const url = URL.createObjectURL(file);
    setTimeout(() => URL.revokeObjectURL(url));

    e.callback(url);
  }

  render() {
    const events = {
      TUploadImage: this.handleUpload,
    };
    return (
      <TapasEditor
        config={config}
        events={events}
        content={this.state.content}
        onChange={this.handleChange}
      />
    );
  }
}

ReactDOM.render(<App />, document.querySelector('#root'));
