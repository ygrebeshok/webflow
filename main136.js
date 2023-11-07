
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

  function closeOnes() {
      const friends = ["Friend", "Colleague", "Acquaintance"];
      friends.forEach((friend) => {
    	  const button = document.createElement('button');
          button.textContent = friend;
          button.className = 'who-button';
          button.addEventListener('mouseenter', () => {
      	    button.classList.add('hover');
          });
    	    button.addEventListener('mouseleave', () => {
      	    button.classList.remove('hover');
          });
          button.addEventListener('click', function() {
            if (selected_who !== friend) {
              selected_who = friend;
            }
            selWho.textContent = selected_who;
          });

      closeOnesGrid.appendChild(button);
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

const errorAlert = document.getElementById("error-alert");
const ageAlert = document.getElementById("age-alert");
const personalitySelect = document.getElementById("personality-select");
let personality = personalitySelect.value;
let age = ageField.value;

async function recommend() {
  event.preventDefault();
  // Resets price filter, if was initialized
  
  const priceRange = document.getElementById("price-range");
  const priceDisplay = document.getElementById("price-display");
  priceRange.value = priceRange.max;
  priceDisplay.textContent = `$0 - $${priceRange.max}`;
  // Resets brand filter, if was initialized
  resetFilters();
  
  document.getElementById("textarea").disabled = true;
  errorAlert.style.visibility = "hidden";
  holidayGrid.classList.add('disablegrid');
  switcher.classList.add('disablegrid');
  familyGrid.classList.add('disablegrid');
  secondHalfGrid.classList.add('disablegrid');
  closeOnesGrid.classList.add('disablegrid');
  petsGrid.classList.add('disablegrid');
  age_personality.classList.add('disablegrid');
  mainButton.classList.add('disablegrid');
  searchAgain.style.visibility = "hidden";
  resetSelections.classList.add('disablegrid');
  document.getElementById("textarea").style.color = "black";
  lottieLoader.style.visibility = "visible";
  const text = document.getElementById("textarea").value;
  loadMoreButton.style.display = "none";

  console.log("Age: " + age);
  console.log("Personality: " + personality);

  if (age < 0 || age > 100) {
    ageAlert.style.display = "block";
  } else {

  let age_reference = null;
  let subject_reference = null;
  let personality_reference = null;

  if (selected_who === "Dad") {
    subject_reference = "adult man";
  } else if (selected_who === "Mom") {
    subject_reference = "adult woman";
  } else if (selected_who === "Grandma") {
    subject_reference = "old woman";
  } else if (selected_who === "Grandpa") {
    subject_reference = "old man";
  } else if (selected_who === "Uncle") {
    subject_reference = "adult man";
  } else if (selected_who === "Aunt") {
    subject_reference = "adult woman";
  }
  
  if (age <= 4) {
    age_reference = "1.5-4 years";
  } else if (age >= 5 && age <= 7) {
    age_reference = "5-7 years";
  } else if (age >= 8 && age <= 12) {
    age_reference = "8-12 years";
  } else if (age >= 13 && age <= 18) {
    age_reference = "13-18 years";
  } else if (age >= 19 && age <= 21) {
    age_reference = "19-21 years";
  } else if (age >= 22 && age <= 30) {
    age_reference = "22-30 years";
  } else if (age >= 31 && age <= 40) {
    age_reference = "31-40 years";
  } else if (age >= 41 && age <= 50) {
    age_reference = "41-50 years";
  } else if (age >= 51 && age <= 60) {
    age_reference = "51-60 years";
  } else if (age >= 61) {
    age_reference = "61+ years";
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
    const prompt = "Give some gift recommendations for " + selected_who + " and for this occasion " + selected_holiday + "\n" + "Here is the gift description: " + text;
    
    const keywordsToExclude = [];
    if (!(selected_who === "Dog" || selected_who === "Cat")) {
      keywordsToExclude.push("dog", "bark", "cat", "meow", "pet", "paw");
    } else if (selected_who === "Dad" || selected_who === "Grandpa" || selected_who === "Brother") {
      keywordsToExclude.push("woman", "women", "girl");
    } else if (selected_who === "Mom" || selected_who === "Grandma" || selected_who === "Sister") {
      keywordsToExclude.push("man", "men", "boy");
    }
    
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

       const subjectCategories = ["adult woman", "adult man", "girl", "boy", "kid", "toddler", "newborn", "old man", "old woman", "unisex"];
    
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

         // Now catalog grid's card keywords are retrieved and formatted correctly
         catalogGrid.childNodes.forEach((card) => {
           let cardKeywords = card.querySelector("#keywords").textContent.toLowerCase().split(",").flatMap(keyword => keyword.trim());
           cardKeywords = cardKeywords.map(str => str.replace(/^\s+|\s+$/g, '').replace(/[,.\'"*•-]+/g, ''));
           cardKeywords = cardKeywords.filter(keyword => keyword !== "");
           const cardKeywordsSet = new Set(cardKeywords);

           let cardDescription = card.querySelector("#description").textContent;
           let cardBrand = card.querySelector("#brand").textContent;

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
               card.style.display = "";
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
         });
           
         function removeDuplicates(array) {
           return Array.from(new Set(array));
         }

           // Prioritize cards based on age, subject, and personality references
           if (age_reference && subject_reference && personality_reference) {
             visibleCards.sort((a, b) => {
               const ageCategoryA = a.querySelector("#age-category").textContent;
               const ageCategoryB = b.querySelector("#age-category").textContent;
               const categoryA = a.querySelector("#category").textContent;
               const categoryB = b.querySelector("#category").textContent;
               const subjectCategoryA = a.querySelector("#subject-category").textContent;
               const subjectCategoryB = b.querySelector("#subject-category").textContent;

               if (
                 ageCategoryA === age_reference &&
                 categoryA === personality_reference &&
                 subjectCategoryA === subject_reference
               ) {
                 return -1;
               } else if (
                 ageCategoryB === age_reference &&
                 categoryB === personality_reference &&
                 subjectCategoryB === subject_reference
               ) {
                 return 1;
               } else {
                 return 0;
               }
             });
           }

           output.textContent = `${visibleCards.length} gift(s) found`;
           openaiRec.textContent = newKeywords;
           lottieLoader.style.visibility = "hidden";
           results.scrollIntoView({ behavior: 'smooth' });
           searchAgain.style.visibility = "visible";
           profileDiv.classList.remove("disablegrid");
           profilesBtn.classList.remove("disablegrid");
         }) 
         .catch(error => {
           errorAlert.style.display = "block";
           lottieLoader.style.visibility = "hidden";
           searchAgain.style.visibility = "visible";
           console.log('Error:', error);
         });      
       })
      .catch(error => {
        errorAlert.style.display = "block";
        lottieLoader.style.visibility = "hidden";
        searchAgain.style.visibility = "visible";
        console.log('Error:', error);
      });  
     } catch (error) {
       errorAlert.style.display = "block";
       lottieLoader.style.visibility = "hidden";
       searchAgain.style.visibility = "visible";
       console.log(error);
     }
   } 
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
    closeOnesGrid.addEventListener('click', checkInputs);
    petsGrid.addEventListener('click', checkInputs);
    age_personality.addEventListener('click', checkInputs);

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
    familyGrid.classList.remove("disablegrid");
    secondHalfGrid.classList.remove("disablegrid");
    closeOnesGrid.classList.remove("disablegrid");
    petsGrid.classList.remove("disablegrid");
    age_personality.classList.remove('disablegrid');
    ageAlert.style.display = "none";
    
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
    closeOnesGrid.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('focus');
    });
    petsGrid.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('focus');
    });
  }

