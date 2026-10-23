import release from '../public/release-manifest.json';
import { DOCUMENT_SOURCE_URLS, PROTOCOL_IDENTITY } from './protocol-identity.js';
import { witnessStatus } from './witness-status.js';
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

.docs-section pre { max-width: 100%; overflow-x: auto; }

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
nav a:hover::after, nav a[aria-current="page"]::after { width: 100%; }
nav a:hover { color: var(--ink); text-decoration: none; }
nav a[aria-current="page"] { color: var(--ink); }
header .container { max-width: 1080px; gap: 18px; flex-wrap: wrap; }
nav { display: flex; flex-wrap: wrap; gap: 12px 20px; }
nav a { margin-left: 0; }
.skip-link { position: absolute; left: 16px; top: -80px; padding: 10px 16px; background: var(--surface); color: var(--ink); z-index: 200; }
.skip-link:focus { top: 8px; }
#main, #topics { scroll-margin-top: 120px; }
.home-actions { display: flex; justify-content: center; gap: 12px; margin-top: 28px; flex-wrap: wrap; }
.home-action { display: inline-flex; justify-content: center; align-items: center; min-height: 46px; padding: 12px 24px; border: 1px solid var(--ink); border-radius: 6px; font-size: 14px; font-weight: 600; background: var(--ink); color: var(--bg); }
.home-action:hover { background: var(--text-muted); color: var(--bg); }
.home-action.secondary { background: transparent; color: var(--text); border-color: var(--border); }
.home-action.secondary:hover { background: var(--surface); border-color: var(--border-hover); }
.protocol-overview { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--rad); overflow: hidden; margin-bottom: 40px; }
.protocol-overview > div { min-width: 0; overflow-wrap: anywhere; }
.site-footer-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 32px; text-align: left; margin-bottom: 32px; }
@media (max-width: 760px) { .protocol-overview { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .site-footer-grid { grid-template-columns: 1fr 1fr; gap: 24px; } .site-footer-grid > :first-child { grid-column: 1 / -1; } header nav { display: grid; grid-template-columns: repeat(4,max-content); gap: 4px 18px; } header nav a { display: inline-flex; align-items: center; min-height: 30px; } }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { animation: none !important; transition: none !important; } }

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

