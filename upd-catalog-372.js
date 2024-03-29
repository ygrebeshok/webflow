const output = document.getElementById("output");
const mainButton = document.getElementById("toGifts");
const linkInput = document.getElementById("link-container");
const results = document.getElementById("recommendations");
const sorry = document.getElementById("sorry");
const input = document.getElementById("input");
const priceButton = document.getElementById("price-button");
const lottieLoader = document.getElementById("lottie-loader");
const searchAgain = document.getElementById("search-again");
const openaiRec = document.getElementById("openai-rec");
const priceFilterContainer = document.getElementById("price-filter-container");
const holidayGrid = document.getElementById("holiday-grid");
const holidayTemplate = document.querySelector(".birthday");
const whoTemplate = document.querySelector(".who");
const brandFilterContainer = document.getElementById("brand-filter");
const lowestPriceButton = document.getElementById('lowestPrice');
const highestPriceButton = document.getElementById('highestPrice');
const filtersContainer = document.getElementById("filters-container");
const closeFilters = document.getElementById("close-filters");
const filterActivator = document.getElementById("filter-activator");
const popupTitle = document.getElementById('popup_title');
const popupBrand = document.getElementById('popup_brand');
const popupDesc = document.getElementById('popup_desc');
const popupPrice = document.getElementById('popup_price');
const quickLook = document.getElementById('quick_look');
const popupContainer = document.getElementById('popup-fade');
const popupClose = document.getElementById('popup-close');
const popupFavoriteBtn = document.getElementById("look-fav-btn");
let selWho = document.getElementById("sel-who");
let selHoliday = document.getElementById("sel-holiday");
const favoritesLabel = document.getElementById("favorites-label");
const likeBtn = document.getElementById("like-button");
const likeImage = document.getElementById("image-like");
const dislikeBtn = document.getElementById("dislike-button");
const dislikeImage = document.getElementById("image-dislike");
const profileName = document.getElementById("profile-name");
const profileAge = document.getElementById("profile-age");
const createProfile = document.getElementById("create-profile");
const created = document.getElementById("created-text");
const resetSelections = document.getElementById("reset-selections");
const holidayBack = document.getElementById("holiday-back");
let selected_holiday = null;
let selected_who = null;
let selected_category = null;
let selected_sub_category = null;
let categoryFilter = null;
let subCategoryFilter = null
let visibleCards = [];
const catalogGrid = document.getElementById("catalog");
const cardTemplate = document.querySelector(".card");
const addToCartBtn = document.getElementById("add-to-cart-btn");
const cartGrid = document.getElementById("cart-grid");
const cartIconBtn = document.getElementById("cart-icon-btn");
const cartPopupContainer = document.getElementById("cart-popup-container");
const popupCloseCart = document.getElementById("popup-close-cart");

const age_personality = document.getElementById("age-personality");
const errorAlert = document.getElementById("error-alert");
const ageAlert = document.getElementById("age-alert");
const ageField = document.getElementById("age-field");
const personalitySelect = document.getElementById("personality-select");

let currentPage = 1;
let totalDisplayedItems = 0;
const itemsPerPage = 50;
const itemsToAdd = 50;
const loadMoreButton = document.getElementById('load-more');
const holidayPopupContainer = document.getElementById("holiday-popup-container");

