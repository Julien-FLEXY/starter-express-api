const express = require('express')
const app = express()

app.all('/', (req, res) => {
    fetch("https://julien-test-site.myshopify.com/admin/api/2023-01/products.json", {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-Shopify-Access-Token': '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',
		}
	})
        .then(response => response.json())
        .then(data => res.send(data))
        .catch(err => console.log(err));
})

app.listen(process.env.PORT || 3000)