import React, { useState } from 'react';
import { ClearanceRole, DocumentItem, DocumentCategory } from '../types';
import { 
  Search, Lock, Unlock, FileText, Plus, ShieldCheck, ShieldAlert, 
  ExternalLink, Calendar, User, Tag, Eye, CheckCircle2, X 
} from 'lucide-react';

interface DocumentVaultProps {
  documents: DocumentItem[];
  activeRole: ClearanceRole;
  onAddDocument: (doc: DocumentItem) => void;
  onAskDocInChat: (docTitle: string) => void;
  selectedDocId?: string | null;
}

const categories: (DocumentCategory | 'All')[] = [
  'All',
  'Financial',
  'Engineering',
  'HR & Policy',
  'Operations',
  'Strategy',
];

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  activeRole,
  onAddDocument,
  onAskDocInChat,
  selectedDocId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'All'>('All');
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New Document Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('Operations');
  const [newClearance, setNewClearance] = useState<ClearanceRole>('MEMBER');
  const [newClassification, setNewClassification] = useState<'Confidential' | 'Restricted' | 'Internal' | 'Public'>('Internal');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('Walter Godliving');
  const [newTags, setNewTags] = useState('Operations, Workflow');

  // If a doc was selected from chat or parent
  React.useEffect(() => {
    if (selectedDocId) {
      const found = documents.find((d) => d.id === selectedDocId);
      if (found) setViewingDoc(found);
    }
  }, [selectedDocId, documents]);

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const permittedCount = documents.filter((d) => d.isPermitted).length;
  const restrictedCount = documents.length - permittedCount;

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const doc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      clearanceLevel: newClearance,
      classification: newClassification,
      summary: newContent.slice(0, 140) + '...',
      content: newContent,
      author: newAuthor.trim(),
      updatedAt: new Date().toISOString().split('T')[0],
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      isPermitted: true,
    };

    onAddDocument(doc);
    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header and Index Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Permitted Document Vault</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-normal">
              RBAC Filtered
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse knowledge indexed for semantic search. Access to classified files depends on your current clearance level ({activeRole}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            <span className="text-emerald-400 font-semibold">{permittedCount}</span> Accessible ·{' '}
            <span className="text-amber-400 font-semibold">{restrictedCount}</span> Classified
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Index New Document</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search titles, summaries, tags..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500"
          />
        </div>

        {/* Category Pills (Interactive Filter Controls) */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-950 rounded-lg border border-slate-800/80">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No documents found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const hasAccess = doc.isPermitted;

            return (
              <div
                key={doc.id}
                onClick={() => setViewingDoc(doc)}
                className={`group relative rounded-xl border p-4 cursor-pointer transition-all ${
                  hasAccess
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    : 'bg-slate-950/80 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-amber-800/60'
                }`}
              >
                {/* Header clearance lock status */}
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {hasAccess ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Permitted</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Requires {doc.clearanceLevel}</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {doc.classification}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {doc.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {hasAccess ? doc.summary : 'Encrypted with Spring Security RBAC. Upgrade clearance level to view confidential contents.'}
                </p>

                {/* Metadata strip (No pill enclosures) */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>{doc.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.updatedAt}</span>
                  </div>
                  <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Reader Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs mb-1 font-mono">
                  {viewingDoc.isPermitted ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Security Clearance Level Verified ({viewingDoc.clearanceLevel})</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Access Denied: Requires {viewingDoc.clearanceLevel} Clearance</span>
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-100">
                  {viewingDoc.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Author: {viewingDoc.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>Updated: {viewingDoc.updatedAt}</span>
                  <span aria-hidden="true">·</span>
                  <span>{viewingDoc.classification}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap bg-slate-950/60">
              {viewingDoc.isPermitted ? (
                viewingDoc.content
              ) : (
                <div className="py-8 text-center space-y-3">
                  <Lock className="w-10 h-10 text-amber-500 mx-auto" />
                  <div className="text-sm font-semibold text-slate-200">
                    Content Classified under Enterprise RBAC
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    This document requires clearance level <span className="text-amber-400 font-bold">{viewingDoc.clearanceLevel}</span>. Your active session is currently set to <span className="text-slate-200 font-bold">{activeRole}</span>.
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Failed Authority Check: @PreAuthorize("hasRole('{viewingDoc.clearanceLevel}')")
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <span>Tags:</span>
                <span>{viewingDoc.tags.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                >
                  Close
                </button>
                {viewingDoc.isPermitted && (
                  <button
                    onClick={() => {
                      onAskDocInChat(`Tell me more about the document "${viewingDoc.title}"`);
                      setViewingDoc(null);
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
                  >
                    <span>Ask AI Assistant</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Index New Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100">Index New Document</h2>
                <p className="text-xs text-slate-400 mt-0.5">Add to permitted vector vault for AI question answering</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q4 Security Audit & Cloud SQL Provisioning Spec"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Financial">Financial</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR & Policy">HR & Policy</option>
                    <option value="Operations">Operations</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Clearance Level (RBAC)</label>
                  <select
                    value={newClearance}
                    onChange={(e) => setNewClearance(e.target.value as ClearanceRole)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                  >
                    <option value="GUEST">GUEST (Level 1)</option>
                    <option value="MEMBER">MEMBER (Level 2)</option>
                    <option value="MANAGER">MANAGER (Level 3)</option>
                    <option value="EXECUTIVE">EXECUTIVE (Level 4)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Content / Text</label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste raw markdown, text, or policy details here for AI semantic indexing..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Author</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Engineering, Kafka, Security"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                >
                  Index & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
