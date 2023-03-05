import express from 'express';

const shop = "julien-test-site";
const baseURL = `https://${shop}.myshopify.com/`;
const productVariantId = "39763716341825";
const apiEndpoint = `/admin/api/2023-01/variants/${productVariantId}.json`;

const app = express();

// Update product variant price
app.all('/', (req, res) => {
    fetch(baseURL + apiEndpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': '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',
        }
    })
        .then(response => response.json())
        .then(data =>  {
            if (data.variant) {
                const price = (parseInt(data.variant.price) + 1) + ".00";
                const requestOptions = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': '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',
                    },
                    body: `{"variant":{"price":${price}}}`
                };

                fetch(baseURL + apiEndpoint, requestOptions)
                    .then(response => response.json())
                    .then(data => res.send(data));
            } else {
                res.send("<p>No data</p>");
            }
        })
        .catch(err => console.log(err));
});

// Start server
app.listen(process.env.PORT || 3000, () => console.log("Server started"));
