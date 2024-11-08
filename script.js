// Mock predefined users
const predefinedUsers = [
    { username: 'admin', password: 'admin123', role: 'Super Admin' },
    { username: 'storeUser', password: 'store123', role: 'Store Operation' },
    { username: 'purchaseUser', password: 'purchase123', role: 'Purchase Operation' }
];

// Initialize the products and handover requests
let products = JSON.parse(localStorage.getItem('products')) || [];
let filteredProducts = [...products];
let vendors = JSON.parse(localStorage.getItem('vendors')) || [];
let locations = JSON.parse(localStorage.getItem('locations')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Handle login
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = predefinedUsers.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        loadUserRoleFeatures(currentUser.role);
        renderProductList();
        window.location.href = 'managementAsset.html'; // Redirect to asset management page after login
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
});

// Handle logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html'; // Redirect to homepage after logout
}

// Load user role features
function loadUserRoleFeatures(role) {
    if (role === 'Super Admin' || role === 'Purchase Operation') {
        document.getElementById('addProductButton').style.display = 'block';
    }
}

// Render Product List in Table Format
function renderProductList() {
    const productTableBody = document.getElementById('productList');
    productTableBody.innerHTML = '';

    if (filteredProducts.length === 0) {
        document.getElementById('noProducts').style.display = 'block';
    } else {
        document.getElementById('noProducts').style.display = 'none';
        filteredProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${product.assetNo}</td>
                <td>${product.productModel}</td>
                <td>${product.productName}</td>
                <td>${product.status}</td>
                <td>₹${product.cost}</td>
                <td><button class="btn btn-info btn-sm" onclick="viewProductDetails(${product.id})">View</button></td>
                ${currentUser?.role === 'Super Admin' ? `<td><button class="btn btn-warning btn-sm" onclick="initiateHandoverRequest(${product.id})">Initiate Handover</button></td>` : ''}
            `;
            productTableBody.appendChild(row);
        });
    }
}

// View product details
function viewProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        alert(`Viewing details for: ${product.productName}`);
    }
}

// Apply Filters from the Filter Modal
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const model = document.getElementById('modelFilter').value;
    const costRange = parseInt(document.getElementById('costRange').value);
    const date = document.getElementById('dateFilter').value;

    filteredProducts = products.filter(product => {
        const matchesSearch = product.productName.toLowerCase().includes(searchTerm) || product.productModel.toLowerCase().includes(searchTerm) || product.assetNo.toLowerCase().includes(searchTerm);
        const matchesStatus = !status || product.status === status;
        const matchesModel = !model || product.productModel === model;
        const matchesCost = product.cost <= costRange;
        const matchesDate = !date || product.dateAdded === date;
        return matchesSearch && matchesStatus && matchesModel && matchesCost && matchesDate;
    });

    renderProductList();
    document.getElementById('filterMessage').style.display = 'block'; // Show "Filter applied" message
    setTimeout(() => document.getElementById('filterMessage').style.display = 'none', 3000); // Hide message after 3 seconds
    document.getElementById('filterModal').querySelector('.btn-close').click(); // Close the filter modal
}

// Update cost range display value
document.getElementById('costRange').addEventListener('input', function () {
    document.getElementById('costValue').textContent = '₹' + this.value;
});

// Export filtered products to CSV
function exportCSV() {
    const csvHeader = ['Select', 'Asset No', 'Product Model', 'Product Name', 'Asset Status', 'Cost'];
    const csvRows = [];

    filteredProducts.forEach(product => {
        const row = [
            '', // Select column (checkbox)
            product.assetNo,
            product.productModel,
            product.productName,
            product.status,
            product.cost
        ];
        csvRows.push(row.join(','));
    });

    const csvContent = [csvHeader.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products.csv';
    link.click();
}

// Add Product Form Submission
document.getElementById('addProductForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const product = {
        id: Date.now(), // Unique ID based on timestamp
        assetNo: 'A' + Date.now(), // Generate a unique asset number
        productModel: document.getElementById('productModel').value,
        manufacturer: document.getElementById('manufacturer').value,
        productCategory: document.getElementById('productCategory').value,
        poNumber: document.getElementById('poNumber').value,
        invoiceNumber: document.getElementById('invoiceNumber').value,
        vendorName: document.getElementById('vendorName').value,
        cost: parseInt(document.getElementById('cost').value),
        deliveryDate: document.getElementById('deliveryDate').value,
        warranty: document.getElementById('warranty').value,
        submittedBy: currentUser.username,
        assetStatus: 'Waiting for Store Enrol',
        dateAdded: new Date().toISOString().split('T')[0] // Add date for filtering
    };

    products.push(product);
    localStorage.setItem('products', JSON.stringify(products)); // Store products in localStorage
    alert('Product added successfully!');
    window.location.href = 'managementAsset.html'; // Redirect to asset management page
});

// Add Vendor Form Submission
document.getElementById('addVendorForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const vendor = {
        manufacturer: document.getElementById('vendorManufacturer').value,
        contactPerson: document.getElementById('contactPerson').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        productServices: document.getElementById('productServices').value
    };
    
    vendors.push(vendor);
    localStorage.setItem('vendors', JSON.stringify(vendors)); // Store vendors in localStorage
    alert('Vendor added successfully!');
});

// Add Location Form Submission
document.getElementById('addLocationForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const location = {
        location: document.getElementById('location').value,
        floor: document.getElementById('floor').value,
        roomNumber: document.getElementById('roomNumber').value,
        building: document.getElementById('building').value
    };
    
    locations.push(location);
    localStorage.setItem('locations', JSON.stringify(locations)); // Store locations in localStorage
    alert('Location added successfully!');
});

// Initialize the page with the product list
renderProductList();
