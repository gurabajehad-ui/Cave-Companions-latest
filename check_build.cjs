const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log("Build SUCCESS");
} catch (e) {
  console.error("Build FAILED");
  process.exit(1);
}
