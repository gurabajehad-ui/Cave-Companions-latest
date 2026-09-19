const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

code = code.replace(
  "const [isMosqueLocationPickerOpen, setIsMosqueLocationPickerOpen] = useState(false);",
  "const [mapPickerContext, setMapPickerContext] = useState<'new' | 'edit' | null>(null);"
);

code = code.replace(
  "onClick={() => setIsMosqueLocationPickerOpen(true)}",
  "onClick={() => setMapPickerContext('edit')}"
);

code = code.replace(
  "onClick={() => setIsMosqueLocationPickerOpen(true)}",
  "onClick={() => setMapPickerContext('new')}"
);

// We might need to replace it universally if there are more
// Wait, the first replacement above for onClick will hit the edit one.
// Let's just use string replacement carefully.

const modalOld = `{isMosqueLocationPickerOpen && (
          <MosqueLocationPickerModal
            key="mosque-location-picker"
            initialLat={parseFloat(newMosqueLatitude) || 0}
            initialLng={parseFloat(newMosqueLongitude) || 0}
            address={newMosqueAddress}
            onClose={() => setIsMosqueLocationPickerOpen(false)}
            onSuccess={(lat, lng, address) => {
              setNewMosqueLatitude(String(lat));
              setNewMosqueLongitude(String(lng));
              if (address && !newMosqueAddress) {
                setNewMosqueAddress(address);
              }
              setIsMosqueLocationPickerOpen(false);
            }}
            onShowToast={onShowToast}
          />
        )}`;

const modalNew = `{mapPickerContext && (
          <MosqueLocationPickerModal
            key="mosque-location-picker"
            initialLat={mapPickerContext === 'edit' ? (selectedMosqueForEdit?.latitude || 0) : (parseFloat(newMosqueLatitude) || 0)}
            initialLng={mapPickerContext === 'edit' ? (selectedMosqueForEdit?.longitude || 0) : (parseFloat(newMosqueLongitude) || 0)}
            address={mapPickerContext === 'edit' ? (selectedMosqueForEdit?.address || '') : newMosqueAddress}
            onClose={() => setMapPickerContext(null)}
            onSuccess={(lat, lng, address) => {
              if (mapPickerContext === 'edit') {
                 setSelectedMosqueForEdit(prev => prev ? {...prev, latitude: lat, longitude: lng, address: (address && !prev.address) ? address : prev.address} : null);
              } else {
                 setNewMosqueLatitude(String(lat));
                 setNewMosqueLongitude(String(lng));
                 if (address && !newMosqueAddress) {
                   setNewMosqueAddress(address);
                 }
              }
              setMapPickerContext(null);
            }}
            onShowToast={onShowToast}
          />
        )}`;

code = code.replace(modalOld, modalNew);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
