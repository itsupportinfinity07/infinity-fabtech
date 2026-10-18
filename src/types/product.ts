export interface Product {
  sortOrder?: number;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  images: string[];
  features: string[];
  benefits: string[];
  specifications: Record<string, string>;
  applications: string[];
}
