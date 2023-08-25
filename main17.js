
  // Function to initialize the app
  function initializeApp() {
    setupUI();
    mainButton.addEventListener("click", recommend);
  }

  function holidays() {
      const holidays = ["Birthday", "Christmas", "Thanksgiving", "Valentine's", "Mother's Day", "Easter", "Graduation", "Wedding", "Anniversary"];
      holidays.forEach((holiday) => {
    	const button = document.createElement('button');
        button.textContent = holiday;
        button.className = 'button';
        button.addEventListener('mouseenter', () => {
      	  button.classList.add('hover');
        });
  	button.addEventListener('mouseleave', () => {
      	  button.classList.remove('hover');
        });
        button.addEventListener('focus', function() {
    	  button.classList.add('focus');
          selected_holiday = button.textContent;
  	});
        holidayGrid.appendChild(button);
      });

    for (let i = holidays.length; i < 8; i++) {
  	  const button = holidayTemplate.cloneNode(true);
      holidayGrid.appendChild(button);
    }
  }

  function who() {
      const who = ["Mom", "Dad", "Sister", "Brother", "Grandma", "Grandpa", "Family", "Friend", "Colleague", "Dog", "Cat"];
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
        button.addEventListener('focus', function() {
    	    button.classList.add('focus');
          selected_who = button.textContent;
  	    });
        whoGrid.appendChild(button);
      });

      for (let i = who.length; i < 8; i++) {
  	    const button = whoTemplate.cloneNode(true);
        whoGrid.appendChild(button);
      }
  }

  async function recommend() {
    event.preventDefault();
    // Resets price filter, if was initialized
    const priceRange = document.getElementById("price-range");
    const priceDisplay = document.getElementById("price-display");
    priceRange.value = priceRange.max;
    priceDisplay.textContent = `$0 - $${priceRange.max}`;
    // Resets brand filter, if was initialized
    resetBrandFilters();
    
    document.getElementById("textarea").disabled = true;
    errorAlert.style.visibility = "hidden";
    holidayGrid.classList.add('disablegrid');
    searchAgain.style.visibility = "hidden";
    document.getElementById("textarea").style.color = "black";
    lottieLoader.style.visibility = "visible";
    const text = document.getElementById("textarea").value;

    // Prompt to Open AI
    try {
      const response = await fetch("https://api.openai.com/v1/engines/text-davinci-003/completions", {
        method: "POST",
        headers: {
      	  "Content-Type": "application/json",
       	  "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          prompt: "Give some gift recommendations for " + selected_holiday + "\n" + "Here is the case: " + text,
          max_tokens: 1024,
          temperature: 0.5,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

    const data = await response.json();
    // responseText is the OpenAI's response
    const responseText = data.choices[0].text;

    // Second prompt to Open AI to get keywords from the initial response which is just like a general gift recommendation
    const response2 = await fetch("https://api.openai.com/v1/engines/text-davinci-003/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        prompt: "Extract as many keywords from this text as possible and separate them with a comma (don't include keywords in output):" + "\n" + responseText,
        max_tokens: 1024,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    const data2 = await response2.json();
    // Keywords received from OpenAI
    let keywords = data2.choices[0].text;
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
    let visibleCards = [];
    const stringSimilarityThreshold = 0.6;

    // Now catalog grid's card keywords are retrieved and formatted correctly
    catalogGrid.childNodes.forEach((card) => {
      let cardKeywords = card.querySelector("#keywords").textContent.toLowerCase().split(",").flatMap(keyword => keyword.trim());
      cardKeywords = cardKeywords.map(str => str.replace(/^\s+|\s+$/g, '').replace(/[,.\'"*•-]+/g, ''));
      cardKeywords = cardKeywords.filter(keyword => keyword !== "");
      const cardKeywordsSet = new Set(cardKeywords);

   // In intersection openaiKeywords and cardKeywords sets are checked for joint keywords, if founde -> keywords are stored in intersection set
      const intersection = new Set([...openaiKeywords].filter(x => cardKeywordsSet.has(x)));
      
      if (intersection.size === 0) {
        card.style.display = "none";
      } else {
        visibleCards.push(card);
        card.style.display = "";
      }

      // To improve search, catalog grid's card title and description are taken, formatted correctly and are splitted into array of additional card's keywords
      let cardTitle = card.querySelector("#name").textContent.toLowerCase();
      cardTitle = cardTitle.replace(/[,.\'"*•-]+/g, '');
      let cardTitleWords = cardTitle.split(" ");
      cardTitleWords = cardTitleWords.map(str => str.replace(/[\W_]+/g, ''));
      const cardDescription = card.querySelector("#description").textContent.toLowerCase().replace(/[,.\'"*•-]+/g, '');
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
      // If matching products are found through the second check, then the product card is pushed to appeat in the grid
      if (matchedWords.length >= 2 && similarity / matchedWords.length >= stringSimilarityThreshold) {
        visibleCards.push(card);
        card.style.display = "";
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

     } catch (error) {
       console.error(error);
       errorAlert.style.visibility = "visible";
       lottieLoader.style.visibility = "hidden";
     }
  }

  function setupUI() {  
    searchAgain.style.visibility = "hidden";
    lottieLoader.style.visibility = "hidden";
    errorAlert.style.visibility = "hidden";
    document.getElementById("button-container").classList.add('disablegrid');
    mainButton.classList.add('disablegrid');
    textarea.addEventListener('input', checkInputs);
    holidayGrid.addEventListener('click', checkInputs);

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
  }
