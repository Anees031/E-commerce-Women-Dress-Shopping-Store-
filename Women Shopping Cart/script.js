const config = {
    useEventCapturing: false,
    logPropagationPaths: true
};

const coupons = {
    SAVE10: 0.1 
};
let appliedCoupon = null;

function logEvent(message, event = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${message}`;

    if (event && config.logPropagationPaths) {
        let path = [];

        if (typeof event.composedPath === 'function') {
            path = event.composedPath()
                .filter(el => el instanceof HTMLElement)
                .map(el => el.tagName.toUpperCase());
        } else {
            let current = event.target;
            path = [];
            while (current && current instanceof HTMLElement) {
                path.push(current.tagName.toUpperCase());
                current = current.parentElement;
            }
        }

        if (config.useEventCapturing) {
            path = path.reverse();
        }

        logMessage += `\nPropagation Path: ${path.join(' -> ')}`;
        logMessage += `\nMode: ${config.useEventCapturing ? 'CAPTURING' : 'BUBBLING'}`;
    } else {
        logMessage += `\nMode: ${config.useEventCapturing ? 'CAPTURING' : 'BUBBLING'}`;
    }

    const eventLogs = document.getElementById('eventLogs');
    if (eventLogs) {
        eventLogs.textContent += `${logMessage}\n`;
        eventLogs.scrollTop = eventLogs.scrollHeight;
    }
}

function toggleEventMode(event) {
    config.useEventCapturing = !config.useEventCapturing;
    const mode = config.useEventCapturing ? 'CAPTURING' : 'BUBBLING';
    logEvent(`Event mode changed to: ${mode}`, event);
    setupEventListeners();
}

const cartIcon = document.getElementById('cartIcon');
const shoppingCart = document.getElementById('shopping-cart');

cartIcon.addEventListener('click', function(event) {
  event.preventDefault();
  shoppingCart.style.display = 'block';
});

function setupEventListeners() {
    const productCards = document.getElementById('product-cards');
    const applyCouponBtn = document.getElementById('applyCoupon');
    const cartIcon = document.getElementById('cartIcon');
    const purchaseBtn = document.querySelector('.btn-purchase');
    const eventModeToggle = document.getElementById('eventModeToggle');

    if (productCards) productCards.replaceWith(productCards.cloneNode(true));
    if (applyCouponBtn) applyCouponBtn.replaceWith(applyCouponBtn.cloneNode(true));
    if (cartIcon) cartIcon.replaceWith(cartIcon.cloneNode(true));
    if (purchaseBtn) purchaseBtn.replaceWith(purchaseBtn.cloneNode(true));
    if (eventModeToggle) eventModeToggle.replaceWith(eventModeToggle.cloneNode(true));

    document.getElementById('product-cards').addEventListener('click', function(event) {
        if (event.target.classList.contains('shop-item-button') || 
            event.target.closest('.shop-item-button')) {
            addToCartClicked(event);
        }
    }, config.useEventCapturing);

    document.getElementById('applyCoupon').addEventListener('click', applyCoupon, config.useEventCapturing);
    document.getElementById('cartIcon').addEventListener('click', toggleCartVisibility, config.useEventCapturing);
    document.querySelector('.btn-purchase').addEventListener('click', purchaseClicked, config.useEventCapturing);
    document.getElementById('eventModeToggle').addEventListener('click', toggleEventMode, config.useEventCapturing);
}

function init() {
    setupEventListeners();
    logEvent('Application initialized');
}

const allFilterItems = document.querySelectorAll('.filter-item');
const allFilterBtns = document.querySelectorAll('.filter-btn');

window.addEventListener('DOMContentLoaded', () => {
    if (allFilterBtns[1]) {
        allFilterBtns[1].classList.add('active-btn');
    }
});

allFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        showFilteredContent(btn);
    });
});

function showFilteredContent(btn) {
    allFilterItems.forEach((item) => {
        if (item.classList.contains(btn.id)) {
            resetActiveBtn();
            btn.classList.add('active-btn');
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

function resetActiveBtn() {
    allFilterBtns.forEach((btn) => {
        btn.classList.remove('active-btn');
    });
}

function toggleCartVisibility(event) {
    event.preventDefault();
    const cartSection = document.getElementById('shopping-cart');
    const eventLogsSection = document.getElementById('event-logs');
    const isVisible = cartSection.style.display === 'none';
    
    cartSection.style.display = isVisible ? 'block' : 'none';
    eventLogsSection.style.display = isVisible ? 'block' : 'none';
    
    logEvent(isVisible ? 'Cart and event logs displayed' : 'Cart and event logs hidden', event);
}

function purchaseClicked(event) {
    const cartItems = document.getElementsByClassName('cart-items')[0];

    if (cartItems.childElementCount === 0) {
        alert('First add items to the cart!');
        logEvent('Purchase attempted with empty cart', event);
        return;
    }

    logEvent('Purchase button clicked', event);
    alert('Thank you for your purchase!!!');
    
    while (cartItems.hasChildNodes()) {
        cartItems.removeChild(cartItems.firstChild);
    }

    appliedCoupon = null;
    updateCartTotal();
    logEvent('Cart cleared after purchase', event);
}

function removeCartItem(event) {
    event.stopPropagation();
    const buttonClicked = event.target;
    const itemTitle = buttonClicked.parentElement.parentElement.querySelector('.cart-item-title').innerText;
    logEvent(`Item removed: ${itemTitle}`, event);
    buttonClicked.parentElement.parentElement.remove();
    updateCartTotal();
}

function quantityChanged(event) {
    const input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    const itemTitle = input.parentElement.parentElement.querySelector('.cart-item-title').innerText;
    logEvent(`Quantity changed for ${itemTitle}: ${input.value}`, event);
    updateCartTotal();
}

function applyCoupon(event) {
    const code = document.getElementById('couponCode').value.trim();
    if (coupons.hasOwnProperty(code) && code === 'SAVE10') {
        appliedCoupon = code;
        updateCartTotal();
        logEvent(`Coupon applied: ${code} (${coupons[code] * 100}% off)`, event);
        alert(`Coupon ${code} applied! ${coupons[code] * 100}% off`);
        document.getElementById('couponCode').value = '';
        document.querySelector('.cart-discount').style.display = 'flex';
    } else {
        logEvent(`Invalid coupon code attempted: ${code}`, event);
        alert('Invalid coupon code');
    }
}

function addToCartClicked(event) {
    const button = event.target.classList.contains('shop-item-button') ? event.target : event.target.closest('.shop-item-button');
    const shopItem = button.parentElement.parentElement;
    const title = shopItem.getElementsByClassName('shop-item-title')[0].innerText;
    const price = shopItem.getElementsByClassName('shop-item-price')[0].innerText;
    const imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src;
    addItemToCart(title, price, imageSrc);
    updateCartTotal();
    logEvent(`Add to cart button clicked for: ${title}`, event);
}

function addItemToCart(title, price, imageSrc) {
    const cartRow = document.createElement('tr');
    cartRow.classList.add('cart-row');
    const cartItems = document.getElementsByClassName('cart-items')[0];
    const cartItemNames = cartItems.getElementsByClassName('cart-item-title');

    for (let i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText === title) {
            logEvent(`Attempted to add duplicate item: ${title}`);
            alert('This item is already in the cart!');
            return;
        }
    }

    const cartRowContents = `
        <td class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="50" height="50">
            <span class="cart-item-title">${title}</span>
        </td>
        <td class="cart-item cart-column">
            <span class="cart-price cart-column">${price}</span>
        </td>
        <td class="cart-item cart-column">
            <input class="cart-quantity-input" type="number" value="1" style="width: 50px;">
            <button class="btn btn-danger" type="button">Remove</button>
        </td>
    `;

    cartRow.innerHTML = cartRowContents;
    cartItems.append(cartRow);
    
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener(
        'click', 
        removeCartItem, 
        config.useEventCapturing
    );
    
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener(
        'change', 
        quantityChanged, 
        config.useEventCapturing
    );
    
    document.getElementById('cartCount').textContent = cartItems.getElementsByClassName('cart-row').length;
}

function updateCartTotal() {
    const cartItemContainer = document.getElementsByClassName('cart-items')[0];
    const cartRows = cartItemContainer.getElementsByClassName('cart-row');
    let subtotal = 0;

    for (let i = 0; i < cartRows.length; i++) {
        const cartRow = cartRows[i];
        const priceElement = cartRow.getElementsByClassName('cart-price')[0];
        const quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];
        const price = parseFloat(priceElement.innerText.replace('Rs ', ''));
        const quantity = quantityElement.value;
        subtotal += price * quantity;
    }

    let discount = 0;
    if (appliedCoupon && coupons[appliedCoupon]) {
        discount = subtotal * coupons[appliedCoupon];
    }

    const total = subtotal - discount;

    subtotal = Math.round(subtotal * 100) / 100;
    discount = Math.round(discount * 100) / 100;
    document.getElementsByClassName('cart-subtotal-price')[0].innerText = `Rs ${subtotal.toFixed(2)}`;
    document.getElementsByClassName('cart-discount-amount')[0].innerText = `- Rs ${discount.toFixed(2)}`;
    document.getElementsByClassName('cart-total-price')[0].innerText = `Rs ${total.toFixed(2)}`;
    document.getElementById('cartCount').textContent = cartRows.length;

    if (!appliedCoupon) {
        document.querySelector('.cart-discount').style.display = 'none';
    }

    logEvent(`Cart updated - Subtotal: Rs ${subtotal.toFixed(2)}, Discount: Rs ${discount.toFixed(2)}, Total: Rs ${total.toFixed(2)}`);
}

document.addEventListener('DOMContentLoaded', init);
