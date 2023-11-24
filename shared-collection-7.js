const urlParams = new URLSearchParams(window.location.search);
const collectionName = urlParams.get('collectionName');
const userEmail = urlParams.get('userEmail');

document.getElementById('user-email-text').textContent = "This collection belongs to the user with the email: " + userEmail;

document.querySelectorAll('#choose-btn').forEach(btn => {
  btn.style.display = 'none';
});

const shareCollectionName = document.getElementById('share-collection-name');
shareCollectionName.textContent = collectionName;

const products = [];
urlParams.getAll('productId').forEach((productId, index) => {
  const productImage = urlParams.getAll('productImage')[index];
  products.push({ productId, productImage });
});

const shareCollectionGrid = document.getElementById('share-collection-grid');
const shareCollectionCardTemplate = document.querySelector('.share-collection-card');
const popupFadeShareCollection = document.getElementById('popup-fade-share-collection')
const subjectForEmailContainer = document.getElementById('subject-for-email-container');
const successEmail = document.getElementById('success-email');

shareCollectionGrid.innerHTML = '';
popupFadeShareCollection.style.display = "none";
subjectForEmailContainer.style.display = "none";
successEmail.style.display = "none";

products.forEach(product => {
  const shareCollectionCard = shareCollectionCardTemplate.cloneNode(true);
  shareCollectionCard.querySelector('#share-collection-card-cover').src = product.productImage;
  shareCollectionCard.querySelector('#share-collection-card-title').textContent = product.productId;
  shareCollectionGrid.appendChild(shareCollectionCard);
  
  shareCollectionCard.querySelector('#link-block-product-shared').addEventListener('click', () => {
    showPopupForSharedCollection(shareCollectionCard.querySelector('#share-collection-card-title').textContent);
  });
  
  shareCollectionCard.querySelector('#choose-btn').addEventListener('click', () => {
    shareCollectionCard.querySelector('#choose-btn-cover').src = 'https://firebasestorage.googleapis.com/v0/b/smappy-ai.appspot.com/o/filled%20circle_600x600.png?alt=media&token=90732f55-23d3-4fad-b5ee-eaccb5af9553';
  });
});


const copyLinkButton = document.getElementById('copy-link-button');

copyLinkButton.addEventListener('click', () => {
  const currentUrl = window.location.href;

  const tempInput = document.createElement('input');
  tempInput.value = currentUrl;

  document.body.appendChild(tempInput);

  tempInput.select();
  tempInput.setSelectionRange(0, 99999);

  document.execCommand('copy');

  document.body.removeChild(tempInput);

  copyLinkButton.textContent = "Copied!"
  setTimeout(() => {
    copyLinkButton.textContent = "Copy the link to this page"
  }, 3000);
});

const selectGiftsBtn = document.getElementById('select-gifts-btn');

selectGiftsBtn.addEventListener('click', () => {
  if (selectGiftsBtn.textContent === "Select the gifts I like") {
    selectGiftsBtn.textContent = "Done";
    document.querySelectorAll('#choose-btn').forEach(btn => {
      btn.style.display = 'block';
    });
    
    document.querySelectorAll('#link-block-product-shared').forEach(btn => {
      btn.style.pointerEvents = 'none';
    });
    
    document.querySelectorAll('.share-collection-card').forEach(card => {
      card.classList.remove('donate');
    }); 
    
  } else if (selectGiftsBtn.textContent === "Done") {
  
    const productCards = document.querySelectorAll('.share-collection-card');
    const selectedProductTitles = [];

    productCards.forEach(card => {

      const titleElement = card.querySelector('#share-collection-card-title');
      const chooseBtnCoverElement = card.querySelector('#choose-btn-cover');

      if (chooseBtnCoverElement.src === 'https://firebasestorage.googleapis.com/v0/b/smappy-ai.appspot.com/o/filled%20circle_600x600.png?alt=media&token=90732f55-23d3-4fad-b5ee-eaccb5af9553') {
        selectedProductTitles.push(titleElement.textContent);
      }
    });

    
    subjectForEmailContainer.style.display = 'flex';
    const sendEmailBtn = document.getElementById('send-email-btn');
    
    sendEmailBtn.addEventListener('click', () => {
      sendEmail(userEmail, collectionName, selectedProductTitles);
    });
  
    selectGiftsBtn.textContent = "Select the gifts I like";
    
    document.querySelectorAll('#choose-btn').forEach(btn => {
      btn.style.display = 'none';
    });
    
    document.querySelectorAll('#choose-btn-cover').forEach(btn => {
      btn.src = 'https://firebasestorage.googleapis.com/v0/b/smappy-ai.appspot.com/o/empty%20circle_600x600.png?alt=media&token=e68d9e00-3552-4c85-bdd3-dffa05d23f41';
    });
    
    document.querySelectorAll('#link-block-product-shared').forEach(btn => {
      btn.style.pointerEvents = '';
    });
  
    document.querySelectorAll('.share-collection-card').forEach(card => {
      card.classList.add('donate');
    }); 
  }
});

