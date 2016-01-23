import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import TapasEditor from '../lib/tapas-editor';

const config = {
  statusbar: false,
  resize: false,
  menubar: '',
  toolbar: 'undo redo | bold removeformat link image searchreplace t_image t_d2s t_simp2trad t_trad2simp',
  plugins: 'searchreplace autoresize paste t_d2s t_simp_trad t_image t_autofloat t_cursor',
  content_style:
    '*{line-height:25px;color:#555;font-size:15px;font-family:\'Hiragino Sans GB\',\'Microsoft YaHei\',\'黑体\',Helvetica,Arial,Tahoma,sans-serif;}' +
    'img{max-width:100%;}' +
    'img.size-overflowed{box-sizing:border-box;border:2px solid red;-webkit-filter:opacity(.4);filter:opacity(.4);}' +
    'table{width:100%}',
  extended_valid_elements: 'a[href|href-id|target=_blank|title]',
  convert_urls: false,
  paste_as_text: true,
  paste_data_images: true,
  autoresize_min_height: 500,
  //autofloat_top_offset: 50,
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

class App extends Component {
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

  handleChange(e, editor) {
    this.content = editor.getContent();
    console.log(this.content);
  }

  handleUpload(e, editor) {
    const file = e.data;
    const cb = e.callback;

    // Upload the image and callback with the URL.
    // We will just create an object URL in this demo.
    const url = URL.createObjectURL(file);
    setTimeout(() => URL.revokeObjectURL(url));

    cb(url);
  }

  render() {
    const events = {
      change: ::this.handleChange,
      TUploadImage: this.handleUpload,
    };
    return (
      <TapasEditor
        config={config}
        events={events}
        content={this.state.content}
      />
    );
  }
}

ReactDOM.render(<App />, document.querySelector('#root'));
