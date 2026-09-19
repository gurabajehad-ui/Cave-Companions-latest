const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const targetStr = `              ))}
            </div>
          ) : null}
        </div>
      )}`;

const idx = content.indexOf(targetStr);
console.log("Index is:", idx);

