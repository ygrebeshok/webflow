
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
  
  function userSignup(e) {
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
      errorSignUser.textContent = "Error occured when creating user";
    });
}

function storeSignup(e) {
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
      errorSignStore.textContent = "Error occured when creating store";
    });
}

// Login Logic
function userLoginProcess(e) {
  e.preventDefault();
  var email = userLoginEmail.value; 
  var password = userLoginPassword.value;

  // Check if the email exists in the 'users' collection
  firebase.firestore().collection('users').where('email', '==', email).get()
    .then(function(querySnapshot) {
      if (!querySnapshot.empty) {
        // If email exists in 'users' collection, attempt login
        firebase.auth().signInWithEmailAndPassword(email, password)
          .then(function(authUser) {
            window.location.href = '/user';
          })
          .catch(function(error) {
            console.error("Error logging in user:", error);
          });
      } else {
        errorUser.textContent = "User with this email does not exist.";
      }
    })
    .catch(function(error) {
      errorUser.textContent = "Error checking email: " + error.message;
    });
}

function storeLoginProcess(e) {
  e.preventDefault();
  var email = storeLoginEmail.value;
  var password = storeLoginPassword.value;

  // Check if the email exists in the 'stores' collection
  firebase.firestore().collection('stores').where('email', '==', email).get()
    .then(function(querySnapshot) {
      if (!querySnapshot.empty) {
        // If email exists in 'stores' collection, attempt login
        firebase.auth().signInWithEmailAndPassword(email, password)
          .then(function(authUser) {
            window.location.href = '/store-profile';
          })
          .catch(function(error) {
            console.error("Error logging in store:", error);
          });
      } else {
        errorStore.textContent = "Store with this email does not exist.";
      }
    })
    .catch(function(error) {
      errorStore.textContent = "Error checking email: " + error.message;
    });
}


function logout() {
  firebase.auth().signOut()
    .then(function() {
      window.location.href = '/login';
    })
    .catch(function(error) {
       console.log(error);
    });
}
