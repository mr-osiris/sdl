document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('recentItems')) {
        loadRecentItems();
    }
});

function loadRecentItems() {
    const recentItemsContainer = document.getElementById('recentItems');
    
    recentItemsContainer.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    fetch('/SDLProject/api/items.php')
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.length > 0) {
                recentItemsContainer.innerHTML = '';
                data.data.forEach(item => {
                    recentItemsContainer.appendChild(createItemCard(item));
                });
            } else {
                recentItemsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted">No items found.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            recentItemsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Error loading items. Please try again later.
                    </div>
                </div>
            `;
        });
}

function createItemCard(item) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    const badgeClass = item.type === 'lost' ? 'bg-danger' : 'bg-success';
    const badgeText = item.type === 'lost' ? 'Lost' : 'Found';
    const imageUrl = item.image_url || 'images/placeholder.jpg';
    
    col.innerHTML = `
        <div class="card h-100 item-card" data-id="${item.id}" style="cursor: pointer;">
            <div class="position-relative">
                <img src="${imageUrl}" class="card-img-top" alt="${item.title}" style="height: 200px; object-fit: cover;">
                <span class="position-absolute top-0 end-0 badge ${badgeClass} m-2">${badgeText}</span>
            </div>
            <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text small text-muted">
                    <i class="bi bi-geo-alt"></i> ${item.location}<br>
                    <i class="bi bi-calendar"></i> ${new Date(item.date_lost_found).toLocaleDateString()}
                </p>
                <p class="card-text">${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}</p>
            </div>
        </div>
    `;
    
    col.querySelector('.item-card').addEventListener('click', () => {
        showItemDetails(item);
    });
    
    return col;
}

function showItemDetails(item) {
    const modalHTML = `
        <div class="modal fade" id="itemDetailModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${item.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${item.image_url || 'images/placeholder.jpg'}" class="img-fluid rounded mb-3" alt="${item.title}">
                            </div>
                            <div class="col-md-6">
                                <p><strong>Type:</strong> <span class="badge ${item.type === 'lost' ? 'bg-danger' : 'bg-success'}">${item.type}</span></p>
                                <p><strong>Location:</strong> ${item.location}</p>
                                <p><strong>Date:</strong> ${new Date(item.date_lost_found).toLocaleDateString()}</p>
                                <hr>
                                <h5>Description</h5>
                                <p>${item.description}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('itemDetailModal'));
    modal.show();
    
    document.getElementById('itemDetailModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('itemDetailModal').remove();
    });
}