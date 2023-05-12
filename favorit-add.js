function toggleFavorite() {
  firebase.auth();
  event.preventDefault();
  const id = event.target.getAttribute('data-id');
  const product = document.querySelector(`.product[data-id="${id}"]`);
  const favoriteBtn = event.target;
  let isFavorite = false;

  if (favoriteBtn.innerText === 'Remove from Favorites') {
    isFavorite = true;
    favoriteBtn.innerText = 'Add to Favorites';
  } else {
    isFavorite = false;
    favoriteBtn.innerText = 'Remove from Favorites';
  }

  if (product) {
    if (isFavorite) {
      product.classList.remove('favorite');
    } else {
      product.classList.add('favorite');
    }
  } else {
    console.error(`Could not find product with data-id=${id}`);
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
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
      favoritesRef.update({
        products: firebase.firestore.FieldValue.arrayRemove(productId)
      }).then(() => {
        favoriteBtn.textContent = "Add to Favorites";
      });
    } else {
      favoritesRef.set({
        products: firebase.firestore.FieldValue.arrayUnion(productId)
      }, { merge: true }).then(() => {
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
