
firebase.initializeApp(webflowAuth.firebaseConfig);

firebase.analytics && firebase.analytics();

{
  // Sign up
  const userEmail = document.getElementById('user-email');
  const userPassword = document.getElementById('user-password');
  var userButton = document.getElementById('userButton');
  const storeEmail = document.getElementById('store-email');
  const storePassword = document.getElementById('store-password');
  var storeButton = document.getElementById('storeButton');

  const userRegistration = document.getElementById("user-registration");
  const storeRegistration = document.getElementById("store-registration");

  const userSignupButton = document.getElementById("user-signup-button");
  const storeSignupButton = document.getElementById("store-signup-button");

  // Login
  const userLoginEmail = document.getElementById("login-email");
  const userLoginPassword = document.getElementById("login-password");
  var userLoginToggleButton = document.getElementById("userLoginToggleButton");
  const storeLoginEmail = document.getElementById("store-login-email");
  const storeLoginPassword = document.getElementById("store-login-password");
  var storeLoginToggleButton = document.getElementById("storeLoginToggleButton");

  const userLogin = document.getElementById("user-login");
  const storeLogin = document.getElementById("store-login");

  const userLoginButton = document.getElementById("login-button");
  const storeLoginButton = document.getElementById("store-login-button");

  function showUserForm(userSignup, storeSignup, userBtn, storeBtn, email, password) {
    userSignup.style.display = 'flex';
    storeSignup.style.display = 'none';
    userBtn.classList.add('active');
    storeBtn.classList.remove('active');
    email.value = "";
    password.value = "";
  }

  function showStoreForm(storeSignup, userSignup, storeBtn, userBtn, email, password) {
    storeSignup.style.display = 'flex';
    userSignup.style.display = 'none';
    storeBtn.classList.add('active');
    userBtn.classList.remove('active');
    email.value = "";
    password.value = "";
  }

  userButton.addEventListener('click', showUserForm(userRegistration, storeRegistration, userButton, storeButton, storeEmail, storePassword));
  storeButton.addEventListener('click', showStoreForm(storeRegistration, userRegistration, storeButton, userButton, userEmail, userPassword));

  userLoginToggleButton.addEventListener('click', showUserForm(userLogin, storeLogin, userLoginToggleButton, storeLoginToggleButton, storeLoginEmail, storeLoginPassword));
  storeLoginToggleButton.addEventListener('click', showStoreForm(storeLogin, userLogin, storeLoginToggleButton, userLoginToggleButton, userLoginEmail, userLoginPassword));
  
  userSignupButton.addEventListener('click', function(e) {
  e.preventDefault();
  var email = userEmail.value; 
  var password = userPassword.value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(authUser) {
      firebase.firestore().collection("users").doc(authUser.user.uid).set({
        email: email,
        favorites: [],
        shared_favorites: [],
        liked: [],
        disliked: [],
        profiles: []
      });
      // Redirect or perform other actions after registration
      window.location.href = '/user';
    })
    .catch(function(error) {
      console.error("Error creating user:", error);
    });
});

storeSignupButton.addEventListener('click', function(e) {
  e.preventDefault();
  var email = storeEmail.value;
  var password = storePassword.value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(authUser) {
      firebase.firestore().collection("stores").doc(authUser.user.uid).set({
        email: email
        // Add any additional store-specific data here
      });
      // Redirect or perform other actions after registration
      window.location.href = '/store-profile';
    })
    .catch(function(error) {
      console.error("Error creating store:", error);
    });
});

// Login Logic
userLoginButton.addEventListener('click', function(e) {
  e.preventDefault();
  var email = userLoginEmail.value; 
  var password = userLoginPassword.value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(authUser) {
      window.location.href = '/user';
    })
    .catch(function(error) {
      console.error("Error logging in user:", error);
    });
});

storeLoginButton.addEventListener('click', function(e) {
  e.preventDefault();
  var email = storeLoginEmail.value;
  var password = storeLoginPassword.value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(authUser) {
      window.location.href = '/store-profile';
    })
    .catch(function(error) {
      console.error("Error logging in store:", error);
    });
});

const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', function() {
  firebase.auth().signOut()
    .then(function() {
      window.location.href = '/login';
    })
    .catch(function(error) {
      console.error("Error logging out:", error);
    });
});

}
