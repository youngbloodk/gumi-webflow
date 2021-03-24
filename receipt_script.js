$(document).ready(function () {
	if (PerformanceNavigation.type > 0 && !signedIn || location.href.indexOf('?id') < 0) {
		location.reload();
	} else if (!signedIn || location.href.indexOf('?id') < 0) {
		location.href = '/signin';
	} else {
		renderReceipt();
	}

	async function renderReceipt() {
		await getInvoice(getURLParam('id'))
			.then(async res => {
				let invoice = res.success;
				if (invoice.customer_email !== gumiAuth.email) {
					alert(`You are not authorized to view this receipt. Please sign in and try again.`);
					location.href = '/signin';
				} else {
					let card = invoice.charge.payment_method_details.card;
					const cardIcons = {
						visa: "",
						amex: "",
						mastercard: "",
						jcb: "",
						discover: "",
						unionpay: ""
					};
					const shipping = invoice.lines.data.find(function (line, index) {
						if (line.description.indexOf('Shipping') > 1) {
							return true;
						}
					});

					$('#receiptNumber').text(invoice.number);
					$('#receiptDate').text(moment.unix(invoice.created).format("DD MMM YYYY"));
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
					for (const lineItem of invoice.lines.data) {
						await getProduct(lineItem.price.product)
							.then(product => {
								$('#invoiceItemList').append(`
									<div class="w-layout-grid grid _3col auto-auto-1fr column-gap-10">
										<img src="${product.images[0]}" loading="lazy" width="60" sizes="(max-width: 479px) 17vw, 60px" alt="">
										<div class="w-layout-grid grid _1col row-gap-0">
											<div class="text semibold">${product.name}</div>
											<div class="text">Quantity: ${lineItem.quantity}</div>
											<div class="text">Delivered: Every ${lineItem.price.recurring.interval_count} ${lineItem.price.recurring.interval}</div>
										</div>
										<div class="text right">$${((lineItem.price.unit_amount * .01) * lineItem.quantity).toFixed(2)}</div>
									</div>
									<div class="divider"></div>`);
								;
							});
						;
					};
					$('#receiptSubtotal').text(`$${(invoice.subtotal / 100).toFixed(2)}`);
					if (shipping) {
						$('#receiptShipping').text(`$${(shipping.amount / 100).toFixed(2)}`);
					}
					if (invoice.total_discount_amounts) {
						$('#receiptDiscount').text(`$${(invoice.total_discount_amounts[0].amount / 100).toFixed(2)}`);
					} else {
						$('#discountLine').hide();
					}
					if (invoice.tax) {
						$('#receiptTax').text(`$${(invoice.tax / 100).toFixed(2)}`);
					}
					$('#receiptTotal').text(`$${(invoice.amount_paid / 100).toFixed(2)}`);
				}
			});
		;
	}
});