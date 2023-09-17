
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

   function showUserForm() {
     userRegistration.style.display = 'flex';
     storeRegistration.style.display = 'none';
     userButton.classList.add('active');
     storeButton.classList.remove('active');
     storeEmail.value = "";
     storePassword.value = "";
   }

   function showStoreForm() {
     storeRegistration.style.display = 'flex';
     userRegistration.style.display = 'none';
     storeButton.classList.add('active');
     userButton.classList.remove('active');
     userEmail.value = "";
     userPassword.value = "";
   }

  function showUserLogin() {
     userLogin.style.display = 'flex';
     storeLogin.style.display = 'none';
     userLoginToggleButton.classList.add('active');
     storeLoginToggleButton.classList.remove('active');
     storeLoginEmail.value = "";
     storeLoginPassword.value = "";
   }

   function showStoreLogin() {
     storeLogin.style.display = 'flex';
     userLogin.style.display = 'none';
     storeLoginToggleButton.classList.add('active');
     userLoginToggleButton.classList.remove('active');
     userLoginEmail.value = "";
     userLoginPassword.value = "";
   }
  
  function userSignup() {
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
}

function storeSignup() {
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
}

// Login Logic
function userLoginProcess() {
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
}

function storeLoginProcess() {
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
}

const logoutButton = document.getElementById('logout-button');

function logout() {
  firebase.auth().signOut()
    .then(function() {
      window.location.href = '/login';
    })
    .catch(function(error) {
      console.error("Error logging out:", error);
    });
}

}
