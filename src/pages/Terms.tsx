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

export const Terms: React.FC = () => {
  return (
    <LegalPageLayout title="Terms and Conditions" lastUpdated="August 31, 2026">
      <LegalSection title="1. Agreement to These Terms">
        <LegalParagraph>
          These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the Mofin testing
          platform, including the Mofin Android application, backend services and API, website, and any related
          features or services made available during the testing period (collectively, the &ldquo;Platform&rdquo; or
          &ldquo;Testing Platform&rdquo;).
        </LegalParagraph>
        <LegalParagraph>
          By downloading, installing, accessing, or using any part of the Testing Platform, you agree to be bound
          by these Terms and our <LegalLink to="/privacy">Privacy Policy</LegalLink>. If you do not agree, you
          must not use the Testing Platform.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Testing and Beta Program Notice">
        <LegalParagraph>
          <strong>
            The Platform is provided strictly for testing, evaluation, and feedback purposes. It is not a final
            production service and is not intended for live, mission-critical, or irreversible financial use.
          </strong>
        </LegalParagraph>
        <LegalParagraph>
          By participating in the testing program, you acknowledge and agree that:
        </LegalParagraph>
        <LegalList
          items={[
            <>The Platform is experimental and may contain bugs, errors, defects, and incomplete or changing features;</>,
            <>The Platform may experience downtime, data loss, sync failures, security vulnerabilities, or unexpected behavior;</>,
            <>Features, APIs, data models, and availability may be added, modified, suspended, or removed at any time without notice;</>,
            <>Test data may be reset, migrated, or deleted as part of development and testing activities; and</>,
            <>Any future production version may differ materially from the current Testing Platform.</>,
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Description of the Platform">
        <LegalParagraph>
          Mofin is a personal finance tool designed to help users track income and expenses, primarily by detecting
          and parsing mobile money transactions from SMS messages and/or device notifications. The Testing Platform
          may include, without limitation:
        </LegalParagraph>
        <LegalList
          items={[
            <>Automatic transaction detection and categorization;</>,
            <>Budget management, alerts, and reporting;</>,
            <>Account and category management;</>,
            <>Local offline storage and optional cloud sync;</>,
            <>Data export and statement delivery features; and</>,
            <>User account registration, authentication, and API access.</>,
          ]}
        />
        <LegalParagraph>
          Mofin does not initiate financial transactions on your behalf and is not a bank, payment processor,
          lender, or financial advisor. The Platform provides informational tools only.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Eligibility">
        <LegalParagraph>
          You must be at least 16 years old (or the minimum age required in your jurisdiction) and have the legal
          capacity to enter into these Terms. By using the Testing Platform, you represent that you meet these
          requirements.
        </LegalParagraph>
        <LegalParagraph>
          If you use the Testing Platform on behalf of an organization, you represent that you have authority to
          bind that organization to these Terms.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="5. Account Registration and Security">
        <LegalParagraph>
          Certain features require you to create an account or sign in (including via email and password or Google
          Sign-In). You agree to provide accurate, current information and to keep your account credentials
          confidential.
        </LegalParagraph>
        <LegalParagraph>
          You are solely responsible for all activity that occurs under your account and for maintaining the
          security of your device and login credentials. Notify us promptly at{' '}
          <LegalEmail email="micodan24@gmail.com" /> if you suspect unauthorized access to your account.
        </LegalParagraph>
        <LegalParagraph>
          We may suspend or terminate accounts that violate these Terms or that we reasonably believe pose a security
          or abuse risk to the Testing Platform or other users.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="6. Acceptable Use">
        <LegalParagraph>
          During the testing period, you agree to use the Testing Platform only for lawful personal evaluation and
          feedback purposes. You are responsible for:
        </LegalParagraph>
        <LegalList
          items={[
            <>Ensuring you have the right and any necessary permissions to access and process data on your device;</>,
            <>Reviewing detected transactions and categories for accuracy before relying on them;</>,
            <>Maintaining backups of any data you consider important;</>,
            <>Complying with applicable laws, including data protection and telecommunications regulations in your jurisdiction; and</>,
            <>Using the Testing Platform in a manner consistent with these Terms and our Privacy Policy.</>,
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Prohibited Activities">
        <LegalParagraph>You agree not to:</LegalParagraph>
        <LegalList
          items={[
            <>Use the Testing Platform for any unlawful, fraudulent, or harmful purpose;</>,
            <>Attempt to gain unauthorized access to the Platform, other users&rsquo; accounts, or our systems;</>,
            <>Reverse engineer, decompile, or attempt to extract source code except where permitted by applicable law;</>,
            <>Interfere with or disrupt the Platform, including by introducing malware, automated scraping, or denial-of-service attacks;</>,
            <>Upload or transmit content that infringes intellectual property or privacy rights, or that is defamatory, abusive, or illegal;</>,
            <>Use the Testing Platform to process data you do not have permission to access;</>,
            <>Misrepresent your identity or affiliation;</>,
            <>Resell, sublicense, or commercially exploit the Testing Platform without our prior written consent; or</>,
            <>Publicly disclose security vulnerabilities without giving us a reasonable opportunity to investigate and remediate, except where prohibited by law.</>,
          ]}
        />
      </LegalSection>

      <LegalSection title="8. No Reliance on the Testing Version">
        <LegalParagraph>
          <strong>
            You must not rely on the Testing Platform for critical, irreversible, or high-stakes financial
            decisions or transactions.
          </strong>{' '}
          Transaction detection, categorization, balances, budgets, reports, and other outputs may be inaccurate,
          incomplete, delayed, or unavailable during testing.
        </LegalParagraph>
        <LegalParagraph>
          You are solely responsible for verifying your financial records with your mobile money provider, bank, or
          other authoritative sources before making decisions based on information displayed in the App.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Permissions and Device Access">
        <LegalParagraph>
          The App may request access to SMS messages, notifications, camera, storage, network connectivity, and
          other device permissions necessary to provide its features during testing. By granting these permissions,
          you authorize the App to access and process the relevant data as described in our{' '}
          <LegalLink to="/privacy">Privacy Policy</LegalLink>.
        </LegalParagraph>
        <LegalParagraph>
          You may revoke permissions through your device settings, but certain features may cease to function.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="10. Privacy and Data">
        <LegalParagraph>
          Our collection, use, storage, and sharing of information are described in our{' '}
          <LegalLink to="/privacy">Privacy Policy</LegalLink>, which is incorporated into these Terms by reference.
          Because the Platform is a testing version, data handling practices may evolve, and test data may be subject
          to reset, migration, or deletion.
        </LegalParagraph>
        <LegalParagraph>
          You acknowledge that the Testing Platform is not a certified or audited production financial system and
          that privacy and security safeguards may be incomplete during the testing period.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="11. Intellectual Property">
        <LegalParagraph>
          The Testing Platform, including its software, design, logos, documentation, and content (excluding your
          data and feedback submitted by you), is owned by Mofin and its licensors and is protected by intellectual
          property laws.
        </LegalParagraph>
        <LegalParagraph>
          Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to
          access and use the Testing Platform solely for personal testing and evaluation purposes during the testing
          period. No other rights are granted.
        </LegalParagraph>
        <LegalParagraph>
          You retain ownership of the data you submit or generate through the Platform. You grant Mofin a
          non-exclusive, worldwide, royalty-free license to use, store, process, and display your data as necessary
          to operate, maintain, and improve the Testing Platform during the testing period, consistent with our
          Privacy Policy.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="12. Feedback">
        <LegalParagraph>
          If you provide suggestions, bug reports, ideas, or other feedback about the Testing Platform, you grant
          Mofin a perpetual, irrevocable, worldwide, royalty-free license to use, modify, and incorporate that
          feedback for any purpose without obligation to you, except where prohibited by applicable law.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="13. Third-Party Services">
        <LegalParagraph>
          The Testing Platform may integrate with or rely on third-party services, including mobile money providers,
          Google Sign-In, cloud infrastructure, analytics, email, and push notification providers. Your use of
          third-party services may be subject to separate terms and privacy policies. Mofin is not responsible for
          third-party services and does not control their availability, accuracy, or conduct.
        </LegalParagraph>
        <LegalParagraph>
          Links to third-party websites or services do not constitute endorsement. You access them at your own risk.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="14. Service Modifications, Suspension, and Termination">
        <LegalParagraph>
          We reserve the right, at our sole discretion and without liability to you (to the extent permitted by
          applicable law), to modify, suspend, restrict, or terminate access to the Testing Platform or any part of
          it at any time, with or without notice, including ending the testing program entirely.
        </LegalParagraph>
        <LegalParagraph>
          You may stop using the Testing Platform at any time by uninstalling the App and discontinuing use of our
          services. Provisions that by their nature should survive termination will continue to apply, including
          those relating to intellectual property, disclaimers, limitations of liability, indemnification, and
          governing law.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="15. Disclaimers">
        <LegalParagraph>
          <strong>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TESTING PLATFORM IS PROVIDED ON AN &ldquo;AS
            IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITH ALL FAULTS, WITHOUT WARRANTIES OF ANY KIND, WHETHER
            EXPRESS, IMPLIED, OR STATUTORY.
          </strong>
        </LegalParagraph>
        <LegalParagraph>
          Without limiting the foregoing, Mofin disclaims any warranties of merchantability, fitness for a particular
          purpose, title, non-infringement, accuracy, reliability, availability, and uninterrupted or error-free
          operation. We do not warrant that:
        </LegalParagraph>
        <LegalList
          items={[
            <>The Platform will meet your requirements or expectations;</>,
            <>Transaction detection, categorization, or financial summaries will be accurate or complete;</>,
            <>Defects, bugs, or security vulnerabilities will be corrected;</>,
            <>Data will not be lost, corrupted, or exposed during testing; or</>,
            <>The Platform will be suitable for production or mission-critical use.</>,
          ]}
        />
        <LegalParagraph>
          Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may
          not apply to you.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="16. Limitation of Liability">
        <LegalParagraph>
          <strong>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MOFIN AND ITS OPERATORS, AFFILIATES, OFFICERS,
            DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR
            BUSINESS OPPORTUNITY, ARISING OUT OF OR RELATED TO YOUR USE OF (OR INABILITY TO USE) THE TESTING
            PLATFORM.
          </strong>
        </LegalParagraph>
        <LegalParagraph>
          This includes, without limitation, damages arising from bugs, errors, downtime, incomplete features,
          inaccurate transaction data, service interruptions, unauthorized access, security incidents, data loss,
          sync failures, or reliance on information provided by the Platform during the testing period.
        </LegalParagraph>
        <LegalParagraph>
          To the extent permitted by applicable law, Mofin&rsquo;s total aggregate liability for all claims arising
          out of or relating to the Testing Platform or these Terms will not exceed the greater of (a) the amount
          you paid to Mofin for access to the Testing Platform in the twelve (12) months preceding the claim, or (b)
          fifty United States dollars (USD $50).
        </LegalParagraph>
        <LegalParagraph>
          Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable
          law, including liability for fraud, willful misconduct, or death or personal injury caused by negligence
          where such exclusion is prohibited.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="17. Indemnification">
        <LegalParagraph>
          To the extent permitted by applicable law, you agree to indemnify, defend, and hold harmless Mofin and its
          operators, affiliates, officers, directors, employees, and agents from and against any claims,
          liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or related
          to:
        </LegalParagraph>
        <LegalList
          items={[
            <>Your use or misuse of the Testing Platform;</>,
            <>Your violation of these Terms or applicable law;</>,
            <>Your violation of any third-party rights, including privacy or intellectual property rights; or</>,
            <>Data you submit, process, or access through the Platform without proper authorization.</>,
          ]}
        />
      </LegalSection>

      <LegalSection title="18. Reporting Bugs and Security Issues">
        <LegalParagraph>
          We welcome reports of bugs, defects, and security vulnerabilities discovered during testing. Please report
          issues promptly to <LegalEmail email="micodan24@gmail.com" /> or via our{' '}
          <LegalLink to="/contact">Contact Us</LegalLink> page.
        </LegalParagraph>
        <LegalParagraph>
          When reporting a security vulnerability, please include:
        </LegalParagraph>
        <LegalList
          items={[
            <>A clear description of the issue and its potential impact;</>,
            <>Steps to reproduce the vulnerability, if known;</>,
            <>The App version, device model, and operating system version; and</>,
            <>Your contact information so we can follow up.</>,
          ]}
        />
        <LegalParagraph>
          Please do not publicly disclose security vulnerabilities until we have had a reasonable opportunity to
          investigate and address them, except where prohibited by law. We appreciate responsible disclosure and will
          work in good faith to review and remediate reported issues during the testing period.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="19. Export and Compliance">
        <LegalParagraph>
          You agree to comply with all applicable export control, sanctions, and trade laws. You may not use the
          Testing Platform if you are located in, or ordinarily resident in, a country or region subject to
          comprehensive sanctions, or if you are on any applicable restricted or denied parties list.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="20. Governing Law and Disputes">
        <LegalParagraph>
          These Terms are governed by the laws applicable in the jurisdiction where Mofin operates, without regard
          to conflict-of-law principles, except where mandatory consumer protection laws in your country of residence
          provide otherwise.
        </LegalParagraph>
        <LegalParagraph>
          Any dispute arising out of or relating to these Terms or the Testing Platform will be resolved through
          good-faith negotiation where possible. If a dispute cannot be resolved informally, it shall be subject to
          the exclusive jurisdiction of the courts competent in Mofin&rsquo;s principal place of business, except
          where applicable law grants you the right to bring proceedings in your country of residence.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="21. Changes to These Terms">
        <LegalParagraph>
          We may update these Terms at any time during the testing period. When we make material changes, we will
          update the &ldquo;Last updated&rdquo; date at the top of this page and may provide additional notice
          through the App, website, or email where appropriate.
        </LegalParagraph>
        <LegalParagraph>
          Your continued use of the Testing Platform after changes become effective constitutes your acceptance of
          the updated Terms. If you do not agree to the updated Terms, you must stop using the Testing Platform.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="22. General Provisions">
        <LegalSubsection title="Entire Agreement">
          <LegalParagraph>
            These Terms, together with the Privacy Policy, constitute the entire agreement between you and Mofin
            regarding the Testing Platform and supersede any prior agreements or understandings on the subject.
          </LegalParagraph>
        </LegalSubsection>
        <LegalSubsection title="Severability">
          <LegalParagraph>
            If any provision of these Terms is held invalid or unenforceable, the remaining provisions will remain
            in full force and effect.
          </LegalParagraph>
        </LegalSubsection>
        <LegalSubsection title="Waiver">
          <LegalParagraph>
            Our failure to enforce any provision of these Terms will not constitute a waiver of that provision or
            any other provision.
          </LegalParagraph>
        </LegalSubsection>
        <LegalSubsection title="Assignment">
          <LegalParagraph>
            You may not assign or transfer these Terms without our prior written consent. We may assign these Terms
            in connection with a merger, acquisition, or sale of assets.
          </LegalParagraph>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="23. Contact Us">
        <LegalParagraph>
          If you have questions about these Terms or the Testing Platform, please contact us:
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
      </LegalSection>
    </LegalPageLayout>
  );
};
