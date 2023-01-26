import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { getImages } from './api';
import { form, gallery, loader, preloaderWrapper } from './refs';
import { createListMarkup, addMarkup } from './markup';

let page = 1;

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: '250',
  captionType: 'alt',
  overlay: false,
});

window.addEventListener('load', preloaderHide);

function preloaderHide() {
  preloaderWrapper.classList.add('visually-hidden');
  setTimeout(() => {
    preloaderWrapper.style.display = 'none';
  }, 400);
}

form.addEventListener('submit', onFormSubmit);

async function onFormSubmit(evt) {
  loader.classList.remove('visually-hidden');
  evt.preventDefault();
  cleanUpMarkup(gallery);
  page = 1;

  const userInput = evt.target.searchQuery.value.trim();
  localStorage.setItem('input', userInput);

  if (!userInput) {
    loader.classList.add('visually-hidden');
    Notify.info("Search line can't be empty, try again");
    return;
  }
  const data = await getImages(userInput, page);
  console.log(data);

  try {
    searchRequest(data);
    loader.classList.add('visually-hidden');
  } catch (error) {
    onFetchError(error);
  }
}

function searchRequest(arr) {
  if (page === 1 && arr.hits.length > 1) {
    Notify.success(`Hooray! We found ${arr.totalHits} images.`);
  } else if (arr.hits.length === 0 && page === 1) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  const markup = createListMarkup(arr);
  addMarkup(markup);
  observer.observe(document.querySelector('.gallery__link:last-child'));

  lightbox.refresh();
}

function LoadMoreRequest(arr) {
  const markup = createListMarkup(arr);
  addMarkup(markup);
  observer.observe(document.querySelector('.gallery__link:last-child'));
  lightbox.refresh();
}

function onFetchError(err) {
  console.log(err.message);
}

function cleanUpMarkup(link) {
  link.innerHTML = '';
}

let options = {
  threshold: 0.5,
};

let observer = new IntersectionObserver(onScroll, options);

async function onScroll(entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      page += 1;

      const input = localStorage.getItem('input');
      const data = await getImages(input, page);
      const totalPages = data.totalHits / 40;

      if (page > totalPages) {
        observer.unobserve(entry.target);
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      try {
        LoadMoreRequest(data);
      } catch (error) {
        onFetchError(error);
      }
    }
  });
}
