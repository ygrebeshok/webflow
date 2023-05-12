function toggleFavorite() {
  firebase.auth()
  event.preventDefault();
  const id = event.target.getAttribute('data-id');
  const product = document.querySelector(`.product[data-id="${id}"]`);
  const favoriteBtn = event.target;

  let isFavorite = false; // add a flag variable to keep track of the favorite state
  if (favoriteBtn.innerText === 'Remove from Favorites') {
    isFavorite = true;
    favoriteBtn.innerText = 'Add to Favorites';
  } else {
    isFavorite = false;
    favoriteBtn.innerText = 'Remove from Favorites';
  }

  // Update the product class based on the flag variable
  if (isFavorite) {
    product.setAttribute('class', 'product');
  } else {
    product.setAttribute('class', 'product favorite');
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    // Prompt user to log in or sign up
    window.location.replace('/sign-up');
    return;
  }

  const uid = user.uid;

  const card = event.target.closest('.card');
  if (!card) {
    console.error("Could not find card element");
    return;
  }

  const productId = card.dataset.productId;
  const favoritesRef = firebase.firestore().collection('favorites').doc(uid);
  favoritesRef.get().then(doc => {
    if (doc.exists && doc.data().products.includes(productId)) {
      // Product is already in favorites; remove it
      favoritesRef.update({
        products: firebase.firestore.FieldValue.arrayRemove(productId)
      }).then(() => {
        // Update button image
        favoriteBtn.textContent = "Add to Favorites";
      });
    } else {
      // Product is not in favorites; add it
      favoritesRef.set({
        products: firebase.firestore.FieldValue.arrayUnion(productId)
      }, { merge: true }).then(() => {
        // Update button
        favoriteBtn.textContent = "In Favorites";
      });
    }
  });

  const giftId = card.dataset.giftId;
  const giftsRef = firebase.firestore().collection('gifts');
  const giftRef = giftsRef.doc(giftId);

  giftRef.update({
    favorite: true,
  }).then(() => {
    console.log("Gift marked as favorite");
  }).catch((error) => {
    console.error("Error marking gift as favorite: ", error);
  });
}
