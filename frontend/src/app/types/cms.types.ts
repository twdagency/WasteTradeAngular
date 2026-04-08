export interface StrapiResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
}

export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
}

export type StrapiBlockNode =
  | StrapiParagraphBlock
  | StrapiHeadingBlock
  | StrapiListBlock
  | StrapiImageBlock
  | StrapiQuoteBlock
  | StrapiCodeBlock;

export interface StrapiParagraphBlock {
  type: 'paragraph';
  children: StrapiInlineNode[];
}

export interface StrapiHeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: StrapiInlineNode[];
}

export interface StrapiListBlock {
  type: 'list';
  format: 'ordered' | 'unordered';
  children: StrapiListItemNode[];
}

export interface StrapiListItemNode {
  type: 'list-item';
  children: StrapiInlineNode[];
}

export interface StrapiImageBlock {
  type: 'image';
  image: StrapiImage;
  children: StrapiInlineNode[];
}

export interface StrapiQuoteBlock {
  type: 'quote';
  children: StrapiInlineNode[];
}

export interface StrapiCodeBlock {
  type: 'code';
  children: StrapiInlineNode[];
}

export interface StrapiInlineNode {
  type: 'text' | 'link';
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  children?: StrapiInlineNode[];
}

// Content type interfaces

export interface CmsArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: StrapiBlockNode[];
  publishedDate: string | null;
  featuredImage: StrapiImage | null;
  author: CmsAuthor | null;
  category: CmsCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsAuthor {
  id: number;
  documentId: string;
  name: string;
}

export interface CmsCategory {
  id: number;
  documentId: string;
  name: string;
}

export interface CmsJob {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: StrapiBlockNode[];
  location: string | null;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | null;
  salaryPerYear: string | null;
  type: 'Full Time' | 'Part Time' | null;
  createdAt: string;
  updatedAt: string;
}

export type ResourceCategory =
  | 'WasteTrade Guides'
  | 'Plastics'
  | 'Paper'
  | 'Metals'
  | 'Rubber'
  | 'Recycling'
  | 'Waste Logistics'
  | 'Environmental'
  | 'Regulations';

export interface CmsResource {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: StrapiBlockNode[];
  featuredImage: StrapiImage | null;
  resourceCategory: ResourceCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsMaterialLandingPage {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: StrapiBlockNode[];
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}
