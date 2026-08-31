import React from 'react';
import {
  LegalEmail,
  LegalLink,
  LegalList,
  LegalPageLayout,
  LegalParagraph,
  LegalSection,
  LegalSubsection,
} from '../components/LegalPageLayout';

export const Privacy: React.FC = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="August 31, 2026">
      <LegalSection title="1. Introduction and Testing Environment Notice">
        <LegalParagraph>
          This Privacy Policy describes how Mofin (&ldquo;Mofin,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;) collects, uses, stores, and protects information when you use the Mofin testing
          platform. The platform includes the Mofin Android application, backend services and API, website, and
          any related features or services made available during the testing period (collectively, the
          &ldquo;Platform&rdquo; or &ldquo;Testing Platform&rdquo;).
        </LegalParagraph>
        <LegalParagraph>
          <strong>
            The Platform is provided strictly for testing, evaluation, and feedback purposes. It is not a final
            production service.
          </strong>{' '}
          Features, data handling practices, security measures, and availability may change without notice as we
          develop and evaluate the Platform. By using the Testing Platform, you acknowledge that it may contain
          bugs, incomplete functionality, and unexpected behavior, and that data handling during testing may differ
          from what we intend for any future production release.
        </LegalParagraph>
        <LegalParagraph>
          This Privacy Policy should be read together with our{' '}
          <LegalLink to="/terms">Terms and Conditions</LegalLink>, which govern your use of the Testing Platform.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Scope of This Policy">
        <LegalParagraph>
          This Privacy Policy applies to information processed through all components of the Mofin testing
          ecosystem, including:
        </LegalParagraph>
        <LegalList
          items={[
            <>The Mofin Android application (the &ldquo;App&rdquo;);</>,
            <>Our backend services, REST API, and cloud infrastructure;</>,
            <>The Mofin website and any web-based forms or pages;</>,
            <>Optional cloud sync, backup, and account-related services; and</>,
            <>Communications with us regarding testing, support, or feedback.</>,
          ]}
        />
        <LegalParagraph>
          This policy does not apply to third-party websites, services, or mobile money providers that you may
          interact with independently of Mofin. Those services are governed by their own privacy policies.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="3. Information We Collect">
        <LegalParagraph>
          The information we collect depends on how you use the Testing Platform and which features you enable.
          During the testing period, we may collect the following categories of information:
        </LegalParagraph>

        <LegalSubsection title="3.1 Account and Profile Information">
          <LegalParagraph>
            If you create an account or sign in, we may collect your name, email address, password (stored in hashed
            form), profile avatar, currency preference, and authentication credentials. If you use Google Sign-In,
            we receive information from Google as permitted by your Google account settings, such as your name,
            email address, and Google account identifier.
          </LegalParagraph>
        </LegalSubsection>

        <LegalSubsection title="3.2 Financial and Transaction Data">
          <LegalParagraph>
            Mofin is a personal finance tool. Depending on your use of the App and whether cloud sync is enabled,
            we may process:
          </LegalParagraph>
          <LegalList
            items={[
              <>Transaction amounts, dates, descriptions, notes, and types (e.g., credit or debit);</>,
              <>Account names, balances, and account types;</>,
              <>Budgets, spending limits, and budget reports;</>,
              <>Transaction categories and custom category labels or icons; and</>,
              <>Attachments you choose to upload (such as receipts or images).</>,
            ]}
          />
          <LegalParagraph>
            Much of this data is processed locally on your device. If you use cloud sync or create an account, some
            or all of this data may be transmitted to and stored on our backend servers for testing purposes.
          </LegalParagraph>
        </LegalSubsection>

        <LegalSubsection title="3.3 SMS, Notifications, and Parsed Transaction Data">
          <LegalParagraph>
            To automatically detect mobile money transactions, the App may read SMS messages and/or notification
            content from supported providers (such as M-Pesa, Airtel Money, Equitel, MTN MoMo, and similar
            services) on your device. This content is parsed locally to identify transaction details. If cloud sync
            is enabled or transactions are queued for synchronization, parsed transaction data (not necessarily the
            full raw SMS text) may be transmitted to our servers.
          </LegalParagraph>
        </LegalSubsection>

        <LegalSubsection title="3.4 Device, Usage, and Diagnostic Data">
          <LegalParagraph>
            We and our service providers may collect device and usage information during testing, including:
          </LegalParagraph>
          <LegalList
            items={[
              <>Device type, operating system version, and app version;</>,
              <>Push notification tokens and notification delivery status;</>,
              <>Crash reports, error logs, and performance diagnostics;</>,
              <>General usage analytics (such as feature interactions and session activity); and</>,
              <>Network connectivity and sync status information.</>,
            ]}
          />
        </LegalSubsection>

        <LegalSubsection title="3.5 Communications and Feedback">
          <LegalParagraph>
            If you contact us (for example, via email or our website contact form), we may collect your name, email
            address, message content, and any other information you choose to provide. If you report bugs, security
            issues, or submit feedback during testing, we may retain those reports and related technical details.
          </LegalParagraph>
        </LegalSubsection>

        <LegalSubsection title="3.6 Website Data">
          <LegalParagraph>
            When you visit our website, standard web server logs may record your IP address, browser type, referring
            page, and general usage information. We may use cookies or similar technologies where necessary for
            basic site functionality.
          </LegalParagraph>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="4. How We Use Information">
        <LegalParagraph>During the testing period, we use collected information to:</LegalParagraph>
        <LegalList
          items={[
            <>Provide, operate, maintain, and improve the Testing Platform;</>,
            <>Create and manage test accounts and authenticate users;</>,
            <>Detect, parse, categorize, and display financial transactions;</>,
            <>Enable optional cloud sync, backup, and cross-device access during testing;</>,
            <>Send service-related communications, such as verification codes, password reset emails, and statement delivery where enabled;</>,
            <>Deliver push notifications related to budgets, alerts, or testing updates;</>,
            <>Diagnose bugs, crashes, security issues, and performance problems;</>,
            <>Analyze usage patterns to improve features and stability before any production release;</>,
            <>Respond to support requests, feedback, and vulnerability reports; and</>,
            <>Comply with applicable legal obligations and enforce our Terms and Conditions.</>,
          ]}
        />
        <LegalParagraph>
          We do not sell your personal information. We do not use your financial data for advertising purposes
          during the testing period.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="5. Legal Bases for Processing (Where Applicable)">
        <LegalParagraph>
          Where data protection laws require a legal basis for processing personal information, we rely on one or
          more of the following, as applicable:
        </LegalParagraph>
        <LegalList
          items={[
            <>
              <strong>Performance of a contract:</strong> to provide the Testing Platform and related services you
              request;
            </>,
            <>
              <strong>Legitimate interests:</strong> to operate, secure, debug, and improve the Testing Platform,
              provided those interests are not overridden by your rights;
            </>,
            <>
              <strong>Consent:</strong> where required for specific permissions or optional features (such as
              notification access, SMS access, or cloud sync); and
            </>,
            <>
              <strong>Legal obligation:</strong> where processing is necessary to comply with applicable law.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Permissions Requested by the App">
        <LegalParagraph>
          The Android App may request the following permissions to function during testing. You can revoke
          permissions through your device settings, though some features may not work without them:
        </LegalParagraph>
        <LegalList
          items={[
            <>
              <strong>SMS access (READ_SMS, RECEIVE_SMS):</strong> to detect and parse mobile money transaction
              messages on supported networks;
            </>,
            <>
              <strong>Notification access:</strong> to read notification content from mobile money and related apps
              as an alternative or supplementary detection method;
            </>,
            <>
              <strong>Internet and network state:</strong> to sync data, authenticate accounts, and communicate with
              our API;
            </>,
            <>
              <strong>Camera and storage:</strong> to attach receipts or images to transactions and upload custom
              category icons;
            </>,
            <>
              <strong>Notifications (POST_NOTIFICATIONS):</strong> to send budget alerts and service notifications;
              and
            </>,
            <>
              <strong>Background and boot permissions:</strong> to maintain sync and transaction detection services.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="7. How We Store and Protect Information">
        <LegalParagraph>
          Mofin is designed with an offline-first architecture. Transaction detection and categorization occur
          primarily on your device. When you use account features or cloud sync, data is transmitted to our
          backend and stored in secured databases and cloud storage infrastructure.
        </LegalParagraph>
        <LegalParagraph>
          We implement reasonable technical and organizational measures intended to protect information during the
          testing period, including access controls, encrypted connections (HTTPS/TLS), hashed passwords, and
          restricted access to production and testing environments. However,{' '}
          <strong>
            because the Platform is a testing version, security measures may be incomplete, under development, or
            subject to change
          </strong>
          . We cannot guarantee that unauthorized access, data loss, or security incidents will not occur.
        </LegalParagraph>
        <LegalParagraph>
          You are responsible for maintaining the security of your device, account credentials, and any data stored
          locally on your device.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="8. Data Sharing and Third-Party Service Providers">
        <LegalParagraph>
          We do not sell your personal information. We may share information with trusted third-party service
          providers who assist us in operating the Testing Platform, subject to contractual obligations requiring
          them to protect your information. These may include:
        </LegalParagraph>
        <LegalList
          items={[
            <>Cloud hosting and storage providers (such as AWS);</>,
            <>Database and caching infrastructure;</>,
            <>Email delivery services (such as Brevo) for verification codes, password resets, and statements;</>,
            <>Push notification services (such as OneSignal);</>,
            <>Analytics, crash reporting, and performance monitoring services (such as Firebase); and</>,
            <>Authentication providers (such as Google Sign-In).</>,
          ]}
        />
        <LegalParagraph>
          We may also disclose information if required by law, legal process, or governmental request, or if we
          believe disclosure is necessary to protect the rights, property, or safety of Mofin, our users, or others.
        </LegalParagraph>
        <LegalParagraph>
          If Mofin is involved in a merger, acquisition, or asset sale, your information may be transferred as part
          of that transaction, subject to applicable law and notice where required.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Data Retention">
        <LegalParagraph>
          During the testing period, we retain information for as long as reasonably necessary to operate the
          Testing Platform, fulfill the purposes described in this policy, comply with legal obligations, resolve
          disputes, and enforce our agreements.
        </LegalParagraph>
        <LegalParagraph>
          Because this is a testing environment, we may delete, reset, or migrate test data at any time, including
          upon termination of the testing program, account closure, or extended inactivity. We recommend that you
          maintain your own backups of any important information and do not rely on the Testing Platform as your
          sole record of financial data.
        </LegalParagraph>
        <LegalParagraph>
          You may request deletion of your account and associated server-side data by contacting us at{' '}
          <LegalEmail email="micodan24@gmail.com" />. Local data on your device can be removed by clearing app data
          or uninstalling the App.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="10. Your Rights and Choices">
        <LegalParagraph>
          Depending on your location and applicable law, you may have rights regarding your personal information,
          which may include the right to:
        </LegalParagraph>
        <LegalList
          items={[
            <>Access the personal information we hold about you;</>,
            <>Request correction of inaccurate information;</>,
            <>Request deletion of your account or personal information, subject to legal and operational requirements;</>,
            <>Withdraw consent where processing is based on consent;</>,
            <>Object to or restrict certain processing; and</>,
            <>Receive a copy of your data in a portable format, where technically feasible.</>,
          ]}
        />
        <LegalParagraph>
          To exercise these rights, contact us at <LegalEmail email="micodan24@gmail.com" />. We may need to verify
          your identity before responding. You may also manage certain permissions and optional features directly
          through your device settings or within the App.
        </LegalParagraph>
        <LegalParagraph>
          If you are located in the European Economic Area, United Kingdom, or other jurisdictions with data
          protection authorities, you may have the right to lodge a complaint with your local supervisory authority.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="11. International Data Transfers">
        <LegalParagraph>
          The Testing Platform may be operated using infrastructure and service providers located in countries other
          than your own. Where information is transferred internationally, we take steps intended to ensure
          appropriate safeguards are in place as required by applicable law.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="12. Children&rsquo;s Privacy">
        <LegalParagraph>
          The Testing Platform is not intended for use by individuals under the age of 16 (or the minimum age
          required in your jurisdiction). We do not knowingly collect personal information from children. If you
          believe a child has provided us with personal information, please contact us and we will take steps to
          delete it.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="13. Testing-Specific Privacy Considerations">
        <LegalParagraph>
          You acknowledge and agree that, because the Platform is provided for testing purposes:
        </LegalParagraph>
        <LegalList
          items={[
            <>Data handling practices may change as features are developed, modified, or removed;</>,
            <>Test data may be incomplete, duplicated, corrupted, or lost during development activities;</>,
            <>We may use aggregated or de-identified data from the testing program to evaluate and improve the Platform;</>,
            <>Security and privacy controls may not yet meet the standards of a production financial service; and</>,
            <>You should not submit real financial data that you cannot afford to lose, expose, or have reset during testing, unless you accept these risks.</>,
          ]}
        />
        <LegalParagraph>
          For additional terms governing your use of the Testing Platform, including disclaimers and limitations of
          liability, see our <LegalLink to="/terms">Terms and Conditions</LegalLink>.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="14. Changes to This Privacy Policy">
        <LegalParagraph>
          We may update this Privacy Policy at any time during the testing period to reflect changes in our
          practices, the Platform, or applicable law. When we make material changes, we will update the &ldquo;Last
          updated&rdquo; date at the top of this page and may provide additional notice through the App, website, or
          email where appropriate.
        </LegalParagraph>
        <LegalParagraph>
          Your continued use of the Testing Platform after changes become effective constitutes your acceptance of
          the updated Privacy Policy, unless applicable law requires a different form of consent.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="15. Contact Us">
        <LegalParagraph>
          If you have questions about this Privacy Policy, wish to exercise your privacy rights, or need to report a
          privacy or security concern, please contact us:
        </LegalParagraph>
        <LegalList
          items={[
            <>
              Email: <LegalEmail email="micodan24@gmail.com" />
            </>,
            <>
              Website: <LegalLink to="/contact">Contact Us</LegalLink>
            </>,
          ]}
        />
        <LegalParagraph>
          For security vulnerability reports, please include sufficient detail for us to investigate and reproduce
          the issue. We appreciate responsible disclosure during the testing period.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
};
