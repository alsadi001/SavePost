export interface Collection {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
}

export interface Post {
  id: string;
  collectionId: string;
  tweetId: string;
  url: string;
  note?: string;
  createdAt: number;
}
