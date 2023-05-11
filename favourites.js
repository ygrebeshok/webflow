const favoriteBtns = document.querySelectorAll('.favorite-btn');
favoriteBtns.forEach(favoriteBtn => {
  favoriteBtn.addEventListener('click', toggleFavorite);
});

function toggleFavorite() {
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
        this.classList.remove('favorited');
      });
    } else {
      // Product is not in favorites; add it
      favoritesRef.set({
        products: firebase.firestore.FieldValue.arrayUnion(productId)
      }, { merge: true }).then(() => {
        // Update button image
        this.classList.add('favorited');
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
