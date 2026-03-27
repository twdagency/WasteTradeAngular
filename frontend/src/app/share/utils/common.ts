export const downloadFile = async (url: string) => {
  const fileName = url.split('/').pop()?.split('?')[0] || 'download';
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download failed:', err);
    window.open(url, '_blank', 'noopener');
  }
};

export const scrollTop = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window?.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

/**
 * Removes null, undefined properties from an object
 */
export const removeNilProperties = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null)) as Partial<T>;
};
