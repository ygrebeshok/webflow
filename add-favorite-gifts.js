function toggleFavorite() {
  firebase.auth()
  event.preventDefault();
  
  const user = firebase.auth().currentUser;
  const userId = user.uid;
  // Add the product to the user's favorites list
  firebase.firestore().collection("users").doc(userId).update({
    favorites: firebase.firestore.FieldValue.arrayUnion(productId)
  });
}
