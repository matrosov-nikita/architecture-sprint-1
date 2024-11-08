## Задание 1
### Уровень 1. Проектирование. Выбор фреймворка.
Для разбиения монолита на микрофронтенды выбрал Webpack Modules Federation, т.к:
* Все микрофронтенды используют один стек технологий. Webpack MF хорошо подходит, так как он позволяет создавать "сборку" модулей в единой экосистеме. Можно легко шарить код/стили между микрофронтедами.
* Был очень небольшой опыт работы с Webpack написания конфигураций.
* Хотел поэкспериментировать с такими фичами как:
  * shared_dependencies
  * lazy_loading
  * динамическая загрузка/обновление модулей без необходимости перезагружать приложение.
* Для данного проекта Single SPA не дает преимуществ по сравнению с MF.

### Уровень 2. Структура проекта.

1. **[auth-mf]** Микрофронтенд для авторизации и регистрации:
```plaintext
├── auth-mf
│   ├── compilation.config.js
│   ├── Dockerfile
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── src
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── InfoTooltip.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── images
│   │   ├── index.css
│   │   ├── index.html
│   │   ├── index.js
│   │   ├── styles
│   │   └── utils
│   │       └── auth.js
│   └── webpack.config.js
```
Этот микрофронтенд отвечает за управление пользовательской аутентификацией и регистрацией. 
Он содержит компоненты для форм авторизации и регистрации, а также компонент для отображения сообщений о статусе регистрации.
Микрофронтенд инкапсулирует логику работу с API авторизации.

Компонент `Login` публикует события `login-success` и `login-failed`, которые обрабатываются host-микрофронтедом для обновления его состояния.

Компонент `Register` публикует события `register-success` и `register-failed`, которые обрабатываются хост-микрофронтендом для обновления его состояния.

2. **[gallery-mf]** Микрофронтенд для галереи (карточек с картинками):
```plaintext
├── gallery-mf
│   ├── compilation.config.js
│   ├── Dockerfile
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── src
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── AddPlacePopup.js
│   │   │   ├── Card.js
│   │   │   ├── Gallery.js
│   │   │   └── ImagePopup.js
│   │   ├── images
│   │   ├── index.css
│   │   ├── index.html
│   │   ├── index.js
│   │   ├── styles
│   │   └── utils
│   │       └── api.js
│   └── webpack.config.js
```
Микрофронтенд отвечает за отображение карточек с картинками, добавление/удаление новых карточек, 
лайк карточек.

Микрофронтенд хранит в своем стейте массив карточек. Наружу экспортируется только компонент `Gallery`,
что позволяет скрыть внутреннюю логику работы с карточками.

Также микрофронтенд инкапсулирует логику работы с API карточек внутри сервиса.

3. **[profile-mf]** Микрофронтенд для управления профилем пользователя:
```plaintext
├── profile-mf
│   ├── compilation.config.js
│   ├── Dockerfile
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── src
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── EditAvatarPopup.js
│   │   │   └── EditProfilePopup.js
│   │   ├── images
│   │   ├── index.css
│   │   ├── index.html
│   │   ├── index.js
│   │   └── utils
│   │       └── api.js
│   └── webpack.config.js
```
Микрофронтенд отвечает за редактирование имени и занятия пользователя, а также за обновление аватара.
Микрофронтенд инкапсулирует логику работы с API профиля пользователя внутри сервиса.

Компонент `EditProfilePopup` публикует событие `profile-updated`, который обрабатываются host-микрофронтедом для обновления его состояния.

Компонент `EditAvatarPopup` публикует событие `avatar-updated`, который обрабатываются хост-микрофронтендом для обновления его состояния.

4. **[shared-mf]** Микрофронтенд, содержащий общие компоненты для других remote-микрофронтедов:
```plaintext
├── shared-mf
│   ├── compilation.config.js
│   ├── Dockerfile
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── src
│   │   ├── App.jsx
│   │   ├── components
│   │   │   └── PopupWithForm.js
│   │   ├── images
│   │   ├── index.css
│   │   ├── index.html
│   │   ├── index.js
│   │   └── styles
│   └── webpack.config.js
```
Микрофронтенд инкапсулирует общие компоненты (в том числе CSS стили) для других микрофронтендов.
В данном случае это компонент PopupWithForm, который представляет универсальную форму, в которую можно встроить кастомные компоненты.
Микрофронтенд подключается в gallery-mf и profile-mf.

В качестве альтернативы рассматривал отдельный NPM-пакет. Но учитывая, что работаем в монорепе, остановился на отдельном микрофронтенде.

5. **[host-mf]** Осноновной микрофронтенд, который "по требованию" в runtime загружает компоненты из других микрофронтендов:
```plaintext
host
├── compilation.config.js
├── Dockerfile
├── node_modules
├── package.json
├── package-lock.json
├── public
├── src
│   ├── App.jsx
│   ├── blocks
│   ├── components
│   │   ├── App.js
│   │   ├── Footer.js
│   │   ├── Header.js
│   │   ├── Main.js
│   │   └── ProtectedRoute.js
│   ├── contexts
│   │   └── CurrentUserContext.js
│   ├── images
│   ├── index.css
│   ├── index.html
│   ├── index.js
│   ├── utils
│   │   ├── api.js
│   │   └── auth.js
│   └── vendor
└── webpack.config.js
```
Хост-микрофронтенд динамически подключает модули из других микрофронтендов:

```
auth: 'auth_mf@http://localhost:8080/remoteEntry.js',
gallery: 'gallery_mf@http://localhost:8081/remoteEntry.js',
profile: 'profile_mf@http://localhost:8082/remoteEntry.js'
```
Часть компонентов осталоась здесь, так как они относятся к главной странице фронтенда.

Хост слушает события от remote-микрофронтедов и обновляет свой стейт:    
`login-success`,`login-failed`,`register-success`,`register-failed`,`profile-updated`,`avatar-updated`.

### Уровень 3. Запуск готового кода.
```bash
cd frontend/microfrontend/
docker-compose up --build
```
Открыть в браузере [http://localhost:8083](http://localhost:8083).

## Задание 2

https://drive.google.com/file/d/1k4Aoqaq_dQAm-qDAD46PM5P67VLZddTm/view?usp=sharing
(также файл есть в корне репозитория ветки sprint_1)