firebase.initializeApp(webflowAuth.firebaseConfig);

firebase.analytics && firebase.analytics();

{
  var user;
  var bodyAuth = document.body.getAttribute('store-user-auth');
  var bodyUnauth = document.body.getAttribute('store-user-unauth');
  var userAuth = document.querySelectorAll('[store-user-auth]');
  var userUnauth = document.querySelectorAll('[store-user-unauth]');
  var userEmail = document.querySelectorAll('[store-user-email]');
  var userContent = document.querySelectorAll('[store-user]');
  var userDisplayName = document.querySelectorAll('[store-user-displayName]');

  userAuth.forEach(function(el) { el.style.display = 'none'; });
  userUnauth.forEach(function(el) { el.style.display = 'none'; });

  function updateContent() {
    if (!user) {
      return;
    }
    userContent.forEach(function(el) { 
      el.innerText = el.innerText.replace(/\{\{([^\}]+)\}\}/g, function(match, variable) {
        return typeof user[variable] === 'undefined' ? '' : user[variable];
      });
    });
  }

  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    updateContent();
    
    if (user && bodyUnauth) {
      window.location.href = webflowAuth.loginRedirectPath;
    } else if (!user && bodyAuth) {
      window.location.href = webflowAuth.loginPath;
    }

    if (!user) {
      userAuth.forEach(function(el) { el.style.display = 'none'; });
      userUnauth.forEach(function(el) { el.style.display = null; });

      userEmail.forEach(function(el) { el.innerText = ''; });
      userDisplayName.forEach(function(el) { el.innerText = ''; });
    }
  });

  var signupForms = document.querySelectorAll('[store-signup-form]');
  var signupErrors = document.querySelectorAll('[store-signup-error]');
  var signupLoading = document.querySelectorAll('[store-signup-loading]');
  var signupIdle = document.querySelectorAll('[store-signup-idle]');

  signupForms.forEach(function(el) {
    var signupEmail = el.querySelector('[store-signup-email]');
    var signupPassword = el.querySelector('[store-signup-password]');

    el.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      signupErrors.forEach(function(el) { el.style.display = 'none'; });
      signupLoading.forEach(function(el) { el.style.display = 'block'; });
      signupIdle.forEach(function(el) { el.style.display = 'none'; });
      
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
    
  var loginForms = document.querySelectorAll('[store-login-form]');
  var loginErrors = document.querySelectorAll('[store-login-error]');
  var loginLoading = document.querySelectorAll('[store-login-loading]');
  var loginIdle = document.querySelectorAll('[store-login-idle]');

  loginForms.forEach(function(el) {
  var loginEmail = el.querySelector('[store-login-email]');
  var loginPassword = el.querySelector('[store-login-password]');

  el.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    loginErrors.forEach(function(el) { el.style.display = 'none'; });
    loginIdle.forEach(function(el) { el.style.display = 'none'; });
    loginLoading.forEach(function(el) { el.style.display = 'block'; });

    const email = loginEmail.value;

    // Check if email exists in 'users' collection
    firebase.firestore().collection('stores').where('email', '==', email).get()
      .then(function(querySnapshot) {
        if (querySnapshot.docs.length > 0) {
          // Email exists, proceed with sign in
          firebase.auth().signInWithEmailAndPassword(email, loginPassword.value)
            .then(function(authUser) {
              user = authUser;
              window.location.href = webflowAuth.loginRedirectPath;
            })
            .catch(function(error) {
              loginErrors.forEach(function(el) {
                el.innerText = error.message;
                el.style.display = 'block';
              });
            });
        } else {
          // Email not found in 'stores' collection
          loginErrors.forEach(function(el) {
            el.innerText = "This store doesn't exist. Check if you chose the right user type";
            el.style.display = 'block';
          });
        }
      })
      .catch(function(error) {
        console.error('Error checking credentials:', error);
      });
    });
  });
}
