import type { Module, ModuleConfiguration } from "@/lib/schemas/module";

/**
 * Generates the MneeCheckout component code and TypeScript definitions
 * based on module configuration
 */
export function generateCodeSnippet(module: Module): string {
  const { kind, configuration } = module;

  const componentCode = generateComponentCode(kind, configuration);
  const typeDefinitions = generateTypeDefinitions(kind);

  return `${componentCode}\n\n${typeDefinitions}`;
}

/**
 * Generates the React component code for MneeCheckout
 */
function generateComponentCode(
  kind: string,
  config: ModuleConfiguration
): string {
  const lines: string[] = [];

  // Start tag
  lines.push("<MneeCheckout");

  // Checkout type
  lines.push(`  checkoutType="${kind}"`);

  // Payment object
  lines.push("  payment={{");
  lines.push(`    amount: "${config.amount}",`);
  lines.push(`    mneeDepositAddress: "${config.mneeDepositAddress}",`);
  lines.push("  }}");

  // Common options
  if (config.collectEmail) {
    lines.push(`  collectEmail={${config.collectEmail}}`);
  }

  if (config.showConfetti) {
    lines.push(`  showConfetti={${config.showConfetti}}`);
  }

  // Type-specific configurations
  if (kind === "paywall" && config.paywall) {
    lines.push("  paywallConfig={{");
    lines.push(`    title: "${config.paywall.title}",`);
    lines.push(`    description: "${config.paywall.description}",`);
    lines.push("  }}");
  }

  if (kind === "e-commerce" && config.ecommerce) {
    lines.push("  ecommerceConfig={{");
    lines.push(`    productName: "${config.ecommerce.productName}",`);
    if (config.ecommerce.productImage) {
      lines.push(`    productImage: "${config.ecommerce.productImage}",`);
    }
    if (config.ecommerce.showQuantitySelector) {
      lines.push(`    showQuantitySelector: ${config.ecommerce.showQuantitySelector},`);
    }
    lines.push("  }}");

    if (config.ecommerce.collectShipping) {
      lines.push(`  collectShipping={${config.ecommerce.collectShipping}}`);
    }
  }

  if (kind === "donation" && config.donation) {
    lines.push("  donationConfig={{");
    lines.push(`    title: "${config.donation.title}",`);
    lines.push(`    description: "${config.donation.description}",`);
    lines.push(`    suggestedAmounts: [${config.donation.suggestedAmounts.join(", ")}],`);
    if (config.donation.allowCustomAmount !== undefined) {
      lines.push(`    allowCustomAmount: ${config.donation.allowCustomAmount},`);
    }
    lines.push("  }}");
  }

  // onSuccess callback
  lines.push("  onSuccess={(result, formData) => {");
  lines.push("    console.log('Payment success:', result, formData);");
  lines.push("    // Send to your backend");
  lines.push("  }}");

  // Theme
  lines.push(`  theme="${config.theme || 'dark'}"`);

  // Close tag
  lines.push("/>");

  return lines.join("\n");
}

/**
 * Generates TypeScript type definitions for the integration
 */
function generateTypeDefinitions(kind: string): string {
  const baseTypes = `// Type definitions for integration

interface PaymentResult {
  transactionHash: string;
  amount: string;              // Total amount charged${kind === "e-commerce" ? " (includes tax + shipping if applicable)" : ""}
  currency: string;
  from: string;                // Wallet address that paid
  to: string;                  // Recipient address
  timestamp: number;           // Unix timestamp
  networkId: number;${kind === "e-commerce" ? `
  orderBreakdown?: {           // Detailed price breakdown
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };` : ""}
}`;

  const formDataType = getFormDataType(kind);

  const exampleCode = `
// Example: Send to your backend
async function handlePaymentSuccess(
  result: PaymentResult,
  formData: CheckoutFormData
) {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transactionHash: result.transactionHash,
      amount: result.amount,
      currency: result.currency,
      from: result.from,
      to: result.to,
      timestamp: result.timestamp,
      networkId: result.networkId,
      customerEmail: formData.email,
      customerData: formData,
    }),
  });

  const data = await response.json();
  return data;
}`;

  return `${baseTypes}\n\n${formDataType}\n${exampleCode}`;
}

/**
 * Gets the CheckoutFormData type definition based on module kind
 */
function getFormDataType(kind: string): string {
  if (kind === "e-commerce") {
    return `interface CheckoutFormData {
  email: string;
  customFields?: Record<string, any>;
  quantity?: number;
  shipping: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}`;
  }

  if (kind === "donation") {
    return `interface CheckoutFormData {
  email: string;
  donationAmount?: number;
}`;
  }

  // Paywall default
  return `interface CheckoutFormData {
  email: string;
  customFields?: Record<string, any>;
}`;
}

/**
 * Generates just the component code without type definitions
 * Useful for preview purposes
 */
export function generateComponentOnly(module: Module): string {
  return generateComponentCode(module.kind, module.configuration);
}

/**
 * Generates just the type definitions without component code
 */
export function generateTypesOnly(kind: string): string {
  return generateTypeDefinitions(kind);
}
