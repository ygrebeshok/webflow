

firebase.initializeApp(webflowAuth.firebaseConfig);
const storageRef = firebase.storage().ref();

firebase.analytics && firebase.analytics();

{
var bodyAuth = document.body.getAttribute('data-user-auth');
var bodyUnauth = document.body.getAttribute('data-user-unauth');
let storeNameValue;

function showPopupStore (productData, card) {

  const slideContainer = document.querySelector('.slides');
  const thumbnailContainer = document.querySelector('.thumbnails');
  slideContainer.innerHTML = ''; // Clear existing slides
  thumbnailContainer.innerHTML = ''; // Clear existing thumbnails

  const popupContainer = document.getElementById("popup-fade");
  const popupTitle = document.getElementById("popup_title");
  const popupBrand = document.getElementById("popup_brand");
  const popupDesc = document.getElementById("popup_desc");
  const popupLink = document.getElementById("popup_link");
  const popupPrice = document.getElementById("popup_price");
  const popupClose = document.getElementById("popup-close");
	
  popupTitle.textContent = productData.name;
  popupBrand.textContent = productData.brand;
  popupBrand.href = productData.product_link;
  popupDesc.textContent = productData.description;
  popupPrice.textContent = `$${productData.price}`;

  productData.images.forEach(imageUrl => {
    const thumbnail = document.createElement('div');
    thumbnail.classList.add('thumbnail');
    thumbnail.innerHTML = `<img src="${imageUrl}" alt="Thumbnail">`;
    thumbnailContainer.appendChild(thumbnail);

    const slide = document.createElement('div');
    slide.classList.add('slide');
    slide.innerHTML = `<img src="${imageUrl}" alt="Product Image">`;
    slideContainer.appendChild(slide);
  })
	
  popupContainer.style.display = "flex";

  const slides = document.querySelector('.slides');
  const thumbnails = document.querySelectorAll('.thumbnail');
  let currentSlide = 0;

  function updateThumbnails() {
    thumbnails.forEach((thumbnail, index) => {
      if (index === currentSlide) {
        thumbnail.classList.add('active');
      } else {
        thumbnail.classList.remove('active');
      }
    });
   }

    function showSlide(slideIndex) {
      slides.style.transform = `translateX(-${slideIndex * 100}%)`;
      currentSlide = slideIndex;
      updateThumbnails();
    }

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', function() {
        showSlide(index);
	console.log("thumbnail clicked");
      });
    });

    showSlide(currentSlide);

    popupClose.addEventListener("click", () => {
      popupContainer.style.display = "none";
    });

    document.getElementById("remove-btn").addEventListener("click", () => {
      removeProduct(card, popupTitle.textContent, popupDesc.textContent, popupPrice.textContent.replace("$", ""));
    });
}

	
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

          name.textContent = doc.data().store_name;
          bio.textContent = doc.data().store_bio;
          address.textContent = doc.data().store_address;
          phone.textContent = doc.data().store_phone;

	  storeNameValue = doc.data().store_name;
	  loadProducts(doc.data().store_name);
        } else {
	  // If the user document doesn't exist, create it
	  storeNameValue = "";
          firebase.firestore().collection("stores").doc(user.uid).set({
            email: user.email,
            store_name: "",
            store_bio: "",
            store_address: "",
            store_phone: "",
            products: []
          });
	  loadProducts(doc.data().store_name);
	}
     });
	  
     const updateButton = document.getElementById('update-btn');
   
     updateButton.addEventListener('click', function() {
       const storesRef = firebase.firestore().collection("stores");
  
       // Get the original store name
       const originalStoreName = storeNameValue;

       // Get the new store name
       const newStoreName = storeName.value;

       storesRef.doc(userId).update({
         store_name: newStoreName, // Update store name in "stores" collection
         store_bio: storeBio.value,
         store_address: storeAddress.value,
         store_phone: storePhone.value
       })
       .then(() => {
         message.style.display = "block";
         message.textContent = "Profile successfully updated";

         storesRef.doc(userId).get()
         .then(doc => {
           if (doc.exists) {
             const store_Name = doc.data().store_name;
             const store_Bio = doc.data().store_bio;
             const store_Address = doc.data().store_address;
             const store_Phone = doc.data().store_phone;

             name.textContent = store_Name;
             bio.textContent = store_Bio;
             address.textContent = store_Address;
             phone.textContent = store_Phone;

             storeNameValue = doc.data().store_name;

             // Update brand in "gifts" collection
             const giftsRef = firebase.firestore().collection('gifts');
             giftsRef.where("brand", "==", originalStoreName).get()
             .then((querySnapshot) => {
               querySnapshot.forEach((doc) => {
                 giftsRef.doc(doc.id).update({ brand: newStoreName });
               });
             })
             .catch((error) => {
               console.error('Error updating brands in gifts collection: ', error);
             });
            }
         });
      })
      .catch((error) => {
       message.style.display = "block";
       message.textContent = "Error updating profile: " + error;
     });
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

const addProductBtn = document.getElementById('add-product-btn');
	
addProductBtn.addEventListener('click', function() {
  success.style.display = 'none';
  addProductBtn.textContent = "Adding...";
  const brand = storeNameValue;
  const name = document.getElementById('product-name-update').value;
  const description = document.getElementById('product-description-update').value;
  const productLink = document.getElementById('product-link-update').value;
  const price = document.getElementById('product-price-update').value;
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
          document.getElementById('product-name-update').value = '';
          document.getElementById('product-description-update').value = '';
          document.getElementById('product-link-update').value = '';
          document.getElementById('product-price-update').value = '';
          document.getElementById('imagePreviewContainer').innerHTML = '';

	  loadProducts(brand);
	  const success = document.getElementById("success");
	  success.textContent = "Product added successfully";
	  success.style.display = 'block';
	  addProductBtn.textContent = "Add this Product";
        })
        .catch((error) => {
          console.error('Error adding product: ', error);
        });
    })
    .catch(error => {
      console.error('Error uploading images: ', error);
    });
});


