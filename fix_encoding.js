const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Not available? We can just do a simple recursive read

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

// Win1251 to Unicode mapping (reverse of what we need, but we can build a map)
// We need to map Unicode back to Win1251 bytes
const iconv = require('iconv-lite'); // Might not be installed?

function fixFile(filepath) {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // We can use iconv-lite if available, but if not we can manually map it.
    // It's easier to just try iconv-lite, since the project might have it, or we can install it.
    // Wait, let's just write a manual reverse mapping for the Cyrillic block.
    
    // In Win1251, Cyrillic starts at 0xC0 (А) to 0xFF (я).
    // Plus Ё (0xA8) and ё (0xB8).
    
    // Create a byte array
    let bytes = [];
    let isCorrupted = false;
    for (let i = 0; i < content.length; i++) {
      let code = content.charCodeAt(i);
      
      // Map back code points like 'Р' (U+0420) to its Win1251 byte
      // But wait, the file actually contains literal 'Р' which is U+0420.
      // We want to turn U+0420 into the byte 0xD0.
      // A full mapping of CP1251 to Unicode:
      if (code === 0x0401) { bytes.push(0xA8); isCorrupted = true; } // Ё
      else if (code === 0x0451) { bytes.push(0xB8); isCorrupted = true; } // ё
      else if (code === 0x201A) { bytes.push(0x82); isCorrupted = true; } // ‚
      else if (code === 0x0453) { bytes.push(0x83); isCorrupted = true; } // ѓ
      else if (code === 0x201E) { bytes.push(0x84); isCorrupted = true; } // „
      else if (code === 0x2026) { bytes.push(0x85); isCorrupted = true; } // …
      else if (code === 0x2020) { bytes.push(0x86); isCorrupted = true; } // †
      else if (code === 0x2021) { bytes.push(0x87); isCorrupted = true; } // ‡
      else if (code === 0x20AC) { bytes.push(0x88); isCorrupted = true; } // €
      else if (code === 0x2030) { bytes.push(0x89); isCorrupted = true; } // ‰
      else if (code === 0x0409) { bytes.push(0x8A); isCorrupted = true; } // Љ
      else if (code === 0x2039) { bytes.push(0x8B); isCorrupted = true; } // ‹
      else if (code === 0x040A) { bytes.push(0x8C); isCorrupted = true; } // Њ
      else if (code === 0x040C) { bytes.push(0x8D); isCorrupted = true; } // Ќ
      else if (code === 0x040B) { bytes.push(0x8E); isCorrupted = true; } // Ћ
      else if (code === 0x040F) { bytes.push(0x8F); isCorrupted = true; } // Џ
      else if (code === 0x0452) { bytes.push(0x90); isCorrupted = true; } // ђ
      else if (code === 0x2018) { bytes.push(0x91); isCorrupted = true; } // ‘
      else if (code === 0x2019) { bytes.push(0x92); isCorrupted = true; } // ’
      else if (code === 0x201C) { bytes.push(0x93); isCorrupted = true; } // “
      else if (code === 0x201D) { bytes.push(0x94); isCorrupted = true; } // ”
      else if (code === 0x2022) { bytes.push(0x95); isCorrupted = true; } // •
      else if (code === 0x2013) { bytes.push(0x96); isCorrupted = true; } // –
      else if (code === 0x2014) { bytes.push(0x97); isCorrupted = true; } // —
      else if (code === 0x2122) { bytes.push(0x99); isCorrupted = true; } // ™
      else if (code === 0x0459) { bytes.push(0x9A); isCorrupted = true; } // љ
      else if (code === 0x203A) { bytes.push(0x9B); isCorrupted = true; } // ›
      else if (code === 0x045A) { bytes.push(0x9C); isCorrupted = true; } // њ
      else if (code === 0x045C) { bytes.push(0x9D); isCorrupted = true; } // ќ
      else if (code === 0x045B) { bytes.push(0x9E); isCorrupted = true; } // ћ
      else if (code === 0x045F) { bytes.push(0x9F); isCorrupted = true; } // џ
      else if (code === 0x00A0) { bytes.push(0xA0); }
      else if (code === 0x040E) { bytes.push(0xA1); isCorrupted = true; } // Ў
      else if (code === 0x045E) { bytes.push(0xA2); isCorrupted = true; } // ў
      else if (code === 0x0408) { bytes.push(0xA3); isCorrupted = true; } // Ј
      else if (code === 0x00A4) { bytes.push(0xA4); }
      else if (code === 0x0490) { bytes.push(0xA5); isCorrupted = true; } // Ґ
      else if (code === 0x00A6) { bytes.push(0xA6); }
      else if (code === 0x00A7) { bytes.push(0xA7); }
      else if (code === 0x0401) { bytes.push(0xA8); isCorrupted = true; } // Ё
      else if (code === 0x00A9) { bytes.push(0xA9); }
      else if (code === 0x0404) { bytes.push(0xAA); isCorrupted = true; } // Є
      else if (code === 0x00AB) { bytes.push(0xAB); isCorrupted = true; } // «
      else if (code === 0x00AC) { bytes.push(0xAC); }
      else if (code === 0x00AD) { bytes.push(0xAD); }
      else if (code === 0x00AE) { bytes.push(0xAE); }
      else if (code === 0x0407) { bytes.push(0xAF); isCorrupted = true; } // Ї
      else if (code === 0x00B0) { bytes.push(0xB0); }
      else if (code === 0x00B1) { bytes.push(0xB1); }
      else if (code === 0x0406) { bytes.push(0xB2); isCorrupted = true; } // І
      else if (code === 0x0456) { bytes.push(0xB3); isCorrupted = true; } // і
      else if (code === 0x0491) { bytes.push(0xB4); isCorrupted = true; } // ґ
      else if (code === 0x00B5) { bytes.push(0xB5); }
      else if (code === 0x00B6) { bytes.push(0xB6); }
      else if (code === 0x00B7) { bytes.push(0xB7); }
      else if (code === 0x0451) { bytes.push(0xB8); isCorrupted = true; } // ё
      else if (code === 0x2116) { bytes.push(0xB9); isCorrupted = true; } // №
      else if (code === 0x0454) { bytes.push(0xBA); isCorrupted = true; } // є
      else if (code === 0x00BB) { bytes.push(0xBB); isCorrupted = true; } // »
      else if (code === 0x0458) { bytes.push(0xBC); isCorrupted = true; } // ј
      else if (code === 0x0405) { bytes.push(0xBD); isCorrupted = true; } // Ѕ
      else if (code === 0x0455) { bytes.push(0xBE); isCorrupted = true; } // ѕ
      else if (code === 0x0457) { bytes.push(0xBF); isCorrupted = true; } // ї
      else if (code >= 0x0410 && code <= 0x044F) {
        // А-Я, а-я map exactly from 0xC0 to 0xFF
        bytes.push(code - 0x0410 + 0xC0);
        isCorrupted = true;
      }
      else if (code <= 0x7F) {
        bytes.push(code);
      } else {
        // Unmapped char, probably valid UTF-8 string that wasn't corrupted
        // This means our assumption that the whole file is corrupt is wrong,
        // or this specific char isn't part of cp1251.
        bytes.push(code & 0xFF);
      }
    }
    
    if (isCorrupted) {
      // Decode the bytes as UTF-8
      let buf = Buffer.from(bytes);
      let fixedContent = buf.toString('utf8');
      
      // Safety check: if it still has lots of replacement chars, abort
      if (fixedContent.includes('')) {
         console.log("Skipping " + filepath + " (bad decode)");
         return;
      }
      
      fs.writeFileSync(filepath, fixedContent, 'utf8');
      console.log("Fixed: " + filepath);
    }
    
  } catch (err) {
    console.error("Error processing " + filepath, err);
  }
}

const files = getAllFiles('frontend/src', []);
files.forEach(f => fixFile(f));
