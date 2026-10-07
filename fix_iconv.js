const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

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

function fixFile(filepath) {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let newContent = content;
    let i = 0;
    
    while (i < newContent.length) {
        if (newContent[i] === 'Р' || newContent[i] === 'С' || newContent[i] === 'в' || newContent[i] === 'р') {
            let bestLen = 0;
            let bestDecoded = null;
            
            for (let len = 2; len <= 1000 && i + len <= newContent.length; len++) {
                let chunk = newContent.substr(i, len);
                try {
                    let bytes = iconv.encode(chunk, 'win1251');
                    let decoded = iconv.decode(bytes, 'utf8');
                    
                    if (!decoded.includes('\uFFFD')) {
                        // Check if the decoded string has Cyrillic or Emoji
                        // Emojis are also corrupted often.
                        if (/[А-Яа-яЁё]/.test(decoded) || bytes.length >= 4) {
                            // If the original chunk had replacement chars, don't use it
                            if (!chunk.includes('\uFFFD')) {
                                bestLen = len;
                                bestDecoded = decoded;
                            }
                        }
                    }
                } catch(e) {}
            }
            
            if (bestLen > 0) {
                newContent = newContent.substring(0, i) + bestDecoded + newContent.substring(i + bestLen);
                i += bestDecoded.length;
                continue;
            }
        }
        i++;
    }

    if (newContent !== content) {
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log("Fixed: " + filepath);
    }
  } catch (err) {
    console.error("Error processing " + filepath, err.message);
  }
}

const files = getAllFiles('frontend/src', []);
files.forEach(f => fixFile(f));
