import { getManaSymbolAsset } from './manaAssets';

/**
 * Parses MTG mana cost strings and converts them to HTML with styled mana symbols
 * @param {string} manaCost - The mana cost string (e.g., "{2}{W}{U}")
 * @returns {string} HTML string with styled mana symbols
 */
export function parseManaSymbols(manaCost) {
  if (!manaCost) return '';

  // Replace mana symbols with styled spans
  return (
    manaCost
      // Three-part hybrid mana (e.g., {G/U/P}, {B/R/P}) - convert to lowercase
      .replace(/\{(\w+)\/(\w+)\/(\w+)\}/gi, (match, first, second, third) => {
        const symbolKey = `${first.toLowerCase()}${second.toLowerCase()}${third.toLowerCase()}`;
        const assetUrl = getManaSymbolAsset(symbolKey);
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc; font-size: 8px; font-weight: bold;`;
        return `<span style="${style}" title="${first}/${second}/${third}">${assetUrl ? '' : `${first}/${second}/${third}`}</span>`;
      })
      // Two-part hybrid mana (e.g., {W/U}, {2/W}, {B/R}) - convert to lowercase
      .replace(/\{(\w+)\/(\w+)\}/gi, (match, first, second) => {
        const symbolKey = `${first.toLowerCase()}${second.toLowerCase()}`;
        const assetUrl = getManaSymbolAsset(symbolKey);
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc; font-size: 10px; font-weight: bold;`;
        return `<span style="${style}" title="${first}/${second}">${assetUrl ? '' : `${first}/${second}`}</span>`;
      })
      // Snow mana
      .replace(/\{S\}/gi, () => {
        const assetUrl = getManaSymbolAsset('s');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc; font-size: 10px;`;
        return `<span style="${style}" title="Snow">${assetUrl ? '' : 'S'}</span>`;
      })
      // Tap symbol
      .replace(/\{T\}/gi, () => {
        const assetUrl = getManaSymbolAsset('t');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc; font-size: 10px;`;
        return `<span style="${style}" title="Tap">${assetUrl ? '' : '⟳'}</span>`;
      })
      // Untap symbol
      .replace(
        /\{Q\}/gi,
        '<span style="width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold;" title="Untap">Q</span>'
      )
      // Energy symbol
      .replace(
        /\{E\}/gi,
        '<span style="width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold;" title="Energy">E</span>'
      )
      // Variable mana (X, Y, Z)
      .replace(/\{X\}/gi, () => {
        const assetUrl = getManaSymbolAsset('x');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold;`;
        return `<span style="${style}" title="X">${assetUrl ? '' : 'X'}</span>`;
      })
      .replace(
        /\{Y\}/gi,
        '<span style="width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold;" title="Y">Y</span>'
      )
      .replace(
        /\{Z\}/gi,
        '<span style="width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold;" title="Z">Z</span>'
      )
      // Colored mana (W, U, B, R, G, C)
      .replace(/\{W\}/gi, () => {
        const assetUrl = getManaSymbolAsset('w');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #f8f6d8; font-size: 10px; font-weight: bold; color: #000;`;
        return `<span style="${style}" title="White">${assetUrl ? '' : 'W'}</span>`;
      })
      .replace(/\{U\}/gi, () => {
        const assetUrl = getManaSymbolAsset('u');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #aae0fa; font-size: 10px; font-weight: bold; color: #000;`;
        return `<span style="${style}" title="Blue">${assetUrl ? '' : 'U'}</span>`;
      })
      .replace(/\{B\}/gi, () => {
        const assetUrl = getManaSymbolAsset('b');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc2c0; font-size: 10px; font-weight: bold; color: #000;`;
        return `<span style="${style}" title="Black">${assetUrl ? '' : 'B'}</span>`;
      })
      .replace(/\{R\}/gi, () => {
        const assetUrl = getManaSymbolAsset('r');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #f9aa8f; font-size: 10px; font-weight: bold; color: #000;`;
        return `<span style="${style}" title="Red">${assetUrl ? '' : 'R'}</span>`;
      })
      .replace(/\{G\}/gi, () => {
        const assetUrl = getManaSymbolAsset('g');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #9bd3ae; font-size: 10px; font-weight: bold; color: #000;`;
        return `<span style="${style}" title="Green">${assetUrl ? '' : 'G'}</span>`;
      })
      .replace(/\{C\}/gi, () => {
        const assetUrl = getManaSymbolAsset('c');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold;`;
        return `<span style="${style}" title="Colorless">${assetUrl ? '' : 'C'}</span>`;
      })
      // Generic/Colorless mana (numbers 0-20)
      .replace(/\{(\d+)\}/g, (match, num) => {
        const assetUrl = getManaSymbolAsset(num);
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold; color: #333;`;
        return `<span style="${style}" title="${num}">${assetUrl ? '' : num}</span>`;
      })
      // Cleanup any remaining braces
      .replace(/[{}]/g, '')
  );
}

