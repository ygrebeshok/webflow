firebase.initializeApp(webflowAuth.firebaseConfig);

firebase.analytics && firebase.analytics();

{
  const userEmail = document.getElementById('user-email');
  const userPassword = document.getElementById('user-password');
  var userButton = document.getElementById('userButton');
  const storeEmail = document.getElementById('store-email');
  const storePassword = document.getElementById('store-password');
  var storeButton = document.getElementById('storeButton');
  var registrationForms = document.querySelectorAll('[data-registration-form]');

  const userFormButton = document.getElementById("user-form-button");
  const storeFormButton = document.getElementById("store-form-button");
  const userRegistration = document.getElementById("user-registration");
  const storeRegistration = document.getElementById("store-registration");

  const userSignupButton = document.getElementById("user-signup-button");
  const storeSignupButton = document.getElementById("store-signup-button");

  function showUserForm() {
    userRegistration.style.display = 'flex';
    storeRegistration.style.display = 'none';
    userButton.classList.add('active');
    storeButton.classList.remove('active');
  }

  function showStoreForm() {
    storeRegistration.style.display = 'flex';
    userRegistration.style.display = 'none';
    storeButton.classList.add('active');
    userButton.classList.remove('active');
  }

  userButton.addEventListener('click', showUserForm);
  storeButton.addEventListener('click', showStoreForm);

  // Show User form by default
  showUserForm();

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
    })
    .catch(function(error) {
      console.error("Error creating store:", error);
    });
});
