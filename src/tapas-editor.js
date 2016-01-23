import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import {requireTheme, requireSkin, requireContentStyle, requirePlugins, generateId} from './utils';
import tinymce from './tinymce';

// Import default theme
requireTheme();

// Import default skin
requireSkin();

// Import available plugins
requirePlugins([
  'advlist',
  'anchor',
  'autolink',
  'autoresize',
  'autosave',
  'bbcode',
  'charmap',
  'code',
  'codesample',
  'colorpicker',
  'contextmenu',
  'directionality',
  'emoticons',
  'fullpage',
  'fullscreen',
  'hr',
  'image',
  'imagetools',
  'importcss',
  'insertdatetime',
  'layer',
  'legacyoutput',
  'link',
  'lists',
  'media',
  'nonbreaking',
  'noneditable',
  'pagebreak',
  'paste',
  'preview',
  'print',
  'save',
  'searchreplace',
  'spellchecker',
  'tabfocus',
  'table',
  'template',
  'textcolor',
  'textpattern',
  'visualblocks',
  'visualchars',
  'wordcount',
]);
[
  'd2s',
  'simp-trad',
  'image',
  'autofloat',
  'cursor',
  //'markdown',
].forEach(plugin => require(`./plugins/${plugin}`));

const defaultConfig = {
  // Import default content CSS for the corresponding skin
  content_style: requireContentStyle(),
  // Avoid `skin` to be loaded from URL
  skin: false,
};

class TapasEditor extends Component {
  static displayName = 'TapasEditor';

  static propTypes = {
    id: React.PropTypes.string,
    className: React.PropTypes.string,
    config: React.PropTypes.object,
    content: React.PropTypes.string,
    events: React.PropTypes.object,
  };

  constructor(props) {
    super(props || {
      config: {},
      content: '',
      events: {},
    });
  }

  componentWillMount() {
    this.id = this.id || this.props.id || generateId();
  }

  componentDidMount() {
    this._init(this.props.config, this.props.content);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.config !== nextProps.config) {
      this._init(nextProps.config, nextProps.content);
    } else if (this.props.content != nextProps.content) {
      this._editor && this._editor.setContent(nextProps.content || '');
    }
    if (this.props.id !== nextProps.id) {
      this.id = nextProps.id;
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.content != nextProps.content || this.props.config !== nextProps.config;
  }

  componentWillUnmount() {
    this._remove();
  }

  render() {
    return this.props.config.inline ? (
      <div
        id={this.id}
        className={this.props.className}
        dangerouslySetInnerHTML={{__html: this.props.content}}
      />
    ) : (
      <textarea
        id={this.id}
        className={this.props.className}
      />
    );
  }

  _init(config, content) {
    const _config = Object.assign({}, defaultConfig, config);
    this._isInit && this._remove();

    findDOMNode(this).style.hidden = 'hidden';

    _config.selector = `#${this.id}`;
    _config.setup = (editor) => {
      const events = this.props.events || {};
      for (let type in events) {
        const handler = events[type];
        if (typeof handler === 'function') {
          editor.on(type, (e) => {
            handler(e, editor);
          });
        }
      }
      editor.on('init', () => {
        this._editor = editor;
        content && editor.setContent(content);
      });
      config.setup && config.setup(editor);
    };

    tinymce.init(_config);

    findDOMNode(this).style.hidden = '';

    this._isInit = true;
  }

  _remove() {
    tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.id);
    this._isInit = false;
    this._editor = null;
  }
}

export default TapasEditor;

export {tinymce};
