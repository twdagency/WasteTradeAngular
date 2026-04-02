import {
  displayUploadedFileNameFromUrl,
  extractFileNameFromUrl,
  stripGeneratedUploadPrefix,
} from './document-filename.utils';

describe('document-filename.utils', () => {
  describe('extractFileNameFromUrl', () => {
    it('returns last path segment and decodes', () => {
      expect(extractFileNameFromUrl('https://x.com/a/b/hello%20world.pdf?token=1')).toBe('hello world.pdf');
    });
  });

  describe('stripGeneratedUploadPrefix', () => {
    it('removes long numeric timestamp prefix', () => {
      expect(stripGeneratedUploadPrefix('1775140643403_.post-consumer-pet-trays.pdf')).toBe('post-consumer-pet-trays.pdf');
      expect(stripGeneratedUploadPrefix('1775140643403_post.pdf')).toBe('post.pdf');
    });

    it('does not strip short numeric prefixes', () => {
      expect(stripGeneratedUploadPrefix('2024_report.pdf')).toBe('2024_report.pdf');
    });

    it('leaves normal filenames unchanged', () => {
      expect(stripGeneratedUploadPrefix('WASTETRADE TDS DESIGN 2.pdf')).toBe('WASTETRADE TDS DESIGN 2.pdf');
    });
  });

  describe('displayUploadedFileNameFromUrl', () => {
    it('extracts from URL then strips upload prefix', () => {
      const url = 'https://cdn.example.com/uploads/1775140643403_.my-doc.pdf';
      expect(displayUploadedFileNameFromUrl(url)).toBe('my-doc.pdf');
    });
  });
});
