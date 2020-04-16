// ссылка на API с ключем
const url = 'https://www.omdbapi.com/?apikey=14134d9';
// DOM елементы
const dom = {
    main: document.querySelector('main'),
    titleInput: document.querySelector('#title-input'),
    selectType: document.querySelector('#select-type'),
    resultSection: document.querySelector('.result-section'),
    pagination: creator('div', 'pagination'),
    cards: creator('div', 'cards'),
    error: creator('h3', 'message-error'),
    modal: null,
}
// опции для поиска фильмов
const options = {
    title: null,
    type: null,
    page: 1,
    maxPage: 1,
}
// обьект с фильмами - ключ ->ID фильма
let films = {};
// ссылка - если постера в фильме нет
let noImage = "././img/no_image.jpg";
dom.resultSection.appendChild(dom.pagination);
dom.resultSection.appendChild(dom.cards);
dom.resultSection.appendChild(dom.error);
// обработчик клика на кнопку поиск
document.querySelector('.btn-search').addEventListener('click', searchHandler);

function searchHandler() {
    if ((options.title !== dom.titleInput.value) ||
        (options.type !== dom.selectType.value)) {
        options.title = dom.titleInput.value;
        dom.titleInput.value = '';
        options.type = dom.selectType.value;
        options.page = 1;
        if (options.title.trim().length > 0) {
            getFilms(options);
        }
        return;
    }
}
// функция для получения обьекта с фильмами - принимает обьект - options 
function getFilms({
    title,
    type,
    page
}) {
    fetch(`${url}&s=${title}&plot=full&type=${type}&page=${page}`)
        .then(res => res.json())
        .then(data => {
            clearNode();
            showFilms(data);
        });
}
// функция для показа карточек фильмов - и рендера пагинации
function showFilms(data) {
    if (data.Response == 'True') {
        options.maxPage = Math.ceil(data.totalResults / 10);
        dom.resultSection.appendChild(addFilmCards(data));
        dom.resultSection.appendChild(pagination(options.page));
    } else {
        dom.error.textContent = data.Error;
        dom.resultSection.appendChild(dom.error);
    }
}
// функция создает карточки с содержимым и вставляет контейнер для карточек, который и возвращает
function addFilmCards({
    Search
}) {
    dom.cards = creator('div', 'cards')
    dom.cards.classList.add('cards');
    for (let e of Search) {
        // создаем обьект с фильмами - ключ это ID фильма (для показа полной карточки)
        films = Object.assign({}, films, {
            [e.imdbID]: e
        });
        // создаем маленькую карточку
        let card = creator('div', 'card');
        // создаем кнопку details
        let btn = creator('input', 'card-btn-details')
        //для простого доступа к нужному фильму при клике на кнопку - записываем ID фильма в dataset 
        btn.dataset.id = e.imdbID;
        btn.setAttribute("type", "button");
        btn.setAttribute("value", "DETAILS");
        btn.addEventListener('click', clickDetail);
        let link = e.Poster;
        // проверка есть ли ссылка на изображение
        link == 'N/A' ? link = noImage : 0;
        // создание контейнера для изображения
        let img = creator('div', 'img');
        // две ссылки - если первая вернет 404 - сработает вторая
        img.style.backgroundImage = `url(${link}), url(${noImage})`;
        // текстовая информация карточки
        let type = creator('span', 'card-text-type');
        type.textContent = e.Type;
        let title = creator('span', 'card-text-title');
        title.textContent = e.Title;
        let year = creator('span', 'card-text-year');
        year.textContent = e.Year;
        // контейнер для текстовой информации
        let container = creator('div', 'card-text-container');
        // принимает все узлы с текстом
        container.append(type, title, year, btn);
        card.appendChild(img);
        card.appendChild(container);
        dom.cards.appendChild(card);
    }
    return dom.cards;
}
// обработчик клика по кнопке detail
function clickDetail(ev) {
    if (dom.modal == null) {
        let fullInfoUrl = `${url}&i=${ev.target.dataset.id}`;
        let film;
        fetch(fullInfoUrl)
            .then(response => response.json())
            .then(data => createFullCard(data))
    }
}

function createFullCard(film) {
    dom.modal = creator('div', 'modal');
    dom.modal.addEventListener('click', closeFullCard);
    document.body.classList.toggle('modal-open');
    let fullCard = creator('div', 'modal-fullcard');
    let h3 = creator('div', 'modal-h3');
    h3.textContent = 'Film info:';
    let textContainer = creator('div', 'fullcard-text');
    let table = creator('table', 'fullcard-table');
    let tbody = creator('tbody', 'fullcard-table-tbody');
    let img = creator('div', 'fullcard-img');
    let link = film.Poster;
    link == 'N/A' ? link = noImage : 0;
    img.style.backgroundImage = `url(${link}),url(${noImage})`;
    rowCreator(tbody, 'Title:', film.Title, 0);
    rowCreator(tbody, 'Released:', film.Released, 1);
    rowCreator(tbody, 'Genre:', film.Genre, 2);
    rowCreator(tbody, 'Country:', film.Country, 3);
    rowCreator(tbody, 'Director:', film.Director, 4);
    rowCreator(tbody, 'Writer:', film.Writer, 5);
    rowCreator(tbody, 'Actors:', film.Actors, 6);
    rowCreator(tbody, 'Awards:', film.Awards, 7);
    rowCreator(tbody, 'Plot:', film.Plot, 8);
    table.appendChild(tbody);
    textContainer.appendChild(table);
    fullCard.appendChild(img);
    fullCard.appendChild(textContainer);
    dom.modal.appendChild(h3);
    dom.modal.appendChild(fullCard);
    dom.main.appendChild(dom.modal);
}

