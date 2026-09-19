const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// 1. Fix line 2677 back to )}
const targetBad = `              ))}
            </div>
          ) : null}
        </div>
      )}
      {/* ========================================================= */}
      {/* SECTION 2: MOSQUES MANAGEMENT (ADD / QR / STATUS)         */}`;
const replaceBad = `              ))}
            </div>
          )}
        </div>
      )}
      {/* ========================================================= */}
      {/* SECTION 2: MOSQUES MANAGEMENT (ADD / QR / STATUS)         */}`;
if (content.includes(targetBad)) {
    content = content.replace(targetBad, replaceBad);
    console.log("Restored pending-offers block.");
} else {
    console.log("Couldn't find targetBad.");
}

// 2. Fix line 2535 to ) : null}
const targetGood = `                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* ========================================================= */}
      {/* SECTION: PENDING OFFER/DISCOUNT REQUESTS                  */}`;
const replaceGood = `                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
      {/* ========================================================= */}
      {/* SECTION: PENDING OFFER/DISCOUNT REQUESTS                  */}`;
if (content.includes(targetGood)) {
    content = content.replace(targetGood, replaceGood);
    console.log("Fixed pending-merchants block.");
} else {
    console.log("Couldn't find targetGood.");
}

// 3. Ensure pending-offers is hidden
const targetOffers = `{activeTab === 'pending-offers' && (`;
const replaceOffers = `{activeTab === 'pending-offers' && !selectedMerchantVerification && (`;
if (content.includes(targetOffers)) {
    content = content.replace(targetOffers, replaceOffers);
    console.log("Patched pending-offers tab.");
}

fs.writeFileSync('src/components/AdminDashboardView.tsx', content);

