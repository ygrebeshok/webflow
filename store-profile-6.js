firebase.initializeApp(webflowAuth.firebaseConfig);
const storage = getStorage(app);
const storageRef = firebase.storage().ref();

firebase.analytics && firebase.analytics();

{
var bodyAuth = document.body.getAttribute('data-user-auth');
var bodyUnauth = document.body.getAttribute('data-user-unauth');

firebase.auth().onAuthStateChanged(function(authUser) {
  user = authUser;
	
  if (user && bodyUnauth) {
    window.location.href = webflowAuth.loginRedirectPath;
  } else if (!user && bodyAuth) {
    window.location.href = webflowAuth.loginPath;
  }

  if (user) {
    const userId = user.uid;
    
    firebase.firestore().collection("stores").doc(userId).get()
      .then(function(doc) {
	if (doc.exists) {
	  // Update the store doc
          user.email = doc.data().email;
          user.store_name = doc.data().store_name;
          user.store_bio = doc.data().store_bio;
          user.store_address = doc.data().store_address;
          user.store_phone = doc.data().store_phone;
          user.products = doc.data().products;
        } else {
	  // If the user document doesn't exist, create it
          firebase.firestore().collection("stores").doc(user.uid).set({
            email: user.email,
            store_name: "",
            store_bio: "",
            store_address: "",
            store_phone: "",
            products: []
          });
	}
     });
   }
});


var authLogout = document.querySelectorAll('[store-logout]');

authLogout.forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    firebase.auth().signOut().then(function() {
      user = null;
      window.location.href = webflowAuth.logoutRedirectPath;
    });
  });
});

document.getElementById('add-product-btn').addEventListener('click', function() {
  const brand = document.getElementById('store-name-text').value;
  const name = document.getElementById('product-name').value;
  const description = document.getElementById('product-description').value;
  const productLink = document.getElementById('product-link').value;
  const price = document.getElementById('product-price').value;
  const images = [];

  // Iterate through the images and upload them
  const previewImages = document.querySelectorAll('.previewImage');
  const uploadPromises = Array.from(previewImages).map((image, index) => {
    const file = image.src; // Assuming image.src contains the base64 data
    const imageRef = storageRef.child(`images/${name}_${index}.jpg`);

    return imageRef.putString(file, 'data_url')
      .then(snapshot => snapshot.ref.getDownloadURL());
  });

  // Wait for all images to upload
  Promise.all(uploadPromises)
    .then(downloadURLs => {
      images.push(...downloadURLs);

      const productData = {
        brand: brand,
        name: name,
        description: description,
        images: images,
        price: price,
        product_link: productLink
      };

      const giftsRef = firebase.firestore().collection('gifts');

      giftsRef.add(productData)
        .then((docRef) => {
          console.log('Product added with ID: ', docRef.id);
          // Reset form fields and image previews after successful submission
          document.getElementById('store-name-text').value = '';
          document.getElementById('product-name').value = '';
          document.getElementById('product-description').value = '';
          document.getElementById('product-link').value = '';
          document.getElementById('product-price').value = '';
          document.getElementById('imagePreviewContainer').innerHTML = '';
        })
        .catch((error) => {
          console.error('Error adding product: ', error);
        });
    })
    .catch(error => {
      console.error('Error uploading images: ', error);
    });
});
	
}
