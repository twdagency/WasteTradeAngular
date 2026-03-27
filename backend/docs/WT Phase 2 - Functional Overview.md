 

Wastetrade Phase 2 \- Functional Overview v1.0

Date	Thursday 21st August 2025

Client	Wastetrade

Job Name	Wastetrade Rebuild

Requested by	Bevin Tumulty, Jason Loughlin

Written by	Paige Walczak		

# **1\. Table of Contents** {#1.-table-of-contents}

[**1\. Table of Contents	1**](#1.-table-of-contents)

[**2\. Background and Concept	3**](#2.-background-and-concept)

[2.1. Project Overview	3](#2.1.-project-overview)

[**3\. Glossary	4**](#3.-glossary)

[**4\. Users	5**](#4.-users)

[4.1. Permissions Table	5](#4.1.-permissions-table)

[**5\. Integrations and Non-Functional Requirements	5**](#5.-integrations-and-non-functional-requirements)

[**6\. Detailed Functional Requirements	6**](#6.-detailed-functional-requirements)

[6.1. Trading Platform	6](#6.1.-trading-platform)

[6.1.1. Registration	6](#6.1.1.-registration)

[6.1.2. My Sales Listings	16](#6.1.2.-my-sales-listings)

[6.1.3. My Wanted Listings	39](#6.1.3.-my-wanted-listings)

[6.1.4. My Offers	42](#6.1.4.-my-offers)

[6.1.5. Marketplace	44](#6.1.5.-marketplace)

[6.1.6. Trading Notifications	52](#6.1.6.-trading-notifications)

[6.1.7. Account	65](#6.1.7.-account)

[6.2. Haulage Platform	73](#6.2.-haulage-platform)

[6.2.1. Registration	73](#6.2.1.-registration)

[6.2.2. Haulage Homepage	79](#6.2.2.-haulage-homepage)

[6.2.3. My Haulage Offers	91](#6.2.3.-my-haulage-offers)

[6.2.4. Haulier Profile	101](#6.2.4.-haulier-profile)

[6.2.5. Haulier Notifications	111](#6.2.5.-haulier-notifications)

[6.3. Master Elements	120](#6.3.-master-elements)

[6.3.1. Resources	120](#6.3.1.-resources)

[6.3.2. Layout	121](#6.3.2.-layout)

[6.3.3. Multi-User Company Accounts	122](#6.3.3.-multi-user-company-accounts)

[6.4. Admin	124](#6.4.-admin)

[6.4.1 Admin Dashboard	124](#6.4.1-admin-dashboard)

[6.4.2. User Management	152](#6.4.2.-user-management)

[6.4.3. Resource Content Management	164](#6.4.3.-resource-content-management)

[6.4.4. Settings	167](#6.4.4.-settings)

[6.5. Salesforce Integration	173](#6.5.-salesforce-integration)

[6.5.1. Data Exchange	173](#6.5.1.-data-exchange)

[6.5.2. Document Generation	174](#6.5.2.-document-generation)

[6.6. Trading Mobile App	175](#6.6.-trading-mobile-app)

[6.6.1. Download and Installation	175](#6.6.1.-download-and-installation)

[6.6.2. Splash Screen	175](#6.6.2.-splash-screen)

[6.6.3. Landing Page	176](#6.6.3.-landing-page)

[6.6.4. Registration	176](#6.6.4.-registration)

[6.6.5. Authentication	176](#6.6.5.-authentication)

[6.6.6. Trading Homepage	177](#6.6.6.-trading-homepage)

[6.6.7. Wanted Listings	179](#6.6.7.-wanted-listings)

[6.6.8. Sales Listings	182](#6.6.8.-sales-listings)

[6.6.9. My Sales Listings	183](#6.6.9.-my-sales-listings)

[6.6.10 My Wanted Listings	185](#6.6.10-my-wanted-listings)

[6.6.11. My Offers	186](#6.6.11.-my-offers)

[6.6.12. Account	188](#6.6.12.-account)

[6.6.13. Notifications	191](#6.6.13.-notifications)

[6.7. Design/UI Updates	192](#6.7.-design/ui-updates)

[6.7.1. Design Updates	192](#6.7.1.-design-updates)

[**7\. Appendix	195**](#7.-appendix)

[7.1. Integrations	195](#7.1.-integrations)

[7.2. Web App Non-Functional Requirements	197](#7.2.-web-app-non-functional-requirements)

[7.2.1. Browsers	197](#7.2.1.-browsers)

[7.2.2. Design	198](#7.2.2.-design)

[7.2.3. Version Management	198](#7.2.3.-version-management)

[7.2.4. Speed	198](#7.2.4.-speed)

[7.2.5. Language	198](#7.2.5.-language)

[7.2.6. Accessibility	199](#7.2.6.-accessibility)

[7.2.7. Offline mode	199](#7.2.7.-offline-mode)

[7.2.8. Analytics	199](#7.2.8.-analytics)

[7.2.9. Testing	199](#7.2.9.-testing)

[7.2.10. Security	199](#7.2.10.-security)

[7.2.11. Infrastructure	199](#7.2.11.-infrastructure)

[7.2.12. Deployment	199](#7.2.12.-deployment)

[7.3. Mobile App Non-Functional Requirements	200](#7.3.-mobile-app-non-functional-requirements)

[7.3.1. Devices	200](#7.3.1.-devices)

[7.3.2. Design	200](#7.3.2.-design)

[7.3.3. Version Management	200](#7.3.3.-version-management)

[7.3.4. Speed	200](#7.3.4.-speed)

[7.3.5. Language	200](#7.3.5.-language)

[7.3.6. Accessibility	201](#7.3.6.-accessibility)

[7.3.7. Offline mode	201](#7.3.7.-offline-mode)

[7.3.8. Analytics	201](#7.3.8.-analytics)

[7.3.9. Testing	201](#7.3.9.-testing)

[7.3.10. Security	201](#7.3.10.-security)

[7.3.11. Infrastructure	202](#7.3.11.-infrastructure)

[7.3.12. Deployment	202](#7.3.12.-deployment)

[7.4. On-Going Costs and Subscriptions	202](#7.4.-on-going-costs-and-subscriptions)

# **2\. Background and Concept** {#2.-background-and-concept}

WasteTrade is a Global Waste Marketplace. The website is [https://www.wastetrade.com/](https://www.wastetrade.com/). WasteTrade is an online marketplace to connect waste generators, such as manufacturers, with recyclers and end users of waste commodities around the globe. Users register to become Buyers, Sellers or Hauliers. Sellers list their waste on the site, and Buyers can search and bid for the listing. Hauliers bid to transport the traded waste. Buyers and Hauliers must be accredited and certified to be able to bid to purchase or transport the waste. Sellers are accredited, certified, and vetted to ensure accurate listings.

Phase 1 of the WasteTrade Rebuild delivers the core foundation for user registration, onboarding, trading, account management, and Admin oversight. The trading platform enables users to create, manage, and respond to listings for both sales and wanted materials. Offer functionality allows users to view and manage offers they’ve received or made on listings and review bid details. For admins, Phase 1 delivers oversight capabilities through the dashboard, approval workflows, CRM integration, and audit trails, enabling effective monitoring and governance. Collectively, this phase establishes a trusted, user-friendly, and controlled platform that connects Buyers, Sellers, and Hauliers while laying the groundwork for future expansion.

[Wastetrade - Functional Overview](https://docs.google.com/document/d/1UIQh4lQkmkelTPbB9hwutt0s4EtgMEUfjn85RNVVoQw/edit?tab=t.0)

The purpose of this document is to describe the functional and non-functional requirements of the system. Technical requirements will be defined later in the process, once the functional requirements of the scope are defined. Any wireframes included in this document are not indicative of the final design. 

## **2.1. Project Overview** {#2.1.-project-overview}

Phase 2 looks to build on the foundation established in Phase 1 by significantly expanding WasteTrade’s functionality. The secondary phase introduces new user roles, notably Hauliers, who are responsible for bidding on and fulfilling transport jobs. This broadens the trading platform to support a fully integrated marketplace where Buyers, Sellers, and Hauliers interact seamlessly under a controlled and accredited environment. It includes enhanced tools for listing creation, offer management, bidding, notifications, and document management. ~~Phase 2 also introduces a mobile application that replicates the core marketplace features, with the intention of expanding its capabilities in future phases so that the mobile experience fully aligns with the website.~~ In parallel, Administrator tools are also enhanced to provide greater oversight of the marketplace and Hauliers, including support for listings, offers, and haulage bids, as well as broader platform management features such as resource and Admin user management. Collectively, Phase 2 is designed to transform WasteTrade from a foundational marketplace into a more complete, feature-rich platform that facilitates global waste trading, ensures compliance, and supports scalability for future growth.

# **3\. Glossary** {#3.-glossary}

**Admin Platform**: The backend module where WasteTrade staff manage all aspects of the platform, including user activities and system settings.  
**API (Application Programming Interface)**: A set of defined rules and tools that allow WasteTrade to integrate with external systems such as payment gateways, notification services, and analytics platforms.  
**Audit Trail**: A system-generated record that tracks all significant actions and changes on the platform, ensuring transparency, compliance, and accountability.  
**Buyer**: A registered user on WasteTrade who can search and bid for waste materials listed by Sellers.  
**Dashboard**: A user-friendly interface providing at-a-glance insights, metrics, and quick navigation to key features depending on the user’s role (e.g., Buyer, Seller, Haulier, or admin).  
Haulier: A certified user responsible for the transportation of traded waste materials, bidding on and fulfilling transport jobs.  
**FAQ (Frequently Asked Questions):** A support section where common queries are answered to help users self-serve solutions.  
**Incoterms (International Commercial Terms):** A set of globally recognised trade rules published by the International Chamber of Commerce (ICC) that define responsibilities between Buyers and Sellers in international transactions, such as shipping, insurance, and customs duties.  
**Integration**: The technical component that connects WasteTrade to third-party services (e.g., SendGrid).  
**Listing:** An entry created by a Seller detailing waste material available or wanted for purchase, sales listings are open for bids from Buyers.  
**Marketplace:** The trading platform environment of the WasteTrade platform, where Buyers and Sellers interact, list materials, and place bids.  
**MFI (Melt Flow Index):** A plastics industry term referenced in listings, measuring the ease of flow of molten plastic material.  
**Offer:** A Buyer’s proposal to purchase a listed material, which may include pricing, quantity, and delivery details.  
**Seller:** A vetted and approved user who lists waste materials for sale, ensuring all listings are accurate and meet quality standards.  
**Super Admin:** A user role with comprehensive access to all administrative functions of the platform, including high-level settings and user management.  
**User Roles:** Defined access levels on the platform (e.g., Buyer, Seller, Haulier, Admin, Super Admin) that determine what actions each type of user can perform.

# **4\. Users** {#4.-users}

User numbers are indicative to give the development team an idea of the expected size of the system. These user numbers are not fixed limits.

| Role Name | No. of Users | Responsibility / Activity |
| :---- | ----- | :---- |
| Super Admin | 4 | System settings All Admin user management Admin dashboard |
| Admin | 5 \- 20 | Admin/Sales Admin user management Admin Dashboard |
| Sales Admin | 5 \- 20 | Admin dashboard only |
| Trader (Buyer/Seller/Both) | 1000 | Create/manage Sales listings Create/manage Wanted listings View/search marketplace Place bids and manage offers Manage company profile, documents, and locations. |
| Haulier | 500 | View available loads Manage my offers Manage haulage profile |

## **4.1. Permissions Table** {#4.1.-permissions-table}

[Permissions for WasteTrade](https://docs.google.com/spreadsheets/d/1aQtwC2a-2Ab3IRhkyaL1CeaaHBsIgYnS0NvcZCv-KNQ/edit?usp=sharing)

# **5\. Integrations and Non-Functional Requirements** {#5.-integrations-and-non-functional-requirements}

Standard Non-Functional requirements will be included in the application development. Enhanced and Super Enhanced features will incur additional costs and will be defined as in-scope or out-of-scope during the MoSCoW session. 

* [Integration requirements](#7.1.-integrations)  
* [Web app non-functional requirements](#7.2.-web-app-non-functional-requirements)  
* [Mobile app non-functional requirements](#7.3.-mobile-app-non-functional-requirements)

# **6\. Detailed Functional Requirements** {#6.-detailed-functional-requirements}

## **6.1. Trading Platform** {#6.1.-trading-platform}

### 6.1.1. Registration {#6.1.1.-registration}

#### **6.1.1.1. Autosave** {#6.1.1.1.-autosave}

* The information provided by the client through any of the registration forms will be saved automatically.  
  * Every 5 minutes  
  * When the user moves between sections

| Preconditions: The user is completing a Buyer/Seller registration/onboarding form. Triggers: Time-based: every 5 minutes while the user is on any registration form step. Navigation-based: immediately when the user moves between sections/steps of the registration flow. Acceptance Criteria: Save Behaviour Autosave captures all user-entered values on the current registration step, including all fields shown in that step, and persists them as a draft for that user/account. On section change, autosave runs before rendering the destination section, so no progress is lost. Time-based autosave runs no more often than once every 5 minutes and no less often than once every 5 minutes while the page is active. If the user returns to the registration, any fields previously autosaved must pre-populate so the user continues where they left off (aligning with Save/Resume [6.1.1.2](#6.1.1.2.-save/resume)). Validation Registration page field definitions remain unchanged. Autosave must not block on validation errors; it saves the current values (including incomplete/invalid) as “draft.”  Formal validations and blocking errors occur on explicit Submit per registration rules. Impacts on Phase 1: Registration form sections (Phase 1 – 6.1.1.1): Autosave must cover all fields/sections defined there; no loss of data when moving between those sections. CRM integration consistency: Ensure autosave drafts are not pushed to CRM as completed registrations; CRM push occurs only on successful submission. Postconditions: After a successful autosave (timer or section change), the user’s in-progress registration exists as an up-to-date draft that can be resumed. A failed autosave does not prevent the user from submitting the registration form.  |
| :---- |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.1.1.2. Save/Resume**  {#6.1.1.2.-save/resume}

* The users will be able to save their progress at any stage  
* A link will be sent to the user’s email address  
* Using the link, the user will be able to continue the onboarding form  
* The link will stay live for 31 days  
* Email copy to be provided by the client

| Preconditions: The user is completing a Buyer/Seller registration/onboarding form. A valid email address is available (entered on the form). Triggers: The user selects “Save & Resume” on Step 1 or any section of Step 2\. Acceptance Criteria: Step 1 Save Behaviour Requires an email address. If the email address is invalid/missing, display an inline error message “In order to save this draft registration form, an email address is needed. Please provide a valid email address in step 1.” The user must return to step 1 and enter an email address in order to Save & Resume. Clicking Save & Resume Later persists all current inputs on the active step to a draft (even if incomplete or containing validation errors). Save is idempotent per draft; repeated clicks update the same draft (not create new ones). On success (persisted): Show inline confirmation: “Progress saved. We’ve emailed you a link to continue later.” Generate a new resume token and URL; invalidate any previously generated token for this draft immediately. On failure (persistence error): No email is sent. Show blocking error. Step 1 Email sending Send exactly one email per successful explicit save action. If the mail service is unavailable: Draft still saves. Show non-blocking warning. Email template: Subject: WasteTrade \- Continue Your Registration Body: Hi \<first\_name\>,You’ve saved your registration progress on WasteTrade. Use the link below to continue where you left off.\<resume\_url\>What happens next\- Your link stays active for 31 days.\- You can use it multiple times until you submit your registration.\- If you save again later, we’ll send you a new link, and the old one will stop working.Best regards,The WasteTrade Team Link/token rules Each save issues one new token. Only the most recent token is valid. Generating a new token on a later save invalidates the prior token immediately. The token is multi-use until registration form submission or 31-day expiry. Token grants access only to the associated draft; no cross-account access. Resume behaviour (via email link) Opening the resume URL routes the user to the first page of the registration form, pre-filled with the saved values. The user lands on the first registration page; fields removed since saving are ignored; new required fields appear empty and will be validated on submit. Data purge: If no submitted registration exists by the 31-day mark, the draft and its data are not stored (purged). The user must redo registration. Step 2  On click, the system persists the current draft of Step 2 (all entered values). The user will see the “Complete Account” banner (Phase 1 \- 7.6.0.26 (Previously 6.7.1.4) until onboarding is fully completed. Send the Complete Your Account email (Phase 1 \- 6.1.1.5) to the user. After a successful save, redirect the user to the Marketplace. Show a transient success toast on save: “Progress saved.” Postconditions: If the user selects Save from Step 1:  Draft is stored/updated with current inputs. Exactly one active resume link exists per draft; previous links are invalidated on re-save. Users can resume registration with pre-filled data until submission or 31-day expiry. Upon expiry (and no submission), the draft is purged; resume is no longer possible. If the user selects Save from Step 2: User follow the existing “Complete Account” flow.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Failure to Save | “We couldn’t save your progress. Please try again.” |
| Email send failure | “Saved, but we couldn’t send the email. Please try again.” |
| Invalid email link | “This link is invalid. Please restart the registration process.” |
| Expired email link | “This link has expired. Please restart the registration process.” |

| Design Name | Link |
| :---- | :---- |
| Save & Resume | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21675-38667\&t=agaM0kh6K9gZbJyL-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21675-38667&t=agaM0kh6K9gZbJyL-4)  ![][image1] |
| Error | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-69418\&t=agaM0kh6K9gZbJyL-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-69418&t=agaM0kh6K9gZbJyL-4)  ![][image2] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **~~6.1.1.3. VAT Number Lookup~~** {#6.1.1.3.-vat-number-lookup}

* ~~The system will utilise the VAT sense API ([7.1.0.2](#7.1.0.2-vat-sense)) to look up company details based on the VAT number entered during registration or when editing company information in account settings.~~  
* ~~When the user selects “EU” or “UK” for Country of VAT registration and enters the company VAT number, the system will pull company details via the VAT Sense API.~~  
  * ~~If the user selects “Other” Country of VAT registration, no lookup is performed.~~  
* ~~The following company details will be pulled and pre-populated into relevant fields:~~  
  * ~~Company Registration Number~~  
  * ~~Company name~~  
  * ~~Street Address~~  
  * ~~Postcode~~  
  * ~~City~~  
  * ~~County/State/Region~~  
  * ~~Country~~  
* ~~Fields will remain editable.~~

#### **~~6.1.1.4. Book 1:1 Call~~** {#6.1.1.4.-book-1:1-call}

* ~~The user will be presented with a support message on the following pages:~~  
  * ~~Registration~~   
  * ~~Complete account~~  
  * ~~Upload Documents~~  
  * ~~Complete account~~  
* ~~The message will display:~~  
  * ~~“Need some help? Visit our resources page for guidance, or book a 1:1 call with one of our team.”~~  
    * ~~There will be a link to open the resources page ([6.3.1.1](#6.3.1.1.-resources-page)) in a new tab.~~  
    * ~~The user can select the book 1:1 call link to open the Wastetrade Calendly in a new web page.~~  
      * ~~Calendly invites will be managed offline by the client.~~

#### 

#### **6.1.1.5. Onboarding \- Company Documents**

* This is an update to existing functionality within the user onboarding process; updates are highlighted in yellow.  
* Updates apply to both Buyer/Seller onboarding.  
* There will be a guidance message:  
  * “Ensure uploaded documents are up-to-date versions and licence numbers are correct, errors may delay verification (\*Required Field).”  
* The following information will be captured:  
  * Company Type: Auto-populate this field from data provided during the registration form process, ensuring that users see a consistent reflection of their earlier inputs without the ability to modify them here.  
  * Provide options for 'Which permits/licences do you have?' including Environmental Permit, Waste Exemption, Other, and an option to 'Upload later'.  
    * The user can upload multiple documents (e.g. upload an Environmental Permit, then a Waste Exemption Certificate, etc.)  
    * When the user selects 'Upload later,' notify them with: 'You can start buying and selling material now, but please note that all transactions will be pending until you upload your company documentation”, and disable the remaining 3 fields.  
    * If any one of the three Environmental Permit, Waste Exemption, or Other options is selected, disable the 'Upload later' option.  
    * There will be an information tooltip next to the question.  
      * Users can hover over the tooltip to display guidance text:  
        * “To trade on WasteTrade, you need to upload key compliance documents based on your operations:  
          **Environmental Permit**: Confirms your waste activities meet environmental standards.  
          **Waste Exemption:** For low-risk activities like small-scale recycling or reusing materials.  
          **Waste Carriers License**: Required if you transport waste materials.  
          **Outside the EU?** Provide equivalent documentation from your local authority to confirm compliance with your country’s regulations.   
          Upload these documents now to get started and ensure smooth trading on WasteTrade\!”  
* Document Upload Functionality:  
  * Users must have the option to upload documents directly from their device or via drag-and-drop functionality.  
  * Ensure that the upload functionality is intuitive and confirms the successful upload of documents.  
  * Users must be able to upload a file for each document type selected.  
    * i.e. users can select Waste Exemption and upload a file, then select Environmental Permit to upload an additional file.  
  * If 'Other' is selected under permit/licence type, allow users to specify details and provide a corresponding upload option.  
  * The user can upload only the following file types:  
    * Image formats (.jpeg, .jpg, tiff, .png)  
    * PDF document  
    * Word/PPT/Spreadsheets (including CSV) are not acceptable  
  * Max file size 25 MB  
* Expiry Date Requirement:  
  * For all document uploads where an expiry date is applicable (e.g., Environmental Permit, Waste Carrier Licence), provide a field for users to input the expiry date.\[No validation for this phase about the expiry date\]  
  * Ensure that this field accepts dates in a consistent format (DD/MM/YYYY) and includes date-picker functionality to reduce user error.

| Scope & Preconditions: This is an update to an existing US developed in phase 1 (6.1.2.2 Company documents section) Modifications or updates are highlighted in yellow. The Company Documents page within the registration form is accessible. Triggers: The user navigates to the Company Documents page during registration. Acceptance Criteria: Information Message Display: Display an information message prominently at the beginning of the Company Documents section: "Ensure uploaded documents are up-to-date versions and licence numbers are correct, errors may delay verification (\*Required Field)." This message must be clear and easily readable to ensure users understand the importance of accuracy in their submissions. Form Field Auto-Population and Selections: Company Type: Auto-populate this field from data provided during the registration form process, ensuring that users see a consistent reflection of their earlier inputs without the ability to modify it here. Provide options for 'Which permits/licences do you have?' including Environmental Permit, Waste Exemption, Other, and an option to 'Upload later'. The user can upload multiple documents (e.g. upload an Environmental Permit, then a Waste Exemption Certificate, etc) When the user selects 'Upload later,' notify them with: 'You can start buying and selling material now, but please note that all transactions will be pending until you upload your company documentation” and disable remaining 3 fields If any one of the three Environmental permits, Waste Exemption, Other options is selected, disable the 'Upload later' option. There will be an information tooltip next to the question. Users can hover over the tooltip to display guidance text: “To trade on WasteTrade, you need to upload key compliance documents based on your operations:Environmental Permit: Confirms your waste activities meet environmental standards.Waste Exemption: For low-risk activities like small-scale recycling or reusing materials.Waste Carriers License: Required if you transport waste materials.Outside the EU? Provide equivalent documentation from your local authority to confirm compliance with your country’s regulations. Upload these documents now to get started and ensure smooth trading on WasteTrade\!” Document Upload Functionality: There will be a guidance message: “Ensure uploaded documents are up-to-date versions and licence numbers are correct, errors may delay verification (\*Required Field).” Users must have the option to upload documents directly from their device or via drag-and-drop functionality. Ensure that the upload functionality is intuitive and confirms the successful upload of documents. Users must be able to upload a file for each document type selected. i.e. users can select Waste Exemption and upload a file, then select Environmental Permit to upload an additional file. If 'Other' is selected under permit/licence type, allow users to specify details and provide a corresponding upload option. The user can upload only the following file types: Image formats (.jpeg, .jpg, tiff, .png) PDF document Word/PPT/Spreadsheets (including csv) are not acceptable Max file size 25 MB Expiry Date Requirement: For all document uploads where an expiry date is applicable (e.g., Environmental Permit, Waste Carrier Licence), provide a field for users to input the expiry date.\[No validation for this phase about the expiry date\] Ensure that this field accepts dates in a consistent format (DD/MM/YYYY) and includes date-picker functionality to reduce user error. Waste Carrier Licence Confirmation: Include a query: "Do you have a Waste Carrier Licence?" with options 'Yes', 'No', and 'Not Applicable'. If 'Yes' is selected, prompt the user to upload the Waste Carrier Licence and provide the expiry date as mandatory fields. If 'Not Applicable' or 'No' is selected, ensure these options are logged and require no further action related to the Waste Carrier Licence. Box Clearing Agent Query: Ask "Box clearing agent?" with options 'Yes' and 'No'. Ensure this selection is captured accurately and reflects in the user's profile for compliance and operational purposes. Validation and Error Handling: Validate that all mandatory fields are filled before allowing the form submission. Mandatory fields include any document marked as required and their associated expiry dates. Provide clear error messages for incomplete uploads, incorrect date formats, or missed mandatory fields. Example error message: "Please complete all required fields. Check that all documents are uploaded and expiry dates are correctly entered." Postconditions: The user can complete the Company Documents stage of registration, viewing updated text and able to upload multiple documents.  |
| :---- |

| Field | Description |
| :---- | :---- |
| Company Type | Input Type: Auto-populated; Constraints: Predefined from registration; Mandatory |
| Permit/Licence Type | Input Type: Checkbox; Options: Environmental Permit, Waste Exemption, Other, Upload later; Mandatory |
| Upload (Document) | Input Type: File upload; Constraints: Valid file types specified; Optional, Mandatory if 'Other' selected Max file size 25 MB, Max files set to 6; Mandatory |
| Provide Expiry Date | Per document. Input Type: Date; Constraints: Must be future date; Format: DD/MM/YYYY; Optional if document uploaded |
| Waste Carrier Licence | Input Type: Conditional; Displayed if 'Yes' selected; Mandatory if 'Yes' |
| Box Clearing Agent | Input Type: Radio button; Options: Yes, No; Mandatory |
| Upload from Device | Input Type: File upload; Constraints: Supported file formats; Mandatory if applicable document types selected |
| Drag and Drop to Upload | Input Type: File upload; Constraints: Supported file formats; Mandatory if applicable document types selected |
| Back button | Action: Back to Company Information section; Constraints: No |
| Next and Save Button | Action: Navigate to Site location section; Constraints: All mandatory fields must be filled and valid |

| Use Case | Error Message |
| :---- | :---- |
| Mandatory field not filled | "All required fields must be completed. Please check your entries and try again." |
| Invalid document file type | "Invalid file type uploaded. Please upload a document in one of the supported formats." |
| Document upload failed | "Failed to upload a document. Please try again or contact support if the problem persists." |
| Expiry date not provided or in the past | "Please provide a valid future expiry date for the document." |
| No document selected when required | "Please upload the required document to proceed." |
| Missed Waste Carrier Licence if the “Yes” radio box is ticked within the “Do you have a waste carrier licence?” section | “Please upload your required Permit document to proceed” |
| Missed Environmental permit | “Please upload your required Environmental document to proceed” |
| Missed Waste Exemption field | “Please upload documentation for Waste Exemption” |
| Other Document Description field missed for Other licences | “Please provide additional information in “Other” text field |
| Error in auto-population of fields | "There was an error retrieving your information. Please refresh the page or try again later." |
| If user loses connection and “Save and resume later” option is clicked | Generic error message “Oops, please try again later” |
| Network or loading error during form submission | "There was a problem submitting your form due to a network error. Please try submitting again shortly." |

| Design Name | Link |
| :---- | :---- |
| Text updates | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-69214\&t=EjMF0eKHbsl4Ys6K-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-69214&t=EjMF0eKHbsl4Ys6K-4)  ![][image3] |
| Upload multiple docs | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21681-54502\&t=EjMF0eKHbsl4Ys6K-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21681-54502&t=EjMF0eKHbsl4Ys6K-4) ![][image4] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **~~6.1.1.6. Autocomplete Registration Form~~**  {#6.1.1.6.-autocomplete-registration-form}

* ~~As a new user, I want the registration form to support device/browser autofill so I can complete sign-up faster and with fewer typing errors.~~  
  * ~~The registration page lets users autofill the following fields using details saved on their device/browser:~~  
    * ~~First name~~  
    * ~~Last name~~  
    * ~~Telephone~~  
    * ~~Email~~  
    * ~~Street Address~~  
    * ~~Postcode~~  
    * ~~City~~  
    * ~~County/State/Region~~  
    * ~~Country~~  
  * ~~When a user taps/clicks a field, their device can offer saved info to fill it.~~  
    * ~~The user can accept or ignore these suggestions.~~  
    * ~~Autofill is optional \- users can edit any prefilled value.~~  
  * ~~Standard field validations still apply after autofill.~~  
    * ~~Validations and displayed errors still apply to autofilled fields.~~

### 

### 6.1.2. My Sales Listings {#6.1.2.-my-sales-listings}

#### **6.1.2.1. Renew Listing** {#6.1.2.1.-renew-listing}

* The user will be able to renew a listing that they have created through the listing page.  
* When the listing is in the expiry period, there will be a message: “This listing is about to expire, do you want to renew it?”  
* The user will be able to click on the message to renew the listing  
* The system will ask the user to confirm if they want to renew the listing  
  * Yes \- set the new renewal period  
  * 2 weeks (default)  
  * ~~Custom (select days, weeks, or pick a date from a calendar)~~

| Scope & Preconditions: Applies to sales listings created by the signed-in user (listing owner). Listing State must be Approved (visible to buyers). Listing is not Sold and not Rejected. For Ongoing listings renewals occur automatically per the configured renewal period; the manual Renew control is hidden. Triggers: The owner opens the Listing details page when the listing is approaching expiry/expired. Acceptance Criteria: Expiry banner & entry point When the listing is within the expiry period, display a banner: “This listing is about to expire, do you want to renew it?” “Renew” opens the Renew Listing modal. If the listing is already expired, show: “This listing has expired. Renew to make it available again.”  “Renew” opens the Renew Listing modal. Renew modal Show current End date and Days remaining, or “Expired” Renewal options (radio): 2 weeks (default) Extends the listing by 14 calendar days from the current end date if still active, or from today if expired. 90 days Extends the listing by 90 calendar days from the current end date if still active, or from today if expired. Calculated New end date is previewed live before confirmation. Confirmation On selecting “Confirm” Update the listing End date to the computed New end date. If the listing had Expired, set Status \= Available (or Available from \<date\> if start date is in the future), keeping State \= Approved. Persist an audit entry “Listing renewed” with prior and new dates (Phase 1 – 6.6.9.1). Show success toast: “Listing renewed. New end date: \<dd/mm/yyyy\>.” Cancel: close with no changes. Validation & business rules Ownership: Only the listing owner can renew; otherwise hide renewal messages.  Sold listings cannot be renewed: show error:“Sold listings cannot be renewed.” Rejected listings cannot be renewed, show error: “This listing is not eligible for renewal.” Ongoing listings: manual Renew is hidden; renewal occurs per ongoing configuration. Checking available loads: (note: checking logic) If available loads \< loads in ongoing listing: Change the status from available to Sold for the ongoing listing.  Ongoing listings with Sold status are hidden in Buyer page. Postconditions: Listing shows the updated End date and refreshed Status. Any expiry banners are removed if the new end date is outside the expiry window.  |
| :---- |

| Field  | Data Dictionary |
| :---- | :---- |
| Renewal period | Radio buttons. Options: 2 weeks, 90 days. Mandatory |

| Use Case | Error Message |
| :---- | :---- |
| Save failure |  “We couldn’t renew this listing right now. Please try again. If the problem persists, contact support.” |

| Design Name | Link |
| :---- | :---- |
| Renew listing  | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-82134\&t=Cl8KNyhNAyvchX8x-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-82134&t=Cl8KNyhNAyvchX8x-4) ![][image5] ![][image6] |

| Client Approved | yes |
| :---- | :---- |

#### 

#### **~~6.1.2.2. Replicate Listing~~** {#6.1.2.2.-replicate-listing}

* ~~The user will be able to create new sales listings by replicating one of their existing sales listings.~~  
* ~~There will be a duplicate button within the listing page~~   
  * ~~Only for the listing owner.~~  
  * ~~Clicking on the button will lead the user to a prepopulated new listing form.~~  
* ~~The form will have the following sections, which will be editable~~  
  * ~~Warehouse~~  
    * ~~Select location dropdown~~  
    * ~~Add new location~~  
  * ~~Upload media~~  
    * ~~There will be instructions guiding the user on the type of images they should provide~~  
    * ~~Select “featured image” (i.e. cover image)~~  
  * ~~Do you have material specification data?~~  
    * ~~Upload from the device \- if yes~~  
  * ~~Material~~   
  * ~~Quantity~~   
  * ~~Price~~  
  * ~~Material Availability: Include a date picker for selecting the “Start date” of material availability.~~  
    * ~~Past dates (Yesterday or before) will be disabled.~~  
  * ~~Additional information~~  
    * ~~Free text box~~  
    * ~~This free text should not allow telephone numbers, email addresses or URLs~~  
* ~~There will be a “Submit” button~~  
  * ~~On submitting, the form will be sent to the Admin for approval~~   
  * ~~A listing will stay live until~~   
    * ~~The fulfilment process begins (i.e. a Buyer’s bid is accepted and the haulage bidding has begun for the sales listing)~~  
    * ~~The listing is removed by the creator or the WasteTrade Admin~~  
    * ~~The default listing period comes to an end~~

#### **6.1.2.3. Create a Sales Listing** {#6.1.2.3.-create-a-sales-listing}

* This is an update to existing functionality within the trading platform; updates are highlighted in yellow.  
* Form Sections and Inputs:  
  * Warehouse: Include a dropdown to select a location and an option to add a new location.  
    * The user can select a location from any of “My Sites”, including the headquarters and additional sites.  
    * The user can open the new location modal and enter new location details by:  
      * Selecting “Other” from the dropdown  
      * Selecting the “Add new location” button displayed beneath the Warehouse Location dropdown field.  
    * Upon submitting the new location details within the modal, the dropdown should automatically be populated and selected with the new location details.  
      * The new location should also be saved within My Sites.  
  * Upload Media: Provide functionality to upload images, with guidance on the type of images required and the ability to select a featured image. All images should be automatically watermarked upon upload.  
    * Featured image upload  
      * Accepted file types: jpg, jpeg, png, gif, Max. fFilesize: 50 MB, Max. Files 1\.  
      * This is the main profile image for the listing  
    * Gallery images upload   
      * Accepted file types: jpg, png, jpeg, pdf, doc, xls, Max. File size: 5 MB, Max. Files 6\.  
      * Users can select multiple images using Ctrl+click or Shift+click or even multiselect with the mouse or by pressing and holding on a mobile/tablet device.  
  * Material Specification Data: Include an option to upload specification data if available.  
    * Shown beneath the image upload fields.  
  * Material Details: 7 Dropdowns for entering details regarding the material  
    * Defined in the product database.  
  * Metric: The user can select units of Mt, Lbs, or Kg.   
    * If Lbs or Kg are selected, this will convert to Mt in the Total Weight field.  
  * Material Weight:  
    * The user can enter the material weight using the selected metric.  
    * If Lbs or Kg are selected, this will convert to Mt in the Material Weight field.  
  * Total Weight (Mt)  
    * Read-only  
    * Displays the total available weight in Mt.  
    * Must be 3 or greater.  
  * Number of Loads  
    * Must be 1 or greater  
  * Average Weight per Load (Mt)  
    * Read-only.  
    * Automatically calculated by the system.  
    * Displays guidance text:  
      * “This is the total weight divided by the number of loads. e.g. 30Mt / 2 loads \= 15Mt average weight per load.”  
  * Currency: A dropdown to select the currency for the transaction.  
    * Price per metric tonne  
  * Material Availability: Include a date picker for selecting the “Start date” of material availability.  
    * Past dates (Yesterday or before) will be disabled.  
  * Incoterms: Dropdown  
  * Ongoing Listing:  Yes/No radio buttons.   
    * Selecting “Yes” allows the user to set the Renewal Period  
      * Dropdown menu containing renewal period options.  
    * Selecting “No” allows the user to set Listing Duration  
      * Default duration of ~~30~~ 90 days~~, or set a custom duration using days, weeks, or a specific end date selected via a calendar.~~  
      * ~~Past dates (Today or before) will be disabled.~~  
  * Additional Information: A free text box for any extra details or notes related to the listing.  
    * This free text should not allow telephone numbers, email addresses or URLs.

| Scope & Preconditions: This is an update to an existing US developed in phase 1 (6.4.3.2 Create a listing (sell material)) Modifications or updates are highlighted in yellow. Creating a listing page is functional. Triggers: The user selects to create a sales listing, i.e. material for sale. Acceptance Criteria: Form Sections and Inputs: Warehouse: Include a dropdown to select a location and an option to add a new location. Warehouse: Include a dropdown to select a location and an option to add a new location. The user can select a location from any of “My Sites”, including the headquarters and additional sites. The user can open the new location modal and enter new location details by: Selecting “Add new location” from the dropdown. Selecting the “Add new location” button displayed beneath the Warehouse Location dropdown field. A scrollable new location modal will open, containing all the functionality for adding a new location as defined in phase 1 (7.6.0.3. (Previously 6.4.8.15) Add a new location). The user can close the new location modal at any time to return to the listing form. Upon submitting the new location details within the modal: The dropdown should automatically be populated and selected with the new location details. The new location should also be saved within My Sites. Container Types Read-only  Displays the accepted container types for the selected location. Upload Media: Provide functionality to upload images, with guidance on the type of images required and the ability to select a featured image.  Guidance message: Currently: “Attention\! Please ensure to upload high-quality images for optimal results in finding your seller. Clear, detailed images of your wanted material form will greatly improve your chances of connecting with the right supplier on our waste commodities platform.” Updated to: Attention\! Please ensure to upload high-quality images for optimal results in finding your seller. Clear, detailed images of your material will greatly improve your chances of connecting with the right supplier on our waste commodities platform. All images should be automatically watermarked upon upload. Users can select multiple images using Ctrl+click or Shift+click or even multiselect with the mouse or by pressing and holding on a mobile/tablet device. Material Specification Data: Include an option to upload specification data if available. Shown beneath image upload fields. “Do you have Material Specification Data?” checkbox If Yes, show upload modal for material specification. Material Details: 7 Dropdowns for entering details regarding the material Material type Always shows options for Plastic, EFW, Fibre, Rubber, Metal Item  Conditionally displays “Items” options based on the Material type. Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) Form If “Material type” \= “Plastic”, options for “Form” are presented (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” is not plastic, the “Form” dropdown will only display N/A as a default selection. Grading	 If “Material type” \= “Plastic” or “Fibre”, the options for “Grading” are specific to the Material type selected. Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) If “Material type” \= “EFW” or “Metal” or “Rubber,” the “Grading” dropdown will only display N/A as a default selection. Colour Will always display the same options Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) Finishing Will always display the same options  Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) Packing Will always display the same options  Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) Material must stay in country of origin Yes or No radio button  How should the waste be stored? Dropdown Quantity Metric: The user can select units of Mt, Lbs, or Kg.  If Lbs or Kg are selected, this will convert to Mt in the Total Weight field. Material Weight: The user can select units of Mt, Lbs, or Kg.  If Lbs or Kg are selected, this will convert to Mt in the Material Weight field. Total Weight (Mt) Read-only Displays the total available weight in Mt. Must be 3 or greater. Displays guidance text: “The total weight must be 3 metric tonnes or more.” Number of Loads Must be 1 or greater Average Weight per Load (Mt) Read-only. Automatically calculated by the system. Displays guidance text: “This is the total weight divided by the number of loads. e.g. 30Mt / 2 loads \= 15Mt average weight per load.” Price Currency: A dropdown to select the currency for the transaction. Price per metric tonne Material Availability: Include a date picker for selecting the start date of material availability. Past dates (Yesterday or before) will be disabled. Ongoing Listing:  Yes/No radio buttons.  Selecting “Yes” allows the user to set the Renewal Period Dropdown menu containing renewal period options. Selecting “No” allows the user to see the Listing Duration field. Read-only; 90 days. No custom date entry.  Incoterms: Dropdown. Additional Information: A free text box for any extra details or notes related to the listing. This free text should not allow telephone numbers, email addresses or URLs. Validation and Error Handling: Validate all input fields for correct formats and ensure that all mandatory fields are filled before allowing the form to be submitted. Provide clear, contextual error messages for any issues encountered during form completion or submission. Submission and Review Process: Include a "Submit" button that sends the completed form to the Admin for approval. Clearly communicate to the user that the listing will undergo an approval process and will only go live once approved. Listing Visibility and Duration: Inform the user that once approved, the listing will remain live until: The fulfilment process is initiated (a Buyer is found and the terms are agreed upon). The listing is removed by either the creator or the WasteTrade Admin. The set listing duration expires. “Ongoing” listings will renew at the period defined when creating the listing. Postconditions: The Seller is able to create a material listing for sale with updated fields.  |
| :---- |

| Field  | Data Dictionary |
| :---- | :---- |
| Warehouse Location | Dropdown: Options prefilled from My Locations list (including new locations added when selecting “Other”. Mandatory |
| ~~Other Warehouse Location~~ | ~~Conditional display: only shown when the user selects “Other” from the Warehouse Location dropdown. Input Type: Text; Mandatory; Max Length: 100 characters~~ |
| Container Types | Read-only. Displays the accepted container types for the selected location. Shown as a comma separated list. |
| Photo-taking guide hyperlink | URL Hyperlink, provided by client, navigate to the website for the guide  |
| Featured image | Input Type: File Upload; Constraints: Image files \- jpeg, png; Max file size 25 MB, Max files set to 1; Mandatory |
| Upload gallery images | Input Type: File Upload; Constraints: Image files \- jpeg, png; Max file size 25 MB, Max files set to 10; Optional |
| Do you have Material Specification Data? | Yes/No checkbox, Mandatory. |
| Material Specification upload | Only shown if “Do you have Material Specification Data?” \= Yes. File upload: File types: jpg, png, jpeg, pdf, doc, xls, docx, Max. File size: 25 MB. Max files: 6\. Mandatory. |
| Material type  | Dropdown: Plastic/EFW/Fibre/Rubber/Metal, Mandatory  |
| Item | Dropdown: Options depend on the Type of Material selected,  Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0), Mandatory |
| Form | Dropdown: If “Material type” \= “Plastic” options for “Form” are presented (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” is not plastic, the “Form” dropdown will display N/A as a default selection. Mandatory |
| Grading | Dropdown: If “Material type” \= “Plastic” or “Fibre” the options for “Grading” are specific to the Material type selected. (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” \= “EFW” or “Metal” or “Rubber” the “Grading” dropdown will only display N/A as a default selection. Mandatory |
| Colour | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| Finishing | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| Packing | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| Material must remain in country of Origin | Yes/No Radio buttons, Mandatory. |
| How should the waste be stored? | Dropdown : Indoor/Outdoor/Both/Any, Mandatory |
| Material Weight Unit | Radio buttons: Mt, Lbs, Kg. Mandatory. If Lbs or Kg are selected, this will convert to Mt in the Total Weight field (1 MT \= 1000 Kgs \= 2204.62263 Lbs). |
| Material Weight  | Numeric input, Mandatory, Min \>1. Shown in Units selected above. |
| Total Weight (Mt) | Read-only. Automatically calculated by the system. Min \>3.  |
| Number of Loads | Numeric input, Mandatory, Min \>1 . |
| Average Weight per load (Mt) | Read-only. Automatically calculated by the system: avg \= total weight mt / number of loads. Up to 3 decimal places. |
| Currency | Dropdown: GBP, EUR, USD. Mandatory. |
| Material Availability | Datetime, Min \= Today , Mandatory. Past dates (Yesterday or before) will be disabled. |
| Ongoing Listing | Input Type: Radio Button: Yes/No, Mandatory. |
| Listing Renewal Period | Appears if the user selects “Yes” to Ongoing listing. Input Type: Dropdown (Weekly, Fortnightly, Monthly), Mandatory. |
| Listing Duration | Appears if the user selects “No” to Ongoing listing. Read-only; 90 days. No custom date entry.  |
| Incoterms | Dropdown. Options: EXW, FAS, FOB, CFR, CIF, DAP, DDP. Optional. |
| Additional Information | Free text field. Alphanumeric input. Does not allow telephone numbers, email addresses or urls. Max characters 32000\. Optional. |

| Use case | Error message |
| :---- | :---- |
| Form submission with incomplete data | "All fields must be completed. Please review your entries and try again." |
| Incorrect data format | "Some information is formatted incorrectly. Please correct the highlighted fields." |
| Form submission failure | "Failed to submit your listing. Please try again. If the problem persists, contact support." |
| Exceeding character limit for Additional Information | “Maximum character count of 32000 exceeded.” |
| Network or server issue during submission | "There appears to be a problem with the server. Please try submitting again in a few minutes." |
| Security or validation error | "Your submission contains invalid characters or data that couldn't be processed. Please check your entries." |

| Design Name | Link |
| :---- | :---- |
| Create a listing | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-75946\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-75946&t=TzDhDk2ScPubsQGI-4)   ![][image7]![][image8]![][image9] |
| New location  | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-77797\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-77797&t=TzDhDk2ScPubsQGI-4)  ![][image10] |

| Client Approved | Yes |
| :---- | :---- |

#### 


  

#### **6.1.2.4. Edit a Sales Listing**

* Reuses logic from creating a listing ([6.1.2.3](#6.1.2.3.-create-a-sales-listing)).  
* As the listing owner, I want to edit an existing sales listing using the same form as Create a Sales Listing, with all fields pre-populated from the current listing.  
* There will be an “Edit Listing” button visible to the listing owner.  
  * Only the listing owner can edit.  
  * Only when the listing has no bids/offers.  
  * If one or more bids exist, disable the button; display a tooltip message:  
    * “This listing cannot be edited because it has received an offer. If you need to edit this listing, please contact support@wastetrade.com.”  
* Clicking “Edit listing” opens the Create Sales Listing form with all fields prefilled from the current listing; all existing validations and constraints apply.  
* Submitting saves the updates to the listing and returns the listing to awaiting approval by admin.

| Scope & Preconditions: This is new functionality to edit an existing material listing. But reuses all validations, conditional fields, calculations, and file-handling from Create a Sales Listing ([6.1.2.3](#6.1.2.3.-create-a-sales-listing)). The create a listing page is functional. The Seller must be the owner of the listing. Triggers: The user selects to edit a sales listing. Acceptance Criteria: Edit Ability The ability to edit a listing is dependent on listing ownership and status: Owner-only: The Edit button is shown only for the account that created the listing. If a non-owner navigates directly to an edit URL, return an error with “You don’t have permission to edit this listing.” Active-only:  The edit button is enabled for More information required/Available/Available from/Rejected The edit button is disabled for Pending listings and shows a tooltip on hover/focus: “This listing cannot be edited because it is under Admin review. If you need to edit this listing, please contact support@wastetrade.com.” The edit button is disabled for Sold/Removed listings and shows a tooltip on hover/focus: “This listing cannot be edited because it is no longer active. If you need to edit this listing, please contact support@wastetrade.com.” No bids/offers: If bid\_count \= 0, the button is enabled. If bid\_count \>= 1, the button is shown but disabled and shows a tooltip on hover/focus: “This listing cannot be edited because it has received an offer. If you need to edit this listing, please contact support@wastetrade.com Clicking Edit Listing opens Create Sales Listing form ([6.1.2.3](#6.1.2.3.-create-a-sales-listing)) with all fields pre-filled from the current listing record: Warehouse: Include a dropdown to select a location and an option to add a new location. The guidance text "Please select your Warehouse Location before creating a listing.” will not be shown on the edit listing page. Warehouse: Include a dropdown to select a location and an option to add a new location. The user can select a location from any of “My Sites”, including the headquarters and additional sites. The user can open the new location modal and enter new location details by: Selecting “Other” from the dropdown Selecting the “Add new location” button displayed beneath the Warehouse Location dropdown field. A scrollable new location modal will open containing all the functionality for adding a new location as defined in phase 1 (7.6.0.3. (Previously 6.4.8.15) Add a new location). The user can close the new location modal at any time to return to the listing form. Upon submitting the new location details within the modal, the dropdown should automatically be populated and selected with the new location details. The new location should also be saved within My Sites. Container Types Read-only.  Displays the accepted container types for the selected location.  Upload Media: Provide functionality to upload images, with guidance on the type of images required and the ability to select a featured image.  All images should be automatically watermarked upon upload. Users can select multiple images using Ctrl+click or Shift+click or even multiselect with the mouse or by pressing and holding on a mobile/tablet device. Material Specification Data: Include an option to upload specification data if available. Shown beneath the image upload fields. Material Details: 7 Dropdowns for entering details regarding the material Material type Always shows options for Plastic, EFW, Fibre, Rubber, Metal Item  Conditionally displays “Items” options based on Material type. Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) Form If “Material type” \= “Plastic” options for “Form” are presented (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” is not plastic, the “Form” dropdown will only display N/A as a default selection. Grading	 If “Material type” \= “Plastic” or “Fibre” the options for “Grading” are specific to the Material type selected. Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) If “Material type” \= “EFW” or “Metal” or “Rubber” the “Grading” dropdown will only display N/A as a default selection. Colour Will always display the same options Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) Finishing Will always display the same options  Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) Packing Will always display the same options  Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0) Material must stay in country of origin Yes or No radio button  How is the waste stored? Dropdown Quantity Metric: The user can select units of Mt, Lbs, or Kg.  If Lbs or Kg are selected, this will convert to Mt in the Total Weight field. Material Weight: The user can select units of Mt, Lbs, or Kg.  If Lbs or Kg are selected, this will convert to Mt in the Material Weight field. Total Weight (Mt) Read-only Displays the total available weight in Mt. Must be 3 or greater. Displays guidance text: “The total weight must be 3 metric tonnes or more.” Number of Loads Must be 1 or greater Average Weight per Load (Mt) Read-only. Automatically calculated by the system. Displays guidance text: “This is the total weight divided by the number of loads. e.g. 30Mt / 2 loads \= 15Mt average weight per load.” Price Currency: A dropdown to select the currency for the transaction. Price per metric tonne Material Availability: Include a date picker for selecting the start date of material availability. Past dates (Yesterday or before) will be disabled. Ongoing Listing:  Yes/No radio buttons.  Selecting “Yes” allows the user to set the Renewal Period Dropdown menu containing renewal period options. Selecting “No” allows the user to see the Listing Duration field. Read-only; 90 days. No custom date entry.  Incoterms: Dropdown. Additional Information: A free text box for any extra details or notes related to the listing. This free text should not allow telephone numbers, email addresses or URLs. Validation and Error Handling: Validate all input fields for correct formats and ensure that all mandatory fields are filled before allowing the form to be submitted. Provide clear, contextual error messages for any issues encountered during form completion or submission. Submission and Review Process: Include a "Submit" button that sends the completed form to the Admin for approval. Submit applies edits to the draft of the listing and sets status to “Pending”, replacing the currently live version. The previous listing should be hidden to Buyers until re-approval completes. Listing Visibility and Duration: Inform the user that once approved, the listing will remain live until: The fulfilment process is initiated (a Buyer is found and the terms are agreed upon). The listing is removed by either the creator or the WasteTrade Admin. The set listing duration expires. “Ongoing” listings will renew at the period defined when creating the listing. Postconditions: The Seller is able to edit a material listing for sale.  |
| :---- |

| Field  | Data Dictionary |
| :---- | :---- |
| Warehouse Location | Dropdown: Options prefilled from My Locations list (including new locations added when selecting “Other”. Mandatory |
| Photo taking guide hyperlink | URL Hyperlink, to provided by client, navigate to the website for the guide  |
| Featured image | Input Type: File Upload; Constraints: Image files \- jpeg, png; Max file size 25 MB, Max files set to 1; Mandatory |
| Upload gallery images | Input Type: File Upload; Constraints: Image files \- jpeg, png; Max file size 25 MB, Max files set to 10; Optional |
| Do you have Material Specification Data? | Yes/No checkbox, Mandatory. |
| Material Specification upload | Only shown if “Do you have Material Specification Data?” \= Yes. File upload: File types: jpg, png, jpeg, pdf, doc, xls, docx, Max. File size: 25 MB. Max files: 6\. Mandatory. |
| Material type  | Dropdown: Plastic/EFW/Fibre/Rubber/Metal, Mandatory  |
| Item | Dropdown: Options depend on Type of Material selected,  Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0), Mandatory |
| Form | Dropdown: If “Material type” \= “Plastic” options for “Form” are presented (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” is not plastic, the “Form” dropdown will display N/A as a default selection. Mandatory |
| Grading | Dropdown: If “Material type” \= “Plastic” or “Fibre” the options for “Grading” are specific to the Material type selected. (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” \= “EFW” or “Metal” or “Rubber” the “Grading” dropdown will only display N/A as a default selection. Mandatory |
| Colour | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| Finishing | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| Packing | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| Material must remain in country of Origin | Yes/No checkbox, Mandatory. |
| How is the waste stored? | Dropdown : Indoor/Outdoor/Both/Any, Mandatory |
| Material Weight Unit | Radio buttons: Mt, Lbs, Kg. Mandatory. If Lbs or Kg are selected, this will convert to Mt in the Total Weight field (1 MT \= 1000 Kgs \= 2204.62263 Lbs). |
| Material Weight  | Numeric input, Mandatory, Min \>1. Shown in Units selected above. |
| Total Weight (Mt) | Read-only. Automatically calculated by the system. Min \>3.  |
| Number of Loads | Numeric input, Mandatory, Min \>1 . |
| Average Weight per load (Mt) | Read-only. Automatically calculated by the system: avg \= total weight mt / number of loads. Up to 3 decimal places. |
| Currency | Dropdown: GBP, EUR, USD. Mandatory. |
| Material Availability | Datetime, Min \= Today , Mandatory. Past dates (Yesterday or before) will be disabled. |
| Ongoing Listing | Input Type: Radio Button: Yes/No, Mandatory. |
| Listing Renewal Period | Appears if the user selects “Yes” to Ongoing listing. Input Type: Dropdown (Weekly, Fortnightly, Monthly), Mandatory. |
| Listing Duration | Appears if the user selects “No” to Ongoing listing. Read-only; 90 days. No custom date entry.  |
| Incoterms | Dropdown. Options: EXW, FAS, FOB, CFR, CIF, DAP, DDP. Optional. |
| Additional Information | Free text field. Does not allow telephone numbers, email addresses or urls. Max characters 32000\. Optional. |

| Use case | Error message |
| :---- | :---- |
| Form submission with incomplete data | "All fields must be completed. Please review your entries and try again." |
| Incorrect data format | "Some information is formatted incorrectly. Please correct the highlighted fields." |
| Form submission failure | "Failed to update your listing. Please try again. If the problem persists, contact support." |
| Exceeding character limit for Additional Information | “Maximum character count of 32000 exceeded” |
| Network or server issue during submission | "There appears to be a problem with the server. Please try submitting again in a few minutes." |
| Security or validation error | "Your submission contains invalid characters or data that couldn't be processed. Please check your entries." |

| Design Name | Link |
| :---- | :---- |
| Edit Listing location fields | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-84340\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-84340&t=TzDhDk2ScPubsQGI-4) ![][image11] |
| Quantity fields | ![][image12] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.1.2.5. Remove a Sales Listing**

* This is an update to existing functionality within the trading portal; updates are highlighted in yellow.  
* Location of Removal Options:  
  * Ensure users can initiate the removal of their sales listings directly from the “View All Sales Listings” page.  
    * My Sales page: each listing card shows a bin icon (Delete).  
  * Provide a clear and visible button on the listings page as well as a removal icon on each individual listing card.  
    * Listing page: show a red “Delete Listing” button.  
* Label & style  
  * Replace all instances of “Remove listing” with “Delete Listing”.  
  * Use the platform’s destructive (red) button style on the Listing page.  
* Availability logic  
  * If the listing has one or more Pending or Accepted offers, both the bin icon and the Delete Listing button are disabled (not clickable).  
  * Tooltip on hover over disabled button:  
    * “You can’t delete this listing because there is an existing offer on it.”  
* Confirmation Process:  
  * Upon selecting the remove option, the system must prompt the user with a confirmation dialogue to prevent accidental deletions.  
  * The confirmation message should clearly state the action about to be taken and ask for explicit user confirmation (e.g., “Are you sure you want to remove this listing? This action cannot be undone.”).  
* Permissions and restrictions will be unchanged.  
  * Only the creator of the listing can see and interact with the removal options.  
  * Removal options are disabled or hidden for listings that cannot be deleted due to platform rules or pending transactions.  
* Existing error messages will be unchanged.

| Scope & Preconditions: This is an update to an existing US developed in phase 1 (6.4.4.3 Remove a sales listing) Modifications or updates are highlighted in yellow. Triggers: The Seller is viewing their own listing (all listings or details page). The Seller selects to remove the listing. Acceptance Criteria: The ability to edit a listing is dependent on listing ownership: Shown only if the current user is the listing owner. If not the listing owner \= hide. Location of Removal Options: Ensure users can initiate the removal of their sales listings directly from the “View All Sales Listings” page. My Sales page: each listing card shows a bin icon (Delete). Provide a clear and visible button on the listings page as well as a removal icon on each individual listing card. Listing page: show a red “Delete Listing” button. Label & style Replace all instances of “Remove listing” with “Delete Listing”. Use the platform’s destructive (red) button style on the Listing page. Availability logic If the listing has any Accepted offers, both the bin icon and the Delete Listing button are disabled (not clickable). Tooltip on hover over disabled button: “You can’t delete this listing because there is an existing offer on it.” Confirmation Process: Upon selecting the remove option, the system must prompt the user with a confirmation dialogue to prevent accidental deletions. The modal will differ depending on if there are any pending offers: No pending offers: “Are you sure you want to remove this listing? This action cannot be undone.” “Cancel” closes modal. “Confirm” confirms deletion. Pending offers: “Are you sure you want to remove this listing? Currently you have pending offers, this action will reject these offers and cannot be undone.”1 “Cancel” closes modal. “Confirm” confirms deletion and marks all pending offers on the listing as Rejected.  Reason for rejection will be logged as “Listing removed”.  Postconditions: Upon success, the listing is removed from the marketplace.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Confirmation failure | "Failed to confirm action. Please try again." |
| Listing removal failure | "Unable to remove listing at this time. Please try again later." |
| Unauthorised removal attempt | "You do not have permission to remove this listing." |
| Active transaction block | "This listing is currently active in a transaction and cannot be removed." |
| General system error during removal | "A system error occurred during removal. Please contact support if this persists." |

| Design Name | Link |
| :---- | :---- |
| Listing page | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-82017\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-82017&t=TzDhDk2ScPubsQGI-4) ![][image13] |
| Listing product card | ![][image14] |
| No pending offers confirmation modal | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-84846\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-84846&t=TzDhDk2ScPubsQGI-4) ![][image15] |
| Pending offers confirmation modal | ![][image16] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.1.2.6. Mark a Sales Listing as “Sold”**

* This is an update to existing functionality within the trading platform; updates are highlighted in yellow.  
  * Location of Sold Options:  
    * Provide a clear and visible button on the listings page to “Mark as Sold”   
      * Only for listing owners  
      * Updates listing availability as “Sold”  
  * Confirmation Process:  
    * Upon selecting the “Mark as Sold” option, the system must prompt the user with a confirmation dialogue to prevent accidental actions.  
    * The confirmation message should clearly state the action about to be taken and ask for explicit user confirmation  
      * “Are you sure you want to mark this listing as sold? This action cannot be undone.”  
  * Sold Behaviour  
    * Triggered when:  
      * Manually marked as sold by the Seller  
      * Or if 0 loads are remaining  
    * Automatically remove the listing from the default trading platform visibility if all loads are sold or the chosen bid fulfils the total requirement.

| Preconditions: The Seller has a material listed for sale within the platform. Triggers: The Seller is viewing their own listing details page. Acceptance Criteria: Location & Visibility of Control The “Mark as Sold” button is clearly visible on the owner’s Listing Detail page. The ability to mark a listing as sold a listing is dependent on listing ownership and status:  Shown only if the current user is the listing owner. If not the listing owner \= hide. Disabled when not applicable (only shown for active listings): If Status \= Sold, Removed, Rejected, Expired \= disabled. Tooltip on disabled: “This listing cannot be marked as sold as it is no longer active. If you need help, contact support@wastetrade.com.” Clicking Mark as Sold opens a confirmation modal: “Are you sure you want to mark this listing as sold? This action cannot be undone.” Cancel closes with no changes. Confirm triggers the Sold transition Triggers into “Sold” The listing transitions to Sold via any of: Manual: Owner confirms Mark as Sold. Auto (accepted bid fulfils requirement): On bid approval that fulfils the total requirement, set loads to 0; listing transitions to Sold. (Phase 1 \- 6.4.6.2). Sold Effects When entering Sold (manual or auto): Status: set to Sold. For Ongoing listings this is also shown as “Available from \<reset date\>” until the end of the listing period/reset date (will then show as “Available”). Remaining Loads: force to 0 (even if any \>0 at the moment of manual mark-as-sold). For Ongoing listings this is also forced to 0 (until available loads resets at the end of the listing period. Marketplace visibility: Remove from default marketplace view. Appears only if explicitly filtered for Sold (Phase 1 \- 6.7.3.1). Remains visible to the owner in “My Listings” with a Sold badge. Offers state changes: All existing pending offers (any not accepted and not withdrawn) become Rejected. Notifications: Seller (owner): Platform toast: “Listing marked as sold.” Users with pending offers are Rejected: Platform notification ([6.1.6](#6.1.6.-trading-notifications)) and email sent (Phase 1 \- 7.5.0.11. Bid Updates Email). Postconditions: Upon confirmation, a listing is marked as sold.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Mark as sold failure | “We couldn’t complete this action right now. Please try again. If the problem persists, contact support.” |

| Design Name | Link |
| :---- | :---- |
| Listing page | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-82017\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-82017&t=TzDhDk2ScPubsQGI-4) ![][image17] |
| Confirmation modal | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-84074\&t=agaM0kh6K9gZbJyL-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-84074&t=agaM0kh6K9gZbJyL-4) ![][image18] |

| Client Approved | Yes |
| :---- | :---- |

#### 

### 6.1.3. My Wanted Listings {#6.1.3.-my-wanted-listings}

#### **~~6.1.3.1. Renew Listing~~**

* ~~This reuses logic from [6.1.2.1.](#6.1.2.1.-renew-listing)~~  
* ~~The user will be able to renew a listing that they have created through the listing page.~~  
* ~~When the listing is in the expiry period, there will be a message: “This listing is about to expire, do you want to renew it?”~~  
* ~~The user will be able to click on the message to renew the listing~~  
  * ~~The system will ask the user to confirm if they want to renew the listing~~  
    * ~~Yes \- set the new renewal period~~  
      * ~~2 weeks (default)~~  
      * ~~Custom (select days, weeks, or pick a date from a calendar)~~

#### **~~6.1.3.2. Replicate Listing~~**

* ~~This reuses logic from [6.1.2.2.](#6.1.2.2.-replicate-listing)~~  
* ~~The user will be able to create new wanted listings by replicating an existing wanted listing~~  
* ~~There will be a duplicate button within the listing page~~   
  * ~~Clicking on the button will lead the user to a prepopulated new listing form~~  
* ~~The form will have the following sections, which will be editable~~  
  * ~~Upload media~~  
    * ~~There will be instructions guiding the user on the type of images they should provide~~  
    * ~~Select “featured image” (i.e. cover image)~~  
  * ~~Material wanted~~   
  * ~~Quantity wanted~~  
  * ~~Material required from (start date)~~  
    * ~~There will be a date picker (calendar)~~  
  * ~~Additional information~~  
    * ~~Free text box~~  
* ~~On submitting, the form will be sent to the Admin for approval~~   
  * ~~The listing is removed by the creator or the WasteTrade Admin~~  
    * ~~The default listing period comes to an end~~

#### **~~6.1.3.3. Create a Wanted Listing~~** {#6.1.3.3.-create-a-wanted-listing}

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~Form Sections and Inputs:~~  
  * ~~The page title will display Create Wanted Listing.~~  
    * ~~Text throughout the Create a Wanted Listing page will be updated to reflect that this is a “Wanted” listing and not an available or sales material.~~  
      * ~~Guidance text on the page will display:~~  
        * ~~"List wanted material in the marketplace"~~  
  * ~~Upload Media: Provide an option to upload images with guidance on the type of images required.~~   
    * ~~Text will display “This is recommended to optimise the matches for your requirements.”~~  
    * ~~Featured image upload~~  
      * ~~Accepted file types: jpg, jpeg, png, gif, Max. File size: 50 MB, Max. Files: 1\.~~  
      * ~~This is the main profile image for the listing~~  
    * ~~Gallery images upload~~   
      * ~~Accepted file types: jpg, png, jpeg, pdf, doc, xls, Max. File size: 5 MB, Max. Files: 6\.~~  
      * ~~Users can select multiple images using Ctrl+click or Shift+click or even multiselect with the mouse or by pressing and holding on a mobile/tablet device.~~  
  * ~~Material Wanted: Include a field for specifying the material type, for each of the fields within this section:~~   
    * ~~Country waste is required in~~  
    * ~~Material Details: 7 Dropdowns for entering details regarding the material~~  
      * ~~Material type~~  
        * ~~Always shows options for Plastic, EFW, Fibre, Rubber, Metal~~  
      * ~~Item~~   
        * ~~Conditionally displays “Items” options based on the Material type.~~  
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
      * ~~Form~~  
        * ~~If “Material type” \= “Plastic” options for “Form” are presented~~  
          * ~~(Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)).~~  
        * ~~If “Material type” is not plastic, the “Form” dropdown will only display N/A as a default selection.~~  
      * ~~Grading~~	  
        * ~~If “Material type” \= “Plastic” or “Fibre”, the options for “Grading” are specific to the Material type selected.~~  
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
        * ~~If “Material type” \= “EFW” or “Metal” or “Rubber,” the “Grading” dropdown will only display N/A as a default selection.~~  
      * ~~Colour~~  
        * ~~Will always display the same options~~  
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
      * ~~Finishing~~  
        * ~~Will always display the same options~~   
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
      * ~~Packing~~  
        * ~~Will always display the same options~~   
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
    * ~~MFI requirements~~  
      * ~~Optional radio buttons for:~~  
        * ~~Low (0.1-10)~~  
        * ~~Medium (10-40)~~  
        * ~~High (40+)~~  
    * ~~How should the waste be stored~~  
      * ~~Indoor/Outdoor/Both/Any~~  
    * ~~Metric: The user can select units of Mt, Lbs, or Kg.~~   
      * ~~If Lbs or Kg are selected, this will convert to Mt in the Total Weight field.~~  
    * ~~Quantity Wanted: Numeric input field for specifying the quantity of the material needed.~~  
      * ~~Displayed as the selected metric above.~~  
    * ~~Total Weight (Mt)~~  
      *  ~~Displays the quantity wanted weight in Mt.~~  
    * ~~Capacity per month~~  
    * ~~Material Required From: Include a date picker to allow the user to specify a start date from which the material is needed.~~  
      * ~~Past dates (Yesterday or before) will be disabled.~~  
    * ~~Frequency~~  
      * ~~Dropdown menu containing frequency options~~  
        * ~~Weekly~~  
        * ~~Monthly~~  
        * ~~Every 3 Months~~  
        * ~~Every 6 Months~~  
  * ~~Additional Information: Provide a free text box for additional details or specifications.~~  
    * ~~This free text (and any free text for listings) should not allow telephone numbers, email addresses or URLs.~~  
  * ~~Ongoing Listing:  Yes/No radio buttons.~~   
    * ~~Selecting “Yes” allows the user to set the Renewal Period~~  
      * ~~Dropdown menu containing renewal period options.~~  
    * ~~Selecting “No” allows the user to set Listing Duration~~  
      * ~~Default duration of 30 days, or set a custom duration using days, weeks, or a specific end date selected via a calendar.~~  
    * ~~There will be no functionality to define a wanted listing as ongoing.~~  
* ~~Submission and Validation:~~  
  * ~~Include a "Submit" button to send the listing for Admin review.~~  
  * ~~Validate all input fields to ensure data integrity (e.g., proper date formats, required fields are not left blank).~~

#### 

#### 

#### **~~6.1.3.4. Edit a Wanted Listing~~**

* ~~Reuses logic from creating a wanted listing ([6.1.3.3](#6.1.3.3.-create-a-wanted-listing)).~~  
* ~~As the wanted listing owner, I want to edit an existing wanted listing using the same form as Create a Wanted Listing, with all fields pre-populated from the current listing.~~  
* ~~There will be an “Edit Listing” button visible to the wanted listing owner.~~  
* ~~Clicking “Edit listing” opens the Create Wanted Listing form with all fields prefilled from the current listing; all existing validations and constraints apply.~~  
* ~~Submitting saves the updates to the listing and returns the listing to awaiting approval by admin.~~

### ~~6.1.4. My Offers~~ {#6.1.4.-my-offers}

#### **~~6.1.4.1. Mark Offer “Pickup Confirmed”~~** {#6.1.4.1.-mark-offer-“pickup-confirmed”}

* ~~For each individual listing within the My Offers table, the Seller will be able to mark a sales load as “Pickup Confirmed”.~~  
  * ~~This will be done **per load** within an offer.~~  
  * ~~Seller must define which load (X/number of loads) has confirmed pickup.~~  
* ~~The user will be required to add mandatory evidence.~~  
  * ~~Collection date~~  
  * ~~Gross weight~~  
  * ~~Pallet weight~~  
* ~~The user will be able to upload files from their device~~  
  * ~~Weighbridge ticket (PDF/image)~~  
  * ~~Loading images~~  
  * ~~Other~~   
    * ~~The user will be able to provide the title~~  
* ~~Flags for Admin to review pickup details and mark as shipped ([6.4.1.7](#6.4.1.17.-mark-listing-as-shipped))~~

#### **~~6.1.4.2. View Individual Offers Received for Listings~~**

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~On clicking on a row of the view a summary of offers received table, the user will be redirected to the Selling Offers \> Detail page~~  
* ~~Currently this shows:~~

~~![][image19]~~

* ~~This will be updated to reflect the desired layout and functionality:~~

~~![][image20]~~

* ~~The page features a photo carousel that displays multiple images of the product.~~  
  * ~~Displays the featured image and all gallery images.~~  
  * ~~Thumbnails and inline gallery images must use object-fit: cover so images fill their containers without distortion.~~  
  * ~~The image container must have rounded edges, in keeping with the listing page container shape.~~  
  * ~~Allow users to manually cycle through images and implement auto-change functionality that switches images every 3 seconds.~~  
  * ~~Clicking any gallery image opens a lightbox modal.~~  
    * ~~The lightbox displays the full-size image at its native aspect ratio (no cropping)~~  
    * ~~Next/Previous controls to scroll through all images in the gallery.~~  
    * ~~There will be a visible Close (X) and backdrop click to exit and return to the listing page.~~  
* ~~The Seller can Accept or Reject offers within the list of offers.~~  
  * ~~Currently when the user selects to “Reject” an offer a modal is presented for the user to text input a reason for rejection, with options to cancel/submit.~~  
    * ~~This will be updated so that upon selecting to “Reject” the user is presented with a modal containing:~~  
      * ~~An (x) to close the modal without saving.~~  
      * ~~“Are you sure you want to reject this offer?”~~  
      * ~~“Reason for rejection:~~  
        * ~~Images not matching the description~~  
        * ~~Low price~~  
        * ~~Location too far~~  
        * ~~Other”~~  
          * ~~Selecting “Other” prompts a free text box to appear for the user to type a reason for rejection.~~  
        * ~~“Submit Rejection” button~~  
    * ~~This will be implemented for all Seller offer rejection modals.~~

### 6.1.5. Marketplace {#6.1.5.-marketplace}

#### **~~6.1.5.1. Trading Homepage Layout~~**

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~Key Elements on the Homepage:~~  
  * ~~Header: site logo, and access to user account settings ([6.3.2.1](#6.3.2.1.-header)).~~  
  * ~~Footer: Should reflect the user's authentication state ([6.3.2.2](#6.3.2.2.-footer)).~~  
  * ~~Filters: Implement filters to help users refine the listings ([6.1.5.2](#6.1.5.2.-search/filters-panel)).~~  
  * ~~Product Cards: Each listing should be presented in a product card format ([6.1.5.3](#6.1.5.3.-view-product-card)).~~  
    * ~~The page will display a total of 14 results per page, i.e. 7 rows with 2 product cards per row.~~  
    * ~~The page will not display the user's own product cards within the marketplace.~~  
    * ~~Product cards will be sorted to display the newest material listings first.~~  
      * ~~I.e. Most recent date created displayed first~~  
      * ~~Until the user applies a search/filter ([6.1.5.2](#6.1.5.2.-search/filters-panel))~~  
  * ~~Account Status: Display the user’s account status prominently on the page.~~  
* ~~Navigation and Usability:~~  
  * ~~Clicking on a product card should redirect the user to that specific product’s detailed page without any issues.~~  
  * ~~Ensure the navigation between pages is seamless and intuitive.~~

#### **~~6.1.5.2. Search/Filters Panel~~** {#6.1.5.2.-search/filters-panel}

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~Functional Elements:~~  
  * ~~Incorporate a search bar that allows users to enter keywords relevant to their interests in buying, selling, or wanted listings.~~  
    * ~~The system must support tokenised search for user details (User ID) and material (Material type, Item, Form, Grading, Colour, Finishing, Packing)~~  
      * ~~The search must match any word in the composite product name schema~~   
    * ~~Support multi-word queries and partial token matches (case-insensitive).~~  
    * ~~Submit behaviour must also occur after the user selects “enter”.~~  
  * ~~Include dropdown fields for:~~  
    * ~~Location: Allows users to type and select a location.~~  
      * ~~Location will be taken from the Warehouse location default filter.~~  
    * ~~Materials:~~   
      * ~~Material type~~  
        * ~~Always shows options for Plastic, EFW, Fibre, Rubber, Metal~~  
      * ~~Item~~   
        * ~~Conditionally displays “Items” options based on the Material type.~~  
        * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
      * ~~Packing~~  
        * ~~Will always display the same options~~   
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
    * ~~Stored:~~   
      * ~~All: shows all available listings regardless of storage requirements.~~  
        * ~~Default~~  
      * ~~Indoors: Filters listings stored indoors, showing the number of available listings.~~  
      * ~~Outdoors: Filters listings stored outdoors, showing the number of available listings.~~  
* ~~Checkbox Filters:~~  
  * ~~Provide checkboxes for filtering by:~~  
    * ~~Stored~~  
    * ~~Show Sold Listings: Sold items will be hidden by default.~~  
      * ~~Include an option to ‘Show sold listings', allowing users to show already sold items.~~  
* ~~Show only options with results:~~  
  * ~~All dropdowns (e.g., Location, Materials, Item, Packing) must dynamically list only values that currently return results given the active filters/search; values with zero matches are hidden (typeahead respects the same constraint).~~  
* ~~Interaction and Usability:~~  
  * ~~Ensure that all dropdowns and checkboxes are easy to interact with, including clear labelling and adequate spacing for touch inputs on mobile devices.~~  
  * ~~Dropdowns should provide immediate feedback and update the available listings based on the selected filters without page reloads.~~  
  * ~~Submit behaviour must also occur after the user selects “enter”.~~  
* ~~Clear All Filters Button:~~  
  * ~~Include a 'Clear all filters' button that resets all selected filters to their default states, providing users with a quick way to start a new search without manually deselecting each option.~~  
* ~~Unsuccessful Search:~~  
  * ~~Unsuccessful Search Result Handling:~~  
    * ~~Ensure that when a search query returns no results, the page automatically displays a specific call to action to guide the user.~~  
    * ~~This should be implemented on all relevant search pages within the trading platform where user searches are possible.~~  
      * ~~The banner will also be displayed at the bottom of successful search pages within the marketplace/listing/my listings/wanted listings/product page/my offers pages.~~  
  * ~~Content Display for No Results:~~  
    * ~~Display a clear and prominent heading: "Not finding what you need?"~~  
    * ~~Follow the heading with a subheading:~~   
      * ~~When viewing sales listings, the message will display: "Click the button to list a wanted material."~~  
      * ~~When viewing wanted listings, the message will display: “Click the button to list a material for sale.”~~  
    * ~~These messages should be displayed in a central location on the page to ensure maximum visibility.~~  
  * ~~Call to Action Button:~~  
    * ~~Include a button labelled "List material" that is easily visible and accessible to users.~~  
      * ~~When viewing sales listings, the button will direct the user to create a wanted listing page.~~  
      * ~~When viewing wanted listings, the button will direct the user to create a sales listing.~~  
    * ~~The design and placement of the button should be consistent with the platform’s UI guidelines to maintain design continuity.~~  
  * ~~Button Functionality:~~  
    * ~~Configure the button so that clicking it leads the user directly to the create listing flow specifically designed for listing wanted materials or available materials.~~  
    * ~~Ensure that the transition from the unsuccessful search result page to the listing flow is seamless and intuitive.~~

#### 

#### **6.1.5.3. View Product Card** {#6.1.5.3.-view-product-card}

* This is an update to existing functionality within the trading platform; updates are highlighted in yellow.  
* General Card Design and Layout:  
  * Ensure each product card (buy/sell/wanted) provides a summary view of the listing and is consistent in design across different listing types to maintain a uniform user experience.  
  * The card must be visually appealing and easy to read, with a clean and organised layout.  
* Mandatory Elements on All Cards:  
  * Product Name: Clearly displayed at the top of the card.  
  * Image/Placeholder: Each card must include an image of the product or a placeholder if no image is available.  
  * Material of Interest: Listings that match the user's Materials of interest will display the Material of Interest icon and text.  
    * A “Material of Interest” is defined as a material matching a user's “Material Preferences”, defined during registration and managed via their account settings.  
    * Matching materials must be highlighted as a “Material of Interest” on the product card.  
  * Quantity Available: Display the amount of product available for buy/sell.  
  * Country: Show the country of the product’s origin or location.  
* Additional Elements on 'Wanted' Cards:  
  * Availability Status: Indicate whether the item is still wanted or if the need has been met.  
    * For Wanted Listings  
      * Required/Required From: Display the date from which the item is required.  
      * Fulfilled: Wanted listing has been fulfilled and is no longer active  
    * For Sales Listings  
      * Available/available from: Display the date from which the item is available.  
      * Expired: The listing has expired after the set time  
      * Sold: All loads of the listing have been sold  
      * Ongoing: a listing that has a defined number of loads until resetting at defined intervals.  
* Additional Elements on 'Sales Listing' Cards:  
  * Availability Status: Indicate whether the item is available immediately or from a future date.  
  * Available/Available From: Clearly state the availability status and the specific start date if applicable.

| Scope & Preconditions: This is an update to an existing US developed in phase 1 (6.7.3.3 Listing card (product card). Modifications or updates are highlighted in yellow. The marketplace is functional. Triggers: The user is viewing a product card within the marketplace. Acceptance Criteria: General Card Design and Layout: Ensure each product card provides a summary view of the listing and is consistent in design across different listing types to maintain a uniform user experience. The card must be visually appealing and easy to read, with a clean and organised layout. Mandatory Elements on All Cards: Product Name: Clearly displayed at the top of the card. Image/Placeholder: Each card must include an image of the product or a placeholder if no image is available. Material of Interest: Listings that match the users Material Preferences will display the Material of Interest icon and text. The system must identify the users Material Preferences from their profile (Phase 1 \- 6.4.8.7 Material preferences) and flag product cards matching the preferred materials as “Materials of Interest” with an icon/text. Quantity Available: Display the amount of product available for buy/sell. Country: Show the country of the product’s origin or location. Additional Elements on 'Wanted' Cards: Availability Status: Indicate whether the item is still wanted or if the need has been met. For Wanted Listings Required/Required From: Display the date from which the item is required. Fulfilled: Wanted listing has been fulfilled and is no longer active For Sales Listings Available/available from: Display the date from which the item is available. Expired: The listing has expired after the set time Sold: All loads of the listing have been sold Ongoing: listing that has a defined number of loads until resetting at defined intervals. Additional Elements on 'Sales Listing' Cards: Availability Status: Indicate whether the item is available immediately or from a future date. Available/Available From: Clearly state the availability status and the specific start date if applicable. Interactivity and Navigation: Clicking on the card should redirect the user to a detailed listing page for that specific product. This interaction should be smooth and quick, enhancing the user experience. Ensure that the clickable area of the card is well-defined and does not overlap with other interactive elements like the star icon. Postconditions: The system will display materials of interest relating to a user's preferences.  |
| :---- |

| Field | Description |
| :---- | :---- |
| Product Name | Display Type: Text; Mandatory |
| Image/Placeholder | Display Type: Image; Mandatory |
| Material of Interest | Display Type: Icon & Text. Conditional display: only shown for materials matching the users Material of Interest settings. |
| Quantity Available | Display Type: Text; Mandatory |
| Country | Display Type: Text; Mandatory |
| Availability Status | Display Type: Text; Specific to 'Wanted' and 'Sales Listing' cards; Mandatory |
| Required/From Date | Display Type: Date; Specific to 'Wanted' cards; Mandatory |
| Available/From Date | Display Type: Date; Specific to 'Sales Listing' cards; Mandatory |

| Use Case | Error Message |
| :---- | :---- |
| Failure to load product image | "Failed to load image. Please try refreshing the page." |
| Navigation error to product page | "Failed to load product details. Please try again." |
| No available data for required fields | "Product information is currently unavailable." |

| Design Name | Link |
| :---- | :---- |
| Product card | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-84848\&t=Cl8KNyhNAyvchX8x-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-84848&t=Cl8KNyhNAyvchX8x-4) ![][image21] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### 

#### 

#### **~~6.1.5.4. View Sales Listing Page~~**

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~Essential Content Display:~~  
  * ~~The page must prominently display the Product Name at the top.~~  
    * ~~Logic for displaying the ‘Product Name’ is specific to the material type:~~  
      * ~~'Item' for Metals~~  
      * ~~'Item' for Rubber~~  
      * ~~'Grade \- Item' for Fibre~~  
      * ~~'Item \- Form \- Finishing' for Plastics~~  
      * ~~'EFW' for EFW~~  
      * ~~'\<Free text input\>' for Other~~  
* ~~Availability Status:~~  
  * ~~Display the Availability Status clearly on the page, consistent with the information shown on the product card.~~  
* ~~Breadcrumb Navigation:~~  
  * ~~Implement breadcrumb navigation at the top of the page to enhance user navigation and provide a clear path back to previous sections.~~  
* ~~Photo Carousel:~~  
  * ~~Feature a photo carousel that displays multiple images of the product.~~  
  * ~~Displays the featured image and all gallery images.~~  
  * ~~Thumbnails and inline gallery images must use object-fit: cover so images fill their containers without distortion.~~  
  * ~~The image container must have rounded edges, in keeping with the listing page container shape.~~  
  * ~~Allow users to manually cycle through images and implement auto-change functionality that switches images every 3 seconds.~~  
  * ~~Clicking any gallery image opens a lightbox modal.~~  
    * ~~The lightbox displays the full-size image at its native aspect ratio (no cropping)~~  
    * ~~Next/Previous controls to scroll through all images in the gallery.~~  
    * ~~There will be a visible Close (X) and backdrop click to exit and return to the listing page.~~  
* ~~Material Description Section:~~  
  * ~~Include a comprehensive description of the material, replicating the detail and layout found on the current website.~~  
    * ~~Material~~  
    * ~~Price per load~~  
    * ~~No of loads~~  
    * ~~Remaining loads~~  
    * ~~Avg weight per load~~  
    * ~~Material location~~  
  * ~~Ensure the description is well-organised and easy to read.~~  
* ~~Request Information Button:~~  
  * ~~Provide a "Request Information" button that, when clicked, sends a request to the Admin Portal. Include details of the request process and what information is transmitted.~~  
* ~~Social Sharing Options:~~  
  * ~~Incorporate sharing options for Facebook, LinkedIn, Twitter, WhatsApp, and Email.~~  
  * ~~Ensure each sharing option uses the appropriate API to format the shareable content correctly for each platform.~~  
* ~~Seller Card:~~  
  * ~~Display a Seller card that includes information about the Seller or the listing company, such as contact details or other relevant information.~~  
* ~~Call to Action:~~  
  * ~~Based on the type of listing, include appropriate call-to-action buttons:~~  
  * ~~"Bid Now" for Buy listings.~~  
  * ~~"Sell Material" for Wanted listings.~~  
  * ~~Ensure these buttons are prominent and clearly indicate the next action the user should take.~~

#### **~~6.1.5.5. Bidding on a Listing~~**  {#6.1.5.5.-bidding-on-a-listing}

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~Listing Page Access and Layout:~~  
  * ~~Ensure that clicking on any product card from the trading homepage successfully redirects the user to the corresponding listing page.~~  
  * ~~The listing page must prominently display a "Bid Now" call-to-action (CTA) button.~~  
* ~~Bid Submission Process:~~  
  * ~~Implement a form that is accessible via the "Bid Now" button, where the user can enter their bid details.~~  
    * ~~Users can make unlimited bids on the same listing.~~  
  * ~~The form should require the user to provide the following information:~~  
    * ~~Warehouse location: Dropdown select, listing locations provided during onboarding.~~  
    * ~~Container types (defined from location details)~~  
    * ~~Offer valid until: Date input.~~  
    * ~~Earliest delivery date: Date input.~~  
    * ~~Latest delivery date: Date input.~~  
      * ~~The latest delivery date field in placing bids should be blocked before the earliest delivery date.~~  
    * ~~Number of loads bid on: Numeric input (minimum 1; maximum cannot exceed the total number of loads listed).~~  
    * ~~Currency: Dropdown or text input.~~  
    * ~~Price per Metric Tonne: Numeric input.~~  
    * ~~Incoterms: Dropdown select with an information button to explain various options.~~  
      * ~~EXW, FAS, FOB, CFR, CIF, DAP, DDP.~~   
      * ~~If FAS, FOB, CFR or CIF is selected for ‘Incoterms’, display the text field for ‘Shipping Port’.~~   
* ~~Validation and Error Handling:~~  
  * ~~Ensure all form inputs are validated for correct format and logical consistency (e.g., delivery dates make sense in context, bid amounts are within expected ranges).~~  
  * ~~Provide clear, informative error messages if the user fails to fill out the form correctly or if there is an issue with submission.~~  
* ~~Submission and Admin Review:~~  
  * ~~Once a bid is submitted, it should be sent for review to the WasteTrade Admin team.~~  
  * ~~The system should provide immediate feedback to the user that their bid has been received and is under review.~~  
* ~~Tracking and User Feedback:~~  
  * ~~Users should be able to track the status of their bid through the "My Offers" section of the platform.~~  
  * ~~Updates about the bid status should be timely and reflect real-time changes as they are processed by the Admin team.~~

#### **~~6.1.5.6. Request Free Sample~~**

* ~~The user will be able to request a sample of a material for sales listings.~~  
* ~~The user must select from:~~  
  * ~~Sample Size (dropdown)~~  
    * ~~1kg~~  
    * ~~2kg~~  
    * ~~5kg~~  
  * ~~What is your estimate bidding price for this material?~~  
  * ~~Would you be interested in regular loads of this material?~~  
  * ~~Delivery Address (warehouse Selection)~~  
  * ~~Message~~  
* ~~On submitting, the request will be sent to the admin~~

#### **~~6.1.5.7. View Wanted Listing Page~~** {#6.1.5.7.-view-wanted-listing-page}

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~Essential Content Display:~~  
  * ~~Ensure the listing page displays the Product Name prominently at the top of the page.~~  
  * ~~Include an Availability Status indicator, consistent with the information presented on the product card.~~  
* ~~Links to Breadcrumb Navigation:~~  
  * ~~Implement breadcrumb navigation to allow users to easily trace their path back to~~  
  * ~~previous pages, enhancing the navigational experience.~~  
* ~~Photo Carousel Features:~~  
  * ~~Feature a photo carousel that displays multiple images of the product.~~  
  * ~~Displays the featured image and all gallery images.~~  
  * ~~Thumbnails and inline gallery images must use object-fit: cover so images fill their containers without distortion.~~  
  * ~~The image container must have rounded edges, in keeping with the listing page container shape.~~  
  * ~~Allow users to manually cycle through images and implement auto-change functionality that switches images every 3 seconds.~~  
  * ~~Clicking any gallery image opens a lightbox modal.~~  
    * ~~The lightbox displays the full-size image at its native aspect ratio (no cropping)~~  
    * ~~Next/Previous controls to scroll through all images in the gallery.~~  
    * ~~There will be a visible Close (X) and backdrop click to exit and return to the listing page.~~  
* ~~Material Description Section:~~  
  * ~~Include a detailed description of the wanted material, replicating the format and level of detail from the current website to maintain consistency.~~  
  * ~~Ensure the description is clear, concise, and provides all necessary information about the wanted material.~~  
* ~~Social Sharing Options:~~  
  * ~~Incorporate options to share the listing on social platforms such as Facebook, LinkedIn, Twitter, WhatsApp, and via Email. Ensure each option functions correctly and formats the shared content appropriately for each platform.~~  
* ~~Buyer Card:~~  
  * ~~Display a Buyer card that includes relevant information about the person or company requesting the wanted material, such as contact details or other pertinent information.~~  
* ~~Calls to Action:~~  
  * ~~Include distinct calls to action: "Sell Material" and "Message Buyer", each leading to appropriate actions. Ensure these buttons are visually distinct and positioned to drive user engagement.~~  
    * ~~Message Buyer: should open a contact form that allows a message to be sent from the interested party (it will be sent to the WasteTrade Admin team, to manually review and manage)~~  
      * ~~Title: Message to Buyer~~   
      * ~~Name: Prepopulated~~   
      * ~~Email: pre-populated~~  
      * ~~Text: free text for the user to input~~    
    * ~~Sell Material: opens the ‘create listing’ page with the details in the wanted listing pre-populated. Once the listing is live, the user who posted the ‘wanted’ listing will be notified.~~  
    * ~~Delete: show a confirmation to the user \-\> If the listing is deleted, navigate back to My Listing / Wanted list~~   
    * ~~Fulfil: mark the Wanted Listing as Fulfilled status~~ 

### 6.1.6. Trading Notifications {#6.1.6.-trading-notifications}

#### **6.1.6.1. Notifications Icon** {#6.1.6.1.-notifications-icon}

* There will be a notification icon within the header  
* The icon will indicate when there are new notifications  
* Clicking on the notifications will lead to the notification centre

| Preconditions: The user is logged in. The header is visible. Trigger: The user opens the Notifications icon from the header. Acceptance Criteria: There will be a Notifications icon in the header. The icon will display an unread count number. Selecting the icon will open the notifications centre ([6.1.6.2](#6.1.6.2.-notifications-centre)). Postcondition: The user is directed to the notifications centre. |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notifications load failure | "Failed to load notifications centre. Please refresh the page." |

| Design Name | Link |
| :---- | :---- |
| Header icon | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21870-121511\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21870-121511&t=TzDhDk2ScPubsQGI-4) ![][image22] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.1.6.2. Notifications Centre** {#6.1.6.2.-notifications-centre}

* The user will be able to view and manage all notifications in the notification centre  
* The user will be able to view each notification in full detail   
  * Notifications will be displayed in reverse chronological order (latest first)  
  * There will be a timestamp on each notification  
    * dd/mm/yyyy HH:MM  
* The user will be able to mark the notifications as   
  * Read  
  * Unread  
* There will be pagination  
  * ~~The user will be able to select the number of rows per page~~  
    * ~~10~~  
    * ~~20~~  
      * ~~Default~~  
    * ~~50~~  
    * ~~All~~  
* By default, the page will display the latest notifications at the top

| Preconditions: The user is authenticated and has access to the Notifications centre. Trigger: The user opens the Notifications dropdown from the header. The user selects Mark all as read. Acceptance Criteria: Container The Notifications icon in the header opens a dropdown panel when selected. The dropdown stays in context (no page navigation). The panel appears on the right hand side of the page. List Contents The panel displays a chronological list of notifications for the current user. Each notification entry shows:  Timestamp dd/mm/yyyy HH:MM Title  Single line title Summary Read icon/Unread icon Unread messages will be highlighted green. Users can select the icon to toggle between read/unread state. Status changes Notifications will be marked Read when the user selects “Mark all read” Changes all visible notifications to the Read state. Unread notification count in the header icon ([6.1.6.1](#6.1.6.1.-notifications-icon)) updates instantly. Opening/closing the dropdown does not change notification states unless the user explicitly acts (e.g., Mark all as read). After a status change, entries lose the unread styling and the unread count updates accordingly. Read/unread state persists, across sessions. Data Scope Initial view (compact): On open, the dropdown shows up to 10 most recent notifications. If fewer than 10 exist, show only those; if none, show the empty-state message. Load older pages: The user can click “View more” and load the next 10 older notifications into the same fixed-height list. This replaces the currently displayed set (no further size change). When there are no older notifications, replace the control with “No more notifications.” If no notifications exist, render an empty state: “You don’t have any notifications yet.” Postconditions: The user views their notifications in one place and can bulk-mark them as Read; the updated state is saved.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notifications load failure | "Failed to load notifications. Please refresh the page." |
| Mark as read failure | "Unable to mark notification as read. Please try again." |
| Mark as unread failure | "Unable to mark notification as unread. Please try again." |
| Load more failure | “Unable to load more notifications. Please try again.” |

| Design Name | Link |
| :---- | :---- |
| Notifications centre | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-90304\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-90304&t=TzDhDk2ScPubsQGI-4) ![][image23] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.1.6.3. General Platform Emails** {#6.1.6.3.-general-platform-emails}

* The following notifications are sent to all users  
  * Complete registration   
  * Welcome email   
* These notifications will be sent to a user’s email address

| Scope & Preconditions: Currently the system delivers general notifications via email. This will be updated to include in platform notifications. The user is authenticated. Triggers: The system recognises a trigger event. Acceptance Criteria: Currently the system sends general emails [WasteTrade Emails/Q\&A](https://docs.google.com/spreadsheets/d/1u8Iu2vvNOFx4-wY9g6HXbobqzL2lxCJxPjzB94qeYOM/edit?gid=1775724412#gid=1775724412): Incomplete registration  [6.1.1.2](#6.1.1.2.-save/resume) Complete Your Account Phase 1 \- 6.1.1.5 Submit form \- confirmation page (stage 1\) & 7.5.0.6 Complete Your WasteTrade Account. Successful Registration Email Phase 1 \- 6.1.1.5 Submit form \- confirmation page (stage 1\) & 7.5.0.1 Register email. Account Verified Email Phase 1 \- 6.6.2.7 Member approval \- approval actions  Success: 7.5.0.4 Account verified Rejection Forgotten Password Email Phase 1 \- 6.2.1.5. Forgotten Password & 7.5.0.2 Forgotten password email. Material Preferences Email Phase 1 \- 7.5.0.3 Updated preferences Profile Update Email Phase 1 \- 6.4.8.4 My profile \- edit & 7.5.0.9. Profile Updates Email The system will be expanded to also deliver notifications (where applicable): The following events do not require notifications: Incomplete registration Complete Your Account Successful Registration Email Forgotten Password Email The following events will be delivered as notifications with clickable navigation links: Account Verified Email Success: 7.5.0.4 Account verified Title: “Account Verified” Summary: “Your WasteTrade account is now verified. You can browse the marketplace, request info or samples, and create Listings and Wanted Listings. Go to Platform” When clicking on the link Go to Platform, the user will be directed to the Marketplace page Rejection: Title: “Account Verification Unsuccessful” Summary: “We couldn’t verify your account at this time. \<reason optional\>. Please review and complete the required information (e.g., company documents, permits, full address) to continue. View Profile” When clicking on the link View Profile, the user will be directed to the Profile page Title: “Personalised Notifications Enabled” Summary: “You’ll now receive tailored emails for Material and Wanted Listings that match your preferences. Adjust what you receive anytime. View Profile” When clicking on the link View Profile, the user will be directed to the Profile page Profile Update Email Title: “Profile Updated” Summary: “Your profile information was updated successfully. If this wasn’t you, contact support immediately to secure your account. Review Profile” When clicking on the link View Profile, the user will be directed to the Profile page  Postconditions: The Seller/Buyer receives in-platform notifications and emails.   |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notification link failure | “Failed to open the notification link. Please try again.” |

| Design Name | Link |
| :---- | :---- |
|  | Shown in [6.1.6.2.](#6.1.6.2.-notifications-centre) |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.1.6.4. Document Expiry Notifications** {#6.1.6.4.-document-expiry-notifications}

* The system will identify when a document is approaching its expiry date  
* The account owner will receive a notification containing the following information  
  * Document type  
  * Expiry date  
  * Link to the Company Documents section  
* The notification will be sent at the following intervals  
  * 30 days before expiry  
  * 20 days before expiry  
  * 15 days before expiry  
  * 10 days before expiry  
  * 7 days before expiry  
  * 5 days before expiry  
  * 3 days before expiry  
  * Day of expiry  
* All notifications will be sent through the system and also to the user’s email address

| Preconditions: The user has documents stored in Company Documents within their profile that include an expiry date. Triggers: The system identifies a document as being near expiry. Acceptance Criteria: The system runs an expiry sweep job daily to find documents approaching expiry. A document is “approaching expiry” on the following exact day offsets prior to its expiry date: 30, 20, 15, 10, 7, 5, 3, and 0 (day of expiry). For each offset day that matches today, the system creates one notification event per document. For a given document\_id and interval (e.g., 30-day), the system must not send more than one notification. For 30, 7 and 0 (day of expiry) the system will also send the document expiry email. Stop conditions If expiry date changes (extended or replaced), pending future intervals recalculated using the new expiry date. If the document is deleted/archived, cancel any future notifications for that document. If the document is already expired when first detected, only the day-of-expiry (0) event is eligible; past intervals are skipped. Notification Title: “Document Expiry” Summary: “Your document, \<document title\>, expires on \<expiry date ddmmyyyy\>. Please update your records to avoid disruption. Manage Documents” When clicking on the link Manage Documents, the user will be directed to the Profile \> Company Documents page Email Subject: “Wastetrade \- Document Expiry” Body: “Hi \<owner first name\>,One of your documents is approaching expiry on \<expiry date ddmmyyyy\>.To keep your account in good standing, please review and update your document.If you’ve already updated this document, you can ignore this message. If you have questions, reply to this email or contact support@wastetrade.com.Best regards,The WasteTrade Team” Postconditions: On a matching interval day, the Account Owner receives a notification and email. Once the document is updated (expiry changed or replacement uploaded), future notifications use the new date; past intervals are not present.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notification link failure | “Failed to open the notification link. Please try again.” |

| Design Name | Link |
| :---- | :---- |
| Document expiry email | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-89994\&t=agaM0kh6K9gZbJyL-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-89994&t=agaM0kh6K9gZbJyL-4) ![][image24] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.1.6.5. Buyer Notifications**

* The Buyers will receive notifications at the following points  
  * Bid approved/rejected  
  * ~~Received communication from the Admin (listing requires attention; status: pending)~~  
  * Bid accepted  
  * ~~Sample Sent \- Tracking Number~~  
  *  New Matching Listing  
* All notifications will contain a link to the original listing  
* All notifications will be sent through the system and also to the user’s email address

| Scope & Preconditions: Currently the system delivers Buyer notifications via email. This will be updated to include in platform notifications. The user is authenticated. Triggers: The system recognises a trigger event. Acceptance Criteria: Currently the system sends the following Buyer-specific emails: New Listing (as per material preferences) 7.5.0.5 New listing Bid Status (approved/rejected/more information required) Phase 1 6.6.2.11 Admin \- purchase bid approval actions & 7.5.0.11. Bid Updates Email The system will be expanded to also deliver notifications with clickable navigation links: New Listing  Title: “New Listing Added\!” Summary: “A new material of interest has just been added to our system: \<Material Title\>. View Material Listing” Bid status Title: “Bid Status Update”  Summary: “Your bid on \<Material Title\> on \<Bid Date\> has been updated to \<Status\>. View Material Listing” Out of Scope Sample sent (6.1.5.6 Request Sample)  Communications from admin  Postconditions: The Buyer receives in-platform notifications and emails.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notification link failure | “Failed to open the notification link. Please try again.” |

| Design Name | Link |
| :---- | :---- |
| Buyer notifications | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-90304\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-90304&t=TzDhDk2ScPubsQGI-4)  |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.1.6.6. Seller Notifications** {#6.1.6.6.-seller-notifications}

* The Buyers will receive notifications at the following points  
  * Listing approved/rejected  
  * An offer has been received   
    * Only after the Buyer and haulage offer is approved.  
  * ~~Received communication from the Admin (listing requires attention; status: pending)~~  
  * ~~Documents generated~~  
  * Listing Renewed  
  * “Ongoing” listing confirmation notification  
  * ~~Sample Requested~~  
  * ~~Sample Received~~  
* All notifications will contain a link to the original listing  
* All notifications will be sent to the system and also to the user’s email address

| Scope & Preconditions: Currently the system delivers Seller notifications via email. This will be updated to include in platform notifications. The user is authenticated. Triggers: The system recognises a trigger event. Acceptance Criteria: Currently the system sends the following Seller-specific emails: Listing approved/rejected Phase 1 \- 6.6.2.15 Admin \- sales listing approval actions Listing expired Phase 1 \- 6.7.3.7 Listing expiry alert \- sales and wanted This will be expanded to include: Emails: Listing Renewed (including manual renewal ([6.1.2.1.](#6.1.2.1.-renew-listing)) and ongoing renewals) Subject: “WasteTrade \- Listing Renewed” Body: “Hi \<Seller first name\>,Your listing \<listing title\> has been renewed \<manually / automatically\>. To keep attracting buyers, please make sure your details and images are up to date.If you didn’t request this change, reply to this email or contact support@wastetrade.com.Best regards,The WasteTrade Team” Approved haulage (Only after Buyer and haulage offer is approved) Subject: “WasteTrade \- Offer Approved” Body: “Hi \<Seller first name\>,Great news \- the sale and haulage of \<listing title\> has been approved. Buyer and haulage are confirmed.Next steps: review the agreed terms, prepare the required documents, and coordinate loading/collection as scheduled.If you have any questions, reply to this email or contact support@wastetrade.com.Best regards,The WasteTrade Team” Notifications: Listing Approved/Rejected/More Information Required Approved Title: “Listing Approved” Summary: “Your listing \<listing title\> has been approved and is now live. View Material Listing” Rejected Title: “Listing Rejected” Summary: “Your listing \<listing title\> has been rejected by the admin. \<reason for rejection\>. Please create a new listing. View Marketplace” More Information Required Title: “Listing Requires More Information” Summary: “Your listing \<listing title\> has been rejected by the admin. Please update the listing information and resubmit. View Material Listing” Listing Expired Title: “Listing About to Expire” Summary: “Your listing \<listing title\> will expire in 7 days. View Material Listing” Listing Renewed Title: “Listing Renewed” Summary: “\<listing title\> has been renewed \<manually/automatically\>. New end date: \<dd/mm/yyyy\>. View Listing” Approved offer Title: “Offer Approved” Summary: “Buyer and haulage confirmed for \<listing title\>. Review terms and next steps. View Offer” Out of Scope Sample sent (6.1.5.6 Request Sample)  Documents generated Communications from admin Postconditions: The Seller receives in-platform notifications and emails.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notification link failure | “Failed to open the notification link. Please try again.” |

| Design Name | Link |
| :---- | :---- |
| Seller notifications | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-90304\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-90304&t=TzDhDk2ScPubsQGI-4)  |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.1.6.7. Wanted Listing Owner Notifications**

* The listing owner will receive notifications at the following points  
  * Listing approved/rejected  
  * ~~Received communication from the Admin (listing requires attention; status: pending)~~  
* All notifications will contain a link to the original listing  
* All notifications will be sent to the system and also to the user’s email address

| Scope & Preconditions: Currently the system delivers notifications to owners of wanted listings via email. This will be updated to include in platform notifications. The user is authenticated. Triggers: The system recognises a trigger event. Acceptance Criteria: Currently the system sends the following emails for owners of wanted material listings: Listing approved/rejected/more information required (Defined in Phase 1 \- 6.6.2.18 View wanted activity details) This will be expanded to include: Notifications Wanted Listing Approved/Rejected/More Information Required Approved Title: “Listing Approved” Summary: “Your listing \<listing title\> has been approved and is now live. View Material Listing” Rejected Title: “Listing Rejected” Summary: “Your listing \<listing title\> has been rejected by the admin. \<reason for rejection\>. Please create a new listing. View Marketplace” More Information Required Title: “Listing Requires More Information” Summary: “Your listing \<listing title\> has been rejected by the admin. Please update the listing information and resubmit. View Material Listing” Not in Scope Communications from admin  Postconditions: The wanted listing owner receives in-platform notifications and emails.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notification link failure | “Failed to open the notification link. Please try again.” |

| Design Name | Link |
| :---- | :---- |
| Wanted listing notifications | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-90304\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21732-90304&t=TzDhDk2ScPubsQGI-4)  |

| Client Approved | Yes |
| :---- | :---- |

#### 

### 

### 6.1.7. Account {#6.1.7.-account}

#### **~~6.1.7.1. Reduced Access if Documents Missing/Expired~~** {#6.1.7.1.-reduced-access-if-documents-missing/expired}

* ~~The system will identify documents past expiry via the expiry date associated with documents uploaded by the user.~~  
  * ~~Haulier must always have a valid/in-date:~~  
    * ~~Waste Carrier License~~  
  * ~~Traders must always have a valid/in-date:~~  
    * ~~At least one Permit/License from:~~  
      * ~~Environmental Permit~~  
      * ~~Waste Exemption~~   
      * ~~Other~~  
* ~~If the account owner (trader or Haulier) does not update their documents (e.g. re-upload with a new expiry), their account will revert to “Unverified” until their document(s) are updated.~~  
* ~~Existing listings/offers will remain unaffected.~~

### 

#### **6.1.7.2. View My Sites**

* This is an update to existing functionality within the trading platform; updates are highlighted in yellow.  
* Currently, the user can access “My Sites” via the main navigation menu to view a list of locations with view/edit functionality.  
  * ~~My sites will be removed from the navigation bar.~~   
  * The My sites link will be displayed within the horizontal tab navigation menu when viewing account settings.  
* Locations include all locations/sites ~~and the company business address (as defined in the user's account settings).~~  
  * ~~The company's business address is included within the My Sites list and labelled as “Headquarters”.~~  
    * This will be the only address labelled “Headquarters”.  
  * If the user selects to “View” the details for the headquarters, they will be taken to the site location/details page.  
* There is a button to “View” the site/location details on a dedicated page containing:  
  * “Location name” as the page heading  
  * Sections for:  
    * \<Location name\>  
      * Site point of contact (Prefix, first name, last name)  
      * Position in company  
      * Phone number  
      * Street address  
      * Zip/Postal code  
      * City  
      * County/State/Region  
      * Country  
      * Opening time  
      * Closing time  
    * Materials Accepted  
      * Broken down via Material Type, e.g. Plastics, Fibres.  
    * On-site Facilities  
      * Is there a loading ramp on this site?  
      * Have you got a weightbridge on this site?  
      * Can you load/unload material yourself on this site?  
      * Which container types can you manage on this site?  
      * Do you have any access restrictions?  
      * Site-specific instructions  
    * Licenses/Permits  
      * Which permit/license do you have?  
      * Do you have a waste carrier license?

| Scope: This is an update to an existing US developed in phase 1 (7.6.0.14. (Previously 6.4.8.13) My locations) Modifications or updates are highlighted in yellow. Triggers: The user selects to view My Sites. Acceptance Criteria: Navigation Show “My Sites” in the main navigation. This will direct to the My Sites page within the profile area. Show the “My Sites” as a tab in the horizontal tab navigation within Account Settings. Sites List Currently a list of locations shown as: Location Name Address (Street address, Address line 2, Zip/Postal code, City, County/State/Region, Country) “View” button to open location details Headquarters Logic HQ creation (one-time at registration) If the user selects “Use same address for first site”, the system: Pre-populates the first Site Location with the Business Address values Flags that location as Headquarters (HQ). If the checkbox is not selected, no HQ location is created at registration. My Locations behaviour If a HQ location was created: Show it in My Locations with a single “Headquarters” badge. Only one location may carry the Headquarters badge at any time. If no HQ location was created do not show the Business Address in My Locations. Entity separation (after registration) Business Address (profile) and Site Locations (including HQ) are independent records; pre-population creates no ongoing link. Editing the Business Address does not update any Site Location (including HQ). Editing any Site Location/HQ does not update the Business Address. Selecting “View” for Headquarters opens the site location/details page. Location Details Page “My Sites \> \<Location name\> Detail” as the page heading Sections for: \<Location name\> Site point of contact (Prefix, first name, last name) Position in company Phone number Street address Zip/Postal code City County/State/Region Country Opening time Closing time Materials Accepted Broken down via Material Type, e.g. Plastics, Fibres. On-site Facilities Is there a loading ramp on this site? Have you got a weightbridge on this site? Can you load/unload material yourself on this site? Which container types can you manage on this site? Do you have any access restrictions? Site-specific instructions Licenses/Permits Which permit/license do you have? Do you have a waste carrier license? Controls Back to My Sites Edit Location Postconditions: The user can see a list of their sites/locations.  |
| :---- |

| Design Name | Link |
| :---- | :---- |
| Location details page | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21675-33143\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21675-33143&t=TzDhDk2ScPubsQGI-4) ![][image25] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **~~6.1.7.3. Edit My Site~~**

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~There is a button to “Edit” the site/location details on a dedicated page containing:~~  
  * ~~“Edit My Site” as the page heading~~  
  * ~~“Return to My Sites” navigation button to return to the sites list.~~  
  * ~~Sections for:~~  
    * ~~Site Point Of Contact~~  
      * ~~Prefix~~  
      * ~~First name~~  
      * ~~Last name~~  
      * ~~Position in company~~  
      * ~~Telephone~~  
    * ~~Address~~  
      * ~~Location name~~  
      * ~~Street address~~  
      * ~~Address line 2~~  
      * ~~Zip/Postal code~~  
      * ~~City~~  
      * ~~County/State/Region~~  
      * ~~Country~~  
      * ~~Opening time~~  
        * ~~Default opening time: 8:00~~   
        * ~~Editable text input~~  
      * ~~Closing time~~  
        * ~~Default closing time: 17:00~~  
        * ~~Editable text input~~  
    * ~~Additional Information~~  
      * ~~Materials Accepted~~  
        * ~~Checkboxes~~  
      * ~~Is there a loading ramp on this site?~~  
      * ~~Have you got a weightbridge on this site?~~  
      * ~~Which container types can you manage on this site?~~  
      * ~~Can you load/unload material yourself on this site?~~  
      * ~~Do you have any access restrictions?~~  
      * ~~Site-specific instructions~~  
      * ~~Do you have a license/permit on site?~~  
        * ~~There will be an information tooltip~~  
          * ~~Users can hover over the tooltip to display guidance text:~~  
            * ~~“To trade on WasteTrade, you need to upload key compliance documents based on your operations:~~  
              **~~Environmental Permit~~**~~: Confirms your waste activities meet environmental standards.~~  
              **~~Waste Exemption:~~** ~~For low-risk activities like small-scale recycling or reusing materials.~~  
              **~~Waste Carriers License~~**~~: Required if you transport waste materials.~~  
              **~~Outside the EU?~~**  
              ~~Provide equivalent documentation from your local authority to confirm compliance with your country’s regulations. Upload these documents now to get started and ensure smooth trading on WasteTrade\!”~~  
        * ~~Currently show “Yes” or “Not applicable”~~  
        * ~~“Yes” will show options for “Environmental Permit”, “Waste Exemption”, “Other”~~   
          * ~~These prompt the upload modal or “Other” description field.~~

#### **~~6.1.7.4. Delete Location~~**

* ~~There will be a delete button within the “Edit a location” view~~   
* ~~The system will ask the user to confirm their action:~~  
  * ~~Are you sure you want to delete \<Site location\> from the platform?~~  
* ~~If the user selects yes, then the site will be deleted~~  
* ~~If the user selects no, the user will go back to the edit a location page~~

#### **~~6.1.7.5. Change Password~~** {#6.1.7.5.-change-password}

* ~~This is a change to the password change functionality within the trading platform.~~  
* ~~Currently, the “Change Password” button is visible within the users’ Account Settings, the Personal Information page.~~  
  * ~~Selection triggers a password reset via the forgotten password process.~~  
  * ~~I.e. the user receives the forgotten password email and continues the forgotten password flow.~~  
* ~~Selecting the “Change Password” button must open a modal containing:~~  
  * ~~Form fields for:~~  
    * ~~Current password (required, input type: password).~~  
      * ~~Must match existing authentication credentials.~~  
    * ~~New password (required, input type: password).~~  
    * ~~Confirm new password (required, input type: password).~~  
      * ~~Confirm new password exactly matches New password.~~  
      * ~~New password ≠ Current password; show inline error if identical.~~  
      * ~~Each field includes a show/hide toggle eye icon.~~  
  * ~~Strength indicator~~  
    * ~~The same strength meter used in registration, updating live as the user types the new password (e.g., Weak/Medium/Strong)~~  
  * ~~Save button~~  
    * ~~On selecting to Save:~~  
      * ~~Verify the Current password server-side.~~  
      * ~~If correct and all validations pass, update the password and show success feedback: “Your password has been updated.”~~  
      * ~~If the Current password is incorrect: inline error “Current password is incorrect.”~~

#### **~~6.1.7.6. Company Information~~**

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~Subsections and Content:~~  
  * ~~Company information~~  
    * ~~Company Name~~  
    * ~~Website~~  
    * ~~Company Interest~~   
    * ~~Company Type~~  
    * ~~VAT~~  
    * ~~Company registration number~~  
    * ~~Company description~~  
  * ~~Business address~~  
    * ~~Street address~~  
    * ~~Zip/Postal Code~~  
    * ~~City~~  
    * ~~County/ State/Region~~  
    * ~~Country~~  
    * ~~Company Email~~  
    * ~~Company Telephone~~  
  * ~~Company Social Media accounts~~   
    * ~~Facebook~~   
    * ~~Instagram~~  
    * ~~LinkedIn profile~~  
    * ~~Additional Social Media Field~~  
      * ~~Any valid URL must be rendered as a clickable hyperlink when viewing company information.~~  
        * ~~If the input is not a valid URL, display it as plain text without link formatting.~~  
      * ~~Displayed URLs must be shortened to show only the domain name \+ top-level path.~~  
      * ~~Full URL must remain accessible via the click (opens in a new tab/window).~~  
* ~~Information Symbol for Incomplete Fields:~~  
  * ~~Implement an information symbol (e.g., a tooltip icon) next to any fields that are incomplete or require user attention.~~  
    * ~~A red exclamation mark will indicate missing fields.~~  
  * ~~The symbol should provide a brief explanation or prompt to the user about what needs to be completed.~~  
    * ~~“This field is currently empty.”~~  
* ~~Edit and Update Functionality:~~  
  * ~~Edit buttons are present next to each of the Company Information and Business Address sections~~  
  * ~~Allow users to edit and update their company information easily.~~  
  * ~~Provide 'Save' and 'Cancel' options when editing information to give users control~~ 

#### **~~6.1.7.7. Edit Company Documents~~**

* ~~This is an update to existing functionality within the trading platform; updates are highlighted in yellow.~~  
* ~~There will be a guidance message:~~  
  * ~~“Ensure uploaded documents are up-to-date versions and licence numbers are correct, errors may delay verification (\*Required Field).”~~  
* ~~Modal Window for Editing:~~  
  * ~~Implement a modal window that appears when the 'Edit' button is clicked. This modal should display all available document options that can be edited.~~  
  * ~~The modal should be responsive and accessible on all devices and screen sizes.~~  
* ~~Editable Document Options:~~  
  * ~~Allow users to select or change the type of licence/permit they hold, with options such as Environmental Permit, Waste Exemptions, and Other.~~  
    * ~~For Others, the user can input in the new Other Description text area.~~  
  * ~~Enable users to upload new documents for Waste Exemptions directly from their device.~~  
  * ~~Users must have the option to upload documents directly from their device or via drag-and-drop functionality.~~  
  * ~~Ensure that the upload functionality is intuitive and confirms the successful upload of documents.~~  
  * ~~If 'Other' is selected under permit/licence type, allow users to specify details and provide a corresponding upload option.~~  
  * ~~The user can upload only the following file types:~~  
    * ~~Image formats (.jpeg, .jpg, tiff, .png)~~  
    * ~~PDF document~~  
    * ~~DOCX~~  
    * ~~PPT/Spreadsheets (including CSV) are not acceptable~~  
  * ~~Max file size 25 MB~~  
* ~~Waste Carriers Licence Options:~~  
  * ~~Provide options for users to indicate whether they have a Waste Carriers Licence, with options like 'Yes’ and 'Not applicable'.~~  
  * ~~If the user selects “yes" for the Waste Carriers License~~  
    * ~~Provide the user with the ability to upload a document for this, and provide the expiry date as a mandatory field.~~  
    * ~~If 'Not Applicable' or 'No' is selected, ensure these options are logged and require no further action related to the Waste Carrier Licence.~~  
* ~~Expiry Date Requirement:~~  
  * ~~For all document uploads where an expiry date is applicable (e.g., Environmental Permit, Waste Carrier Licence), provide a field for users to input a future expiry date.~~   
  * ~~Ensure that this field accepts dates in a consistent format (DD/MM/YYYY) and includes date-picker functionality to reduce user error.~~  
* ~~Validation and Confirmation:~~  
  * ~~If the user changes the permit/licence type (radio) after deleting, Save becomes enabled even if no file is present, allowing configuration changes to be saved without documents.~~  
  * ~~Before saving any changes, prompt the user to confirm their selections to prevent accidental modifications. Use a confirmation dialogue box with 'Confirm' and 'Cancel' buttons.~~  
  * ~~Changes should only be saved if the user confirms; otherwise, revert to the previous selections if 'Cancel' is selected.~~  
* ~~Status on any doc change~~  
  * ~~On any documentation change (add, replace, delete, change of permit/licence type, change of “Waste Carrier Licence” choice, or expiry date edit), set the account status to Pending Review automatically.~~  
  * ~~If documents are missing or expired, immediately apply Reduced Access rules ([6.1.7.1](#6.1.7.1.-reduced-access-if-documents-missing/expired)) and display the Account Status Banner indicating pending review/limited access.~~

## **6.2. Haulage Platform** {#6.2.-haulage-platform}

### 6.2.1. Registration {#6.2.1.-registration}

#### **6.2.1.1.  Autosave**

* This reuses logic from [6.1.1.1.](#6.1.1.1.-autosave)   
* The information provided by the client through any of the forms will be saved automatically  
  * Every 5 minutes  
  * When the user moves between sections

| Preconditions: The user is completing a Haulier registration/onboarding form. Triggers: Time-based: every 5 minutes while the user is on any registration form step. Navigation-based: immediately when the user moves between sections/steps of the registration flow. Acceptance Criteria: Save Behaviour Autosave captures all user-entered values on the current registration step, including all fields shown in that step, and persists them as a draft for that user/account. On section change, autosave runs before rendering the destination section so no progress is lost. Time-based autosave runs no more often than once every 5 minutes and no less often than once every 5 minutes while the page is active later. If the user returns to the registration, any fields previously autosaved must pre-populate so the user continues where they left off (aligning with Save/Resume [6.2.1.2](#6.2.1.2.-save/resume)). Validation Registration page field definitions remain unchanged. Autosave must not block on validation errors; it saves the current values (including incomplete/invalid) as “draft.”  Formal validations and blocking errors occur on explicit Submit per registration rules. Impacts on Phase 1: Registration form sections (Phase 1 \- 6.1.1.2): Autosave must cover all fields/sections defined there; no loss of data when moving between those sections. Automatic logout/inactivity (Phase 1 \- 2.1.3): Background autosave must not count as “activity” for the idle timer; only user interactions (typing/clicks) should reset it. CRM integration consistency: Ensure autosave drafts are not pushed to CRM as completed registrations; CRM push occurs only on successful submit Postconditions: After a successful autosave (timer or section change), the user’s in-progress registration exists as an up-to-date draft that can be resumed. A failed autosave does not prevent the user from submitting the registration form.   |
| :---- |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.1.2. Save/Resume**  {#6.2.1.2.-save/resume}

* This reuses logic from [6.1.1.2.](#6.1.1.2.-save/resume)  
* The users will be able to save their progress at any stage  
  * A link will be sent to the user’s email address  
  * Using the link, the user will be able to continue the onboarding form  
  * The link will stay live for 31 days  
* Email copy to be provided by the client

| Preconditions: The user is completing a Haulier registration/onboarding form. A valid email address is available (entered on the form). Triggers: The user clicks “Save & Resume”. Acceptance Criteria: Save behavior Requires an email address. If the email address is invalid/missing display an inline error message “In order to save this draft registration form an email address is needed. Please provide a valid email address”. Clicking Save & Resume Later persists all current inputs on the active step to a draft (even if incomplete or containing validation errors). Save is idempotent per draft; repeated clicks update the same draft (not create new ones). On success (persisted): Show inline confirmation: “Progress saved. We’ve emailed you a link to continue later.” Generate a new resume token and URL; invalidate any previously generated token for this draft immediately. On failure (persistence error): No email is sent. Show blocking error.  Email sending Send exactly one email per successful explicit save action. If the mail service is unavailable: Draft still saves. Show non-blocking warning. Email template: Subject: WasteTrade – Continue Your Registration Body: Hi \<first\_name\>,You’ve saved your registration progress on WasteTrade. Use the link below to continue where you left off.\<resume\_url\>What happens next\- Your link stays active for 31 days.\- You can use it multiple times until you submit your registration.\- If you save again later, we’ll send you a new link and the old one will stop working.Best regards,The WasteTrade Team Link/token rules Each save issues one new token. Only the most recent token is valid. Generating a new token on a later save invalidates the prior token immediately. Token is multi-use until registration form submission or 31-day expiry. Token grants access only to the associated draft; no cross-account access. Resume behavior (via email link) Opening the resume URL routes the user to the registration form, pre-filled with the saved values. The user lands on the single page registration form; fields removed since saving are ignored; new required fields appear empty and will be validated on submit. If the user is not authenticated, the token grants access only to this draft; prompt for sign-in only if/when accessing account-wide areas. Data purge: If no submitted registration exists by the 31-day mark, the draft and its data are not stored (purged). The user must re-do registration. Postconditions: Draft is stored/updated with current inputs. Exactly one active resume link exists per draft; previous links are invalidated on re-save. Users can resume at the saved step with pre-filled data until submission or 31-day expiry. Upon expiry (and no submission), draft is purged; resume is no longer possible.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Failure to Save | “We couldn’t save your progress. Please try again.” |
| Email send failure | “Saved, but we couldn’t send the email. Please try again.” |
| Invalid email link | “This link is invalid. Please restart the registration process.” |
| Expired email link | “This link is expired. Please restart the registration process.” |

| Design Name | Link |
| :---- | :---- |
| Save & Resume | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21946-29866\&t=hEc5kX0tITAQtdG6-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21946-29866&t=hEc5kX0tITAQtdG6-4) ![][image26] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **~~6.2.1.3. VAT Number Lookup~~**

* ~~This reuses logic from [6.1.1.3.](#6.1.1.3.-vat-number-lookup)~~  
* ~~The system will utilise the VAT sense API ([7.1.0.2](#7.1.0.2-vat-sense)) to look up company details based on the VAT number entered during registration ([6.2.1.5](#6.2.1.5.-haulage-registration-form)) or when editing profile details ([6.2.4.2](#6.2.4.2.-edit-profile))~~  
* ~~When the user selects “EU” or “UK” for Country of VAT registration and enters the company VAT number, the system will pull company details via the VAT Sense API.~~  
  * ~~If the user selects “Other” Country of VAT registration, no lookup is performed.~~  
* ~~The following company details will be pulled and pre-populated into relevant fields:~~  
  * ~~Company Registration Number~~  
  * ~~Company name~~  
  * ~~Street Address~~  
  * ~~Postcode~~  
  * ~~City~~  
  * ~~County/State/Region~~  
  * ~~Country~~  
* ~~Fields will remain editable.~~

#### **~~6.2.1.4. Book 1:1 Call~~**

* ~~Reuses logic from [6.1.1.4](#6.1.1.4.-book-1:1-call).~~  
* ~~The user will be presented with a support message on the following pages:~~  
  * ~~Registration~~   
  * ~~Complete account~~  
  * ~~Upload Documents~~  
  * ~~Complete account~~  
* ~~The message will display:~~  
  * ~~“Need some help? Visit our resources page for guidance, or book a 1:1 call with one of our team.”~~  
    * ~~There will be a link to open the resources page ([6.3.1.1](#6.3.1.1.-resources-page)) in a new tab.~~  
    * ~~The user can select the book 1:1 call link to open the Wastetrade Calendly in a new web page.~~  
      * ~~Calendly invites will be managed offline by the client.~~

#### **~~6.2.1.5. Haulage Registration Form~~** {#6.2.1.5.-haulage-registration-form}

* ~~The form should include distinct sections for Basic Details, Company Details, Additional Information, Document Uploads, and Declaration.~~  
  * ~~Each section must contain the following fields with specified validations:~~  
    * ~~Basic Details: Prefix, First Name, Last Name, Job Title, Phone Number, Email (designated as the organisation admin), and Confirm Email, Password and Confirm Password.~~  
      * ~~Prefix: Drop Down menu with values Dr., Miss, Mr., Mrs., Ms., Mx., Prof., Rev.~~  
      * ~~First name: Placeholder text “e.g. Mark”~~  
      * ~~Last name: Placeholder text “e.g. Smith”~~  
      * ~~Job title: Placeholder text “Type here”~~  
      * ~~Email & Confirm Email Address: “sample@gmail.com”~~  
      * ~~Password & Confirm Password: “Type here”~~  
        * ~~Password field has strength validation (weak, medium, strong):~~	  
          * ~~Weak Password:~~  
            * ~~Password meets the minimum requirement of 8 characters.~~  
            * ~~Uses only one type of character (only lowercase letters or only numbers).~~  
            * ~~Does not contain special characters.~~  
            * ~~Example:  "password1" or "abc12345", etc~~  
          * ~~Medium Password:~~  
            * ~~Length between 8 to 11 characters~~  
            * ~~Combines at least two different types of characters (lowercase letters, numbers, uppercase letters, or special characters).~~  
            * ~~Does not contain easily guessable words or simple character sequences.~~	  
          * ~~Strong Password:~~  
            * ~~Length of 12 characters or more.~~  
            * ~~Combines at least three different types of characters (lowercase letters, numbers, uppercase letters, and special characters).~~  
            * ~~Does not contain easily guessable words or common character sequences.~~  
            * ~~Regularly changed and not reused from previous passwords.~~  
    * ~~Both the Password and Confirm Password fields must include an eye icon that allows the user to toggle between showing and hiding the entered text~~  
      * ~~When the eye icon is clicked:~~  
        * ~~If the password is currently hidden, it should become visible.~~  
        * ~~If the password is currently visible, it should become hidden.~~  
      * ~~This functionality must be consistent with the current implementation on the site.~~  
    * ~~Company Details: Company Name (Placeholder text: “Type here”), Country of VAT Registration (with options: EU, UK, Other), Company VAT number, Company registration number, Street Address, Postcode, City, County/State/Region, Country (dropdown menu with predefined options), Telephone, Mobile (including pre-fix dropdown options e.g. \+44).~~  
    * ~~Additional Information:~~   
      * ~~Fleet Type (Options: Freight Forwarder, Own Fleet),~~   
      * ~~Areas Covered (options: UK Only, Within EU, Worldwide). If ‘Within EU’ is checked, the list of EU countries' checkboxes will display.~~  
        * ~~There will be a button to “Select all”.~~  
      * ~~Container Types (Options: Shipping Container, Curtain Sider (High Cube), Curtain Sider (Standard), Walking Floor)~~  
        * ~~There will be a button to “Select all”.~~  
    * ~~Document Uploads: Waste Carrier Licence (with functionality to upload from the device (including mobile device) or drag and drop a file), provision to enter the expiry date of the licence.~~  
      * ~~There will be a guidance message:~~  
        * ~~“Ensure uploaded documents are up-to-date versions and licence numbers are correct, errors may delay verification (\*Required Field).”~~  
      * ~~Users can select an option from:~~  
        * ~~“Waste Carrier License”~~  
          * ~~If “Yes” is selected, prompt the user to upload the Waste Carrier Licence and provide the expiry date as mandatory fields.~~  
        * ~~“Not Applicable”~~  
          * ~~If “Not Applicable” is selected, no further action is required.~~  
      * ~~There will be an information tooltip next to the “Waste Carrier License” title~~  
        * ~~Users can hover over the tooltip to display guidance text:~~  
          * ~~“To trade on WasteTrade, you need to upload key compliance documents based on your operations:~~  
            ~~A **Waste Carriers License** is required if you transport waste materials.~~  
            **~~Outside the EU?~~** ~~Provide equivalent documentation from your local authority to confirm compliance with your country’s regulations.~~   
            ~~Upload these documents now to get started and ensure smooth trading on WasteTrade\!”~~  
    * ~~Where did you hear about us?: A dropdown menu with predefined options.~~  
    * ~~Declaration: A checkbox for "I accept the T\&Cs and Privacy Policy by joining WasteTrade".~~  
* ~~Form Submission and User Feedback:~~  
  * ~~A "Create Account" button must be clearly visible and active only when all mandatory fields are filled, and the declaration checkbox is checked.~~  
  * ~~Upon successful submission, users should receive a confirmation message and/or be redirected to a confirmation page/dashboard.~~  
  * ~~Error messages should be clear and displayed near the respective fields. Errors should specify the exact issue (e.g., invalid email format, mandatory field left blank).~~  
* ~~Document Management:~~  
  * ~~The system must verify the format and size of uploaded documents up to the maximum file size of 25 MB; only PDF and standard image formats are allowed~~  
  * ~~Notifications for nearing the expiry date of uploaded licences should be automated as per the expiry date provided.~~

#### **~~6.2.1.6.  Autocomplete Haulier Registration Form~~** 

* ~~Reuses logic from trading platform [6.1.1.6.](#6.1.1.6.-autocomplete-registration-form)~~  
* ~~As a new user, I want the registration form to support device/browser autofill so I can complete sign-up faster and with fewer typing errors.~~  
  * ~~The registration page lets users autofill the following fields using details saved on their device/browser:~~  
    * ~~First name~~  
    * ~~Last name~~  
    * ~~Telephone~~  
    * ~~Email~~  
    * ~~Street Address~~  
    * ~~Postcode~~  
    * ~~City~~  
    * ~~County/State/Region~~  
    * ~~Country~~  
  * ~~When a user taps/clicks a field, their device can offer saved info to fill it~~  
    * ~~The user can accept or ignore these suggestions.~~  
    * ~~Autofill is optional \- users can edit any prefilled value.~~  
  * ~~Standard field validations still apply after autofill.~~  
    * ~~Validations and displayed errors still apply to autofilled fields.~~

### 6.2.2. Haulage Homepage {#6.2.2.-haulage-homepage}

#### **6.2.2.1. Haulage Homepage Layout**

* The page will have the following elements  
  * Header  
  * Menu (sidebar)  
    * Available loads ([6.2.2.2](#6.2.2.2.-view-available-loads))  
    * Current offers ([6.2.3](#6.2.3.-my-haulage-offers))  
    * ~~Profile ([6.2.4](#6.2.4.-haulier-profile))~~

| Preconditions: A Haulier user is authenticated and viewing the Haulier platform. Triggers: The Haulier is viewing the Haulier platform. The Haulier selects the menu. Acceptance Criteria: Menu Layout and Accessibility: The trading platform must feature a side bar menu that is easily accessible from all main interfaces of the platform. This menu should be intuitive to use, with a clear icon indicating its presence and functionality. Header Content Header functionality for profile ([6.2.4](#6.2.4.-haulier-profile))/notifications ([6.2.5](#6.2.5.-haulier-notifications))/language is defined in phase 1 (7.6.0.24. (Previously 6.7.1.2) Master page header). Buy/Sell/Wanted should not be shown in the Haulier header. Menu Content: The menu must include the following items, each leading to the respective sections of the platform: Available Loads ([6.2.2.2](#6.2.2.2.-view-available-loads)) This is the default page displayed upon login. Current Offers ([6.2.3.1](#6.2.3.1.-view-my-haulage-offers)) The menu must be fixed to the page i.e. as the user scrolls the menu items should always be visible. Postconditions: Haulier users can successfully navigate the Haulier platform.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Failed navigation from menu | "Error navigating to the requested section. Please try again." |
| Access denied to a section | "You do not have access to this section. Please contact support if this is an error." |
| Loading error for a menu item | "Failed to load the requested content. Please refresh the page or try again later." |

| Design Name | Link |
| :---- | :---- |
| Haulier layout | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-68624\&t=agaM0kh6K9gZbJyL-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-68624&t=agaM0kh6K9gZbJyL-4) ![][image27] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.2.2. View Available Loads** {#6.2.2.2.-view-available-loads}

* There will be a table that allows the user to view all the loads available for bidding  
* The table will have the following columns  
  * Material name  
  * Pick up location  
  * Destination  
  * Packaging  
  * Number of loads  
  * Quantity per load  
  * Haulage total (per load x number of loads)  
  * Delivery window  
* There will be a button that allows the user to make an offer

| Preconditions: The user is authenticated as a Haulier. Triggers: The Haulier selects to view Available Loads. Acceptance Criteria: Data Available loads are populated when an Admin approves a buyer bid on a sales listing. i.e. when a load is “sold” to a buyer. Layout The hauler will see a breakdown of available loads for bidding. Layout will replicate existing UI from phase 1\.  The page will display a total of 10 results before pagination.  Contents Material name Packaging Pick up location Destination No. of Loads Quantity per Load (MT) Haulage total Delivery window “Make an offer” button ([6.2.2.5](#6.2.2.5.-make-an-offer)) Postconditions: The Haulier will view all available loads.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| No results | “There are no loads available right now. Please check back later.” |
| Table load error | “We couldn’t load the available loads. Please refresh the page or try again later.” |

| Design Name | Link |
| :---- | :---- |
| Available loads | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-66775\&t=Cl8KNyhNAyvchX8x-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-66775&t=Cl8KNyhNAyvchX8x-4) ![][image28] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### 

#### **6.2.2.3. Search Available Loads**

* The table will be searchable  
* The user will be able to search by material name, packaging type, and locations (pickup/destination)  
* Submit behaviour must also occur after the user selects “enter”.

| Preconditions: The Haulier is viewing the available loads. Triggers: The user types in the search box. Acceptance Criteria: Layout Above the available loads table will be a search bar. Placeholder text: “What are you looking for?” Searchable fields: Material name Material type Material item Packaging Pick up location Destination Container type Input & submission: Single search box Pressing Enter submits the search (same as clicking Search). Trailing/leading spaces are trimmed; search is case-insensitive. Behavior: Submitting search resets pagination to page 1\. Search term persists in the input until cleared. Search and filters work together (AND), i.e., results must match both the query and active filters. Postconditions: The table displays loads matching the active search.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Failed to load search results | "Failed to load results. Please check your connection and try again." |
| No search results | "No results found. Please adjust your search criteria." |

| Design Name | Link |
| :---- | :---- |
| Search bar | ![][image29][https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-66775\&t=agaM0kh6K9gZbJyL-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-66775&t=agaM0kh6K9gZbJyL-4)  |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.2.4. Filter Available Loads**

* The table will be filterable  
* The user will be able to filter on the following parameters  
  * Pickup location (countries)  
    * Dropdown with options for:   
      * UK  
      * all EU countries  
      * Worldwide (select/deselect all)  
        * The default selection of areas covered is defined during registration or in the Haulier profile.  
  * Destination (countries)  
    * Dropdown with options for:   
      * UK  
      * all EU countries  
      * Worldwide (select/deselect all)  
        * The default selection of areas covered is defined during registration or in the Haulier profile.  
  * Container types  
    * Shipping Container  
    * Curtain Sider (High Cube)  
    * Curtain Sider (Standard)  
    * Walking Floor  
      * The default selection of container types is defined during registration or in the Haulier profile.  
  * Delivery window  
    * Date range picker  
    * Corresponds to earliest/latest delivery dates  
  * Materials:   
    * Material type  
      * Always shows options for Plastic, EFW, Fibre, Rubber, Metal  
    * Item   
      * Conditionally displays “Items” options based on the Material type.  
      * Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)  
    * Packing  
      * Will always display the same options   
        * Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)  
* Submit behaviour must also occur after the user selects “enter”.

| Preconditions: The Haulier is viewing the available loads. Triggers: The selects to filter available loads. Acceptance Criteria: Layout Above the available loads table will be a filters button. Selecting this will open the filter panel. Filters Material  Type Item Packaging Pick up location Destination Delivery window Behaviour Each change does not auto-submit; the user clicks Apply or presses Enter to submit. Pressing Enter while focus is within any filter control applies the current filter set. “Clear” filters returns all controls to their defaults and reloads results Postconditions: The table displays loads matching the active filters.  |
| :---- |

| Field  | Data Dictionary |
| :---- | :---- |
| Material type  | Dropdown. Multiselect checkboxes. Plastic/EFW/Fibre/Rubber/Metal. Default: all selected. Optional.  |
| Item | Dropdown: Options depend on Type of Material selected,  Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Default: all selected. Optional.  |
| Packing | Will always display the same options,  Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Default: all selected. Optional.  |
| Pick up  | Dropdown. Options: UK, all EU countries, Worldwide. Default: “Areas your company can cover” selection during Haulier registration. Optional. |
| Destination | Dropdown. Options: UK, all EU countries, Worldwide. Default: “Areas your company can cover” selection during Haulier registration. Optional. |
| Delivery Window | Date range picker. Today or future dates only, disable past date selection. Optional.  |

| Use Case | Error Message |
| :---- | :---- |
| Invalid date range | “The end date must be the same as or after the start date.” |
| Failed to load search results | "Failed to filter results. Please check your connection and try again." |
| No search results | "No results found. Please adjust your filter criteria." |

| Design Name | Link |
| :---- | :---- |
| Filter available loads | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-73673\&t=Cl8KNyhNAyvchX8x-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-73673&t=Cl8KNyhNAyvchX8x-4) ![][image30] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.2.5. Make an Offer** {#6.2.2.5.-make-an-offer}

* The user will be able to make a haulage offer on an “Available Load”.  
* The user will be able to see the Load Details  
  * There will be a Seller card, providing the following information  
    * User ID, pickup location, average weight per load, material type, packaging, container type, loading times, site restrictions  
  * There will be a Buyer card, providing the following information  
    * User ID, destination location, site restrictions, loading times, desired delivery window, and number of loads bid on  
* The user will provide the following details to make a bid:  
  * Trailer/container type  
  * Are you completing Customs clearance?  
    * Note there will be a message: “Note: If not, WasteTrade will handle Customs Clearance for a fixed fee of £200 or currency equivalent. This will be added to the Haulage Total”  
    * The user will input customs clearance per load, not as the total.  
  * Currency  
  * Number of loads \- not editable, view only  
  * Quantity per load (MT) \- not editable, view only  
  * Haulage cost per load  
    * Note: Please include the Weighbridge price if required  
  * Haulage total   
    * Automatic calculation (cost per load x number of loads)  
  * Transport provider  
    * Own haulage, third party, mixed  
  * Suggested collection date  
  * Expected transit time (drop-down selection)  
  * Demurrage and destination (days)  
    * Guidance text: “Please note this must be a minimum of 21 days.”  
    * Input of 20 days or less will prevent validation and display an appropriate error message.  
  * Notes  
    * Free text box  
    * This free text should not allow telephone numbers, email addresses or URLs.  
* The user will be able to submit the bid  
  * After submitting the bid, it will go to the Admin team for review 

| Preconditions: The user is authenticated as a Haulier. Triggers: The user selects to “Make an offer” from the available loads table ([6.2.2.2](#6.2.2.2.-view-available-loads)). Acceptance Criteria: Only approved Hauliers will be able to “Make an Offer”. A haulier must be “Approved” by Admin (Phase 1 \- 6.6.2.7 Member approval \- approval actions) in order to make an offer. For unapproved hauliers, the button will be disabled with the tooltip: “Your account is being verified by an administrator. You will be unable to make an offer until approved. If you need support, please contact the WasteTrade team at support@wastetrade” Selecting to “Make an offer” will open the offer page with sections for: Seller Card (Read-only) Seller User ID Pickup location (City, Country) Loading times (site hours if provided) Container types Site restrictions (if any) Material name Material item, type, packaging Average weight per load (MT)  Incoterms Buyer Card (Read-only) Buyer User ID Destination location Site restrictions (if any) Loading times (if provided) Container types Desired delivery window (dd/mm/yyyy \- dd/mm/yyyy) Number of loads bid on Incoterms Haulage Bid Information (Haulier-provided unless stated) Trailer/Container Type Options not applicable to this Haulier (per registration/profile) are greyed out/disabled. Tooltip on disabled options: “Only container types associated with your Haulier profile are enabled here. To update your container options please update your profile.” Are you completing Customs clearance?  Guidance text: “Note: If not, WasteTrade will handle Customs Clearance for a fixed fee of £200 or currency equivalent. This will be added to the Haulage Total.” Checkbox Per-load logic: fee is applied once per offer (flat £200) only if the checkbox is not selected (i.e., the Haulier is not handling customs). Number of loads  Read-only Haulier must bid on the total number of loads from the Buyer. Quantity per load (MT)  Read-only Haulage cost per load Guidance text: “Note: Please include the Weighbridge price if required.” Currency Display/total shows in selected currency; the £200 customs fee text is fixed in UI copy but the amount applied must be currency-consistent with the offer. Haulage total Read-only Automatically calculated: (Haulage cost per load × number of loads) \+ customs fee If “Are you completing Customs Clearance?” \= Yes, customs fee \= 0 If “Are you completing Customs Clearance?” \= No, customs fee \= £200 or EUR/USD equivalent. Recalculate live on any relevant change. Transport provider Suggested collection date Must be within the Buyer’s Earliest/Latest delivery window (defined Phase 1 \- 6.4.1.2 Bidding on a Listing). All dates outside the Buyer’s window are blocked/disabled in the picker. Expected transit time Demurrage at destination (days) Guidance text: “Note: This must be a minimum of 21 days.” Notes Submit Flow On submit: The system validates input fields. If validation fails displays inline errors. If successful:  Create Haulage Offer and route to Admin review ([6.4.1.12](#6.4.1.12.-view-haulage-bids)). Show confirmation: “Your haulage offer has been submitted for review.” Direct the Haulier to view an updated “Current Offers” page ([6.2.3.1](#6.2.3.1.-view-my-haulage-offers)).  Postconditions: A new Haulage Offer is created with the provided details and sent to Admin for review ([6.4.1.12](#6.4.1.12.-view-haulage-bids)).  |
| :---- |

| Field  | Data Dictionary |
| :---- | :---- |
| Trailer/Container Type | Dropdown: options Curtain Sider, Containers, Tipper Trucks, Walking Floor; options not in the Haulier’s profile are disabled/greyed with tooltip. Mandatory. |
| Are you completing Customs clearance? | Checkbox. Optional.  |
| Haulage cost per load | Text. Numeric input. Max 15 characters. Mandatory. |
| Currency | Dropdown. Options: GBP, EUR, USD. Mandatory. |
| Transport Provider | Radio buttons. Options: Own haulage, Third party, Mixed. Mandatory.  |
| Suggested collection date | Date picker. Must fall within the Buyer delivery window, dates outside this window are disabled. Mandatory. |
| Expected transit time (days) | Dropdown. Options: 1, 2-3, 4-5, 6-7, 8-10, 11-14. Mandatory. |
| Demurrage at destination (days) | Text. Numeric input. Must be greater than 20\. Mandatory. |
| Notes | Free text. Alphanunumeric input. Does not allow telephone numbers, email addresses or urls. Max characters 32000\. Optional. |

| Use Case | Error Message |
| :---- | :---- |
| Offer page load failure | “We couldn’t load the offer form. Please refresh and try again.” |
| Load becomes unavailable between form open and submit | “This load is no longer available for offers.” |
| Required fields missing | “Some required information is missing. Please complete the highlighted fields.” |
| Invalid formats present | “Some entries are not in the correct format. Please correct the highlighted fields.” |
| Demurrage less than 21 days | “Demurrage must be at least 21 days.” |
| Submit failure | “We couldn’t submit your offer right now. Please try again. If the problem persists, contact support.” |

| Design Name | Link |
| :---- | :---- |
| Make an Offer | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21744-74396\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21744-74396&t=TzDhDk2ScPubsQGI-4) ![][image31] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **~~6.2.2.6. Display Incoterms~~**

* ~~The Haulier will view the Haulier destination charge depending on the incoterms of the load.~~  
* ~~The incoterms (and associated location if applicable) and associated costs should be displayed for each available load in the Haulier dashboard.~~  
  * ~~The incoterm category for loads is defined in the trading platform when creating a haulage listing.~~   
  * ~~Specific incoterms will display [specific costs](https://guidedimports.com/blog/what-are-incoterms-chart/):~~  
    * ~~Cost and Freight (CFR): The Seller pays for transportation to the destination port, export formalities, and loading the goods onto a vessel. The Buyer pays for unloading and onward transportation at the destination port.~~  
    * ~~Free on Board (FOB): The Seller delivers the goods to a vessel and pays for all costs until they are loaded on the vessel. The Buyer pays for all subsequent costs.~~  
    * ~~Delivered Duty Paid (DDP): The Seller pays for transportation, insurance, and customs duties or taxes. The Buyer does not have to pay any additional financial burden to collect the goods.~~  
    * ~~Delivered at Place (DAP): The Seller pays for the main carriage but is not responsible for customs clearance. The Buyer pays for import duties, taxes, and customs clearance fees.~~

### 6.2.3. My Haulage Offers {#6.2.3.-my-haulage-offers}

#### **6.2.3.1. View My Haulage Offers** {#6.2.3.1.-view-my-haulage-offers}

* There will be a table that allows the user to view all the loads available that they have bid on  
* The table will have the following columns  
  * Material name  
  * Pick up location  
  * Destination  
  * Packaging  
  * Number of loads  
  * Quantity per load  
  * Haulage total (per load x number of loads)  
  * Delivery window  
  * Offer status  
  * Bid state  
* Clicking on “View Details” will lead the user to the details page for the haulage bid

| Preconditions: The user is authenticated as a Haulier. Triggers: The Haulier selects to view Current Offers. Acceptance Criteria: Layout The page will replicate the UI of the available loads page ([6.2.2.2](#6.2.2.2.-view-available-loads)), but tailored to only show loads the Haulier has made an offer on. i.e. Remove the button to “Make an offer”, show a button for “View Details” and add an additional field for Offer Status. Contents Material name Packaging Pick up location Destination No. of Loads Quantity per Load (MT) Haulage total Delivery window Offer status “View Details” button ([6.2.3.2](#6.2.3.2.-view-haulage-offer-details)) Postconditions: The Haulier will view all loads they have made an offer on.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| No results | “You have not made any offers yet. Please view the available loads.” |
| Table load error | “We couldn’t load your offers. Please refresh the page or try again later.” |

| Design Name | Link |
| :---- | :---- |
| Haulage Offers | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21847-111497\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21847-111497&t=TzDhDk2ScPubsQGI-4)  ![][image32] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.3.2. View Haulage Offer Details** {#6.2.3.2.-view-haulage-offer-details}

* The user will be able to view the following details about bids which have been made  
  * The user will be able to see the ~~Load~~ Details  
    * There will be a Seller card, providing the following information  
      * User ID, pickup location, the average weight per load, material type, packaging, container type, loading times, and site restrictions  
    * There will be a Buyer card, providing the following information  
      * User ID, destination location, site restrictions, loading times, desired delivery window, and number of loads bid on  
  * The following details will be visible (replicate the current view within the website)  
    * Bid state  
    * Status  
    * Trailer/container type  
    * Are you completing Customs clearance

      Note there will be a message: “If No, WasteTrade will handle Customs Clearance for a fixed fee of £200. This will be added to the Haulage Total.”

    * Currency  
    * Number of loads \- not editable, view only  
    * Quantity per load (MT) \- not editable, view only  
    * Haulage cost per load  
      * Note: Please include the Weighbridge price if required  
    * Haulage total   
      * Automatic calculation (cost per load x number of loads)  
    * Transport provider  
      * Own haulage, third party, mixed  
    * Suggested collection date  
    * Expected transit time (drop-down selection)  
    * Demurrage and destination (days)  
    * Notes  
      * Free text box

| Preconditions: The user is authenticated as a Haulier. The Haulier has made an offer on an available load. Triggers: The Haulier selects to view details of an offer from Current Offers ([6.2.3.1](#6.2.3.1.-view-my-haulage-offers)). Acceptance Criteria: Data Data in all sections is read-only and matches the submitted offer ([6.2.2.5](#6.2.2.5.-make-an-offer)) and load information ([6.2.2.2](#6.2.2.2.-view-available-loads)). Page layout & sections Summary banner Haulage total Seller Card  Seller User ID Pickup location (City, Country) Loading times (site hours if provided) Site restrictions (if any) Container types Material name Material item, type, packaging Average weight per load (MT)  Incoterms Haulage Card Bid State Status Accepted Rejected Pending Container type Customs clearance (Yes/No) Tooltip displays: “If No, WasteTrade will handle Customs Clearance for a fixed fee of £200. This will be added to the Haulage Total” Currency Number of loads  Quantity per load (MT)  Haulage cost per load Tooltip displays: “Weighbridge price to be included, if required” Transport provider Suggested collection date Expected transit time Demurrage at destination (days) Notes  Buyer Card Buyer User ID Destination location Site restrictions (if any) Loading times (if provided) Container types Desired delivery (Earliest / Latest) Number of loads bid on Incoterms Load Details (Shown only for accepted offers) The system will show a load details card per load within a haulage offer i.e. if there are 3 loads, 3 load detail cards will be shown. Load number X of X  e.g. 1 of 3 Collection date When was the load picked up Pulled from SF OR marked by the seller (Not in scope \- [6.1.4.1](#6.1.4.1.-mark-offer-“pickup-confirmed”)) Shipped date  When was the load marked as shipped Pulled from SF OR marked by admin [6.4.1.17.](#6.4.1.17.-mark-listing-as-shipped) Gross weight Pulled from SF OR marked by the seller (Not in scope \- [6.1.4.1](#6.1.4.1.-mark-offer-“pickup-confirmed”)) Pallet weight Pulled from SF OR marked by the seller (Not in scope \- [6.1.4.1](#6.1.4.1.-mark-offer-“pickup-confirmed”)) Withdraw  There will be an option to withdraw the offer if it has not yet been accepted. If the offer has been accepted, the button will be disabled. Tooltip on disabled options: “You cannot withdraw an offer that has already been accepted. If you have an issue, please contact support@wastetrade.com.” Postconditions: The Haulier will view details of a load they have made an offer on.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Details page load failure | “We couldn’t load the load details page. Please refresh and try again.” |

| Design Name | Link |
| :---- | :---- |
| Offer Details \- Accepted | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21849-114357\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21849-114357&t=TzDhDk2ScPubsQGI-4) ![][image33] |
| Offer Details \- Rejected | ![][image34] |
| Offer Details \- Pending | ![][image35] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.3.3. Edit Haulage Offer**

* The Admin will be able to allow the user to amend their bid, but only if the Admin has not approved the offer yet.  
* In this case, the user will be able to edit the following fields  
  * Trailer/container type  
  * Are you completing Customs clearance?  
    * Note there will be a message: “If not, WasteTrade will handle Customs Clearance for a fixed fee of £200. This will be added to the Haulage Total”  
  * Currency  
  * Haulage cost per load  
    * Note: Please include the Weighbridge price if required  
  * Haulage total   
    * Automatic calculation (cost per load x number of loads)  
  * Suggested collection date  
  * Expected transit time (drop-down selection)  
  * Demurrage and destination (days)  
  * Notes  
* On submitting the edited bid, it will go back to the WasteTrade Admin team for review

| Preconditions: The user is authenticated as a Haulier. The Haulier has made an offer on an available load. Triggers: The Haulier is viewing the offer details page ([6.2.3.2](#6.2.3.2.-view-haulage-offer-details)). The user selects an “Edit Offer”. Acceptance Criteria: Navigation An “Edit Offer” button will be visible on the offer details page. If the offer is “Approved”, the button will be disabled with a tooltip message: “This offer cannot be edited because it has been approved. If you need to edit this offer, please contact support@wastetrade.com.” Selecting the button opens the make an offer page ([6.2.2.5](#6.2.2.5.-make-an-offer)) pre-filled with the Hauliers existing input when they originally submitted the offer. Behaviour The Haulier may edit the same fields as the make an offer page ([6.2.2.5](#6.2.2.5.-make-an-offer)). Trailer/Container Type Options not applicable to this Haulier (per registration/profile) are greyed out/disabled. Tooltip on disabled options: “Only container types associated with your Haulier profile are enabled here. To update your container options please update your profile.” Are you completing Customs clearance?  Guidance text: “If not, WasteTrade will handle Customs Clearance for a fixed fee of £200. This will be added to the Haulage Total.” Checkbox Per-load logic: fee is applied once per offer (flat £200) only if the checkbox is not selected (i.e., the Haulier is not handling customs). Number of loads  Read-only Haulier must bid on the total number of loads from the Buyer. Quantity per load (MT)  Read-only Haulage cost per load Guidance text: “Note: Please include the Weighbridge price if required.” Currency Display/total shows in selected currency; the £200 customs fee text is fixed in UI copy but the amount applied must be currency-consistent with the offer. Haulage total Read-only Automatically calculated: Haulage cost per load × number of loads) \+ customs fee If “Are you completing Customs Clearance?” \= Yes, customs fee \= 0 If “Are you completing Customs Clearance?” \= No, customs fee \= £200 of EUR/USD equivalent. Recalculate live on any relevant change. Transport provider Suggested collection date Must be within the Buyer’s Earliest/Latest delivery window (defined Phase 1 \- 6.4.1.2 Bidding on a Listing). All dates outside the Buyer’s window are blocked/disabled in the picker. Expected transit time Demurrage at destination (days) Guidance text: “Note: This must be a minimum of 21 days.” Notes Submit Flow On submit: The system validates input fields. If validation fails displays inline errors. If successful:  Amend Haulage Offer and route to Admin review ([6.4.1.12](#6.4.1.12.-view-haulage-bids)). Show confirmation: “Your haulage offer has been re-submitted for review.” Direct the Haulier to view an updated “Current Offers” page ([6.2.3.1](#6.2.3.1.-view-my-haulage-offers)).  Postconditions: An amended Haulage Offer is created with the updated details and re-sent to Admin for review ([6.4.1.12](#6.4.1.12.-view-haulage-bids)).  |
| :---- |

| Field  | Data Dictionary |
| :---- | :---- |
| Trailer/Container Type | Dropdown: options Curtain Sider, Containers, Tipper Trucks, Walking Floor; options not in the Haulier’s profile are disabled/greyed with tooltip. Mandatory. |
| Are you completing Customs clearance? | Checkbox. Optional.  |
| Haulage cost per load | Text. Numeric input. Mandatory. |
| Currency | Dropdown. Options: GBP, EUR, USD. Mandatory. |
| Transport Provider | Radio buttons. Options: Own haulage, Third party, Mixed. Mandatory.  |
| Suggested collection date | Date picker. Must fall within the Buyer delivery window, dates outside this window are disabled. Mandatory. |
| Expected transit time (days) | Dropdown. Options: 1, 2-3, 4-5, 6-7, 8-10, 11-14. Mandatory. |
| Demurrage at destination (days) | Text. Numeric input. Must be greater than 20\. Mandatory. |
| Notes | Free text. Alphanunumeric input. Does not allow telephone numbers, email addresses or urls. Max characters 32000\. Optional. |

| Use Case | Error Message |
| :---- | :---- |
| Edit offer page load failure | “We couldn’t load the edit offer form. Please refresh and try again.” |
| Load becomes unavailable between form open and submit | “This load is no longer available for offers.” |
| Required fields missing | “Some required information is missing. Please complete the highlighted fields.” |
| Invalid formats present | “Some entries are not in the correct format. Please correct the highlighted fields.” |
| Demurrage less than 21 days | “Demurrage must be at least 21 days.” |
| Submit failure | “We couldn’t submit your offer right now. Please try again. If the problem persists, contact support.” |

| Design Name | Link |
| :---- | :---- |
| Edit Haulage Offer | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21849-115080\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21849-115080&t=TzDhDk2ScPubsQGI-4) ![][image36] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.3.4. View Documents for Accepted Haulage Offers**

* Once a bid has been accepted, the Haulier-specific document will be generated  
* The user will be able to view the following information for each document  
  * Material  
    * Links to open listing page as a new tab in the default browser.  
  * Title  
  * Description  
* The user will be able to download the documents from the Current Offers table.  
* Document list TBC by client

### 6.2.4. Haulier Profile {#6.2.4.-haulier-profile}

#### **6.2.4.1. Haulier Profile**

* The My Profile section displays the user’s personal information gathered during registration.  
  * Prefix  
  * Name   
    * First  
    * Last  
  * Job title  
  * Phone number  
  * Email address  
  * Company name  
  * Country of VAT registration  
  * Company VAT number  
  * Company address  
    * Street address, City, County/State/Region, Country, Postcode  
  * Company Phone  
    * Country code, Telephone, Mobile  
  * Fleet Type  
  * Areas covered (including countries if EU selected)  
  * Container types  
  * Waste carrier license  
    * View/Add/Remove document functionality  
    * Expiry date  
* The user will also see an edit button, allowing them to edit the profile.  
* There will also be a “Change Password” button (reuses logic from [6.1.7.5](#6.1.7.5.-change-password))

| Preconditions: The user is authenticated as a Haulier.  Trigger: The Haulier selects to view their profile. Acceptance Criteria: Ensure the 'My Profile' section clearly displays the user's information including: Basic Details:  Account ID Prefix First Name Last Name Job Title Email Telephone Company Details:  Company Name  Country of VAT Registration VAT number Company registration number Street Address Postcode City County/State/Region Country  Telephone Mobile Additional Information:  Fleet Type  Areas Covered  Container Types  Waste Carrier License  File name Expiry date Socials Facebook  Instagram  LinkedIn  X username (without @) All social URLs shown as clickable hyperlinks. Information Symbol for Incomplete Fields: Implement an information symbol (e.g., a tooltip icon) next to any fields that are incomplete or require user attention. A red exclamation mark will indicate missing fields. The symbol should provide a brief explanation or prompt to the user about what needs to be completed. “This field is currently empty.” Postconditions: The Haulier will view their most recently saved profile information.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Profile page load failure | “We couldn’t load the profile page. Please refresh and try again.” |

| Design Name | Link |
| :---- | :---- |
| Haulier profile | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21744-77850\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21744-77850&t=TzDhDk2ScPubsQGI-4) ![][image37] |

| Client Approved | yes |
| :---- | :---- |

#### 

#### **6.2.4.2. Edit profile** {#6.2.4.2.-edit-profile}

* The user will arrive at the edit profile screen after selecting to “Edit” their profile.  
* All of the following will become editable on the page  
  * Name   
    * First  
    * Last  
  * Prefix  
  * Name   
    * First  
    * Last  
  * Job title  
  * Phone number  
  * Email address  
  * Company name  
  * Country of VAT registration  
  * Company VAT number  
  * Company address  
    * Street address, City, County/State/Region, Country, Postcode  
  * Company Phone  
    * Country code, Telephone, Mobile  
  * Fleet Type  
  * Areas covered (including countries if EU selected)  
  * Container types  
  * Waste Carrier License  
    * There will be a guidance message:  
      * “Ensure uploaded documents are up-to-date versions and licence numbers are correct, errors may delay verification (\*Required Field).”  
    * Waste Carriers Licence Options:  
      * Provide options for users to indicate whether they have a Waste Carriers Licence, with options like 'Yes’ and 'Not applicable'.  
      * If the user selects “yes" for the Waste Carriers License  
        * Provide the user with the ability to upload a document for this, and provide the expiry date as a mandatory field.  
        * If 'Not Applicable' or 'No' is selected, ensure these options are logged and require no further action related to the Waste Carrier Licence.  
    * Expiry Date Requirement:  
      * For all document uploads where an expiry date is applicable (e.g., Environmental Permit, Waste Carrier Licence), provide a field for users to input a future expiry date.   
      * Ensure that this field accepts dates in a consistent format (DD/MM/YYYY) and includes date-picker functionality to reduce user error.  
    * Validation and Confirmation:  
      * If the user changes the permit/licence type (radio) after deleting, Save becomes enabled even if no file is present, allowing configuration changes to be saved without documents.  
      * Before saving any changes, prompt the user to confirm their selections to prevent accidental modifications. Use a confirmation dialogue box with 'Confirm' and 'Cancel' buttons.  
      * Changes should only be saved if the user confirms; otherwise, revert to the previous selections if 'Cancel' is selected.  
    * Status on any doc change  
      * On any documentation change (add, replace, delete, change of permit/licence type, change of “Waste Carrier Licence” choice, or expiry date edit), set the account status to Pending Review automatically.  
      * If documents are missing or expired, immediately apply Reduced Access rules ([6.1.7.1](#6.1.7.1.-reduced-access-if-documents-missing/expired)) and display the Account Status Banner indicating pending review/limited access.  
* Information Symbol for Incomplete Fields:  
  * Implement an information symbol (e.g., a tooltip icon) next to any fields that are incomplete or require user attention.  
    * A red exclamation mark will indicate missing fields.  
  * The symbol should provide a brief explanation or prompt to the user about what needs to be completed.  
    * “This field is currently empty.”  
* There will be a submit button  
* If the user makes any changes and does not use the “submit” button, the system will ask the user to confirm their changes before exiting the page 

| Preconditions: The user is authenticated as a Haulier. The Haulier is in the Profile area of the Haulier platform.  Trigger: The Haulier selects to “Edit” their profile information.  Acceptance criteria Edit Profile The following sections/fields are editable when the user accesses the “Edit” mode in the My Profile section: Basic Details:  Prefix First Name Last Name Job Title Telephone Email Company Details:  Company Name  Country of VAT Registration Company VAT number Company registration number Street Address Postcode City County/State/Region Country  Telephone Mobile Additional Information:  Fleet Type  Areas Covered  if ‘EU’ is selected a list of EU countries checkboxes will display. Container Types  Waste Carrier License Upload: There will be a guidance message: “Ensure uploaded documents are up-to-date versions and licence numbers are correct, errors may delay verification (\*Required Field).” Waste Carriers Licence Options: Provide options for users to indicate whether they have a Waste Carriers Licence, with options like 'Yes’ and 'Not applicable'. If the user selects “yes" for the Waste Carriers License Provide the user with the ability to upload a document for this, and provide the expiry date as a mandatory field. If 'Not Applicable' or 'No' is selected, ensure these options are logged and require no further action related to the Waste Carrier Licence. Expiry Date Requirement: For all document uploads where an expiry date is applicable (e.g., Environmental Permit, Waste Carrier Licence), provide a field for users to input a future expiry date.  Ensure that this field accepts dates in a consistent format (DD/MM/YYYY) and includes date-picker functionality to reduce user error. Validation and Confirmation: If the user changes the permit/licence type (radio) after deleting, Save becomes enabled even if no file is present, allowing configuration changes to be saved without documents. Before saving any changes, prompt the user to confirm their selections to prevent accidental modifications. Use a confirmation dialogue box with 'Confirm' and 'Cancel' buttons. Changes should only be saved if the user confirms; otherwise, revert to the previous selections if 'Cancel' is selected. Status on any doc change On any documentation change (add, replace, delete, change of permit/licence type, change of “Waste Carrier Licence” choice, or expiry date edit), set the account status to Pending Review automatically. If documents are missing or expired, immediately apply Reduced Access rules ([6.1.7.1](#6.1.7.1.-reduced-access-if-documents-missing/expired)) and display the Account Status Banner indicating pending review/limited access. Socials Facebook profile  Instagram profile  Linkedin profile  X profile Information Symbol for Incomplete Fields: Implement an information symbol (e.g., a tooltip icon) next to any fields that are incomplete or require user attention. A red exclamation mark will indicate missing fields. The symbol should provide a brief explanation or prompt to the user about what needs to be completed. “This field is currently empty.” Validation and Confirmation: Before saving any changes, prompt the user to confirm their selections to prevent accidental modifications. Use a confirmation dialog box with 'Confirm' and 'Cancel' buttons. Changes should only be saved if the user confirms; otherwise, revert to the previous selections if 'Cancel' is selected. Postcondition: The Haulier will be able to edit/update their profile information.  |
| :---- |

| Field | Description |
| :---- | :---- |
| Prefix | Dropdown. Options include Dr. , Miss, Mr. , Mrs. , Ms. , Mx. , Prof. , Rev. Mandatory |
| First Name | Text input. Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation. Max 50 characters. Mandatory. |
| Last Name | Text input. Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation. Max 50 characters. Mandatory. |
| Job Title | Text input. Alphanumeric. Min 1 character, Max 50 characters, Mandatory |
| Telephone | Text input. Numeric, Max 15 characters. Mandatory. |
| Email Address | Text input. Max 250 characters. Must be valid email format. Mandatory. |
| Company Name | Text input. Alphanumeric. Max 100 characters. Mandatory. |
| Company Registration Number | Text input. Alphanumeric. Max 20 characters. Mandatory. |
| Country of VAT Registration | Radio Buttons. Options: EU (European Union), United Kingdom, Other. Mandatory. if ‘EU’ is selected the list of EU countries checkboxes will display. There will be a button to “Select all”. |
| Company VAT number | Text input. Alphanumeric. Max 20 characters. Mandatory. |
| Street Address | Text input. Alphanumeric. Max 100 characters. Mandatory. |
| Postcode | Text input. Alphanumeric. Max 20 characters. Mandatory. |
| City | Text input. Alphanumeric. Max 50 characters. Mandatory. |
| County/State/Region | Text input. Alphanumeric. Max 50 characters. Mandatory. |
| Country | Dropdown. Options predefined for registration. Mandatory. |
| Phone Number Country Code | Dropdown; Dropdown options show country flag, Country Name, Country code. Default value : UK \+44. Mandatory.  |
| Telephone | Text. Numeric input, Max 15 characters. Mandatory. |
| Mobile | Text. Numeric input, Max 15 characters. Optional |
| Fleet Type | Radio Buttons. Options: Freight Forwarder, Own Fleet. Mandatory. |
| Areas Covered | Radio Buttons. Options: UK Only, Within EU, World Wide;  Mandatory. |
| Select the EU countries | Checkboxes. Display condition: When ‘Within EU’ in the Areas Covered checked. Include checkboxes with values from predefined sources. Mandatory. |
| Select all/Deselect all | Default value: Select allDisplay condition:  When ‘Within EU’ in the Areas Covered checked When clicking on Select all, all checkboxes in select the EU countries are checked, and button text display “Deselect all” When clicking on Deselectall, all checkboxes in select the EU countries are unchecked, and button text display “Select all” |
| Container Types | Checkbox. Multiselect. Options: Shipping Container, Curtain Sider(Standard), Curtain Sider (High Cube), Walking Floor, All. Mandatory 1 option must be selected. |
| Select all/Deselect all | Default value: Select all. Display condition:  When clicking on Select all, all checkboxes in select the Container Types are checked, and button text display “Deselect all” When clicking on Deselectall, all checkboxes in select the Container Types are unchecked, and button text display “Select all” |
| Waste Carrier Licence Upload | File upload: File types: jpg, png, jpeg, pdf, doc, xls, docx, Max. File size: 25 MB. Max files: 6\. Mandatory. |
| Expiry Date | Date picker. Format: dd/mm/yyyy. Must be a future date. Mandatory. |
| Facebook profile URL | Text input. Must be a valid URL format. Optional. |
| Instagram profile URL | Text input. Must be a valid URL format. Optional. |
| LinkedIn profile URL | Text input. Must be a valid URL format. Optional. |
| X username (without @) | Text input. Alphanumeric. Max 50 characters. Optional. |

| Use Case | Error Message |
| :---- | :---- |
| Edit page load failure | “We couldn’t load the edit profile page. Please refresh and try again.” |
| Mandatory field not filled | “Please fill in all required fields.” |
| Invalid email format | “Please enter a valid email address.” |
| Invalid phone number | “Please enter a valid phone number.” |
| Invalid file format for licence upload | “Invalid file format. Please upload a valid Waste Carrier Licence.” |
| No area covered selected | “Please select at least one area that you cover.” |
| Invalid socials URL field | “Please enter a valid URL.” |
| Save failure | “We couldn’t save your profile right now. Please try again. If the problem persists, contact support.” |

| Design Name | Link |
| :---- | :---- |
| Edit profile | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21744-76326\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21744-76326&t=TzDhDk2ScPubsQGI-4) ![][image38] |

| Client Approved | yes |
| :---- | :---- |

#### 

### 6.2.5. Haulier Notifications {#6.2.5.-haulier-notifications}

#### **6.2.5.1. Notifications Icon**

* Reuses logic from the trading platform notifications icon [6.1.6.1.](#6.1.6.1.-notifications-icon)  
* There will be a notification icon within the header  
* The icon will indicate when there are new notifications  
* Clicking on the notifications will lead to the notification centre

| Preconditions: The user is logged in. The header is visible. Trigger: The user opens the Notifications icon from the header. Acceptance Criteria: There will be a Notifications icon in the header. The icon will display an unread count number. Selecting the icon will open the notifications centre ([6.2.5.2](#6.2.5.2.-notifications-centre)). Postcondition: The user is directed to the notifications centre.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notifications load failure | "Failed to load notifications centre. Please refresh the page." |

| Design Name | Link |
| :---- | :---- |
| Notifications icon | ![][image39][https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-66775\&t=agaM0kh6K9gZbJyL-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21739-66775&t=agaM0kh6K9gZbJyL-4)  |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.5.2. Notifications Centre** {#6.2.5.2.-notifications-centre}

* Reuses logic from the trading platform notifications centre [6.1.6.2.](#6.1.6.2.-notifications-centre)  
* The user will be able to view and manage all notifications in the notification centre  
* The user will be able to view each notification in full detail   
  * Notifications will be displayed in reverse chronological order (latest first)  
  * There will be a timestamp on each notification  
    * dd/mm/yyyy HH: MM  
* The user will be able to mark the notifications as   
  * Read  
  * Unread  
* ~~There will be pagination~~  
  * ~~The user will be able to select the number of rows per page~~  
    * ~~10~~  
    * ~~20~~  
      * ~~Default~~  
    * ~~50~~  
    * ~~All~~  
* By default, the page will display the latest notifications at the top

| Preconditions: The user is authenticated and has access to the Notifications centre. Trigger: The user opens the Notifications dropdown from the header. The user selects Mark all as read. Acceptance Criteria: Container The Notifications icon in the header opens a dropdown panel when selected. The dropdown stays in context (no page navigation). The panel appears on the right hand side of the page. List Contents The panel displays a chronological list of notifications for the current user. Each notification entry shows:  Timestamp dd/mm/yyyy HH:MM Title  Single line title Summary Read icon/Unread icon Unread messages will be highlighted green. Users can select the icon to toggle between read/unread state. Status changes Notifications will be marked Read when the user selects “Mark all read” Changes all visible notifications to the Read state. Unread notification count in the header icon ([6.1.6.1](#6.1.6.1.-notifications-icon)) updates instantly. Opening/closing the dropdown does not change notification states unless the user explicitly acts (e.g., Mark all as read). After a status change, entries lose the unread styling and the unread count updates accordingly. Read/unread state persists, across sessions. Data Scope Initial view (compact): On open, the dropdown shows up to 10 most recent notifications. If fewer than 10 exist, show only those; if none, show the empty-state message. Load older pages: The user can click “View more” and load the next 10 older notifications into the same fixed-height list. This replaces the currently displayed set (no further size change). When there are no older notifications, replace the control with “No more notifications.” If no notifications exist, render an empty state: “You don’t have any notifications yet.” Postconditions: The user views their notifications in one place and can bulk-mark them as Read; the updated state is saved.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notifications load failure | "Failed to load notifications. Please refresh the page." |
| Mark as read failure | "Unable to mark notification as read. Please try again." |
| Mark as unread failure | "Unable to mark notification as unread. Please try again." |
| Load more failure | “Unable to load more notifications. Please try again.” |

| Design Name | Link |
| :---- | :---- |
| Notifications centre | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22121-52327\&t=2VKx81HrYDas9Qay-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22121-52327&t=2VKx81HrYDas9Qay-4) ![][image40] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.5.3. General Platform Emails**

* Reuses logic from the trading platform general platform emails ([6.1.6.3](#6.1.6.3.-general-platform-emails)).  
* The following notifications are sent to all users  
  * Complete registration   
  * Welcome email   
* These notifications will be sent to a user’s email address

| Preconditions: The user is authenticated as a Haulier. Triggers: The system recognises a trigger event. Acceptance Criteria: The system will recognise trigger events and deliver notifications as emails and notifications: Emails: Incomplete registration  [6.2.1.2](#6.2.1.2.-save/resume) Successful Registration Email Phase 1 \- 6.1.1.5 Submit form \- confirmation page (stage 1\) & 7.5.0.1 Register email. Account Verified Email Phase 1 \- 6.6.2.7 Member approval \- approval actions  Success: 7.5.0.4 Account verified Rejection:  Forgotten Password Email Phase 1 \- 6.2.1.5. Forgotten Password & 7.5.0.2 Forgotten password email. Profile Update Email Phase 1 \- [6.2.4.2.](#6.2.4.2.-edit-profile) & 7.5.0.9. Profile Updates Email Notifications: The following events do not require notifications: Incomplete registration Successful Registration Email Forgotten Password Email The following events will be delivered as notifications: Account Verified  Success: 7.5.0.4 Account verified Title: “Account Verified” Summary: “Your WasteTrade account is now verified. You can browse the available loads. Go to Platform” Rejection: Title: “Account Verification Unsuccessful Summary: “We couldn’t verify your account at this time. \<reason optional\>. Please review and complete the required information (e.g., company documents, permits, full address) to continue. Review Profile” Profile Update  Title: “Profile Updated” Summary: “Your profile information was updated successfully. If this wasn’t you, contact support immediately to secure your account. Review Profile.”  Postconditions: The Haulier receives in-platform notifications and emails.   |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notification link failure | “Failed to open the notification link. Please try again.” |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.2.5.4. Haulier Notifications** {#6.2.5.4.-haulier-notifications}

* The user will receive notifications at the following points  
  * Bid approved/rejected  
  * ~~Received communication from the Admin (Bid requires attention; status: pending)~~  
  * Bid accepted  
  * Won Offer  
  * New Haulage Opportunity  
  * ~~Further points to be decided~~  
* All notifications will contain a link to the original listing  
* All notifications will be sent through the system and also to the user’s email address

| Preconditions: The user is authenticated as a Haulier. Triggers: The system recognises a Haulier trigger event. Acceptance Criteria: The system will recognise trigger events and deliver notifications as emails and notifications:  New Haulage Opportunity Triggered when a new available load appears containing a pickup and destination location that falls within the Hauliers “Areas your company can cover” (UK, all EU countries, Worldwide). Offer Accepted/Rejected/More Information Required Triggered when Admin reviews the haulage bid ([6.4.1.15](#6.4.1.15.-haulier-bid-approval-actions)). Notifications New Haulage Opportunity Title: “New Haulage Opportunity” Summary: “You have a new haulage opportunity. View Available Loads” Offer Approved/Rejected/More Information Required Approved Title: “Offer Approved” Summary: “Your haulage Offer from \<Pickup location country\> to \<Destination country\> has been approved, Wastetrade will be in touch shortly, all relevant documentation will be provided 3 days before the confirmed delivery date. View Offer” Rejected Title: “Offer Rejected” Summary: “Your haulage Offer from \<Pickup location county\> to \<Destination country\> has been rejected by the admin. \<reason for rejection\> Please create a new Offer. View Offer” More Information Required Title: “Offer Requires More Information” Summary: “Your haulage Offer from \<Pickup location country\> to \<Destination country\> requires more information. Please update the Offer information and resubmit. View Offer” Email New Haulage Opportunity Subject: “WasteTrade \- New Haulage Opportunity” Body: “Hi \<first name\>,A new haulage opportunity is available. Check out the available loads page and submit your offer.Best regards,The WasteTrade Team” Offer Approved/Rejected/More Information Required Approved Subject: “Your offer has been approved” Body: “Hi \<recipient's name\>,This is a notification that your haulage offer from \<Pickup location country\> to \<Destination country\> has been approved by admin. Wastetrade will be in touch shortly, all relevant documentation will be provided 3 days before the confirmed delivery date.Best regards,The WasteTrade Team” Rejected Subject: “Your offer has been approved” Body: “Hi \<recipient's name\>,This is a notification that your haulage offer from \<Pickup location country\> to \<Destination country\> has been rejected by admin.Rejection reason: \<reason\>Best regards,The WasteTrade Team” More Information Required Subject: “Your offer has been approved” Body: “Hi \<recipient's name\>,This is a notification that your haulage offer from \<Pickup location country\> to \<Destination country\> has been requested for more information by admin.Message from admin: \<message\>Best regards,The WasteTrade Team” Postconditions: The Haulier receives in-platform notifications and emails.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notification link failure | “Failed to open the notification link. Please try again.” |

| Design Name | Link |
| :---- | :---- |
| Haulier notifications | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21840-27074\&t=Cl8KNyhNAyvchX8x-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21840-27074&t=Cl8KNyhNAyvchX8x-4)  |

| Client Approved | yes |
| :---- | :---- |

#### 

#### **6.2.5.5. Document Expiry Notifications**

* Reuses logic from trading platform document expiry notifications ([6.1.6.4](#6.1.6.4.-document-expiry-notifications))  
* The system will identify when a document is approaching its expiry date  
* The account owner will receive a notification containing the following information  
  * Document type  
  * Expiry date  
  * Link to the Company Documents section  
* The notification will be sent at the following intervals  
  * 30 days before expiry  
  * 20 days before expiry  
  * 15 days before expiry  
  * 10 days before expiry  
  * 7 days before expiry  
  * 5 days before expiry  
  * 3 days before expiry  
  * Day of expiry  
* All notifications will be sent through the system and also to the user’s email address

| Preconditions: The Haulier has documents stored in Company Documents within their profile that include an expiry date. Triggers: The system identifies a document as being near expiry. Acceptance Criteria: The system runs an expiry sweep job daily to find documents approaching expiry. A document is “approaching expiry” on the following exact day offsets prior to its expiry date: 30, 20, 15, 10, 7, 5, 3, and 0 (day of expiry). For each offset day that matches today, the system creates one notification event per document. For a given document\_id and interval (e.g., 30-day), the system must not send more than one notification. For 30, 7 and 0 (day of expiry) the system will also send the document expiry email. Stop conditions If expiry date changes (extended or replaced), pending future intervals recalc using the new expiry date. If the document is deleted/archived, cancel any future notifications for that document. If the document is already expired when first detected, only the day-of-expiry (0) event is eligible; past intervals are skipped. Notification Title: “Document Expiry” Summary: “Your document, \<document title\>, expires on \<expiry date ddmmyyyy\>. Please update your records to avoid disruption. Manage Documents” Clickable link directs users to their profile \> documents. Email Subject: “Wastetrade \- Document Expiry” Body: “Hi \<owner first name\>,One of your documents is approaching expiry on \<expiry date ddmmyyyy\>.To keep your account in good standing, please review and update your document.If you’ve already updated this document, you can ignore this message. If you have questions, reply to this email or contact support@wastetrade.com.Best regards,The WasteTrade Team” Postconditions: On a matching interval day, the Account Owner receives a notification and/or email. Once the document is updated (expiry changed or replacement uploaded), future notifications use the new date; past intervals are not present.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Notification link failure | “Failed to open the notification link. Please try again.” |

| Design Name | Link |
| :---- | :---- |
|  | Shown in [6.1.6.4.](#6.1.6.4.-document-expiry-notifications) |

| Client Approved | Yes |
| :---- | :---- |

#### 

## **6.3. Master Elements** {#6.3.-master-elements}

### ~~6.3.1. Resources~~ {#6.3.1.-resources}

~~Note: this area is accessible to all user types via the “Resources” link in the footer.~~

####  **~~6.3.1.1. Resources Page~~** {#6.3.1.1.-resources-page}

* ~~The user will be able to access the resources area via a link in the footer.~~  
* ~~The resources page will display:~~  
  * ~~Articles~~   
    * ~~Shown as a list of article cards ([6.3.1.2](#6.3.1.2.-view-article-card))~~  
    * ~~Up to 20 article cards are listed before pagination~~  
    * ~~Default sorted in reverse chronological order, i.e. newest first~~  
  * ~~FAQs~~  
    * ~~Shown on the side of the resources page~~  
    * ~~Collapsible/expandable question titles~~ 

#### **~~6.3.1.2. View Article Card~~** {#6.3.1.2.-view-article-card}

* ~~The cards will be presented within the main display area’s sections~~  
* ~~Each card will display:~~   
  * ~~The cover image~~  
    * ~~Uploaded image~~  
    * ~~Cover image of a video~~   
  * ~~The title~~   
  * ~~Keywords~~  
* ~~Clicking on the card will direct the user to the article page~~

#### **~~6.3.1.3. Search Articles~~** {#6.3.1.3.-search-articles}

* ~~The user will be able to perform a search on the article list~~  
* ~~The user will be able to enter their search term in the search box~~  
  * ~~Submit behaviour must also occur after the user selects “enter”.~~  
  * ~~The system will search all data in the table~~  
  * ~~Records will be matched by words within the article title.~~

#### 

#### **~~6.3.1.4. View Article Page~~**

* ~~The article page will have the following elements:~~  
  * ~~Article title~~  
  * ~~Title image~~  
    * ~~And any Alt text~~  
  * ~~Keywords~~  
  * ~~Body text~~  
  * ~~Body images/videos~~  
  * ~~Share buttons~~   
    * ~~WhatsApp~~  
    * ~~Twitter~~  
    * ~~Facebook~~  
    * ~~LinkedIn~~  
    * ~~Email~~

#### **~~6.3.1.5. View FAQs~~**

* ~~FAQs will be shown on the right-hand side of the resources page.~~  
* ~~Individual FAQs will be shown as collapsible/expandable titles.~~  
  * ~~The user can expand the FAQ to view the corresponding question and answer.~~

### ~~6.3.2. Layout~~  {#6.3.2.-layout}

#### **~~6.3.2.1. Header~~** {#6.3.2.1.-header}

* ~~This is an update to existing functionality within the header; updates are highlighted in yellow.~~  
* ~~The header will no longer include quick action buttons labelled "Buy", "Sell", and "Wanted".~~   
* ~~The user’s username is displayed prominently in the header to personalise the user experience.~~  
  * ~~When clicked reveals a sub-menu displaying:~~  
    * ~~Settings: Directs the user to their account settings.~~  
    * ~~Logout: Allows the user to log out securely from the platform.~~  
* ~~There is a notifications icon (Traders ([6.1.6](#6.1.6.-trading-notifications)), Hauliers ([6.2.5](#6.2.5.-haulier-notifications)).~~  
* ~~There is a language selector ([7.1.0.8](#7.1.0.8.-deepl-multi-language-tool))~~

#### **~~6.3.2.2. Footer~~** {#6.3.2.2.-footer}

* ~~This is an update to existing footer functionality; updates are highlighted in yellow.~~  
* ~~Footer Content and Structure:~~  
  * ~~The green footer must be displayed on all pages where a **user is not logged in**.~~  
    * **~~Logged-in users will only view~~**~~:~~  
      * ~~©2025 Wastetrade, All rights reserved. Disclaimer.~~  
      * ~~Resources~~  
        * ~~Directs the user to view the resources page ([6.3.1.1](#6.3.1.1.-resources-page))~~  
      * ~~Terms & Conditions~~  
      * ~~Privacy Policy~~  
        * ~~Privacy Policy and Terms & Conditions links will open in a new tab, but no need to accept.~~  
  * ~~During registration and onboarding, the green footer must be displayed for all onboarding pages.~~   
    * ~~The white footer must only be displayed when the navigation menu is visible, i.e. only for logged-in users.~~  
  * ~~The footer must include designated areas for social media links, accreditations, and multiple link menus.~~  
  * ~~Social media icons must be clearly visible and linked to the respective company pages, managed and updated through the Admin portal.~~  
  * ~~Accreditation logos or images should be displayed~~  
* ~~Menu Links and Navigation:~~  
  * ~~Ensure the green footer contains structured link menus divided into relevant categories:~~  
    * ~~Menu One: Links directly to the Homepage and Marketplace.~~  
    * ~~Menu Two: Contains links to About, Vacancies, Privacy Policy, Terms & Conditions, and Help.~~  
      * ~~Privacy Policy and Terms & Conditions links will open in a new tab, but no need to accept.~~  
    * ~~Menu Three: Provides links to Resources and a Contact form.~~  
      * ~~Resources directs the user to view the resources page ([6.3.1.1](#6.3.1.1.-resources-page))~~  
  * ~~Each link should direct the user accurately to the respective pages without errors.~~

### 6.3.3. Multi-User Company Accounts {#6.3.3.-multi-user-company-accounts}

#### **6.3.3.1 Invite User to Company**

* As a user, I want to invite teammates by email so they can use the platform under our company.  
* Company Admin enters teammate’s email to send an invite; shows in a Pending Invites list (resend/revoke).  
  * Preselect a role for the invite.  
* Invite links the user to the existing company on acceptance (i.e. user registers via the invitation email).

#### **6.3.3.2. Invitation Email**

* As an invited user, I want to accept an invite and set my password so I’m added to the correct company.  
* Invitee clicks link, sets password, and is auto-associated with the inviter’s company.  
  * Handle expired/invalid tokens with clear guidance to request a new invite.  
* On success, show confirmation and route to the marketplace dashboard

#### **6.3.3.3. Join Existing Company during Registration**

* As a new registrant, I want to request joining an existing company (e.g., via VAT/company match) instead of creating a duplicate.  
* During registration, VAT/company lookup suggests Join \<Company\> when a match is found.  
  * Sends a join request to the company’s admins.  
  * Fallback to create a new company if no match.  
* Applicant sees pending status until approved.

#### **6.3.3.4 Approve or Decline Join Requests**

* As a Company Admin, I want to approve/decline requests to join so I control who represents our company.  
* Company Admin sees a Pending Requests queue (name, email, note, date).  
  * Approve/Decline with optional message; requester is notified.  
* On approval, the user appears in Members.

#### **6.3.3.5. Manage Company Users**

* As a Company Admin, I want a members list where I can view, search, and manage people linked to our company.  
* Company Admin will be able to view a Company members page  
  * View list  
  * Search  
  * Filter by name, role, status (active/pending).  
* Actions: remove user, resend invite.  
* If removing the owner of active assets, require ownership transfer first.

#### **6.3.3.6. Assign Roles & Basic Permissions**

* As a Company Admin, I want to set roles (Company Admin, Buyer, Seller, Haulier Member) and basic permissions (e.g., create listings, bid, edit company docs).  
  * Roles: Company Admin, Buyer, Seller, Haulier Member  
  * Simple permission toggles (create listings, bid, edit company docs/locations).  
* Changing roles updates what the user can see/do immediately.  
* All changes audited; show “last updated by / time”.

#### **6.3.3.7. Haulier Team Bidding**

* As a Haulier team member, I want to make haulage bids under our Haulier company with shared defaults (areas covered, container types).  
* Haulier team members can submit haulage bids under their company, with company defaults (areas covered, container types) prefilled.  
* Record which user submitted the bid; respect role/permission checks.

#### **6.3.3.8. Company Notifications**

* As a Company Admin/User, I want notifications for invites, approvals, role changes, and removals so I stay informed.  
* Send in-app/email notifications for  
  * Invite accepted  
  * Join requests  
  * Role/permission changes  
  * Removals

#### **6.3.3.9. Admin Management of Company Users**

* As a WasteTrade Admin, I want to view and adjust company memberships/roles.  
* WasteTrade Admins can view Company Profiles with a list of associated users.  
  * Admins can adjust roles, or unlink users when needed.  
* Tools to merge duplicates (where VAT/company match).  
* Admin must be able to view audit history of membership changes.

#### **6.3.3.10. CRM Alignment**

* Within the system, users will be mapped to the Salesforce CRM under the company Account and to update CRM on membership/role changes.  
* Data model mapping (TBC)  
  * Company → Salesforce Account (one-to-one). Store WasteTrade Company ID as External ID on Account.  
    * Accounts: match by VAT / Company Registration No. first; fallback to Name \+ Country; upsert by External ID.  
  * User → Salesforce Contact (one-to-one) linked to that Account. Store WasteTrade User ID as External ID on Contact.  
    * Contacts: match by Email first; fallback to External ID; respect Salesforce Duplicate Rules.  
* Capture core fields: names, emails, phones, role (Buyer/Seller/Haulier Member/Company Admin), member status (Invited/Pending/Active/Suspended), and primary site location (as mailing/billing where appropriate).

## **6.4. Admin** {#6.4.-admin}

### 6.4.1 Admin Dashboard  {#6.4.1-admin-dashboard}

#### **6.4.1.1. Admin Navigation Menu**

* This is an update to existing functionality within the Admin dashboard; updates are highlighted in yellow.  
* The horizontal menu for the Dashboard (containing Users, Listings, Offers, Wanted) will be incorporated into the side menu, as a sub-selection within Dashboard.  
* The sidebar menu will display:  
  * Dashboard  
    * Users  
    * Listings  
    * Wanted  
    * Offers  
    * Samples  
    * MFI  
  * User Management ([6.4.2](#6.4.2.-user-management))  
  * ~~Document Management~~  
  * Support Content Management ([6.4.3](#6.4.3.-resource-content-management))  
  * ~~Analytics (management information)~~  
  * Settings ([6.4.4](#6.4.4.-settings))  
* The horizontal menu will be updated to display:  
  * Users ([6.4.1.2](#6.4.1.2.-view-users-table))  
    * All  
    * Unverified  
    * Verified  
    * Rejected  
    * Inactive  
    * Blocked  
  * Listings ([6.4.1.5](#6.4.1.5.-view-listings-table))  
    * All  
    * New  
    * Unverified  
    * Approved  
    * Rejected  
  * Wanted ([6.4.1.7](#6.4.1.7.-view-wanted-listings-table))  
    * All  
    * New  
    * Unverified  
    * Approved  
    * Rejected  
  * Offers [(6.4.1.9](#6.4.1.9.-view-offers-table))  
    * All  
    * New  
    * Rejected  
    * Won  
  * Haulage Bids ([6.4.1.12](#6.4.1.12.-view-haulage-bids))  
    * ~~All~~  
    * ~~New~~  
    * ~~Rejected~~  
    * ~~Won~~  
  * Samples ([6.4.1.17](#6.4.1.18.-view-sample-request-table))  
    * ~~All~~  
    * ~~New~~  
    * ~~Sent~~  
  * MFI Tests ([6.4.1.18](#6.4.1.19.-view-mfi-table))  
* The default selection for any page will be “All”.  
  * E.g. Selecting “Users” from the side menu will open the user table to view “All” users within the table.  
* The horizontal tabs will act as filters for the selected table.  
  * E.g. Selecting the “Unverified” horizontal tab within the “Users” view will update the users table to display only unverified users.

#### **6.4.1.2. View Users Table** {#6.4.1.2.-view-users-table}

* This is an update to existing functionality within the Admin dashboard; updates are highlighted in yellow.  
* The users tab will be updated to include widgets showing user totals (total, new, verified, unverified, blocked)  
* The users table will be updated to display all of the following information:  
  * Account Type  
  * User ID  
  * User Name  
  * Company  
  * Country  
  * Date of Registration  
  * Overall Status  
  * Registration Status  
  * Onboarding Status   
* User status (Overall, Registration, Onboarding) will be colour-coded to indicate status at a glance.  
  * Complete/success statuses will be shown as green text.  
  * Pending/Incomplete statuses will be shown as orange text.  
  * Rejected statuses will be shown as red text.  
* Admin will be able to select “View Detail” to open the Members Account page with all of the user details.  
  * Selecting elsewhere on the row will not open the details page.

#### 

#### 

#### **6.4.1.3. Search Users Table**

* The user will be able to search the users table  
* The user will be able to search the table by User ID, Name, Company Name, and Account type  
* Submit behaviour must also occur after the user selects “enter”.

 

#### **6.4.1.4. Filter Users Table** {#6.4.1.4.-filter-users-table}

* The user will be able to filter the users table  
* The user will be able to filter on the following parameters  
  * Date of registration   
    * Date range picker  
  * Account type dropdown  
    * Buyer  
    * Seller  
    * Dual (Buyer/Seller)  
    * Haulier  
    * Admin  
  * Status dropdowns  
    * Overall  
    * Registration  
    * Onboarding  
* Submit behaviour must also occur after the user selects “enter”.

#### **6.4.1.5. View Listings Table** {#6.4.1.5.-view-listings-table}

* This is an update to existing functionality within the Admin dashboard; updates are highlighted in yellow.  
* The listings table will be updated to display all of the following information:  
  * Seller ID  
    * Selecting this will open the corresponding user details page as a new tab in the default browser.  
  * User Name  
  * Company  
  * Country  
  * Material name (Product name schema)  
  * Date  
  * Best offer  
  * Date available from  
  * Remaining loads  
  * Status  
  * State  
* Admin will be able to select “View Detail” to open the Listing Details page.  
  * Selecting elsewhere on the row will not open the details page.

#### **6.4.1.6. View Listings Details**

* This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.  
* The user will be able to see detailed information about each sales listing.  
* Seller Information:  
  * User ID  
    * Selecting this will open the corresponding user details page as a new tab in the default browser.  
  * Full Name: Display the first and last name of the Seller.  
  * Company: Display the company name of the Seller.  
* Material Information:  
  * Images: Display images included within the listing.  
  * Material Name: Material name (Product name schema)  
  * Listing Date: Date the listing was made.  
  * Description: Description associated with the listing.  
  * Packaging: Display the packaging details of the material.  
  * Number of loads remaining: Display the total number of loads available.  
  * Weight per Load: Display the weight of each load.  
  * Location/Warehouse: Display the location or warehouse where the material is stored.  
    * The Location/Warehouse value is a clickable link.   
    * Selecting it opens a read-only modal titled “Location details – \<Location name\>”.  
    * The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details.  
  * Currency: Display the currency in which the sale is being made.  
  * Status  
  * State

#### **6.4.1.7. View Wanted Listings Table** {#6.4.1.7.-view-wanted-listings-table}

* This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.  
* The listings table will be updated to display all of the following information:  
  * Buyer ID  
    * Selecting this will open the corresponding user details page as a new tab in the default browser.  
  * User Name  
  * Company  
  * Country  
  * Date required from  
  * Date listed  
  * Quantity required  
  * Material name (Product name schema)  
  * Packaging  
  * Storage  
  * Status  
  * State  
* Admin will be able to select “View Detail” to open the Wanted Listing Details page.  
  * Selecting elsewhere on the row will not open the details page.

#### 

#### **6.4.1.8. View Wanted Listings Details**

* This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.  
* The user will be able to see updated detailed information about each wanted listing.  
* Seller Information:  
  * User ID  
    * Selecting this will open the corresponding user details page as a new tab in the default browser.  
  * Full Name: Display the first and last name of the Seller.  
  * Company: Display the company name of the Seller.  
* Material Information:  
  * Material Name: Product name schema  
  * Listing Date: Date the listing was made.  
  * Quantity Required: Display the amount of material wanted.  
  * Packaging: Display the packaging details of the material wanted.  
  * Storage: Display the storage details of the material wanted.  
  * Weight per Load: Display the weight of each load.  
  * Location/Warehouse: Display the location or warehouse where the material is wanted.  
    * The Location/Warehouse value is a clickable link.   
    * Selecting it opens a read-only modal titled “Location details – \<Location name\>”.  
    * The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details.  
  * Currency: Display the currency in which the sale is being made.  
  * Status  
  * State

#### **6.4.1.9. View Offers Table** {#6.4.1.9.-view-offers-table}

* This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.  
* The offers table will be updated to display all of the following information:  
  * Buyer info  
    * ID  
      * Selecting this will open the corresponding user details page as a new tab in the default browser.  
    * Name  
    * Company  
    * Country  
  * Seller info  
    * ID  
      * Selecting this will open the corresponding user details page as a new tab in the default browser.  
    * Name  
    * Company  
    * Country  
  * Amount  
  * Bid Date   
  * Valid until  
  * Material name (Product name schema)  
    * Selecting this will open the corresponding sales listing page as a new tab in the default browser.  
  * Packaging  
  * Number of loads bid on  
  * Weight per load  
  * Status  
  * State

#### **6.4.1.10. View Offers Details**

* This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.  
* The user will be able to see updated detailed information about each offer in revised sections:  
  * Summary Information:  
    * Bid amount  
    * Bid currency  
    * Status  
    * State  
    * Accept/Reject buttons  
  * Buyer information:  
    * ID  
      * Selecting this will open the corresponding user details page as a new tab in the default browser.  
    * Name  
    * Company  
    * Country  
    * Destination warehouse  
      * The Location/Warehouse value is a clickable link.   
      * Selecting it opens a read-only modal titled “Location details – \<Location name\>”.  
      * The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details.  
    * Bid amount  
    * Valid until  
    * Number of loads bid on  
    * Incoterms  
    * Earliest \+ Latest Delivery  
  * Seller Information:  
    * ID  
      * Selecting this will open the corresponding user details page as a new tab in the default browser.  
    * Name  
    * Company  
    * Country  
    * Pick up location  
      * The Location/Warehouse value is a clickable link.   
      * Selecting it opens a read-only modal titled “Location details – \<Location name\>”.  
      * The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details.  
    * Material name (Product name schema)  
    * Packaging  
    * PERN  
    * Quantity available  
    * Loads remaining  
    * Avg weight per load  
    * Total price shared  
    * Price per tonne

#### **6.4.1.11. Listings/Offers/Wanted Search/Filters**

* This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.  
* Admin can search for items within the Listings/Wanted Listings/Offers/Haulage offers tables by entering keywords into the search bar.  
  * The system must support tokenised search for user details (ID, Name, Company Name) and material (Material type, Item, Form, Grading, Colour, Finishing, Packing)  
    * The search must match any word in the composite product name schema   
  * Support multi-word queries and partial token matches (case-insensitive).  
  * Submit behaviour must also occur after the user selects the “enter” key.  
* Admin can utilise different filter bars depending on the Admin dashboard selected:  
  * Users   
    * Filter options defined in ([6.4.1.4](#6.4.1.4.-filter-users-table))  
  * (Sales) Listings:  
    * ~~Seller~~   
      * ~~Type search~~  
    * Material  
      * Dropdown  
        * EFW  
        * Fibre  
        * Metals  
        * Plastic  
        * Rubber  
    * Location   
      * Dropdown  
        * All Countries  
          * Default  
        * List the full names of all other countries  
    * Status  
      * Dropdown  
        * Pending  
        * Available  
        * Rejected  
        * Sold  
    * State  
      * Dropdown  
        * Pending  
        * Approved  
        * Rejected  
    * “Sort by”   
      * Dropdown  
        * Available material  
          * Default  
        * Unavailable material  
  * Wanted Listings:  
    * Date Required From  
      * Start date picker  
      * End date picker  
    * ~~Buyer~~  
      * ~~Type search~~  
    * Company  
      * Dropdown  
        * Lists all companies within the system  
    * Material  
      * Dropdown  
        * EFW  
        * Fibre  
        * Metals  
        * Plastic  
        * Rubber  
    * Location   
      * Dropdown  
        * All Countries  
          * Default  
        * List the full names of all other countries  
    * Status  
      * Dropdown  
        * Pending  
        * Available  
        * Rejected  
        * Sold  
    * State  
      * Dropdown  
        * Pending  
        * Approved  
        * Rejected  
    * “Sort by”   
      * Dropdown  
        * Available material  
          * Default  
        * Unavailable material  
  * Offers:  
    * ~~Buyer~~   
      * ~~Type search~~  
    * ~~Seller~~   
      * ~~Type search~~  
    * Material  
      * Dropdown  
        * EFW  
        * Fibre  
        * Metals  
        * Plastic  
        * Rubber  
    * Location   
      * Dropdown  
        * All Countries  
          * Default  
        * List the full names of all other countries  
    * Packing  
      * Dropdown  
        * All  
          * Default  
        * Bags  
        * Bales  
        * Boxes  
        * Bulk Bags  
        * Loose  
        * Octabins/Gaylords  
        * Pallets  
    * “Sort by”   
      * Dropdown  
        * Available material  
          * Default  
        * Unavailable material  
  * Haulage Offers  
    * Defined in [6.4.1.13](#6.4.1.13.-filter-haulage-bids).

#### **6.4.1.12. View Haulage Bids**  {#6.4.1.12.-view-haulage-bids}

* The table will list the haulage bids when the haulage bids tab is chosen   
* The table will have the following columns  
  * Bid date  
  * Buyer  
    * ~~ID~~  
      * ~~Selecting this will open the corresponding user details page as a new tab in the default browser.~~  
    * ~~Name~~  
    * ~~Company name~~  
    * ~~Location~~  
      * ~~The Location/Warehouse value is a clickable link.~~   
      * ~~Selecting it opens a read-only modal titled “Location details – \<Location name\>”.~~  
      * ~~The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details.~~  
    * Desired delivery date  
  * Seller   
    * ~~ID~~  
      * ~~Selecting this will open the corresponding user details page as a new tab in the default browser.~~  
    * ~~Name~~  
    * ~~Company name~~   
    * ~~Location~~  
      * ~~The Location/Warehouse value is a clickable link.~~   
      * ~~Selecting it opens a read-only modal titled “Location details – \<Location name\>”.~~  
      * ~~The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details.~~  
  * Haulier  
    * Name  
    * Company name  
  * Material  
    * Link to listing page  
  * Number of loads  
  * Quantity per load  
  * Haulage total (per load x number of loads)  
  * Status   
* The table will have pagination to navigate through multiple pages of activity.  
* Admin will be able to select “View Detail” to open the Haulage Details page.  
  * Selecting elsewhere on the row will not open the details page.

| Preconditions: The user is authenticated as an admin. Triggers: The Admin selects “Haulage Bids” from the Admin platform navigation menu. Acceptance Criteria: Table Presentation: Implement a table on the Admin platform to display the latest haulage loads. The table must automatically refresh or provide an option to manually refresh to ensure it shows the most current data. Ensure the table includes the following Bid Date Buyer offer Listing bid value/MT Uses the amount/currency selected by the buyer when bidding on a listing (Phase 1 \- 6.4.1.2 Bidding on a Listing). Total weight (MT) \= avg weight per load × number of loads. Bid total (GBP) \= buyer offer/MT × total weight. If non-GBP, convert to USD/EUR via defined conversion rate.  Use default conversion rate until the Exchange rate API is introduced to the system. Apply 2% markup if non-GBP. Haulage offer Haulage total  Uses the amount/currency selected by the haulier when making an offer ([6.2.2.5](#6.2.2.5.-make-an-offer)) If non-GBP, convert to USD/EUR via defined conversion rate.  Use default conversion rate until the Exchange rate API is introduced to the system. Apply 2% markup if non-GBP. Seller offer £/MT €/MT Seller offer per MT (GBP/MT) \= Final seller total (GBP) ÷ total\_weight. Convert to EUR via defined conversion rate.  Use default conversion rate until the Exchange rate API is introduced to the system. Seller total £/MT €/MT The material is eligible for a PERN fee: If the material origin \= UK but destination ≠ UK AND material is defined as Packaging in the database. PERN total defined as \= \<£5 default fee\>/MT Until PERN can be managed within the system (Future scope \- [6.4.4.3](#6.4.4.3.-define-pern)). Final seller total (GBP) \= PRN-eligible: PERN total (PERN/MT x Total MT)+ Bid total − Haulage total Not PRN-eligible: Bid total − Haulage total Haulier Haulier User ID Name Company Material name Clickable link to view listing page. Bid status “View Detail” button ([6.4.1.14](#6.4.1.14.-view-haulage-bid-details)). Dynamic Loading: The table should load the latest 20 listings by default. Include pagination or a scrolling feature to view more entries if there are more than 20 listings. Compliance with UI/UX Design: The table's design should align with the overall Admin platform. Maintain visual consistency in typography, colours, and layout with existing parts of the Admin dashboard. Postconditions: The admin can view all haulage bids in the system.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Table fails to load | "Failed to load offers. Please refresh the page to try again." |
| No haulage offers found | "No haulage offers found. Check back later." |

| Design Name | Link |
| :---- | :---- |
| View Haulage Bids | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21854-79769\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21854-79769&t=TzDhDk2ScPubsQGI-4) ![][image41] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.4.1.13. Filter Haulage Bids** {#6.4.1.13.-filter-haulage-bids}

* The table will be filterable  
* The user will be able to filter on the following parameters  
  * Date (bid/desired delivery date)  
  * Material  
  * State  
  * Status  
* Submit behaviour must also occur after the user selects “enter”.

#### **6.4.1.14. View Haulage Bid Details** {#6.4.1.14.-view-haulage-bid-details}

* The user will be able to see updated detailed information about each offer in revised sections:  
  * Summary Information  
    * Bid amount (per load)  
    * Bid currency  
    * Number of loads  
    * Quantity per load  
    * Haulage total (per load x number of loads)  
    * Incoterms  
    * Status  
    * CTA buttons ([6.4.1.15](#6.4.1.15.-haulier-bid-approval-actions)).  
  * Buyer information:  
    * ID  
      * Selecting this will open the corresponding user details page as a new tab in the default browser.  
    * Name  
    * Company  
    * Country  
    * Destination warehouse  
      * The Location/Warehouse value is a clickable link.   
      * Selecting it opens a read-only modal titled “Location details – \<Location name\>”.  
      * The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details.  
    * Bid amount  
    * Number of loads bid on  
    * Incoterms  
    * Earliest \+ Latest Delivery  
  * Seller Information:  
    * ID  
      * Selecting this will open the corresponding user details page as a new tab in the default browser.  
    * Name  
    * Company  
    * Country  
    * Pick up location  
      * The Location/Warehouse value is a clickable link.   
      * Selecting it opens a read-only modal titled “Location details – \<Location name\>”.  
      * The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details.  
    * Material name (Product name schema)  
      * Selecting this will open the corresponding sales listing page as a new tab in the default browser.  
    * Packaging  
    * PERN  
    * Quantity available  
    * Loads remaining  
    * Avg weight per load  
    * Total price shared  
    * Price per tonne  
  * Haulier card:  
    * ID  
    * Name  
    * Company  
* Admin actions  
  * Approve, Reject, Request more information, ~~and Enable editing (allows the Haulier to amend before approval).~~  
  * Mark as Shipped button appears only after the Seller has marked “Pickup Confirmed”; otherwise, the control is disabled with helper text.  
  * ~~View Documents (when available): open a panel of haulage-related documents generated/attached after acceptance (read/download).~~

| Preconditions: The user is authenticated as an administrator. The user is viewing the haulage bids area of the Admin dashboard. Triggers: The Admin selects to “View Details” for a bid from the haulage bid table ([6.4.1.12](#6.4.1.12.-view-haulage-bids)). Acceptance Criteria: The page layout will replicate the existing “Offer details” screen, with the summary and haulage information added to it. The user will be able to see updated detailed information about each offer in revised sections: Summary banner Haulage total (including currency, amount per load x number of loads) Summary Information: Haulage bid Status Number of loads Bid currency Haulier bid amount (per load) Quantity per load (MT) Seller Information: ID Selecting this will open the corresponding user details page as a new tab in the default browser. Name Company Pick up location The Location/Country value is a clickable link.  Selecting it opens a read-only modal titled “Location details – \<Location name\>”. The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details. Material name Selecting this will open the corresponding sales listing page as a new tab in the default browser. Packaging Incoterms PERN Loads remaining Avg weight per load Total price shared (including currency) Price per metric tonne (including currency) Haulier Information: User ID Name Company name Container type Number of loads  Quantity per load (MT)  Haulage cost per load (including currency) Haulage total (including currency) Transport provider Suggested collection date Expected transit time Demurrage at destination (days) Notes Buyer information: ID Selecting this will open the corresponding user details page as a new tab in the default browser. Name Company Destination  The Location/Country value is a clickable link.  Selecting it opens a read-only modal titled “Location details – \<Location name\>”. The modal will contain the location information, as displayed in the Admin portal Members Account \> Locations \> View Location Details. Delivery window Incoterms Bid amount Number of loads bid on Price per metric tonne (including currency) Load Details (Shown only for accepted offers) The system will show a load details card per load within a haulage offer i.e. if there are 3 loads, 3 load detail cards will be shown. Load number X of X  e.g. 1 of 3 Collection date When was the load picked up Pulled from SF OR marked by the seller (Not in scope \- [6.1.4.1](#6.1.4.1.-mark-offer-“pickup-confirmed”)) Shipped date  When was the load marked as shipped Pulled from SF OR marked by admin [6.4.1.17.](#6.4.1.17.-mark-listing-as-shipped) Gross weight Pulled from SF OR marked by the seller (Not in scope \- [6.1.4.1](#6.1.4.1.-mark-offer-“pickup-confirmed”)) Pallet weight Pulled from SF OR marked by the seller (Not in scope \- [6.1.4.1](#6.1.4.1.-mark-offer-“pickup-confirmed”)) Action buttons: To approve/reject/request more information for a haulage bid ([6.4.1.15](#6.4.1.15.-haulier-bid-approval-actions)). To “Mark as Shipped” ([6.4.1.17](#6.4.1.17.-mark-listing-as-shipped)). The Mark as Shipped button is only shown when bid status \= Approved. Postconditions: The Admin will view full details for a haulage bid.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Data Load Error | "Unable to load haulage offer details. Please try again." |
| Information Error | "Unable to retrieve information. Please try again." |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |

| Design Name | Link |
| :---- | :---- |
| View Haulage Bid Details \- Pending | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21855-9762\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21855-9762&t=TzDhDk2ScPubsQGI-4) ![][image42] |
| View Haulage Bid Details \- Accepted | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22121-88580\&t=2VKx81HrYDas9Qay-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22121-88580&t=2VKx81HrYDas9Qay-4) ![][image43] |
| Location modal | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21921-54991\&t=hEc5kX0tITAQtdG6-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21921-54991&t=hEc5kX0tITAQtdG6-4) ![][image44] |

| Client Approved | yes |
| :---- | :---- |

#### 

#### **6.4.1.15. Haulier Bid Approval Actions** {#6.4.1.15.-haulier-bid-approval-actions}

* The following actions will be available through the details page.  
  * The user will be able to approve the bid  
    * The system will send an automated email to the Haulier informing them that their bid has been approved  
      * Copy to be provided by the WasteTrade team  
    * The status will be updated  
  * The user will be able to reject the haulage bid  
    * The system will send an automated email to the user informing them that their bid has been rejected  
      * Pre-set list of reasons (to be defined within the AC)  
    * The status will be updated  
  * The user will be able to indicate if more information is required  
    * The user will be able to send a message that will be sent to the applicant’s email address, and there will be an in-app notification  
    * The user will be able to “open” the bid to edits, allowing the Haulier to make changes and resubmit

| Preconditions: A haulage bid has been placed on an available load, and is shown to Admin ([6.4.1.12](#6.4.1.12.-view-haulage-bids)). Triggers: Admin selects “Approve”, “Reject” or “Request More Information”. Acceptance Criteria: Page Actions: Admin will be able to perform the following actions on the haulage bid details page: Approve Reject Request More Information If the offer is already Approved or Rejected buttons will be hidden. Approve Bid When the Admin approves a bid: The system will send an email/notification to the haulier informing them that their bid has been approved ([6.2.5.4](#6.2.5.4.-haulier-notifications)). The system will send an email/notification to the seller informing them that their purchase has had a haulage offer approved ([6.1.6.6](#6.1.6.6.-seller-notifications)) The haulage bid status will be updated to “Approved” In the Admin portal ([6.4.1.12](#6.4.1.12.-view-haulage-bids), [6.4.1.14](#6.4.1.14.-view-haulage-bid-details)). In the haulier platform ([6.2.3.1](#6.2.3.1.-view-my-haulage-offers), [6.2.3.2](#6.2.3.2.-view-haulage-offer-details)). Reject Bid Admin will be required to select a reason for rejection. Incomplete documentation Invalid company registration Duplicate account Unverified contact information Other (Admin to provide a custom reason) Input custom reason Upon confirming rejection: The system will send an email/notification to the haulier informing them that their bid has been rejected ([6.2.5.4](#6.2.5.4.-haulier-notifications)). The haulage bid status will be updated to “Rejected” In the Admin portal ([6.4.1.12](#6.4.1.12.-view-haulage-bids), [6.4.1.14](#6.4.1.14.-view-haulage-bid-details)). In the haulier platform ([6.2.3.1](#6.2.3.1.-view-my-haulage-offers), [6.2.3.2](#6.2.3.2.-view-haulage-offer-details)). Request More Information: Admin will be required to request more information for a bid Additional company documentation required Clarification on provided details Update on business address Other (Provide a custom request) Input custom request Upon confirming: The system will send an email/notification to the haulier informing them that their bid requires more information ([6.2.5.4](#6.2.5.4.-haulier-notifications)). The haulage bid status will be updated to “Rejected” In the Admin portal ([6.4.1.12](#6.4.1.12.-view-haulage-bids), [6.4.1.14](#6.4.1.14.-view-haulage-bid-details)). In the haulier platform ([6.2.3.1](#6.2.3.1.-view-my-haulage-offers), [6.2.3.2](#6.2.3.2.-view-haulage-offer-details)). Postconditions: The bid reflects the selected decision (Approved, Rejected, or More Information Required) and the haulier is notified via email and Notification Centre.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Approve Action Failure | "Failed to approve the bid. Please try again." |
| Reject Action Failure | "Failed to reject the bid. Please try again." |
| Request Info Action Failure | "Failed to request more information. Please try again." |
| Email Sending Failure | "Failed to send email. Please check the email configuration." |

| Design Name | Link |
| :---- | :---- |
| Approval Actions | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21862-101995\&t=hEc5kX0tITAQtdG6-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21862-101995&t=hEc5kX0tITAQtdG6-4) ![][image45]![][image46] |

| Client Approved | yes |
| :---- | :---- |

#### 

#### 

#### **6.4.1.16. Make an Offer on Behalf of a Haulier** 

* Reuses logic from [6.2.2.5.](#6.2.2.5.-make-an-offer)  
* The user will be able to make a haulage offer on an “Available Load” on behalf of a Haulier.  
* The user will be able to see the Load Details  
  * There will be a Seller card, providing the following information  
    * User ID, pickup location, average weight per load, material type, packaging, container type, loading times, site restrictions  
  * There will be a Buyer card, providing the following information  
    * User ID, destination location, site restrictions, loading times, desired delivery window, and number of loads bid on  
* The user will provide the following details to make a bid on behalf of a Haulier registered within the system  
  * Haulier  
    * Searchable dropdown  
    * Displays all Haulier names and companies within the system.  
  * Trailer/container type  
  * Are you completing Customs clearance?  
    * Note there will be a message: “If not, WasteTrade will handle Customs Clearance for a fixed fee of £200. This will be added to the Haulage Total”  
    * The user will input customs clearance per load, not as the total.  
  * Currency  
  * Number of loads \- not editable, view only  
  * Quantity per load (MT) \- not editable, view only  
  * Haulage cost per load  
    * Note: Please include the Weighbridge price if required  
  * Haulage total   
    * Automatic calculation (cost per load x number of loads)  
  * Transport provider  
    * Own haulage, third party, mixed  
  * Suggested collection date  
  * Expected transit time (drop-down selection)  
  * Demurrage and destination (days)  
    * Guidance text: “Please note this must be a minimum of 21 days.”  
    * Input of 20 days or less will prevent validation and display an appropriate error message.  
  * Notes  
    * Free text box  
    * This free text should not allow telephone numbers, email addresses or URLs.  
* The user will be able to submit the bid  
  * After submitting the bid, it will go to the Admin team for review 

#### 

#### **6.4.1.17. Mark Listing as Shipped**  {#6.4.1.17.-mark-listing-as-shipped}

* There will be a button in the haulage bid details to “Mark as Shipped”  
* Admin can mark a listing as “Shipped”  
  * Only after pickup is confirmed by the Seller ([6.1.4.1](#6.1.4.1.-mark-offer-“pickup-confirmed”))  
    * Attempting to mark a listing as shipped without pickup confirmation will prompt an error message.

| Preconditions: The haulage bid is Approved ([6.4.1.15](#6.4.1.15.-haulier-bid-approval-actions)). Admin is viewing the Haulage Bid Details page ([6.4.1.14](#6.4.1.14.-view-haulage-bid-details)). Seller marks Pickup Confirmed per load (out of scope for P2 \- [6.1.4.1](#6.1.4.1.-mark-offer-“pickup-confirmed”)). Triggers: Admin selects “Mark as Shipped” next to a load when viewing Load Details ([6.4.1.14](#6.4.1.14.-view-haulage-bid-details)). Acceptance Criteria: Control visibility & gating The Mark as Shipped button is only shown when bid status \= Approved. Not when the bid is Rejected or Withdrawn (no load details shown) Not when a load has already been Marked as Shipped. Each load card within the Load Details has a button to “Mark as Shipped” Unless the load has previously been marked as shipped, in which case it will display a green “Shipped” label. Review pickup information Selecting “Mark as Shipped” will open a confirmation modal containing: “Are you sure this load has been shipped and all relevant documentation is in order? This cannot be undone.” Confirm The system defines haulage bid status as Partially Shipped, unless it is the final load (i.e. load 3 of 3), in which case the status will become “Shipped”. The current date is shown in the Shipped Date field for the selected load. The “Mark as Shipped” date is removed for the selected load. Cancel Closes the modal without saving changes. Postconditions: The haulage bid status and trader bid status shows Partially Shipped/Shipped status  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Modal load failure | “We couldn’t load the shipping modal. Please try again later.” |
| Status update failure | “We couldn’t update the shipping status right now. Please try again. If the problem persists, contact support.” |

| Design Name | Link |
| :---- | :---- |
| Mark load as shipped (when viewing accepted bid details) | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22121-88580\&t=2VKx81HrYDas9Qay-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22121-88580&t=2VKx81HrYDas9Qay-4) ![][image47] |
| Mark as shipped modal | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21862-102016\&t=hEc5kX0tITAQtdG6-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21862-102016&t=hEc5kX0tITAQtdG6-4)  ![][image48] |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **6.4.1.18. View Sample Request Table** {#6.4.1.18.-view-sample-request-table}

* Sample requests will be shown in the Admin dashboard samples tab.  
* The table will show a list of all sample requests  
* The table will have the following columns  
  * Material name (Product name schema)  
    * Selecting this will open the corresponding sales listing page as a new tab in the default browser.  
  * Date  
  * Number of Samples  
  * Sample Size  
  * Buyer  
    * ID  
      * Selecting this will open the corresponding user details page as a new tab in the default browser.  
    * ~~Name~~  
    * ~~Company~~  
    * ~~Location~~  
  * Seller  
    * ID  
      * Selecting this will open the corresponding user details page as a new tab in the default browser.  
    * ~~Name~~  
    * ~~Company~~  
    * ~~Location~~  
  * Status  
    * Unsent  
    * Sent  
  * Received  
    * If “Unsent” displays a button for the Admin to select  
    * If “Sent” displays the date the sample was marked as received   
  * Posted  
    * If “Unsent” displays a button for the Admin to select  
    * If “Sent” displays the date the sample was marked as posted   
  * Label  
    * Displays a button for the Admin to upload/remove the postage label  
  * Cancel  
    * A button for the Admin to cancel the sample request  
  * Information tooltip  
    *  Displays sample request message (if applicable)  
  * Notes  
    * Admin can select to open the notes modal with a button to save

#### **6.4.1.19. View MFI Table** {#6.4.1.19.-view-mfi-table}

* The table will have the following columns  
  * Material name (Product name schema)  
    * Selecting this will open the corresponding sales listing page as a new tab in the default browser.  
  * Requested Date  
  * Buyer  
  * Seller  
  * ~~Requested~~  
    * ~~Button for Admin to select~~  
  * ~~Received~~  
  * Tested  
  * Delete  
    * Button for the Admin to delete the MFI test  
  * Notes  
    * Admin can select to open the notes modal with a button to save

#### **6.4.1.20. System Defined Status & State**

* This is an update to existing functionality within the system: updates are highlighted in yellow.  
* Currently, there is a State and Status for all Listings/Wanted Listings/Offers.  
  * Listings  
    * Status  
      * Available: If the listing is available from today or in the past  
      * Available from \<date\>: Display the date from which the material is available.  
      * Expired: The listing has expired after the set time  
      * Sold: All loads of the listing have been sold (when the user marks the listing as ‘sold’)  
      * Ongoing: Listing that has a defined number of loads until resetting at defined intervals.  
      * Rejected: Admin rejection \= listing/status is not shown to users  
    * State  
      * Pending: When the listing has just been created or is awaiting Admin approval / additional information  
      * Approved: When the listing has been approved by Admin and is visible to Buyers  
      * Rejected: When the listing has been rejected by admin  
  * Wanted Listings  
    * Status  
      * Pending: Displayed if the listing is waiting for Admin approval (6...)  
      * Material Required: Displayed if the required from date is today or in the past  
      * Material Required from \<date\>: Displays the future date from which the material is required  
      * Fulfilled: Approval \= becomes required/required from  
      * Rejected: Rejection \= listing is not shown  
    * State  
      * Pending: When the Buyer creates a listing but it is awaiting Admin approval / additional information  
      * Approved: When the listing has been approved by Admin and is visible to Sellers  
      * Rejected: When the listing has been rejected by admin  
  * Trade Offers  
    * Status  
      * Accepted (user accepted the bid already)  
      * Rejected (user rejected the bid already)  
      * Shipped (when marked as shipped)  
      * Pending  
    * State  
      * Active: When the offer is still valid  
      * Closed: When the offer has ended (Rejected or fully completed)  
* This should be updated to reflect:  
  * Listings  
    * Status  
      * Pending \- Pending when Admin has not made an approval action or has requested More Information Required (6.6.2.15)  
      * Available \- Listing is available now (today or past start date).  
      * Available from \<date\> \- Listing becomes available on the future date shown.  
      * Ongoing \- Recurs/resets by configuration.  
      * Sold \- All loads sold.  
      * Expired \- End date reached; no longer available.  
      * Rejected: Admin rejection \= listing/status is not shown to users  
    * State  
      * Pending: When the listing has just been created or is awaiting Admin approval/additional information  
      * Approved \- Visible to Buyers; normal trading.  
      * Rejected \- Not visible  
  * Wanted Listings  
    * Status  
      * Pending \- Pending when Admin has requested More Information Required (6.6.2.18)  
      * Material Required: Displayed if the required from date is today or in the past  
      * Material Required from \<date\>: Displays the future date from which the material is required  
      * Fulfilled: Approval \= becomes required/required from  
      * Rejected: Rejection \= listing is not shown  
    * State  
      * Pending: When the listing has just been created or is awaiting Admin approval/additional information  
      * Approved \- Visible to Buyers; normal trading.  
      * Rejected \- Not visible  
  * Trade Bid/Offers  
    * Status  
      * Pending (awaiting action)  
      * Accepted (user accepted the bid already)  
      * Rejected (user rejected the bid already)  
      * Partially Shipped/Shipped (when marked as shipped)  
  * Haulage Bids/Offers  
    * Status  
      * Accepted (user accepted the bid already)  
      * Rejected (user rejected the bid already)  
      * More Information Required (user required)  
      * Partially Shipped/Shipped (when marked as shipped)

| Scope & Preconditions: Applies to end-user surfaces (tables, cards, detail pages) and Admin views where Status/State are shown. Triggers: Any read of an entity. Any status/state-changing event. Acceptance Criteria: State indicators within the system should be updated to reflect: Listings Status Pending \- Pending when Admin has requested More Information Required (6.4.2.15) Available \- Listing is available now (today or past start date). Available from \<date\> \- Listing becomes available on the future date shown. Ongoing \- Recurs/resets by configuration. Sold \- All loads sold. Expired \- End date reached; no longer available. Rejected: Admin rejection \= listing/status is not shown to users Admin State Pending: When the listing has just been created or is awaiting Admin approval/additional information Approved \- Visible to Buyers; normal trading. Rejected \- Not visible Wanted Listings Status Pending \- Pending when Admin has requested More Information Required (6.4.2.18) Material Required: Displayed if the required from date is today or in the past Material Required from \<date\>: Displays the future date from which the material is required Fulfilled: Approval \= becomes required/required from Rejected: Rejection \= listing is not shown Admin State Pending: When the listing has just been created or is awaiting Admin approval/additional information Approved \- Visible to Buyers; normal trading. Rejected \- Not visible Trade Bid/Offers Status Pending (awaiting action) Accepted (user accepted the bid already) Rejected (user rejected the bid already) Load \<x of X\> Shipped (when marked as shipped) Haulage Bids/Offers Status Accepted Rejected More Information Required Load \<x of X\> Shipped (when marked as shipped) The field “State” throughout the admin portal should be updated to show “Admin State”. ![][image49] Postconditions: All surfaces consistently show the defined Status and Admin State values.  |
| :---- |

| Client Approved | yes |
| :---- | :---- |

#### 

#### **6.4.1.21. Notes**

* As an admin, I want to access internal notes within tables in the Admin dashboard, so my team can capture context without leaving the platform.  
* Notes buttons will be displayed in each Admin dashboard table:  
  * Users ([6.4.1.2](#6.4.1.2.-view-users-table))  
  * Listings ([6.4.1.5](#6.4.1.5.-view-listings-table))  
  * Wanted Listing ([6.4.1.7](#6.4.1.7.-view-wanted-listings-table))  
  * Offers ([6.4.1.9](#6.4.1.9.-view-offers-table))  
* Clicking Notes opens a notes modal for that specific record  
* Admins can add/edit/clear notes in a multiline text area.   
  * Changes will save automatically when the modal is closed.  
* There will be a brief saving state and a success toast after close/save; on error, the modal will remain open and show a retry message.  
* The modal will display “Last edited by \<Admin user name\>, \<date\>, \<timestamp\>” in the modal footer for quick traceability.

#### **6.4.1.22. Assign Admin**  {#6.4.1.22.-assign-admin}

* As an admin, I want to assign a responsible Admin for any User, Listing, Wanted Listing, or Offer directly from the dashboard tables, so the team has clear context and ownership without leaving the platform.  
* Assign Admin dropdowns will be displayed in each Admin dashboard table:  
  * Users ([6.4.1.2](#6.4.1.2.-view-users-table))  
  * Listings ([6.4.1.5](#6.4.1.5.-view-listings-table))  
  * Wanted Listing ([6.4.1.7](#6.4.1.7.-view-wanted-listings-table))  
  * Offers ([6.4.1.9](#6.4.1.9.-view-offers-table))  
* Assignee control (per row):  
  * A dropdown at the start of each row lets admins set the Responsible admin.  
  * The options list will display the first and last names of all active (not archived) Admin users.  
* Selection autosaves with a brief saving state; on error, revert to the previous value and show a retry message.  
* The first and last name of the selected assignee is shown in the dropdown.

### 6.4.2. User Management  {#6.4.2.-user-management}

This section relates specifically to the management of admin-level users within the WasteTrade team.

#### **6.4.2.1. View All Users** {#6.4.2.1.-view-all-users}

* The users will be able to see a summary table of all the WasteTrade users in the Admin system.  
* The table will have the following columns  
  * Name  
    * First name  
    * Last name  
  * Date of account creation  
  * Email address  
  * Role  
    * Super Admin  
    * Admin  
  * Status  
    * Active  
    * Archived   
* The table will have pagination  
* The user will be able to select the number of rows per page  
  * 10  
  * 20  
    * Default  
  * 50  
  * All  
* By default, the table is sorted by First Name \- ascending

| Preconditions: The user is authenticated as a Super Admin or Admin. Admin users exist within the Admin portal. Triggers: The user selects User Management from the navigation to open View All Users. Acceptance Criteria: Table Contents Render a summary table of all WasteTrade users. Columns: Name First name, Last name Date of account creation dd/mm/yyyy Email address Role Super Admin Admin Sales Admin Status Active Archived “View Details” button ([6.4.2.2](#6.4.2.2.-view-user-details)) Display Settings Default sort: First name (ascending) on initial load. The user will be able to select the number of rows per page: 10 20 Default 50 100 If applicable, pagination controls show “Previous” and “Next” buttons and page numbers; show total results and current range (e.g., “21–40 of 86”). Postconditions: Super Admin can view a complete list of all Admin users.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| User management page load failure | "Failed to load Admin users. Please refresh the page to try again." |
| Unable to load users | "No Admin users found. Check back later." |

| Design Name | Link |
| :---- | :---- |
| View all users | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21855-63141\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21855-63141&t=TzDhDk2ScPubsQGI-4) ![][image50] |

| Client Approved | yes |
| :---- | :---- |

#### 

#### **6.4.2.2. View User Details**  {#6.4.2.2.-view-user-details}

* Users will be able to view details for Admin users  
  * Super Admins and Admins can view details of all users  
* The user will be able to click on a row within the table to access the record  
* The following details will be displayed  
  * First Name  
  * Last Name  
  * Email address  
  * Phone number  
  * Role  
    * e.g. Super Admin, Admin  
  * Status  
    * Active  
    * Archived (visual differentiation required)  
      * Time and date stamp for last app access  
        * HH: MM, DD/MM/YYYY

| Preconditions: The user is authenticated as a Super Admin or Admin. Admin users exist within the Admin portal. Triggers: The user selects View Details on the user management table ([6.4.2.1](#6.4.2.1.-view-all-users)).  Acceptance Criteria: The header will show the user full name and a “Return to users table” button. The user details page will contain: First Name Last Name Email address Phone number  Role Super Admin Admin Sales Admin Status Active Archived Last app access Timestamp in HH:MM, DD/MM/YYYY Postconditions: The Admin successfully views the selected user’s read-only profile details; no edits occur in this story.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| User details fail to load | “We couldn’t load user details. Please refresh and try again.” |
| User details not found | “We couldn’t find this user.” |
| Missing last access timestamp | “Unable to find recent activity. Please check again later.” |

| Design Name | Link |
| :---- | :---- |
| View user details | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21864-108331\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21864-108331&t=TzDhDk2ScPubsQGI-4) ![][image51] |

| Client Approved | yes |
| :---- | :---- |

#### 

#### **6.4.2.3. Add a New User**

* Only Super Admin/Admin users can add new users  
* The following details will need to be provided when setting up a new account  
  * First Name  
  * Last Name  
  * Email address  
  * Phone number  
  * Role  
    * Super Admin (only Super Admins can add new Super Admins)  
    * Admin  
* On submitting the data, the system will send an email containing the Set Password token

| Preconditions: The user is authenticated as a Super Admin or Admin. Admin users exist within the Admin portal. Triggers: The user selects “Add Admin” on the user management page ([6.4.2.1](#6.4.2.1.-view-all-users)). Acceptance Criteria: Upon selecting “Add Admin” a modal will open containing: “Add New Admin” title Fields for: First name Last name Email address Phone number Role Super Admin Admin Sales Admin Only Super Admin can select “Super Admin”. Disabled with hover over tooltip displaying: “Only Super Admins can add other Super Admins.” “Cancel” button Discards input without saving. “Save” button Validates fields. If validation fails, prevent submission and show inline errors. If validation is successful: Admin user is created. Default status \= Active. Show the new user in the Admin user management table ([6.4.2.1](#6.4.2.1.-view-all-users)). Show success “Admin user created.” Returns admin to view the saved user details ([6.4.2.2](#6.4.2.2.-view-user-details)). The new Admin user will receive an email to set their password.  Reuse existing logic for set password from trading/haulier platform (Phase 1 \- 6.2.1.4 Set password). After successful password reset, direct Admin user to the Admin homepage. Admin Set Password Email Template: Subject: “WasteTrade Admin \- Set Your Password” Body: “Hi \<First Name\>,Welcome to WasteTrade. Your admin has created an account for you. To get started, please set your password using this secure link.This link does not expire. It will remain valid until you successfully set your password, after which it will be automatically invalidated.If you didn’t expect this email, you can safely ignore it. Your account won’t be accessible until a password is set.Best regards,The WasteTrade Team” Link: Link directs the admin to the password setup route defined in Phase 1 – 6.2.1.4. No time-based expiry; mark token “used” and invalidate immediately after successful password set. Permissions Existing Admin users will retain Super Admin status. Effective immediately after account creation. Access: Super Admin: access to everything (Dashboard, User Management, Settings). Admin: access to Dashboard, User Management; no Settings. Sales Admin: Admin Dashboard only. Postconditions: Super Admin or Admin successfully add a new admin user, with the new admin user receiving an email to set their password.  |
| :---- |

| Field  | Data Dictionary |
| :---- | :---- |
| First Name | Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters. Mandatory. |
| Last Name | Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters. Mandatory. |
| Email Address | Input Type: Email; Constraints: Must include “@” Valid email format. Must be unique within the Admin platform. Mandatory. |
| Phone Number | Input Type: Text; Constraints: Numeric, Max 15 digits; Mandatory. |
| Role | Dropdown. Options: Super Admin, Admin, Sales Admin. Only Super Admin can select Super Admin. Mandatory. |

| Use Case | Error Message |
| :---- | :---- |
| Add new Admin modal failure to load | “Unable to load new user modal. Please try again.” |
| Missing mandatory field (generic for any field) | “Please complete all required fields.” |
| Invalid first/last name | “Enter a valid name, max 50 characters.” |
| Invalid phone number | “Enter a valid phone number (digits and \+, up to 15).” |
| Invalid email format | “Please enter a valid email address.” |
| Existing email | “This email is already in use by another admin.” |
| Save failure | “We couldn’t create this user right now. Please try again. If the problem persists, contact support.” |

| Design Name | Link |
| :---- | :---- |
| Add new user | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21858-64558\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21858-64558&t=TzDhDk2ScPubsQGI-4) ![][image52] |

| Client Approved | yes |
| :---- | :---- |

#### 

#### **6.4.2.4. Edit User Details** 

* Users will be able to edit user details.  
  * Super Admins and Admins can edit the details of all users  
* All users can edit their details   
  * First Name  
  * Last Name  
  * Phone number  
* Only Super Admins can edit a user's role.  
* The user will be asked to confirm the changes before exiting the “edit user details” functionality

| Preconditions: The user is authenticated as a Super Admin or Admin. Admin users exist within the Admin portal. Triggers: The user selects “Edit” on the user details page ([6.4.2.2](#6.4.2.2.-view-user-details)). Acceptance Criteria: Upon selecting “Edit” a modal will open containing: “Edit Admin” title Pre-filled fields for: First name Last name Email address Phone number Role Super Admin Admin Sales Admin Only Super Admin can change an existing admin's role.  Disabled for Admins with hover over tooltip displaying: “Only Super Admins can modify an existing user role.” “Cancel” button Discards input without saving. “Save” button Validates fields. If validation fails, prevent submission and show inline errors. If validation is successful: Admin user information is updated. Show success “Admin information updated.” Returns admin to view the saved user details ([6.4.2.2](#6.4.2.2.-view-user-details)). Postconditions: Super Admin or Admin successfully edit an admin user’s details.  |
| :---- |

| Field  | Data Dictionary |
| :---- | :---- |
| First Name | Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters. Mandatory. |
| Last Name | Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters. Mandatory. |
| Email Address | Input Type: Email; Constraints: Must include “@” Valid email format. Must be unique within the Admin platform. Mandatory. |
| Phone Number | Input Type: Text; Constraints: Numeric, Max 15 digits; Mandatory. |
| Role | Dropdown. Options: Super Admin, Admin, Sales Admin. Only Super Admin can edit. Mandatory. |

| Use Case | Error Message |
| :---- | :---- |
| Edit Admin modal failure to load | “Unable to load edit user modal. Please try again.” |
| Missing mandatory field (generic for any field) | “Please complete all required fields.” |
| Invalid first/last name | “Enter a valid name, max 50 characters.” |
| Invalid phone number | “Enter a valid phone number (digits and \+, up to 15).” |
| Invalid email format | “Please enter a valid email address.” |
| Existing email | “This email is already in use by another admin.” |
| Save failure | “We couldn’t save updates for this user right now. Please try again. If the problem persists, contact support.” |

| Design Name | Link |
| :---- | :---- |
| Edit User Details | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21858-64726\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21858-64726&t=TzDhDk2ScPubsQGI-4) ![][image53] |

| Client Approved | yes |
| :---- | :---- |

#### 

#### **6.4.2.5. Archive/Unarchive Users**

* Only Super Admins can archive/unarchive a user  
* Once archived, the user will not be able to access their account until unarchived by a Super Admin  
* The user will be asked to confirm the action:  
  * Do you want to archive this user?  
    * Yes: send an email to the user concerned.   
      * Copy to be written  
    * No: return to the previous page  
  * Do you want to unarchive this user?  
    * ~~Yes: the user will be invited to set their password.~~   
    * No: return to the previous page

| reconditions: The user is authenticated as a Super Admin or Admin. Admin users exist within the Admin portal. Triggers: The user selects “Archive” or “Unarchive” on the user details page ([6.4.2.2](#6.4.2.2.-view-user-details)). Acceptance Criteria: Button Visibility When viewing an “Active” user, the “Archive” button will be visible on the user details page ([6.4.2.2](#6.4.2.2.-view-user-details)). When viewing an “Archived” user, the “Unarchive” button will be visible on the user details page ([6.4.2.2](#6.4.2.2.-view-user-details)). Archiving a User Confirmation Dialog “Do you want to archive this user? This will remove any assignments, affected items will require re-assigning.” Cancel Close dialogue; return to previous view with no changes. Confirm Set status \= Archived. UI success toast: “User archived.” Immediately revoke access: Block future logins. Invalidate active sessions/tokens for this user. Remove the user from the assignment dropdown/remove current assignment to items ([6.4.1.22](#6.4.1.22.-assign-admin)). Send an email to the user informing them their account has been archived. Subject: “WasteTrade Admin \- Your Account Has Been Archived” Body: “Hi \<First Name\>,We’re letting you know that your WasteTrade account has been archived by an administrator. While archived, you won’t be able to sign in or access the platform.If you believe this was a mistake or have any questions, reply to this message or contact support@wastetrade.com.Best regards,The WasteTrade Team” Unarchiving a User Confirmation Dialog “Do you want to archive this user?” Cancel Close dialog; return to previous view with no changes. Confirm Set status \= Active. UI success toast: “User unarchived. Original user credentials are now valid.” List & Details Behaviour User management area (user table/user details) shows Status column reflecting Active/Archived. Archived users remain visible to admins with the Archived status; end-users cannot access the platform. Postconditions: Archive: User is Archived, cannot access their account, email notification sent, audit recorded. Unarchive: User is Active, can access admin platform using their existing credentials.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Concurrent user edits | “This user has changed since you opened it. Please refresh to review the latest version.” |
| Confirm failure | “We couldn’t update the user status right now. Please try again. If the problem persists, contact support.” |

| Design Name | Link |
| :---- | :---- |
| Confirm Archive | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21869-108356\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21869-108356&t=TzDhDk2ScPubsQGI-4) ![][image54] |

| Client Approved |  |
| :---- | :---- |

#### 

### ~~6.4.3. Resource Content Management~~ {#6.4.3.-resource-content-management}

#### **~~6.4.3.1. View all Resources~~**

* ~~The user will be able to see a master table that contains all the support resources~~  
* ~~The table will have the following columns~~  
  * ~~Date added/last edit~~  
  * ~~Author~~  
  * ~~Title~~  
  * ~~Type~~  
    * ~~FAQ~~  
    * ~~Article~~  
  * ~~Status~~  
    * ~~Live~~  
    * ~~Draft~~   
    * ~~Deleted~~  
* ~~The user can open the details for any item by clicking on the row~~  
* ~~The table will have pagination~~  
* ~~The user will be able to select the number of rows per page~~  
  * ~~10~~  
  * ~~20~~  
    * ~~Default~~  
  * ~~50~~  
  * ~~All~~  
* ~~By default, the latest/newest content will be displayed first~~   
* ~~The user will be able to click on any row to open the item~~

#### **~~6.4.3.2. Search Resources~~**

* ~~Reuses logic from [6.3.1.3.](#6.3.1.3.-search-articles)~~  
* ~~The user will be able to perform a search on the resources table~~  
* ~~The user will be able to enter their search term in the search box~~  
  * ~~Submit behaviour must also occur after the user selects “enter”.~~  
  * ~~The system will search all data in the table~~  
  * ~~Records will be matched by words within the article/FAQ title, question or keyword.~~  
* ~~Deleted records will also be searched and displayed, but will be greyed out in the table~~

#### **~~6.4.3.3. Sort Resources~~**

* ~~The user will be able to view the “View all content” table~~  
* ~~The user will be able to sort the user table on all the columns~~

#### **~~6.4.3.4. Filter Resources~~**

* ~~The user will be able to apply filters to the Resources table~~  
* ~~The user will be able to filter all of the columns~~  
* ~~Submit behaviour must also occur after the user selects “enter”.~~

#### **~~6.4.3.5. Add a New Article~~**

* ~~The WasteTrade team will be able to add new pieces of content~~  
* ~~The user will need to provide the following information:~~  
  * ~~Type~~  
    * ~~User guide article~~  
    * ~~FAQ~~   
  * ~~Article title~~   
  * ~~Title image~~  
    * ~~Alt text~~  
  * ~~Body text~~  
  * ~~Images/Videos ([6.4.3.7](#6.4.3.7.-add-images/videos-to-resources))~~  
  * ~~Keywords~~  
* ~~The user will be able to either~~  
  * ~~Publish~~  
  * ~~Save as draft~~  
  * ~~If the user does not choose either option, they will be informed that the content will not be saved (when they try to leave the page)~~  
* ~~The author will automatically be the person whose account is used to create the content.~~

#### **~~6.4.3.6. Add a New FAQ~~**

* ~~The user will be able to add a new FAQ~~  
* ~~The user will need to provide the following information:~~  
  * ~~Type~~  
    * ~~Article~~   
    * ~~FAQ~~   
  * ~~Content~~  
    * ~~Question (maximum 50 words)~~  
    * ~~Answer (maximum 250 words)~~  
    * ~~Images~~  
  * ~~Keywords~~  
* ~~The user will be able to either~~  
  * ~~Broadcast (go-live)~~  
  * ~~Save as draft~~  
  * ~~If the user does not choose either option, they will be informed that the content will not be saved (when they try to leave the page)~~

#### **~~6.4.3.7. Add Images/Videos to Resources~~** {#6.4.3.7.-add-images/videos-to-resources}

* ~~The user will be able to add images/videos as part of an article or FAQ~~  
* ~~The user will be able to add images to articles and FAQs~~  
  * ~~There will be a way for the user to position the imagery where it is needed~~  
  * ~~The user will be able to resize the imagery~~  
  * ~~The user will be able to upload from their device~~  
    * ~~Accepted formats: JPEG, PNG, SVG, PDF~~  
  * ~~The user must provide “alt text” for the images~~  
* ~~The user will be able to add videos to articles~~   
  * ~~The user will be able to select a cover photo from the video~~  
  * ~~The user will be able to upload from their device~~  
    * ~~Accepted formats: AVI, MP4, or MOV~~  
  * ~~The user must provide “alt text” for the video~~

#### **~~6.4.3.8. View an Individual Resource Article/FAQ~~**

* ~~The user will be able to view each piece of support content~~  
* ~~The following details will be visible~~  
  * ~~Date added/last edit~~  
  * ~~Author~~  
  * ~~Title~~  
  * ~~Type~~  
    * ~~FAQ~~  
    * ~~Article~~  
  * ~~Content~~  
  * ~~Keywords~~  
  * ~~Status~~  
    * ~~Live~~  
    * ~~Draft~~   
    * ~~Archived~~  
    * ~~Deleted~~  
* ~~The author will automatically be the person whose account is used to create the content~~	  
* ~~The user will be able to access edit mode through this page~~

#### **~~6.4.3.9. Edit an Individual Article/FAQ~~**

* ~~The user will be able to edit the following items~~  
  * ~~Title~~  
  * ~~Content~~   
    * ~~As per the requirements defined in the Add a new Article and Add a new FAQ stories~~  
    * ~~An FAQ cannot be transformed into an Article (and vice versa)~~  
  * ~~If the user tries to leave the page without saving, a warning message will be shown:~~  
    * ~~“Don’t forget to save your changes, or else they will be lost.”~~  
      * ~~Save changes~~  
        * ~~Saves changes and updates content (live or draft)~~  
      * ~~Save as draft~~  
        * ~~The article/FAQ will not be live in this case~~  
      * ~~Discard changes~~  
        * ~~No changes will be made to the live/draft content~~

#### **~~6.4.3.10. Delete an Article/FAQ~~**

* ~~The user will be able to delete the Article/FAQ from the Resources table or the item’s page~~  
* ~~The user will be asked to confirm the deletion~~  
  * ~~Yes \- remove the article from the live view~~  
    * ~~A draft article’s status will change to “deleted” and will not be visible unless searched for or isolated using the filters.~~

### 6.4.4. Settings {#6.4.4.-settings}

#### **6.4.4.1. Create an Audit Trail** {#6.4.4.1.-create-an-audit-trail}

* This is an update to existing functionality within the Admin portal; updates are highlighted in yellow.  
* The capture of actions within the audit trail will be limited to remove unnecessary actions:  
  * ~~Audit Trails~~  
    * ~~View audit trail (/audit-trails)~~  
    * ~~Export audit trail (/audit-trails/export)~~  
  * Company Management  
    * Manage new members (/companies/new-members)  
    * Manage specific company (/companies/{id})  
  * Company Documents  
    * Access company documents (/company-documents)  
    * ~~View personal documents (/company-documents/me)~~  
    * Upload multiple files (/upload-multiple-files)  
  * Company Locations  
    * Manage locations (/company-locations)  
  * Listing Management  
    * ~~View all listings (/listings)~~  
    * Manage sell listings (/listings/sell)  
    * Manage wanted listings (/listings/wanted)  
    * Manage user listings (/listings/user)  
  * Admin review of company listings (/listings/admin/companies)  
    * Manage specific listing (/listings/{id})  
    * Accept listing (/listings/admin/{id}/accept)  
    * Reject listing (/listings/admin/{id}/reject)  
    * Request information on listing (/listings/admin/{id}/request\_information)  
  * Offer Management  
    * ~~View all offers (/offers)~~  
    * Manage offers (/offers/admin)  
  * Manage specific offer (/offers/{id})  
    * Accept offer (/offers/{id}/accept or /offers/admin/{id}/accept)  
    * Reject offer (/offers/{id}/reject or /offers/admin/{id}/reject)  
  * User Management  
    * Manage specific user (/users/admin/{id})  
    * Approve user (/users/admin/{id}/approve)  
  * Other  
    * View listing requests (/listing-requests)  
    * Login (/login)

| Scope & Preconditions: Update to Create an audit trail (Phase 1 \- 6.6.9.1) within the Admin portal. The existing audit views (list, filters, exports) remain available. Triggers: A platform event occurs (login, create listing, approve application, etc.), and is logged in the audit trail. A super admin opens the Audit page. Acceptance Criteria: Visibility Currently when viewing the admin trail there is a column for “Action”. Phase 1  Actions Catalogue The action description must be detailed enough to understand what was performed. Actions may include: login, logout, create listing, update profile, approve application, etc. A predefined list of possible actions must be maintained for consistency. Phase 2 The actions catalogue (shown in[WasteTrade Emails/Q\&A](https://docs.google.com/spreadsheets/d/1u8Iu2vvNOFx4-wY9g6HXbobqzL2lxCJxPjzB94qeYOM/edit?gid=1782938586#gid=1782938586)) must be refined to remove unnecessary or irrelevant actions, relating to viewing. “View” actions are not needed. See Struck-through actions within the Action Log sheet for actions to be removed. Historical Records Existing entries for deprecated actions remain visible, searchable, and exportable. Postconditions: No new audit entries are created for deprecated (removed) actions. Admin can view a concise audit trail.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |

| Design Name | Link |
| :---- | :---- |
| Audit trail | [https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21870-108445\&t=TzDhDk2ScPubsQGI-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21870-108445&t=TzDhDk2ScPubsQGI-4) ![][image55] |

| Client Approved | yes |
| :---- | :---- |

#### 

#### 

#### **6.4.4.2. Enhanced Filter Audit Trail**

* This is an update to existing functionality within the Admin portal: updates are highlighted in yellow.  
* Audit Access:  
  * Super Admins can access an ‘Audit’ area via settings to download audit logs within the system.  
  * The settings page will include an ‘Audit Download’ section with functionality to filter and download an audit CSV.  
* Download Functionality:  
  * The system must allow the user to download the audit trail in CSV format.  
  * The CSV file must include all logged actions with the following details:  
    * Timestamp  
    * Name of User  
    * Type (WasteTrade, Trader, Haulier)  
    * Organisation  
    * Role of User  
    * Action  
* Filter Options:  
  * The user must be able to apply the following filters before downloading audit trail:  
    * Date Range: Users can select a start date and an end date to filter the logs within that specific range.  
    * User: Users can filter the logs by a specific user.  
    * Organisation: Users can filter the logs by a specific organisation.  
    * Role: Users can filter the logs by a specific role (e.g., Super Admin, Admin, Buyer, Seller).  
    * Action: Users can filter the logs by a specific action.  
* Date Range Filter:  
  * The date range filter must allow users to select both start and end dates.  
  * The system must validate that the end date is not earlier than the start date.  
* User Filter:  
  * The user filter must provide a searchable dropdown list of all users who have performed actions in the system.  
* Organisation Filter:  
  * The organisation filter must provide a searchable dropdown list of all organisations recorded in the audit trail.  
* Role Filter:  
  * The role filter must provide a dropdown list of predefined roles available in the system (e.g., Super Admin, Admin, Buyer, Seller).  
* Action Filter:  
  * The action filter must provide a searchable dropdown list of predefined actions:  
    * Company Management  
      * Manage new members (/companies/new-members)  
      * Manage specific company (/companies/{id})  
    * Company Documents  
      * Access company documents (/company-documents)  
    * Company Locations  
      * Manage locations (/company-locations)  
    * Listing Management  
      * Manage sell listings (/listings/sell)  
      * Manage wanted listings (/listings/wanted)  
      * Manage user listings (/listings/user)  
    * Admin review of company listings (/listings/admin/companies)  
      * Manage specific listing (/listings/{id})  
      * Accept listing (/listings/admin/{id}/accept)  
      * Reject listing (/listings/admin/{id}/reject)  
      * Request information on listing (/listings/admin/{id}/request\_information)  
    * Offer Management  
      * Manage offers (/offers/admin)  
    * Manage specific offer (/offers/{id})  
      * Accept offer (/offers/{id}/accept or /offers/admin/{id}/accept)  
      * Reject offer (/offers/{id}/reject or /offers/admin/{id}/reject)  
    * User Management  
      * Manage specific user (/users/admin/{id})  
      * Approve user (/users/admin/{id}/approve)  
    * Other  
      * View listing requests (/listing-requests)  
      * Login (/login)  
      * Upload multiple files (/upload-multiple-files)

| Scope & Preconditions: Update to Create an audit trail (Phase 1 \- 6.6.9.1) within the Admin portal. The existing audit views (list, filters, exports) remain available. Triggers: A platform event occurs (login, create listing, approve application, etc.), and is logged in the audit trail. An admin opens the Audit page. Acceptance Criteria: Phase 1 Currently the admin can filter by: Date Range User Organisation Role Phase 2 This will be expanded to allow filtering by Action. The pre-defined actions list ([6.4.4.1](#6.4.4.1.-create-an-audit-trail)) will be shown as a dropdown. There will also be an option for “All” Default selection. Admin can select an action from the list. Existing filter behaviour will remain unchanged. Postconditions: Admin can filter the audit trail by action.  |
| :---- |

| Field  | Data Dictionary |
| :---- | :---- |
| Action | Input Type: Dropdown. Options: Predefined list of actions. Single selection. Optional. |

| Use Case | Error Message |
| :---- | :---- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| Filtering operation fails | “Filtering failed. Please try again later.” |

| Design Name | Link |
| :---- | :---- |
| Audit Trail | ![][image56][https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21675-67788\&t=agaM0kh6K9gZbJyL-4](https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21675-67788&t=agaM0kh6K9gZbJyL-4)  |

| Client Approved | Yes |
| :---- | :---- |

#### 

#### **~~6.4.4.3. Define PERN~~** {#6.4.4.3.-define-pern}

* ~~Within settings, admins will be able to globally set the PERN value, the PERN Margin and the exchange rate margin.~~  
* ~~The Admin will be able to update:~~  
  * ~~PERN~~  
    * ~~£ per Metric tonne~~  
    * ~~Numerical input~~  
    * ~~Mandatory~~  
  * ~~PERN Margin~~  
    * ~~£ per load~~  
    * ~~Numerical input~~  
    * ~~Mandatory~~  
      * ~~Default £5~~  
  * ~~Exchange rare margin~~  
    * ~~£ per exchange~~  
    * ~~Numerical input~~  
    * ~~Mandatory~~  
      * ~~Default £5~~  
* ~~The global PERN value will feed back into the WasteTrade Price Calculator for updated calculation ([7.1.0.4](#7.1.0.4.-wastetrade-price-calculator)).~~

#### **~~6.4.4.4. View Price Calculator~~**

* ~~Within settings, admins will be able to view the integrated price calculator.~~

#### **~~6.4.4.5. Edit Terms & Conditions/Privacy Policy~~**

* ~~As a Super Admin, I want to edit the single source of truth for the site’s Terms & Conditions and Privacy Policy.~~  
* ~~Within settings, there will be a “Legal” section with two “Manage” buttons~~  
  * ~~“Manage Terms & Conditions”~~  
  * ~~“Manage Privacy Policy”~~  
* ~~Selecting one of the buttons opens a rich-text editor~~  
  * ~~Displays the current version by default.~~  
  * ~~Super Admin can edit the text content.~~  
* ~~There will be a confirmation modal for users to “Save” or “Discard Changes”~~  
* ~~Upon “Save”, links to T\&Cs and Privacy Policy always render the latest version.~~

## **6.5. Salesforce Integration** {#6.5.-salesforce-integration}

### 6.5.1. Data Exchange {#6.5.1.-data-exchange}

#### **6.5.1.1. Push Haulier Data**

* The system will push all the Haulier data captured during the onboarding process into a CRM, ensuring there is no duplication of effort in customer relationship management.  
* The following data will be pushed:  
  * Onboarding data  
  * Organisational details  
  * Commercial activity  
* The data to be captured and pushed includes:  
  * Onboarding data  
    * Pushed to SF as a Lead on Registration  
    * Individual info updated in SF to a Contact upon Verification  
    * Company info updated in SF to an Account upon Verification  
  * Organisational details  
  * Commercial activity  
    * Including Sales and wanted listings  
  * Transactional records (included within commercial activity)  
* Data to be mapped according to [WT Salesforce CRM data](https://docs.google.com/spreadsheets/d/1INMdcIWUkvxOB13M2xrz5qCVZsq8xSGlrX-6ioFHQfo/edit?gid=917272669#gid=917272669)

#### **6.5.1.2. Basic User Management**

* The WasteTrade team will be able to use the CRM to update   
  * View all user details (regardless of verification status)  
  * Edit individual profile fields  
  * View/edit account status

#### **6.5.1.3. Expanded User Management** 

* The WasteTrade team will be able to use the CRM to:  
  * Approve members  
  * Reject members  
  * Ask for more information  
    * The Platform users (Trading/Haulier) will be informed on the portal

#### **6.5.1.4. Listing/Bid Management** 

* Managing Bid Status:  
  * All status-related information will be pushed into the CRM  
    * Buyer details  
    * Seller details   
    * Material details   
    * Bid details   
* Managing Sales Listings:  
  * All sales listing-related information will be pushed into the CRM  
    * Seller details   
    * Material details   
    * Bid status  
* Managing Wanted Listings:  
  * All wanted listings related information will be pushed into the CRM  
    * Buyer details   
    * Material required   
    * Listing status   
* Managing Haulage Bids:  
  * All haulage bid-related information will be pushed into the CRM  
    * Buyer details   
    * Seller details   
    * Material details   
    * Bid details

### 6.5.2. Document Generation {#6.5.2.-document-generation}

#### **~~6.5.2.1. Document Generation for Accepted Bids~~**

* ~~Must generate documents for viewing via the web or mobile app.~~  
* ~~Automatic Document Generation:~~  
  * ~~Ensure that the system automatically generates the required documentation once a bid is accepted by a Seller.~~  
  * ~~The documentation generation should be triggered without manual intervention, ensuring a seamless process flow.~~  
* ~~Document Details Display:~~  
  * ~~Display the following information for each generated document:~~  
  * ~~Title: The name of the document.~~  
  * ~~Description: A brief description of the document’s purpose and contents.~~  
  * ~~This information should be clear and concise to help users understand the significance of each document.~~  
* ~~List of Documents to be Generated:~~  
  * ~~Automatically generate and list the following documents, pertinent to the transaction:~~  
    * ~~Annex VII~~  
    * ~~CMR (Consignment Note)~~  
    * ~~Packing List~~  
    * ~~Green Sheet~~  
    * ~~Duty of Care~~  
    * ~~Sales Invoice~~  
    * ~~Purchase Order~~  
  * ~~Ensure all documents comply with the relevant legal and trade regulations.~~  
* ~~Document Access and Download:~~  
  * ~~Provide functionality for users to view and download each document directly from the platform.~~  
  * ~~Ensure the download process is straightforward and secure, allowing users to easily obtain copies of the documents for their records.~~  
* ~~Usability and Accessibility:~~  
  * ~~Make sure that the document viewing and downloading interface is user-friendly and accessible to all users, including those with disabilities.~~  
  * ~~Provide adequate instructions or tooltips to assist users in navigating the document management features.~~  
* ~~Security and Privacy:~~  
  * ~~Implement robust security measures to ensure that document access is restricted to authorised users only.~~  
  * ~~Ensure that sensitive information within the documents is adequately protected, both in transit and at rest.~~  
* ~~Error Handling and Notifications:~~  
  * ~~Provide clear error messages if document generation fails or if documents cannot be accessed or downloaded.~~  
  * ~~Notify the user immediately upon successful generation of documents and make them aware of where and how they can access these documents.~~  
* ~~Performance Metrics:~~  
  * ~~Optimise the system to handle document generation quickly and efficiently, minimising the wait time for users.~~  
  * ~~Ensure that the system can handle multiple simultaneous document generations without degradation in performance.~~  
* ~~Integration with Admin Side Document Management:~~  
  * ~~Ensure that document generation is aligned with the document management functionalities as specified in the Admin side settings.~~  
  * ~~Admins should be able to see and manage the lifecycle of each document, including updates or revocation as necessary.~~  
* ~~Testing and Validation:~~  
  * ~~Conduct thorough testing to ensure that all types of documents are generated correctly and are accessible as intended.~~  
  * ~~Include security penetration testing to validate the protection mechanisms around sensitive documents.~~

## **6.6. Trading Mobile App**  {#6.6.-trading-mobile-app}

### ~~6.6.1. Download and Installation~~ {#6.6.1.-download-and-installation}

#### **~~6.6.1.1. Apple App Store~~**

* ~~The User will download the app from the Apple App Store~~  
* ~~Download the app and install it on an iPhone~~  
  * ~~Free download~~  
* ~~Ensure the release notes are defined, e.g. “This release includes bug fixes and usability improvements.”~~

#### **~~6.6.1.2. Google Play Store~~**

* ~~The User will download the app from the Google Play Store~~  
* ~~Download the app and install it on an Android mobile phone~~  
  * ~~Free download~~  
* ~~Ensure the release notes are defined, e.g. “This release includes bug fixes and usability improvements.”~~

### ~~6.6.2. Splash Screen~~ {#6.6.2.-splash-screen}

#### **~~6.6.2.1. Splash Screen~~**

* ~~The User will see a splash screen while the app loads~~  
* ~~The splash screen will display a static logo~~  
* ~~The splash screen will be on the screen for 2 seconds~~  
* ~~The user will then be directed to the landing page~~

### ~~6.6.3. Landing Page~~ {#6.6.3.-landing-page}

#### **~~6.6.3.1. Landing Page Layout~~**

* ~~The landing page will have a logo~~  
* ~~The landing page will enable the user to log in to their account~~  
* ~~The user will be allowed the user to register if they do not have an account~~  
  * ~~Redirect to web registration~~   
* ~~There will be a forgotten password button~~

### ~~6.6.4. Registration~~ {#6.6.4.-registration}

~~The mobile app will use a “webview” component to embed the web versions of the registration directly into the app, without having to do a native rebuild.~~  

#### **~~6.6.4.1. Webview Registration~~**

* ~~The registration flow will be built so that it can be accessed and completed through the mobile app~~  
* ~~The following epics from phase 1 must be optimised for the webview~~  
  * ~~6.1.1 Registration~~  
  * ~~6.1.2 Onboarding~~

### ~~6.6.5. Authentication~~ {#6.6.5.-authentication}

#### **~~6.6.5.1. Login~~**

* ~~The user will be required to log in with their~~  
  * ~~Email address~~  
  * ~~Password~~  
* ~~The password field will be encrypted~~  
  * ~~Entered characters will be masked~~  
* ~~Validation of fields will be upon clicking the “Login” button~~  
* ~~If the validation fails, there will be inline error messages~~  
  * ~~The required field is empty~~  
    * ~~“This is a required field”~~  
  * ~~Invalid credentials~~  
    * ~~“Invalid email address and password”~~  
* ~~If the validations pass, the user will be granted access to the app’s homepage~~

#### **~~6.6.5.2. Manual logout~~**

* ~~The user will log out manually using the logout button~~  
* ~~The user will be redirected to the login page~~

#### **~~6.6.5.3. Forgotten Password~~**

* ~~The user will click on ‘Forgotten password’ on the login page~~  
* ~~They will be directed to the Forgotten Password page~~  
* ~~The User will enter their email address~~  
* ~~All fields will be tagged and compatible with the device’s autocomplete~~  
* ~~Press “Submit”~~  
* ~~Validation of fields will be upon clicking the “Submit” button~~  
  * ~~If the validation fails, there will be inline error messages~~  
    * ~~The required field is null~~  
      * ~~“This is a required field”~~  
  * ~~If the validation passes, there will be a message on the screen:~~  
    * ~~“Please check your email for instructions on how to reset your password.”~~  
    * ~~The user will be able to close the message and return to the login page~~  
* ~~If the email address is valid, a verification token will be sent~~  
  * ~~The link will be valid for 6h~~  
  * ~~The expiry time will be set in the database~~  
  * ~~There will be no front-end to change the expiry time.~~  
* ~~If the email address is invalid, a verification token will not be sent~~  
* ~~If the email address is not on the system, a verification token will not be sent~~  
* ~~Upon clicking a valid email token, the app will open, and the user will be directed to the password reset page~~  
* ~~The current password will be active until a new password is successfully set~~

### ~~6.6.6. Trading Homepage~~  {#6.6.6.-trading-homepage}

#### **~~6.6.6.1 Trading Homepage Layout~~**

* ~~This page will show the user the trading marketplace~~   
* ~~The page will have the following elements~~  
  * ~~Logo~~  
  * ~~Navigation menu ([6.6.6.2](#6.6.6.2.-mobile-app-navigation))~~  
  * ~~Create listing button ([6.6.8.2](#heading=h.m13spqc9c57s))~~  
  * ~~Search bar/filter panel ([6.1.5.2](#6.1.5.2.-search/filters-panel))~~  
  * ~~Product cards~~  
    * ~~Each listing should be presented in a product card format ([6.1.5.3](#6.1.5.3.-view-product-card)).~~  
      * ~~The page will display a total of 10 results per page, i.e. 10 rows with 1 product card per row.~~  
      * ~~The page will not display the user's own product cards within the marketplace.~~  
      * ~~Product cards will be sorted to display the newest material listings first.~~  
        * ~~I.e. Most recent date created displayed first~~  
        * ~~Until the user applies a search/filter~~  
    * ~~Clicking on the card redirects the user to the listing page (product page)~~   
  * ~~Account Status~~

#### **~~6.6.6.2. Mobile App Navigation~~** {#6.6.6.2.-mobile-app-navigation}

* ~~The navigation will be a bottom bar~~  
* ~~The navigation will contain the following elements~~  
  * ~~Notifications icon~~  
  * ~~Buy Materials~~  
  * ~~Wanted Materials~~  
  * ~~Create listing \-\> Create new listing to Sell~~  
    * ~~With horizontal menu tabs for:~~  
      * ~~Sell Material~~  
      * ~~List Wanted Material~~  
  * ~~My Listings \-\> view the Selling/Wanted items posted by the user~~   
    * ~~With horizontal menu tabs for:~~  
      * ~~Wanted Listings~~  
      * ~~Sales Listings~~  
  * ~~My Offers \-\> view a list of Selling/Buying Offers~~   
    * ~~With horizontal menu tabs for:~~  
      * ~~Buyer (offers made [6.6.1.13](#6.6.11.3.-view-a-summary-of-offers-made))~~  
      * ~~Seller (offers received [6.6.1.11](#6.6.11.1.-view-a-summary-of-offers-received))~~  
  * ~~Settings~~  
    * ~~Account~~  
    * ~~Logout button~~

#### **~~6.6.6.3. Bidding on a Listing~~** 

* ~~The page will replicate functionality within the trading platform web application ([6.1.5.5](#6.1.5.5.-bidding-on-a-listing)).~~  
* ~~The user will be able to click on any Product card to open the listing page~~  
* ~~The page will have a distinct CTA: Bid Now~~  
* ~~Clicking on the button will allow the user to make a bid on the listing~~  
* ~~The user will be required to provide the following information~~  
  * ~~Warehouse location: Dropdown select, listing locations provided during onboarding.~~  
  * ~~Offer valid until: Date input.~~  
  * ~~Earliest delivery date: Date input.~~  
  * ~~Latest delivery date: Date input.~~  
    * ~~The latest delivery date field in placing bids should be blocked before the earliest delivery date.~~  
  * ~~Number of loads bid on: Numeric input (minimum 1; maximum cannot exceed the total number of loads listed).~~  
  * ~~Currency: Dropdown or text input.~~  
  * ~~Price per Metric Tonne: Numeric input.~~  
  * ~~Incoterms: Dropdown select with an information button to explain various options.~~  
    * ~~EXW, FAS, FOB, CFR, CIF, DAP, DDP.~~  
    * ~~If FAS, FOB, CFR or CIF is selected for ‘Incoterms’, display the text field for ‘Shipping Port’.~~   
* ~~On submitting the bid, it is submitted for review to the WasteTrade Admin team~~  
  * ~~The user will be able to track their bid through the My Offers section~~

### ~~6.6.7. Wanted Listings~~ {#6.6.7.-wanted-listings}

#### **~~6.6.7.1. Wanted Listings Layout~~**

* ~~This page will show a user all of the wanted listings that are in the system~~  
* ~~The page will have the following elements~~  
  * ~~Filters~~  
    * ~~Date Required From~~  
    * ~~Company~~  
    * ~~Material~~  
      * ~~Dropdown~~  
    * ~~Location~~   
      * ~~Dropdown~~  
    * ~~Status~~  
      * ~~Dropdown~~  
    * ~~State~~  
      * ~~Dropdown~~  
  * ~~Product cards~~  
    * ~~Clicking on the card redirects the user to the wanted listing page (product page)~~  
    * ~~The page will display a total of 10 results per page, i.e. 10 rows with 1 product card per row.~~  
    * ~~The page will not display the user's own product cards within the marketplace.~~  
    * ~~Product cards will be sorted to display the newest material listings first.~~  
  * ~~The page will have a distinct call to action:~~  
    * ~~List Wanted Material~~  
    * ~~The CTA will be placed at the very top of the page~~

#### 

#### **~~6.6.7.2. Create a Listing (Wanted Material)~~**

* ~~The page will replicate functionality within the trading platform web application ([6.1.3.3](#6.1.3.3.-create-a-wanted-listing))~~  
* ~~The user will be able to create a listing for a wanted material~~   
* ~~The form will have the following sections~~  
  * ~~The page title will display Create Wanted Listing.~~  
    * ~~Text throughout the Create a Wanted Listing page will be updated to reflect that this is a “Wanted” listing and not an available or sales material.~~  
      * ~~Guidance text on the page will display:~~  
        * ~~"List wanted material in the marketplace"~~  
  * ~~Upload Media: Provide an option to upload images with guidance on the type of images required.~~   
    * ~~Text will display “This is recommended to optimise the matches for your requirements.”~~  
    * ~~Featured image upload~~  
      * ~~Accepted file types: jpg, jpeg, png, gif, Max. File size: 50 MB, Max. Files: 1\.~~  
      * ~~This is the main profile image for the listing~~  
    * ~~Gallery images upload~~   
      * ~~Accepted file types: jpg, png, jpeg, pdf, doc, xls, Max. File size: 5 MB, Max. Files: 6\.~~  
      * ~~Users can select multiple images by pressing and holding on a mobile/tablet device.~~  
  * ~~Material Wanted: Include a field for specifying the material type, for each of the fields within this section:~~   
    * ~~Country waste is required in~~  
    * ~~Material Details: 7 Dropdowns for entering details regarding the material~~  
      * ~~Material type~~  
        * ~~Always shows options for Plastic, EFW, Fibre, Rubber, Metal~~  
      * ~~Item~~   
        * ~~Conditionally displays “Items” options based on the Material type.~~  
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
      * ~~Form~~  
        * ~~If “Material type” \= “Plastic” options for “Form” are presented~~  
          * ~~(Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)).~~  
        * ~~If “Material type” is not plastic, the “Form” dropdown will only display N/A as a default selection.~~  
      * ~~Grading~~	  
        * ~~If “Material type” \= “Plastic” or “Fibre”, the options for “Grading” are specific to the Material type selected.~~  
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
        * ~~If “Material type” \= “EFW” or “Metal” or “Rubber,” the “Grading” dropdown will only display N/A as a default selection.~~  
      * ~~Colour~~  
        * ~~Will always display the same options~~  
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
      * ~~Finishing~~  
        * ~~Will always display the same options~~   
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
      * ~~Packing~~  
        * ~~Will always display the same options~~   
          * ~~Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)~~  
    * ~~MFI requirements~~  
      * ~~Optional radio buttons for:~~  
        * ~~Low (0.1-10)~~  
        * ~~Medium (10-40)~~  
        * ~~High (40+)~~  
    * ~~How should the waste be stored~~  
      * ~~Indoor/Outdoor/Both/Any~~  
    * ~~Metric: The user can select units of Mt, Lbs, or Kg.~~   
      * ~~If Lbs or Kg are selected, this will convert to Mt in the Total Weight field.~~  
    * ~~Quantity Wanted: Numeric input field for specifying the quantity of the material needed.~~  
      * ~~Displayed as the selected metric above.~~  
    * ~~Total Weight (Mt)~~  
      *  ~~Displays the quantity wanted weight in Mt.~~  
    * ~~Capacity per month~~  
    * ~~Material Required From: Include a date picker to allow the user to specify a start date from which the material is needed.~~  
      * ~~Past dates (Yesterday or before) will be disabled.~~  
    * ~~Frequency~~  
      * ~~Dropdown menu containing frequency options~~  
        * ~~Weekly~~  
        * ~~Monthly~~  
        * ~~Every 3 Months~~  
        * ~~Every 6 Months~~  
  * ~~Additional Information: Provide a free text box for additional details or specifications.~~  
    * ~~This free text (and any free text for listings) should not allow telephone numbers, email addresses or URLs.~~  
* ~~Submission and Validation:~~  
  * ~~Include a "Submit" button to send the listing for Admin review.~~  
  * ~~Validate all input fields to ensure data integrity (e.g., proper date formats, required fields are not left blank).~~

#### **~~6.6.7.3. Wanted Listing Page~~** 

* ~~The page will replicate functionality within the trading platform web application ([6.1.5.7](#6.1.5.7.-view-wanted-listing-page))~~  
* ~~The page will display the following elements~~  
  * ~~Photo Carousel Features:~~  
    * ~~Feature a photo carousel that displays multiple images of the product.~~  
    * ~~Displays the featured image and all gallery images.~~  
    * ~~Thumbnails and inline gallery images must use object-fit: cover so images fill their containers without distortion.~~  
    * ~~The image container must have rounded edges, in keeping with the listing page container shape.~~  
    * ~~Allow users to manually cycle through images and implement auto-change functionality that switches images every 3 seconds.~~  
    * ~~Clicking any gallery image opens a lightbox modal.~~  
      * ~~The lightbox displays the full-size image at its native aspect ratio (no cropping)~~  
      * ~~Next/Previous controls to scroll through all images in the gallery.~~  
      * ~~There will be a visible Close (X) and backdrop click to exit and return to the listing page.~~  
  * ~~Material Description Section:~~  
    * ~~Include a detailed description of the wanted material, replicating the format and level of detail from the current website to maintain consistency.~~  
    * ~~Ensure the description is clear, concise, and provides all necessary information about the wanted material.~~  
  * ~~Social Sharing Options:~~  
    * ~~Incorporate options to share the listing on social platforms such as Facebook, LinkedIn, Twitter, WhatsApp, and via Email. Ensure each option functions correctly and formats the shared content appropriately for each platform.~~  
  * ~~Buyer Card:~~  
    * ~~Display a Buyer card that includes relevant information about the person or company requesting the wanted material, such as contact details or other pertinent information.~~  
  * ~~Calls to Action:~~  
    * ~~Include distinct calls to action: "Sell Material" and "Message Buyer", each leading to appropriate actions. Ensure these buttons are visually distinct and positioned to drive user engagement.~~  
      * ~~Message Buyer: should open a contact form that allows a message to be sent from the interested party (it will be sent to the WasteTrade Admin team, to manually review and manage)~~  
        * ~~Title: Message to Buyer~~   
        * ~~Name: Prepopulated~~   
        * ~~Email: pre-populated~~  
        * ~~Text: free text for the user to input~~    
      * ~~Sell Material: opens the ‘create listing’ page with the details in the wanted listing pre-populated. Once the listing is live, the user who posted the ‘wanted’ listing will be notified.~~  
      * ~~Delete: show a confirmation to the user \-\> If the listing is deleted, navigate back to My Listing / Wanted list~~   
      * ~~Fulfil: mark the Wanted Listing as Fulfilled status~~ 

### ~~6.6.8. Sales Listings~~ {#6.6.8.-sales-listings}

~~A user will be able to sell material through the platform. Clicking on the sell button within the header takes the user to the “create a sales listing form”.~~

#### **~~6.6.8.1. Create a Listing (Sell Material)~~**

* ~~The page will replicate functionality within the trading platform web application ([6.1.2.3](#6.1.2.3.-create-a-sales-listing))~~  
* ~~The form will have the following sections~~  
  * ~~Warehouse: Include a dropdown to select a location and an option to add a new location.~~  
    * ~~The user can select a location from any of “My Sites”, including the headquarters and additional sites.~~  
    * ~~There will be no “Other” option to add a new location via the mobile app in this phase.~~  
  * ~~Upload Media: Provide functionality to upload images, with guidance on the type of images required and the ability to select a featured image. All images should be automatically watermarked upon upload.~~  
    * ~~Featured image upload~~  
      * ~~Accepted file types: jpg, jpeg, png, gif, Max. fFilesize: 50 MB, Max. Files 1\.~~  
      * ~~This is the main profile image for the listing~~  
    * ~~Gallery images upload~~   
      * ~~Accepted file types: jpg, png, jpeg, pdf, doc, xls, Max. File size: 5 MB, Max. Files 6\.~~  
      * ~~Users can select multiple images using Ctrl+click or Shift+click or even multiselect with the mouse or by pressing and holding on a mobile/tablet device.~~  
  * ~~Material Specification Data: Include an option to upload specification data if available.~~  
    * ~~Shown beneath the image upload fields.~~  
  * ~~Material Details: 7 Dropdowns for entering details regarding the material~~  
    * ~~Defined in the product database.~~  
  * ~~Metric: The user can select units of Mt, Lbs, or Kg.~~   
    * ~~If Lbs or Kg are selected, this will convert to Mt in the Total Weight field.~~  
  * ~~Material Weight:~~  
    * ~~The user can enter the material weight using the selected metric.~~  
    * ~~If Lbs or Kg are selected, this will convert to Mt in the Material Weight field.~~  
  * ~~Total Weight (Mt)~~  
    * ~~Read-only~~  
    * ~~Displays the total available weight in Mt.~~  
    * ~~Must be 3 or greater.~~  
  * ~~Number of Loads~~  
    * ~~Must be 1 or greater~~  
  * ~~Average Weight per Load (Mt)~~  
    * ~~Displays guidance text:~~  
      * ~~“This is the total weight divided by the number of loads. e.g. 30Mt / 2 loads \= 15Mt average weight per load.”~~  
  * ~~Currency: A dropdown to select the currency for the transaction.~~  
    * ~~Price per metric tonne~~  
  * ~~Material Availability: Include a date picker for selecting the “Start date” of material availability.~~  
    * ~~Past dates (Yesterday or before) will be disabled.~~  
  * ~~Incoterms: Dropdown~~  
  * ~~Ongoing Listing:  Yes/No radio buttons.~~   
    * ~~Selecting “Yes” allows the user to set the Renewal Period~~  
      * ~~Dropdown menu containing renewal period options.~~  
    * ~~Selecting “No” allows the user to set Listing Duration~~  
      * ~~Default duration of 30 days, or set a custom duration using days, weeks, or a specific end date selected via a calendar.~~  
      * ~~Past dates (Today or before) will be disabled.~~  
  * ~~Additional Information: A free text box for any extra details or notes related to the listing.~~  
    * ~~This free text should not allow telephone numbers, email addresses or URLs.~~  
* ~~There will be a “Submit” button~~  
  * ~~On submitting, the form will be sent to the Admin for approval~~   
  * ~~The listing can only go live once it has been approved by the admin~~  
* ~~A listing will stay live until~~   
  * ~~The fulfilment process begins (i.e. a Seller can provide the materials, and the creator of the listing accepts their bid)~~  
  * ~~The listing is removed by the creator or the WasteTrade Admin~~  
  * ~~The default listing period comes to an end~~

### ~~6.6.9. My Sales Listings~~ {#6.6.9.-my-sales-listings}

~~This section allows a user to see all of their sales listings.~~ 

#### **~~6.6.9.1. View All Sales Listings~~**

* ~~This page will show a user all of the sales listings which they have created~~  
* ~~The page will have the following elements~~  
  * ~~Filter panel ([6.1.5.2](#6.1.5.2.-search/filters-panel))~~  
  * ~~Product cards~~  
    * ~~Each listing should be presented in a product card format ([6.1.5.3](#6.1.5.3.-view-product-card)).~~  
      * ~~The page will display a total of 10 results per page, i.e. 10 rows with 1 product card per row.~~  
    * ~~The product cards will show an alert for listings which are due to expire~~

#### **~~6.6.9.2. Renew Listing~~**

* ~~The user will be able to renew a listing that they have created through a listing’s Product page~~  
* ~~When the listing is in the expiry period, there will be a message: “This listing is about to expire, do you want to renew it?”~~  
* ~~The user will be able to click on the message to renew the listing~~  
  * ~~The system will ask the user to confirm if they want to renew the listing~~  
    * ~~Yes \- set the new renewal period~~  
      * ~~2 weeks (default)~~  
      * ~~Custom (select days, weeks, or pick a date from a calendar)~~

#### **~~6.6.9.3. Remove a Sales Listing~~**

* ~~The user will be able to remove any sales listings which they have created~~  
* ~~The user will be able to delete the listing from the~~  
  * ~~Location of Removal Options:~~  
    * ~~Ensure users can initiate the removal of their sales listings directly from the “My Sales Listings” page.~~  
      * ~~My Sales page: each listing card shows a bin icon (Delete).~~  
  * ~~Provide a clear and visible button on the listings page as well as a removal icon on each individual listing card.~~  
    * ~~Listing page: show a red “Delete Listing” button~~  
    * ~~When the “Delete listing” button is clicked, a bin icon will appear for all available listings.~~  
* ~~Availability logic~~  
  * ~~If the listing has one or more Pending or Accepted offers, both the bin icon and the Delete Listing button are disabled (not clickable).~~  
  * ~~Tooltip on hover over disabled button:~~  
    * ~~“You can’t delete this listing because there is an existing offer on it.”~~  
* ~~Confirmation Process:~~  
  * ~~Upon selecting the remove option, the system must prompt the user with a confirmation dialogue to prevent accidental deletions.~~  
  * ~~The confirmation message should clearly state the action about to be taken and ask for explicit user confirmation (e.g., “Are you sure you want to remove this listing? This action cannot be undone.”).~~  
* ~~Permissions and restrictions will be unchanged.~~  
  * ~~Only the creator of the listing can see and interact with the removal options.~~  
  * ~~Removal options are disabled or hidden for listings that cannot be deleted due to platform rules or pending transactions.~~

### ~~6.6.10 My Wanted Listings~~  {#6.6.10-my-wanted-listings}

~~This section allows a user to see all of their wanted materials listings.~~ 

#### **~~6.6.10.1. View All Wanted Listings~~**

* ~~This page will show a user all of the wanted listings which they have created~~  
* ~~The page will have the following elements~~  
  * ~~Filters~~  
    * ~~Date Required From~~  
    * ~~Company~~  
    * ~~Material~~  
      * ~~Dropdown~~  
    * ~~Location~~   
      * ~~Dropdown~~  
    * ~~Status~~  
      * ~~Dropdown~~  
    * ~~State~~  
      * ~~Dropdown~~  
  * ~~Product cards~~  
    * ~~Each listing should be presented in a product card format ([6.1.5.3](#6.1.5.3.-view-product-card)).~~  
      * ~~The page will display a total of 10 results per page, i.e. 10 rows with 1 product card per row.~~  
    * ~~The product cards will show an alert for listings which are due to expire~~

#### **~~6.6.10.2. Renew Wanted Listing~~**

* ~~The user will be able to renew a listing that they have created through a listing page.~~  
* ~~When the listing is in the expiry period, there will be a message: “This listing is about to expire, do you want to renew it?”~~  
* ~~The user will be able to click on the message to renew the listing~~  
  * ~~The system will ask the user to confirm if they want to renew the listing~~  
    * ~~Yes \- set the new renewal period~~  
      * ~~2 weeks (default)~~  
      * ~~Custom (select days, weeks, or pick a date from a calendar)~~

#### **~~6.6.10.3. Remove a Wanted Materials Listing~~**

* ~~The user will be able to remove any wanted listings which they have created~~  
* ~~“Location of Removal Options:~~  
  * ~~Ensure users can initiate the removal of their wanted listings directly from the “My Wanted Listings” page.~~  
    * ~~My Wanted Listings page: each listing card shows a bin icon (Delete).~~  
* ~~Provide a clear and visible button on the listings page as well as a removal icon on each individual listing card.~~  
  * ~~Listing page: show a red “Delete Listing” button~~  
  * ~~When the “Delete listing” button is clicked, a bin icon will appear for all wanted listings.~~  
* ~~Confirmation Process:~~  
  * ~~Upon selecting the remove option, the system must prompt the user with a confirmation dialogue to prevent accidental deletions.~~  
  * ~~The confirmation message should clearly state the action about to be taken and ask for explicit user confirmation (e.g., “Are you sure you want to remove this listing? This action cannot be undone.”).~~  
* ~~Permissions and restrictions will be unchanged.~~  
  * ~~Only the creator of the listing can see and interact with the removal options.~~  
  * ~~Removal options are disabled or hidden for listings that cannot be deleted due to platform rules or pending transactions.~~  
* ~~The user will be able to remove any wanted listing which they have created~~ 

### ~~6.6.11. My Offers~~ {#6.6.11.-my-offers}

~~This section allows users to view the offers that they have made and the offers that have been made for their listings.~~ 

#### **~~6.6.11.1. View a Summary of Offers Received~~** {#6.6.11.1.-view-a-summary-of-offers-received}

* ~~There will be a table that displays a summary of all the offers received under~~   
* ~~The table will have the following columns~~  
  * ~~Material name~~  
  * ~~Quantity~~  
  * ~~Bid Date~~  
  * ~~Country~~  
  * ~~Bid Amount~~  
  * ~~No. offers~~  
    * ~~Users can select this to open the list of individual offers received for a listing ([6.6.11.2](#6.6.11.2.-view-individual-offers-received-for-listings)).~~  
  * ~~View details~~  
  * ~~Offer status~~  
  * ~~State~~  
* ~~The user will be able to click on a row to view the offer in detail~~

#### **~~6.6.11.2. View Individual Offers Received for Listings~~** {#6.6.11.2.-view-individual-offers-received-for-listings}

* ~~On clicking on a row of the “view a summary of offers received” table, the user will be redirected to a details page~~  
* ~~The page will display the following information~~  
  * ~~Material Name: Display as a clickable link that redirects to the original listing for full details.~~  
  * ~~Weight: Display the weight of the material involved in the offer.~~  
  * ~~Best Offer: Show the highest offer received.~~  
  * ~~Seller's Total Amount: Display the total amount including price, haulage, and any other applicable charges.~~  
  * ~~Number of Offers: Indicate the total number of offers received for the listing.~~  
  * ~~List of Other Offers: Display a list including date, amount, Buyer ID~~  
  * ~~Loads remaining: Show how many loads are still available for bidding.~~  
  * ~~Status~~  
* ~~The user will be able to perform certain actions~~  
  * ~~Accept a Bid: Allow the Seller to accept a bid, which automatically marks all other bids as rejected if there is no load remaining.~~   
    * ~~Provide clear confirmation prompts and immediate feedback once a bid is accepted.~~  
  * ~~Reject a Bid: Enable the Seller to reject bids.~~   
    * ~~The listing should remain active unless it is manually removed or the listing period expires.~~   
    * ~~After the Buyer rejects a bid, then a free text box will appear, allowing the user to provide a reason why they’re rejecting the bid.~~  
      * ~~This free text (and any free text for offers) should not allow telephone numbers, email addresses or URLs.~~

#### **~~6.6.11.3. View a Summary of Offers Made~~** {#6.6.11.3.-view-a-summary-of-offers-made}

* ~~There will be a table that displays a summary of all the offers made by a user~~  
* ~~The table will have the following columns~~  
  * ~~Material name~~  
  * ~~Pick up location~~  
  * ~~Destination~~  
  * ~~Packaging~~  
  * ~~Number of loads~~  
  * ~~Weight per load~~  
  * ~~Status~~   
  * ~~View Details button~~  
    * ~~To view the offer in detail~~

#### **~~6.6.11.4. View Bid Details~~**

* ~~On clicking on a row of the “view a summary of offers made” table, the user will be redirected to a details page~~  
* ~~The page will show the following information~~	  
  * ~~Material Name~~  
  * ~~Pick Up Location~~  
  * ~~Destination:~~  
  * ~~Packaging~~  
  * ~~No. of Loads~~  
  * ~~Weight per Load~~  
  * ~~Incoterms~~  
  * ~~Bid status~~

#### **~~6.6.11.5. View Documents for Accepted Bids~~**

* ~~The documents will be available on the Bid Details page~~  
* ~~The documents will be automatically generated by the system ([6.5.2](#6.5.2.-document-generation))~~  
* ~~The user will be able to view the following information for each document~~  
  * ~~Material~~  
    * ~~Links to open listing page as a new tab in the default browser.~~  
  * ~~Title~~  
  * ~~Description~~  
* ~~The user will be able to download the documents from the My Offers table.~~  
* ~~Document list TBC by client~~

### ~~6.6.12. Account~~  {#6.6.12.-account}

~~This section allows users to view their account details; there is no functionality to manage the user details via the mobile app within this phase.~~ 

#### **~~6.6.12.1. Account Layout~~**

* ~~The page will have a horizontal tabbed sub-menu ([6.6.12.2](#6.6.12.2.-account-submenu)).~~  
* ~~The main body will display the items associated with the selected sub-menu option~~  
* ~~There will be a guidance message within the account page:~~  
  * ~~“The mobile app currently supports viewing your account. To update or edit your details, please visit our website.”~~

#### **~~6.6.12.2. Account Submenu~~** {#6.6.12.2.-account-submenu}

* ~~The sub-menu will have the following options~~  
  * ~~My profile~~  
  * ~~Company information~~  
  * ~~Material preferences~~  
  * ~~Notifications~~  
  * ~~Company documents~~  
  * ~~My locations~~

#### **~~6.6.12.3. My Profile~~**

* ~~The My Profile section displays the user’s personal information~~  
  * ~~Account ID~~  
  * ~~Prefix~~  
  * ~~First Name~~  
  * ~~Last Name~~  
  * ~~Job Title~~  
  * ~~Email Address~~  
  * ~~Telephone~~  
* ~~The user will also see an edit button, allowing them to edit basic personal information~~  
* ~~There will also be an option to change the password~~  
  * ~~This will trigger the set password flow~~

#### **~~6.6.12.4. Company Information~~**

* ~~The section will be built to replicate the current website, optimised for mobile~~  
* ~~This section will have the following subsections~~  
  * ~~Company information~~  
    * ~~Company Name~~  
      * ~~Website~~  
      * ~~Company Interest~~   
      * ~~Company Type~~  
      * ~~VAT~~  
      * ~~Company registration number~~  
      * ~~Company description~~  
    * ~~Business address~~  
      * ~~Street address~~  
      * ~~Zip/Postal Code~~  
      * ~~City~~  
      * ~~County/ State/Region~~  
      * ~~Country~~  
      * ~~Company Email~~  
      * ~~Company Telephone~~  
    * ~~Company Social Media accounts~~   
      * ~~Facebook~~   
      * ~~Instagram~~  
      * ~~LinkedIn profile~~  
      * ~~Additional Social Media Field~~  
        * ~~Any valid URL must be rendered as a clickable hyperlink when viewing company information.~~  
          * ~~If the input is not a valid URL, display it as plain text without link formatting.~~  
          * ~~Displayed URLs must be shortened to show only the domain name \+ top-level path.~~  
        * ~~Full URL must remain accessible via the click (opens in a new window in the device’s default browser).~~  
  * ~~Information Symbol for Incomplete Fields:~~  
    * ~~Implement an information symbol (e.g., a tooltip icon) next to any fields that are incomplete or require user attention.~~  
      * ~~A red exclamation mark will indicate missing fields.~~  
    * ~~The symbol should provide a brief explanation or prompt to the user about what needs to be completed.~~  
      * ~~“This field is currently empty. Please login via our website to update your profile.”~~

#### **~~6.6.12.5. Material Preferences~~**

* ~~The section will be built to replicate the current website, optimised for mobile~~   
* ~~The page will display a list of all the materials (selected initially during onboarding)~~

#### **~~6.6.12.6. Company Documents~~**

* ~~The section will be built to replicate the current website, optimised for mobile~~  
* ~~The following information will be visible (along with existing uploads)~~  
  * ~~Any files uploaded for:~~  
    * ~~Licenses/Permits~~  
      * ~~Environmental Permit~~  
      * ~~Waste Exemption~~  
      * ~~Other~~  
    * ~~Waste Exemptions~~   
    * ~~Waste Carriers Licence~~  
  * ~~Relevant expiry dates~~  
* ~~The user will be able to view the document by downloading to their device~~

#### **~~6.6.12.7. My Sites~~**

* ~~The section will be built to replicate the current my sites page (6.1.7.2), optimised for mobile~~  
* ~~The user will be able to see all the locations associated with their account~~  
* ~~Locations include all locations/sites and the company business address (as defined in the user's account settings).~~  
  * ~~The company's business address is included within the My Sites list and labelled as “Headquarters”.~~  
    * ~~This will be the only address labelled “Headquarters”.~~  
  * ~~If the user selects to “View” the details for the headquarters, they will be taken to the account settings, company details page.~~  
* ~~There is a button to “View” the site/location details on a dedicated page containing:~~  
  * ~~“Location name” as the page heading~~  
  * ~~Sections for:~~  
    * ~~\<Location name\>~~  
      * ~~Site point of contact (Prefix, first name, last name)~~  
      * ~~Position in company~~  
      * ~~Phone number~~  
      * ~~Street address~~  
      * ~~Zip/Postal code~~  
      * ~~City~~  
      * ~~County/State/Region~~  
      * ~~Country~~  
      * ~~Opening time~~  
      * ~~Closing time~~  
    * ~~Materials Accepted~~  
      * ~~Broken down via Material Type, e.g. Plastics, Fibres.~~  
    * ~~On-site Facilities~~  
      * ~~Is there a loading ramp on this site?~~  
      * ~~Have you got a weightbridge on this site?~~  
      * ~~Can you load/unload material yourself on this site?~~  
      * ~~Which container types can you manage on this site?~~  
      * ~~Do you have any access restrictions?~~  
      * ~~Site-specific instructions~~  
    * ~~Licenses/Permits~~  
      * ~~Which permit/license do you have?~~  
      * ~~Waste Exemptions~~  
      * ~~Do you have a waste carrier license?~~

### ~~6.6.13. Notifications~~ {#6.6.13.-notifications}

#### **~~6.6.13.1. Notifications Centre~~**

* ~~The user will be able to view and manage all notifications in the notification centre~~  
* ~~The user will be able to view each notification in full detail~~   
  * ~~Notifications will be displayed in reverse chronological order (latest first)~~  
  * ~~There will be a timestamp on each notification~~  
    * ~~dd/mm/yyyy HH: MM~~  
* ~~The user will be able to mark the notifications as~~   
  * ~~Read~~  
  * ~~Unread~~  
* ~~There will be pagination~~  
  * ~~The user will be able to select the number of rows per page~~  
    * ~~10~~  
    * ~~20~~  
      * ~~Default~~  
    * ~~50~~  
    * ~~All~~  
* ~~By default, the page will display the latest notifications at the top~~

#### **~~6.6.13.2. Buyer Notifications~~** 

* ~~The users will receive notifications at the following points related to buying/bidding~~  
  * ~~Bid approved/rejected~~  
  * ~~Received communication from the Admin (listing requires attention; status: pending)~~  
  * ~~Bid accepted~~  
  * ~~Further points to be decided~~  
* ~~All notifications will contain a link to the original listing~~

#### **~~6.6.13.3. Seller Notifications~~** 

* ~~The users will receive notifications at the following points related to sales/listings~~  
  * ~~Listing approved/rejected~~  
  * ~~A new haulage offer has been received~~   
  * ~~Received communication from the Admin (listing requires attention; status: pending)~~  
  * ~~Documents generated~~  
  * ~~Further points to be decided~~  
* ~~All notifications will contain a link to the original listing~~

#### **~~6.6.13.4. Wanted Listing Owner Notifications~~** 

* ~~The listing owner will receive notifications at the following points~~  
  * ~~Listing approved/rejected~~  
  * ~~Documents generated~~  
  * ~~Received communication from the Admin (listing requires attention; status: pending)~~  
  * ~~Further points to be decided~~  
* ~~All notifications will contain a link to the original listing~~

## **~~6.7. Design/UI Updates~~** {#6.7.-design/ui-updates}

### ~~6.7.1. Design Updates~~ {#6.7.1.-design-updates}

#### **~~6.7.1.1. Modal Backdrop Visibility~~** 

* ~~As a user, I want modals to dim the page behind them so the active popup is easier to focus on.~~  
* ~~Currently, the underlying page stays clearly visible when a modal opens.~~  
* ~~This will be updated to show a darker backdrop behind all popups/modals.~~   
  * ~~\#000 at 0.75 opacity~~

#### **~~6.7.1.2. Dropdown Default Selection Colour~~** 

* ~~As a user, I want default selections in dropdowns to be clearly highlighted so I can see the current value at a glance.~~  
* ~~Currently, the default selection is highlighted in grey.~~  
* ~~This will be updated so that the background colour of the default value in dropdowns is green (\#TBC at TBC opacity).~~

#### **~~6.7.1.3. Admin Table Borders~~** 

* ~~As an admin, I want clearer table boundaries so data is easier to scan.~~  
* ~~Currently, table borders across the Admin platform are inconsistently coloured.~~  
* ~~This will be updated to use lighter green borders (\#06985C) with a subtle border shadow for Admin tables.~~

#### **~~6.7.1.4. Sticky Account Status Banner~~**

* ~~As a user, I want the account status banner to remain visible while I scroll so I always see my account state.~~  
* ~~Currently, the banner appears at the top but scrolls off-screen.~~  
* ~~This will be updated to make the account status banner sticky/fixed at the top of the viewport with proper stacking so it stays visible on scroll.~~

#### **~~6.7.1.5. Sticky Navigation & Submenu Behaviour~~**

* ~~As a user (trader/Haulier/admin), I want navigation to stay visible and submenus to behave predictably so I can move around quickly.~~  
* ~~Currently:~~  
  * ~~The navigation scrolls off-screen, displaying navigation links only at the top of the page.~~  
  * ~~When switching submenus, the first menu closes, but the second doesn’t open straight away, requiring multiple selections to open the desired page.~~  
* ~~This will be updated to ensure:~~  
  * ~~The main navigation is sticky/fixed at the top across trader/Haulier/Admin UIs.~~   
    * ~~There must be space beneath sticky elements: Ensure there’s enough top spacing under the fixed banner/navigation so page content never gets hidden behind them.~~  
  * ~~Fix submenu logic so clicking a new submenu both closes the previous and opens the new one, preserving the active state.~~

#### **~~6.7.1.6. Trader Material Preferences Layout~~**

* ~~As a trader, I want my material preferences displayed in a clean, scannable layout so I can quickly review and edit them.~~  
* ~~Currently, material preferences are shown as a long comma-separated line, which is hard to read.~~  
* ~~This will be updated to display preferences in a three-column list/grid (stacking to one column on mobile), with clear spacing and alignment to improve readability.~~

#### **~~6.7.1.7. Status Colours~~** 

* ~~As a user, I want consistent status colours so I can understand listing states at a glance.~~  
* ~~Currently:~~  
  * ~~Sold \= grey~~  
  * ~~Expired \= red~~  
  * ~~Ongoing \= blue~~   
* ~~This will be updated to ensure:~~  
  * ~~Sold \= red~~  
  * ~~Expired \= grey~~  
  * ~~Ongoing \= green~~  
* ~~These changes will be applied consistently across cards, tables, badges, and filters.~~

#### **~~6.7.1.8. Create Account Popup Spacing~~**

* ~~As a user, I want balanced spacing in the create account pop-up so content is easy to read.~~  
* ~~Currently, the gap between the green paragraph and the black text below is too large.~~  
* ~~This will be updated to reduce the vertical spacing between those sections, aligning with the standard spacing used elsewhere in modals.~~

#### **~~6.7.1.9. Country Dropdown Ordering~~**

* ~~As a registrant, I want country lists ordered by name so I can quickly find my country.~~  
* ~~Currently, some country dropdowns are ordered by abbreviation, and this is inconsistent across forms.~~  
* ~~This will be updated to ensure all country dropdowns are ordered alphabetically by country name (A–Z) consistently, including in the company information form within registration.~~

#### **~~6.7.1.10. “Where Did You Hear About Us” Dropdown Styling~~**

* ~~As a registrant, I want consistent text styling in dropdowns so the form looks professional and easy to scan.~~  
* ~~Currently, the “Where did you hear about us” dropdown options on registration pages appear in bold text.~~  
* ~~This will be updated so the dropdown option text is displayed in normal weight, matching the styling of the dropdown above it.~~

#### **~~6.7.1.11. Consistent Hover/Active State Behaviour~~**

* ~~As a user, I want consistent hover and selection behaviour across menus, titles, and buttons so I always know what’s interactive and what’s currently selected.~~  
* ~~Currently:~~  
  * ~~Sidebar menu/submenu items have no hover style; active/selected states aren’t clearly differentiated.~~   
  * ~~The marketplace material-name tooltip isn’t using the WT green.~~  
  * ~~“My Sites” View buttons show an underline by default, not just on hover.~~   
  * ~~Account horizontal menu tabs don’t underline on hover.~~   
* ~~This will be updated to ensure:~~  
  * ~~Sidebar navigation (main \+ submenu)~~  
    * ~~Hover: underline text only; no green left border on hover.~~  
    * ~~Active/selected: show WT green left border and underline (selected state only).~~  
    * ~~Styling is consistent:~~  
      * ~~Main and submenu items are bold with icons.~~  
      * ~~Submenu items have a left indent for hierarchy.~~  
    * ~~Parent/child behaviour~~  
      * ~~When a submenu item is opened, the parent main item shows the green left border \+ underline~~  
      * ~~The submenu item shows an underline on hover and gains a green left border \+ underline when selected.~~  
  * ~~Marketplace material title tooltip~~   
    * ~~Tooltip text uses WT green (\#06985C) to match brand styling.~~  
  * ~~Horizontal menu tabs~~   
    * ~~For both the training platform account settings and the Admin dashboard horizontal menus.~~  
    * ~~Hover: add an underline to indicate interactivity.~~  
    * ~~Selected: show WT green left border and underline.~~

# **7\. Appendix** {#7.-appendix}

## **7.1. Integrations** {#7.1.-integrations}

#### **7.1.0.1. Salesforce**

* Integration expanded as per [6.5.](#6.5.-salesforce-integration)

#### **~~7.1.0.2 VAT Sense~~**  {#7.1.0.2-vat-sense}

* ~~UK/EU VAT Registration Checker~~ 

#### **7.1.0.3. SendGrid**

* Expanded to include email notifications 

#### 

#### **~~7.1.0.4. WasteTrade Price Calculator~~** {#7.1.0.4.-wastetrade-price-calculator}

* ~~Expanded to take the following factors into account:~~  
  * ~~Conversion rate~~   
    * ~~Currently fixed conversion rates within the database.~~  
    * ~~Scope for future phases to utilise an Exchange Rate API.~~  
  * ~~Incoterms~~  
  * ~~PERN status~~   
    * ~~Defined by an Admin ([6.4.4.3](#6.4.4.3.-define-pern)).~~

#### 

#### **~~7.1.0.5. Product Database~~**

* ~~Integrate with existing product database (WasteTrade)~~  
* ~~Integration with Existing Database:~~  
  * ~~The B13 Team will establish a connection to the existing products database.~~  
  * ~~The connection must be secure and comply with all relevant data protection regulations.~~  
* ~~Automatic Process Setup:~~  
  * ~~An automatic process will be implemented to regularly check for additions, removals, and edits in the products database.~~  
  * ~~The process should run at predefined intervals (e.g., hourly, daily) to ensure up-to-date information.~~  
  * ~~Any changes detected in the database should be reflected immediately in the system.~~  
* ~~User Visibility:~~  
  * ~~Materials within the products database must be visible to end users during their onboarding process.~~  
  * ~~The materials should be available for selection during listing creation.~~  
  * ~~The interface should allow users to search, filter, and select materials from the database.~~  
* ~~Integration with Pricing System:~~  
  * ~~The integration will work alongside the existing pricing system to calculate and display appropriate prices for the materials.~~  
  * ~~Prices should be updated automatically based on the latest data from the products database and pricing system.~~  
  * ~~The system should handle any errors in price calculation gracefully, providing meaningful error messages to the user.~~  
* ~~Testing and Validation:~~  
  * ~~Comprehensive testing must be conducted to ensure the integration works seamlessly with the existing database and pricing system.~~  
  * ~~All functionalities must be validated to ensure data consistency and accuracy.~~  
* ~~Error Handling and Notifications:~~  
  * ~~The system should log any errors or issues encountered during the integration process.~~  
  * ~~Notifications should be sent to the Admin team in case of critical errors that need immediate attention.~~

#### **~~7.1.0.6. Google Analytics~~**

* ~~Tracks and reports user interactions on the platform to provide insights into usage and performance.~~

#### **~~7.1.0.7. Google Tag Manager~~**

* ~~Configure Tags to support user tracking.~~

#### **7.1.0.8. DEEPL Multi-language Tool** {#7.1.0.8.-deepl-multi-language-tool}

* The integration will be expanded to allow additional languages

| Scope & Preconditions: Expands existing DeepL integration to support additional left-to-right (LTR) languages. The platform currently supports LTR only (Phase 1 \- 7.2.5.2 Language \- Enhanced). Existing supported languages: English (EN), Spanish (ES). Triggers: A user selects a supported language from the website language switcher. Acceptance Criteria: Languages in scope (Left to Right only) The system must support the following additional languages: Belarusian (BE) Chinese (ZH) Chinese Hong Kong (ZH\_HK) Chinese Taiwan (ZH\_TW) Czech (CS) Dutch (NL) French (FR) German (DE) Greek (EL) Hungarian (HU) Italian (IT) Japanese (JA) Lithuanian (LT) Polish (PL) Portuguese (PT) Romanian (RO) Slovak (SK) Swedish (SV) Turkish (TR) Russian (RU) Ukrainian (UK) Arabic (AR) is explicitly out of scope (RTL not supported without enhanced N UI/UX quality gates (per language) For each language added, the release must pass: Layout integrity: No critical overlaps, clipped text, or broken components on supported breakpoints; long strings/character width handled (wrapping, truncation with tooltip). Typography & glyph support: Complex scripts render legibly with chosen fonts/fallbacks (no tofu □ glyphs). Input & validation review: Field validation patterns accept relevant characters for the language/script (e.g., names, addresses); numeric/phone/email rules remain unless specified. Postconditions: Users can browse the site in any enabled LTR language listed above, with stable layout, readable typography, and valid inputs.  |
| :---- |

| Use Case | Error Message |
| :---- | :---- |
| Language update failure | “Currently to update language selection. Please try again.” |

| Client Approved | yes |
| :---- | :---- |

#### 

## **7.2. Web App Non-Functional Requirements** {#7.2.-web-app-non-functional-requirements}

### 7.2.1. Browsers	 {#7.2.1.-browsers}

#### **7.2.1.2 Browsers \- Enhanced**

* As Standard plus Opera, Samsung Internet  
  * Latest versions at the start of development, to be defined in the SDS

### 

### 7.2.2. Design {#7.2.2.-design}

#### **~~7.2.2.3. Design \- Super Enhanced~~**

* ~~As Standard and Enhanced, with the addition of smaller resolution screens, most often found in mobile and tablet devices~~  
  * ~~Desktop screens~~   
    * ~~1920×1080, 1536×864 and 1366×768~~  
    * ~~Aug 2025 \- this would cover 49.7% of desktops in Europe (source: [https://gs.statcounter.com/screen-resolution-stats](https://gs.statcounter.com/screen-resolution-stats)~~  
  * ~~Mobile devices~~  
    * ~~Tablets~~   
      * ~~768x1024, 1280x800, 800x1280 and 810x1080~~  
    * ~~Mobile phones~~  
      * ~~390x844, 393x873, 360x800, 414x896, 393x852, 384x832 and 360x780~~  
        * ~~Specifically, 360x780 is the viewport size for many Android, Samsung S-model and LG devices.~~  
    * ~~Aug 2025 \- this would cover 48.25% of tablets and 37% of mobile devices in Europe (source: [https://gs.statcounter.com/screen-resolution-stats](https://gs.statcounter.com/screen-resolution-stats))~~

### 

### 7.2.3. Version Management {#7.2.3.-version-management}

*No change from P1.*

### 

### 7.2.4. Speed {#7.2.4.-speed}

*No change from P1.*

### 

### 7.2.5. Language {#7.2.5.-language}

#### **~~7.2.5.2. Language \- Enhanced~~**

* ~~The system will be built with multi-language capabilities~~  
  * ~~Left-to-right languages only~~  
  * ~~Translations will be provided by the multi-language tool ([7.1.0.8](#7.1.0.8.-deepl-multi-language-tool))~~  
  * ~~Note: the non-functional requirements relate to the setting up of language in the backend.~~ 

### 

### 7.2.6. Accessibility {#7.2.6.-accessibility}

*No change from P1.*

### 

### 7.2.7. Offline mode {#7.2.7.-offline-mode}

*No change from P1.*

### 

### 7.2.8. Analytics {#7.2.8.-analytics}

#### **~~7.2.8.2. Analytics \- Enhanced~~**

* ~~Provide event tracking through Google Analytics~~

### 

### 7.2.9. Testing {#7.2.9.-testing}

#### **7.2.9.2 Testing \- Enhanced**

* Automated integration scripts, unit testing, code coverage of 20%

### 

### 7.2.10. Security {#7.2.10.-security}

#### **7.2.10.2 Security \- Enhanced**

* Encrypted database  
* AWS Security Hub Automated Response and Remediation  
* AWS Shield to protect against DoS attacks  
* Install Node.JS libraries for increased vulnerability protection  
* Redundancy protection \- a secondary database to be used if the primary database fails  
* Use of Amazon CloudFront and Amazon S3 for caching

### 

### 7.2.11. Infrastructure {#7.2.11.-infrastructure}

*No change from P1.*

### 

### 7.2.12. Deployment {#7.2.12.-deployment}

#### **7.2.12.2 Deployment \- Enhanced**

* Horizontally scanned through the load balancer  
* There will be a load balancer and two or more application servers running the backend code

## **~~7.3. Mobile App Non-Functional Requirements~~** {#7.3.-mobile-app-non-functional-requirements}

### ~~7.3.1. Devices~~  {#7.3.1.-devices}

#### **~~7.3.1.1. Devices \- Standard~~**

* ~~iOS and Android mobile devices~~  
  * ~~Latest versions at the start of development, to be defined in the SDS~~

#### **~~7.3.1.2. Devices \- Enhanced~~**

* ~~iOS and Android tablet devices~~  
  * ~~Latest versions at the start of development, to be defined in the SDS~~

### 

### ~~7.3.2. Design~~ {#7.3.2.-design}

#### **~~7.3.2.1. Design \- Standard~~**

* ~~Responsive design for mobile screen sizes~~  
  * ~~Screen sizes 4” to 7”~~

#### **~~7.3.2.2. Design \- Enhanced~~**

* ~~Responsive design for tablet and mobile screen sizes~~  
  * ~~Screen sizes 4” to 13”~~

### ~~7.3.3. Version Management~~ {#7.3.3.-version-management}

#### **~~7.3.3.1. Version Management \- Standard~~**

* ~~The browser cache will be refreshed each time a new version of the app is released~~  
* ~~This will prevent CSS and JavaScript errors caused by old files in the browser cache~~

### 

### ~~7.3.4. Speed~~ {#7.3.4.-speed}

#### **~~7.3.4.1. Speed \- Standard~~**

* ~~Speed will be dependent on the network connection speed and geographical location, but assuming a reasonable connection, all page loads should be less than 2 seconds~~  
* ~~Any delays over 2 seconds will show a spinner~~

### 

### ~~7.3.5. Language~~ {#7.3.5.-language}

#### **~~7.3.5.1. Language \- Standard~~**

* ~~English only~~

### 

### ~~7.3.6. Accessibility~~ {#7.3.6.-accessibility}

#### **~~7.3.6.1. Accessibility \- Standard~~**

* ~~None~~

### 

### ~~7.3.7. Offline mode~~ {#7.3.7.-offline-mode}

#### **~~7.3.7.1. Offline mode \- Standard~~**

* ~~No offline mode \- a network connection will be required to access and use the system~~

### 

### ~~7.3.8. Analytics~~ {#7.3.8.-analytics}

#### **~~7.3.8.1. Analytics \- Standard~~**

* ~~Basic data capture on the app~~

#### **~~7.3.8.2. Analytics \- Enhanced~~**

* ~~Provide event tracking through Google Analytics~~

### 

### ~~7.3.9. Testing~~ {#7.3.9.-testing}

#### **~~7.3.9.1. Testing \- Standard~~**

* ~~The offshore and onshore test teams will test each sprint before demos and delivery~~

### 

### ~~7.3.10. Security~~ {#7.3.10.-security}

#### **~~7.3.10.1. Security \- Standard~~** 

* ~~Lock down the database server to approved IPs only~~  
* ~~Only expose necessary ports on the database and application server~~  
* ~~Control access using SSH~~  
* ~~Encrypted communication between the database and server~~  
* ~~Encrypted communication between the web app and the client (SSL)~~  
* ~~Passwords will be encrypted in the database~~  
* ~~Horizontally scalable servers for stability and resilience~~  
* ~~Use the latest version of the framework at the time of project initialisation~~  
* ~~Daily database backup~~

### 

### ~~7.3.11. Infrastructure~~ {#7.3.11.-infrastructure}

#### **~~7.3.11.1. Infrastructure \- Standard~~** 

* ~~Infrastructure requirements will be defined by the technical lead, depending on the complexity of the system~~

### 

### ~~7.3.12. Deployment~~ {#7.3.12.-deployment}

#### **~~7.3.12.1. Deployment \- Standard~~**

* ~~Single server~~

## **7.4. On-Going Costs and Subscriptions** {#7.4.-on-going-costs-and-subscriptions}

* Extended Warranty  
  * 12 % of the build cost per year, paid monthly  
* ~~VAT Sense~~  
  * [~~https://vatsense.com/\#pricing~~](https://vatsense.com/#pricing)   
* ~~Google Analytics~~  
  * ~~Free~~   
  * ~~GA 360 \- Paid version for greater functionality~~  
    * [~~https://marketingplatform.google.com/intl/en\_uk/about/analytics-360/features/~~](https://marketingplatform.google.com/intl/en_uk/about/analytics-360/features/)   
* ~~Google Tag Manager~~  
  * ~~Free~~  
  * ~~Tag Manager 360 \- Paid version for greater functionality~~  
    * [~~https://marketingplatform.google.com/intl/en\_uk/about/tag-manager/compare/~~](https://marketingplatform.google.com/intl/en_uk/about/tag-manager/compare/) 
