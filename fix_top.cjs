const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const badTop = `                {(() => {
                  const missing = getMissingRequirements(selectedMerchantVerification);
                  const canApprove = missing.length === 0;
                  const mchStatus = selectedMerchantVerification.verificationStatus?.toLowerCase().trim();
                  return ( `;

if (content.startsWith(badTop)) {
  content = content.replace(badTop, `import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LogOut,
  ChevronDown,
  `);
  fs.writeFileSync('src/components/AdminDashboardView.tsx', content);
  console.log("Fixed top");
} else {
  console.log("Not found at top");
}
