// Mock predefined users
const predefinedUsers = [
    { username: 'admin', password: 'admin123', role: 'Super Admin' },
    { username: 'storeUser', password: 'store123', role: 'Store Operation' },
    { username: 'purchaseUser', password: 'purchase123', role: 'Purchase Operation' }
];

// Initialize the products and handover requests
let products = JSON.parse(localStorage.getItem('products')) || [];
let filteredProducts = [...products];
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

// Initiate Handover Request
function initiateHandoverRequest(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('operator').value = currentUser.username;
        document.getElementById('handoverRequestModal').querySelector('.btn-close').click();
    }
}

// Handle Filter
function filterProducts() {
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
}

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

renderProductList();
