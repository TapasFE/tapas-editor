import tinymce from '../tinymce';
import {stringTransformer, traversalTransform} from './_base';

const rules = [
  [
    [65293, 65305], // '－．／', 0-9
    [65312, 65370], // '＠', A-Z, '［＼］＾＿｀', a-z
    '＂＃＄％＆＇＊＋＜＝＞｛｜｝～',
  ], -65248,
];
const transform = stringTransformer(transformChar);

tinymce.PluginManager.add('t_d2s', editor => {
  editor.addButton('t_d2s', {
    text: 'D2S',
    tooltip: '全角转半角',
    onclick: () => {
      traversalTransform(editor, data =>
        transform(data).replace(/[^\u3000]\u3000+/g, match => match.replace(/\u3000/g, ' ')));
    },
  });
});

function transformChar(chr) {
  let code = chr.charCodeAt(0);
  for (let i = 1; i < rules.length; i += 2) {
    const conditions = rules[i - 1];
    if (conditions.find(cond =>
      typeof cond === 'string'
        ? ~ cond.indexOf(chr)
        : code >= cond[0] && code <= cond[1]
    )) {
      code += rules[i];
      break;
    }
  }
  return String.fromCharCode(code);
}
