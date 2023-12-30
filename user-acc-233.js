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
const cardTemplate = document.querySelector(".card");
const addToCartBtn = document.getElementById("add-to-cart-btn");
const cartGrid = document.getElementById("cart-grid");
const cartIconBtn = document.getElementById("cart-icon-button");
const cartPopupContainer = document.getElementById("cart-popup-container");
const popupCloseCart = document.getElementById("popup-close-cart");
const addToCartLabel = document.getElementById("add-to-cart-label");
const showProfileAddToCartBtn = document.getElementById("show-profile-add-to-cart-btn");
const showProfileAddToCartLabel = document.getElementById("show-profile-add-to-cart-label");

var bodyAuth = document.body.getAttribute('data-user-auth');
var bodyUnauth = document.body.getAttribute('data-user-unauth');

showProductsContainer.style.display = "none";
profileProductGrid.removeChild(profileProductDefault);
let currentProductId = null;
let isFavorite

const editProfileDivBtn = document.getElementById('edit-profile-div-btn');

document.querySelectorAll(".remove-profile-div-btn").forEach(btn => {
  btn.style.display = "none";
});

document.querySelectorAll(".remove-collection-products-btn").forEach(btn => {
  btn.style.display = "none";
});


editProfileDivBtn.addEventListener("click", () => {
  if (editProfileDivBtn.textContent === "Edit List") {
    editProfileDivBtn.textContent = "Done";
	    
    document.querySelectorAll('.remove-profile-div-btn').forEach(btn => {
      btn.style.display = "block";
    });

    document.querySelectorAll('.profile-card').forEach(card => {
      card.querySelector('#new-search').style.pointerEvents = 'none';
      card.querySelector('#show-products').style.pointerEvents = 'none';
    }); 
	    
  } else if (editProfileDivBtn.textContent === "Done") {
    editProfileDivBtn.textContent = "Edit List";
	    
    document.querySelectorAll('.remove-profile-div-btn').forEach(btn => {
      btn.style.display = "none";
    });

    document.querySelectorAll('.profile-card').forEach(card => {
      card.querySelector('#new-search').style.pointerEvents = '';
      card.querySelector('#show-products').style.pointerEvents = '';
    });
  }	
});


cartPopupContainer.style.display = 'none';

popupCloseCart.addEventListener('click', (event) => {
  cartPopupContainer.style.display = 'none';
});

const cartCardTemplate = document.querySelector('.cart-card');
const addExpressDelivery = document.getElementById('add-express-delivery');
let totalAmount = 0;
let additionalCharge = 14.99;

