import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import TapasEditor from '../lib/tapas-editor';

const config = {
  statusbar: false,
  resize: false,
  menubar: '',
  toolbar: 'undo redo | bold removeformat link image searchreplace t_d2s t_simp2trad t_trad2simp',
  plugins: 'searchreplace autoresize t_d2s t_simp_trad',
  content_style:
    '*{line-height:25px;color:#555;font-size:15px;font-family:\'Hiragino Sans GB\',\'Microsoft YaHei\',\'黑体\',Helvetica,Arial,Tahoma,sans-serif;}' +
    'img{max-width:100%;}' +
    'img.size-overflowed{box-sizing:border-box;border:2px solid red;-webkit-filter:opacity(.4);filter:opacity(.4);}' +
    'table{width:100%}',
  extended_valid_elements: 'a[href|href-id|target=_blank|title]',
  convert_urls: false,
};

class App extends Component {
  handleChange(e, editor) {
    const content = editor.getContent();
    console.log(content);
  }

  render() {
    const events = {
      change: this.handleChange,
    };
    return (
      <TapasEditor
        config={config}
        events={events}
      />
    );
  }
}

ReactDOM.render(<App />, document.querySelector('#container'));
