/**
 * @desc Select files and callback.
 * @param {Object} options
 *     - options.accept {String}
 *     - options.multiple {Boolean}
 * @param {Function(File|Array[File])} callback
 */
export function selectFiles(options, cb) {
  options = options || {};
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  if (options.accept) input.setAttribute('accept', options.accept);
  if (options.multiple) input.multiple = true;
  input.onchange = function () {
    if (this.files && this.files.length) {
      cb(options.multiple ? this.files : this.files[0]);
    }
  };

  // IE fix: `input[file]` MUST be attached to DOM
  input.setAttribute('style', 'display:none');
  document.body.appendChild(input);

  input.click();
  document.body.removeChild(input);
};

/**
 * @desc Transform a DataURL or object URL to Blob.
 * @param {String} url
 * @return {Blob}
 */
export function url2blob(url) {
  return new Promise((resolve, reject) => {
    if (/^data:/.test(url)) {
      const parts = url.split(',');
      const byteString = atob(parts[1]);
      const mimeType = parts[0].split(':')[1].split(';')[0];
      const buf = [];
      for (let i = byteString.length; i --;) {
        buf[i] = byteString.charCodeAt(i);
      }
      return resolve(new Blob([new Uint8Array(buf)], {type: mimeType}));
    }
    if (/^blob:/.test(url)) {
      const xhr = new XMLHttpRequest;
      xhr.responseType = 'blob';
      xhr.open('GET', url, true);
      xhr.onloadend = function () {
        if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
        else reject(url);
      };
      xhr.send();
      return;
    }
    reject(url);
  });
};
