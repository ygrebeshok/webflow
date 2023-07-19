<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ygrebeshok/webflow/style-recommendations-22.css">
<script src="https://cdn.jsdelivr.net/gh/ygrebeshok/webflow/upd-catalog-42.js"></script>
<!DOCTYPE html>
<html>
  <body>
  <div id="content">
  	<div id="loader"></div>
    <div id="loader-text">Just a second, please</div>
  </div>
<script src="//unpkg.com/string-similarity/umd/string-similarity.min.js"></script>
  
<script>
  const openaiApiKey = "XXXXXXXXXXXXXXXXXXXXXXXXX";
  window.addEventListener('load', function(){
  	const loader = document.getElementById('loader');
  	const content = document.getElementById('content');
  	content.style.display = 'none';
	});
  const firebaseConfig = {
		apiKey: "AIzaSyCiXlpWuCAoezO72hSsu_DZhKEbSCYPVuY",
    authDomain: "smappy-ai.firebaseapp.com",
    projectId: "smappy-ai",
    storageBucket: "smappy-ai.appspot.com",
    messagingSenderId: "1054219735418",
    appId: "1:1054219735418:web:c6871596bd39d95afd46c3",
    measurementId: "G-D56TMT6SBE"
	};
	firebase.initializeApp(firebaseConfig);
  
  var bodyAuth = document.body.getAttribute('data-user-auth');
  var bodyUnauth = document.body.getAttribute('data-user-unauth');

  firebase.auth().onAuthStateChanged(function(authUser) {
      user = authUser;

      if (user && bodyUnauth) {
        window.location.href = '/user';
      } else if (!user && bodyAuth) {
        window.location.href = '/log-in';
      }
  });
  
  searchAgain.style.visibility = "hidden";
  lottieLoader.style.visibility = "hidden";
  errorAlert.style.visibility = "hidden";
  document.getElementById("button-container").classList.add('disablegrid');
  mainButton.classList.add('disablegrid');
  textarea.addEventListener('input', checkInputs);
  holidayGrid.addEventListener('click', checkInputs);

  function checkInputs() {
  	document.getElementById("button-container").classList.remove('disablegrid');
    mainButton.classList.remove('disablegrid');
  }
  const holidayBack = document.getElementById("holiday-back");
	const giftsRef = firebase.firestore().collection("gifts");
  const holidayRef = firebase.firestore().collection("current-holiday");
  const catalogGrid = document.getElementById("catalog");
	const cardTemplate = document.querySelector(".card");
  const holidayCardTemplate = document.querySelector(".holiday-card");
  const defaultCard = document.querySelector(".default-card");
  const defaultHoliday = document.querySelector(".holiday-default-card");
  catalogGrid.removeChild(defaultCard);
	holidayContainer.removeChild(defaultHoliday);
  
  updateCatalog();
  loadHolidayData();
  
  const brandCheckboxes = document.querySelectorAll('.brand-checkbox');
		brandCheckboxes.forEach(checkbox => {
    	checkbox.addEventListener('change', function() {
        handleBrandCheckboxChange(this);
    });
});

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
	
	closeFilters.addEventListener("click", async (event) => {
  	filtersContainer.classList.remove('show');
	});

	filterActivator.addEventListener("click", async (event) => {
  	filtersContainer.classList.add('show');
	});

  searchAgain.addEventListener("click", async (event) => {
    document.getElementById("textarea").disabled = false;
    errorAlert.style.visibility = "hidden";
    document.getElementById("textarea").style.color = "white";
    searchAgain.style.visibility = "hidden";
    holidayGrid.classList.remove('disablegrid');
  });
    
	const favoriteBtns = document.querySelectorAll('.favorite-btn');
  favoriteBtns.forEach(favoriteBtn => {
    favoriteBtn.addEventListener('click', toggleFavorite);
  });

  mainButton.addEventListener("click", async (event) => {
  	event.preventDefault();
    
    const priceRange = document.getElementById("price-range");
    const priceDisplay = document.getElementById("price-display");
    priceRange.value = priceRange.max;
    priceDisplay.textContent = `$0 - $${priceRange.max}`;
    
    resetBrandFilters();
    
  	document.getElementById("textarea").disabled = true;
    errorAlert.style.visibility = "hidden";
    holidayGrid.classList.add('disablegrid');
    searchAgain.style.visibility = "hidden";
    filtersContainer.style.visibility = "hidden";
    document.getElementById("textarea").style.color = "black";
    lottieLoader.style.visibility = "visible";
  	const text = document.getElementById("textarea").value;
		

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
    const responseText = data.choices[0].text;

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
		
// Вот здесь отредактированные keywords, и они добавляются во множество openaiKeywords уже для порога в stringSimilarity
    const openaiKeywords = new Set(keywords);
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
  });
  </script>
 </body>
</html>