const popupCloseShareCollection = document.getElementById('popup-close-share-collection')

popupCloseShareCollection.addEventListener('click', () => {
  popupFadeShareCollection.style.display = 'none';
  popupTitle.textContent = '';
  popupBrand.textContent = '';
  popupDesc.textContent = '';
  popupPrice.textContent = '';
});

const popupTitle = document.getElementById('popup-title-share-collection');
const popupBrand = document.getElementById('popup-brand-share-collection');
const popupDesc = document.getElementById('popup-desc-share-collection');
const popupPrice = document.getElementById('popup-price-share-collection');


function showPopupForSharedCollection(productName) {

  const slideContainer = document.querySelector('.slides');
  const thumbnailContainer = document.querySelector('.thumbnails');
  slideContainer.innerHTML = '';
  thumbnailContainer.innerHTML = '';

  const giftsRef = firebase.firestore().collection('added-by-parsing');

  giftsRef
  .where('name', '==', productName)
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const productData = doc.data();

      popupTitle.textContent = productData.name;
      popupBrand.textContent = productData.brand;
      popupDesc.textContent = productData.description;
      popupPrice.textContent = `$${productData.price}`;

      productData.images.forEach(imageUrl => {
        const thumbnail = document.createElement('div');
        thumbnail.classList.add('thumbnail');
        thumbnail.innerHTML = `<img src="${imageUrl}" alt="Thumbnail">`;
        thumbnailContainer.appendChild(thumbnail);

        const slide = document.createElement('div');
        slide.classList.add('slide');
        slide.innerHTML = `<img src="${imageUrl}" alt="Product Image">`;
        slideContainer.appendChild(slide);
      })

      const slides = document.querySelector('.slides');
      const thumbnails = document.querySelectorAll('.thumbnail');
      let currentSlide = 0;

      function updateThumbnails() {
        thumbnails.forEach((thumbnail, index) => {
          if (index === currentSlide) {
            thumbnail.classList.add('active');
          } else {
            thumbnail.classList.remove('active');
          }
        });
      }

      function showSlide(slideIndex) {
        slides.style.transform = `translateX(-${slideIndex * 100}%)`;
        currentSlide = slideIndex;
        updateThumbnails();
      }

      thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function() {
          showSlide(index);
        });
      });

    showSlide(currentSlide);
    });
  });

  popupFadeShareCollection.style.display = "flex";
}

async function sendEmail(userEmail, collectionName, selectedProducts) {
    const subject = document.getElementById('subject-name').value;

    const selectedProductsHTML = selectedProducts.map(product => `
    <div style="text-align: center;">
      <img src="${product.image}" alt="${product.title}" style="max-width: 100%; max-height: 100px;">
        <p>${product.title}</p>
    </div>
  `).join('');

    var data = {
        service_id: 'service_ul2j91r',
        template_id: 'template_0dbcy8h',
        user_id: 'itqPvk6ktAUpJxEYV',
        template_params: {
            'userEmail': userEmail,
            'collectionName': collectionName,
            'subject': subject,
            'selectedProducts': selectedProducts.join('\n')
        }
    };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
          successEmail.style.display = 'block';

          setTimeout(() => {
            successEmail.style.display = 'none';
          }, 5000);       
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        alert('Oops... ' + error.message);
    }
}
  
  const subjectForEmailClose = document.getElementById('subject-for-email-close');
  
  subjectForEmailClose.addEventListener('click', () => {
    subjectForEmailContainer.style.display = 'none';
    document.getElementById('subject-name').value = '';
  });
