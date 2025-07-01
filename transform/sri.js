import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const exp = /template-integrity="([^"]+)"/g;

/**
 * @param {string} file
 */
function copyFile(file, files = [], level = 0) {
  if (!fs.existsSync(file)) return;

  const stat = fs.statSync(file);
  if (stat.isDirectory()) {
    const children = fs.readdirSync(file);
    for (const child of children) {
      copyFile(path.join(file, child), files, level + 1);
    }
  } else {
    files.push(file);
  }

  if (level === 0) {
    for (const currFile of files) {
      if (!currFile.endsWith('.html')) {
        fs.mkdirSync(path.join('./dist', currFile, '..'), {
          recursive: true
        });
        fs.writeFileSync(
          path.join('./dist', currFile),
          fs.readFileSync(currFile, 'utf-8'),
          'utf-8'
        );
        continue;
      }
      let txt = fs.readFileSync(currFile, 'utf-8');
      const matches = [...txt.matchAll(exp)].map(m => [m[0], m[1]]);
      if (matches.length === 0) continue;

      for (const [template, jsPath] of matches) {
        const jsFile = path.join(file, jsPath);
        if (!fs.existsSync(jsFile)) {
          console.log('Failed to hash file, does not exist: ' + jsFile);
          continue;
        }

        let jsData = fs.readFileSync(jsFile);
        const hash = crypto.hash('sha384', jsData, 'base64');

        console.log('Hashed: ' + jsFile + ' for ' + currFile);
        txt = txt.replaceAll(template, `integrity="sha384-${hash}"`);
      }

      fs.mkdirSync(path.join('./dist', currFile, '..'), {
        recursive: true
      });
      fs.writeFileSync(path.join('./dist', currFile), txt, 'utf-8');
    }
  }
}

copyFile('./static/');
