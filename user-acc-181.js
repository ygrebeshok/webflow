const popupTitle = document.getElementById("popup_title");
const popupBrand = document.getElementById("popup_brand");
const popupDesc = document.getElementById("popup_desc");
const popupPrice = document.getElementById("popup_price");
const popupClose = document.getElementById("popup-close");

const profilePopupTitle = document.getElementById("profile-popup-title");
const profilePopupBrand = document.getElementById("profile-popup-brand");
const profilePopupDesc = document.getElementById("profile-popup-desc");
const profilePopupPrice = document.getElementById("profile-popup-price");
const profilePopupClose = document.getElementById("profile-popup-close");

const favoritesGrid = document.getElementById("favoritesGrid");
const favCardTemplate = document.querySelector("#card");
const profileCardTemplate = document.querySelector("#profile-card");
const popupContainer = document.getElementById("popup-fade");
const giftsRef = firebase.firestore().collection("added-by-parsing");
const popUp = document.getElementById("pop-up");
const closeBtn = document.getElementById("close-button");
const favoritesLabel = document.getElementById("favorites-label");
const favoriteBtn = document.querySelector("#favorite-btn");
const profilesContain = document.getElementById("profiles-grid");
const showProductsContainer = document.getElementById("show-products-container");
const profileProductGrid = document.getElementById("show-products-grid");
const profileProductTemplate = document.querySelector(".profile-product-template");
const profileProductDefault = document.querySelector(".default-profile-product-card");
const profileProductName = document.getElementById("profile-product-name");
const profileProductPopup = document.getElementById("profile-products-popup-container");
const profileFavoritesLabel = document.getElementById("profile-popup-favorite-label");
const profileFavoritesBtn = document.getElementById("profile-popup-favorite");
const addToCollectionOrdinaryBtn = document.getElementById("page-link-btn");
const addToCollectionProfileBtn = document.getElementById("show-products-page-link-btn");

var bodyAuth = document.body.getAttribute('data-user-auth');
var bodyUnauth = document.body.getAttribute('data-user-unauth');

showProductsContainer.style.display = "none";
profileProductGrid.removeChild(profileProductDefault);
let currentProductId = null;
let isFavorite

