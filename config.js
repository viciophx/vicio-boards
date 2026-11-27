/* Apps Script web app on the Vicio Schedule sheet. Both boards read it. */
window.VICIO_API = 'https://script.google.com/macros/s/AKfycbwnt4jHMTZlybdKiFQf6crJDGCqUCR5mIZas_Atr_q2saX3d0J-oU4ldZs4_n5LBTMSMA/exec';
/* Nov 21 2026 changes (nov21.js): check-all on every list, AM cards, ice machine names, shorter floor, reservations, BOH Open
   mode. Both boards; it waits for the board on its own and does nothing on other pages. */
try { var n21 = document.createElement('script'); n21.src = 'nov21.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(n21); } catch (e) {}
/* Expo "What runs with what" as icons (runicons.js, Nov 21 2026). FOH only; it waits for the board on its own. */
try { var ri = document.createElement('script'); ri.src = 'runicons.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(ri); } catch (e) {}
/* More Nov 21 changes (nov21c.js): Inside map shorter again, B6 and the DJ by the bar, the three to-go boxes on the attic count. */
try { var n21c = document.createElement('script'); n21c.src = 'nov21c.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(n21c); } catch (e) {}
/* The new bar count (barcount.js, Nov 21 2026): top shelf, shelf 2 and the speed rail, in shelf order. FOH only. */
try { var bc = document.createElement('script'); bc.src = 'barcount.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(bc); } catch (e) {}
/* Kitchen pars locked on the iPads (parlock.js, Nov 21 2026): only Colette's Board can change them. Kitchen only. */
try { var pl = document.createElement('script'); pl.src = 'parlock.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(pl); } catch (e) {}
/* Tap a bottle's name on the bar count for its profile (bottleinfo.js, Nov 22 2026). FOH only. */
try { var bi = document.createElement('script'); bi.src = 'bottleinfo.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(bi); } catch (e) {}
/* Bottle photos on the bar count (bottlepics.js, Nov 22 2026). FOH only. */
try { var bp = document.createElement('script'); bp.src = 'bottlepics.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(bp); } catch (e) {}
/* Attic count by case and by piece, cleaning set apart (atticcount.js, Nov 22 2026). FOH only. */
try { var ac = document.createElement('script'); ac.src = 'atticcount.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(ac); } catch (e) {}
/* Soda BIBs: next order day, order list, CO2, expiration dates (bib.js, Nov 22 2026). FOH only. */
try { var bb = document.createElement('script'); bb.src = 'bib.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(bb); } catch (e) {}
/* Kitchen Inventory in two tabs, Prepped (with photos) and Whole product (bohinv.js, Nov 22 2026). Kitchen only. */
try { var bh = document.createElement('script'); bh.src = 'bohinv.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(bh); } catch (e) {}
/* Bar and N/A orders in whole bottles, batches left off (orderwhole.js, Nov 22 2026). FOH only. */
try { var ow = document.createElement('script'); ow.src = 'orderwhole.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(ow); } catch (e) {}
/* Count the bar by voice (voicecount.js, Nov 22 2026). FOH only. */
try { var vc = document.createElement('script'); vc.src = 'voicecount.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(vc); } catch (e) {}
/* Submit and lock the bar count, email the order, phone layout (barsubmit.js, Nov 23 2026). FOH only. */
try { var bs = document.createElement('script'); bs.src = 'barsubmit.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(bs); } catch (e) {}
/* Spanish for the Nov 21 to 23 additions (es23.js, Nov 23 2026). Both boards; loaded last. */
try { var e23 = document.createElement('script'); e23.src = 'es23.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(e23); } catch (e) {}
/* The night on the clock: sign-in gate, due times, solo list, closing handoff (nightflow.js, Nov 23 2026). FOH only. */
try { var nf = document.createElement('script'); nf.src = 'nightflow.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(nf); } catch (e) {}
/* Calmer navigation: big buttons by job, a quiet header, a food-only Menu page with search (nav23.js, Nov 23 2026). Both boards. */
try { var nv = document.createElement('script'); nv.src = 'nav23.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(nv); } catch (e) {}
/* Navigation, round two: land on your list, what's next, bottom bar on phones, one row, dots, search, logo home (navplus.js, Nov 24 2026). Both boards. */
try { var np = document.createElement('script'); np.src = 'navplus.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(np); } catch (e) {}
/* Food menu as printed Nov 27 2026 (menu27.js). FOH only. */
try { var m27 = document.createElement('script'); m27.src = 'menu27.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(m27); } catch (e) {}
