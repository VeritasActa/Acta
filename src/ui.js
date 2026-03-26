/**
 * Acta Web UI
 *
 * Server-rendered HTML. Read-first interface with:
 * - Topic list (home)
 * - Topic feed with typed contributions and computed states
 * - Entry detail page with linked responses (graph display)
 * - Response forms (evidence, challenge, update, resolution)
 * - Charter page
 * - Moderation transparency log
 */

// ── CSS ─────────────────────────────────────────────────────────────

const EMPIRIC_ROMAN_B64 = 'AAEAAAAKAIAAAwAgT1MvMvcs/uoAAACsAAAATmNtYXAC/wPSAAAA/AAAAYpnbHlmZC21pQAAAogAABGMaGVhZGbPSM8AABQUAAAANmhoZWENLAaUAAAUTAAAACRobXR4xjrAAQAAFHAAAACUbG9jYUjbTVIAABUEAAAATG1heHAAKQBIAAAVUAAAACBuYW1lzv3rlQAAFXAAAANXcG9zdAADAAAAABjIAAAAJAAABVsBkAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABzZnQAAEAACwB6gAB//wAABWsBkQAAAAAAAgABAAAAAAAUAAMAAQAAARoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAcAAAAA4ACAACAAYACwBBAFoAZQBsAHr//wAAAAsAQQBCAGEAZgBt//8ABgAA/8IAAP+iAAAAAQAAAAwAAAAKAAAAEAAAAAIAHQAEAAUABgAeAB8AIAARABIAEwAhACIAFgAXABgAIwAaACQAHAAAAAEAHAAABbgFawAaAAAzNT4BNwEzAR4BFxUhNT4BNTQnCQEGFRQWFxUcTVItAdklAfgzSl391183Lv6n/sAtOFUlDExsBIL7eHZFAyUlCDAmL2oDG/zvbTMqMQYlCQADACIAAATmBUwAHgArADgAAAEWFxYVFA4BIyE1MzI3NjURNCcmKwE1ITIXHgEVFAYlHgEzMj4BNTQmIyIHERYzMjY1NC4BIyIGBwOyjUZhgN/l/YAzVSUXHSdNMwJKpGOWnnz9eyVfOZKTTsK6ZFB0cbW+VsKPPlgbArQeQlyFZblVJTYjcgNsfiEsJRgkt3dmoQ8HBz+CTXeoFvtvG6N4T5JUBAUAAQBK/+EFDwVrACQAAAETIy4BIyIGAhUUEhYzMjY3FwYEIyAnJjU0EiQzMhcWMzI3NjcE0R8fPuahh9p9du2YhMp5H2b+8Lv+r7mKtgE/vZOPKhIbFBoLBWv+M8+2if7U37j+8pBxqBS1qPq6/MsBVLtIFhMbMAAAAgAjAAAFeQVMABYAIQAAMzUzMjc2NRE0JyYrATUhIAQSFRAHBiEnFjMyABEQACMiByMzViQWHCdNMwIoATABPcGswf51279W6AEy/s7wWnMlNyFzA2x/ICwliv6+0/7lvtRiHAFGARcBGQFEHQABACoAAAS0BUwAJQAAARkBFB4BOwEyNjc2NzMDITUzMjc+ATURNCcmKwE1IRMjLgEnJiMBrBAoOOZzaDA+QSh1++swMCsgFxokVDAEFQ8nFTMyKGUFAv3o/fhaJxcgLz59/qwlFxBAYwNxgR4oJf7Xa1AVD4EAAQAhAAAEHwVMAC0AAAERMzI2NzMRIy4CKwERFBcWFxY7ARUhNTMyNzY1ETQnJicmKwE1IRMjLgIjAaP3VU8NJSUBJ0VE9w0KICwwMf26MFQmGA0KHysxMAPxDSMaRWVqBQL960tv/jVPSiX+VmchGRIYJSUxIHoDbGchGRIYJf7WX1koKAABAEj/4QWqBWsANAAAARMjJicmIyAHBhUUEhYzMjY3ETQuASM1IRUjIgcGFREOASMgJyY1NDc2NzYzMhYXFjMyNjcE6SMjNVR5vv79h3GW84BLjEEfQVICDRlOHRRz4In+d8yZVmaylctKeW84ExMbAwVr/lSgUXXNre/C/sCVJiUBiGY/ISYmNCVt/mE+Ovy997Okw2lXGCkVIzMBAAEAIwAABZ0FTABFAAABIRE0JyYnJisBNSEVIyIHDgEVERQXFhcWOwEVITUzMjc2NREhERQXFhcWOwEVITUzMjc2NRE0JyYnJisBNSEVIyIHDgEVAaUCdg0KICswMAJEMDArIBcNCh8sMDD9vDBTJhn9ig0KICswMf27MFQmGA0KHywwMAJFMTArHxgC1wGEaCEZEhglJRcQQWT8lWchGRIYJSUxIHoBnf5jZyEZEhglJTEgegNraCEZEhglJRcQQWQAAQAzAAACeAVMAB8AACUVITUzMjc2NRE0JyYnJisBNSEVIyIHBhURFBcWFxYzAnj9uzBUJhgNCh8sMDACRTFTJhkNCiArMCUlJTEgegNsZyEZEhglJTEgevyUZyEZEhgAAQAq/+EDEQVMACMAABM1IRUjIgcGFREUDgEjIiY1NDc2MzIWFxYzMjY1ETQnJicmI8wCRTFTJhhDpHRebBkhLCAzJxckGy8NCiArMAUnJSUxIHr9aZm+jV08MRkfKls2QlQDnmchGRIYAAEAIgAABdgFTABDAAAJAR4BFxUhNTI2NTQmJwERFBcWFxY7ARUhNTMyNzY1ETQnJicmKwE1IRUjIgcOARURNjcANzY1NCYrATUhFQ4CBwYHAmQB9HuuV/17OjMTNf4sDQogKzAu/b4wVCYYDQofLDAwAkIuLywfGBR1ASk+GyoyHwHyLEhoTBa1AvD+D3tZBiUlJxgYJjQBz/5LZyEZEhglJTEgegNsZyIYEhglJRcQQGT+YRNsARBbKB4XIyUlARY/RhS5AAEAKQAABLcFTAAgAAABFwMhNTMyNzY1ETQnJisBNSEVJg4BFREUFx4BOwEyPgEEliF0++YzViUVHCdNMwJmbFcgEAwyg2OcfmgBdwf+kCU4IHQDa38gLCUlASpAefysUx8VFC51AAEAOQAAB9kFTAA9AAABNSEVFhceARURFAYHFSE1LgE1ETQ+ATMhMhYVERQGBxUhNS4BNRE0NjMhMh4BFREUBgcVITUuAjURND4BB9n4YAUgTT1BbgIIYjcPIz8BCGQkNmQB82M2InABDTciCTdjAgZKSxcSPAUnJSUBAwZAifyjg0kGJSUKS30DXWc3ECCO/KN6TgolJQpNewNdhCoTJnX8o3xMCiUlAihJXwNdaTovAAABACUAAAWiBUwAHwAAASERFBYXFSE1PgE1ETQmJzUhFQ4BFREUFhcVITU+ATUEHv2LRX/9uH5GRn4FfX5GRn79uX1GBQL79YZIBCUlBEiGA16GSAQlJQRIhvyihkgEJSUER4cAAgBI/+EFeAVrAAwAGwAAASAAERAAISAAERA3NhciBwYREBcWMzISERAnJgLtAQgBg/56/uv+6P6D3L/3tm6Jjm2zv/mJbgVr/m/+1P7L/mgBjgE8AUPMsUmHqP68/rSziAEqAUEBXKuIAAIAIgAABCsFTAAfACwAAAERFBcWOwEVITUzMjc2NRE0JyYrATUhMh4BFRQGIyImJx4BMzI2NTQuASMiBwGkHCZNNP27M1YlFBsnTTMB8bbSkNvIMXJBNVIdaJdIhFQzUAJ7/nWAHywlJTgfdANsgB8sJUuyeqbQDkcKCqGAWJdLEwACAEj+bwV5BWsAFQAmAAAFHgEXFSYsAScmJyYCNRAAISAAERQAASIHBhEQFxYzMjc2ETQnLgEDhmbtl4r+xv7nZpBUeocBigEYAQoBhf7r/nq2b4yObrW8c4dKOb0PsKYMIAVls2U6QWEBG8EBMAGS/m3+zfn+iATqgqP+sP63somJogE886aAeQABACUAAARqBUwAFgAAARMjLgIjIREUFhcVITU+ATURNCYnNQRlBScESmtl/oRFff26fkZGfgVM/sNgdB/79YZIBCUlBEiGA16GSAQlEwABABoAAASqBUwAEQAAEwEhIiYnBxMhNQEhMh4BFzMDKgN7/dSAiTUhQARQ/JoBsmxhMxUmHAVM+wZwqwb+mSUE1i9ZegFTBAABAD4AAASwBUwAHwAAARMjJicuASsBERQXFjsBFSE1MzI3NjURIyIHDgEHIxMEoQ8mCxMfZ1S/GyZPL/3BMFYkFqNfKDRKByYQBUz+wlQkOjf79H0fKiUlNCByBAwOE2xcAT4AAQAS/+EFrgVMAB8AAAEVBgcGBwEjASYnLgEnNSEVDgEVFBcJATY1NCYnJic1Ba5IJTUp/icl/gQnEBlJPgIqXjguAVkBQC86RQUMBUwlDSExZft+BJFaFB8jBSUlCS4kMmr85QMRdC0dNQsBAiUAAAEAEv/hBa4FTAAfAAABFQYHBgcBIwEmJy4BJzUhFQ4BFRQXCQE2NTQmJyYnNQWuSCU1Kf4nJf4EJxAZST4CKl44LgFZAUAvOkUFDAVMJQ0hMWX7fgSRWhQfIwUlJQkuJDJq/OUDEXQtHTULAQIlBwABADkAAAfZBUwAPQAAJRUhNTY3PgE1ETQmJzUhFQ4BFREUHgEzITI2NRE0Jic1IRUOARURFBYzITI+ATURNCYnNSEVDgIVERQeAQfZ+GAFIE09QW4CCGI3DyM/AQhkJDZkAfNjNiJwAQ03Igk3YwIGSksXEjwlJSUBAwZAiQNdg0kGJSUKS338o2c3ECCO/KN6TgolJQpNe/yjhCoTJnUDXXxMCiUlAihJX/yjaTovAAEADwAABa8FTAA/AAAJAR4BFxUhNTY3PgE1NCcmJwMBDgEVFBYXFSE1Njc+ATcJAS4BJzUhFQ4BFRQXGwE+ATU0Jy4BJzUhFQYHDgEHA0QBI3l1Wv26OhwVGwkHMOb+5C0SNkz+HzMlPnBIAUD+9W2YYwJzUDsw0PEqEwwPLkgB4TkkNlpSAu/+TrRfBSUlAQsJJRMXFxFHAVz+lDonFSAqAyUlBRAaWFsBlAGHn2MDJSUDLhwlR/7JATE2KBUVEBURASUlAw8XTmkDAAEAGAAABdAFXAAsAAABMj4BNz4BMxUOARUUDgEHERQeATMVITU+AjURLgI1NCYnNR4CFx4CMwNUiI0vBweLnzkpUfTVG1db/aZZVx3X7lUmPGV8SwUHLZCHApBchJqrpyYEUYPA0YIF/sN1RSolJQElR3cBPQWAz8V+UwYmAjyYfJmEXUcAAQAaAAAEqgVMABEAAAkBITI2NxcDITUBISIOAQcjEwSa/IUCLICJNSFA+7ADZv5ObGEzFSYcBUz7BnCrBv6ZJQTWL1l6AVMAAgAQAAAFsAVrABwAHwAAASEHBhUUFhcVITU2NzY3ATMBHgEXFSE1PgE1NCcLAgOp/fNcIjti/lVVGTM+Ad0jAdg5XVP96VE5KG7m7AHG1k8nHy8HJSUPGDCTBFz7mIhRBSUlBC4hLF8BDQIk/dwBAAEAKgAABLQFTAAzAAABESEyNzY3MxEjJicuASMhERQeATsBMjY3NjczAyE1MzI3PgE1ETQnJisBNSETIy4BJyYjAawBKnQnNAYlJQ4OElJV/tYQKDjmc2gwPkEodfvrMDArIBcaJFQwBBUPJxUzMihlBQL96CMudP4oYxwjKP5BWicXIC8+ff6sJRcQQGMDcYEeKCX+12tQFQ8DAAEAIgAABvIFTAAwAAAhAREUFxY7ARUhNTMyNzY1ETQnLgEjNSEJASEVIyIHBhURFBcWOwEVITUzMjc2NREBA0b99BslUDD+KDBWJBYUDktTAYAB7AHkAYAvVyQWHCVQL/3AMFcjFv31BHX8dn0fKiUlNCByA3ZaKB0nJfvbBCUlNCBy/Ip9HyolJTQgcgOK+4sAAf/l/+oFqgVMACcAAAMhARE0JyYrATUhFSMiBwYVESMBERQXFjsBFSE1MzI3NjURLgEnJiMbAXADPRwlUC8B2DBWJBYk/IIbJk8w/igvVyQWOz07HTsFTPwHAw59HyolJTQgcvuJBET8vX0fKiUlNCByA69FLBMJEAACACMAAAVoBUwAKAA0AAApAQEGIyImJxEUFxY7ARUhNTMyNzY1ETQnJisBNSEyHgEVFAYHAR4BFwEyFjMyNjU0JiMiBwVo/pb+NTMgDR4QHCZMNf27M1YlFRwnTTMB7tjNj6OrARhgim/8PRMcCcLFn4M6YwJ6AgEB/naAHywlJTgfdANsgB8sJT+pdX24Jv57hlgMApQBqIJ/nxMAAAEAgP/hBAUFawA4AAABESMuAiMiBhUUFxYXHgIVFAYjIicuASMiBgcjETMeAjMyNjU0JicmJC4BNTQ2MzIXFjMyNjcDqyUSXaxcaIgrPum+i0vvvDs0H8MaGR0HJSUaWLVsfZE3Oif+pJNM4K1seTgXGiEKBWv+K4egXn9RPjNLfWZtlFGa3wkFPx4vAdGSkWCEWjJmLB7DdIxUktM1GR8vAAEAG//hB30FTAA5AAABFSIGBwYHASMJASMBJicuASM1IRUjIgYVFBcBEy8BJicmJyYnJiM1IRUjIgYVFBcJATY1NCYnJiM1B301Qh4UK/6GKP7L/s0k/m0tDBRFOwH2GDU4LAEL4SggFRoNExkZEykCECQ4NC0BBAECLB0WJj0FTCUmNCOE+7sDY/ydBGZ+FyYlJSUwIiN+/QcCh3JbMiYTDRIIBiUlMCkzf/0fAut8MBcoCA4lAwABABMAAAWpBUwALgAAASEVIyIOAQcBERQXFjsBFSE1MzI3NjURAS4BJyYjNSEVIyIGFRQXCQE2NTQuASMD0AHZGhpkUjz+uRwmUiz9wDBWJBb+jEIvShQmAkQeL089ARsBCjwdNjYFTCUuVmH9/f6sfR8qJSU0IHIBQQI4ZDIjCiUlLCwkXv5LAaJeLhwsGQABAAAAAAAARG35fl8PPPUAAAgAAAAAAAAAAAAAAAAAAAAAAP/l/m8H2QVrAAAAAAAAAAAAAAAAAAEAAAVr/m8AAAgS/+X/7gfZAAAAAAAAAAAAAAAAAAAAAAAlA4gAAAAAursFzQAcCAAAAAVWACIFVgBKBccAIwTjACoEcwAhBccASAXHACMCqgAzAx0AKgXHACIE4wApCBIAOQXHACUFxwBIBHMAIgXHAEgEoAAlBOMAGgTjAD4FxwASBccAEggSADkFxwAPBecAGATjABoFxwAQBOMAKgcdACIFx//lBVYAIwRzAIAHjQAbBccAEwAAAAAAAAAvAC8AggC+APUBMAFzAcICIwJTAogC6wMeA3cDqQPeBB8EZASLBK8E4QUZBVEFqQYPBlIGdgauBvwHRQeCB9EIIgh+CMYAAQAAACUARgADAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAABgBJgABAAAAAAAAAAkAAAABAAAAAAABAAMACQABAAAAAAACAAcADAABAAAAAAADAAMAEwABAAAAAAAEAAMAFgABAAAAAAAFAAwAGQABAAAAAAAGAAMAJQABAAAAAAAHAAkAKAADAAEECQAAADIAMQADAAEECQABABoBVwADAAEECQACABoBcQADAAEECQADABoBiwADAAEECQAEABoBpQADAAEECQAFABgBvwADAAEECQAGABoBnwADAAEECQAHADQB8QADAAEECwAAADQAMQADAAEECwABABoAZQADAAEECwACABoAfwADAAEECwADABoAmQADAAEECwAEABoAswADAAEECwAFABgAzQADAAEECwAGABoA5QADAAEECwAHACYA/0NvcHlyaWdodE5ld1JlZ3VsYXJOZXdOZXdWZXJzaW9uIDEuMDBOZXdUcmFkZW1hcmsAQwBvAHAAeQByAGkAZwBoAHQAIABiAHkAIAByAHoAeQAvAFMARAAsACAAMQA5ADkAOQAuAEUAbQBwAGkAcgBpAGMAIABSAG8AbQBhAG4ARQBtAHAAaQByAGkAYwAgAFIAbwBtAGEAbgBFAG0AcABpAHIAaQBjACAAUgBvAG0AYQBuAEUAbQBwAGkAcgBpAGMAIABSAG8AbQBhAG4AdgBlAHIAcwBpAG8AbgAgADEALgAwADAARQBtAHAAaQByAGkAYwAgAFIAbwBtAGEAbgBUAHIAYQBkAGUAbQBhAHIAawAgAGIAeQAgAHIAegB5AC8AUwBEAG8AcAB5AHIAaQBnAGgAdAAgAGIAeQAgAHIAegB5AC8AUwBEACwAIAAxADkAOQA5AC4ARQBtAHAAaQByAGkAYwAgAFIAbwBtAGEAbgBFAG0AcABpAHIAaQBjACAAUgBvAG0AYQBuAEUAbQBwAGkAcgBpAGMAIABSAG8AbQBhAG4ARQBtAHAAaQByAGkAYwAgAFIAbwBtAGEAbgBWAGUAcgBzAGkAbwBuACAAMQAuADAAMABFAG0AcABpAHIAaQBjACAAUgBvAG0AYQBuAFQAcgBhAGQAZQBtAGEAcgBrACAAYgB5ACAAcgB6AHkALwBTAEQALAAgADEAOQA5ADkALgAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
@font-face {
  font-family: 'Empiric Roman';
  src: url('data:font/truetype;base64,${EMPIRIC_ROMAN_B64}') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
:root {
  --bg: #f7f8fa;
  --surface: #ffffff;
  --surface-2: #eef0f4;
  --surface-3: #dfe2e8;
  --border: #d0d5dd;
  --border-hover: #98a2b3;
  --text: #101828;
  --text-muted: #344054;
  --text-dim: #667085;
  --ink: #0c111d;
  --link: #0d6e6e;
  --link-dim: rgba(13, 110, 110, 0.08);
  --accent: #475467;
  --accent-dim: rgba(71, 84, 103, 0.08);
  --red: #b42318;
  --red-dim: rgba(180, 35, 24, 0.07);
  --amber: #93370d;
  --amber-dim: rgba(147, 55, 13, 0.07);
  --blue: #175cd3;
  --blue-dim: rgba(23, 92, 211, 0.07);
  --purple: #6941c6;
  --purple-dim: rgba(105, 65, 198, 0.07);
  --green: #067647;
  --green-dim: rgba(6, 118, 71, 0.07);
  --rad: 10px;
  --font: 'Inter', -apple-system, system-ui, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', monospace;
  --brand: 'Empiric Roman', 'Cinzel', 'Georgia', 'Times New Roman', serif;
  --panel-bg: #0c111d;
  --panel-border: #1d2939;
  --panel-text: #98a2b3;
  --panel-text-dim: #667085;
  --panel-text-bright: #d0d5dd;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.65; min-height: 100vh; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; letter-spacing: -0.011em; text-rendering: optimizeLegibility; }
::selection { background: rgba(13, 110, 110, 0.15); color: var(--text); }
::-moz-selection { background: rgba(13, 110, 110, 0.15); color: var(--text); }
a { color: var(--link); text-decoration: none; transition: color 0.2s ease; }
a:hover { color: var(--ink); }
:focus-visible { outline: 2px solid var(--border-hover); outline-offset: 2px; border-radius: 4px; }
[hidden] { display: none !important; }
.container { max-width: 800px; margin: 0 auto; padding: 0 24px; }

/* Trust Bar */
.trust-bar { background: var(--panel-bg); color: var(--panel-text-dim); font-family: var(--mono); font-size: 11px; padding: 10px 24px; display: flex; justify-content: center; gap: 28px; letter-spacing: 0.04em; text-transform: uppercase; border-bottom: 1px solid var(--panel-border); }
.trust-bar .tb-label { color: var(--panel-text-dim); margin-right: 4px; }
.trust-bar .tb-value { color: var(--panel-text); transition: color 0.2s; }
.trust-bar a.tb-value:hover { color: var(--panel-text-bright); }
.trust-bar .tb-status { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #12b76a; margin-right: 6px; animation: pulse-dot 2.5s ease-in-out infinite; vertical-align: middle; box-shadow: 0 0 6px rgba(18, 183, 106, 0.4); }
@keyframes pulse-dot { 0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(18, 183, 106, 0.4); } 50% { opacity: 0.4; box-shadow: 0 0 2px rgba(18, 183, 106, 0.2); } }

/* Header */
header { border-bottom: 1px solid var(--border); padding: 18px 0; position: sticky; top: 0; background: rgba(247, 248, 250, 0.88); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); z-index: 100; }
header .container { display: flex; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: 10px; color: var(--text); }
.logo-mark { font-family: var(--brand); font-size: 22px; font-weight: 700; letter-spacing: 0.08em; line-height: 1; }
.logo-text { font-family: var(--brand); font-size: 14px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; }
nav a { color: var(--text-dim); margin-left: 28px; font-size: 13px; font-weight: 500; transition: color 0.2s; position: relative; }
nav a::after { content: ''; position: absolute; bottom: -3px; left: 0; width: 0; height: 1.5px; background: var(--link); transition: width 0.25s ease; }
nav a:hover::after { width: 100%; }
nav a:hover { color: var(--ink); text-decoration: none; }

/* Hero */
.hero { padding: 80px 0 64px; text-align: center; }
.hero h1 { font-family: var(--brand); font-size: 42px; font-weight: 700; letter-spacing: 0.005em; line-height: 1.12; margin-bottom: 24px; color: var(--ink); }
.hero-accent { color: var(--link); }
.hero p { color: var(--text-muted); font-size: 17px; max-width: 580px; margin: 0 auto; line-height: 1.7; }
.hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; background: var(--link-dim); border: 1px solid rgba(13, 110, 110, 0.15); border-radius: 999px; font-family: var(--mono); font-size: 11px; font-weight: 600; color: var(--link); margin-bottom: 24px; letter-spacing: 0.02em; text-transform: uppercase; }
.hero-eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--link); }

