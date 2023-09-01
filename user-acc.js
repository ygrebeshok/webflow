function showPopup(productData) {
  popupImage.src = productData.image_url;
  popupTitle.textContent = productData.name;
  popupBrand.textContent = productData.brand;
  popupBrand.href = productData.product_link;
  popupDesc.textContent = productData.description;
  popupPrice.textContent = `$${productData.price}`;

  const user = firebase.auth().currentUser;
  const userId = user.uid;
  const productId = productData.name;

  firebase.firestore().collection("users").doc(userId).get()
    .then(doc => {
      const favorites = doc.data().favorites;
      if (favorites.includes(productId)) {
        favoritesLabel.textContent = "Remove from Favorites";
      }
    })
    .catch(error => {
      console.log("Error getting favorites:", error);
    });

  popupFavoriteBtn.addEventListener('click', () => {
    toggleFavorite(favoritesLabel, userId, productId);
  });
	
  popupContainer.style.display = "flex";
}

popupClose.addEventListener("click", () => {
  popupContainer.style.display = "none";
});
