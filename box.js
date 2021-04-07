$(document).ready(function() {
	init();
	renderMetaFromStorage();
	renderBuildBoxFromStorage();
	renderCheckoutFromStorage();

	$(document)
		.on('click', '.plus-minus-button.plus', function() {
			const item_data = getItemData($(this));
			const $quant = $(this).closest('.ticker').find('input');
			const quant = parseInt($quant.val());

			if(quant == 6) {
				alert("You cannot add more than 6 of a single item");
				return;
			}

			let storage = JSON.parse(localStorage.getItem('buildBox') || "[]");
			let exists_in_storage = false;

			if(storage.length > 0) {
				for(const item of storage) {
					if(item.sku === item_data.sku) {
						item.quantity++;
						updateCheckoutItem(item_data.sku, 'add');
						exists_in_storage = true;
						break;
					}
				}
			}

			if(!exists_in_storage) {
				storage.push({
					sku: item_data.sku,
					quantity: 1
				});
				addCheckoutItem(item_data);
			}

			localStorage.setItem('buildBox', JSON.stringify(storage));
			updateCheckoutRender();

			// if (quant < 6) { $quant[0].value = quant + 1; }

			updateBuildBoxQuantity(item_data.sku, quant + 1);
		})

		.on('click', '.plus-minus-button.minus', function() {
			const item_data = getItemData($(this));
			const $quant = $(this).closest('.ticker').find('input');
			const quant = parseInt($quant.val());
			let storage = JSON.parse(localStorage.getItem('buildBox') || "[]");
			for(const item of storage) {
				if(item.sku === item_data.sku) {
					item.quantity--;
					if(item.quantity == 0) {
						delete item;
					} break;
				}
			}
			localStorage.setItem('buildBox', JSON.stringify(storage)); if(quant > 0) {
				const item_data = getItemData($(this));
				updateCheckoutItem(item_data.sku, 'sub');
				updateCheckoutRender();
				$quant[0].value = quant - 1;
			}
		})

		.on('click', '.remove-button', function() {
			let $item = $(this).closest('[data-sku]');
			let sku = $item.attr('data-sku');
			removeCartItem(sku);
			updateCheckoutRender();
		})

		.on('change', 'input[type="radio"]', function() {
			let storage = JSON.parse(localStorage.getItem('buildBoxMeta') || "{}");
			storage.is_sub = $('input[type="radio"][name="subscription"]:checked').val() == "true";
			localStorage.setItem('buildBoxMeta', JSON.stringify(storage));
			evaluateSub(storage);
			resetCheckoutCart();
		})

		.on('change', '#sub_frequency', function() {
			let storage = JSON.parse(localStorage.getItem('buildBoxMeta') || "{}");
			storage.freq = $(this).val();
			localStorage.setItem('buildBoxMeta', JSON.stringify(storage));
			evaluateSub(storage);
			resetCheckoutCart();
		})

		.on('click', '#continueCheckoutButton', function() {
			let boxStatus = localStorage.getItem('buildBox');
			if(boxStatus == "[]") {
				event.preventDefault();
				alert('Your Box is empty. Add some products to get started!');
			}
			if(!$('#sub_frequency').val()) {
				alert('Please choose a subscription frequency.');
			}
		});
	;

	function updateCheckoutItem(sku, method) {
		const item = getItemDataFromSku(sku);
		const $quantity = $(`[data-sku="${sku}"]`).find('[data-id="quantity"]');
		const $linePrice = $(`[data-sku="${sku}"]`).find('[data-item="price"]');
		if($quantity) {
			const quantity = parseInt($quantity.text());
			if(method == 'add') {
				$quantity[0].innerText = quantity + 1;
				$linePrice[0].innerText = `$${(item.price * (quantity + 1)).toFixed(2)}`;
			}
			if(method == 'sub') {
				$quantity[0].innerText = quantity - 1;
				$linePrice[0].innerText = `$${(item.price * (quantity - 1)).toFixed(2)}`;
				if((quantity - 1) == 0) {
					removeCartItem(sku);
				}
			}
		}
	}

	function resetCheckoutCart() {
		$('#boxItemsList [data-sku]').remove();
		renderCheckoutFromStorage();
	}

	function renderBuildBoxFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		for(const item of storage) {
			updateBuildBoxQuantity(item.sku, item.quantity);
		}
	}

	function renderCheckoutFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBox'));

		for(const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			addCheckoutItem(item_data, item.quantity);
		}
		updateCheckoutRender();
	}


	function removeCartItem(sku) {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		storage = storage.filter((item) => item.sku != sku);
		localStorage.setItem('buildBox', JSON.stringify(storage));
		$(`[data-sku="${sku}"]`).remove();
		updateBuildBoxQuantity(sku, 0);
	}

	function updateBuildBoxQuantity(sku, quantity) {
		const $list_item = $(`.build-your-box-item .product-data input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		$list_item.find('.ticker input').val(quantity);

		if(quantity < 1) {
			$list_item.find('.ticker input, .minus').hide();
		} else if(quantity >= 1) {
			$list_item.find('.ticker input, .minus').show();
		}
	}

	function getItemData($el) {
		const $list_item = $el.closest('.build-your-box-item');
		return getItemDataFromBuildBoxItem($list_item);
	}

	// Initalize variables
	function init() {
		$('.minus, .ticker input').hide();
		if(performance.navigation.type == 2) {
			location.reload();
		}
		let cart_meta = localStorage.getItem('buildBoxMeta');
		if(cart_meta == null) {
			$('#sub_frequency').val('1m').trigger('change');
			localStorage.setItem('buildBoxMeta', JSON.stringify({
				is_sub: true,
				freq: '1m'
			}));
		}
		let cart = localStorage.getItem('buildBox');
		if(cart == null || cart == "[]") {
			localStorage.setItem('buildBox', "[]");
		}
		if(location.toString().indexOf('state=build') < 0) {
			if(screen.width < 991) {
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