function loadProducts(storeNameValue) {
  
  firebase.firestore().collection("gifts")
    .where("brand", "==", storeNameValue)
    .get()
    .then((querySnapshot) => {
    const productsContainer = document.getElementById("product-cards");
    const productTemplate = document.querySelector(".product-card");
    productsContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const productCard = productTemplate.cloneNode(true);

      productCard.querySelector("#product-name").textContent = data.name;
      productCard.querySelector("#product-desc").textContent = data.description;
      productCard.querySelector("#product-image").src = data.images[0];
      productCard.querySelector("#product-price").textContent = "$" + data.price;
	    
      productsContainer.appendChild(productCard);

      productCard.addEventListener('mouseenter', () => {
        productCard.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)' }
        ], {
        duration: 200,
        fill: 'forwards'
        });
        });

      productCard.addEventListener('mouseleave', () => {
        productCard.animate([
        { transform: 'scale(1.05)' },
        { transform: 'scale(1)' }
        ], {
        duration: 200,
        fill: 'forwards'
        });
        });
	    
      const lookBtn = productCard.querySelector("#look-product");
      lookBtn.addEventListener("click", () => {
        const productData = {
          images: data.images,
          name: data.name,
          brand: data.brand,
          description: data.description,
          product_link: data.product_link,
          price:  data.price
        };

        showPopupStore(productData, productCard);
      });    
    });
   }).catch((error) => {
     console.log("Error getting products: ", error);
  });
}


function removeProduct(productCard, name, description, price) {

  const giftsRef = firebase.firestore().collection('gifts');

  giftsRef
    .where("name", "==", name)
    .where("description", "==", description)
    .where("price", "==", price)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete()
          .then(() => {
            console.log('Product removed:', doc.id);
	    productCard.style.display = "none";
          })
          .catch((error) => {
            console.error('Error removing product:', error);
          });
      });
    })
    .catch((error) => {
      console.error('Error finding product:', error);
    });
}
	
}