/* Protocol Grid */
.protocol-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 56px; }
.protocol-card { padding: 26px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: border-color 0.15s, box-shadow 0.15s; }
.protocol-card:hover { border-color: var(--border-hover); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.protocol-card:last-child { grid-column: 1 / -1; }
.protocol-card-num { font-family: var(--mono); color: var(--text-dim); font-size: 10px; margin-bottom: 10px; letter-spacing: 0.06em; text-transform: uppercase; }
.protocol-card-title { font-weight: 700; font-size: 16px; margin-bottom: 10px; color: var(--text); }
.protocol-card-body { font-size: 13.5px; color: var(--text-muted); line-height: 1.6; margin-bottom: 10px; }
.protocol-card-link { font-size: 12px; font-weight: 600; color: var(--text-dim); display: inline-block; margin-top: auto; }
.protocol-card-link:hover { color: var(--text); }
.protocol-card { display: flex; flex-direction: column; }

/* Instance Panel */
.instance-panel { background: var(--panel-bg); border-radius: var(--rad); padding: 28px; margin-bottom: 56px; border: 1px solid var(--panel-border); }
.instance-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.instance-panel-title { color: var(--panel-text-dim); font-family: var(--mono); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.instance-panel-url { color: var(--panel-text-dim); font-family: var(--mono); font-size: 11px; }
.instance-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--panel-border); font-size: 13px; font-family: var(--mono); }
.instance-row:last-child { border-bottom: none; }
.instance-row .ir-label { color: var(--panel-text-dim); }
.instance-row .ir-value { color: var(--panel-text-bright); }
.instance-row .ir-value.none { color: var(--panel-text-dim); font-style: italic; }
.instance-row .ir-value.active { color: var(--panel-text-bright); }
.instance-commands { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--panel-border); }
.instance-commands pre { background: #111113; color: var(--panel-text); padding: 14px 18px; border-radius: 6px; font-family: var(--mono); font-size: 12px; margin-bottom: 8px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; line-height: 1.6; }
.instance-commands pre .cmd-comment { color: var(--panel-text-dim); }

/* Verifier */
.verifier-section { margin-bottom: 48px; }
.verifier-input-row { display: flex; gap: 8px; margin-bottom: 8px; }
.verifier-input-row input { flex-grow: 1; background: #111113; border: 1px solid var(--panel-border); color: var(--panel-text-bright); padding: 10px 14px; font-family: var(--mono); font-size: 13px; border-radius: 4px; }
.verifier-input-row input:focus { outline: none; border-color: #3f3f46; }
.verifier-input-row input::placeholder { color: var(--panel-text-dim); }
.verifier-input-row button { background: var(--panel-border); color: var(--panel-text-bright); font-family: var(--mono); font-weight: 600; font-size: 12px; padding: 0 18px; border: 1px solid #3f3f46; border-radius: 4px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.04em; }
.verifier-input-row button:hover { background: #3f3f46; color: #fff; }
.verify-result { font-family: var(--mono); font-size: 12px; padding: 8px 12px; border-radius: 4px; display: none; }
.verify-result.show { display: block; }
.verify-result.valid { background: rgba(212, 212, 216, 0.1); color: var(--panel-text-bright); border: 1px solid var(--panel-border); }
.verify-result.invalid { background: rgba(153, 27, 27, 0.1); color: #ef4444; border: 1px solid rgba(153, 27, 27, 0.2); }
.verify-result.loading { background: #111113; color: var(--panel-text-dim); border: 1px solid var(--panel-border); }

/* Cards */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 26px; margin-bottom: 14px; transition: border-color 0.15s, box-shadow 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.card:hover { border-color: var(--border-hover); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.card-body { color: var(--text); font-size: 15px; line-height: 1.7; }
.card-body p { margin-bottom: 8px; }
.card-meta { display: flex; gap: 12px; margin-top: 14px; font-size: 12px; font-family: var(--mono); color: var(--text-dim); flex-wrap: wrap; align-items: center; }
.card-actions { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: 14px; }
.card-actions button { font-size: 12px; padding: 6px 14px; background: transparent; border: 1px solid var(--border); color: var(--text-muted); border-radius: var(--rad); cursor: pointer; font-weight: 500; font-family: var(--font); transition: all 0.15s; }
.card-actions button:hover { border-color: var(--text-dim); color: var(--text); }

/* Badges */
.badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; font-family: var(--mono); }
.badge-question { background: var(--blue-dim); color: var(--blue); }
.badge-claim { background: var(--purple-dim); color: var(--purple); }
.badge-prediction { background: var(--amber-dim); color: var(--amber); }
.badge-evidence { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); }
.badge-challenge { background: var(--red-dim); color: var(--red); }
.badge-update { background: var(--blue-dim); color: var(--blue); }
.badge-resolution { background: var(--accent-dim); color: var(--text-muted); }
.badge-open { background: var(--surface-2); color: var(--text-dim); border: 1px solid var(--border); }
.badge-contested { background: var(--amber-dim); color: var(--amber); }
.badge-supported { background: var(--accent-dim); color: var(--text-muted); }
.badge-superseded { background: var(--text-dim); color: var(--surface); }
.badge-resolved, .badge-resolved_confirmed { background: var(--text); color: white; }
.badge-resolved_refuted { background: var(--red); color: white; }
.badge-unsubstantiated { background: var(--amber-dim); color: var(--amber); }
.badge-human { background: var(--surface-2); color: var(--text-dim); }
.badge-agent { background: var(--purple-dim); color: var(--purple); }
.badge-verified { background: rgba(5, 150, 105, 0.08); color: #059669; }
.badge-tombstoned { background: var(--red-dim); color: var(--red); }
.badge-unresolvable { background: var(--surface-2); color: var(--text-dim); }
.badge-awaiting_resolution { background: var(--amber-dim); color: var(--amber); }

/* Track Record */
.track-record-section { margin-bottom: 24px; }
.track-record-card { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); margin-bottom: 6px; font-size: 12px; }
.track-record-pseudonym { font-family: var(--mono); font-size: 11px; color: var(--text-dim); min-width: 70px; }
.track-record-bar { flex: 1; height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; min-width: 60px; }
.track-record-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.track-record-fill-good { background: #059669; }
.track-record-fill-bad { background: #dc2626; }
.track-record-fill-none { background: var(--text-dim); }
.track-record-stats { font-family: var(--mono); color: var(--text-dim); white-space: nowrap; }

/* Identity */
.identity-line { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.identity-pseudonym { font-family: var(--mono); font-size: 10px; color: var(--text-dim); background: var(--surface-2); padding: 2px 6px; border-radius: 3px; letter-spacing: 0.02em; }

/* Hash Display */
.hash { font-family: var(--mono); background: var(--surface-2); padding: 2px 6px; border-radius: 4px; font-size: 11px; color: var(--text-dim); border: 1px solid var(--border); cursor: pointer; transition: all 0.15s; }
.hash:hover { border-color: var(--text-dim); color: var(--text-muted); }

/* Prediction Cards */
.prediction-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 22px 24px; margin-bottom: 12px; transition: all 0.15s; display: block; text-decoration: none; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.prediction-card:hover { border-color: var(--border-hover); color: inherit; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.prediction-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.prediction-body { font-size: 14px; line-height: 1.55; color: var(--text); margin-bottom: 8px; }
.prediction-meta { display: flex; gap: 14px; font-size: 11px; font-family: var(--mono); color: var(--text-dim); flex-wrap: wrap; align-items: center; }
.prediction-resolve { color: var(--amber); font-weight: 500; }

/* Section Headers */
.section-header { font-size: 20px; font-weight: 700; margin: 72px 0 20px; color: var(--ink); letter-spacing: -0.02em; border-bottom: none; padding-bottom: 16px; position: relative; }
.section-header::after { content: ''; position: absolute; bottom: 0; left: 0; width: 28px; height: 2.5px; background: var(--link); border-radius: 2px; }
.section-subhead { color: var(--text-dim); font-size: 14px; margin-bottom: 24px; line-height: 1.6; max-width: 600px; }

/* Linked responses (Git tree style) */
.responses-section { margin-left: 20px; border-left: 2px solid var(--surface-3); padding-left: 24px; margin-top: 14px; position: relative; }
.response-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 18px; margin-bottom: 12px; position: relative; }
.response-card::before { content: ''; position: absolute; left: -26px; top: 24px; width: 24px; height: 2px; background: var(--surface-3); }
.response-card:hover { border-color: var(--border-hover); }

/* Topic list */
.topic-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); margin-bottom: 10px; transition: all 0.15s; }
.topic-item:hover { border-color: var(--border-hover); }
.topic-name { font-weight: 600; font-size: 15px; color: var(--text); }
.topic-stats { color: var(--text-dim); font-size: 12px; font-family: var(--mono); }

/* Forms */
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
select, input, textarea { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 10px 12px; color: var(--text); font-family: var(--font); font-size: 14px; transition: border-color 0.15s; }
select:focus, input:focus, textarea:focus { outline: none; border-color: var(--text-dim); box-shadow: 0 0 0 3px rgba(161, 161, 170, 0.12); }
textarea { min-height: 100px; resize: vertical; }

.btn { background: var(--text); color: var(--surface); border: none; padding: 10px 24px; border-radius: 4px; font-family: var(--font); font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn:hover { background: #000; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
.btn-secondary:hover { border-color: var(--text); background: var(--surface-2); }

/* Forms (Inline) */
.response-form { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--rad); padding: 20px; margin-top: 16px; display: none; }
.response-form.active { display: block; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* Result Box */
.result-box { background: var(--panel-bg); color: var(--panel-text-bright); border: 1px solid var(--panel-border); border-radius: var(--rad); padding: 16px; margin-top: 16px; font-family: var(--mono); font-size: 12px; white-space: pre-wrap; display: none; }
.result-box.success { border-left: 3px solid var(--panel-text-bright); }
.result-box.error { border-left: 3px solid #ef4444; }

/* Budget */
.budget-bar { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--rad); margin-bottom: 24px; font-size: 13px; font-family: var(--mono); color: var(--text-muted); }
.budget-dots { display: flex; gap: 4px; }
.budget-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text); }
.budget-dot.spent { background: var(--surface-3); }

/* Moderation Log */
.mod-entry { padding: 16px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); margin-bottom: 12px; font-size: 14px; }
.mod-entry .mod-action { font-weight: 600; font-family: var(--mono); font-size: 12px; }
.mod-entry .mod-time { color: var(--text-dim); font-size: 12px; font-family: var(--mono); }

/* Empty state */
.empty { text-align: center; padding: 48px 20px; color: var(--text-muted); border: 1px dashed var(--border); border-radius: var(--rad); background: var(--surface-2); }
.empty h3 { margin-bottom: 8px; font-weight: 600; color: var(--text); }
.empty p { font-size: 14px; color: var(--text-dim); }
code { background: var(--surface-2); padding: 2px 7px; border-radius: 5px; font-family: var(--mono); font-size: 12px; border: 1px solid var(--border); color: var(--text-muted); font-weight: 500; }

/* Charter */
.charter-content { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 32px; margin-bottom: 24px; }
.invariant { display: flex; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.invariant:last-child { border-bottom: none; }
.invariant-num { color: var(--text-muted); font-family: var(--mono); font-size: 14px; font-weight: 700; min-width: 24px; padding-top: 2px; }
.invariant-text { font-size: 14px; color: var(--text-muted); line-height: 1.55; }
.invariant-text strong { color: var(--text); font-weight: 700; }

/* Tiers */
.tier-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; font-size: 13px; line-height: 1.5; }

/* Contribute methods */
.contribute-methods { margin-bottom: 32px; }
.contribute-method { margin-bottom: 16px; }
.contribute-method-label { font-family: var(--mono); font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.contribute-method pre { background: var(--panel-bg); color: var(--panel-text); padding: 14px 16px; border-radius: 6px; font-family: var(--mono); font-size: 12px; overflow-x: auto; white-space: pre; border: 1px solid var(--panel-border); line-height: 1.5; }
.contribute-method pre .key { color: var(--panel-text-bright); }
.contribute-method pre .str { color: #d4a06a; }
.contribute-method pre .comment { color: var(--panel-text-dim); }

/* Docs */
.docs-section { margin-bottom: 48px; }
.docs-section-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: var(--text); padding-bottom: 8px; border-bottom: 1px solid var(--border); }
.docs-section-body { font-size: 14px; color: var(--text-muted); line-height: 1.65; margin-bottom: 8px; }
.docs-table { border: 1px solid var(--border); border-radius: var(--rad); overflow: hidden; margin: 12px 0; }
.docs-row { display: flex; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--border); font-size: 13px; align-items: flex-start; }
.docs-row:last-child { border-bottom: none; }
.docs-row-header { background: var(--surface-2); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-dim); }
.docs-cell-type { flex: 1; min-width: 0; }
.docs-cell-desc { flex: 2; color: var(--text-muted); min-width: 0; }
.docs-cell-states { flex: 1; font-family: var(--mono); font-size: 11px; color: var(--text-dim); min-width: 0; }

footer { border-top: 1px solid var(--border); padding: 48px 0 80px; margin-top: 80px; text-align: center; font-size: 13px; color: var(--text-dim); }
footer a { color: var(--text-muted); font-weight: 500; transition: color 0.2s; }
footer a:hover { color: var(--text); }

.verify-banner { background: var(--panel-bg); color: var(--panel-text-bright); border: 1px solid var(--panel-border); border-radius: var(--rad); padding: 12px 16px; margin-bottom: 24px; font-size: 13px; font-family: var(--mono); display: flex; align-items: center; gap: 8px; }
.json-toggle { font-family: var(--mono); font-size: 10px; padding: 3px 6px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 4px; cursor: pointer; color: var(--text-muted); margin-left: auto; user-select: none; }
.json-toggle:hover { background: var(--border); color: var(--text); }
.raw-json { display: none; font-family: var(--mono); font-size: 11px; background: var(--panel-bg); color: var(--panel-text-bright); border-radius: var(--rad); padding: 16px; margin-top: 12px; overflow-x: auto; border: 1px solid var(--panel-border); }

.form-toggle { background: none; border: 1px solid var(--border); border-radius: var(--rad); padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; margin-bottom: 16px; font-family: var(--font); }
.form-toggle:hover { border-color: var(--text-muted); color: var(--text); }

/* Charter Summary */
.charter-summary { margin-bottom: 56px; }
.charter-summary-lead { font-size: 15px; color: var(--text-muted); line-height: 1.65; margin-bottom: 12px; }
.charter-invariants { display: flex; flex-direction: column; gap: 2px; margin-bottom: 20px; }
.charter-inv { display: flex; gap: 16px; padding: 16px 20px; background: var(--surface); border: 1px solid var(--border); align-items: flex-start; }
.charter-inv:first-child { border-radius: var(--rad) var(--rad) 0 0; }
.charter-inv:last-child { border-radius: 0 0 var(--rad) var(--rad); }
.charter-inv-num { font-family: var(--mono); font-size: 12px; color: var(--text-dim); font-weight: 700; min-width: 20px; padding-top: 2px; }
.charter-inv-title { font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 4px; }
.charter-inv-body { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
.charter-summary-link { display: inline-block; font-size: 13px; font-weight: 600; color: var(--link); }
.charter-summary-link:hover { color: var(--ink); }

/* Featured Record */
.featured-record { margin-bottom: 48px; }
.featured-label { font-family: var(--mono); font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
.featured-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 24px; position: relative; overflow: hidden; }
.featured-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--amber); }
.featured-body { font-size: 15px; line-height: 1.6; color: var(--text); margin: 12px 0; }
.featured-challenge { margin-top: 16px; margin-left: 20px; padding-left: 20px; border-left: 2px solid var(--surface-3); }
.featured-challenge-body { font-size: 13px; color: var(--text-muted); line-height: 1.55; margin: 8px 0; }
.featured-meta { font-size: 11px; font-family: var(--mono); color: var(--text-dim); margin-top: 12px; }
.featured-cta { display: inline-block; margin-top: 16px; font-size: 13px; font-weight: 600; color: var(--text-muted); }
.featured-cta:hover { color: var(--text); }

/* Start / Discovery */
.hero-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 32px auto 18px; max-width: 920px; }
.hero-action-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 20px 20px 18px; text-align: left; color: inherit; display: block; }
.hero-action-card:hover { border-color: var(--border-hover); color: inherit; }
.hero-action-kicker { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; font-weight: 600; }
.hero-action-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
.hero-action-body { font-size: 13px; color: var(--text-muted); line-height: 1.55; }
.hero-stats { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 20px; animation: fadeInUp 0.6s ease 0.1s both; }
.hero-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 8px 16px; display: inline-flex; gap: 6px; align-items: baseline; }
.hero-stat-value { font-family: var(--mono); font-size: 14px; font-weight: 700; color: var(--ink); }
.hero-stat-label { font-size: 12px; color: var(--text-dim); }

.topic-directory-controls { display: grid; gap: 12px; margin-bottom: 18px; }
.topic-directory-search { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 12px 16px; font-size: 14px; }
.topic-filter-row { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-chip { background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 7px 12px; font-size: 12px; color: var(--text-muted); cursor: pointer; font-family: var(--font); }
.filter-chip.active { background: var(--text); border-color: var(--text); color: var(--surface); }
.directory-summary { font-size: 12px; color: var(--text-dim); font-family: var(--mono); }
.topic-directory-grid { display: grid; gap: 10px; }
.topic-item-main { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.topic-kickers { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.topic-summary-line { font-size: 12px; color: var(--text-muted); line-height: 1.45; }
.topic-stat-stack { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; text-align: right; min-width: 150px; }
.topic-stat-emphasis { font-family: var(--mono); font-size: 11px; color: var(--text-dim); }
.discovery-empty { padding: 20px 18px; border: 1px dashed var(--border); border-radius: var(--rad); color: var(--text-dim); font-size: 13px; background: var(--surface-2); }

.quickstart-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
.quickstart-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 18px; }
.quickstart-card h3 { font-size: 15px; margin-bottom: 6px; color: var(--ink); }
.quickstart-card p { font-size: 13px; color: var(--text-muted); line-height: 1.55; }
.quickstart-card a { display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 600; color: var(--link); }

.deep-dive { border: 1px solid var(--border); border-radius: var(--rad); background: var(--surface); margin-bottom: 14px; overflow: hidden; }
.deep-dive[open] { box-shadow: 0 8px 24px rgba(24, 24, 27, 0.04); }
.deep-dive-summary { list-style: none; cursor: pointer; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-weight: 700; color: var(--text); }
.deep-dive-summary::-webkit-details-marker { display: none; }
.deep-dive-summary::after { content: '+'; font-family: var(--mono); color: var(--text-dim); }
.deep-dive[open] .deep-dive-summary::after { content: '–'; }
.deep-dive-body { padding: 0 20px 20px; }

/* Topic page / shareability */
.topic-page-hero { padding-top: 28px; }
.topic-summary-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 24px; margin-bottom: 18px; }
.topic-summary-lead { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; }
.topic-summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 18px; }
.topic-summary-metric { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--rad); padding: 12px 12px 10px; }
.topic-summary-value { font-family: var(--mono); font-size: 16px; color: var(--text); font-weight: 700; margin-bottom: 4px; }
.topic-summary-label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; }
.topic-summary-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.topic-summary-actions .btn,
.topic-summary-actions .btn-secondary,
.topic-summary-actions button { font-size: 12px; padding: 9px 14px; }

.entry-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
.entry-toolbar-note { font-family: var(--mono); font-size: 11px; color: var(--text-dim); }
.entry-toolbar-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.mini-btn { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); border-radius: 999px; padding: 6px 10px; font-size: 11px; font-family: var(--font); cursor: pointer; }
.mini-btn:hover { border-color: var(--text-dim); color: var(--text); }
.entry-details { margin-top: 14px; padding: 14px 16px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--rad); }
.entry-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.inline-note { font-size: 12px; color: var(--text-muted); line-height: 1.55; }

/* Guided composer */
.composer-shell { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 22px; margin-top: 12px; }
.composer-steps { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.composer-step { font-family: var(--mono); font-size: 11px; color: var(--text-dim); border: 1px solid var(--border); border-radius: 999px; padding: 6px 10px; }
.composer-step.active { color: var(--text); border-color: var(--text-dim); background: var(--surface-2); }
.composer-guidance { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--rad); padding: 14px 16px; margin-bottom: 18px; font-size: 13px; color: var(--text-muted); line-height: 1.55; }
.composer-type-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.type-pill { background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 8px 12px; font-size: 12px; cursor: pointer; color: var(--text-muted); }
.type-pill.active { background: var(--text); border-color: var(--text); color: var(--surface); }
.field-hint { font-size: 12px; color: var(--text-dim); line-height: 1.45; margin-top: 6px; }

/* Verify lab */
.verify-lab { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 22px; margin-bottom: 28px; }
.verify-input-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr); gap: 16px; align-items: start; }
.verify-lab textarea { min-height: 240px; font-family: var(--mono); font-size: 12px; background: var(--panel-bg); color: var(--panel-text-bright); border-color: var(--panel-border); }
.verify-drop { display: grid; gap: 10px; }
.verify-drop .btn,
.verify-drop .btn-secondary,
.verify-drop button { width: 100%; justify-content: center; }
.verify-output { margin-top: 18px; padding: 18px; border-radius: var(--rad); border: 1px solid var(--border); background: var(--surface-2); }
.verify-output.valid { border-color: rgba(5, 150, 105, 0.22); background: rgba(5, 150, 105, 0.06); }
.verify-output.invalid { border-color: rgba(153, 27, 27, 0.22); background: rgba(153, 27, 27, 0.06); }
.verify-output.partial { border-color: rgba(146, 64, 14, 0.22); background: rgba(146, 64, 14, 0.06); }
.verify-status { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.verify-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 14px 0; }
.verify-fact { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 10px 12px; }
.verify-fact-label { font-family: var(--mono); font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.verify-fact-value { font-size: 13px; color: var(--text); word-break: break-word; }
.verify-pre { background: var(--panel-bg); color: var(--panel-text-bright); border: 1px solid var(--panel-border); border-radius: var(--rad); padding: 14px; font-family: var(--mono); font-size: 11px; overflow-x: auto; white-space: pre-wrap; }

.live-deployment-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 22px; margin-bottom: 18px; }
.live-deployment-card p { font-size: 13px; color: var(--text-muted); line-height: 1.55; margin-bottom: 10px; }

.mobile-action-bar { display: none; }

