// Utilità condivise tra sito (browser) e test/CLI (Node).
// Niente moduli ES: i file sono script classici che si agganciano a globalThis.ADE,
// così il sito funziona anche aprendo index.html da file://.
(function (root) {
  const ADE = (root.ADE = root.ADE || {});

  const pad = (n) => String(n).padStart(2, '0');

  ADE.util = {
    /** Data locale in formato YYYY-MM-DD. */
    todayStr(d) {
      d = d || new Date();
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    },
    /** Somma n giorni a una data YYYY-MM-DD (aritmetica in UTC: niente sorprese con l'ora legale). */
    addDays(str, n) {
      const [y, m, d] = str.split('-').map(Number);
      const t = new Date(Date.UTC(y, m - 1, d + n));
      return t.getUTCFullYear() + '-' + pad(t.getUTCMonth() + 1) + '-' + pad(t.getUTCDate());
    },
    /** Giorni da a a b (positivo se b è dopo a). */
    diffDays(a, b) {
      const p = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
      return Math.round((p(b) - p(a)) / 86400000);
    },
    /** Generatore pseudo-casuale con seme (mulberry32): stesso seme, stesso esercizio. */
    rng(seed) {
      let a = seed >>> 0;
      const next = () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      return {
        next,
        int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
        pick: (arr) => arr[Math.floor(next() * arr.length)],
      };
    },
    hex(n, w) { return n.toString(16).toUpperCase().padStart(w || 2, '0'); },
    bin(n, w) { return n.toString(2).padStart(w, '0'); },
    log2(n) {
      const k = Math.round(Math.log2(n));
      if (n <= 0 || 2 ** k !== n) throw new Error('non è una potenza di 2: ' + n);
      return k;
    },
    /** Scrive una dimensione in byte come 4KB, 16MB... (potenze di 2). */
    size(bytes) {
      const u = ['B', 'KB', 'MB', 'GB', 'TB'];
      let i = 0;
      while (bytes >= 1024 && bytes % 1024 === 0 && i < u.length - 1) { bytes /= 1024; i++; }
      return bytes + u[i];
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
