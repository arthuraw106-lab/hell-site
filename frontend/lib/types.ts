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

export type MangaStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'UPCOMING';

export type Manga = {
  id: string;
  slug: string;
  title: string;
  altTitle?: string | null;
  description: string;
  cover?: string | null;
  banner?: string | null;
  status: MangaStatus;
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
  views: { id: string; userId: string; createdAt?: string }[];
  _count?: {
    likes: number;
    views: number;
  };
};

export type TeamRole = 'TRANSLATOR' | 'CLEANER' | 'TYPESETTER' | 'EDITOR' | 'UPLOADER';
export type TeamJoinStatus =
  | 'TEST_PENDING'
  | 'TEST_APPROVED'
  | 'TEST_REJECTED'
  | 'PROFILE_PENDING'
  | 'FULL_APPROVED'
  | 'REJECTED';
export type TeamTaskStatus = 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type TeamMemberProfile = {
  id: string;
  userId: string;
  teamRole: TeamRole;
  status: TeamJoinStatus;
  phone?: string | null;
  telegramId?: string | null;
  cardNumber?: string | null;
  walletBalance: number;
  user?: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  createdAt: string;
};

export type TeamTask = {
  id: string;
  assigneeId: string;
  mangaId?: string | null;
  chapterId?: string | null;
  role: TeamRole;
  title: string;
  description?: string | null;
  price: number;
  deadlineAt?: string | null;
  status: TeamTaskStatus;
  submittedFileUrl?: string | null;
  submittedNote?: string | null;
  submittedAt?: string | null;
  createdAt: string;
};

export type TeamWalletTransaction = {
  id: string;
  memberId: string;
  type: 'CREDIT' | 'DEBIT' | 'PENALTY' | 'BONUS' | 'PAYMENT';
  amount: number;
  reason?: string | null;
  taskId?: string | null;
  createdAt: string;
};

export type PollProject = {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  active: boolean;
  _count?: {
    votes: number;
  };
  createdAt: string;
};

export type Ticket = {
  id: string;
  userId: string;
  category: string;
  subject: string;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  user?: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  messages?: TicketMessage[];
  createdAt: string;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  userId: string;
  body: string;
  isAdmin: boolean;
  user?: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  createdAt: string;
};

export type ChatRoom = {
  id: string;
  type: 'PRIVATE' | 'GROUP';
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  isPrivate: boolean;
  avatar?: string | null;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  userId: string;
  type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'SYSTEM';
  body?: string | null;
  mediaUrl?: string | null;
  user?: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  createdAt: string;
};

export type Upload = {
  id: string;
  userId: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  kind: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'PDF' | 'ZIP' | 'OTHER';
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'SYSTEM' | 'COMMENT' | 'TICKET' | 'TEAM' | 'MANGA' | 'CHAT';
  title: string;
  body?: string | null;
  read: boolean;
  createdAt: string;
};