@media (max-width: 600px) {
  header .container { flex-direction: column; align-items: flex-start; gap: 10px; }
  nav { display: flex; flex-wrap: wrap; gap: 14px; }
  nav a { margin-left: 0; }
  .container { padding: 0 16px; }
  .hero h1 { font-size: 30px; }
  .hero-actions,
  .quickstart-grid,
  .verify-input-grid,
  .topic-summary-grid,
  .verify-facts { grid-template-columns: 1fr; }
  .hero { padding: 56px 0 40px; }
  .protocol-grid { grid-template-columns: 1fr; }
  .protocol-card:last-child { grid-column: auto; }
  .tier-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .card,
  .featured-card,
  .topic-summary-card,
  .composer-shell,
  .verify-lab,
  .charter-content { padding: 18px; }
  .charter-inv { flex-direction: column; gap: 8px; }
  .topic-item { flex-direction: column; align-items: flex-start; gap: 12px; }
  .topic-stat-stack { align-items: flex-start; text-align: left; min-width: 0; }
  .topic-summary-actions { display: grid; grid-template-columns: 1fr; }
  .topic-summary-actions .btn,
  .topic-summary-actions .btn-secondary,
  .topic-summary-actions button { width: 100%; text-align: center; justify-content: center; }
  .entry-meta-grid { grid-template-columns: 1fr; }
  .instance-panel { padding: 22px 18px; }
  .docs-table { overflow: visible; }
  .docs-row { flex-direction: column; gap: 6px; padding: 12px 14px; }
  .docs-row-header { display: none; }
  .docs-cell-type,
  .docs-cell-desc,
  .docs-cell-states { width: 100%; }
  .docs-cell-type { font-weight: 700; color: var(--text); }
  .instance-panel-header, .instance-row, .entry-toolbar { flex-direction: column; align-items: flex-start; }
  .responses-section { margin-left: 0; padding-left: 14px; }
  .response-card::before { display: none; }
  body { padding-bottom: 80px; }
  .mobile-action-bar { position: sticky; bottom: 0; z-index: 90; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 10px 12px calc(10px + env(safe-area-inset-bottom)); background: rgba(249, 247, 244, 0.98); border-top: 1px solid var(--border); backdrop-filter: blur(12px); }
  .mobile-action-bar a, .mobile-action-bar button { background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 9px 8px; font-size: 11px; text-align: center; color: var(--text-muted); }
  .trust-bar { font-size: 9px; gap: 10px; flex-wrap: wrap; }
}

@media (max-width: 430px) {
  .mobile-action-bar { grid-template-columns: 1fr 1fr; }
}

/* Scroll-triggered entrance animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.card, .prediction-card, .protocol-card, .topic-item, .quickstart-card, .charter-inv, .deep-dive, .hero-action-card {
  animation: fadeInUp 0.4s ease both;
}
.card:nth-child(1), .prediction-card:nth-child(1), .protocol-card:nth-child(1) { animation-delay: 0s; }
.card:nth-child(2), .prediction-card:nth-child(2), .protocol-card:nth-child(2) { animation-delay: 0.05s; }
.card:nth-child(3), .prediction-card:nth-child(3), .protocol-card:nth-child(3) { animation-delay: 0.1s; }
.card:nth-child(4), .prediction-card:nth-child(4) { animation-delay: 0.15s; }
.card:nth-child(5), .prediction-card:nth-child(5) { animation-delay: 0.2s; }
.card:nth-child(6), .prediction-card:nth-child(6) { animation-delay: 0.25s; }
.topic-item:nth-child(1) { animation-delay: 0s; }
.topic-item:nth-child(2) { animation-delay: 0.04s; }
.topic-item:nth-child(3) { animation-delay: 0.08s; }
.topic-item:nth-child(4) { animation-delay: 0.12s; }
.topic-item:nth-child(5) { animation-delay: 0.16s; }
.hero-action-card:nth-child(1) { animation-delay: 0.05s; }
.hero-action-card:nth-child(2) { animation-delay: 0.12s; }
.hero-action-card:nth-child(3) { animation-delay: 0.19s; }

/* Built on Acta — visually distinct showcase cards */
.showcase-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 56px; }
.showcase-card { padding: 26px; padding-left: 28px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); border-left: 3px solid var(--border-hover); position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s; display: flex; flex-direction: column; }
.showcase-card:hover { border-color: var(--border-hover); box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }
.showcase-card:last-child { grid-column: 1 / -1; background: linear-gradient(135deg, var(--surface) 0%, rgba(235,235,239,0.5) 100%); }
.showcase-card .protocol-card-num { font-family: var(--mono); color: var(--text-dim); font-size: 10px; margin-bottom: 10px; letter-spacing: 0.06em; text-transform: uppercase; }
.showcase-card .protocol-card-title { font-weight: 700; font-size: 16px; margin-bottom: 10px; color: var(--text); }
.showcase-card .protocol-card-body { font-size: 13.5px; color: var(--text-muted); line-height: 1.6; margin-bottom: 10px; flex: 1; }
.showcase-card .protocol-card-link { font-size: 12px; font-weight: 600; color: var(--text-dim); }
.showcase-card .protocol-card-link:hover { color: var(--text); }
@media (max-width: 600px) { .showcase-grid { grid-template-columns: 1fr; } .showcase-card:last-child { grid-column: auto; } }

/* Hero action card hover lift */
.hero-action-card { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
.hero-action-card:hover { border-color: var(--border-hover); box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }

/* Refined pill links in hero */
.hero-pill { transition: border-color 0.2s, box-shadow 0.2s; }
.hero-pill:hover { border-color: var(--border-hover); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

/* Protocol card link arrow animation */
.protocol-card-link { transition: color 0.2s, gap 0.2s; display: inline-flex; align-items: center; gap: 2px; }
.protocol-card-link:hover { gap: 5px; }

/* Instance panel glow on hover */
.instance-panel { transition: box-shadow 0.3s; }
.instance-panel:hover { box-shadow: 0 0 0 1px var(--panel-border), 0 8px 32px rgba(0,0,0,0.2); }

/* Deep dive section refinement */
.deep-dive { transition: border-color 0.2s, box-shadow 0.2s; }
.deep-dive:hover { border-color: var(--border-hover); }
.deep-dive-summary { transition: color 0.2s; }
.deep-dive-summary:hover { color: var(--text); }

/* Better button hover states */
.btn { transition: background 0.2s, transform 0.1s; }
.btn:hover { background: #000; }
.btn:active { transform: scale(0.98); }
.btn-secondary { transition: all 0.2s; }
.btn-secondary:hover { border-color: var(--text); background: var(--surface-2); transform: translateY(-1px); }

/* Badge micro-refinements */
.badge { transition: opacity 0.2s; }
.badge:hover { opacity: 0.85; }

/* Topic item hover */
.topic-item { transition: all 0.2s; }
.topic-item:hover { border-color: var(--border-hover); box-shadow: 0 2px 8px rgba(0,0,0,0.05); transform: translateY(-1px); }

/* Quickstart card hover */
.quickstart-card { transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.quickstart-card:hover { border-color: var(--border-hover); box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }

/* Filter chip press */
.filter-chip { transition: all 0.15s; }
.filter-chip:active { transform: scale(0.96); }

/* ─── Feature: Integration Snippets ─── */
.snippet-section { margin: 48px 0; }
.snippet-tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 0; }
.snippet-tab { padding: 10px 20px; font-family: var(--mono); font-size: 12px; font-weight: 600; color: var(--text-dim); cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; letter-spacing: 0.02em; }
.snippet-tab:hover { color: var(--ink); }
.snippet-tab.active { color: var(--link); border-bottom-color: var(--link); }
.snippet-panel { display: none; position: relative; }
.snippet-panel.active { display: block; }
.snippet-pre { background: var(--panel-bg); color: var(--panel-text-bright); padding: 20px 24px; border-radius: 0 0 var(--rad) var(--rad); font-family: var(--mono); font-size: 13px; line-height: 1.7; overflow-x: auto; border: 1px solid var(--panel-border); border-top: none; margin: 0; }
.snippet-pre .cmd-comment { color: var(--panel-text-dim); }
.snippet-pre .cmd-highlight { color: #7dd3fc; }
.snippet-copy { position: absolute; top: 12px; right: 12px; background: var(--panel-border); color: var(--panel-text-bright); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 5px 12px; font-family: var(--mono); font-size: 11px; cursor: pointer; transition: all 0.2s; z-index: 2; }
.snippet-copy:hover { background: rgba(255,255,255,0.15); }
.snippet-copy.copied { background: var(--green); color: white; border-color: var(--green); }
.snippet-desc { font-size: 13px; color: var(--text-dim); margin-top: 10px; line-height: 1.5; }

/* ─── Feature: How Acta Works Pipeline ─── */
.pipeline-section { margin: 72px 0 48px; }
.pipeline { display: flex; align-items: flex-start; gap: 0; position: relative; overflow-x: auto; padding: 8px 0 24px; }
.pipeline-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; min-width: 130px; animation: fadeInUp 0.4s ease both; }
.pipeline-step:nth-child(1) { animation-delay: 0s; }
.pipeline-step:nth-child(2) { animation-delay: 0.1s; }
.pipeline-step:nth-child(3) { animation-delay: 0.2s; }
.pipeline-step:nth-child(4) { animation-delay: 0.3s; }
.pipeline-step:nth-child(5) { animation-delay: 0.4s; }
.pipeline-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 12px; border: 2px solid var(--border); background: var(--surface); position: relative; z-index: 2; transition: all 0.3s; }
.pipeline-step:hover .pipeline-icon { border-color: var(--link); transform: scale(1.1); }
.pipeline-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin-bottom: 6px; }
.pipeline-desc { font-size: 12px; color: var(--text-dim); line-height: 1.45; max-width: 140px; }
.pipeline-connector { position: absolute; top: 24px; left: calc(50% + 24px); right: calc(-50% + 24px); height: 2px; background: var(--border); z-index: 1; }
.pipeline-connector::after { content: '→'; position: absolute; right: -4px; top: -8px; font-size: 14px; color: var(--border-hover); }
.pipeline-step:last-child .pipeline-connector { display: none; }
@media (max-width: 600px) { .pipeline { flex-direction: column; align-items: stretch; gap: 8px; } .pipeline-step { flex-direction: row; text-align: left; gap: 14px; min-width: 0; } .pipeline-icon { margin-bottom: 0; flex-shrink: 0; } .pipeline-connector { display: none; } .pipeline-desc { max-width: none; } }

/* ─── Feature: Receipt Anatomy ─── */
.receipt-anatomy { background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: var(--rad); overflow: hidden; }
.receipt-anatomy-header { padding: 16px 20px; border-bottom: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center; }
.receipt-anatomy-title { font-family: var(--mono); font-size: 11px; color: var(--panel-text-dim); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.receipt-anatomy-badge { font-family: var(--mono); font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
.receipt-json { padding: 20px 24px; font-family: var(--mono); font-size: 12.5px; line-height: 1.8; color: var(--panel-text); overflow-x: auto; }
.receipt-field { cursor: pointer; position: relative; display: inline; transition: all 0.15s; border-radius: 3px; padding: 1px 2px; margin: -1px -2px; }
.receipt-field:hover { background: rgba(13, 110, 110, 0.15); color: var(--panel-text-bright); }
.receipt-field.active { background: rgba(13, 110, 110, 0.2); color: #7dd3fc; }
.receipt-annotation { background: var(--panel-bg); border-top: 1px solid var(--panel-border); padding: 16px 20px; min-height: 72px; transition: all 0.2s; }
.receipt-annotation-label { font-family: var(--mono); font-size: 10px; color: var(--link); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; font-weight: 600; }
.receipt-annotation-text { font-size: 13px; color: var(--panel-text-bright); line-height: 1.55; }
.receipt-key { color: #7dd3fc; }
.receipt-str { color: #d4a06a; }
.receipt-num { color: #b4befe; }

/* ─── Feature: Live Chain Activity ─── */
.chain-activity { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rad); padding: 16px 20px; margin: 20px 0 48px; display: flex; align-items: center; gap: 16px; animation: fadeInUp 0.5s ease 0.2s both; }
.chain-activity-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0; animation: pulse-dot 2.5s ease-in-out infinite; box-shadow: 0 0 6px rgba(6, 118, 71, 0.4); }
.chain-activity-text { font-size: 13px; color: var(--text-muted); flex: 1; }
.chain-activity-text strong { color: var(--ink); font-weight: 600; }
.chain-activity-hash { font-family: var(--mono); font-size: 11px; color: var(--text-dim); background: var(--surface-2); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); }
@media (max-width: 600px) { .chain-activity { flex-direction: column; align-items: flex-start; gap: 8px; } }

/* Print stylesheet */
@media print {
  .trust-bar, header, .mobile-action-bar, .hero-actions, button, .btn, .btn-secondary, .filter-chip, .verifier-section, .instance-commands, .response-form { display: none !important; }
  body { background: white; color: black; font-size: 11pt; }
  .container { max-width: 100%; padding: 0; }
  .card, .prediction-card, .protocol-card, .topic-item { break-inside: avoid; box-shadow: none; border: 1px solid #ccc; }
  a { color: inherit; }
  a[href]::after { content: ' (' attr(href) ')'; font-size: 9pt; color: #666; }
}
`;

// ── Shared JS ───────────────────────────────────────────────────────

const CLIENT_JS = `
let budgetTokens = null;
let activeTopicFilter = 'all';
let browserVerifyLastSummary = '';

function toggleJson(id) {
  const el = document.getElementById('raw-' + id);
  if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function copyText(text, trigger, successLabel) {
  try {
    await navigator.clipboard.writeText(text);
    if (trigger) {
      const original = trigger.dataset.originalLabel || trigger.textContent;
      trigger.dataset.originalLabel = original;
      trigger.textContent = successLabel || 'Copied';
      setTimeout(() => { trigger.textContent = original; }, 1400);
    }
  } catch (err) {
    if (trigger) {
      const original = trigger.dataset.originalLabel || trigger.textContent;
      trigger.dataset.originalLabel = original;
      trigger.textContent = 'Copy failed';
      setTimeout(() => { trigger.textContent = original; }, 1400);
    }
  }
}

function toggleSection(id, trigger, showLabel, hideLabel) {
  const el = document.getElementById(id);
  if (!el) return;
  const willShow = el.hasAttribute('hidden');
  if (willShow) el.removeAttribute('hidden');
  else el.setAttribute('hidden', '');
  if (trigger) trigger.textContent = willShow ? (hideLabel || 'Hide') : (showLabel || 'Show');
}

// ─── Feature: Integration Snippet Tabs ───
function switchSnippet(id, tab) {
  document.querySelectorAll('.snippet-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.snippet-tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('snippet-' + id);
  if (panel) panel.classList.add('active');
  if (tab) tab.classList.add('active');
}

const SNIPPET_COMMANDS = {
  protect: 'npx protect-mcp --policy allow-read',
  verify: 'npx @veritasacta/verify https://veritasacta.com/api/export/ai-models-2026',
  contribute: 'curl -X POST https://veritasacta.com/api/contribute -H Content-Type:application/json -d ...'
};

function copySnippet(id) {
  var text = SNIPPET_COMMANDS[id] || '';
  if (id === 'contribute') {
    var pre = document.querySelector('#snippet-contribute .snippet-pre');
    if (pre) text = pre.textContent.replace(/^#.*$/gm, '').trim();
  }
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('#snippet-' + id + ' .snippet-copy');
    if (btn) {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    }
  });
}

// ─── Feature: Receipt Anatomy Hover ───
function initReceiptAnatomy() {
  const fields = document.querySelectorAll('.receipt-field');
  const annotation = document.getElementById('receipt-annotation');
  if (!annotation || fields.length === 0) return;

  fields.forEach(field => {
    const handler = () => {
      fields.forEach(f => f.classList.remove('active'));
      field.classList.add('active');
      const label = field.dataset.label || 'field';
      const anno = field.dataset.anno || '';
      annotation.innerHTML = '<div class="receipt-annotation-label">' + label + '</div><div class="receipt-annotation-text">' + anno + '</div>';
    };
    field.addEventListener('mouseenter', handler);
    field.addEventListener('click', handler);
  });
}

// ─── Feature: Live Chain Activity ───
function loadChainActivity() {
  const el = document.getElementById('chain-activity');
  if (!el) return;

  fetch('/api/anchor/latest')
    .then(r => r.json())
    .then(data => {
      if (data.error) return;
      el.style.display = '';
      const ts = data.timestamp ? new Date(data.timestamp) : null;
      const ago = ts ? timeAgoShort(ts) : 'unknown';
      const root = (data.merkle_root || '').slice(0, 12);
      const topics = data.topic_count || '?';
      document.getElementById('chain-activity-text').innerHTML =
        'Last anchor: <strong>' + ago + '</strong> · ' + topics + ' topics verified · Merkle root';
      document.getElementById('chain-activity-hash').textContent = root + '…';
    })
    .catch(() => { /* silent — non-critical */ });
}

function timeAgoShort(date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

// ─── Feature: Verify Page Pre-load ───
function initVerifyPreload() {
  const textarea = document.getElementById('browser-verify-input');
  if (!textarea || textarea.value.trim()) return;

  fetch('/api/anchor/latest')
    .then(r => r.json())
    .then(data => {
      if (data.error) return;
      textarea.value = JSON.stringify(data, null, 2);
      // Auto-run verification after a short delay
      setTimeout(() => {
        if (typeof runBrowserVerify === 'function') runBrowserVerify();
      }, 300);
    })
    .catch(() => {});
}

// ─── Init on page load ───
document.addEventListener('DOMContentLoaded', () => {
  initReceiptAnatomy();
  loadChainActivity();
  initVerifyPreload();
});

function activateTopicFilter(filter, trigger) {
  activeTopicFilter = filter;
  document.querySelectorAll('[data-topic-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.topicFilter === filter);
  });
  filterTopicDirectory();
}

function filterTopicDirectory() {
  const search = (document.getElementById('topic-directory-search')?.value || '').trim().toLowerCase();
  const items = Array.from(document.querySelectorAll('[data-topic-card]'));
  const summary = document.getElementById('topic-directory-summary');
  const empty = document.getElementById('topic-directory-empty');
  let visible = 0;

  for (const item of items) {
    const haystack = item.dataset.search || '';
    const matchesSearch = !search || haystack.includes(search);
    let matchesFilter = true;
    if (activeTopicFilter === 'contested') matchesFilter = Number(item.dataset.contested || '0') > 0;
    if (activeTopicFilter === 'due-soon') matchesFilter = Number(item.dataset.dueSoon || '0') > 0;
    if (activeTopicFilter === 'active') matchesFilter = Number(item.dataset.active || '0') > 0;
    if (activeTopicFilter === 'blindllm') matchesFilter = item.dataset.blindllm === '1';
    item.hidden = !(matchesSearch && matchesFilter);
    if (!item.hidden) visible += 1;
  }

  if (summary) summary.textContent = 'Showing ' + visible + ' of ' + items.length + ' topics';
  if (empty) empty.hidden = visible !== 0;
}

function updateFormFields() {
  const select = document.getElementById('c-type');
  if (!select) return;
  const type = select.value;
  document.querySelectorAll('.type-fields').forEach(el => el.style.display = 'none');
  const fields = document.getElementById(type + '-fields');
  if (fields) fields.style.display = 'block';
  document.querySelectorAll('[data-type-pill]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.typePill === type);
  });
  updateComposerGuidance();
}

function setContributionType(type) {
  const select = document.getElementById('c-type');
  if (!select) return;
  select.value = type;
  updateFormFields();
}

function updateComposerGuidance() {
  const select = document.getElementById('c-type');
  const body = document.getElementById('c-body');
  const guidance = document.getElementById('composer-guidance');
  if (!select || !guidance) return;

  const type = select.value;
  const hasBody = !!(body && body.value.trim());
  const copy = {
    question: {
      title: 'Questions work best when they are narrow and answerable.',
      body: 'State exactly what evidence is missing or what outcome needs resolution. A good question creates a clear lane for evidence and resolution later.'
    },
    claim: {
      title: 'Claims need a burden of support.',
      body: 'Factual claims should include a source or explicit reasoning. Opinion and hypothesis claims should include uncertainty: what you know, what you do not know, and what would change your mind.'
    },
    prediction: {
      title: 'Predictions should be easy to resolve later.',
      body: 'Define a concrete resolution date, explicit criteria, and an authority or rule for who can mark it confirmed, refuted, or unresolvable.'
    }
  };

  const current = copy[type] || copy.question;
  guidance.innerHTML = '<strong>' + escapeHtml(current.title) + '</strong><br>' + escapeHtml(current.body);

  const steps = Array.from(document.querySelectorAll('[data-composer-step]'));
  steps.forEach(step => step.classList.remove('active'));
  if (steps[0]) steps[0].classList.add('active');
  if (steps[1] && hasBody) steps[1].classList.add('active');
  if (steps[2]) steps[2].classList.add('active');
}

function showResponseForm(entryId, formType) {
  document.querySelectorAll('.response-form').forEach(f => f.classList.remove('active'));
  const form = document.getElementById('resp-form-' + entryId);
  if (form) {
    form.classList.add('active');
    const typeSelect = form.querySelector('.resp-type');
    if (typeSelect && formType) typeSelect.value = formType;
    updateResponseFields(form);
  }
}

function updateResponseFields(form) {
  const type = form.querySelector('.resp-type').value;
  form.querySelectorAll('.resp-type-fields').forEach(el => el.style.display = 'none');
  const fields = form.querySelector('.' + type + '-resp-fields');
  if (fields) fields.style.display = 'block';
}

function showResult(el, data, success) {
  if (!el) return;
  el.style.display = 'block';
  el.className = 'result-box ' + (success ? 'success' : 'error');
  el.textContent = JSON.stringify(data, null, 2);
  if (success && data.tokens_remaining !== undefined) {
    budgetTokens = data.tokens_remaining;
    updateBudgetDisplay();
  }
}

function updateBudgetDisplay() {
  const dots = document.querySelectorAll('.budget-dot');
  if (!dots.length || budgetTokens === null) return;
  dots.forEach((dot, i) => {
    dot.className = 'budget-dot' + (i >= budgetTokens ? ' spent' : '');
  });
  const label = document.getElementById('budget-label');
  if (label) label.textContent = budgetTokens + ' tokens remaining';
}

async function verifyTopic() {
  const input = document.getElementById('verify-input');
  const result = document.getElementById('verify-result');
  if (!input || !result) return;
  const topic = input.value.trim().toLowerCase();
  if (!topic) return;

  result.style.display = 'block';
  result.className = 'verify-result show loading';
  result.textContent = 'Verifying chain...';

  try {
    const res = await fetch('/api/verify?topic=' + encodeURIComponent(topic));
    const data = await res.json();
    if (data.error) {
      result.className = 'verify-result show invalid';
      result.textContent = 'Error: ' + data.error;
    } else if (data.valid !== undefined) {
      result.className = 'verify-result show ' + (data.valid ? 'valid' : 'invalid');
      result.textContent = data.valid
        ? 'VALID  ' + data.chain_length + ' entries  head: ' + (data.chain_head_hash || '').slice(0, 20) + '...'
        : 'INVALID  ' + (data.reason || 'chain integrity check failed');
    } else {
      result.className = 'verify-result show valid';
      result.textContent = 'Chain length: ' + (data.chain_length || 0) + '  head: ' + (data.chain_head_hash || 'empty').slice(0, 20) + '...';
    }
  } catch (err) {
    result.className = 'verify-result show invalid';
    result.textContent = 'Network error: ' + err.message;
  }
}

function toggleContributeForm() {
  const el = document.getElementById('contribute-api-section');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function toggleContributeForm2() {
  const form = document.getElementById('contribute-form-section');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function submitContribution(e) {
  e.preventDefault();
  const topicInput = document.getElementById('c-topic');
  const typeInput = document.getElementById('c-type');
  const bodyInput = document.getElementById('c-body');
  if (!topicInput || !typeInput || !bodyInput) return;
  const type = typeInput.value;
  const payload = { body: bodyInput.value };

  if (type === 'claim') {
    payload.category = document.getElementById('c-category').value;
    const src = document.getElementById('c-source')?.value;
    if (src) payload.source = src;
    const unc = document.getElementById('c-uncertainty')?.value;
    if (unc) payload.uncertainty = unc;
    const reasoning = document.getElementById('c-reasoning')?.value;
    if (reasoning) payload.reasoning = reasoning;
  }
  if (type === 'prediction') {
    payload.resolution_criteria = document.getElementById('c-criteria').value;
    const dateVal = document.getElementById('c-date').value;
    payload.resolution_date = dateVal ? new Date(dateVal).toISOString() : '';
    payload.resolution_source = document.getElementById('c-resolution-source').value;
    payload.resolution_rule = document.getElementById('c-resolution-rule').value;
  }

  const resultEl = document.getElementById('contribute-result');
  try {
    const res = await fetch('/api/contribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, topic: topicInput.value, payload }),
    });
    const data = await res.json();
    showResult(resultEl, data, res.ok);
    if (res.ok) setTimeout(() => location.reload(), 1200);
  } catch (err) {
    showResult(resultEl, { error: err.message }, false);
  }
}

async function submitResponse(entryId, topic) {
  const form = document.getElementById('resp-form-' + entryId);
  if (!form) return;
  const type = form.querySelector('.resp-type').value;
  const payload = {
    target_id: entryId,
    body: form.querySelector('.resp-body').value,
  };

  if (type === 'evidence') {
    payload.source = form.querySelector('.resp-source')?.value || '';
    payload.stance = form.querySelector('.resp-stance')?.value || 'supporting';
  }
  if (type === 'challenge') {
    payload.target_assertion = form.querySelector('.resp-target-assertion')?.value || '';
    payload.basis = form.querySelector('.resp-basis')?.value || '';
    payload.argument = form.querySelector('.resp-argument')?.value || '';
    const src = form.querySelector('.resp-challenge-source')?.value;
    if (src) payload.source = src;
  }
  if (type === 'update') {
    payload.update_type = form.querySelector('.resp-update-type')?.value || '';
  }
  if (type === 'resolution') {
    payload.outcome = form.querySelector('.resp-outcome')?.value || '';
    payload.source = form.querySelector('.resp-resolution-source')?.value || '';
    payload.resolution_type = form.querySelector('.resp-resolution-type')?.value || '';
  }

  const resultEl = form.querySelector('.resp-result');
  try {
    const res = await fetch('/api/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, topic, payload }),
    });
    const data = await res.json();
    showResult(resultEl, data, res.ok);
    if (res.ok) setTimeout(() => location.reload(), 1200);
  } catch (err) {
    showResult(resultEl, { error: err.message }, false);
  }
}

function sortKeysDeepClient(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortKeysDeepClient);
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = sortKeysDeepClient(obj[key]);
    return acc;
  }, {});
}

function jcsSerializeClient(obj) {
  return JSON.stringify(sortKeysDeepClient(obj));
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const clean = String(hex || '').trim().replace(/^0x/, '');
  if (!clean || clean.length % 2 !== 0) throw new Error('Invalid hex input');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  return bytes;
}

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest));
}

