import fs from 'fs';
let content = fs.readFileSync('src/components/AdvertisementManagement.tsx', 'utf8');

// Insert status, startAt, endAt after destinationType block
const extraFields = `
          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-1">স্ট্যাটাস (Status)</label>
            <select
              value={formData.status || 'ACTIVE'} onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
            >
              <option value="ACTIVE">সক্রিয় (Active)</option>
              <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-1">শুরু তারিখ ও সময় (Start At)</label>
            <input
              type="datetime-local"
              value={formData.startAt ? new Date(new Date(formData.startAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
              onChange={e => setFormData({...formData, startAt: e.target.value ? new Date(e.target.value).toISOString() : null})}
              className="w-full bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-1">শেষ তারিখ ও সময় (End At)</label>
            <input
              type="datetime-local"
              value={formData.endAt ? new Date(new Date(formData.endAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
              onChange={e => setFormData({...formData, endAt: e.target.value ? new Date(e.target.value).toISOString() : null})}
              className="w-full bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
            />
          </div>
`;

content = content.replace(/\{\/\* END OF EXTRA FIELDS \*\/\}/g, ''); // just in case

content = content.replace(
  /(\{\s*formData\.destinationType !== 'NONE' && \(\s*<div>\s*<label[^>]*>\s*\{formData\.destinationType === 'EXTERNAL' \? 'URL' : 'ID \/ Path'\}\s*<\/label>[\s\S]*?<\/div>\s*\)\})/g,
  "$1\n" + extraFields
);

fs.writeFileSync('src/components/AdvertisementManagement.tsx', content);
console.log('Added missing fields');
