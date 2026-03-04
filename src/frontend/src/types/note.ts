export interface Note {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  createdAt: bigint;
  updatedAt: bigint;
  pinned: boolean;
}
