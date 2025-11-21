const fs = require('fs');

// Read the file
let content = fs.readFileSync('reference/edhreccardlist.json', 'utf8');
const lines = content.split('\n');

// Find line 588 which contains the malformed JSON
const line588 = lines[587]; // 0-indexed

// Extract the JSON object from line 588 (everything after },{)
const match = line588.match(/^  \},\{(.+)$/);
if (match) {
  const jsonStr = '{' + match[1].replace(/,$/, '');

  try {
    // Parse and format the JSON object
    const obj = JSON.parse(jsonStr);
    const formatted = JSON.stringify(obj, null, 2);

    // Replace line 588 with properly formatted version
    // First, close the previous object properly
    lines[587] = '  },'; // Close previous object with comma

    // Add the formatted object (indent by 2 spaces to match the file style)
    const formattedLines = formatted.split('\n').map((line, idx) => {
      if (idx === 0) return '  ' + line; // First line: {
      return '  ' + line; // Indent all lines
    });

    // Replace line 588 and add the formatted object
    lines.splice(588, 1, ...formattedLines);

    // Also need to fix the file structure - change first { to [
    if (lines[0].trim() === '{') {
      lines[0] = '[' + lines[0].substring(1);
    }

    // Add closing ] at the end if not present
    const lastLine = lines[lines.length - 1].trim();
    if (!lastLine.endsWith(']')) {
      lines[lines.length - 1] = lines[lines.length - 1].replace(/\s*$/, '');
      lines.push(']');
    }

    // Write back
    fs.writeFileSync('reference/edhreccardlist.json', lines.join('\n'));
    console.log('✅ Fixed and formatted JSON file');
  } catch (e) {
    console.error('Error parsing JSON:', e.message);
    process.exit(1);
  }
} else {
  console.error('Could not find the pattern in line 588');
  process.exit(1);
}
