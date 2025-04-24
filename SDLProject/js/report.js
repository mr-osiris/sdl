document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('itemDate').value = new Date().toISOString().substring(0, 10);

    document.getElementById('itemReportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitItemReport();
    });
    
    const imageInput = document.getElementById('itemImage');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file type
            if (!file.type.match('image.*')) {
                alert('Please select an image file (JPEG, PNG)');
                e.target.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                let preview = document.getElementById('imagePreview');
                const formGroup = e.target.closest('.mb-3') || e.target.parentNode;
                
                if (!preview) {
                    preview = document.createElement('div');
                    preview.id = 'imagePreview';
                    preview.className = 'mt-2 text-center';
                    formGroup.appendChild(preview);
                }
                preview.innerHTML = `
                    <img src="${e.target.result}" class="img-thumbnail" style="max-height: 200px;">
                    <button type="button" class="btn btn-sm btn-danger mt-2" onclick="document.getElementById('imagePreview').remove(); document.getElementById('itemImage').value=''">Remove Image</button>
                `;
            };
            reader.onerror = function() {
                alert('Error reading the image file');
            };
            reader.readAsDataURL(file);
        });
    }
});

function submitItemReport() {
    const form = document.getElementById('itemReportForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';
    
    const formData = new FormData(form);
    
    fetch('/SDLProject/api/items.php', {
        method: 'POST',
        body: formData
    })
    .then(async response => {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            throw new Error(text || 'Invalid server response');
        }
    })
    .then(data => {
        if (data.success) {
            document.getElementById('reportForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
        } else {
            alert('Error: ' + (data.error || 'Submission failed'));
        }
    })
    .catch(error => {
        console.error('Full error:', error);
        alert('Error details: ' + error.message);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}