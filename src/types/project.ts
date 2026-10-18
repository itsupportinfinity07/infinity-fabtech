export interface Project {
  id: string;
  name: string;
  location: string;
  client: string;
  type: string;
  area: string;
  year: string;
  description: string;
  highlights: string[];
  scope: string[];
  /** Cover image path (public/). Replace with real site photos when available. */
  image: string;
  gallery: string[];
}
