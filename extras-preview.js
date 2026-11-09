/* PREVIEW add-on. Loaded only when a board link ends in ?preview (see sheetdb.js). Nothing is under review right now,
   so the preview simply runs the live extras.js. Changes under review get layered on below this line. */
(function () {
  var s = document.createElement('script'); s.src = 'extras.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(s);
})();
