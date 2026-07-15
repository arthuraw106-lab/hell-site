export type Role = 'USER' | 'TRANSLATOR' | 'ADMIN' | 'SUPER_ADMIN';

export type User = {
  id: string;
  phone?: string | null;
  email?: string | null;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  role: Role;
  createdAt: string;
};

export type Genre = {
  id: string;
  name: string;
  slug: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Chapter = {
  id: string;
  mangaId: string;
  number: number;
  title: string;
  slug?: string | null;
  pages: string[];
  pdfUrl?: string | null;
  zipUrl?: string | null;
  summary?: string | null;
  views: number;
  createdAt: string;
  manga?: Pick<Manga, 'id' | 'slug' | 'title' | 'cover'>;
};

export type Manga = {
  id: string;
  slug: string;
  title: string;
  altTitle?: string | null;
  description: string;
  cover?: string | null;
  banner?: string | null;
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'UPCOMING';
  published: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  genres: Genre[];
  tags?: Tag[];
  chapters: Chapter[];
  _count?: {
    likes: number;
    bookmarks: number;
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type Comment = {
  id: string;
  body: string;
  spoiler: boolean;
  reports: number;
  createdAt: string;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatar' | 'role'>;
  replies?: Comment[];
  reactions?: { id: string; emoji: string; userId: string }[];
  votes?: { id: string; value: number; userId: string }[];
};

export type Story = {
  id: string;
  text?: string | null;
  mediaUrl?: string | null;
  expiresAt: string;
  createdAt: string;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  likes: { id: string; userId: string; createdAt?: string }[];
  views?: { id: string; userId: string; createdAt?: string }[];
};
