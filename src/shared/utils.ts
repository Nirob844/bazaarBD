export const asyncForEach = async (array: any[], callback: any) => {
  if (!Array.isArray(array)) {
    throw new Error('Expected an array');
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const extractImageUrlsFromContent = (content: string): string[] => {
  const imageUrls: string[] = [];
  const regex = /<img[^>]+src="([^">]+)"/g; // Regex to match image URLs in HTML
  let match;

  while ((match = regex.exec(content)) !== null) {
    imageUrls.push(match[1]); // Add the image URL to the array
  }

  return imageUrls;
};
