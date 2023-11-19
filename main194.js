
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  function resetFilters() {
    brandFilters = [];
    const priceDisplay = document.getElementById("price-display");
    priceRange.value = 2000;
    priceDisplay.textContent = '$0 - $2000';
    priceRangeInitialized = false;
    categoryFilter = null;

    const brandCheckboxes = document.querySelectorAll('.brand-checkbox');
    brandCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });

    filterCatalog();
    resetCategories.classList.add('disablegrid');
  }

  function holidays() {
      const holidays = ["Birthday", "Halloween", "Christmas", "Thanksgiving", "Valentine's", "Mother's Day", "Easter", "Graduation", "Wedding", "Anniversary", "Baby Shower", "Back to School"];
      holidays.forEach((holiday) => {
    	const button = document.createElement('button');
        button.textContent = holiday;
        button.className = 'holiday-button';
        button.addEventListener('mouseenter', () => {
      	  button.classList.add('hover');
        });
  	    button.addEventListener('mouseleave', () => {
          button.classList.remove('hover');
        });
        button.addEventListener('click', function() {
          if (selected_holiday !== holiday) {
            selected_holiday = holiday;
          }
          selHoliday.textContent = selected_holiday;
          if (!(selHoliday.textContent === "Type on Holiday")) {
            customHoliday.style.display = "none";
            checkboxHoliday.checked = false;
            checkboxHoliday.classList.remove('checked');
          }  
          occasion.textContent = selected_holiday;
          setDate();
        });

      holidayGrid.appendChild(button);
      });
  }

  function family() {
      const family = ["Mom", "Dad", "Son", "Daughter", "Sister", "Brother", "Grandma", "Grandpa", "Niece", "Nephew", "Uncle", "Aunt"];
      family.forEach((family) => {
    	  const button = document.createElement('button');
          button.textContent = family;
          button.className = 'who-button';
          button.addEventListener('mouseenter', () => {
      	    button.classList.add('hover');
          });
    	    button.addEventListener('mouseleave', () => {
      	    button.classList.remove('hover');
          });
          button.addEventListener('click', function() {
            if (selected_who !== family) {
              selected_who = family;
            }
            selWho.textContent = selected_who;
          });

      familyGrid.appendChild(button);
      });
  }

  function secondHalf() {
      const halves = ["Boyfriend", "Girlfriend", "Husband", "Wife"];
      halves.forEach((half) => {
    	  const button = document.createElement('button');
          button.textContent = half;
          button.className = 'who-button';
          button.addEventListener('mouseenter', () => {
      	    button.classList.add('hover');
          });
    	    button.addEventListener('mouseleave', () => {
      	    button.classList.remove('hover');
          });
          button.addEventListener('click', function() {
            if (selected_who !== half) {
              selected_who = half;
            }
            selWho.textContent = selected_who;
          });

      secondHalfGrid.appendChild(button);
      });
  }

  let selected_gender = null;

  function genderGridFunc() {
      const friends = ["Male", "Female", "Non-binary"];
      friends.forEach((friend) => {
    	  const button = document.createElement('button');
          button.textContent = friend;
          button.className = 'gender-button';
          button.addEventListener('mouseenter', () => {
      	    button.classList.add('hover');
          });
    	    button.addEventListener('mouseleave', () => {
      	    button.classList.remove('hover');
          });
          button.addEventListener('click', function() {
            if (selected_gender !== friend) {
              selected_gender = friend;
            }
            selWho.textContent = selected_who + " (" + selected_gender + ")";
          });

      genderGrid.appendChild(button);
      });
  }

  function pets() {
      const pets = ["Dog", "Cat"];
      pets.forEach((pet) => {
    	  const button = document.createElement('button');
          button.textContent = pet;
          button.className = 'who-button';
          button.addEventListener('mouseenter', () => {
      	    button.classList.add('hover');
          });
    	    button.addEventListener('mouseleave', () => {
      	    button.classList.remove('hover');
          });
          button.addEventListener('click', function() {
            if (selected_who !== pet) {
              selected_who = pet;
            }
            selWho.textContent = selected_who;
          });

      petsGrid.appendChild(button);
      });
  }

  function categories() {
    const categoryGrid = document.getElementById("category-grid");
  
    const categories = ["Electronics and Gadgets", "Books and Stationery", "Clothing and Accessories", "Art", "Beauty and Hair Products", "Jewelry and Watches", "Fitness and Wellness Items", "Experiences", "Kitchen Appliances", "Outdoor Gear", "Toys and Games", "Anime", "Food and Beverage", "Plants and Gardening", "Travel Accessories", "Home Decor", "Pets"];
    categories.forEach((category) => {
    	const button = document.createElement('button');
      button.textContent = category;
      button.className = 'category-button';
      button.addEventListener('mouseenter', () => {
      	button.classList.add('hover');
      });
  	  button.addEventListener('mouseleave', () => {
        button.classList.remove('hover');
      });
      button.addEventListener('click', function() {
        if (selected_category !== category) {
          selected_category = category;
        }
        resetCategories.classList.remove('disablegrid');
        handleCategoryChange(selected_category);
      });

      categoryGrid.appendChild(button);
    });
  }

