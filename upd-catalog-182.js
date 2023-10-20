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
const whoGrid = document.getElementById("who-grid");
const whoTemplate = document.querySelector(".who");
const brandFilterContainer = document.getElementById("brand-filter");
const lowestPriceButton = document.getElementById('lowestPrice');
const highestPriceButton = document.getElementById('highestPrice');
const holidayContainer = document.getElementById('holiday-container');
const filtersContainer = document.getElementById("filters-container");
const closeFilters = document.getElementById("close-filters");
const filterActivator = document.getElementById("filter-activator");
const popupImage = document.getElementById('popup_image');
const popupTitle = document.getElementById('popup_title');
const popupBrand = document.getElementById('popup_brand');
const popupDesc = document.getElementById('popup_desc');
const popupLink = document.getElementById('popup_link');
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
let visibleCards = [];
const catalogGrid = document.getElementById("catalog");
const cardTemplate = document.querySelector(".card");

let currentPage = 1;
const itemsPerPage = 30; // Change this to the number of items per page
const loadMoreButton = document.getElementById('load-more');

function showPage(page) {
  const gridItems = Array.from(catalogGrid.children);
  gridItems.forEach(function(item, index) {
    if (index >= (page - 1) * itemsPerPage && index < page * itemsPerPage) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

loadMoreButton.addEventListener('click', function() {
  currentPage++;
  showPage(currentPage);
});

// Initially show the first page
showPage(currentPage);

document.addEventListener('DOMContentLoaded', function() {
	
  const urlParams = new URLSearchParams(window.location.search);
  const sel_who = urlParams.get('selected_who');
  const sel_holiday = urlParams.get('selected_holiday');
  const gift_desc = urlParams.get('gift_desc');

  document.getElementById("textarea").value = gift_desc; 
  
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
  holidayGrid.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('focus');
  });
  whoGrid.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('focus');
  });
});

createProfile.addEventListener('click', () => {
	
  if (checkboxHoliday.checked === true) {
    selected_holiday = customHoliday.value;
    console.log(selected_holiday);
  }

  const profileData = {
    profile_name: profileName.value,
    profile_age: profileAge.value,
    receiver: selected_who || "",
    occasion: selected_holiday,
    gift_desc: document.getElementById("textarea").value,
    date: profileDate.value || "",
    recommended_products: []
  };

  visibleCards.forEach(card => {
    const productName = card.querySelector("#name").textContent;
    profileData.recommended_products.push(productName);
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
      created.textContent = "Error Occurred on Profile Creation"
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

function loadHolidayData() {

  holidayRef.get().then((querySnapshot) => {
    holidayContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const holiday = holidayCardTemplate.cloneNode(true);

      holiday.querySelector("#holiday-title").textContent = data.name;
      holiday.querySelector("#holiday-desc").textContent = data.description;
      holiday.querySelector("#holiday-image").src = data.image_url;
      holiday.querySelector("#holiday-image").alt = data.name;
      holiday.querySelector("#holiday-link").href = data.product_link;
      holiday.querySelector("#holiday-price").textContent = "$" + data.price;

      holidayContainer.appendChild(holiday);

      const holidayFavorite = holiday.querySelector("#holiday-favorite");
      const productId = holiday.querySelector("#holiday-title").textContent;
      const user = firebase.auth().currentUser;
      const userId = user.uid;

      firebase.firestore().collection("users").doc(userId).get()
      .then(doc => {
        const favorites = doc.data().favorites;
          if (favorites.includes(productId)) {
            holidayFavorite.textContent = "Remove from Favorites";
          }
        })
      .catch(error => {
        console.log("Error getting favorites:", error);
      });

      holidayFavorite.addEventListener('click', () => {
        toggleFavorite(holidayFavorite, userId, productId);
      });

      holiday.addEventListener("mouseenter", () => {
        holiday.animate([
	{ transform: "translateY(0px)" },
	{ transform: "translateY(-90px)" }
	], {
	duration: 200,
	fill: "forwards"
	});
	holidayBack.style.filter = "blur(2px)";
      });
	
      holiday.addEventListener("mouseleave", () => {
	holiday.animate([
	{ transform: "translateY(-90px)" },
	{ transform: "translateY(0px)" }
	], {
	duration: 200,
	fill: "forwards"
	});
	holidayBack.style.filter = "blur(0px)";
      });
    });
   }).catch((error) => {
     console.log("Error getting documents: ", error);
  });
}

function showPopup(productData) {
  const slideContainer = document.querySelector('.slides');
  const thumbnailContainer = document.querySelector('.thumbnails');
  slideContainer.innerHTML = ''; // Clear existing slides
  thumbnailContainer.innerHTML = ''; // Clear existing thumbnails
	
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
      } else {
	favoritesLabel.textContent = "Add to Favorites";
      }
    })
    .catch(error => {
      console.log("Error getting favorites:", error);
    });

  popupFavoriteBtn.addEventListener('click', () => {
    toggleFavorite(favoritesLabel, userId, productId);
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
	console.log("thumbnail clicked");
      });
    });

    showSlide(currentSlide);

    popupClose.addEventListener("click", () => {
      popupContainer.style.display = "none";
    });
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

let brandFilters = [];
let priceRange;
let priceRangeInitialized = false;
let categoryFilter = null;
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

function handleCategoryChange(category) {
  categoryFilter = category; // Update category filter
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
      card.querySelector("#keywords").textContent = data.openai_keywords + ',' + data.image_labels,
      card.querySelector("#brand").textContent = data.brand,
      card.querySelector("#category").textContent = data.category

      allCards.push(card);
        
      const productId = card.querySelector("#name").textContent;
      const user = firebase.auth().currentUser;
      const userId = user.uid;

      const quickLookBtn = card.querySelector("#quick_look");
      quickLookBtn.addEventListener("click", () => {
	const productData = {
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

      likeBtn.addEventListener("click", () => {
	toggleLike(likeImage, dislikeImage, userId, productId, selected_who, selected_holiday)	
      });

      dislikeBtn.addEventListener("click", () => {
	toggleDislike(dislikeImage, likeImage, userId, productId, selected_who, selected_holiday)	
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
