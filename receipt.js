$(document).ready(function() {
	//condiditonal redirects
	if(location.href.indexOf('?id=') < 0) {
		location.href = '/signin';
	} else if(getURLParam('paid')) {
		renderReceipt();
	} else {
		renderReceipt();
	}
	if(!signedIn) {
		$('#passDots').hide();
		$('#activateAccount').show();
	}
	if(sessionStorage.getItem('gumiActivateSent') || signedIn) {
		$('#activateAccount').hide();
		$('#activationSent').show();
	}
	$(document)
		.on('click', '#activateAccount', function() {
			resetPass($('#receiptEmail').text(), 'activate_account').then(res => {
				if(res.success) {
					$('.modal').fadeIn(250);
					$('#activateAccount').hide();
					$('#activationSent').show();
					sessionStorage.setItem('gumiActivateSent', true);
				}
			});
		})
		.on('click', '[data-modal="close"]', function() {
			$('.modal').fadeOut(250);
		})
		;
	;
	async function renderReceipt() {
		await getInvoice(getURLParam('id'))
			.then(async res => {
				let invoice = res.success;
				if(signedIn && invoice.customer_email !== gumiAuth.email) {
					alert(`You are not authorized to view this receipt. Please sign in and try again.`);
					location.href = '/signin';
				} else {
					let card = invoice.charge.payment_method_details.card;
					let discountTotal = 0;
					const cardIcons = {
						visa: "",
						amex: "",
						mastercard: "",
						jcb: "",
						discover: "",
						unionpay: ""
					};
					//get shipping amount
					const shipping = invoice.lines.data.find(function(line, index) {
						if(line.description.toLowerCase().indexOf('shipping') > 1) {
							return true;
						}
					});
					const shipping_amount = shipping.amount;

					$('#receiptNumber').text(invoice.number);
					$('#receiptDate').text(moment.unix(invoice.created).format("MMM D, YYYY"));
					$('#receiptEmail').text(invoice.customer_email);
					$('#receiptAddress')
						.html(
							`${invoice.customer_name}
						<br>
						${invoice.customer_shipping.address.line1}
						<br>
						${invoice.customer_shipping.address.city}, ${invoice.customer_shipping.address.state}, ${invoice.customer_shipping.address.postal_code}`
						);
					$('#cardBrand').text(cardIcons[card.brand]);
					$('#cardExp').text(`${card.exp_month}/${card.exp_year}`);
					$('#cardLast4').text(card.last4);
					for(const lineItem of invoice.lines.data) {
						//render only non-shipping products
						if(lineItem.description.toLowerCase().indexOf('shipping') < 0) {
							await getProduct(lineItem.price.product)
								.then(product => {
									let frequencyInfo = "Just this once";
									if(lineItem.price.type == "recurring") {
										let interval = lineItem.price.recurring.interval;
										if(lineItem.price.recurring.interval_count > 1) {
											interval = `${lineItem.price.recurring.interval}s`;
										}
										frequencyInfo = `Every ${lineItem.price.recurring.interval_count} ${interval}`;
									}
									$('#invoiceItemList').append(`
									<div class="w-layout-grid grid _3col auto-auto-1fr column-gap-10">
										<img src="${product.images[0]}" loading="lazy" width="60" sizes="(max-width: 479px) 17vw, 60px" alt="">
										<div class="w-layout-grid grid _1col row-gap-0">
											<div class="text semibold">${product.name}</div>
											<div class="text">Quantity: ${lineItem.quantity}</div>
											<div class="text">Delivered: ${frequencyInfo}</div>
										</div>
										<div class="text right">$${((lineItem.price.unit_amount * .01) * lineItem.quantity).toFixed(2)}</div>
									</div>
									<div class="divider"></div>`);
									;
								});
							;
						}
					};
					$('#receiptSubtotal').text(`$${(invoice.subtotal / 100).toFixed(2)}`);
					if(shipping) {
						$('#receiptShipping').text(`$${(shipping_amount / 100).toFixed(2)}`);
						$('#receiptSubtotal').text(`$${((invoice.subtotal - shipping_amount) / 100).toFixed(2)}`);
					}
					//calculate discount total
					if(invoice.total_discount_amounts.length > 0) {
						invoice.total_discount_amounts.forEach(discount => {
							discountTotal += (discount.amount / 100);
						});
						$('#receiptDiscount').text(`-$${discountTotal.toFixed(2)}`);
					} else {
						$('#discountLine').hide();
					}
					if(invoice.tax) {
						$('#receiptTax').text(`$${(invoice.tax / 100).toFixed(2)}`);
					}
					$('#receiptTotal').text(`$${(invoice.amount_paid / 100).toFixed(2)}`);
					if(invoice.billing_reason !== 'manual') {
						$('#subDetails').show();
						$('#subRenewalDate').text(moment.unix(invoice.period_end).format('MMM D, YYYY'));
						$('#subRenewalAmount').text(`$${((invoice.amount_paid / 100) + discountTotal).toFixed(2)}`);
					}
				}
			});
		;
	}
});