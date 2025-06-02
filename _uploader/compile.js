const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { execSync } = require('child_process');

// Config
const notesDir = path.resolve(__dirname, '../notes');
const buildDir = path.resolve(__dirname, './build');
const srcDir = path.resolve(__dirname, './src');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Preprocess image syntax: ![alt](url =200x) → <img ...>
function convertImages(md) {
  return md.replace(/!\[([^\]]*)\]\(\<([^)\s]+)\>\s*=\s*(\d+)x\)/g, (_, alt, src, width) => {
    return `<img src="/${src}" alt="${alt}" width="${width}">`;
  });
}

function convertFilesLinks(md) {
  return md.replace(/\[([^\]]+)\]\(([^)]+\.md)\)/g, (_, text, file) => {
    const htmlFile = file.replace(/\.md$/, '.html');
    return `<a href="${htmlFile}">${text}</a>`;
  });
}

const htmlHeader = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notes</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
<main>
`;

const htmlFooter = `
</main>
</body>
</html>
`;

const files = fs.readdirSync(notesDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(notesDir, file);
  let markdown = fs.readFileSync(filePath, 'utf8');

  // Replace custom image syntax
  markdown = convertImages(markdown);

  // Replace file links
  markdown = convertFilesLinks(markdown);

  markdown = htmlHeader + markdown + htmlFooter;

  const html = marked(markdown);

  const outFile = path.join(buildDir, file.replace(/\.md$/, '.html'));
  fs.writeFileSync(outFile, html, 'utf8');
});

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath); // Recurse!
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

const imagesSrcDir = path.resolve(notesDir, 'images');
const imagesDestDir = path.resolve(buildDir, 'images');

if (fs.existsSync(imagesSrcDir)) {
  copyDirRecursive(imagesSrcDir, imagesDestDir);
}

if (fs.existsSync(srcDir)) {
  copyDirRecursive(srcDir, buildDir);
}