async function jcsSha256Hex(obj) {
  return sha256Hex(jcsSerializeClient(obj));
}

async function computeMerkleRootClient(chainHeads) {
  const sorted = [...chainHeads].sort((a, b) => String(a.topic || '').localeCompare(String(b.topic || '')));
  let layer = [];
  for (const head of sorted) layer.push(await sha256Hex(jcsSerializeClient(head)));
  if (layer.length === 0) return '0'.repeat(64);
  if (layer.length === 1) return layer[0];
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) next.push(await sha256Hex(layer[i] + layer[i + 1]));
      else next.push(layer[i]);
    }
    layer = next;
  }
  return layer[0];
}

async function verifyExportClient(data) {
  const entries = Array.isArray(data.entries) ? data.entries : [];
  if (!entries.length) {
    return {
      status: 'valid',
      summary: 'Valid empty topic export',
      facts: [
        ['Topic', data.topic || 'unknown'],
        ['Entries', '0'],
        ['Chain head', 'empty']
      ],
      detail: JSON.stringify({ topic: data.topic || null, entries: 0, errors: [] }, null, 2)
    };
  }

  const errors = [];
  let expectedPrevHash = '0'.repeat(64);
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry.prev_hash !== expectedPrevHash) {
      errors.push({ index: i, type: 'prev_hash_mismatch', expected: expectedPrevHash, actual: entry.prev_hash });
    }

    if (!entry.tombstone && entry.payload !== null && entry.payload !== undefined) {
      const payloadHash = await jcsSha256Hex(entry.payload);
      if (payloadHash !== entry.payload_hash) {
        errors.push({ index: i, type: 'payload_hash_mismatch', expected: payloadHash, actual: entry.payload_hash });
      }
    }

    const authorHash = await jcsSha256Hex(entry.author || {});
    const envelope = {
      author_hash: authorHash,
      payload_hash: entry.payload_hash,
      prev_hash: entry.prev_hash,
      subtype: entry.subtype,
      timestamp: entry.timestamp,
      topic: entry.topic,
      type: entry.type
    };
    const entryHash = await jcsSha256Hex(envelope);
    if (entryHash !== entry.entry_hash) {
      errors.push({ index: i, type: 'entry_hash_mismatch', expected: entryHash, actual: entry.entry_hash });
    }
    expectedPrevHash = entry.entry_hash;
  }

  if (data.chain_head?.chain_head_hash && data.chain_head.chain_head_hash !== expectedPrevHash) {
    errors.push({ type: 'chain_head_mismatch', expected: expectedPrevHash, actual: data.chain_head.chain_head_hash });
  }

  return {
    status: errors.length ? 'invalid' : 'valid',
    summary: (errors.length ? 'Invalid' : 'Valid') + ' topic export for ' + (data.topic || 'unknown topic'),
    facts: [
      ['Topic', data.topic || 'unknown'],
      ['Entries', String(entries.length)],
      ['Errors', String(errors.length)],
      ['Head', expectedPrevHash.slice(0, 16) + '...']
    ],
    detail: JSON.stringify({ topic: data.topic || null, errors }, null, 2)
  };
}

async function verifyAnchorClient(anchor) {
  const payload = {
    chain_heads: anchor.chain_heads,
    merkle_root: anchor.merkle_root,
    policy_hash: anchor.policy_hash,
    protocol_spec_hash: anchor.protocol_spec_hash,
    public_key: anchor.public_key,
    public_key_fingerprint: anchor.public_key_fingerprint,
    timestamp: anchor.timestamp,
    topic_count: anchor.topic_count,
    charter_hash: anchor.charter_hash
  };

  let merkleValid = true;
  if (Array.isArray(anchor.chain_heads)) {
    const recomputedRoot = await computeMerkleRootClient(anchor.chain_heads);
    merkleValid = recomputedRoot === anchor.merkle_root;
  }

  let signatureValid = null;
  let warning = '';
  try {
    const key = await crypto.subtle.importKey('raw', hexToBytes(anchor.public_key), { name: 'Ed25519' }, false, ['verify']);
    signatureValid = await crypto.subtle.verify({ name: 'Ed25519' }, key, hexToBytes(anchor.signature), new TextEncoder().encode(jcsSerializeClient(payload)));
  } catch (err) {
    warning = 'This browser cannot complete Ed25519 verification directly. Merkle and payload checks still ran locally.';
  }

  const valid = merkleValid && (signatureValid === true || signatureValid === null);
  return {
    status: valid ? (signatureValid === true ? 'valid' : 'partial') : 'invalid',
    summary: (valid ? 'Anchor checked' : 'Anchor invalid') + ' for ' + (anchor.timestamp || 'unknown time'),
    facts: [
      ['Topic count', String(anchor.topic_count || 0)],
      ['Merkle root', (anchor.merkle_root || '').slice(0, 16) + '...'],
      ['Merkle', merkleValid ? 'valid' : 'invalid'],
      ['Signature', signatureValid === null ? 'browser unsupported' : (signatureValid ? 'valid' : 'invalid')]
    ],
    detail: JSON.stringify({ merkle_valid: merkleValid, signature_valid: signatureValid, warning }, null, 2)
  };
}

function verifyManifestClient(manifest) {
  const required = ['protocol', 'version', 'charter_hash', 'protocol_spec_hash', 'policy_hash', 'endpoints'];
  const missing = required.filter(key => manifest[key] === undefined || manifest[key] === null);
  const status = missing.length ? 'invalid' : 'partial';
  return {
    status,
    summary: missing.length ? 'Manifest is missing required fields' : 'Manifest shape looks valid',
    facts: [
      ['Protocol', manifest.protocol || 'unknown'],
      ['Version', manifest.version || 'unknown'],
      ['Charter hash', (manifest.charter_hash || '').slice(0, 16) + '...'],
      ['Endpoints', String(Object.keys(manifest.endpoints || {}).length)]
    ],
    detail: JSON.stringify({
      missing,
      note: 'Manifest checks published identity and endpoint structure. It does not prove runtime behavioral conformance.'
    }, null, 2)
  };
}

function classifyVerifyPayload(payload) {
  if (payload && Array.isArray(payload.entries) && payload.topic) return 'export';
  if (payload && payload.merkle_root && payload.signature && payload.public_key) return 'anchor';
  if (payload && (payload.protocol === 'acta' || payload.charter_hash || payload.protocol_spec_hash)) return 'manifest';
  return 'unknown';
}

function renderBrowserVerifyOutput(report) {
  const output = document.getElementById('browser-verify-output');
  if (!output) return;
  browserVerifyLastSummary = report.summary;
  const facts = (report.facts || []).map(([label, value]) =>
    '<div class="verify-fact"><div class="verify-fact-label">' + escapeHtml(label) + '</div><div class="verify-fact-value">' + escapeHtml(value) + '</div></div>'
  ).join('');
  output.className = 'verify-output ' + report.status;
  output.innerHTML =
    '<div class="verify-status">' + escapeHtml(report.summary) + '</div>' +
    (report.note ? '<div class="inline-note" style="margin-bottom:10px;">' + escapeHtml(report.note) + '</div>' : '') +
    '<div class="verify-facts">' + facts + '</div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">' +
      '<button class="mini-btn" onclick="copyText(browserVerifyLastSummary, this, \\'Copied\\')">Copy summary</button>' +
    '</div>' +
    '<pre class="verify-pre">' + escapeHtml(report.detail || '') + '</pre>';
  output.removeAttribute('hidden');
  output.style.display = 'block';
}

async function runBrowserVerify() {
  const input = document.getElementById('browser-verify-input');
  if (!input) return;
  let payload;
  try {
    payload = JSON.parse(input.value);
  } catch (err) {
    renderBrowserVerifyOutput({
      status: 'invalid',
      summary: 'Input is not valid JSON',
      facts: [['Parser', 'failed']],
      detail: String(err.message || err)
    });
    return;
  }

  const kind = classifyVerifyPayload(payload);
  if (kind === 'export') {
    renderBrowserVerifyOutput(await verifyExportClient(payload));
    return;
  }
  if (kind === 'anchor') {
    renderBrowserVerifyOutput(await verifyAnchorClient(payload));
    return;
  }
  if (kind === 'manifest') {
    renderBrowserVerifyOutput(verifyManifestClient(payload));
    return;
  }
  renderBrowserVerifyOutput({
    status: 'invalid',
    summary: 'Unrecognized JSON shape',
    facts: [['Detected', 'unknown']],
    detail: 'Paste a topic export, signed anchor, or instance manifest JSON document.'
  });
}

async function loadVerifyUrlIntoLab() {
  const urlInput = document.getElementById('browser-verify-url');
  const textInput = document.getElementById('browser-verify-input');
  if (!urlInput || !textInput) return;
  const url = urlInput.value.trim();
  if (!url) return;
  try {
    const res = await fetch(url);
    const text = await res.text();
    textInput.value = text;
    await runBrowserVerify();
  } catch (err) {
    renderBrowserVerifyOutput({
      status: 'invalid',
      summary: 'Failed to fetch URL',
      facts: [['Fetch', 'failed']],
      detail: String(err.message || err)
    });
  }
}

async function loadVerifySample(kind) {
  const map = {
    manifest: '/.well-known/acta-instance.json',
    anchor: '/api/anchor/latest'
  };
  const url = map[kind];
  if (!url) return;
  const urlInput = document.getElementById('browser-verify-url');
  if (urlInput) urlInput.value = url;
  await loadVerifyUrlIntoLab();
}

async function handleVerifyFile(event) {
  const file = event.target.files && event.target.files[0];
  const input = document.getElementById('browser-verify-input');
  if (!file || !input) return;
  input.value = await file.text();
  await runBrowserVerify();
}

document.addEventListener('DOMContentLoaded', function() {
  updateFormFields();
  filterTopicDirectory();
  const verifyFile = document.getElementById('browser-verify-file');
  if (verifyFile) verifyFile.addEventListener('change', handleVerifyFile);
  const bodyInput = document.getElementById('c-body');
  if (bodyInput) bodyInput.addEventListener('input', updateComposerGuidance);
});
`;

// ── Layout ──────────────────────────────────────────────────────────

function layout(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Veritas Acta — Contestable Public Record</title>
  <meta name="description" content="A contestable, checkable public record for humans and AI. Typed contributions, structured challenges, hash-chained ledger, independent verification.">
  <meta property="og:title" content="Veritas Acta — Open Evidence Protocol for Machine Decisions">
  <meta property="og:description" content="Open protocol for verifiable machine decision evidence. Ed25519-signed receipts, selective disclosure, causal DAGs. MIT-licensed verifier. IETF Internet-Draft published.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://veritasacta.com">
  <meta property="og:image" content="https://www.scopeblind.com/og-card.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Veritas Acta — Open Evidence Protocol for Machine Decisions">
  <meta name="twitter:description" content="Open protocol for verifiable machine decision evidence. Ed25519-signed receipts, selective disclosure, causal DAGs. MIT-licensed verifier.">
  <meta name="twitter:image" content="https://www.scopeblind.com/og-card.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='4' fill='%2318181b'/%3E%3Ctext x='16' y='23' text-anchor='middle' fill='%23d4d4d8' font-family='Georgia,serif' font-size='16' font-weight='bold' letter-spacing='1'%3EVA%3C/text%3E%3C/svg%3E">
  <style>${CSS}</style>
</head>
<body>
  <div class="trust-bar">
    <div><span class="tb-label">PROTOCOL</span> <a href="/docs" class="tb-value" style="color:var(--panel-text);text-decoration:none;" title="View protocol documentation">v1.0.0</a></div>
    <div><span class="tb-label">CHARTER</span> <a href="/.well-known/acta-instance.json" class="tb-value" style="color:var(--panel-text);text-decoration:none;cursor:pointer;" title="View manifest — click to verify charter hash" onclick="event.preventDefault();navigator.clipboard.writeText('3a0f734d87d5d156e550df1361988c398190e72eea40144af8c28379ab5727d9');this.textContent='copied!';setTimeout(()=>this.textContent='3a0f734d...27d9',1500);">3a0f734d...27d9</a></div>
    <div><span class="tb-label">INSTANCE</span> <span class="tb-status"></span><a href="/.well-known/acta-instance.json" class="tb-value" style="color:var(--panel-text);text-decoration:none;" title="View instance manifest">veritasacta.com</a></div>
  </div>
  <header>
    <div class="container">
      <a href="/" class="logo">
        <span class="logo-mark">VA</span>
        <span class="logo-text">Veritas Acta</span>
      </a>
      <nav>
        <a href="/">Feed</a>
        <a href="/about">Charter</a>
        <a href="/moderation-log">Moderation</a>
        <a href="/docs">Docs</a>
        <a href="/verify">Verify</a>
        <a href="https://github.com/VeritasActa/acta" target="_blank">GitHub</a>
      </nav>
    </div>
  </header>
  ${body}
  <footer>
    <div class="container">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;text-align:left;margin-bottom:32px;">
        <div>
          <div style="font-family:var(--brand);font-size:16px;font-weight:700;letter-spacing:0.06em;margin-bottom:12px;color:var(--text);">Veritas Acta</div>
          <p style="font-size:12px;color:var(--text-dim);line-height:1.6;max-width:220px;">An open evidence format for structured, signed, independently verifiable records. For humans and AI agents.</p>
        </div>
        <div>
          <div style="font-family:var(--mono);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-dim);margin-bottom:12px;">Ecosystem</div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
            <a href="https://scopeblind.com" target="_blank" style="color:var(--text-muted);">ScopeBlind</a>
            <a href="https://blindllm.com" target="_blank" style="color:var(--text-muted);">BlindLLM</a>
            <a href="https://github.com/VeritasActa/acta" target="_blank" style="color:var(--text-muted);">GitHub</a>
            <a href="https://www.npmjs.com/package/@veritasacta/verify" target="_blank" style="color:var(--text-muted);">@veritasacta/verify</a>
          </div>
        </div>
        <div>
          <div style="font-family:var(--mono);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-dim);margin-bottom:12px;">Verification</div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
            <a href="/verify" style="color:var(--text-muted);">Browser Verifier</a>
            <a href="/about" style="color:var(--text-muted);">Charter &amp; Invariants</a>
            <a href="/docs" style="color:var(--text-muted);">Protocol Docs</a>
            <a href="https://github.com/tomjwxf/ScopeBlindD2/blob/main/specs/draft-farley-acta-signed-receipts-00.md" target="_blank" style="color:var(--text-muted);">IETF Draft</a>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <span style="font-size:12px;color:var(--text-dim);">&copy; ${new Date().getFullYear()} Veritas Acta. Open protocol. <a href="https://github.com/VeritasActa/Acta/blob/main/CHARTER.md" style="color:var(--text-muted);">Charter-bound</a>.</span>
        <a href="#" style="font-size:11px;font-family:var(--mono);color:var(--text-dim);text-transform:uppercase;letter-spacing:0.04em;">Back to top &uarr;</a>
      </div>
    </div>
  </footer>
  <script>${CLIENT_JS}</script>
</body>
</html>`;
}

// ── Pages ───────────────────────────────────────────────────────────

function describeBlindllmTopic(topic) {
  if (typeof topic !== 'string') {
    return {
      label: 'BlindLLM evidence',
      body: 'Signed receipts and published artifacts from BlindLLM.',
    };
  }

  if (topic.includes('debate')) {
    return {
      label: 'Formal debates',
      body: 'Round hashes, signed debate receipts, and published judged outcomes from BlindLLM debates.',
    };
  }

  if (topic.includes('arena')) {
    return {
      label: 'Arena battles',
      body: 'Blind battle receipts, manifest-backed agent records, and leaderboard-linked public battle evidence.',
    };
  }

  return {
    label: 'BlindLLM evidence',
    body: 'Battle receipts, debate artifacts, and signed evidence published from BlindLLM.',
  };
}