/**
 * Extracts mana symbols from a mana cost string
 * @param {string} manaCost - The mana cost string
 * @returns {string[]} Array of mana symbols
 */
export function extractManaSymbols(manaCost) {
  if (!manaCost) return [];

  const symbols = manaCost.match(/\{[^}]+\}/g) || [];
  return symbols.map(symbol => symbol.replace(/[{}]/g, ''));
}

/**
 * Calculates the converted mana cost (CMC) from a mana cost string
 * @param {string} manaCost - The mana cost string
 * @returns {number} The converted mana cost
 */
export function calculateCMC(manaCost) {
  if (!manaCost) return 0;

  const symbols = extractManaSymbols(manaCost);
  let cmc = 0;

  for (const symbol of symbols) {
    // Check if it's a number
    const num = parseInt(symbol);
    if (!isNaN(num)) {
      cmc += num;
    } else if (!['X', 'Y', 'Z'].includes(symbol)) {
      // Count colored mana symbols as 1 each (except X, Y, Z)
      cmc += 1;
    }
  }

  return cmc;
}

/**
 * Gets the color identity from a mana cost string
 * @param {string} manaCost - The mana cost string
 * @returns {string[]} Array of color letters (W, U, B, R, G)
 */
export function getColorIdentity(manaCost) {
  if (!manaCost) return [];

  const colors = new Set();
  const colorMap = {
    W: 'W',
    U: 'U',
    B: 'B',
    R: 'R',
    G: 'G',
  };

  const symbols = extractManaSymbols(manaCost);

  for (const symbol of symbols) {
    // Handle hybrid mana
    if (symbol.includes('/')) {
      const parts = symbol.split('/');
      parts.forEach(part => {
        if (colorMap[part]) {
          colors.add(colorMap[part]);
        }
      });
    } else if (colorMap[symbol]) {
      colors.add(colorMap[symbol]);
    }
  }

  return Array.from(colors).sort();
}

/**
 * Parses oracle text and converts mana symbols to HTML
 * @param {string} text - The oracle text containing mana symbols
 * @returns {string} HTML string with styled mana symbols
 */
