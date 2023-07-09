
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
let selected_holiday = "";
const errorAlert = document.getElementById("error-alert");
const brandFilterContainer = document.getElementById("brand-filter");

function populateBrandFilter(brands) {
  brands.forEach((brand) => {
    var label = document.createElement('label');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = brand;
    checkbox.id = 'brand-' + brand;

    checkbox.addEventListener('change', function() {
      handleBrandCheckboxChange(this);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(brand));

    brandFilterContainer.appendChild(label);
    brandFilterContainer.appendChild(document.createElement('br')); // adds a line break for better readability
  });
}

function handleBrandCheckboxChange(checkbox) {
  if (checkbox.checked) {
    // Add brand to filter
  } else {
    // Remove brand from filter
  }
}

function updateCatalog() {
      var brandsSet = new Set();

      giftsRef.get().then((querySnapshot) => {
      catalogGrid.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        brandsSet.add(data.brand);
            
        const card = cardTemplate.cloneNode(true);

        card.querySelector("#product_image").src = data.image_url,
        card.querySelector("#name").textContent = data.name,
        card.querySelector("#price").textContent = `$${data.price}`,
        card.querySelector("#description").textContent = data.description,
        card.querySelector("#keywords").textContent = data.openai_keywords + ',' + data.image_labels,
        card.querySelector("#link-container").href = data.product_link
        
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
          const isFavorite = favoriteBtn.textContent === "Remove from Favorites";

          if (isFavorite) {
            firebase.firestore().collection("users").doc(userId).update({
              favorites: firebase.firestore.FieldValue.arrayRemove(productId)
            })
            .then(() => {
              favoriteBtn.textContent = "Add to Favorites";
            })
            .catch(error => {
              console.log("Error removing product from favorites:", error);
            });
          } else {
            firebase.firestore().collection("users").doc(userId).update({
              favorites: firebase.firestore.FieldValue.arrayUnion(productId)
            })
            .then(() => {
              favoriteBtn.textContent = "Remove from Favorites";
            })
            .catch(error => {
              console.log("Error adding product to favorites:", error);
            });
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

          var brands = Array.from(brandsSet); // add this line
          populateBrandFilter(brands);
            
        });
      }
