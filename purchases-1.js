// Function to get succeeded payments from Stripe
async function getSucceededPayments() {
  const stripeCustomersRef = firebase.firestore().collection('customers');

  try {
    const snapshot = await stripeCustomersRef.get();

    // Loop through customers
    snapshot.forEach(async (customerDoc) => {
      const paymentsRef = customerDoc.ref.collection('payments');
      const paymentsSnapshot = await paymentsRef.where('status', '==', 'succeeded').get();

      // Loop through succeeded payments
      paymentsSnapshot.forEach(async (paymentDoc) => {
        const orderId = extractOrderId(paymentDoc.data().items);

        // Retrieve order details from the "orders" collection
        await getOrderDetails(orderId);
      });
    });
  } catch (error) {
    console.error('Error getting succeeded payments:', error);
  }
}

// Function to extract orderId from payment items
function extractOrderId(items) {
  const orderItem = items.find(item => item.description.includes('Order #'));
  return orderItem ? orderItem.description.split('#')[1] : null;
  console.log(orderItem);
}

// Add a global variable to store the table reference
const ordersTable = document.getElementById('ordersTable');

// Function to update the HTML table with order details
function updateOrdersTable(orderId, products) {
  const tbody = ordersTable.querySelector('tbody');

  // Create a new row for each product
  products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${orderId}</td><td>${product.productName}</td><td>${product.quantity}</td>`;
    // Add more cells/columns as needed
    tbody.appendChild(row);
  });
}

async function getShippingAddress() {
  const customersRef = firebase.firestore().collection('customers');

  try {
    const snapshot = await customersRef.get();

    // Loop through customers
    for (const customerDoc of snapshot.docs) {
      const paymentsRef = customerDoc.ref.collection('payments');
      const paymentsSnapshot = await paymentsRef.where('status', '==', 'succeeded').get();

      // Loop through succeeded payments
      for (const paymentDoc of paymentsSnapshot.docs) {
        const charges = paymentDoc.get('charges');

        // Check if charges field exists and has the expected structure
        if (charges && charges.data && charges.data.length > 0) {
          const billingDetails = charges.data[0].billing_details;

          // Check if billing_details field exists and has the expected structure
          if (billingDetails) {
            const email = billingDetails.email || 'Not Available';
            const name = billingDetails.name || 'Not Available';
            const phone = billingDetails.phone || 'Not Available';

            // Access address details
            const address = billingDetails.address;
            const city = address.city || 'Not Available';
            const country = address.country || 'Not Available';
            const line1 = address.line1 || 'Not Available';
            const line2 = address.line2 || 'Not Available';
            const postalCode = address.postal_code || 'Not Available';
            const state = address.state || 'Not Available';

            return {
              email,
              name,
              phone,
              address: {
                city,
                country,
                line1,
                line2,
                postalCode,
                state,
              },
            };
          } else {
            console.error('Invalid or missing billing_details field for payment:', paymentDoc.id);
          }
        } else {
          console.error('Invalid or missing charges field for payment:', paymentDoc.id);
        }
      }
    }

    // If no address is found, return a default value
    return {
      email: 'Not Available',
      name: 'Not Available',
      phone: 'Not Available',
      address: {
        city: 'Not Available',
        country: 'Not Available',
        line1: 'Not Available',
        line2: 'Not Available',
        postalCode: 'Not Available',
        state: 'Not Available',
      },
    };
  } catch (error) {
    console.error('Error getting shipping address:', error);
    return {
      email: 'Not Available',
      name: 'Not Available',
      phone: 'Not Available',
      address: {
        city: 'Not Available',
        country: 'Not Available',
        line1: 'Not Available',
        line2: 'Not Available',
        postalCode: 'Not Available',
        state: 'Not Available',
      },
    };
  }
}

// Function to get order details from "orders" collection
async function getOrderDetails(orderId) {
  const ordersRef = firebase.firestore().collection('orders');

  try {
    const orderDoc = await ordersRef.doc(orderId).get();

    if (orderDoc.exists) {
      const orderData = orderDoc.data();

      if (orderData && orderData.products) {
        // Access the order details (products and quantities) from orderData
        const products = orderData.products;
        const expressDelivery = orderData.expressDelivery ? 'Yes' : 'No';
        const totalPrice = orderData.totalPrice;
        const userId = orderData.userId;
        const status = orderData.status || 'Pending';

        // Get shipping address information
        const addressInfo = await getShippingAddress();

        // Add columns with shipping address information
        addColumns(orderId, products, expressDelivery, totalPrice, status, userId, addressInfo);

        return {
          orderId,
          products,
          expressDelivery,
          totalPrice,
          userId,
        };

      } else {
        console.error('Order data or products not found in the expected structure.');
        return null;
      }
    } else {
      console.error('Order document not found for ID:', orderId);
      return null;
    }
  } catch (error) {
    console.error('Error getting order details:', error);
    return null;
  }
}


// Modified addColumns function to include shipping address information
function addColumns(orderId, products, expressDelivery, totalPrice, status, userId, addressInfo) {
  const tableBody = document.querySelector('#ordersTable tbody');
  
  // Create a new row
  const newRow = document.createElement('tr');

  // Populate cells with data
  const orderIdCell = document.createElement('td');
  orderIdCell.textContent = orderId;

  const productsCell = document.createElement('td');
  // Format products content for better presentation
  const formattedProducts = products.map(product => {
    return `Product: ${product.productName}, Quantity: ${product.quantity}`;
  });
  productsCell.textContent = formattedProducts.join('\n');

  const expressDeliveryCell = document.createElement('td');
  expressDeliveryCell.textContent = expressDelivery;

  const totalPriceCell = document.createElement('td');
  totalPriceCell.textContent = totalPrice;

  const userIdCell = document.createElement('td');
  userIdCell.textContent = userId;

  // Add new columns for shipping address information
  const emailCell = document.createElement('td');
  emailCell.textContent = addressInfo.email;

  const nameCell = document.createElement('td');
  nameCell.textContent = addressInfo.name;

  const addressCell = document.createElement('td');
  addressCell.textContent = `${addressInfo.address.line1} ${addressInfo.address.line2} ${addressInfo.address.city} ${addressInfo.address.state} ${addressInfo.address.postalCode} ${addressInfo.address.country}`;


  // Create "Completed" button
  const completedCell = document.createElement('td');
  const completedButton = document.createElement('button');
  completedButton.textContent = 'Completed';
  completedButton.style.backgroundColor = "#6e70ff";
  completedButton.style.color = "white";
  completedButton.style.borderRadius = "3px";
  completedButton.style.fontSize = "0.9em";
  completedButton.addEventListener('click', async () => {
    // Update status and add the 'status' field to the order in the 'orders' collection
    await updateOrderStatus(orderId, 'completed');
    // Update the "Status" cell
    statusCell.textContent = 'Completed';
  });
  completedCell.appendChild(completedButton);

  // Create "Status" cell
  const statusCell = document.createElement('td');
  statusCell.textContent = status; // Default status


  // Append cells to the row
  newRow.appendChild(orderIdCell);
  newRow.appendChild(productsCell);
  newRow.appendChild(expressDeliveryCell);
  newRow.appendChild(totalPriceCell);
  newRow.appendChild(userIdCell);
  newRow.appendChild(emailCell);
  newRow.appendChild(nameCell);
  newRow.appendChild(addressCell);
  newRow.appendChild(completedCell);
  newRow.appendChild(statusCell);

  // Append the row to the table body
  tableBody.appendChild(newRow);
}

async function updateOrderStatus(orderId, status) {
  const ordersRef = firebase.firestore().collection('orders');

  try {
    // Update the 'status' field in the order document
    await ordersRef.doc(orderId).update({
      status: status,
    });

    console.log(`Order status updated to '${status}' for order ID: ${orderId}`);
  } catch (error) {
    console.error('Error updating order status:', error);
  }
}
