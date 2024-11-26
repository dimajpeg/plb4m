document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM полностью загружен и разобран");

    // Корзина
    let cart = [];

    // Загрузка корзины из локального хранилища
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    }

    // Сохранение корзины в локальное хранилище
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Элементы для index.html и products.html
    const productList = document.getElementById('product-list');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search');
    const sortSelect = document.getElementById('sort');
    console.log("Элементы productList, categoryFilter, searchInput и sortSelect получены:", productList, categoryFilter, searchInput, sortSelect);

    // Элементы для cart.html
    const orderedItems = document.getElementById('ordered-items');
    const emailInput = document.getElementById('email');
    const checkoutButton = document.getElementById('checkout');
    console.log("Элементы orderedItems, emailInput и checkoutButton получены:", orderedItems, emailInput, checkoutButton);

    // Функция обновления отображения корзины
    function updateCartDisplay() {
        console.log("Обновление отображения корзины");
        if (orderedItems) {
            orderedItems.innerHTML = '';

            if (cart.length === 0) {
                orderedItems.innerHTML = 'Корзина пуста';
                return;
            }

            cart.forEach((item) => {
                const total = (item.price * item.quantity).toFixed(2);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td><input type="number" class="quantity-input" data-id="${item.id}" value="${item.quantity}" min="1"></td>
                    <td>$${total}</td>
                    <td><button class="remove-item" data-id="${item.id}">Удалить</button></td>
                `;
                orderedItems.appendChild(row);
            });
        }
    }

    // Добавление товара в корзину (для index.html)
    if (productList) {
        productList.addEventListener('click', (e) => {
            console.log("Клик по productList");

            if (e.target && e.target.classList.contains('add-to-cart')) {
                console.log("Клик по кнопке 'add-to-cart'");

                const productElement = e.target.closest('li');
                const productId = parseInt(productElement.dataset.id, 10);
                const productName = productElement.dataset.name;
                const productPrice = parseFloat(productElement.dataset.price);
                const quantityInput = productElement.querySelector('.quantity-input');

                if (quantityInput) {
                    const quantity = parseInt(quantityInput.value, 10);

                    const cartItem = cart.find((item) => item.id === productId);

                    if (cartItem) {
                        cartItem.quantity += quantity;
                    } else {
                        cart.push({
                            id: productId,
                            name: productName,
                            price: productPrice,
                            quantity: quantity,
                        });
                    }

                    saveCart();
                    updateCartDisplay();
                    alert(`${productName} добавлен в корзину.`);
                } else {
                    console.error('Элемент quantityInput не найден');
                }
            }
        });
    }

    // Удаление товара из корзины (для cart.html)
    if (orderedItems) {
        orderedItems.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const productId = parseInt(e.target.dataset.id, 10);
                cart = cart.filter((item) => item.id !== productId);
                saveCart();
                updateCartDisplay();
            }
        });

        // Изменение количества товара (для cart.html)
        orderedItems.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const productId = parseInt(e.target.dataset.id, 10);
                const newQuantity = parseInt(e.target.value, 10);

                const cartItem = cart.find((item) => item.id === productId);
                if (cartItem && newQuantity > 0) {
                    cartItem.quantity = newQuantity;
                    saveCart();
                    updateCartDisplay();
                } else if (newQuantity <= 0) {
                    cart = cart.filter((item) => item.id !== productId);
                    saveCart();
                    updateCartDisplay();
                }
            }
        });

        // Оформление заказа (для cart.html)
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                if (cart.length === 0) {
                    alert('Ваша корзина пуста!');
                    return;
                }

                const email = emailInput.value;
                if (!email) {
                    alert('Пожалуйста, введите адрес электронной почты.');
                    return;
                }

                const emailBody = `Your order from Everything shop:\n\n` + cart.map((item) => {
                    return `${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`;
                }).join('\n');

                fetch('/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, emailBody }),
                })
                    .then((response) => {
                        if (response.ok) {
                            alert('Заказ успешно оформлен!');
                            cart = [];
                            saveCart();
                            updateCartDisplay();
                        } else {
                            alert('Не удалось оформить заказ. Попробуйте снова.');
                        }
                    })
                    .catch((error) => {
                        console.error('Ошибка:', error);
                        alert('Произошла ошибка. Попробуйте снова.');
                    });
            });
        }
    }

    // Фильтрация товаров по категории (для index.html и products.html)
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            const selectedCategory = categoryFilter.value;

            document.querySelectorAll('#product-list li').forEach((item) => {
                const itemCategory = item.dataset.category;

                if (selectedCategory === '' || itemCategory === selectedCategory) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Поиск товаров (для products.html)
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();

            document.querySelectorAll('#product-list li').forEach((item) => {
                const itemName = item.textContent.toLowerCase();

                if (itemName.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Сортировка товаров (для products.html)
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const sortBy = sortSelect.value;
            const itemsArray = Array.from(document.querySelectorAll('#product-list li'));

            itemsArray.sort((a, b) => {
                const aText = a.textContent.toLowerCase();
                const bText = b.textContent.toLowerCase();

                if (sortBy === 'name') {
                    return aText.localeCompare(bText);
                } else if (sortBy === 'price') {
                    const aPrice = parseFloat(aText.match(/\$(\d+(\.\d+)?)/)[1]);
                    const bPrice = parseFloat(bText.match(/\$(\d+(\.\d+)?)/)[1]);
                    return aPrice - bPrice;
                }
            });

            const productList = document.getElementById('product-list');
            productList.innerHTML = '';
            itemsArray.forEach((item) => {
                productList.appendChild(item);
            });
        });
    }

    // Загрузка корзины при загрузке страницы
    loadCart();
});