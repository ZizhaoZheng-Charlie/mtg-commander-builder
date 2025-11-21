// Import all mana symbol SVG assets using Vite's ?url syntax
import W from '../../assets/W.svg?url';
import U from '../../assets/blueimage.svg?url';
import B from '../../assets/B.svg?url';
import R from '../../assets/R.svg?url';
import G from '../../assets/G.svg?url';
import C from '../../assets/C.svg?url';
import T from '../../assets/T.svg?url';
import X from '../../assets/X.svg?url';
import S from '../../assets/S.svg?url';

// Numbers 0-20
import Mana0 from '../../assets/0.svg?url';
import Mana1 from '../../assets/1.svg?url';
import Mana2 from '../../assets/2.svg?url';
import Mana3 from '../../assets/3.svg?url';
import Mana4 from '../../assets/4.svg?url';
import Mana5 from '../../assets/5.svg?url';
import Mana6 from '../../assets/6.svg?url';
import Mana7 from '../../assets/7.svg?url';
import Mana8 from '../../assets/8.svg?url';
import Mana9 from '../../assets/9.svg?url';
import Mana10 from '../../assets/10.svg?url';
import Mana11 from '../../assets/11.svg?url';
import Mana12 from '../../assets/12.svg?url';
import Mana13 from '../../assets/13.svg?url';
import Mana14 from '../../assets/14.svg?url';
import Mana15 from '../../assets/15.svg?url';
import Mana16 from '../../assets/16.svg?url';
import Mana17 from '../../assets/17.svg?url';
import Mana18 from '../../assets/18.svg?url';
import Mana19 from '../../assets/19.svg?url';
import Mana20 from '../../assets/20.svg?url';

// Hybrid color/color
import BG from '../../assets/BG.svg?url';
import BR from '../../assets/BR.svg?url';
import GU from '../../assets/GU.svg?url';
import GW from '../../assets/GW.svg?url';
import RW from '../../assets/RW.svg?url';
import UB from '../../assets/UB.svg?url';
import UR from '../../assets/UR.svg?url';
import WB from '../../assets/WB.svg?url';
import WU from '../../assets/WU.svg?url';

// Colorless hybrids
import CB from '../../assets/CB.svg?url';
import CG from '../../assets/CG.svg?url';
import CR from '../../assets/CR.svg?url';
import CU from '../../assets/CU.svg?url';
import CW from '../../assets/CW.svg?url';

// 2-cost hybrids
import Mana2B from '../../assets/2B.svg?url';
import Mana2G from '../../assets/2G.svg?url';
import Mana2R from '../../assets/2R.svg?url';
import Mana2U from '../../assets/2U.svg?url';
import Mana2W from '../../assets/2W.svg?url';

// Phyrexian
import BP from '../../assets/BP.svg?url';
import GP from '../../assets/GP.svg?url';
import RP from '../../assets/RP.svg?url';
import UP from '../../assets/UP.svg?url';
import WP from '../../assets/WP.svg?url';

// Phyrexian hybrids
import BGP from '../../assets/BGP.svg?url';
import BRP from '../../assets/BRP.svg?url';
import GUP from '../../assets/GUP.svg?url';
import GWP from '../../assets/GWP.svg?url';
import RGP from '../../assets/RGP.svg?url';
import RWP from '../../assets/RWP.svg?url';
import UBP from '../../assets/UBP.svg?url';
import URP from '../../assets/URP.svg?url';
import WBP from '../../assets/WBP.svg?url';
import WUP from '../../assets/WUP.svg?url';

/**
 * Map of mana symbol keys to their imported SVG paths
 */
export const manaSymbolAssets = {
  // Basic colors
  w: W,
  u: U,
  b: B,
  r: R,
  g: G,
  c: C,

  // Special
  t: T,
  tap: T,
  x: X,
  s: S,

  // Numbers
  0: Mana0,
  1: Mana1,
  2: Mana2,
  3: Mana3,
  4: Mana4,
  5: Mana5,
  6: Mana6,
  7: Mana7,
  8: Mana8,
  9: Mana9,
  10: Mana10,
  11: Mana11,
  12: Mana12,
  13: Mana13,
  14: Mana14,
  15: Mana15,
  16: Mana16,
  17: Mana17,
  18: Mana18,
  19: Mana19,
  20: Mana20,

  // Hybrid color/color
  bg: BG,
  gb: BG,
  br: BR,
  rb: BR,
  gu: GU,
  ug: GU,
  gw: GW,
  wg: GW,
  rw: RW,
  wr: RW,
  ub: UB,
  bu: UB,
  ur: UR,
  ru: UR,
  wb: WB,
  bw: WB,
  wu: WU,
  uw: WU,

  // Colorless hybrids
  cb: CB,
  bc: CB,
  cg: CG,
  gc: CG,
  cr: CR,
  rc: CR,
  cu: CU,
  uc: CU,
  cw: CW,
  wc: CW,

  // 2-cost hybrids
  '2b': Mana2B,
  b2: Mana2B,
  '2g': Mana2G,
  g2: Mana2G,
  '2r': Mana2R,
  r2: Mana2R,
  '2u': Mana2U,
  u2: Mana2U,
  '2w': Mana2W,
  w2: Mana2W,

  // Phyrexian
  bp: BP,
  pb: BP,
  gp: GP,
  pg: GP,
  rp: RP,
  pr: RP,
  up: UP,
  pu: UP,
  wp: WP,
  pw: WP,

  // Phyrexian hybrids
  bgp: BGP,
  gbp: BGP,
  brp: BRP,
  rbp: BRP,
  gup: GUP,
  ugp: GUP,
  gwp: GWP,
  wgp: GWP,
  rgp: RGP,
  grp: RGP,
  rwp: RWP,
  wrp: RWP,
  ubp: UBP,
  bup: UBP,
  urp: URP,
  rup: URP,
  wbp: WBP,
  bwp: WBP,
  wup: WUP,
  uwp: WUP,
};

/**
 * Get the asset URL for a mana symbol
 * @param {string} symbolKey - The lowercase mana symbol key (e.g., 'cw', 'br', '2')
 * @returns {string|null} The asset URL or null if not found
 */
export function getManaSymbolAsset(symbolKey) {
  return manaSymbolAssets[symbolKey.toLowerCase()] || null;
}
