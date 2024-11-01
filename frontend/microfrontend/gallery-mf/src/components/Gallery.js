import React from "react";
import ImagePopup from "./ImagePopup";
import AddPlacePopup from "./AddPlacePopup";
import api from "../utils/api";
import Card from "./Card";
import '../styles/card/card.css';
import '../styles/places/places.css';
import '../styles/popup/popup.css';
import '../styles/popup/_is-opened/popup_is-opened.css';

function Gallery({currentUserId, isOpenAddPlace, onCloseAddPlace, className}) {
    const [selectedCard, setSelectedCard] = React.useState(null);
    const [cards, setCards] = React.useState([]);
    function closeAllPopups() {
        setSelectedCard(null);
        onCloseAddPlace()
    }

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function handleAddPlaceSubmit(newCard) {
        api
            .addCard(newCard)
            .then((newCardFull) => {
                setCards([newCardFull, ...cards]);
                closeAllPopups();
            })
            .catch((err) => console.log(err));
    }

    function handleCardDelete(card) {
        api
            .removeCard(card._id)
            .then(() => {
                setCards((cards) => cards.filter((c) => c._id !== card._id));
            })
            .catch((err) => console.log(err));
    }

    function handleCardLike(card) {
        const isLiked = card.likes.some((i) => i._id === currentUserId);
        api
            .changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => {
                setCards((cards) =>
                    cards.map((c) => (c._id === card._id ? newCard : c))
                );
            })
            .catch((err) => console.log(err));
    }

    // Запрос к API за информацией о массиве карточек выполняется единожды, при монтировании.
    React.useEffect(() => {
        api
            .getCardList()
            .then((cardData) => {
                setCards(cardData);
            })
            .catch((err) => console.log(err));
    }, []);

    return (
            <div>
            <section className={`places ${className || ""}`}>
                <ul className="places__list">
                    {cards.map((card) => (
                        <Card
                            currentUserId={currentUserId}
                            key={card._id}
                            card={card}
                            onCardClick={handleCardClick}
                            onCardLike={handleCardLike}
                            onCardDelete={handleCardDelete}
                        />
                    ))}
                </ul>
            </section>
            <ImagePopup card={selectedCard} onClose={closeAllPopups}/>
            <AddPlacePopup
                isOpen={isOpenAddPlace}
                onAddPlaceSubmit={handleAddPlaceSubmit}
                onClose={closeAllPopups}
            />
        </div>

    );
}

export default Gallery;