export function parseOracleText(text) {
  if (!text) return '';

  // Replace mana symbols with styled spans
  return (
    text
      // Three-part hybrid mana (e.g., {G/U/P}, {B/R/P}) - convert to lowercase
      .replace(/\{(\w+)\/(\w+)\/(\w+)\}/gi, (match, first, second, third) => {
        const symbolKey = `${first.toLowerCase()}${second.toLowerCase()}${third.toLowerCase()}`;
        const assetUrl = getManaSymbolAsset(symbolKey);
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc; font-size: 8px; font-weight: bold; vertical-align: middle;`;
        return `<span style="${style}" title="${first}/${second}/${third}">${assetUrl ? '' : `${first}/${second}/${third}`}</span>`;
      })
      // Two-part hybrid mana (e.g., {W/U}, {2/W}, {B/R}, {B/P}) - convert to lowercase
      .replace(/\{(\w+)\/(\w+)\}/gi, (match, first, second) => {
        const symbolKey = `${first.toLowerCase()}${second.toLowerCase()}`;
        const assetUrl = getManaSymbolAsset(symbolKey);
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc; font-size: 10px; font-weight: bold; vertical-align: middle;`;
        return `<span style="${style}" title="${first}/${second}">${assetUrl ? '' : `${first}/${second}`}</span>`;
      })
      // Snow mana
      .replace(/\{S\}/gi, () => {
        const assetUrl = getManaSymbolAsset('s');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc; font-size: 10px; vertical-align: middle;`;
        return `<span style="${style}" title="Snow">${assetUrl ? '' : 'S'}</span>`;
      })
      // Tap symbol
      .replace(/\{T\}/gi, () => {
        const assetUrl = getManaSymbolAsset('t');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc; font-size: 10px; vertical-align: middle;`;
        return `<span style="${style}" title="Tap">${assetUrl ? '' : '⟳'}</span>`;
      })
      // Untap symbol
      .replace(
        /\{Q\}/gi,
        '<span style="width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold; vertical-align: middle;" title="Untap">Q</span>'
      )
      // Energy symbol
      .replace(
        /\{E\}/gi,
        '<span style="width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold; vertical-align: middle;" title="Energy">E</span>'
      )
      // Variable mana (X, Y, Z)
      .replace(/\{X\}/gi, () => {
        const assetUrl = getManaSymbolAsset('x');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold; vertical-align: middle;`;
        return `<span style="${style}" title="X">${assetUrl ? '' : 'X'}</span>`;
      })
      .replace(
        /\{Y\}/gi,
        '<span style="width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold; vertical-align: middle;" title="Y">Y</span>'
      )
      .replace(
        /\{Z\}/gi,
        '<span style="width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold; vertical-align: middle;" title="Z">Z</span>'
      )
      // Colored mana (W, U, B, R, G, C)
      .replace(/\{W\}/gi, () => {
        const assetUrl = getManaSymbolAsset('w');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #f8f6d8; font-size: 10px; font-weight: bold; color: #000; vertical-align: middle;`;
        return `<span style="${style}" title="White">${assetUrl ? '' : 'W'}</span>`;
      })
      .replace(/\{U\}/gi, () => {
        const assetUrl = getManaSymbolAsset('u');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #aae0fa; font-size: 10px; font-weight: bold; color: #000; vertical-align: middle;`;
        return `<span style="${style}" title="Blue">${assetUrl ? '' : 'U'}</span>`;
      })
      .replace(/\{B\}/gi, () => {
        const assetUrl = getManaSymbolAsset('b');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #ccc2c0; font-size: 10px; font-weight: bold; color: #000; vertical-align: middle;`;
        return `<span style="${style}" title="Black">${assetUrl ? '' : 'B'}</span>`;
      })
      .replace(/\{R\}/gi, () => {
        const assetUrl = getManaSymbolAsset('r');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #f9aa8f; font-size: 10px; font-weight: bold; color: #000; vertical-align: middle;`;
        return `<span style="${style}" title="Red">${assetUrl ? '' : 'R'}</span>`;
      })
      .replace(/\{G\}/gi, () => {
        const assetUrl = getManaSymbolAsset('g');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #9bd3ae; font-size: 10px; font-weight: bold; color: #000; vertical-align: middle;`;
        return `<span style="${style}" title="Green">${assetUrl ? '' : 'G'}</span>`;
      })
      .replace(/\{C\}/gi, () => {
        const assetUrl = getManaSymbolAsset('c');
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold; vertical-align: middle;`;
        return `<span style="${style}" title="Colorless">${assetUrl ? '' : 'C'}</span>`;
      })
      // Generic/Colorless mana (numbers 0-20)
      .replace(/\{(\d+)\}/g, (match, num) => {
        const assetUrl = getManaSymbolAsset(num);
        const style = assetUrl
          ? `background-image: url('${assetUrl}'); background-size: cover; width: 18px; height: 18px; display: inline-block; border-radius: 50%; text-indent: -9999px; overflow: hidden; vertical-align: middle;`
          : `width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #cac5c0, #b0aaa5); font-size: 10px; font-weight: bold; color: #333; vertical-align: middle;`;
        return `<span style="${style}" title="${num}">${assetUrl ? '' : num}</span>`;
      })
  );
}
