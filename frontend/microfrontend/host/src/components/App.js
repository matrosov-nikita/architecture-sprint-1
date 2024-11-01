import React, { lazy, Suspense }  from "react";
import {Route, useHistory, Switch} from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import api from "../utils/api";
import * as auth from "../utils/auth.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import ProtectedRoute from "./ProtectedRoute";

const Register = lazy(() => import('auth/Register').catch(() => {
      return { default: () => <div className='error'>Register component is not available!</div> };
    })
);

const Login = lazy(() => import('auth/Login').catch(() => {
      return { default: () => <div className='error'>Login component is not available!</div> };
    })
);

const InfoTooltip = lazy(() => import('auth/InfoTooltip').catch(() => {
      return { default: () => <div className='error'>InfoTooltip component is not available!</div> };
    })
);

const EditProfilePopup = lazy(() => import('profile/EditProfilePopup').catch(() => {
      return { default: () => <div className='error'>EditProfilePopup component is not available!</div> };
    })
);

const EditAvatarPopup = lazy(() => import('profile/EditAvatarPopup').catch(() => {
      return { default: () => <div className='error'>EditAvatarPopup component is not available!</div> };
    })
);

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);

  // В корневом компоненте App создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
  const [currentUser, setCurrentUser] = React.useState({});

  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
  const [tooltipStatus, setTooltipStatus] = React.useState("");

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  //В компоненты добавлены новые стейт-переменные: email — в компонент App
  const [email, setEmail] = React.useState("");

  const history = useHistory();

  React.useEffect(() => {
    api
      .getUserInfo()
      .then(( userData) => {
        setCurrentUser(userData);
      })
      .catch((err) => console.log(err));
  }, []);

  // при монтировании App описан эффект, проверяющий наличие токена и его валидности
  React.useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      auth
          .checkToken(token)
          .then((res) => {
            setEmail(res.data.email);
            setIsLoggedIn(true);
            history.push("/");
          })
          .catch((err) => {
            localStorage.removeItem("jwt");
            console.log(err);
          });
    }
  }, [history]);

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsInfoToolTipOpen(false);
  }

  React.useEffect(() => {
    addEventListener("login-success", onLoginSuccess);

    addEventListener("login-failed", onLoginFailed);
    addEventListener("register-success", onRegisterSuccess);
    addEventListener("register-failed", onRegisterFailed);
    addEventListener("profile-updated", onProfileUpdated);
    addEventListener("avatar-updated", onAvatarUpdated);
    return () => {
      removeEventListener("login-success", onLoginSuccess)
      removeEventListener("login-failed", onLoginFailed);
      removeEventListener("register-success", onRegisterSuccess);
      removeEventListener("register-failed", onRegisterFailed);
      removeEventListener("profile-updated", onProfileUpdated);
      removeEventListener("avatar-updated", onAvatarUpdated);
    }
  }, []);


  function onLoginSuccess({email}) {
    setIsLoggedIn(true);
    setEmail(email);
    history.push("/");
  }

  function onLoginFailed() {
    setTooltipStatus("fail");
    setIsInfoToolTipOpen(true);
  }

  function onRegisterSuccess() {
    setTooltipStatus("success");
    setIsInfoToolTipOpen(true);
    history.push("/signin");
  }

  function onRegisterFailed() {
    setTooltipStatus("failed");
    setIsInfoToolTipOpen(true);
  }

  function onProfileUpdated(newData) {
    setCurrentUser(newData.detail);
  }

  function onAvatarUpdated(newData) {
    setCurrentUser(newData.detail);
  }

  function onSignOut() {
    // при вызове обработчика onSignOut происходит удаление jwt
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
    // После успешного вызова обработчика onSignOut происходит редирект на /signin
    history.push("/signin");
  }

  return (
    // В компонент App внедрён контекст через CurrentUserContext.Provider
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__content">
        <Header email={email} onSignOut={onSignOut} />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            component={Main}
            onEditProfile={handleEditProfileClick}
            onEditAvatar={handleEditAvatarClick}
            onAddPlace={handleAddPlaceClick}
            onCloseAddPlace={closeAllPopups}
            isOpenAddPlace={isAddPlacePopupOpen}
            loggedIn={isLoggedIn}
          />
        <Route path="/signin">
          <Suspense>
            <Login />
          </Suspense>
        </Route>
        <Route path="/signup">
          <Suspense>
            <Register />
          </Suspense>
        </Route>
        </Switch>
        <Footer />
        <Suspense>
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            currentUser={currentUser}
          />
        </Suspense>
        <Suspense>
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
        />
        </Suspense>
        <Suspense>
          <InfoTooltip
            isOpen={isInfoToolTipOpen}
            onClose={closeAllPopups}
            status={tooltipStatus}/>
        </Suspense>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
