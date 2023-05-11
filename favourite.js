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
  const productsRef = firebase.firestore().collection('products').doc(productId);
  favoritesRef.get().then(doc => {
    if (doc.exists && doc.data().products.includes(productId)) {
      // Product is already in favorites; remove it
      favoritesRef.update({
        products: firebase.firestore.FieldValue.arrayRemove(productId)
      }).then(() => {
        // Update button image
        favoriteBtn.classList.remove('favorited');
        // Update product favorite field
        productsRef.update({
          favorite: false
        }).then(() => {
          console.log("Product removed from favorites");
        }).catch((error) => {
          console.error("Error updating product favorite field: ", error);
        });
      });
    } else {
      // Product is not in favorites; add it
      favoritesRef.set({
        products: firebase.firestore.FieldValue.arrayUnion(productId)
      }, { merge: true }).then(() => {
        // Update button image
        favoriteBtn.classList.add('favorited');
        // Update product favorite field
        productsRef.update({
          favorite: true
        }).then(() => {
          console.log("Product added to favorites");
        }).catch((error) => {
          console.error("Error updating product favorite field: ", error);
        });
      });
    }
  });
}
