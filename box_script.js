$(document).ready(function () {
	init();
	renderMetaFromStorage();
	renderBuildBoxFromStorage();
	renderCheckoutFromStorage();

	$(document)
		.on('click', '.plus-minus-button.plus', function () {
			const item_data = getItemData($(this));
			const $quant = $(this).closest('.ticker').find('input');
			const quant = parseInt($quant.val());

			if (quant == 6) {
				alert("You cannot add more than 6 of a single item");
				return;
			}

			let storage = JSON.parse(localStorage.getItem('buildBox') || "[]");
			let exists_in_storage = false;

			if (storage.length > 0) {
				for (const item of storage) {
					if (item.sku === item_data.sku) {
						item.quantity++;
						updateCheckoutItem(item_data.sku, 'add');
						exists_in_storage = true;
						break;
					}
				}
			}

			if (!exists_in_storage) {
				storage.push({
					sku: item_data.sku,
					quantity: 1
				});
				addCheckoutItem(item_data);
			}

			localStorage.setItem('buildBox', JSON.stringify(storage));
			updateCartRender();

			// if (quant < 6) { $quant[0].value = quant + 1; }

			updateBuildBoxQuantity(item_data.sku, quant + 1);
		})

		.on('click', '.plus-minus-button.minus', function () {
			const item_data = getItemData($(this));
			const $quant = $(this).closest('.ticker').find('input');
			const quant = parseInt($quant.val());
			let storage = JSON.parse(localStorage.getItem('buildBox') || "[]");
			for (const item of storage) {
				if (item.sku === item_data.sku) {
					item.quantity--;
					if (item.quantity == 0) {
						delete item;
					} break;
				}
			}
			localStorage.setItem('buildBox', JSON.stringify(storage)); if (quant > 0) {
				const item_data = getItemData($(this));
				updateCheckoutItem(item_data.sku, 'sub');
				updateCartRender();
				$quant[0].value = quant - 1;
			}
		})

		.on('click', '.cart-item .remove-button', function () {
			let $item = $(this).closest('.cart-item');
			let sku = $item.attr('data-sku');
			removeCartItem(sku);
			updateCartRender();
		})

		.on('change', 'input[type="radio"]', function () {
			let storage = JSON.parse(localStorage.getItem('buildBoxMeta') || "{}");
			storage.is_sub = $('input[type="radio"][name="subscription"]:checked').val() == "true";
			localStorage.setItem('buildBoxMeta', JSON.stringify(storage));
			evaluateSub(storage);
			resetCheckoutCart();
		})

		.on('change', '#sub_frequency', function () {
			let storage = JSON.parse(localStorage.getItem('buildBoxMeta') || "{}");
			storage.freq = $(this).val();
			localStorage.setItem('buildBoxMeta', JSON.stringify(storage));
			evaluateSub(storage);
			resetCheckoutCart();
		})

		.on('click', '#continueCheckoutButton', function () {
			let boxStatus = localStorage.getItem('buildBox');
			if (boxStatus == "[]") {
				event.preventDefault();
				alert('Your Box is empty. Add some products to get started!');
			}
		});
	;

	function updateCheckoutItem(sku, method) {
		const $quantity = $(`.cart-item[data-sku="${sku}"]`).find('.ticker-quantity input');
		if ($quantity) {
			const quantity = parseInt($quantity.val());
			if ($quantity) {
				if (method == 'add') {
					$quantity[0].value = quantity + 1;
				}
				if (method == 'sub') {
					$quantity[0].value = quantity - 1;
					if ((quantity - 1) == 0) {
						removeCartItem(sku);
					}
				}
			}
		}
	}

	function addCheckoutItem(item, quantity = 1) {
		let is_sub = $('input[type="radio"][name="subscription"]:checked').val() == "true";
		let price_info = `
		<div class="cart-item-price">$${item.price} + Shipping</div>
		`;
		let freq_info = '';
		if (is_sub) {
			price_info = `
		<div class="cart-item-price">$${item.price} + Free Shipping</div>
		`;
			let freq_name = $('.select option:selected').text();
			freq_info = `<div class="cart-item-frequency">Delivered: ${freq_name}</div>`;
		} else {
			freq_info = `<div class="cart-item-frequency">Delivered: Just this once</div>`;
		}
		$('#build-your-box-form .cart-list').append(`
		<li class="cart-item" data-sku="${item.sku}">
			<div class="cart-item-image-wrap">
				<img src="${item.image}" loading="lazy" sizes="(max-width: 479px) 13vw, 60px" alt="cart-item"
					class="cart-item-image">
			</div>
			<div class="product-info-wrap in-cart">
				<div class="cart-item-info-wrap">
					<div class="cart-item-name">${item.name}</div>
					<div class="cart-item-price-wrap">
						${price_info}
					</div>
					${freq_info}
          <div style="color: red; cursor: pointer;" class="text remove-button">Remove</div>
				</div>
			</div>
			<div class="ticker-wrap">
				<div class="ticker-quantity">
					<input type="number" class="field ticker" min="0" max="6" placeholder="0" name="itemQuantity"
						value="${quantity}" readonly />
				</div>
			</div>
		</li>
		`);
	}

	function evaluateSub(storage = null) {
		if (storage === null) {
			storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
		}
		if (storage.is_sub) {
			$('#true').click().attr('checked', true);
			$('#true').closest('div').find('.text').addClass('light');
			$('#false').closest('div').find('.text').removeClass('light');
			$('#deliveryFrequencyWrap').show();
		} else {
			$('#false').click().attr('checked', true);
			$('#false').closest('div').find('.text').addClass('light');
			$('#true').closest('div').find('.text').removeClass('light');
			$('#deliveryFrequencyWrap').hide();
		}
	}

	function resetCheckoutCart() {
		$('#build-your-box-form .cart-list .cart-item').remove();
		renderCheckoutFromStorage();
	}

	function renderMetaFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
		let sub_val = $('input[type="radio"][name="subscription"]:checked').val() == "true";
		if (sub_val != storage.is_sub) {
			evaluateSub(storage);
		}
		$('.select').val(storage.freq).trigger('change');
	}

	function renderBuildBoxFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		for (const item of storage) {
			updateBuildBoxQuantity(item.sku, item.quantity);
		}
	}

	function renderCheckoutFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBox'));

		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			addCheckoutItem(item_data, item.quantity);
		}
		updateCartRender();
	}

	function updateCartRender() {
		const $emptyMessage = $('.empty-box');
		const $continueBlock = $('#continueToCheckout');

		// Update subtotal
		let is_sub = $('input[type="radio"][name="subscription"]:checked').val() == "true";
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		let subtotal = 0.00;
		let shipping = 0.00;
		let totalQuant = renderBoxCount();

		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			subtotal += parseFloat(item_data.price) * parseFloat(item.quantity);
		}
		if (totalQuant == 1) {
			shipping = 5.00;
		} else if (totalQuant >= 2 && totalQuant <= 6) {
			shipping = 8.50;
		} else if (totalQuant > 6) {
			shipping = 12.00;
		}

		if (is_sub) {
			$('#shippingTitleText').html('Free Shipping 🎉');
			$('#shippingAmount').html(`$0.00`);
		} else {
			$('#shippingTitleText').html('Shipping');
			$('#shippingAmount').html(`$${shipping.toFixed(2)}`);
		}

		$('#oneTimeSubtotal').html(`$${(subtotal + shipping).toFixed(2)}`);
		$('#subSubtotal').html(`$${subtotal.toFixed(2)}`);
		$('#subtotalAcutal').html(`$${subtotal.toFixed(2)}`);


		if (storage.length > 0) {
			$emptyMessage.hide();
			$continueBlock.show();
			$('#emptyWrap').addClass('middle');

		} else {
			$emptyMessage.show();
			$continueBlock.hide();
			$('#emptyWrap').removeClass('middle');

		}
	}

	function removeCartItem(sku) {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		storage = storage.filter((item) => item.sku != sku);
		localStorage.setItem('buildBox', JSON.stringify(storage));
		$(`#build-your-box-form .cart-list .cart-item[data-sku="${sku}"]`).remove();
		updateBuildBoxQuantity(sku, 0);
	}

	function updateBuildBoxQuantity(sku, quantity) {
		const $list_item = $(`.build-your-box-item .product-data input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		$list_item.find('.ticker input').val(quantity);

		if (quantity < 1) {
			$list_item.find('.ticker input, .minus').hide();
		} else if (quantity >= 1) {
			$list_item.find('.ticker input, .minus').show();
		}
	}

	function getItemDataFromSku(sku) {
		const $list_item = $(`.build-your-box-item .product-data
		input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		return getItemDataFromBuildBoxItem($list_item);
	}

	function getItemData($el) {
		const $list_item = $el.closest('.build-your-box-item');
		return getItemDataFromBuildBoxItem($list_item);
	}

	function getItemDataFromBuildBoxItem($el) {
		const $product_data = $el.find('.product-data input');
		let data = {
			freq: parseInt($('#sub_frequency').val()) > 0 ? $('.product-select').val() : null
		};
		$product_data.each(function () {
			const name = $(this).attr('name');
			const value = $(this).attr('value');
			data[name] = value;
		});
		return data;
	}

	// Initalize variables
	function init() {
		$('.minus, .ticker input').hide();
		if (performance.navigation.type == 2) {
			location.reload();
		}
		let cart_meta = localStorage.getItem('buildBoxMeta');
		if (cart_meta == null) {
			$('#sub_frequency').val('1m');
			localStorage.setItem('buildBoxMeta', JSON.stringify({
				is_sub: true,
				freq: '1m'
			}));
		}
		let cart = localStorage.getItem('buildBox');
		if (cart == null || cart == "[]") {
			localStorage.setItem('buildBox', "[]");
		}
		if (location.toString().indexOf('state=build') < 0) {
			if (screen.width < 991) {
				$('#choose-your-goods').css('order', 99999);
				$('#buildYourBoxTitle').hide();
			} else {
				$('#choose-your-goods').css('order', -99999);
			}
			$('#chooseYourGoodsText').text('Other goods you might like');
			$('#customizeDeliveryText').text('Your Box');
			$('.add-products-button').show();
		} else {
			$('.add-products-button').hide();
		}
	}
});