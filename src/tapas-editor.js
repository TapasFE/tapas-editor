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
    const config = Object.assign({}, defaultConfig, this.props.config);
    this._init(config);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.config !== nextProps.config) {
      this._init(nextProps.config, nextProps.content);
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
    this._isInit && this._remove();

    findDOMNode(this).style.hidden = 'hidden';

    config.selector = `#${this.id}`;
    config.setup = (editor) => {
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
        this.props.content && editor.setContent(this.props.content);
      });
    };

    tinymce.init(config);

    findDOMNode(this).style.hidden = '';

    this._isInit = true;
  }

  _remove() {
    tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.id);
    this._isInit = false;
  }
}

export default TapasEditor;
