/** Last path segment of a document URL, query stripped, segment decoded. */
export function extractFileNameFromUrl(url: string): string {
  const path = url.split('?')[0] || url;
  const name = path.split('/').pop() || '';
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

/**
 * Upload pipeline often prefixes stored keys with a timestamp id, e.g. 1775140643403_original.pdf
 */
export function stripGeneratedUploadPrefix(fileName: string): string {
  if (!fileName?.trim()) {
    return fileName;
  }
  let n = fileName.replace(/^\d{10,}_\.?/i, '');
  n = n.replace(/^\.+/, '').trim();
  return n.length > 0 ? n : fileName;
}

export function displayUploadedFileNameFromUrl(url: string): string {
  return stripGeneratedUploadPrefix(extractFileNameFromUrl(url));
}