function loadProfileData(profiles, userId) {
  profilesContain.innerHTML = "";
  profiles.sort((a, b) => new Date(a.date) - new Date(b.date));

  profiles.forEach(async (data) => {
	  
    const profile = profileCardTemplate.cloneNode(true);
     // populate the card with profile data
     profile.querySelector(".profile-letter").textContent = data.profile_name.charAt(0);
     profile.querySelector(".profile-names").textContent = data.profile_name;
     profile.querySelector(".occasion-mark").textContent = data.occasion;
     profile.querySelector(".reference").textContent = data.receiver;
     profile.querySelector(".age-from-data").textContent = data.profile_age;

     const dateString = data.date;
     const dateObject = new Date(dateString);
     const formattedDate = `${dateObject.getMonth() + 1}/${dateObject.getDate()}/${dateObject.getFullYear()}`;

     profile.querySelector(".pr-date").textContent = formattedDate;
     profile.querySelector(".profile-desc").textContent = data.gift_desc;

     const recommendedGiftsGrid = profile.querySelector('.recommended-gifts-grid');

     for (let i = 0; i < data.recommended_products.length; i++) {
       const [productName, productImage] = JSON.parse(data.recommended_products[i]);
      
       if (recommendedGiftsGrid.childElementCount >= 7) {
         break;
       }

       // Create a new element to display the product image
       const productImageElement = document.createElement('img'); // Create an image element
       productImageElement.src = productImage;
       productImageElement.alt = productName;

       // Append the image element to the grid
       recommendedGiftsGrid.appendChild(productImageElement);
     }

     profilesContain.appendChild(profile);

     profile.querySelector(".new-search").addEventListener('click', (event) => {
       try {
	 const occasion = profile.querySelector('.occasion-mark').textContent;
         const receiver = profile.querySelector('.reference').textContent;
         const giftDesc = profile.querySelector('.profile-desc').textContent;
	 const profile_age = profile.querySelector('.age-from-data').textContent;
	 
	 const queryParams = `?selected_who=${receiver}&selected_holiday=${occasion}&gift_desc=${giftDesc}&profile_age=${profile_age}`;

         const slug = "recommendations";
         window.location.href = `/${slug}${queryParams}`;
       } catch (error) {
	 console.error('Error handling profile click event:', error);       
       }	     
     });
	  
     profile.querySelector(".show-products").addEventListener('click', (event) => {
       profileProductName.textContent = data.profile_name;
       profileProductGrid.innerHTML = "";

       for (let i = 0; i < data.recommended_products.length; i++) {
         const [productName, productImage] = JSON.parse(data.recommended_products[i]);

         const profileProductCard = profileProductTemplate.cloneNode(true);

         profileProductCard.querySelector("#profile-product-image").src = productImage;
         profileProductCard.querySelector("#profile-product-grid-name").textContent = productName;

         // Append to the grid
         profileProductGrid.appendChild(profileProductCard);

         profileProductCard.addEventListener('click', (event) => {
	   showPopupForProfileProducts(profileProductCard.querySelector("#profile-product-grid-name").textContent, userId);
         });

	 profileFavoritesBtn.addEventListener('click', () => {
	   if (currentProductId) {
             if (isFavorite) {
               firebase.firestore().collection("users").doc(userId).update({
                 favorites: firebase.firestore.FieldValue.arrayRemove(currentProductId)
               })
               .then(() => {
                 profileFavoritesLabel.textContent = "Add to Favorites";
               })
               .catch(error => {
                 console.log("Error removing product from favorites:", error);
               });
             } else {
               firebase.firestore().collection("users").doc(userId).update({
                 favorites: firebase.firestore.FieldValue.arrayUnion(currentProductId)
               })
               .then(() => {
                 profileFavoritesLabel.textContent = "Remove from Favorites";
               })
               .catch(error => {
                 console.log("Error adding product to favorites:", error);
               });
             }
	   }
         });

         profileProductCard.addEventListener('mouseenter', () => {
           profileProductCard.animate([
             { transform: 'scale(1)' },
             { transform: 'scale(1.05)' }
           ], {
             duration: 200,
             fill: 'forwards'
           });
         });

         profileProductCard.addEventListener('mouseleave', () => {
           profileProductCard.animate([
             { transform: 'scale(1.05)' },
             { transform: 'scale(1)' }
           ], {
             duration: 200,
             fill: 'forwards'
           });
         });
        }
        showProductsContainer.style.display = "flex";
      });  
   });
}

const closeShowProducts = document.getElementById("show-product-cross");
closeShowProducts.addEventListener('click', (event) => {
  showProductsContainer.style.display = "none";
});

function showPopupForProfileProducts(productName, userId) {

  const slideContainer = document.querySelector('.profile-slides');
  const thumbnailContainer = document.querySelector('.profile-thumbnails');
  slideContainer.innerHTML = ''; // Clear existing slides
  thumbnailContainer.innerHTML = ''; // Clear existing thumbnails

  const giftsRef = firebase.firestore().collection('added-by-parsing');

  giftsRef
  .where('name', '==', productName)
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const productData = doc.data();

      profilePopupTitle.textContent = productData.name;
      profilePopupBrand.textContent = productData.brand;
      profilePopupDesc.textContent = productData.description;
      profilePopupPrice.textContent = `$${productData.price}`;

      productData.images.forEach(imageUrl => {
        const thumbnail = document.createElement('div');
        thumbnail.classList.add('profile-thumbnail');
        thumbnail.innerHTML = `<img src="${imageUrl}" alt="Thumbnail">`;
        thumbnailContainer.appendChild(thumbnail);

        const slide = document.createElement('div');
        slide.classList.add('profile-slide');
        slide.innerHTML = `<img src="${imageUrl}" alt="Product Image">`;
        slideContainer.appendChild(slide);
      })

      const user = firebase.auth().currentUser;
      const productId = productData.name;

      if (user) {
        const userId = user.uid;
        firebase.firestore().collection("users").doc(userId).get()
        .then(doc => {
          const favorites = doc.data().favorites;
          if (favorites.includes(productName)) {
            profileFavoritesLabel.textContent = "Remove from Favorites";
          } else {
	    profileFavoritesLabel.textContent = "Add to Favorites";
          }
        })
        .catch(error => {
          console.log("Error getting favorites:", error);
        });
      }

      const slides = document.querySelector('.profile-slides');
      const thumbnails = document.querySelectorAll('.profile-thumbnail');
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
        });
      });

    showSlide(currentSlide);
    });
  });

  profileProductPopup.style.display = "flex";
}