/* Built on Acta: visually distinct showcase cards */
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
    .catch(() => { /* silent: non-critical */ });
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
  const openRecord = () => {
    const record = document.getElementById('topics');
    if (!record) return;
    const viewingRecord = location.hash === '#topics';
    if (viewingRecord) record.open = true;
    for (const link of document.querySelectorAll('nav a[href="/"], nav a[href="/#topics"]')) {
      if (link.getAttribute('href') === (viewingRecord ? '/#topics' : '/')) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  };
  openRecord();
  window.addEventListener('hashchange', openRecord);
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

export function layout(title, body, { extraCss = '', script = CLIENT_JS, module = '', offline = false, active = '' } = {}) {
  const activePage = active || ({
    'Signed receipts for machine decisions, verifiable by anyone': '/',
    Charter: '/about', Documentation: '/docs', 'Moderation Log': '/moderation-log',
    Blog: '/blog', Verify: '/verify',
  })[title];
  const navLink = (href, label) => `<a href="${href}"${activePage === href ? ' aria-current="page"' : ''}>${label}</a>`;
  const mainBody = body.replace(/<main\b(?![^>]*\bid\s*=)/, '<main id="main"');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | Veritas Acta</title>
  <meta name="description" content="A contestable, checkable public record for humans and AI. Typed contributions, structured challenges, hash-chained ledger, independent verification.">
  <meta property="og:title" content="Veritas Acta: Open Evidence Protocol for Machine Decisions">
  <meta property="og:description" content="A checkable, challengeable record for humans and AI. Explore the Charter and verify a signed receipt in your browser.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://veritasacta.com">
  <meta property="og:image" content="https://veritasacta.com/og-card.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Veritas Acta: Open Evidence Protocol for Machine Decisions">
  <meta name="twitter:description" content="A checkable, challengeable record for humans and AI. Explore the Charter and verify a signed receipt in your browser.">
  <meta name="twitter:image" content="https://veritasacta.com/og-card.png">
  ${offline ? '' : `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">`}
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='4' fill='%2318181b'/%3E%3Ctext x='16' y='23' text-anchor='middle' fill='%23d4d4d8' font-family='Georgia,serif' font-size='16' font-weight='bold' letter-spacing='1'%3EVA%3C/text%3E%3C/svg%3E">
  <style>${extraCss}${offline ? CSS.replace(/@import[^;]+;/g, '') : CSS}</style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Veritas Acta",
    "url": "https://veritasacta.com",
    "logo": "https://veritasacta.com/logo.svg",
    "description": "Open protocol for signed, independently verifiable machine decisions. Two IETF Internet-Drafts. Ed25519 receipts. Multi-model knowledge units.",
    "foundingDate": "2025",
    "sameAs": [
      "https://github.com/VeritasActa",
      "https://bsky.app/profile/veritasacta.bsky.social",
      "https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/"
    ]
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "@veritasacta/verify",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Cross-platform",
    "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
    "url": "https://www.npmjs.com/package/@veritasacta/verify",
    "description": "Offline verification of signed receipts and artifacts. Ed25519 + JCS canonicalization. Apache-2.0.",
    "license": "https://www.apache.org/licenses/LICENSE-2.0",
    "author": {"@type": "Organization", "name": "Veritas Acta", "url": "https://veritasacta.com"}
  }
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="trust-bar">
    <div><span class="tb-label">IETF</span> <a href="https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/" class="tb-value" style="color:var(--panel-text);text-decoration:none;" title="IETF Internet-Draft" target="_blank" rel="noopener">Internet-Draft</a></div>
    <div><span class="tb-label">CRYPTO</span> <span class="tb-value">Ed25519 + JCS (RFC 8785)</span></div>
    <div><span class="tb-label">LICENSE</span> <span class="tb-value">Apache-2.0</span></div>
    <div><span class="tb-label">INSTANCE</span> <span class="tb-status"></span><a href="/.well-known/acta-instance.json" class="tb-value" style="color:var(--panel-text);text-decoration:none;" title="View instance manifest">veritasacta.com</a></div>
  </div>
  <header>
    <div class="container">
      <a href="/" class="logo">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32" style="display:inline-block;vertical-align:middle;border-radius:4px;"><rect width="512" height="512" fill="#f7f8fa"/><text x="256" y="320" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="280" font-weight="700" fill="#0c111d" letter-spacing="8">VA</text></svg>
        <span class="logo-text">Veritas Acta</span>
      </a>
      <nav aria-label="Primary">
        ${navLink('/', 'Home')}
        ${navLink('/about', 'Charter')}
        ${navLink('/#topics', 'Public record')}
        ${navLink('/docs', 'Docs')}
        ${navLink('/verify', 'Verify')}
        ${navLink('/blog', 'Blog')}
        <a href="https://github.com/VeritasActa/acta" target="_blank">GitHub</a>
      </nav>
    </div>
  </header>
  ${mainBody}
  <footer>
    <div class="container">
      <div class="site-footer-grid">
        <div>
          <div style="font-family:var(--brand);font-size:16px;font-weight:700;letter-spacing:0.06em;margin-bottom:12px;color:var(--text);">Veritas Acta</div>
          <p style="font-size:12px;color:var(--text-dim);line-height:1.6;max-width:240px;">A checkable, challengeable record for humans and AI. Open formats, public rules and independent verification.</p>
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
            <a href="/#topics" style="color:var(--text-muted);">Public record</a>
            <a href="/moderation-log" style="color:var(--text-muted);">Moderation log</a>
            <a href="/docs" style="color:var(--text-muted);">Protocol Docs</a>
            <a href="/integrate" style="color:var(--text-muted);">Receipt integration</a>
            <a href="/conformance" style="color:var(--text-muted);">Conformance evidence</a>
            <a href="https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/" target="_blank" style="color:var(--text-muted);">IETF: Receipts</a>
            <a href="https://datatracker.ietf.org/doc/draft-farley-acta-knowledge-units/" target="_blank" style="color:var(--text-muted);">IETF: Knowledge Units</a>
            <a href="https://github.com/VeritasActa/drafts" target="_blank" style="color:var(--text-muted);">Draft Source</a>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <span style="font-size:12px;color:var(--text-dim);">&copy; ${new Date().getFullYear()} Veritas Acta. Open protocol. <a href="/about" style="color:var(--text-muted);">Charter-bound</a>.</span>
        <span style="font-size:12px;color:var(--text-dim);">Verifier ${esc(release.verifier.version)} · <a href="/privacy">Privacy</a> · <a href="/maintainers">Maintainers</a></span>
        <a href="#" style="font-size:11px;font-family:var(--mono);color:var(--text-dim);text-transform:uppercase;letter-spacing:0.04em;">Back to top &uarr;</a>
      </div>
    </div>
  </footer>
  ${script ? `<script>${script}</script>` : ''}
  ${module ? `<script type="module" src="${module}"></script>` : ''}
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
  const latestEntry = data.latestEntry || null;
  const totalEntries = topics.reduce((sum, t) => sum + (t.entry_count || 0), 0);
  const witness = witnessStatus(anchor, data.latestWitness);
  const witnessDate = data.latestWitness?.witnessed_at;
  const witnessDateLabel = witnessDate && Number.isFinite(Date.parse(witnessDate))
    ? new Date(witnessDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : null;
  const witnessSummary = witness.freshness === 'current'
    ? 'The latest anchor has a reported external publication.'
    : witness.freshness === 'behind'
      ? 'The latest anchor is awaiting a witness report.'
      : witness.freshness === 'not_reported'
        ? 'No external witness publication has been reported.'
        : 'Coverage of the latest anchor cannot be determined.';

  // ── Charter + Verifier homepage ──
  // The charter defines what this protocol IS.
  // The verifier checks signed records under independently supplied keys.
  // Everything else is secondary.
  return layout('Signed receipts for machine decisions, verifiable by anyone', `
    <main class="container">

      <!-- The protocol: what shipped and what anyone can check -->
      <div class="hero">
        <h1>Signed receipts for<br>machine decisions,<br><span class="hero-accent">verifiable by anyone.</span></h1>
        <p>A checkable, challengeable record for humans and AI. Signed receipts let others inspect what was recorded and detect changes.</p>
        <div class="home-actions">
          <a href="/verify?sample=current" class="home-action">Try a signed receipt</a>
          <a href="/about" class="home-action secondary">Read the Charter</a>
        </div>
      </div>

      <h2 class="section-header">The protocol, as it stands</h2>
      <p class="section-subhead">The receipt format is an individual IETF Internet-Draft. Receipts use Ed25519 signatures over canonical JSON (RFC 8785). Verification checks the signed bytes under a separately obtained issuer key; it does not establish the truth or completeness of a record.</p>
      <div class="protocol-overview">
        <div style="padding:16px 18px;background:var(--surface);">
          <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:4px;">The specification</div>
          <div style="font-size:13px;color:var(--text-dim);line-height:1.55;"><a href="https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/">draft-farley-acta-signed-receipts</a>, revision 03 on the IETF datatracker: the envelope, the signing input, the chain hash rule, the policy digest rule, the evidence predicate, and the rule that a key carried inside a receipt is never a trust anchor. Sources in <a href="https://github.com/VeritasActa/drafts">VeritasActa/drafts</a>.</div>
        </div>
        <div style="padding:16px 18px;background:var(--surface);">
          <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:4px;">The verifier</div>
          <div style="font-size:13px;color:var(--text-dim);line-height:1.55;"><a href="https://www.npmjs.com/package/@veritasacta/verify">@veritasacta/verify</a> (Apache-2.0): receipts, chains, standards, run manifests, decisions, provenance, and attestations, checked offline. It reports one of three outcomes, valid, invalid, or not checked with the reason, and never adopts a key from the receipt it is checking.</div>
        </div>
        <div style="padding:16px 18px;background:var(--surface);">
          <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:4px;">The conformance corpus</div>
          <div style="font-size:13px;color:var(--text-dim);line-height:1.55;"><a href="https://github.com/ScopeBlind/agent-governance-testvectors">agent-governance-testvectors</a>: fixed tool calls under a fixed policy, receipts checked against the schema, the verifier under a trust-anchored key, and the chain and outcome rules. Inspect the named implementations, fixtures and exact CI runs in the <a href="/conformance">conformance record</a>.</div>
        </div>
      </div>

      <h2 class="section-header">Where it is used</h2>
      <p class="section-subhead"><a href="https://scopeblind.com">ScopeBlind</a> writes a standard for an AI agent in plain English, compiles it to the policy a gate enforces, and hands whoever relies on the work a record of Acta receipts they check in the browser. Published runs, including a six-agent demonstration measured at the services, are in <a href="https://github.com/ScopeBlind/verified-runs">verified-runs</a>.</p>

      <!-- The charter: the public-record programme this protocol was written for -->
      <h2 class="section-header">The charter: what the record is for</h2>
      <p class="section-subhead">The receipts exist to serve a contestable, checkable public record for humans and AI: information systems that can be captured, by profit, politics, or unilateral control, distort what participants know. The ten invariants below define that record. The mechanisms that enforce them will evolve; the commitments do not. <a href="/about">Read the full Charter</a>.</p>

      <h2 class="section-header">Permanent Invariants</h2>
      <p class="section-subhead">These define what Acta is. If any cease to be true, the system is no longer Acta. The mechanisms that enforce them will evolve. The commitments do not.</p>

      <div style="display:flex;flex-direction:column;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--rad);overflow:hidden;margin-bottom:48px;">
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">1</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">Contributions are typed, each with an explicit burden</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">A question has no evidence burden. A claim requires evidence. A prediction requires resolution criteria.</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">2</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">Every object has authorship provenance and revision history</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">Who contributed it, when, in response to what, how it has been updated: all publicly readable.</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">3</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">Claims and decisions can be challenged</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">No contribution and no moderation decision is beyond challenge. The mechanism is structural and always available.</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">4</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">No entity can dominate attention through scale</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">No participant can use volume or resource advantage to drown out others.</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">5</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">Agents are disclosed delegates, not default peers</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">AI agents participate as disclosed delegates, marked at the protocol level, accountable to a principal.</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">6</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">The record maintains integrity</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">No entity, including the operator, can silently alter the record. Removal is explicit and auditable. Integrity is independently verifiable.</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">7</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">Resolution and supersession are explicit</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">When a prediction resolves or a claim is superseded, the transition is visible, auditable, and challengeable.</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">8</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">No automated system exercises epistemic discretion</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">Automated systems classify and enforce rules. They do not adjudicate truth. Epistemic judgments require accountable human action.</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">9</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">Core procedures are public, versioned, and equally applied</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">Rules governing participation, moderation, and visibility are documented, versioned, and applied by procedure.</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:14px 18px;background:var(--surface);">
          <span style="font-family:var(--brand);font-size:18px;font-weight:700;color:var(--ink);width:24px;text-align:right;flex-shrink:0;">10</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">Verification and exit do not depend on operator permission</div>
            <div style="font-size:13px;color:var(--text-dim);line-height:1.55;">Anyone can independently verify the record, export data, and build compatible implementations without relying on any single operator.</div>
          </div>
        </div>
      </div>

      <!-- Verify : prove it yourself -->
      <div style="padding:32px;background:var(--surface);border:1px solid var(--border);border-radius:var(--rad);text-align:center;margin-bottom:48px;">
        <h2 style="font-family:var(--brand);font-size:22px;margin-bottom:8px;">Don\u2019t trust us. Verify.</h2>
        <p style="color:var(--text-muted);font-size:14px;line-height:1.6;margin-bottom:20px;max-width:480px;margin-left:auto;margin-right:auto;">
          Invariant 10 says verification cannot depend on operator permission.
          Receipt verification runs in your browser; receipt contents and supplied keys are not uploaded. Loading the page contacts this host.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <a href="/verify" style="display:inline-block;padding:12px 28px;background:var(--ink);color:var(--bg);border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;">Open the verifier</a>
          <div style="display:inline-block;padding:12px 20px;border:1px solid var(--border);border-radius:6px;font-family:var(--mono);font-size:13px;color:var(--text-muted);max-width:100%;overflow-wrap:anywhere;">npx @veritasacta/verify@${release.verifier.version} receipt.json --key YOUR_TRUSTED_PUBLIC_KEY</div>
        </div>
      </div>

      <!-- Specifications -->
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:48px;">
        <a href="https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--surface);border:1px solid var(--border);border-radius:999px;font-family:var(--mono);font-size:11px;color:var(--text-muted);text-decoration:none;">
          <span style="color:var(--amber);font-weight:600;">IETF</span> draft-farley-acta-signed-receipts <span style="color:var(--text-dim);margin-left:4px;">(-${release.standards[0].revision})</span>
        </a>
        <a href="https://datatracker.ietf.org/doc/draft-farley-acta-knowledge-units/" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--surface);border:1px solid var(--border);border-radius:999px;font-family:var(--mono);font-size:11px;color:var(--text-muted);text-decoration:none;">
          <span style="color:var(--amber);font-weight:600;">IETF</span> draft-farley-acta-knowledge-units <span style="color:var(--text-dim);">(expired ${release.standards[1].expired_at})</span>
        </a>
        <a href="https://github.com/VeritasActa/agt-integration-profile" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--surface);border:1px solid var(--border);border-radius:999px;font-family:var(--mono);font-size:11px;color:var(--text-muted);text-decoration:none;">
          <span style="color:var(--blue);font-weight:600;">AGT</span> Integration Profile
        </a>
        <a href="https://github.com/VeritasActa/Acta" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--surface);border:1px solid var(--border);border-radius:999px;font-family:var(--mono);font-size:11px;color:var(--text-muted);text-decoration:none;">
          Apache-2.0 \u00b7 GitHub
        </a>
      </div>

      <!-- The public record remains directly addressable, including an empty instance. -->
      <details id="topics">
        <summary style="font-size:13px;font-weight:500;color:var(--text-dim);cursor:pointer;padding:8px 0;">
          Public record · ${topics.length} topics, ${totalEntries} entries
        </summary>
        <p style="font-size:13px;color:var(--text-muted);margin:12px 0;">${witnessDateLabel ? `Last witness report: ${esc(witnessDateLabel)} (UTC). ` : ''}${witnessSummary} <a href="/api/conformance">Inspect instance status</a>. Publication reports are separate from signature verification.</p>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">
          ${topics.map(t => `
            <a href="/topic/${encodeURIComponent(t.topic)}" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:6px;text-decoration:none;color:var(--text);font-size:13px;">
              <span>${esc(t.topic)}</span>
              <span style="color:var(--text-dim);font-size:12px;">${t.entry_count}</span>
            </a>
          `).join('') || '<p style="font-size:14px;color:var(--text-muted);">No public topics are available yet.</p>'}
        </div>
      </details>
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
    <p style="font-size:11px;color:var(--text-dim);margin-bottom:10px;">Per-pseudonym prediction accuracy. Pseudonyms are topic-scoped: the same contributor has different IDs on different topics.</p>
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
  // Chain integrity is preserved: duplicates still exist in the ledger.
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
      ${dupCount > 0 ? `<div style="padding:10px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--rad);font-size:12px;color:var(--text-dim);font-family:var(--mono);margin-bottom:16px;">${dupCount} duplicate contribution${dupCount > 1 ? 's' : ''} hidden. Chain integrity preserved: <a href="/api/export/${encodeURIComponent(topic)}">export full chain</a> to see all entries.</div>` : ''}
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
  const charterHtml = renderCharterMarkdown(charterMd)
    .replaceAll('href="./docs/policy.md"', `href="${DOCUMENT_SOURCE_URLS.policy}"`)
    .replaceAll('href="./docs/protocol-spec.md"', `href="${DOCUMENT_SOURCE_URLS.protocol_spec}"`);

  return layout('Charter', `
    <main class="container" style="padding-top:40px;">
      <div class="charter-content">
        ${charterHtml}
      </div>
      <p style="font-size:13px;color:var(--text-dim);text-align:center;">Protocol ${PROTOCOL_IDENTITY.protocol_version} edition · <a href="${DOCUMENT_SOURCE_URLS.charter}">Read the exact source</a> · <a href="/.well-known/acta-instance.json">Document fingerprints</a></p>
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
        Protocol spec: <a href="${DOCUMENT_SOURCE_URLS.protocol_spec}">protocol-spec.md</a> ·
        Policy: <a href="${DOCUMENT_SOURCE_URLS.policy}">policy.md</a>
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

    // Empty line: close paragraph
    if (trimmed === '') {
      if (inParagraph) { html += '</p>'; inParagraph = false; }
      continue;
    }

    // Bold-numbered invariant line (e.g., **1. Title**)
    if (trimmed.match(/^\*\*\d+\./)) {
      if (inParagraph) { html += '</p>'; inParagraph = false; }
      html += '<div class="invariant"><div class="invariant-text">' + inlineMd(trimmed) + '</div></div>';
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
        <p style="color:var(--text-muted);font-size:14px;">Public-record protocol specification, API reference, and verification guide. <a href="/integrate">Signed-receipt integration</a>.</p>
      </div>

      <div class="quickstart-grid">
        <div class="quickstart-card">
          <h3>Use the record first</h3>
          <p>Browse public topics, follow a claim and its responses, and export a topic's complete chain.</p>
          <a href="/#topics">Browse the public record →</a>
        </div>
        <div class="quickstart-card">
          <h3>Verify in the browser or offline</h3>
          <p>Check individual signed receipts in the browser. Export topic chains and use the offline chain tools described below for the public record.</p>
          <a href="/verify?sample=current">Try a signed receipt →</a>
        </div>
        <div class="quickstart-card">
          <h3>Integrate via API or MCP</h3>
          <p>Read through the REST API or MCP server. Publishing requires an identity and follows the record's contribution rules.</p>
          <a href="#api">Jump to API reference →</a>
        </div>
      </div>

      <section id="hands-on" class="docs-section"><h2 class="docs-section-title">Check a real signed example</h2><p>The protocol verifier uses the published receipt engine. Try the current sample, change its payload, then remove the key to see the different outcomes.</p><a class="btn-secondary" href="/verify?sample=current">Try the signed receipt</a></section>

      <section id="quickstart" class="docs-section">
        <h2 class="docs-section-title">Export and check the public record</h2>
        <p class="docs-section-body">With Git and Node.js 22 or later installed, run this in a new directory. It downloads the public source and a topic export, then checks the export locally. It does not publish anything.</p>
        <pre id="docs-readonly-quickstart" style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;">git clone --depth 1 https://github.com/VeritasActa/Acta.git
cd Acta
npm ci
curl --fail --silent --show-error \\
  https://veritasacta.com/api/export/acta-protocol \\
  --output chain.json
node tools/verify.js chain.json</pre>
        <p class="docs-section-body">A successful check prints <strong>Chain intact</strong>. This checks the hashes and linkage in the supplied export. To establish an operator-signed checkpoint, also verify an anchor against a key obtained through a separate trusted channel, as shown below.</p>
      </section>

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
        <p class="docs-section-body" style="margin-top:12px;">State transitions are computed from the response graph, not stored as mutable fields. A claim moves to "contested" when a structurally valid challenge is linked to it. This is deterministic: anyone can recompute the state from the chain.</p>
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
            <span class="docs-cell-desc">Claims, predictions, questions, or a challenge (to answer it)</span>
            <span class="docs-cell-states">Source URL, stance (supporting / refuting / contextual)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-challenge">challenge</span></span>
            <span class="docs-cell-desc">Claims, predictions</span>
            <span class="docs-cell-states">Target assertion (exact quote), basis (counter_evidence / logical_error / source_unreliable / missing_context), argument (min 20 chars)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-update">update</span></span>
            <span class="docs-cell-desc">Your own claims and predictions, or a challenge to one of them (to answer it)</span>
            <span class="docs-cell-states">Author only. Update type (correction / additional_context / scope_change)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type"><span class="badge badge-resolution">resolution</span></span>
            <span class="docs-cell-desc">Questions, predictions</span>
            <span class="docs-cell-states">Outcome, source, resolution type (confirmed / refuted / answered). A prediction only on or after its resolution date</span>
          </div>
        </div>
        <p class="docs-section-body" style="margin-top:12px;">Challenges have a 7-day shot clock. An unanswered challenge keeps the claim contested. Once it is answered with refuting evidence or an update from the claim's author, it stops counting 7 days later. Claims never resolve: they can only be superseded or contested. This is by design: factual claims don't have binary outcomes.</p>
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
          <p style="font-size:13px;color:var(--text-muted);line-height:1.65;">The daily job is scheduled for midnight UTC to compute a Merkle root of the chain heads, sign it with an Ed25519 key, and publish an anchor. External witnessing publishes the anchor on Bluesky. Check the latest anchor and witness dates in the <a href="/api/conformance">instance status</a>; a configured witness does not mean the latest anchor has been witnessed.</p>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--rad);padding:20px;margin:16px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">Protocol identity</div>
          <p style="font-size:13px;color:var(--text-muted);line-height:1.65;margin-bottom:8px;">The <a href="/.well-known/acta-instance.json">instance manifest</a> publishes SHA-256 hashes of the three documents that define this instance's identity: the Charter, Protocol Spec, and Policy. Anyone can independently compute these hashes and compare.</p>
          <p style="font-size:13px;color:var(--text-muted);line-height:1.65;">These hashes prove <strong>published identity</strong>, not full behavioral conformance. See <a href="/verify">/verify</a> for what can and cannot be checked.</p>
        </div>
        <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;margin:16px 0;">
          <div style="color:var(--panel-text-dim);font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Check a signed anchor</div>
          <pre id="docs-anchor-quickstart" style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;"><span style="color:var(--panel-text-dim);"># In the cloned repository, set ACTA_ISSUER_KEY to a trusted 64-character hex key.</span>
<span style="color:var(--panel-text-dim);"># Obtain it independently; do not copy it from the anchor being checked.</span>
: "\${ACTA_ISSUER_KEY:?Set an independently obtained issuer public key}"
curl --fail --silent --show-error \\
  https://veritasacta.com/api/anchor/latest \\
  --output anchor.json
node tools/verify.js --anchor anchor.json --key "$ACTA_ISSUER_KEY"</pre>
        </div>
        <p class="docs-section-body">The anchor check verifies its signature and Merkle root. It is separate from checking a topic export's internal chain. <a href="/conformance">Conformance evidence</a> lists implementation tests; <a href="/api/conformance">/api/conformance</a> is an operator-reported status, not an independent certification.</p>
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
          <div style="color:var(--panel-text-dim);font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Publishing example: an identified agent asks a question</div>
          <p style="color:var(--panel-text);font-size:13px;line-height:1.65;margin-bottom:12px;">This writes to the chosen instance. Set its URL and a fresh ES256-signed DPoP identity proof from your client first. Use a test instance while integrating; a successful production contribution becomes part of the public record.</p>
          <pre id="docs-contribution-example" style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;">: "\${ACTA_INSTANCE_URL:?Set the instance you intend to publish to}"
: "\${ACTA_DPOP_PROOF:?Set a fresh DPoP identity proof from your client}"
curl --fail-with-body --request POST "$ACTA_INSTANCE_URL/api/contribute" \\
  -H "Content-Type: application/json" \\
  -H "DPoP: $ACTA_DPOP_PROOF" \\
  -d '{
    <span style="color:var(--panel-text-bright);">"type"</span>: "question",
    <span style="color:var(--panel-text-bright);">"topic"</span>: "your-topic",
    <span style="color:var(--panel-text-bright);">"payload"</span>: {
      "body": "What evidence would resolve this question?"
    }
  }'</pre>
        </div>
      </div>

      <div id="identity" class="docs-section">
        <h2 class="docs-section-title">Identity & Budget</h2>
        <p class="docs-section-body">Production writes require an identity. An agent client sends a <code>DPoP</code> header containing a fresh ES256-signed proof with its public JWK. A supported browser integration can instead provide a ScopeBlind pass-token through an <code>sb_token</code> cookie or an <code>Authorization: Bearer sb_…</code> header. The current server rejects requests without a recognised identity with <code>401 identity_required</code>. See the <a href="https://github.com/VeritasActa/Acta/blob/main/src/identity.js">identity implementation</a> when configuring a client; a device label is not a cryptographic credential.</p>
        <p class="docs-section-body">The current instance budget grants human identities 10 tokens and agent identities 4 tokens per UTC day, shared across topics. Contributions cost 2 tokens; responses cost 1. These are instance policy settings rather than protocol constants.</p>
        <p class="docs-section-body">Public entries use a pseudonym derived for each identity and topic. Device IDs are kept out of the public ledger, but the operator uses the underlying identity for budgets; this is not anonymity from the operator.</p>
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
        <p class="docs-section-body" style="margin-top:12px;">Provenance is included in the payload hash: it becomes part of the immutable record. This enables future compose features and agent authorship transparency without requiring disclosure.</p>
      </div>

      <div id="mcp" class="docs-section">
        <h2 class="docs-section-title">MCP Server (AI Agents)</h2>
        <p class="docs-section-body">The <a href="https://github.com/VeritasActa/acta-mcp">acta-mcp</a> server lets AI agents query and contribute to the record. Add this server configuration to your MCP client:</p>
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
            <span class="docs-cell-desc" style="flex:2;">Find actionable work: contested records, claims needing evidence, approaching resolutions</span>
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
        <p class="docs-section-body" style="margin-top:12px;">Set <code>ACTA_INSTANCE_URL</code> to choose an instance (default: veritasacta.com). Query and export tools do not need a publishing identity. Before enabling write tools, confirm the client supplies the <a href="#identity">required identity</a>. An <code>ACTA_DEVICE_ID</code> label is a development convenience, not a substitute for that authentication.</p>
      </div>

      <div id="source" class="docs-section">
        <h2 class="docs-section-title">Source & Specifications</h2>
        <div class="docs-table">
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Charter</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/Acta/blob/main/CHARTER.md">CHARTER.md</a>: permanent invariants, mission, what the system is</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Protocol Spec</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/Acta/blob/main/docs/protocol-spec.md">protocol-spec.md</a>: schemas, state machines, chain format</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Policy</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/Acta/blob/main/docs/policy.md">policy.md</a>: moderation tiers, budget rules, rate limits</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Source Code</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/Acta">github.com/VeritasActa/Acta</a>: Apache-2.0 license, Cloudflare Workers</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Offline Verifier</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/acta/blob/main/tools/verify.js">tools/verify.js</a>: recompute all hashes and verify anchors</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Conformance Evidence</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="/conformance">Conformance record</a>: named implementations, fixtures, and CI results</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Instance Manifest</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="/.well-known/acta-instance.json">/.well-known/acta-instance.json</a>: passive federation discovery</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">MCP Server</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="https://github.com/VeritasActa/acta-mcp">acta-mcp</a>: AI agent interface (contribute, query, discover, verify, export)</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;">Conformance Status</span>
            <span class="docs-cell-desc" style="flex:3;"><a href="/api/conformance">/api/conformance</a>: operator-reported self-assessment (cached, 5min)</span>
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
          Source: <a href="https://github.com/VeritasActa/Acta">@veritasacta/protocol</a> · Apache-2.0
        </p>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">Protocol Architecture</h2>
        <p class="docs-section-body">Veritas Acta defines a canonical format for cryptographic evidence of machine decisions. Every receipt is self-contained, independently verifiable, and composable into a typed evidence graph.</p>
        <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;margin:16px 0;">
          <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;"><span style="color:var(--panel-text-dim);">Layer 1: ActaClaims&lt;T&gt;</span> : Immutable signed claims (issuer signs once, ID is permanent)
<span style="color:var(--panel-text-dim);">Layer 2: ActaReceipt&lt;T&gt;</span>: Claims + post-signature proofs (anchors, witnesses, disclosures)</pre>
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
        <p class="docs-section-body">Without the salt, the commitment is computationally infeasible to reverse, even for low-entropy values like tool names. Deleting the salt implements cryptographic shredding: the evidence DAG remains intact, but the PII is permanently gone.</p>
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
            <p>Namespace rules, versioning policy, RFC process. See <a href="https://github.com/VeritasActa/Acta/blob/main/docs/policy.md">governance.md</a>.</p>
          </div>
        </div>
      </div>

      <div style="margin-top:24px;padding:16px;font-size:13px;color:var(--text-dim);text-align:center;">
        Veritas Acta is an open protocol. <a href="https://github.com/VeritasActa/Acta">Apache-2.0 licensed</a>.
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
            <span class="docs-cell-desc" style="flex:2;"><code style="background:var(--surface-2);padding:2px 6px;border-radius:3px;font-size:12px;">GET /api/verify?topic={topic}</code>: The operator's server recomputes chain hashes. Trust this only as a convenience.</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Moderation counters</span>
            <span class="docs-cell-desc" style="flex:2;"><code style="background:var(--surface-2);padding:2px 6px;border-radius:3px;font-size:12px;">GET /api/moderation-log</code>: Public counters and receipts, but operator-reported.</span>
          </div>
          <div class="docs-row">
            <span class="docs-cell-type" style="font-weight:600;min-width:180px;">Conformance self-report</span>
            <span class="docs-cell-desc" style="flex:2;"><code style="background:var(--surface-2);padding:2px 6px;border-radius:3px;font-size:12px;">GET /api/conformance</code>: Operator-reported conformance status: protocol identity, anchor, witness, chain integrity. Useful for quick assessment; verify independently with <code style="font-size:12px;">tools/conformance.js</code>.</span>
          </div>
        </div>
      </div>

      <div class="docs-section">
        <h2 class="docs-section-title">How to Verify</h2>

        <div style="margin:20px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">1. Verify a topic chain (independent)</div>
          <div style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--rad);padding:16px;">
            <pre style="color:var(--panel-text);font-family:var(--mono);font-size:12px;line-height:1.6;margin:0;"><span style="color:var(--panel-text-dim);"># Export the chain (no trust required: just data)</span>
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
node tools/verify.js --anchor https://veritasacta.com/api/anchor/latest --key YOUR_INDEPENDENTLY_OBTAINED_PUBLIC_KEY

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
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Published identity is checkable</strong>: the charter, spec, and policy hashes are public and independently computable.</p>
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Record integrity is independently verifiable</strong>: export any chain and recompute every hash without trusting the operator.</p>
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Changes to identity are detectable</strong>: if the charter or spec changes, the hash changes, and the manifest must be updated.</p>
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Timestamps are externally witnessed</strong>: Bluesky posts prove the record state existed at a specific time, anchored by a third party.</p>
          <p class="docs-section-body" style="margin-bottom:8px;">• <strong>Exit does not require permission</strong>: all data is exportable, all tools are MIT-licensed, and compatible implementations can be built independently.</p>
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

function blogPage() {
  return layout('Blog', `
    <main class="container">
      <div style="padding:48px 0 24px;">
        <h1 style="font-family:var(--brand);font-size:28px;font-weight:700;letter-spacing:0.02em;margin-bottom:8px;">Blog</h1>
        <p style="color:var(--text-muted);font-size:15px;line-height:1.6;">Technical deep-dives on the Veritas Acta evidence protocol, cryptographic receipts, and verifiable machine decisions.</p>
      </div>

      <article id="x-algorithm-receipts" style="margin-bottom:48px;padding:24px;border-radius:12px;border:1px solid var(--border);background:var(--surface);">
        <div style="margin-bottom:12px;">
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;">receipts</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">recommender-systems</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">xai</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">transparency</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">verifiable-execution</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:6px;">Open source shows what could run. Receipts prove what did run.</h2>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">16 May 2026 &middot; 6 min read &middot; reference implementation</p>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">Reference implementation of the recommender-system profile of <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">draft-farley-acta-signed-receipts</code>, demonstrated against xAI's published For You algorithm. Originally posted at <a href="https://scopeblind.com/blog/x-algorithm-receipts" style="color:var(--accent);">scopeblind.com/blog/x-algorithm-receipts</a>.</p>

        <div style="font-size:13px;color:var(--text-muted);line-height:1.7;">
          <p>When xAI published the For You feed algorithm to <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">xai-org/x-algorithm</code> on 15 May 2026, the headline was transparency. The release answers a real question: what code is candidate to run when X ranks your timeline?</p>
          <p style="margin-top:12px;">It doesn't answer the next one: <strong style="color:var(--text);">was this code, in this version, with these model artifacts and this config, what ran when your feed was ranked at 09:24 this morning?</strong></p>
          <p style="margin-top:12px;">That's not a complaint. Publishing the code is genuinely useful. But "the code is open" and "this output came from that code" are different claims. The first is a property of the repository. The second is a property of a specific execution. Closing the gap between them is what cryptographic execution receipts do.</p>

          <div style="margin:16px 0;padding:14px 16px;border-radius:8px;border:1px solid var(--border);background:var(--surface-2);">
            <p style="font-size:13px;font-weight:600;color:var(--text);margin:0 0 4px 0;">What this proves: execution binding, not ranking quality.</p>
            <p style="font-size:12px;color:var(--text-muted);margin:0;">The receipt proves a specific output was bound to specific code, model artifacts, config, and input commitments at signing time. It does not prove the output is fair, truthful, or beneficial.</p>
          </div>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">What the gap looks like</h3>
          <p>A recommender ranking is a function of four things: the code (the ranker source, version-controlled); the model artifacts (trained weights, ONNX/torchscript files); the configuration (feature flags, thresholds, A/B assignments); and the input (the user's interaction features at ranking time).</p>
          <p style="margin-top:12px;">The output is an ordered list of items. The published repo gives you (1). It does not give you a way to bind any specific output to a specific (1, 2, 3, 4) tuple. Without that binding, "the algorithm is open" can be true while the running system uses different weights, a tweaked config, or a different code path entirely. Nobody is accusing anyone of doing that. The point is that the open repo, on its own, cannot rule it out.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">What a receipt binds</h3>
          <p>A post-ranking receipt is a small signed object emitted after the ranker runs. It commits to: <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">algorithm_commit</code> (git SHA of the running code), <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">model_artifacts</code> (SHA-256 of every loaded model file), <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">config_hash</code>, <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">input_commitment</code> (Merkle root over user features, private), <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">output_root</code> (Merkle root over the ranked output), and an optional <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">opened_outputs</code> disclosure of top-N items.</p>
          <p style="margin-top:12px;">Signed once with Ed25519. Wire format is RFC 8785 (JCS) over the payload. Verification is offline; no vendor cloud required.</p>
          <p style="margin-top:12px;">The receipt does not reveal the user's private history. It commits to it. An authorised auditor with the right opening can verify the commitment matches the data they hold. Everyone else sees only that something was committed, and that the ranking was produced by exactly that code, models, and config.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The worked example</h3>
          <p><a href="https://github.com/VeritasActa/x-algorithm-receipts" style="color:var(--accent);">VeritasActa/x-algorithm-receipts</a> is an Apache-2.0 wrapper around the published Phoenix pipeline. It ships two execution paths: a mock mode that generates a synthetic Phoenix-style ranking event and signs it (instant verification, no 2.9 GB artifact download), and a real mode that runs <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">phoenix/run_pipeline.py</code> against a local clone of <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">xai-org/x-algorithm</code> with the upstream artifacts in place.</p>
          <pre style="background:#0c111d;color:#e6e3d5;padding:12px;border-radius:6px;font-family:monospace;font-size:12px;overflow-x:auto;margin:12px 0;"><code>npm install
npm run demo
npx @veritasacta/verify examples/x-feed-demo.receipt.json --jwks examples/demo.jwks
node scripts/inspect-receipt.mjs examples/x-feed-demo.receipt.json</code></pre>
          <p>Three commands. No accounts, no API keys, no cloud calls. The verifier is open-source Apache-2.0 on npm (<code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">@veritasacta/verify</code>). The receipt format is documented as an active IETF Internet-Draft (<code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">draft-farley-acta-signed-receipts</code>).</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">Real mode and reproducibility</h3>
          <p>The repo ships a real-mode receipt at <a href="https://github.com/VeritasActa/x-algorithm-receipts/blob/main/examples/x-feed-real.receipt.json" style="color:var(--accent);">examples/x-feed-real.receipt.json</a>, bound to a real ranking pass against <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">xai-org/x-algorithm@0bfc2795</code>. The wrapper executed <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">uv run run_pipeline.py</code> against the actual Phoenix artifacts, hashed 212 source files plus 8 model/config/corpus artifacts, committed to exact stdout lines, parsed 30 Phoenix ranked rows into structured records, and signed the event.</p>
          <p style="margin-top:12px;">A reproducibility pair lives in <a href="https://github.com/VeritasActa/x-algorithm-receipts/tree/main/examples/reproducibility-pair" style="color:var(--accent);">examples/reproducibility-pair/</a>: two independent runs with the same input produce identical <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">input_commitment</code>, <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">output_root</code>, and <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">ranked_items_root</code>, while the timestamps and signatures differ as expected. This demonstrates how reproducibility can be made cryptographically checkable when the same input and artifacts are re-run. Whether a production recommender is itself reproducible is a property of that system, not of the receipt.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">Tamper detection</h3>
          <p>Flip one character anywhere in the signed payload and the verifier rejects the receipt with a spec-cited error (<code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">invalid_signature</code>, draft-farley-acta-signed-receipts-03 &sect;6.1). There is no way to selectively edit the payload without re-signing it, and re-signing requires the private key held by the original issuer.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">What this proves, and what it doesn't</h3>
          <p>Receipts prove that a specific output came from a specific code, model, config, and input. They do not prove the output is fair, truthful, beneficial, that the model was trained on legally sourced data, or that the algorithm is good for users. Those are different audit problems. They require different methods. Conflating them is how "AI governance" becomes vague enough to mean nothing.</p>
          <p style="margin-top:12px;">What receipts do solve is the substrate. You cannot answer fairness, truthfulness, or social benefit questions until you can first answer "is the thing you measured the thing that actually ran." Today, for production recommender systems, the answer is no. The receipt closes that one specific gap, precisely.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">Browser verifier</h3>
          <p>Drop a receipt and JWKS at <a href="https://www.scopeblind.com/verify-receipt" style="color:var(--accent);">scopeblind.com/verify-receipt</a> to verify in your browser. Pure client-side, no servers contacted.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">Where this fits</h3>
          <p>Cryptographic execution receipts are not a recommender-specific idea. The same primitive shows up across AI agent decisions (Lesson 18 of <a href="https://github.com/microsoft/ai-agents-for-beginners/tree/main/18-securing-ai-agents" style="color:var(--accent);">microsoft/ai-agents-for-beginners</a>, AWS <a href="https://github.com/cedar-policy/cedar-for-agents" style="color:var(--accent);">cedar-for-agents</a> policy-evaluation traces), supply chain readings, SLSA-aligned software provenance, and ScopeBlind's own continuous-control attestations (<a href="https://www.scopeblind.com/trust/ledger" style="color:var(--accent);">scopeblind.com/trust/ledger</a>). The wire format is the same in every case. The recommender profile (<code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">recommender.post_ranking.v1</code>) is one of several profiles being standardised through the IETF.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">A caveat</h3>
          <p>Receipts are an engineering primitive, not a regulatory artifact. Whether a deployment of receipt-emitting recommenders satisfies DSA Article 27, AI Act Article 12, or any specific national requirement depends on retention, access control, the auditor's authority, and the regulator's view. Do not read this post as legal advice. Read it as: here is a working cryptographic layer you can adopt or extend.</p>

          <div style="margin-top:24px;padding-top:12px;border-top:1px solid var(--border);font-size:11px;color:var(--text-muted);">
            Also on: <a href="https://scopeblind.com/blog/x-algorithm-receipts" style="color:var(--text-muted);">ScopeBlind</a> &middot;
            <a href="https://github.com/VeritasActa/x-algorithm-receipts" style="color:var(--text-muted);">VeritasActa/x-algorithm-receipts</a> &middot;
            <a href="https://www.npmjs.com/package/@veritasacta/verify" style="color:var(--text-muted);">@veritasacta/verify</a> &middot;
            <a href="https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/" style="color:var(--text-muted);">IETF draft</a> &middot;
            <a href="https://www.scopeblind.com/verify-receipt" style="color:var(--text-muted);">browser verifier</a>
          </div>
        </div>
      </article>

      <article id="cedar-for-agents-merge" style="margin-bottom:48px;padding:24px;border-radius:12px;border:1px solid var(--border);background:var(--surface);">
        <div style="margin-bottom:12px;">
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;">cedar</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">aws</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">receipts</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">standards</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:6px;">Cedar Meets Signed Receipts: The Agent Governance Keystone</h2>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">AWS merged the JS/TS WASM toolchain for Cedar-for-agents this week. Combined with Ed25519 signed receipts, the policy and audit layers for AI agent tool calls are now complete.</p>

        <div style="font-size:13px;color:var(--text-muted);line-height:1.7;">
          <p>This week, <a href="https://github.com/cedar-policy/cedar-for-agents/pull/73" style="color:var(--accent);">PR #73</a> merged into AWS <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">cedar-policy/cedar-for-agents</code>. Together with the already-merged #64, it closes the JS/TS toolchain gap for Cedar-based agent authorization. Any agent host (Claude Code, Cursor, MCP gateway, custom runtime) can now adopt Cedar policy-as-code with three function calls, without pulling a Rust compiler into its build.</p>
          <p style="margin-top:12px;">Paired with Ed25519 signed receipts in the Veritas Acta format, the policy and audit layers for AI agent tool calls are now genuinely complete.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The three-step pipeline</h3>
          <p>Cedar-for-agents is now a three-function WASM API:</p>
          <ul style="padding-left:20px;margin:8px 0;list-style:disc;">
            <li><code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">generateSchema(stub, tools, config)</code> - build-time: produce a Cedar schema from MCP tool descriptions (merged in #64)</li>
            <li><code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">generateRequest(stub, tools, input, ...)</code> - runtime: construct a Cedar authorization request from a tool-call's actual inputs (merged in #73)</li>
            <li><code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">isAuthorized(request, schema, policies)</code> - runtime: evaluate the request against your policy set (already in cedar-wasm)</li>
          </ul>
          <p style="margin-top:12px;">Three calls. Any JS or TS runtime. No Rust toolchain required for the consuming host.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">Where receipts fit</h3>
          <p>Cedar decides. It does not enforce, audit, or explain itself after the fact. That is where the receipt layer lives.</p>
          <p style="margin-top:12px;">A signed receipt is a JCS-canonical, Ed25519-signed record of a single policy evaluation. The receipt captures the principal, action, resource, context, decision, and policy-set hash that produced the decision. Receipts chain via a parent hash so a whole session's decision log is tamper-evident end-to-end. Any auditor can verify the chain offline, against a public key, with no vendor infrastructure in the path.</p>
          <p style="margin-top:12px;">The composition is structural: Cedar is the authority at decision time; receipts are the permanent record of what the authority decided. Policy failures (a forbid that fires) produce a signed denial receipt. Policy passes (a permit) produce a signed authorization receipt. Both are cryptographically identical in shape; a reviewer rebuilding the session from receipts sees exactly the sequence of decisions the agent operated under.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">What this unlocks</h3>
          <ul style="padding-left:20px;margin:8px 0;list-style:disc;">
            <li><strong style="color:var(--text);">Portable policies</strong> - a Cedar policy written against <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">Agent::Action::open</code> works in any agent host that imports the canonical schema.</li>
            <li><strong style="color:var(--text);">Framework-native authorization</strong> - Claude Code, Cursor, LangChain, CrewAI, MCP gateways can all evaluate the same policy with the same Cedar semantics.</li>
            <li><strong style="color:var(--text);">Standards-grade audit</strong> - every decision produces an offline-verifiable receipt in an IETF Internet-Draft format with an open-source reference verifier.</li>
            <li><strong style="color:var(--text);">Cross-framework conformance</strong> - a receipt produced by protect-mcp (Node), protect-mcp-adk (Python), sb-runtime (Rust), or APS verifies against the same reference CLI.</li>
          </ul>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The canonical community schema</h3>
          <p>During review, the Cedar team made the scope boundary explicit: Cedar core does not maintain domain-specific schemas. Domain vocabularies live in community repos that downstream systems import. This matches the pattern established in Cedar <a href="https://github.com/cedar-policy/rfcs/pull/58" style="color:var(--accent);">RFC #58</a> and <a href="https://github.com/cedar-policy/rfcs/pull/69" style="color:var(--accent);">#69</a>.</p>
          <p style="margin-top:12px;">So we opened <a href="https://github.com/VeritasActa/cedar-agent-schemas" style="color:var(--accent);">VeritasActa/cedar-agent-schemas</a>, the canonical community-maintained Cedar schema library for agent action verbs. Four verbs (exec, open, connect, request_tool), five entity types, three reference policies, TypeScript bindings, OWASP Agentic Top 10 mapping. Apache-2.0. Downstream systems import it as their shared vocabulary; operator policies become portable without each framework re-inventing the schema.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">What is next</h3>
          <ul style="padding-left:20px;margin:8px 0;list-style:disc;">
            <li><strong style="color:var(--text);">Decision attestation RFC</strong> - proposing two optional fields on Cedar's authorization response (<code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">decision_id</code>, <code style="font-family:monospace;background:rgba(45,212,191,0.08);padding:1px 4px;border-radius:3px;">policy_set_hash</code>) so downstream receipt-emitters can bind decisions to canonical identifiers.</li>
            <li><strong style="color:var(--text);">in-toto Decision Receipt predicate</strong> - formalizing decision receipts as an in-toto attestation predicate (<a href="https://github.com/in-toto/attestation/pull/549" style="color:var(--accent);">in-toto/attestation#549</a>).</li>
            <li><strong style="color:var(--text);">OpenSSF Security Insights field</strong> - <a href="https://github.com/ossf/security-insights/issues/171" style="color:var(--accent);">SIEP discussion</a> on a self-declared agent-usage field, co-authored with aeoess.</li>
          </ul>

          <p style="margin-top:12px;">Each move pushes the protocol layer closer to being a standards-grade, framework-neutral substrate for agent authorization and audit.</p>

          <div style="margin-top:24px;padding-top:12px;border-top:1px solid var(--border);font-size:11px;color:var(--text-muted);">
            Also on: <a href="https://scopeblind.com/blog/cedar-for-agents-merge" style="color:var(--text-muted);">ScopeBlind</a> &middot;
            <a href="https://github.com/cedar-policy/cedar-for-agents/pull/73" style="color:var(--text-muted);">PR #73</a> &middot;
            <a href="https://github.com/VeritasActa/cedar-agent-schemas" style="color:var(--text-muted);">cedar-agent-schemas</a> &middot;
            <a href="https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/" style="color:var(--text-muted);">IETF draft</a>
          </div>
        </div>
      </article>

      <article style="margin-bottom:48px;padding:24px;border-radius:12px;border:1px solid var(--border);background:var(--surface);">
        <div style="margin-bottom:12px;">
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;">architecture</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">verification</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">comparison</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:6px;">How Veritas Acta Differs from Blockchain-Based Audit Trails</h2>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">Blockchains solve consensus between untrusted parties. AI agent governance needs something different: portable evidence from a trusted process.</p>

        <div style="font-size:13px;color:var(--text-muted);line-height:1.7;">
          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The question everyone asks</h3>
          <p>If you build a system for tamper-evident records, the first question you hear is always the same: why not use a blockchain?</p>
          <p style="margin-top:12px;">It is a fair question. Blockchains are the most widely known technology for append-only, tamper-evident data structures. They have been battle-tested across financial systems, supply chains, and identity registries. They solve a real and important problem.</p>
          <p style="margin-top:12px;">But the problem they solve is not the problem AI agent governance presents. The two problems look similar on the surface -- both involve immutable records and cryptographic verification -- but their operational requirements diverge in ways that matter enormously at deployment scale.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">What blockchains provide</h3>
          <p>A blockchain is fundamentally a consensus mechanism. It solves the problem of getting multiple parties who do not trust each other to agree on a shared state without a central authority. This requires:</p>
          <ul style="padding-left:20px;margin:8px 0;list-style:disc;">
            <li><strong style="color:var(--text);">Distributed consensus</strong> -- a protocol (proof of work, proof of stake, or some variant) that forces agreement across a network of independent validators.</li>
            <li><strong style="color:var(--text);">Global ordering</strong> -- a single canonical sequence of transactions that every participant accepts.</li>
            <li><strong style="color:var(--text);">Append-only immutability</strong> -- once a block is confirmed, rewriting it requires controlling a majority of the network's computational or economic weight.</li>
            <li><strong style="color:var(--text);">Censorship resistance</strong> -- no single party can prevent a valid transaction from eventually being included.</li>
          </ul>
          <p style="margin-top:12px;">These properties are genuinely valuable when they are needed. Financial settlement between competing institutions, for example, is a textbook case for distributed consensus. The cost and latency of consensus are justified because the alternative -- trusting a single intermediary -- introduces unacceptable counterparty risk.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">What AI agent governance actually needs</h3>
          <p>Now consider what an AI agent audit trail requires. An enterprise deploys an agent that can read files, call APIs, modify databases, and make policy-gated decisions. The governance question is: can a third party verify, after the fact, that the agent made a specific decision under a specific policy at a specific time?</p>
          <p style="margin-top:12px;">The operational requirements for this are sharply different from distributed consensus:</p>
          <ul style="padding-left:20px;margin:8px 0;list-style:disc;">
            <li><strong style="color:var(--text);">Per-decision attestation</strong> -- every tool call, every policy evaluation, every delegation step gets its own signed receipt. An agent making 10,000 decisions per hour needs 10,000 receipts per hour.</li>
            <li><strong style="color:var(--text);">Offline verification</strong> -- a compliance auditor, a regulator, or a downstream agent needs to verify a receipt without connecting to any network. No RPC endpoint, no light client, no node sync.</li>
            <li><strong style="color:var(--text);">Instant verification</strong> -- signature checks must complete in milliseconds, not block confirmation periods. Agents operate at machine speed; the evidence layer cannot be the bottleneck.</li>
            <li><strong style="color:var(--text);">Portable evidence</strong> -- receipts are JSON files that can be emailed, archived, attached to tickets, stored in S3, or embedded in regulatory filings. They are not trapped in an on-chain data model.</li>
            <li><strong style="color:var(--text);">Privacy by default</strong> -- an agent governance receipt may contain sensitive data: tool arguments, internal policy rules, delegation chains. Selective disclosure -- revealing only the fields relevant to a specific audit -- is a hard requirement, not a nice-to-have. Public ledgers are the wrong default.</li>
            <li><strong style="color:var(--text);">Zero marginal cost</strong> -- there is no gas fee, no token, no per-transaction charge for verification. The verifier is MIT-licensed. Running it costs CPU cycles and nothing else.</li>
          </ul>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The architectural comparison</h3>
          <div class="docs-table" style="margin:16px 0;">
            <div class="docs-row docs-row-header">
              <span class="docs-cell-type" style="min-width:180px;">Property</span>
              <span class="docs-cell-desc">Blockchain</span>
              <span class="docs-cell-desc">Veritas Acta</span>
            </div>
            <div class="docs-row">
              <span class="docs-cell-type" style="min-width:180px;">Consensus</span>
              <span class="docs-cell-desc">Required (PoW/PoS)</span>
              <span class="docs-cell-desc">Not needed -- single signer per receipt</span>
            </div>
            <div class="docs-row">
              <span class="docs-cell-type" style="min-width:180px;">Verification latency</span>
              <span class="docs-cell-desc">Seconds to minutes</span>
              <span class="docs-cell-desc">Milliseconds</span>
            </div>
            <div class="docs-row">
              <span class="docs-cell-type" style="min-width:180px;">Verification cost</span>
              <span class="docs-cell-desc">Gas fees</span>
              <span class="docs-cell-desc">Free (offline Ed25519 check)</span>
            </div>
            <div class="docs-row">
              <span class="docs-cell-type" style="min-width:180px;">Network requirement</span>
              <span class="docs-cell-desc">Yes (full or light node)</span>
              <span class="docs-cell-desc">None -- fully offline</span>
            </div>
            <div class="docs-row">
              <span class="docs-cell-type" style="min-width:180px;">Privacy</span>
              <span class="docs-cell-desc">Public by default</span>
              <span class="docs-cell-desc">Selective disclosure</span>
            </div>
            <div class="docs-row">
              <span class="docs-cell-type" style="min-width:180px;">Evidence format</span>
              <span class="docs-cell-desc">On-chain data</span>
              <span class="docs-cell-desc">Portable JSON files</span>
            </div>
            <div class="docs-row">
              <span class="docs-cell-type" style="min-width:180px;">Token required</span>
              <span class="docs-cell-desc">Usually</span>
              <span class="docs-cell-desc">Never</span>
            </div>
            <div class="docs-row">
              <span class="docs-cell-type" style="min-width:180px;">Verification tool</span>
              <span class="docs-cell-desc">Blockchain client</span>
              <span class="docs-cell-desc"><code style="font-size:11px;">npx @veritasacta/verify</code> (MIT)</span>
            </div>
          </div>
          <p style="margin-top:12px;">The table is not a scorecard. Blockchains are not worse at these properties by accident; they make different tradeoffs because they solve a different problem. Consensus is expensive because achieving agreement across untrusted parties is inherently expensive. Veritas Acta avoids that cost because it does not attempt to solve the multi-party consensus problem.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">When you do need a blockchain</h3>
          <p>There are real use cases where distributed consensus is the correct tool:</p>
          <ul style="padding-left:20px;margin:8px 0;list-style:disc;">
            <li><strong style="color:var(--text);">Multi-party settlement</strong> -- when multiple organizations need to agree on a shared state and no single party is trusted to maintain it. Financial clearing houses, cross-border payment rails, and multi-tenant supply chain registries are canonical examples.</li>
            <li><strong style="color:var(--text);">Global censorship resistance</strong> -- when the goal is to ensure that no government, corporation, or coalition can suppress a valid record. This matters for dissident speech, whistleblower protection, and certain forms of identity.</li>
            <li><strong style="color:var(--text);">Decentralized coordination</strong> -- when participants need to execute shared logic (smart contracts) without trusting any single executor.</li>
          </ul>
          <p style="margin-top:12px;">If your threat model is that the signer of the receipt might be compromised or colluding, and there is no out-of-band way to establish trust in the signer, then a consensus mechanism provides guarantees that a single-signer model cannot.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">When you need Veritas Acta instead</h3>
          <p>Most AI agent governance scenarios involve a different trust topology. An enterprise runs its own agents. It signs receipts with its own keys. The question is not whether the enterprise and some external counterparty can agree on what happened. The question is whether the enterprise can produce evidence that an independent auditor can verify without trusting the enterprise's infrastructure.</p>
          <p style="margin-top:12px;">This is the single-signer evidence model, and it covers the majority of real-world agent governance needs:</p>
          <ul style="padding-left:20px;margin:8px 0;list-style:disc;">
            <li><strong style="color:var(--text);">Single-organization audit trails</strong> -- an enterprise proving to a regulator that its agents operated within policy.</li>
            <li><strong style="color:var(--text);">Agent-to-agent delegation proof</strong> -- when Agent A delegates a task to Agent B, the delegation receipt proves the chain of authority. The receiving agent verifies the receipt offline before acting.</li>
            <li><strong style="color:var(--text);">Regulatory compliance evidence</strong> -- EU AI Act logging requirements, SOC 2 evidence of controls, and sector-specific audit mandates. Regulators need verifiable evidence files, not blockchain explorer links.</li>
            <li><strong style="color:var(--text);">Air-gapped environments</strong> -- defense, healthcare, and critical infrastructure systems that operate without internet connectivity. Offline verification is not optional in these contexts; it is a deployment requirement.</li>
            <li><strong style="color:var(--text);">Privacy-preserving evidence</strong> -- selective disclosure lets an organization prove that a policy decision occurred without revealing the policy content, the tool arguments, or other sensitive fields. Public ledgers make this substantially harder.</li>
          </ul>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">They compose, not compete</h3>
          <p>Veritas Acta and blockchains are not mutually exclusive. The protocol explicitly supports optional temporal anchoring: a signed receipt can be anchored to a transparency log (Sigstore/Rekor) or a blockchain to provide independent proof that the receipt existed at a specific time.</p>
          <p style="margin-top:12px;">The key architectural insight is that the receipt works without the anchor. The Ed25519 signature provides integrity and authenticity. The hash chain provides ordering within a single issuer's sequence. The anchor adds a third property -- temporal proof from an independent party -- but this is an optional layer, not a prerequisite for verification.</p>
          <p style="margin-top:12px;">This means an organization can start with pure offline receipts and add anchoring later as its compliance requirements evolve. The verification tools handle both cases. There is no migration, no reformatting, and no change to the receipt schema.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The bottom line</h3>
          <p>Blockchains solve the problem of agreement between untrusted parties. Veritas Acta solves the problem of evidence from a trusted process. Most AI agent governance is the second problem, not the first.</p>
          <p style="margin-top:12px;">When an enterprise needs to prove that its agent made a specific decision under a specific policy at a specific time, it does not need global consensus. It needs a signed receipt that anyone can verify offline, instantly, for free. That is what the protocol provides.</p>

          <p style="margin-top:16px;color:var(--text);font-weight:600;">Verify it yourself: <a href="/verify" style="color:var(--accent);">browser lab</a> or <code style="font-size:12px;background:var(--panel-bg);padding:2px 6px;border-radius:3px;">npx @veritasacta/verify receipt.json</code></p>
        </div>

        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);font-size:10px;color:var(--text-dim);">
          2026-04-05 &middot; 8 min read &middot; Tom Farley
        </div>
      </article>

      <article style="margin-bottom:48px;padding:24px;border-radius:12px;border:1px solid var(--border);background:var(--surface);">
        <div style="margin-bottom:12px;">
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;">receipts</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">verification</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">blindllm</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:6px;">How BlindLLM Uses Signed Receipts to Prove AI Comparison Results</h2>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">Every AI benchmark today operates on trust. We built the infrastructure to replace trust with cryptographic proof.</p>

        <div style="font-size:13px;color:var(--text-muted);line-height:1.7;">
          <p>Every week, a new AI benchmark drops. A new leaderboard shuffles. A new startup claims their model "outperforms GPT-4 on reasoning tasks" with a screenshot of a cherry-picked example. And every week, the same question goes unasked: <em style="color:var(--text);">how do you know?</em></p>

          <p style="margin-top:12px;">AI model comparisons today operate on trust. You trust the evaluator ran the test fairly. You trust the prompts weren't tuned to favor one model. There is no cryptographic proof, no audit trail, no way for a third party to independently verify that the comparison happened the way it was described.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The blind comparison problem</h3>
          <p>Consider what a trustworthy AI comparison requires:</p>
          <ol style="padding-left:20px;margin:8px 0;">
            <li><strong style="color:var(--text);">Blindness</strong>: Neither the user nor the models should know which is "A" vs "B".</li>
            <li><strong style="color:var(--text);">Immutability</strong>: Results cannot be altered without detection.</li>
            <li><strong style="color:var(--text);">Verifiability</strong>: A third party can confirm the comparison happened as described.</li>
            <li><strong style="color:var(--text);">Completeness</strong>: The record captures the full decision chain.</li>
          </ol>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The three-layer architecture</h3>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0;">
            <div style="padding:12px;border-radius:8px;border:1px solid var(--panel-border);background:var(--bg);">
              <div style="font-size:12px;font-weight:700;color:var(--text);">BlindLLM</div>
              <div style="font-size:10px;color:var(--accent);margin-bottom:4px;">The courtroom</div>
              <div style="font-size:11px;color:var(--text-muted);">Handles prompt routing, blind assignment, judging.</div>
            </div>
            <div style="padding:12px;border-radius:8px;border:1px solid var(--panel-border);background:var(--bg);">
              <div style="font-size:12px;font-weight:700;color:var(--text);">ScopeBlind</div>
              <div style="font-size:10px;color:var(--accent);margin-bottom:4px;">The notary</div>
              <div style="font-size:11px;color:var(--text-muted);">Key issuance, signing policy, runtime controls.</div>
            </div>
            <div style="padding:12px;border-radius:8px;border:1px solid var(--panel-border);background:var(--bg);">
              <div style="font-size:12px;font-weight:700;color:var(--text);">Veritas Acta</div>
              <div style="font-size:10px;color:var(--accent);margin-bottom:4px;">The public record</div>
              <div style="font-size:11px;color:var(--text-muted);">Receipt format, independent verification, open protocol.</div>
            </div>
          </div>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">A concrete receipt</h3>
          <pre style="background:var(--bg);border:1px solid var(--panel-border);border-radius:8px;padding:12px;font-size:11px;overflow-x:auto;color:var(--text-muted);line-height:1.5;"><code>{
  "type": "decision_receipt",
  "prompt_hash": "sha256:9f3a...",
  "participants": ["claude-opus-4", "gpt-4o"],
  "verdict": "B",
  "timestamp": "2026-03-27T14:32:00Z",
  "signature": "ed25519:xK7m..."
}</code></pre>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">Verification without trust</h3>
          <pre style="background:var(--bg);border:1px solid var(--panel-border);border-radius:8px;padding:12px;font-size:11px;overflow-x:auto;color:var(--accent);"><code>npx @veritasacta/verify receipt.json</code></pre>
          <p style="margin-top:8px;">No phone home. No API key. No network access needed. The math either checks out or it doesn't.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The broader pattern</h3>
          <p>BlindLLM is one application of a broader principle: consequential machine decisions should produce verifiable evidence. The Veritas Acta protocol is MIT-licensed. The receipt format is specified in an <a href="https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/" style="color:var(--accent);">IETF Internet-Draft</a>.</p>

          <p style="margin-top:12px;color:var(--text);font-weight:600;">Try it at <a href="https://blindllm.com" style="color:var(--accent);">blindllm.com</a>. Verify the receipts yourself.</p>

          <div style="margin-top:16px;font-size:10px;color:var(--text-dim);">
            Also on: <a href="https://scopeblind.com/blog/how-blindllm-proves-ai-comparisons" style="color:var(--text-muted);">ScopeBlind</a> &middot;
            <a href="https://blindllm.com/blog/how-blindllm-proves-ai-comparisons" style="color:var(--text-muted);">BlindLLM</a>
          </div>
        </div>

        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);font-size:10px;color:var(--text-dim);">
          2026-03-27 &middot; 6 min read &middot; Tom Farley
        </div>
      </article>

      <article style="margin-bottom:48px;padding:24px;border-radius:12px;border:1px solid var(--border);background:var(--surface);">
        <div style="margin-bottom:12px;">
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;">protocol</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">agents</span>
          <span style="font-size:10px;font-family:monospace;color:var(--accent);background:rgba(45,212,191,0.08);padding:2px 6px;border-radius:4px;margin-left:4px;">evidence</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:6px;">Why Agent Decisions Need an Evidence Layer</h2>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">The missing infrastructure between "the agent did something" and "here's independently verifiable proof of what it did."</p>

        <div style="font-size:13px;color:var(--text-muted);line-height:1.7;">
          <p>Every major AI lab ships agent frameworks. Anthropic has tool use. OpenAI has function calling. Google has extensions. They all solve the same problem: letting a language model take action in the world.</p>

          <p style="margin-top:12px;">None of them solve the <em style="color:var(--text);">evidence</em> problem.</p>

          <p style="margin-top:12px;">When an AI agent calls a tool, commits code, transfers money, or modifies a database, the only record of what happened lives in the platform that executed the action. The agent's own logs are controlled by whoever operates the agent. The platform's logs are controlled by the platform. There is no neutral, independently verifiable record of what the agent actually did: or why.</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The trust problem is structural</h3>
          <p>This isn't a bug. It's a missing layer in the stack.</p>
          <p style="margin-top:8px;">Consider the analogy to financial systems. We don't trust banks because they tell us our balance. We trust banks because there are independent auditors, regulatory filings, and reconciliation procedures that let third parties verify the state of the system. The agent ecosystem has none of this.</p>

          <div style="margin:16px 0;padding:14px 16px;border-radius:8px;border:1px solid var(--panel-border);background:var(--bg);">
            <div style="font-size:11px;font-family:var(--mono);color:var(--text-dim);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">The gap</div>
            <div style="font-size:13px;color:var(--text);line-height:1.6;">
              <strong>Platform logs</strong> → controlled by the operator<br>
              <strong>Agent logs</strong> → controlled by whoever deploys the agent<br>
              <strong>Dashboard metrics</strong> → aggregated, not individually verifiable<br>
              <strong style="color:var(--link);">Evidence receipts</strong> → independently verifiable, portable, operator-independent ✓
            </div>
          </div>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">What makes evidence real evidence?</h3>
          <p>Evidence is only trustworthy when it satisfies three properties:</p>
          <ol style="padding-left:20px;margin:8px 0;">
            <li><strong style="color:var(--text);">Integrity</strong>: it can't be silently modified after creation.</li>
            <li><strong style="color:var(--text);">Independence</strong>: verification doesn't require trusting the party that produced it.</li>
            <li><strong style="color:var(--text);">Completeness</strong>: the causal chain is preserved, not just the final outcome.</li>
          </ol>
          <p style="margin-top:8px;">Acta achieves these through hash-chained entries (integrity), open-source verification tools (independence), and typed contribution schemas that capture the full decision lifecycle (completeness).</p>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">Beyond compliance</h3>
          <p>The EU AI Act requires "adequate logging." SOC 2 audits need "evidence of controls." These are the obvious use cases. But the more interesting applications are ones nobody is building for yet:</p>
          <ul style="padding-left:20px;margin:8px 0;list-style:disc;">
            <li><strong style="color:var(--text);">Agent-to-agent trust</strong>: when two agents from different operators need to coordinate, how does one verify the other's past behavior?</li>
            <li><strong style="color:var(--text);">Decision forensics</strong>: when an agent produces an unexpected outcome, the causal receipt chain lets you trace exactly what happened and why.</li>
            <li><strong style="color:var(--text);">Competitive transparency</strong>: when AI companies claim their models outperform competitors, signed receipts let anyone verify those claims independently.</li>
          </ul>

          <h3 style="font-size:17px;font-weight:700;color:var(--text);margin:24px 0 8px;">The protocol approach</h3>
          <p>We could have built a product. Instead we built a protocol: Apache-2.0, with two <a href="https://github.com/VeritasActa/drafts" style="color:var(--accent);">IETF Internet-Drafts</a>, open-source verification tools, and a <a href="/about" style="color:var(--accent);">Charter</a> with permanent invariants that the operator cannot change.</p>
          <p style="margin-top:12px;">Why? Because evidence infrastructure needs to outlast any single company. The evidence layer for agent accountability should be as durable and vendor-neutral as TCP/IP is for networking.</p>

          <p style="margin-top:16px;color:var(--text);font-weight:600;">Start with <a href="/record" style="color:var(--accent);">the public record</a>. <a href="/verify" style="color:var(--accent);">Verify it yourself</a>. Build on top of it.</p>
        </div>

        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);font-size:10px;color:var(--text-dim);">
          2026-03-28 &middot; 5 min read &middot; Tom Farley
        </div>
      </article>
    </main>
  `);
}

export function renderHTML(page, data = {}) {
  switch (page) {
    case 'home': return homePage(data);
    case 'topic': return topicPage(data);
    case 'about': return aboutPage(data || {});
    case 'docs': return docsPage();
    case 'verify': return verifyPage();
    case 'ontology': return ontologyPage();
    case 'blog': return blogPage();
    // blogPage defined below ontologyPage
    case 'moderation': return moderationLogPage(data);
    case '404': return notFoundPage();
    default: return notFoundPage();
  }
}
