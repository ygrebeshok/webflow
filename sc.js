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

           visibleCards = Array.from(visibleCards).filter(card => {
             let subjectCategory = card.querySelector("#subject-category").textContent;
             return subject_reference === subjectCategory;
           });

           // Prioritize cards based on age, subject, and personality references
           let topCards = [];
           let middleCards = [];
           let bottomCards = [];

           visibleCards.forEach((card) => {
             let ageCategory = card.querySelector("#age-category").textContent;
             let category = card.querySelector("#category").textContent;
             let subjectCategory = card.querySelector("#subject-category").textContent;

             if (ageCategory === age_reference && category === personality_reference && subjectCategory === subject_reference) {
               topCards.push(card);
             } else if (ageCategory === age_reference || category === personality_reference || subjectCategory === subject_reference) {
               middleCards.push(card);
             } else {
               bottomCards.push(card);
             }
           });

           visibleCards = topCards.concat(middleCards).concat(bottomCards);
           
         });
