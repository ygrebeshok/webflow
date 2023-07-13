// Get a reference to the Firestore service
var holidayDb = firebase.firestore();

// Get the "current-holiday" collection
holidayDb.collection("current-holiday").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());

        // Get the data from the document
        var data = doc.data();
        
        // Populate the HTML elements
        document.getElementById('holiday-title').textContent = data.name;
        document.getElementById('holiday-desc').textContent = data.description;
        
        var holidayImage = document.getElementById('holiday-image');
        holidayImage.src = data.image_url;
        holidayImage.alt = data.name;
        
        var holidayLink = document.getElementById('holiday-link');
        holidayLink.href = data.product_link;
        
        document.getElementById('holiday-price').textContent = data.price;
    });
}).catch((error) => {
    console.log("Error getting documents: ", error);
});






