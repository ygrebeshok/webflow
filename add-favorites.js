
function toggleFavorite() {
  firebase.auth()
  event.preventDefault();
  const id = event.target.getAttribute('data-id');
  const product = document.querySelector(`.product[data-id="${id}"]`);
  const favoriteBtn = event.target;

  if (product.classList.contains('favorite')) {
    product.classList.remove('favorite');
    favoriteBtn.innerText = 'Add to Favorites';
  } else {
    product.classList.add('favorite');
    favoriteBtn.innerText = 'Remove from Favorites';
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    // Prompt user to log in or sign up
    window.location.replace('/sign-up');
    return;
  }

  const uid = user.uid;

  const card = this.closest('.card');
  const productId = card.dataset.productId;
  const favoritesRef = firebase.firestore().collection('favorites').doc(uid);
  favoritesRef.get().then(doc => {
    if (doc.exists && doc.data().products.includes(productId)) {
      // Product is already in favorites; remove it
      favoritesRef.update({
        products: firebase.firestore.FieldValue.arrayRemove(productId)
      }).then(() => {
        // Update button image
        this.textContent = "Add to Favorites";
      });
    } else {
      // Product is not in favorites; add it
      favoritesRef.set({
        products: firebase.firestore.FieldValue.arrayUnion(productId)
      }, { merge: true }).then(() => {
        // Update button
        this.textContent = "In Favorites";
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
