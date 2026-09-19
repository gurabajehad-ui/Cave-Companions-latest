const fs = require('fs');
let code = fs.readFileSync('src/components/BlogManagement.tsx', 'utf8');

// 1. Add deleteConfirmId state
code = code.replace(
  "const [currentBlog, setCurrentBlog] = useState<Partial<BlogPost>>({});",
  "const [currentBlog, setCurrentBlog] = useState<Partial<BlogPost>>({});\n  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);"
);

// 2. Change handleDelete
code = code.replace(
  "const handleDelete = (id: string) => {\n    if (confirm('আপনি কি এই ব্লগটি মুছে ফেলতে চান?')) {\n      saveBlogs(blogs.filter(b => b.id !== id));\n    }\n  };",
  "const handleDelete = (id: string) => {\n    if (deleteConfirmId === id) {\n      saveBlogs(blogs.filter(b => b.id !== id));\n      setDeleteConfirmId(null);\n    } else {\n      setDeleteConfirmId(id);\n      setTimeout(() => setDeleteConfirmId(null), 3000);\n    }\n  };"
);

// 3. Image Upload Logic
code = code.replace(
  "const handleSave = () => {",
  "const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const file = e.target.files?.[0];\n    if (file) {\n      const reader = new FileReader();\n      reader.onloadend = () => {\n        setCurrentBlog({...currentBlog, imageUrl: reader.result as string});\n      };\n      reader.readAsDataURL(file);\n    }\n  };\n\n  const handleSave = () => {"
);

// 4. Change Image Input UI
const oldImageInput = `          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ছবির URL (ঐচ্ছিক)</label>
            <input 
              type="text" 
              value={currentBlog.imageUrl || ''} 
              onChange={e => setCurrentBlog({...currentBlog, imageUrl: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              placeholder="https://..."
            />
          </div>`;

const newImageInput = `          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ছবি আপলোড করুন (ঐচ্ছিক)</label>
            <div className="flex items-center gap-4">
              {currentBlog.imageUrl && (
                <div className="relative group">
                  <img src={currentBlog.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                  <button onClick={() => setCurrentBlog({...currentBlog, imageUrl: ''})} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg cursor-pointer transition-colors border border-slate-700">
                <ImageIcon className="w-4 h-4 mr-2" />
                <span>ছবি নির্বাচন করুন</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>`;

code = code.replace(oldImageInput, newImageInput);

// 5. Change Delete Button UI
const oldDeleteBtn = `<button 
                  onClick={() => handleDelete(blog.id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>`;
const newDeleteBtn = `<button 
                  onClick={() => handleDelete(blog.id)}
                  className={\`p-1.5 rounded-lg flex items-center gap-1 transition-colors \${deleteConfirmId === blog.id ? 'bg-rose-500 text-white' : 'text-rose-400 hover:bg-rose-400/10'}\`}
                >
                  {deleteConfirmId === blog.id ? <span className="text-[10px] font-bold px-1">নিশ্চিত?</span> : <Trash2 className="w-4 h-4" />}
                </button>`;

code = code.replace(oldDeleteBtn, newDeleteBtn);

fs.writeFileSync('src/components/BlogManagement.tsx', code);