profilePopupClose.addEventListener("click", () => {
  profileProductPopup.style.display = "none";
  profilePopupTitle.textContent = '';
  profilePopupBrand.textContent = '';
  profilePopupDesc.textContent = '';
  profilePopupPrice.textContent = '';
});	

addToCollectionProfileBtn.addEventListener("click", () => {
  collectionPopupWindow.style.display = "flex";
  console.log(profilePopupTitle.textContent);
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;

    if (user) {
      const userId = user.uid;
      loadCollections(userId, profilePopupTitle.textContent);
    } else {
      moveUnauthorizedToLogIn();
    }
	  
  });
});

profileFavoritesBtn.addEventListener("click", () => {
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    if (user) {
      const userId = user.uid;
      toggleFavorite(profileFavoritesLabel, userId, profilePopupTitle.textContent);
    } else {
      moveUnauthorizedToLogIn();
    }
  }); 
});

const collectionPopupWindow = document.getElementById('collection-popup-window');
const collectionPopupClose = document.getElementById('collection-popup-close');
const newCollectionClose = document.getElementById('new-collection-close');
const createNewCollectionBtn = document.getElementById('create-new-collection-btn');
const collectionNameInput = document.getElementById('collection-name-input');
const setCollectionNameWindow = document.getElementById('set-collection-name-window');
const collectionListPopup = document.getElementById('collection-list-popup');
const collectionCardTemplate = document.querySelector('.collection-card');
const editCollectionListBtn = document.getElementById('edit-collection-list');
const createCollectionBtn = document.getElementById('create-collection-btn');

const noCollectionsImage = document.getElementById('no-collections-image');

collectionPopupClose.addEventListener("click", () => {
  collectionPopupWindow.style.display = "none";
});

newCollectionClose.addEventListener("click", () => {
  setCollectionNameWindow.style.display = "none";
  collectionNameInput.value = '';
});

createCollectionBtn.addEventListener("click", () => {
  setCollectionNameWindow.style.display = "flex";

  console.log("Popup Title: " + popupTitle.textContent)
  console.log("Profile Popup Title: " + profilePopupTitle.textContent);
  checkInputForCollection();
});

editCollectionListBtn.addEventListener("click", () => {
    
  if (editCollectionListBtn.textContent === "Edit List") {
    editCollectionListBtn.textContent = "Done";
	    
    document.querySelectorAll(".remove-collection-btn").forEach(btn => {
      btn.style.display = "block";
    });

    document.querySelectorAll('.collection-card').forEach(card => {
      card.querySelector('#link-to-collection').style.pointerEvents = 'none';
      card.classList.remove('donate');
    }); 
	    
  } else if (editCollectionListBtn.textContent === "Done") {
    editCollectionListBtn.textContent = "Edit List";
	    
    document.querySelectorAll(".remove-collection-btn").forEach(btn => {
      btn.style.display = "none";
    });

    document.querySelectorAll('.collection-card').forEach(card => {
      card.querySelector('#link-to-collection').style.pointerEvents = '';
      card.classList.add('donate');
    });
  }	  
});

