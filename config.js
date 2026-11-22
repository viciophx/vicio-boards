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
