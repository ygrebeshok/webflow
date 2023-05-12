if (!Element.prototype.closest) {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }
  Element.prototype.closest = function(s) {
    var el = this;
    var ancestor = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (ancestor.matches(s)) return ancestor;
      ancestor = ancestor.parentElement;
    } while (ancestor !== null);
    return null;
  };
}

function toggleFavorite() {
  firebase.auth()
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