function homePage(data) {
  const topics = data.topics || [];
  const anchor = data.anchor || null;
  const anchorPublicKey = data.anchorPublicKey || null;
  const featured = data.featuredRecord || null;
  const rawPredictions = data.predictions || [];
  const topicInsights = data.topicInsights || {};
  const blindllmTopics = topics.filter(t => typeof t.topic === 'string' && t.topic.startsWith('blindllm-'));

  // Deduplicate predictions with identical body text (keep the first)
  const seenBodies = new Set();
  const predictions = rawPredictions.filter(p => {
    const body = (p.payload?.body || p.body_preview || '').trim();
    if (seenBodies.has(body)) return false;
    seenBodies.add(body);
    return true;
  });

  const topicsList = topics.length > 0
    ? topics.map(t => {
        const insight = topicInsights[t.topic] || {};
        const lastActivityAt = insight.last_activity_at || t.last_entry_at;
        const isActive = !!(lastActivityAt && (Date.now() - new Date(lastActivityAt).getTime()) < (3 * 86400000));
        const summaryParts = [];
        if (insight.contested_count) summaryParts.push(insight.contested_count + ' contested');
        if (insight.awaiting_resolution_count) summaryParts.push(insight.awaiting_resolution_count + ' awaiting resolution');
        if (insight.prediction_count) summaryParts.push(insight.prediction_count + ' predictions');
        if (insight.response_count) summaryParts.push(insight.response_count + ' responses');
        const summaryText = summaryParts.length ? summaryParts.join(' · ') : 'Browse the topic ledger, inspect claims, and contribute evidence or challenges.';
        return `
        <a href="/topic/${encodeURIComponent(t.topic)}" style="text-decoration:none;color:inherit;">
          <div class="topic-item" data-topic-card data-search="${esc((t.topic + ' ' + summaryText).toLowerCase())}" data-contested="${insight.contested_count || 0}" data-due-soon="${insight.due_soon_count || 0}" data-active="${isActive ? 1 : 0}" data-blindllm="${t.topic.startsWith('blindllm-') ? 1 : 0}">
            <div class="topic-item-main">
              <div class="topic-kickers">
                ${insight.contested_count ? `<span class="badge badge-contested">${insight.contested_count} contested</span>` : ''}
                ${insight.due_soon_count ? `<span class="badge badge-awaiting_resolution">${insight.due_soon_count} due soon</span>` : ''}
                ${t.topic.startsWith('blindllm-') ? `<span class="badge badge-verified">BlindLLM</span>` : ''}
              </div>
              <span class="topic-name">${esc(t.topic)}</span>
              <span class="topic-summary-line">${esc(summaryText)}</span>
            </div>
            <div class="topic-stat-stack">
              <span class="topic-stats">${t.entry_count} entries · ${timeAgo(t.last_entry_at)}</span>
              <span class="topic-stat-emphasis">${isActive ? 'active now' : 'last activity ' + esc(timeAgo(lastActivityAt || t.last_entry_at))}</span>
            </div>
          </div>
        </a>`;
      }).join('')
    : `<div class="empty"><h3>No topics yet</h3><p>Contribute via the API below, or use the web form.</p></div>`;

  const totalEntries = topics.reduce((sum, t) => sum + (t.entry_count || 0), 0);

  return layout('Public Record', `
    <main class="container">
      <div class="hero">
        <div class="hero-eyebrow"><span class="dot"></span> Open Evidence Protocol</div>
        <h1>The evidence layer for<br><span class="hero-accent">AI accountability.</span></h1>
        <p>When the platform that made the decision also controls the evidence, the evidence is worthless. Acta is an open protocol for structured, signed, independently verifiable records — designed so that no single entity can rewrite history.</p>
        <div class="hero-actions">
          <a href="#topic-directory" class="hero-action-card" onclick="activateTopicFilter('contested', this)" style="border-left:3px solid var(--blue);">
            <div class="hero-action-kicker" style="color:var(--blue);">Explore</div>
            <div class="hero-action-title">Browse contested records</div>
            <div class="hero-action-body">Jump to the parts of the record where evidence, challenges, and resolution pressure already exist.</div>
          </a>
          <a href="/verify" class="hero-action-card" style="border-left:3px solid var(--link);">
            <div class="hero-action-kicker" style="color:var(--link);">Verify</div>
            <div class="hero-action-title">Check a receipt or chain</div>
            <div class="hero-action-body">Paste a signed receipt into the browser verifier — or run <code>npx @veritasacta/verify</code> for offline proof.</div>
          </a>
          <a href="#contribute-section" class="hero-action-card" style="border-left:3px solid var(--purple);">
            <div class="hero-action-kicker" style="color:var(--purple);">Contribute</div>
            <div class="hero-action-title">Add evidence or a challenge</div>
            <div class="hero-action-body">Submit via the web form, REST API, or MCP server. The composer guides you to the right contribution type.</div>
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><span class="hero-stat-value">${topics.length}</span><span class="hero-stat-label">topics</span></div>
          <div class="hero-stat"><span class="hero-stat-value">${totalEntries}</span><span class="hero-stat-label">entries</span></div>
          <div class="hero-stat"><span class="hero-stat-value">${predictions.length}</span><span class="hero-stat-label">predictions tracked</span></div>
        </div>
        <div style="margin-top:16px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
          <a href="https://github.com/tomjwxf/ScopeBlindD2/blob/main/specs/draft-farley-acta-signed-receipts-00.md" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:var(--surface);border:1px solid var(--border);border-radius:999px;font-family:var(--mono);font-size:11px;color:var(--text-muted);">
            <span style="color:var(--amber);font-weight:600;">SPEC</span> draft-farley-acta-signed-receipts-00
          </a>
          <a href="https://www.npmjs.com/package/@veritasacta/verify" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:var(--surface);border:1px solid var(--border);border-radius:999px;font-family:var(--mono);font-size:11px;color:var(--text-muted);">
            <span style="font-weight:600;">MIT</span> @veritasacta/verify
          </a>
        </div>
      </div>

      <div id="chain-activity" class="chain-activity" style="display:none;">
        <div class="chain-activity-dot"></div>
        <div class="chain-activity-text" id="chain-activity-text">Loading chain status\u2026</div>
        <span class="chain-activity-hash" id="chain-activity-hash"></span>
      </div>

      <div class="snippet-section">
        <div class="section-header" style="margin-top:0;">Get Started in 30 Seconds</div>
        <p class="section-subhead">Copy one line. Run it. See Acta working.</p>
        <div class="snippet-tabs">
          <button class="snippet-tab active" onclick="switchSnippet('protect', this)">Protect</button>
          <button class="snippet-tab" onclick="switchSnippet('verify', this)">Verify</button>
          <button class="snippet-tab" onclick="switchSnippet('contribute', this)">Contribute</button>
        </div>
        <div id="snippet-protect" class="snippet-panel active">
          <button class="snippet-copy" onclick="copySnippet('protect')">Copy</button>
          <pre class="snippet-pre"><span class="cmd-comment"># Wrap any MCP server with per-tool access control</span>
npx <span class="cmd-highlight">protect-mcp</span> --policy allow-read

<span class="cmd-comment"># Every tool call produces a signed Acta receipt</span>
<span class="cmd-comment"># Portable, independently verifiable, no account needed</span></pre>
          <p class="snippet-desc">Wraps your MCP server with ScopeBlind policies. Every decision \u2014 allow, deny, scope reduction \u2014 becomes a signed receipt on the Acta chain.</p>
        </div>
        <div id="snippet-verify" class="snippet-panel">
          <button class="snippet-copy" onclick="copySnippet('verify')">Copy</button>
          <pre class="snippet-pre"><span class="cmd-comment"># Verify a topic chain offline (zero trust in operator)</span>
npx <span class="cmd-highlight">@veritasacta/verify</span> https://veritasacta.com/api/export/ai-models-2026

<span class="cmd-comment"># Or export and verify locally</span>
curl https://veritasacta.com/api/export/{topic} > chain.json
node tools/verify.js chain.json</pre>
          <p class="snippet-desc">Recomputes every JCS-SHA256 hash, verifies chain linkage, and checks Ed25519 anchor signatures. No dependencies on operator code.</p>
        </div>
        <div id="snippet-contribute" class="snippet-panel">
          <button class="snippet-copy" onclick="copySnippet('contribute')">Copy</button>
          <pre class="snippet-pre"><span class="cmd-comment"># Submit a prediction via the REST API</span>
curl -X POST https://veritasacta.com/api/contribute \\
  -H <span class="cmd-highlight">"Content-Type: application/json"</span> \\
  -d '{"type":"prediction","topic":"your-topic",
       "payload":{"body":"Your prediction here",
                  "resolution_date":"2026-06-01",
                  "oracle":"Public data source"}}'</pre>
          <p class="snippet-desc">Every contribution is typed, hash-chained, and independently verifiable. Predictions require resolution criteria, a date, and an explicit oracle.</p>
        </div>
      </div>

      ${predictions.length > 0 ? `
      <div class="section-header" style="margin-top:0;">Predictions</div>
      <p class="section-subhead">Each prediction has resolution criteria, a date, and an explicit oracle. Evidence and challenges accumulate. The record is hash-chained and independently verifiable.</p>
      ${predictions.map(p => {
        const state = p.computed_state || p.state || 'open';
        const resDate = p.payload?.resolution_date;
        const daysUntil = resDate ? Math.ceil((new Date(resDate) - Date.now()) / 86400000) : null;
        const resolveLabel = daysUntil !== null
          ? (daysUntil < 0 ? 'past due' : daysUntil === 0 ? 'due today' : daysUntil + 'd remaining')
          : '';
        return `
        <a href="/topic/${encodeURIComponent(p.topic)}" class="prediction-card">
          <div class="prediction-header">
            <span class="badge badge-prediction">prediction</span>
            <span class="badge badge-${state}">${state}</span>
            ${renderIdentityBadge(p.author)}
          </div>
          <div class="prediction-body">${esc((p.payload?.body || p.body_preview || '').slice(0, 280))}${(p.payload?.body || '').length > 280 ? '\u2026' : ''}</div>
          <div class="prediction-meta">
            <span>${esc(p.topic)}</span>
            ${resDate ? `<span class="prediction-resolve">\u25F7 ${resDate}${resolveLabel ? ' \u00b7 ' + resolveLabel : ''}</span>` : ''}
            ${p.response_count ? `<span>${p.response_count} response${p.response_count !== 1 ? 's' : ''}</span>` : ''}
          </div>
        </a>`;
      }).join('')}
      ` : ''}

      <div class="section-header">${predictions.length > 0 ? 'Topic Directory' : 'The Record'}</div>
      ${featured ? `
      <div class="featured-record">
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:14px;line-height:1.5;">A claim was made. A challenge cited a specific basis. The record moved to <span style="font-weight:600;color:var(--amber);">contested</span> — visible to everyone, removable by no one.</p>
        <div class="featured-label">Featured \u00b7 contested ${esc(featured.contribution.subtype)} in ${esc(featured.topic)}</div>
        <div class="featured-card">
          <div>
            <span class="badge badge-${featured.contribution.subtype}">${featured.contribution.subtype}</span>
            <span class="badge badge-contested">contested</span>
            ${renderIdentityBadge(featured.contribution.author)}
          </div>
          <div class="featured-body">${esc(featured.contribution.payload?.body || featured.contribution.body_preview || '')}</div>
          ${featured.responses.filter(r => r.subtype === 'challenge').map(ch => `
            <div class="featured-challenge">
              <span class="badge badge-challenge">challenge</span>
              <span style="font-size:11px;color:var(--red);margin-left:6px;">basis: ${esc(ch.payload?.basis || '')}</span>
              <div class="featured-challenge-body">${esc(ch.payload?.body || ch.body_preview || '')}</div>
              ${ch.payload?.argument ? `<div style="font-size:12px;color:var(--text-dim);line-height:1.5;margin-top:6px;">${esc((ch.payload.argument || '').slice(0, 200))}${(ch.payload.argument || '').length > 200 ? '...' : ''}</div>` : ''}
            </div>
          `).join('')}
          <div class="featured-meta">
            #${featured.contribution.sequence != null ? featured.contribution.sequence : '?'} in ${esc(featured.topic)} \u00b7 ${featured.responses.length} response${featured.responses.length !== 1 ? 's' : ''} \u00b7 chain-verified
          </div>
          <a href="/topic/${encodeURIComponent(featured.topic)}" class="featured-cta">View full thread \u2192</a>
        </div>
      </div>
      ` : ''}
      <div id="topic-directory" class="topic-directory-controls">
        <input id="topic-directory-search" class="topic-directory-search" type="text" placeholder="Filter topics by name or signal…" oninput="filterTopicDirectory()">
        <div class="topic-filter-row">
          <button class="filter-chip active" data-topic-filter="all" onclick="activateTopicFilter('all', this)">All topics</button>
          <button class="filter-chip" data-topic-filter="contested" onclick="activateTopicFilter('contested', this)">Contested</button>
          <button class="filter-chip" data-topic-filter="due-soon" onclick="activateTopicFilter('due-soon', this)">Due soon</button>
          <button class="filter-chip" data-topic-filter="active" onclick="activateTopicFilter('active', this)">Recently active</button>
          <button class="filter-chip" data-topic-filter="blindllm" onclick="activateTopicFilter('blindllm', this)">BlindLLM</button>
        </div>
        <div id="topic-directory-summary" class="directory-summary">Showing ${topics.length} of ${topics.length} topics</div>
      </div>
      <div class="topic-directory-grid">
        ${topicsList}
        <div id="topic-directory-empty" class="discovery-empty" hidden>No topics match the current filter. Try clearing the search or switching back to all topics.</div>
      </div>

      <div class="section-header">Trust Surface</div>

      <div class="instance-panel">
        <div class="instance-panel-header">
          <div class="instance-panel-title">veritasacta.com</div>
          <div class="instance-panel-url"><a href="/.well-known/acta-instance.json" style="color:var(--panel-text-dim);">/.well-known/acta-instance.json</a></div>
        </div>
        <div class="instance-row">
          <span class="ir-label">Topics</span>
          <span class="ir-value">${topics.length}</span>
        </div>
        <div class="instance-row">
          <span class="ir-label">Total Entries</span>
          <span class="ir-value">${totalEntries}</span>
        </div>
        <div class="instance-row">
          <span class="ir-label">Latest Anchor</span>
          <span class="ir-value ${anchor ? 'active' : 'none'}">${anchor ? anchor.timestamp + ' · Merkle root: ' + (anchor.merkle_root || '').slice(0, 16) + '...' : 'Pending — first anchor at next UTC midnight'}</span>
        </div>
        <div class="instance-row">
          <span class="ir-label">Signing Key</span>
          <span class="ir-value ${anchorPublicKey ? '' : 'none'}">${anchorPublicKey ? anchorPublicKey.slice(0, 24) + '...' : 'Not configured'}</span>
        </div>
        <div class="instance-row">
          <span class="ir-label">External Witness</span>
          <span class="ir-value active"><a href="https://bsky.app/profile/veritasacta.bsky.social" target="_blank" style="color:var(--panel-text-bright);">@veritasacta.bsky.social</a></span>
        </div>
        ${data.latestWitness?.post_url ? `
        <div class="instance-row">
          <span class="ir-label">Latest Witness Post</span>
          <span class="ir-value active"><a href="${esc(data.latestWitness.post_url)}" target="_blank" style="color:var(--panel-text-bright);">Bluesky post · ${esc(data.latestWitness.witnessed_at || '')}</a></span>
        </div>` : ''}

        <div class="verifier-section" style="margin-top:20px;margin-bottom:0;">
          <div style="color:var(--panel-text-dim);font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Check topic integrity</div>
          <div style="color:var(--panel-text-dim);font-size:11px;margin-bottom:10px;">Operator-served check. For independent verification, export the chain and run <a href="https://github.com/VeritasActa/acta/blob/main/tools/verify.js" style="color:var(--panel-text-bright);font-family:var(--mono);">verify.js</a> offline. <a href="/verify" style="color:var(--panel-text-bright);">Full verification guide →</a></div>
          <div class="verifier-input-row">
            <input type="text" id="verify-input" placeholder="Enter topic name..." onkeydown="if(event.key==='Enter')verifyTopic()">
            <button onclick="verifyTopic()">Check</button>
          </div>
          <div class="verify-result" id="verify-result"></div>
        </div>

        <div class="instance-commands">
          <pre><span class="cmd-comment"># Independent verification (no trust in operator)</span>
curl https://veritasacta.com/api/export/{topic} > chain.json
node tools/verify.js chain.json</pre>
        </div>
      </div>

      ${blindllmTopics.length > 0 ? `
      <div class="section-header">Live Deployments</div>
      <div class="live-deployment-card">
        <p>BlindLLM publishes battle receipts, debate artifacts, and leaderboard snapshots into Acta. It is a live example of the protocol being used as a public evidence surface rather than a static marketing site.</p>
        <div style="display:grid;gap:10px;">
          ${blindllmTopics.slice(0, 4).map(t => {
            const meta = describeBlindllmTopic(t.topic);
            return `
            <a href="/topic/${encodeURIComponent(t.topic)}" style="text-decoration:none;color:inherit;">
              <div class="topic-item">
                <div class="topic-item-main">
                  <div class="topic-kickers">
                    <span class="badge badge-verified">BlindLLM</span>
                    <span class="badge badge-open">${esc(meta.label)}</span>
                  </div>
                  <span class="topic-name">${esc(t.topic)}</span>
                  <span class="topic-summary-line">${esc(meta.body)}</span>
                </div>
                <div class="topic-stat-stack">
                  <span class="topic-stats">${t.entry_count} entries · ${timeAgo(t.last_entry_at)}</span>
                </div>
              </div>
            </a>`;
          }).join('')}
        </div>
      </div>
      ` : ''}

      <div class="section-header">Receipt Anatomy</div>
      <p class="section-subhead">Hover over any field to see what it does. This is what a real Acta receipt looks like.</p>
      <div class="receipt-anatomy" style="margin-bottom:56px;">
        <div class="receipt-anatomy-header">
          <span class="receipt-anatomy-title">Acta Signed Receipt</span>
          <span class="receipt-anatomy-badge" style="background:var(--blue-dim);color:var(--blue);">LIVE EXAMPLE</span>
        </div>
        <div class="receipt-json">
{<br>
  <span class="receipt-field" data-anno="Unique identifier for this entry in the chain. Used to link responses, challenges, and evidence to specific contributions." data-label="entry_id"><span class="receipt-key">"entry_id"</span>: <span class="receipt-str">"a7f3c1d2-8e4b-4f9a-b6c1-2d3e4f5a6b7c"</span></span>,<br>
  <span class="receipt-field" data-anno="JCS-canonicalized SHA-256 hash of this entry's content. Proves the entry hasn't been modified since creation. Recomputable by anyone." data-label="entry_hash"><span class="receipt-key">"entry_hash"</span>: <span class="receipt-str">"e3b0c44298fc1c14..."</span></span>,<br>
  <span class="receipt-field" data-anno="SHA-256 hash of the previous entry in this topic's chain. Creates an immutable linked sequence — if any earlier entry is altered, all subsequent hashes break." data-label="prev_hash"><span class="receipt-key">"prev_hash"</span>: <span class="receipt-str">"d4a06a1b2c3d4e5f..."</span></span>,<br>
  <span class="receipt-field" data-anno="Position in the topic chain. Monotonically increasing. Combined with prev_hash, proves complete ordering of all entries." data-label="sequence"><span class="receipt-key">"sequence"</span>: <span class="receipt-num">7</span></span>,<br>
  <span class="receipt-field" data-anno="ISO 8601 timestamp recorded by the operator. External witnesses (Bluesky posts) provide independent time anchoring." data-label="timestamp"><span class="receipt-key">"timestamp"</span>: <span class="receipt-str">"2026-03-26T04:39:28.878Z"</span></span>,<br>
  <span class="receipt-field" data-anno="Contribution type determines the evidence burden. 'prediction' requires resolution_date, oracle, and falsifiable criteria per Charter Invariant 1." data-label="type"><span class="receipt-key">"type"</span>: <span class="receipt-str">"contribution"</span>, <span class="receipt-key">"subtype"</span>: <span class="receipt-str">"prediction"</span></span>,<br>
  <span class="receipt-field" data-anno="Per-topic pseudonym derived via VOPRF (Verifiable Oblivious Pseudorandom Function). Unlinkable across topics — the same person gets different pseudonyms in different topics." data-label="author"><span class="receipt-key">"author"</span>: { <span class="receipt-key">"type"</span>: <span class="receipt-str">"human"</span>, <span class="receipt-key">"topic_pseudonym"</span>: <span class="receipt-str">"h_7x3k"</span> }</span>,<br>
  <span class="receipt-field" data-anno="The actual content of the contribution. For predictions: the claim body, resolution date, oracle source, and falsifiable criteria." data-label="payload"><span class="receipt-key">"payload"</span>: { <span class="receipt-key">"body"</span>: <span class="receipt-str">"GPT-5 will score >90% on ARC-AGI..."</span>, <span class="receipt-key">"resolution_date"</span>: <span class="receipt-str">"2026-06-01"</span> }</span><br>
}
        </div>
        <div class="receipt-annotation" id="receipt-annotation">
          <div class="receipt-annotation-label">↑ Hover a field</div>
          <div class="receipt-annotation-text">Click or hover over any field in the receipt above to see what it does, why it exists, and how it connects to the Acta protocol.</div>
        </div>
      </div>

      <div class="section-header">Built on Acta</div>
      <p class="section-subhead">Acta is the evidence protocol. Products and specifications build on top of it. Each generates independently verifiable Acta receipts.</p>
      <div class="showcase-grid">
        <div class="showcase-card" style="border-left-color:var(--blue);">
          <div class="protocol-card-num">IMPLEMENTATION</div>
          <div class="protocol-card-title">ScopeBlind</div>
          <div class="protocol-card-body">Machine access control with signed receipts. <code>protect-mcp</code> wraps MCP servers with per-tool policies. Every decision produces an Acta-signed receipt — portable, independently verifiable, no account needed.</div>
          <a href="https://scopeblind.com" target="_blank" rel="noopener noreferrer" class="protocol-card-link">scopeblind.com →</a>
        </div>
        <div class="showcase-card" style="border-left-color:var(--purple);">
          <div class="protocol-card-num">APPLICATION</div>
          <div class="protocol-card-title">BlindLLM</div>
          <div class="protocol-card-body">Blind AI agent battles with verified results. Battle outcomes, debate artifacts, and leaderboard snapshots are published as Acta evidence — creating a public, verifiable record of agent capability.</div>
          <a href="https://blindllm.com" target="_blank" rel="noopener noreferrer" class="protocol-card-link">blindllm.com →</a>
        </div>
        <div class="showcase-card" style="border-left-color:var(--link);">
          <div class="protocol-card-num">SPEC</div>
          <div class="protocol-card-title">IETF Internet Draft</div>
          <div class="protocol-card-body">Formal specification for signed decision receipts. Defines the receipt envelope, Ed25519 + JCS canonicalization (RFC 8785), four receipt types, and trust tier model. Companion to the MCP Server Discovery draft.</div>
          <a href="https://github.com/tomjwxf/ScopeBlindD2/blob/main/specs/draft-farley-acta-signed-receipts-00.md" target="_blank" rel="noopener noreferrer" class="protocol-card-link">draft-farley-acta-signed-receipts-00 →</a>
        </div>
      </div>

      <div class="section-header">Use Acta, Then Study It</div>
      <div class="quickstart-grid">
        <div class="quickstart-card">
          <h3>Browse where pressure already exists</h3>
          <p>Start with contested topics and predictions nearing resolution. Those are the records most likely to benefit from new evidence, correction, or explicit challenge.</p>
          <a href="#topic-directory" onclick="activateTopicFilter('contested', this)">Open contested topics →</a>
        </div>
        <div class="quickstart-card">
          <h3>Verify before you trust</h3>
          <p>Use the browser verifier for fast checks, or export a chain and run the offline verifier. The site should make verification routine, not specialist-only.</p>
          <a href="/verify">Open verify tools →</a>
        </div>
        <div class="quickstart-card">
          <h3>Choose the right contribution type</h3>
          <p>Questions ask for evidence. Claims carry support burdens. Predictions require explicit resolution criteria. The composer guides each path.</p>
          <a href="#contribute-section">Jump to contribute →</a>
        </div>
      </div>

      <details class="deep-dive">
        <summary class="deep-dive-summary">Why this exists</summary>
        <div class="deep-dive-body">
          <div class="charter-summary" style="margin-bottom:0;">
            <p class="charter-summary-lead">AI agents are making real decisions — calling APIs, spending money, committing code. But nobody can independently prove what an agent actually did. Dashboards show you logs. Logs can be edited. Scanners check before install, but once code runs, there's no standard way to prove it behaved.</p>
            <p class="charter-summary-lead">Evidence is only credible if it doesn't depend on the platform that created it. Acta defines how to structure, sign, and verify evidence so that anyone — regulator, auditor, competitor, or the public — can check it without trusting the operator.</p>
            <p class="charter-summary-lead" style="margin-bottom:24px;">The protocol is built on permanent invariants — not operator-tunable policies, but commitments that define the system's identity. The canonical <a href="/.well-known/acta-instance.json" style="color:var(--text);font-family:var(--mono);font-size:13px;">charter hash</a> is published in the machine-readable manifest. Anyone can <a href="https://github.com/VeritasActa/Acta/blob/main/CHARTER.md" style="color:var(--text);">download the charter</a>, compute its SHA-256, and verify the instance is publishing the charter it claims.</p>
            <div class="charter-invariants">
              <div class="charter-inv">
                <span class="charter-inv-num">3</span>
                <div>
                  <div class="charter-inv-title">Claims and decisions can be challenged</div>
                  <div class="charter-inv-body">No contribution and no moderation decision is beyond challenge. The challenge mechanism is structural and always available.</div>
                </div>
              </div>
              <div class="charter-inv">
                <span class="charter-inv-num">6</span>
                <div>
                  <div class="charter-inv-title">The record maintains integrity</div>
                  <div class="charter-inv-body">No entity — including the operator — can silently alter the record. When content must be removed, its removal is explicit and auditable.</div>
                </div>
              </div>
              <div class="charter-inv">
                <span class="charter-inv-num">8</span>
                <div>
                  <div class="charter-inv-title">No automated system exercises epistemic discretion</div>
                  <div class="charter-inv-body">Automated systems classify, tag, score, and enforce rules. They do not adjudicate what is true. Epistemic judgments require accountable human action.</div>
                </div>
              </div>
              <div class="charter-inv">
                <span class="charter-inv-num">10</span>
                <div>
                  <div class="charter-inv-title">Verification and exit do not depend on operator permission</div>
                  <div class="charter-inv-body">Participants can independently verify the public record, export data, and build compatible implementations without relying on any single operator.</div>
                </div>
              </div>
            </div>
            <a href="/about" class="charter-summary-link">Read the full Charter — all 10 invariants →</a>
          </div>
        </div>
      </details>

      <div class="pipeline-section">
        <div class="section-header">How Acta Works</div>
        <p class="section-subhead">Five steps from action to independently verifiable proof. No trust in any single operator required.</p>
        <div class="pipeline">
          <div class="pipeline-step">
            <div class="pipeline-icon" style="color:var(--blue);">⚡</div>
            <div class="pipeline-connector"></div>
            <div class="pipeline-label" style="color:var(--blue);">Act</div>
            <div class="pipeline-desc">An agent calls a tool, a human submits a prediction, or a policy is enforced.</div>
          </div>
          <div class="pipeline-step">
            <div class="pipeline-icon" style="color:var(--link);">🔐</div>
            <div class="pipeline-connector"></div>
            <div class="pipeline-label" style="color:var(--link);">Sign</div>
            <div class="pipeline-desc">The action becomes a typed, JCS-canonicalized entry with Ed25519 signature.</div>
          </div>
          <div class="pipeline-step">
            <div class="pipeline-icon" style="color:var(--purple);">⛓</div>
            <div class="pipeline-connector"></div>
            <div class="pipeline-label" style="color:var(--purple);">Chain</div>
            <div class="pipeline-desc">Entry is hash-linked to the previous entry, forming an append-only chain per topic.</div>
          </div>
          <div class="pipeline-step">
            <div class="pipeline-icon" style="color:var(--amber);">🌐</div>
            <div class="pipeline-connector"></div>
            <div class="pipeline-label" style="color:var(--amber);">Witness</div>
            <div class="pipeline-desc">Daily Merkle root anchored and posted to Bluesky as an external timestamp witness.</div>
          </div>
          <div class="pipeline-step">
            <div class="pipeline-icon" style="color:var(--green);">✓</div>
            <div class="pipeline-label" style="color:var(--green);">Verify</div>
            <div class="pipeline-desc">Anyone exports the chain and independently recomputes every hash. Zero operator trust.</div>
          </div>
        </div>
      </div>

      <details class="deep-dive">
        <summary class="deep-dive-summary">Protocol mechanics (deep dive)</summary>
        <div class="deep-dive-body">
          <div class="protocol-grid" style="margin-bottom:0;">
            <div class="protocol-card">
              <div class="protocol-card-num">01</div>
              <div class="protocol-card-title">Typed Contributions</div>
              <div class="protocol-card-body">Questions carry no evidence burden. Claims require sources or reasoning. Predictions require resolution criteria, dates, and an explicit oracle. Each type has its own state machine.</div>
              <a href="/docs#type-system" class="protocol-card-link">Type system & state machines →</a>
            </div>
            <div class="protocol-card">
              <div class="protocol-card-num">02</div>
              <div class="protocol-card-title">Structured Challenges</div>
              <div class="protocol-card-body">Not flags. Not votes. A challenge requires the specific assertion being challenged, a formal basis, and a substantive argument.</div>
              <a href="/docs#response-matrix" class="protocol-card-link">Response matrix & challenge flow →</a>
            </div>
            <div class="protocol-card">
              <div class="protocol-card-num">03</div>
              <div class="protocol-card-title">Hash-Chained Ledger</div>
              <div class="protocol-card-body">Every entry is hash-chained to its predecessor using JCS-SHA256. Revisions happen via public supersession, not database mutations. Export any topic as JSON and recompute every hash offline.</div>
              <a href="/docs#chain-integrity" class="protocol-card-link">Chain integrity & verification →</a>
            </div>
          </div>
        </div>
      </details>

      <div id="contribute-section" class="section-header">Contribute</div>
      <p style="color:var(--text-muted);font-size:14px;margin-bottom:20px;">Acta is an open protocol. Submit typed contributions via the web form, the REST API, or the <a href="https://github.com/VeritasActa/acta-mcp" style="color:var(--link);">MCP server</a> for AI agents.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <a href="/docs#api" class="btn-secondary" style="display:inline-flex;align-items:center;padding:10px 20px;border-radius:4px;font-size:13px;font-weight:600;border:1px solid var(--border);color:var(--text-muted);">API Reference →</a>
        <a href="https://github.com/VeritasActa/acta" class="btn-secondary" style="display:inline-flex;align-items:center;padding:10px 20px;border-radius:4px;font-size:13px;font-weight:600;border:1px solid var(--border);color:var(--text-muted);">Source on GitHub →</a>
        <a href="https://github.com/VeritasActa/Acta/blob/main/CHARTER.md" class="btn-secondary" style="display:inline-flex;align-items:center;padding:10px 20px;border-radius:4px;font-size:13px;font-weight:600;border:1px solid var(--border);color:var(--text-muted);">Read the Charter →</a>
        <a href="https://scopeblind.com/docs/mcp" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="display:inline-flex;align-items:center;padding:10px 20px;border-radius:4px;font-size:13px;font-weight:600;border:1px solid var(--border);color:var(--text-muted);">ScopeBlind MCP Docs →</a>
      </div>
    </main>
  `);
}