createNewCollectionBtn.addEventListener('click', async () => {
  const collectionName = collectionNameInput.value;

  let productName = '';

  if (popupTitle.textContent === '') {
    productName = profilePopupTitle.textContent;
  } else {
    productName = popupTitle.textContent;
  }

  console.log(productName);
	
  try {
    const querySnapshot = await firebase.firestore().collection('added-by-parsing').where("name", "==", productName).get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const productImage = data.images[0];

      const authUser = firebase.auth().currentUser;
      
      if (authUser) {
        const userId = authUser.uid;
        try {
          await createNewCollection(userId, collectionName, productName, productImage);
          setTimeout(() => {
            collectionNameInput.value = "";
            setCollectionNameWindow.style.display = "none";
            collectionPopupWindow.style.display = "none";
          }, 1000);
        } catch (error) {
          console.error("Error creating new collection:", error);
        }
      } else {
        moveUnauthorizedToLogIn();
      }
    } else {
      console.log("Document not found");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
});


function loadCollections(userId, productId) {
  const defaultCollectionCover = "https://firebasestorage.googleapis.com/v0/b/smappy-ai.appspot.com/o/default-collection-cover_600x600.png?alt=media&token=9155ed41-888b-4e07-936e-9fe156da1120";
	
  document.querySelectorAll(".remove-collection-btn").forEach(btn => {
    btn.style.display = "none";
  });

  let productImage = '';

  firebase.firestore().collection('added-by-parsing').where("name", "==", productId)
  .get()
  .then((querySnapshot) => {
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      productImage = data.images[0];
    } else {
      console.log("Document not found");
    }
  })
  .catch((error) => {
    console.error("Error getting document:", error);
  });

  console.log(productImage)
	
  firebase.firestore().collection('users').doc(userId).get()
    .then((doc) => {
      collectionListPopup.innerHTML = "";

      if (doc.exists) {
        const data = doc.data();
        const collections = data.collections || [];

	if (collections.length === 0) {
    	  noCollectionsImage.style.display = "block";
  	} else {
    	  noCollectionsImage.style.display = "none";
  	}

        collections.forEach(async (collection) => {
          const collectionCard = collectionCardTemplate.cloneNode(true);

	  collectionCard.querySelector("#collection-name").textContent = collection.name;

	  if (collection.products.length > 0) {
	    collectionCard.querySelector("#cover-collection").src = collection.products[0].productImage;
	  } else {
	    collectionCard.querySelector("#cover-collection").src = defaultCollectionCover;
	  }
        
	  collectionCard.querySelector("#remove-collection-btn").addEventListener("click", () => {
	    removeCollection(userId, collection.name);
            collectionCard.style.display = 'none';
	  });

	  collectionCard.querySelector("#link-to-collection").addEventListener("click", () => {
	    addToCollection(userId, collectionCard.querySelector("#collection-name").textContent, productId, productImage);
	  });

          collectionListPopup.appendChild(collectionCard);
        });
	      
      } else {
        console.error("User document not found");
      }
    })
    .catch((error) => {
      console.error("Error loading collections:", error);
    });
}

function removeCollection(userId, collectionName) {
  const userDocRef = firebase.firestore().collection('users').doc(userId);

  // Fetch the user document to get the current collections array
  userDocRef.get().then((doc) => {
    if (doc.exists) {
      const userData = doc.data();
      const collections = userData.collections || [];

      // Find the index of the collection with the given name
      const collectionIndex = collections.findIndex(collection => collection.name === collectionName);

      if (collectionIndex !== -1) {
        // Collection with the given name exists, update it with new data
        collections.splice(collectionIndex, 1); // Remove the collection at the found index

        // Update the user document with the modified collections array
        userDocRef.update({
          collections: collections
        });
      } else {
        // Collection with the given name doesn't exist
        console.error("Collection not found:", collectionName);
      }
    } else {
      // Handle the case where the user document doesn't exist
      console.error("User document not found");
    }
  }).catch((error) => {
    console.error("Error getting user document:", error);
  });
}