const productExistsError = document.getElementById('product-exists-error');
productExistsError.style.display = 'none';
cartPopupContainer.style.display = 'none';
holidayPopupContainer.style.display = 'none';

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

	      cartCard.querySelector("#minus-btn").classList.remove('disablegrid');
	    });

	    // Ensure the minimum quantity is 1
  	    if (currentQuantity > 1) {
	      cartCard.querySelector("#minus-btn").classList.remove('disablegrid');
	    } else {
	      cartCard.querySelector("#minus-btn").classList.add('disablegrid');
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
		  cartCard.querySelector("#minus-btn").classList.add('disablegrid');
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
const cartNotification = document.getElementById('cart-notification');
const totalPriceText = document.getElementById('total-price-text');
const checkOutAlert = document.getElementById('check-out-alert');
const loaderCopy = document.getElementById('lottie-loader-copy');

loaderCopy.style.visibility = "hidden";

goToCheckoutBtn.addEventListener('click', async (event) => {
  if (!(parseFloat(totalPriceText.textContent.replace('$', '')) < 20)) {
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
    checkOutAlert.textContent = "Minimum order price is $20";
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
      success_url: "https://www.smappyai.com/recommendations",
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
	  cartIconBtn.classList.add('disablegrid');
	  cartNotification.style.display = 'none';
	} else {
	  cartIconBtn.classList.remove('disablegrid');
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


ageField.addEventListener('input', (event) => {
  profileAge.value = ageField.value;
});

function showPage() {
  const gridItems = Array.from(catalogGrid.children);

  for (let i = 0; i < gridItems.length; i++) {
    if (i < totalDisplayedItems + itemsToAdd) {
      gridItems[i].style.display = 'flex';
      gridItems[i].style.opacity = '1'; // Reset opacity when displaying
    } else {
      gridItems[i].style.display = 'none';
    }
  }

  totalDisplayedItems += itemsToAdd; // Update the total displayed items
}

loadMoreButton.addEventListener('click', function() {
  currentPage++;
  showPage();
});

document.addEventListener('DOMContentLoaded', function() {
	
  const urlParams = new URLSearchParams(window.location.search);
  const sel_who = urlParams.get('selected_who');
  const sel_holiday = urlParams.get('selected_holiday');
  const profile_age = urlParams.get('profile_age');
  const gift_desc = urlParams.get('gift_desc');

  document.getElementById("textarea").value = gift_desc;
  ageField.value = profile_age;
  
  if (textarea.value.trim() !== '') {
    checkInputs();
  } else {
    document.getElementById("button-container").classList.add('disablegrid');
    mainButton.classList.add('disablegrid');
  }

  selected_who = sel_who || null;
  selected_holiday = sel_holiday || null;

  selWho.textContent = selected_who;
  selHoliday.textContent = selected_holiday;

  return { selected_who, selected_holiday };
});
	
resetSelections.addEventListener('click', () => {
  selected_who = null;
  selected_holiday = null;
  selWho.textContent = "";
  selHoliday.textContent = "";
  personalitySelect.value = "";
  ageField.value = "";
	
  holidayGrid.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('focus');
  });
  familyGrid.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('focus');
  });
  secondHalfGrid.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('focus');
  });
  genderGrid.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('focus');
  });
  petsGrid.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('focus');
  });
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

createProfile.addEventListener('click', () => {
  moveUnauthorizedToLogIn();
	
  if (checkboxHoliday.checked === true) {
    selected_holiday = customHoliday.value;
  }

  const profileData = {
    profileId: uuidv4(),
    profile_name: profileName.value,
    profile_age: ageField.value || profileAge.value,
    receiver: selected_who || "",
    occasion: selected_holiday,
    gift_desc: document.getElementById("textarea").value,
    date: profileDate.value || "",
    recommended_products: []
  };

  visibleCards.forEach(card => {
    const productName = card.querySelector("#name").textContent;
    const productImage = card.querySelector("#product_image").src;
    const nameImage = [productName, productImage];
    profileData.recommended_products.push(JSON.stringify(nameImage));
  });

  const user = firebase.auth().currentUser;
  const userId = user.uid;
  const userDocRef = firebase.firestore().collection('users').doc(userId);

  firebase.firestore().runTransaction(transaction => {
    return transaction.get(userDocRef).then(userDoc => {

      const profiles = userDoc.data().profiles || [];
      const updatedProfiles = [...profiles, profileData];

      transaction.update(userDocRef, {
        profiles: updatedProfiles
      });
    });
  })
  .then(() => {
    created.textContent = "Profile Created!"
    profileName.textContent = "";
    profileAge.value = "";
    customHoliday.textContent = "Tap on Holiday Panel";
    profileDate.value = "";
    profileArea.classList.remove('move-right');
  })
  .catch(error => {
    created.textContent = "Error Occurred on Profile Creation";
      console.log(error);
  });
});

