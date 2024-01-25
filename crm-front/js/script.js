(() => {
  const TIMEOUT = 300;
  const LONG_TIMEOUT = 1000;
  const MAX_TIMEOUT = 3000;

  const headerLayout = createHeaderLayout();
  const mainLayout = createMainLayout();
  const modalLayout = createModalLayout();
  const modalForm = createModalForm();
  const modalConfirmDel = createConfirmDelete();

  const serverURL = 'http://localhost:3000/api/clients';
  let serverArr = [];
  let contactsArr = [];

  let optionsArr = ['Телефон', 'Доп. телефон', 'Email', 'Vk', 'Facebook', 'Другое'];

  function createHeaderLayout() {
    const header = document.createElement('header');
    const headerContainer = document.createElement('div');
    const headerLogoWrap = document.createElement('div');
    const headerLogo = document.createElement('img');
    const headerSearchWrap = document.createElement('div');
    const headerSearchInput = document.createElement('input');
    const headerSearchList = document.createElement('ul');

    header.classList.add('header');
    headerContainer.classList.add('header__container', 'container', 'flex');
    headerLogoWrap.classList.add('header__logo-wrap');
    headerLogo.classList.add('header__logo');
    headerSearchWrap.classList.add('header__search-wrap');
    headerSearchInput.classList.add('header__search-input');
    headerSearchList.classList.add('header__search-list', 'list-reset');

    headerLogo.src = 'img/skb-logo.svg';
    headerLogo.alt = 'Логотип';

    headerSearchInput.placeholder = 'Введите запрос';
    headerSearchList.style.cursor = 'pointer';

    // слушаем инпут и рендерим список поиска
    headerSearchInput.addEventListener('input', async () => {
      let resultOfSearch;

      !headerSearchInput.value ? resultOfSearch = searchServerObj([], headerSearchInput.value) : resultOfSearch = searchServerObj(await getServerData(), headerSearchInput.value);
      setTimeout(() => createSearchResultItem(resultOfSearch), TIMEOUT);
    });

    headerSearchWrap.append(headerSearchInput, headerSearchList);
    headerLogoWrap.append(headerLogo);
    headerContainer.append(headerLogoWrap, headerSearchWrap);
    header.append(headerContainer);

    return {
      header,
      headerSearchInput,
      headerSearchList,
    }
  }

  // поиск объектов в массиве (при каждом событии 'input' в поиске, забираем массив с сервера)
  function searchServerObj(arr, value) {
    let arrCopy = [...arr];
    // фильтруем по ключам ф.и.о.
    let searched = {
      name: arrCopy.filter(obj => obj.name.includes(value.replaceAll('ё', 'е').charAt(0).toUpperCase() + value.slice(1))),
      surname: arrCopy.filter(obj => obj.surname.includes(value.replaceAll('ё', 'е').charAt(0).toUpperCase() + value.slice(1))),
      lastName: arrCopy.filter(obj => obj.lastName.includes(value.replaceAll('ё', 'е').charAt(0).toUpperCase() + value.slice(1))),
    };
    // собираем один массив поиска и фильтруем дубликаты объектов
    let result = [...searched.name, ...searched.surname, ...searched.lastName];
    return result.filter((a, b) => result.indexOf(a) === b);
  }

  // создаем эл-ты и добавляем в список результатов поиска
  function createSearchResultItem(arr) {
    headerLayout.headerSearchList.innerHTML = '';

    arr.forEach((obj) => {
      const searchItemElem = document.createElement('li');
      searchItemElem.textContent = `${obj.surname} ${obj.name} ${obj.lastName}`;
      searchItemElem.setAttribute('data-id', obj.id);
      searchItemElem.setAttribute('tabindex', '0');
      headerLayout.headerSearchList.append(searchItemElem);
      // вешаем клик для поиска аналогичного эл-та в таблице
      searchItemElem.addEventListener('click', () => {
        const similarTableElem = mainLayout.mainTbody.querySelector(`[data-id='${searchItemElem.dataset.id}']`);
        similarTableElem.style.backgroundColor = '#ceffce';
        setTimeout(() => similarTableElem.style.backgroundColor = 'inherit', LONG_TIMEOUT);
        similarTableElem.scrollIntoView({ block: 'center', behavior: 'smooth' });
        headerLayout.headerSearchList.innerHTML = '';
        headerLayout.headerSearchInput.value = '';
      });
      // триггер для клавиатуры
      createKeyupClickTrigger(searchItemElem, 'Enter');

    });
  }

  function createMainLayout() {
    const main = document.createElement('main');
    const mainContainer = document.createElement('div');
    const mainTitle = document.createElement('h2');
    const mainTablePlug = document.createElement('div');
    const mainTableWrap = document.createElement('div');
    const mainTable = document.createElement('table');
    const mainThead = document.createElement('thead');
    const mainTheadTr = document.createElement('tr');
    const mainThId = document.createElement('th');
    const mainThFullName = document.createElement('th');
    const mainThCreated = document.createElement('th');
    const mainThUpdated = document.createElement('th');
    const mainThContacts = document.createElement('th');
    const mainThActions = document.createElement('th');
    const mainTbody = document.createElement('tbody');
    const mainBtnAdd = document.createElement('button');

    main.classList.add('main');
    mainContainer.classList.add('main__container', 'container', 'flex');
    mainTablePlug.classList.add('table__plug', 'flex');
    mainTitle.classList.add('main__title', 'title');
    mainTableWrap.classList.add('main__table-wrap');
    mainTable.classList.add('main__table', 'table');
    mainThead.classList.add('table__head', 'thead');
    mainTheadTr.classList.add('thead__tr');
    mainTbody.classList.add('table__body', 'tbody', 'hidden');
    mainBtnAdd.classList.add('main__add-btn', 'btn-reset');

    mainTitle.textContent = 'Клиенты';

    const loadCircle = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.00025 40.0005C4.00025 59.8825 20.1182 76.0005 40.0002 76.0005C59.8822 76.0005 76.0002 59.8825 76.0002 40.0005C76.0002 20.1185 59.8823 4.00049 40.0003 4.00049C35.3513 4.00048 30.9082 4.88148 26.8282 6.48648" stroke="#9873FF" stroke-width="8" stroke-miterlimit="10" stroke-linecap="round"/>
    </svg>`;
    mainTablePlug.innerHTML = loadCircle;

    const arrowSort = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4L7.295 3.295L4.5 6.085L4.5 0L3.5 0L3.5 6.085L0.71 3.29L0 4L4 8L8 4Z" fill="#9873FF"/>
    </svg>`;
    mainThId.innerHTML = 'ID ' + arrowSort;
    mainThFullName.innerHTML = 'Фамилия Имя Отчество ' + arrowSort + ' А-Я';
    mainThCreated.innerHTML = 'Дата и время <br />создания ' + arrowSort;
    mainThUpdated.innerHTML = 'Последние <br />изменения ' + arrowSort;
    mainThContacts.innerHTML = 'Контакты ';
    mainThActions.innerHTML = 'Действия';

    const btnAddSvg = `<svg width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 8C16.71 8 18.5 6.21 18.5 4C18.5 1.79 16.71 0 14.5 0C12.29 0 10.5 1.79 10.5 4C10.5 6.21 12.29 8 14.5 8ZM5.5 6V3H3.5V6H0.5V8H3.5V11H5.5V8H8.5V6H5.5ZM14.5 10C11.83 10 6.5 11.34 6.5 14V16H22.5V14C22.5 11.34 17.17 10 14.5 10Z"/>
    </svg>`;
    mainBtnAdd.innerHTML = btnAddSvg + 'Добавить клиента';

    mainThId.style.cursor = 'pointer';
    mainThFullName.style.cursor = 'pointer';
    mainThCreated.style.cursor = 'pointer';
    mainThUpdated.style.cursor = 'pointer';

    mainTheadTr.append(mainThId, mainThFullName, mainThCreated, mainThUpdated, mainThContacts, mainThActions);
    mainThead.append(mainTheadTr);
    mainTable.append(mainThead, mainTbody);
    mainTableWrap.append(mainTable);
    mainContainer.append(mainTablePlug, mainTitle, mainTableWrap, mainBtnAdd);
    main.append(mainContainer);

    // сортировка по заголовкам таблицы
    mainThId.addEventListener('click', () => {
      sortTableData(serverArr, mainThId, 'id');
    });
    mainThFullName.addEventListener('click', () => {
      sortTableData(serverArr, mainThFullName, 'surname');
    });
    mainThCreated.addEventListener('click', () => {
      sortTableData(serverArr, mainThCreated, 'createdAt');
    });
    mainThUpdated.addEventListener('click', () => {
      sortTableData(serverArr, mainThUpdated, 'updatedAt');
    });

    // слушаем кнопку 'Добавить клиента' для показа модального окна
    mainBtnAdd.addEventListener('click', () => {
      modalLayout.modalWrap.classList.remove('hidden');
      modalForm.form.classList.remove('d-none');
      modalConfirmDel.confirmDelWrap.classList.add('d-none');
      modalLayout.modalTitle.textContent = 'Новый клиент';
      modalLayout.modalTitleId.textContent = '';

      document.querySelectorAll('label').forEach((label) => {
        label.classList.add('hidden');
      });

      modalLayout.modalBottomBtn.textContent = 'Отмена';
      modalLayout.modalBottomBtn.removeAttribute('data-id');
      // console.log(mainTbody.children.length);
    });

    return {
      main,
      mainTablePlug,
      mainThead,
      mainThId,
      mainTbody,
      mainBtnAdd,
    };
  }

  // функция сортировки данных таблицы по столбцам
  function sortTableData(arr, thead, prop) {
    let arrCopy = [...arr];

    const arrow = thead.querySelector('svg');
    if (thead.classList.contains('sort-ab')) {
      thead.classList.remove('sort-ab');
      arrow.style.transform = 'rotate(0deg)';
      arrCopy = arrCopy.sort(function (a, b) {
        if (a[prop] > b[prop]) return -1;
      });
    } else {
      thead.classList.add('sort-ab');
      arrow.style.transform = 'rotate(180deg)';
      arrCopy = arrCopy.sort(function (a, b) {
        if (a[prop] < b[prop]) return -1;
      });
    }
    renderTableData(arrCopy);
  };

  // создаем разметку строки таблицы для каждого нового объекта
  function createTbodyRow() {
    const tbodyTr = document.createElement('tr');
    const trTdId = document.createElement('td');
    const trTdFullName = document.createElement('td');
    const trTdCreated = document.createElement('td');
    const tdCreatedDateSpan = document.createElement('span');
    const tdCreatedTimeSpan = document.createElement('span');
    const trTdUpdated = document.createElement('td');
    const tdUpdatedDateSpan = document.createElement('span');
    const tdUpdatedTimeSpan = document.createElement('span');
    const trTdContacts = document.createElement('td');
    const contactMoreContactsBtn = document.createElement('button');
    const trTdAction = document.createElement('td');
    const tdUpdBtn = document.createElement('button');
    const tdDelBtn = document.createElement('button');

    trTdAction.classList.add('tbody__td-action', 'flex');
    contactMoreContactsBtn.classList.add('tbody__td-more-contacts-btn', 'btn-reset', 'd-none');
    tdUpdBtn.classList.add('tbody__td-upd-btn', 'btn-reset');
    tdDelBtn.classList.add('tbody__td-del-btn', 'btn-reset');

    const updSvg = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 10.5002V13.0002H2.5L9.87333 5.62687L7.37333 3.12687L0 10.5002ZM11.8067 3.69354C12.0667 3.43354 12.0667 3.01354 11.8067 2.75354L10.2467 1.19354C9.98667 0.933535 9.56667 0.933535 9.30667 1.19354L8.08667 2.41354L10.5867 4.91354L11.8067 3.69354Z" fill="#9873FF"/>
    </svg>`;
    const delSvg = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill="#F06A4D"/>
    </svg>`;
    tdUpdBtn.innerHTML = updSvg + ' Изменить';
    tdDelBtn.innerHTML = delSvg + ' Удалить';

    trTdCreated.append(tdCreatedDateSpan, tdCreatedTimeSpan);
    trTdUpdated.append(tdUpdatedDateSpan, tdUpdatedTimeSpan);
    trTdContacts.append(contactMoreContactsBtn);
    trTdAction.append(tdUpdBtn, tdDelBtn)
    tbodyTr.append(trTdId, trTdFullName, trTdCreated, trTdUpdated, trTdContacts, trTdAction);

    return {
      tbodyTr,
      trTdId,
      trTdFullName,
      trTdCreated,
      tdCreatedDateSpan,
      tdCreatedTimeSpan,
      trTdUpdated,
      tdUpdatedDateSpan,
      tdUpdatedTimeSpan,
      trTdContacts,
      contactMoreContactsBtn,
      tdUpdBtn,
      tdDelBtn,
    };
  }

  // разметка обертки модального окна
  function createModalLayout() {
    const modalWrap = document.createElement('div');
    const modal = document.createElement('div');
    const modalTitle = document.createElement('h3');
    const modalTitleId = document.createElement('span');
    const modalCloseBtn = document.createElement('button');
    const modalAppendWrap = document.createElement('div');
    const modalBottomBtn = document.createElement('button');

    modalWrap.classList.add('modal-wrap', 'hidden');
    modal.classList.add('modal-wrap__modal', 'modal', 'flex');
    modalTitle.classList.add('modal__title', 'title');
    modalTitleId.classList.add('modal__title-id');
    modalCloseBtn.classList.add('modal__close-btn', 'btn-reset');
    modalBottomBtn.classList.add('modal__bottom-btn', 'btn-reset');

    modalCloseBtn.innerHTML = `<svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2332 7.73333L21.2665 6.76666L14.4998 13.5334L7.73318 6.7667L6.76652 7.73336L13.5332 14.5L6.76654 21.2667L7.73321 22.2333L14.4998 15.4667L21.2665 22.2334L22.2332 21.2667L15.4665 14.5L22.2332 7.73333Z" fill="#B0B0B0"/>
    </svg>`;

    modal.append(modalTitle, modalTitleId, modalCloseBtn, modalAppendWrap, modalBottomBtn);
    modalWrap.append(modal);

    // слушаем кнопку 'Закрыть' и 'Отмена', для закрытия модального окна
    modalCloseBtn.addEventListener('click', () => {
      modalWrap.classList.add('hidden');
      const formInputs = modalForm.form.getElementsByTagName('input');
      [...formInputs].forEach((input) => {
        input.value = '';
      });
      modalForm.contactList.innerHTML = '';
      modalForm.saveBtn.removeAttribute('data-id');
    });
    modalBottomBtn.addEventListener('click', () => {
      if (modalBottomBtn.textContent === 'Отмена') {
        modalWrap.classList.add('hidden');

        const formInputs = modalForm.form.getElementsByTagName('input');
        [...formInputs].forEach((input) => {
          input.value = '';
          input.style.borderColor = '#C8C5D1';
        });

        modalForm.contactList.innerHTML = '';
        modalForm.saveBtn.removeAttribute('data-id');
        modalTitleId.classList.remove('d-none');
      } else if (modalBottomBtn.textContent === 'Удалить клиента') {
        modalConfirmDel.confirmDelBtn.setAttribute('data-id', modalBottomBtn.dataset.id);

        modalForm.form.classList.add('d-none');
        modalConfirmDel.confirmDelWrap.classList.remove('d-none');
        modalWrap.classList.remove('hidden');
        modalTitle.style.alignSelf = 'center';
        modalTitle.textContent = 'Удалить клиента';
        modalTitleId.classList.add('d-none');
        modalBottomBtn.textContent = 'Отмена';
      }
    });

    return {
      modalWrap,
      modal,
      modalTitle,
      modalTitleId,
      modalAppendWrap,
      modalBottomBtn,
    };
  }

  // форма модального окна для добавления и изменения данных 
  function createModalForm() {
    const form = document.createElement('form');
    const surnameLabel = document.createElement('label');
    const surnameInput = document.createElement('input');
    const nameLabel = document.createElement('label');
    const nameInput = document.createElement('input');
    const lastNameLabel = document.createElement('label');
    const lastNameInput = document.createElement('input');
    const contactWrap = document.createElement('div');
    const contactList = document.createElement('ul');
    const addContactBtn = document.createElement('button');
    const warningWrap = document.createElement('div');
    const warningText = document.createElement('p');
    const saveBtn = document.createElement('button');

    form.classList.add('modal__form', 'form', 'flex');
    surnameInput.classList.add('form__input', 'form__surname');
    nameInput.classList.add('form__input', 'form__name');
    lastNameInput.classList.add('form__input', 'form__lastname');
    contactWrap.classList.add('form__contact-wrap', 'flex');
    contactList.classList.add('form__contact-list', 'list-reset');
    addContactBtn.classList.add('form__contact-btn', 'btn-reset');
    warningWrap.classList.add('form__warning-txt-wrap')
    saveBtn.classList.add('form__save-btn', 'btn-reset', 'btn-primary');

    surnameInput.setAttribute('pattern', '^[А-яЁё ]+-?[А-яЁё ]+$');
    nameInput.setAttribute('pattern', '^[А-яЁё ]+-?[А-яЁё ]+$');
    lastNameInput.setAttribute('pattern', '^[А-яЁё ]+-?[А-яЁё ]+$');

    surnameInput.placeholder = 'Фамилия*';
    nameInput.placeholder = 'Имя*';
    lastNameInput.placeholder = 'Отчество';

    surnameLabel.textContent = surnameInput.placeholder;
    nameLabel.textContent = nameInput.placeholder;
    lastNameLabel.textContent = lastNameInput.placeholder;

    const addContactSvg = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.99998 3.66683C6.63331 3.66683 6.33331 3.96683 6.33331 4.3335V6.3335H4.33331C3.96665 6.3335 3.66665 6.6335 3.66665 7.00016C3.66665 7.36683 3.96665 7.66683 4.33331 7.66683H6.33331V9.66683C6.33331 10.0335 6.63331 10.3335 6.99998 10.3335C7.36665 10.3335 7.66665 10.0335 7.66665 9.66683V7.66683H9.66665C10.0333 7.66683 10.3333 7.36683 10.3333 7.00016C10.3333 6.6335 10.0333 6.3335 9.66665 6.3335H7.66665V4.3335C7.66665 3.96683 7.36665 3.66683 6.99998 3.66683ZM6.99998 0.333496C3.31998 0.333496 0.333313 3.32016 0.333313 7.00016C0.333313 10.6802 3.31998 13.6668 6.99998 13.6668C10.68 13.6668 13.6666 10.6802 13.6666 7.00016C13.6666 3.32016 10.68 0.333496 6.99998 0.333496ZM6.99998 12.3335C4.05998 12.3335 1.66665 9.94016 1.66665 7.00016C1.66665 4.06016 4.05998 1.66683 6.99998 1.66683C9.93998 1.66683 12.3333 4.06016 12.3333 7.00016C12.3333 9.94016 9.93998 12.3335 6.99998 12.3335Z"/>
    </svg>`;
    addContactBtn.innerHTML = addContactSvg + ' Добавить контакт';
    saveBtn.textContent = 'Сохранить';

    contactWrap.append(contactList, addContactBtn);
    warningWrap.append(warningText);
    form.append(surnameLabel, surnameInput, nameLabel, nameInput, lastNameLabel, lastNameInput, contactWrap, warningWrap, saveBtn);

    // валидация инпутов ф.и.о.
    checkInputPatterns(surnameInput, 'Запишите фамилию буквами! Используйте кириллицу!');
    checkInputPatterns(nameInput, 'Запишите имя буквами! Используйте кириллицу!');
    checkInputPatterns(lastNameInput, 'Запишите отчество буквами! Используйте кириллицу!');

    // слушаем кнопку 'Добавить контакт' для добавления эл-та контакта
    addContactBtn.addEventListener('click', (e) => {
      e.preventDefault();

      contactList.append(createFormContactItem().contactItem);
      createContactInput();
      contactList.querySelectorAll('input')[contactList.querySelectorAll('input').length - 1].focus();

      if (contactList.childNodes.length >= 10) addContactBtn.classList.add('d-none');
    });

    // слушаем кнопку 'Сохранить' для сохранения добавленных (либо измененных) данных
    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      if (!surnameInput.value) {
        warningText.textContent = 'Поле ввода "Фамилия" не заполнено!';
        warningText.style.color = 'red';
        surnameInput.focus();
        return;
      }
      if (!nameInput.value) {
        warningText.textContent = 'Поле ввода "Имя" не заполнено!';
        warningText.style.color = 'red';
        nameInput.focus();
        return;
      }
      if (warningText.textContent !== '') return;

      mainLayout.mainTablePlug.classList.remove('hidden');
      mainLayout.mainTbody.classList.add('hidden');

      if (saveBtn.hasAttribute('data-id')) {
        createContactsArr();
        await updateServerObj(saveBtn)
        serverArr = await getServerData();
        renderTableData(serverArr);
      } else {
        createContactsArr();
        await postServerObj();
        serverArr = await getServerData();
        renderTableData(serverArr);
      }

      contactsArr = [];

      saveBtn.removeAttribute('data-id');
      const formInputs = form.getElementsByTagName('input');
      [...formInputs].forEach((input) => {
        input.value = '';
      });
      contactList.innerHTML = '';
      modalLayout.modalWrap.classList.add('hidden');
    });

    return {
      form,
      surnameInput,
      nameInput,
      lastNameInput,
      contactList,
      addContactBtn,
      warningText,
      saveBtn,
    };
  }

  // создаем элемент списка контактов
  function createFormContactItem() {
    const contactItem = document.createElement('li');
    const contactSelectWrap = document.createElement('div');
    const contactSelect = document.createElement('ul');
    const contactSelectPlaceholder = document.createElement('p');
    const contactSelectArrow = document.createElement('span');
    const contactInput = document.createElement('input');
    const contactCancelBtn = document.createElement('button');

    contactItem.classList.add('form__contact-item', 'contact', 'flex');
    contactSelect.classList.add('contact__select', 'select', 'list-reset', 'hidden');
    contactSelectPlaceholder.classList.add('select__placeholder');
    contactCancelBtn.classList.add('contact__cancel-btn', 'btn-reset');

    contactSelectWrap.style.cursor = 'pointer';
    contactSelect.style.cursor = 'pointer';

    contactInput.placeholder = 'Введите данные контакта';

    contactSelectArrow.innerHTML = `<svg width="12" height="12" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.495029 0.690033C0.250029 0.935033 0.250029 1.33003 0.495029 1.57503L4.65003 5.73003C4.84503 5.92503 5.16003 5.92503 5.35503 5.73003L9.51003 1.57503C9.75503 1.33003 9.75503 0.935032 9.51003 0.690033C9.26503 0.445032 8.87003 0.445032 8.62503 0.690033L5.00003 4.31003L1.37503 0.685034C1.13503 0.445034 0.735029 0.445033 0.495029 0.690033Z" fill="#9873FF"/>
    </svg>`;
    contactCancelBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z"/>
    </svg>`;

    // рендерим селекты в список контактов
    createSelect(optionsArr, contactItem, contactSelect, contactSelectArrow, contactSelectPlaceholder, contactInput);
    createContactInput();

    contactSelectWrap.append(contactSelect, contactSelectPlaceholder, contactSelectArrow);
    contactItem.append(contactSelectWrap, contactInput, contactCancelBtn);

    const options = contactSelect.getElementsByTagName('li');
    contactSelectPlaceholder.textContent = options[0].textContent;

    contactSelectWrap.setAttribute('tabindex', '0');
    contactSelect.setAttribute('data-type', contactSelectPlaceholder.textContent);
    contactInput.setAttribute('data-type', contactSelectPlaceholder.textContent);
    contactItem.setAttribute('data-type', contactSelectPlaceholder.textContent);

    // слушаем клики селекта, чтобы рендерить актуальный набор options
    contactSelectWrap.addEventListener('click', () => {
      contactSelect.innerHTML = '';
      createSelect(optionsArr, contactItem, contactSelect, contactSelectArrow, contactSelectPlaceholder, contactInput);
      (contactSelect.classList.contains('hidden')) ? contactSelect.classList.remove('hidden') : contactSelect.classList.add('hidden');
      (contactSelectArrow.classList.contains('rotated180')) ? contactSelectArrow.classList.remove('rotated180') : contactSelectArrow.classList.add('rotated180');
    });
    // триггер для клавиатуры
    createKeyupClickTrigger(contactSelectWrap, 'Enter');

    contactSelectWrap.addEventListener('mouseleave', () => {
      contactSelect.classList.add('hidden');
      contactSelectArrow.classList.remove('rotated180');
    });

    contactCancelBtn.addEventListener('click', () => {
      contactItem.remove();
      modalForm.addContactBtn.classList.remove('d-none');
    });

    return {
      contactItem,
      contactSelect,
      contactSelectArrow,
      contactSelectPlaceholder,
      contactInput,
    }
  }

  // фильтруем options, в зависимости от добавленных ранее, и добавляем новые options в селекты
  function createSelect(arr, item, select, arrow, plaseholder, input) {
    let contactItems = document.querySelectorAll('.contact');

    [...contactItems].forEach((contactItem) => {
      if (arr.includes(contactItem.dataset.type)) arr = arr.filter((option) => { return option != contactItem.dataset.type });
      if (!arr.length) arr.push('Другое');
    });

    arr.forEach((option) => {
      const newOption = document.createElement('li');
      newOption.textContent = option;
      newOption.setAttribute('tabindex', '0');
      select.append(newOption);
      // слушаем клики по списку и добавляем к эл-там контакта соответствующие атрибуты (потом понадобятся)
      newOption.addEventListener('click', () => {
        plaseholder.textContent = option;
        select.classList.add('hidden');
        arrow.classList.remove('rotated180');
        select.setAttribute('data-type', option);
        input.setAttribute('data-type', option);
        input.value = '';
        item.setAttribute('data-type', option);
        createContactInput();
      });
      createKeyupClickTrigger(newOption, 'Enter');
    });
  }

  // добавление и изменение атрибутов инпута контакта, в зависимости от выбранного типа + маски инпутов
  function createContactInput() {
    const contactInputs = modalForm.contactList.getElementsByTagName('input');

    [...contactInputs].forEach((input) => {
      if (input.dataset.type == 'Телефон' || input.dataset.type == 'Доп. телефон') {
        input.setAttribute('type', 'tel');
        Inputmask("+7(999)999-99-99").mask(input);
        input.addEventListener('focusout', () => {
          if (input.inputmask.unmaskedvalue().length > 0 && input.inputmask.unmaskedvalue().length < 10) {
            modalForm.warningText.textContent = 'Номер телефона слишком короткий!';
            input.focus();
          }
        });
      } else if (input.dataset.type == 'Email') {
        input.setAttribute('type', 'text');
        Inputmask("email").mask(input);
      } else if (input.dataset.type == 'Vk' || input.dataset.type == 'Facebook' || input.dataset.type == 'Другое') {
        input.setAttribute('type', 'text');
        Inputmask({ regex: "[A-z0-9-!$%^&*()_+|~=`'{}/;<>?,.@#]*" }).mask(input);
      }

      input.addEventListener('input', () => {
        modalForm.warningText.textContent = '';
      });
    });
  }

  // валидация полей ввода ф.и.о. и преобразование значений в инпутах в надлежащий вид
  function checkInputPatterns(input, warning) {
    input.addEventListener('input', () => {
      if (input.value.length > 1 && input.validity.patternMismatch) {
        modalForm.warningText.textContent = warning;
        modalForm.warningText.style.color = 'initial';
      } else {
        modalForm.warningText.textContent = '';
        input.style.borderColor = '#C8C5D1';
      }
      setTimeout(() => {
        if (input.value) input.value = input.value.trim().split().map(word => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(' ');
      }, TIMEOUT);
    });
    input.addEventListener('focusout', () => {
      if (input.validity.patternMismatch) {
        modalForm.warningText.textContent = warning;
        modalForm.warningText.style.color = 'red';
        input.style.borderColor = 'red';
        input.focus();
      } else {
        modalForm.warningText.textContent = '';
      }
    });
  }

  // создаем отдельный массив контактов для сервера
  function createContactsArr() {
    const contactInputs = modalForm.contactList.getElementsByTagName('input');

    [...contactInputs].forEach((input) => {
      if (input.value) {
        let contactObj = {};
        contactObj.type = input.dataset.type;
        contactObj.value = input.value;
        contactsArr.push(contactObj);
      }
    });
  }

  // форма подтверждения удаления эл-та
  function createConfirmDelete() {
    const confirmDelWrap = document.createElement('div');
    const confirmDelTxt = document.createElement('p');
    const confirmDelBtn = document.createElement('button');

    confirmDelWrap.classList.add('modal__confirm-wrap', 'flex', 'd-none');
    confirmDelBtn.classList.add('btn-reset', 'btn-primary');

    confirmDelTxt.textContent = 'Вы действительно хотите удалить данного клиента?';
    confirmDelBtn.textContent = 'Удалить';

    confirmDelWrap.append(confirmDelTxt, confirmDelBtn);

    confirmDelBtn.addEventListener('click', () => {

      deleteServerObj(confirmDelBtn);
      mainLayout.mainTbody.querySelector(`[data-id='${confirmDelBtn.dataset.id}']`).remove();
      modalLayout.modalWrap.classList.add('hidden');

      mainLayout.mainTablePlug.classList.remove('hidden');
      getServerData();
    });

    return {
      confirmDelWrap,
      confirmDelBtn,
    }
  }

  // триггер для клавиатуры (нужен для списков поиска и селектов)
  function createKeyupClickTrigger(elem, key) {
    elem.addEventListener('keyup', (e) => {
      e.preventDefault();
      if (e.key === key) {
        elem.click();
      }
    });
  }

  // пушим новый объект на сервер
  async function postServerObj() {
    try {
      await fetch(serverURL, {
        method: 'POST',
        body: JSON.stringify({
          surname: modalForm.surnameInput.value,
          name: modalForm.nameInput.value,
          lastName: modalForm.lastNameInput.value || '',
          contacts: contactsArr,
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (err) {
      modalLayout.modalWrap.classList.add('hidden');
      mainLayout.mainTablePlug.classList.remove('hidden');
      mainLayout.mainTablePlug.textContent = 'Что-то пошло не так...'
    }
  }

  // изменяем объект на сервере
  async function updateServerObj(btn) {
    try {
      await fetch(serverURL + '/' + btn.dataset.id, {
        method: 'PATCH',
        body: JSON.stringify({
          surname: modalForm.surnameInput.value,
          name: modalForm.nameInput.value,
          lastName: modalForm.lastNameInput.value || '',
          contacts: contactsArr,
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (err) {
      modalLayout.modalWrap.classList.add('hidden');
      mainLayout.mainTablePlug.classList.remove('hidden');
      mainLayout.mainTablePlug.textContent = 'Что-то пошло не так...'
    }
  }

  // забираем днные с сервера
  async function getServerData() {
    try {
      let response = await fetch(serverURL);
      let data = await response.json();
      setTimeout(() => {
        mainLayout.mainTbody.classList.remove('hidden');
        mainLayout.mainTablePlug.classList.add('hidden');
      }, MAX_TIMEOUT);
      return data;
    } catch (err) {
      mainLayout.mainTablePlug.classList.remove('hidden');
      mainLayout.mainTablePlug.textContent = 'Что-то пошло не так...'
    }
  }

  // удаляем днные с сервера
  async function deleteServerObj(btn) {
    try {
      await fetch(serverURL + '/' + btn.dataset.id, {
        method: 'DELETE',
      });
    } catch (err) {
      mainLayout.mainTablePlug.classList.remove('hidden');
      mainLayout.mainTablePlug.textContent = 'Что-то пошло не так...'
    }
  }

  // рендерим данные с сервера в таблицу
  function renderTableData(arr) {
    mainLayout.mainTbody.innerHTML = '';

    for (obj of arr) {
      const tableRowElem = createTbodyRow();
      const surname = `${obj.surname}`;
      const name = `${obj.name}`;
      const lastName = `${obj.lastName}`;
      const dateCreated = `${obj.createdAt.slice(0, 10).replace(/(\d*)-(\d*)-(\d*)/, '$3.$2.$1')}`;
      const timeCreated = `${obj.createdAt.slice(11, 16)}`;
      const dateUpdated = `${obj.createdAt.slice(0, 10).replace(/(\d*)-(\d*)-(\d*)/, '$3.$2.$1')}`;
      const timeUpdated = `${obj.createdAt.slice(11, 16)}`;


      tableRowElem.tbodyTr.setAttribute('data-id', obj.id);
      tableRowElem.trTdId.textContent = `${obj.id.substr(0, 6)}`;
      tableRowElem.trTdFullName.textContent = `${surname} ${name} ${lastName}`;
      tableRowElem.tdCreatedDateSpan.textContent = `${dateCreated + ' '}`;
      tableRowElem.tdCreatedTimeSpan.textContent = timeCreated;
      tableRowElem.tdUpdatedDateSpan.textContent = `${dateUpdated + ' '}`;
      tableRowElem.tdUpdatedTimeSpan.textContent = timeUpdated;

      // преобразуем контакты в логотипы контактов
      const serverContactsArr = Array.from(obj.contacts);
      serverContactsArr.forEach((contact) => {
        const contactLogo = document.createElement('a');

        if (contact.type == 'Телефон' || contact.type == 'Доп. телефон') {
          contactLogo.href = `tel:${contact.value.replace(/[\(\)\-\s]/g, '')}`;
          contactLogo.setAttribute("data-tooltip", `Телефон: ${contact.value}`);
          contactLogo.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.7">
          <circle cx="8" cy="8" r="8" fill="#9873FF"/>
          <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/>
          </g>
          </svg>`;
        } else if (contact.type == 'Email') {
          contactLogo.href = `mailto:${contact.value}`;
          contactLogo.setAttribute("data-tooltip", `Email: ${contact.value}`);
          contactLogo.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF"/>
          </svg>`;
        } else if (contact.type == 'Vk') {
          contactLogo.href = contact.value;
          contactLogo.setAttribute("data-tooltip", `Vk: ${contact.value}`);
          contactLogo.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.7">
          <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF"/>
          </g>
          </svg>`;
        } else if (contact.type == 'Facebook') {
          contactLogo.href = contact.value;
          contactLogo.setAttribute("data-tooltip", `Facebook: ${contact.value}`);
          contactLogo.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.7">
          <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF"/>
          </g>
          </svg>`;
        } else if (contact.type == 'Другое') {
          contactLogo.href = contact.value;
          contactLogo.setAttribute("data-tooltip", `${contact.value}`);
          contactLogo.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#9873FF"/>
          </svg>`;
        }
        tableRowElem.trTdContacts.appendChild(contactLogo);
        // прячем лишние лого контактов под кнопку
        if (tableRowElem.trTdContacts.childNodes.length >= 5) {
          const contactLogos = tableRowElem.trTdContacts.querySelectorAll('a');

          tableRowElem.contactMoreContactsBtn.addEventListener('click', () => {
            [...contactLogos].forEach((logo) => {
              tableRowElem.contactMoreContactsBtn.classList.add('d-none');
              logo.classList.remove('d-none');
            });
          });

          const unwantedLogos = [...contactLogos].slice(4);
          unwantedLogos.forEach((logo) => {
            logo.classList.add('d-none');
          });
          tableRowElem.contactMoreContactsBtn.classList.remove('d-none');
          tableRowElem.contactMoreContactsBtn.innerHTML = '+' + unwantedLogos.length;
        }
      });

      // изменяем объект
      tableRowElem.tdUpdBtn.setAttribute('data-id', obj.id);
      tableRowElem.tdUpdBtn.addEventListener('click', (e) => {
        e.preventDefault();

        modalForm.form.classList.remove('d-none');
        modalConfirmDel.confirmDelWrap.classList.add('d-none');
        modalLayout.modalWrap.classList.remove('hidden');

        modalLayout.modalTitle.textContent = 'Изменить данные';
        modalLayout.modalTitleId.textContent = 'ID:' + tableRowElem.trTdId.textContent;
        modalForm.saveBtn.setAttribute('data-id', tableRowElem.tdUpdBtn.dataset.id);
        modalForm.surnameInput.value = surname;
        modalForm.nameInput.value = name;
        modalForm.lastNameInput.value = lastName;
        document.querySelectorAll('label').forEach((label) => {
          label.classList.remove('hidden');
        });

        modalForm.contactList.innerHTML = '';
        serverContactsArr.forEach((contact) => {
          let contactElem = createFormContactItem();
          modalForm.contactList.append(contactElem.contactItem);

          contactElem.contactSelectPlaceholder.textContent = contact.type;
          contactElem.contactInput.value = contact.value;

          contactElem.contactSelect.setAttribute('data-type', contactElem.contactSelectPlaceholder.textContent);
          contactElem.contactInput.setAttribute('data-type', contactElem.contactSelectPlaceholder.textContent);
          contactElem.contactItem.setAttribute('data-type', contactElem.contactSelectPlaceholder.textContent);
        });

        modalLayout.modalTitle.style.alignSelf = 'flex-start';

        modalLayout.modalBottomBtn.setAttribute('data-id', tableRowElem.tdDelBtn.dataset.id);
        modalLayout.modalBottomBtn.textContent = 'Удалить клиента';
        // modalLayout.modalBottomBtn.style.borderBottom = '1px solid currentColor';

      });

      tableRowElem.tdDelBtn.setAttribute('data-id', obj.id);
      // удвляем объект с сервера и соответствующую строку из таблицы
      tableRowElem.tdDelBtn.addEventListener('click', () => {
        modalConfirmDel.confirmDelBtn.setAttribute('data-id', tableRowElem.tdDelBtn.dataset.id);

        modalForm.form.classList.add('d-none');
        modalConfirmDel.confirmDelWrap.classList.remove('d-none');
        modalLayout.modalWrap.classList.remove('hidden');
        modalLayout.modalTitle.style.alignSelf = 'center';
        modalLayout.modalTitleId.classList.add('d-none');

        modalLayout.modalTitle.textContent = 'Удалить клиента';
        modalLayout.modalBottomBtn.textContent = 'Отмена';
      });

      mainLayout.mainTbody.append(tableRowElem.tbodyTr);
    }
  }

  // создаем страницу
  async function createPage() {
    modalLayout.modalAppendWrap.append(modalForm.form, modalConfirmDel.confirmDelWrap);
    document.body.append(headerLayout.header, mainLayout.main, modalLayout.modalWrap);

    serverArr = await getServerData();
    renderTableData(serverArr);
    sortTableData(serverArr, mainLayout.mainThId, 'id');
  }
  createPage();
})();