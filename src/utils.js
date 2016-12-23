export function debounce(func, time) {
  function run(thisObj) {
    clearTimeout(timer);
    timer = null;
    func.call(thisObj);
  }
  let timer;
  return function () {
    timer && clearTimeout(timer);
    timer = setTimeout(run, time, this);
  };
}
