import tinymce from '../tinymce';
import {stringTransformer, traversalTransform} from './_base';
import characters from './characters.txt';

const charTransformer = function () {
  const _char = characters.replace(/\s+/, '');
  const offset = _char.length >> 1;
  const simplified = _char.slice(0, offset);
  const traditional = _char.slice(offset);
  // All the characters have char codes larger than magicChar
  const magicChar = String.fromCharCode(15000);
  return {
    simp2trad: transformer(simplified, traditional),
    trad2simp: transformer(traditional, simplified),
  };

  function transformer(src, dest) {
    return stringTransformer(chr => {
      if (chr < magicChar) return chr;
      const i = src.indexOf(chr);
      return ~i ? dest[i] : chr;
    });
  }
}();

tinymce.PluginManager.add('t_simp_trad', editor => {
  editor.addButton('t_simp2trad', {
    text: '繁体',
    tooltip: '简体转繁体',
    onclick: () => {
      traversalTransform(editor, charTransformer.simp2trad);
    },
  });
  editor.addButton('t_trad2simp', {
    text: '简体',
    tooltip: '繁体转简体',
    onclick: () => {
      traversalTransform(editor, charTransformer.trad2simp);
    },
  });
});
