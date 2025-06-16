const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');

// Middleware (optional, depending on needs)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST route that sends an HTML file
app.post('/index', async (req, res) => {
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    const { brick_secure_token, brick_charge_id } = req.body;
    const { token, email, amount, currency } = req.query;
    try {
        const body = {
            token: token,
            email: email,
            amount: amount,
            currency: currency,
            description: "test",
            secure: "1",
            secure_return_method: "url",
            // secure_redirect_url: "http://192.168.13.208:3000/index?token=" + token,
            secure_token: brick_secure_token,
            charge_id: brick_charge_id
        }
        console.log(body)
        const finalBody = Object.entries(body)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        // Call external API with { name } as body
        const response = await axios.post('https://api.paymentwall.com/api/brick/charge',
            finalBody,
            {
                headers: {
                    'x-apikey': '9d8884beeb76162785fc92639da37a33',
                }
            }
        );

        // Log or handle response from external API if needed
        console.error('External API responded with:', response.data);

        if (Math.floor(response.status / 200) === 1) {
            console.log('Response body:', response.body);
            // const htmlPath = path.join(__dirname, 'index.html');
            // return res.sendFile(htmlPath);
            
            const responseHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Response</title>
        </head>
        <body>
            ${JSON.stringify(response.data, null, 2)}
        </body>
        </html>
    `;

return res.send(responseHtml);
            // return res.json({
            //     success: 1,
            //     response: response.data  // or whatever part of the response you want to include
            // });
        } else {
            return res.status(response.status).json({
                success: 0,
                error: 'External API did not return 200 OK',
                details: response.data
            });
            // return res.status(response.status).send('External API did not return 200 OK.');
        }

    } catch (error) {
        console.log(error.response.data)
        console.error('Error calling external API:', error.message);
        res.status(500).send('Failed to contact external API.');
    }
});


// New endpoint for Google Pay token
app.post('/google-pay', async (req, res) => {
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    const { gpay_token, charge_id } = req.body;
    const { token, email, amount, currency } = req.query;
    
    try {
        const body = {
            token: token,
            email: email,
            amount: amount,
            currency: currency,
            description: "test",
            secure: "1",
            secure_return_method: "url",
            google_pay_token: gpay_token,
            charge_id: charge_id
        };
        
        console.log(body);
        const finalBody = Object.entries(body)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
            
        const response = await axios.post('https://api.paymentwall.com/api/brick/charge',
            finalBody,
            {
                headers: {
                    'x-apikey': '9d8884beeb76162785fc92639da37a33',
                }
            }
        );

        if (Math.floor(response.status / 200) === 1) {
            return res.json({
                success: 1,
                response: response.data
            });
        } else {
            return res.status(response.status).json({
                success: 0,
                error: 'External API did not return 200 OK',
                details: response.data
            });
        }

    } catch (error) {
        console.log(error.response?.data || error.message);
        console.error('Error calling external API:', error.message);
        res.status(500).json({
            success: 0,
            error: 'Failed to contact external API',
            details: error.response?.data || error.message
        });
    }
});


// GET route that sends an HTML file
app.get('/index', (req, res) => {
    const htmlPath = path.join(__dirname, 'index.html');
    res.sendFile(htmlPath);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const parseCustomQueryItem = (queryString) => {
    // Fix the query string by replacing all '?' with '&', except for the first one
    const fixedQueryString = queryString.replace(/\?/g, '&');

    // Use URLSearchParams to parse the query string
    const params = new URLSearchParams(fixedQueryString);

    // Convert the params to an object
    const queryParams = {};
    params.forEach((value, key) => {
        queryParams[key] = value;
    });
    return queryParams
}