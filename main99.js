
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
      const holidays = ["Birthday", "Christmas", "Thanksgiving", "Valentine's", "Mother's Day", "Easter", "Graduation", "Wedding", "Anniversary"];
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

    for (let i = holidays.length; i < 8; i++) {
  	  const button = holidayTemplate.cloneNode(true);
      holidayGrid.appendChild(button);
    }
  }

  function who() {
      const who = ["Mom", "Dad", "Son", "Daughter", "Sister", "Brother", "Grandma", "Grandpa", "Family", "Boyfriend", "Girlfriend", "Friend", "Colleague", "Acquaintance", "Dog", "Cat"];
      who.forEach((who) => {
    	  const button = document.createElement('button');
          button.textContent = who;
          button.className = 'who-button';
          button.addEventListener('mouseenter', () => {
      	    button.classList.add('hover');
          });
    	    button.addEventListener('mouseleave', () => {
      	    button.classList.remove('hover');
          });
          button.addEventListener('click', function() {
            if (selected_who !== who) {
              selected_who = who;
            }
            selWho.textContent = selected_who;
          });

      whoGrid.appendChild(button);
      });

      for (let i = who.length; i < 8; i++) {
  	    const button = whoTemplate.cloneNode(true);
        whoGrid.appendChild(button);
      }
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
  whoGrid.classList.add('disablegrid');
  mainButton.classList.add('disablegrid');
  searchAgain.style.visibility = "hidden";
  document.getElementById("textarea").style.color = "black";
  lottieLoader.style.visibility = "visible";
  const text = document.getElementById("textarea").value;

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

       const requestOptions2 = {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${openaiApiKey}`
         },
         body: JSON.stringify({
           model: 'gpt-3.5-turbo-instruct',
           prompt: `Extract as many keywords from this text as possible and separate them with a comma (don't include word keywords in output):\n${responseText}`,
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
         const stringSimilarityThreshold = 0.6;

         // Now catalog grid's card keywords are retrieved and formatted correctly
         catalogGrid.childNodes.forEach((card) => {
           let cardKeywords = card.querySelector("#keywords").textContent.toLowerCase().split(",").flatMap(keyword => keyword.trim());
           cardKeywords = cardKeywords.map(str => str.replace(/^\s+|\s+$/g, '').replace(/[,.\'"*•-]+/g, ''));
           cardKeywords = cardKeywords.filter(keyword => keyword !== "");
           const cardKeywordsSet = new Set(cardKeywords);

           // To improve search, catalog grid's card title and description are taken, formatted correctly and are splitted into array of additional card's keywords
           let cardTitle = card.querySelector("#name").textContent.toLowerCase().replace(/[,.\'"*•-]+/g, '');
           let cardTitleWords = cardTitle.split(" ");
           cardTitleWords = cardTitleWords.map(str => str.replace(/[\W_]+/g, ''));
           const cardDescription = card.querySelector("#description").textContent.toLowerCase().replace(/[,.\'"*•-]+/g, '');
           const cardBrand = card.querySelector("#brand").textContent.toLowerCase().replace(/[,.\'"*•-]+/g, '');
           let cardDescriptionWords = cardDescription.split(" ");
           cardDescriptionWords = cardDescriptionWords.map(str => str.replace(/[\W_]+/g, ''));

           let matchedWords = [];
           let similarity = 0;

           // Here the second check is conducted for matched products with finding similarity between card's title and description keywords and Open AI's keywords
           for (let i = 0; i < cardTitleWords.length; i++) {
             const word = cardTitleWords[i];
             const match = stringSimilarity.findBestMatch(word, keywords);
             if (match.bestMatch.rating >= stringSimilarityThreshold && !matchedWords.includes(match.bestMatch.target)) {
               matchedWords.push(match.bestMatch.target);
               similarity += match.bestMatch.rating;
             }
           }
             
           for (let i = 0; i < cardDescriptionWords.length; i++) {
             const word = cardDescriptionWords[i];
             const match = stringSimilarity.findBestMatch(word, keywords);
             if (match.bestMatch.rating >= stringSimilarityThreshold && !matchedWords.includes(match.bestMatch.target)) {
               matchedWords.push(match.bestMatch.target);
               similarity += match.bestMatch.rating;
             }
           }

           // Check if any of the keywords to exclude are present in the card's title, description, or brand
           const keywordsToExcludeFound = keywordsToExclude.some(keyword => {
             const lowerCaseKeyword = keyword.toLowerCase();
             const keywordRegExp = new RegExp(`\\b${escapeRegExp(lowerCaseKeyword)}\\b`, 'i');
             return (
               keywordRegExp.test(cardTitle) ||
               keywordRegExp.test(cardDescription) ||
               keywordRegExp.test(cardBrand)
             );
           });

           if (!keywordsToExcludeFound) {
             const intersection = new Set([...openaiKeywords].filter(x => cardKeywordsSet.has(x)));
             const hasSimilarity = matchedWords.length >= 2 && similarity / matchedWords.length >= stringSimilarityThreshold;
    
             if (intersection.size === 0 || !hasSimilarity) {
               const index = visibleCards.indexOf(card);
               if (index !== -1) {
                 visibleCards.splice(index, 1);
               }
               card.style.display = "none";
             } else {
               visibleCards.push(card);
               card.style.display = "";
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

           output.textContent = `${visibleCards.length} gift(s) found`;
           openaiRec.textContent = newKeywords;
           lottieLoader.style.visibility = "hidden";
           results.scrollIntoView({ behavior: 'smooth' });
           searchAgain.style.visibility = "visible";
           profileDiv.classList.remove("disablegrid");
           profilesBtn.classList.remove("disablegrid");
         }) 
         .catch(error => {
           console.error('Error:', error);
           errorAlert.style.visibility = "visible";
           lottieLoader.style.visibility = "hidden";
           searchAgain.style.visibility = "visible";
         });      
       })
      .catch(error => {
        console.error('Error:', error);
        errorAlert.style.visibility = "visible";
        lottieLoader.style.visibility = "hidden";
        searchAgain.style.visibility = "visible";
      });  
     } catch (error) {
       console.error(error);
       errorAlert.style.display = "block";
       lottieLoader.style.visibility = "hidden";
       searchAgain.style.visibility = "visible";
     }
  } 


  function setupUI() {
    searchAgain.style.visibility = "hidden";
    lottieLoader.style.visibility = "hidden";
    errorAlert.style.visibility = "hidden";
    document.getElementById("button-container").classList.add('disablegrid');
    textarea.addEventListener('input', checkInputs);
    holidayGrid.addEventListener('click', checkInputs);
    whoGrid.addEventListener('click', checkInputs);

    resetCategories.classList.add('disablegrid');

    catalogGrid.removeChild(defaultCard);
    holidayContainer.removeChild(defaultHoliday);

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
    holidayGrid.classList.remove("disablegrid");
    whoGrid.classList.remove("disablegrid");
    profileArea.classList.add("disablegrid");
    profileArea.style.opacity = '0.5';
  }

