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

function updateCatalog() {

      giftsRef.get().then((querySnapshot) => {
      catalogGrid.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        const card = cardTemplate.cloneNode(true);

        card.querySelector("#product_image").src = data.image_url,
        card.querySelector("#name").textContent = data.name,
        card.querySelector("#price").textContent = `$${data.price}`,
        card.querySelector("#description").textContent = data.description,
        card.querySelector("#keywords").textContent = data.openai_keywords + ',' + data.image_labels,
        card.querySelector("#link-container").href = data.product_link

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
        });
      }

      const favoriteBtns = document.querySelectorAll('.favorite-btn');
      favoriteBtns.forEach(favoriteBtn => {
      favoriteBtn.addEventListener('click', () => {
          const user = firebase.auth().currentUser;
        if (!user) {
          // Prompt user to log in or sign up
          window.location.replace('/sign-up');
          return;
        }

        const uid = user.uid;

        const card = this.closest('.card');
        const productId = card.dataset.productId;
        const favoritesRef = firebase.firestore().collection('favorites').doc(uid);
        favoritesRef.get().then(doc => {
          if (doc.exists && doc.data().products.includes(productId)) {
            // Product is already in favorites; remove it
            favoritesRef.update({
              products: firebase.firestore.FieldValue.arrayRemove(productId)
            }).then(() => {
              // Update button image
              this.classList.remove('favorited');
            });
          } else {
            // Product is not in favorites; add it
            favoritesRef.set({
              products: firebase.firestore.FieldValue.arrayUnion(productId)
            }, { merge: true }).then(() => {
              // Update button image
              this.classList.add('favorited');
            });
          }
        });

        const giftId = card.dataset.giftId;
        const giftsRef = firebase.firestore().collection('gifts');
        const giftRef = giftsRef.doc(giftId);

        giftRef.update({
          favorite: true,
        }).then(() => {
          console.log("Gift marked as favorite");
        }).catch((error) => {
          console.error("Error marking gift as favorite: ", error);
        });
        });
     });
