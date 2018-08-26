const buttons = [ "Filip", "Marek", "Michal", "Consumption" ];

const wrapButtonContent = (prod, price, prodCount, content) => {
	return "<span style='display: block' class='button-container' data-price='" + price + "' data-item='" + prod + "' data-count='" + prodCount + "'>" + content + "</span>";
};

const renderButtons = (captions, prod, price, count) => {
	return wrapButtonContent(prod, price, count,
		captions.map(x => "<button class='person-button' data-check='0'>" + x + "</button>").join("")
	);
};

const renderNumberBoxes = (captions, prod, price, count) => {
	return wrapButtonContent(prod, price, count,
		captions.map(x => "<span class='num-input-container'><button class='fill-all'>" + x + "</button> <input type='number' class='number-input' name='" + x + "'/></span>").join("")
	);
};

const renderSumButton = (orderId) => {
	return "<button class='sum-button' data-item='" + orderId + "'>Sum this shit up</button>"
};

const getOrderId = (order) => {
	return order.attr("data-item");
};

const getPrice = (product) => {
	return parseFloat($(product).find(".products-table__price").text().replace("Kč", "").replace(",", "."));
};

const getCount = (product) => {
	return parseInt($(product).find(".products-table__quantity").text().replace(" ks", ""));
};

const renderProductUi = (product, buttons, id) => {
	const count = getCount(product);

	if (count === 1) {
		return renderButtons(buttons, id, getPrice(product), count)
	} else {
		return renderNumberBoxes(buttons, id, getPrice(product), count);
	}
};

$(".orders__detail").each((i, el) => {
	el = $(el);
	el.append(renderSumButton(getOrderId(el)));

	const products = el.find(".products-table__product");
	products.each((j, prod) => {
		$(prod).append(renderProductUi(prod, buttons, $(el).attr("data-item")));
	})
});

$("button.person-button").click(e => {
	const button = $(e.target);

	button.toggleClass("checked");
	button.attr("data-check", button.hasClass("checked") ? 1 : 0);
});

$("button.fill-all").click(e => {
	const button = $(e.target);
	const container = button.parent();
	const count = button.parent().parent().attr("data-count");

	container.find(".number-input").val(count);
	if (!container.hasClass("checked"))
		container.addClass("checked");
});

$(".number-input").on("keyup", e => {
	const container = $(e.target).parent();
	if (!container.hasClass("checked"))
		container.addClass("checked");
});

$("button.sum-button").click(e => {
	const button = $(e.target);
	const buttonContainer = button.parent();
	const orderId = buttonContainer.attr("data-item");
	const orderContainer = $(".orders__detail[data-item='" + orderId + "']").first();

	const products = orderContainer.find(".products-table__product .button-container");
	const sums = {};

	buttons.forEach(x => {
		sums[ x ] = 0.0;
	});

	products.each((i, p) => {
		const prod = $(p);
		const total = parseFloat(prod.attr("data-price"));
		const count = parseInt(prod.attr("data-count"));

		if (count === 1) {
			// simple calculation for when there's just one product and buttons are used
			const splitCount = prod.find(".person-button").toArray().filter(x => ($(x).hasClass("checked"))).length;

			if (splitCount === 0)
				return;

			prod.find(".person-button").each((j, x) => {
				const pButton = $(x);
				if (pButton.hasClass("checked"))
					sums[ pButton.text() ] += total / splitCount;
			});
		} else {
			// calculation for when there's more than one product and number inputs are used
			const singlePrice = total / count;

			prod.find(".number-input").each((j, x) => {
				const input = $(x);
				const selectedCount = parseInt(input.val());
				const result = singlePrice * selectedCount;

				if (!isNaN(result))
					sums[ input.attr("name") ] += result;
			})
		}
	});

	buttons.forEach(x => {
		sums[ x ] = Math.round(sums[ x ] * 100) / 100;
	});

	const result = buttons.map(x => x + ": " + sums[ x ] + "Kč").join("\n");
	alert(result);
});