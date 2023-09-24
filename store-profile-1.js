firebase.auth().onAuthStateChanged(function(authUser) {
  user = authUser;
	
  if (user && bodyUnauth) {
    window.location.href = webflowAuth.loginRedirectPath;
  } else if (!user && bodyAuth) {
    window.location.href = webflowAuth.loginPath;
  }

  if (user) {
    const userId = user.uid;
    
    firebase.firestore().collection("stores").doc(userId).get()
      .then(function(doc) {
	      if (doc.exists) {
	        // Update the store doc
          user.email = doc.data().email;
          user.store_name = doc.data().store_name;
          user.store_bio = doc.data().store_bio;
          user.store_address = doc.data().store_address;
          user.store_phone = doc.data().store_phone;
          user.products = doc.data().products;
        } else {
	        // If the user document doesn't exist, create it
          firebase.firestore().collection("users").doc(user.uid).set({
            email: user.email,
            store_name: "",
            store_bio: "",
            store_address: "",
            store_phone: "",
            products: []
          });
	      }
     });
   }
});


var authLogout = document.querySelectorAll('[store-logout]');

authLogout.forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    firebase.auth().signOut().then(function() {
      user = null;
      window.location.href = webflowAuth.logoutRedirectPath;
    });
  });
});
