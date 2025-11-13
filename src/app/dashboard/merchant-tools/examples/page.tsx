"use client";

import { Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function ExamplesPage() {
  return (
    <div className="flex flex-col gap-2.5 h-full pl-0 pr-2 py-2">
      <Breadcrumb
        items={[
          {
            label: "Merchant tools",
            icon: Wrench,
          },
          {
            label: "Examples",
          },
        ]}
      />

      <div className="flex-1 flex flex-col gap-6 px-0 py-6 overflow-y-auto">
        <div className="flex flex-col gap-4 px-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-foreground">Examples</h1>
              <p className="text-base text-muted-foreground">
                Complete code examples for all checkout types. Click to expand.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {/* Featured Example */}
              <AccordionItem value="item-1" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      FEATURED
                    </Badge>
                    <h2 className="text-lg font-semibold">Integrating with Existing Products</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Add MNEE Checkout to your existing product catalog with minimal code changes. This pattern works with any backend (Express, Next.js, Django, Rails, etc.) and any database.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ✅ <strong>Benefits:</strong> No database changes required, secure server validation, works with existing products
                  </p>

                  {/* Step 1 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Step 1: Server - Return Products</h3>
                    <p className="text-sm text-muted-foreground">Your existing API endpoint that returns products:</p>
                    <CodeBlock
                      language="typescript"
                      code={`// Express example - works with any backend
app.get('/api/products', async (req, res) => {
  const products = await db.products.find({ active: true });
  res.json(products.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description,
    image: product.image_url,
    sku: product.sku
  })));
});

// Response:
// [
//   {
//     "id": "prod_abc123",
//     "name": "Premium T-Shirt",
//     "price": 29.99,
//     "sku": "TSHIRT-L-BLK",
//     ...
//   }
// ]`}
                    />
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Step 2: Client - Map to Checkout Component</h3>
                    <p className="text-sm text-muted-foreground">Use metadata to link payments back to your products:</p>
                    <CodeBlock
                      language="tsx"
                      code={`import { useState, useEffect } from 'react';
import { MneeProvider, MneeCheckout } from '@mnee/checkout';

const MNEE_ADDRESS = '1FWXM7CzyRSFFn1PQwwuTSCyMucXHLhmeC';

export function ProductsPage() {
  const [products, setProducts] = useState([]);

  // Fetch products from your existing API
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <MneeProvider>
      <div className="grid grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="text-2xl font-bold">\${product.price}</p>

            {/* Add MNEE checkout with metadata */}
            <MneeCheckout
              checkoutType="ecommerce"
              payment={{
                amount: product.price,
                mneeDepositAddress: MNEE_ADDRESS
              }}
              // 🔑 Key: Use metadata to link payment to product
              metadata={{
                productId: product.id, // Your product ID
                sku: product.sku, // Variant info
                source: 'web-store' // Any custom data
              }}
              ecommerceConfig={{
                productName: product.name,
                productImage: product.image,
              }}
              onSuccess={handlePurchase}
            />
          </div>
        ))}
      </div>
    </MneeProvider>
  );
}`}
                    />
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Step 3: Handle Success & Validate</h3>
                    <p className="text-sm text-muted-foreground">Metadata is available directly on the result object for easy server-side validation:</p>
                    <CodeBlock
                      language="typescript"
                      code={`async function handlePurchase(result, formData) {
  // result.metadata contains your product identifiers
  console.log('Product ID:', result.metadata.productId);
  console.log('Transaction:', result.transactionHash);
  console.log('Amount:', result.amount);
  console.log('Email:', formData.email);
  console.log('Shipping:', formData.shipping);

  // Validate and record purchase on server
  const response = await fetch('/api/validate-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transactionHash: result.transactionHash,
      productId: result.metadata.productId,
      sku: result.metadata.sku,
      amount: result.amount,
      currency: result.currency,
      customerEmail: formData.email,
      shippingAddress: formData.shipping
    })
  });

  const order = await response.json();

  // Show confirmation
  alert(\`Order #\${order.orderNumber} confirmed!\`);

  // Redirect to order page
  window.location.href = \`/orders/\${order.orderNumber}\`;
}`}
                    />
                  </div>

                  {/* Step 4 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Step 4: Server - Validate & Record</h3>
                    <p className="text-sm text-muted-foreground">Verify the transaction and create the order:</p>
                    <CodeBlock
                      language="typescript"
                      code={`app.post('/api/validate-payment', async (req, res) => {
  const {
    transactionHash,
    productId,
    amount,
    customerEmail,
    shippingAddress
  } = req.body;

  try {
    // 1. Get product from database
    const product = await db.products.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 2. Verify amount matches product price
    if (parseFloat(amount) !== product.price) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // 3. Verify transaction on blockchain (optional but recommended)
    // const tx = await verifyTransaction(transactionHash);
    // if (!tx.confirmed) { ... }

    // 4. Create order in database
    const order = await db.orders.create({
      orderNumber: generateOrderNumber(),
      productId: product.id,
      productName: product.name,
      amount: amount,
      transactionHash: transactionHash,
      customerEmail: customerEmail,
      shippingAddress: shippingAddress,
      status: 'paid',
      createdAt: new Date()
    });

    // 5. Send confirmation email
    await sendOrderConfirmation(customerEmail, order);

    // 6. Update inventory
    await db.products.decrement(productId, { stock: 1 });

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      estimatedShipping: '3-5 business days'
    });

  } catch (error) {
    console.error('Payment validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});`}
                    />
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold">💡 Security Best Practices:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Always validate amount matches product price on server</li>
                      <li>Verify transaction hash on blockchain before fulfilling order</li>
                      <li>Use metadata to prevent price manipulation</li>
                      <li>Check for duplicate transaction hashes to prevent replay attacks</li>
                      <li>Never trust client-side data alone</li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold">🎯 This pattern works for:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Shopify, WooCommerce, or custom stores</li>
                      <li>SaaS subscription products</li>
                      <li>Digital downloads</li>
                      <li>Event tickets</li>
                      <li>Service bookings</li>
                      <li>Any existing product catalog</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Paywalls */}
              <AccordionItem value="item-2" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h2 className="text-lg font-semibold">Paywalls</h2>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <p className="text-sm text-muted-foreground">Gate content behind a one-time payment:</p>
                  <CodeBlock
                    language="tsx"
                    code={`import { MneeCheckout } from '@mnee/checkout';

function PremiumArticle() {
  return (
    <div>
      <h1>Premium Article</h1>
      <p>This is a preview of premium content...</p>

      <MneeCheckout
        checkoutType="paywall"
        payment={{
          amount: 5,
          mneeDepositAddress: '1FWXM7CzyRSFFn1PQwwuTSCyMucXHLhmeC',
        }}
        paywallConfig={{
          title: 'Unlock Premium Content',
          description: 'Get lifetime access to this article',
          unlockMessage: 'Unlock for $5',
        }}
        collectEmail={true}
        theme="dark"
        styling={{
          borderRadius: 'xl',
          primaryColor: '#8b5cf6',
          buttonColor: '#8b5cf6',
        }}
        onSuccess={(result, formData) => {
          console.log('Payment successful!', result);
          console.log('User email:', formData.email);
          // Unlock content, save to database, etc.
        }}
        showConfetti
      />
    </div>
  );
}`}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* E-commerce */}
              <AccordionItem value="item-3" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h2 className="text-lg font-semibold">E-commerce</h2>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <p className="text-sm text-muted-foreground">Sell physical or digital products with custom options:</p>
                  <CodeBlock
                    language="tsx"
                    code={`import { MneeCheckout } from '@mnee/checkout';

function ProductPage() {
  return (
    <div>
      <h1>Premium T-Shirt</h1>
      <img src="/product.jpg" alt="Product" />
      <p>$29.99</p>

      <MneeCheckout
        checkoutType="ecommerce"
        payment={{
          amount: 29.99,
          mneeDepositAddress: '1FWXM7CzyRSFFn1PQwwuTSCyMucXHLhmeC',
        }}
        ecommerceConfig={{
          productName: 'Premium T-Shirt',
          productDescription: 'High-quality cotton',
          productImage: '/product.jpg',
          showQuantitySelector: true,
          shippingCost: 5,
          taxRate: 0.08,
        }}
        customFields={[
          {
            id: 'size',
            type: 'select',
            label: 'Size',
            placeholder: 'Select size',
            options: [
              { label: 'Small', value: 'S' },
              { label: 'Medium', value: 'M' },
              { label: 'Large', value: 'L' },
              { label: 'X-Large', value: 'XL' },
            ],
            validation: { required: true },
          },
          {
            id: 'color',
            type: 'radio',
            label: 'Color',
            options: [
              { label: 'Black', value: 'black' },
              { label: 'White', value: 'white' },
              { label: 'Navy', value: 'navy' },
            ],
            validation: { required: true },
          },
        ]}
        collectEmail={true}
        collectShipping={true}
        onSuccess={(result, formData) => {
          console.log('Order placed!', result);
          console.log('Shipping to:', formData.shipping);
          console.log('Selected options:', formData.customFields);
        }}
      />
    </div>
  );
}`}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Donations */}
              <AccordionItem value="item-4" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h2 className="text-lg font-semibold">Donations</h2>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <p className="text-sm text-muted-foreground">Accept donations and tips with flexible amounts:</p>
                  <CodeBlock
                    language="tsx"
                    code={`import { MneeCheckout } from '@mnee/checkout';

function CreatorTipJar() {
  return (
    <div>
      <h1>Support My Work</h1>
      <p>Your support helps me create more amazing content!</p>

      <MneeCheckout
        checkoutType="donation"
        payment={{
          amount: 5,
          mneeDepositAddress: '1FWXM7CzyRSFFn1PQwwuTSCyMucXHLhmeC',
        }}
        donationConfig={{
          organizationName: '@CreatorName',
          title: 'Buy Me a Coffee ☕',
          description: 'Your support helps me create more amazing content!',
          suggestedAmounts: [1, 5, 10, 20],
          allowCustomAmount: true,
          minAmount: 1,
          collectMessage: true,
          messagePlaceholder: 'Leave a nice message... (optional)',
          buttonText: 'Send Tip',
        }}
        collectEmail={false}
        styling={{
          borderRadius: 'xl',
          primaryColor: '#f59e0b',
          buttonColor: '#f59e0b',
        }}
        onSuccess={(result, formData) => {
          console.log('Tip received!', result);
          console.log('Amount:', formData.donationAmount);
          console.log('Message:', formData.message);
        }}
        showConfetti
      />
    </div>
  );
}`}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Manual Trigger */}
              <AccordionItem value="item-5" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h2 className="text-lg font-semibold">Manual Trigger</h2>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <p className="text-sm text-muted-foreground">Control the modal state manually for advanced use cases:</p>
                  <CodeBlock
                    language="tsx"
                    code={`import { useState } from 'react';
import { MneeCheckout } from '@mnee/checkout';

function ManualTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Start Checkout
      </button>

      <MneeCheckout
        checkoutType="paywall"
        payment={{
          amount: 10,
          mneeDepositAddress: '1MC...',
        }}
        triggerMode="manual"
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          setOpen(false);
          // Handle success
        }}
      />
    </>
  );
}`}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Conditional Fields */}
              <AccordionItem value="item-6" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h2 className="text-lg font-semibold">Conditional Fields</h2>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <p className="text-sm text-muted-foreground">Show fields based on other field values:</p>
                  <CodeBlock
                    language="tsx"
                    code={`const fields = [
  {
    id: 'deliveryType',
    type: 'radio',
    label: 'Delivery Type',
    options: [
      { label: 'Standard', value: 'standard' },
      { label: 'Express', value: 'express' },
    ],
  },
  {
    id: 'expressDate',
    type: 'text',
    label: 'Preferred Delivery Date',
    // Only show if express delivery is selected
    dependsOn: {
      fieldId: 'deliveryType',
      value: 'express',
    },
  },
];

<MneeCheckout
  checkoutType="ecommerce"
  customFields={fields}
  // ... other props
/>`}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Cart Checkout */}
              <AccordionItem value="item-7" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h2 className="text-lg font-semibold">Cart Checkout</h2>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Complete implementation with cart functionality. When <code className="bg-muted px-1 py-0.5 rounded text-xs">enableCart: true</code>, items are added to a cart instead of immediate checkout.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ⚠️ <strong>Important:</strong> Cart functionality requires wrapping your app with <code className="bg-muted px-1 py-0.5 rounded text-xs">MneeProvider</code>
                  </p>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">App.tsx - Setup Provider</h3>
                    <CodeBlock
                      language="tsx"
                      code={`import { MneeProvider } from '@mnee/checkout';

function App() {
  return (
    <MneeProvider>
      <YourRoutes />
    </MneeProvider>
  );
}`}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">ProductPage.tsx - Add to Cart Button</h3>
                    <CodeBlock
                      language="tsx"
                      code={`import { MneeCheckout } from '@mnee/checkout';

function ProductPage() {
  return (
    <div>
      <h1>Premium T-Shirt</h1>
      <p>$29.99</p>

      <MneeCheckout
        checkoutType="ecommerce"
        payment={{
          amount: 29.99,
          mneeDepositAddress: '1FWXM7CzyRSFFn1PQwwuTSCyMucXHLhmeC',
        }}
        ecommerceConfig={{
          productName: 'Premium T-Shirt',
          productDescription: 'High-quality cotton',
          productImage: '/product.jpg',
          showQuantitySelector: true,
          shippingCost: 5,
          taxRate: 0.08,
          enableCart: true, // 🔑 This enables cart functionality
        }}
        customFields={[
          {
            id: 'size',
            type: 'select',
            label: 'Size',
            options: [
              { label: 'Small', value: 'S' },
              { label: 'Medium', value: 'M' },
              { label: 'Large', value: 'L' },
            ],
            validation: { required: true },
          },
        ]}
        buttonConfig={{
          text: 'Add to Cart', // Button shows "Add to Cart" instead of "Buy Now"
        }}
      />
    </div>
  );
}`}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Layout.tsx - Cart UI Components</h3>
                    <CodeBlock
                      language="tsx"
                      code={`import { useState } from 'react';
import {
  FloatingCartButton,
  CartView,
  CartCheckoutModal
} from '@mnee/checkout';

function Layout({ children }) {
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <div>
      {children}

      {/* Floating cart button (shows item count badge) */}
      <FloatingCartButton
        onClick={() => setShowCart(true)}
        position="top-right"
      />

      {/* Cart view modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto mt-20">
            <CartView
              onContinueShopping={() => setShowCart(false)}
              onProceedToCheckout={() => {
                setShowCart(false);
                setShowCheckout(true);
              }}
              collectEmail={true}
              collectShipping={true}
              currency="USD"
            />
          </div>
        </div>
      )}

      {/* Cart checkout modal */}
      <CartCheckoutModal
        open={showCheckout}
        onOpenChange={setShowCheckout}
        mneeDepositAddress="1FWXM7CzyRSFFn1PQwwuTSCyMucXHLhmeC"
        onSuccess={(result, checkoutData) => {
          console.log('Order successful!');
          console.log('Transaction:', result.transactionHash);
          console.log('Cart items:', result.cartItems);
          console.log('Total:', checkoutData.total);
          console.log('Email:', checkoutData.email);
          console.log('Shipping:', checkoutData.shipping);

          setShowCheckout(false);
        }}
      />
    </div>
  );
}`}
                    />
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold">💡 How it works:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>With <code className="bg-muted px-1 py-0.5 rounded text-xs">enableCart: true</code>, clicking button adds item to cart (not immediate checkout)</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded text-xs">FloatingCartButton</code> shows total items in cart</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded text-xs">CartView</code> displays all cart items with quantity controls and forms</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded text-xs">CartCheckoutModal</code> handles payment for entire cart</li>
                      <li>Tax and shipping are calculated based on cart items</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
    </div>
  );
}
