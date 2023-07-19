
  // Function to initialize the app
  function initializeApp() {
    setupUI();
    mainButton.addEventListener("click", handleSearch);

    const closePopupButton = document.getElementById("close-popup");
    closePopupButton.addEventListener("click", hidePopup);
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

  // Function to fetch data from OpenAI API
    async function fetchOpenAIResponse(text) {
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
      return data.choices[0].text;
    }

    // Function to extract keywords from OpenAI response
    function extractKeywords(responseText) {
      let keywords = responseText.replace(/\n/g, '');
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

      return new Set(keywords);
    }

    // Function to filter and display visible cards based on keywords
    function filterVisibleCards(openaiKeywords) {
      let visibleCards = [];
      const stringSimilarityThreshold = 0.6;

      catalogGrid.childNodes.forEach((card) => {
        let cardKeywords = card.querySelector("#keywords").textContent.toLowerCase().split(",").flatMap(keyword => keyword.trim());
        cardKeywords = cardKeywords.map(str => str.replace(/^\s+|\s+$/g, '').replace(/[,.\'"*•-]+/g, ''));
        cardKeywords = cardKeywords.filter(keyword => keyword !== "");
        const cardKeywordsSet = new Set(cardKeywords);
        const intersection = new Set([...openaiKeywords].filter(x => cardKeywordsSet.has(x)));
        if (intersection.size === 0) {
          card.style.display = "none";
        } else {
          visibleCards.push(card);
          card.style.display = "";
        }

        let cardTitle = card.querySelector("#name").textContent.toLowerCase();
        cardTitle = cardTitle.replace(/[,.\'"*•-]+/g, '');
        let cardTitleWords = cardTitle.split(" ");
        cardTitleWords = cardTitleWords.map(str => str.replace(/[\W_]+/g, ''));
        const cardDescription = card.querySelector("#description").textContent.toLowerCase().replace(/[,.\'"*•-]+/g, '');
        let cardDescriptionWords = cardDescription.split(" ");
        cardDescriptionWords = cardDescriptionWords.map(str => str.replace(/[\W_]+/g, ''));
  
        let matchedWords = [];
        let similarity = 0;

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
        if (matchedWords.length >= 2 && similarity / matchedWords.length >= stringSimilarityThreshold) {
          visibleCards.push(card);
          card.style.display = "";
        }

        visibleCards = removeDuplicates(visibleCards);
      });

      return visibleCards;
    }

    // Function to remove duplicates from an array
    function removeDuplicates(array) {
      return Array.from(new Set(array));
    }

    // Function to handle the search logic
    async function handleSearch(event) {
      event.preventDefault();
      
      const priceRange = document.getElementById("price-range");
      const priceDisplay = document.getElementById("price-display");
      priceRange.value = priceRange.max;
      priceDisplay.textContent = `$0 - $${priceRange.max}`;
      
      resetBrandFilters();
      
      document.getElementById("textarea").disabled = true;
      errorAlert.style.visibility = "hidden";
      holidayGrid.classList.add("disablegrid");
      searchAgain.style.visibility = "hidden";
      filtersContainer.style.visibility = "hidden";
      document.getElementById("textarea").style.color = "black";
      lottieLoader.style.visibility = "visible";
      const text = document.getElementById("textarea").value;

      try {
        const responseText = await fetchOpenAIResponse(text);
        const openaiKeywords = extractKeywords(responseText);
        const visibleCards = filterVisibleCards(openaiKeywords);

        output.textContent = `${visibleCards.length} gift(s) found`;
        openaiRec.textContent = [...openaiKeywords].join(', ');
        lottieLoader.style.visibility = "hidden";
        results.scrollIntoView({ behavior: 'smooth' });
        searchAgain.style.visibility = "visible";

      } catch (error) {
        console.error(error);
        errorAlert.style.visibility = "visible";
        lottieLoader.style.visibility = "hidden";
      }
    }

  function handleSearchAgain() {
    document.getElementById("textarea").disabled = false;
    errorAlert.style.visibility = "hidden";
    document.getElementById("textarea").style.color = "white";
    searchAgain.style.visibility = "hidden";
    holidayGrid.classList.remove("disablegrid");
  }

  function showPopup(productData) {
    // ... Your existing pop-up display logic ...

    // Set the pop-up content with the product information
    const popupImage = document.getElementById("popup-image");
    const popupName = document.getElementById("popup-name");
    const popupBrand = document.getElementById("popup-brand");
    const popupDescription = document.getElementById("popup-description");
    const popupPrice = document.getElementById("popup-price");
    const popupLink = document.getElementById("popup-link");

    popupImage.src = productData.image;
    popupName.textContent = productData.name;
    popupBrand.textContent = productData.brand;
    popupDescription.textContent = productData.description;
    popupPrice.textContent = productData.price;
    popupLink.href = productData.link;

    popupContainer.style.display = "block";
  }

  // Function to hide the pop-up
  function hidePopup() {
    popupContainer.style.display = "none";
  }

