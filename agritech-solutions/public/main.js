const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const browseLink = document.getElementById('browseLink');
const loading = document.getElementById('loading');
const result = document.getElementById('result');

// Prevent default behavior for drag-and-drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
});

// Handle file drop
dropArea.addEventListener('drop', handleDrop, false);

// Trigger file input on 'browse' link click
browseLink.addEventListener('click', () => fileInput.click());

// Handle file input selection
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        uploadFile(file);
    }
}

// Upload file function
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    // Show loading indicator
    loading.style.display = 'block';
    result.innerHTML = '';  // Clear previous results

    try {
        const response = await fetch('/upload-image', {
            method: 'POST',
            body: formData
        });

        const resultData = await response.json();

        // Hide loading indicator
        loading.style.display = 'none';

        if (response.ok) {
            // Display the analysis result
            if (resultData.analysis) {
                result.innerHTML = `
                    <h3>Analysis Result</h3>
                    <p><strong>Name:</strong> ${resultData.analysis.name}</p>
                    <p><strong>Care Instructions:</strong> ${resultData.analysis.careInstructions}</p>
                `;
            } else {
                result.innerHTML = `<p>Sorry, no valid analysis available for this image.</p>`;
            }
        } else {
            // Display error message
            result.innerHTML = `<p>Error: ${resultData.error}</p>`;
        }
    } catch (error) {
        // Hide loading and show error message
        loading.style.display = 'none';
        result.innerHTML = `<p>An error occurred: ${error.message}</p>`;
    }
}

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Handle registration form submit
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
            result.innerHTML = `<p>${data.success}</p>`;
        } else {
            result.innerHTML = `<p>${data.error}</p>`;
        }
    } catch (error) {
        result.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});

// Handle login form submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
            result.innerHTML = `<p>${data.success}</p>`;
        } else {
            result.innerHTML = `<p>${data.error}</p>`;
        }
    } catch (error) {
        result.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
const geminiApiKey = process.env.GEMINI_API_KEY;

// Example of using the API key in a request
const geminiApiRequest = async (imageData) => {
    const response = await fetch('https://gemini.api/endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${geminiApiKey}`
        },
        body: JSON.stringify({ image: imageData })
    });

    const result = await response.json();
    return result;
};
