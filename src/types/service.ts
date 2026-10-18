export interface Service {
  sortOrder?: number;
  id: string;
  title: string;
  description: string;
  benefits: string[];
  iconName: string; // Refers to Lucide icon name
}
