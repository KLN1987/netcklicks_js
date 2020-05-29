'use scrict';

const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
//const API_KEY = '63cb7b80bfce3cf2d2642bcd4473f30e';
//const SERVER = 'https://api.themoviedb.org/3';

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const modal = document.querySelector('.modal');
const tvShowsList = document.querySelector('.tv-shows__list');
const tvCardVote = document.querySelector('.tv-card__vote');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList =  document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form'); 
const searchFormInput = document.querySelector('.search__form-input');
const preloader = document.querySelector('.preloader');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper');
const modalContent = document.querySelector('.modal__content');
const pagination = document.querySelector('.pagination');


const loading = document.createElement('div');
loading.className = 'loading';

const DBService = class {

  constructor() {
    this.SERVER = 'https://api.themoviedb.org/3';
    this.API_KEY = '63cb7b80bfce3cf2d2642bcd4473f30e';
  }

  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Не удалось получить данные по адресу ${url}`);
    }
  }

  getTestData = () => {
    return this.getData('test.json')
  }

  getTestCard = () => {
    return this.getData('card.json');
  }

  getSearchResult = (query) => {
    this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU`;
    return this.getData(`${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU`);
  }

  getNextPage = (page) => {
    return this.getData(this.temp + '&page=' + page);
  }

  getTvShow = (id) => {
    return this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
  }

  getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`);

  getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`);

  getToDay = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`);

  getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`);
}

const dbService = new DBService();


const renderCard = (response, target) => {
  tvShowsList.textContent = '';

  if (!response.total_results) {
    loading.remove();
    tvShowsHead.textContent = 'По вашему запросу ни чего не найдено...';
    tvShowsHead.style.color = 'red';
    return
  }

  tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
  tvShowsHead.style.color = 'black';

  response.results.forEach(item => {

    const { 
      backdrop_path: backdrop,
      name: title,
      poster_path: poster,
      vote_average: vote,
      id
    } = item

    const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
    const backdropIMG = backdrop ? IMG_URL + backdrop : ''; 
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

    const card = document.createElement('li');
    card.className = 'tv-shows__item'; 
    card.innerHTML = `
      <a href="#" id="${id}" class="tv-card">
        ${voteElem}
        <img class="tv-card__img"
          src="${posterIMG}"
          data-backdrop="${backdropIMG}"
          alt="${title}">
        <h4 class="tv-card__head">${title}</h4>
      </a>
      `;
    loading.remove();
    tvShowsList.append(card);
  });

  pagination.textContent = '';

  if (!target && response.total_pages > 1) {
    for (let i = 1; i <= response.total_pages; i++) {
      pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
    }
  }
};

//поиск сериалиалов с сервера
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = searchFormInput.value.trim(); //трим убирает пробелы вначале и конце
  if (value) {
  dbService.getSearchResult(value).then(renderCard);
  }
  tvShows.append(loading);
  searchFormInput.value = '';
})

//закрытие открытых меню в боковом окне
const closeDropdown = () => {
  dropdown.forEach(item => {
    item.classList.remove('active');
  })
}

//отрытие-закрытие меню слева
hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  closeDropdown();
});

document.addEventListener('click', (event) => {
  const target = event.target;
  //условие НЕ клика в меню
  if (!target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    closeDropdown();
  }
})

//делигрование
leftMenu.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target;
  const dropdown = target.closest('.dropdown');

  if (dropdown) {
    dropdown.classList.toggle('active');
    leftMenu.classList.add('openMenu');
    hamburger.classList.add('open');
  }

  if (target.closest('#top-rated')) {
    dbService.getTopRated().then((response) => renderCard(response, target));
    tvShows.append(loading);
  }

  if (target.closest('#popular')) {
    dbService.getPopular().then((response) => renderCard(response, target));
    tvShows.append(loading);  
  }

  if (target.closest('#week')) {
    dbService.getWeek().then((response) => renderCard(response, target));
    tvShows.append(loading); 
  }

  if (target.closest('#today')) {
    dbService.getToDay().then((response) => renderCard(response, target));
    tvShows.append(loading); 
  }

  if (target.closest('#search')) {
    tvShowsList.textContent = '';
    tvShowsHead.textContent = '';
  }
});


 //открытие/закрытие модального окна
tvShowsList.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target;
  const card = target.closest('.tv-card');
  if (card) {

    preloader.style.display = 'block';

    dbService.getTvShow(card.id)
    .then(({ poster_path: posterPath, 
      name: title, genres, 
      vote_average: voteAverage, 
      overview, 
      homepage }) => {

         if (posterPath) {
          tvCardImg.src = IMG_URL + posterPath;
          tvCardImg.alt = title;
          posterWrapper.style.display = '';
          modalContent.style.paddingLeft = '';
         } else {
          posterWrapper.style.display = 'none';
          modalContent.style.paddingLeft = '25px';
         }

          modalTitle.textContent = title;
          // genresList.innerHTML = data.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, ''); 
          genresList.textContent = '';
          /*for (const item of data.genres) {
            genresList.innerHTML += `<li>${item.name}</li>`;
          }*/
          genres.forEach(item => {
            genresList.innerHTML += `<li>${item.name}</li>`;
          })
          rating.textContent = voteAverage;
          description.textContent = overview;
          modalLink.href = homepage;
    })
    .then(() => { // для загрузки попапа при асинхронной загрузки     
      document.body.style.overflow = 'hidden';
      modal.classList.remove('hide');
    })
    .finally(() => {
      preloader.style.display = '';
    })  

  }
});

modal.addEventListener('click', (event) => {
  event.preventDefault();
  if (event.target.closest('.cross') ||
      event.target.classList.contains('modal')) {
    document.body.style.overflow = '';
    modal.classList.add('hide');
  }
})

//смена карточки
const changeImage = function (event) {
  const card = event.target.closest('.tv-shows__item');

  if (card) {     

     const img = card.querySelector('.tv-card__img');
     if(img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]; //деструкторизация
     }
  }
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target;

  if (target.classList.contains('pages')) {
    tvShows.append(loading);
    dbService.getNextPage(target.textContent).then(renderCard);
  }
})