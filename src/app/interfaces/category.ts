import { PostSummary } from "./post.summary";

export interface Category {
  name: string;
  posts: PostSummary[];
}
