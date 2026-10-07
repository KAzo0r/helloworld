const fs = require('fs');
const path = require('path');

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

const replacements = {
  'Р˜': 'И',
  'в„–': '№'
};

function fixFile(filepath) {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let newContent = content;
    
    for (let [bad, good] of Object.entries(replacements)) {
      newContent = newContent.split(bad).join(good);
    }

    if (newContent !== content) {
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log("Fixed manually: " + filepath);
    }
  } catch (err) {
    console.error("Error processing " + filepath, err.message);
  }
}

const files = getAllFiles('frontend/src', []);
files.forEach(f => fixFile(f));