cartIconBtn.addEventListener('click', (event) => {
  totalAmount = 0;
  addExpressDelivery.textContent = "+";
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    if (user) {
      const userId = user.uid;
      const deliveryCheckbox = document.getElementById('expressDelivery');
	    
      firebase.firestore().collection('users').doc(userId).get()
      .then((doc) => {
        cartGrid.innerHTML = "";

        if (doc.exists) {
          const data = doc.data();
          const cart = data.cart || [];

          const promises = cart.map(async (product) => {
            const cartCard = cartCardTemplate.cloneNode(true);

            cartCard.querySelector('#cart-product-name').textContent = product.productId;

            try {
              const querySnapshot = await firebase.firestore().collection('added-by-parsing').where("name", "==", product.productId).get();
              if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                const productPrice = data.price;
		cartCard.querySelector('#quantity-product-text').textContent = product.quantity || 1;
		      
		// Update total amount
                totalAmount += productPrice * (product.quantity || 1);
		      
                cartCard.querySelector('#cart-product-price').textContent = "$" + productPrice;
		cartCard.querySelector('#cart-product-desc').textContent = data.description;
              } else {
                console.log("Document not found");
              }
            } catch (error) {
              console.error("Error getting document:", error);
            }

            cartGrid.appendChild(cartCard);

	    const currentQuantityElement = cartCard.querySelector('#quantity-product-text');
	    let currentQuantity = parseInt(currentQuantityElement.textContent);

	    cartCard.querySelector("#plus-btn").addEventListener('click', async (event) => {

  	      // Increase quantity by one
  	      currentQuantity += 1;
  	      currentQuantityElement.textContent = currentQuantity;

  	      // Update the total price
  	      const productPrice = parseFloat(cartCard.querySelector('#cart-product-price').textContent.replace('$', ''));
  	      totalAmount += productPrice;

	      // Update the quantity in the user's cart field
  	      const productId = cartCard.querySelector('#cart-product-name').textContent;
  	      await updateCartItemQuantity(userId, productId, currentQuantity);

  	      updateSubtotal(userId);
	      cartCard.querySelector("#minus-btn").classList.remove('disableBtn');
	    });

	    // Ensure the minimum quantity is 1
  	    if (currentQuantity > 1) {
	      cartCard.querySelector("#minus-btn").classList.remove('disableBtn');
	    } else {
	      cartCard.querySelector("#minus-btn").classList.add('disableBtn');
	    }

	    cartCard.querySelector("#minus-btn").addEventListener('click', async (event) => {

	      if (currentQuantity > 1) {
    	        // Decrease quantity by one
    	        currentQuantity -= 1;
    	        currentQuantityElement.textContent = currentQuantity;

    	        // Update the total price
    	        const productPrice = parseFloat(cartCard.querySelector('#cart-product-price').textContent.replace('$', ''));
    	        totalAmount -= productPrice;

	        // Update the quantity in the user's cart field
  	        const productId = cartCard.querySelector('#cart-product-name').textContent;
  	        await updateCartItemQuantity(userId, productId, currentQuantity);
		    
   	        updateSubtotal(userId);

		if (currentQuantity === 1) {
		  cartCard.querySelector("#minus-btn").classList.add('disableBtn');
		}
	      }
	    });

	    cartCard.querySelector("#delete-from-cart-btn").addEventListener('click', async (event) => {
  	      const productId = cartCard.querySelector('#cart-product-name').textContent;
  	      const productDesc = cartCard.querySelector('#cart-product-desc').textContent;

  	      try {
    	        // Get the user's cart
    	        const userDoc = await firebase.firestore().collection("users").doc(userId).get();
    	        if (userDoc.exists) {
      	          const userData = userDoc.data();
      		  let cart = userData.cart || [];

      	          // Find the index of the product to be removed in the cart
      		  const indexToRemove = cart.findIndex(item => item.productId === productId && item.productDesc === productDesc);

      		  if (indexToRemove !== -1) {
        	    // Remove the product from the local cart
        	    const removedItem = cart.splice(indexToRemove, 1)[0];

        	    // Update the total amount
        	    totalAmount -= (parseFloat(cartCard.querySelector('#cart-product-price').textContent.replace('$', '')) * removedItem.quantity);

        	    // Update the entire cart in the Firestore database
        	    await firebase.firestore().collection("users").doc(userId).update({
          	      cart: cart,
        	    });

        	    // Update the UI
        	    cartCard.style.display = 'none';
        	    updateSubtotal(userId);
      		  } else {
        	    console.log("Product not found in the cart");
      		  }
    	        } 
  	      } catch (error) {
    	        console.log("Error removing product from cart:", error);
  	      }
	    });
          });

          Promise.all(promises).then(() => {
	    updateSubtotal(userId);
            cartPopupContainer.style.display = 'flex';

	    addExpressDelivery.addEventListener('click', (event) => {
	      let isPlus = addExpressDelivery.textContent === "+";

	      if (isPlus) {
		totalAmount += additionalCharge;
		updateSubtotal(userId);
		addExpressDelivery.textContent = "–";
	      } else {
		totalAmount -= additionalCharge;
		updateSubtotal(userId);
		addExpressDelivery.textContent = "+";
	      }
		    
	    });
          });
        }
      })
      .catch((error) => {
        console.error("Error getting user document:", error);
      });

    } else {
      moveUnauthorizedToLogIn();
    }
  });
});

async function updateCartItemQuantity(userId, productId, quantity) {
  try {
    const userRef = firebase.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const cart = userData.cart || [];

      // Find the index of the product in the cart
      const index = cart.findIndex(item => item.productId === productId);

      if (index !== -1) {
        // Update the quantity for the product
        cart[index].quantity = quantity;

        // Update the user's cart field
        await userRef.update({ cart });
      }
    }
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
  }
}


