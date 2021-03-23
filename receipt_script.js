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
			.then(res => {
				let invoice = res.success;
				let card = invoice.charge.payment_method_details.card;
				const cardIcons = {
					visa: "",
					amex: "",
					mastercard: "",
					jcb: "",
					discover: "",
					unionpay: ""
				};
				if (invoice.customer_email !== gumiAuth.email) {
					alert(`You are not authorized to view this receipt. Please sign in to the correct account and try again.`);
					location.href = '/signin';
				} else {
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
					$('#orderNumber').text(invoice.number);
					const shipping = invoice.lines.data.find(function (line, index) {
						if (line.description.indexOf('Shipping') > 1) {
							return true;
						}
					});
					if (shipping) {
						$('#receiptShipping').text(`$${(shipping.amount / 100).toFixed(2)}`);
					} else {
						$('#shippingLine').hide();
					}
					$('#receiptTotal').text(`$${(invoice.amount_paid / 100).toFixed(2)}`);
				}
			});
		;
	}
});