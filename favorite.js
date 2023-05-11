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

        // Unmark gift as favorite
        const giftId = favoriteBtn.dataset.giftId;
        const giftsRef = firebase.firestore().collection('gifts');
        giftsRef.doc(giftId).update({ favorite: false })
          .then(() => console.log("Gift unmarked as favorite"))
          .catch(error => console.error("Error unmarking gift as favorite: ", error));
      });
    } else {
      // Product is not in favorites; add it
      favoritesRef.set({
        products: firebase.firestore.FieldValue.arrayUnion(productId)
      }, { merge: true }).then(() => {
        // Update button image
        favoriteBtn.classList.add('favorited');

        // Mark gift as favorite
        const giftId = favoriteBtn.dataset.giftId;
        const giftsRef = firebase.firestore().collection('gifts');
        giftsRef.doc(giftId).update({ favorite: true })
          .then(() => console.log("Gift marked as favorite"))
          .catch(error => console.error("Error marking gift as favorite: ", error));
      });
    }
  });
}

