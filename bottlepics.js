/* Vicio FOH: a product photo of each bottle beside the tap-the-level bottle on the bar count (Eric, Nov 22 2026). Loaded by
   config.js; FOH only. Eric wanted the brands' own product shots, not his shelf photos. The board doesn't copy them: each
   one loads straight from where it's published (the brand's site where it had a clean shot, otherwise a liquor store's
   listing of the same bottle). If a picture ever stops loading, its spot is simply left empty. Tapping a photo opens the
   bottle's profile, and the photo shows at the top of the profile too. Wine, beer and the house batches have no photo.
   Soda BIBs & CO2 (Eric): each bag-in-box line shows its brand's logo next to the name, loaded by link the same way. Logos
   are in for Coke, Sprite, Coke Zero, Dr Pepper, Lemonade (Minute Maid), Cranberry (Ocean Spray) and Tonic (Schweppes);
   the energy drink waits for Eric to say which brand it is. Colette's Board can't load outside pictures, so it carries
   small copies of the logos itself (window.__VICIO_LOGOS), which this file uses when they are there. It carries the bottle
   and beer photos the same way (window.__VICIO_PICS, window.__VICIO_BEER), from the files Eric downloaded.
   Beer cooler (Eric): each beer line shows a photo of the bottle or can, loaded by link the same way. Sonora Negra and
   Sonora Clara have none yet (no clean photo found). */