const goToCheckoutBtn = document.getElementById('go-to-checkout-btn');
const cartNotification = document.getElementById('cart-notification-user');
const totalPriceText = document.getElementById('total-price-text');
const checkOutAlert = document.getElementById('check-out-alert');
const loaderCopy = document.getElementById('lottie-loader-copy');

loaderCopy.style.visibility = "hidden";

goToCheckoutBtn.addEventListener('click', async (event) => {
  if (!(parseFloat(totalPriceText.textContent.replace('$', '')) === 0)) {
    loaderCopy.style.visibility = "visible";

    // Generate a unique order ID using uuid
    const orderId = uuidv4();

    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const userId = user.uid;

        // Retrieve the user's cart
        const cartRef = firebase.firestore().collection('users').doc(userId);
        const cartSnapshot = await cartRef.get();
        const cartData = cartSnapshot.data();
        const cart = cartData.cart || []; // Ensure cart is defined

	const totalPrice = totalPriceText.textContent.replace('$', '');

        // Assuming you have access to the orderData at this point
        const orderData = {
          userId,
          orderId,
          totalPrice,
          expressDelivery: addExpressDelivery.textContent === "–",
          products: cart.map(product => ({
            productName: product.productId,
            quantity: product.quantity || 1,
          })),
        };

        // Add the order to the 'orders' collection
        await firebase.firestore().collection('orders').doc(orderId).set(orderData);

        console.log('Order created:', orderId);

        // Clear the user's cart after successfully creating the order
        await cartRef.update({
          cart: [],
        });
      }
    } catch (error) {
      console.error(`Error creating order: ${error.message}`);
    }
	  
    checkOut(parseFloat(totalPriceText.textContent.replace('$', '')), orderId);
  } else {
    checkOutAlert.textContent = "Choose some products to purchase first";
    checkOutAlert.style.display = 'block';
  }
});

async function checkOut(totalAmount, orderId) {
  try {
    const checkoutSessionRef = await firebase.firestore()
    .collection('customers')
    .doc(user.uid)
    .collection('checkout_sessions')
    .add({
      userId: user.uid,
      automatic_tax: true,
      shipping_address_collection: true,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            unit_amount: totalAmount * 100, // Stripe requires the amount in cents
            currency: 'usd',
	    tax_behavior: "exclusive",
            product_data: {
              name: 'Order #' + orderId,
            },
          },
          quantity: 1, // You can adjust the quantity as needed
        },
      ],
      mode: 'payment',
      success_url: "https://www.smappyai.com/order-success",
      cancel_url: "https://www.smappyai.com/recommendations",
    });

    checkoutSessionRef.onSnapshot((snap) => {
      const { error, url } = snap.data();
      if (error) {
        // Show an error to your customer and
        alert(`An error occured: ${error.message}`);
      } 
      if (url) {
        // We have a Stripe Checkout URL, let's redirect.
        window.location.assign(url);
      }
    });
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}

function checkForProductsInCart() {
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    if (user) {
      const userId = user.uid;

      firebase.firestore().collection('users').doc(userId).get()
      .then((doc) => {
	const data = doc.data();
	const cart = data.cart || [];

	if (cart.length === 0) {
	  cartIconBtn.classList.add('disableBtn');
	  cartNotification.style.display = 'none';
	} else {
	  cartIconBtn.classList.remove('disableBtn');
	  cartNotification.style.display = 'block';
	}
      });
      
    }
  });
}

// Function to update the subtotal element
function updateSubtotal(userId) {
  const subtotalPriceElement = document.getElementById('subtotal-price');
  let feeRate = 1.12;

  // Calculate subtotal
  let subtotal = totalAmount.toFixed(2);

  // Check subscription status
  firebase.firestore().collection('users').doc(userId).get()
  .then((userDoc) => {
    const subscriptionStatus = userDoc.data().subscriptionStatus;

    // If subscription is active, adjust subtotal with a different tax rate
    if (subscriptionStatus === 'active') {
      feeRate = 1.06;
    }

    // Update subtotal element
    subtotalPriceElement.textContent = "$" + subtotal;
    totalPriceText.textContent = "$" + (subtotal * feeRate).toFixed(2);
  })
  .catch((error) => {
    console.error("Error getting user document:", error);
  });
}

