import React, { useState } from 'react';
import { useStore } from '../store';
import { ArrowRight, Plus, Trash2, Link as LinkIcon, MessageSquare, Share2, Search, ArrowLeftRight } from 'lucide-react';
import { Tweet } from 'react-tweet';

interface InternalProps {
  collectionId: string;
  onBack: () => void;
}

export const PostsScreen: React.FC<InternalProps> = ({ collectionId, onBack }) => {
  const { collections, posts, addPost, deletePost, movePost } = useStore();
  const collection = collections.find((c) => c.id === collectionId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [postToMove, setPostToMove] = useState<string | null>(null);
  
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!collection) return null;
  
  const collectionPosts = posts.filter((p) => p.collectionId === collectionId).filter(p => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (p.note && p.note.toLowerCase().includes(lowerQuery)) || p.url.toLowerCase().includes(lowerQuery) || p.tweetId.includes(lowerQuery);
  });

  const handleSave = () => {
    if (!url.trim()) return;
    addPost(collectionId, url.trim(), note.trim());
    setUrl('');
    setNote('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full absolute inset-0 bg-slate-950">
      <header className="bg-slate-950 border-b border-slate-900 z-10 shrink-0">
        <div className="h-20 flex items-center px-6">
          <button
            onClick={onBack}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors ml-4"
          >
            <ArrowRight size={24} />
          </button>
          <h1 className="text-xl font-bold font-sans text-slate-100 flex-1">{collection.name}</h1>
        </div>
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="البحث في الملاحظات أو الرابط..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 pb-28 bg-slate-950">
        {collectionPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <MessageSquare size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-medium">{searchQuery ? 'لا توجد نتائج بحث' : 'لا توجد منشورات هنا'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {collectionPosts.map((post) => (
              <div key={post.id} className="relative group flex flex-col">
                {post.note && (
                  <div className="bg-slate-800 text-slate-200 px-5 py-3 rounded-t-2xl border-x border-t border-slate-700 text-sm">
                    {post.note}
                  </div>
                )}
                <div className={`bg-slate-900 shadow-xl border border-slate-800 overflow-hidden ${post.note ? 'rounded-b-2xl border-t-0' : 'rounded-2xl'}`}>
                    <div className="px-5 py-3 flex justify-between items-center border-b border-slate-800 bg-slate-900">
                        <span className="text-xs font-medium text-slate-500 font-sans">
                            {new Date(post.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'مشاركة التغريدة',
                                            url: post.url,
                                        }).catch((error) => {
                                            if (error.name !== 'AbortError') {
                                                console.error('Error sharing', error);
                                            }
                                        });
                                    } else {
                                        navigator.clipboard.writeText(post.url);
                                        alert('تم نسخ الرابط');
                                    }
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-full transition-colors"
                                title="مشاركة"
                            >
                                <Share2 size={16} />
                            </button>
                            <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-full transition-colors"
                                title="فتح في X"
                            >
                                <LinkIcon size={16} />
                            </a>
                            <button
                                onClick={() => {
                                  setPostToMove(post.id);
                                  setIsMoveModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
                                title="نقل إلى مجموعة أخرى"
                            >
                                <ArrowLeftRight size={16} />
                            </button>
                            <button
                                onClick={() => {
                                if (confirm('حذف هذا المنشور؟')) deletePost(post.id);
                                }}
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-full transition-colors"
                                title="حذف"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                  <div className="p-4 pt-2 pb-2 dark overflow-hidden bg-slate-950 flex justify-center hide-tweet-footer" dir="ltr" data-theme="dark">
                    <div className="w-full max-w-sm">
                      <Tweet id={post.tweetId} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="absolute bottom-8 right-8 pointer-events-none z-20">
        <button
          onClick={() => setIsModalOpen(true)}
          className="pointer-events-auto w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-900/50 flex items-center justify-center hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all"
          title="حفظ تغريدة جديدة"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Add Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-slate-900 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 border border-slate-800 relative animate-in slide-in-from-bottom duration-300 sm:animate-none">
            <h2 className="text-xl font-bold mb-6 text-slate-100">حفظ تغريدة جديدة</h2>
            
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">رابط التغريدة أو نص يحتوي على رابط</label>
                    <input
                        type="text"
                        className="w-full border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all bg-slate-950 text-slate-100 text-sm placeholder:text-slate-600"
                        placeholder="https://x.com/user/status/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        autoFocus
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">ملاحظة (اختياري)</label>
                    <textarea
                        className="w-full border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all bg-slate-950 text-slate-100 text-sm placeholder:text-slate-600 resize-none h-24"
                        placeholder="أضف ملاحظة أو سبب حفظ التغريدة..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
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
                disabled={!url.trim()}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Post Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-slate-900 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 border border-slate-800 relative animate-in slide-in-from-bottom duration-300 sm:animate-none">
            <h2 className="text-xl font-bold mb-6 text-slate-100">نقل المنشور</h2>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-6">
              {collections.filter(c => c.id !== collectionId).map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    if (postToMove) {
                      movePost(postToMove, c.id);
                      setIsMoveModalOpen(false);
                      setPostToMove(null);
                    }
                  }}
                  className="w-full text-right px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors font-bold text-sm text-slate-200"
                >
                  {c.name}
                </button>
              ))}
              {collections.filter(c => c.id !== collectionId).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">لا توجد مجموعات أخرى</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors w-full"
                onClick={() => {
                  setIsMoveModalOpen(false);
                  setPostToMove(null);
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