function renderTrackRecords(trackRecords) {
  const pseudonyms = Object.keys(trackRecords || {}).filter(p => trackRecords[p].predictions > 0);
  if (pseudonyms.length === 0) return '';

  // Sort: most resolved first, then most predictions
  pseudonyms.sort((a, b) => {
    const ra = trackRecords[a], rb = trackRecords[b];
    return (rb.resolved - ra.resolved) || (rb.predictions - ra.predictions);
  });

  const cards = pseudonyms.map(p => {
    const r = trackRecords[p];
    const pct = r.resolved > 0 ? Math.round((r.correct / r.resolved) * 100) : null;
    const fillClass = pct !== null ? (pct >= 50 ? 'track-record-fill-good' : 'track-record-fill-bad') : 'track-record-fill-none';
    const fillWidth = pct !== null ? pct : 0;
    const shortId = p.length > 12 ? p.slice(0, 6) + '\u2026' + p.slice(-4) : p;
    const statsText = r.resolved > 0
      ? `${r.correct}/${r.resolved} correct · ${r.predictions} total`
      : `${r.predictions} prediction${r.predictions !== 1 ? 's' : ''} · none resolved`;

    return `<div class="track-record-card">
      <span class="track-record-pseudonym" title="${esc(p)}">${esc(shortId)}</span>
      <div class="track-record-bar"><div class="track-record-fill ${fillClass}" style="width:${fillWidth}%"></div></div>
      <span class="track-record-stats">${statsText}</span>
    </div>`;
  }).join('');

  return `<div class="track-record-section">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:8px;color:var(--text-muted);">Track Records</h3>
    <p style="font-size:11px;color:var(--text-dim);margin-bottom:10px;">Per-pseudonym prediction accuracy. Pseudonyms are topic-scoped — the same contributor has different IDs on different topics.</p>
    ${cards}
  </div>`;
}

function topicPage(data) {
  const { topic, entries, trackRecords = {} } = data;
  const isBlindLLMTopic = typeof topic === 'string' && topic.startsWith('blindllm-');
  const blindllmMeta = isBlindLLMTopic ? describeBlindllmTopic(topic) : null;

  const contributions = entries.filter(e => e.type === 'contribution');
  const allResponses = entries.filter(e => e.type === 'response');
  const contestedCount = contributions.filter(e => (e.computed_state || e.state || 'open') === 'contested').length;
  const predictionCount = contributions.filter(e => e.subtype === 'prediction').length;
  const awaitingResolutionCount = contributions.filter(e => e.display_hint === 'awaiting_resolution').length;
  const latestTimestamp = entries.reduce((latest, entry) => {
    if (!entry?.timestamp) return latest;
    return !latest || entry.timestamp > latest ? entry.timestamp : latest;
  }, null);

  // Display-level deduplication: skip contributions with identical body text,
  // keeping the first occurrence (which has the responses linked to it).
  // Chain integrity is preserved — duplicates still exist in the ledger.
  const seenBodies = new Set();
  const uniqueContributions = contributions.filter(c => {
    const body = (c.body_preview || c.payload?.body || '').trim();
    if (seenBodies.has(body)) return false;
    seenBodies.add(body);
    return true;
  });
  const dupCount = contributions.length - uniqueContributions.length;

  const entriesHtml = uniqueContributions.length > 0
    ? uniqueContributions.map(c => {
      const linkedResponses = allResponses.filter(r =>
        (r.linked_to || []).includes(c.entry_id)
      );
      return renderEntry(c, linkedResponses, topic);
    }).join('')
    : `<div class="empty"><h3>No contributions yet</h3></div>`;

  const summaryLead = contestedCount
    ? `This topic currently has ${contestedCount} contested contribution${contestedCount !== 1 ? 's' : ''}. Start there if you want the highest-leverage evidence or challenge work.`
    : predictionCount
      ? `This topic tracks ${predictionCount} prediction${predictionCount !== 1 ? 's' : ''}. Check for due-soon or unresolved outcomes before adding new forecasts.`
      : `This topic is still mostly open. Add a focused claim, a question that sharpens the research task, or a challenge that cites a concrete flaw.`;
  const topicSummary = `Topic ${topic}: ${entries.length} total entries, ${contestedCount} contested contributions, ${predictionCount} predictions, ${allResponses.length} responses. Last activity ${timeAgo(latestTimestamp)}. Export: https://veritasacta.com/api/export/${encodeURIComponent(topic)}`;

  return layout(topic, `
    <main class="container topic-page-hero">
      <h1 style="font-size:24px;font-weight:700;margin-bottom:6px;">${esc(topic)}</h1>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">
        ${entries.length} entries ·
        <a href="/api/verify?topic=${encodeURIComponent(topic)}">Verify chain</a> ·
        <a href="/api/export/${encodeURIComponent(topic)}">Export JSON</a>
      </p>
      <div class="topic-summary-card">
        <div class="topic-summary-lead">${esc(summaryLead)}</div>
        <div class="topic-summary-grid">
          <div class="topic-summary-metric"><div class="topic-summary-value">${entries.length}</div><div class="topic-summary-label">ledger entries</div></div>
          <div class="topic-summary-metric"><div class="topic-summary-value">${contestedCount}</div><div class="topic-summary-label">contested</div></div>
          <div class="topic-summary-metric"><div class="topic-summary-value">${predictionCount}</div><div class="topic-summary-label">predictions</div></div>
          <div class="topic-summary-metric"><div class="topic-summary-value">${awaitingResolutionCount}</div><div class="topic-summary-label">awaiting resolution</div></div>
          <div class="topic-summary-metric"><div class="topic-summary-value">${timeAgo(latestTimestamp)}</div><div class="topic-summary-label">last activity</div></div>
        </div>
        <div class="topic-summary-actions">
          <a href="#contribute-section" class="btn">Contribute here</a>
          <a href="/api/export/${encodeURIComponent(topic)}" class="btn-secondary">Export JSON</a>
          <a href="/verify" class="btn-secondary">Open verifier</a>
          <button class="btn-secondary" onclick='copyText(${JSON.stringify(topicSummary)}, this, "Copied")'>Copy proof summary</button>
          <button class="btn-secondary" onclick='copyText(window.location.href, this, "Copied")'>Copy link</button>
        </div>
      </div>
      ${isBlindLLMTopic ? `
      <div class="featured-record" style="margin-bottom:18px;">
        <div class="featured-card" style="padding:18px 20px;">
          <div class="featured-label">BlindLLM evidence topic · ${esc(blindllmMeta.label)}</div>
          <div class="featured-body" style="margin-top:8px;">${esc(blindllmMeta.body)} Use the links below to inspect the live product, verify receipts independently, or export the full chain for offline checking.</div>
          <div class="featured-meta" style="display:flex;gap:14px;flex-wrap:wrap;">
            <a href="https://www.blindllm.com" target="_blank" rel="noopener" style="color:var(--text);">Open BlindLLM</a>
            <a href="https://www.scopeblind.com/verify" target="_blank" rel="noopener" style="color:var(--text);">Open ScopeBlind verifier</a>
            <a href="/api/export/${encodeURIComponent(topic)}" style="color:var(--text);">Export topic JSON</a>
          </div>
        </div>
      </div>` : ''}
      ${entriesHtml}
      ${dupCount > 0 ? `<div style="padding:10px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--rad);font-size:12px;color:var(--text-dim);font-family:var(--mono);margin-bottom:16px;">${dupCount} duplicate contribution${dupCount > 1 ? 's' : ''} hidden. Chain integrity preserved — <a href="/api/export/${encodeURIComponent(topic)}">export full chain</a> to see all entries.</div>` : ''}
      ${renderTrackRecords(trackRecords)}
      ${contributeForm(topic)}
      <div class="mobile-action-bar">
        <a href="#contribute-section">Contribute</a>
        <button onclick='copyText(${JSON.stringify(topicSummary)}, this, "Copied")'>Copy summary</button>
        <a href="/api/export/${encodeURIComponent(topic)}">Export</a>
        <a href="/verify">Verify</a>
      </div>
    </main>
  `);
}

