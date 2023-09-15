
const popupImage = document.getElementById('popup_image');
const popupTitle = document.getElementById('popup_title');
const popupBrand = document.getElementById('popup_brand');
const popupDesc = document.getElementById('popup_desc');
const popupLink = document.getElementById('popup_link');
const popupPrice = document.getElementById('popup_price');
const popupClose = document.getElementById('popup-close');
const popupContainer = document.getElementById('popup-fade');
const favoritesGrid = document.getElementById("favoritesGrid");
const favCardTemplate = document.querySelector("#card");
const profileCardTemplate = document.querySelector("#profile-card");
const profilesContainer = document.getElementById("profiles-grid");
const giftsRef = firebase.firestore().collection("gifts");
const popUp = document.getElementById("pop-up");
const closeBtn = document.getElementById("close-button");
const favoritesLabel = document.getElementById("favorites-label");
const favoriteBtn = document.querySelector("#favorite-btn");

function loadProfileData(profiles) {

profiles.get().then((querySnapshot) => {
  profilesContainer.innerHTML = "";
  querySnapshot.forEach(doc => {
    const data = doc.data();
    const profile = profileCardTemplate.cloneNode(true);
     // populate the card with profile data
     profile.querySelector(".profile-names").textContent = data.profile_name;
     profile.querySelector(".occasion-mark").textContent = data.occasion;
     profile.querySelector(".reference").textContent = data.receiver;
     profile.querySelector(".pr-date").textContent = data.date;
     profile.querySelector(".profile-desc").textContent = data.gift_desc;

     profilesContainer.appendChild(profile);
                
     profile.addEventListener('mouseenter', () => {
       profile.animate([
         { transform: 'scale(1)' },
         { transform: 'scale(1.05)' }
       ], {
          duration: 200,
          fill: 'forwards'
        });
     });

     profile.addEventListener('mouseleave', () => {
       profile.animate([
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

function showPopupUser(productData, card) {
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
	
  popupContainer.style.display = "flex";
}

popupClose.addEventListener("click", () => {
  popupContainer.style.display = "none";
});

popupContainer.style.display = "none";
popUp.style.visibility = "hidden";

const defaultCard = document.querySelector(".default-card");
favoritesGrid.removeChild(defaultCard);

const shareFavoritesButton = document.getElementById('shareFavoritesButton');

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const userId = user.uid;

    const profilesRef = firebase.firestore().collection("users").doc(userId).collection("profiles");
    loadProfileData(profilesRef);
    
    firebase.firestore().collection("users").doc(userId).get()
      .then(doc => {
	      
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
                favCard.querySelector("#product_image").src = data.image_url;
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
                    image_url: favCard.querySelector("#product_image").src,
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
      })
      .catch(error => {
        console.log("Error getting favorites:", error);
      });
      
      // Retrieve the user's document from the "users" collection
      const userDocRef = firebase.firestore().collection('users').doc(userId);

      shareFavoritesButton.addEventListener('click', () => {
      
        userDocRef.get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const sharedFavorites = userData.shared_favorites || [];

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
              popUp.style.visibility = "visible";
    					const giftList = document.getElementById("gift-list");
              giftList.innerHTML = formattedContentArray.join('');
              
              closeBtn.addEventListener('click', () => {
              	popUp.style.visibility = "hidden";
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

  }
});