lowestPriceButton.addEventListener("click", () => {
  lowestPriceButton.classList.add('button-selected');
  highestPriceButton.classList.remove('button-selected');
  
  // Sort visibleCards by price in ascending order
  allCards.sort((cardA, cardB) => {
    const priceA = parseFloat(cardA.querySelector("#price").textContent.replace("$", ""));
    const priceB = parseFloat(cardB.querySelector("#price").textContent.replace("$", ""));
    return priceA - priceB;
  });

  // Then re-render the catalog
  filterCatalog();
});

highestPriceButton.addEventListener("click", () => {
  highestPriceButton.classList.add('button-selected');
  lowestPriceButton.classList.remove('button-selected');
  
  // Sort visibleCards by price in descending order
  allCards.sort((cardA, cardB) => {
    const priceA = parseFloat(cardA.querySelector("#price").textContent.replace("$", ""));
    const priceB = parseFloat(cardB.querySelector("#price").textContent.replace("$", ""));
    return priceB - priceA;
  });

  // Then re-render the catalog
  filterCatalog();
});

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
const linkButton = document.getElementById('link-button');

collectionPopupClose.addEventListener("click", () => {
  collectionPopupWindow.style.display = "none";
});

newCollectionClose.addEventListener("click", () => {
  setCollectionNameWindow.style.display = "none";
});

createCollectionBtn.addEventListener("click", () => {
  setCollectionNameWindow.style.display = "flex";
  checkInputForCollection();
});