const angry = document.getElementById("angry");
const sad = document.getElementById("sad");
const pokerface = document.getElementById("pokerface");
const happy = document.getElementById("happy");
const amused = document.getElementById("amused");
const feedbackWindow = document.getElementById("feedback-window");

function sendReactionToFirebase(reactionValue) {

  const currentUser = firebase.auth().currentUser;
  const userEmail = currentUser ? currentUser.email : "";
  
  const requestData = {
    age: ageField.value || profileAge.value,
    user: userEmail,
    receiver: selected_who || "",
    reaction: reactionValue,
    occasion: selected_holiday,
    gift_desc: document.getElementById("textarea").value,
    recommended_products: []
  };

  visibleCards.forEach(card => {
    const productName = card.querySelector("#name").textContent;
    const productImage = card.querySelector("#product_image").src;
    const productKeywords = card.querySelector("#keywords").textContent;
    const nameImageKeywords = [productName, productImage, productKeywords];
    requestData.recommended_products.push(JSON.stringify(nameImageKeywords));
  });

  const requestsRef = firebase.firestore().collection('gift-requests');

  requestsRef.add(requestData)
    .then((docRef) => {
      feedbackWindow.style.display = "none";
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      feedbackWindow.style.display = "none";
    });
}

angry.addEventListener('click', () => {
  sendReactionToFirebase('angry');
});

sad.addEventListener('click', () => {
  sendReactionToFirebase('sad');
});

pokerface.addEventListener('click', () => {
  sendReactionToFirebase('pokerface');
});

happy.addEventListener('click', () => {
  sendReactionToFirebase('happy');
});

amused.addEventListener('click', () => {
  sendReactionToFirebase('amused');
});

function isSameMonth(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}


mainButton.addEventListener('click', () => {
  const personality = personalitySelect.value;
  const age = ageField.value;
  
  if (age < 0 || age > 100) {
    
    ageAlert.style.display = "block";
    ageAlert.textContent = "The input for age field is wrong";
  
  } else if ((age === "") && (personality === ""))  {
    
    ageAlert.style.display = "block";
    ageAlert.textContent = "Please, enter the age or personality";
  
  } else {
    ageAlert.style.display = "none";
    recommend();
  }
});

