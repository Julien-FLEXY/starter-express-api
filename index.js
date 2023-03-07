import express from 'express';

const shop = "inflation-candle";
const baseURL = `https://${shop}.myshopify.com/`;
const productVariantId = "44726745891128";
const locationId = "80134930744";
const apiEndpointPrice = `/admin/api/2023-01/variants/${productVariantId}.json`;
const apiEndpointInventory = `/admin/api/2023-01/inventory_levels/adjust.json`;
const apiKey = process.env.SHOPIFY_KEY;
// const apiEndpointLocation = `/admin/api/2023-01/locations.json`;

const app = express();

app.use(function (req, res, next) {
    if (req.ip !== '127.0.0.1') {
        res.status(401);
        return res.send('Permission denied');
    }
    next();
});

// app.use(function (req, res, next) {
//     fetch(baseURL + apiEndpointLocation, {
//         method: 'GET',
//         headers: {
//             'X-Shopify-Access-Token': `${apiKey}`,
//         }
//     })
//         .then(response => response.json())
//         .then(data => console.log(data))
//         .catch(err => console.log(err))
//     next();
// });

app.get('/', (req, res) => {
    fetch(baseURL + apiEndpointPrice, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': `${apiKey}`,
        }
    })
        .then(response => response.json())
        .then(data =>  {
            if (data.variant) {
                const priceData = parseInt(data.variant.price) + 1;                
                const price = priceData + ".00";

                const requestOptions = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': `${apiKey}`,
                    },
                    body: `{"variant":{"price":${price}}}`
                };

                fetch(baseURL + apiEndpointPrice, requestOptions)
                    .then(response => response.json())
                    .then(data => {
                        const priceData = parseInt(data.variant.price);
                        const inventoryData = data.variant.inventory_quantity;
                        let inventory;

                        if (priceData <= 15 && inventoryData != 5) {
                            inventory = 5 - inventoryData;
                        } else if (priceData > 15 && priceData <= 30 && inventoryData != 20) {
                            inventory = 20 - inventoryData;
                        } else if (priceData > 30) {
                            inventory = 9999 - inventoryData;
                        } else {
                            inventory = 0;
                        }

                        const requestOptions = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Shopify-Access-Token': `${apiKey}`,
                            },
                            body: `{"location_id":${locationId},"inventory_item_id":${data.variant.inventory_item_id},"available_adjustment":${inventory}}`
                        };

                        fetch(baseURL + apiEndpointInventory, requestOptions)
                            .then(response => response.json())
                            .then(data => {
                                res.send(`<h1>Data updated</h1>`)
                            })
                            .catch(err => console.log(err))
                    })
                    .catch(err => console.log(err))
            } else {
                res.send("<p>No data</p>");
            }
        })
        .catch(err => console.log(err));
});

// Start server
app.listen(process.env.PORT || 3000, () => console.log("Server started"));