function addToCollection(userId, collectionName, productId, productImage) {
  const userDocRef = firebase.firestore().collection('users').doc(userId);

  firebase.firestore().runTransaction(transaction => {
    return transaction.get(userDocRef).then(userDoc => {
      if (!userDoc.exists) {
        console.error("User document not found");
        return;
      }

      const userData = userDoc.data();
      const collections = userData.collections || [];

      // Find the index of the collection with the given name
      const collectionIndex = collections.findIndex(collection => collection.name === collectionName);

      if (collectionIndex !== -1) {
        // Collection with the given name exists, update it with new data
        collections[collectionIndex].products.push({ productId, productImage });

        // Update the user document with the modified collections array
        transaction.update(userDocRef, {
          collections: collections
        });
      } else {
        // Collection with the given name doesn't exist, create a new one
        const newCollection = { name: collectionName, products: [{ productId, productImage }] };
        collections.push(newCollection);

        // Update the user document with the modified collections array
        transaction.update(userDocRef, {
          collections: collections
        });
        }
      });
    }).catch(error => {
        console.error("Error updating user document:", error);
    });
    collectionPopupWindow.style.display = "none";
}


function checkInputForCollection() {
  createNewCollectionBtn.classList.add('disablegrid');

  collectionNameInput.addEventListener('input', (event) => {
    createNewCollectionBtn.classList.remove('disablegrid');
  });
}


async function createNewCollection(userId, collectionName, productId, productImage) {
  
  const userDocRef = firebase.firestore().collection('users').doc(userId);

  // Check if the 'collections' array exists in the user document
  userDocRef.get().then((doc) => {
    if (doc.exists) {
      const userData = doc.data();

      // Check if the 'collections' array exists
      if (!userData.collections) {
        // If it doesn't exist, create a new 'collections' array with the new collection structure
        userDocRef.update({
          collections: [{
            name: collectionName,
            products: [{ productId, productImage }]
          }]
        });
      } else {
        // If it exists, append the new collection structure using arrayUnion
        userDocRef.update({
          collections: firebase.firestore.FieldValue.arrayUnion({
            name: collectionName,
            products: [{ productId, productImage }]
          })
        });
      }

      setCollectionNameWindow.style.display = "none";
    } else {
      // Handle the case where the user document doesn't exist
      console.log("User document not found");
    }
  }).catch((error) => {
    console.error("Error getting user document:", error);
  });
}


function toggleFavorite(element, userId, productId) {
  const isFavorite = element.textContent === "Remove from Favorites";

  if (isFavorite) {
    firebase.firestore().collection("users").doc(userId).update({
    favorites: firebase.firestore.FieldValue.arrayRemove(productId)
    })
    .then(() => {
      element.textContent = "Add to Favorites";
    })
    .catch(error => {
      console.log("Error removing product from favorites:", error);
    });
  } else {
    firebase.firestore().collection("users").doc(userId).update({
      favorites: firebase.firestore.FieldValue.arrayUnion(productId)
    })
    .then(() => {
      element.textContent = "Remove from Favorites";
    })
    .catch(error => {
      console.log("Error adding product to favorites:", error);
    });
   }
}


function showPopupUser(productData, card) {
	
  const slideContainer = document.querySelector('.slides');
  const thumbnailContainer = document.querySelector('.thumbnails');
  slideContainer.innerHTML = ''; // Clear existing slides
  thumbnailContainer.innerHTML = ''; // Clear existing thumbnails

  popupTitle.textContent = productData.name;
  popupBrand.textContent = productData.brand;
  popupDesc.textContent = productData.description;
  popupPrice.textContent = `$${productData.price}`;

  const user = firebase.auth().currentUser;
  const userId = user.uid;
  const productId = productData.name;

  if (user) {
    const userId = user.uid;
    firebase.firestore().collection("users").doc(userId).get()
    .then(doc => {
      const favorites = doc.data().favorites;
      if (favorites.includes(productId)) {
        favoritesLabel.textContent = "Remove from Favorites";
      } else {
	favoritesLabel.textContent = "Add to Favorites";
      }
    })
    .catch(error => {
      console.log("Error getting favorites:", error);
    });
  }

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
    });
  });

  showSlide(currentSlide);
}

