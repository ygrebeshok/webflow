
const favoriteBtn = document.getElementById('favorite-btn');
favoriteBtn.addEventListener('click', toggleFavorite);


function toggleFavorite() {
  const user = firebase.auth().currentUser;
  if (!user) {
    // Prompt user to log in or sign up
    window.location.replace('/sign-up');
    return;
  }

  const uid = user.uid;

  const productId = favoriteBtn.dataset.productId;
  const favoritesRef = firebase.firestore().collection('favorites').doc(uid);
  favoritesRef.get().then(doc => {
    if (doc.exists && doc.data().products.includes(productId)) {
      // Product is already in favorites; remove it
      favoritesRef.update({
        products: firebase.firestore.FieldValue.arrayRemove(productId)
      }).then(() => {
        // Update button image
        favoriteBtn.classList.remove('favorited');
      });
    } else {
      // Product is not in favorites; add it
      favoritesRef.set({
        products: firebase.firestore.FieldValue.arrayUnion(productId)
      }, { merge: true }).then(() => {
        // Update button image
        favoriteBtn.classList.add('favorited');
      });
    }
  });
}
