firebase.initializeApp(webflowAuth.firebaseConfig);

firebase.analytics && firebase.analytics();

{
  var userEmail = document.querySelectorAll('[data-user-email]');
  var userButton = document.getElementById('userButton');
  var storeEmail = document.querySelectorAll('[data-store-email]');
  var storeButton = document.getElementById('storeButton');
  var registrationForms = document.querySelectorAll('[data-registration-form]');

  const userFormButton = document.getElementById("user-form-button");
  const storeFormButton = document.getElementById("store-form-button");
  const userRegistration = document.getElementById("user-registration");
  const storeRegistration = document.getElementById("store-registration");

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

  userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Handle user registration here
    // Access the user's email using userEmail and use it for registration
    var email = userEmail[0].value; // Assuming there's only one email input
    firebase.firestore().collection("users").doc(user.uid).set({
      email: email,
      favorites: [],
      shared_favorites: [],
      liked: [],
      disliked: [],
      profiles: []
    });
    // Redirect or perform other actions after registration
  });

  storeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Handle store registration here
    // Access the store's email using storeEmail and use it for registration
    var email = storeEmail[0].value; // Assuming there's only one email input
    firebase.firestore().collection("stores").doc(user.uid).set({
      email: email
      // Add any additional store-specific data here
    });
    // Redirect or perform other actions after registration
  });
}
