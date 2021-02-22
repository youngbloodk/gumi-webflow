$(document).ready(function () {
	init();
	renderMetaFromStorage();
	renderBuildBoxFromStorage();
	renderCheckoutFromStorage();
	window.addEventListener('resize', init);

	$(document)
		.on('click', '.plus-minus-button.plus', function () {
			const item_data = getItemData($(this)); const $quant = $(this).closest('.ticker').find('input'); const
				quant = parseInt($quant.val()); if (quant == 6) {window.alert("You cannot add more than 6 of a single item"); return;}
			let storage = JSON.parse(localStorage.getItem('buildBox') || "[]"); let exists_in_storage = false; if (storage.length >
				0) {
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
			if (quant < 6) {$quant[0].value = quant + 1;} $('.empty');

		})
		.on('click', '.plus-minus-button.minus', function () {
			const item_data = getItemData($(this)); const $quant = $(this).closest('.ticker').find('input'); const
				quant = parseInt($quant.val()); let storage = JSON.parse(localStorage.getItem('buildBox') || "[]"); for (const item
				of storage) {if (item.sku === item_data.sku) {item.quantity--; if (item.quantity == 0) {delete item;} break;} }
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
			$('input[name="subscription"]:checked').closest('div').find('.text').addClass('light');
			$('input[name="subscription"]').not(':checked').closest('div').find('.text').removeClass('light');
			localStorage.setItem('buildBoxMeta', JSON.stringify(storage));
			evaluateSub(storage);
			resetCheckoutCart();
			if ($('#false').is(':checked')) {
				$('#deliveryFrequencyWrap').hide();
			} else {
				$('#deliveryFrequencyWrap').show();
			}
		})

		.on('change', '#sub_frequency', function () {
			let storage = JSON.parse(localStorage.getItem('buildBoxMeta') || "{}");
			storage.freq = $(this).val();
			localStorage.setItem('buildBoxMeta', JSON.stringify(storage));
			evaluateSub(storage);
			resetCheckoutCart();
		})

		.on('click', '.continue-checkout-button', function () {
			let boxStatus = localStorage.getItem('buildBox');
			if (boxStatus == "[]") {
				event.preventDefault();
				alert('Your Box is empty. Add some products to get started!');
				$('.button-loader').hide();
			} else {
				setTimeout(
					function () {
						$('.button-loader').hide();
						alert('Whoops! Something went wrong. Try again.');
						location.reload();
					}, 10000);

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
		<div class="cart-item-price">$${item.price}</div>
		`;
		let freq_info = '';
		if (is_sub) {
			price_info = `
		<div class="cart-item-price compare">$${item.price}</div>
		<div class="cart-item-price">$${item.sub_price}0</div>
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
			$('.price.compare').removeClass('active');
			$('.price.black').show();
		} else {
			$('.price.compare').addClass('active');
			$('.price.black').hide();
		}
	}
	function resetCheckoutCart() {
		$('#build-your-box-form .cart-list .cart-item').remove();
		renderCheckoutFromStorage();
	}
	function renderMetaFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
		let sub_val = storage.is_sub;
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
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		let is_sub = $('input[type="radio"][name="subscription"]:checked').val() == "true";
		let subtotal = 0.00;
		let oneTimeSubtotal = 0.00;
		let subSubtotal = 0.00;

		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			oneTimeSubtotal += parseFloat(item_data.price) * parseFloat(item.quantity);
			subSubtotal += parseFloat(item_data.sub_price) * parseFloat(item.quantity);
			if (is_sub) {
				subtotal += parseFloat(item_data.sub_price) * parseFloat(item.quantity);
			} else {
				subtotal += parseFloat(item_data.price) * parseFloat(item.quantity);
			}
		}
		$('#oneTimeSubtotal').html('$' + oneTimeSubtotal.toFixed(2));
		$('#subSubtotal').html('$' + subSubtotal.toFixed(2));
		$('#checkout-subtotal').html('$' + subtotal.toFixed(2));
		if (storage.length > 0) {
			$emptyMessage.hide();
			$continueBlock.show();
			$('#emptyWrap').addClass('middle');
		} else {
			$emptyMessage.show();
			$continueBlock.hide();
			$('#emptyWrap').removeClass('middle');
		}
		renderBoxCount();
	}
	function removeCartItem(sku) {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		storage = storage.filter((item) => item.sku != sku);
		localStorage.setItem('buildBox', JSON.stringify(storage));
		$(`#build-your-box-form .cart-list .cart-item[data-sku="${sku}"]`).remove();
		updateBuildBoxQuantity(sku, 0);
	}
	function updateBuildBoxQuantity(sku, quantity) {
		const $list_item = $(`.build-your-box-item .product-data
		input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		$list_item.find('.ticker input').val(quantity);
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
			freq: $('#sub_frequency').val() > 0 ? $('.product-select').val() : null
		};
		$product_data.each(function () {
			const name = $(this).attr('name');
			const value = $(this).attr('value');
			data[name] = value;
		});
		if (data.price) {
			data['sub_price'] = data.price - (data.price * 0.10);
		}
		return data;
	}
	// Initalize variables
	function init() {
		let cart_meta = localStorage.getItem('buildBoxMeta');
		if (cart_meta == null) {
			$('#sub_frequency').val(1);
			localStorage.setItem('buildBoxMeta', JSON.stringify({
				is_sub: true,
				freq: '1'
			}));
		}
		let cart = localStorage.getItem('buildBox');
		if (cart == null || cart == "[]") {
			localStorage.setItem('buildBox', "[]");
		}
		if (location.toString().indexOf('?build') < 0) {
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

	function renderBoxCount() {
		const boxData = JSON.parse(localStorage.getItem('buildBox'));
		let boxTotals = [];
		boxData.forEach(element => boxTotals.push(element.quantity));
		let boxCount = boxTotals.reduce((a, b) => a + b, 0);
		$('#boxCount').text(boxCount);
	}
});