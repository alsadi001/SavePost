import React, { useState } from 'react';
import { useStore } from '../store';
import { Folder, MoreVertical, Plus, Trash2, Edit2, Bookmark, Star, Heart, Lightbulb, Hash } from 'lucide-react';
import { Collection } from '../types';

interface InternalProps {
  onSelectCollection: (id: string) => void;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
const ICONS = ['Folder', 'Bookmark', 'Star', 'Heart', 'Lightbulb', 'Hash'];

const renderIcon = (name?: string, props: any = {}) => {
  switch (name) {
    case 'Bookmark': return <Bookmark {...props} />;
    case 'Star': return <Star {...props} />;
    case 'Heart': return <Heart {...props} />;
    case 'Lightbulb': return <Lightbulb {...props} />;
    case 'Hash': return <Hash {...props} />;
    case 'Folder':
    default:
      return <Folder {...props} />;
  }
};

export const CollectionsScreen: React.FC<InternalProps> = ({ onSelectCollection }) => {
  const { collections, posts, addCollection, updateCollection, deleteCollection } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const [collectionColor, setCollectionColor] = useState(COLORS[0]);
  const [collectionIcon, setCollectionIcon] = useState(ICONS[0]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleOpenModal = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setCollectionName(collection.name);
      setCollectionColor(collection.color || COLORS[0]);
      setCollectionIcon(collection.icon || ICONS[0]);
    } else {
      setEditingCollection(null);
      setCollectionName('');
      setCollectionColor(COLORS[0]);
      setCollectionIcon(ICONS[0]);
    }
    setIsModalOpen(true);
    setMenuOpenId(null);
  };

  const handleSave = () => {
    if (!collectionName.trim()) return;
    if (editingCollection) {
      updateCollection(editingCollection.id, collectionName.trim(), collectionColor, collectionIcon);
    } else {
      addCollection(collectionName.trim(), collectionColor, collectionIcon);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع التغريدات بداخلها.')) {
      deleteCollection(id);
    }
    setMenuOpenId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full absolute inset-0 bg-slate-950">
      <header className="h-20 bg-slate-950 border-b border-slate-900 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-100 font-bold text-xl">X</div>
          <h1 className="text-xl font-bold text-slate-100">أرشيف إكس</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Folder size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-medium">لا توجد مجموعات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {collections.map((collection) => {
              const postCount = posts.filter((p) => p.collectionId === collection.id).length;
              return (
                <div
                  key={collection.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between relative cursor-pointer hover:border-slate-700 transition-colors aspect-square group"
                  onClick={() => onSelectCollection(collection.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div 
                      className="p-3 rounded-xl inline-block transition-colors"
                      style={{ backgroundColor: `${collection.color || COLORS[0]}20`, color: collection.color || COLORS[0] }}
                    >
                      {renderIcon(collection.icon, { size: 24 })}
                    </div>
                    <button
                      className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === collection.id ? null : collection.id);
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {menuOpenId === collection.id && (
                    <div className="absolute top-12 left-4 bg-slate-800 shadow-xl rounded-xl border border-slate-700 z-20 overflow-hidden w-36 py-1">
                      <button
                        className="w-full text-right px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(collection);
                        }}
                      >
                        <Edit2 size={14} className="text-slate-400" />
                        تعديل
                      </button>
                      <button
                        className="w-full text-right px-4 py-2 text-sm hover:bg-red-900/30 text-red-400 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(collection.id);
                        }}
                      >
                        <Trash2 size={14} />
                        حذف
                      </button>
                    </div>
                  )}

                  <div className="mt-auto">
                    <h2 className="font-bold text-slate-100 line-clamp-1 text-sm">{collection.name}</h2>
                    <div className="mt-2 text-xs bg-slate-800 px-2 py-0.5 rounded-full inline-block text-slate-400 font-medium">
                      {postCount} منشور
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-sm p-6 border border-slate-800 relative">
            <h2 className="text-xl font-bold mb-4 text-slate-100">
              {editingCollection ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">الاسم</label>
                <input
                  type="text"
                  className="w-full border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all bg-slate-950 text-slate-100 text-sm placeholder:text-slate-600"
                  placeholder="اسم المجموعة..."
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">اللون</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded-full ${collectionColor === c ? 'ring-2 ring-offset-2 ring-offset-slate-900 border-none' : 'border border-slate-700/50'}`}
                      style={{ backgroundColor: c, borderColor: collectionColor === c ? c : undefined }}
                      onClick={() => setCollectionColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">الأيقونة</label>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map(i => (
                    <button
                      key={i}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${collectionIcon === i ? 'bg-slate-800 text-white' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}
                      onClick={() => setCollectionIcon(i)}
                    >
                      {renderIcon(i, { size: 18 })}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                إلغاء
              </button>
              <button
                className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                onClick={handleSave}
                disabled={!collectionName.trim()}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Invisible overlay to close menu */}
      {menuOpenId && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </div>
  );
};
