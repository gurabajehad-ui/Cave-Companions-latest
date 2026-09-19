import fs from 'fs';

let content = fs.readFileSync('src/components/AdvertisementManagement.tsx', 'utf8');

const replacement = `
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.uploadMedia(base64Data, file.name);
          if (res.success && res.url) {
            setFormData({ ...formData, imageUrl: res.url });
          }
        } catch (err) {
          console.error(err);
          alert('Failed to upload image');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
`;

content = content.replace(
  /try \{\s*const res = await api\.uploadMedia\(file\);\s*if \(res\.success && res\.url\) \{\s*setFormData\(\{ \.\.\.formData, imageUrl: res\.url \}\);\s*\}\s*\} catch \(err\) \{\s*console\.error\(err\);\s*\}\s*setUploading\(false\);/g,
  replacement
);

fs.writeFileSync('src/components/AdvertisementManagement.tsx', content);
console.log('Fixed file upload logic');