async function recommend() {
  event.preventDefault();
  const personality = personalitySelect.value;
  const age = ageField.value;
  
  const priceRange = document.getElementById("price-range");
  const priceDisplay = document.getElementById("price-display");
  priceRange.value = priceRange.max;
  priceDisplay.textContent = `$0 - $${priceRange.max}`;
  
  resetFilters();
  
  errorAlert.style.visibility = "hidden";
  lottieLoader.style.visibility = "visible";

  holidayGrid.classList.add('disablegrid');
  switcher.classList.add('disablegrid');
  switcherClose.classList.add('disablegrid');
  familyGrid.classList.add('disablegrid');
  secondHalfGrid.classList.add('disablegrid');
  genderGrid.classList.add('disablegrid');
  petsGrid.classList.add('disablegrid');
  age_personality.classList.add('disablegrid');
  mainButton.classList.add('disablegrid');
  resetSelections.classList.add('disablegrid');
  searchAgain.style.visibility = "hidden";
  document.getElementById("textarea").disabled = true;
  document.getElementById("textarea").style.color = "black";
  const text = document.getElementById("textarea").value;
  loadMoreButton.style.display = "none";
    
  let age_reference = null;
  let subject_reference = null;
  let personality_reference = null;

  if (selected_who === "Grandma") {
    subject_reference = "old woman";
  } else if (selected_who === "Grandpa") {
    subject_reference = "old man";
  }
  
  if (age <= 4) {
    age_reference = "1.5-4 years";
    subject_reference = "toddler";
  } else if (age >= 5 && age <= 7) {
    age_reference = "5-7 years";
    subject_reference = "kid";
  } else if (age >= 8 && age <= 12) {
    age_reference = "8-12 years";
    subject_reference = "kid";
  } else if (age >= 13 && age <= 16) {
    age_reference = "13-16 years";
    
    if (selected_who === "Daughter" || selected_who === "Sister" || selected_who === "Niece" || selected_who === "Aunt" || selected_who === "Girlfriend" || selected_who === "Wife" || selected_who === "Mom" || selected_gender === "Female") {
      subject_reference = "girl";
    } else if (selected_who === "Son" || selected_who === "Brother" || selected_who === "Nephew" || selected_who === "Uncle" || selected_who === "Boyfriend" || selected_who === "Husband" || selected_who === "Dad" || selected_gender === "Male") {
      subject_reference = "boy";
    } else if (selected_gender === "Non-binary") {
      subject_reference = "unisex";
    }
  } else if (age >= 17 && age <= 30) {
    age_reference = "17-30 years";

    if (selected_who === "Daughter" || selected_who === "Sister" || selected_who === "Niece" || selected_who === "Aunt" || selected_who === "Girlfriend"|| selected_who === "Wife" || selected_who === "Mom" || selected_gender === "Female") {
      subject_reference = "adult woman";
    } else if (selected_who === "Son" || selected_who === "Brother" || selected_who === "Nephew" || selected_who === "Uncle" || selected_who === "Boyfriend" || selected_who === "Husband" || selected_who === "Dad" || selected_gender === "Male") {
      subject_reference = "adult man";
    } else if (selected_gender === "Non-binary") {
      subject_reference = "unisex";
    }
  } else if (age >= 31 && age <= 40) {
    age_reference = "31-40 years";

    if (selected_who === "Daughter" || selected_who === "Sister" || selected_who === "Niece" || selected_who === "Aunt" || selected_who === "Girlfriend" || selected_who === "Wife" || selected_who === "Mom" || selected_gender === "Female") {
      subject_reference = "adult woman";
    } else if (selected_who === "Son" || selected_who === "Brother" || selected_who === "Nephew" || selected_who === "Uncle" || selected_who === "Boyfriend" || selected_who === "Husband" || selected_who === "Dad" || selected_gender === "Male") {
      subject_reference = "adult man";
    } else if (selected_gender === "Non-binary") {
      subject_reference = "unisex";
    }
  } else if (age >= 41 && age <= 50) {
    age_reference = "41-50 years";

    if (selected_who === "Daughter" || selected_who === "Sister" || selected_who === "Niece" || selected_who === "Aunt" || selected_who === "Girlfriend" || selected_who === "Wife" || selected_who === "Mom" || selected_gender === "Female") {
      subject_reference = "adult woman";
    } else if (selected_who === "Son" || selected_who === "Brother" || selected_who === "Nephew" || selected_who === "Uncle" || selected_who === "Boyfriend" || selected_who === "Husband" || selected_who === "Dad" || selected_gender === "Male") {
      subject_reference = "adult man";
    } else if (selected_gender === "Non-binary") {
      subject_reference = "unisex";
    }
  } else if (age >= 51 && age <= 60) {
    age_reference = "51-60 years";

    if (selected_who === "Daughter" || selected_who === "Sister" || selected_who === "Niece" || selected_who === "Aunt" || selected_who === "Girlfriend" || selected_who === "Wife" || selected_who === "Mom" || selected_gender === "Female") {
      subject_reference = "old woman";
    } else if (selected_who === "Son" || selected_who === "Brother" || selected_who === "Nephew" || selected_who === "Uncle" || selected_who === "Boyfriend" || selected_who === "Husband" || selected_who === "Dad" || selected_gender === "Male") {
      subject_reference = "old man";
    } else if (selected_gender === "Non-binary") {
      subject_reference = "unisex";
    }
  } else if (age >= 61) {
    age_reference = "61+ years";

    if (selected_who === "Daughter" || selected_who === "Sister" || selected_who === "Niece" || selected_who === "Aunt" || selected_who === "Girlfriend" || selected_who === "Wife" || selected_who === "Mom" || selected_gender === "Female") {
      subject_reference = "old woman";
    } else if (selected_who === "Son" || selected_who === "Brother" || selected_who === "Nephew" || selected_who === "Uncle" || selected_who === "Boyfriend" || selected_who === "Husband" || selected_who === "Dad" || selected_gender === "Male") {
      subject_reference = "old man";
    } else if (selected_gender === "Non-binary") {
      subject_reference = "unisex";
    }
  }

  if (personality === "Tech Geek") {
    personality_reference = "Electronics and Gadgets";
  } else if (personality === "Bookworm") {
    personality_reference = "Books and Stationery";
  } else if (personality === "Fashionista") {
    personality_reference = "Clothing and Accessories";
  } else if (personality === "Artist") {
    personality_reference = "Art";
  } else if (personality === "Skin Care Master") {
    personality_reference = "Beauty and Hair Products";
  } else if (personality === "Jewelry Admirer") {
    personality_reference = "Jewelry and Watches";
  } else if (personality === "Sports Star") {
    personality_reference = "Fitness and Wellness Items";
  } else if (personality === "Life Taster") {
    personality_reference = "Experiences";
  } else if (personality === "Chef") {
    personality_reference = "Kitchen Appliances";
  } else if (personality === "Hiker") {
    personality_reference = "Outdoor Gear";
  } else if (personality === "Adorable kid") {
    personality_reference = "Toys and Games";
  } else if (personality === "Asian Culture Follower") {
    personality_reference = "Anime";
  } else if (personality === "Foodie") {
    personality_reference = "Food and Beverage";
  } else if (personality === "Gardener") {
    personality_reference = "Plants and Gardening";
  } else if (personality === "Home Esthete") {
    personality_reference = "Travel Accessories";
  }
  
    // Prompt to Open AI
  try {
    const prompt = "Give some gift recommendations for " + selWho.textContent + " and for this occasion " + selected_holiday + ". The person is " + personality + " inside" + "\n" + "Here is the gift situation description: " + text;
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    };

    fetch('https://api.openai.com/v1/completions', requestOptions)
    .then(response => response.json())
      .then(data => {
        const responseText = data.choices[0].text;

        const subjectCategories = ["adult woman", "adult man", "girl", "boy", "kid", "toddler", "old man", "old woman", "unisex"];
    
        for (const category of subjectCategories) {
          if (responseText.toLowerCase().includes(category)) {
            subject_reference = category;
            break;
           }
         }
       
         const requestOptions2 = {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${openaiApiKey}`
           },
           body: JSON.stringify({
             model: 'gpt-3.5-turbo-instruct',
             prompt: `Extract keywords from this text and separate them with a comma (don't include word keywords in output):\n${responseText}`,
             max_tokens: 1024,
             temperature: 0.5,
             top_p: 1,
             frequency_penalty: 0,
             presence_penalty: 0
           })
         };

         fetch('https://api.openai.com/v1/completions', requestOptions2)
           .then(response => response.json())
           .then(data => {
             let keywords = data.choices[0].text;
             const newKeywords = keywords.replace(/\n/g, '');

             keywords = keywords.toLowerCase().split(",").flatMap(keyword => keyword.trim());
             keywords = keywords.map(str => str.replace(/^\s+|\s+$/g, '').replace(/[,.\'"*•-]+/g, ''));
             keywords = keywords.filter(keyword => keyword !== "");

             if (keywords.length > 0) {
               if (keywords[0].charAt(0) == " ") {
                 keywords[0] = keywords[0].substring(1);
               }

               if (keywords[0].startsWith("\n\n")) {
                 keywords[0] = keywords[0].substring(2);
               }
             }
             // Correctly formatted keywords at this point
             const openaiKeywords = new Set(keywords);
             visibleCards = [];

             // Prioritize cards based on age, subject, and personality references
             let topCards = [];
             let middleCards = [];
             let bottomCards = [];

             catalogGrid.childNodes.forEach((card) => {
               let ageCategory = card.querySelector("#age-category").textContent;
               let category = card.querySelector("#category").textContent;
               let subjectCategory = card.querySelector("#subject-category").textContent;

               if ((ageCategory === age_reference || ageCategory === "universal") && category === personality_reference && subjectCategory === subject_reference) {
                 topCards.push(card);
               } else if (ageCategory === age_reference || ageCategory === "universal" || category === personality_reference || subjectCategory === subject_reference) {
                 middleCards.push(card);
               } else {
                 bottomCards.push(card);
               }
             });

             let sortedCards = topCards.concat(middleCards).concat(bottomCards);

             // Remove existing cards from catalogGrid
             while (catalogGrid.firstChild) {
               catalogGrid.removeChild(catalogGrid.firstChild);
             }

             // Append sorted cards to catalogGrid
             sortedCards.forEach((card) => {
               catalogGrid.appendChild(card);
             });

             catalogGrid.childNodes.forEach((card) => {

             // Formating the set of card's keywords
             let cardKeywords = card.querySelector("#keywords").textContent.toLowerCase().split(",").flatMap(keyword => keyword.trim());
             cardKeywords = cardKeywords.map(str => str.replace(/^\s+|\s+$/g, '').replace(/[,.\'"*•-]+/g, ''));
             cardKeywords = cardKeywords.filter(keyword => keyword !== "");
             const cardKeywordsSet = new Set(cardKeywords);

             let cardDescription = card.querySelector("#description").textContent;
             let cardBrand = card.querySelector("#brand").textContent;

             const keywordsToExclude = [];
             if (!(selected_who === "Dog" || selected_who === "Cat")) {
               keywordsToExclude.push("dog", "bark", "cat", "meow", "pet", "paw");
             } else if (selected_who === "Dad" || selected_who === "Grandpa" || selected_who === "Brother") {
               keywordsToExclude.push("woman", "women", "girl", "female", "feminine", "womanly");
             } else if (selected_who === "Mom" || selected_who === "Grandma" || selected_who === "Sister") {
               keywordsToExclude.push("man", "men", "boy", "male", "masculine", "manly");
             }

             // Check if any of the keywords to exclude are present in the card's title, description, or brand
             const keywordsToExcludeFound = keywordsToExclude.some(keyword => {
               const lowerCaseKeyword = keyword.toLowerCase();
               const keywordRegExp = new RegExp(`\\b${escapeRegExp(lowerCaseKeyword)}\\b`, 'i');
               return (
                 keywordRegExp.test(cardDescription) ||
                 keywordRegExp.test(cardBrand)
               );
             });

             if (!keywordsToExcludeFound) {
               const intersection = new Set([...openaiKeywords].filter(x => cardKeywordsSet.has(x)));

               if (intersection.size >= 2) {
                 visibleCards.push(card);
                 card.style.display = "flex";
               } else {
                 const index = visibleCards.indexOf(card);
                 if (index !== -1) {
                   visibleCards.splice(index, 1);
                 }
                 card.style.display = "none";
               }
             } else {
               const index = visibleCards.indexOf(card);
               if (index !== -1) {
                 visibleCards.splice(index, 1);
               }
               card.style.display = "none";
             }

             if (!(selected_who === "Dog" || selected_who === "Cat")) {
               // Filter out cards with brands found in petStores
               if (petStores.includes(card.querySelector("#brand").textContent)) {
                 const index = visibleCards.indexOf(card);
                 if (index !== -1) {
                   visibleCards.splice(index, 1);
                 }
                 card.style.display = "none";
               }
             }
      
             visibleCards = removeDuplicates(visibleCards);
         
             const subjectCategory = card.querySelector("#subject-category").textContent;

             if (!((subjectCategory === subject_reference) || (subjectCategory === "unisex"))) {
               const index = visibleCards.indexOf(card);
                 if (index !== -1) {
                   visibleCards.splice(index, 1);
                 }
                 card.style.display = "none";
             }
           
           });

           function removeDuplicates(array) {
             return Array.from(new Set(array));
           }

           output.textContent = `${visibleCards.length} gift(s) found`;
           openaiRec.textContent = newKeywords;
           lottieLoader.style.visibility = "hidden";
           shieldForRecs(visibleCards);
           results.scrollIntoView({ behavior: 'smooth' });
           searchAgain.style.visibility = "visible";
           profileDiv.classList.remove("disablegrid");
           profilesBtn.classList.remove("disablegrid");
           created.textContent = "";

           setTimeout(() => {
             feedbackWindow.style.display = 'flex';
           }, 10000);

           //const user = firebase.auth().currentUser;

           //if (user) {
             //const userDocRef = firebase.firestore().collection('users').doc(user.uid);

             //userDocRef.get().then( async (doc) => {
               //if (doc.exists) {
                 //const userData = doc.data();
                 //const usageCount = userData.usageCount || 0;
                 //const lastUpdate = userData.lastUpdate || null;

                 // Check if it's a new month
                 //if (!lastUpdate || !isSameMonth(new Date(lastUpdate.toMillis()), new Date())) {
                   // Reset usageCount for a new month
                   //userDocRef.update({
                     //usageCount: 1,
                     //lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
                   //});
                 //} else if (usageCount < 5) {
                   // Update usageCount if it's less than 5
                   //userDocRef.update({
                     //usageCount: usageCount + 1
                   //});
                 //} else {
                   // Set up subscription using Firebase extension with Stripe
                   //try {
                     //const checkoutSessionRef = await firebase.firestore()
                     //.collection('customers')
                     //.doc(user.uid)
                     //.collection('checkout_sessions')
                     //.add({
                       //userId: user.uid,
                       //price: price_id,
                       //success_url: "https://www.smappy.io/recommendations",
                       //cancel_url: "https://www.smappy.io/recommendations",
                     //});

                     //checkoutSessionRef.onSnapshot((snap) => {
                       //const { error, url } = snap.data();
                       //if (error) {
                         // Show an error to your customer and
                         //alert(`An error occured: ${error.message}`);
                       //}
                       //if (url) {
                         // We have a Stripe Checkout URL, let's redirect.
                         //window.location.assign(url);
                       //}
                     //});
                   //} catch (error) {
                     //console.error(`An error occurred: ${error.message}`);
                   //}
                 //}
               //}
             //}).catch((error) => {
               //console.log('Error getting user document:', error);
             //});  
           //}
         }) 
         .catch(error => {
           console.log('Error:', error);
           errorAlert.textContent = "Too many requests at this time, please, try again later";
           errorAlert.style.visibility = "visible";
           lottieLoader.style.visibility = "hidden";
           searchAgain.style.visibility = "visible";
         });      
       })
       .catch(error => {
         console.log('Error:', error);
         errorAlert.textContent = "Too many requests at this time, please, try again later";
         errorAlert.style.visibility = "visible";
         lottieLoader.style.visibility = "hidden";
         searchAgain.style.visibility = "visible";
       });  
     } catch (error) {
       console.log(error);
       errorAlert.textContent = "Too many requests at this time, please, try again later";
       errorAlert.style.visibility = "visible";
       lottieLoader.style.visibility = "hidden";
       searchAgain.style.visibility = "visible";
     }
  }

  function shieldForRecs(visibleCards) {
    const shield = document.getElementById("shield");
    firebase.auth().onAuthStateChanged(function(authUser) {
      user = authUser;

      if (user) {
        shield.style.display = "none";
      } else {
        if (visibleCards.length < 4) {
          shield.style.display = "none";
        } else {
          shield.style.display = "flex";
        }
      }
    });
  }


  function setupUI() {
    searchAgain.style.visibility = "hidden";
    lottieLoader.style.visibility = "hidden";
    errorAlert.style.visibility = "hidden";
    document.getElementById("button-container").classList.add('disablegrid');
    textarea.addEventListener('input', checkInputs);
    holidayGrid.addEventListener('click', checkInputs);
    familyGrid.addEventListener('click', checkInputs);
    secondHalfGrid.addEventListener('click', checkInputs);
    genderGrid.addEventListener('click', checkInputs);
    petsGrid.addEventListener('click', checkInputs);
    age_personality.addEventListener('click', checkInputs);
    errorAlert.textContent = "";

    resetCategories.classList.add('disablegrid');

    catalogGrid.removeChild(defaultCard);

    const brandCheckboxes = document.querySelectorAll(".brand-checkbox");
    brandCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", handleBrandCheckboxChange);
    });

    searchAgain.addEventListener("click", handleSearchAgain);

    const favoriteBtns = document.querySelectorAll(".favorite-btn");
    favoriteBtns.forEach((favoriteBtn) => {
      favoriteBtn.addEventListener("click", toggleFavorite);
    });
  }

  function checkInputs() {
    document.getElementById("button-container").classList.remove('disablegrid');
    mainButton.classList.remove('disablegrid');
  }

  function handleSearchAgain() {
    document.getElementById("textarea").disabled = false;
    errorAlert.style.visibility = "hidden";
    document.getElementById("textarea").style.color = "white";
    searchAgain.style.visibility = "hidden";
    resetSelections.classList.remove('disablegrid');
    profilesBtn.classList.add("disablegrid");
    holidayGrid.classList.remove("disablegrid");
    switcher.classList.remove('disablegrid');
    switcherClose.classList.remove('disablegrid');
    familyGrid.classList.remove("disablegrid");
    secondHalfGrid.classList.remove("disablegrid");
    genderGrid.classList.remove("disablegrid");
    petsGrid.classList.remove("disablegrid");
    age_personality.classList.remove('disablegrid');
    ageAlert.style.display = "none";
    errorAlert.textContent = "";

    personalitySelect.value = "";
    ageField.value = "";

    document.getElementById("profile-name").textContent = "";
    document.getElementById("profile-age").value = "";
    document.getElementById("custom-holiday").textContent = "Tap on Holiday Panel";
    document.getElementById("profile-date").value = "";
    
    if (profileArea.classList.contains('move-right')) {
      profileArea.classList.remove('move-right');
    }
    
    selected_who = null;
    selected_holiday = null;
    selWho.textContent = "";
    selHoliday.textContent = "";
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

    updateCatalog();
  }

