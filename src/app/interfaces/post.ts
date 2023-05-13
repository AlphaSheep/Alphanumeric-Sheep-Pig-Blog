export interface Post {
  id?: string;
  title: string;
  content: string;
  published: Date;
  updated: Date;
  categories: string[];
}
