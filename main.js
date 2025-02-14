import './style.css';

const imageContainer = document.getElementById('image-container');
const searchInput = document.getElementById('search-input');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const closeButton = document.querySelector('.close-button');

const apiKey = 'CQb241jWKUSfQ25zLdeZ_C7pJdMG86ENziOqluQaCEk';
// Number of images to load per page
const imagesPerPage = 12;
let currentPage = 1;
let currentSearchQuery = '';
// Store the fetched images
let imagesData = [];

async function fetchImages(query = '', page = 1) {
  try {
    let apiUrl = `https://api.unsplash.com/photos/random?count=${imagesPerPage}&client_id=${apiKey}&page=${page}`;
    if (query) {
      apiUrl = `https://api.unsplash.com/search/photos?query=${query}&per_page=${imagesPerPage}&client_id=${apiKey}&page=${page}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Handle different API responses based on whether a search query is used
    const images = query ? data.results : data;

    if (page === 1) {
			// Reset imagesData on new search or initial load
      imagesData = images;
    } else {
			// Append to existing imagesData
      imagesData = imagesData.concat(images);
    }

    displayImages(images);

  } catch (error) {
    console.error('Error fetching images:', error);
    imageContainer.innerHTML = '<p>Failed to load images.</p>';
  }
}

function displayImages(images) {
  if (currentPage === 1) {
		// Clear existing images only on the first page
    imageContainer.innerHTML = '';
  }

  images.forEach((image, index) => {
    const img = document.createElement('img');
		// Handle different API responses
    const imageUrl = image.urls ? image.urls.regular : image.urls.full;
    img.src = imageUrl;
    img.alt = image.alt_description || 'Image from Unsplash';
    img.classList.add('gallery-image');
    img.dataset.index = imagesData.length > imagesPerPage ? imagesData.length - images.length + index : index; // Store the index for lightbox and download

    const downloadIcon = document.createElement('i');
		// Font Awesome download icon
    downloadIcon.classList.add('fas', 'fa-download', 'download-icon');
    downloadIcon.dataset.index = imagesData.length > imagesPerPage ? imagesData.length - images.length + index : index;

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('image-wrapper');
    imageWrapper.appendChild(img);
    imageWrapper.appendChild(downloadIcon);

    imageContainer.appendChild(imageWrapper);

    // Lightbox functionality
    img.addEventListener('click', () => {
      openLightbox(imageUrl);
    });

    // Download functionality
    downloadIcon.addEventListener('click', (event) => {
			// Prevent the image click from triggering
      event.stopPropagation();
      downloadImage(parseInt(downloadIcon.dataset.index, 10));
    });
  });
}

function openLightbox(imageUrl) {
  lightboxImage.src = imageUrl;
  lightbox.style.display = 'flex';
}

function closeLightbox() {
  lightbox.style.display = 'none';
}

function downloadImage(index) {
  const image = imagesData[index];
	// Handle different API responses
  const imageUrl = image.urls ? image.urls.regular : image.urls.full; 
  const imageName = image.alt_description || 'image';
  const link = document.createElement('a');
  link.href = imageUrl;
	// Or use the original filename if available
  link.download = `${imageName}.jpg`;
	// Open in a new tab
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event listeners
searchInput.addEventListener('input', (event) => {
  currentSearchQuery = event.target.value.trim();
	// Reset to the first page on new search
  currentPage = 1; 
  fetchImages(currentSearchQuery, currentPage);
});

closeButton.addEventListener('click', closeLightbox);

// Infinite scroll
window.addEventListener('scroll', () => {
  if (
		// Adjust the offset as needed
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 200
  ) {
    currentPage++;
    fetchImages(currentSearchQuery, currentPage);
  }
});

// Initial image load
fetchImages();