function renderSourceSnapshot(source) {
  if (!source) return '';
  const isStructured = typeof source === 'object';
  const sourceUrl = isStructured ? source.source_url : source;
  if (!sourceUrl) return '';

  let html = `<div style="margin-top:6px;font-size:12px;color:var(--text-dim);"><a href="${esc(sourceUrl)}" target="_blank" rel="noopener" style="color:var(--text-dim);word-break:break-all;">${esc(sourceUrl)}</a></div>`;

  if (isStructured && source.content_hash) {
    const truncHash = source.content_hash.slice(0, 12);
    const captured = source.retrieved_at
      ? new Date(source.retrieved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;
    html += `<div style="margin-top:2px;font-size:11px;color:var(--text-dim);font-family:var(--mono);opacity:0.7;">Snapshot: SHA-256 ${truncHash}\u2026${captured ? ` \u00b7 captured ${captured}` : ''}</div>`;
  }
  return html;
}

function renderIdentityBadge(author) {
  if (!author) return '';
  const parts = [];
  if (author.type === 'agent') {
    parts.push('<span class="badge badge-agent">agent</span>');
    if (author.agent_operator) {
      parts.push(`<span style="font-size:10px;color:var(--text-dim);font-family:var(--mono);">${esc(author.agent_operator)}</span>`);
    }
  }
  if (author.method === 'dpop' || author.method === 'pass_token') {
    parts.push('<span class="badge badge-verified">\u2713 verified</span>');
  }
  if (author.topic_pseudonym) {
    parts.push(`<span class="identity-pseudonym" title="${esc(author.topic_pseudonym)}">${author.topic_pseudonym.slice(0, 8)}</span>`);
  }
  return parts.join(' ');
}

function renderEntry(entry, linkedResponses, topic) {
  const state = entry.computed_state || entry.state || 'open';
  const hint = entry.display_hint;
  const stateLabel = hint === 'supported' ? 'supported' : state;
  const detailsId = 'details-' + entry.entry_id;
  const responsesId = 'responses-' + entry.entry_id;

  const responseCounts = {};
  for (const r of linkedResponses) {
    responseCounts[r.subtype] = (responseCounts[r.subtype] || 0) + 1;
  }

  const countsHtml = Object.entries(responseCounts).map(([type, count]) =>
    `<span class="badge badge-${type}">${count} ${type}</span>`
  ).join(' ');

  const responsesHtml = linkedResponses.length > 0
    ? `<div class="responses-section" id="${responsesId}" hidden>
        ${linkedResponses.map(r => `
          <div class="response-card">
            <div class="response-line">
              <span class="badge badge-${r.subtype}">${r.subtype}</span>
              ${renderIdentityBadge(r.author)}
              <span style="font-size:13px;">${esc(r.body_preview || r.payload?.body || '')}</span>
            </div>
            ${renderSourceSnapshot(r.payload?.source)}
            ${r.subtype === 'challenge' ? `
              <div style="margin-top:6px;font-size:11px;color:var(--red);">
                Basis: ${esc(r.payload?.basis || '')} · Target: "${esc((r.payload?.target_assertion || '').slice(0, 80))}"
              </div>` : ''}
            ${r.subtype === 'evidence' ? `<div style="margin-top:4px;font-size:11px;color:var(--text-dim);">Stance: ${r.payload?.stance || ''}</div>` : ''}
            <div class="card-meta">
              <span>#${r.sequence}</span>
              <span>${timeAgo(r.timestamp)}</span>
              <span class="hash" title="${r.entry_hash || ''}">${(r.entry_hash || '').slice(0, 10)}...</span>
              <div class="json-toggle" onclick="toggleJson('${r.entry_id}')">{ } JSON</div>
            </div>
            <div class="raw-json" id="raw-${r.entry_id}">${esc(JSON.stringify(r, null, 2))}</div>
          </div>
        `).join('')}
      </div>`
    : '';

  return `
    <div class="card">
      <div class="card-header">
        <span class="badge badge-${entry.subtype}">${entry.subtype}</span>
        <span class="badge badge-${stateLabel}">${stateLabel}</span>
        ${renderIdentityBadge(entry.author)}
        ${(entry.moderation_tags || entry.tags || []).map(t => `<span class="badge badge-unsubstantiated">${esc(t)}</span>`).join('')}
        ${entry.category ? `<span style="font-size:11px;color:var(--text-dim);">${entry.category}</span>` : ''}
      </div>
      <div class="card-body">${esc(entry.body_preview || entry.payload?.body || '')}</div>
      ${renderSourceSnapshot(entry.payload?.source)}
      ${entry.subtype === 'prediction' ? (() => {
        const state = entry.computed_state || '';
        const resDate = entry.payload?.resolution_date;
        if (state === 'resolved_confirmed') {
          return `<div style="margin-top:6px;font-size:12px;color:#059669;font-weight:600;">Confirmed · Resolved ${resDate || ''}</div>`;
        } else if (state === 'resolved_refuted') {
          return `<div style="margin-top:6px;font-size:12px;color:var(--red);font-weight:600;">Refuted · Resolved ${resDate || ''}</div>`;
        } else if (state === 'unresolvable') {
          return `<div style="margin-top:6px;font-size:12px;color:var(--text-dim);">Unresolvable · ${resDate || ''}</div>`;
        } else if (entry.display_hint === 'awaiting_resolution') {
          return `<div style="margin-top:6px;font-size:12px;color:var(--amber);font-weight:500;">Awaiting resolution · Past due ${resDate || ''} · Source: ${esc(entry.payload?.resolution_source || '?')}</div>`;
        } else {
          return `<div style="margin-top:6px;font-size:12px;color:var(--amber);">Resolves: ${resDate || '?'} · Source: ${esc(entry.payload?.resolution_source || '?')}</div>`;
        }
      })() : ''}
      ${countsHtml ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">${countsHtml}</div>` : ''}
      <div class="entry-toolbar">
        <div class="entry-toolbar-note">#${entry.sequence} · ${timeAgo(entry.timestamp)}</div>
        <div class="entry-toolbar-actions">
          <button class="mini-btn" onclick="toggleSection('${detailsId}', this, 'Show details', 'Hide details')">Show details</button>
          ${linkedResponses.length > 0 ? `<button class="mini-btn" onclick="toggleSection('${responsesId}', this, 'Show responses (${linkedResponses.length})', 'Hide responses')">Show responses (${linkedResponses.length})</button>` : ''}
        </div>
      </div>
      <div class="entry-details" id="${detailsId}" hidden>
        <div class="entry-meta-grid">
          <div class="inline-note"><strong>Entry hash</strong><br><span class="hash" title="${entry.entry_hash || ''}">${(entry.entry_hash || '').slice(0, 18)}...</span></div>
          <div class="inline-note"><strong>Author</strong><br>${entry.author?.topic_pseudonym ? esc(entry.author.topic_pseudonym) : 'anonymous / hidden'}</div>
          ${entry.payload?.uncertainty ? `<div class="inline-note"><strong>Uncertainty</strong><br>${esc(entry.payload.uncertainty)}</div>` : ''}
          ${entry.category ? `<div class="inline-note"><strong>Category</strong><br>${esc(entry.category)}</div>` : ''}
        </div>
        <div class="json-toggle" onclick="toggleJson('${entry.entry_id}')">{ } JSON</div>
        <div class="raw-json" id="raw-${entry.entry_id}">${esc(JSON.stringify(entry, null, 2))}</div>
      </div>
      <div class="card-actions">
        <button onclick="showResponseForm('${entry.entry_id}','evidence')">+ Evidence</button>
        <button onclick="showResponseForm('${entry.entry_id}','challenge')">+ Challenge</button>
        <button onclick="showResponseForm('${entry.entry_id}','update')">+ Update</button>
        ${entry.subtype === 'question' || entry.subtype === 'prediction' ? `<button onclick="showResponseForm('${entry.entry_id}','resolution')">+ Resolution</button>` : ''}
      </div>
      ${responseForm(entry.entry_id, topic)}
      ${responsesHtml}
    </div>`;
}

function responseForm(entryId, topic) {
  return `
    <div class="response-form" id="resp-form-${entryId}">
      <div class="form-group">
        <label>Response Type</label>
        <select class="resp-type" onchange="updateResponseFields(this.closest('.response-form'))">
          <option value="evidence">Evidence</option>
          <option value="challenge">Challenge</option>
          <option value="update">Update</option>
          <option value="resolution">Resolution</option>
        </select>
      </div>
      <div class="form-group">
        <label>Body</label>
        <textarea class="resp-body" placeholder="Your response..."></textarea>
      </div>

      <!-- Evidence fields -->
      <div class="resp-type-fields evidence-resp-fields">
        <div class="form-row">
          <div class="form-group">
            <label>Source</label>
            <input type="text" class="resp-source" placeholder="https://...">
          </div>
          <div class="form-group">
            <label>Stance</label>
            <select class="resp-stance">
              <option value="supporting">Supporting</option>
              <option value="refuting">Refuting</option>
              <option value="contextual">Contextual</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Challenge fields -->
      <div class="resp-type-fields challenge-resp-fields" style="display:none;">
        <div class="form-group">
          <label>Specific assertion being challenged</label>
          <input type="text" class="resp-target-assertion" placeholder="Quote the exact claim...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Basis</label>
            <select class="resp-basis">
              <option value="counter_evidence">Counter Evidence</option>
              <option value="logical_error">Logical Error</option>
              <option value="source_unreliable">Source Unreliable</option>
              <option value="missing_context">Missing Context</option>
            </select>
          </div>
          <div class="form-group">
            <label>Source (if counter_evidence or source_unreliable)</label>
            <input type="text" class="resp-challenge-source" placeholder="https://...">
          </div>
        </div>
        <div class="form-group">
          <label>Argument (substantive refutation, min 20 chars)</label>
          <textarea class="resp-argument" placeholder="Explain why this assertion is wrong..."></textarea>
        </div>
      </div>

      <!-- Update fields -->
      <div class="resp-type-fields update-resp-fields" style="display:none;">
        <div class="form-group">
          <label>Update Type</label>
          <select class="resp-update-type">
            <option value="correction">Correction</option>
            <option value="additional_context">Additional Context</option>
            <option value="scope_change">Scope Change</option>
            <option value="alternative_source">Alternative Source</option>
          </select>
        </div>
      </div>

      <!-- Resolution fields -->
      <div class="resp-type-fields resolution-resp-fields" style="display:none;">
        <div class="form-group">
          <label>Outcome</label>
          <textarea class="resp-outcome" placeholder="What happened..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Source</label>
            <input type="text" class="resp-resolution-source" placeholder="https://...">
          </div>
          <div class="form-group">
            <label>Resolution Type</label>
            <select class="resp-resolution-type">
              <option value="answered">Answered (questions)</option>
              <option value="confirmed">Confirmed</option>
              <option value="refuted">Refuted</option>
              <option value="partially_confirmed">Partially Confirmed</option>
              <option value="unresolvable">Unresolvable</option>
            </select>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="btn" onclick="submitResponse('${entryId}','${esc(topic)}')">Submit Response</button>
        <button class="btn btn-secondary" onclick="this.closest('.response-form').classList.remove('active')">Cancel</button>
      </div>
      <div class="resp-result result-box"></div>
    </div>`;
}

function contributeForm(defaultTopic) {
  return `
    <div id="contribute-section" style="padding:32px 0;">
      <div class="composer-shell">
      <div class="composer-steps">
        <span class="composer-step active" data-composer-step>1 Choose a type</span>
        <span class="composer-step" data-composer-step>2 State the contribution clearly</span>
        <span class="composer-step active" data-composer-step>3 Add the required support</span>
      </div>
      <div id="composer-guidance" class="composer-guidance"></div>
      <div class="composer-type-pills">
        <button type="button" class="type-pill active" data-type-pill="question" onclick="setContributionType('question')">Question</button>
        <button type="button" class="type-pill" data-type-pill="claim" onclick="setContributionType('claim')">Claim</button>
        <button type="button" class="type-pill" data-type-pill="prediction" onclick="setContributionType('prediction')">Prediction</button>
      </div>
      <form onsubmit="return submitContribution(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Topic</label>
            <input type="text" id="c-topic" value="${esc(defaultTopic)}" placeholder="e.g., ai-models-2026" required>
            <div class="field-hint">Keep the current topic if you want this contribution to stay anchored to the thread above.</div>
          </div>
          <div class="form-group">
            <label>Type</label>
            <select id="c-type" onchange="updateFormFields()">
              <option value="question">Question</option>
              <option value="claim">Claim</option>
              <option value="prediction">Prediction</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Body</label>
          <textarea id="c-body" placeholder="Your contribution..." required></textarea>
          <div class="field-hint">Write the actual claim, question, or prediction first. Keep it specific enough that another reader can support, challenge, or resolve it later.</div>
        </div>
        <div class="type-fields" id="claim-fields" style="display:none;">
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <select id="c-category">
                <option value="opinion">Opinion</option>
                <option value="factual">Factual</option>
                <option value="hypothesis">Hypothesis</option>
              </select>
              <div class="field-hint">Factual claims need support. Opinion and hypothesis claims need explicit uncertainty.</div>
            </div>
            <div class="form-group">
              <label>Source (required for factual)</label>
              <input type="text" id="c-source" placeholder="https://...">
              <div class="field-hint">Use the strongest direct source you have. If not available, provide explicit reasoning below.</div>
            </div>
          </div>
          <div class="form-group">
            <label>Reasoning (alternative to source for factual)</label>
            <textarea id="c-reasoning" placeholder="Logical argument..."></textarea>
            <div class="field-hint">Explain why the claim follows even if you do not yet have a direct source.</div>
          </div>
          <div class="form-group">
            <label>Uncertainty (required for opinion/hypothesis)</label>
            <textarea id="c-uncertainty" placeholder="Confidence, limitations, what would change your mind..."></textarea>
            <div class="field-hint">Include confidence, known limitations, and what evidence would change your mind.</div>
          </div>
        </div>
        <div class="type-fields" id="prediction-fields" style="display:none;">
          <div class="form-group">
            <label>Resolution Criteria</label>
            <textarea id="c-criteria" placeholder="How to determine if confirmed or refuted..."></textarea>
            <div class="field-hint">Make the criteria concrete enough that another contributor can resolve it without guessing your intent.</div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Resolution Date</label>
              <input type="date" id="c-date">
            </div>
            <div class="form-group">
              <label>Resolution Source</label>
              <input type="text" id="c-resolution-source" placeholder="URL of authoritative source">
              <div class="field-hint">Pick the authority or source family that will matter most when the time comes.</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Resolution Rule</label>
              <input type="text" id="c-resolution-rule" placeholder="Who triggers resolution (e.g., any contributor with source)">
              <div class="field-hint">Say who is allowed to mark the prediction resolved and on what basis.</div>
            </div>
          </div>
        </div>
        <button type="submit" class="btn">Submit Contribution</button>
      </form>
      <div id="contribute-result" class="result-box"></div>
      </div>
    </div>`;
}

function aboutPage(data) {
  const charterMd = data?.charter || '';

  // Render charter markdown to HTML
  const charterHtml = renderCharterMarkdown(charterMd);

  return layout('Charter', `
    <main class="container" style="padding-top:40px;">
      <div style="text-align:center;margin-bottom:40px;">
        <div style="font-family:var(--brand);font-size:32px;font-weight:700;letter-spacing:0.04em;margin-bottom:8px;">Charter</div>
        <p style="color:var(--text-muted);font-size:14px;">
          Rendered from <a href="https://github.com/VeritasActa/Acta/blob/main/CHARTER.md" style="font-family:var(--mono);font-size:12px;">CHARTER.md</a>
          ${data?.charter_fetched_from === 'github' ? ' · <span style="color:var(--accent);">live from GitHub</span>' : ''}
        </p>
      </div>
      <div class="charter-content">
        ${charterHtml}
      </div>
      <div style="margin-top:40px;padding:18px;background:var(--surface);border:1px solid var(--border);border-radius:var(--rad);">
        <h3 style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">How content is handled (from Policy, not Charter)</h3>
        <div class="tier-grid">
          <div>
            <div style="color:var(--accent);font-weight:600;margin-bottom:3px;">Tier 1: Deterministic</div>
            <div style="color:var(--text-muted);">Schema validation, budget enforcement, duplicate detection. Code, not judgment.</div>
          </div>
          <div>
            <div style="color:var(--amber);font-weight:600;margin-bottom:3px;">Tier 2: LLM-Assisted</div>
            <div style="color:var(--text-muted);">Content classification tags only. Never makes irreversible epistemic decisions (Invariant #8).</div>
          </div>
          <div>
            <div style="color:var(--red);font-weight:600;margin-bottom:3px;">Tier 3: Human Review</div>
            <div style="color:var(--text-muted);">Appeals, hard-reject confirmation. Final authority but still challengeable (Invariant #3).</div>
          </div>
        </div>
      </div>
      <div style="margin-top:24px;padding:16px;font-size:13px;color:var(--text-dim);text-align:center;">
        Source: <a href="https://github.com/VeritasActa/Acta/blob/main/CHARTER.md">CHARTER.md</a> ·
        Protocol spec: <a href="https://github.com/VeritasActa/Acta/blob/main/docs/protocol-spec.md">protocol-spec.md</a> ·
        Policy: <a href="https://github.com/VeritasActa/Acta/blob/main/docs/policy.md">policy.md</a>
      </div>
    </main>
  `);
}

function renderCharterMarkdown(md) {
  if (!md) return '<p style="color:var(--text-dim);">Charter text not available. See <a href="https://github.com/VeritasActa/Acta/blob/main/CHARTER.md">GitHub source</a>.</p>';

  const lines = md.split('\n');
  let html = '';
  let inBlockquote = false;
  let inParagraph = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Horizontal rule
    if (trimmed === '---') {
      if (inParagraph) { html += '</p>'; inParagraph = false; }
      if (inBlockquote) { html += '</blockquote>'; inBlockquote = false; }
      html += '<hr style="border:none;border-top:1px solid var(--border);margin:24px 0;">';
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      if (inParagraph) { html += '</p>'; inParagraph = false; }
      const text = inlineMd(trimmed.slice(2));
      html += '<h1 style="font-family:var(--brand);font-size:28px;font-weight:700;letter-spacing:0.02em;margin:0 0 16px;text-align:center;">' + text + '</h1>';
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inParagraph) { html += '</p>'; inParagraph = false; }
      const text = inlineMd(trimmed.slice(3));
      html += '<h2 style="font-size:18px;font-weight:700;margin:32px 0 12px;color:var(--text);border-bottom:2px solid var(--text);padding-bottom:8px;">' + text + '</h2>';
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      if (inParagraph) { html += '</p>'; inParagraph = false; }
      if (!inBlockquote) { html += '<blockquote style="border-left:3px solid var(--border);padding:12px 16px;margin:0 0 16px;color:var(--text-muted);font-style:italic;">'; inBlockquote = true; }
      html += inlineMd(trimmed.slice(2)) + ' ';
      continue;
    } else if (inBlockquote) {
      html += '</blockquote>';
      inBlockquote = false;
    }

    // Empty line — close paragraph
    if (trimmed === '') {
      if (inParagraph) { html += '</p>'; inParagraph = false; }
      continue;
    }

    // Bold-numbered invariant line (e.g., **1. Title**)
    if (trimmed.match(/^\*\*\d+\./)) {
      if (inParagraph) { html += '</p>'; inParagraph = false; }
      html += '<div class="invariant"><span class="invariant-num">' + trimmed.match(/\d+/)[0] + '</span><div class="invariant-text">' + inlineMd(trimmed) + '</div></div>';
      continue;
    }

    // Regular paragraph text (continuation of an invariant description or standalone paragraph)
    if (!inParagraph) {
      html += '<p style="font-size:15px;color:var(--text-muted);line-height:1.65;margin:0 0 12px;">';
      inParagraph = true;
    }
    html += inlineMd(trimmed) + ' ';
  }

  if (inParagraph) html += '</p>';
  if (inBlockquote) html += '</blockquote>';
  return html;
}

function inlineMd(text) {
  return esc(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function moderationLogPage(data) {
  const receipts = data.rejection_receipts || [];
  const reviews = data.human_review_queue || [];
  const tier1bCount = data.tier1b_silent_drop_count || 0;

  const receiptsHtml = receipts.length > 0
    ? receipts.map(e => `
        <div class="mod-entry">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mod-action">
              <span class="badge badge-challenge">TIER 1A REJECTION</span>
              ${e.category ? `<span class="badge badge-tombstoned">${esc(e.category)}</span>` : ''}
            </span>
            <span class="mod-time">${timeAgo(e.timestamp)}</span>
          </div>
          ${e.reasoning ? `<div style="margin-top:6px;font-size:12px;color:var(--text-muted);">${esc(e.reasoning)}</div>` : ''}
          ${e.content_hash ? `<div style="margin-top:4px;font-size:11px;color:var(--text-dim);font-family:var(--mono);">Content hash: ${esc(e.content_hash)}</div>` : ''}
        </div>`).join('')
    : '';

  const reviewsHtml = reviews.length > 0
    ? reviews.map(e => `
        <div class="mod-entry">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mod-action">
              <span class="badge badge-open">REVIEW QUEUE</span>
              ${e.category ? `<span class="badge badge-unsubstantiated">${esc(e.category)}</span>` : ''}
            </span>
            <span class="mod-time">${timeAgo(e.queued_at)}</span>
          </div>
          ${e.reasoning ? `<div style="margin-top:6px;font-size:12px;color:var(--text-muted);">${esc(e.reasoning)}</div>` : ''}
          ${e.status ? `<div style="margin-top:4px;font-size:11px;color:var(--text-dim);">Status: ${esc(e.status)}</div>` : ''}
        </div>`).join('')
    : '';

  const hasContent = receipts.length > 0 || reviews.length > 0 || tier1bCount > 0;

  return layout('Moderation Log', `
    <main class="container" style="padding-top:40px;">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:6px;">Moderation Transparency Log</h1>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:20px;">
        All moderation actions are publicly visible. Charter invariant #3: no decision is beyond challenge.
      </p>
      ${!hasContent ? `<div class="empty"><h3>No moderation events</h3><p>All clear. Transparency is a permanent invariant.</p></div>` : ''}
      ${tier1bCount > 0 ? `<div style="padding:12px 16px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--rad);margin-bottom:16px;font-size:13px;font-family:var(--mono);color:var(--text-muted);">Tier 1B silent drops (CSAM, malware, credible violence): <strong>${tier1bCount}</strong></div>` : ''}
      ${receiptsHtml}
      ${reviewsHtml}
    </main>
  `);
}

function docsPage() {
  return layout('Documentation', `
    <main class="container" style="padding-top:40px;">
      <div style="text-align:center;margin-bottom:40px;">
        <div style="font-family:var(--brand);font-size:32px;font-weight:700;letter-spacing:0.04em;margin-bottom:8px;">Documentation</div>
        <p style="color:var(--text-muted);font-size:14px;">Protocol specification, API reference, and verification guide.</p>
      </div>

      <div class="quickstart-grid">
        <div class="quickstart-card">
          <h3>Use the record first</h3>
          <p>Browse live topics, inspect a thread, and export the chain. The docs should support usage, not force protocol study before the first meaningful action.</p>
          <a href="/">Go to the topic directory →</a>
        </div>
        <div class="quickstart-card">
          <h3>Verify in the browser or offline</h3>
          <p>Use the browser lab for quick checks, then move to exported JSON and the offline verifier when you need an independent artifact.</p>
          <a href="/verify">Open verification guide →</a>
        </div>
        <div class="quickstart-card">
          <h3>Integrate via API or MCP</h3>
          <p>Once the workflow makes sense, use the REST endpoints or the MCP server to make humans and agents first-class contributors.</p>
          <a href="#api">Jump to API reference →</a>
        </div>
      </div>

      <div id="type-system" class="docs-section">
        <h2 class="docs-section-title">Type System & State Machines</h2>
        <p class="docs-section-body">Every contribution has a type that determines its evidence burden and lifecycle.</p>
        <div class="docs-table">
          <div class="docs-row docs-row-header">
            <span class="docs-cell-type">Type</span>
            <span class="docs-cell-desc">Evidence Burden</span>
            <span class="docs-cell-states">States</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-question">question</span></span>
            <span class="docs-cell-desc">None. Questions are prompts for evidence.</span>
            <span class="docs-cell-states">open → resolved</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-claim">claim</span></span>
            <span class="docs-cell-desc">Factual claims require a source URL or explicit reasoning. Opinion and hypothesis require an uncertainty statement.</span>
            <span class="docs-cell-states">open → contested → superseded</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-prediction">prediction</span></span>
            <span class="docs-cell-desc">Requires resolution criteria, a resolution date, a source, and a resolution rule specifying who can trigger resolution.</span>
            <span class="docs-cell-states">open → contested → resolved (confirmed / refuted)</span>
          </div>
        </div>
        <p class="docs-section-body" style="margin-top:12px;">State transitions are computed from the response graph, not stored as mutable fields. A claim moves to "contested" when a structurally valid challenge is linked to it. This is deterministic — anyone can recompute the state from the chain.</p>
      </div>

      <div id="response-matrix" class="docs-section">
        <h2 class="docs-section-title">Response Matrix & Challenge Flow</h2>
        <p class="docs-section-body">Responses are typed and constrained by a target matrix. Not everything can respond to everything.</p>
        <div class="docs-table">
          <div class="docs-row docs-row-header">
            <span class="docs-cell-type">Response</span>
            <span class="docs-cell-desc">Can Target</span>
            <span class="docs-cell-states">Requirements</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-evidence">evidence</span></span>
            <span class="docs-cell-desc">Claims, predictions, questions</span>
            <span class="docs-cell-states">Source URL, stance (supporting / refuting / contextual)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-challenge">challenge</span></span>
            <span class="docs-cell-desc">Claims, predictions</span>
            <span class="docs-cell-states">Target assertion (exact quote), basis (counter_evidence / logical_error / source_unreliable / missing_context), argument (min 20 chars)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-update">update</span></span>
            <span class="docs-cell-desc">Claims, predictions</span>
            <span class="docs-cell-states">Update type (correction / additional_context / scope_change)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-resolution">resolution</span></span>
            <span class="docs-cell-desc">Questions, predictions</span>
            <span class="docs-cell-states">Outcome, source, resolution type (confirmed / refuted / answered)</span>
          </div>
        </div>
        <p class="docs-section-body" style="margin-top:12px;">Challenges have a 7-day shot clock. If the original contributor doesn't respond, the claim transitions to "unsubstantiated." Claims never resolve — they can only be superseded or contested. This is by design: factual claims don't have binary outcomes.</p>
      </div>

      <div id="chain-integrity" class="docs-section">
        <h2 class="docs-section-title">Chain Integrity & Verification</h2>
        <p class="docs-section-body">Every entry in every topic is stored in a hash-chained append-only ledger.</p>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--rad);padding:20px;margin:16px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">How entries are chained</div>
          <ol style="font-size:13px;color:var(--text-muted);line-height:1.7;padding-left:20px;">
            <li>Entry payload is canonicalized using JCS (RFC 8785)</li>
            <li>SHA-256 hash of the canonical payload → <code>payload_hash</code></li>
            <li>Entry envelope (type, topic, author, payload_hash, prev_hash, sequence, timestamp) is canonicalized</li>
            <li>SHA-256 of the envelope → <code>entry_hash</code></li>
            <li>Next entry's <code>prev_hash</code> = this entry's <code>entry_hash</code></li>
          </ol>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--rad);padding:20px;margin:16px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">Daily anchors</div>
          <p style="font-size:13px;color:var(--text-muted);line-height:1.65;">At midnight UTC, the operator computes a Merkle root of all chain heads, signs it with an Ed25519 key, and publishes the signed anchor. The anchor is witnessed externally on Bluesky — a platform the operator does not control.</p>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--rad);padding:20px;margin:16px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">Protocol identity</div>
          <p style="font-size:13px;color:var(--text-muted);line-height:1.65;margin-bottom:8px;">The <a href="/.well-known/acta-instance.json">instance manifest</a> publishes SHA-256 hashes of the three documents that define this instance's identity: the Charter, Protocol Spec, and Policy. Anyone can independently compute these hashes and compare.</p>
          <p style="font-size:13px;color:var(--text-muted);line-height:1.65;">These hashes prove <strong>published identity</strong>, not full behavioral conformance. See <a href="/verify">/verify</a> for what can and cannot be checked.</p>
        </div>
        <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;margin:16px 0;">
          <div style="color:var(--panel-text-dim);font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Independent verification</div>
          <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;"><span style="color:var(--panel-text-dim);"># Export a topic's full chain</span>
curl https://veritasacta.com/api/export/{topic} > chain.json

<span style="color:var(--panel-text-dim);"># Verify every hash offline (no trust in operator)</span>
node tools/verify.js chain.json

<span style="color:var(--panel-text-dim);"># Verify the anchor signature</span>
node tools/verify.js --anchor https://veritasacta.com/api/anchor/latest