const noCollectionsImage = document.getElementById('no-collections-image');

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

  try {
    const querySnapshot = await firebase.firestore().collection('added-by-parsing').where("name", "==", popupTitle.textContent).get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const productImage = data.images[0];

      const authUser = firebase.auth().currentUser;
      
      if (authUser) {
        const userId = authUser.uid;
        try {
          await createNewCollection(userId, collectionName, popupTitle.textContent, productImage);
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

const addToCartLabel = document.getElementById("add-to-cart-label");

function showPopup(productData) {
  const slideContainer = document.querySelector('.slides');
  const thumbnailContainer = document.querySelector('.thumbnails');
  slideContainer.innerHTML = ''; // Clear existing slides
  thumbnailContainer.innerHTML = ''; // Clear existing thumbnails
	
  popupTitle.textContent = productData.name;
  popupBrand.textContent = productData.brand;
  popupDesc.textContent = productData.description;
  popupPrice.textContent = `$${productData.price}`;

  const user = firebase.auth().currentUser;
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
  });
	
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

  function populateBrandFilter(brands) {
    // Clear existing brand filters
    while (brandFilterContainer.firstChild) {
      brandFilterContainer.removeChild(brandFilterContainer.firstChild);
    }

  brands.forEach((brand) => {
    var label = document.createElement('label');
    label.className = 'brand-checkbox-label';  // Add this line
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = brand;
    checkbox.id = 'brand-' + brand;
    checkbox.className = 'brand-checkbox';  // Add this line

    checkbox.addEventListener('change', function() {
      handleBrandCheckboxChange(this);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(brand));

    brandFilterContainer.appendChild(label);
    brandFilterContainer.appendChild(document.createElement('br'));
  });
}

popupFavoriteBtn.addEventListener('click', () => {
  firebase.auth().onAuthStateChanged(function(authUser) {
    user = authUser;
    if (user) {
      const userId = user.uid;
      toggleFavorite(favoritesLabel, userId, popupTitle.textContent);
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

linkButton.addEventListener("click", () => {
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

popupClose.addEventListener("click", () => {
  popupContainer.style.display = "none";
  popupTitle.textContent = '';
  popupBrand.textContent = '';
  popupDesc.textContent = '';
  popupPrice.textContent = '';
});


let brandFilters = [];
let priceRange;
let priceRangeInitialized = false;
let allCards = [];

function handleBrandCheckboxChange(checkbox) {
  if (checkbox.checked) {
    // Add brand to filter
    brandFilters.push(checkbox.value);
  } else {
    // Remove brand from filter
    const index = brandFilters.indexOf(checkbox.value);
    if (index > -1) {
      brandFilters.splice(index, 1);
    }
  }

  // Filter the catalog whenever a brand checkbox changes
  filterCatalog();
  resetCategories.classList.remove('disablegrid');
}

function handleCategoryChange(category, sub_category) {
  categoryFilter = category; // Update category filter
  subCategoryFilter = sub_category;
  filterCatalog();
}

function filterCatalog() {
  const minPrice = 0;
  const maxPrice = parseInt(priceRange.value);
  const priceDisplay = document.getElementById("price-display");
  priceDisplay.textContent = `$${minPrice} - $${maxPrice}`;

  let visibleCards;

  resetCategories.classList.remove('disablegrid');

  if (brandFilters.length === 0) {
    visibleCards = allCards;
  } else {
    visibleCards = allCards.filter(card => {
      const brand = card.querySelector("#brand").textContent;
      return brandFilters.includes(brand);
    });
  }

  if (categoryFilter !== null) {
    visibleCards = visibleCards.filter(card => {
      const cardCategory = card.querySelector("#category").textContent;
      return cardCategory === categoryFilter;
    });
  }

  if (subCategoryFilter !== null) {
    visibleCards = visibleCards.filter(card => {
      const cardSubCategory = card.querySelector("#sub-category").textContent;
      return cardSubCategory === subCategoryFilter;
    });
  }

  visibleCards = visibleCards.filter(card => {
    const price = parseFloat(card.querySelector("#price").textContent.replace("$", ""));
    return price >= minPrice && price <= maxPrice;
  });

  catalogGrid.innerHTML = "";
  visibleCards.forEach(card => {
    card.style.opacity = 0;
    catalogGrid.appendChild(card);

    setTimeout(() => {
      card.style.transition = "opacity 0.5s";
      card.style.opacity = 1;
    }, 0);
  });
}

function updateCatalog() {
  var brandsSet = new Set();

  giftsRef.get().then((querySnapshot) => {
    catalogGrid.innerHTML = "";
    allCards = [];
      
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.brand) {
        brandsSet.add(data.brand);
      }
            
      const card = cardTemplate.cloneNode(true);
	    
      card.querySelector("#product_image").src = data.images[0],
      card.querySelector("#name").textContent = data.name,
      card.querySelector("#price").textContent = `$${data.price}`,
      card.querySelector("#description").textContent = data.description,
      card.querySelector("#keywords").textContent = data.all_keywords,
      card.querySelector("#brand").textContent = data.brand,
      card.querySelector("#category").textContent = data.product_category,
      card.querySelector("#sub-category").textContent = data.sub_category,
      card.querySelector("#age-category").textContent = data.age,
      card.querySelector("#subject-category").textContent = data.subject_category

      allCards.push(card);

      const productId = card.querySelector("#name").textContent;
      const user = firebase.auth().currentUser;

      const quickLookBtn = card.querySelector("#quick_look");
      quickLookBtn.addEventListener("click", () => {
	let productData = {
	  images: [],
	  name: '',
	  brand: '',
	  description: '',
	  product_link: '',
	  price: ''
	};
		
	productData = {
	  images: data.images,
	  name: card.querySelector("#name").textContent,
	  brand: card.querySelector("#brand").textContent,
	  description: card.querySelector("#description").textContent,
	  product_link: data.product_link,
	  price: card.querySelector("#price").textContent.replace("$", "")
	};
	showPopup(productData);
      });

      const likeBtn = card.querySelector("#like-button");
      const dislikeBtn = card.querySelector("#dislike-button");
      const likeImage = card.querySelector("#image-like");
      const dislikeImage = card.querySelector("#image-dislike");

      if (user) {
        const userId = user.uid;      
        firebase.firestore().collection("users").doc(userId).get()
        .then(doc => {
    	  const liked = doc.data().liked;
    	  const isLiked = liked.some(product => product.productId === productId);

    	  if (isLiked) {
      	    likeImage.src = "https://uploads-ssl.webflow.com/63754b30fc1fcb22c75e7cb3/64fd42aa4c01d1a2dce1f72d_like.png";
    	  } else {
      	    likeImage.src = "https://uploads-ssl.webflow.com/63754b30fc1fcb22c75e7cb3/64fd1f04f9318a593c1544e8_like%20unfilled.png";
    	  }
        })
        .catch(error => {
    	  console.log("Error getting liked:", error);
        });

        firebase.firestore().collection("users").doc(userId).get()
        .then(doc => {
      	  const disliked = doc.data().disliked;
	  const isDisliked = disliked.some(product => product.productId === productId);

	  if (isDisliked) {
      	    dislikeImage.src = "https://uploads-ssl.webflow.com/63754b30fc1fcb22c75e7cb3/64fd42a725f96a17e1984d22_dislike.png";
    	  } else {
            dislikeImage.src = "https://uploads-ssl.webflow.com/63754b30fc1fcb22c75e7cb3/64fd21004c01d1a2dccce5dc_dislike%20unfilled.png";
    	  }
        })
        .catch(error => {
          console.log("Error getting disliked:", error);
        });
      }

      likeBtn.addEventListener("click", () => {
	moveUnauthorizedToLogIn();
	if (user) {
	  const userId = user.uid;
	  toggleLike(likeImage, dislikeImage, userId, productId, selected_who, selected_holiday)
	}
      });

      dislikeBtn.addEventListener("click", () => {
	moveUnauthorizedToLogIn();
	if (user) {
	  const userId = user.uid;
	  toggleDislike(dislikeImage, likeImage, userId, productId, selected_who, selected_holiday)
	}
      });

      catalogGrid.appendChild(card);

      card.addEventListener('mouseenter', () => {
        card.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)' }
        ], {
        duration: 200,
        fill: 'forwards'
        });
      });

      card.addEventListener('mouseleave', () => {
        card.animate([
        { transform: 'scale(1.05)' },
        { transform: 'scale(1)' }
        ], {
        duration: 200,
        fill: 'forwards'
        });
        });
      });

      // Initially show the first page
      showPage();
	  
      var brands = Array.from(brandsSet); // add this line
      populateBrandFilter(brands);

      priceRange = document.getElementById("price-range");
    
      // This ensures that the filterCatalog function is only attached once.
      if (!priceRangeInitialized) {
        priceRange.addEventListener("input", filterCatalog);
        priceRangeInitialized = true;
      }
    });
  }

function moveUnauthorizedToLogIn() {
  firebase.auth().onAuthStateChanged(function(authUser) {
  user = authUser;

  if (user && bodyUnauth) {
    window.location.href = '/user';
  } else if (!user && bodyAuth) {
    window.location.href = '/log-in';
  }

    if (user) {
      const email = user.email;

      firebase.firestore().collection('users').where('email', '==', email).get()
      .then(function(querySnapshot) {
         if (querySnapshot.docs.length == 0) {
          firebase.auth().signOut().then(function() {
      	    user = null;
      	    window.location.href = 'sign-up';
   	  });
        }
      });
    }
  });
}

const filledLike = "https://uploads-ssl.webflow.com/63754b30fc1fcb22c75e7cb3/64fd42aa4c01d1a2dce1f72d_like.png";
const emptyLike = "https://uploads-ssl.webflow.com/63754b30fc1fcb22c75e7cb3/64fd1f04f9318a593c1544e8_like%20unfilled.png";

const filledDislike = "https://uploads-ssl.webflow.com/63754b30fc1fcb22c75e7cb3/64fd42a725f96a17e1984d22_dislike.png";
const emptyDislike = "https://uploads-ssl.webflow.com/63754b30fc1fcb22c75e7cb3/64fd21004c01d1a2dccce5dc_dislike%20unfilled.png";

function toggleLike(likeImage, dislikeImage, userId, productId, ref_category, occasion) {
  const isLiked = likeImage.src === filledLike;
  const isDisliked = dislikeImage.src === filledDislike;

  const userDocRef = firebase.firestore().collection("users").doc(userId);

  if (isLiked) {
    // Remove the product from liked and update ref_category and occasion
    firebase.firestore().runTransaction(transaction => {
      return transaction.get(userDocRef).then(userDoc => {
        if (!userDoc.exists) {
          throw "User does not exist!";
        }

        const likedArray = userDoc.data().liked || [];
        const updatedLiked = likedArray.filter(item => item.productId !== productId);

        // Update ref_category and occasion in the liked array
        const updatedRefCategory = updatedLiked.map(item => item.productId === productId ? { ...item, ref_category, occasion } : item);

        // Update the user document
        transaction.update(userDocRef, {
          liked: updatedRefCategory
        });

        likeImage.src = emptyLike;
      });
    })
    .catch(error => {
      console.log("Error removing from liked:", error);
    });
  } else {
    // Add the product to liked and update ref_category and occasion
    firebase.firestore().runTransaction(transaction => {
      return transaction.get(userDocRef).then(userDoc => {
        if (!userDoc.exists) {
          throw "User does not exist!";
        }

        const likedArray = userDoc.data().liked || [];
        const updatedLiked = [...likedArray, { productId, ref_category, occasion }];

        // Update the user document
        transaction.update(userDocRef, {
          liked: updatedLiked
        });

        likeImage.src = filledLike;

	// If the product was previously disliked, remove it from disliked
        if (isDisliked) {
	  firebase.firestore().runTransaction(transaction => {
            return transaction.get(userDocRef).then(userDoc => {

              const dislikedArray = userDoc.data().disliked || [];
              const updatedDisliked = dislikedArray.filter(item => item.productId !== productId);

              // Update ref_category and occasion in the disliked array
              const updatedRefCategory = updatedDisliked.map(item => item.productId === productId ? { ...item, ref_category, occasion } : item);

              // Update the user document
              transaction.update(userDocRef, {
                disliked: updatedRefCategory
              });

              dislikeImage.src = emptyDislike;
            });
          })
	}
      });
    })
    .catch(error => {
      console.log("Error adding liked:", error);
    });
  }
}


function toggleDislike(dislikeImage, likeImage, userId, productId, ref_category, occasion) {
  const isLiked = likeImage.src === filledLike;
  const isDisliked = dislikeImage.src === filledDislike;

  const userDocRef = firebase.firestore().collection("users").doc(userId);

  if (isDisliked) {
    // Remove the product from disliked and update ref_category and occasion
    firebase.firestore().runTransaction(transaction => {
      return transaction.get(userDocRef).then(userDoc => {
        if (!userDoc.exists) {
          throw "User does not exist!";
        }

        const dislikedArray = userDoc.data().disliked || [];
        const updatedDisliked = dislikedArray.filter(item => item.productId !== productId);

        // Update ref_category and occasion in the disliked array
        const updatedRefCategory = updatedDisliked.map(item => item.productId === productId ? { ...item, ref_category, occasion } : item);

        // Update the user document
        transaction.update(userDocRef, {
          disliked: updatedRefCategory
        });

        dislikeImage.src = emptyDislike;
      });
    })
    .catch(error => {
      console.log("Error removing from disliked:", error);
    });
  } else {
    // Add the product to disliked and update ref_category and occasion
    firebase.firestore().runTransaction(transaction => {
      return transaction.get(userDocRef).then(userDoc => {
        if (!userDoc.exists) {
          throw "User does not exist!";
        }

        const dislikedArray = userDoc.data().disliked || [];
        const updatedDisliked = [...dislikedArray, { productId, ref_category, occasion }];

        // Update the user document
        transaction.update(userDocRef, {
          disliked: updatedDisliked
        });

        dislikeImage.src = filledDislike;

        // If the product was previously liked, remove it from liked
        if (isLiked) {
          firebase.firestore().runTransaction(transaction => {
            return transaction.get(userDocRef).then(userDoc => {

              const likedArray = userDoc.data().liked || [];
              const updatedLiked = likedArray.filter(item => item.productId !== productId);

              // Update ref_category and occasion in the liked array
              const updatedRefCategory = updatedLiked.map(item => item.productId === productId ? { ...item, ref_category, occasion } : item);

              // Update the user document
              transaction.update(userDocRef, {
                liked: updatedRefCategory
              });

              likeImage.src = emptyLike;
            });
          })
        }
      });
    })
    .catch(error => {
      console.log("Error adding disliked:", error);
    });
  }
}


function checkInputs() {
  document.getElementById("button-container").classList.remove('disablegrid');
  mainButton.classList.remove('disablegrid');
}


const holidaySelectionsGrid = document.getElementById('holiday-selections-grid');
const holidayCardTemplate = document.querySelector('.holiday-selection-card');

function holidaySelections() {
  const holidaysRef = firebase.firestore().collection("holiday-selections");
	
  holidaysRef.get().then((querySnapshot) => {
    holidaySelectionsGrid.innerHTML = "";
      
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const holidayCard = holidayCardTemplate.cloneNode(true);
	    
      holidayCard.querySelector("#holiday-selection-image").src = data.image,
      holidayCard.querySelector("#holiday-selection-name").textContent = data.name

      holidayCard.querySelector("#holiday-selection-link").addEventListener('click', () => {
	 showHolidayPopup(holidayCard.querySelector("#holiday-selection-name").textContent);     
      });

      holidaySelectionsGrid.appendChild(holidayCard);

      holidayCard.addEventListener('mouseenter', () => {
        holidayCard.querySelector("#holiday-selection-image").animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.1)' }
        ], {
          duration: 200,
          fill: 'forwards'
        });
      });

      holidayCard.addEventListener('mouseleave', () => {
        holidayCard.querySelector("#holiday-selection-image").animate([
          { transform: 'scale(1.1)' },
          { transform: 'scale(1)' }
        ], {
          duration: 200,
          fill: 'forwards'
        });
      });
    });
  });
}

