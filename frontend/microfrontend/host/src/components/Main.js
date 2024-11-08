import React from 'react';
import { CurrentUserContext } from '../contexts/CurrentUserContext';

import Gallery from 'gallery/Gallery';

function Main({ isOpenAddPlace, onEditProfile, onAddPlace, onCloseAddPlace, onEditAvatar}) {
  const currentUser = React.useContext(CurrentUserContext);

  const imageStyle = { backgroundImage: `url(${currentUser.avatar})` };
  return (
    <main className="content">
      <section className="profile page__section">
        <div className="profile__image" onClick={onEditAvatar} style={imageStyle}></div>
        <div className="profile__info">
          <h1 className="profile__title">{currentUser.name}</h1>
          <button className="profile__edit-button" type="button" onClick={onEditProfile}></button>
          <p className="profile__description">{currentUser.about}</p>
        </div>
        <button className="profile__add-button" type="button" onClick={onAddPlace}></button>
      </section>
     <Gallery
        currentUserId={currentUser._id}
        onCloseAddPlace={onCloseAddPlace}
        isOpenAddPlace={isOpenAddPlace}
        className={"page__section"}
     />
    </main>
  );
}

export default Main;