function toggleCart(element, userId, productId, productDesc) {
  const isInCart = element.textContent === "Remove from Cart";

  if (isInCart) {
    firebase.firestore().collection("users").doc(userId).update({
    cart: firebase.firestore.FieldValue.arrayRemove({ productId, productDesc })
    })
    .then(() => {
      element.textContent = "Add to Cart";
    })
    .catch(error => {
      console.log("Error removing product from cart:", error);
    });
  } else {
    firebase.firestore().collection("users").doc(userId).update({
      cart: firebase.firestore.FieldValue.arrayUnion({ productId, productDesc })
    })
    .then(() => {
      element.textContent = "Remove from Cart";
    })
    .catch(error => {
      console.log("Error adding product to cart:", error);
    });
   }
}

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
     profile.querySelector(".profile-id").textContent = data.profileId;

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

     profile.querySelector(".remove-profile-div-btn").addEventListener('click', (event) => {
       firebase.auth().onAuthStateChanged(function(authUser) {
         user = authUser;
         if (user) {
           const userId = user.uid; 
           removeProfile(userId, profile.querySelector(".profile-id").textContent);
	   profile.style.display = 'none';
	 } else {
	   moveUnauthorizedToLogIn();
	 }
       });
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

function removeProfile(userId, profileId) {
  const userDocRef = firebase.firestore().collection('users').doc(userId);

  // Fetch the user document to get the current collections array
  userDocRef.get().then((doc) => {
    if (doc.exists) {
      const userData = doc.data();
      const profiles = userData.profiles || [];

      // Find the index of the collection with the given name
      const profileIndex = profiles.findIndex(profile => profile.profileId === profileId);

      if (profileIndex !== -1) {
        // Collection with the given name exists, update it with new data
        profiles.splice(profileIndex, 1); // Remove the collection at the found index

        // Update the user document with the modified collections array
        userDocRef.update({
          profiles: profiles
        });
      } else {
        // Collection with the given name doesn't exist
        console.error("Profile not found:", profileId);
      }
    } else {
      // Handle the case where the user document doesn't exist
      console.error("User document not found");
    }
  }).catch((error) => {
    console.error("Error getting user document:", error);
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
      const productDesc = productData.description;

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

	  const cart = doc.data().cart;
          const isInCart = cart.some(item => item.productId === productId && item.productDesc === productDesc);

          if (isInCart) {
            showProfileAddToCartLabel.textContent = "Remove from Cart";
          } else {
            showProfileAddToCartLabel.textContent = "Add to Cart";
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

showProfileAddToCartBtn.addEventListener("click", () => {
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    if (user) {
      const userId = user.uid;
      toggleCart(showProfileAddToCartLabel, userId, profilePopupTitle.textContent, profilePopupDesc.textContent);
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
const defaultCollectionCover = "https://firebasestorage.googleapis.com/v0/b/smappy-ai.appspot.com/o/default-collection-cover_600x600.png?alt=media&token=9155ed41-888b-4e07-936e-9fe156da1120";

collectionPopupClose.addEventListener("click", () => {
  collectionPopupWindow.style.display = "none";
});

newCollectionClose.addEventListener("click", () => {
  setCollectionNameWindow.style.display = "none";
  collectionNameInput.value = '';
});

createCollectionBtn.addEventListener("click", () => {
  setCollectionNameWindow.style.display = "flex";
  checkInputForCollection();
});

editCollectionListBtn.addEventListener("click", () => {
  editButtonShowRemove(editCollectionListBtn, ".remove-collection-btn", ".collection-card", "#link-to-collection"); 
});

createNewCollectionBtn.addEventListener('click', async () => {
  const collectionName = collectionNameInput.value;

  let productName = '';

  if ((popupTitle.textContent === '') || (popupTitle.textContent === 'Heading')) {
    productName = profilePopupTitle.textContent;
  } else if ((profilePopupTitle.textContent === '') || (profilePopupTitle.textContent === 'Heading')) {
    productName = popupTitle.textContent;
  }
	
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
	  collectionCard.querySelector("#collection-id").textContent = collection.collectionId;

	  if (collection.products.length > 0) {
	    collectionCard.querySelector("#cover-collection").src = collection.products[0].productImage;
	  } else {
	    collectionCard.querySelector("#cover-collection").src = defaultCollectionCover;
	  }
        
	  collectionCard.querySelector("#remove-collection-btn").addEventListener("click", () => {
	    removeCollection(userId, collection.collectionId);
            collectionCard.style.display = 'none';
	  });

	  collectionCard.querySelector("#link-to-collection").addEventListener("click", () => {
	    addToCollection(userId, collectionCard.querySelector("#collection-id").textContent, collectionCard.querySelector("#collection-name").textContent, productId, productImage);
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

function removeCollection(userId, collectionId) {
  const userDocRef = firebase.firestore().collection('users').doc(userId);

  // Fetch the user document to get the current collections array
  userDocRef.get().then((doc) => {
    if (doc.exists) {
      const userData = doc.data();
      const collections = userData.collections || [];

      // Find the index of the collection with the given name
      const collectionIndex = collections.findIndex(collection => collection.collectionId === collectionId);

      if (collectionIndex !== -1) {
        // Collection with the given name exists, update it with new data
        collections.splice(collectionIndex, 1); // Remove the collection at the found index

        // Update the user document with the modified collections array
        userDocRef.update({
          collections: collections
        });
      } else {
        // Collection with the given name doesn't exist
        console.error("Collection not found:", collectionId);
      }
    } else {
      // Handle the case where the user document doesn't exist
      console.error("User document not found");
    }
  }).catch((error) => {
    console.error("Error getting user document:", error);
  });
}

const productExistsError = document.getElementById('product-exists-error');
productExistsError.style.display = 'none';


function addToCollection(userId, collectionId, collectionName, productId, productImage) {
  const userDocRef = firebase.firestore().collection('users').doc(userId);

  firebase.firestore().runTransaction(transaction => {
    return transaction.get(userDocRef).then(userDoc => {
      if (!userDoc.exists) {
        console.error("User document not found");
        return;
      }

      const userData = userDoc.data();
      const collections = userData.collections || [];

      // Find the index of the collection with the given collectionId
      const collectionIndex = collections.findIndex(collection => collection.collectionId === collectionId);

      if (collectionIndex !== -1) {
        // Collection with the given collectionId exists
        const existingProducts = collections[collectionIndex].products;
        
        // Check if the product with productId already exists in the collection
        const productExists = existingProducts.some(product => product.productId === productId);

        if (!productExists) {
          // Product is not in the collection, add it
          collections[collectionIndex].products.push({ productId, productImage });

          // Update the user document with the modified collections array
          transaction.update(userDocRef, {
            collections: collections
          });

	  collectionPopupWindow.style.display = "none";
		
        } else {
    	  productExistsError.style.display = 'block';

	  setTimeout(() => {
  	    productExistsError.style.display = 'none';
	  }, 5000);
        }
      } else {
        // Collection with the given collectionId doesn't exist
        console.error("Collection not found:", collectionId);
      }
    });
  }).catch(error => {
    console.error("Error updating user document:", error);
  });
}


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function checkInputForCollection() {
  createNewCollectionBtn.classList.add('disableBtn');

  collectionNameInput.addEventListener('input', (event) => {
    createNewCollectionBtn.classList.remove('disableBtn');
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
	    collectionId: uuidv4(),
            name: collectionName,
            products: [{ productId, productImage }]
          }]
        });
      } else {
        // If it exists, append the new collection structure using arrayUnion
        userDocRef.update({
          collections: firebase.firestore.FieldValue.arrayUnion({
	    collectionId: uuidv4(),
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
  const productDesc = productData.description;

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

      const cart = doc.data().cart;
      const isInCart = cart.some(item => item.productId === productId && item.productDesc === productDesc);

      if (isInCart) {
        addToCartLabel.textContent = "Remove from Cart";
      } else {
        addToCartLabel.textContent = "Add to Cart";
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

addToCartBtn.addEventListener('click', () => {
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    if (user) {
      const userId = user.uid;
      toggleCart(addToCartLabel, userId, popupTitle.textContent, popupDesc.textContent);
      checkForProductsInCart();
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


// Part about Collections

const collectionsGrid = document.getElementById('collections-grid');
const noCollectionsDefault = document.getElementById('no-collections-default');
const collectionDivCardTemplate = document.querySelector('.collection-div-card');
const editCollectionDivBtn = document.getElementById('edit-collection-div-btn');

editCollectionDivBtn.addEventListener("click", () => {
  editButtonShowRemove(editCollectionDivBtn, ".remove-collection-div-btn", ".collection-div-card", "#link-to-collection-btn");
});

function editButtonShowRemove(editCollectionDivBtn, removeButtonSelector, cardSelector, linkButtonSelector) {
  if (editCollectionDivBtn.textContent === "Edit List") {
    editCollectionDivBtn.textContent = "Done";
	    
    document.querySelectorAll(removeButtonSelector).forEach(btn => {
      btn.style.display = "block";
    });

    document.querySelectorAll(cardSelector).forEach(card => {
      card.querySelector(linkButtonSelector).style.pointerEvents = 'none';
      card.classList.remove('donate');
    }); 
	    
  } else if (editCollectionDivBtn.textContent === "Done") {
    editCollectionDivBtn.textContent = "Edit List";
	    
    document.querySelectorAll(removeButtonSelector).forEach(btn => {
      btn.style.display = "none";
    });

    document.querySelectorAll(cardSelector).forEach(card => {
      card.querySelector(linkButtonSelector).style.pointerEvents = '';
      card.classList.add('donate');
    });
  }	
}

const showCollectionPopupContainer = document.getElementById('show-collection-popup-container');
showCollectionPopupContainer.style.display = 'none';

function collectionsDivFunc() {

  document.querySelectorAll(".remove-collection-div-btn").forEach(btn => {
    btn.style.display = "none";
  });

  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    const userId = user.uid;

    firebase.firestore().collection('users').doc(userId).get()
    .then((doc) => {
      collectionsGrid.innerHTML = "";

      if (doc.exists) {
        const data = doc.data();
        const collections = data.collections || [];

	if (collections.length === 0) {
    	  noCollectionsDefault.style.display = "block";
  	} else {
    	  noCollectionsDefault.style.display = "none";
  	}

        collections.forEach(async (collection) => {
          const collectionCard = collectionDivCardTemplate.cloneNode(true);

	  collectionCard.querySelector("#collection-div-card-name").textContent = collection.name;
	  collectionCard.querySelector("#collection-id-main").textContent = collection.collectionId;

	  if (collection.products.length > 0) {
	    collectionCard.querySelector("#collection-div-cover-image").src = collection.products[0].productImage;
	  } else {
	    collectionCard.querySelector("#collection-div-cover-image").src = defaultCollectionCover;
	  }
        
	  collectionCard.querySelector("#remove-collection-div-btn").addEventListener("click", () => {
	    removeCollection(userId, collection.collectionId);
            collectionCard.style.display = 'none';
	  });

	  collectionCard.querySelector("#link-to-collection-btn").addEventListener("click", () => {
	    showCollectionProductsGrid.innerHTML = "";
	    loadShowProductsOfCollection(collectionCard.querySelector("#collection-id-main").textContent, collectionCard.querySelector("#collection-div-card-name").textContent);
	    showCollectionPopupContainer.style.display = 'flex';
	  });

          collectionsGrid.appendChild(collectionCard);
        });
	      
      } else {
        console.error("User document not found");
      }
    })
    .catch((error) => {
      console.error("Error loading collections:", error);
    });

  });
}

const popupCloseCollection = document.getElementById('popup-close-collection');
const showCollectionProductsGrid = document.getElementById('show-collection-products-grid');
const profileCollectionProductTemplate = document.getElementById('profile-collection-product-template');
const shareTheCollectionBtn = document.getElementById('share-the-collection-btn');

function loadShowProductsOfCollection(collectionId, collectionName) {
  document.getElementById('collection-popup-name').textContent = collectionName;
	
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    const userId = user.uid;

    firebase.firestore().collection('users').doc(userId).get()
    .then((doc) => {

      if (doc.exists) {
        const data = doc.data();
        const collections = data.collections || [];

	// Find the selected collection by name
        const selectedCollection = collections.find(collection => collection.collectionId === collectionId);

	if (selectedCollection) {
          const products = selectedCollection.products || [];

          products.forEach(product => {
	    const queryParams = products.map(product => `productId=${encodeURIComponent(product.productId)}&productImage=${encodeURIComponent(product.productImage)}`).join('&');

            const productCollectionCard = profileCollectionProductTemplate.cloneNode(true);
            
	    productCollectionCard.querySelector('#profile-product-collection-grid-name').textContent = product.productId;
	    productCollectionCard.querySelector('#profile-collection-product-image').src = product.productImage;

            showCollectionProductsGrid.appendChild(productCollectionCard);

	    shareTheCollectionBtn.addEventListener('click', () => {
              const collectionUrl = `/collection?collectionId=${encodeURIComponent(collectionId)}&collectionName=${encodeURIComponent(collectionName)}&userEmail=${encodeURIComponent(user.email)}&${queryParams}`;
              window.location.href = collectionUrl;
            });

	    productCollectionCard.querySelector('#collection-product-link').addEventListener('click', (event) => {
	      showPopupForProfileProducts(productCollectionCard.querySelector('#profile-product-collection-grid-name').textContent, userId);
            });

	    productCollectionCard.querySelector('#remove-collection-products-btn').addEventListener('click', (event) => {
	      removeProductFromCollection(userId, collectionId, productCollectionCard.querySelector('#profile-product-collection-grid-name').textContent);
	      productCollectionCard.style.display = 'none';
	    });
          });
        } else {
          console.error("Selected collection not found");
        }
	
      } else {
        console.error("User document not found");
      }
    });
  });
}

popupCloseCollection.addEventListener("click", () => {
  document.querySelectorAll('#profile-product-collection-grid-name').textContent = '';
  document.querySelectorAll('#profile-collection-product-image').src = '';
  showCollectionPopupContainer.style.display = 'none';
});

const editProductsBtn = document.getElementById('edit-products-btn');

editProductsBtn.addEventListener("click", () => {
  if (editProductsBtn.textContent === "Edit Products") {
    editProductsBtn.textContent = "Done";
	    
    document.querySelectorAll('#remove-collection-products-btn').forEach(btn => {
      btn.style.display = "block";
    });

    document.querySelectorAll('.profile-collection-product-template').forEach(card => {
      card.querySelector('#collection-product-link').style.pointerEvents = 'none';
      card.classList.remove('donate');
    }); 

    shareTheCollectionBtn.style.pointerEvents = 'none';
	    
  } else if (editProductsBtn.textContent === "Done") {
    editProductsBtn.textContent = "Edit Products";
	    
    document.querySelectorAll('#remove-collection-products-btn').forEach(btn => {
      btn.style.display = "none";
    });

    document.querySelectorAll('.profile-collection-product-template').forEach(card => {
      card.querySelector('#collection-product-link').style.pointerEvents = '';
      card.classList.add('donate');
    }); 
	  
    shareTheCollectionBtn.style.pointerEvents = '';
  }
});

function removeProductFromCollection(userId, collectionId, productId) {
  const userDocRef = firebase.firestore().collection('users').doc(userId);

  firebase.firestore().runTransaction(transaction => {
    return transaction.get(userDocRef).then(userDoc => {
      if (!userDoc.exists) {
        console.error("User document not found");
        return;
      }

      const userData = userDoc.data();
      const collections = userData.collections || [];

      // Find the index of the collection with the given ID
      const collectionIndex = collections.findIndex(collection => collection.collectionId === collectionId);

      if (collectionIndex !== -1) {
        // Collection with the given ID exists, update it by removing the product with the specified ID
        const products = collections[collectionIndex].products || [];
        const productIndex = products.findIndex(product => product.productId === productId);

        if (productIndex !== -1) {
          // Product with the specified ID exists in the collection, remove it
          products.splice(productIndex, 1);

          // Update the user document with the modified collections array
          transaction.update(userDocRef, {
            collections: collections
          });
        } else {
          console.error("Product not found in the collection");
        }
      } else {
        console.error("Collection not found");
      }
    });
  }).catch(error => {
    console.error("Error updating user document:", error);
  });
}