popupClose.addEventListener("click", () => {
  popupContainer.style.display = "none";
  popupTitle.textContent = '';
  popupBrand.textContent = '';
  popupDesc.textContent = '';
  popupPrice.textContent = '';
});

addToCollectionOrdinaryBtn.addEventListener("click", () => {
  collectionPopupWindow.style.display = "flex";
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;

    if (user) {
      const userId = user.uid;
      loadCollections(userId, popupTitle.textContent);
    } else {
      moveUnauthorizedToLogIn();
    }
	  
  });
});

favoriteBtn.addEventListener("click", () => {
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    if (user) {
      const userId = user.uid;
      toggleFavorite(favoritesLabel, userId, popupTitle.textContent);
      setupUser();
    } else {
      moveUnauthorizedToLogIn();
    }
  }); 
});

const defaultCard = document.querySelector(".default-card");
favoritesGrid.removeChild(defaultCard);

const shareFavoritesButton = document.getElementById('shareFavoritesButton');

popupContainer.style.display = "none";
popUp.style.display = "none";


function setupUser() {
favoritesGrid.innerHTML = "";
	
firebase.auth().onAuthStateChanged(function(authUser) {
  user = authUser;
	
  if (user && bodyUnauth) {
    window.location.href = webflowAuth.loginRedirectPath;
  } else if (!user && bodyAuth) {
    window.location.href = webflowAuth.loginPath;
  }

  if (user) {
    const userId = user.uid;
    
    firebase.firestore().collection("users").doc(userId).get()
      .then(function(doc) {
	if (doc.exists) {
	  // Update the user doc
          user.email = doc.data().email;
          user.favorites = doc.data().favorites;
          user.liked = doc.data().liked;
          user.disliked = doc.data().disliked;
          user.profiles = doc.data().profiles;
          user.shared_favorites = doc.data().shared_favorites;
        } else {
	  // If the user document doesn't exist, create it
          firebase.firestore().collection("users").doc(user.uid).set({
            email: user.email,
            favorites: [],
            liked: [],
            disliked: [],
            profiles: [],
            shared_favorites: []
          });
	}

     firebase.firestore().collection("users").doc(userId).get()
      .then(function(doc) {
	const profiles = doc.data().profiles;
        loadProfileData(profiles, userId);
	      
        const favorites = doc.data().favorites;
	const shared_fav = doc.data().shared_favorites;
        
        favorites.forEach(favorite => {
          giftsRef.where("name", "==", favorite).get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                const data = doc.data();
                const favCard = favCardTemplate.cloneNode(true);
                // populate the card with product data
                favCard.querySelector("#name").textContent = data.name;
		favCard.querySelector("#brand").textContent = data.brand;
		favCard.querySelector("#brand").href = data.product_link;
                favCard.querySelector("#description").textContent = data.description;
                favCard.querySelector("#product_image").src = data.images[0];
                favCard.querySelector("#price").textContent = `$${data.price}`;

                favoritesGrid.appendChild(favCard);
                
                favCard.addEventListener('mouseenter', () => {
                  favCard.animate([
                   { transform: 'scale(1)' },
                   { transform: 'scale(1.05)' }
                   ], {
                  duration: 200,
                  fill: 'forwards'
                  });
              	});

              favCard.addEventListener('mouseleave', () => {
                  favCard.animate([
                  { transform: 'scale(1.05)' },
                  { transform: 'scale(1)' }
                  ], {
                  duration: 200,
                  fill: 'forwards'
                  });
                });
                
                const favoriteBtn = favCard.querySelector("#favorite-btn");
                const sharedFavBtn = favCard.querySelector("#shared-fav");
                const productId = favCard.querySelector("#name").textContent;
                const quickLookBtn = favCard.querySelector("#quick_look");
		      
                quickLookBtn.addEventListener("click", () => {
                  const productData = {
                    images: data.images,
                    name: favCard.querySelector("#name").textContent,
                    brand: favCard.querySelector("#brand").textContent,
                    description: favCard.querySelector("#description").textContent,
                    product_link: data.product_link,
                    price: favCard.querySelector("#price").textContent.replace("$", "")
                  };

                showPopupUser(productData, favCard);
                });
                
                const formattedContentSet = new Set()
                
                shared_fav.forEach(favorite => {
                  giftsRef.where("name", "==", favorite).get()
                  .then(sharedFavoritesQuerySnapshot => {
                    sharedFavoritesQuerySnapshot.forEach(sharedDoc => {
                      if (shared_fav.includes(productId)) {
                        sharedFavBtn.textContent = "Remove from my Gift List";
                      }
                    });
                  })
                  .catch(error => {
                    console.log("Error getting shared favorites:", error);
                  });
                });

                sharedFavBtn.addEventListener('click', () => {
                  const isSharedFavorite = sharedFavBtn.textContent === "Remove from my Gift List";

                  if (isSharedFavorite) {
                    firebase.firestore().collection("users").doc(userId).update({
                        shared_favorites: firebase.firestore.FieldValue.arrayRemove(productId)
                      })
                      .then(() => {
                        sharedFavBtn.textContent = "Add to my Gift List";
                      })
                      .catch(error => {
                        console.log("Error removing product from shared_favorites:", error);
                      });
                  } else {
                    firebase.firestore().collection("users").doc(userId).update({
                        shared_favorites: firebase.firestore.FieldValue.arrayUnion(productId)
                      })
                      .then(() => {
                        sharedFavBtn.textContent = "Remove from my Gift List";
                      })
                      .catch(error => {
                        console.log("Error adding product to shared_favorites:", error);
                      });
                  }
                });
              });
            })
            .catch(error => {
              console.log("Error getting product data:", error);
            });
         });
	  
	// End of favorites clause
      
      // Retrieve the user's document from the "users" collection
      const userDocRef = firebase.firestore().collection('users').doc(userId);

      shareFavoritesButton.addEventListener('click', () => {
	      
        userDocRef.get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const sharedFavorites = userData.shared_favorites || [];

	    if (sharedFavorites.length === 0) {
              // Handle case when there are no items in sharedFavorites
              const warning = document.getElementById("warning");
	      warning.textContent = "Please, add something to the Gift List first";
	      warning.style.display = "block";
	      setTimeout(() => {
    		warning.style.display = "none";
  	      }, 5000);
              return;
            }

            const giftsQuery = firebase.firestore().collection('added-by-parsing').where('name', 'in', sharedFavorites);
            giftsQuery.get()
            .then((querySnapshot) => {
              const formattedContentArray = [];

              querySnapshot.forEach((doc) => {
                const gift = doc.data();
                const formattedContent = `<p>${gift.name}: <a href="${gift.product_link}" target="_blank">${gift.product_link}</a></p>`;
                formattedContentArray.push(formattedContent);
              });

              // Open a new pop-up window with the formatted content
              popUp.style.display = "flex";
    	      const giftList = document.getElementById("gift-list");
              giftList.innerHTML = formattedContentArray.join('');
              
              closeBtn.addEventListener('click', () => {
              	popUp.style.display = "none";
              });
            })
            .catch((error) => {
              console.error('Error fetching gifts:', error);
            });
          } else {
            console.error('User document not found.');
          }
        })
        .catch((error) => {
          console.error('Error retrieving user document:', error);
        });
     });
     // End of shareFavoritesButton clause  
    });
   });
  }
});
}