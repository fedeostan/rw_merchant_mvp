import { Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function StylesAndThemingPage() {
  return (
    <div className="flex flex-col gap-2.5 h-full pl-0 pr-2 py-2">
      <Breadcrumb
        items={[
          {
            label: "Merchant tools",
            icon: Wrench,
          },
          {
            label: "Styles & theming",
          },
        ]}
      />

      <div className="flex-1 flex flex-col gap-6 px-0 py-6">
        <div className="flex flex-col gap-4 px-6">
          {/* Hero Section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-foreground">
              Styling & Theming
            </h1>
            <p className="text-base text-muted-foreground">
              Customize the appearance to match your brand.
            </p>
          </div>

          {/* Theme Support */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Theme Support
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              Mnee Checkout supports light, dark, and auto themes:
            </p>
            <CodeBlock
              language="tsx"
              code={`// Light theme
<MneeCheckout theme="light" {...props} />

// Dark theme
<MneeCheckout theme="dark" {...props} />

// Auto (follows system preference)
<MneeCheckout theme="auto" {...props} />`}
            />
          </div>

          {/* Custom Colors */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Custom Colors
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              Customize colors to match your brand:
            </p>
            <CodeBlock
              language="tsx"
              code={`<MneeCheckout
  checkoutType="paywall"
  styling={{
    primaryColor: '#8b5cf6', // Primary brand color
    buttonColor: '#ec4899', // Button background
    buttonTextColor: '#ffffff', // Button text
    accentColor: '#3b82f6', // Accent highlights
    borderRadius: 'xl', // sm | md | lg | xl | 2xl
  }}
  {...otherProps}
/>`}
            />
          </div>

          {/* Button Customization */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Button Customization
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              Customize the trigger button appearance:
            </p>
            <CodeBlock
              language="tsx"
              code={`<MneeCheckout
  buttonConfig={{
    text: 'Buy Now', // Button text
    variant: 'default', // default | outline | ghost
    size: 'lg', // sm | md | lg
  }}
  {...otherProps}
/>`}
            />
          </div>

          {/* StyleConfig Interface */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              StyleConfig Interface
            </h2>
            <CodeBlock
              language="typescript"
              code={`interface StyleConfig {
  primaryColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  accentColor?: string;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}`}
            />
          </div>

          {/* Complete Styling Example */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Complete Styling Example
            </h2>
            <CodeBlock
              language="tsx"
              code={`import { MneeCheckout } from '@mnee/checkout';

function BrandedCheckout() {
  return (
    <MneeCheckout
      checkoutType="ecommerce"
      payment={{
        amount: 49.99,
        mneeDepositAddress: '1MC...',
      }}
      theme="dark"
      styling={{
        primaryColor: '#8b5cf6',
        buttonColor: '#8b5cf6',
        buttonTextColor: '#ffffff',
        accentColor: '#ec4899',
        borderRadius: 'xl',
      }}
      buttonConfig={{
        text: 'Purchase Now',
        variant: 'default',
        size: 'lg',
      }}
      ecommerceConfig={{
        productName: 'Premium Package',
        productImage: '/product.jpg',
      }}
      onSuccess={(result) => {
        console.log('Purchase complete!', result);
      }}
    />
  );
}`}
            />
          </div>

          {/* Advanced: CSS Variables */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Advanced: CSS Variables
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              For more control, you can override CSS variables directly:
            </p>
            <CodeBlock
              language="css"
              code={`.mnee-checkout {
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

.dark .mnee-checkout {
  --primary: 263.4 70% 50.4%;
  --border: 216 34% 17%;
}`}
            />
          </div>

          {/* Best Practices */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Best Practices
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  ✓ Maintain Contrast
                </h3>
                <p className="text-base text-muted-foreground">
                  Ensure sufficient contrast between text and background colors
                  for accessibility.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  ✓ Test Both Themes
                </h3>
                <p className="text-base text-muted-foreground">
                  If using auto theme, test your custom colors in both light and
                  dark modes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  ✓ Brand Consistency
                </h3>
                <p className="text-base text-muted-foreground">
                  Use your brand's primary colors for the best integration with
                  your site.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
