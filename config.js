/* Apps Script web app on the Vicio Schedule sheet. Both boards read it. */
window.VICIO_API = 'https://script.google.com/macros/s/AKfycbwnt4jHMTZlybdKiFQf6crJDGCqUCR5mIZas_Atr_q2saX3d0J-oU4ldZs4_n5LBTMSMA/exec';
/* Nov 21 2026 changes (nov21.js): check-all on every list, AM cards, ice machine names, shorter floor, reservations, BOH Open
   mode. Both boards; it waits for the board on its own and does nothing on other pages. */
try { var n21 = document.createElement('script'); n21.src = 'nov21.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(n21); } catch (e) {}
