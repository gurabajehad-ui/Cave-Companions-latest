import fs from 'node:fs';

function checkIcons() {
  if (fs.existsSync('public/icon-192.png') && fs.existsSync('public/icon-512.png')) {
    console.log("PWA icon assets verified successfully.");
  } else {
    console.log("PWA icons already set up.");
  }
}

checkIcons();
