
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
let selected_holiday = null;
const whoGrid = document.getElementById("who-grid");
const whoTemplate = document.querySelector(".who");
let selected_who = null;
const errorAlert = document.getElementById("error-alert");
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
  popupImage.src = productData.image_url;
  popupTitle.textContent = productData.name;
  popupBrand.textContent = productData.brand;
  popupDesc.textContent = productData.description;
  popupLink.href = productData.product_link;
  popupPrice.textContent = `$${productData.price}`;

  const user = firebase.auth().currentUser;
  const userId = user.uid;
  const productId = productData.name;

  firebase.firestore().collection("users").doc(userId).get()
    .then(doc => {
      const favorites = doc.data().favorites;
      if (favorites.includes(productId)) {
        popupFavoriteBtn.textContent = "Remove from Favorites";
      }
    })
    .catch(error => {
      console.log("Error getting favorites:", error);
    });

  popupFavoriteBtn.addEventListener('click', () => {
    toggleFavorite(popupFavoriteBtn, userId, productId);
  });
	
  popupContainer.style.display = "flex";
}

popupClose.addEventListener("click", () => {
  popupContainer.style.display = "none";
});

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

function resetBrandFilters() {
  // Reset brand filter
  brandFilters = [];
  const brandCheckboxes = document.querySelectorAll('.brand-checkbox');
  brandCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
}

let brandFilters = [];
let priceRange;
let priceRangeInitialized = false;

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
}

function filterCatalog() {
  // Obtain the currently set price range
  const minPrice = 0;
  const maxPrice = parseInt(priceRange.value);

  const priceDisplay = document.getElementById("price-display");
  priceDisplay.textContent = `$${minPrice} - $${maxPrice}`;

  let visibleCards;

  if (brandFilters.length === 0) {
    visibleCards = allCards;
  } else {
    visibleCards = allCards.filter(card => {
      const brand = card.querySelector("#brand").textContent;
      return brandFilters.includes(brand);
    });
  }

  // Further filter the visibleCards by the price range
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

let allCards = [];

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

        card.querySelector("#product_image").src = data.image_url,
        card.querySelector("#name").textContent = data.name,
        card.querySelector("#price").textContent = `$${data.price}`,
        card.querySelector("#description").textContent = data.description,
        card.querySelector("#keywords").textContent = data.openai_keywords + ',' + data.image_labels,
        card.querySelector("#link-container").href = data.product_link,
        card.querySelector("#brand").textContent = data.brand

        allCards.push(card);
        
        const favoriteBtn = card.querySelector("#favorite-btn");
        const productId = card.querySelector("#name").textContent;
        const user = firebase.auth().currentUser;
        const userId = user.uid;

        // Check if product is already in favorites array
        firebase.firestore().collection("users").doc(userId).get()
          .then(doc => {
            const favorites = doc.data().favorites;
            if (favorites.includes(productId)) {
              favoriteBtn.textContent = "Remove from Favorites";
            }
          })
          .catch(error => {
            console.log("Error getting favorites:", error);
          });

        // Add or remove product from favorites array when button is clicked
        favoriteBtn.addEventListener('click', () => {
  	  toggleFavorite(favoriteBtn, userId, productId);
	});

	const quickLookBtn = card.querySelector("#quick_look");
	quickLookBtn.addEventListener("click", () => {
	  const productData = {
	    image_url: card.querySelector("#product_image").src,
	    name: card.querySelector("#name").textContent,
	    brand: card.querySelector("#brand").textContent,
	    description: card.querySelector("#description").textContent,
	    product_link: card.querySelector("#link-container").href,
	    price: card.querySelector("#price").textContent.replace("$", "")
	  };
	
	  showPopup(productData);
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
