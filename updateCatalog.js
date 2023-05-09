function updateCatalog() {

      giftsRef.get().then((querySnapshot) => {
      catalogGrid.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        const card = cardTemplate.cloneNode(true);

        card.querySelector("#product_image").src = data.image_url,
        card.querySelector("#name").textContent = data.name,
        card.querySelector("#price").textContent = `$${data.price}`,
        card.querySelector("#description").textContent = data.description,
        card.querySelector("#keywords").textContent = data.openai_keywords + ',' + data.image_labels,
        card.querySelector("#link-container").href = data.product_link

        catalogGrid.appendChild(card);

        card.addEventListener('mouseenter', () => {
            card.animate([
             { transform: 'scale(1)' },
             { transform: 'scale(1.05)' }
             ], {
            duration: 200,
            fill: 'forwards'
            });
        });

        card.addEventListener('mouseleave', () => {
            card.animate([
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
            ], {
            duration: 200,
            fill: 'forwards'
            });
          });
         });
        });
      }
