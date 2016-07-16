import React, {Component} from 'react';
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
    onChange: React.PropTypes.func,
  };

  static defaultProps = {
    config: {},
    content: '',
    events: {},
  };

  constructor(props) {
    super(props);
    console.log(this.props);
    // cache content to avoid repeated update due to differences caused by output rules
    this.content = this.props.content;
  }

  componentWillMount() {
    this.id = this.id || this.props.id || generateId();
  }

  componentDidMount() {
    this.initEditor(this.props.config, this.props.content);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.config !== nextProps.config) {
      this.initEditor(nextProps.config, nextProps.content);
    } else if (this.content !== nextProps.content) {
      this.editor && this.editor.setContent(this.content = nextProps.content || '');
    }
    if (this.props.id !== nextProps.id) {
      this.id = nextProps.id;
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.content != nextProps.content || this.props.config !== nextProps.config;
  }

  componentWillUnmount() {
    this.removeEditor();
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

  initEditor(config, content) {
    this.initialized && this.removeEditor();
    const editorConfig = {
      ... defaultConfig,
      ... config,
      selector: `#${this.id}`,
      setup: (setup => {
        return editor => {
          const events = this.props.events || {};
          for (let type in events) {
            const handler = events[type];
            if (typeof handler === 'function') {
              editor.on(type, e => {
                handler(e, editor);
              });
            }
          }
          editor.on('init', () => {
            this.editor = editor;
            content && editor.setContent(content);
          });
          editor.on('change', () => {
            // Set to `null` to mark a change in content
            this.content = null;
            // If `props.onChange` is provided, update cached content
            this.props.onChange && this.props.onChange(this.content = editor.getContent());
          });
          setup && setup(editor);
        };
      })(config.setup),
    };
    tinymce.init(editorConfig);
    this.initialized = true;
  }

  removeEditor() {
    tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.id);
    this.initialized = false;
    this.editor = null;
  }
}

export default TapasEditor;

export {tinymce};
