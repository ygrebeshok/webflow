
  // Function to initialize the app
  function initializeApp() {
    setupUI();
    mainButton.addEventListener("click", recommend);
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
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
      const who = ["Mom", "Dad", "Sister", "Brother", "Grandma", "Grandpa", "Family", "Friend", "Colleague", "Acquaintance", "Dog", "Cat"];
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
        keywordsToExclude.push("woman", "women", "girl", "stylish");
      } else if (selected_who === "Mom" || selected_who === "Grandma" || selected_who === "Sister") {
        keywordsToExclude.push("man", "men", "boy");
      }
      
      const response = await fetch("https://api.openai.com/v1/engines/text-davinci-003/completions", {
        method: "POST",
        headers: {
      	  "Content-Type": "application/json",
       	  "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
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
          card.style.display = "none";
        } else {
          visibleCards.push(card);
          card.style.display = "";
        }
      } else {
        card.style.display = "none"; // Hide the card if it has excludable keywords
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
    profileArea.style.opacity = '1';
    profileArea.classList.remove("disablegrid");
      
    setTimeout(function() {
      instruction.style.opacity = '1';
      instruction.style.transform = 'translateX(0)';
    }, 500);

    setTimeout(function() {
      instruction.style.opacity = '0';
      instruction.style.display = "none";
      instruction.style.transition = 'opacity 0.5s ease';
    }, 6000);

     } catch (error) {
       console.error(error);
       errorAlert.style.visibility = "visible";
       lottieLoader.style.visibility = "hidden";
       searchAgain.style.visibility = "visible";
     }
  }

  function setupUI() {
    if (textarea.value.trim() !== '') {
        mainButton.classList.remove('disablegrid');
    } else {
        mainButton.classList.add('disablegrid');
    }
    
    searchAgain.style.visibility = "hidden";
    lottieLoader.style.visibility = "hidden";
    errorAlert.style.visibility = "hidden";
    document.getElementById("button-container").classList.add('disablegrid');
    textarea.addEventListener('input', checkInputs);
    holidayGrid.addEventListener('click', checkInputs);
    whoGrid.addEventListener('click', checkInputs);

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

