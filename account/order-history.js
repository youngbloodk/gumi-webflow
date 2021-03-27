$(document).ready(function () {
	if (signedIn) {
		renderOrderHistory();
	}

	async function renderOrderHistory() {
		await getInvoices(gumiAuth.token)
			.then(async res => {
				let orders = res.success;
				for (const order of orders) {
					if (order.number !== null) {
						$('#ordersList').append(`
					<div class="w-layout-grid grid _2col _1fr-auto center">
						<div class="w-layout-grid grid _3col row-gap-0 tablet-3-col mobile-portait-1-col">
							<div class="text semibold">${order.number}</div>
							<div class="text">$${(order.amount_paid / 100).toFixed(2)}</div>
							<div class="text">${moment.unix(order.created).format('D MMM YYYY')}</div>
						</div>
						<div class="font-awesome grey"><a href="/receipt?id=${order.id}"></a></div>
					</div>
					<div class="divider no-margin">
					`);
					}
				}
			});
		;
	}
});