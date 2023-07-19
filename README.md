# webflow Smappy AI
This is main repo for Smappy AI code. 

Main.js
The main code script for recommendations.

When mainButton is clicked, the process for sending prompt to OpenAI is initialized.
In fetchOpenAIResponse(text) a prompt to Open AI is sent, the response is stored then as "responseText".
Then in extractKeywords() the "responseText" is taken and edited: paragraphs are removed, the text is split into array, then every keyword is cleaned as well.

handleSearch() - function of mainButton

