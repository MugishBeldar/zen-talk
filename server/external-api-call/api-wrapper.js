const axios = require('axios');

// API Wrapper
const apiWrapper = async (url, method, headers = {}, queryParams = {}, bodyParams = {}, condition = true) => {
  try {
    // Default headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer YOUR_TOKEN', // Add your token or any default authorization here
    };

    // Merge default headers with custom headers, conditionally
    const finalHeaders = condition ? { ...defaultHeaders, ...headers } : { ...defaultHeaders };

    // API call configuration
    const config = {
      method: method, // GET, POST, PUT, DELETE
      url: url, // Endpoint URL
      headers: finalHeaders,
      params: queryParams, // Query params (for GET requests)
      data: bodyParams, // Body params (for POST/PUT requests)
    };

    // Making the API call
    const response = await axios(config);
    console.log('\n\n[+]: apiWrapper -> response', response.data);
    // Sending the response back to the client
    return  // You can add additional processing if necessary
  } catch (error) {
		console.log('\n\n[+]: apiWrapper -> error', error);
    console.error('API call failed:', error.response ? error.response.data : error.message);
    throw new Error('API call failed');
  }
};

module.exports = apiWrapper;
