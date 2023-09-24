firebase.initializeApp(webflowAuth.firebaseConfig);

firebase.analytics && firebase.analytics();


{
  var user;
  var bodyAuth = document.body.getAttribute('data-user-auth');
  var bodyUnauth = document.body.getAttribute('data-user-unauth');
  var userAuth = document.querySelectorAll('[data-user-auth]');
  var userUnauth = document.querySelectorAll('[data-user-unauth]');
  var userEmail = document.querySelectorAll('[data-user-email]');
  var userContent = document.querySelectorAll('[data-user]');
  var userDisplayName = document.querySelectorAll('[data-user-displayName]');

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

  var signupForms = document.querySelectorAll('[data-signup-form]');
  var signupErrors = document.querySelectorAll('[data-signup-error]');
  var signupLoading = document.querySelectorAll('[data-signup-loading]');
  var signupIdle = document.querySelectorAll('[data-signup-idle]');

  signupForms.forEach(function(el) {
    var signupEmail = el.querySelector('[data-signup-email]');
    var signupPassword = el.querySelector('[data-signup-password]');

    el.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      signupErrors.forEach(function(el) { el.style.display = 'none'; });
      signupLoading.forEach(function(el) { el.style.display = 'block'; });
      signupIdle.forEach(function(el) { el.style.display = 'none'; });
      
      firebase.auth().createUserWithEmailAndPassword(signupEmail.value, signupPassword.value)
      .then(function(authUser) {
        firebase.auth().onAuthStateChanged(function(authUser) {
          user = authUser;
          firebase.firestore().collection("users").doc(user.uid).set({
            email: user.email,
            favorites: [],
            liked: [],
            disliked: [],
            profiles: [],
            shared_favorites: []
          })
          .then(function() {
            console.log("Document successfully written!");
            window.location.href = webflowAuth.signupRedirectPath;
          })
          .catch(function(error) {
            console.error("Error writing document: ", error);
          });
        })
        .catch(function(error) {
          signupErrors.forEach(function(el) {
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
        firebase.auth().onAuthStateChanged(function(authUser) {
    	    user = authUser;
    	    if (user) {
      	    const usersRef = firebase.firestore().collection('users');
      	    usersRef.doc(user.uid).get().then((doc) => {
              if (!doc.exists) {
                firebase.auth().signOut().then(function() {
                  user = null;
                  window.location.href = webflowAuth.signupPath;
                });
                console.log("No such user in users");
              } else if (doc.data().email !== loginEmail.value) {
                console.log("Email mismatch");
                firebase.auth().signOut().then(function() {
                  user = null;
                  window.location.href = webflowAuth.signupPath;
                });
              } else {
                window.location.href = webflowAuth.loginRedirectPath;
                console.log("User exists");
              }
            });
          }
        });
      })
      .catch(function(error) {
        loginErrors.forEach(function(el) {
          el.innerText = error.message;
          el.style.display = 'block';
        });
      });
    });
  });
}