const holidayPopupCardTemplate = document.querySelector(".holiday-popup-card");
const holidayPopupGrid = document.getElementById("holiday-popup-grid");

async function showHolidayPopup(holidayName) {
  const holidaysRef = firebase.firestore().collection("holiday-selections");
  document.getElementById("holiday-popup-title").textContent = holidayName;
  holidayPopupGrid.innerHTML = '';

  try {
    const holidayDoc = await holidaysRef.doc(holidayName).get();
    
    if (holidayDoc.exists) {
      const data = holidayDoc.data();
      const products = data.products;

      for (const productName of products) {
        const giftQuerySnapshot = await firebase.firestore().collection("added-by-parsing").where("name", "==", productName).get();

        if (!giftQuerySnapshot.empty) {
          const giftData = giftQuerySnapshot.docs[0].data();

	  let productData = {
	    images: [],
	    name: '',
	    brand: '',
	    description: '',
	    product_link: '',
	    price: ''
	  };

	  productData = {
	    images: giftData.images,
	    name: giftData.name,
	    brand: giftData.brand,
	    description: giftData.description,
	    product_link: giftData.product_link,
	    price: giftData.price
	  };

          const holidayPopupCard = holidayPopupCardTemplate.cloneNode(true);
          holidayPopupCard.querySelector('#holiday-popup-grid-text').textContent = giftData.name;
          holidayPopupCard.querySelector('#holiday-popup-grid-image').src = giftData.images[0];
	  holidayPopupCard.querySelector('#holiday-popup-grid-link').addEventListener('click', () => {
	    showPopup(productData);
	  });
          
          holidayPopupGrid.appendChild(holidayPopupCard);
        }
      }
      holidayPopupContainer.style.display = 'flex';
    } else {
      console.log("Holiday not found");
    }
  } catch (error) {
    console.error("Error fetching holiday data:", error);
  }
}

const holidayPopupClose = document.getElementById("holiday-popup-close");

holidayPopupClose.addEventListener('click', () => {
  holidayPopupContainer.style.display = 'none';
});




