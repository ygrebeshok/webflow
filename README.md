# webflow Smappy AI
This is the main repo for Smappy AI code. 

Main.js
The main code script for recommendations.
All stuff related to forming keywords and filtering the catalogGrid using them is in recommend().

Going in details about recommend():

There are 2 checks for matching products.
1) Simple instersection of sets, card's keywords (which are obtained from Firebase) and Open AI's keywords are formatted correctly and turned into sets. Then it is checked whether intersection between these two sets exists.
2) String similarity. Card's title and description is again taken and splitted directly into additional keywords. If there are some similar (threshold = 0.6) Open AI's keywords to additional card's keywords, then the corresponding cards are pushed to appear in the catalog grid.

Upd-catalog.js
The script with collateral functions like brand and price filters, sorting, etc.

Style-recommendations.css
The css file where all properties for elements on Recommendations page are stored.