(function () {
  if (window.__vicioBottlePics || window.VICIO_BOARD !== 'foh') return;
  window.__vicioBottlePics = true;
  var PICS = {
    '1800_blanco': 'images.tcdn.com.br/img/img_prod/774261/tequila_1800_blanco_750ml_774_1_5e4b31054e6514350a610fd996db002e.jpg',
    agavales_spicy_tamarindo: 'cdn.hy-vee.com/products/00810095915505/CF/416271be-acd8-4bca-b0ee-2b7ec93fcfd1_large.jpg',
    amara_s: 'www.vinasa.mx/wp-content/uploads/2023/12/Mezcal-Joven-Amaras-Espadin-Blanco-750ml.png',
    aperol: 'www.aperol.com/app/uploads/2023/04/aperol-tasting-notes-product.jpg',
    bacardi: 'd323g1xugy1rkz.cloudfront.net/wp-content/uploads/sites/25/2020/10/21134822/Products-Bottle-Superior-min-1.png',
    belvedere: 'cashandcarryalcohol.s3.amazonaws.com/webp-product-images/22.webp',
    bulleit_95_rye: 'cdn.shopify.com/s/files/1/0020/3164/8827/products/BulleitRye750ml.png',
    bulleit_bourbon: 'qualityliquorstore.com/cdn/shop/files/bulleit-bourbon-1-75-liter-84263-_1.jpg',
    camazotz_oaxacan_rum: 'sf.flatiron-wines.com/cdn/shop/products/Bottle-of-Camazotz-Oaxacan-Rum-Spirits-Flatiron-SF.jpg',
    campari: 'aem.lcbo.com/content/dam/lcbo/products/2/7/7/9/277954.jpg.thumb.1280.1280.jpg',
    captain_morgan: 'cdn.shopify.com/s/files/1/0050/2395/7103/products/CaptainMorganSpiced_1400x.jpg',
    casamigos_reposado: 'images.ctfassets.net/hpoa7h16o9wc/5mMHSwJ5VtvDYh5aJJSPEE/bb8d20d097993903c2b2e5c69026a0f2/ReposadoMobile.jpg',
    crown_royal: 'sklep-domwhisky.pl/hpeciai/ac2fa4fa9081bfe61a1ea583fd46e0d5/eng_pl_Crown-Royal-Fine-De-Luxe-40-1-0l-32612_1.jpg',
    de_kuyper_blue_curac_ao: 'bottle-stop.com.au/cdn/shop/files/buy-dekuyper-blue-curacao-liqueur-500ml-online-spirits-dekuyper-store-alcohol-delivery-bottleshop_near_me-liquor_marketplace-bottle_stop-formerly_boozebud.webp',
    de_kuyper_peachtree: 'creekvillespirits.com/cdn/shop/products/Bottle_Template_8_1bb039c2-908a-4ffd-b3c4-220dab3a398c_530x@2x.png',
    de_kuyper_watermelon: 'theliquorbarn.com/cdn/shop/files/Dekuyper-Watermelon-Pucker-750ML__89738.jpg',
    evan_williams: 'caravanwinesandspirits.com.au/cdn/shop/products/evan-williams-black-label-bourbon-3205555.jpg',
    fireball: 'topshelfwineandspirits.com/cdn/shop/products/ScreenShot2021-10-07at11.08.21AM.jpg',
    g4_blanco: 'sf.flatiron-wines.com/cdn/shop/files/Bottle-of-G4-Tequila-Blanco-High-Proof-108-Spirits-Flatiron-SF.jpg',
    g4_reposado: 'sf.flatiron-wines.com/cdn/shop/products/Bottle-of-G4-Tequila-Reposado-Spirits-Flatiron-SF.png',
    hennessy: 'www.totalwine.com/dynamic/x1000,sq/images/581750/581750-1-fr.png',
    hibiki: 'i5.walmartimages.com/seo/Hibiki-Suntory-Whisky-Japanese-Harmony-750-ml-Bottle-ABV-43-0_f0480b8f-8fba-498c-b4e8-9196ff85c758.a2bdc8970658c2c2b056a0faba8fc620.jpeg',
    jack_daniel_s: 'media.danmurphys.com.au/dmo/product/27390-1.png',
    jameson: 'winesellersdirect.com.au/cdn/shop/files/jameson-irish-whiskey-1000ml.png',
    johnnie_walker_black: 'img.thewhiskyexchange.com/900/blend_joh107.jpg',
    johnnie_walker_red: 'liberationqualitydrinks.gg/cdn/shop/products/johnniewalkerredlabel_1024x.jpg',
    jose_cuervo_gold: 'bottlebarn.com/cdn/shop/products/JoseCuervoEspecialGoldTequila750ml.png',
    jose_cuervo_silver: 'bottlebarn.com/cdn/shop/products/JoseCuervoEspecialSilverTequila750ml_800x.png',
    la_vieja_taberna: 'www.winetodeliver.com/cdn/shop/products/veija.jpg',
    lost_lore_blanco: 'elcerritoliquor.com/cdn/shop/files/8D001846-74F2-42A0-9C05-F9B44B3094CA.png',
    maker_s_mark: 'zyn.ca/cdn/shop/files/Maker_s-Mark---1.14-Litre_5000x.jpg',
    malibu: 'media.nicks.com.au/products/0916e309/malibu-coconut-and-rum-liqueur-1000ml.jpg',
    nikka: 'www.bayfields.com.au/wp-content/uploads/Nikka-Whisky-From-The-Barrel-500ml-Bayfields-Liquor-Superstore-500x1000.png',
    nolet_s_silver: 'bottlebarn.com/cdn/shop/files/Nolet_sDryGin750ml.png',
    potter_s_triple_sec: 'www.leungyick.com/shop2/image/cache/catalog/th/LIQ01060599-550x550.jpg',
    rayu_joven: 'cellar.com/cdn/shop/products/178755.jpg',
    real_del_valle_blanco: 'cdn11.bigcommerce.com/s-u9ww3di/products/10023/images/14459/valle_blanco___14085.1607808083.600.600.png',
    riablo_sotol_spiced_pineapple: 'cityhive-production-cdn.cityhive.net/product_details/66269b8f9555c43b4f66c9e5/primary_image/large.png',
    sotol_la_higuera: 'www.ixtete.com/cdn/shop/files/SOTOLLAHIGUERADASYLIRIONWHEELERI.png',
    suerte_reposado: 'elcerritoliquor.com/cdn/shop/files/Suerte_Reposado_Tequila_750ml.webp',
    tanqueray: 'images-svetnapojov-cdn.rshop.sk/default/products/217034fffe79816dd1af86ac0a44d4db.png',
    tequila_ocho_plata: 'unwindbottleshop.com/cdn/shop/files/TequilaOchoPlata750ml.png',
    terralta_blanco: 'sf.flatiron-wines.com/cdn/shop/files/Bottle-of-Terralta-Tequila-Blanco-Spirits-Flatiron-SF.jpg',
    the_botanist_gin: 'liquorshed.com.au/cdn/shop/products/The_Botanist_Islay_Dry_Gin_700ml_10600170_1_2048x.jpg',
    tito_s: 'thebarrel.au/cdn/shop/files/Tito_sHandmadeVodka.png',
    uruapan_charanda_blanco: 'cdn11.bigcommerce.com/s-k0y7xl9dpv/images/stencil/1280x1280/products/104731/63464/128430_copy__05837.1762192603.jpg',
    vera_s: 'images.squarespace-cdn.com/content/v1/584a07e6e6f2e113671a2b1a/1579717287415-VJ8KTNSIDPKF591VJ3UB/VERAS_JOVEN_2020_TRANSPARENT.png',
    wild_turkey_101_rye: 'cdn11.bigcommerce.com/s-taixn69rog/images/stencil/original/products/26549/809725/121922__62954.1637648950.jpg'
  };
  Object.keys(PICS).forEach(function (k) { PICS[k] = 'https://' + PICS[k]; });
  function img(cls, id) { return '<img class="' + cls + '" src="' + ((window.__VICIO_PICS || {})[id] || PICS[id]) + '" alt="" referrerpolicy="no-referrer" loading="lazy" onerror="this.style.visibility=\'hidden\'"' + (cls === 'x-bpic' ? ' data-binfo="' + id + '" title="About this bottle"' : '') + '>'; }
  var LOGOS = {
    a_bibcoke: 'upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/250px-Coca-Cola_logo.svg.png',
    a_bibsprite: 'upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Sprite_2022.svg/250px-Sprite_2022.svg.png',
    a_bibzero: 'upload.wikimedia.org/wikipedia/commons/thumb/5/54/Coca-Cola_Zero_Sugar_Logo_%282%29.png/250px-Coca-Cola_Zero_Sugar_Logo_%282%29.png',
    a_bibdrp: 'assets.stickpng.com/images/61fa8a9ceec4c40004bacd42.png',
    a_biblem: 'upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Minute_Maid_2023.svg/250px-Minute_Maid_2023.svg.png',
    a_bibcran: 'upload.wikimedia.org/wikipedia/commons/thumb/6/60/Ocean_Spray_logo.svg/250px-Ocean_Spray_logo.svg.png',
    a_bibtonic: 'upload.wikimedia.org/wikipedia/commons/thumb/0/09/Schweppes_Logo_2016.png/250px-Schweppes_Logo_2016.png'
  };
  var BEER = {
    b_estrella: 'static.wixstatic.com/media/635b4b_904e483857a541069cb3e86abe5337fa~mv2.png/v1/crop/x_747,y_0,w_2506,h_4000/fill/w_614,h_980,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/144b9ef9b5c90d36fd1d7d3327b16276c72df602.png',
    b_michelob: 'www.africanandeastern.com/image/cache/catalog/MICHELOB%20ULTRA-800x1065.jpg',
    b_dosequis: 'www.instacart.com/image-server/1864x1864/www.instacart.com/assets/domains/product-image/file/large_57a0b5ac-5b2e-443d-81e7-d6d6c3a86672.jpg',
    b_corona: 'media.danmurphys.com.au/dmo/product/357480-1.png',
    b_cartablanca: 'dsom-imager-prod.shipt.com/db860509-6b56-d954-c60d-88719c07602d/db309d9cf29808717c80016a82d81375.jpeg',
    b_modelo: 'cdn.shopify.com/s/files/1/0605/9520/8383/files/modelo-especial_0_0_0_0.png',
    b_churchmusic: 'flagstaffliquor.com/cdn/shop/files/ChurchMusic.png',
    b_millerhl: 'www.lcbo.com/content/dam/lcbo/products/588921.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
    b_pacifico: 'm.media-amazon.com/images/I/71jIBEhz3UL._AC_SL1500_.jpg',
    b_tecate: 'i0.wp.com/beverages2u.com/wp-content/uploads/2022/07/tecate-original-beer-can.png',
    b_tecatelight: 'www.kroger.com/product/images/xlarge/front/0008982690124',
    b_victoria: 'images.heb.com/is/image/HEBGrocery/001453289-1'
  };
  function beers() {
    var sec = document.querySelector('[data-fold="sec_inv_beer"]'); if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll('input[data-inv]'), function (el) {
      var id = el.dataset.inv, row = el.closest('tr'); if (!BEER[id] || !row || row.querySelector('.x-beerpic')) return;
      var cell = row.cells[0]; if (!cell) return;
      cell.insertAdjacentHTML('afterbegin', '<img class="x-beerpic" src="' + ((window.__VICIO_BEER || {})[id] || 'https://' + BEER[id]) + '" alt="" referrerpolicy="no-referrer" loading="lazy" onerror="this.remove()">');
    });
  }
  function logos() {
    var sec = document.querySelector('[data-fold="sec_inv_bib"]'); if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll('[data-lvid],input[data-inv]'), function (el) {
      var id = el.dataset.lvid || el.dataset.inv, row = el.closest('tr'); if (!LOGOS[id] || !row || row.querySelector('.x-blogo')) return;
      var cell = row.cells[0]; if (!cell) return;
      var src = (window.__VICIO_LOGOS || {})[id] || 'https://' + LOGOS[id];
      cell.insertAdjacentHTML('afterbegin', '<img class="x-blogo" src="' + src + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">');
    });
  }
  function pics() {
    var sec = document.querySelector('[data-fold="sec_bar"]'); if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll('.x-tcb[data-tcid]'), function (b) {
      var id = b.dataset.tcid, wrap = b.parentNode; if (!PICS[id] || !wrap || wrap.querySelector('.x-bpic')) return;
      b.insertAdjacentHTML('beforebegin', img('x-bpic', id));
    });
  }
  document.addEventListener('click', function (e) {
    var n = e.target.closest && e.target.closest('[data-binfo]'); if (!n) return;
    var id = n.dataset.binfo; if (!PICS[id]) return;
    setTimeout(function () {
      var h = document.querySelector('#x-bpop h3'); if (!h || h.parentNode.querySelector('.x-bp-pic')) return;
      if (n.tagName === 'IMG') { var nm = document.querySelector('[data-binfo="' + id + '"].x-bname'); if (nm) h.textContent = nm.textContent.trim(); }
      h.insertAdjacentHTML('beforebegin', img('x-bp-pic', id));
    }, 0);
  }, true);
  var st = document.createElement('style');
  st.textContent = '.x-bpic{height:112px;width:76px;object-fit:contain;border-radius:8px;cursor:pointer;flex:none;background:#fff;padding:3px;box-sizing:border-box}' +
    '.x-beerpic{float:left;height:64px;width:40px;object-fit:contain;background:#fff;border-radius:6px;padding:2px;margin:0 10px 0 0}' +
    '.x-blogo{display:block;height:30px;width:auto;max-width:110px;object-fit:contain;background:#fff;border-radius:6px;padding:3px 6px;margin:0 0 6px}' +
    '.x-bp-pic{float:right;height:150px;width:110px;object-fit:contain;margin:28px 0 8px 12px;border-radius:10px;background:#fff;padding:4px;box-sizing:border-box}';
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); setTimeout(function () { try { pics(); } catch (e) {} try { logos(); } catch (e) {} try { beers(); } catch (e) {} }, 0); return out; };
    setTimeout(function () { try { pics(); } catch (e) {} try { logos(); } catch (e) {} try { beers(); } catch (e) {} }, 0);
  })();
})();
