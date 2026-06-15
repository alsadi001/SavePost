/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { StoreProvider } from './store';
import { MobileContainer } from './components/MobileContainer';
import { CollectionsScreen } from './components/CollectionsScreen';
import { PostsScreen } from './components/PostsScreen';

export default function App() {
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  return (
    <StoreProvider>
      <MobileContainer>
        {activeCollectionId ? (
          <PostsScreen
            collectionId={activeCollectionId}
            onBack={() => setActiveCollectionId(null)}
          />
        ) : (
          <CollectionsScreen onSelectCollection={setActiveCollectionId} />
        )}
      </MobileContainer>
    </StoreProvider>
  );
}