<span style="color:var(--panel-text-dim);"># Run conformance checks against any instance</span>
node tools/conformance.js https://veritasacta.com</pre>
        </div>
      </div>

      <div id="api" class="docs-section">
        <h2 class="docs-section-title">API Reference</h2>
        <p class="docs-section-body">All endpoints return JSON. CORS is enabled for all origins.</p>

        <div style="font-weight:700;font-size:14px;margin:20px 0 12px;color:var(--text);">Read endpoints</div>
        <div class="docs-table">
          <div class="docs-row docs-row-header">
            <span class="docs-cell-type">Endpoint</span>
            <span class="docs-cell-desc" style="flex:3;">Description</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/topics</span>
            <span class="docs-cell-desc" style="flex:3;">List all topics with entry counts. Filter with <code style="font-size:11px;">?q=keyword</code></span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/feed?topic={t}</span>
            <span class="docs-cell-desc" style="flex:3;">Full feed with computed states. Filter with <code style="font-size:11px;">&amp;type=claim&amp;state=contested</code></span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/entry/{id}</span>
            <span class="docs-cell-desc" style="flex:3;">Single entry with linked responses</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/verify?topic={t}</span>
            <span class="docs-cell-desc" style="flex:3;">Operator-served chain integrity check</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/export/{topic}</span>
            <span class="docs-cell-desc" style="flex:3;">Full chain export for independent verification</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/anchor/latest</span>
            <span class="docs-cell-desc" style="flex:3;">Latest signed Ed25519 anchor checkpoint</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/chain-heads</span>
            <span class="docs-cell-desc" style="flex:3;">All topic chain heads (for witnesses)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/charter</span>
            <span class="docs-cell-desc" style="flex:3;">Charter invariants as structured JSON</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/moderation-log</span>
            <span class="docs-cell-desc" style="flex:3;">Public moderation transparency log</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">GET /api/conformance</span>
            <span class="docs-cell-desc" style="flex:3;">Self-reported conformance status (operator-assessed, cached 5min)</span>
          </div>
        </div>

        <div style="font-weight:700;font-size:14px;margin:24px 0 12px;color:var(--text);">Write endpoints</div>
        <div class="docs-table">
          <div class="docs-row docs-row-header">
            <span class="docs-cell-type">Endpoint</span>
            <span class="docs-cell-desc" style="flex:3;">Description</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">POST /api/contribute</span>
            <span class="docs-cell-desc" style="flex:3;">Submit a typed contribution (question, claim, prediction)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">POST /api/respond</span>
            <span class="docs-cell-desc" style="flex:3;">Submit a response (evidence, challenge, update, resolution)</span>
          </div>
        </div>

        <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;margin:20px 0;">
          <div style="color:var(--panel-text-dim);font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Example: submit a claim</div>
          <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;">curl -X POST https://veritasacta.com/api/contribute \\
  -H "Content-Type: application/json" \\
  -d '{
    <span style="color:var(--panel-text-bright);">"type"</span>: "claim",
    <span style="color:var(--panel-text-bright);">"topic"</span>: "your-topic",
    <span style="color:var(--panel-text-bright);">"payload"</span>: {
      "body": "Your claim here",
      "category": "factual",
      "source": "https://evidence.example.com"
    }
  }'</pre>
        </div>
      </div>

      <div id="identity" class="docs-section">
        <h2 class="docs-section-title">Identity & Budget</h2>
        <p class="docs-section-body">Identity is provided by <a href="https://scopeblind.com">ScopeBlind</a> via DPoP tokens or pass-tokens. Each device gets 10 tokens per day across all topics. Contributions cost 2 tokens; responses cost 1. This prevents attention flooding (Charter invariant #4) without requiring accounts.</p>
        <p class="docs-section-body">Authors are identified by per-topic pseudonyms — cryptographically derived, unlinkable across topics. Device IDs are never stored in the ledger.</p>
      </div>

      <div id="provenance" class="docs-section">
        <h2 class="docs-section-title">Provenance Metadata</h2>
        <p class="docs-section-body">Contributions and responses can optionally include a <code style="font-family:var(--mono);font-size:12px;background:var(--panel-bg);padding:2px 6px;border-radius:3px;">provenance</code> object in the payload for AI authorship disclosure and reproducibility. All fields are optional.</p>
        <div class="docs-table" style="margin-top:12px;">
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:200px;font-family:var(--mono);font-size:12px;">authored_with_model</span>
            <span class="docs-cell-desc" style="flex:2;">Model identifier (e.g. "claude-sonnet-4-20250514")</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:200px;font-family:var(--mono);font-size:12px;">system_prompt_hash</span>
            <span class="docs-cell-desc" style="flex:2;">SHA-256 hex of the system prompt used</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:200px;font-family:var(--mono);font-size:12px;">prompt_hash</span>
            <span class="docs-cell-desc" style="flex:2;">SHA-256 hex of the user prompt</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:200px;font-family:var(--mono);font-size:12px;">tool_version</span>
            <span class="docs-cell-desc" style="flex:2;">Version of the tool/MCP server used</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:200px;font-family:var(--mono);font-size:12px;">disclosure_level</span>
            <span class="docs-cell-desc" style="flex:2;">One of: private, reproducible, full</span>
          </div>
        </div>
        <p class="docs-section-body" style="margin-top:12px;">Provenance is included in the payload hash — it becomes part of the immutable record. This enables future compose features and agent authorship transparency without requiring disclosure.</p>
      </div>

      <div id="mcp" class="docs-section">
        <h2 class="docs-section-title">MCP Server (AI Agents)</h2>
        <p class="docs-section-body">The <a href="https://github.com/VeritasActa/acta-mcp">acta-mcp</a> server lets AI agents interact with Acta as first-class participants. Install in Claude Desktop or Cursor:</p>
        <div style="margin:12px 0;">
          <pre style="background:var(--panel-bg);border:1px solid var(--border);border-radius:4px;padding:12px;font-size:12px;overflow-x:auto;color:var(--panel-text-bright);">{ "command": "npx", "args": ["-y", "acta-mcp"] }</pre>
        </div>
        <p class="docs-section-body">Six tools available:</p>
        <div class="docs-table" style="margin-top:8px;">
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">acta_contribute</span>
            <span class="docs-cell-desc" style="flex:2;">Submit a question, claim, or prediction</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">acta_respond</span>
            <span class="docs-cell-desc" style="flex:2;">Submit evidence, challenge, update, or resolution</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">acta_query</span>
            <span class="docs-cell-desc" style="flex:2;">Browse topics, entries, filter by type and state</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">acta_discover</span>
            <span class="docs-cell-desc" style="flex:2;">Find actionable work — contested records, claims needing evidence, approaching resolutions</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">acta_verify</span>
            <span class="docs-cell-desc" style="flex:2;">Verify hash chain integrity for a topic</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">acta_export</span>
            <span class="docs-cell-desc" style="flex:2;">Export full chain for independent verification</span>
          </div>
        </div>
        <p class="docs-section-body" style="margin-top:12px;">Configure via environment: <code style="font-family:var(--mono);font-size:12px;background:var(--panel-bg);padding:2px 6px;border-radius:3px;">ACTA_INSTANCE_URL</code> (default: veritasacta.com) and <code style="font-family:var(--mono);font-size:12px;background:var(--panel-bg);padding:2px 6px;border-radius:3px;">ACTA_DEVICE_ID</code>.</p>
      </div>

      <div id="source" class="docs-section">
        <h2 class="docs-section-title">Source & Specifications</h2>
        <div class="docs-table">
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Charter</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/Acta/blob/main/CHARTER.md">CHARTER.md</a> — permanent invariants, mission, what the system is</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Protocol Spec</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/Acta/blob/main/docs/protocol-spec.md">protocol-spec.md</a> — schemas, state machines, chain format</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Policy</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/Acta/blob/main/docs/policy.md">policy.md</a> — moderation tiers, budget rules, rate limits</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Source Code</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/acta">github.com/VeritasActa/acta</a> — MIT license, Cloudflare Workers</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Offline Verifier</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/acta/blob/main/tools/verify.js">tools/verify.js</a> — recompute all hashes and verify anchors</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Conformance Checker</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/acta/blob/main/tools/conformance.js">tools/conformance.js</a> — verify manifest, document hashes, endpoints, anchor signature</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Instance Manifest</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="/.well-known/acta-instance.json">/.well-known/acta-instance.json</a> — passive federation discovery</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">MCP Server</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/acta-mcp">acta-mcp</a> — AI agent interface (contribute, query, discover, verify, export)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Conformance Status</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="/api/conformance">/api/conformance</a> — operator-reported self-assessment (cached, 5min)</span>
          </div>
        </div>
      </div>
    </main>
  `);
}

function ontologyPage() {
  return layout('Ontology v0.1', `
    <main class="container" style="padding-top:40px;">
      <div style="text-align:center;margin-bottom:40px;">
        <div style="font-family:var(--brand);font-size:32px;font-weight:700;letter-spacing:0.04em;margin-bottom:8px;">Ontology v0.1</div>
        <p style="color:var(--text-muted);font-size:14px;">The evidence protocol for machine decisions.</p>
        <p style="color:var(--text-dim);font-size:12px;margin-top:6px;font-family:var(--mono);">
          Source: <a href="https://github.com/scopeblind/scopeblind/tree/main/packages/acta-protocol">@veritasacta/protocol</a> · MIT License
        </p>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Protocol Architecture</h2>
        <p class="docs-section-body">Veritas Acta defines a canonical format for cryptographic evidence of machine decisions. Every receipt is self-contained, independently verifiable, and composable into a typed evidence graph.</p>
        <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;margin:16px 0;">
          <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;"><span style="color:var(--panel-text-dim);">Layer 1: ActaClaims&lt;T&gt;</span>  — Immutable signed claims (issuer signs once, ID is permanent)
<span style="color:var(--panel-text-dim);">Layer 2: ActaReceipt&lt;T&gt;</span> — Claims + post-signature proofs (anchors, witnesses, disclosures)</pre>
        </div>
        <p class="docs-section-body">The <code style="font-family:var(--mono);font-size:12px;background:var(--panel-bg);padding:2px 6px;border-radius:3px;">receipt_id</code> is the SHA-256 hash of the canonical JSON representation of the claims (minus the receipt_id field itself). Proofs (anchors, witness signatures, disclosure proofs) are attached <strong>after</strong> signing and do <strong>not</strong> change the receipt_id.</p>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Canonical Envelope</h2>
        <div class="docs-table">
          <div class="docs-row docs-row-header">
            <span class="docs-cell-type">Field</span>
            <span class="docs-cell-desc">Type</span>
            <span class="docs-cell-states">Description</span>
          </div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">acta_version</span><span class="docs-cell-desc"><code>"0.1"</code></span><span class="docs-cell-states">Protocol version</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">receipt_type</span><span class="docs-cell-desc">string</span><span class="docs-cell-states">e.g. <code>acta:decision</code></span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">receipt_id</span><span class="docs-cell-desc">string</span><span class="docs-cell-states">Content-addressed: sha256(canonical(claims \\ receipt_id))</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">event_id</span><span class="docs-cell-desc">string</span><span class="docs-cell-states">Stable ID for the underlying event</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">issuer_id</span><span class="docs-cell-desc">string</span><span class="docs-cell-states">Who signed this receipt</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">subject_id</span><span class="docs-cell-desc">string</span><span class="docs-cell-states">Who/what this is about</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">event_time</span><span class="docs-cell-desc">ISO 8601</span><span class="docs-cell-states">When the event happened</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">signed_time</span><span class="docs-cell-desc">ISO 8601</span><span class="docs-cell-states">When the receipt was signed</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">edges</span><span class="docs-cell-desc">Edge[]</span><span class="docs-cell-states">Typed references to other receipts</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">payload_digest</span><span class="docs-cell-desc">string</span><span class="docs-cell-states">SHA-256 of the payload</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-family:var(--mono);font-size:11px;">payload</span><span class="docs-cell-desc">T</span><span class="docs-cell-states">Receipt-specific data</span></div>
        </div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Typed Edge Relations (v0.1)</h2>
        <p class="docs-section-body">Receipts reference each other via typed edges, forming a directed acyclic graph.</p>
        <div class="docs-table" style="margin-top:12px;">
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">caused_by</span><span class="docs-cell-desc" style="flex:2;">This receipt was caused by the referenced receipt</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">governed_by</span><span class="docs-cell-desc" style="flex:2;">Decision was governed by this policy-load</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">approved_by</span><span class="docs-cell-desc" style="flex:2;">Action was authorized by this approval</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">observed_by</span><span class="docs-cell-desc" style="flex:2;">Decision was informed by this observation</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">attests_to</span><span class="docs-cell-desc" style="flex:2;">Attestation about the referenced agent</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">supersedes</span><span class="docs-cell-desc" style="flex:2;">This receipt replaces the referenced receipt</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">disputes</span><span class="docs-cell-desc" style="flex:2;">This receipt challenges the referenced receipt</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">resolves</span><span class="docs-cell-desc" style="flex:2;">This receipt resolves a dispute</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">delegated_by</span><span class="docs-cell-desc" style="flex:2;">Authority was delegated by this delegation receipt</span></div>
        </div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Core Receipt Types (v0.1)</h2>
        <div class="docs-table">
          <div class="docs-row docs-row-header">
            <span class="docs-cell-type">Type</span>
            <span class="docs-cell-desc">Purpose</span>
            <span class="docs-cell-states">Key Fields</span>
          </div>
          <div class="docs-row"><span class="docs-cell-type"><span class="badge badge-open">observation</span></span><span class="docs-cell-desc">Agent read or observed a resource</span><span class="docs-cell-states">resource_id, content_hash, method, observer_id</span></div>
          <div class="docs-row"><span class="docs-cell-type"><span class="badge badge-question">policy-load</span></span><span class="docs-cell-desc">Policy was loaded or changed</span><span class="docs-cell-states">policy_hash, policy_version, trigger</span></div>
          <div class="docs-row"><span class="docs-cell-type"><span class="badge badge-evidence">approval</span></span><span class="docs-cell-desc">Human or system authorized an action</span><span class="docs-cell-states">action_hash, approval_method, approver_id</span></div>
          <div class="docs-row"><span class="docs-cell-type"><span class="badge badge-claim">decision</span></span><span class="docs-cell-desc">Gateway allowed or blocked a tool call</span><span class="docs-cell-states">tool_name, decision (allow/deny), agent_id</span></div>
          <div class="docs-row"><span class="docs-cell-type"><span class="badge badge-prediction">execution</span></span><span class="docs-cell-desc">Tool was actually invoked</span><span class="docs-cell-states">tool_name, agent_id, input_hash</span></div>
          <div class="docs-row"><span class="docs-cell-type"><span class="badge badge-update">outcome</span></span><span class="docs-cell-desc">Tool returned a result</span><span class="docs-cell-states">status, output_hash, error_class</span></div>
          <div class="docs-row"><span class="docs-cell-type"><span class="badge badge-challenge">delegation</span></span><span class="docs-cell-desc">Agent granted scoped authority</span><span class="docs-cell-states">delegator_id, delegate_id, scope</span></div>
          <div class="docs-row"><span class="docs-cell-type"><span class="badge badge-resolution">capability-attestation</span></span><span class="docs-cell-desc">Third party attests to agent capability</span><span class="docs-cell-states">attester_id, assessment_type, result</span></div>
        </div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Selective Disclosure</h2>
        <p class="docs-section-body">Fields marked <code style="font-family:var(--mono);font-size:12px;background:var(--panel-bg);padding:2px 6px;border-radius:3px;">string | Commitment</code> may be replaced with a salted commitment:</p>
        <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;margin:12px 0;">
          <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;">commitment = sha256(domain + ":" + salt + ":" + cleartext)

<span style="color:var(--panel-text-dim);">// Example committed field:</span>
{ "commitment": "a1b2c3...", "domain": "acta:tool_name" }

<span style="color:var(--panel-text-dim);">// To reveal: provide the salt + cleartext. Verifier recomputes.</span>
<span style="color:var(--panel-text-dim);">// To shred (GDPR): delete the salt. Hash becomes permanently irreversible.</span></pre>
        </div>
        <p class="docs-section-body">Without the salt, the commitment is computationally infeasible to reverse, even for low-entropy values like tool names. Deleting the salt implements cryptographic shredding — the evidence DAG remains intact, but the PII is permanently gone.</p>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Transparency Anchoring</h2>
        <p class="docs-section-body">Receipts are batched in per-tenant time windows. A Merkle tree is built from the batch, and only the root is anchored to a transparency log (default: <a href="https://rekor.sigstore.dev">Sigstore Rekor</a>).</p>
        <p class="docs-section-body">Each receipt receives an individual Merkle inclusion proof for independent verification. This hides workflow topology (receipt count, timing, shape) while providing per-receipt provability.</p>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Extension Namespaces</h2>
        <p class="docs-section-body">Third parties may define custom receipt types using their own namespace. Custom types use the same <code style="font-family:var(--mono);font-size:12px;background:var(--panel-bg);padding:2px 6px;border-radius:3px;">ActaClaims&lt;T&gt;</code> envelope and are verified identically.</p>
        <div class="docs-table" style="margin-top:12px;">
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">acta:*</span><span class="docs-cell-desc" style="flex:2;">Core protocol types (governance required)</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">blindllm:*</span><span class="docs-cell-desc" style="flex:2;">BlindLLM project types (e.g. blindllm:arena-battle)</span></div>
          <div class="docs-row"><span class="docs-cell-type" style="font-weight:600;font-family:var(--mono);font-size:12px;">&lt;org&gt;:*</span><span class="docs-cell-desc" style="flex:2;">Any organization (self-governed)</span></div>
        </div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Implementation</h2>
        <div class="quickstart-grid">
          <div class="quickstart-card">
            <h3>npm package</h3>
            <p><code style="font-family:var(--mono);font-size:12px;">npm i @veritasacta/protocol</code></p>
            <p>TypeScript. Ed25519. Zero external deps beyond @noble/curves.</p>
          </div>
          <div class="quickstart-card">
            <h3>Conformance tests</h3>
            <p>27 tests across 8 sections. The tests <em>are</em> the specification. Any implementation passing all tests is conformant.</p>
          </div>
          <div class="quickstart-card">
            <h3>Governance</h3>
            <p>Namespace rules, versioning policy, RFC process. See <a href="https://github.com/scopeblind/scopeblind/blob/main/packages/acta-protocol/docs/governance.md">governance.md</a>.</p>
          </div>
        </div>
      </div>

      <div style="margin-top:24px;padding:16px;font-size:13px;color:var(--text-dim);text-align:center;">
        Veritas Acta is an open protocol. <a href="https://github.com/scopeblind/scopeblind/tree/main/packages/acta-protocol">MIT licensed</a>.
      </div>
    </main>
  `);
}

function notFoundPage() {
  return layout('Not Found', `
    <main class="container">
      <div class="empty" style="padding:80px 20px;">
        <h3>404</h3>
        <p><a href="/">Go home</a></p>
      </div>
    </main>
  `);
}

// ── Helpers ──────────────────────────────────────────────────────────

// ── Verify Page ──────────────────────────────────────────────────────

function verifyPage() {
  return layout('Verify', `
    <main class="container">
      <div style="padding:48px 0 24px;">
        <h1 style="font-family:var(--brand);font-size:28px;font-weight:700;letter-spacing:0.02em;margin-bottom:8px;">Verify This Instance</h1>
        <p style="color:var(--text-muted);font-size:15px;line-height:1.6;">Paste an export, signed anchor, or instance manifest to check it in the browser. Then move to offline verification when you need a durable proof artifact.</p>
        <p style="color:var(--text-dim);font-size:13px;line-height:1.65;margin-top:10px;">For ScopeBlind or BlindLLM decision receipts, benchmark bundles, and agent artifacts, use the dedicated verifier at <a href="https://scopeblind.com/verify" style="color:var(--text);">scopeblind.com/verify</a>. This page is for Acta exports, anchors, and manifests.</p>
      </div>

      <div class="verify-lab">
        <div style="margin-bottom:14px;">
          <div style="font-weight:700;font-size:16px;color:var(--text);margin-bottom:6px;">Browser verifier</div>
          <div class="inline-note">Supported inputs: topic export JSON, signed anchor JSON, or the instance manifest. Topic exports and anchors are checked locally in the browser. Manifest checks validate published identity fields and shape.</div>
        </div>
        <div class="verify-input-grid">
          <div>
            <textarea id="browser-verify-input" placeholder='Paste JSON here, for example the output of /api/export/{topic} or /api/anchor/latest'></textarea>
          </div>
          <div class="verify-drop">
            <input id="browser-verify-url" type="text" placeholder="https://veritasacta.com/api/export/your-topic">
            <button class="btn" onclick="runBrowserVerify()">Verify pasted JSON</button>
            <button class="btn-secondary" onclick="loadVerifyUrlIntoLab()">Fetch from URL</button>
            <button class="btn-secondary" onclick="loadVerifySample('manifest')">Load instance manifest</button>
            <button class="btn-secondary" onclick="loadVerifySample('anchor')">Load latest anchor</button>
            <label class="btn-secondary" style="display:flex;align-items:center;justify-content:center;cursor:pointer;">
              Upload JSON file
              <input id="browser-verify-file" type="file" accept="application/json,.json" hidden>
            </label>
          </div>
        </div>
        <div id="browser-verify-output" hidden></div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">What the Manifest Proves</h2>
        <p class="docs-section-body">The <a href="/.well-known/acta-instance.json" style="font-family:var(--mono);font-size:13px;">instance manifest</a> publishes cryptographic hashes of the documents that define this instance's protocol identity:</p>
        <div class="docs-table" style="margin:16px 0;">
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:120px;">Charter</span>
            <span class="docs-cell-desc" style="flex:2;font-family:var(--mono);font-size:11px;word-break:break-all;">3a0f734d87d5d156e550df1361988c398190e72eea40144af8c28379ab5727d9</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:120px;">Protocol Spec</span>
            <span class="docs-cell-desc" style="flex:2;font-family:var(--mono);font-size:11px;word-break:break-all;">d1f90577539dcc127a154f65e9777641499437c1e483ee3729a0eb23d182d82f</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:120px;">Policy</span>
            <span class="docs-cell-desc" style="flex:2;font-family:var(--mono);font-size:11px;word-break:break-all;">3f1e0734c11413a16251572270c9a2d726f82e080cbbf094109a8cbd2011a293</span>
          </div>
        </div>
        <p class="docs-section-body">These hashes prove the instance is <strong>publishing</strong> specific versions of these documents. They do not by themselves prove the instance is <strong>behaving</strong> in conformance with them. An operator could publish the canonical charter and still violate it in code.</p>
        <p class="docs-section-body">To verify a hash: download the document from GitHub, compute <code style="background:var(--surface-2);padding:2px 6px;border-radius:3px;font-size:12px;">shasum -a 256 CHARTER.md</code>, and compare.</p>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">What You Can Check Independently</h2>
        <p class="docs-section-body">These checks require no trust in the operator. You run them yourself.</p>
        <div class="docs-table" style="margin:16px 0;">
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Chain integrity</span>
            <span class="docs-cell-desc" style="flex:2;">Export any topic's chain, recompute every JCS-SHA256 hash, verify linkage. Zero dependencies on operator code.</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Anchor signature</span>
            <span class="docs-cell-desc" style="flex:2;">Verify the Ed25519 signature on daily anchor checkpoints. Recompute the Merkle root from chain heads.</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Document hashes</span>
            <span class="docs-cell-desc" style="flex:2;">Download CHARTER.md, protocol-spec.md, policy.md from GitHub. Compute SHA-256. Compare to manifest.</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Witness posts</span>
            <span class="docs-cell-desc" style="flex:2;">External witness posts on Bluesky are independently timestamped by a third-party platform.</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Source snapshots</span>
            <span class="docs-cell-desc" style="flex:2;">Evidence URLs are snapshotted at submission time with SHA-256. Re-fetch the URL and compare hashes to detect changes.</span>
          </div>
        </div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Fastest Verification Path</h2>
        <div class="quickstart-grid">
          <div class="quickstart-card">
            <h3>1. Quick browser check</h3>
            <p>Paste a topic export or anchor above. This is the fastest way to inspect integrity on mobile or during a review call.</p>
          </div>
          <div class="quickstart-card">
            <h3>2. Export and verify offline</h3>
            <p>Download the topic JSON and run the verifier locally. This removes dependence on operator-served convenience checks.</p>
          </div>
          <div class="quickstart-card">
            <h3>3. Check protocol identity</h3>
            <p>Compare the manifest hashes against the published Charter, Protocol Spec, and Policy. Identity proofs and behavioral proofs are different layers.</p>
          </div>
        </div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">What Is Operator-Served</h2>
        <p class="docs-section-body">These checks run on the operator's infrastructure. They are useful but not independently verifiable without exporting the data first.</p>
        <div class="docs-table" style="margin:16px 0;">
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Topic integrity check</span>
            <span class="docs-cell-desc" style="flex:2;"><code style="background:var(--surface-2);padding:2px 6px;border-radius:3px;font-size:12px;">GET /api/verify?topic={topic}</code> — The operator's server recomputes chain hashes. Trust this only as a convenience.</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Moderation counters</span>
            <span class="docs-cell-desc" style="flex:2;"><code style="background:var(--surface-2);padding:2px 6px;border-radius:3px;font-size:12px;">GET /api/moderation-log</code> — Public counters and receipts, but operator-reported.</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Conformance self-report</span>
            <span class="docs-cell-desc" style="flex:2;"><code style="background:var(--surface-2);padding:2px 6px;border-radius:3px;font-size:12px;">GET /api/conformance</code> — Operator-reported conformance status: protocol identity, anchor, witness, chain integrity. Useful for quick assessment; verify independently with <code style="font-size:12px;">tools/conformance.js</code>.</span>
          </div>
        </div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">How to Verify</h2>

        <div style="margin:20px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">1. Verify a topic chain (independent)</div>
          <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;">
            <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;"><span style="color:var(--panel-text-dim);"># Export the chain (no trust required — just data)</span>
curl https://veritasacta.com/api/export/ai-models-2026 > chain.json

<span style="color:var(--panel-text-dim);"># Run the independent verifier</span>
node tools/verify.js chain.json

<span style="color:var(--panel-text-dim);"># Or verify directly from URL</span>
node tools/verify.js https://veritasacta.com/api/export/ai-models-2026</pre>
          </div>
        </div>

        <div style="margin:20px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">2. Verify the signed anchor (independent)</div>
          <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;">
            <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;"><span style="color:var(--panel-text-dim);"># Verify anchor signature + Merkle root</span>
node tools/verify.js --anchor https://veritasacta.com/api/anchor/latest

<span style="color:var(--panel-text-dim);"># Verify against a known public key</span>
node tools/verify.js --anchor https://veritasacta.com/api/anchor/latest \\
  --key 712e93b514966d66ecbcaef6200689e10a847c315951e824189d4abe70496991</pre>
          </div>
        </div>

        <div style="margin:20px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">3. Verify document hashes (independent)</div>
          <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;">
            <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;"><span style="color:var(--panel-text-dim);"># Download and hash the charter</span>
curl -sL https://raw.githubusercontent.com/VeritasActa/Acta/main/CHARTER.md | shasum -a 256
<span style="color:var(--panel-text-dim);"># Expected: 3a0f734d...27d9</span>

<span style="color:var(--panel-text-dim);"># Download and hash the protocol spec</span>
curl -sL https://raw.githubusercontent.com/VeritasActa/Acta/main/docs/protocol-spec.md | shasum -a 256
<span style="color:var(--panel-text-dim);"># Expected: d1f90577...d82f</span>

<span style="color:var(--panel-text-dim);"># Compare to the manifest</span>
curl -s https://veritasacta.com/.well-known/acta-instance.json | python3 -m json.tool</pre>
          </div>
        </div>

        <div style="margin:20px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">4. Run the conformance checker (independent)</div>
          <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;">
            <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;"><span style="color:var(--panel-text-dim);"># Clone the repo</span>
git clone https://github.com/VeritasActa/acta.git && cd acta

<span style="color:var(--panel-text-dim);"># Run conformance checks against any instance</span>
node tools/conformance.js https://veritasacta.com</pre>
          </div>
        </div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">What This Does Not Prove</h2>
        <p class="docs-section-body">No external check can fully prove behavioral conformance with the charter. An operator who controls the infrastructure can always serve different behavior than what the code declares. What this verification stack provides is:</p>
        <div style="margin:12px 0 0;padding-left:20px;">
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Published identity is checkable</strong> — the charter, spec, and policy hashes are public and independently computable.</p>
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Record integrity is independently verifiable</strong> — export any chain and recompute every hash without trusting the operator.</p>
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Changes to identity are detectable</strong> — if the charter or spec changes, the hash changes, and the manifest must be updated.</p>
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Timestamps are externally witnessed</strong> — Bluesky posts prove the record state existed at a specific time, anchored by a third party.</p>
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Exit does not require permission</strong> — all data is exportable, all tools are MIT-licensed, and compatible implementations can be built independently.</p>
        </div>
        <p class="docs-section-body" style="margin-top:16px;">Protocol identity hashes (charter, protocol spec) and instance policy hash are now bound into every signed anchor. The <a href="/api/conformance" style="color:var(--link);">/api/conformance</a> endpoint provides operator-reported self-assessment. Automated behavioral tests and multi-operator attestation are future work.</p>
      </div>
    </main>
  `);
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function timeAgo(isoDate) {
  if (!isoDate) return '';
  const s = Math.floor((Date.now() - new Date(isoDate)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

// ── Export ───────────────────────────────────────────────────────────

export function renderHTML(page, data = {}) {
  switch (page) {
    case 'home': return homePage(data);
    case 'topic': return topicPage(data);
    case 'about': return aboutPage(data || {});
    case 'docs': return docsPage();
    case 'verify': return verifyPage();
    case 'ontology': return ontologyPage();
    case 'moderation': return moderationLogPage(data);
    case '404': return notFoundPage();
    default: return notFoundPage();
  }
}
