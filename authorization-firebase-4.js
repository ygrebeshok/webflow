firebase.initializeApp(webflowAuth.firebaseConfig);

firebase.analytics && firebase.analytics();

{
  var user;
  var bodyAuth = document.body.getAttribute('data-user-auth');
  var bodyUnauth = document.body.getAttribute('data-user-unauth');
  var userAuth = document.querySelectorAll('[data-user-auth]');
  var userUnauth = document.querySelectorAll('[data-user-unauth]');
  var userEmail = document.querySelectorAll('[data-user-email]');
  var userDisplayName = document.querySelectorAll('[data-user-displayName]');
  var userButton = document.getElementById('userButton');
  var storeAuth = document.querySelectorAll('[data-store-auth]');
  var storeEmail = document.querySelectorAll('[data-store-email]');
  var storeDisplayName = document.querySelectorAll('[data-user-displayName]');
  var storeButton = document.getElementById('storeButton');
  var registrationForms = document.querySelectorAll('[data-registration-form]');

  const userForm = document.getElementById("user-form");
  const storeForm = document.getElementById("store-form");

  function showUserForm() {
    registrationForms.forEach(function(form) {
      if (form.getAttribute('data-registration-type') === 'user') {
        userForm.style.display = 'flex';
      } else {
        storeForm.style.display = 'none';
      }
    });
    userButton.classList.add('active');
    storeButton.classList.remove('active');
  }

  function showStoreForm() {
    registrationForms.forEach(function(form) {
      if (form.getAttribute('data-registration-type') === 'store') {
        storeForm.style.display = 'flex';
      } else {
        userForm.style.display = 'none';
      }
    });
    storeButton.classList.add('active');
    userButton.classList.remove('active');
  }

  userButton.addEventListener('click', showUserForm);
  storeButton.addEventListener('click', showStoreForm);

  // Show User form by default
  showUserForm();

  userAuth.forEach(function(el) { el.style.display = 'none'; });
  storeAuth.forEach(function(el) { el.style.display = 'none'; });
  userUnauth.forEach(function(el) { el.style.display = 'none'; });

  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;

    if (user && bodyUnauth) {
      window.location.href = webflowAuth.loginRedirectPath;
    } else if (!user && bodyAuth) {
      window.location.href = webflowAuth.loginPath;
    }
    
    if (user) {

      if (selectedRegistrationType === 'userButton') {
        userAuth.forEach(function(el) { el.style.display = null; });
        userUnauth.forEach(function(el) { el.style.display = 'none'; });
      
        userEmail.forEach(function(el) { el.innerText = user.email; });
        userDisplayName.forEach(function(el) { el.innerText = user.displayName; });
      
        firebase.firestore().collection("users").doc(user.uid).get()
        .then(function(doc) {
          if (doc.exists) {
            // Update the user object with the favorites array
            user.favorites = doc.data().favorites;
          } else {
            // If the user document doesn't exist, create it with an empty favorites array
            firebase.firestore().collection("users").doc(user.uid).set({
              email: user.email,
              favorites: [],
              shared_favorites: [],
              liked: [],
              disliked: [],
              profiles: []
            });
          }
        })
        .catch(function(error) {
          console.error("Error retrieving user's favorites:", error);
        });
      } else if (selectedRegistrationType === 'storeButton') {
        storeAuth.forEach(function(el) { el.style.display = null; });
        userUnauth.forEach(function(el) { el.style.display = 'none'; });

        storeEmail.forEach(function(el) { el.innerText = user.email; });
        storeDisplayName.forEach(function(el) { el.innerText = user.displayName; });

        firebase.firestore().collection("stores").doc(user.uid).get()
        .then(function(doc) {
          if (doc.exists) {
            // Update the user object
            
          } else {
            // If the user document doesn't exist, create it with an empty favorites array
            firebase.firestore().collection("stores").doc(user.uid).set({
              email: user.email
            });
          }
        })
        .catch(function(error) {
          console.error("Error retrieving store's infor:", error);
        });
      }
    } else {
      userAuth.forEach(function(el) { el.style.display = 'none'; });
      storeAuth.forEach(function(el) { el.style.display = 'none'; });
      userUnauth.forEach(function(el) { el.style.display = null; });

      userEmail.forEach(function(el) { el.innerText = ''; });
      storeEmail.forEach(function(el) { el.innerText = ''; });
      userDisplayName.forEach(function(el) { el.innerText = ''; });
      storeDisplayName.forEach(function(el) { el.innerText = ''; });
    }
  });

  var signupForms = document.querySelectorAll('[data-signup-form]');
  var signupErrors = document.querySelectorAll('[data-signup-error]');

  var signupStore = document.querySelectorAll('[data-store-form]');
  var signupErrorStore = document.querySelectorAll('[data-store-error]');

  signupForms.forEach(function(el) {
    var signupEmail = el.querySelector('[data-signup-email]');
    var signupPassword = el.querySelector('[data-signup-password]');

    el.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      signupErrors.forEach(function(el) { el.style.display = 'none'; });
      
      firebase.auth().createUserWithEmailAndPassword(signupEmail.value, signupPassword.value)
      .then(function(authUser) {
        user = authUser;
        window.location.href = webflowAuth.signupRedirectPath;
      })
      .catch(function(error) {
        signupErrors.forEach(function(el) {
          el.innerText = error.message;
          el.style.display = 'block';
        });
      });
    });
  });

  signupStore.forEach(function(el) {
    var signupStoreEmail = el.querySelector('[data-store-email]');
    var signupStorePassword = el.querySelector('[data-store-password]');

    el.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      signupErrorStore.forEach(function(el) { el.style.display = 'none'; });
      
      firebase.auth().createUserWithEmailAndPassword(signupStoreEmail.value, signupStorePassword.value)
      .then(function(authUser) {
        user = authUser;
        window.location.href = webflowAuth.signupStoreRedirectPath;
      })
      .catch(function(error) {
        signupErrorStore.forEach(function(el) {
          el.innerText = error.message;
          el.style.display = 'block';
        });
      });
    });
  });
    
  var loginForms = document.querySelectorAll('[data-login-form]');
  var loginErrors = document.querySelectorAll('[data-login-error]');
  var loginLoading = document.querySelectorAll('[data-login-loading]');
  var loginIdle = document.querySelectorAll('[data-login-idle]');

  loginForms.forEach(function(el) {
    var loginEmail = el.querySelector('[data-login-email]');
    var loginPassword = el.querySelector('[data-login-password]');

    el.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      loginErrors.forEach(function(el) { el.style.display = 'none'; });
      loginIdle.forEach(function(el) { el.style.display = 'none'; });
      loginLoading.forEach(function(el) { el.style.display = 'block'; });

      firebase.auth().signInWithEmailAndPassword(loginEmail.value, loginPassword.value)
      .then(function(authUser) {
        user = authUser;
        window.location.href = webflowAuth.loginRedirectPath;
      })
      .catch(function(error) {
        loginErrors.forEach(function(el) {
          el.innerText = error.message;
          el.style.display = 'block';
        });

        setTimeout(function() {
          loginIdle.forEach(function(el) { el.style.display = null; });
          loginLoading.forEach(function(el) { el.style.display = 'none'; });
        }, 1000);
      });
    });
  });

  var authLogout = document.querySelectorAll('[data-logout]');

  authLogout.forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      firebase.auth().signOut().then(function() {
        user = null;
        window.location.href = webflowAuth.logoutRedirectPath;
      })
      .catch(function() {});
    });
  })
}
