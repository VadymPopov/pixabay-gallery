import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const key = '32812344-7b97d09a2c2134941397ef385';

async function getImages(userInput = '', page = 1) {
  const searchParams = new URLSearchParams({
    per_page: 40,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
  });

  try {
    const response = await axios.get(
      `?key=${key}&q=${userInput}&${searchParams}`
    );
    const images = await response.data;
    return images;
  } catch (error) {
    throw new Error(error);
  }
}

export { getImages };
