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
const giftsRef = firebase.firestore().collection("gifts");
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

var bodyAuth = document.body.getAttribute('data-user-auth');
var bodyUnauth = document.body.getAttribute('data-user-unauth');

showProductsContainer.style.display = "none";
profileProductGrid.removeChild(profileProductDefault);

function loadProfileData(profiles) {
  profilesContain.innerHTML = "";
  profiles.sort((a, b) => new Date(a.date) - new Date(b.date));

  profiles.forEach(async (data) => {
	  
    const profile = profileCardTemplate.cloneNode(true);
     // populate the card with profile data
     profile.querySelector(".profile-letter").textContent = data.profile_name.charAt(0);
     profile.querySelector(".profile-names").textContent = data.profile_name;
     profile.querySelector(".occasion-mark").textContent = data.occasion;
     profile.querySelector(".reference").textContent = data.receiver;

     const dateString = data.date;
     const dateObject = new Date(dateString);
     const formattedDate = `${dateObject.getMonth() + 1}/${dateObject.getDate()}/${dateObject.getFullYear()}`;

     profile.querySelector(".pr-date").textContent = formattedDate;
     profile.querySelector(".profile-desc").textContent = data.gift_desc;

     const recommendedGiftsGrid = profile.querySelector('.recommended-gifts-grid');

     for (const productName of data.recommended_products) {
      
      if (recommendedGiftsGrid.childElementCount >= 7) {
        break; // Break out of the loop after adding 6 images
      }
	     
      // Query the "gifts" collection for the product with the matching name
      const productSnapshot = await firebase.firestore()
        .collection('gifts')
        .where('name', '==', productName)
        .limit(1)
        .get();

      if (!productSnapshot.empty) {
        const productData = productSnapshot.docs[0].data();
        const productImage = productData.images[0];

        // Create a new element to display the product image
        const productImageElement = document.createElement('img'); // Create an image element
	productImageElement.src = productImage;
	productImageElement.alt = productName;

	// Append the image element to the grid
	recommendedGiftsGrid.appendChild(productImageElement);
      }
    }

     profilesContain.appendChild(profile);

     profile.querySelector(".new-search").addEventListener('click', (event) => {
       try {
	 const occasion = profile.querySelector('.occasion-mark').textContent;
         const receiver = profile.querySelector('.reference').textContent;
         const giftDesc = profile.querySelector('.profile-desc').textContent;
	 
	 const queryParams = `?selected_who=${receiver}&selected_holiday=${occasion}&gift_desc=${giftDesc}`;

         const slug = "recommendations";
         window.location.href = `/${slug}${queryParams}`;
       } catch (error) {
	 console.error('Error handling profile click event:', error);       
       }	     
     });
	  
     profile.querySelector(".show-products").addEventListener('click', (event) => {
       profileProductName.textContent = data.profile_name;
       profileProductGrid.innerHTML = "";

       for (const productName of data.recommended_products) {

       // Query the "gifts" collection for the product with the matching name
       const giftsRef = firebase.firestore().collection('gifts');

       giftsRef
         .where('name', '==', productName)
         .get()
         .then((querySnapshot) => {
           querySnapshot.forEach((doc) => {
             const productData = doc.data();
	     const profileProductCard = profileProductTemplate.cloneNode(true);
             profileProductCard.querySelector("#profile-product-image").src = productData.images[0];
	     profileProductCard.querySelector("#profile-product-grid-name").textContent = productData.name;

             // Append to the grid
             profileProductGrid.appendChild(profileProductCard);

	     profileProductCard.addEventListener('click', (event) => {
	       showPopupForProfileProducts(productData);    
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

function showPopupForProfileProducts(productData) {

  const slideContainer = document.querySelector('.slides');
  const thumbnailContainer = document.querySelector('.thumbnails');
  slideContainer.innerHTML = ''; // Clear existing slides
  thumbnailContainer.innerHTML = ''; // Clear existing thumbnails
	
  profilePopupTitle.innerHTML = '';
  profilePopupBrand.innerHTML = '';
  profilePopupBrand.innerHTML = '';
  profilePopupDesc.innerHTML = '';
  profilePopupPrice.innerHTML = '';

  const profileFavoritesBtn = document.getElementById("profile-popup-favorite");
  const profileFavoritesLabel = document.getElementById("profile-popup-favorite-label");
  profileFavoritesLabel.innerHTML = '';
	
  profilePopupTitle.textContent = productData.name;
  profilePopupBrand.textContent = productData.brand;
  profilePopupBrand.href = productData.product_link;
  profilePopupDesc.textContent = productData.description;
  profilePopupPrice.textContent = `$${productData.price}`;

  const user = firebase.auth().currentUser;
  const userId = user.uid;
  const productId = productData.name;

  firebase.firestore().collection("users").doc(userId).get()
    .then(doc => {
      const favorite = doc.data().favorites;
      if (favorite.includes(productId)) {
        profileFavoritesLabel.textContent = "Remove from Favorites";
      } else {
        profileFavoritesLabel.textContent = "Add to Favorites";
      }
	    
      profileFavoritesBtn.addEventListener('click', () => {
        const isFavorite = profileFavoritesLabel.textContent === "Remove from Favorites";

        if (isFavorite) {
          firebase.firestore().collection("users").doc(userId).update({
            favorites: firebase.firestore.FieldValue.arrayRemove(productId)
          })
          .then(() => {
            profileFavoritesLabel.textContent = "Add to Favorites";
          })
          .catch(error => {
            console.log("Error removing product from favorites:", error);
          });
          } else {
            firebase.firestore().collection("users").doc(userId).update({
              favorites: firebase.firestore.FieldValue.arrayUnion(productId)
            })
            .then(() => {
              profileFavoritesLabel.textContent = "Remove from Favorites";
            })
            .catch(error => {
              console.log("Error adding product to favorites:", error);
            });
          }
       });
    })
    .catch(error => {
      console.log("Error getting favorites:", error);
    });

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

  profileProductPopup.style.display = "flex";

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

  profilePopupClose.addEventListener("click", () => {
    profileProductPopup.style.display = "none";
  });	
}

function showPopupUser(productData, card) {
	
  const slideContainer = document.querySelector('.slides');
  const thumbnailContainer = document.querySelector('.thumbnails');
  slideContainer.innerHTML = ''; // Clear existing slides
  thumbnailContainer.innerHTML = ''; // Clear existing thumbnails

  popupTitle.innerHTML = '';
  popupBrand.innerHTML = '';
  popupBrand.innerHTML = '';
  popupDesc.innerHTML = '';
  popupPrice.innerHTML = '';
  favoritesLabel.innerHTML = '';
	
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
      const favorite = doc.data().favorites;
      if (favorite.includes(productId)) {
        favoritesLabel.textContent = "Remove from Favorites";
      } else {
        favoritesLabel.textContent = "Add to Favorites";
      }
	    
      favoriteBtn.addEventListener('click', () => {
        const isFavorite = favoritesLabel.textContent === "Remove from Favorites";

        if (isFavorite) {
          firebase.firestore().collection("users").doc(userId).update({
            favorites: firebase.firestore.FieldValue.arrayRemove(productId)
          })
          .then(() => {
            favoritesLabel.textContent = "Add to Favorites";
	      card.style.display = "none";
          })
          .catch(error => {
            console.log("Error removing product from favorites:", error);
          });
          } else {
            firebase.firestore().collection("users").doc(userId).update({
              favorites: firebase.firestore.FieldValue.arrayUnion(productId)
            })
            .then(() => {
              favoritesLabel.textContent = "Remove from Favorites";
            })
            .catch(error => {
              console.log("Error adding product to favorites:", error);
            });
          }
       });
    })
    .catch(error => {
      console.log("Error getting favorites:", error);
    });

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

    popupClose.addEventListener("click", () => {
      popupContainer.style.display = "none";
    });
}

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
        loadProfileData(profiles);
	      
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

            const giftsQuery = firebase.firestore().collection('gifts').where('name', 'in', sharedFavorites);
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
