import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import GoogleClassroomVault from '../components/GoogleClassroomVault';
import { 
  BookOpen, 
  Search, 
  Download, 
  ExternalLink, 
  FileText, 
  Plus, 
  Sparkles, 
  Trash2, 
  Filter, 
  UploadCloud,
  FileCode,
  Tag,
  FolderGit2,
  Archive
} from 'lucide-react';

export default function StudyMaterialsPage() {
  const { user, isAdmin } = useAuth();
  const { materials, addMaterial, deleteMaterial } = useData();
  const { addToast } = useToast();

  const [activeVaultTab, setActiveVaultTab] = useState('classroom'); // 'classroom' | 'cr_materials'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for CR Upload
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [subjectCode, setSubjectCode] = useState('CSE 201');
  const [faculty, setFaculty] = useState('');
  const [type, setType] = useState('Notes');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState(null);

  const subjectsList = [
    { name: 'Data Structures & Algorithms', code: 'CSE 201' },
    { name: 'Database Management Systems', code: 'CSE 202' },
    { name: 'Operating Systems', code: 'CSE 203' },
    { name: 'Computer Organization & Architecture', code: 'CSE 204' },
    { name: 'Discrete Mathematics', code: 'MAT 201' },
    { name: 'Design & Analysis of Algorithms', code: 'CSE 205' },
    { name: 'General / Reference', code: 'GEN' }
  ];

  const resourceTypes = ['Notes', 'PYQ', 'Handout', 'Slides', 'Formula Sheet', 'Lab Manual'];

  const handleSubjectChange = (subName) => {
    setSubject(subName);
    const match = subjectsList.find(s => s.name === subName);
    if (match) setSubjectCode(match.code);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      addToast('Please provide a title and subject.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('subject', subject.trim());
      formData.append('subjectCode', subjectCode.trim());
      formData.append('faculty', faculty.trim());
      formData.append('type', type);
      formData.append('description', description.trim());
      formData.append('linkUrl', linkUrl.trim());
      if (file) formData.append('file', file);

      await addMaterial(formData);
      addToast('Study material published successfully!', 'success');
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setFaculty('');
      setLinkUrl('');
      setFile(null);
    } catch (err) {
      addToast(err.message || 'Failed to add study material.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, matTitle) => {
    if (window.confirm(`Are you sure you want to delete "${matTitle}"?`)) {
      try {
        await deleteMaterial(id);
        addToast('Material deleted successfully.', 'success');
      } catch (err) {
        addToast(err.message || 'Failed to delete material.', 'error');
      }
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.faculty?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'All' || m.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesType = selectedType === 'All' || m.type === selectedType;

    return matchesSearch && matchesSubject && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Vault Mode Switcher */}
      <div className="flex items-center gap-2 p-1.5 liquid-glass rounded-2xl border border-white/10 max-w-md shadow-lg">
        <button
          onClick={() => setActiveVaultTab('classroom')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeVaultTab === 'classroom'
              ? 'bg-white text-black shadow-lg font-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FolderGit2 className={`w-4 h-4 ${activeVaultTab === 'classroom' ? 'text-indigo-600' : 'text-indigo-400'}`} />
          <span>Google Classroom Vault</span>
        </button>
        <button
          onClick={() => setActiveVaultTab('cr_materials')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeVaultTab === 'cr_materials'
              ? 'bg-white text-black shadow-lg font-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Archive className={`w-4 h-4 ${activeVaultTab === 'cr_materials' ? 'text-amber-600' : 'text-amber-400'}`} />
          <span>CR Upload Archive</span>
        </button>
      </div>

      {activeVaultTab === 'classroom' ? (
        <GoogleClassroomVault />
      ) : (
        <>
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 liquid-glass-pill px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  CR Archive & PYQs
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Study Materials Hub
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Access subject-wise lecture notes, previous year question papers, lab handouts, and formula sheets curated for CSE Section D.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Upload Material</span>
              </button>
            )}
          </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search materials by title, subject, or professor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
            {['All', ...resourceTypes.slice(0, 4)].map(tp => (
              <button
                key={tp}
                onClick={() => setSelectedType(tp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedType === tp
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedSubject('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedSubject === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Subjects
          </button>
          {subjectsList.map(s => (
            <button
              key={s.code}
              onClick={() => setSelectedSubject(s.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSubject === s.name
                  ? 'bg-srm-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.code}: {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No study materials found</h4>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or subject filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map(mat => (
            <div
              key={mat.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-srm-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-srm-50 text-srm-800 border border-srm-200">
                    {mat.subjectCode || mat.subject}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {mat.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {mat.title}
                </h3>

                {mat.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {mat.description}
                  </p>
                )}

                {mat.faculty && (
                  <p className="text-xs text-slate-400 mt-2">
                    Faculty: <strong className="text-slate-600 font-medium">{mat.faculty}</strong>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  {mat.fileSize || (mat.fileName ? 'Document' : 'Resource Link')}
                </span>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(mat.id, mat.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <a
                    href={mat.linkUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-srm-600 hover:bg-srm-700 text-white px-3.5 py-1.5 rounded-xl shadow-2xs transition"
                  >
                    <span>Download / View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}

      {/* Upload / Add Material Modal (CR Admin) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload / Add Study Material"
        subtitle="Make academic resources accessible to all CSE Section D students"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-sm text-slate-900 bg-white"
            >
              {subjectsList.map(s => (
                <option key={s.code} value={s.name}>{s.code}: {s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Material Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-sm text-slate-900 bg-white"
              >
                {resourceTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Faculty / Professor <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="e.g. Dr. K. Rajesh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Material Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 3 Graph Algorithms Handwritten Lecture Notes"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Resource Link / Google Drive URL
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Or Upload PDF / Document <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-srm-50 file:text-srm-700 hover:file:bg-srm-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Brief Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention topics covered or key exam pointers..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-sm text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
            >
              {submitting ? 'Uploading...' : 'Publish Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
