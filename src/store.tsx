import React, { createContext, useContext, useState, useEffect } from 'react';
import { Collection, Post } from './types';

interface StoreContextType {
  collections: Collection[];
  posts: Post[];
  addCollection: (name: string, color?: string, icon?: string) => void;
  updateCollection: (id: string, name: string, color?: string, icon?: string) => void;
  deleteCollection: (id: string) => void;
  addPost: (collectionId: string, url: string, note?: string) => void;
  deletePost: (id: string) => void;
  movePost: (id: string, newCollectionId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const extractTweetId = (text: string): string | null => {
  try {
    // Try to find a twitter/x url in the text
    const urlMatch = text.match(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/i);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    
    // If not a full text, try normal parsing
    const parsed = new URL(text.trim());
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    // Usually /username/status/123456789
    const statusIndex = pathParts.indexOf('status');
    if (statusIndex !== -1 && pathParts.length > statusIndex + 1) {
      return pathParts[statusIndex + 1].split('?')[0];
    }
  } catch (e) {
    // maybe it's just the ID
    if (/^\d+$/.test(text.trim())) {
      return text.trim();
    }
  }
  return null;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCollections = localStorage.getItem('x_collections');
    const savedPosts = localStorage.getItem('x_posts');
    if (savedCollections) setCollections(JSON.parse(savedCollections));
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('x_collections', JSON.stringify(collections));
  }, [collections, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('x_posts', JSON.stringify(posts));
  }, [posts, isLoaded]);

  const addCollection = (name: string, color?: string, icon?: string) => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      color: color || '#3b82f6',
      icon: icon || 'Folder',
      createdAt: Date.now(),
    };
    setCollections([...collections, newCollection]);
  };

  const updateCollection = (id: string, name: string, color?: string, icon?: string) => {
    setCollections(collections.map((c) => (c.id === id ? { ...c, name, color: color || c.color, icon: icon || c.icon } : c)));
  };

  const deleteCollection = (id: string) => {
    setCollections(collections.filter((c) => c.id !== id));
    // Also delete posts in this collection
    setPosts(posts.filter((p) => p.collectionId !== id));
  };

  const addPost = (collectionId: string, url: string, note?: string) => {
    const tweetId = extractTweetId(url);
    if (!tweetId) {
      alert('لم يتم العثور على رابط صالح في النص المدخل');
      return;
    }
    // Try to find the exact url if it was mixed in text
    let actualUrl = url;
    const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      actualUrl = urlMatch[0];
    }
      
    const newPost: Post = {
      id: crypto.randomUUID(),
      collectionId,
      tweetId,
      url: actualUrl,
      note,
      createdAt: Date.now(),
    };
    setPosts([newPost, ...posts]);
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  const movePost = (id: string, newCollectionId: string) => {
    setPosts(posts.map((p) => p.id === id ? { ...p, collectionId: newCollectionId } : p));
  };

  return (
    <StoreContext.Provider
      value={{
        collections,
        posts,
        addCollection,
        updateCollection,
        deleteCollection,
        addPost,
        deletePost,
        movePost,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
