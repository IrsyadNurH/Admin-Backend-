export const getImageKitFileId = (imageUrl: string): string | null => {
    try {
      const urlParts = imageUrl.split('/');
      const fileIdWithExtension = urlParts[urlParts.length - 1].split('?')[0];
      return fileIdWithExtension;
    } catch (error) {
      console.error('Error extracting file ID:', error);
      return null;
    }
  };