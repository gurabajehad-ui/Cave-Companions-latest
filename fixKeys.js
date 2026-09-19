const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith(".tsx")) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk("./src");

let totalKeysFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  // Step 1: Ensure .map parameters include idx if missing
  content = content.replace(/\.map\(\(([\w\s_]+)\)\s*=>/g, (m, arg) => {
    if (arg.includes(",")) return m; // already has second param
    return `.map((${arg.trim()}, idx) =>`;
  });
  content = content.replace(/\.map\(([\w_]+)\s*=>/g, (m, arg) => {
    return `.map((${arg.trim()}, idx) =>`;
  });

  // Step 2: Match key={`...`} where ... does not contain any index variable
  content = content.replace(/key=\{`([^`]+)`\}/g, (match, inner) => {
    if (/(idx|index|\bi\b|sIdx|pIdx|oIdx|rIdx|tIdx|mIdx|vIdx|fIdx|cIdx|bIdx|itmIdx|revIdx|dayIdx|shIdx|uIdx|iIdx|locIdx|gIdx|aIdx)/i.test(inner)) {
      return match;
    }
    totalKeysFixed++;
    return `key={\`${inner}-\${idx}\`}`;
  });

  // Step 3: Match key={item.id} or key={item.id || 'fallback'} where no index
  content = content.replace(/key=\{([a-zA-Z0-9_\.\?\s\|\|'"\-]+)\}/g, (match, expr) => {
    if (expr.startsWith("`")) return match;
    if (/(idx|index|\bi\b|sIdx|pIdx|oIdx|rIdx|tIdx|mIdx|vIdx|fIdx|cIdx|bIdx|itmIdx|revIdx|dayIdx|shIdx|uIdx|iIdx|locIdx|gIdx|aIdx|retryKey|"cart-modal-container"|'cart-modal-container')/i.test(expr)) {
      return match;
    }
    totalKeysFixed++;
    return `key={\`${expr}-\${idx}\`}`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Updated keys in:", file);
  }
});

console.log("Total keys fixed:", totalKeysFixed);