function closeFullCard() {
    if (dom.modal == null) {
        dom.modal = document.querySelector('.modal');
    }
    dom.main.removeChild(dom.modal);
    dom.modal = null;
    document.body.classList.toggle('modal-open');
}
// название подтверждает назначение функции
function pagination(n) {
    dom.pagination = creator('div', 'pagination');
    // условие - если количество страниц меньше 5 - рендер пагинации без кнопок со стрелками и троеточия
    if (options.maxPage > 5) {
        // кнопка предыдущая страница
        let lArr = creator('a', 'pag-btn-left');
        lArr.innerHTML = `&laquo;`;
        //кнопка следующая страница 
        let rArr = creator('a', 'pag-btn-right');
        rArr.innerHTML = `&raquo;`;
        // обработчики клика по кнопкам
        lArr.addEventListener('click', prew);
        rArr.addEventListener('click', next);
        // кнопка последней страницы
        let lastPage = creator('a', 'pag-btn-last');
        lastPage.textContent = options.maxPage;
        // кнопка первой страницы
        let firstPage = creator('a', 'pag-btn-first');
        firstPage.textContent = 1;
        // три точки в пагинации
        let threeDots = creator('span', 'pag-dots');
        threeDots.textContent = '...';
        let dotsClone = threeDots.cloneNode(true);
        // в контейнер вставляем кнопки "предыдущая страница", "первая страница", "три точки"
        dom.pagination.appendChild(lArr);
        dom.pagination.appendChild(firstPage);
        dom.pagination.appendChild(dotsClone);
        // обработчик события на клик первой страницы
        firstPage.addEventListener('click', clickPage);
        // с какой цифры начинать рендер кнопок
        let i = n - 1;
        // по какую цифру будет происходить рендер кнопок
        let to = n + 1;
        // условие для первых трех и последних трех страниц(убираются три точки, 
        // и если пользователь на первой или последней странице - им добавляем класс "active")
        if (i <= 2) {
            i = 1;
            to = 3;
            dotsClone.style.display = 'none';
            n == 1 ? firstPage.classList.add('active') : 0;
        } else if (i >= options.maxPage - 3) {
            i = options.maxPage - 3;
            to = options.maxPage - 1;
            threeDots.style.display = 'none';
            n == options.maxPage ? lastPage.classList.add('active') : 0;
        }
        // цикл для рендера кнопок
        for (; i <= to; i++) {
            // создаем кнопку
            let btn = creator('a', `pag-btn-num`);
            if (i == 1) {
                // если первая страница - смещаем рендер на 1 позицию
                i++;
                to++;
            }
            // если итератор равен активной странице - добавляем кнопке класс "active"
            if (i == n) {
                btn.classList.add('active');
            }
            // устанавливаем числовое значение для кнопки
            btn.textContent = i;
            // обработчик клика на кнопку с числом
            btn.addEventListener('click', clickPage);
            // вставляем кнопку в конец контейнера-пагинации
            dom.pagination.appendChild(btn);
            // если итератор равен границе рендера пагинации- 
            // вставляем три точки, 
            // кнопку последней страницы и 
            // кнопку следующей страницы
            if (i == to) {
                lastPage.addEventListener('click', clickPage);
                dom.pagination.appendChild(threeDots);
                dom.pagination.appendChild(lastPage);
                dom.pagination.appendChild(rArr);
            }
        }
    } else {
        for (let i = 1; i <= options.maxPage; i++) {
            let btn = creator('a', `pag-btn-num`);
            if (i == n) {
                btn.classList.add('active');
            }
            btn.textContent = i;
            btn.addEventListener('click', clickPage);
            dom.pagination.appendChild(btn);
        }
    }
    return dom.pagination;
}
// обработчик нажатия кнопки с номером страницы
function clickPage(ev) {
    options.page = +ev.target.innerText;
    getFilms(options);
    return;
}
// обработчик нажатия кнопки следующей страницы
function next() {
    if (options.page == options.maxPage) {
        return;
    } else {
        options.page++;
        getFilms(options);
    }
    return;
}
// обработчик нажатия кнопки предыдущей страницы
function prew() {
    if (options.page == 1) {
        return;
    } else {
        options.page--;
        getFilms(options)
    }
    return;
}
// очиститель контейнера 
function clearNode() {
    dom.resultSection.contains(dom.error) ? dom.resultSection.removeChild(dom.error) : 0;
    dom.resultSection.contains(dom.pagination) ? dom.resultSection.removeChild(dom.pagination) : 0;
    dom.resultSection.contains(dom.cards) ? dom.resultSection.removeChild(dom.cards) : 0;
}
// создатель элементов-с присвоением имени класса
function creator(el, cl) {
    let e = document.createElement(el);
    e.classList.add(cl);
    return e;
}

function rowCreator(body, title, txt, r) {
    let row = body.insertRow(r);
    let name = row.insertCell(0);
    name.textContent = title;
    let text = row.insertCell(1);
    text.textContent = txt;
    return;
}