export function requireTheme(name='modern') {
  require(`tinymce/themes/${name}/theme`);
};

export function requireSkin(name='lightgray') {
  require(`tinymce/skins/${name}/skin.min.css`);
  require(`tinymce/skins/${name}/content.min.css`);
};

export function requirePlugins(names) {
  if (typeof names === 'string') names = [names];
  names.forEach(function (name) {
    require(`tinymce/plugins/${name}/plugin`);
  });
};
