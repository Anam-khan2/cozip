import { Link, useLocation } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function Legal() {
  const location = useLocation();
  const isTerms = location.pathname === '/terms';
  const isPrivacy = location.pathname === '/privacy';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="store-section">
        <div className="store-shell-narrow">
        <Breadcrumbs items={[{ label: isTerms ? 'Terms & Conditions' : isPrivacy ? 'Privacy Policy' : 'Legal Information' }]} className="mb-6" />
        {/* Page Header - Centered */}
        <header className="text-center mb-12">
          <h1 
            className="text-5xl mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
          >
            {isTerms ? 'Terms & Conditions' : isPrivacy ? 'Privacy Policy' : 'Legal Information'}
          </h1>
          
          <p 
            className="text-sm"
            style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
          >
            Last Updated: March 1, 2026
          </p>
        </header>

        {/* TERMS & CONDITIONS CONTENT */}
        {isTerms && (
          <article 
            className="p-10 rounded-3xl"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                1. Introduction
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Welcome to Cozip. These Terms and Conditions govern your use of our website and the purchase of our handcrafted ceramic mugs. By accessing our website or making a purchase, you agree to be bound by these terms.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Please read these terms carefully before using our services. If you do not agree with any part of these terms, you may not access our website or make purchases.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                2. Products and Pricing
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                All products sold through Cozip are handmade ceramic mugs. Due to the artisanal nature of our products, slight variations in color, size, and design may occur. These variations are a natural characteristic of handmade items and are not considered defects.
              </p>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Prices are listed in USD and are subject to change without notice. We reserve the right to modify product prices at any time. However, orders already placed will honor the price at the time of purchase.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Product availability is subject to stock levels. We make every effort to keep our website updated, but items may sell out before we can update inventory.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                3. Orders and Payment
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                By placing an order on our website, you are making an offer to purchase products. We reserve the right to accept or decline your order for any reason. All orders are subject to acceptance and availability.
              </p>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Payment must be received in full before orders are processed. We accept major credit cards, debit cards, and other payment methods as indicated on our checkout page. All payment information is processed securely.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Once your payment is confirmed, you will receive an order confirmation email. This email does not constitute acceptance of your order – only a confirmation that we have received it.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                4. Shipping and Delivery
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                We ship to addresses within the United States and select international locations. Shipping costs and estimated delivery times are provided at checkout based on your location and selected shipping method.
              </p>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Orders are typically processed within 1-2 business days. Delivery times are estimates and are not guaranteed. Cozip is not responsible for delays caused by shipping carriers or circumstances beyond our control.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Risk of loss and title for products pass to you upon delivery to the shipping carrier. It is your responsibility to file claims for lost or damaged shipments with the carrier.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                5. Returns and Refunds
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                We want you to be completely satisfied with your purchase. If you are not happy with your order, you may return unused items in their original packaging within 30 days of delivery for a full refund.
              </p>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                To initiate a return, please contact our customer service team at hello@cozip.com with your order number. We will provide you with return instructions and a prepaid shipping label.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Refunds will be processed to the original payment method within 5-7 business days of receiving your return. Custom or personalized items cannot be returned unless they are defective or damaged upon arrival.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                6. Intellectual Property
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                All content on the Cozip website, including text, images, logos, designs, and graphics, is the property of Cozip and is protected by copyright and trademark laws.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                You may not reproduce, distribute, modify, or create derivative works from our content without express written permission. Any unauthorized use of our intellectual property is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                7. Contact Us
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Email: hello@cozip.com<br />
                Phone: +1 (234) 567-890
              </p>
            </section>
          </article>
        )}

        {/* PRIVACY POLICY CONTENT */}
        {isPrivacy && (
          <article 
            className="p-10 rounded-3xl"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                1. Introduction
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                At Cozip, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                By using our website, you consent to the collection and use of your information as described in this policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                2. Information We Collect
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                We collect several types of information from and about users of our website:
              </p>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                <strong>Personal Information:</strong> When you create an account or make a purchase, we collect information such as your name, email address, shipping address, phone number, and payment information.
              </p>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                <strong>Usage Data:</strong> We automatically collect information about your device, browser, IP address, and how you interact with our website through cookies and similar technologies.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                <strong>Communication Data:</strong> If you contact us via email or contact form, we collect the content of your message and any attachments you send.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                3. How We Use Your Information
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                We use the information we collect for the following purposes:
              </p>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                • To process and fulfill your orders<br />
                • To communicate with you about your orders, account, and customer service inquiries<br />
                • To send you marketing communications (with your consent)<br />
                • To improve our website and user experience<br />
                • To detect and prevent fraud or security issues<br />
                • To comply with legal obligations
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                4. Sharing Your Information
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                We do not sell or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, processing payments, and fulfilling orders.
              </p>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                These service providers are required to keep your information confidential and use it only for the purposes for which we disclose it to them.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                We may also disclose your information if required by law or to protect our rights, property, or safety.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                5. Cookies and Tracking Technologies
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                We use cookies and similar tracking technologies to collect information about your browsing activities. Cookies are small text files stored on your device that help us remember your preferences and improve your experience.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                You can control cookies through your browser settings. Please note that disabling cookies may affect the functionality of our website.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                6. Data Security
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-10">
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                7. Your Rights
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                You have the right to:
              </p>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                • Access, update, or delete your personal information<br />
                • Opt-out of marketing communications<br />
                • Request a copy of the data we hold about you<br />
                • Object to the processing of your data<br />
                • Withdraw consent at any time
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                To exercise these rights, please contact us at hello@cozip.com.
              </p>
            </section>

            <section>
              <h2 
                className="text-2xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}
              >
                8. Contact Us
              </h2>
              <p 
                className="mb-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                If you have any questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <p 
                style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
              >
                Email: hello@cozip.com<br />
                Phone: +1 (234) 567-890
              </p>
            </section>
          </article>
        )}

        {/* GENERIC LEGAL (if neither terms nor privacy) */}
        {!isTerms && !isPrivacy && (
          <article 
            className="p-10 rounded-3xl text-center"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <p 
              className="mb-6"
              style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', lineHeight: 1.8 }}
            >
              Please select a legal document to view:
            </p>
            <nav className="flex items-center justify-center gap-4">
              <Link
                to="/terms"
                className="px-8 py-3 rounded-full transition-all hover:scale-105"
                style={{
                  backgroundColor: '#7A9070',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(122, 144, 112, 0.3)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                }}
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy"
                className="px-8 py-3 rounded-full transition-all hover:scale-105"
                style={{
                  backgroundColor: '#7A9070',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(122, 144, 112, 0.3)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                }}
              >
                Privacy Policy
              </Link>
            </nav>
          </article>
        )}
        </div>
      </main>

      {/* Footer Links */}
      <Footer />
    </div>
  );
}