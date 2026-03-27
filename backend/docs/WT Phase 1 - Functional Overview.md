WasteTrade Functional Overview v1.0.2

Date 10th May 2024

Client Wastetrade

Job Name Wastetrade Rebuild

Requested by Bevin Tumulty, Jason Loughlin

Written by Pulkit Sharma

# 1 Table of Contents

[**1 Table of Contents 1**](#_yl9vht6mhb21)

[**2 Background and Concept 3**](#_b398vhk8f1c6)

[2.1 Project Overview 4](#_h18otb85rvu0)

[**3 Glossary 4**](#_5ist5xl3njlw)

[**4 Users 5**](#_5x7gvu7enzwc)

[4.1 Permissions Table 5](#_sokywzgnlbka)

[**5 Integrations and Non-Functional Requirements 6**](#_a5bz4r1ah8kf)

[**6 Detailed Functional Requirements 6**](#_tp6s7yytcmn0)

[6.1 Registration and onboarding 6](#_1l88icfathxl)

[6.1.1 Registration - basic details 6](#_k8b0w7uyj12)

[6.1.2 Onboarding - capturing details for account verification 22](#_d8iyhohpt828)

[6.2 Authentication (Shared) 36](#_tr11tj8zjxz5)

[6.2.1 Authentication 36](#_8mxty49bu1k1)

[6.3 Registration (Trading and Haulage) 46](#_yhaxwxawoc97)

[6.3.1 Layout 46](#_dm5m4b2hu6mi)

[6.4 Trading Platform 51](#_3p05t2kcsas4)

[6.4.1 Trading homepage (buy) 52](#_68yl3wc2qv6a)

[6.4.2 Wanted section 58](#_gj0xbzev1sb)

[6.4.3 Sell section 67](#_wthlnea6k929)

[6.4.4 My listings - sales 72](#_m1w7eyat1ntt)

[6.4.5 My listings - wanted 77](#_crnewzl1ve2t)

[6.4.6 My Offers 82](#_x1hwb0jjb9yh)

[6.4.7 Favourites 95](#_oxl3uheonsvn)

[6.4.8 Account settings 95](#_jttutnoxp6tg)

[6.5 Haulage platform 130](#_q2nlr1pas6p)

[6.5.1 Haulage homepage 131](#_ct30v3yefpth)

[6.5.2 Current offers 132](#_uaxisbxm9vob)

[6.5.3 Manage profile 135](#_iv4n4ej3ki5)

[6.6 Admin platform 136](#_blzyv38i7fo1)

[6.6.1 Admin platform homepage 136](#_xgr49vaoax2t)

[6.6.2 Commercial management 154](#_13p9hcis5mkx)

[6.6.3 Document Management 188](#_3flov3pmlfxc)

[6.6.4 User Management 191](#_eu1j4ce7wdf0)

[6.6.5 Materials settings 195](#_j1iiy0m72miy)

[6.6.6 Price calculation settings 198](#_i4ffgrdjln9j)

[6.6.7 Notification settings 200](#_fb9urow1qgn)

[6.6.8 Customer Support - User support content 202](#_d4fia9ajv5s)

[6.6.9 Audit trail 205](#_5c9i004l30zk)

[6.7 Master page and shared elements 210](#_91ymou4e363f)

[6.7.1 Master page (Trading and Hauliers) 210](#_qhvqc6h67l0j)

[6.7.2 Navigation (Trading and Hauliers) 217](#_lmra1cr2ml9m)

[6.7.3 Shared Elements (Trading platform) 222](#_cxogy0giaxtw)

[6.7.4 Messaging 237](#_u7w4mcxucd4o)

[6.7.5 Notifications (Trading platform) 238](#_l9i9s8oqavjy)

[6.7.6 Help and support 240](#_y0o3ffkjbj0c)

[6.7.7 Resources 241](#_kuac97xi9hj7)

[6.8 Trading Platform - Mobile App 242](#_qih6yzxteupo)

[6.8.1 Download and Installation 242](#_o355t8xykayp)

[6.8.2 Splash Screen 242](#_b9f89zj9p5xe)

[6.8.3 Landing Page 242](#_oc311knyr5z3)

[6.8.4 Registration - webview 243](#_oynzwbk5s0zd)

[6.8.5 Authentication 243](#_9ssis3xelfd7)

[6.8.6 Mobile trading homepage (buy) 244](#_w1iw7uxflmf7)

[6.8.7 Wanted section 246](#_fqomit75q1nw)

[6.8.8 Sell section 247](#_yvyncqb6f499)

[6.8.9 My listings - sales 248](#_kgd2cau2d9r5)

[6.8.10 My listings - wanted 250](#_be8j3blwqbmp)

[6.8.11 My Offers 251](#_jpg04n6zw8z2)

[6.8.12 Favourites 255](#_svz6camr19s4)

[6.8.13 Account settings 255](#_lkvx903bsf2q)

[6.8.14 Messaging and notifications 260](#_55l78worsrgr)

[**7 Appendix 262**](#_je70fqvw58bd)

[7.1 Integrations 262](#_7g6d77yuww4k)

[7.2 Web App Non-Functional Requirements 264](#_kuz0v21fa22z)

[7.2.1 Browsers 264](#_9b8eo47k285r)

[7.2.2 Design 264](#_3hun3g2nblkt)

[7.2.3 Version Management 264](#_ust9ganeltvc)

[7.2.4 Speed 265](#_6kurlqitnvg8)

[7.2.5 Language 265](#_rm23zefe0klh)

[7.2.6 Accessibility 265](#_b4pdl650dayh)

[7.2.7 Offline mode 265](#_ttdfg3omfod)

[7.2.8 Analytics 266](#_xd3eg7rvmoyh)

[7.2.9 Testing 266](#_jzajd6mwhrfi)

[7.2.10 Security 266](#_iwtpqkclxa27)

[7.2.11 Infrastructure 267](#_lcb7dfm4zoem)

[7.2.12 Deployment 267](#_g3x7uioxtk2h)

[7.3 On-Going Costs and Subscriptions 267](#_5ovkz17zjhwd)

[7.4 Future Scope 267](#_re1ncqgxrdr2)

[7.5 Email content 269](#_6hfjrof9l9ee)

# 2 Background and Concept

WasteTrade is a Global Waste Marketplace. The website is <https://www.wastetrade.com/>. WasteTrade is an online marketplace to connect waste generators, such as manufacturers, with recyclers and end users of waste commodities around the globe. Users register to become Buyers, Sellers or Hauliers. Sellers list their waste on the site and Buyers can search and bid for the listing. Hauliers bid to transport the traded waste.

Buyers and Hauliers must be accredited and certified to be able to bid to purchase or transport the waste. Sellers are accredited, certified, and vetted to ensure accurate listings. Currently, there is one login per company, but this will be expanded to allow multiple users within a company, with a log of who is performing actions.

WasteTrade currently has a system built in WordPress but is looking for a complete rebuild into a more stable, scalable solution. Salesforce is currently used for the management of Buyers, Sellers and Hauliers. This will remain in Phase 1 but will be replaced in later phases with an Admin Dashboard so the system will function independently of Salesforce. Later phases will also introduce a mobile app for the key user functionality.

The purpose of this document is to describe the functional and non-functional requirements of the system. Technical requirements will be defined later in the process, once the functional requirements of the scope are defined. Any wireframes included in this document are not indicative of the final design.

[WasteTrade - High Level Flow -Swim lane style.pdf](https://drive.google.com/file/d/18ouNRLPQ7hLzlbn7k5r-EVRdH89U8eLi/view?usp=drive_link)

[WasteTrade - High Level Flow.pdf](https://drive.google.com/file/d/1ahMHnTUW4kSpoV_qHY4gVAKg71kKhUQe/view?usp=drive_link)

## 2.1 Project Overview

This project is dedicated to the comprehensive redevelopment of the WasteTrade platform, segmented into three primary modules to enhance functionality and user interaction across the global waste management and recycling marketplace.

- The Trading Platform
  - This module will serve as the core interface for Buyers and Sellers, allowing them to efficiently search, bid for, and purchase waste listings.
- The Haulage Platform
  - The users will be able to use this module to bid for transport jobs and view their past activity
- The Admin Platform
  - The Admin Platform will allow the WasteTrade team to manage the full operation. It will offer detailed user activity logs, comprehensive reporting features, and customisable access controls to enhance administrative efficiency.

It will be a success if the rebuild:

- Completely replicates existing functionality
  - The system will replace the existing WordPress solution creating minimal disruption for WasteTrade and its community
  - The system will push the relevant data into WasteTrade’s CRM **\[Need Information before implementation\]**
- Lays the foundations for advanced future functionality
  - The system is designed not only to meet current operational needs but also to support future advancements, including the integration of machine learning for predictive analytics and automated compliance checks.
- Delivers a high-performing platform for WasteTrade
  - The new platform will be engineered to maintain high performance regardless of user load. It will feature scalable architecture to ensure that system speed remains optimal as the number of users grows and as the platform scales globally.

The scope of work will be delivered in three phases. The user stories not struck-through will be delivered in phase 1. User stories included in phases 2 and 3 have been defined in the comments, and also in the WBS.

# 3 Glossary

**Admin Platform:** The backend module where WasteTrade staff manage all aspects of the platform, including user activities and system settings.

**Buyer:** A registered user on WasteTrade who can search and bid for waste materials listed by sellers.

**Haulier:** A certified user responsible for the transportation of traded waste materials, bidding on and fulfilling transport jobs.

**Listing:** An entry created by a seller detailing waste material available for purchase, open for bids from buyers.

**MVP (Minimum Viable Product):** The initial version of the platform that includes only the most essential features required for operation, used to collect feedback for future iterations.

**SDS (Software Design Specification):** A document that outlines all technical aspects of the project, such as software architecture and API integrations, to be produced post-approval of the development plan.

**Seller:** A vetted and approved user who lists waste materials for sale, ensuring all listings are accurate and meet quality standards.

**Super Admin:** A user role with comprehensive access to all administrative functions of the platform, including high-level settings and user management.

**Trading Platform:** The main interface for buyers and sellers, facilitating the posting, searching, and bidding of waste materials.

# 4 Users

User numbers are indicative to give the development team an idea of the expected size of the system. These user numbers are not fixed limits.

<table><thead><tr><th><p><strong>Role Name</strong></p></th><th><p><strong>No. of Users</strong></p></th><th><p><strong>Responsibility / Activity</strong></p></th></tr><tr><th><p>Super Admin</p></th><th><p>4</p></th><th><ul><li>System settings</li><li>Admin user management</li></ul></th></tr><tr><th><p>Admin</p></th><th><p>5 - 20</p></th><th><ul><li>User Dashboard for approvals and accreditations</li><li>Trade Dashboard to manage commercial activity</li></ul></th></tr><tr><th><p>User</p></th><th><p>500+</p></th><th><ul><li>Buyer<ul><li>Manage account</li><li>Manage bids for waste</li><li>No access to the haulage platform</li></ul></li><li>Seller<ul><li>Manage account</li><li>Manage listings for waste</li><li>No access to the haulage platform</li></ul></li><li>Haulier<ul><li>Manage account</li><li>Manage bids for transport</li><li>No access to trading platform</li></ul></li></ul></th></tr></thead></table>

## 4.1 Permissions Table

[Permissions for WasteTrade](https://docs.google.com/spreadsheets/d/1aQtwC2a-2Ab3IRhkyaL1CeaaHBsIgYnS0NvcZCv-KNQ/edit?usp=sharing)

# 5 Integrations and Non-Functional Requirements

Standard Non-Functional requirements will be included in the application development. Enhanced and Super Enhanced features will incur additional costs and be defined as in-scope or out-of-scope during the MoSCoW session.

- [Web app non-functional requirements](#_kuz0v21fa22z)
- [Integration requirements](#_7g6d77yuww4k)

# 6 Detailed Functional Requirements

## 6.1 Registration and onboarding

### 6.1.1 Registration - basic details

#### 6.1.1.1 Registration form sections - Trading Platform

- The users will come to the registration form from the WasteTrade website or a dedicated landing page
- The registration form will have the following sections
  - Basic details
    - Prefix
    - First name
    - Last name
    - Phone number
    - Email address
      - This user will be the org admin
    - Confirm Email
    - Password
    - Confirm password
    - Company name
    - Company interest
      - Buyer
      - Seller
      - Both
  - Material selection
    - - LDPE
        - PET
        - HDPE
        - ABS
        - Acrylic
        - PC
        - PVC
        - PP
        - PS
        - PA
        - Other(Mix)
        - Other
        - Other ( Single Sources)
        - Granulates
        - Text field 'Other material' is displayed when 'Other' is checked
    - Ability to select all/deselect all
  - Where did you hear about us?
    - Dropdown
  - Declaration
    - Checkbox: “I accept the [T&Cs](#_8r9ry5crkexp) and [Privacy Policy](#_cjfs716j6i3r) by joining WasteTrade”
- There will be a button to “Create Account”

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Form Access:<ul><li>Users must be able to access the registration form seamlessly either from the WasteTrade main website or a dedicated landing page.</li><li>Ensure there is a clear and visible link or button on the website and landing page directing users to the registration form.</li></ul></li><li>Form Sections and Fields:<ul><li>All form fields are mandatory</li><li>The form should be divided into clearly marked sections: Basic Details, Company Details, Company Interest, Material Selection, Source of Awareness, and Declaration.</li><li>Each section must contain all fields as specified:<ul><li>Basic Details: Prefix, First Name, Last Name, Job Title, Phone Number, Email Address (this user will be the org admin) and Confirm Email Address, Password and Confirm Password.<ul><li>Prefix: Drop Down menu with values Dr., Miss, Mr., Mrs., Ms., Mx., Prof., Rev.</li><li>First name: Placeholder text “e.g. Mark”</li><li>Last name: Placeholder text “e.g. Smith”</li><li>Job title: Placeholder text “Type here”</li><li>Email &amp; Confirm Email Address: “sample@gmail.com”</li><li>Password &amp; Confirm Password: “Type here”<ul><li>Password field has strength validation (weak, medium, strong):</li></ul></li></ul></li></ul></li></ul></li></ul><p>Weak Password:</p><p>Password meets the minimum requirement of 8 characters.</p><p>Uses only one type of character (only lowercase letters or only numbers).</p><p>Does not contain special characters.</p><p>Example: "password1" or "abc12345", etc</p><p>Medium Password:</p><p>Length between 8 to 11 characters</p><p>Combines at least two different types of characters (lowercase letters, numbers, uppercase letters, or special characters).</p><p>Does not contain easily guessable words or simple character sequences.</p><p>Strong Password:</p><p>Length of 12 characters or more.</p><p>Combines at least three different types of characters (lowercase letters, numbers, uppercase letters, and special characters).</p><p>Does not contain easily guessable words or common character sequences.</p><p>Regularly changed and not reused from previous passwords.</p><ul><li><ul><li><ul><li>Company Information: Company Name (Placeholder text: “Type here”), Company Interest (with a Drop Down menu with values Buyer, Seller, Both, Other).</li><li>Material Selection: The materials should be grouped into clearly defined categories: Each category must have specific material types listed with checkboxes for selection.<ul><li>The categories include:<ul><li>LDPE</li><li>PET</li><li>HDPE</li><li>ABS</li><li>Acrylic</li><li>PC</li><li>PVC</li><li>PP</li><li>PS</li><li>PA</li><li>Other (Mix)</li><li>Other</li><li>Other (Single Sources)</li><li>Granulates</li><li>Text field 'Other material' is displayed when 'Other' is checked</li></ul></li></ul></li><li>Where did you hear about us?: A dropdown menu with predefined sources (Google Search, PRSE Trade Show, Plastics Live Trade Show, Sustainability show, K-Show, Interplas, Plast 2023, Word of mouth)</li><li>Declaration: A checkbox for "I accept the T&amp;Cs and Privacy Policy by joining WasteTrade."</li></ul></li></ul></li><li>Form Functionality:<ul><li>All fields must validate user input as per the data type expected (e.g., email validation, mandatory fields such as T&amp;Cs acceptance).</li><li>The "Company Type" dropdown must dynamically show a text field if "Other" is selected.</li><li>The "select all/deselect all" functionality in Material Selection must work correctly, altering the selection status of all listed materials with one action.<ul><li>When "Select All" is clicked, all available checkboxes in the section should be selected and the text will change to “Deselect All”</li><li>If "Deselected All" is clicked, it should deselect all the checkboxes and the text will change to “Deselect All”</li></ul></li><li>Both the Password and Confirm Password fields must include an eye icon that allows the user to toggle between showing and hiding the entered text<ul><li>When the eye icon is clicked:<ul><li>If the password is currently hidden, it should become visible.</li><li>If the password is currently visible, it should become hidden.</li></ul></li><li>This functionality must be consistent with the current implementation on the site.</li></ul></li><li>The form should prevent submission if any mandatory fields are incomplete or if the declaration checkbox is unchecked.</li></ul></li><li>User Feedback:<ul><li>Upon successful form submission, the user should receive a confirmation message or be redirected to a welcome page/dashboard.</li><li>User will be able to receive an email for the successful registration, but cannot start trading until they complete onboarding with all necessary information.</li><li>Error messages should be clear and helpful, pointing out exactly which fields need correction if the form fails to submit due to validation issues.</li></ul></li><li>Integration and Consistency:<ul><li>The registration form must integrate smoothly with the existing backend CRM and database systems without causing duplicates or data integrity issues. (Salesforce CRM - information for integration will be provided by client)</li><li>Ensure the design and user experience of the registration form are consistent with the overall WasteTrade platform's visual and functional standards.</li></ul></li></ul></th></tr></thead></table>

<table><thead><tr><th><p><strong>Field</strong></p></th><th><p><strong>Description</strong></p></th></tr><tr><th><p>Prefix</p></th><th><p>Input Type: Dropdown; Dropdown Options: Dr, Miss, Mr, Mrs, Ms, Mx, Prof., Rev., Constraints: None; Mandatory: Yes; Default value : “Mr”</p></th></tr><tr><th><p>First Name</p></th><th><p>Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters; Mandatory: Yes</p></th></tr><tr><th><p>Last Name</p></th><th><p>Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters; Mandatory: Yes</p></th></tr><tr><th><p>Phone Number Country Code</p></th><th><p>Input Type: Dropdown; Dropdown options show country flag, Country Name, Country code Constraints: None; Mandatory: Yes; Default value : UK +44</p></th></tr><tr><th><p>Job Title</p></th><th><p>Input type: Text; Constraints: Min 1 character, Max 50 characters, Mandatory</p></th></tr><tr><th><p>Phone Number</p></th><th><p>Input Type: Text; Constraints: Numeric, Max 15 digits; Mandatory: Yes</p></th></tr><tr><th><p>Email Address</p></th><th><p>Input Type: Email; Constraints: Must include “@” Valid email format; Mandatory: Yes;</p></th></tr><tr><th><p>Confirm email</p></th><th><p>Input Type: Email; Constraints: Must include “@”Valid email format; Mandatory: Yes; Must match the Email Address field</p></th></tr><tr><th><p>Password</p></th><th><p>Input Type: Password; Constraints: Min 8 characters, must include numbers and letters, contain special characters; Mandatory: Yes</p></th></tr><tr><th><p>Confirm password</p></th><th><p>Input Type: Password; Constraints: Min 8 characters, must include numbers and letters; Mandatory: Yes; Must match the Password field.</p></th></tr><tr><th><p>Company Name</p></th><th><p>Input Type: Text; Constraints: Max 100 characters; Mandatory: Yes</p></th></tr><tr><th><p>Company Interest</p></th><th><p>Input Type: Dropdown menu with values Buyer, Seller, Both; Constraints: No; Mandatory: Yes; Default value: “Both”</p></th></tr><tr><th><p>Materials of interest (Multiple selection)</p></th><th><ul><li>LDPE</li><li>PET</li><li>HDPE</li><li>ABS</li><li>Acrylic</li><li>PC</li><li>PVC</li><li>PP</li><li>PS</li><li>PA</li><li>Other(Mix)</li><li>Other</li><li>Other ( Single Sources)</li><li>Granulates</li><li>Text field 'Other material' is displayed when 'Other' is checked</li></ul></th></tr><tr><th><p>Other material</p></th><th><p>Display condition: When 'Other' in the Materials of interest is checked</p><p>Input Type: Text field; Constraints:Max 100 characters; Mandatory: Yes</p></th></tr><tr><th><p>Select all/Deselect all</p></th><th><p>Default value: Select all<br>Display condition:</p><ul><li>When clicking on Select all, all checkboxes in materials of interest are checked, and button text display “Deselect all”</li><li>When clicking on Deselectall, all checkboxes in materials of interest are unchecked, and button text display “Select all”</li></ul><p>Type: Button; Constraints: No; Mandatory:No</p></th></tr><tr><th><p>Where did you hear about us?</p></th><th><p>Input Type: Dropdown menu with values from predefined sources ; Constraints: None; Mandatory: Yes</p></th></tr><tr><th><p>Accept T&amp;Cs and Privacy Policy</p></th><th><p>Input Type: Checkbox; Constraints: Must be checked to proceed; Mandatory: Yes</p></th></tr><tr><th><p>Create Account Button</p></th><th><p>Action: Submits form; Constraints: All mandatory fields must be filled and valid</p></th></tr></thead></table>

| **Use case** | **Error message** |
| --- | --- |
| Missing mandatory field (generic for any field) | Please complete all required fields. |
| --- | --- |
| Invalid email format | Please enter a valid email address. |
| --- | --- |
| Password does not meet requirements | Passwords must be at least 8 characters and include numbers and letters. |
| --- | --- |
| Phone number invalid | Please enter a valid phone number. |
| --- | --- |
| Unchecked T&Cs and Privacy Policy | You must accept the Terms and Conditions and Privacy Policy to proceed. |
| --- | --- |
| Submission attempt with incomplete company type | Please provide your company type or specify if 'Other'. |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Registration page | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-14170&node-type=frame&t=YxxV4YeDU1a6kKN0-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.1.1.2 Registration form sections - Haulage Platform

- The registration form will have the following sections
  - Basic details
    - Prefix
    - First name
    - Last name
    - Phone number
    - Email address
      - This user will be the org admin
    - Confirm email address
    - Password
    - Confirm password
  - Company details
    - Company name
    - Select the Country of VAT registration
      - EU (European Union)
      - UK (United Kingdom)
      - Other
    - Company VAT number
      - Display when the Country of VAT registration selected
    - Company Registration Number
    - Street Address
    - Postcode
    - City
    - County/State/Region
    - Country
      - Dropdown menu with values from predefined sources
    - Telephone
    - Mobile
  - Additional information
    - Fleet Type
      - Freight Forwarder
      - Own Fleet
    - Areas covered
      - UK Only
      - Within EU
      - Worldwide
    - Container types
      - Shipping Container
      - Curtain Sider (High Cube)
      - Curtain Sider (Standard)
      - Walking Floor
  - Upload Waste Carrier Licence
    - Upload from the device (including mobile device) or drag and drop a file
    - Provide Expiry Date in a DD/MM/YYYY format
  - Where did you hear about us?
    - Dropdown
  - Declaration
    - Checkbox: “I accept the [T&Cs](#_8r9ry5crkexp) and [Privacy Policy](#_cjfs716j6i3r) by joining WasteTrade”
- There will be a button to “Create Haulier Account”

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Form Access:<ul><li>Users must be able to access the registration form directly from the Haulage Platform section on the WasteTrade website or from a specifically dedicated landing page.</li></ul></li><li>Form Sections and Field Validations:<ul><li>All the form fields will be mandatory</li><li>The form should include distinct sections for Basic Details, Company Details, Additional Information, Document Uploads, and Declaration.</li><li>Each section must contain the following fields with specified validations:<ul><li>Basic Details: Prefix, First Name, Last Name, Job Title, Phone Number, Email (designated as the organisation admin) and Confirm Confirm Email, Password and Confirm Password.<ul><li>Prefix: Drop Down menu with values Dr., Miss, Mr., Mrs., Ms., Mx., Prof., Rev.</li><li>First name: Placeholder text “e.g. Mark”</li><li>Last name: Placeholder text “e.g. Smith”</li><li>Job title: Placeholder text “Type here”</li><li>Email &amp; Confirm Email Adress: “sample@gmail.com”</li><li>Password &amp; Confirm Password: “Type here”<ul><li>Password field has strength validation (weak, medium, strong):</li></ul></li></ul></li></ul></li></ul></li></ul><p>Weak Password:</p><p>Password meets the minimum requirement of 8 characters.</p><p>Uses only one type of character (only lowercase letters or only numbers).</p><p>Does not contain special characters.</p><p>Example: "password1" or "abc12345", etc</p><p>Medium Password:</p><p>Length between 8 to 11 characters</p><p>Combines at least two different types of characters (lowercase letters, numbers, uppercase letters, or special characters).</p><p>Does not contain easily guessable words or simple character sequences.</p><p>Strong Password:</p><p>Length of 12 characters or more.</p><p>Combines at least three different types of characters (lowercase letters, numbers, uppercase letters, and special characters).</p><p>Does not contain easily guessable words or common character sequences.</p><p>Regularly changed and not reused from previous passwords.</p><ul><li><ul><li><ul><li>Both the Password and Confirm Password fields must include an eye icon that allows the user to toggle between showing and hiding the entered text<ul><li>When the eye icon is clicked:<ul><li>If the password is currently hidden, it should become visible.</li><li>If the password is currently visible, it should become hidden.</li></ul></li><li>This functionality must be consistent with the current implementation on the site.</li></ul></li><li>Company Details: Company Name (Placeholder text: “Type here”), Country of VAT Registration (with options: EU, UK, Other), Company VAT number, Street Address, Postcode, City, County/State/Region, Country (dropdown menu with predefined options), Telephone, Mobile.</li><li>Additional Information:<ul><li>Fleet Type (Options: Freight Forwarder, Own Fleet),</li><li>Areas Covered (options: UK Only , Within EU, World Wide), if ‘Within EU’ is checked the list of EU countries checkboxes will display<ul><li>There will be a button to “Select all”.</li></ul></li><li>Container Types (Options: Shipping Container, Curtain Sider (High Cube), Curtain Sider (Standard), Walking Floor)<ul><li>There will be a button to “Select all”.</li></ul></li></ul></li><li>Document Uploads: Waste Carrier Licence (with functionality to upload from the device (including mobile device) or drag and drop a file), provision to enter the expiry date of the licence.</li><li>Where did you hear about us?: A dropdown menu with predefined options.</li><li>Declaration: A checkbox for "I accept the T&amp;Cs and Privacy Policy by joining WasteTrade".</li></ul></li></ul></li><li>Form Submission and User Feedback:<ul><li>A "Create Account" button must be clearly visible and active only when all mandatory fields are filled, and the declaration checkbox is checked.</li><li>Upon successful submission, users should receive a confirmation message and/or be redirected to a confirmation page/dashboard.</li><li>Error messages should be clear and displayed near the respective fields. Errors should specify the exact issue (e.g., invalid email format, mandatory field left blank).</li></ul></li><li>Document Management:<ul><li>The system must verify the format and size of uploaded documents up to the max file size of 25 MB, only PDF and standard image formats are allowed</li><li>Notifications for nearing the expiry date of uploaded licences should be automated as per the expiry date provided.</li></ul></li><li>Integration and Consistency:<ul><li>Ensure the design and functionality of the Haulage Platform registration form are consistent with the Trading Platform's form in terms of layout, style, and user interaction to maintain a cohesive user experience across the platform.</li><li>Integrate the form with backend systems to ensure real-time data synchronisation and avoid data duplication.</li></ul></li></ul></th></tr></thead></table>

<table><thead><tr><th><p><strong>Field</strong></p></th><th><p><strong>Description</strong></p></th></tr><tr><th><p>Prefix</p></th><th><p>Input Type: Dropdown; Constraints: Mandatory; Options include Dr. , Miss, Mr. , Mrs. , Ms. , Mx. , Prof. , Rev. .</p></th></tr><tr><th><p>First Name</p></th><th><p>Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters; Mandatory: Yes</p></th></tr><tr><th><p>Last Name</p></th><th><p>Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters; Mandatory: Yes</p></th></tr><tr><th><p>Job Title</p></th><th><p>Input type: Text; Constraints: Min 1 character, Max 50 characters, Mandatory</p></th></tr><tr><th><p>Phone Number</p></th><th><p>Input Type: Text; Constraints: Numeric, Max 15 characters; Mandatory:Yes</p></th></tr><tr><th><p>Email Address</p></th><th><p>Input Type: Email; Constraints: Valid email format; Mandatory:Yes</p></th></tr><tr><th><p>Confirm Email Address</p></th><th><p>Input Type: Email; Constraints: Valid email format; Mandatory:Yes; Must match the Email Address field</p></th></tr><tr><th><p>Password</p></th><th><p>Input Type: Password; Constraints: Min 8 characters, must include numbers and letters, contain special characters; Mandatory: Yes</p></th></tr><tr><th><p>Confirm Password</p></th><th><p>Input Type: Password; Constraints: Min 8 characters, must include a number, includes alphanumeric; Mandatory:Yes; Must match the Password field</p></th></tr><tr><th><p>Company Name</p></th><th><p>Input Type: Text; Constraints: Max 100 characters; Mandatory:Yes</p></th></tr><tr><th><p>Company Registration Number</p></th><th><p>Input Type: Text; Constraints: Max 20 characters; Mandatory:Yes</p></th></tr><tr><th><p>Country of VAT Registration</p></th><th><p>Input Type: Radio Buttons ; Constraints: When Only one option is checked; Mandatory:Yes; Options: EU (European Union), United Kingdom, Other</p></th></tr><tr><th><p>Company VAT number</p></th><th><p>Input Type: Text; Constraints: Max 20 characters; Mandatory:Yes</p></th></tr><tr><th><p>Street Address</p></th><th><p>Input Type: Text; Constraints: Max 100 characters; Mandatory:Yes</p></th></tr><tr><th><p>Postcode</p></th><th><p>Input Type: Text; Constraints: Max 20 characters; Mandatory:Yes</p></th></tr><tr><th><p>City</p></th><th><p>Input Type: Text; Constraints: Max 50 characters; Mandatory:Yes</p></th></tr><tr><th><p>County/State/Region</p></th><th><p>Input Type: Text; Constraints: Max 50 characters; Mandatory:Yes</p></th></tr><tr><th><p>Country</p></th><th><p>Input Type: Dropdown menu with predefined options; Constraints: No; Mandatory:Yes</p></th></tr><tr><th><p>Phone Number Country Code</p></th><th><p>Input Type: Dropdown; Dropdown options show country flag, Country Name, Country code Constraints: None; Mandatory: Yes; Default value : UK +44</p></th></tr><tr><th><p>Telephone</p></th><th><p>Input Type: Text; Constraints: Numeric, Max 15 characters; Mandatory : Yes</p></th></tr><tr><th><p>Mobile</p></th><th><p>Input Type: Text; Constraints: Numeric, Max 15 characters; Optional</p></th></tr><tr><th><p>Fleet Type</p></th><th><p>Input Type: Radio Buttons; Constraints: No; Mandatory: Yes; Options: Freight Forwarder, Own Fleet</p></th></tr><tr><th><p>Areas Covered</p></th><th><p>Input Type: Radio Buttons; Constraints: Only one option is checked; Options: UK Only, Within EU, World Wide; Mandatory: Yes</p></th></tr><tr><th><p>Select the EU countries</p></th><th><p>Display condition: When ‘Within EU’ in the Areas Covered checked</p><p>Include checkboxes with values from predefined sources</p><p>Input type: Checkbox, Constraints: No; Mandatory: Yes</p></th></tr><tr><th><p>Select all/Deselect all</p></th><th><p>Default value: Select all<br>Display condition:</p><ul><li>When ‘Within EU’ in the Areas Covered checked</li><li>When clicking on Select all, all checkboxes in select the EU countries are checked, and button text display “Deselect all”</li><li>When clicking on Deselectall, all checkboxes in select the EU countries are unchecked, and button text display “Select all”</li></ul><p>Type: Button; Constraints: No; Mandatory:No</p></th></tr><tr><th><p>Container Types</p></th><th><p>Input Type: Checkbox; Options: Shipping Container, Curtain Sider(Standard), Curtain Sider (High Cube), Walking Floor, All;</p><p>Constraints: At least one option must be checked</p></th></tr><tr><th><p>Select all/Deselect all</p></th><th><p>Default value: Select all<br>Display condition:</p><ul><li>When clicking on Select all, all checkboxes in select the Container Types are checked, and button text display “Deselect all”</li><li>When clicking on Deselectall, all checkboxes in select the Container Types are unchecked, and button text display “Select all”</li></ul><p>Type: Button; Constraints: No; Mandatory:No</p></th></tr><tr><th><p>Waste Carrier Licence</p></th><th><p>Input Type: File Upload;</p><p>Constraints:</p><ul><li>File types: jpg, png, jpeg, pdf, doc, xls, docx, Max.</li><li>File size: 25 MB</li><li>Max files: 6.</li></ul><p>Mandatory: Yes</p></th></tr><tr><th><p>Expiry Date</p></th><th><p>Input type: Date;</p><p>Constraints :</p><ul><li>Format: dd/mm/yyyy</li></ul><p>Mandatory: Yes</p></th></tr><tr><th><p>Where did you hear about us?</p></th><th><p>Input Type:Dropdown menu with values from predefined sources(Google Search,PRSE Trade Show,Plastics Live Trade Show,Sustainability show,K-Show, Interplas,Plast 2023,Word of mouth) ; Constraints: No; Mandatory: Yes</p></th></tr><tr><th><p>Accept T&amp;Cs and Privacy Policy</p></th><th><p>Input Type: Checkbox; Constraints: Must be checked to proceed; Mandatory: Yes</p></th></tr><tr><th><p>Create Account Button</p></th><th><p>Action: Submits form; Constraints: All mandatory fields must be filled and valid</p></th></tr></thead></table>

| **Use Case** | **Error Message** |
| --- | --- |
| Mandatory field not filled | Please fill in all required fields. |
| --- | --- |
| Invalid email format | Please enter a valid email address. |
| --- | --- |
| Invalid phone number | Please enter a valid phone number. |
| --- | --- |
| Password does not meet requirements | Your password must be at least 8 characters long and include numbers. |
| --- | --- |
| Unchecked T&Cs and Privacy Policy | You must accept the Terms & Conditions and Privacy Policy to proceed. |
| --- | --- |
| Invalid file format for licence upload | Invalid file format. Please upload a valid Waste Carrier Licence. |
| --- | --- |
| No area covered selected | Please select at least one area that you cover. |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Registration form section - Haulage platform | [https://www .figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11185-3013&node-type=frame&t=9tXnOiY4OzOwgBzU-11](https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11185-3013&node-type=frame&t=9tXnOiY4OzOwgBzU-11) |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.1.1.3 Terms & Conditions

- The Terms & Conditions will open in a new tab when the user clicks on the Terms & Conditions link
- The content will be provided by the client

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Link Accessibility:<ul><li>The Terms &amp; Conditions link must be clearly visible and accessible from all relevant pages where user agreements are required (e.g., registration, checkout processes).</li><li>The link should be appropriately labelled and positioned to ensure easy user access.</li></ul></li><li>Link Functionality:<ul><li>Clicking on the Terms &amp; Conditions link must open the document in a new tab, not navigating away from the current page or form the user is viewing.</li><li>The functionality of opening in a new tab must be consistent across all browsers and platforms (desktop, mobile, tablet).</li></ul></li><li>Content Display:<ul><li>The content of the Terms &amp; Conditions must be displayed clearly and be easily readable. Ensure the text formatting (font size, style, spacing) promotes good readability.</li><li>The new tab should load with the top of the document visible, allowing the user to begin reading immediately without needing to scroll upwards.</li></ul></li><li>Content Management:<ul><li>The content for the Terms &amp; Conditions will be provided by the client. Ensure the content is up-to-date and reflects the latest legal requirements and company policies.<ul><li><strong>Note: This is the client’s responsibility</strong></li></ul></li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that the link to the Terms &amp; Conditions operates correctly across all specified platforms and browsers.</li><li>Validate that the content loads correctly in the new tab without errors or delays, ensuring that the entire document is accessible.</li></ul></li><li>User Feedback and Error Handling:<ul><li>Implement and test user feedback mechanisms for reporting issues with accessing or understanding the Terms &amp; Conditions.</li><li>Ensure appropriate error handling is in place for failed content loading scenarios, such as providing a user-friendly message and options to retry accessing the document.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| Content unavailable | Oops! It seems we are having some trouble displaying this page. Please check back later. |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Term & Conditions | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11184-2685&node-type=frame&t=BjPxjYT1ytfDWQXs-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.1.1.4 Privacy Policy

- The Privacy Policy will open in a new tab when the user clicks on the Privacy Policy
- The content will be provided by the client

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Link Accessibility:<ul><li>The Privacy Policy link must be prominently displayed and easily accessible from all relevant areas of the platform, such as during registration, within user settings, and at the footer of the website.</li><li>The link should be clearly labelled as "Privacy Policy" to avoid any ambiguity for the users.</li></ul></li><li>Link Functionality:<ul><li>Upon clicking the Privacy Policy link, the document should open in a new browser tab, ensuring that the user's current session on the original tab remains uninterrupted.</li><li>This functionality must be consistently supported across all standard web browsers and devices, including mobiles and tablets.</li></ul></li><li>Content Display:<ul><li>The content of the Privacy Policy should load correctly in the new tab, starting at the top of the document, to allow the user to begin reading immediately without additional navigation.</li><li>Text formatting should be clear and legible, with appropriate use of headings, subheadings, and paragraphs to facilitate easy reading.</li></ul></li><li>Content Management:<ul><li>The Privacy Policy content, provided by the client, should be up-to-date and reflect current data protection regulations and practices relevant to the platform’s operations.<ul><li><strong>Note: This is the client’s responsibility</strong></li></ul></li></ul></li><li>Testing and Validation:<ul><li>Perform comprehensive testing to verify that the Privacy Policy link opens the document correctly in a new tab across various devices and browsers.</li><li>Validate that the document loads efficiently and without errors, ensuring full accessibility to the content.</li></ul></li><li>User Feedback and Error Handling:<ul><li>Implement mechanisms for users to provide feedback or report issues related to accessing the Privacy Policy.</li><li>Include error handling for scenarios where the Privacy Policy fails to load, providing users with informative messages and alternative options to access the information, such as a direct support contact or a retry link.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| Content unavailable | Oops! It seems we are having some trouble displaying this page. Please check back later. |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Privacy Policy | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11184-2692&node-type=frame&t=BjPxjYT1ytfDWQXs-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.1.1.5 Submit form - confirmation page (stage 1)

- On submitting the form (“create account”) the user will see
  - Progress Tracker
    - Three-step tracker,as per the present website
- There will be a message “Thank you for registering”
  - There will be a warning message
    - Trading: “You can start buying and selling material now, but please note that all transactions will be pending until your account is completed and you have uploaded the company documentation”
      - There will be two options
        - Complete account - redirect to complete onboarding section
        - Go to the platform - redirect to the user’s homepage
    - Haulage: ~~“You can browse the portal. But you will not be able to make any bids till your documents have been verified”.~~
      - “You can browse the portal, but bids will not be approved until your documents have been verified”.
      - There will be an option to go to the “Haulier Dashboard”
- The system will send an email to the user asking them to complete the onboarding process

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Form Submission and Response:<ul><li>Upon clicking the “create account” button, the system must validate the form data and submit it only if all fields meet the specified requirements.</li><li>The user should be redirected to a confirmation page immediately after form submission without any delay.</li></ul></li><li>Progress Tracker Display:<ul><li>A three-step progress tracker, consistent with the existing website design, must be displayed at the top of the confirmation page to indicate the user's current stage in the onboarding process.<ul><li>1st stage is: Registration</li><li>2nd Stage is: Complete account<ul><li>See 6.1.2 Onboarding</li></ul></li><li>3rd stage is: Pending Review<ul><li>Account approval from admin</li></ul></li></ul></li></ul></li><li>Confirmation Messages:<ul><li>Display a prominent "Thank you for registering" message to acknowledge the successful form submission.</li><li>Depending on the user type (Trading or Haulage), display a contextual warning message:</li><li>Trading: “You can start buying and selling material now, but please note that all transactions will be pending until you complete your account and upload the company documentation.”</li><li>Haulage: “You can browse the portal. But you will not be able to make any bids till your documents have been verified.”</li></ul></li><li>Username:<ul><li>The system will automatically assign each user a unique 8-digit numerical username.</li><li>Usernames will be randomly generated but the system must ensure usernames are unique to each user.</li><li>Usernames are used to display specific buyers/sellers/hauliers in the platform without showing personal information i.e. users name.</li></ul></li><li>Navigation Options:<ul><li>Provide clear, actionable options on the confirmation page:<ul><li>For Trading Users:<ul><li>A button/link labelled “Complete account” that redirects users to the complete onboarding section to upload necessary documents.</li><li>A button/link labelled “Go to the platform” that takes users to their homepage.</li></ul></li><li>For Haulage Users:<ul><li>A button/link labelled “Go to the Haulier Dashboard” to direct users to their specific dashboard.</li></ul></li></ul></li></ul></li><li>Email Notification:<ul><li>An automated email should be sent to the user's registered email address upon successful registration, instructing them to complete the onboarding process. This email should contain links to direct the user appropriately, mirroring the options provided on the confirmation page.<ul><li>See <a href="#_2jwe7hb5uur5">Register Email </a>in appendix</li><li>There will be no expiry time for the token (link) in the email</li></ul></li></ul></li><li>Error Handling and User Feedback:<ul><li>If there is an error in form submission or the page fails to load properly, display a user-friendly error message prompting them to retry or contact support.</li><li>Ensure error messages are helpful and provide clear instructions on how to resolve issues.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to submit form | Submission failed. Please try again or contact support. |
| --- | --- |
| Email not sent | There was a problem sending your confirmation email. Please check your email address or contact support. |
| --- | --- |
| Page fails to load properly | Page loading error. Please refresh the page or contact support for assistance. |
| --- | --- |
| Required actions not available (buttons/link) | Required actions currently unavailable. Please refresh or contact support. |
| --- | --- |
| Failed submission as file size is too large | Submission failed. Uploaded document is too large. Please reduce size and try again. |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Submit confirmation | Trading: <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11136-2258&node-type=frame&t=9tXnOiY4OzOwgBzU-11>  <br>Haulier: <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11184-2906&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

### 6.1.2 Onboarding - capturing details for account verification

These sections are only filled by the users registering for the trading platform.

#### 6.1.2.1 Company information section

- The following information will be captured
  - Company Type (auto-populated from the registration form)
  - VAT Registration country selection (auto-populated from the registration form)
  - COULD YOU PLEASE CONFIRM THE COUNTRY WHERE YOUR VAT REGISTRATION IS LOCATED?\* : Select option ( EU / UK / Other)
  - VAT number : Displayed when VAT Registration country checked
  - Company registration number
  - Address (auto-populated from the registration form)
    - Street Address
    - Postcode
    - City
    - County/State/Region
    - Country
  - Next & Save button

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Form Field Auto-Population:<ul><li>Fields for Company Type, VAT Registration Country, Address (Street Address, Postcode, City, County/State/Region, Country), Telephone, and Mobile must be auto-populated from the data provided during the initial registration.</li><li>The system must ensure the data is carried over correctly and appears accurately in the respective fields on the onboarding form.</li></ul></li><li>Mandatory Information Input:<ul><li>Users must provide their Company Registration Number as it is not auto-populated and is required for completing the account verification process.</li><li>Ensure the field for the Company Registration Number is clearly marked as mandatory.</li></ul></li><li>Data Validation and Integrity:<ul><li>Validate that the Company Registration Number follows the appropriate format and meets any specific criteria ( numeric/alphanumeric).</li><li>Verify that all auto-populated fields are not editable by the user to maintain data consistency and prevent errors.</li></ul></li><li>User Interface and Experience:<ul><li>All fields, both auto-populated and manually entered, should be clearly visible and labelled accurately to ensure user understanding and ease of completion.</li></ul></li><li>Error Handling:<ul><li>Implement clear and informative error messages for scenarios where the data does not validate or when mandatory fields are left incomplete.</li><li>Error messages should guide the user on how to correct the entries effectively, ensuring they can complete the onboarding process smoothly.</li></ul></li><li>Testing and Quality Assurance:<ul><li>Conduct thorough testing to ensure that all auto-populated fields fetch and display the correct information from the registration database.</li><li>Test manual data entry for the Company Registration Number to confirm that validation rules are applied correctly and error messages are triggered appropriately.</li></ul></li><li>Progress and Completion Tracking:<ul><li>Upon successful completion of this section, users should be clearly informed that their company information has been successfully captured and verified, and guide them to the next step in the onboarding process.</li><li>Use a visual indicator or progress bar to show the user their current status and the next steps remaining in the onboarding process.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| Company Type | Auto-populated and editable field;<br><br>Input Type: Dropdown menu with values from predefined sources ;  <br>Constraints: None;  <br>Mandatory |
| --- | --- |
| VAT Registration Country | Auto-populated and editable field;<br><br>Input Type: Radio Button;<br><br>Constraints: Only one option is checked;<br><br>Mandatory |
| --- | --- |
| VAT Number | Display conditions : When VAT Registration Country checked  <br>Auto-populated and editable field;<br><br>Input Type: Text; Mandatory |
| --- | --- |
| Company Registration Number | Input Type: Text;<br><br>Constraints: None<br><br>Mandatory |
| --- | --- |
| COULD YOU PLEASE CONFIRM THE COUNTRY WHERE YOUR VAT REGISTRATION IS LOCATED? | EU / UK/ Other |
| --- | --- |
| Address (Street Address) | Auto-populated and editable field;<br><br>Input Type: Text<br><br>Constraints: Max 100 characters;<br><br>Mandatory |
| --- | --- |
| Postcode | Auto-populated and editable field;<br><br>Input Type: Text;<br><br>Constraints: Max 20 characters;<br><br>Mandatory |
| --- | --- |
| City | Auto-populated and editable field;<br><br>Input Type: Text;<br><br>Constraints: Max 50 characters;<br><br>Mandatory |
| --- | --- |
| County/State/Region | Auto-populated and editable field;<br><br>Input Type: Text;<br><br>Constraints: Max 50 characters;<br><br>Mandatory |
| --- | --- |
| Country | Auto-populated and editable field;<br><br>Input Type: Dropdown menu with predefined options;<br><br>Constraints: Max 50 characters;<br><br>Mandatory |
| --- | --- |
| Next and Save Button | Action: Navigate to Company documents section; Constraints: All mandatory fields must be filled and valid |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Mandatory field not filled | "Please complete all required fields." |
| --- | --- |
| Invalid Company Registration Number | "Invalid company registration number. Please check your entry and try again." |
| --- | --- |
| Auto-population error | "An error occurred while retrieving your information. Please refresh the page or contact support if the problem persists." |
| --- | --- |
| Form submission with incomplete mandatory fields | "You must fill out all mandatory fields before proceeding." |
| --- | --- |
| Network or loading error during form submission | "Failed to submit your information due to a network error. Please try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Company Information | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-14307&node-type=frame&t=3bpHISmt0QWXAIva-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.1.2.2 Company documents section

- Clicking Next from the first step will move to this sections to update the company documents
- There will be an information message
  - “Ensure uploaded documents are up-to-date and licence numbers are correct, errors may delay verification
  - The following information will be captured
  - Which permit/licence do you have?
    - Environmental permit
    - Waste Exemption
    - Other
      - Other Document Description (Free text) : will appear when ‘Other’ selected, allowing the user to enter a document description
    - Upload later
      - When Upload later is checked, show notification “You can start buying and selling material now, but please note that all transactions will be pending until you upload your company documentation.”
      - And when Upload later is checked, disable Environmental permit, Waste Exemption, Other
  - Environmental permit upload
    - Display condition :
      - Show when one of the three options - Environment Permit, Waste Exemption, Other - is checked.
      - When "Other" is checked, an additional field labelled "Other Document Description" will appear, allowing the user to describe the document
    - Upload (as per previous selection)
      - Upload from device
      - Drag and drop to upload
    - Provide expiry date
  - Waste Carrier Licence
    - Yes
      - Upload (as per previous selection)
        - Upload from device
        - Drag and drop to upload
      - Provide expiry date
    - Not Applicable
  - Box clearing agent?
    - Yes
    - No
  - Next & Save button
  - Back button

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Information Message Display:<ul><li>Display an information message prominently at the beginning of the Company Documents section: "Ensure uploaded documents are up-to-date versions and licence numbers are correct, errors may delay verification (*Required Field)."</li><li>This message must be clear and easily readable to ensure users understand the importance of accuracy in their submissions.</li></ul></li><li>Form Field Auto-Population and Selections:<ul><li>Company Type: Auto-populate this field from data provided during the registration form process, ensuring that users see a consistent reflection of their earlier inputs without the ability to modify it here.</li><li>Provide options for 'Which permits/licences do you have?' including Environmental Permit, Waste Exemption, Other, and an option to 'Upload later'.<ul><li>The user can upload multiple documents (e.g. upload an Environmental Permit, then a Waste Exemption Certificate, etc)</li><li>When the user selects 'Upload later,' notify them with: 'You can start buying and selling material now, but please note that all transactions will be pending until you upload your company documentation” and disable remaining 3 fields</li><li>If any one of the three Environmental permit, Waste Exemption, Other options is selected, disable the 'Upload later' option</li></ul></li></ul></li><li>Document Upload Functionality:<ul><li>Users must have the option to upload documents directly from their device or via drag-and-drop functionality.</li><li>Ensure that the upload functionality is intuitive and confirms the successful upload of documents.</li><li>If 'Other' is selected under permit/licence type, allow users to specify details and provide a corresponding upload option.</li><li>The user can upload only the following file types:<ul><li>Image formats (.jpeg, .jpg, tiff, .png)</li><li>PDF document</li><li>Word/PPT/Spreadsheets (including csv) are not acceptable</li></ul></li><li>Max file size 25 MB</li></ul></li><li>Expiry Date Requirement:<ul><li>For all document uploads where an expiry date is applicable (e.g., Environmental Permit, Waste Carrier Licence), provide a field for users to input the expiry date.[No validation for this phase about the expiry date]</li><li>Ensure that this field accepts dates in a consistent format (DD/MM/YYYY) and includes date-picker functionality to reduce user error.</li></ul></li><li>Waste Carrier Licence Confirmation:<ul><li>Include a query: "Do you have a Waste Carrier Licence?" with options 'Yes', 'No', and 'Not Applicable'.</li><li>If 'Yes' is selected, prompt the user to upload the Waste Carrier Licence and provide the expiry date as mandatory fields.</li><li>If 'Not Applicable' or 'No' is selected, ensure these options are logged and require no further action related to the Waste Carrier Licence.</li></ul></li><li>Box Clearing Agent Query:<ul><li>Ask "Box clearing agent?" with options 'Yes' and 'No'.</li><li>Ensure this selection is captured accurately and reflects in the user's profile for compliance and operational purposes.</li></ul></li><li>Validation and Error Handling:<ul><li>Validate that all mandatory fields are filled before allowing the form submission. Mandatory fields include any document marked as required and their associated expiry dates.</li><li>Provide clear error messages for incomplete uploads, incorrect date formats, or missed mandatory fields. Example error message: "Please complete all required fields. Check that all documents are uploaded and expiry dates are correctly entered."</li></ul></li><li>Testing and Quality Assurance:<ul><li>Conduct thorough testing to confirm that all fields auto-populate correctly, document uploads work smoothly across different browsers and devices, and error handling functions as expected.</li><li>Include user acceptance testing with a group of end-users to ensure the process is intuitive and the instructions are clear.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| Company Type | Input Type: Auto-populated; Constraints: Predefined from registration; Mandatory |
| --- | --- |
| Permit/Licence Type | Input Type: Checkbox; Options: Environmental Permit, Waste Exemption, Other, Upload later; Mandatory |
| --- | --- |
| Upload (Document) | Input Type: File upload; Constraints: Valid file types specified; Optional, Mandatory if 'Other' selected<br><br>Max file size 25 MB, Max files set to 1; Mandatory |
| --- | --- |
| Provide Expiry Date | Input Type: Date; Constraints: Must be future date; Format: DD/MM/YYYY; Mandatory if document uploaded |
| --- | --- |
| Waste Carrier Licence | Input Type: Conditional; Displayed if 'Yes' selected; Mandatory if 'Yes' |
| --- | --- |
| Box Clearing Agent | Input Type: Radio button; Options: Yes, No; Mandatory |
| --- | --- |
| Upload from Device | Input Type: File upload; Constraints: Supported file formats; Mandatory if applicable document types selected |
| --- | --- |
| Drag and Drop to Upload | Input Type: File upload; Constraints: Supported file formats; Mandatory if applicable document types selected |
| --- | --- |
| Back button | Action: Back to Company Information section; Constraints: No |
| --- | --- |
| Next and Save Button | Action: Navigate to Site location section; Constraints: All mandatory fields must be filled and valid |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Mandatory field not filled | "All required fields must be completed. Please check your entries and try again." |
| --- | --- |
| Invalid document file type | "Invalid file type uploaded. Please upload a document in one of the supported formats." |
| --- | --- |
| Document upload failed | "Failed to upload a document. Please try again or contact support if the problem persists." |
| --- | --- |
| Expiry date not provided or in the past | "Please provide a valid future expiry date for the document." |
| --- | --- |
| No document selected when required | "Please upload the required document to proceed." |
| --- | --- |
| Missed Waste Carrier Licence if the “Yes” radio box is ticked within the “Do you have a waste carrier licence?” section | “Please upload your required Permit document to proceed” |
| --- | --- |
| Missed Environmental permit | “Please upload your required Environmental document to proceed” |
| --- | --- |
| Missed Waste Exemption field | “Please upload documentation for Waste Exemption” |
| --- | --- |
| Other Document Description field missed for Other licences | “Please provide additional information in “Other” text field |
| --- | --- |
| Error in auto-population of fields | "There was an error retrieving your information. Please refresh the page or try again later." |
| --- | --- |
| If user loses connection and “Save and resume later” option is clicked | Generic error message “Oops, please try again later” |
| --- | --- |
| Network or loading error during form submission | "There was a problem submitting your form due to a network error. Please try submitting again shortly." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Design link | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11136-3540&node-type=frame&t=3bpHISmt0QWXAIva-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

####

#### 6.1.2.3 Site location section

- There will be an information message
  - “Ensure all details are correct, errors may delay verification.”
- The following information will be captured
  - Location Name
  - Site - point of contact ~~(details auto-filled from the registration form)~~
    - First Name
    - Last Name
    - Position (unfilled)
  - Location Telephone
  - Address
    - Select same as previous (checkbox) or
    - Enter full field about address information:
      - Street Address
      - Postcode
      - Country/State/Region
      - City
      - Country: Dropdown menu with predefined options
  - Head office opening times
    - Weekday HH:MM
    - Saturday HH:MM
    - Sunday HH:MM
  - Head office closing times
  - Weekday HH : MM
  - Saturday HH:MM
  - Sunday HH:MM
- Site details
  - - Is there a loading ramp on this site?
            - Yes
            - No
      - Have you got a weighbridge on this site?
        - Yes
        - No
      - Which container types can you manage on this site?
        - Curtain Slider
        - Containers
        - Tipper trucks
        - Walking Floor
      - Can you load/unload material yourself on this site?
        - Yes
        - No
      - Do you have any access restrictions
        - Yes
          - Access restriction details
        - No
- Save and Resume Later link
- This is the final section of the onboarding process, it will have a button to submit the data

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Information Message Display:<ul><li>An information message stating "Ensure all details are correct, errors may delay verification (*Required Field)" should be prominently displayed at the top of the Site Location section to remind users of the importance of accurate data entry.</li></ul></li><li>Form Field Specifications:<ul><li>Location Name: Mandatory field to capture the name of the primary site</li><li>Site Point of Contact:<s>.</s> Manual entry. Position to be filled manually.</li><li>Location Telephone and Address:<ul><li>Provide fields for telephone and full address details.</li><li>Include an option to select the address as the same as previously entered with a checkbox, or allow the user to enter a new address.</li><li>Opening and Closing Time: Input fields for time in HH:MM</li></ul></li></ul></li></ul><p>format to specify head office operating hours.</p><ul><li><ul><li><ul><li>Materials Accepted: Checkboxes</li></ul></li></ul></li><li>Site-Specific Details:<ul><li>Queries regarding site facilities with binary responses (Yes/No):<ul><li>Loading Ramp: "Is there a loading ramp on this site?"</li><li>Weighbridge: "Have you got a weighbridge on this site?"</li><li>Container Management: "Which container types can you manage on this site?" Options include Curtain Slider, Containers, Tipper Trucks, Walking Floor.</li><li>Self Load/Unload: "Can you load/unload material yourself on this site?"</li><li>Access Restrictions: If 'Yes' is selected, provide a text field to describe the restrictions.</li></ul></li></ul></li><li>Validation and Mandatory Checks:<ul><li>Ensure all mandatory fields, including location name, contact details, opening and closing times, and confirmation of key site facilities, are validated for completion and accuracy before submission.</li><li>Enforce data format checks, especially for telephone numbers and operating times.</li><li>Weekday HH:MM</li><li>Saturday HH:MM</li><li>Sunday HH:MM.</li></ul></li><li>Submission and Confirmation:<ul><li>Include a "Submit" button at the end of the section which finalises the onboarding process.</li><li>Upon successful submission, confirm with the user that the onboarding is complete and provide guidance on next steps or direct them to their new user dashboard.</li></ul></li><li>Testing and Quality Assurance:<ul><li>Thoroughly test the form for usability, ensuring that auto-population is accurate and user inputs are captured correctly.</li><li>Validate the form's functionality across different devices and browsers to ensure a consistent user experience.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| Location Name | Input Type: Text; Constraints: Mandatory; No character limit specified |
| --- | --- |
| Site Point of Contact | Input Type: Auto-populated from registration; Constraints: First Name, Last Name; Mandatory |
| --- | --- |
| First Name | Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation, Script Constraints: Max 50 characters; Mandatory: Yes |
| --- | --- |
| Last Name | Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation, Script Constraints: Max 50 characters; Mandatory: Yes |
| --- | --- |
| Position | Input Type: Text; Constraints: Optional; No character limit specified; Mandatory |
| --- | --- |
| Location Telephone | Input Type: Text; Constraints: Numeric, format as per country standards; Mandatory |
| --- | --- |
| Address | Input Type: Conditional; Select same as previous or enter new; Mandatory |
| --- | --- |
| Street Address | Input Type: Text; Constraints: Mandatory if new address; No character limit specified |
| --- | --- |
| Postcode | Input Type: Text; Constraints: Mandatory if new address; No character limit specified |
| --- | --- |
| City | Input Type: Text; Constraints: Mandatory if new address; No character limit specified |
| --- | --- |
| County/State/Region | Input Type: Text; Constraints: Mandatory if new address; No character limit specified |
| --- | --- |
| Country | Input Type: Dropdown menu with predefined options; Constraints: Mandatory if new address; No character limit specified |
| --- | --- |
| Head Office Opening Time | Input Type: Time; Format: HH:MM<br><br>; Constraints: Mandatory |
| --- | --- |
| Head Office Closing Time | Input Type: Time; Format: HH:MM<br><br>; Constraints: Mandatory |
| --- | --- |
| Materials Accepted | Input Type: Checkboxes; Constraints: List of materials; Mandatory |
| --- | --- |
| Loading Ramp | Input Type: Radio Button; Options: Yes, No; Mandatory |
| --- | --- |
| Weighbridge | Input Type: Radio Button; Options: Yes, No; Mandatory |
| --- | --- |
| Container Types | Input Type: Checkbox; Options: Curtain Slider, Containers, Tipper Trucks, Walking Floor; Mandatory |
| --- | --- |
| Self Load/Unload Capability | Input Type: Radio Button; Options: Yes, No; Mandatory |
| --- | --- |
| Access Restrictions | Input Type: Conditional Text; Displayed if Yes selected; Optional |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Mandatory field not filled | "Please complete all required fields." |
| --- | --- |
| Opening/Closing Time Format Incorrect | "Please enter the opening and closing times in HH<br><br>format." |
| --- | --- |
| Access Restriction Details Missing | "Please provide details about the access restrictions." |
| --- | --- |
| Incorrect Contact Details Format | "Please check the contact details provided. Ensure all numbers are correctly formatted." |
| --- | --- |
| Failure to Upload Required Documents | "Failed to upload required documents. Please try again." |
| --- | --- |
| Site Details Not Complete | "Please complete all site-related details, including facilities and container types." |
| --- | --- |
| Submit button | Action: Submits form; Constraints: All mandatory fields must be filled and valid |
| --- | --- |
| Back button | Action: Back to Company documents section ; Constraints: No |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Site location section | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-14581&node-type=frame&t=YxxV4YeDU1a6kKN0-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.1.2.4 Submit form - confirmation page (stage 2)

- On submitting the form (“create account”) the user will see
  - Progress Tracker
    - Three-step tracker, as per the present website
- There will be a message “Account completed”
  - There will be a message displayed on the page
    - “Thank you for completing your account. You can now begin bidding and selling. Meanwhile, our admin team is in the process of verifying your account details. We will send you an email once the account is verified”
      - - Go to the platform - redirect to the user’s homepage
  - The WasteTrade Admin will receive an email notification and the “file” will be made available to the Admin for approval
- There will be three buttons
  - Buy material
  - Sell material
  - List wanted material

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Progress Tracker Display:<ul><li>Upon form submission, a three-step progress tracker should be displayed, accurately reflecting the completion of the final stage as described on the current website design.</li><li>The tracker must be consistently styled across all platform interfaces to maintain a unified user experience.</li></ul></li><li>Confirmation Messages:<ul><li>Immediately upon submission, display a primary confirmation message: "Account completed".</li><li>Additionally, show a detailed message on the page stating: “Thank you for completing your account. You can now begin bidding and selling. Meanwhile, our admin team is in the process of verifying your account details. We will send you an email once the account is verified.”</li></ul></li><li>Navigation Options:<ul><li>Include a "Go to the platform" button that redirects users to their homepage, facilitating immediate engagement with the platform.</li></ul></li><li>Administrative Notification:<ul><li>Ensure that upon submission, an automatic email notification is sent to the WasteTrade Admin along with all necessary documents ("file") for approval.</li><li>This notification must include all pertinent details necessary for a quick review and verification by the admin team.</li></ul></li><li>User Interaction Buttons:<ul><li>Clearly display three buttons on the confirmation page:</li><li>"Buy material" — redirects to the marketplace section for purchasing.</li><li>"Sell material" — leads to the page where users can list materials for sale.</li><li>"List wanted material" — navigates to the section where users can post requests for specific materials they are looking to buy.</li></ul></li><li>Error Handling and Feedback:<ul><li>Implement robust error handling for any failures in form submission or during redirection.</li><li>Provide clear, informative feedback messages for any errors encountered, ensuring users understand what action to take next.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the confirmation page across various devices and browsers to ensure compatibility and responsiveness.</li><li>Validate the email notification process to confirm reliability and correctness of the information sent to the admin team.</li></ul></li><li>Integration and Continuity:<ul><li>Ensure that the confirmation page and its functionalities integrate smoothly with the previously developed sections of the onboarding process.</li><li>Maintain logical continuity with all prior user interactions and data entries to ensure that the entire onboarding flow is coherent and user-friendly.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to redirect after form submission | "Failed to complete your request. Please try again or contact support if the issue persists." |
| --- | --- |
| Email notification failure | "There was an issue sending your confirmation. Please ensure your email address is correct and contact support for further assistance." |
| --- | --- |
| Button/link not functioning | "This feature is currently unavailable. Please try again later or contact support." |
| --- | --- |
| System error during form submission | "A system error occurred during submission. Please refresh the page and submit again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Submit form - stage 2 | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11200-2934&node-type=symbol&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.1.2.5 Submit form - confirmation page with the option to upload company document later (stage 2)

- On submitting the form (“create account”) the user will see
  - Progress Tracker
    - Three-step tracker, as per the present website
- There will be a message “Account completed”
  - There will be a message displayed on the page
    - “You can start buying and selling material now, but please note that all transactions will be pending until you upload your company documentation”
      - There will be two options
        - Upload your company documentation - redirect to the company document screen
        - Go to the marketplace - redirect to the user’s homepage

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Progress Tracker Display:<ul><li>Upon form submission, a three-step progress tracker should be displayed, accurately reflecting the completion of the final stage as described on the current website design.</li><li>The tracker must be consistently styled across all platform interfaces to maintain a unified user experience.</li></ul></li><li>Confirmation Messages:<ul><li>Immediately upon submission, display a primary confirmation message: "Account completed".</li><li>Additionally, show a detailed message on the page stating: “You can start buying and selling material now, but please note that all transactions will be pending until you upload your company documentation.”</li></ul></li><li>Navigation Options:<ul><li>Provide a clear and accessible option for "Upload your company documentation" that redirects users to potentially incomplete sections of the onboarding for further completion.</li><li>Include a "Go to the marketplace" button that redirects users to their homepage</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the confirmation page across various devices and browsers to ensure compatibility and responsiveness.</li><li>Validate the email notification process to confirm reliability and correctness of the information sent to the admin team.</li></ul></li><li>Integration and Continuity:<ul><li>Ensure that the confirmation page and its functionalities integrate smoothly with the previously developed sections of the onboarding process.</li><li>Maintain logical continuity with all prior user interactions and data entries to ensure that the entire onboarding flow is coherent and user-friendly.</li></ul></li><li><strong>Note : No Review functionality in phase 1</strong></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| Upload your company documentation | Type: Link; Action: redirect to the company document screen; Mandatory; Constraints: No |
| --- | --- |
| Go to the marketplace | Type: Button; Action: redirect to the user’s homepage |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to redirect after form submission | "Failed to complete your request. Please try again or contact support if the issue persists." |
| --- | --- |
| Button/link not functioning | "This feature is currently unavailable. Please try again later or contact support." |
| --- | --- |
| System error during form submission | "A system error occurred during submission. Please refresh the page and submit again." |
| --- | --- |

<table><thead><tr><th><p><strong>Design Name</strong></p></th><th><p><strong>Link</strong></p></th></tr><tr><th><h4><a id="_p1ndo7tqqtha"></a></h4></th><th><p><a href="https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11235-28625&amp;node-type=frame&amp;t=9tXnOiY4OzOwgBzU-11">https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11235-28625&amp;node-type=frame&amp;t=9tXnOiY4OzOwgBzU-11</a></p></th></tr></thead></table>

| **Client Approved** | YES |
| --- | --- |

## 6.2 Authentication (Shared)

### 6.2.1 Authentication

The authentication flow is shared across all three platforms: Trading Platform, Haulage Platform, and Admin Portal,

#### 6.2.1.1 Login

- The user will be to log in with their
  - Email address
  - Password
- The password field will be encrypted
  - Entered characters will be displayed as bullet points
- Validation of fields will be upon clicking the ‘Login” button
- If the validation fails there will be inline error messages
  - The required field is empty
    - “This is a required field”
  - Invalid credentials
    - “Invalid email address and/or password”
- If the validations pass, the user will be granted access to the platform homepage

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Login Interface:<ul><li>Provide a login form on the platform that includes fields for the Email address and Password.</li><li>Both fields should be clearly labelled and mandatory for submission.</li></ul></li><li>Password Security:<ul><li>Ensure that characters entered into the password field are masked and displayed as bullet points to protect user privacy and security.</li></ul></li><li>Field Validation:<ul><li>Implement immediate field validation that triggers upon clicking the ‘Login’ button.</li><li>Validation checks should include:<ul><li>Ensuring no fields are left empty.</li><li>Verifying that the email address format is correct (e.g., contains an "@" and a domain[Some domain provided by common email validation]).</li><li>Checking the password against stored passwords for authentication.</li></ul></li></ul></li><li>Error Handling:<ul><li>If validation fails, display inline error messages appropriate to the specific error:<ul><li>If a required field is empty, display: “This is a required field.”</li><li>For invalid login credentials, display: “Invalid email address and/or password.”</li></ul></li><li>Error messages should be clearly visible and provide direct guidance on how to resolve the issue.</li></ul></li><li>Successful Login:<ul><li>Upon successful validation, the user should be granted access to the platform homepage based on their roles .</li><li>The transition to the homepage should be seamless, and the user should be oriented with their dashboard[admin] or main interface[user].</li></ul></li><li>User Experience:<ul><li>The login process should be streamlined and user-friendly, with a focus on quick and efficient access to the platform.</li><li>Consider providing a ‘Lost Your Password’ link and an option for keeping the user logged in for ease of use.</li><li>Click on “Create an account" -&gt; navigate to Register screen</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| Email Address | Input Type: Text; Constraints: Valid email format; Mandatory |
| --- | --- |
| Password | InputType:Text ; Constraints:Masked and displayed as bullet points; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Required field is empty | "This is a required field." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11004-8989&node-type=section&t=YxxV4YeDU1a6kKN0-0><br><br><https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11187-6215&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.2.1.2 Manual logout

- The user will log out manually using the logout button
- The user will be redirected to the login page

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Logout Functionality:<ul><li>Provide a clearly visible and accessible logout button on all pages where the user is logged in.</li><li>The logout button should be intuitively located, consistent with common user interface practices, such as in the header or user profile dropdown menu.</li></ul></li><li>Action on Click:<ul><li>Clicking the logout button, displays a screen for logout confirmation. After confirmation, the system must immediately log the user out of the system.</li><li>Ensure that the session is completely terminated to prevent unauthorised access, clearing all user data from the browser session.</li></ul></li><li>Redirection After Logout:<ul><li>After logging out, the user must be redirected to the login page.</li><li>This redirection should be immediate, with no unnecessary delays or stops at intermediate pages.</li></ul></li><li>Security and Compliance:<ul><li>Confirm that the logout process complies with security best practices, including the secure handling of cookies and session tokens.</li><li>Ensure that after logout, no residual data remains that could allow another user to re-access the account without authenticating.</li></ul></li><li>User Feedback:<ul><li>Optionally, display a confirmation message or notification that the user has been successfully logged out, enhancing user reassurance and clarity.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the logout functionality across multiple devices and browsers to ensure compatibility and reliability.</li><li>Test the security aspects by attempting to use the back button after logout to access user-specific pages, ensuring there is no unauthorised access.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| Logout Button | Input Type: Button; Action: Terminates user session and redirects to login page; Mandatory |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| Logout failure | "Failed to log out. Please try again or contact customer support if the problem persists." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11004-14880&node-type=frame&t=n4srVegcgW2Akf4O-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.2.1.3 Automatic logout

- ~~The user will be automatically logged out upon closing the browser or the tab~~
- ~~The user will be automatically logged out if they log in on another device~~
  - ~~There will be one concurrent session per user~~
- ~~The user will be automatically logged out if the app is open but has been inactive for more than two hours~~
  - ~~‘Activity’ will be defined as making a selection to edit a field or pressing a button to change the page~~
  - ~~‘Activity’ will not include scrolling on a single page~~
  - ~~Two minutes before the timeout, there will be a pop-up:~~
    - ~~“Would you like to remain logged in?”~~
      - ~~Yes~~
        - ~~The timer will reset~~
      - ~~No~~
        - ~~The user will be immediately logged out and redirected to the login page~~
      - ~~No answer in 120 seconds~~
        - ~~The user will be logged out and redirected to the login page~~
- ~~Upon logout, the user will be redirected to the login page  
    ~~

#### 6.2.1.4 Set password

- Upon clicking a valid token, the user will be redirected to the "Set Password" page
- The token will be from
  - Forgotten password email
  - New user email
- The user will enter
  - New Password
  - Confirm New Password
- Password must meet minimum password requirements:
  - A minimum of 6 characters long
  - Contain at least one uppercase letter
  - Contain at least one lowercase letter
  - Contain at least one number
- Validation of fields will be by clicking ‘Save’
  - If the validation fails, there will be inline error messages
    - The required field is empty
      - “This is a required field”
    - Passwords do not match
      - “Passwords do not match”
    - Password does not need the minimum criteria
      - “Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter and one number”
  - If the validation passes, the user will be directed to the Home Page
- If the device can suggest passwords, these should be suggested to the user (e.g. Apple Strong Password)
- Passwords must be compatible with password managers (e.g. Keychain)
- Successfully setting the password will take the user to the Home Page

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Access via Token:<ul><li>Ensure the user is redirected to the "Set Password" page upon clicking a valid token received either through a 'Forgotten password email' or a 'New user email'.</li><li>The validity of the token must be checked to prevent unauthorised access. The token should expire after a single use or within a predefined time (6 hours) limit.</li></ul></li><li>Password Creation Requirements:<ul><li>Users must enter a new password and confirm the new password in two separate fields.</li><li>The new password must adhere to the following criteria:<ul><li>At least 6 characters long.</li><li>Contain at least one uppercase letter.</li><li>Contain at least one lowercase letter.</li><li>Contain at least one number.</li></ul></li></ul></li><li>Field Validation and Error Handling:<ul><li>All the password fields must be masked as bullet points.</li><li>Validate the password fields when the user clicks the ‘Save’ button.</li><li>Display inline error messages for:<ul><li>Empty fields: “This is a required field.”</li><li>Non-matching passwords: “Passwords do not match.”</li><li>Passwords that do not meet the specified criteria: “Passwords must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, and one number.”</li></ul></li></ul></li><li>Successful Password Set and Redirection:<ul><li>Upon successful validation and setting of the password, the user should be directed to the Home Page of the platform.</li></ul></li><li>Security Measures:<ul><li>All password transmissions must be securely encrypted to protect user data from interception.</li></ul></li><li>Testing and Quality Assurance:<ul><li>Thoroughly test the password setting functionality to ensure that all conditions are met and that the user experience is consistent across different devices and browsers.</li><li>Test the integration of password suggestions and compatibility with password managers to confirm functionality.</li></ul></li><li>User Experience and Feedback:<ul><li>Ensure the user interface on the "Set Password" page is clear, user-friendly, and informative.</li><li>Provide a seamless transition to the Home Page upon successful password reset to confirm to the user that the process is complete.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| New Password | Input Type: Password; Constraints: Minimum 6 characters, must include uppercase, lowercase, and number; Mandatory |
| --- | --- |
| Confirm New Password | Input Type: Password; Constraints: Must match 'New Password'; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Required field is empty | "This is a required field." |
| --- | --- |
| Passwords do not match | "Passwords do not match." |
| --- | --- |
| Password does not meet criteria | "Passwords must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, and one number." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Set password | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11187-6296&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.2.1.5 Forgotten Password

- The user will click on ‘Forgotten password’ on the log-in page
- They will be directed to the Forgotten Password page
- The User will enter their email address
- All fields will be tagged and compatible with the browser's autocomplete
- Cooldown timer on clicking forgotten password
  - After forgotten password is clicked 5 times, a cooldown should be applied
- Cooldown timer for password attempts
- Press “Submit”
- Validation of fields will be upon clicking the ‘Submit” button
  - If the validation fails there will be inline error messages
    - The required field is null
      - “This is a required field”
  - If the validation passes, there will be a message on the screen:
    - “Please check your email with instructions on how to reset your password.”
    - The user will be able to close the message and return to the login page
- If the email address is valid, a verification token will be sent
  - The link will be valid for 6h
  - The expiry time will be set in the database
  - There will be no front end to change the expiry time.
- If the email address is invalid, a verification token will not be sent
- If the email address is not on the system, a verification token will not be sent
- Upon clicking a valid email token, the app will open and the user will be directed to the password reset page
- The current password will be active until a new password is successfully set

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Access to Forgotten Password Page:<ul><li>Ensure that users can easily locate and click on the ‘Forgotten password’ link on the login page.</li><li>Upon clicking, users should be redirected promptly to the Forgotten Password page.</li></ul></li><li>Email Address Entry:<ul><li>Provide a field for users to enter their email address.</li><li>This field should be clearly labelled and must include browser autocomplete functionality to enhance user experience.</li></ul></li><li>Form Submission:<ul><li>Include a ‘Submit’ button that triggers validation of the entered email address.</li><li>Ensure that the email field validation checks for format correctness and that the field is not left empty.</li><li>If the users input more than 5 requests for the same email within 1 hour , show the error message and then do not allow a request for that particular email until the next 24 hours.</li></ul></li><li>Error Handling:<ul><li>If the email field is empty upon submission, display an inline error message: “This is a required field.”</li><li>If the email format is incorrect, provide a corresponding error message to guide the user.</li></ul></li><li>Feedback upon Submission:<ul><li>If the email address is valid and exists in the system, send a password reset email containing a verification token with a link that expires in 6 hours. The expiry time should be logged in the database.</li><li>Display a message on the Forgotten Password page: “Please check your email with instructions on how to reset your password.”</li><li>If the email address is not recognised or invalid, do not send a verification token but still display the same message to maintain security and prevent information disclosure.</li></ul></li><li>Token and Password Reset:<ul><li>Ensure the password reset link provided in the email opens the application and directs the user to the password reset page without errors.</li><li>The current password should remain active until the user successfully resets their password, ensuring account security during the transition.</li></ul></li><li>Testing and Validation:<ul><li>Test the entire forgotten password flow on various devices and browsers to ensure functionality and user-friendliness.</li><li>Validate the security measures, particularly the effectiveness of the email validation and the robustness of the token system.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| Email Address | Input Type: Text; Constraints: Must be a valid email format; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Attempt to progress with incomplete mandatory fields | "Please complete all required fields before moving to the next section." |
| --- | --- |
| Invalid email format | "Please enter a valid email address." |
| --- | --- |
| Email not found | "If an account with this email exists, we will send instructions to reset your password." |
| --- | --- |
| Cooldown timer warning for forgotten password | “Please wait 2 minutes before resending forgotten password link” |
| --- | --- |
| Cooldown timer warning for repeated password attempts | “Multiple unsuccessful attempts, please reset password or try again in 2 minutes” |
| --- | --- |
| Passwords do not match | "Passwords do not match." |
| --- | --- |
| Password does not meet criteria | "Passwords must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, and one number." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Forgotten Password | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11187-6305&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.2.1.6 Role-based access

- The following user types will have access to the following platforms
  - Super Admin
    - Admin Platform, Trading Platform, Haulage Platform
  - Admin
    - Admin Platform
    - Trading Platform and/or Haulage Platform (dependent on permissions set by the Super Admin)
  - User
    - Trading Platform or Haulage platform (dependent on selection during registration)

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Role Definition and Access Rights:<ul><li>Clearly define the access rights for each user type:<ul><li>Super Admin: Access to Admin Platform, Trading Platform, and Haulage Platform.</li><li>Admin: Access to the Admin Platform and either the Trading Platform or Haulage Platform, as determined by permissions set by the Super Admin.</li><li>Platform, depending on the selection made during registration.</li><li>User: Access to either the Trading Platform or Haulage Platform, depending on the selection made during registration.</li></ul></li></ul></li><li>User Authentication and Authorisation:<ul><li>Enforce a robust authentication mechanism that verifies user credentials before granting access.</li><li>Implement role-based authorisation checks at each entry point to the platforms to ensure users can only access platforms and functionalities specific to their roles.</li></ul></li><li>Security and Compliance:<ul><li>All access control mechanisms must comply with security best practices, including the principle of least privilege.</li></ul></li><li>Testing and Validation:<ul><li>Validate that permission changes by Super Admins are applied in real-time and accurately reflect access rights.</li></ul></li><li>Integration and Usability:<ul><li>Ensure that the role-based access control integrates seamlessly with existing user registration and management systems.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Unauthorised access attempt | "You do not have access to this platform." |
| --- | --- |
| Failed to load platform based on role | "There was a problem loading your platform. Please contact support." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

##

##

## 6.3 Registration (Trading and Haulage)

This section describes the registration functionality that will be used by the traders and hauliers.

### 6.3.1 Layout

#### 6.3.1.1 Registration and onboarding forms

- The forms will have a logo
  - The logo will have a hotspot clicking on the logo will take the user to the WasteTrade website
- There will be a button to allow the user to log in (existing user)
- There will be a language selector
  - The default language will be English
- The forms will be broken down into sections
  - The user will be able to navigate through the sections using buttons
- The form will have a T&Cs and Privacy Policy
  - There will be a checkbox
- There will be a button to “create account”

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Branding and Navigation:<ul><li>The form must feature the WasteTrade logo prominently at the top.</li><li>The logo should function as a hyperlink (hotspot) that redirects users to the WasteTrade home page when clicked, ensuring easy navigation and brand consistency.</li></ul></li><li>Login Accessibility:<ul><li>Include a clearly visible button for existing users to log in. This button should redirect users to the login page efficiently.</li><li>Position the login button in a standard location on the form, typically in the upper corner, to align with common UX practices.</li></ul></li><li>Language Selection:<ul><li>Provide a language selector dropdown on the form. [<strong>TBD the list of language for phase 1</strong>]</li></ul></li><li>Set English as the default language, but ensure the selector is easily accessible and can switch the form's language dynamically without needing to reload the page.</li><li>Form Structure and Navigation:<ul><li>Break down the registration and onboarding forms into logical sections that guide the user through the process.</li><li>Include navigation buttons that allow users to move forward or backward between sections without losing previously entered information.</li></ul></li><li>Terms and Conditions and Privacy Policy:<ul><li>Incorporate a link to the Terms and Conditions and the Privacy Policy near the end of the form.</li><li>Include a mandatory checkbox that users must tick to indicate agreement with these documents before they can create an account.</li></ul></li><li>Account Creation:<ul><li>Provide a "Create Account" button at the bottom of the form. This button should be enabled only when all mandatory fields are completed and the Terms and Conditions box is checked.</li><li>Ensure the button triggers a validation process to check data completeness and accuracy before submission.</li></ul></li><li>Security and Compliance:<ul><li>Comply with data protection regulations such as GDPR by securing personal data and providing clear information on how user data will be used.</li></ul></li><li>User Feedback and Error Handling:<ul><li>Implement clear and informative error messages that appear if the user attempts to submit the form with incomplete or incorrect information.</li><li>Provide immediate feedback when the Terms and Conditions box is not checked, or mandatory fields are left empty.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing across various devices and browsers to ensure the form is responsive and accessible.</li><li>Test the functionality of the language selector to ensure all form elements render correctly in selected languages.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Attempt to progress with incomplete mandatory fields | "Please complete all required fields before moving to the next section." |
| --- | --- |
| Terms and Conditions not accepted | "You must agree to the Terms & Conditions to continue." |
| --- | --- |
| Form submission error | "There was a problem submitting your form. Please try again." |
| --- | --- |
| Invalid email format (if applicable) | "Please enter a valid email address." |
| --- | --- |
| Navigation error to the homepage | "Failed to redirect to the homepage. Please try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | TBU |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.3.1.2 Form actions

- The user will be able to navigate through the form
- The first section will have the following buttons
  - Next - to progress to the next section
  - Save and resume later
- The last section of the form will have the following buttons
  - Previous
  - Submit
  - Save and resume later
- The middle sections will have the following buttons
  - Previous
  - Next
  - Save and resume later

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Navigation Buttons:<ul><li>First Section:<ul><li>Include a 'Next' button to allow users to progress to the next section of the form.</li><li>Provide a 'Save and resume later' button to enable users to save their current progress and return to complete the form at a later time.</li></ul></li><li>Middle Sections:<ul><li>Equip each middle section with 'Previous' and 'Next' buttons to navigate back and forth between form sections.</li><li>Each middle section should also have a 'Save and resume later' button for pausing and resuming the form completion process.</li></ul></li><li>Last Section:<ul><li>Include 'Previous' to navigate back to the previous form section.</li><li>Feature a 'Complete account' button for final submission of the form.</li><li>Maintain the 'Save and resume later' button for final adjustments before final submission.</li></ul></li></ul></li><li>Button Functionality:<ul><li>Ensure all navigation buttons ('Next', 'Previous') update the form progress accurately without losing any previously entered data.</li><li>'Save and resume later' should securely save the current state of the form and provide the user with a method to resume, such as a unique link sent via email.</li></ul></li><li>User Feedback and Instructions:<ul><li>Display confirmation messages upon saving the form, clarifying that the data has been successfully saved and explaining how to resume.</li></ul></li><li>Error Handling:<ul><li>Implement validation checks before moving between form sections to ensure all required fields in the current section are completed.</li><li>Display inline error messages if the user attempts to proceed with incomplete necessary fields.</li><li>Offer clear error messages if the form fails to save or if there are issues with form progression.</li></ul></li><li>Security and Data Integrity:<ul><li>Ensure that data entered in the form is securely transmitted and stored, especially when using the 'Save and resume later' feature.</li><li>Use secure methods for users to retrieve and resume their saved forms, such as authenticated sessions or verification emails.</li></ul></li><li>Testing and Compliance:<ul><li>Thoroughly test the form navigation, saving, and resuming functionality across multiple devices and web browsers to ensure robust performance.</li><li>Ensure compliance with relevant data protection regulations when saving and handling user data, particularly for saved forms.</li></ul></li><li>Integration with User Accounts:<ul><li>Integration of the form's save and resume functionality with user accounts, allowing users to easily access their saved forms after logging in.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Attempt to progress with incomplete mandatory fields | "Please complete all required fields before moving to the next section." |
| --- | --- |
| Save attempt with incomplete fields | "Please complete mandatory fields before saving." |
| --- | --- |
| Error on form saving | "Failed to save your progress. Please try again." |
| --- | --- |
| Navigation error between sections | "Unable to navigate to the requested section. Please try again." |
| --- | --- |
| General system error during form actions | "A system error occurred. Please refresh the page and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11199-4745&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.3.1.3 Autosave

- ~~The information provided by the client through any of the forms will be saved automatically every 5 minutes~~
- ~~The information provided by the client through any of the forms will be saved automatically when the move between sections~~

#### 6.3.1.4 Save and resume registration

- ~~The users will be able to save their progress at any stage~~
- ~~A link will be sent to the user’s email address~~
- ~~Using the link the user will be able to continue the onboarding form~~
- ~~The link will stay live for 31 days~~
- ~~Email copy to be provided by the client~~

#### 6.3.1.5 Form completion display

- There will be a live progress tracker
- The tracker will scroll down with the form
- The tracker will show the number of sections completed/total number of section

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Implementation of the Progress Tracker:<ul><li>A live progress tracker must be displayed on the form, providing real-time feedback on the user’s progress through the form.</li><li>The tracker should clearly indicate the number of sections completed out of the total number of sections.</li></ul></li><li>Dynamic Interaction and Visibility:<ul><li>The progress tracker must be designed to scroll down with the user as they navigate through the form, ensuring that it remains visible regardless of the user’s position on the page.</li><li>The design of the tracker should be minimally intrusive yet easily accessible, allowing users to reference their progress without disrupting their form completion experience.</li></ul></li><li>Design and Usability:<ul><li>The tracker should be visually distinct and well-integrated into the overall design of the form page, using brand colours and fonts.</li><li>It should clearly segment or delineate each section of the form that has been completed, is in progress, or has yet to be started.</li></ul></li><li>Responsive and Adaptive Design:<ul><li>Ensure the progress tracker is fully responsive and functions correctly across different devices and screen sizes, providing a consistent experience for all users.</li><li>The tracker’s responsiveness must not affect the form’s functionality or visibility.</li></ul></li><li>Error Handling and User Feedback:<ul><li>In cases where the form fails to load or there is an error in tracking progress, provide clear, user-friendly error messages.</li><li>Examples of error messages might include: "There seems to be a problem displaying your progress. Please refresh the page or contact support if the problem persists."</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to validate the accuracy of the progress display, ensuring it updates correctly as the user completes each section of the form.</li><li>Test the scroll functionality of the progress tracker to ensure that it remains visible and functional as the user navigates through the form.</li></ul></li><li>Security and Performance:<ul><li>Ensure that the implementation of the progress tracker does not negatively impact the form’s performance or load times.</li><li>Confirm that no sensitive data is exposed through the tracker’s interface or data handling.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| Progress Tracker | Input Type: UI Element; Constraints: Visible at all times, scrolls with the page; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Tracker fails to display | "Unable to display progress. Please refresh the page or contact support if the problem persists." |
| --- | --- |
| Tracker fails to update | "Progress update error. Please refresh the page to ensure your progress is correctly displayed." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11200-2934&node-type=symbol&t=jEqvOAk0rkdGLk2a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

## 6.4 Trading Platform

This section describes the functionality exclusive to the users of the trading platform.

### 6.4.1 Trading homepage (buy)

_Screenshot: Trading Homepage layout_

#### 6.4.1.1 Trading Homepage Layout

- This page will show a user all of the sales listings on the system
- The page will have the following elements
  - [Header](#_vqslxpp5r867) - Containing the following options from left to right
    - Burger menu
    - WasteTrade logo
    - Buy image linking to the buy material
    - Sell image linking to the Sell Material page
    - Wanted image linking to the Wanted page
  - [Footer](#_54vec8n8ho52) - Containing the following options
    - WasteTrade logo
    - Social Media links (Instagram, Twitter/X, Facebook and Linkedin)
    - Award images
    - Menu with below links for
      - Home
      - Marketplace
      - Materials
    - Company containing links below for
      - About
      - Vacancies
      - Privacy Policy
      - Terms & Conditions
    - Help containing links below for
      - Resources
      - Vacancies
      - Contact form
  - [Filter](#_nzsy29ljfkdq)s should include the following:
    - Search bar reading: “What are you looking for?”
    - “Location dropdown”
    - “Material Type” dropdown
    - “Material Group” dropdown
    - “Materials” dropdown
    - “Packed” dropdown
  - [Product cards](#_ipl5y36vjbnt)
    - Clicking on the card redirects the user to the listing page (product page)
  - [Account Status](#_yxkzqcazfick)

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Homepage Layout and Content:<ul><li>Ensure the trading homepage displays all active sales listings available on the system.</li><li>Include a clear and functional header and footer that align with the overall website design.</li></ul></li><li>Key Elements on the Homepage:<ul><li>Header: Should contain navigation links, a site logo, and access to user account settings.</li><li>Footer: Should include links to privacy policy, terms of service, contact information, and other relevant resources.</li><li>Filters: Implement filters to help users refine the listings displayed by criteria such as location, price, material type, Material Group, Materials, Packed. Radio button sections showing Packed: All, Indoors, and Outdoors. Sold Listings showing: Hide Sold Listing. “Clear all filters” option which removes all filters when the text is clicked</li><li>Product Cards: Each listing should be presented in a product card format, which includes essential information such as the product name, image, and brief description. Each card must be clickable and redirect the user to the detailed listing page. 2 cards per each line . 1 card per line when responsive to mobile view</li><li>Account Status: Display the user’s account status prominently on the page, indicating if the user needs to take any actions like verification. (this only shows if the account needs more verification ).</li></ul></li><li>Navigation and Usability:<ul><li>Clicking on a product card should redirect the user to that specific product’s detailed page without any issues.</li><li>Ensure the navigation between pages is seamless and intuitive.</li></ul></li><li>Performance and Efficiency:<ul><li>Optimise the homepage for speed and responsiveness. Ensure that filters and product cards load efficiently without significant delays.</li><li>Implement lazy loading for product images to improve page load times.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the homepage functionality across multiple browsers and devices to ensure consistent performance and appearance.</li><li>Validate filter functionality and the correct redirection from product cards to ensure a smooth user experience.</li></ul></li><li>Error Handling and Feedback:<ul><li>Provide clear and informative error messages if the homepage fails to load or if there are issues with filter functionalities.</li><li>Ensure any errors are logged appropriately for further analysis and quick resolution.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| “What are you looking for? | Max character size of 50, letters and numbers only |
| --- | --- |
| Location | Type: Dropdowns; Placeholder: “All countries…” ; Optional |
| --- | --- |
| Material Type | Type: Dropdowns; Placeholder: “All material types…” ; Optional |
| --- | --- |
| Material Group | Type: Dropdowns; Placeholder: “All material groups…” ; Optional |
| --- | --- |
| Materials | Type: Dropdowns; Placeholder: “All materials…” ; Optional |
| --- | --- |
| Packed | Type: Dropdowns; Placeholder: “All packing options…” ; Optional |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Homepage fails to load | "Failed to load the homepage. Please refresh the page or try again later." |
| --- | --- |
| Filter functionality error | "Unable to apply filters at this time. Please check your connection and try again." |
| --- | --- |
| Max character size exceeded for “What are you looking for?” | “Maximum character size reached, please enter 50 characters or below” |
| --- | --- |
| Product card redirection failure | "Error accessing listing details. Please try again or contact support if the issue persists." |
| --- | --- |
| Account status load failure | "Unable to retrieve account status. Please ensure you are logged in and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Insert once pagination is updated in design | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11200-4885&node-type=frame&t=jEqvOAk0rkdGLk2a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.1.2 Bidding on a Listing

- The user will be able to click on any [Product card](#_ipl5y36vjbnt) to open the [listing page](#_ly73gd56x0q1)
- The page will have a distinct CTA: Bid Now
- Clicking on the button will allow the user to make a bid on the listing
- The user will be required to provide the following information
  - Warehouse location
    - Drop-down select
      - Location provided during onboarding
  - Offer valid until
  - Earliest delivery date
  - Latest delivery date
  - Number of loads bid on (min: 1; max: cannot exceed number of total loads listed)
  - Currency
  - Price per Metric Tonne
    - The buyer’s bid includes a “best guess” for the haulage
      - Example (off-system): If the buyer bids at £1000 per tonne, they may break the amount would be broken down as follows:
        - Material: £850 per tonne
        - Haulage: £150 per tonne
  - Incoterms
    - Dropdown select
    - There will be an information button to explain the various “incoterms options
      - The content will be defined in the AC (client-led)
- On submitting the bid, it is submitted for review to the WasteTrade Admin team
  - The user will be able to track their bid through the [My Offers section](#_x1hwb0jjb9yh)

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Listing Page Access and Layout:<ul><li>Ensure that clicking on any product card from the trading homepage successfully redirects the user to the corresponding listing page.</li><li>The listing page must prominently display a "Bid Now" call-to-action (CTA) button.</li></ul></li><li>Bid Submission Process:<ul><li>Implement a form that is accessible via the "Bid Now" button, where the user can enter their bid details.</li><li>The form should require the user to provide the following information:<ul><li>Warehouse location: Dropdown select, listing locations provided during onboarding.</li><li>Offer valid until: Date input.</li><li>Earliest delivery date: Date input.</li><li>Latest delivery date: Date input.</li><li>Number of loads bid on: Numeric input (minimum 1; maximum cannot exceed the total number of loads listed).</li><li>Currency: Dropdown or text input.</li><li>Price per Metric Tonne: Numeric input.</li><li>Incoterms: Dropdown select with an information button to explain various options.<ul><li>If FAS, FOB, CFR or CIF is selected for ‘Incoterms’, display text field for ‘Shipping Port’.</li></ul></li></ul></li></ul></li><li>Validation and Error Handling:<ul><li>Ensure all form inputs are validated for correct format and logical consistency (e.g., delivery dates make sense in context, bid amounts are within expected ranges).</li><li>Provide clear, informative error messages if the user fails to fill out the form correctly or if there is an issue with submission.</li></ul></li><li>Submission and Admin Review:<ul><li>Once a bid is submitted, it should be sent for review to the WasteTrade Admin team.</li><li>The system should provide immediate feedback to the user that their bid has been received and is under review.</li></ul></li><li>Tracking and User Feedback:<ul><li>Users should be able to track the status of their bid through the "My Offers" section of the platform.</li><li>Updates about the bid status should be timely and reflect real-time changes as they are processed by the admin team.</li></ul></li><li>Security and Compliance:<ul><li>Ensure that all bid data is securely handled and that user privacy is maintained throughout the process.</li><li>Comply with all relevant trade regulations and data protection laws in handling and displaying bid information.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure the bidding process works seamlessly across all supported devices and browsers.</li><li>Validate that all user inputs are captured accurately and that the system correctly handles and stores bid submissions.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| Warehouse Location | Input Type: Dropdown; Selection from predefined locations; Mandatory |
| --- | --- |
| Offer Valid Until | Input Type: Date; Format: dd/mm/yyyy; Mandatory, cannot enter a date before today |
| --- | --- |
| Earliest Delivery Date | Input Type: Date; Format: dd/mm/yyyy; Mandatory, cannot enter a date before today |
| --- | --- |
| Latest Delivery Date | Input Type: Date; Format: dd/mm/yyyy; Mandatory, cannot enter a date before today, cannot enter a date before ‘earliest delivery date’ |
| --- | --- |
| Number of Loads Bid On | Input Type: Numeric; Range: 1 to max number of loads available; Mandatory |
| --- | --- |
| Currency | Input Type: Dropdown or Text; Pre-defined or free text; Mandatory **\[ TB Confirm by the client the list of currency and value to exchange rate\]** |
| --- | --- |
| Price per Metric Tonne | Input Type: Numeric; Constraints: Valid monetary amount; Mandatory |
| --- | --- |
| Incoterms | Input Type: Dropdown; EXW, FCA, FAS, FOB, CFR, CIF, CPT, CIP, DAP, DPU, DDP. Mandatory |
| --- | --- |
| Shipping Port | If FAS, FOB, CFR or CIF is selected for ‘Incoterms’, display text field for ‘Shipping Port’. Input Type: Text; Constraints: Max 100 characters; Mandatory |
| --- | --- |
| Information Button (Incoterms) | Input Type: Button; Action: Display information modal; Optional |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Form submission with incomplete data | "Please complete all required fields before submitting." |
| --- | --- |
| Invalid date range | "Please enter a valid date range for delivery." |
| --- | --- |
| Exceeding load limit | "Number of loads cannot exceed the available quantity." |
| --- | --- |
| Currency format error | "Please enter a valid currency amount." |
| --- | --- |
| System error during bid submission | "Failed to submit your bid due to a system error. Please try again later." |
| --- | --- |
| Incoterms information load failure | "Failed to load Incoterms information. Please try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Bidding on a listing | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-10891&node-type=frame&t=jEqvOAk0rkdGLk2a-11><br><br>Bidding form: <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11200-6082&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### ~~6.4.1.2.2. Prompt User to Upload Docs~~

- ~~If user hasn't uploaded their documents and tries to place a bid a popup will appear requiring document upload.~~
- ~~The modal will contain:~~
  - ~~Which of the following do you have?~~
    - ~~Radio buttons~~
      - ~~Environmental permit~~
      - ~~Waste exemptions~~
      - ~~Other~~
  - ~~Not sure what to upload?~~
    - ~~“Get a better understanding of what document needs to be uploaded by viewing our guidance video”~~
    - ~~There will be an embedded video for the user to view guidance within the modal.~~
  - ~~Document upload~~
    - ~~User can choose to upload files by drag and drop or selecting to open the device files.~~
    - ~~Users can select multiple files.~~
  - ~~“Submit Documents” button~~
- ~~The user will be able to close the document upload modal to continue browsing the trading platform.~~
- ~~The user will not be able to successfully place a bid~~

#### 6.4.1.3 Listings algorithm

- ~~The system will automatically suggest materials to buyers that are:~~
  - ~~Matching with their material preferences as per their profile~~
    - ~~Always display the newest listings first~~
  - ~~Similar to their “wanted listings”~~
  - ~~Similar to their existing listing~~
- ~~The system will then query the database for similar active listings by other sellers.~~
- ~~The algorithm to determine how listings are shown to the users should show matched listings first.~~
- ~~Details to be covered within the AC~~

### 6.4.2 Wanted section

_Screenshot: Wanted section layout_

#### 6.4.2.1 Wanted section layout

- This page will show a user all of the wanted listings that are on the system
- The page will have the following elements
  - [Header](#_vqslxpp5r867)
  - [Footer](#_54vec8n8ho52)
  - [Filters](#_nzsy29ljfkdq)
  - [Product cards](#_ipl5y36vjbnt)
    - Clicking on the card redirects the user to the listing page (product page)
  - [Account Status](#_yxkzqcazfick)
  - The page will have a distinct call to action:
    - List Wanted Material
    - The CTA will be placed at the very top of the page

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Layout and Structure:<ul><li>Ensure the Wanted Section homepage prominently displays all active wanted listings available on the system.</li><li>The page layout should include a consistent header and footer that align with the overall design of the platform.</li></ul></li><li>Key Elements on the Page:<ul><li>Header: Should contain site-wide navigation links, including a logo and access to user account settings.</li><li>Footer: Include links to legal notices, privacy policy, terms of service, and other essential website resources.</li><li>Filters: Implement user-friendly filters to allow visitors to refine the wanted listings displayed by various criteria such as location, urgency, and material type.</li><li>Product Cards: Each wanted listing should be displayed in a product card format which includes key information such as the material needed, description, and a visual element (photo or icon). Each card must be clickable and redirect the user to the detailed wanted listing page.</li><li>Account Status: Display the current status of the user’s account, alerting them to any required actions or notifications.</li></ul></li><li>Navigation and Interactivity:<ul><li>Clicking on a product card should redirect the user seamlessly to that specific wanted listing’s detailed page.</li><li>Ensure that all interactive elements are accessible and clearly labelled to facilitate easy navigation.</li></ul></li><li>Call to Action (CTA):<ul><li>Feature a prominent "List Wanted Material" button at the top of the Wanted Section homepage.</li><li>This CTA should be visually distinct and positioned to encourage users to post their own wanted listings.</li></ul></li><li>Responsiveness and Accessibility:<ul><li>The Wanted Section must be responsive, ensuring it displays correctly on devices of varying sizes.</li></ul></li><li>Performance and Load Times:<ul><li>Optimise the page for quick load times, ensuring that filters and listing cards load efficiently and without delay.</li><li>Consider implementing lazy loading for images and asynchronous data fetching for filters.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure the Wanted Section functions correctly across all supported browsers and devices.</li><li>Validate that all links and buttons lead to the correct pages or actions without errors.</li></ul></li><li>Error Handling:<ul><li>Provide clear, informative error messages if the page fails to load, or if any interactive elements malfunction.</li><li>Implement adequate logging and monitoring to capture and address any recurring issues promptly.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Page fails to load | "Failed to load the Wanted Section. Please try refreshing the page." |
| --- | --- |
| Filter application error | "Unable to apply filters at this time. Please try again." |
| --- | --- |
| Product card redirection failure | "Unable to access the listing details. Please try again." |
| --- | --- |
| General system error | "A system error has occurred. Please contact support or try again later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Wanted section homepage | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11200-6434&node-type=frame&t=jEqvOAk0rkdGLk2a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.4.2.2 Create a listing for wanted material

- The user will be able to create a listing for wanted material
- The form will be exactly the same as on the present website
- The form will have the following sections
  - Buttons for Create Listing (current page, is set to default)
  - Create Wanted Material
  - Upload media
    - Select “featured image” (i.e. cover image)
      - This is an upload field for dragging and dropping image files
  - Material wanted dropdown menus for
    - Country waste required in
    - Type of Material
    - Material Group
    - Material
    - Capacity per month
    - How should the waste be packaged
    - MFI requirements
    - How should the waste be stored?
  - Quantity wanted
    - Material weight
    - Choose Metric
  - Material required from (start date)
    - There will be a date picker (calendar)
  - Additional information
    - Free text box
- Set listing duration
  - 30 days (default)
  - Custom (select days, weeks, or pick a date from a calendar)
- There will be a “Submit” button
  - On submitting, the form will be sent to the Admin for approval
- A listing will stay live until
  - The fulfilment process begins (i.e. a seller can provide the materials, and the creator of the Wanted listing accepts their bid)
  - The listing is removed by the creator or the WasteTrade Admin
  - The default listing period comes to an end

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Form Structure and Layout:<ul><li>The form for creating a listing for wanted material should replicate the layout and functionality of the form currently used on the website.</li><li>Ensure all sections are clearly labelled and easy to navigate.</li></ul></li><li>Form Sections and Inputs:<ul><li>Upload Media: Provide an option to upload images with guidance on the type of images required.<ul><li>Text will display “This is recommended to optimise the matches for your requirements.”</li><li>Include the ability to select a "featured image" which will serve as the cover image for the listing.</li></ul></li><li>Material Wanted: Include a field for specifying the material type, for each of the fields within this section:<ul><li>Country waste is required in</li><li>Material Details: 7 Dropdowns for entering details regarding the material<ul><li>Material type<ul><li>Always shows options for Plastic, EFW, Fibre, Rubber, Metal</li></ul></li><li>Item<ul><li>Conditionally displays “Items” options based on Material type.</li></ul></li></ul></li></ul></li></ul></li></ul><p>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></p><ul><li><ul><li><ul><li><ul><li>Form<ul><li>If “Material type” = “Plastic” options for “Form” are presented</li></ul></li></ul></li></ul></li></ul></li></ul><p>(Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a>).</p><ul><li><ul><li><ul><li><ul><li><ul><li>If “Material type” is not plastic, the “Form” dropdown will only display N/A as a default selection.</li></ul></li><li>Grading<ul><li>If “Material type” = “Plastic” or “Fibre” the options for “Grading” are specific to the Material type selected.</li></ul></li></ul></li></ul></li></ul></li></ul><p>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></p><ul><li><ul><li><ul><li><ul><li><ul><li>If “Material type” = “EFW” or “Metal” or “Rubber” the “Grading” dropdown will only display N/A as a default selection.</li></ul></li><li>Colour<ul><li>Will always display the same options</li></ul></li></ul></li></ul></li></ul></li></ul><p>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></p><ul><li><ul><li><ul><li><ul><li>Finishing<ul><li>Will always display the same options</li></ul></li></ul></li></ul></li></ul></li></ul><p>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></p><ul><li><ul><li><ul><li><ul><li>Packing<ul><li>Will always display the same options</li></ul></li></ul></li></ul></li></ul></li></ul><p>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></p><ul><li><ul><li><ul><li>Capacity per month</li><li><s>How should the waste be packaged</s></li><li>MFI requirements</li><li>How should the waste be stored<ul><li>Indoor/Outdoor/Both/Any</li></ul></li><li>Quantity Wanted: Numeric input field for specifying the quantity of the material needed in Mt.</li><li>Choose Metric: The user can select units of Mt, Lbs, Kg.<ul><li>If Lbs or Kg are selected, this will convert to Mt in the Material Weight field.</li></ul></li><li>Material Required From: Include a date picker to allow the user to specify a start date from which the material is needed.</li></ul></li><li>Additional Information: Provide a free text box for additional details or specifications.<ul><li>This free text (and any free text for listings) should not allow telephone numbers, email addresses or urls.</li></ul></li><li>Ongoing Listing: Yes/No radio buttons.<ul><li>Selecting “Yes” allows the user to set Renewal Period<ul><li>Dropdown menu containing renewal period options.</li></ul></li><li>Selecting “No” allows the user to set Listing Duration<ul><li>Default duration of 30 days, or set a custom duration using days, weeks, or a specific end date selected via a calendar.</li></ul></li></ul></li></ul></li><li>Submission and Validation:<ul><li>Include a "Submit" button to send the listing for admin review.</li><li>Validate all input fields to ensure data integrity (e.g., proper date formats, required fields are not left blank).</li></ul></li><li>Admin Review and Listing Activation:<ul><li>Upon submission, ensure the form data is sent to the WasteTrade Admin team for approval.</li><li>Implement a notification system to inform the user of the submission status (e.g., "Your listing is under review" or "Your listing has been approved and is now live").</li></ul></li><li>Listing Visibility and Duration:<ul><li>Once approved, the listing should go live and be visible until:</li><li>The fulfilment process begins when a seller provides the materials, and the creator of the wanted listing accepts their bid.</li><li>The listing is removed by the creator or the WasteTrade Admin.</li><li>The default or custom listing period comes to an end.</li><li>“Ongoing” listings will renew at the period defined when creating the listing.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear, contextual error messages for any issues encountered during form completion or submission.</li><li>Ensure users can easily edit and resubmit the form if initial submission fails due to validation errors.</li></ul></li><li>Performance and Usability:<ul><li>Ensure the form is responsive and performs well across all devices and platforms.</li><li>Test the functionality thoroughly to ensure all form elements work as expected and that the submission process is smooth and reliable.</li></ul></li><li>Security and Compliance:<ul><li>Ensure that all user data is handled securely, and privacy standards are maintained throughout the process.</li><li>Check compliance with relevant data protection regulations, particularly in the handling and storage of personal and sensitive information.</li></ul></li><li>Testing and Validation:<ul><li>Conduct extensive testing, including user acceptance testing, to ensure the form meets all functional requirements and user expectations.</li><li>Test under various scenarios to ensure robustness, such as different user roles, material types, and listing durations.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| Upload Media | Input Type: File Upload; Constraints: Image files - jpeg, png; Max file size 25 MB, Max files set to 1; Mandatory |
| --- | --- |
| Country Waste is Required In | Input Type: Dropdown; Options: \[List of countries\]; Mandatory |
| --- | --- |
| Material Wanted | Input Type: Dropdowns for Material Type, Material Group, Material. Mandatory. |
| --- | --- |
| Material type | Dropdown: Plastic/EFW/Fibre/Rubber/Metal, Mandatory |
| --- | --- |
| Item | Dropdown: Options depend on Type of Material selected,<br><br>Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0), Mandatory |
| --- | --- |
| Form | Dropdown: If “Material type” = “Plastic” options for “Form” are presented (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” is not plastic, the “Form” dropdown will display N/A as a default selection. Mandatory |
| --- | --- |
| Grading | Dropdown: If “Material type” = “Plastic” or “Fibre” the options for “Grading” are specific to the Material type selected. (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” = “EFW” or “Metal” or “Rubber” the “Grading” dropdown will only display N/A as a default selection. Mandatory |
| --- | --- |
| Colour | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| --- | --- |
| Finishing | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| --- | --- |
| Capacity per Month | Input Type: Numeric; Constraints: Positive numbers; Mandatory |
| --- | --- |
| Material Flow Index (MFI) | Input Type: Radio buttons; Low (0.1-10), Medium (10-40), High (40+) |
| --- | --- |
| How is the waste stored | Dropdown : Indoor/Outdoor/Both/Any, Mandatory |
| --- | --- |
| Quantity Wanted | Input Type: Numeric; Constraints: Positive numbers; Mandatory |
| --- | --- |
| Material Weight Unit | Radio buttons: Mt, Lbs, Kg. Mandatory.<br><br>If Lbs or Kg are selected, this will convert to Mt in the Material Weight field (1 MT = 1000 Kgs = 2204.62263 Lbs). |
| --- | --- |
| Material Required From | Input Type: Date Picker; Constraints: Future dates; Mandatory |
| --- | --- |
| Additional Information | Input Type: Text Area; Constraints: Max 1000 characters; Optional. Does not allow telephone numbers, email addresses or URLs. |
| --- | --- |
| Ongoing Listing | Input Type: Radio Button: Yes/No, Mandatory. |
| --- | --- |
| Listing Renewal Period | Appears if the user selects “Yes” to Ongoing listing. Input Type: Dropdown (Weekly, Fortnightly, Monthly), Mandatory. |
| --- | --- |
| Listing Duration | Appears if the user selects “No” to Ongoing listing. Input Type: Dropdown; Choices: 30 days (default), Custom; Mandatory |
| --- | --- |
| Submit Wanted Listing Button | Input Type: Button; Action: Submits form; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Incomplete form submission | "Please complete all required fields before submitting." |
| --- | --- |
| Invalid file type for image upload | "Invalid file type. Please upload a valid image file." |
| --- | --- |
| Exceeded file size | File size exceeded limit of 25 MB |
| --- | --- |
| Invalid date | "Some information is formatted incorrectly. Please correct the highlighted fields." |
| --- | --- |
| Submission failure | "Failed to submit your listing. Please try again." |
| --- | --- |
| Exceeding text limit | "Your additional information exceeds the character limit." |
| --- | --- |
| Material weight | “Please enter in a number greater or equal to 3” |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | [https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=15029-20252&t=G2nIytyKUs2YgZlk-11](https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-2&p=f&t=0SLYsqA0RP3baCFG-11) |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |


_Screenshot: Listing page - wanted_

#### 6.4.2.3 Listing page (product page) - wanted

- The listing page presents a detailed view of each listing (buy/sell/wanted)
- The page will display the following elements
  - Product name
  - Availability status (same as [product card](#_ipl5y36vjbnt))
    - Pending approval (waiting for admin)
    - Material Required ( Waiting for seller of material to contact)
    - Material Required from &lt;date&gt; ( Waiting for seller of material to contact if start date is > today )
    - Expired (listing has passed the end date)
  - Breadcrumb
  - Photo carousel
    - Manual change
    - Auto-change every 3 seconds
  - Material description section
    - Replicate current website
    - Listings will be pulled through for the product listing. Listings shown for the following
      - Material
      - No. of Loads
      - Average weight per load
      - Price per load
      - Remaining Loads
      - Material Location
    - Sell Material button
  - Share Listing
    - Facebook, LinkedIn, Twitter
    - WhatsApp
    - Email
  - Buyer [Card](#_shxxu9cswa1p)
- The page will have a distinct call to action:
  - Sell Material
  - Message buyer
- There will be a link to the “Material Page” through the product page
- Contact information for WasteTrade’s commercial or operations team will be present on the page
- There are 2 buttons in the listing page ( Product Page ):
  - Delete : show a confirmation to user -> If the listing is deleted , navigate back to My Listing / Wanted list
  - Fulfil : mark the Wanted Listing as Fulfilled status

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Essential Content Display:<ul><li>Ensure the listing page displays the Product Name prominently at the top of the page.</li><li>Include an Availability Status indicator, consistent with the information presented on the product card.</li></ul></li><li>Links to Breadcrumb Navigation:<ul><li>Implement breadcrumb navigation to allow users to easily trace their path back to</li><li>previous pages, enhancing the navigational experience.</li></ul></li><li>Photo Carousel Features:<ul><li>Feature a photo carousel that displays images of the wanted material.</li><li>Allow users to manually cycle through images and implement an auto-change feature that rotates images every 3 seconds.</li></ul></li><li>Material Description Section:<ul><li>Include a detailed description of the wanted material, replicating the format and level of detail from the current website to maintain consistency.</li><li>Ensure the description is clear, concise, and provides all necessary information about the wanted material.</li></ul></li><li>Social Sharing Options:<ul><li>Incorporate options to share the listing on social platforms such as Facebook, LinkedIn, Twitter, WhatsApp, and via Email. Ensure each option functions correctly and formats the shared content appropriately for each platform.</li></ul></li><li>Buyer Card:<ul><li>Display a buyer card that includes relevant information about the person or company requesting the wanted material, such as contact details or other pertinent information.</li></ul></li><li>Calls to Action:<ul><li>Include distinct calls to action: "Sell Material" and "Message Buyer", each leading to appropriate actions. Ensure these buttons are visually distinct and positioned to drive user engagement.<ul><li>Message Buyer: should open a contact form that allows a message to be sent from the interested party (it will be sent to the WasteTrade Admin team, to manually review and manage)<ul><li>Title : Message to buyer</li><li>Name : Prepoluated</li><li>Email : pre populated</li><li>Text : free text for user to input</li></ul></li><li>Sell Material: opens the ‘create listing’ page with the details in the wanted listing pre-populated. Once the listing is live, the user who posted the ‘wanted’ listing will be notified.</li><li>Delete : show a confirmation to user -&gt; If the listing is deleted , navigate back to My Listing / Wanted list</li><li>Fulfil : mark the Wanted Listing as Fulfilled status</li></ul></li><li>Test that each call to action leads to the correct forms or contact methods.</li></ul></li><li>Link to Material Page:<ul><li>Provide a link to a more detailed “Material Page” that offers extensive information about the material involved in the listing.</li></ul></li><li>Contact Information:<ul><li>Display contact information for WasteTrade’s commercial or operations team prominently on the page to facilitate easy communication.</li></ul></li><li>Performance and Load Times:<ul><li>Optimise image and content loading to ensure the page loads efficiently without significant delays.</li><li>Consider using lazy loading for images if necessary to improve performance.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all elements on the page function correctly and that the design is consistent across different browsers and devices.</li><li>Validate the functionality of the social sharing features to ensure they operate without errors.</li></ul></li><li>Error Handling:<ul><li>Provide clear error messages for any failures in loading page content or executing requests.</li><li>Implement fallbacks for missing data, such as displaying 'Information not available' where data cannot be retrieved.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed to load listing details | "Failed to load details. Please refresh the page." |
| --- | --- |
| Photo carousel error | "Error displaying images. Please try again later." |
| --- | --- |
| Failure in initiating sample request | "Unable to send sample request. Please try again." |
| --- | --- |
| Social sharing failure | "Sharing failed. Please check your network and try again." |
| --- | --- |
| Navigation error to material page | "Cannot redirect to material details. Please try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11200-7804&node-type=frame&t=jEqvOAk0rkdGLk2a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

### 6.4.3 Sell section

A user will be able to sell material through the platform. Clicking on the sell button within the header takes the user to the “create a sales listing form”.

#### 6.4.3.1 Sell section layout

- The page will have the following elements
  - [Header](#_vqslxpp5r867)
  - [Footer](#_54vec8n8ho52)
  - [Account Status](#_yxkzqcazfick)

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Navigation to the Sell Section:<ul><li>Ensure that the "Sell" button is prominently placed within the header of the platform, easily accessible from any page.</li><li>Clicking the "Sell" button should reliably take the user directly to the "Create a Sales Listing Form".</li></ul></li><li>Page Layout and Design:<ul><li>The Sell section should feature a straightforward and user-friendly layout.</li><li>Include a consistent header that matches the overall design of the platform, providing a seamless user experience.</li></ul></li><li>Create a Sales Listing Form:<ul><li>The form should be the central element of the Sell section page.</li><li>Design the form to be intuitive and easy to complete, guiding the user through the process of listing material for sale.</li><li>Implement input validation to ensure all data entered is in the correct format and logically consistent (e.g., numeric fields should not accept letters).</li></ul></li><li>Performance and Reliability:<ul><li>Ensure the form submission process is fast and reliable, with appropriate loading indicators if there is any delay in processing.</li><li>The system should handle form submissions securely and confirm to the user that their listing has been successfully created or if it requires admin approval.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear, informative error messages if the form fails to submit or if any fields are filled out incorrectly.</li><li>Upon successful form submission, provide a confirmation message or page that informs the user of the next steps (e.g., "Your listing is under review" or "Your listing is now live").</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the form for functionality across multiple browsers and devices to ensure it performs consistently.</li><li>Conduct user acceptance testing to confirm that the form meets all user needs and expectations.</li></ul></li><li>Security Measures:<ul><li>Ensure that all data entered into the form is handled securely, especially sensitive information such as pricing details.</li><li>Implement measures to prevent common security threats like SQL injection and cross-site scripting.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
|     |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11245-10910&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.3.2 Create a listing (sell material)

- The user will be able to create a listing to sell material
- The form will be exactly the same as on the present website
- The form will have the following sections
  - Warehouse
    - Select location dropdown
    - Add new location
  - Upload media
    - There will be instructions guiding the user on the type of images they should provide
    - Select “featured image”
    - Do you have material specification data?
      - Upload from the device - if yes
    - Upload Gallery Images
      - With a field for dropping or selecting files for upload
    - Upload Material Specification data
      - Radio buttons for Yes/No
    - All images will be watermarked
  - Material - Drop down options for the following:
    - Type of material
    - Polymer Group
    - Material must remain in country of Origin
      - Yes/No radio buttons
    - How is the waste packaged?
    - How is the waste stored?
  - Quantity (total quantity and loads)
    - Material Weight (MT)
    - Number of Loads
  - Price
    - Select currency
    - Price per Metric Tonne
  - Material availability (start date)
    - There will be a date picker (calendar)
  - Set listing duration
    - 30 days (default)
    - Custom (select days, weeks, or pick a date from a calendar)
  - Additional information
    - Free text box
- There will be a “Submit” button
  - On submitting, the form will be sent to the Admin for approval
  - The listing can only go live once it has been approved by the admin
- A listing will stay live until
  - The fulfilment process begins (i.e. a seller can provide the materials, and the creator of the listing accepts their bid)
  - The listing is removed by the creator or the WasteTrade Admin
  - The default listing period comes to an end

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Form Consistency and Accessibility:<ul><li>The form for creating a sales listing should replicate the layout and functionality of the existing form on the current website.</li></ul></li><li>Form Sections and Inputs:<ul><li>Warehouse: Include a dropdown to select a location and an option to add a new location.</li><li>Upload Media: Provide functionality to upload images, with guidance on the type of images required and the ability to select a featured image. All images should be automatically watermarked upon upload.</li><li>Material Specification Data: Include an option to upload specification data if available.</li><li>Material Details: 7 Dropdowns for entering details regarding the material<ul><li>Material type<ul><li>Always shows options for Plastic, EFW, Fibre, Rubber, Metal</li></ul></li><li>Item<ul><li>Conditionally displays “Items” options based on Material type.<ul><li>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></li></ul></li></ul></li><li>Form<ul><li>If “Material type” = “Plastic” options for “Form” are presented<ul><li>(Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a>).</li></ul></li><li>If “Material type” is not plastic, the “Form” dropdown will only display N/A as a default selection.</li></ul></li><li>Grading<ul><li>If “Material type” = “Plastic” or “Fibre” the options for “Grading” are specific to the Material type selected.<ul><li>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></li></ul></li><li>If “Material type” = “EFW” or “Metal” or “Rubber” the “Grading” dropdown will only display N/A as a default selection.</li></ul></li><li>Colour<ul><li>Will always display the same options<ul><li>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></li></ul></li></ul></li><li>Finishing<ul><li>Will always display the same options<ul><li>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></li></ul></li></ul></li><li>Packing<ul><li>Will always display the same options<ul><li>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></li></ul></li></ul></li></ul></li><li>Material Weight:<ul><li>The user can select units of Mt, Lbs, Kg.</li><li>If Lbs or Kg are selected, this will convert to Mt in the Material Weight field.</li></ul></li><li>Currency: A dropdown to select the currency for the transaction.<ul><li>Price per metric tonne</li></ul></li><li>Material Availability: Include a date picker for selecting the start date of material availability.</li><li>Ongoing Listing: Yes/No radio buttons.<ul><li><ul><li>Selecting “Yes” allows the user to set Renewal Period<ul><li>Dropdown menu containing renewal period options.</li></ul></li><li>Selecting “No” allows the user to set Listing Duration</li></ul></li><li>Default duration of 30 days, or set a custom duration using days, weeks, or a specific end date selected via a calendar.</li></ul></li><li>Additional Information: A free text box for any extra details or notes related to the listing.<ul><li>This free text should not allow telephone numbers, email addresses or urls</li></ul></li></ul></li><li>Validation and Error Handling:<ul><li>Validate all input fields for correct formats and ensure that all mandatory fields are filled before allowing the form to be submitted.</li><li>Provide clear, contextual error messages for any issues encountered during form completion or submission.</li></ul></li><li>Submission and Review Process:<ul><li>Include a "Submit" button that sends the completed form to the Admin for approval.</li><li>Clearly communicate to the user that the listing will undergo an approval process and will only go live once approved.</li></ul></li><li>Listing Visibility and Duration:<ul><li>Inform the user that once approved, the listing will remain live until:</li><li>The fulfilment process is initiated (a buyer is found and the terms are agreed upon).</li><li>The listing is removed by either the creator or the WasteTrade Admin.</li><li>The set listing duration expires.</li><li>“Ongoing” listings will renew at the period defined when creating the listing.</li></ul></li><li>User Feedback and Notifications:<ul><li>Upon submission, provide immediate feedback that the listing has been received and is under review.</li><li>Notify the user through the platform's notification system once the listing is approved and live.</li></ul></li><li>Performance and Usability:</li><li>Ensure the form and all its elements load quickly and perform well across all platforms and devices.</li><li>Optimise image uploads and other data-intensive processes to prevent delays.</li><li>Security and Compliance:<ul><li>Ensure all data handling, especially for user inputs and image uploads, complies with relevant data protection regulations.</li><li>Implement security measures to prevent unauthorised access or manipulation of sensitive data.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that the form meets functional requirements and performs reliably under various conditions.</li><li>Perform user acceptance testing with real users to ensure the form is intuitive and meets user needs effectively.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| Warehouse Location | Dropdown: Options prefilled from My Locations, and “Other”, Mandatory |
| --- | --- |
| Other Warehouse Location | Conditional display: only shown when the user selects “Other” from the Warehouse Location dropdown. Input Type: Text; Mandatory; Max Length: 100 characters |
| --- | --- |
| Photo taking guide hyperlink | URL Hyperlink, to provided by client, navigate to the website for the guide |
| --- | --- |
| Featured image | Input Type: File Upload; Constraints: Image files - jpeg, png; Max file size 25 MB, Max files set to 1; Mandatory |
| --- | --- |
| Upload gallery images | Input Type: File Upload; Constraints: Image files - jpeg, png; Max file size 25 MB, Max files set to 1; Mandatory |
| --- | --- |
| Do you have Material Specification Data? | Yes/No checkbox , Mandatory |
| --- | --- |
| Material type | Dropdown: Plastic/EFW/Fibre/Rubber/Metal, Mandatory |
| --- | --- |
| Item | Dropdown: Options depend on Type of Material selected,<br><br>Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0), Mandatory |
| --- | --- |
| Form | Dropdown: If “Material type” = “Plastic” options for “Form” are presented (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” is not plastic, the “Form” dropdown will display N/A as a default selection. Mandatory |
| --- | --- |
| Grading | Dropdown: If “Material type” = “Plastic” or “Fibre” the options for “Grading” are specific to the Material type selected. (Defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0)). If “Material type” = “EFW” or “Metal” or “Rubber” the “Grading” dropdown will only display N/A as a default selection. Mandatory |
| --- | --- |
| Colour | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| --- | --- |
| Finishing | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| --- | --- |
| Packing | Dropdown: Options defined in [Materials Options](https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0). Mandatory |
| --- | --- |
| Material must remain in country of Origin | Yes/No checkbox , Mandatory |
| --- | --- |
| How is the waste stored? | Dropdown : Indoor/Outdoor/Both/Any, Mandatory |
| --- | --- |
| Material Weight Unit | Radio buttons: Mt, Lbs, Kg. Mandatory.<br><br>If Lbs or Kg are selected, this will convert to Mt in the Material Weight field (1 MT = 1000 Kgs = 2204.62263 Lbs). |
| --- | --- |
| Material Weight (MT) | Numeric input, Mandatory, Min >3 |
| --- | --- |
| Number of Loads | Numeric input, Mandatory, Min >1 |
| --- | --- |
| Currency | Dropdown: GBP / EUR / USD , Mandatory |
| --- | --- |
| Material Availability | Datetime, Min = Today , Mandatory |
| --- | --- |
| Ongoing Listing | Input Type: Radio Button: Yes/No, Mandatory. |
| --- | --- |
| Listing Renewal Period | Appears if uer selects “Yes” to Ongoing listing. Input Type: Dropdown (Weekly, Fortnightly, Monthly), Mandatory. |
| --- | --- |
| Listing Duration | Appears if user selects “No” to Ongoing listing. Input Type: Dropdown; Choices: 30 days (default), Custom; Mandatory |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| Form submission with incomplete data | "All fields must be completed. Please review your entries and try again." |
| --- | --- |
| Incorrect data format | "Some information is formatted incorrectly. Please correct the highlighted fields." |
| --- | --- |
| Form submission failure | "Failed to submit your listing. Please try again. If the problem persists, contact support." |
| --- | --- |
| Exceeding character limit for Additional Information | “Maximum character count of 32000 exceeded” |
| --- | --- |
| Network or server issue during submission | "There appears to be a problem with the server. Please try submitting again in a few minutes." |
| --- | --- |
| Security or validation error | "Your submission contains invalid characters or data that couldn't be processed. Please check your entries." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Create listing form | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-8693&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** |     |
| --- | --- |

### 6.4.4 My listings - sales

This section allows a user to see all of their sales listings.

#### 6.4.4.1 View all sales listings

- This page will show a user all of the sales listings which they have created
- The page will have the following elements
  - [Header](#_vqslxpp5r867)
  - [Footer](#_54vec8n8ho52)
  - [Filters](#_nzsy29ljfkdq)
  - [Product cards](#_ipl5y36vjbnt)
    - Clicking on the card redirects the user to the listing page (product page)
    - The product cards will show an alert for listings which are due to expire
  - Remove Listing button
  - [Account Status](#_yxkzqcazfick)
- To view details of my list, add in a Sold button
  - To mark the listing as Sold and change status to Sold , no buyer can bid on the listing
- To view details of my list, add in a Delete button
  - To remove the listing .

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Page Layout and Design:<ul><li>Ensure the page includes a consistent header and footer that match the overall site design, providing a seamless user experience.</li><li>The AC for the following elements have been defined separately, please click on the linked sections:<ul><li><a href="#_vqslxpp5r867">Header</a></li><li><a href="#_54vec8n8ho52">Footer</a></li><li><a href="#_nzsy29ljfkdq">Filters</a></li><li><a href="#_ipl5y36vjbnt">Product cards</a><ul><li>Clicking on the card redirects the user to the listing page (product page)</li><li>The product cards will show an alert for listings which are due to expire</li></ul></li><li>Remove listing button<ul><li>Clicking this will add a remove button on all applicable live listings</li></ul></li><li><a href="#_yxkzqcazfick">Account Status</a><ul><li>Display the current account status prominently on the page, alerting the user to any required actions or notifications.</li><li>The list of status<ul><li>Pending approval (waiting for admin)</li><li>Available now (available for bids)</li><li>Available from &lt;date&gt; (if start date is later than today)</li><li>Expired (listing has passed the end date)</li><li>Sold (manually marked as sold by the seller, or if 0 loads are remaining)</li></ul></li></ul></li></ul></li></ul></li><li>Performance and Reliability:<ul><li>Optimise the page for quick load times, ensuring that listings and images load efficiently without significant delays.</li><li>Ensure the reliability of the redirection functionality from product cards to detailed listing pages.</li></ul></li><li>Error Handling and Feedback:<ul><li>Provide clear, informative error messages if listings fail to load or if any filters or links malfunction.</li><li>Implement a feedback mechanism or notification if there are no listings to display (e.g., "You currently have no active sales listings.").</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that the page functions correctly across different devices and browsers, including the proper display and functionality of filters and product card alerts.</li><li>Validate the page with actual users to ensure it meets their needs and expectations in managing their sales listings.</li></ul></li><li>Security and Data Integrity:<ul><li>Ensure that all user data displayed is secure and that privacy standards are maintained, especially in displaying potentially sensitive information about sales and transactions.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Listings fail to load | "Unable to load your listings. Please refresh the page or try again later." |
| --- | --- |
| Filter application error | "Failed to apply filters. Please check your selections and try again." |
| --- | --- |
| Click on product card fails | "Error accessing listing details. Please try again." |
| --- | --- |
| No listings to display | "You currently have no active sales listings. Start by creating one!" |
| --- | --- |
| Listing expiry alert fails | "Error displaying expiry alerts. Please contact support if this persists." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| My listings | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-259&node-type=frame&t=YxxV4YeDU1a6kKN0-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.4.2 My sales - listing renewal

- ~~The user will be able to renew a listing that they have created through a listing’s~~ [~~Product page~~](#_ly73gd56x0q1)
- ~~When the listing is in the expiry period, there will be a message: “This listing is about to expire, do you want to renew it?”~~
- ~~The user will be able to click on the message to renew the listing~~
  - ~~The system will ask the user to confirm if they want to renew the listing~~
    - ~~Yes - set the new renewal period~~
      - ~~2 weeks (default)~~
      - ~~Custom (select days, weeks, or pick a date from a calendar)~~

#### 6.4.4.3 Remove a sales listing

- The user will be able to remove any sales listings which they have created
- When the Remove listing button is clicked, a bin icon will be added to all available now wanted listings will
- The user will be able to delete the listing from the
  - “View all sales listings” page (button)
  - Listings card (icon)
- The system will ask the user to confirm the removal
  - Copy to be written
- The user will be able to remove any listing which they have created

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Location of Removal Options:<ul><li>Ensure users can initiate the removal of a sales listing directly from the “View All Sales Listings” page.</li><li>Provide a clear and visible button on the listings page as well as a removal icon on each individual listing card.</li><li>When the “Remove listing” button is clicked, a bin icon will appear for all available listings</li></ul></li><li>Confirmation Process:<ul><li>Upon selecting the remove option, the system must prompt the user with a confirmation dialogue to prevent accidental deletions.</li><li>The confirmation message should clearly state the action about to be taken and ask for explicit user confirmation (e.g., “Are you sure you want to remove this listing? This action cannot be undone.”).</li></ul></li><li>User Interface and Interaction:<ul><li>The removal button and icon should be intuitively designed and easily accessible, ensuring a user-friendly experience.</li><li>Use a standard icon for deletion, such as a trash can, to ensure it is universally understood.</li></ul></li><li>Permissions and Restrictions:<ul><li>Confirm that only the creator of the listing can see and interact with the removal options.</li><li>Ensure that removal options are disabled or hidden for listings that cannot be deleted due to platform rules or pending transactions.</li></ul></li><li>Error Handling and Feedback:<ul><li>Implement error handling for cases where the listing removal fails (e.g., due to server issues). Provide a clear error message to the user (e.g., "Failed to remove the listing. Please try again later.").</li><li>If a listing is involved in an active transaction and cannot be removed, inform the user appropriately (e.g., “This listing is currently active in a transaction and cannot be removed at this time.”).</li></ul></li><li>Security and Data Integrity:<ul><li>Ensure that all removal actions are securely processed to prevent unauthorised data manipulation.</li><li>Log all removal actions for auditing and security purposes.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure the removal process works seamlessly across all supported devices and browsers.</li><li>Test the user experience for clarity and ease of use, ensuring that all messages and dialogs are understandable and that the removal process is intuitive.</li></ul></li><li>Performance Considerations:<ul><li>Ensure that the listing removal process is performed efficiently with minimal delay to enhance the user experience.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Confirmation failure | "Failed to confirm action. Please try again." |
| --- | --- |
| Listing removal failure | "Unable to remove listing at this time. Please try again later." |
| --- | --- |
| Unauthorised removal attempt | "You do not have permission to remove this listing." |
| --- | --- |
| Active transaction block | "This listing is currently active in a transaction and cannot be removed." |
| --- | --- |
| General system error during removal | "A system error occurred during removal. Please contact support if this persists." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Remove listing | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11200-8166&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.4.4.4 Replicate an existing sales listing

- ~~The user will be able to create new sales listings by replicating an existing sales listing~~
- ~~There will be a duplicate button within the~~ [~~listing page~~](#_ly73gd56x0q1)
- ~~Clicking on the button will lead the user to a prepopulated~~ [~~new listing~~](#_2xmyrdkvzaao) ~~form~~
  - ~~The form will have the following sections, these sections will be editable~~
    - ~~Warehouse~~
      - ~~Select location dropdown~~
      - [~~Add new location~~](#_dwwyq149foov)
    - ~~Upload media~~
      - ~~There will be instructions guiding the user on the type of images they should provide~~
      - ~~Select “featured image” (i.e. cover image)~~
      - ~~Do you have material specification data?~~
        - ~~Upload from the device - if yes~~
    - ~~Material~~
    - ~~Quantity~~
    - ~~Price~~
    - ~~Material availability (start date)~~
      - ~~There will be a date picker (calendar)~~
    - ~~Additional information~~
      - ~~Free text box~~
      - ~~This free text should not allow telephone numbers, email addresses or urls~~
- ~~There will be a “Submit” button~~
  - ~~On submitting, the form will be sent to the Admin for approval~~
- ~~A listing will stay live until~~
  - ~~The fulfilment process begins (i.e. a buyer’s bid is accepted and the haulage bidding has begun for the sales listing)~~
  - ~~The listing is removed by the creator or the WasteTrade Admin~~
  - ~~The default listing period comes to an end~~

### 6.4.5 My listings - wanted

This section allows a user to see all of their wanted materials listings.

#### 6.4.5.1 View all wanted listings

- This page will show a user all of the wanted listings which they have created
- The page will have the following elements
  - [Header](#_vqslxpp5r867)
  - [Footer](#_54vec8n8ho52)
  - [Filters](#_nzsy29ljfkdq)
  - [Product cards](#_ipl5y36vjbnt)
    - Clicking on the card redirects the user to the listing page (product page)
    - The product cards will show an alert for listings which are due to expire
  - [Account Status](#_yxkzqcazfick)
  - My wanted offers
    - This will be a link that redirects the user to the view wanted offers section
- To view details of my list, add in a Fulfil button
  - To mark the listing as Fulfil and change status to Fulfilled , no buyer can sell the material to the listing.
- To view details of my list, add in a Delete button
  - To remove the listing .

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Page Layout and Design:<ul><li>Ensure the page includes a consistent header and footer that match the overall site design, providing a seamless user experience.</li><li>The AC for the following elements have been defined separately, please click on the linked sections:<ul><li><a href="#_vqslxpp5r867">Header</a></li><li><a href="#_54vec8n8ho52">Footer</a></li><li><a href="#_nzsy29ljfkdq">Filters</a></li><li><a href="#_ipl5y36vjbnt">Product cards</a><ul><li>Clicking on the card redirects the user to the listing page (product page)</li><li>The product cards will show an alert for listings which are due to expire</li></ul></li><li><a href="#_yxkzqcazfick">Account Status</a><ul><li>Display the current account status prominently on the page, alerting the user to any required actions or notifications.</li></ul></li></ul></li></ul></li><li>Performance and Reliability:<ul><li>Optimise the page for quick load times, ensuring that listings and images load efficiently without significant delays.</li><li>Ensure the reliability of the redirection functionality from product cards to detailed listing pages.</li></ul></li><li>Error Handling and Feedback:<ul><li>Provide clear, informative error messages if listings fail to load or if any filters or links malfunction.</li><li>Implement a feedback mechanism or notification if there are no listings to display (e.g., "You currently have no active wanted listings.").</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that the page functions correctly across different devices and browsers, including the proper display and functionality of filters and product card alerts.</li><li>Validate the page with actual users to ensure it meets their needs and expectations in managing their sales listings.</li></ul></li><li>Security and Data Integrity:<ul><li>Ensure that all user data displayed is secure and that privacy standards are maintained, especially in displaying potentially sensitive information about sales and transactions.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Listings fail to load | "Unable to load your wanted listings. Please refresh the page or try again later." |
| --- | --- |
| Filter application error | "Failed to apply filters. Please check your selections and try again." |
| --- | --- |
| Click on product card fails | "Error accessing listing details. Please try again." |
| --- | --- |
| No listings to display | "You currently have no active wanted listings. Consider creating one!" |
| --- | --- |
| Listing expiry alert fails | "Error displaying expiry alerts. Please contact support if this persists." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Design link | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11326-7299&t=dwtNTtSk1wv3lpBb-4> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.5.2 Wanted materials - listing renewal

- ~~The user will be able to renew a listing that they have created through a listing’s~~ [~~Product page~~](#_ly73gd56x0q1)
- ~~When the listing is in the expiry period, there will be a message: “This listing is about to expire, do you want to renew it?”~~
- ~~The user will be able to click on the message to renew the listing~~
  - ~~The system will ask the user to confirm if they want to renew the listing~~
    - ~~Yes - set the new renewal period~~
      - ~~2 weeks (default)~~
      - ~~Custom (select days, weeks, or pick a date from a calendar)~~

#### 6.4.5.3 Remove a wanted materials listing

- The user will be able to remove any wanted listings which they have created
- The user will be able to delete the listing from the
  - “View all wanted listings” page (button)
  - Listings card (icon)
- The system will ask the user to confirm the removal
  - Copy to be written
- The user will be able to remove any listing which they have created

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Accessibility and Visibility of Removal Options:<ul><li>Ensure that options to remove a wanted listing are easily accessible from the “View All Wanted Listings” page.</li><li>Provide a clear and visible removal button on the listing page, as well as a removal icon on each individual listing card.</li></ul></li><li>Confirmation Process:<ul><li>Implement a confirmation dialogue to prevent accidental deletions. This dialogue should clearly inform the user of the action they are about to take and ask for explicit confirmation (e.g., "Are you sure you want to remove this listing? This action cannot be undone.").</li></ul></li><li>User Interface and Interaction:<ul><li>Design the removal button and icon to be intuitively recognisable, using standard symbols for deletion, such as a trash can icon.</li><li>Ensure the removal options are positioned in a way that they are discernible yet unobtrusive to prevent accidental clicks.</li></ul></li><li>Copy and Messaging:<ul><li>Upon successful removal of a listing, provide a confirmation message (e.g., "Your listing has been successfully removed.") to reassure the user that the action has been completed.</li></ul></li><li>Permissions and Security:<ul><li>Verify that only the user who created the listing has the ability to see and interact with the removal options.</li><li>Ensure that the system securely processes the removal request to prevent unauthorised data manipulation.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear, informative error messages if the removal fails (e.g., "Failed to remove the listing. Please try again later.").</li><li>In the case of listings that cannot be removed due to system or policy restrictions, inform the user appropriately (e.g., "This listing cannot be removed at this time due to pending offers or other reasons.").</li></ul></li><li>Testing and Validation:<ul><li>Conduct comprehensive testing to ensure that the removal functionality works as expected across all supported devices and browsers.</li><li>Include scenarios in testing where listings are involved in active transactions or have other dependencies that might prevent removal.</li></ul></li><li>Performance and Usability:<ul><li>Ensure that the listing removal process is performed efficiently with minimal user wait times.</li><li>Confirm that the user experience during the removal process is smooth and free of technical glitches.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| Remove Button | Input Type: Button; Action: Triggers deletion process; Mandatory |
| --- | --- |
| Remove Icon | Input Type: Icon; Action: Triggers deletion process from card; Mandatory |
| --- | --- |
| Confirmation Dialog | Input Type: Dialog Box; Action: Confirms deletion intent; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Unable to delete listing | "Failed to remove the listing. Please try again later." |
| --- | --- |
| Listing cannot be deleted | "This listing cannot be removed at this time due to pending offers or other reasons." |
| --- | --- |
| Confirmation failure | "Failed to confirm action. Please try again." |
| --- | --- |
| Unauthorised removal attempt | "You do not have permission to remove this listing." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11206-7320&node-type=frame&t=jEqvOAk0rkdGLk2a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.4.5.4 Replicate an existing listing for Wanted Material

- ~~The user will be able to create new wanted listings by replicating an existing wanted listing~~
- ~~There will be a duplicate button within the~~ [~~listing page~~](#_ly73gd56x0q1)
- ~~Clicking on the button will lead the user to a prepopulated~~ [~~new listing~~](#_2xmyrdkvzaao) ~~form~~
  - ~~The form will have the following sections, these sections will be editable~~
    - ~~Upload media~~
      - ~~There will be instructions guiding the user on the type of images they should provide~~
      - ~~Select “featured image” (i.e. cover image)~~
    - ~~Material wanted~~
    - ~~Quantity wanted~~
    - ~~Material required from (start date)~~
      - ~~There will be a date picker (calendar)~~
    - ~~Additional information~~
      - ~~Free text box~~
- ~~There will be a “Submit” button~~
  - ~~On submitting, the form will be sent to the Admin for approval~~
- ~~A listing will stay live until~~
  - ~~The fulfilment process begins (i.e. a seller can provide the materials, and the creator of the Wanted listing accepts their bid)~~
  - ~~The listing is removed by the creator or the WasteTrade Admin~~
  - ~~The default listing period comes to an end~~

### 6.4.6 My Offers

This section allows the users to view the offers that they have made and the offers that have been made for their listings.

#### 6.4.6.1 View a summary of offers made

- There will be a table that displays a summary of all the offers received
- The table will have the following columns
  - Material name
  - Quantity
  - Bid Date
  - Country
  - Bid Amount
  - No. offers
  - View details
  - Offer status
    - Accepted
      - Shipped
    - Rejected
    - Pending
    - Counter Offered \[TBD in Phase 2\]
    - Lost \[TBD in Phase 2\]
  - View Details button
- The user will be able to click on a row to view the offer in detail
  - Pagination options at the bottom of the screen
    - Consisting of a BACK button, buttons numbered 1 to 5, and NEXT

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Display and Content:<ul><li>Ensure there is a table on the 'My Offers' section that displays a summary of all offers received for the user's listings.</li><li>The table must include the following columns: Material Name, Weight, Best Offer, Number of Offers, Loads Remaining, View Offers, Offer Status (with sub-statuses Accepted, Shipped, Rejected, Pending), and State (Active, Closed).</li></ul></li><li>Column Details and Data Integrity:<ul><li>Material Name: Display the name of the material for which the offer is made.</li><li>Quantity</li><li>Bid Date : Date of bid</li><li>Country</li><li>Offer Status: Show the current status of each offer.</li><li>Bid Amount</li></ul></li><li>Interactive Elements:<ul><li>Implement functionality where clicking on a row or a specific 'View Offers' button/link will redirect the user to a detailed page of that particular offer.</li><li>Ensure each clickable element is clearly labelled and easy to interact with.</li></ul></li><li>Status and State Definitions:<ul><li>Clearly define what each status (Accepted, Shipped, Rejected, Pending) and state (Active, Closed) means in the context of the user's offers.</li></ul></li><li>Performance and Reliability:<ul><li>Ensure that the table loads efficiently, with minimal delay, and that data refreshes are handled gracefully without needing to reload the entire page frequently.</li><li>Implement error handling to manage and display informative messages if data fails to load or an interaction fails.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear error messages if there are issues loading the offers or interacting with the table elements.</li><li>Example error message: "Failed to load offers. Please refresh the page or try again later."</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that the table displays correctly across all devices and platforms and that all interactive elements function as expected.</li><li>Validate that the information displayed in the table is accurate and up-to-date.</li></ul></li><li>Security and Compliance:<ul><li>Ensure that all data displayed in the table is secure and that only the authorised user can view offers related to their listings.</li><li>Adhere to data protection regulations when displaying and processing personal or sensitive data.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to load offer summary | "Failed to load offer summary. Please refresh the page or try again later." |
| --- | --- |
| Error on clicking 'View Offers' | "Unable to access detailed offers. Please try again." |
| --- | --- |
| Unauthorised access to offer details | "You do not have permission to view these offer details." |
| --- | --- |
| Server error during offer interaction | "A server error occurred. Please try again shortly." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| View a summary table | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-2424&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.6.2 View individual offers received for listings

- On clicking on a row of the “[view a summary of offers received](#_j01molnz8ki0)” table the user will be redirected to a details page
- The page will display the following information
  - Material name - link to the original listing
  - Weight
  - Best offer
    - The seller (listing owner) will see the total amount (price + haulage + any other charges) \[ For this phase haulage price = 0 and other charges =0 \]
  - Number of offers
    - List of other offers
      - Date, Amount, Buyer ID, Buyer Status
      - Loads remaining \[ Assume this data is already presented in the DB\]
  - Number of load the buyer bid on
  - Status
    - Active
    - Sold
      - Shipped
- The user will be able to perform certain actions
  - Accept a bid
    - Accepting one bid automatically marks the others as rejected if there is no load left.
    - The listing will be taken off the trading platform (no one will be able to see it or make new bids)
      - If there are multiple loads available, the number of loads will be updated; the users will be able to bid till the number of loads is down to zero
    - [Document generation](#_yaj9lu53vni0) will kick off
  - Reject a bid
    - After the user rejects a bid, a new text box to will appear to input the “Reason to reject a bid" after submitting the reason the bid will be removed
    - The listing will remain active until
      - The default listing period finishes
      - The listing is removed by the listing owner

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Details Page Navigation and Layout:<ul><li>Ensure that clicking on a row in the "view a summary of offers received" table redirects the user to a detailed offers page.</li><li>The page layout should be clear and intuitive, displaying all relevant information in an organised manner.</li></ul></li><li>Information Display:<ul><li>Material Name: Display as a clickable link that redirects to the original listing for full details.</li><li>Weight: Display the weight of the material involved in the offer.</li><li>Best Offer: Show the highest offer received.</li><li>Seller's Total Amount: Display the total amount including price, haulage, and any other applicable charges.</li><li>Number of Offers: Indicate the total number of offers received for the listing.</li><li>List of Other Offers: Display a list including date, amount, Buyer ID</li><li>Loads Remaining: Show how many loads are still available for bidding.</li><li>Status: Indicate the current status of the offer (Active, Sold, Shipped).</li></ul></li><li>Interactive Actions:<ul><li>Accept a Bid: Allow the seller to accept a bid, which automatically marks all other bids as rejected if there is no load remaining.<ul><li>Provide clear confirmation prompts and immediate feedback once a bid is accepted.</li></ul></li><li>Reject a Bid: Enable the seller to reject bids.<ul><li>The listing should remain active unless it is manually removed or the listing period expires.</li><li>After the buyer rejects a bid, then a free text box will appear, allowing the user to provide a reason why they’re rejecting the bid.<ul><li>This free text (and any free text for offers) should not allow telephone numbers, email addresses or urls</li></ul></li></ul></li></ul></li><li>Post-Acceptance Process:<ul><li>Upon accepting a bid, trigger document generation processes required for the transaction.</li><li>Update the number of loads remaining if multiple loads are available. Allow continued bidding until all loads are sold.</li><li>Automatically remove the listing from the trading platform visibility if all loads are sold or the chosen bid fulfils the total requirement.</li></ul></li><li>Security and Permissions:<ul><li>Ensure that only authorised users (listing owners) can view detailed offer information and perform actions like accepting or rejecting bids.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear error messages if there are issues loading offer details or processing actions (e.g., "Failed to load offer details. Please try again.").</li><li>Implement successful action confirmations (e.g., "Bid accepted successfully. Other bids have been marked as rejected.").</li></ul></li><li>Performance and Reliability:<ul><li>Ensure that all interactions on the page, like accepting or rejecting bids, are performed efficiently with minimal delay.</li><li>Optimise the page for fast loading times, especially when handling lists of offers and related data.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that navigation, data display, and user actions perform as expected across various devices and browsers.</li><li>Validate the accuracy and timeliness of the information displayed, especially status updates following bid actions.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| Reason to reject the bid | Free text : max 500 chars, Mandatory. Allow numeric/alphabetical input. Should not allow telephone numbers, email addresses or urls. |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed to load offer details | "Unable to load offer details. Please refresh the page and try again." |
| --- | --- |
| Error during bid acceptance | "Failed to accept the bid. Please check your network connection and try again." |
| --- | --- |
| Error during bid rejection | "Failed to reject the bid. Please try again later." |
| --- | --- |
| Unauthorised action attempted | "You do not have permission to perform this action." |
| --- | --- |
| Offer details out of date | "Offer details may be outdated. Please reload for the latest status." |
| --- | --- |
| System error during document generation | "There was an error generating necessary documents. Please contact support." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| View individual load | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-5469&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.6.3 Mark a bid as shipped

- ~~For each~~ [~~individual listing~~](#_1cdrp3l95gxf)~~, the user will be able to “mark it as shipped”~~
- ~~To mark a listing as shipped, the user will be required to add mandatory evidence~~
- ~~The user will be able to upload files from their device~~
  - ~~Weighbridge ticket (pdf/image)~~
  - ~~Loading images~~
  - ~~Other~~
    - ~~The user will be able to provide the title~~

#### 6.4.6.4 Document generation for accepted bids

- Once a seller accepts a bid, the system will automatically generate the documentation required
- The user will be able to view the following information for each document
  - Title
  - Description
- The user will be able to download the documents
- This will include
  - Annex vii
  - CMR
  - Packing List
  - Green Sheet
  - Duty of Care
  - Sales Invoice
  - Purchase order
- See [document management](#_3flov3pmlfxc) for the admin side

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Automatic Document Generation:<ul><li>Ensure that the system automatically generates the required documentation once a bid is accepted by a seller.</li><li>The documentation generation should be triggered without manual intervention, ensuring a seamless process flow.</li></ul></li><li>Document Details Display:<ul><li>Display the following information for each generated document:</li><li>Title: The name of the document.</li><li>Description: A brief description of the document’s purpose and contents.</li><li>This information should be clear and concise to help users understand the significance of each document.</li></ul></li><li>List of Documents to be Generated:<ul><li>Automatically generate and list the following documents, pertinent to the transaction:<ul><li>Annex VII</li><li>CMR (Consignment Note)</li><li>Packing List</li><li>Green Sheet</li><li>Duty of Care</li><li>Sales Invoice</li><li>Purchase Order</li></ul></li><li>Ensure all documents comply with the relevant legal and trade regulations.</li></ul></li><li>Document Access and Download:<ul><li>Provide functionality for users to view and download each document directly from the platform.</li><li>Ensure the download process is straightforward and secure, allowing users to easily obtain copies of the documents for their records.</li></ul></li><li>Usability and Accessibility:<ul><li>Make sure that the document viewing and downloading interface is user-friendly and accessible to all users, including those with disabilities.</li><li>Provide adequate instructions or tooltips to assist users in navigating the document management features.</li></ul></li><li>Security and Privacy:<ul><li>Implement robust security measures to ensure that document access is restricted to authorised users only.</li><li>Ensure that sensitive information within the documents is adequately protected, both in transit and at rest.</li></ul></li><li>Error Handling and Notifications:<ul><li>Provide clear error messages if document generation fails or if documents cannot be accessed or downloaded.</li><li>Notify the user immediately upon successful generation of documents and make them aware of where and how they can access these documents.</li></ul></li><li>Performance Metrics:<ul><li>Optimise the system to handle document generation quickly and efficiently, minimising the wait time for users.</li><li>Ensure that the system can handle multiple simultaneous document generations without degradation in performance.</li></ul></li><li>Integration with Admin Side Document Management:<ul><li>Ensure that document generation is aligned with the document management functionalities as specified in the admin side settings.</li><li>Admins should be able to see and manage the lifecycle of each document, including updates or revocation as necessary.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all types of documents are generated correctly and are accessible as intended.</li><li>Include security penetration testing to validate the protection mechanisms around sensitive documents.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Document generation fails | "Failed to generate documents. Please try again later." |
| --- | --- |
| Document access issue | "Unable to access documents at this time. Please check back later." |
| --- | --- |
| Document download failure | "Error downloading document. Please ensure your connection is stable and try again." |
| --- | --- |
| Unauthorised document access attempt | "You do not have permission to access these documents." |
| --- | --- |
| System error during document generation | "A system error occurred during document generation. Please contact support if this persists." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.6.5 View a summary of offers received \[ This will be shown within 6.4.4.1 View all sales listings\]

- There will be a table that displays a summary of all the offers made by a user
- The table will have the following columns
  - Material name
  - Pick up location,mo
  - Destination
  - Packaging
  - No. of loads
  - Weight per load
  - Status
    - Accepted
    - Rejected
    - Pending
- View Detail Button
- The user will be able to click on a row to view the offer in detail

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Structure:<ul><li>The table must display a summary of all offers made by the user.</li><li>The table must include the following columns:</li><li>Material name</li><li>Pick up location</li><li>Destination</li><li>Packaging</li><li>Number of loads</li><li>Weight per load</li><li>Status (Accepted, Rejected, Pending)</li><li>View Details button</li></ul></li><li>Table Functionality:<ul><li>Each row in the table must be clickable.</li><li>Clicking on a row must redirect the user to a detailed view of the offer.</li></ul></li><li>Data Presentation:<ul><li>The table must be paginated, displaying 20 rows per page.</li><li>The table must allow sorting by each column.</li><li>The table must have a search functionality to filter offers based on the material name, status, and location.</li></ul></li><li>Status Indicators:<ul><li>The status column must clearly indicate whether the offer is Accepted, Rejected, or Pending.</li><li>Visual indicators (e.g., colour-coded labels) should be used to differentiate between statuses for better readability.</li></ul></li><li>Error Handling:<ul><li>If there are no offers made by the user, the table must display a message: “No offers have been made yet.”</li><li>If the system encounters an error while loading the offers, an appropriate error message must be displayed: "Unable to load offers. Please try again later."</li></ul></li><li>Performance:<ul><li>The table must load and display data within 2 seconds under standard network conditions.</li></ul></li><li>Responsiveness:<ul><li>The table must be fully responsive and usable on all device types (desktop, tablet, mobile).</li></ul></li></ul></th></tr></thead></table>

| **Use Case** | **Error Message** |
| --- | --- |
| No offers made | “No offers have been made yet.” |
| --- | --- |
| Error loading offers | “Unable to load offers. Please try again later.” |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| View a summary of offers made | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-2424&node-type=frame&t=jEqvOAk0rkdGLk2a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.6.6 View bid details \[ This will be shown within 6.4.4.1 View all sales listings\]

- On clicking on a row of the “[view a summary of offers made](#_eoha4khwyc2n)” table the user will be redirected to a details page
- Go Back button at the top of the screen under the page title
- The page will show the following information
  - Material name
  - Pick up location
  - Destination
  - Packaging
  - No. of loads
  - Weight per load
  - Price per MT (Price offered)
  - Bid status
    - Approved
      - Note: At this point, the client will be informed that the Haulage process kicks off
    - Accepted
      - Show final price, if accepted
    - Shipped
    - Rejected
    - Pending
  - View Document button
- Admin communications
  - The user will be able to see a trail of messages between the WasteTrade Administration team and themselves

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Layout and Accessibility:<ul><li>Ensure a table is displayed on the 'My Offers' section that summarises all offers made by the user.</li><li>The table should be clearly laid out and easy to navigate, with appropriate headings for each column.</li><li>View Document button under the table</li></ul></li><li>Column Details and Data Integrity:<ul><li>Material Name: Display the name of the material offered.</li><li>Pick Up Location: Show the starting point of the material's journey.</li><li>Destination: Indicate the final delivery location of the material.</li><li>Packaging: Describe the type of packaging used for the material.</li><li>No. of Loads: Display the number of loads offered.</li><li>Weight per Load: Show the weight of each load.</li><li>Status: Indicate the current status of each offer (Accepted, Rejected, Pending).</li></ul></li><li>Interactive Table Elements:<ul><li>Ensure each row in the table is clickable and directs the user to a detailed view of the offer.</li><li>This detailed view should provide further information and possibly the ability to edit or withdraw the offer if it has not yet been accepted or rejected.</li></ul></li><li>Status Definitions and Visual Indicators:<ul><li>Clearly define what each status (Accepted, Rejected, Pending) means and ensure these are reflected accurately in the table.</li><li>Use colour coding or icons to enhance the visual representation of the status for quick user comprehension.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Implement clear and informative error messages if there are issues loading the table or accessing detailed views of offers.</li><li>Example error message: "Failed to load offer details. Please try refreshing the page or contact support if the issue persists."</li></ul></li><li>Performance and Reliability:<ul><li>The table should load efficiently, with minimal delay, ensuring a smooth user experience.</li><li>The system should handle updates to the table dynamically if the status of an offer changes.</li></ul></li><li>Security and Permissions:<ul><li>Confirm that only authorised users can view their own offers and that data is not accessible to other users unless intended (e.g., shared offers).</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure the table functions correctly across various devices and browsers.</li><li>Validate that the data displayed is accurate and up-to-date, particularly regarding the status of offers.</li></ul></li><li>Documentation and Support:<ul><li>Provide documentation or online help regarding how to interpret and interact with the table of offers.</li><li>Ensure that support is readily available for users who may have questions about their offers or encounter difficulties.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to load offer summary | "Failed to load your offers summary. Please refresh the page or try again later." |
| --- | --- |
| Error on clicking offer row | "Unable to access offer details. Please try again." |
| --- | --- |
| Unauthorised access attempt | "You do not have permission to view these offer details." |
| --- | --- |
| Data mismatch in offers | "Offer data mismatch detected. Please contact support." |
| --- | --- |
| Network issues during interaction | "Network error detected. Please ensure you are connected and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Designs to be updated | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-5469&node-type=frame&t=YxxV4YeDU1a6kKN0-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

**6.4.6.7 View documents for accepted bids**

- The documents will be available on the [Bid Details](#_8w4osqcsfjj4) page
- The documents will be automatically generated by the system
- The user will be able to view the following information for each document
  - Title
  - Description
- The user will be able to download the documents
- [Document](#_yaj9lu53vni0) list
  - Annex vii
  - CMR
  - Packing List
  - Green Sheet
  - Duty of Care
  - Sales Invoice
  - Purchase order
  - Weighbridge ticket (once uploaded by the seller)
- The “Good Photo Guide” will also go live for sellers at this point

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Document Availability and Display:<ul><li>Ensure that all relevant documents are available on the Bid Details page once a bid has been accepted.</li><li>The page layout should clearly display the documents, with each document presented in a consistent and organised manner.</li></ul></li><li>Information Display for Each Document:<ul><li>Title: Display the title of each document.</li><li>Description: Provide a brief description of the document’s purpose and contents.</li><li>Ensure that this information is concise and helps the user understand the significance of each document.</li></ul></li><li>List of Documents:<ul><li>The following documents must be automatically generated and available for download:<ul><li>Annex VII</li><li>CMR (Consignment Note)</li><li>Packing List</li><li>Green Sheet</li><li>Duty of Care</li><li>Sales Invoice</li><li>Purchase Order</li><li>Additionally, include:</li><li>Weighbridge Ticket (uploaded by the seller)</li><li>The “Good Photo Guide” for sellers<strong> [TB provided by client]</strong></li></ul></li></ul></li><li>Document Access and Download:<ul><li>Provide functionality for users to download each document directly from the platform.</li><li>Ensure that the download process is straightforward and secure, allowing users to easily obtain copies of the documents.</li></ul></li><li>Document Generation and Upload:<ul><li>Ensure that the system generates the required documents automatically once a bid is accepted.</li><li>Allow sellers to upload the Weighbridge Ticket once available. Ensure that this document is linked and accessible from the Bid Details page.</li></ul></li><li>Good Photo Guide:<ul><li>Ensure that the "Good Photo Guide" goes live for sellers at the point when the bid is accepted.</li><li>Provide easy access to the guide to assist sellers in uploading high-quality photos.</li></ul></li><li>Security and Privacy:<ul><li>Implement robust security measures to ensure that document access is restricted to authorised users only.</li><li>Ensure that sensitive information within the documents is adequately protected, both in transit and at rest.</li></ul></li><li>Error Handling and Notifications:<ul><li>Provide clear error messages if document generation fails or if documents cannot be accessed or downloaded.</li><li>Notify the user immediately upon successful generation of documents and make them aware of where and how they can access these documents.</li></ul></li><li>Performance Metrics:<ul><li>Optimise the system to handle document generation quickly and efficiently, minimising the wait time for users.</li><li>Ensure that the system can handle multiple simultaneous document generations without degradation in performance.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all types of documents are generated correctly and are accessible as intended.</li><li>Include security penetration testing to validate the protection mechanisms around sensitive documents.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
|     |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
|     |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| View documents for accepted bids | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-12838&node-type=frame&t=jEqvOAk0rkdGLk2a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.4.6.8 Buyer - Admin communications

- ~~The user will communicate directly with the Admin regarding a particular bid through the platform~~
- ~~The communications trail will be visible~~
- ~~The messaging structure will be the same as a standard messaging service~~
  - ~~Admin messages will feature on the left side of the section~~
  - ~~Buyer messages will be on the right side of the section~~
  - ~~All messages will be time-stamped~~
  - ~~The native typing features will be used~~
  - ~~The user will be able to add attachments of up to 25MB (total) to their message~~

###

### 6.4.7 Favourites

#### 6.4.7.1 Favourites section layout

- ~~This page will show a user all of the listings (sales and wanted) that they have saved to their favourites on the system~~
- ~~The page will have the following elements~~
  - [~~Header~~](#_vqslxpp5r867)
  - [~~Footer~~](#_54vec8n8ho52)
  - [~~Filters~~](#_nzsy29ljfkdq)
  - [~~Product cards~~](#_ipl5y36vjbnt)
    - ~~Clicking on the card redirects the user to the listing page (product page)~~
  - [~~Account Status~~](#_yxkzqcazfick)

#### 6.4.7.2 Remove from favourites

- ~~The user will be able to remove items from their favourites~~
- ~~The “star” icon on a~~ [~~product card~~](#_ipl5y36vjbnt)~~/~~[~~product page~~](#_ly73gd56x0q1) ~~will be highlighted when it has been favourited~~
- ~~The user will click on the “star” icon to remove it~~
- ~~The highlight will immediately disappear~~
- ~~The item will not be visible on the favourites page when it is refreshed~~

### 6.4.8 Account settings

This section allows the users to manage their account (for example: profile management, managing company details, and notification preferences)

#### 6.4.8.1 Account settings layout

- The page will have a [header](#_vqslxpp5r867) “Account Settings”
- The page will have a tabbed submenu with the options:
  - My Profile
  - Company Information
  - Material Preferences
  - Notifications
  - Company Documents
- The main body will display the items associated with the selected sub-menu option

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Page Structure:<ul><li>Ensure that the Account Settings page includes a clearly defined header.</li><li>The header should be consistent with the design and layout used throughout the platform to maintain a uniform user experience.</li></ul></li><li>Tabbed Sub-Menu:<ul><li>Include a tabbed sub-menu below the header. The sub-menu should be easily navigable and allow users to switch between different account settings sections.</li><li>Each tab should be clearly labelled and relevant to the account setting</li></ul></li><li>Main Body Display:<ul><li>The main body of the page should dynamically display the items and settings associated with the selected sub-menu option.</li><li>Ensure that the content of each tab is well-organised and easily accessible, with clear headings and input fields where necessary.</li></ul></li><li>Responsive Design:<ul><li>The layout must be responsive and adapt seamlessly to different screen sizes and devices, ensuring a consistent user experience across desktops, tablets, and mobile devices.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear and informative error messages if there are issues loading the account settings or interacting with any elements on the page.</li><li>Example error message: "Failed to load account settings. Please refresh the page or try again later."</li></ul></li><li>Security and Privacy:<ul><li>Ensure that sensitive information within the account settings is adequately protected, both in transit and at rest.</li></ul></li><li>Performance and Reliability:<ul><li>Optimise the page for fast loading times and smooth transitions between different sub-menu tabs.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all elements of the Account Settings page function correctly across various devices and browsers.</li><li>Validate that the layout and interactive elements work as expected and provide a positive user experience.</li></ul></li><li>Consistency with Overall Design:<ul><li>Ensure that the design and layout of the Account Settings page are consistent with the overall design language of the platform.</li><li>Use the same fonts, colours, and button styles as the rest of the platform to maintain a cohesive look and feel.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to load account settings | "Failed to load account settings. Please refresh the page or try again later." |
| --- | --- |
| Unauthorised access attempt | "You do not have permission to access these account settings." |
| --- | --- |
| System error during interaction | "A system error occurred. Please try again later." |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-18376&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.2 Account settings - submenu

- The sub-menu will have the following options
  - My profile
  - Company information
  - Material preferences
  - Notifications
  - Company documents

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Submenu Layout and Options:<ul><li>Ensure that the Account Settings page includes a clearly defined submenu below the header.</li><li>The submenu must include the following options:<ul><li>My profile<ul><li>Personal Information</li><li>Change password</li></ul></li><li>Company information<ul><li>Company information</li><li>Business Address</li><li>Social links</li></ul></li><li>Material preferences<ul><li>Edit material preferences</li></ul></li><li>Notifications<ul><li>Edit notifications<ul><li>Email me new listings that match my interests</li><li>Email me offers on my listings</li></ul></li></ul></li><li>Company documents<ul><li>Edit company documents<ul><li>Which licences/permits do you have?</li></ul></li></ul></li></ul></li></ul></li></ul><p>Upload exemptions</p><ul><li><ul><li><ul><li><ul><li><ul><li>Do you have a waste carrier's licence?<br>Upload, if yes</li></ul></li></ul></li><li>My locations<ul><li>View all locations</li><li>Add site location</li></ul></li></ul></li></ul></li><li>Submenu Design and Navigation:<ul><li>Design the submenu to be user-friendly, with each option clearly labelled and easily clickable.</li><li>Highlight the currently selected submenu option to indicate the active section to the user.</li><li>Ensure smooth transitions between different submenu options, with minimal delay or lag.</li></ul></li><li>Content Display Based on Selection:<ul><li>Ensure that the main body of the page dynamically displays the relevant content and settings associated with the selected submenu option.</li><li>For each submenu option, provide a well-organised layout with clear headings, input fields, and actionable buttons where necessary.</li></ul></li><li>Consistency and Design Language:<ul><li>Maintain consistency in design with the rest of the platform, using the same fonts, colours, and button styles.</li><li>Ensure the submenu integrates seamlessly with the overall design language of the platform.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Show the loading icon until it is loaded successfully.</li><li>Show the error message if the page is not loaded fully.</li></ul></li><li>Performance and Reliability:<ul><li>Optimise the submenu for fast loading times and smooth transitions between different sections.</li></ul></li><li>Security and Permissions:<ul><li>Ensure that sensitive information within the account settings is adequately protected, both in transit and at rest.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all elements of the submenu function correctly across various devices and browsers.</li><li>Validate that the content and interactive elements within each submenu option work as expected and provide a positive user experience.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to load submenu option | "Failed to load the selected section. Please refresh the page or try again later." |
| --- | --- |
| Unauthorised access attempt | "You do not have permission to access these settings." |
| --- | --- |
| System error during interaction | "A system error occurred. Please try again later." |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-18376&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.3 My profile

- The My Profile section displays the user’s personal information
  - Account ID
  - Prefix
  - First Name
  - Last Name
  - Job title
  - Email Address
  - Telephone (with country code)
- The user will also see an edit button allowing them to edit the profile
- There will also be an option to change the password. The user can click on the button to trigger the following:
  - This will trigger the [set password](#_5ti4ev9leqjr) flow

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Profile Information Display:<ul><li>Ensure the 'My Profile' section clearly displays the user's personal information including:<ul><li>Account ID</li><li>Prefix (Mr., Ms., Dr., etc.)</li><li>First Name</li><li>Last Name</li><li>Job Title</li><li>Email Address</li><li>Telephone</li></ul></li></ul></li><li>Edit Functionality:<ul><li>Include an 'Edit' button that allows users to update their profile information.</li><li>Upon clicking 'Edit', the fields should become editable, and the user should be able to modify their information.</li></ul></li><li>Password Change Option:<ul><li>Provide an option for the user to change their password. This should be clearly labelled, possibly as a button or link.</li><li>Clicking this option should trigger the set password flow, which includes verifying the current password and setting a new one.</li></ul></li><li>Performance and Reliability:<ul><li>Ensure that the profile page loads efficiently and that changes are processed quickly to avoid user frustration.</li><li>Optimise the backend to handle multiple simultaneous profile updates without performance degradation.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all functionality in the 'My Profile' section works correctly across different devices and browsers.</li><li>Validate that the data integrity is maintained during the edit and update processes.</li></ul></li><li>Consistency with Overall Design:<ul><li>Ensure that the 'My Profile' section is visually and functionally consistent with the rest of the platform.</li><li>Use the same fonts, colours, and button styles as the rest of the platform to maintain a cohesive look and feel.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to load profile details | "Failed to load profile details. Please try again later." |
| --- | --- |
| Profile update failure | "Unable to update profile. Please check your input and try again." |
| --- | --- |
| Unauthorised profile access | "You do not have permission to access this profile." |
| --- | --- |
| Invalid email format | "Invalid email address format. Please enter a valid email." |
| --- | --- |
| Mandatory field left blank | "This field is required. Please complete it before continuing." |
| --- | --- |
| Network error during profile update | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| My profile | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-18376&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.4 My profile - edit

- The following items are editable
  - Prefix
  - First Name
  - Last Name
  - Email Address
  - Telephone
  - Job Title
- The system will ask the user to confirm their changes before closing the “edit window”
- The system will bring up a window with the editable fields, and a Close button to close the window

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Editable Fields:<ul><li>Ensure that the following fields are editable when the user accesses the 'edit' mode in the My Profile section:<ul><li>Prefix (Mr., Ms., Dr., etc.)</li><li>First Name</li><li>Last Name</li><li>Email Address</li><li>Telephone</li><li>Job Title</li></ul></li></ul></li><li>Input Validation:<ul><li>Implement input validation to ensure all data entered is in the correct format:</li><li>Prefix: Must be selected from a predefined dropdown list.</li><li>First Name and Last Name: Must only contain alphabetic characters; enforce a maximum length (50 characters).</li><li>Email Address: Must adhere to standard email format.</li><li>Telephone: Must be valid according to international telephone numbering standards.</li></ul></li><li>Confirmation Process:<ul><li>Introduce a confirmation step before any changes are saved. This could involve a popup window or an overlay asking the user to confirm the changes. This is also implemented for clicking the Close button before saving</li><li>Provide 'Confirm' and 'Cancel' options within this confirmation step.</li></ul></li><li>Usability Enhancements:<ul><li>Ensure that the edit process is user-friendly</li><li>Provide an 'Edit' button or icon next to each field or at the top of the section.</li><li>Upon clicking 'Edit', fields should become text inputs, dropdowns, or appropriate controls.</li><li>Display all editable fields immediately to avoid hidden controls or the need for additional clicks.</li></ul></li><li>Feedback and Error Handling:<ul><li>Display clear error messages next to the respective fields if entered data does not meet validation criteria.</li><li>On successful update, display a success message (e.g., "Your profile has been updated successfully.") and send an email for user to notify updated information.</li></ul></li><li>Security and Data Integrity:<ul><li>Check user authentication before allowing access to edit profile information to prevent unauthorised profile changes.</li></ul></li><li>Performance Considerations:<ul><li>Ensure that the interface responds quickly to user inputs and actions, particularly when switching between 'edit' and 'view' modes.</li><li>Minimise the load times of the edit mode, especially when validating and saving changes.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the edit functionality across various devices and browsers to ensure consistent performance and user experience.</li><li>Include usability testing to gather user feedback on the edit process and make adjustments as necessary.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| Account ID | Input Type: Text; Display only; No edits allowed; Mandatory |
| --- | --- |
| Prefix | Input Type: Dropdown; Choices include Mr., Ms., Dr., etc.; Editable; Mandatory |
| --- | --- |
| First Name | Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation, Script Constraints: Max 50 characters; Mandatory: Yes |
| --- | --- |
| Last Name | Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation, Script Constraints: Max 50 characters; Mandatory: Yes |
| --- | --- |
| Email Address | Input Type: Email; Standard email format required; Editable; Mandatory |
| --- | --- |
| Telephone | Input Type: Text; Format restrictions (e.g., '+\[country code\]\[number\]'); Editable; Mandatory |
| --- | --- |
| Job Title | "Job Title” must only contain letters and be under 50 characters." |
| --- | --- |
| Edit Button | Input Type: Button; Action: Enable editing of profile fields; Mandatory |
| --- | --- |
| Change Password | Input Type: Button/Link; Action: Trigger password reset flow; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Validation failure for Prefix | "Invalid prefix selected. Please choose a valid option." |
| --- | --- |
| Validation failure for First Name | "First Name must only contain letters and be under 50 characters." |
| --- | --- |
| Validation failure for Last Name | "Last Name must only contain letters and be under 50 characters." |
| --- | --- |
| Invalid email format | "Invalid email address format. Please enter a valid email." |
| --- | --- |
| Incorrect telephone format | "Invalid telephone number. Please enter a valid number." |
| --- | --- |
| Save without changes | "No changes detected. Please modify your profile details before saving." |
| --- | --- |
| Invalid format for Job Title | “"Job Title must only contain letters, spaces and be under 50 characters." |
| --- | --- |
| Network error during save | "Network error detected. Please check your connection and try saving again." |
| --- | --- |
| Unauthorised edit attempt | "You do not have permission to edit this profile." |
| --- | --- |
| System error during save | "System error occurred. Please try again later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| My profile - Edit | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-18376&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.5 Company information

- The section will be built to replicate the current website
- This section will have the following subsections
  - Company information
    - Company Name
    - Website
    - Company Interest
    - Company Type
    - VAT
    - Company registration number
    - Company description
  - Business address
    - Street address
    - Zip/Postal Code
    - City
    - County/ State/Region
    - Country
    - Company Email
    - Company Telephone
  - Company Social Media accounts
    - Facebook
    - Instagram
    - LinkedIN profile
    - Additional Social Media Field
- There will be an “information symbol” attached to any incomplete fields

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Structure and Layout:<ul><li>Ensure that the 'Company Information' section on the platform mirrors the layout and functionality of the current website.</li><li>This section should include subsections for general company information and business address details.</li></ul></li><li>Subsections and Content:<ul><li>Company information<ul><li>Company Name</li><li>Website</li><li>Company Interest</li><li>Company Type</li><li>VAT</li><li>Company registration number</li><li>Company description</li></ul></li><li>Business address<ul><li>Street address</li><li>Zip/Postal Code</li><li>City</li><li>County/ State/Region</li><li>Country</li><li>Company Email</li><li>Company Telephone</li></ul></li><li>Company Social Media accounts<ul><li>Facebook</li><li>Instagram</li><li>LinkedIN profile</li><li>Additional Social Media Field</li></ul></li></ul></li><li>Information Symbol for Incomplete Fields:<ul><li>Implement an information symbol (e.g., a tooltip icon) next to any fields that are incomplete or require user attention.</li><li>The information symbol should provide a brief explanation or prompt to the user about what needs to be completed.</li></ul></li><li>Edit and Update Functionality:<ul><li>Edit buttons are present next to each the Company Information and Business Address sections</li><li>Allow users to edit and update their company information easily.</li><li>Provide 'Save' and 'Cancel' options when editing information to give users control over changes.</li></ul></li><li>Visual Indicators for Completion:<ul><li>Use visual indicators such as colour changes or check marks to show which fields have been successfully completed or updated.</li></ul></li><li>Security and Data Protection:<ul><li>Ensure that all data within the 'Company Information' section is securely stored and transmitted.</li><li>Implement appropriate access controls to ensure that only authorised personnel can view or modify sensitive company information.</li></ul></li><li>Performance and Reliability:<ul><li>Ensure that the 'Company Information' section loads efficiently and can handle a large amount of data without performance issues.</li></ul></li><li>Testing and Documentation:<ul><li>Conduct thorough testing to confirm that the section works seamlessly across all platforms and devices.</li><li>Provide documentation or help sections that guide users on how to complete their company information accurately.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Missing required fields | "Please complete all required fields marked with an information symbol." |
| --- | --- |
| Invalid input format | "Invalid format detected. Please follow the guidelines provided and try again." |
| --- | --- |
| Unauthorised access to edit information | "You do not have the necessary permissions to edit this information." |
| --- | --- |
| Failure to save updates | "Failed to save changes. Please try again or contact support if the problem persists." |
| --- | --- |
| Network or server issues during updates | "Unable to update due to network issues. Please ensure you are connected and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-2156&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.4.8.6 Company information - edit

- The following sections will be editable individually (when the user clicks to edit Company Information, they will not see any information relating to the other sections)
  - Company information
    - Company Name
    - Website
    - Company interest
    - Company type
    - Company VAT Number
    - Company Registration Number
  - Business address
    - Street Address
    - Postcode
    - City
    - Country/State/Region
    - Country
    - Company Email
    - Telephone (With country code)
  - Company Social Media accounts
    - Facebook
    - Instagram
    - LinkedIN profile
    - Additional Social Media Field
- Discard Changes
- Save Changes
- X Close button for closing the window
- The system will ask the user to confirm their changes before closing the “edit window”


<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Individual Section Editability:<ul><li>Ensure that users can edit the 'Company Information' and 'Business Address' sections independently of each other.</li><li>Upon selecting to edit one of these sections, only the relevant fields should be displayed, ensuring there is no confusion or unnecessary data displayed from other sections.</li></ul></li><li>Editable Fields:<ul><li>Company Information Section<ul><li>Company name; website; company interest (buy/sell/both); company type; VAT; company registration number; company description</li></ul></li><li>Business Address Section: street address; zip/postal code; city; county/state/region; country; company email; company telephone</li><li>Social: facebook; instagram; linkedin profile; x</li></ul></li><li>Confirmation of Changes:<ul><li>Implement a confirmation step that prompts users to review and confirm their changes before they are saved.</li><li>Provide 'Confirm' and 'Cancel' options to allow users full control over the decision to save changes.</li></ul></li><li>Data Validation:<ul><li>Enforce data validation rules such as correct formats for email addresses, VAT numbers, and postal codes.</li><li>Ensure all mandatory fields are completed before allowing the user to save changes.</li></ul></li><li>User Feedback and Error Handling:<ul><li>Provide clear and immediate feedback on the success or failure of update attempts.</li><li>Display error messages related to data validation directly next to the relevant fields to guide users effectively.</li></ul></li><li>Security and Privacy:<ul><li>Ensure all data transmissions related to edits are secure and that only authorised users can make changes to company information.</li><li>Use encryption and secure protocols to protect sensitive data during transmission and storage.</li></ul></li><li>Performance Considerations:<ul><li>Ensure that the interface for editing company information is responsive and efficient, minimising load times and avoiding unnecessary delays.</li></ul></li><li>Consistency and Cohesion:<ul><li>Maintain visual and functional consistency with other parts of the platform to provide a seamless user experience.</li><li>Ensure that the style and behaviour of the edit windows are consistent with other editing functionalities on the platform.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the edit functionalities under various scenarios and user permissions to ensure robustness and security.</li><li>Validate that changes are correctly saved and reflected in the user interface and database.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| **Company Name** | Input Type: Text; Max Length: 100 characters; Mandatory |
| --- | --- |
| **Website** | Input Type: URL; Format: Valid URL; Optional |
| --- | --- |
| **Company Interest** | Input Type: Dropdown; Options: Buy, Sell, Both; Mandatory |
| --- | --- |
| **Company Type** | Input Type: Dropdown; Options: \[Specify types\]; Mandatory |
| --- | --- |
| **VAT Number** | Input Type: Text; Format: Country-specific VAT format; Mandatory |
| --- | --- |
| **Company Registration Number** | Input Type: Text; Max Length: 50 characters; Mandatory |
| --- | --- |
| **Company Description** | Input Type: Textarea; Max Length: 500 characters; Optional |
| --- | --- |
| **Street Address** | Input Type: Text; Max Length: 200 characters; Mandatory |
| --- | --- |
| **ZIP/Postal Code** | Input Type: Text; Max Length: 20 characters; Mandatory |
| --- | --- |
| **City** | Input Type: Text; Max Length: 100 characters; Mandatory |
| --- | --- |
| **County/State/Region** | Input Type: Text; Max Length: 100 characters; Mandatory |
| --- | --- |
| **Country** | Input Type: Dropdown; Options: \[List of countries\]; Mandatory |
| --- | --- |
| **Company Email** | Input Type: Email; Format: Standard email format; Mandatory |
| --- | --- |
| **Company Telephone** | Input Type: Text; Format: International telephone format; Mandatory |
| --- | --- |
| **Facebook URL** | Input Type: URL; Format: Valid URL; Optional |
| --- | --- |
| **Instagram URL** | Input Type: URL; Format: Valid URL; Optional |
| --- | --- |
| **LinkedIn Profile URL** | Input Type: URL; Format: Valid URL; Optional |
| --- | --- |
| **Additional Social Media Field (x)** | Input Type: URL; Format: Valid URL; Optional, placeholder for future use |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Invalid input format | "This input format is invalid. Please follow the guidelines provided." |
| --- | --- |
| Mandatory field left blank | "This field is required. Please complete it before saving." |
| --- | --- |
| Mandatory field exceeds character limit | "This input exceeds the field character limit." |
| --- | --- |
| Invalid phone numbers | "Please enter a valid phone number." |
| --- | --- |
| Invalid Email | "Invalid email address format. Please enter a valid email." |
| --- | --- |
| Unauthorised edit attempt | "You do not have the necessary permissions to edit this information." |
| --- | --- |
| Network or server issues during save | "A network error occurred. Please try again later." |
| --- | --- |
| Failed to save changes | "Failed to save changes. Please check your inputs and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Company information - edit | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-19479&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.7 Material preferences

- The section will be built to replicate the current website
- The page will display a list of all the materials (selected initially during onboarding)
- The user will also see an edit button allowing them to edit the material selection

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Display of Editiable Material Preferences:<ul><li>Display a comprehensive list of all materials that the user selected during the onboarding process.</li><li>The list should be clearly organised and easy to navigate, ensuring users can view their material preferences at a glance.</li></ul></li><li>Error Handling and Feedback:<ul><li>Display clear error messages if there are issues with updating the material preferences (e.g., "Failed to save changes. Please try again.").</li><li>Provide success notifications upon successfully updating the material preferences (e.g., "Your material preferences have been updated successfully.").</li></ul></li><li>Performance and Reliability:<ul><li>Ensure that the 'Material Preferences' section loads efficiently and can handle changes quickly without significant delays.</li><li>Optimise the backend to handle multiple simultaneous updates to material preferences without performance degradation.</li></ul></li><li>Security and Data Integrity:<ul><li>Ensure that all changes to material preferences are securely transmitted and stored.</li><li>Implement appropriate access controls to ensure that only authorised users can view and modify material preferences.</li></ul></li><li>Consistency and Design:<ul><li>Maintain a consistent look and feel with other sections of the platform, using similar fonts, colours, and layout designs.</li><li>Ensure that the design of the 'Material Preferences' section is in line with the overall branding and user interface guidelines of the platform.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing across different devices and browsers to ensure that the 'Material Preferences' section functions correctly.</li><li>Include user testing to gather feedback on the usability and functionality of the section, making adjustments based on user input.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
|     |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
|     |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Material Preferences | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-13618&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |


####

#### 6.4.8.8 Material preferences - edit

- The section will be built to replicate the current website
- On clicking on the edit button, the user will see a modal with all of the material choices
  - The following categories will be displayed
    - Plastic
      - Options for: LDPE, PC, PET, PVC, HDPE, PP, ABS, PS, Acrylic, PA, Other (Mix)
    - Fibre
      - Options for: Ordinary Grades, Medium Grades, High Grades, Kraft Grades, Special grades
    - Rubber
      - Options for: Natural, Synthetic
    - Metal
      - Options for: Ferrous, Non-Ferrous
    - Other
      - If selected , show a textbox for user to input
  - Each category will have multiple materials within it
    - There will be a checkbox with each material
    - The user will be able to select/unselect each material
  - There will be a “select all” button that will allow the user to select all the materials displayed
  - An X Close button for closing the window
- The system will ask the user to confirm their changes before closing the “edit window”

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Modal Window for Editing:<ul><li>When the user clicks the 'Edit' button, a modal window should appear, displaying all available material choices.<ul><li>Edit Capability:<ul><li>Include an 'Edit' button that allows users to modify their material preferences.</li><li>Upon clicking 'Edit', the user should be able to add or remove materials from their list, reflecting changes in their business operations or preferences.</li><li>For material categories please refer to the screen shot titled “Materials of interests”</li><li>Others material (Required) field also need input</li></ul></li></ul></li><li>The modal should be responsive and compatible across all devices and screen sizes.</li></ul></li><li>Material Categories and Options:<ul><li>Display the following material categories in the modal: Plastic, Fibre, Rubber, Metal, Other.</li><li>Each category should expand to show multiple materials within it, allowing for detailed selection.</li></ul></li><li>Selection Controls:<ul><li>Provide checkboxes for each material within the categories.</li><li>Users should be able to select or unselect each material according to their business needs.</li><li>Include a 'Select All' button for each category to facilitate easy selection of all materials under a category.</li></ul></li><li>Confirmation of Changes:<ul><li>Before any changes are saved and the modal is closed, prompt the user to confirm their selections. This can be achieved through a confirmation dialog box with 'Confirm' and 'Cancel' options.</li><li>Changes should only be saved if the user confirms; otherwise, revert to the previous selections if 'Cancel' is selected.</li></ul></li><li>Error Handling and Feedback:<ul><li>Provide clear feedback on the status of the save operation, including success notifications (e.g., "Your material preferences have been successfully updated.") and error messages if the operation fails (e.g., "Failed to save changes. Please try again.").</li></ul></li><li>Performance Considerations:<ul><li>Ensure that the modal operates efficiently, with minimal delay in loading and saving the user’s material preferences.</li><li>The system should handle high volumes of data without performance degradation, especially during peak usage times.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the modal for functionality and usability across different devices and web browsers.</li><li>Conduct user acceptance testing to gather feedback and ensure the feature meets user needs effectively.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| **Material Category** | Input Type: Label; Non-editable; Display categories like Plastic, Fibre, etc. |
| --- | --- |
| **Material Checkbox** | Input Type: Checkbox; Allows selection/deselection; Optional |
| --- | --- |
| **Select All Button** | Input Type: Button; Allows selecting all materials in a category; Optional |
| --- | --- |
| **Other** | Input Type : Textbox, mandatory if “others” is selected , allow user to input Numeric/ Alphabetical |
| --- | --- |
| **Confirm Changes** | Input Type: Button; Triggers save operation; Mandatory |
| --- | --- |
| **Cancel Changes** | Input Type: Button; Dismisses edits without saving; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to load materials | "Failed to load material options. Please try again later." |
| --- | --- |
| Save operation fails | "Unable to save your material preferences. Please attempt the save again." |
| --- | --- |
| Network error during save | "Network error detected. Check your connection and try again." |
| --- | --- |
| Unauthorised edit attempt | "You do not have permission to edit these preferences." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-14433&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.9 Notifications preferences

- The section will be built to replicate the current website
- The page will display the two notification categories and the user’s present selection
  - Email me offers on my listings
    - Yes/No
  - Email me new listings that match my interests
    - Yes/No
- The user will also see an edit button allowing them to edit the notification preferences

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Replication of Current Website Functionality:<ul><li>Ensure that the 'Notifications Preferences' section mirrors the functionality and layout of the current website, providing a consistent user experience.</li></ul></li><li>Display of Notification Preferences:<ul><li>Display the two notification categories clearly:</li><li>Email me offers on my listings.</li><li>Show the current user selection for each category, which should be either 'Yes' or 'No'.</li></ul></li><li>Security and Data Integrity:.<ul><li>Implement appropriate access controls to ensure that only authorised users can view and modify notification settings.</li></ul></li><li>Performance and Reliability:<ul><li>Ensure that the 'Notifications Preferences' section loads efficiently and can handle changes quickly without significant delays.</li><li>Optimise the backend to handle multiple simultaneous updates to notification preferences without performance degradation.</li></ul></li><li>Testing and Documentation:<ul><li>Conduct thorough testing across different devices and browsers to ensure that the 'Notifications Preferences' section functions correctly.</li><li>Provide user documentation or online help that details how to change notification settings effectively.</li></ul></li><li>Consistency and Design:<ul><li>Maintain a consistent look and feel with other sections of the platform, using similar fonts, colours, and layout designs.</li><li>Ensure that the design of the 'Notifications Preferences' section is in line with the overall branding and user interface guidelines of the platform.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed to load preferences | "Unable to load notification preferences. Please try again later." |
| --- | --- |
| Save operation fails | "Failed to save notification settings. Please check your selections and try again." |
| --- | --- |
| Network error during save | "Network error detected. Check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Notifications preferences | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-13676&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.10 Notification preferences - edit

- ~~The section will be built to replicate the current website~~
- ~~On clicking on the edit button, the user will see a modal with all of the notification choices~~
  - ~~The following categories will be displayed~~
    - ~~Email me new listings that match my interests~~
      - ~~Yes/No~~
    - ~~Email me offers on my listings~~
      - ~~Yes/No~~
- ~~The system will ask the user to confirm their changes before closing the “edit window”~~

#### 6.4.8.11 Company documents

- The section will be built to replicate the current website
- The following information will be visible (along with the existing responses)
  - Which licence/permit do you have?
    - Environmental Permit
    - Waste Exemption
    - Other
  - Waste Exemptions Upload (Drag and drop file field)
  - Do you have a Waste Carriers Licence
    - Options: Yes/Not Applicable
- The user will also see an edit button allowing them to edit the documents section

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Replication of Current Website Functionality:<ul><li>Ensure that the 'Company Documents' section replicates the functionality and layout of the current website, providing a familiar user experience for returning users.</li><li>This section should be integrated seamlessly into the new platform interface.</li></ul></li><li>Visibility of Documents and Licensing Information:<ul><li>Display all current documents and licences associated with the user’s account prominently.</li><li>Include clear labels and status indicators showing whether each document or licence is active, pending, or needs renewal.</li></ul></li><li>Document and Licence Types:<ul><li>Specifically, include visibility for:<ul><li>Which licence/permit the user has</li><li>Waste Exemptions Upload status</li><li>Waste Carriers Licence status</li></ul></li><li>If the user can access the My Profile / Document , they can upload the document to each categories</li></ul></li><li>Performance and Reliability:<ul><li>Ensure that the documents section is optimised for performance, handling large files and multiple simultaneous uploads without degradation in site performance.</li></ul></li><li>Testing and Documentation:<ul><li>Conduct extensive testing to ensure functionality works across all major browsers and devices.</li></ul></li><li>Consistency and Integration:<ul><li>Maintain visual and functional consistency with other sections of the platform, using similar styling, fonts, and layout structures.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| File upload fails | "Upload failed. Please check the file size and format, then try again." |
| --- | --- |
| Mandatory field missing | "Please select a licence or permit type before saving." |
| --- | --- |
| Network error during document save | "Network error detected. Please try to save the document again." |
| --- | --- |
| Document size exceeds limit | "Document size exceeds the allowable limit. Please compress your files and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Company documents | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-19658&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.12 Company documents - edit

- The section will be built to replicate the current website
- On clicking on the edit button, the user will see a modal with all of the company document choices
  - The following information will be editable
    - Which licence/permit do you have?
      - Environmental Permit
      - Waste Exemptions
      - Other
    - Environmental Permit Upload (show when select Environmental Permit)
      - Upload from device
    - Waste Exemptions Upload (show when select Waste Exemptions)
      - Upload from device
    - Other Document Upload (show when select Other)
      - Upload from device
    - Do you have a Waste Carriers Licence
      - Yes
      - Not applicable
- The system will ask the user to confirm their changes before closing the “edit window”
- Discard Changes button
- Save Changes button

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Replication of Current Website Functionality:<ul><li>Ensure that the 'Edit Company Documents' functionality replicates the look and feel of the current website, providing a familiar experience to users.</li></ul></li><li>Modal Window for Editing:<ul><li>Implement a modal window that appears when the 'Edit' button is clicked. This modal should display all available document options that can be edited.</li><li>The modal should be responsive and accessible on all devices and screen sizes.</li></ul></li><li>Editable Document Options:<ul><li>Allow users to select or change the type of licence/permit they hold, with options such as Environmental Permit, Waste Exemptions, and Other.<ul><li>For Others , the user can input in the new Other Description text area .</li></ul></li><li>Enable users to upload new documents for Waste Exemptions directly from their device.</li></ul></li><li>Waste Carriers Licence Options:<ul><li>Provide options for users to indicate whether they have a Waste Carriers Licence with options like 'Yes' and 'Not applicable'.</li><li>If user select “yes" for Waste Carriers License<ul><li>Provide the user with the ability to upload a document for this.</li></ul></li></ul></li><li>Validation and Confirmation:<ul><li>Before saving any changes, prompt the user to confirm their selections to prevent accidental modifications. Use a confirmation dialog box with 'Confirm' and 'Cancel' buttons.</li><li>Changes should only be saved if the user confirms; otherwise, revert to the previous selections if 'Cancel' is selected.</li></ul></li><li>Security and Data Protection:<ul><li>Ensure that all document uploads and modifications are handled securely. Implement data encryption and secure data transmission protocols to protect sensitive information.</li><li>Use server-side validation to check the integrity and authenticity of uploaded documents.</li></ul></li><li>Feedback and Error Handling:<ul><li>Provide immediate feedback on the status of document uploads and edits, including success notifications (e.g., "Your documents have been successfully updated.") and error messages if the operation fails (e.g., "Failed to upload document. Please check the file format and size and try again.").</li></ul></li><li>Performance and Reliability:<ul><li>Ensure that the document editing process is optimised for performance, particularly in handling file uploads and data processing without causing delays.</li></ul></li><li>Consistency and Design:<ul><li>Maintain a consistent design with other modals and editing interfaces on the platform to ensure a cohesive user experience.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| **Licence/Permit Type** | Input Type: Radio boxes; Options: Environmental Permit, Waste Exemptions, Other; Mandatory |
| --- | --- |
| **Do you have a waste carrier licence?** | Input Type: Radio Boxes; Options: Yes, Not applicable |
| --- | --- |
| **Waste Exemptions Upload** | Input Type: File upload; Accepts: PDF, DOCX, PNG, JPEG; Has a max file size of 5MB, upload support for 6 files; Mandatory |
| --- | --- |
| **Waste Carriers Licence upload** | Input Type: File upload; Accepts: PDF, DOCX, PNG, JPEG; Has a max file size of 5MB, upload support for 6 files; Mandatory |
| --- | --- |
| **Edit Button** | Input Type: Button; Triggers modal to edit document options; Mandatory |
| --- | --- |
| **Confirm Changes Button** | Input Type: Button; Commits changes to the server; Mandatory |
| --- | --- |
| **Cancel Changes Button** | Input Type: Button; Dismisses edits without saving; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed document upload | "Document upload failed. Please check the file size and format and try again." |
| --- | --- |
| Mandatory field not filled | "Please complete all mandatory fields before saving." |
| --- | --- |
| Network error during save | "A network error occurred. Please try to save the document again." |
| --- | --- |
| File size limit exceed | “File size limit exceeded, please check your documents” |
| --- | --- |
| Server error during document save | "Server error encountered. Please try again later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Company documents - edit | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-14513&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.13 My locations

- The section will be built to replicate the current website
- The user will be able to see all the locations associated with their account
  - The following information will be displayed
  - Location name, Site Point of Interest, Position in Company, Phone Number, Site-Specific Instructions, Street Address, Zip/Postal Code, City, Country/State/Region, Country, Head Office Opening Time, Head Office Closing Time
- Material Accepted section with the following options:
  - Plastic
  - Fibre
  - Rubber
  - Metal
    - Show all selected accepted values for each types
- On-site facilities \[ Show the selected option\]
  - Is there a loading ramp on this site?
    - Yes
    - No
  - Have you got a Weighbridge on this site?
    - Yes
    - No
  - Can you load the material yourself on this site?
    - Yes
    - No
  - Which container types can you manage on this site?
    - Curtain Slider
    - Containers
    - Tipper Trucks
    - Walking Floor
- Licence/Permits (display the thumbnail of document has been uploaded)
  - Which Permit/Licence do you have?
    - Environmental Permit
    - Waste Exemption
    - Other
  - Upload as waste exemption
    - Allows for file uploads
  - Do you have any access restrictions?
    - Yes
    - No
- The HQ/Head office will always be at the top of the list
- Button at the bottom to add a new location
- Add new Location button located at the bottom of the table

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Replication of Current Website Functionality:<ul><li>Ensure that the 'My Locations' section mirrors the functionality and layout of the current website to provide continuity and familiarity for users.</li></ul></li><li>Display of Locations:<ul><li>Display all locations associated with the user’s account clearly and concisely.Default to show the default location with all information.</li><li>Each location entry should list the 'Site name' and 'City'.</li><li>The Headquarters (HQ) or Head Office should always be listed at the top of the location list to emphasise its primary status.</li></ul></li><li>Interactivity and Navigation:<ul><li>Enable users to click on any location to navigate to the 'Edit Location' page where they can update location details.</li><li>Provide a prominent 'Add New Location' button that leads to a form for entering details of a new location.</li></ul></li><li>Validation and Confirmation:<ul><li>Implement checks to confirm actions such as adding or editing locations. Include confirmation dialogs that prompt users to save or cancel changes to prevent accidental data loss.</li></ul></li><li>Security and Data Protection:<ul><li>Ensure that all interactions within the 'My Locations' section are secured through encryption and proper session management to prevent unauthorised access.</li></ul></li><li>Feedback and Error Handling:<ul><li>Use friendly and informative error messages for issues like network failures or validation errors.</li></ul></li><li>Performance and Reliability:<ul><li>Optimise the section for quick loading times and responsiveness, especially when handling multiple locations and during data submission processes.</li></ul></li><li>Testing and Documentation:<ul><li>Conduct thorough testing across various devices and browsers to ensure functionality and responsiveness.</li><li>Provide documentation or help tooltips that guide users on how to manage their locations effectively.</li></ul></li><li>Consistency and Design:<ul><li>Maintain a consistent look and feel with other sections of the platform, using similar styling, fonts, and layout designs to provide a seamless user experience.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed to load locations | "Unable to load locations. Please try again later." |
| --- | --- |
| Network error during location update | "Network error detected. Check your connection and try updating again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| My locations | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-9566&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

####

#### 6.4.8.14 Edit a location

- The section will be built to replicate the current website
- The following information will be displayed and all the fields will be editable
  - Warehouse location
    - Location name
    - Site point of contact
    - Position in company
    - Phone number
    - Site-specific instructions (optional):
      - A space to provide site-specific information for the haulier
      - Free-text (500 words max)
  - Street Address
  - PostCode
  - City
  - County/State/Region
  - Country
  - Opening time
  - Closing time
  - List of accepted materials (checkboxes)
  - On-site facilities
    - Loading ramp
    - Weighbridge
    - Loading/unloading
    - Types of vehicles/containers accepted on the site
  - Licences/Permits
    - Do you have a licence/permit on-site?
      - If yes, upload it from the device
        - The user will be able to add up to 25MB of files (PDFs or images)
    - Do you have any access restrictions?
- There will be an “update location” button
  - If the user makes any changes and does not use the update location button, the system will ask the user to use the button before exiting the page

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Replication of Current Website Functionality:<ul><li>Ensure that the 'Edit a Location' functionality mirrors the current website to provide continuity and familiarity for users.</li><li>The interface should be intuitive and consistent with other editing functionalities on the platform.</li></ul></li><li>Editable Fields:<ul><li>All the following fields should be editable: <strong>[ Refer to design for options]</strong><ul><li>Location Name</li><li>Site Point of Contact</li><li>Position in Company</li><li>Phone Number</li><li>Site-Specific Instructions (optional, with a 500-word maximum)</li><li>Street Address</li><li>PostCode</li><li>City</li><li>County/State/Region</li><li>Country</li><li>Opening Time</li><li>Closing Time</li><li>Accepted Materials (with checkboxes)</li><li>On-site Facilities (including Loading Ramp, Weighbridge, Loading/Unloading capacities)</li><li>Types of Vehicles/Containers Accepted</li><li>Licences/Permits (option to upload new documents)</li></ul></li></ul></li><li>Document Upload:<ul><li>Allow users to upload licences or permits with a file size limit of 25MB, supporting formats like PDFs or images.</li><li>Include a feature to confirm the upload status (e.g., upload progress bar or confirmation message).</li></ul></li><li>Validation and Confirmation:<ul><li>Implement input validation for all fields to ensure data integrity (e.g., proper formatting for phone numbers and time fields).</li><li>Require users to confirm their changes before the update is finalised. This can involve a 'Review Changes' page or a confirmation dialog box.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear error messages for any issues during the update process, such as "Failed to save changes, please check your input and try again."</li><li>Include success messages once updates are successfully saved, such as "Location updated successfully."</li></ul></li><li>Security and Data Protection:<ul><li>Ensure that all data transmissions are secure and that user permissions are correctly enforced to prevent unauthorised edits.</li></ul></li><li>Performance and Reliability:<ul><li>Ensure that the editing process is efficient and can handle large data inputs without significant delays.</li><li>Optimise backend processes to handle updates and uploads promptly.</li></ul></li><li>Consistency and Design:<ul><li>Maintain a consistent look and feel with other sections of the platform, using similar styling, fonts, and layout designs.</li><li>Ensure that the design of the 'Edit a Location' page is intuitive and aligns with the overall user experience of the platform.</li></ul></li><li>Testing and Documentation:<ul><li>Conduct thorough testing, including unit tests, integration tests, and user acceptance testing to ensure the feature works as expected across different scenarios and browsers.</li><li>Provide detailed documentation or online help that guides users on how to edit a location effectively.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| **Warehouse Location** | Input Type: Text; Mandatory; Max Length: 100 characters |
| --- | --- |
| **Location Name** | Input Type: Text; Mandatory; Max Length: 100 characters |
| --- | --- |
| **Site Point of Contact** | Input Type: Text; Mandatory; Max Length: 100 characters |
| --- | --- |
| **Position in Company** | Input Type: Text; Mandatory; Max Length: 50 characters |
| --- | --- |
| **Phone Number** | Input Type: Text; Format: Phone number; Mandatory |
| --- | --- |
| **Site-specific Instructions** | Input Type: Textarea; Optional; Max Length: 500 words |
| --- | --- |
| **Street Address** | Input Type: Text; Mandatory; Max Length: 150 characters |
| --- | --- |
| **PostCode** | Input Type: Number / Text; Mandatory; Max Length: 150 characters |
| --- | --- |
| **City** | Input Type: Text; Mandatory; Max Length: 150 characters |
| --- | --- |
| **County/State/Region** | Input Type: Text; Mandatory; Max Length: 150 characters |
| --- | --- |
| **Country** | Input Type: Dropdown; Mandatory; Predefined list of Country |
| --- | --- |
| **Opening Time** | Input Type: Time picker; Format: HH<br><br>; Mandatory |
| --- | --- |
| **Closing Time** | Input Type: Time picker; Format: HH<br><br>; Mandatory |
| --- | --- |
| **List of Accepted Materials** | Input Type: Checkboxes; Multiple selections; Mandatory |
| --- | --- |
| **On-site Facilities** | Input Type: Checkboxes; Options: Loading Ramp, Weighbridge, Loading/Unloading; Mandatory |
| --- | --- |
| **Types of Vehicles/Containers** | Input Type: Checkboxes; Multiple selections; Mandatory |
| --- | --- |
| **Licences/Permits Upload** | Input Type: File upload; Formats: PDF, images; Max size: 25MB; Optional |
| --- | --- |
| **Access Restrictions** | Input Type: Text; Optional; Max Length: 200 characters |
| --- | --- |
| **Update Location Button** | Input Type: Button; Triggers save operation; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Incomplete required fields | "Please complete all required fields before updating the location." |
| --- | --- |
| Invalid phone number format | "Please enter a valid phone number." |
| --- | --- |
| Document upload fails | "Failed to upload the document. Please check the file size and format and try again." |
| --- | --- |
| Network error during location update | "Network error detected. Please try updating the location again." |
| --- | --- |
| File size limit exceed | “File size limit exceeded, please check your documents” |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Edit location | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-13974&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.15 Add a new location

- The section will be built to replicate the current website
- The following information will be required to create a new location
  - - Do you have any access restrictions?
- There will be an “add new location” button
  - If the user makes any changes and does not use the update location button, the system will ask the user to use the button before exiting the page
- New Location is added as an small option in the list of location

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Replication of Current Website Functionality:<ul><li>Ensure that the 'Add a New Location' functionality replicates the look and feel of the current website to provide a seamless transition for users familiar with the existing interface.</li></ul></li><li>Required Information for New Location:<ul><li>Users must be able to input all the following mandatory fields when creating a new location:<ul><li>Location Name</li><li>Site Point of Contact</li><li>Position in Company</li><li>Phone Number</li><li>Street Address</li><li>Postcode</li><li>City</li><li>County/State/Region</li><li>Country</li><li>Head Office Opening Time</li><li>Head Office Closing Time</li><li>Optional fields include:</li><li>Site-specific Instructions (with a 500-word maximum)</li><li>Access Restrictions</li></ul></li></ul></li><li>Checkboxes and Selections:<ul><li>Provide checkboxes for users to select:</li><li>List of Accepted Materials<ul><li>Plastics: (LDPE, PC, PET, PVC, HDPE, PP, ABS, PS, Acrylic, PA, Other (Mix)</li><li>Fibre: (Ordinary Grades, Medium grades, High Grades, Kraft Grades, Special Grades)</li><li>Rubber: (Natural, Synthetic)</li><li>Metal: (Ferrous, Non-Ferrous, Other)</li></ul></li><li>On-site Facilities (Yes/No radio button options for: Loading Ramp, Weighbridge, Loading/Unloading)</li><li>Which container types can you manage on this site?<ul><li>Radio buttons for each option (Curtain Slider, Containers, Tipper trucks, Walking Floor)</li></ul></li><li>Which Permit/Licence do you have?<ul><li>Radio buttons for each option (Environmental Permit, Waste Exemption, Other, Upload later)</li></ul></li><li>Do you have any access restrictions?<ul><li>Radio buttons showing: Yes/No</li></ul></li></ul></li><li>Licences/Permits:<ul><li>Include an option to upload site-specific licences or permits from the device with a file size restriction of up to 25MB.</li><li>Support file formats like PDFs and images for the upload of these documents.</li></ul></li><li>Validation and Data Integrity:<ul><li>Implement validation checks to ensure all mandatory fields are filled correctly.</li><li>Use form validation to confirm that phone numbers, opening times, and closing times adhere to appropriate formats.</li></ul></li><li>Feedback and Error Handling:<ul><li>Provide immediate and clear feedback upon submission, whether successful or if errors occur.</li><li>Display specific error messages for form errors like "Invalid phone number format" or "Mandatory field missing".</li></ul></li><li>Confirmation and Changes Saving:<ul><li>Before final submission, prompt the user to confirm their inputs to avoid accidental creation of a new location.</li><li>Include a clear 'Add New Location' button and ensure the system prompts users if they attempt to navigate away without saving changes.</li><li>If the Location is added , it will be group as a small row under the default location</li></ul></li><li>Performance and Reliability:<ul><li>Optimise the performance of the form to handle data submission smoothly and efficiently without delays or crashes.</li></ul></li><li>Consistency and Design:<ul><li>Maintain design consistency with other parts of the platform, ensuring that the new location form integrates seamlessly with the overall aesthetic and functional approach of the platform.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| **Warehouse Location** | Input Type: Text; Max Length: 100 characters; Mandatory |
| --- | --- |
| **Location Name** | Input Type: Text; Max Length: 100 characters; Mandatory |
| --- | --- |
| **Site Point of Contact** | Input Type: Text; Max Length: 100 characters; Mandatory |
| --- | --- |
| **Position in Company** | Input Type: Text; Max Length: 50 characters; Mandatory |
| --- | --- |
| **Phone Number** | Input Type: Text; Format: Phone number; Mandatory |
| --- | --- |
| **Site-specific Instructions** | Input Type: Text area; Max Length: 500 words; Optional |
| --- | --- |
| **Street Address** | Input Type: Text; Max Length: 150 characters; Mandatory |
| --- | --- |
| **PostCode** | Input Type: Number / Text; Mandatory; Max Length: 150 characters |
| --- | --- |
| **City** | Input Type: Text; Mandatory; Max Length: 150 characters |
| --- | --- |
| **County/State/Region** | Input Type: Text; Mandatory; Max Length: 150 characters |
| --- | --- |
| **Country** | Input Type: Dropdown; Mandatory; Predefined list of Country |
| --- | --- |
| **Opening Time** | Input Type: Time picker; Format: HH:MM<br><br>; Mandatory |
| --- | --- |
| **Closing Time** | Input Type: Time picker; Format: HH:MM<br><br>; Mandatory |
| --- | --- |
| **List of Accepted Materials** | Input Type: Checkboxes; Multiple selections; Mandatory |
| --- | --- |
| **On-site Facilities** | Input Type: Checkboxes; Options: Loading Ramp, Weighbridge, Loading/Unloading; Mandatory |
| --- | --- |
| **Types of Vehicles/Containers** | Input Type: Checkboxes; Multiple selections; Mandatory |
| --- | --- |
| **Licences/Permits Upload** | Input Type: File upload; Formats: PDF, images; Max size: 25MB; Optional |
| --- | --- |
| **Access Restrictions** | Input Type: Text; Optional; Max Length: 200 characters |
| --- | --- |
| **Add New Location Button** | Input Type: Button; Triggers save operation; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Incomplete required fields | "Please complete all required fields before adding the location." |
| --- | --- |
| Invalid phone number format | "Please enter a valid phone number." |
| --- | --- |
| Exceeded character count (50 characters) | “Please shorten your input to 50 characters or under” |
| --- | --- |
| Exceeded character count (100 characters) | “Please shorten your input to 100 characters or under” |
| --- | --- |
| Exceeded character count (500 characters) | “Please shorten your input to 500 characters or under” |
| --- | --- |
| Document upload fails | "Failed to upload the document. Please check the file size and format and try again." |
| --- | --- |
| Network error during location save | "Network error detected. Please try adding the location again." |
| --- | --- |
| Over file size limit for uploads | "The file size exceeds the maximum limit of 25MB. Please reduce the file size and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Add new location | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=10996-9187&node-type=frame&t=F7QJKmoy5qmGFCjZ-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.4.8.16 Delete location

- ~~The section will be built to replicate the current website~~
- ~~There will be a delete button within the “Edit a location” view~~
- ~~The system will ask the user to confirm their action:~~
  - ~~Are you sure you want to delete &lt;Site Name&gt; in &lt;Site location&gt; from the platform?~~
- ~~If the user selects yes, then the site will be deleted~~
- ~~If the user selects no, the user will go back to the edit a location page~~

#### 6.4.8.17 Expired documents - reduced access

- ~~If the account owner (trader or haulier) does not update their documents they will be locked out of their account~~
  - ~~The user will not be able to engage in commercial activities till their document(s) are updated~~
    - ~~Trader - will not be able to buy/sell/list~~
    - ~~Haulier - will not be able to bid on haulage jobs~~
- ~~The~~ [~~account status banner~~](#_yxkzqcazfick) ~~will display a message asking the user to update the document(s)~~

## 6.5 Haulage platform

This section describes the functionality exclusive to the users of the haulage platform.

### 6.5.1 Haulage homepage

#### 6.5.1.1 Homepage layout

- ~~The page will have the following elements~~
  - [~~Header~~](#_vqslxpp5r867)
  - [~~Menu~~](#_mvpwbqvl8tyt) ~~(sidebar)~~
    - ~~Available loads~~
    - ~~Current offers~~
    - ~~Edit profile~~
    - ~~Note: the menu will be visible on all pages~~

#### 6.5.1.2 View Available loads

- ~~There will be a table that allows the user to view all the loads available for bidding~~
- ~~The table will have the following columns~~
  - ~~Material (name)~~
    - ~~Link to the~~ [~~listing page~~](#_ly73gd56x0q1)
  - ~~Pick up location~~
  - ~~Destination~~
  - ~~Packaging~~
  - ~~No of loads~~
  - ~~Weight per load~~
  - ~~Delivery window~~
- ~~The system will only show the haulier the bids for sites which accept their container types~~
- ~~There will be a button that allows the user to make an offer~~

####

#### 6.5.1.3 Search - view available loads

- ~~The table will be searchable~~
- ~~The user will be able to search by material name, packaging type, and locations (pickup/destination)~~

#### 6.5.1.4 Filter - view available loads

- ~~The table will be filterable~~
- ~~The user will be able to filter on the following parameters~~
  - ~~Delivery window - set range~~
  - ~~Material~~
  - ~~Pickup location~~
  - ~~Destination~~

#### 6.5.1.5 Make an offer

- ~~The user will be able to make a haulage offer on an “Available Load”~~
- ~~The user will be able to see the Load Details~~
  - ~~There will be a seller card, providing the following information~~
    - ~~Location, average weight per load, material type, packaging, container type, loading times, site restrictions~~
  - ~~There will be a buyer card, providing the following information~~
    - ~~Location, site restrictions, loading times, desired delivery window, number of loads bid on~~
- ~~The user will provide the following details to make a bid (replicate the current form)~~
  - ~~Trailer/container type~~
  - ~~Are you completing Customs clearance~~
    - ~~Note there will be a message: “If not, WasteTrade will handle Customs Clearance for a fixed fee of £200. This will be added to the Haulage Total”~~
    - ~~User will input customs clearance per load not as total.~~
  - ~~Currency~~
  - ~~Number of loads - not editable, view only~~
  - ~~Quantity per load (MT) - not editable, view only~~
  - ~~Haulage cost per load~~
    - ~~Note: Please include Weighbridge price if required~~
  - ~~Haulage total~~
    - ~~Automatic calculation (cost per load x number of loads)~~
  - ~~Transport provider~~
    - ~~Own haulage, third party, mixed~~
  - ~~Suggested collection date~~
  - ~~Expected transit time (drop-down selection)~~
  - ~~Demurrage and destination (days)~~
  - ~~Notes~~
    - ~~Free text box~~
    - ~~This free text should not allow telephone numbers, email addresses or urls~~
- ~~The user will be able to submit the bid~~
  - ~~After submitting the bid, it will go to the admin team for review~~

####

~~6.5.1.6. Add Incoterms to Haulier Dashboard~~

- ~~The Haulier dashboard will display the Haulier destination charge depending on incoterms of the load.~~
- ~~The incoterms (and associated location if applicable) and associated costs should be displayed for each available load in the Haulier dashboard.~~
  - ~~The incoterm catgory for loads are defined in the trading platform when creating a haulage listing.~~
  - ~~Specific incoterms will display~~ [~~specific costs~~](https://guidedimports.com/blog/what-are-incoterms-chart/)~~:~~
    - ~~Cost and Freight (CFR)The seller pays for transportation to the destination port, export formalities, and loading the goods onto a vessel. The buyer pays for unloading and onward transportation at the destination port.~~
    - ~~Free on Board (FOB)The seller delivers the goods to a vessel and pays for all costs until they are loaded on the vessel. The buyer pays for all subsequent costs.~~
    - ~~Delivered Duty Paid (DDP)The seller pays for transportation, insurance, and customs duties or taxes. The buyer does not have to pay any additional financial burden to collect the goods.~~
    - ~~Delivered at Place (DAP)The seller pays for the main carriage but is not responsible for customs clearance. The buyer pays for import duties, taxes, and customs clearance fees.~~

###

### 6.5.2 Current offers

#### 6.5.2.1 View all current offers table

- ~~There will be a table that allows the user to view all the loads available that they have bid on~~
- ~~The table will have the following columns~~
  - ~~Material (name)~~
    - ~~Link to the~~ [~~listing page~~](#_ly73gd56x0q1)
  - ~~Pick up location~~
  - ~~Destination~~
  - ~~Quantity~~
  - ~~Packaging~~
  - ~~Offer status~~
    - ~~Accepted~~
    - ~~Lost~~
      - ~~Rejected by seller~~
      - ~~Reason given~~
    - ~~Rejected~~
      - ~~Rejected by admin~~
    - ~~Pending~~
  - ~~Bid state~~
    - ~~Active~~
    - ~~Closed~~
- ~~Clicking on a row will lead the user to the details page for the haulage bid~~

#### 6.5.2.2 Search - view available loads

- ~~The table will be searchable~~
- ~~The user will be able to search by material name, packaging type, and locations (pickup/destination)~~

#### 6.5.2.3 Filter - view available loads

- ~~The table will be filterable~~
- ~~The user will be able to filter on the following parameters~~
  - ~~Delivery window - set range~~
  - ~~Material~~
  - ~~Pickup location~~
  - ~~Destination~~
  - ~~Offer status~~
  - ~~Bid state~~

#### 6.5.2.4 View an offer - haulier

- ~~The user will be able to view the following details about bids which have been made~~
  - ~~The user will be able to see the Load Details~~
    - ~~There will be a seller card, providing the following information~~
      - ~~Location, the average weight per load, material type, packaging, container type, loading times, site restrictions~~
    - ~~There will be a buyer card, providing the following information~~
      - ~~Location, site restrictions, loading times, desired delivery window, number of loads bid on~~
  - ~~The following details will be visible (replicate the current view within the website)~~
    - ~~Bid state~~
      - ~~Active~~
      - ~~Closed~~
    - ~~Status~~
      - ~~Approved~~
        - ~~The bid has been approved and has been presented to the relevant party~~
      - ~~Accepted~~
        - ~~All parties have accepted the bid (“the bid is ‘go’ ”)~~
        - ~~Shipped~~
      - ~~Rejected~~
      - ~~Pending~~
    - ~~Trailer/container type~~
    - ~~Are you completing Customs clearance~~
      - ~~Note there will be a message: “If not, WasteTrade will handle Customs Clearance for a fixed fee of £200. This will be added to the Haulage Total”~~
    - ~~Currency~~
    - ~~Number of loads - not editable, view only~~
    - ~~Quantity per load (MT) - not editable, view only~~
    - ~~Haulage cost per load~~
      - ~~Note: Please include Weighbridge price if required~~
    - ~~Haulage total~~
      - ~~Automatic calculation (cost per load x number of loads)~~
    - ~~Transport provider~~
      - ~~Own haulage, third party, mixed~~
    - ~~Suggested collection date~~
    - ~~Expected transit time (drop-down selection)~~
    - ~~Demurrage and destination (days)~~
    - ~~Notes~~
      - ~~Free text box~~
  - ~~The user will be able to submit the bid~~
    - ~~After submitting the bid, it will go to the admin team for review~~
    - ~~The offer will not be editable (unless a WasteTrade admin enables editing)~~

#### 6.5.2.5 Edit an offer - haulier

- ~~The admin will be able to allow the user to amend their bid~~
- ~~In this case, the user will be able to edit the following fields~~
  - ~~Trailer/container type~~
  - ~~Are you completing Customs clearance~~
    - ~~Note there will be a message: “If not, WasteTrade will handle Customs Clearance for a fixed fee of £200. This will be added to the Haulage Total”~~
  - ~~Currency~~
  - ~~Haulage cost per load~~
    - ~~Note: Please include Weighbridge price if required~~
  - ~~Haulage total~~
    - ~~Automatic calculation (cost per load x number of loads)~~
  - ~~Suggested collection date~~
  - ~~Expected transit time (drop-down selection)~~
  - ~~Demurrage and destination (days)~~
  - ~~Notes~~
- ~~On submitting the edited bid, it will go back to the WasteTrade admin team for review~~

####

#### 6.5.2.6 Haulier and admin communications

- ~~The user will communicate directly with the Admin regarding a particular bid through the platform~~
- ~~The communications trail will be visible~~
- ~~The messaging structure will be the same as a standard messaging service~~
  - ~~Admin messages will feature on the left side of the section~~
  - ~~Haulier messages will be on the right side of the section~~
  - ~~All messages will be time-stamped~~
  - ~~The native typing features will be used~~
  - ~~The user will be able to add attachments of up to 25MB (total) to their message~~

#### 6.5.2.7 View documents for accepted bids

- ~~Once a bid has been accepted, the haulier-specific document will be generated~~
- ~~The user will be able to view the following information for each document~~
  - ~~Title~~
  - ~~Description~~
- ~~The user will be able to download the documents~~
- ~~Document list to be confirmed~~

### 6.5.3 Manage profile

#### 6.5.3.1 Edit profile

- ~~The user will arrive at the edit profile screen through the menu on the homepage~~
- ~~All of the following will be visible and editable on the page~~
  - ~~Name~~
    - ~~First~~
    - ~~Last~~
  - ~~Email~~
  - ~~Company Name~~
  - ~~Company Address~~
  - ~~Company Phone~~
  - ~~Fleet Type~~
  - ~~Areas your company can cover~~
  - ~~Container types~~
  - ~~Marketing email address~~
- ~~There will be a submit button~~
- ~~If the user makes any changes and does not use the “submit” button, the system will ask the user to confirm their changes before exiting the page~~

##

## 6.6 Admin platform

This section describes the functionality exclusive to the WasteTrade admin team.

Additional components for future work are outlined in [7.4.0.13 Future Scope](#_r1yrhb8dmsk7)

### 6.6.1 Admin platform homepage

#### 6.6.1.1 Admin Homepage Layout

- The page will have the following elements
  - [Header](#_vqslxpp5r867)
  - Live activity tables
  - Menu

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Consistent Layout and Design:<ul><li>The Admin Homepage must include a consistent header that aligns with the rest of the platform for a seamless user experience.</li><li>The design and layout should be intuitive and should facilitate easy navigation to all major sections of the admin interface.</li></ul></li><li>Header Requirements:<ul><li>The header should include the platform’s logo, navigation links to main sections, and admin-specific functionalities like settings or logout options.</li><li>It should be responsive and display appropriately across different devices and screen resolutions.</li></ul></li><li>Live Activity Tables:<ul><li>The Admin homepage will have 4 tabs<ul><li>Purchases : all the purchase with buyer / sellers on the materials ( Order by latest on top)</li><li>Listings : all the listings with newest listing on top</li><li>Wanted: all the Wanted listing with newest Wanted item on top</li><li><s>Hauliers : All the haulage bids [ Not in phase 1]</s></li></ul></li><li>The tables should allow sorting and filtering to help the admin find the most relevant information quickly.</li></ul></li><li>Dynamic Menu:<ul><li>The menu should be clearly structured, providing links to all the essential admin sections such as user management, content management, analytics, and system settings.</li><li>Ensure that the menu is easy to navigate and that its layout is adaptable to both desktop and mobile views.</li></ul></li><li>Performance and Reliability:<ul><li>The homepage should load quickly and efficiently, even with real-time data being presented in the live activity tables.</li><li>Optimise backend queries and frontend rendering to handle large data sets without performance degradation.</li></ul></li><li>Security and Data Protection:<ul><li>Ensure all data displayed on the admin homepage is protected according to the latest security standards to prevent unauthorised access.</li><li>Sensitive data should be displayed only when necessary and should be masked or obfuscated as required.</li></ul></li><li>Error Handling and Feedback:<ul><li>Provide clear error messages and feedback for any failures or issues in data retrieval or during navigation.</li><li>Implement logging for errors that occur on the admin homepage to aid in troubleshooting and continuous improvement.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing including functional testing, usability testing, and security testing to ensure the homepage meets all specified requirements.</li><li>Validate that all elements are properly aligned, functional, and free from bugs.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to load data | "Failed to load data. Please refresh the page and try again." |
| --- | --- |
| Unauthorised access attempt | "You do not have permission to view this data." |
| --- | --- |
| Network or server error | "A network or server error occurred. Please try again later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Admin Homepage layout | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11620-7943&node-type=frame&t=CaKu7MoxTtcAmm7a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

**6.6.1.2 View activity table layout**

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Data fails to load | "Unable to load data. Please check your connection and try again." |
| --- | --- |
| Unauthorised access to detailed view | "You do not have permission to view this detail." |
| --- | --- |
| Search with no results | "No entries match your search. Try different keywords." |
| --- | --- |
| Filter application error | "Failed to apply filters. Please retry." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Admin homepage layout | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11004-1683&node-type=frame&t=YxxV4YeDU1a6kKN0-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.1.3 Search - view activity table

- The table will be searchable
- The user will be able to search by material name, packaging type, and locations (pickup/destination)

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Search Functionality Integration:<ul><li>The activity table must include a search feature that allows admins to quickly locate specific entries based on key attributes.</li><li>Ensure that the search function is prominently displayed and easily accessible at the top of the activity table.</li></ul></li><li>Searchable Fields:<ul><li>Admins must be able to search by:</li><li>Material Name: Input Type: Text; searches should match partial and full names.</li><li>Packaging Type: Input Type: Text or Dropdown selection; should match available packaging types.</li><li>Locations: Input Type: Text; allow searches for both pickup and destination locations.</li></ul></li><li>Dynamic Search Results:<ul><li>Search results should update dynamically as the admin types or selects filters, providing immediate feedback on the filtered results.</li><li>Ensure that searches are case-insensitive and allow partial matches to maximise usability.</li></ul></li><li>Performance and Efficiency:<ul><li>Searches should be executed efficiently to ensure quick response times, even with large datasets.</li><li>Implement backend optimizations like indexing on searchable fields to improve search performance.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear and immediate feedback when no results are found, e.g., "No results found for your search criteria."</li><li>Handle potential errors in search functionality gracefully, displaying user-friendly error messages, e.g., "Search could not be completed, please try again."</li></ul></li><li>Security and Data Protection:<ul><li>Ensure that all search queries are processed in a way that prevents injection attacks and that user data is protected.</li><li>Implement adequate security measures to protect sensitive data from unauthorised access during search operations.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the search functionality across different browsers and devices to ensure consistent performance and reliability.</li><li>Validate that the search function correctly filters and displays data based on the entered search criteria without errors.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| No results found | "No results found for your search criteria." |
| --- | --- |
| Search query too long | "Search query exceeds maximum character limit." |
| --- | --- |
| Invalid input | "Invalid input. Please check your entries and try again." |
| --- | --- |
| Server error during search | "Unable to complete the search due to a server error. Please try again later." |
| --- | --- |
| Unauthorised search attempt | "You do not have permission to perform this search." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11620-7943&node-type=frame&t=CaKu7MoxTtcAmm7a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.1.4 View purchases

- The table will show a list of the latest purchases when the purchases view is chosen
- The table will have the following columns
  - Date
  - Status
  - State
  - Buyer
    - Full name
    - Company
    - ID
    - Buyer location
  - Seller
    - Full name
    - Company
    - ID
    - Seller location
  - Material
  - Packaging
  - Amount (GBP)
    - Sales + haulage breakdown
  - View Details button
- The table will show the latest 20 listings

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Setup and Data Display:<ul><li>Ensure the table is prominently displayed under the 'Purchases' tab within the activity table layout.</li><li>The table should automatically load the latest 20 listings upon selection of the purchases view.</li></ul></li><li>Column Configuration:<ul><li>The table must include the following columns with appropriate headers:<ul><li>Date: Format should be DD/MM/YYYY.</li><li>Status: Text; should clearly describe the current status (e.g., Pending, Completed).</li><li>State: Text; describes the processing stage of the purchase.</li><li>Buyer Full Name: Text; full name of the buyer.</li><li>Buyer Company: Text.</li><li>Buyer ID: Text; unique identifier for the buyer.</li><li>Buyer Location: Text; geographical location.</li><li>Seller Full Name: Text.</li><li>Seller Company: Text.</li><li>Seller ID: Text; unique identifier for the seller.</li><li>Seller Location: Text.</li><li>Material: Text; type of material purchased.</li><li>Packaging: Text; description of the packaging type.</li><li>Amount (GBP): Numeric; total amount, formatted as currency.</li><li>Sales + Haulage Breakdown: Text; detailed breakdown of costs.</li></ul></li></ul></li><li>Sorting and Filtering:<ul><li>Enable sorting capabilities for each column where applicable to help admins manage and review entries efficiently.</li><li>Include filtering options to allow admins to refine the data displayed based on specific criteria like date, status, buyer, or seller.</li></ul></li><li>Performance and Load Times:<ul><li>Ensure that the data loads quickly and efficiently, implementing back-end optimizations as necessary to handle potential large data sets.</li></ul></li><li>Security and Data Integrity:<ul><li>Ensure all data handling follows the platform’s security protocols to prevent unauthorised access or data breaches.</li><li>Sensitive data should be masked or hidden where appropriate.</li></ul></li><li>Error Handling and Feedback:<ul><li>Provide clear error messages for failures in data loading or operations within the table.</li><li>Display a user-friendly message if there are no transactions to show, e.g., "No purchases are currently available for display."</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed to load data | "Failed to load purchase data. Please try refreshing the page." |
| --- | --- |
| Unauthorised access | "You do not have the necessary permissions to view this data." |
| --- | --- |
| Data exceeds limits | "Data input exceeds allowed limits. Please adjust and try again." |
| --- | --- |
| Invalid data input | "Invalid data input detected. Please check your entries." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Purchases table | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11620-7943&node-type=frame&t=CaKu7MoxTtcAmm7a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.1.5 Filter - view purchases

- The table will be filterable
- The user will be able to filter on the following parameters
  - Buyer - Company
  - Seller - Company
  - Material
  - Location (buyer/seller)
  - Packaging
  - Status
  - State
  - Sort By

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Filter Implementation:<ul><li>Implement a filtering system that allows admins to refine the purchases displayed in the table based on specified criteria.</li><li>Filters should be easily accessible, intuitive to use, and clearly labelled on the user interface.</li></ul></li><li>Filter Options:<ul><li>Ensure that the following filter parameters are available and functioning:</li><li>Buyer - Company: Filter by the company name of the buyer.</li><li>Seller - Company: Filter by the company name of the seller.</li><li>Material: Allow filtering based on the type of material involved in the transaction.</li><li>Location: Provide options to filter by either the buyer’s or seller’s location.</li><li>Packaging: Enable filtering by the type of packaging used.</li><li>Status: Filter by the current status of the purchase (e.g., Pending, Completed).</li><li>State: Filter by the state of the purchase (e.g., Processing, Shipped).</li><li>Sort by: Filter with dropdown menu</li></ul></li><li>Dynamic Filtering:<ul><li>The filter should dynamically update the table as selections are made, without the need for a page reload.</li><li>Filters should allow for multiple selections to enable complex searches that can combine different parameters.</li></ul></li><li>Reset and Clear Filters:<ul><li>Include an option to easily reset or clear all filters to return to the unfiltered view of the purchases.</li><li>Ensure this reset button is prominently displayed and clearly labelled.</li></ul></li><li>Performance:<ul><li>Filters must apply quickly to the dataset without causing significant delays or requiring extensive loading times.</li><li>Optimise backend queries to handle filtering efficiently, especially with large datasets.</li></ul></li><li>Error Handling:<ul><li>Provide user-friendly error messages if filters fail to apply or if there are issues retrieving filtered data.</li><li>Error messages should guide users on how to resolve issues or suggest they try different filter options.</li></ul></li><li>Testing and Validation:<ul><li>Rigorously test the filter functionality across different browsers and devices to ensure consistent behaviour and performance.</li><li>Include tests for edge cases, such as filtering by non-existent company names or materials.</li></ul></li></ul></th></tr></thead></table>

| **Use Case** | **Error Message** |
| --- | --- |
| Filter function fails | "Failed to apply filters. Please try again." |
| --- | --- |
| No results found after filtering | "No purchases match your filter criteria." |
| --- | --- |
| Invalid input in any filter field | "Invalid input detected. Please check your entries." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | [https://www.figma.com/design/Py0yzYKckJDBvSryfHKVBc/WT---Platform-(Copy)?node-id=11798-42958&t=sis0UAs0vdcT26G8-0](https://www.figma.com/design/Py0yzYKckJDBvSryfHKVBc/WT---Platform-%28Copy%29?node-id=11798-42958&t=sis0UAs0vdcT26G8-0) |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.1.6 View listings

- The table will list the latest listings when the listings view is chosen
- The table will have the following columns
  - Date Listed
  - Date available from
  - Status\[ Pending / Available \]
  - State
  - Seller
    - Full name
    - Company
    - ID
  - Seller location
  - Material
  - Weight
  - Best offer
  - Number of offers
  - Remaining loads
  - View Details
- The table will show the latest 20 listings

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Presentation:<ul><li>Implement a table on the admin platform to display the latest listings.</li><li>The table must automatically refresh or provide an option to manually refresh to ensure it shows the most current data.</li></ul></li><li>Table Columns:<ul><li>Ensure the table includes the following columns with correct data types and formatting:<ul><li>Date Listed: Display the date the listing was created (DD/MM/YYYY).</li><li>Date Available From: Show the date from which the material is available (DD/MM/YYYY).</li><li>Status: Include the current status of the listing (e.g., Available, Pending).</li><li>State: Display the state of the listing (e.g., Available, Sold Out).</li><li>Seller Full Name: The full name of the seller.</li><li>Seller Company: The name of the seller's company.</li><li>Seller ID: A unique identifier for the seller.</li><li>Seller Location: The geographical location of the seller.</li><li>Material: The type of material being listed.</li><li>Weight: The weight of the material listed.</li><li>Best Offer: The highest offer made for the listing.</li><li>Number of Offers: Total offers made on that listing.</li><li>Remaining Loads: Loads left for sale.</li><li>View Details: Opens up the listing for additional details</li></ul></li></ul></li><li>Dynamic Loading:<ul><li>The table should load the latest 20 listings by default.</li><li>Include pagination or a scrolling feature to view more entries if there are more than 20 listings.</li></ul></li><li>Filtering and Sorting:<ul><li>Provide filtering options based on each column to allow admins to customise the view according to specific criteria like material type, seller location, etc.</li></ul></li><li>Interactivity:<ul><li>Clicking on a row in the table should open a detailed view of that particular listing, providing more in-depth information.</li><li>Ensure that the details page is linked directly through each row for easy access.</li></ul></li><li>Error Handling:<ul><li>Display user-friendly error messages if the table fails to load or if data cannot be retrieved.</li><li>Ensure all error messages are consistent in style and terminology with the rest of the admin platform.</li></ul></li><li>Performance:<ul><li>Optimise backend queries to ensure the table loads quickly even when filtering, sorting, or accessing higher volumes of data.</li><li>Regularly test the load time and responsiveness of the table as part of ongoing maintenance.</li></ul></li><li>Security and Access Control:<ul><li>Ensure that only authorised personnel can view and interact with the listings table.</li><li>Implement security measures to prevent unauthorised access or manipulation of the data.</li></ul></li><li>Compliance with UI/UX Design:<ul><li>The table's design and functionality should align with the overall user interface and experience guidelines of the admin platform.</li><li>Maintain visual consistency in typography, colours, and layout with other parts of the platform.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Table fails to load | "Failed to load listings. Please refresh the page to try again." |
| --- | --- |
| No listings found | "No listings found. Adjust your filters or check back later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Listing table | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11620-12129&node-type=frame&t=CaKu7MoxTtcAmm7a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.6.1.7 Filter - view listings

- The table will be filterable
- The user will be able to filter on the following parameters
  - Seller - Company
  - Material
  - Location (buyer/seller)
  - Status
  - State
  - Sort By

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Implementation of Filters:<ul><li>Implement a filtering system on the listings table that allows users to refine the displayed listings based on specific criteria.</li><li>Filters must be user-friendly, clearly labelled, and easily accessible on the interface.</li></ul></li><li>Filter Parameters:<ul><li>Ensure the following filter parameters are available and fully functional:<ul><li>Seller - Company: Allows filtering listings based on the seller’s company name.</li><li>Material: Enables filtering based on the type of material listed.</li><li>Location: Provides options to filter by either the buyer’s or seller’s location.</li><li>Status: Filter listings based on their current status (e.g., Active, Pending, Closed).</li><li>State: Allows filtering based on the state of the listing (e.g., Available, Sold Out).</li><li>Sort By: Allows filtering for Available Listings and Unavailable listings</li></ul></li></ul></li><li>Dynamic Filtering:<ul><li>Filters should apply dynamically to the table without the need for page reloading.</li><li>Support multiple filter combinations to enable detailed and specific searches.</li></ul></li><li>Filter Interaction:<ul><li>Each filter should include intuitive interfaces, such as dropdowns for single selections and checkboxes or toggle switches for enabling/disabling features.</li><li>Provide a clear method to reset all filters to their default states with a single action.</li></ul></li><li>Performance:<ul><li>Ensure that applying filters does not significantly degrade performance or speed of the listings table.</li><li>Backend queries must be optimised to handle filter operations efficiently, especially when dealing with large data sets.</li></ul></li><li>Error Handling:<ul><li>Display informative and user-friendly error messages if filters fail to apply or if data retrieval issues occur.</li><li>Error messages should guide the user on how to resolve the issue or suggest alternative actions.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the filter functionality to ensure it works correctly across all specified parameters.</li><li>Include scenario testing to cover all possible combinations of filters to validate system robustness.</li></ul></li><li>Integration with Existing Features:<ul><li>Ensure that the new filtering system integrates seamlessly with existing table functionalities such as sorting and pagination.</li><li>Consistency in UI/UX with other parts of the platform to maintain a unified look and feel.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Filter application fails | "Unable to apply filters. Please check your selections and try again." |
| --- | --- |
| No results after filtering | "No listings match the selected filters. Please adjust your criteria." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Filter listings | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11620-12129&node-type=frame&t=CaKu7MoxTtcAmm7a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.1.8 View wanted listings

- The table will list the latest wanted listings when the wanted listings view is chosen
- The table will have the following columns
  - Date of Listing
  - Date required from
  - Status
  - State
  - Buyer
    - Full name
    - Company
    - ID
    - Buyer Location
  - Location (country)
  - Material required
  - Quantity required
  - Packaging
  - Storage
- The table will show the latest 20 listings

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Implementation:<ul><li>Integrate a table on the admin portal specifically for viewing the latest wanted listings.</li><li>Ensure the table is positioned prominently and is easily accessible from the wanted listings view.</li></ul></li><li>Table Columns:<ul><li>The table must include the following columns, ensuring each column accurately displays the corresponding data:<ul><li>Date of Listing: Show when the listing was posted (format: DD/MM/YYYY).</li><li>Date Required From: Display the date from which the material is needed (format: DD/MM/YYYY).</li><li>Status: Indicate the current status of the listing (e.g., Open, Pending, Closed).</li><li>State: Show the operational state of the listing (e.g., Active, Fulfilled).</li><li>Buyer Full Name: Display the full name of the buyer.</li><li>Buyer Company: Indicate the company name of the buyer.</li><li>Buyer ID: A unique identifier for the buyer.</li><li>Buyer Location: Location of seller</li><li>Location (Country): The country of the buyer.</li><li>Material Required: Type of material that is wanted.</li><li>Quantity Required: Amount of material required.</li><li>Packaging: Type of packaging specified.</li><li>Storage: Storage conditions or requirements.</li></ul></li></ul></li><li>Dynamic Loading and Pagination:<ul><li>Implement dynamic loading to automatically update the table with the latest listings.</li><li>The table should initially display the most recent 20 listings.</li><li>Include pagination or "Load more" functionality to view additional listings beyond the initial set.</li></ul></li><li>Interactivity:<ul><li>Clicking on a row should open a detailed view of that specific wanted listing, providing further details and possible actions (e.g., edit, close, or delete the listing).</li></ul></li><li>Filtering and Sorting:<ul><li>Provide filtering options that align with the columns (e.g., by material, status, date).</li><li>Enable sorting for each column to allow the admin to reorder the data based on their preference (ascending/descending).</li></ul></li><li>Performance and Optimization:<ul><li>Ensure the table's performance is optimised for quick loading and smooth interactions, even with large datasets.</li><li>Regular backend optimization and testing should be conducted to maintain performance standards.</li></ul></li><li>Error Handling:<ul><li>Implement user-friendly error messages for scenarios where data fails to load or when an unexpected backend error occurs.</li><li>Ensure error messages are helpful and guide the user on the next steps or encourage them to retry the action.</li></ul></li><li>Security and Compliance:<ul><li>Verify that only authorised users can access and interact with the wanted listings.</li><li>Implement standard security measures to protect data integrity and prevent unauthorised access.</li></ul></li><li>Consistency in Design:<ul><li>Ensure that the design and user interface of the table are consistent with the overall aesthetics and usability principles of the admin portal.</li><li>Maintain uniformity in typography, colours, and layout styles across all tables and views within the platform.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed to load data | "Failed to load listings. Please try refreshing the page." |
| --- | --- |
| No data matches filters | "No listings match your filters. Adjust your filters or check back later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Wanted listing table | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11620-13518&node-type=frame&t=CaKu7MoxTtcAmm7a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.1.9 Filter - view wanted

- The table will be filterable
- The user will be able to filter on the following parameters
  - Date required from (set range)
  - Buyer
  - Company
  - Material
  - Location (buyer/seller)
  - Status
  - State
  - Sort By

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Filter Implementation:<ul><li>Implement a dynamic filter system on the wanted listings table that allows users to refine results based on specific criteria without page reloading.</li><li>Ensure the filter interface is intuitive and accessible from the main interface of the wanted listings view.</li></ul></li><li>Filter Parameters:<ul><li>Provide filtering capabilities based on the following criteria:<ul><li>Date Required From: Allow users to set a range of dates using a date picker to filter listings.</li><li>Buyer: Enable filtering by the name of the buyer.</li><li>Company: Allow filtering by the company name associated with the buyer.</li><li>Material: Permit users to filter listings based on the material type requested.</li><li>Location (Buyer/Seller): Provide options to filter by the location of either the buyer or the seller.</li><li>Status: Enable filtering based on the status of the listing (e.g., Active, Pending, Closed).</li><li>State: Allow filtering based on the state of the listing (e.g., Fulfilled, Unfulfilled).</li><li>Sort by: Filter with dropdown menu</li></ul></li></ul></li><li>Filter Usability:<ul><li>Each filter should offer a clear method to apply or reset selections.</li><li>Filters should be easy to use and allow for quick adjustments to view different data sets.</li></ul></li><li>Performance and Loading:<ul><li>Ensure that filter operations are efficient and do not degrade the performance of the listings view.</li><li>Test filter performance to handle large data sets without significant delays.</li></ul></li><li>Error Handling:<ul><li>Provide clear, informative error messages if filters fail to apply or when unexpected issues arise.</li><li>Error messages should guide the user on how to resolve the issue or suggest alternative actions.</li></ul></li><li>Integration and Testing:<ul><li>Ensure that the filtering system integrates seamlessly with existing table functionalities like sorting and pagination.</li><li>Conduct thorough testing to confirm that all filters work as expected across various scenarios and user inputs.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Filter application fails | "Failed to apply filters. Please check your selections." |
| --- | --- |
| No results found for the selected filters | "No listings found. Adjust your filters to expand your search." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Filter - view wanted | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11620-13518&node-type=frame&t=CaKu7MoxTtcAmm7a-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.1.10 View haulage bids

- ~~The table will list the latest haulage bids when the haulage view is chosen~~
- ~~The table will have the following columns~~
  - ~~Bid date~~
  - ~~Buyer~~
    - ~~Name~~
    - ~~Company name~~
    - ~~Location~~
    - ~~Desired delivery date~~
  - ~~Seller~~
    - ~~Name~~
    - ~~Company name~~
    - ~~Location~~
  - ~~Material~~
  - ~~Quantity/Loads~~
  - ~~Amount (per load)/Haulage total~~
  - ~~Status~~
  - ~~State~~
- ~~The table will show the latest 20 listings~~

#### 6.6.1.11 Filter - view haulage bids

- The table will be filterable
- The user will be able to filter on the following parameters
  - Date (bid/desired delivery date)
  - Material
  - Buyer
    - Company name
    - Location
  - Seller
    - Company name
    - Location
  - State
  - ~~Status~~

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Filter Functionality Implementation:<ul><li>Implement a robust filtering mechanism on the haulage bids table, allowing users to refine the displayed data based on specific attributes.</li><li>Ensure the filtering system is intuitive, easily accessible from the haulage bids table interface, and compatible with desktop and mobile views.</li></ul></li><li>Filter Parameters:<ul><li>The filter system must include the following parameters:<ul><li>Buyer: Filter by the name of the buyer.</li><li>Date (Bid/Desired Delivery Date): Utilise a date range picker to allow users to select and filter bids based on when the bid was made or the desired delivery date.</li><li>Material: Enable filtering by the type of material involved in the bid.</li><li>Buyer Company Name: Allow filtering based on the company name of the buyer.</li><li>Buyer Location: Filter by the geographic location of the buyer.</li><li>Seller Company Name: Enable filtering based on the seller’s company name.</li><li>Seller Location: Filter by the geographic location of the seller.</li><li>State: Include options such as 'Pending', 'Completed', 'Cancelled', etc.</li><li>Status: Filter by the status of the haulage bid, such as 'Active', 'Under Review', 'Approved'.</li></ul></li></ul></li><li>Performance and Efficiency:<ul><li>Ensure that applying filters retrieves data efficiently without causing significant delays or requiring page reloads.</li><li>Implement backend optimizations to handle filter operations effectively, especially when handling large datasets.</li></ul></li><li>Error Handling:<ul><li>Provide clear, instructive error messages for situations where filters fail to apply or when data fails to load due to filter criteria.</li><li>Error messages should guide users on how to rectify issues or suggest alternative actions.</li></ul></li><li>Security and Access Control:<ul><li>Verify that filtering capabilities are only available to users with the necessary permissions to view and manage haulage bids.</li><li>Ensure all data interactions through filters comply with data protection regulations to prevent unauthorised data exposure.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all filters work as expected across different user scenarios and data types.</li><li>Validate filter combinations to ensure they return accurate results without conflicts or unintended behaviour.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Filter application fails | Failed to apply filters. Please check your selections. |
| --- | --- |
| No results found for the selected filters | No haulage bids found. Adjust your filters to expand your search. |
| --- | --- |
| Invalid input in filter fields | Invalid input detected. Please correct your entries. |
| --- | --- |
| Unauthorised access to filter certain data | You do not have permission to filter this data. Contact support if you think this is an error. |
| --- | --- |
| Network or system error during filtering | A system error occurred while applying filters. Please try again later. |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

### 6.6.2 Commercial management

From approving new members to requesting more information on a particular bid, the admin team will be able to use this module to manage and monitor the commercial activity on the WasteTrade Platform.

#### 6.6.2.1 Commercial Management Layout

- There will be a [header](#_vqslxpp5r867)
- The section will have a sub-menu
- There will be a breadcrumb element visible on all pages

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Side-bar Requirements:<ul><li>The side-bar must be present on the top of the commercial management section.</li><li>The side-bar should contain the site logo, navigation links, and a search bar.</li><li>The side-bar should be consistent with the overall site design in terms of colours and typography.</li></ul></li><li>Sub-Menu Specifications:<ul><li>The sub-menu must be located below the header.<ul><li>It should provide easy navigation between different commercial management pages.</li><li>The sub-menu items must include:<ul><li>New Members</li><li>Trading</li><li>Sellers</li><li>Buyers</li><li>Hauliers</li></ul></li><li>Each sub-menu item should be clickable and redirect to the respective page.</li></ul></li></ul></li><li>Colour Coded Elements:<ul><li>Each tab should dynamically change color based on the presence of new actions within that section.<ul><li>Green: No new actions or pending updates.</li><li>Red: New actions or pending updates require admin attention.</li></ul></li><li>The system should automatically check for updates and adjust the tab colors in real time.</li><li>A visual indicator (e.g., a small badge showing the number of new items) may be added to enhance visibility.</li></ul></li><li>Breadcrumb Element:<ul><li>A breadcrumb element must be visible on all pages within the commercial management section.</li><li>The breadcrumb should reflect the user's navigation path.</li><li>The breadcrumb should be interactive, allowing users to click on previous steps to navigate back.</li><li>The design of the breadcrumb should be consistent with the site's overall style.</li></ul></li><li>Layout Consistency:<ul><li>The layout should be responsive and adjust seamlessly across different device types (desktop, tablet, mobile).</li><li>All elements (side-bar, sub-menu, breadcrumb) must be aligned properly and aesthetically pleasing.</li></ul></li><li>Testing:<ul><li>The layout must be tested across different browsers (Chrome, Firefox, Safari, Edge).</li><li>It should also be tested on different devices to ensure responsive design.</li></ul></li><li>Error Handling:<ul><li>If the side-bar, sub-menu, or breadcrumb fails to load, the system should display an appropriate error message.</li><li>The user should be able to refresh the page or navigate back to the homepage if an error occurs.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Header fails to load | "Header could not be loaded. Please refresh the page." |
| --- | --- |
| Sub-menu fails to load | "Sub-menu could not be loaded. Please try again later." |
| --- | --- |
| Breadcrumb fails to load | "Breadcrumb navigation is unavailable. Please use the main menu." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-21377&node-type=frame&t=5WHnYFW9j7b57b6S-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.2 Sub-menu - commercial

- The section will have a sub-menu
- The menu will have the following items
  - New members
  - Trading
    - Sellers
    - Buyers (purchases and wanted listings)
  - Hauliers

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Sub-menu Layout:<ul><li>The sub-menu must be located to the right of the main header of the commercial management section.</li><li>The sub-menu should be horizontally aligned and fully visible on the screen without needing to scroll.</li><li>Each menu item must be clearly labelled and clickable.</li></ul></li><li>Sub-menu Items:<ul><li>The sub-menu will include the following items:<ul><li>New Members</li><li>Trading</li><li>Sellers</li><li>Buyers (Purchases and Wanted Listings)</li><li>Hauliers</li></ul></li><li>Each item must lead to its respective page when clicked.</li><li>The design should highlight the active menu item, indicating the current section the user is viewing.</li></ul></li><li>Navigation Functionality:<ul><li>Clicking on a sub-menu item should instantly redirect the user to the respective section without page reload.</li><li>The transition between sections should be smooth, with no lag or delay.</li><li>The breadcrumb navigation must be updated to reflect the selected sub-menu item.</li></ul></li><li>Testing:<ul><li>The sub-menu must be tested across different browsers (Chrome, Firefox, Safari, Edge).</li><li>It should also be tested on different devices to ensure responsive design.</li></ul></li><li>Error Handling:<ul><li>If a sub-menu item fails to load, the system should display an appropriate error message.</li><li>The user should be able to refresh the page or navigate back to the homepage if an error occurs.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Sub-menu item fails to load | "Failed to load the selected section. Please try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-21377&node-type=frame&t=5WHnYFW9j7b57b6S-0> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.3 New members table

- This table will show the admin user a summary of the latest users signing up to the platform
- The table will always be in reverse chronological order (latest first) unless filtered otherwise
- The menu will have the following items
  - Full Name of the account owner
  - Account type
    - Buyer
    - Seller
    - Dual (both)
  - Date of registration
  - Company name
  - Location
  - Overall status
    - Awaiting approval
    - In progress
  - Registration status
    - Complete
    - In progress
  - Onboarding status
    - Company information complete/in progress
    - Company documents added/in progress
    - Site location added/in progress
- The user will be able to click on any row to open the “account file” to take action
- There will be no pagination, the table will operate a lazy load on scroll

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Structure:<ul><li>The table must display the following columns:<ul><li>Full Name of the account owner</li><li>Account Type (Buyer, Seller, Dual (both))</li><li>Date of Registration</li><li>Company Name</li><li>Location</li><li>Overall Status (Awaiting approval, In progress)</li><li>Registration Status (Complete, In progress)</li><li>Onboarding Status (Company information complete/in progress, Company documents added/in progress, Site location added/in progress)</li></ul></li><li>The table will always be sorted in reverse chronological order (latest first) by default.</li></ul></li><li>Data Display:<ul><li>Each row in the table must represent a unique user account.</li><li>All data fields must be accurately displayed as per the latest database entries.</li></ul></li><li>Interactivity:<ul><li>Clicking on any row will open the detailed “account file” for that user.</li><li>The table must support lazy loading, automatically loading more rows as the user scrolls down.</li></ul></li><li>Filtering and Sorting:<ul><li>Users must be able to filter the table based on any column header.</li><li>The default sorting is reverse chronological order, but users should be able to sort by other columns as needed.</li></ul></li><li>User Experience:<ul><li>The table must be responsive and should adjust to different screen sizes without losing functionality.</li><li>The layout must ensure that all columns are visible without excessive scrolling, especially on desktop views.</li></ul></li><li>Status Indicators:<ul><li>The “Overall Status”, “Registration Status”, and “Onboarding Status” columns must use colour indicators to quickly convey the status (e.g., green for complete, yellow for in progress, red for awaiting approval).</li></ul></li><li>Error Handling:<ul><li>If there is an issue loading the table data, an appropriate error message should be displayed: "Unable to load new members data. Please try again."</li><li>The table should gracefully handle any missing or incomplete data without crashing.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Issue loading new members data | Unable to load new members data. Please try again. |
| --- | --- |
| Clicking on a row fails to open account file | Unable to open the account file. Please try again later. |
| --- | --- |
| Filtering or sorting operation fails | Filtering/sorting operation failed. Please try again later. |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| New members table | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-21377&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.4 Search - new members table

- ~~The user will be able to search the “new members table”~~
- ~~The user will be able to search the table by Name, Company Name, Account type~~

#### 6.6.2.5 Filter - new members table

- ~~The user will be able to filter the “new members table”~~
- ~~The user will be able to filter on the following parameters~~
  - ~~Date of registration - set range~~
  - ~~Account type~~
  - ~~Status~~
    - ~~Overall~~
    - ~~Registration~~
    - ~~Onboarding~~

#### 6.6.2.6 Member - account file

- The admin user will have full access to a member’s profile
- The user will be able to view the following sections
  - [Profile](#_w9ay92y161k)
  - [Company Information](#_ypaq7pkrtwmx)
  - [Material preferences](#_h8e5ghwazmfx)
  - [Company documents](#_cadc0c33rg)
  - [Locations](#_6u4bdhomw2hp)
  - Messages
- The user will be able to see a preview of any files uploaded
- The user will be able to download any files uploaded

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Profile Access:<ul><li>The admin user will have full access to a member’s profile.</li><li>The profile will include the following sections:<ul><li>Profile</li><li>Company Information</li><li>Material Preferences</li><li>Company Documents</li><li>Locations</li><li>Messages</li></ul></li></ul></li><li>Profile Section:<ul><li>This section will display personal details of the member, including:<ul><li>Full Name</li><li>Email Address</li><li>Telephone Number</li><li>Account Type (Buyer, Seller, Dual)</li></ul></li></ul></li><li>Company Information Section:<ul><li>This section will display company details, including:<ul><li>Company Name</li><li>Company Type</li><li>VAT Registration Number</li><li>Company Registration Number</li><li>Business Address (Street, City, County/State/Region, Postal Code, Country)</li><li>Company Contact Information (Email, Telephone)</li></ul></li></ul></li><li>Material Preferences Section:<ul><li>This section will display the materials the member is interested in, segmented into categories such as:<ul><li>Plastics</li><li>Fibres</li><li>Rubber</li><li>Metal</li></ul></li></ul></li><li>Company Documents Section:<ul><li>This section will display uploaded company documents, including:<ul><li>Environmental Permit</li><li>Waste Exemptions</li><li>Waste Carriers Licence</li><li>Any other relevant documents</li></ul></li><li>The user will be able to see a preview of any files uploaded.</li><li>The user will be able to download any files uploaded.</li></ul></li><li>Locations Section:<ul><li>This section will display all locations associated with the member’s account, including:<ul><li>Site Name</li><li>Street Address</li><li>City</li><li>County/State/Region</li><li>Postal Code</li><li>Country</li><li>Contact Person</li><li>On-site facilities (Loading Ramp, Weighbridge, etc.)</li><li>List of accepted materials</li></ul></li><li>The user will be able to click on any location to see detailed information.</li></ul></li><li>Messages Section:<ul><li>This section will display all messages exchanged with the member, including:</li><li>Date and time of the message</li><li>Sender and receiver details</li><li>Message content</li><li>The user will be able to view and download any attachments included in the messages.</li></ul></li><li>File Preview and Download:<ul><li>The user will be able to see a preview of any files uploaded in the Company Documents and Messages sections.</li><li>The user will be able to download any files uploaded in these sections.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Issue loading member profile data | Unable to load member profile data. Please try again. |
| --- | --- |
| Downloading a file fails | Unable to download the file. Please try again later. |
| --- | --- |
| Failed document upload | "Document upload failed. Please check the file size and format and try again." |
| --- | --- |
| Filtering or sorting operation fails | Filtering/sorting operation failed. Please try again later. |
| --- | --- |
| Saving edits to profile data fails | Unable to save changes. Please check the information and try again. |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Account file | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-21384&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

####

#### 6.6.2.7 Member approval - approval actions

- The following actions will be available through the account file
  - The user will be able to approve the application
  - The user will be able to reject the application
    - Pre-set list of reasons (to be defined within the AC): The admin will be required to choose a reasons that can be shared
    - These options are presented as a list of 5 options. These are:
      - Incomplete documentation, Invalid Company Registration, Duplicate account, Unverified contact information, Other (admin to provide a custom reason)
      - An email will be sent to the applicant
  - The user will be able to indicate if more information is required
    - The user will be able to send a message that will be sent to the applicant’s email address and will also be visible in the notifications panel on the user’s side

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Approval Action:<ul><li>The admin user will be able to approve a member's application directly from the account file.</li><li>Upon approval, the system will automatically send an email to the applicant notifying them of their account approval.</li><li>The account status will be updated to “Verified” in the system.</li></ul></li><li>Rejection Action:<ul><li>The admin user will be able to reject a member's application directly from the account file.</li><li>The system will present the admin with a pre-set list of reasons for rejection:<ul><li>Incomplete documentation</li><li>Invalid company registration</li><li>Duplicate account</li><li>Unverified contact information</li><li>Other (admin to provide a custom reason)</li><li>The admin must select a reason for rejection or provide a custom reason if “Other” is chosen.</li></ul></li><li>An email will be sent to the applicant detailing the reason for rejection.</li><li>The account status will be “Unverified” in the system.</li></ul></li><li>Request for More Information:<ul><li>The admin user will be able to request more information from the applicant directly from the account file.</li><li>The system will allow the admin to select from a pre-set list of information requests or provide a custom message:<ul><li>Additional company documentation required</li><li>Clarification on provided details</li><li>Update on business address</li><li>Other (admin to provide a custom request)</li></ul></li><li>An email will be sent to the applicant requesting the additional information.</li><li>The request will also appear in the applicant’s notifications panel on their side of the platform.</li><li>The account status will be updated to “Pending - More Information Required” in the system.</li></ul></li><li>Send Message:<ul><li>The admin user will be able to send a message to the applicant directly from the account file.</li><li>The message will be sent to the applicant’s email address and will also be visible in the notifications panel on the user’s side.</li><li>The admin will have the option to use a pre-set message or write a custom message.</li></ul></li><li>Pre-set messages might include:<ul><li>Welcome to WasteTrade! Please complete your profile.</li><li>Your application is under review. Please be patient.</li><li>We need additional information to complete your application.</li><li>Other (admin to provide a custom message)</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to approve application | Unable to approve the application. Please try again. |
| --- | --- |
| Failure to reject application | Unable to reject the application. Please try again. |
| --- | --- |
| Rejection reason not provided | Please select a reason for rejection. |
| --- | --- |
| Failure to request more information | Unable to request more information. Please try again. |
| --- | --- |
| Information request reason not provided | Please select a reason for requesting more information. |
| --- | --- |
| Failure to send message | Unable to send the message. Please try again. |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Member approval - approval actions | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-21713&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.8 View all buyer activity

- There will be a table to view all buyer activity
- The table will be as defined in [View Purchases](#_rouf0iikra78)
- The user will be able to [filter the purchases](#_jaw51010o43n)
- The table will have pagination
- Clicking on any row will lead the user to the details page

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Structure:<ul><li>The table will display all buyer activity, structured similarly to the “View Purchases” table.</li><li>The table will have the following columns:<ul><li>Date</li><li>Status</li><li>State</li><li>Buyer</li><li>Full name</li><li>Company</li><li>Buyer ID</li><li>Buyer location</li><li>Seller</li><li>Full name</li><li>Company</li><li>Seller ID</li><li>Seller location</li><li>Material</li><li>Packaging</li><li>Amount (GBP)</li></ul></li></ul></li><li>Filtering:<ul><li>The user will be able to filter the table based on the following parameters:<ul><li>Buyer (Full name, Company)</li><li>Seller (Full name, Company)</li><li>Material</li><li>Location (buyer/seller)</li><li>Packaging</li><li>Status</li><li>State</li><li>Sort By</li></ul></li></ul></li><li>Pagination:<ul><li>The table will have pagination to navigate through multiple pages of buyer activity.</li></ul></li><li>Details Page Navigation:<ul><li>Clicking on any row in the table will lead the user to a detailed view of the specific buyer activity.</li><li>The detailed view will provide comprehensive information regarding the selected activity, including all fields listed in the table and additional context or related actions.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
|     |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Invalid Date Format | Please enter the date in DD/MM/YYYY format. |
| --- | --- |
| Empty Mandatory Field | This field is required. |
| --- | --- |
| Invalid Status | The status entered is invalid. |
| --- | --- |
| Invalid State | The state entered is invalid. |
| --- | --- |
| Invalid Buyer Full Name | Buyer’s full name must contain only alphabetic characters. |
| --- | --- |
| Invalid Buyer Company | Buyer’s company name must be alphanumeric. |
| --- | --- |
| Invalid Buyer ID | Buyer’s ID must be alphanumeric. |
| --- | --- |
| Invalid Buyer Location | Buyer’s location must contain only alphabetic characters. |
| --- | --- |
| Invalid Seller Full Name | Seller’s full name must contain only alphabetic characters. |
| --- | --- |
| Invalid Seller Company | Seller’s company name must be alphanumeric. |
| --- | --- |
| Invalid Seller ID | Seller’s ID must be alphanumeric. |
| --- | --- |
| Invalid Seller Location | Seller’s location must contain only alphabetic characters. |
| --- | --- |
| Invalid Material | Material name must be alphanumeric. |
| --- | --- |
| Invalid Packaging | Packaging details must be alphanumeric. |
| --- | --- |
| Invalid Amount | Amount must be a valid number. |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| View all buyer activities | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-22160&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.6.2.9.1 View details for a bid (buyer activity)

- The Admin user will be able to see the following information about each bid (buyer activity)
- The page will show the following information
  - Buyer
    - Full name
    - Company
  - Seller
    - Full name
    - Company
  - Bid Details
    - Material name
    - Pick up location
    - Destination
    - Packaging
    - No. of loads
    - Weight per load
    - Bid currency
    - Price per tonne
    - Incoterms
    - Bid status
    - Approved
      - Haulage in progress
      - Total price shared
    - Rejected
    - Pending
- ~~Admin communications~~
  - ~~The user will be able to see a trail of messages between the buyer and themselves (WasteTrade team)~~
  - ~~Any~~ [~~requests for information~~](#_4cvwu7goe2va) ~~regarding listings from buyers will be sent to the Admin team within the chat~~

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Page Layout:<ul><li>The page will display comprehensive details for each bid related to buyer activity.</li><li>Information will be displayed in a clear, structured format with the following sections:<ul><li>Buyer Information</li><li>Seller Information</li><li>Bid Details</li><li>Admin Communications</li></ul></li><li>Three buttons at the bottom of the table<ul><li>Approve</li><li>Reject</li><li>Mark as Haulage</li></ul></li></ul></li><li>Buyer Information:<ul><li>The page will show the following details about the buyer:<ul><li>Full Name: Text, Mandatory</li><li>Company: Text, Mandatory</li></ul></li></ul></li><li>Seller Information:<ul><li>The page will show the following details about the seller:<ul><li>Full Name: Text, Mandatory</li><li>Company: Text, Mandatory</li></ul></li></ul></li><li>Bid Details:<ul><li>The page will display the following bid details:<ul><li>Material Name: Text, Mandatory</li><li>Pick-up Location: Text, Mandatory</li><li>Destination: Text, Mandatory</li><li>Packaging: Text, Mandatory</li><li>Number of Loads: Numeric, Mandatory</li><li>Weight per Load: Numeric, Mandatory</li><li>Bid Currency: Dropdown, Mandatory</li><li>Price per Tonne: Numeric, Mandatory</li><li>Incoterms: Dropdown, Mandatory.</li><li>Bid Status: Dropdown, Mandatory; Values: Approved, Haulage in Progress, Rejected, Pending</li><li>Total Price Shared: Numeric, Mandatory</li></ul></li></ul></li><li>Admin Communications:<ul><li>The page will display a message trail between the admin user and the buyer.</li><li>The message trail will include all communications regarding the bid, including any requests for information.</li><li>Each message will be time stamped and show the sender's name (buyer or admin).</li></ul></li><li>Actions:<ul><li>The admin user will be able to:<ul><li>Approve the bid</li><li>Reject the bid</li><li>Mark the bid as haulage in progress</li><li>Send messages to the buyer through the chat interface on the page</li></ul></li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Invalid Buyer Full Name | Please enter a valid full name for the buyer. |
| --- | --- |
| Invalid Buyer Company | Please enter a valid company name for the buyer. |
| --- | --- |
| Invalid Seller Full Name | Please enter a valid full name for the seller. |
| --- | --- |
| Invalid Seller Company | Please enter a valid company name for the seller. |
| --- | --- |
| Invalid Material Name | Please enter a valid material name. |
| --- | --- |
| Invalid Pick-up Location | Please enter a valid pick-up location. |
| --- | --- |
| Invalid Destination | Please enter a valid destination. |
| --- | --- |
| Invalid Packaging | Please enter valid packaging details. |
| --- | --- |
| Invalid Number of Loads | Please enter a valid number of loads. |
| --- | --- |
| Invalid Weight per Load | Please enter a valid weight per load. |
| --- | --- |
| Invalid Bid Currency | Please select a valid currency for the bid. |
| --- | --- |
| Invalid Price per Tonne | Please enter a valid price per tonne. |
| --- | --- |
| Invalid Incoterms | Please select valid incoterms. |
| --- | --- |
| Invalid Bid Status | Please select a valid bid status. |
| --- | --- |
| Invalid Total Price Shared | Please enter a valid total price. |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| View details for a bid | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-20990&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### ~~6.6.2.9.2. View Hauliers list for Journey~~

- ~~Once a listing has an offer. Use the logic from the Haulage Calculator to find hauliers that can do this load.~~
- ~~Hauliers will be pulled in from: Platform, Salesforce and a Spreadsheet (client to provide)~~
- ~~Potential hauliers will be displayed in a table containing:~~
  - ~~Username~~
  - ~~Company Name~~
  - ~~Telephone~~
  - ~~Average Price~~
  - ~~Contact Source~~
    - ~~(Platform, Salesforce, Spreadsheet)~~

####

#### 6.6.2.10. Admin - buyer communications

- ~~The user will communicate directly with the buyer regarding a particular bid through the platform~~
- ~~The communications trail will be visible~~
- ~~The messaging structure will be the same as a standard messaging service~~
  - ~~Admin messages will feature on the right side of the section~~
  - ~~Buyer messages will be on the left side of the section~~
  - ~~All messages will be time-stamped~~
  - ~~The native typing features will be used~~
  - ~~The user will be able to add attachments of up to 25MB (total) to their message~~

####

#### 6.6.2.11 Admin - purchase bid approval actions

- The following actions will be available through the purchase bid page
  - The user will be able to approve the application
    - The system will send an automated email to the user informing them that their bid has been approved and that the WasteTrade team will work on the haulage offers
      - Copy to be provided by the client
    - The status will be updated
    - The bid will become active on the haulier’s platform
  - The user will be able to reject the bid
    - The system will send an automated email to the user informing them that their bid has been rejected
      - Pre-set list of reasons (to be defined within the AC)
    - The status will be updated
  - The user will be able to indicate if more information is required
    - The user will be able to send a message that will be sent to the applicant’s email address and there will be an in-app notification

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Purchase Bid Page Actions:<ul><li>The admin user will be able to perform the following actions on the purchase bid page:</li><li>Approve the bid</li><li>Reject the bid</li><li>Request more information</li></ul></li><li>Approve Bid:<ul><li>When the admin approves a bid:</li><li>The system will send an automated email to the user informing them that their bid has been approved.</li><li>The email will contain information that the WasteTrade team will now work on the haulage offers.</li><li>The email copy will be provided by the client.</li><li>The bid status will be updated to "Approved".</li><li>The bid will become active on the haulier’s platform.</li></ul></li><li>Reject Bid:<ul><li>When the admin rejects a bid:</li><li>The system will send an automated email to the user informing them that their bid has been rejected.</li><li>The email will include a pre-set list of reasons for the rejection<ul><li>CLIENT TO PROVIDE</li></ul></li><li>The bid status will be updated to "Rejected".</li></ul></li><li>Request More Information:<ul><li>When the admin indicates that more information is required:</li><li>The system will allow the admin to send a message to the user.</li><li>The message will be sent to the applicant’s email address.</li><li>There will be an in-app notification for the user.</li><li>The bid status will be updated to "More Information Required".</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Approve Action Failure | "Failed to approve the bid. Please try again." |
| --- | --- |
| Reject Action Failure | "Failed to reject the bid. Please try again." |
| --- | --- |
| Request Info Action Failure | "Failed to request more information. Please try again." |
| --- | --- |
| Email Sending Failure (Approve) | "Failed to send approval email. Please check the email configuration." |
| --- | --- |
| Email Sending Failure (Reject) | "Failed to send rejection email. Please check the email configuration." |
| --- | --- |
| In-App Notification Failure | "Failed to send in-app notification. Please try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| View details for a bid (buyer activity) | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-21072&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.12 View all seller activity

- There will be a table to view all seller activity
- The table will be as defined in the [View listings](#_9j9eap9nd649)
- The user will be able to [filter the listings](#_g17ov0invj9r)
- The table will have pagination
- Clicking on any row will lead the user to the details page

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Seller Activity Table:<ul><li>A table will be available to view all seller activities.</li><li>The table will display listings as defined in the "View Listings" story.</li></ul></li><li>Table Columns:<ul><li>The table will include the following columns:<ul><li>Date Listed</li><li>Date Available From</li><li>Status</li><li>State</li><li>Seller</li><li>Full name</li><li>Company</li><li>ID</li><li>Seller location</li><li>Material</li><li>Weight</li><li>Best Offer</li><li>Number of Offers</li><li>Remaining Loads</li></ul></li></ul></li><li>Filtering:<ul><li>The user will be able to filter the listings based on the following parameters:<ul><li>Seller - Company</li><li>Material</li><li>Location (buyer/seller)</li><li>Status</li><li>State</li></ul></li></ul></li><li>Pagination:<ul><li>The table will have pagination to manage the data display efficiently.</li><li>The table will show 20 listings per page by default.</li></ul></li><li>Row Interaction:<ul><li>Clicking on any row will lead the user to a detailed page for that particular listing.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Filter Error | "Unable to apply the filter. Please try again." |
| --- | --- |
| Pagination Error | "Unable to load the next page. Please try again." |
| --- | --- |
| Row Click Error | "Unable to load listing details. Please try again." |
| --- | --- |
| Data Load Error | "Unable to load seller activity data. Please try again." |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| View all seller activity | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-22167&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.13 View details for a sales listing

- The user will be able to see the following information about each listing
- The page will show the following information
  - Seller
    - Full name
    - Company
  - Material name
  - Location/Warehouse
  - Currency
  - Packaging
  - No. of loads
  - Weight per load
  - Bid status
    - Accepted
    - Rejected
    - Pending
- ~~Admin communications~~
  - ~~The user will be able to see a trail of messages between the buyer and themselves (WasteTrade team)~~

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Sales Listing Detail Page:<ul><li>The user will be able to see detailed information about each sales listing.</li></ul></li><li>Seller Information:<ul><li>Full Name: Display the full name of the seller.</li><li>Company: Display the company name of the seller.</li></ul></li><li>Material Information:<ul><li>Material Name: Display the name of the material listed.</li><li>Location/Warehouse: Display the location or warehouse where the material is stored.</li><li>Currency: Display the currency in which the sale is being made.</li><li>Packaging: Display the packaging details of the material.</li><li>Number of Loads: Display the total number of loads available.</li><li>Weight per Load: Display the weight of each load.</li></ul></li><li>Bid Status:<ul><li>Accepted: Indicate if the bid has been accepted.</li><li>Rejected: Indicate if the bid has been rejected.</li><li>Pending: Indicate if the bid is pending.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Data Load Error | "Unable to load sales listing details. Please try again." |
| --- | --- |
| Seller Information Error | "Unable to retrieve seller information. Please try again." |
| --- | --- |
| Material Information Error | "Unable to retrieve material information. Please try again." |
| --- | --- |
| Bid Status Error | "Unable to retrieve bid status. Please try again." |
| --- | --- |
| Admin Communications Error | "Unable to load admin communications. Please try again." |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| View details for a sales listing | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-21321&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.14 Admin - seller communications

- ~~The user will communicate directly with the seller regarding a particular listing through the platform~~
- ~~The communications trail will be visible~~
- ~~The messaging structure will be the same as a standard messaging service~~
  - ~~Admin messages will feature on the right side of the section~~
  - ~~Seller messages will be on the left side of the section~~
  - ~~All messages will be time-stamped~~
  - ~~The native typing features will be used~~
  - ~~The user will be able to add attachments of up to 25MB (total) to their message~~

####

####

#### 6.6.2.15 Admin - sales listing approval actions

- The following actions will be available through the purchase bid page
  - The user will be able to approve the listing
    - The status will be updated
    - The listing will go live on the system
  - The user will be able to reject the listing
    - The system will send an automated email to the user informing them that their listing has been rejected
      - Pre-set list of reasons (to be defined within the AC)
    - The status will be updated
    - The listing will not go live
  - The user will be able to indicate if more information is required
    - The user will be able to send a message that will be sent to the applicant’s email address and there will be an in-app notification
    - The user will use the messaging tool to inform the listing owner about what changes are needed for the listing to be approved

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Sales Listing Approval:<ul><li>The admin user will be able to approve the sales listing.</li><li>Upon approval, the status of the listing will be updated to "Approved".</li><li>The listing will go live on the system, making it visible to all users.</li></ul></li><li>Sales Listing Rejection:<ul><li>The admin user will be able to reject the sales listing.</li><li>The system will send an automated email to the user informing them that their listing has been rejected.</li><li>The email will contain a pre-set list of reasons for rejection (to be defined within the AC).</li><li>The status of the listing will be updated to "Rejected".</li><li>The rejected listing will not go live on the system.</li></ul></li><li>Request for More Information:<ul><li>The admin user will be able to indicate if more information is required from the listing owner.</li><li>The user will be able to send a message to the applicant’s email address, which will also generate an in-app notification.</li><li>The messaging tool will be used to inform the listing owner about what changes are needed for the listing to be approved.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
|     |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Approval Action Error | "Unable to process the approval action. Please try again." |
| --- | --- |
| Status Update Error | "Unable to update listing status. Please try again." |
| --- | --- |
| Automated Email Error | "Unable to send the automated email. Please try again." |
| --- | --- |
| Request More Information Messaging Error | "Unable to send the message. Please try again." |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-21155&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.16 View all wanted activity

- There will be a table to view all wanted listings
- The table will be as defined in the [View Wanted activity](#_94oc9vq11vh3)
- The user will be able to [filter the Wanted listings table](#_3n5fmdgvi6pi)
- The table will have pagination
- Clicking on any row will lead the user to the details page

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Display:<ul><li>The table will list all wanted listings.</li><li>The table will display the following columns:<ul><li>Date of Listing</li><li>Date Required From</li><li>Status</li><li>State</li><li>Buyer (Full Name, Company, ID)</li><li>Location (Country)</li><li>Material Required</li><li>Quantity Required</li><li>Packaging</li><li>Storage</li></ul></li><li>The table will show the latest 20 listings by default.</li></ul></li><li>Filtering:<ul><li>The user will be able to filter the wanted listings table by:<ul><li>Date Required From (set range)</li><li>Buyer</li><li>Company</li><li>Material</li><li>Location (buyer/seller)</li><li>Status</li><li>State</li></ul></li></ul></li><li>Pagination:<ul><li>The table will have pagination to navigate through multiple pages of wanted listings.</li><li>Pagination will be available at the bottom of the table.</li></ul></li><li>Details View:<ul><li>Clicking on any row will lead the user to the detailed view page of the selected wanted listing.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Filtering Error | "Unable to apply the selected filter. Please try again." |
| --- | --- |
| Pagination Error | "Unable to load the next page. Please try again." |
| --- | --- |
| Detail View Navigation Error | "Unable to open the details for the selected listing. Please try again." |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-22174&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.17 Admin - buyer communications (wanted)

- ~~The user will communicate directly with the buyer regarding a particular wanted listing through the platform~~
- ~~The communications trail will be visible~~
- ~~The messaging structure will be the same as a standard messaging service~~
  - ~~Admin messages will feature on the right side of the section~~
  - ~~Buyer messages will be on the left side of the section~~
  - ~~All messages will be time-stamped~~
  - ~~The native typing features will be used~~
  - ~~The user will be able to add attachments of up to 25MB (total) to their message~~

####

#### 6.6.2.18 View wanted activity details

- The user will be able to see the following information about each listing
- The page will show the following information
  - Date of Listing
  - Date Required From
  - Status
  - State
  - Buyer (Full Name, Company, ID)
  - Location (Country)
  - Material Required
  - Quantity Required
  - Packaging
  - Storage

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Table Display:<ul><li>The table will list all wanted listings.</li><li>The details will display the following columns:<ul><li>Date of Listing</li><li>Date Required From</li><li>Status</li><li>State</li><li>Buyer (Full Name, Company, ID)</li><li>Location (Country)</li><li>Material Required</li><li>Quantity Required</li><li>Packaging</li><li>Storage</li></ul></li></ul></li><li>Details View:<ul><li>Clicking on any row will lead the user to the detailed view page of the selected wanted listing.</li></ul></li><li>Approval &amp; Reject button :<ul><li>Allow admin to approve / reject the wanted lis<ul><li>Approve -&gt; show the wanted on the wanted listing web</li><li>Reject -&gt; remove from the list</li></ul></li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Filtering Error | "Unable to apply the selected filter. Please try again." |
| --- | --- |
| Pagination Error | "Unable to load the next page. Please try again." |
| --- | --- |
| Detail View Navigation Error | "Unable to open the details for the selected listing. Please try again." |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=11212-22181&node-type=frame&t=9tXnOiY4OzOwgBzU-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

The following actions will be available through the wanted listing’s page

- - The user will be able to approve the listing
        - The status will be updated
        - The listing will go live on the system
    - The user will be able to reject the bid
      - The system will send an automated email to the user informing them that their bid has been rejected
      - The status will be updated
      - The listing will not go live
    - The user will be able to indicate if more information is required
      - The user will be able to send a message that will be sent to the applicant’s email address and there will be an in-app notification
      - The user will use the messaging tool to inform the listing owner about what changes are needed for the listing to be approved

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Approval Action:<ul><li>The user will be able to approve a wanted listing.</li><li>Upon approval, the status of the listing will be updated to "Approved."</li><li>The listing will go live on the system and be visible to all relevant users.</li></ul></li><li>Rejection Action:<ul><li>The user will be able to reject a wanted listing.</li><li>Upon rejection, the status of the listing will be updated to "Rejected."</li><li>The system will send an automated email to the user informing them that their listing has been rejected.</li><li>The email will include a pre-set list of reasons for rejection, which the admin must select from.</li></ul></li><li>Request for More Information:<ul><li>The user will be able to indicate that more information is required for the listing.</li><li>The system will send a message to the applicant's email address.</li><li>The message will also create an in-app notification for the user.</li><li>The user will use the messaging tool to inform the listing owner about the specific changes or additional information needed for the listing to be approved.</li></ul></li><li>Messaging Tool:<ul><li>The messaging tool will allow the admin to communicate directly with the listing owner.</li><li>All messages sent via the messaging tool will be logged and visible in the admin panel and to the listing owner in their notifications.</li></ul></li><li>Status Updates:<ul><li>The listing’s status will be accurately updated based on the admin’s actions: Approved, Rejected, or More Information Required.</li></ul></li><li>Email Notifications:<ul><li>Automated emails will be triggered based on the admin’s actions, with appropriate content as defined by the client.</li><li>All emails must adhere to the specified templates and include relevant information about the listing and next steps for the user.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Approval Action Fails | "Unable to approve the listing. Please try again." |
| --- | --- |
| Rejection Action Fails | "Unable to reject the listing. Please try again." |
| --- | --- |
| Request for More Information Action Fails | "Unable to request more information. Please try again." |
| --- | --- |
| Email Sending Failure | "Failed to send notification email. Please try again." |
| --- | --- |
| In-App Notification Failure | "Failed to send in-app notification. Please try again." |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | [https://www.figma.com/design/Py0yzYKckJDBvSryfHKVBc/WT---Platform-(Copy)?node-id=12144-33190&t=KB1hCJ05j7LNmyvw-0](https://www.figma.com/design/Py0yzYKckJDBvSryfHKVBc/WT---Platform-%28Copy%29?node-id=12144-33190&t=KB1hCJ05j7LNmyvw-0) |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.19 View all haulage bids

- ~~There will be a table to view all haulage bids~~
- ~~The table will be as defined in the~~ [~~View Haulage activity~~](#_thfqj8vyc2z3)
- ~~The user will be able to~~ [~~filter the Haulage listings table~~](#_2flj5v2pb9vd)
- ~~The table will have pagination~~
- ~~Clicking on any row will lead the user to the details page~~

#### 6.6.2.20 Admin - haulier communications

- ~~The user will communicate directly with the buyer regarding a particular haulier bid through the platform~~
- ~~The communications trail will be visible~~
- ~~The messaging structure will be the same as a standard messaging service~~
  - ~~Admin messages will feature on the right side of the section~~
  - ~~Buyer messages will be on the left side of the section~~
  - ~~All messages will be time-stamped~~
  - ~~The native typing features will be used~~
  - ~~The user will be able to add attachments of up to 25MB (total) to their message~~

#### 6.6.2.21 Admin - haulier bid approval actions

- ~~The following actions will be available through the wanted listing’s page~~
  - ~~The user will be able to approve the bid~~
    - ~~The system will send an automated email to the Haulier informing them that their bid has been approved~~
      - ~~Copy to be provided by the WasteTrade team~~
    - ~~The status will be updated~~
  - ~~The user will be able to reject the haulage bid~~
    - ~~The system will send an automated email to the user informing them that their bid has been rejected~~
      - ~~Pre-set list of reasons (to be defined within the AC)~~
    - ~~The status will be updated~~
    - ~~The listing will not go live~~
  - ~~The user will be able to indicate if more information is required~~
    - ~~The user will be able to send a message that will be sent to the applicant’s email address and there will be an in-app notification~~
    - ~~The user will be able to “open” the bid to edits, allowing the haulier to make changes and re-submit~~

###

#### 6.6.2.22 Pushing all Trader data to the CRM

- The system will push all the Trader (e.g. buyer or seller) data captured during the onboarding process into a CRM, ensuring there is no duplication of effort in customer relationship management
- The following data will be pushed
  - Onboarding data
  - Organisational details
  - Commercial activity
  - Transactional records
- The system will enable bidirectional data exchange with the CRM and the Trading platform, streamlining the flow of information to and from the CRM.

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Data Capture and Push:<ul><li>The system will capture all Trader data during the onboarding process.</li><li>The data to be captured and pushed includes:<ul><li>Onboarding data<ul><li>Pushed to Salesforce as a Lead on Registration</li><li>Updated in Salesforce to an Account upon Verification</li></ul></li><li>Organisational details</li><li>Commercial activity<ul><li>Including wanted listings</li></ul></li><li>Transactional records (included within commercial activity)</li></ul></li></ul></li><li>Bidirectional Data Exchange:<ul><li>The system will enable bidirectional data exchange between the CRM and the Trading platform.</li><li>Updates made in the CRM should be reflected in the Trading platform and vice versa.</li></ul></li><li>No Data Duplication:<ul><li>The system will ensure there is no duplication of data in customer relationship management.</li><li>Existing records in the CRM should be updated with new information, not duplicated.</li></ul></li><li>Data Integrity and Accuracy:<ul><li>Data pushed to the CRM must be complete and accurate.</li><li>All fields must be validated before pushing to the CRM to ensure data integrity.</li></ul></li><li>Security and Privacy:<ul><li>All data exchanges must be secured using appropriate encryption methods.</li><li>The system must comply with relevant data protection regulations (e.g., GDPR).</li></ul></li><li>Audit Trail:<ul><li>The system must maintain an audit trail of all data exchanges.</li><li>The audit trail should include timestamps, data changes, and user information for each exchange.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.23 Pushing all Haulier data to the CRM

- ~~The system will push all the Haulier data captured during the onboarding process into a CRM, ensuring there is no duplication of effort in customer relationship management~~
- ~~The following data will be pushed~~
  - ~~Onboarding data~~
  - ~~Organisational details~~
  - ~~Commercial activity~~
  - ~~Transactional records~~
- ~~The system will enable bidirectional data exchange with the CRM and the Haulage platform, streamlining the flow of information to and from the CRM.~~

#### 6.6.2.24 Members management in the CRM (alternative)

- The system will be integrated with WasteTrade’s CRM and will be be built to replicate the existing functionality
- The WasteTrade team will be able to use the CRM to
  - View all the new members
  - View all the members in the registering and onboarding process
  - Manage all members within the system
    - View/edit individual profiles
    - View/edit account status
- The team will be able to
  - Approve members
  - Reject members
  - Ask for more information
    - The Platform users (Trading/haulier) will be informed on the portal

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>CRM Integration:<ul><li>The system must be integrated with WasteTrade’s CRM, replicating existing functionality.</li></ul></li><li>Member Management:<ul><li>The WasteTrade team will be able to use the CRM to:</li><li>View all new members.</li><li>View all members in the registering and onboarding process.</li><li>Manage all members within the system.</li></ul></li><li>Profile Management:<ul><li>The WasteTrade team will be able to view and edit individual profiles.</li><li>The WasteTrade team will be able to view and edit account status.</li></ul></li><li>Member Actions:<ul><li>The WasteTrade team will have the ability to:<ul><li>Approve members.</li><li>Reject members.</li><li>Ask for more information from members.</li></ul></li></ul></li><li>Notifications:<ul><li>Platform users (Trading/Haulier) will be informed on the portal about their account status:<ul><li>Approval</li><li>Rejection</li><li>Requests for more information</li></ul></li></ul></li><li>User Interface:<ul><li>The CRM interface must replicate the existing functionality, ensuring user familiarity.</li><li>The interface must allow easy navigation and clear visibility of member statuses and actions.</li></ul></li><li>Data Consistency and Synchronisation:<ul><li>Data between the CRM and the Trading/Haulier platform must be consistently synchronised.</li><li>Changes in member status or profile information must be reflected in real-time on both the CRM and the Trading/Haulier platform.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.6.2.25 View commercial activity in the CRM (alternative)

- The system will be integrated with WasteTrade’s CRM to enable complete commercial management, and will be be built to replicate the existing functionality
- For traders, the WasteTrade team will be able to
  - [View details for a bid](#_s88zy249uyzq)
  - [View details for a sales listing](#_kbeqt811gbce)
  - [View all wanted listings](#_dc6e06rp6h27)
  - [View haulage bids](#_thfqj8vyc2z3)

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>CRM Integration:<ul><li>The system must be integrated with WasteTrade’s CRM, replicating existing functionality for commercial management.</li></ul></li><li>Viewing Bid Details:<ul><li>The WasteTrade team must be able to view the details for a bid.</li><li>The bid details must include:<ul><li>Buyer details: Full name, company, location.</li><li>Seller details: Full name, company, location.</li><li>Material name, pick-up location, destination.</li><li>Packaging type, number of loads, weight per load.</li><li>Bid currency, price per tonne, Incoterms.</li><li>Bid status (approved, rejected, pending).</li><li>Communication trail between the buyer and admin.</li></ul></li></ul></li><li>Viewing Sales Listing Details:<ul><li>The WasteTrade team must be able to view details for sales listings.</li><li>The sales listing details must include:<ul><li>Seller details: Full name, company, location.</li><li>Material name, warehouse location.</li><li>Packaging type, number of loads, weight per load.</li><li>Bid status (accepted, rejected, pending).</li><li>Communication trail between the seller and admin.</li></ul></li></ul></li><li>Viewing All Wanted Listings:<ul><li>The WasteTrade team must be able to view all wanted listings.</li><li>The wanted listing details must include:<ul><li>Buyer details: Full name, company, location.</li><li>Material required, quantity required.</li><li>Packaging type, storage type.</li><li>Status of the listing (active, expired, pending).</li></ul></li><li>Communication trail between the buyer and admin.</li></ul></li><li>Viewing Haulage Bids:<ul><li>The WasteTrade team must be able to view details for haulage bids.</li><li>The haulage bid details must include:</li><li>Buyer details: Full name, company, location.</li><li>Seller details: Full name, company, location.</li><li>Material name, pick-up location, destination.</li><li>Bid currency, price per tonne, Incoterms.</li><li>Bid status (approved, rejected, pending).</li><li>Communication trail between the haulier and admin.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.2.26 Manage commercial activity in the CRM (alternative)

- For all commercial activity (bids, sales listings, wanted listings) the user will be able to perform the following actions (ensuring current functionality is replicated):
  - [Manage bid status](#_1jtmrnh75wm9)
  - [Manage sales listings](#_2roeblz1go98)
  - [Manage wanted listings](#_6yp25nmspn0p)
  - [Manage all haulage bids](#_lz6kynopzn41)

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>CRM Integration:<ul><li>The system must be integrated with WasteTrade’s CRM to manage all commercial activities (bids, sales listings, wanted listings, haulage bids).</li></ul></li><li>Managing Bid Status:<ul><li>All status related information will be pushed into the CRM<ul><li>Buyer details (Full name, company, location)</li><li>Seller details (Full name, company, location)</li><li>Material details (name, packaging, weight, number of loads)</li><li>Bid details (currency, price per tonne, Incoterms, status)</li><li>Communication trail with admin</li></ul></li></ul></li><li>Managing Sales Listings:<ul><li>All sales listings related information will be pushed into the CRM<ul><li>Seller details (Full name, company, location)</li><li>Material details (name, warehouse location, packaging, weight, number of loads)</li><li>Bid status (accepted, rejected, pending)</li><li>Communication trail with admin</li></ul></li></ul></li><li>Managing Wanted Listings:<ul><li>All wanted listings related information will be pushed into the CRM<ul><li>Buyer details (Full name, company, location)</li><li>Material required (name, quantity, packaging, storage)</li><li>Listing status (active, expired, pending)</li><li>Communication trail with admin</li></ul></li></ul></li><li>Managing Haulage Bids:<ul><li>All haulage bids related information will be pushed into the CRM<ul><li>Buyer details (Full name, company, location)</li><li>Seller details (Full name, company, location)</li><li>Material details (name, packaging, weight, number of loads)</li><li>Bid details (currency, price per tonne, Incoterms, status)</li><li>Communication trail with admin</li></ul></li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

###

### 6.6.3 Document Management

This section describes the document management functionality available to the WasteTrade team.

#### 6.6.3.1 View all documents

- ~~The user will be able to view a list of all documents that are to be generated during the trading flow~~
- ~~The following information will be visible about each document~~
  - ~~Document Title~~
  - ~~Document Description~~
  - ~~Document for~~
    - ~~Buyer~~
    - ~~Seller~~
    - ~~Haulier~~
  - ~~Status~~
    - ~~Active~~
    - ~~Inactive~~
- ~~The user will be able to click on a row to open the details view~~

#### 6.6.3.2 View a document

- ~~The user will be able to view a document~~
- ~~The user will be able to view the following details~~
  - ~~Document Title~~
  - ~~Document Description~~
  - ~~Document for~~
    - ~~Buyer~~
    - ~~Seller~~
    - ~~Haulier~~
  - ~~Status~~
    - ~~Active~~
    - ~~Inactive~~
  - ~~Workflow~~
    - ~~tbc - shows when in the trading flow the document is generated and displayed~~
- ~~The user will be able to view a version history for the document~~
  - ~~The user will be able to download a previous document~~
- ~~The user will be able to preview the active document~~
- ~~The user will be able to download a PDF copy of the active document~~

#### 6.6.3.3 Add a document

- ~~The user will be able to view a document~~
- ~~The user will be required to provide the following documents~~
  - ~~Document Title~~
  - ~~Document Description~~
  - ~~Document for~~
    - ~~Buyer~~
    - ~~Seller~~
    - ~~Haulier~~
    - ~~Workflow~~
      - ~~tbc - shows when in the trading flow the document is generated and displayed~~
  - ~~Template Upload~~
    - ~~Format to be confirmed (pdf/csv)~~
- ~~On submitting the document will go live as per the workflow~~

#### 6.6.3.4 Configure document workflow

- ~~For each document, the user will be able to configure a workflow~~
- ~~The user will be able to set:~~
  - ~~When the document is generated~~
  - ~~Who sees the document~~
  - ~~What is displayed on the document~~

#### 6.6.3.5 Edit a document

- ~~The user will be able to edit a document~~
- ~~The following items will be editable~~
  - ~~Document Title~~
  - ~~Document Description~~
  - ~~Document for~~
    - ~~Buyer~~
    - ~~Seller~~
    - ~~Haulier~~
    - ~~Workflow~~
      - ~~Restricted access~~
      - ~~tbc - shows when in the trading flow the document is generated and displayed~~
  - ~~Template Upload~~
    - ~~Format to be confirmed (pdf/csv)~~
- ~~On re-submitting the document will go live as per the workflow~~
- ~~If the user makes changes and tries to leave without saving, the system will show a prompt asking the user to save their changes first~~

#### 6.6.3.6 Integrate: Use Document Management procedure (alternative)

- The team will integrate with WasteTrade’s existing document management procedure
- The team will create a mapping for when all the document are required to be generated
  - Document type
    - Annex vii
    - CMR
    - Packing List
    - Green Sheet
    - Duty of Care
    - Sales Invoice
    - Purchase order
    - Good Photo Guide
  - Point of generation
- The user side portal will use the integration to generate the documents at the appropriate point
- B13 team will be needed to add/map any new documents

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Integration with Existing Document Management Procedure:<ul><li>The team will integrate the platform with WasteTrade’s existing document management system.</li><li>The integration must support the automatic generation and management of required documents.</li></ul></li><li>Document Mapping:<ul><li>The team will create a mapping for all documents that need to be generated.</li><li>Document types to be mapped include:<ul><li>Annex VII</li><li>CMR</li><li>Packing List</li><li>Green Sheet</li><li>Duty of Care</li><li>Sales Invoice</li><li>Purchase Order</li><li>Good Photo Guide</li></ul></li></ul></li><li>Point of Generation:<ul><li>Each document must be generated at the appropriate point in the user journey.</li><li>The mapping must clearly define the trigger points for document generation within the user side portal.</li></ul></li><li>User Portal Integration:<ul><li>The user portal must utilise the document management integration to generate and manage the documents.</li><li>The integration should be seamless and not require additional user intervention beyond initial data input.</li></ul></li><li>Document Management Procedure:<ul><li>The integration must align with WasteTrade’s existing document management procedures, ensuring consistency and compliance.</li><li>The system must handle document storage, retrieval, and lifecycle management according to existing standards.</li></ul></li><li>New Document Mapping:<ul><li>The B13 team must be able to add or map any new documents as required.</li><li>The process for adding or mapping new documents must be documented and communicated clearly to the B13 team.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### ~~6.6.3.7. Auto-Population of Documents~~

- ~~The system will automatically populate relevant fields in generated documents using existing platform data.~~
- ~~This includes pulling required information into forms:~~
  - ~~Green Sheet~~
  - ~~Annex VII, CMR, and other relevant documents.~~
- ~~Required information for forms includes:~~
  - ~~Addresses must be pulled from site addresses of material within the platform.~~
  - ~~Other fields and where to pull from to be provided by the client.~~
- ~~This ensures accuracy, reduces manual input, and streamlines document generation.~~

### 6.6.4 User Management

This section describes the user management functionality available to the WasteTrade team. This module will be used to manage internal users

#### 6.6.4.1 View all users

- ~~The users will be able to see a summary table of all the team members on the system~~
- ~~The table will have the following columns~~
  - ~~Name~~
    - ~~First name~~
    - ~~Last name~~
  - ~~Date of account creation~~
  - ~~Email address~~
  - ~~Role~~
    - ~~tbc~~
  - ~~Status~~
    - ~~Active~~
    - ~~Archived~~
      - ~~UI approach: Visual Differentiation~~
- ~~The table will have pagination~~
- ~~The user will be able to select the number of rows per page~~
  - ~~10~~
  - ~~20~~
    - ~~Default~~
  - ~~50~~
  - ~~All~~
- ~~By default, the table is sorted by First Name - ascending~~

#### 6.6.4.2 View user details

- ~~The Admin (Super admin/admin) will be able to view details for all users~~
  - ~~A standard user will only be able to view their details~~
- ~~The user will be able to click on a row within the table to access the record~~
- ~~The following details will be displayed~~
  - ~~First Name~~
  - ~~Last Name~~
  - ~~Email address~~
  - ~~Phone number~~
  - ~~Role~~
    - ~~e.g. Super Admin, Admin, Team~~
  - ~~Status~~
    - ~~Active~~
    - ~~Archived (visual differentiation required)~~
      - ~~Time and date stamp for last app access~~
        - ~~HH: MM, DD/MM/YYYY~~
- ~~Account termination will take place through the user details page~~

#### 6.6.4.3 Add a new user

- ~~Only super admin/admin users can add new users~~
  - ~~The super admin can add another super admin~~
- ~~The following details will need to be provided when setting up a new account~~
  - ~~First Name~~
  - ~~Last Name~~
  - ~~Email address~~
  - ~~Phone number~~
  - ~~Role~~
    - ~~tbc~~
- ~~On submitting the data, the system will send an email containing the Set Password token~~

#### 6.6.4.4 Edit user details

- ~~Only the super admin can change the details for any user~~
- ~~Only the super admin can change another user’s role~~
- ~~All users can edit their details~~
  - ~~First Name~~
  - ~~Last Name~~
  - ~~Phone number~~
- ~~The user will be asked to confirm the changes before exiting the “edit user details” functionality~~

#### 6.6.4.5 Delete users

- ~~Only Admin (Super admin/admin) users can delete accounts~~
  - ~~An admin can delete users below them in the hierarchy~~
- ~~The user must confirm their action before the deletion is performed:~~
  - ~~The user will not be able to access their account after deletion. Are you sure that you want to delete this user?~~
    - ~~Yes - Delete the user’s account~~
      - ~~This will be a hard delete all personal data associated with the user will be deleted and removed from the system~~
    - ~~No - Return to the previous page~~

#### 6.6.4.6 Archive/Unarchive users

- ~~Only the super admin can archive a user~~
- ~~Once archived, the user will not be able to access their account till unarchived by the super admin~~
- ~~The super user will be asked to confirm the action:~~
  - ~~Do you want to archive this user?~~
    - ~~Yes: send an email to the user concerned.~~
      - ~~Copy to be written~~
    - ~~No: return to the previous page~~
  - ~~Do you want to unarchive this user?~~
    - ~~Yes: the user will be invited to set their password.~~
    - ~~No: return to the previous page~~

#### 6.6.4.7 Preset accounts for Wastetrade (alternative)

- B13 Technology will set and define access credentials for up to 5 users
  - B13 Technology will provide and set the username for each account
  - B13 Technology will set and provide the password for each account
- The users will not be able to manage their own credentials, this includes the ability to
  - Edit or change usernames
  - Reset passwords
- All preset accounts will have Super Admin permissions

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Account Creation:<ul><li>B13 Technology will create and define access credentials for up to 5 users.</li><li>Each account will be created with a unique username and password.</li></ul></li><li>Username Management:<ul><li>B13 Technology will set and provide the username for each account.</li><li>The usernames must be unique and comply with the platform's username format and restrictions.</li><li>Users will not have the ability to edit or change their usernames.</li></ul></li><li>Password Management:<ul><li>B13 Technology will set and provide the password for each account.</li><li>Passwords must comply with the platform's security policies, including complexity and length requirements.</li><li>Users will not have the ability to reset or change their passwords.</li></ul></li><li>Super Admin Permissions:<ul><li>All preset accounts will be granted Super Admin permissions.</li><li>Super Admin permissions must include full access to all administrative functionalities and settings within the platform.</li></ul></li><li>Credential Distribution:<ul><li>B13 Technology will securely distribute the usernames and passwords to the designated users.</li><li>Distribution methods must ensure the confidentiality and security of the credentials.</li></ul></li><li>Security Compliance:<ul><li>The creation and management of preset accounts must comply with all relevant security and privacy policies.</li><li>Credentials must be stored securely and protected against unauthorised access.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

### 6.6.5 Materials settings

This section describes the key settings that the WasteTrade team will use to manage the materials. We will integrate with the existing [Product Database](#_knmybneiad8y).

#### 6.6.5.1 Settings layout

- ~~The settings module has two sub-sections~~
  - ~~Materials~~
  - ~~Price calculator~~
- ~~Both sections will be accessible through a secondary navigation menu (e.g. tabs or sidebar)~~

#### 6.6.5.2 View all materials

- ~~There will be a “view all materials” summary table~~
- ~~The table will have the following columns~~
  - ~~Material name~~
  - ~~Type~~
  - ~~Status~~
    - ~~Active~~
    - ~~Inactive~~
  - ~~Number of listings associated~~
  - ~~The current price per MT~~
- ~~Clicking on any row will take the user to the material’s details page~~

####

#### 6.6.5.3 Materials - details page

- ~~The user will be able to view the following details through the “details page”~~
  - ~~Material name~~
  - ~~Type~~
    - ~~e.g. Metal, plastics, etc~~
  - ~~Photos~~
  - ~~Description~~
  - ~~Status~~
  - ~~Current Pricing~~
    - ~~Past pricing (3 months, 6 months, 12 months, custom)~~
  - ~~PERN Status~~
  - ~~Usage statistics~~
    - ~~To be defined~~

#### 6.6.5.4 Add a new material

- ~~The user will be required to provide the following details when adding a new material~~
  - ~~Material name~~
  - ~~Type~~
    - ~~Each time a new category is added the system will save it~~
    - ~~Categories will be presented in a type ahead drop-down format~~
  - ~~Photos~~
    - ~~Upload from device~~
  - ~~Description~~
  - ~~Current Pricing~~
  - ~~Is this a PERN material?~~
    - ~~Yes - price impacted (see~~ [~~WasteTrade calculator~~](#_ybh4j8lp0w1m)~~)~~
    - ~~No~~
- ~~The material will go live on submissions~~

####

#### 6.6.5.5 Bulk add new materials

- ~~The user will be able to add new materials in bulk~~
- ~~The bulk adding will be performed through a CSV upload~~
- ~~The material will go live on submission~~

#### 6.6.5.6 Edit a material

- ~~The user will be able to edit the following parameters~~
  - ~~Material name~~
  - ~~Type~~
    - ~~e.g. Metal, plastics, etc~~
  - ~~Photos~~
    - ~~Upload from device~~
  - ~~Description~~
  - ~~Current Pricing~~
  - ~~PERN Status~~
- ~~The system will display a prompt to ensure that the user does not leave the page without saving their changes~~

####

#### 6.6.5.7 Delete a material

- ~~A material can be deleted through the details page~~
- ~~The system will ask the user to confirm the action to prevent accidental deletions~~
- ~~Once confirmed, the material is removed from the list~~

#### 6.6.5.8 Integrate with existing products database (alternative)

- The B13 Team will integrate with the existing database
- An automatic process will be set up to check for additions/removals/edits from the database
- The materials within the database will be visible to the end user during their onboarding process, and during listing creation
- The integration will work alongside the pricing integration to calculate and display appropriate prices

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Integration with Existing Database:<ul><li>The B13 Team will establish a connection to the existing products database.</li><li>The connection must be secure and comply with all relevant data protection regulations.</li></ul></li><li>Automatic Process Setup:<ul><li>An automatic process will be implemented to regularly check for additions, removals, and edits in the products database.</li><li>The process should run at predefined intervals (e.g., hourly, daily) to ensure up-to-date information.</li><li>Any changes detected in the database should be reflected immediately in the system.</li></ul></li><li>User Visibility:<ul><li>Materials within the products database must be visible to end users during their onboarding process.</li><li>The materials should be available for selection during listing creation.</li><li>The interface should allow users to search, filter, and select materials from the database.</li></ul></li><li>Integration with Pricing System:<ul><li>The integration will work alongside the existing pricing system to calculate and display appropriate prices for the materials.</li><li>Prices should be updated automatically based on the latest data from the products database and pricing system.</li><li>The system should handle any errors in price calculation gracefully, providing meaningful error messages to the user.</li></ul></li><li>Testing and Validation:<ul><li>Comprehensive testing must be conducted to ensure the integration works seamlessly with the existing database and pricing system.</li><li>All functionalities must be validated to ensure data consistency and accuracy.</li></ul></li><li>Error Handling and Notifications:<ul><li>The system should log any errors or issues encountered during the integration process.</li><li>Notifications should be sent to the admin team in case of critical errors that need immediate attention.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

### 6.6.6 Price calculation settings

This section describes the key settings that the WasteTrade team will use to manage the price calculations.

#### 6.6.6.1 Exchange rates

- ~~The system allows the users to bid/list in various currencies and for the bids/lists to be viewable in various currencies~~
- ~~The B13.ai team will use an Exchange Rate calculator integration to enable this functionality~~

#### 6.6.6.2 Multi-currency cost calculator

- ~~The WasteTrade team have built a tool used to calculate the total price of a listing (including haulage) even if all the component prices are in different currencies~~
- ~~This tool enables the platform to facilitate international trade in a way that all parties can deal in their preferred currency~~
- ~~The B13.ai team will integrate this tool into the new build~~

#### 6.6.6.3 Integrate with existing products price calculator (alternative)

- The B13 Team will integrate with the existing price calculator
- An automatic process will be set up to check for changes to the calculator
  - The app will use the latest version to calculate the prices (multi-currency)
    - The WasteTrade team will manually set the central Exchange Rates for the calculator to use in multi-currency transactions
- The integration will work alongside the materials database integration to calculate and display appropriate prices.

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Integration with Existing Price Calculator:<ul><li>The B13 Team will establish a connection to the existing price calculator.</li><li>The connection must be secure and comply with all relevant data protection regulations.</li></ul></li><li>Automatic Process Setup:<ul><li>An automatic process will be implemented to regularly check for changes in the price calculator.</li><li>The process should run at predefined intervals (e.g., hourly, daily) to ensure up-to-date price calculations.</li><li>Any changes detected in the price calculator should be reflected immediately in the system.</li></ul></li><li>Price Calculation:<ul><li>The app will use the latest version of the price calculator to compute prices.</li><li>The price calculation should support multiple currencies.</li><li>The integration should ensure accurate conversion rates are applied for multi-currency transactions.</li></ul></li><li>Exchange Rates Management:<ul><li>The WasteTrade team will manually set the central exchange rates.</li><li>The system should provide an interface for the team to update exchange rates as needed.</li><li>The latest exchange rates should be used in all price calculations.</li></ul></li><li>Integration with Materials Database:<ul><li>The integration will work alongside the materials database integration.</li><li>The system should use data from the materials database to calculate and display appropriate prices.</li></ul></li><li>User Interface:<ul><li>The calculated prices should be displayed clearly to the users.</li><li>The interface should indicate the currency used in the calculation.</li><li>Any errors in price calculation should be handled gracefully, with meaningful error messages displayed to the user.</li></ul></li><li>Testing and Validation:<ul><li>Comprehensive testing must be conducted to ensure the integration works seamlessly with the existing price calculator and materials database.</li><li>All functionalities must be validated to ensure data consistency and accuracy.</li></ul></li><li>Error Handling and Notifications:<ul><li>The system should log any errors or issues encountered during the integration process.</li><li>Notifications should be sent to the admin team in case of critical errors that need immediate attention.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### ~~6.6.6.4 Define PERN~~

- ~~The Admin will be able to globally set the PERN value, the PERN Margin and the exchange rate margin.~~
- ~~The Admin will be able to update:~~
  - ~~PERN~~
    - ~~£ per Metric tonne~~
    - ~~Numerical input~~
    - ~~Mandatory~~
  - ~~PERN Margin~~
    - ~~£ per load~~
    - ~~Numerical input~~
    - ~~Mandatory~~
      - ~~Default £5~~
  - ~~Exchange rare margin~~
    - ~~£ per exchange~~
    - ~~Numerical input~~
    - ~~Mandatory~~
      - ~~Default £5~~

### 6.6.7 Notification settings

The system will provide the WasteTrade team with notification management functionality

#### 6.6.7.1 Notification Integration

- The system will integrate with a notification management tool (third party)
- The system will allow the user to manage the Email and Platform notifications

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Integration with SendGrid:<ul><li>The system will be integrated with SendGrid for managing email notifications.</li><li>The integration must be secure and comply with all relevant data protection regulations.</li></ul></li><li>User Management of Notifications:<ul><li>Users will have the ability to manage their email and platform notifications.</li><li>The user interface will provide options to enable or disable specific types of notifications.</li></ul></li><li>Notification Types:<ul><li>The system will support different types of notifications, including but not limited to:<ul><li>Account activity notifications</li><li>Bid status updates</li><li>Listing status updates</li><li>System alerts</li></ul></li></ul></li><li>Email Notification Settings:<ul><li>Users can enable or disable email notifications for various events.</li><li>There will be a section in the user profile for managing email notification preferences.</li><li>The settings should be easy to navigate and understand.</li></ul></li><li>Platform Notification Settings:<ul><li>Users can enable or disable platform notifications for various events.</li><li>There will be a section in the user profile for managing platform notification preferences.</li><li>The settings should be intuitive and user-friendly.</li></ul></li><li>Notification Management Interface:<ul><li>The notification management interface will be accessible from the user profile.</li><li>It should display all possible notification types with toggles or checkboxes for enabling/disabling them.</li><li>Changes to notification settings should be saved and reflected immediately.</li></ul></li><li>Default Notification Settings:<ul><li>New users will have a set of default notification preferences.</li><li>The default settings should be designed to ensure users receive important notifications without being overwhelmed.</li></ul></li><li>Email Notification Content:<ul><li>The content of email notifications should be clear and concise.</li><li>Each email notification should include relevant details about the event that triggered it.</li><li>There should be a consistent format for all email notifications.</li></ul></li><li>Error Handling and Logging:<ul><li>Any errors in sending notifications through SendGrid should be logged.</li><li>The system should handle errors gracefully and notify administrators if there are persistent issues.</li></ul></li><li>Testing and Validation:<ul><li>Comprehensive testing must be conducted to ensure the integration works seamlessly.</li><li>Notifications should be tested for accuracy, timeliness, and reliability.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.7.2 Edit pre-set notifications

- ~~The B13 Team will set up the following notifications~~
  - [~~Platform notifications - buyer~~](#_5ipt03jg7ln9)
  - [~~Platform notifications - seller~~](#_sfqn4rjuuvb3)
  - [~~Platform notifications - wanted listing owner~~](#_79dld9pyxepd)
  - [~~Platform notifications - Haulier~~](#_43ybjh64al27)
- ~~The WasteTrade team will be able to edit the preset notifications~~
  - ~~Content~~
  - ~~Type (email/platform/both)~~
- ~~The trigger points will not be editable~~
- ~~The WasteTrade team will be able to remove the preset notifications~~

#### 6.6.7.3 New notifications

- ~~The WasteTrade team will be able to add new notifications (email and platform)~~
- ~~The WasteTrade team will be able to define the trigger points for the notification~~
- ~~The WasteTrade team will be able to manage the content for the new notifications~~

### 6.6.8 Customer Support - User support content

This section describes the Customer Support module that will be used by the CLIENT team to create and manage Support content which is available through the resources section (e.g. User Guide/Material pages/FAQs)

#### 6.6.8.1 View all support content

- ~~The user will be able to see a master table that contains all the support content~~
- ~~The table will have the following columns~~
  - ~~Date added/last edit~~
  - ~~Author~~
  - ~~Title~~
  - ~~Type~~
    - ~~FAQ~~
    - ~~Article~~
  - ~~Status~~
    - ~~Live~~
    - ~~Draft~~
    - ~~Archived~~
    - ~~Deleted~~
- ~~The user can open the details for any ticket by clicking on the row~~
- ~~The table will have pagination~~
- ~~The user will be able to select the number of rows per page~~
  - ~~10~~
  - ~~20~~
    - ~~Default~~
  - ~~50~~
  - ~~All~~
- ~~By default, the latest/newest content will be displayed first~~
- ~~The user will be able to click on any row to open the item~~

####

#### 6.6.8.2 Search

- ~~The user will be able to perform a search on the “View all support content” table~~
- ~~The user will be able to enter their search term in the search box~~
- ~~Search will be performed upon clicking the search button~~
- ~~Search will be performed on all data in the table~~
- ~~Deleted records will also be searched and displayed but will be greyed out in the table  
    ~~

#### 6.6.8.3 Sort

- ~~The user will be able the “View all content” table~~
- ~~The user will be able to sort the user table on all the columns~~

#### 6.6.8.4 Filter

- ~~The user will be able to apply filters to the “View all content” table~~
- ~~The user will be able to filter all of the columns~~

#### 6.6.8.5 Add a new Article

- ~~The WasteTrade team will be able to add new pieces of content~~
- ~~The user will need to provide the following information:~~
  - ~~Type~~
    - ~~User guide article~~
    - ~~FAQ (see below)~~
  - ~~Article title (H1)~~
  - ~~Title image~~
    - ~~Alt text~~
  - ~~Body text~~
  - ~~Images~~
    - ~~Alt text~~
  - ~~Sub-headings~~
  - ~~Keywords~~
- ~~The user will be able to either~~
  - ~~Broadcast (go-live)~~
  - ~~Save as draft~~
  - ~~If the user does not choose either option they will be informed that the content will not be saved (when they try to leave the page)~~
- ~~The author will automatically be the person whose account is used to create the content~~

#### 6.6.8.6 Add a new FAQ

- ~~The CLIENT user will be able to add a new piece of support content~~
- ~~The user will need to provide the following information:~~
  - ~~Title~~
  - ~~Type~~
    - ~~Article (see above)~~
    - ~~FAQ~~
  - ~~Content~~
    - ~~Question (maximum 50 words)~~
    - ~~Answer (maximum 250 words)~~
    - ~~Images~~
  - ~~Keywords~~
- ~~The user will be able to either~~
  - ~~Broadcast (go-live)~~
  - ~~Save as draft~~
  - ~~If the user does not choose either option they will be informed that the content will not be saved (when they try to leave the page)~~

#### 6.6.8.7 Add images within articles

- ~~The CLIENT user will be able to add images as a part of the~~ [~~Add a new Article~~](#_6bz50rysmp1f) ~~and~~ [~~Add a new FAQ~~](#_h3ehe3psp3ed)
- ~~The user will be able to add images to articles(optional)~~
  - ~~There will be a way for the user to position the imagery where it is need~~
  - ~~The user will be able to resize the imagery~~
  - ~~The user will be able to upload from their device~~
    - ~~Accepted formats: jpeg, png, svg~~
  - ~~The user must provide “alt text” for the images~~

#### 6.6.8.8 View an individual Article/FAQ

- ~~The user will be able to view each piece of support content~~
- ~~The following details will be visible~~
  - ~~Date added/last edit~~
  - ~~Author~~
  - ~~Title~~
  - ~~Type~~
    - ~~FAQ~~
    - ~~Article~~
  - ~~Content~~
  - ~~Keywords~~
  - ~~Status~~
    - ~~Live~~
    - ~~Draft~~
    - ~~Archived~~
    - ~~Deleted~~
- ~~The author will automatically be the person whose account is used to create the content~~
- ~~The user will be able to access edit mode through this page~~

#### 6.6.8.9 Edit an individual Article/FAQ

- ~~The user will be able to edit the following items~~
- ~~Title~~
- ~~Content~~
  - ~~As per the requirements defined in the~~ [~~Add a new Article~~](#_6bz50rysmp1f) ~~and~~ [~~Add a new FAQ~~](#_h3ehe3psp3ed) ~~stories~~
  - ~~An FAQ cannot be transformed into an Article (and vice versa)~~
- ~~The user will need to save the changes~~
  - ~~If the user tries to leave the page without saving a warning message will be shown:~~
    - ~~“Don’t forget to save your changes, or else they will be lost.”~~
      - ~~Save changes~~
        - ~~Saves changes and updates content (live or draft)~~
      - ~~Save as draft~~
        - ~~The article/FAQ will not be live in this case~~
      - ~~Discard changes~~
        - ~~No changes will be made to the live/draft content~~

#### 6.6.8.10 Delete an Article/FAQ

- ~~The user will be able to delete the Article/FAQ from the~~ [~~View All Support Content~~](#_x3ghbfhguvq2) ~~table or the item’s~~ [~~page~~](#_pbazyyqy39q)
- ~~The user will be asked to confirm the deletion~~
  - ~~Yes - remove the article from the live view~~
    - ~~A draft article’s status will change to “deleted” and will not be visible unless searched for or isolated using the filters on the~~ [~~View all support content~~](#_x3ghbfhguvq2) ~~table~~

### 6.6.9 Audit trail

This section describes the audit trail functionality that the WasteTrade admin team will have access to.

#### 6.6.9.1 Create an audit trail

- All actions in the admin and user portal will be logged
- Go Back button
- Export button
- Actions will be logged with:
  - Timestamp
  - Name of user
    - Type (e.g. WasteTrade, Trader, Haulier)
  - Organisation
  - Role of user
  - Action
    - tbc

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Action Logging:<ul><li>The system must log all actions performed in both the admin and user portals.</li><li>Each logged action must include the following details:<ul><li>Timestamp: The exact date and time when the action was performed.</li><li>Name of User: The full name of the user who performed the action.</li><li>Username: 8 digit identifier assigned during registration.</li><li>Type: The type of user (e.g., WasteTrade, Trader, Haulier).</li><li>Organisation: The organisation to which the user belongs.</li><li>Role of User: The role of the user within the system (e.g., Super Admin, Admin, Buyer, Seller).</li><li>Action: A detailed description of the action performed (to be further defined).</li></ul></li></ul></li><li>Timestamp:<ul><li>The timestamp must be recorded in the format YYYY-MM-DD HH:MM</li><li>The system must use UTC for all timestamps.</li></ul></li><li>User Identification:<ul><li>The system must accurately capture the full name of the user.</li><li>Each user must be uniquely identifiable within the log entries.</li></ul></li><li>User Type:<ul><li>The user type must be clearly defined and consistently used across all log entries.</li><li>Types include but are not limited to: WasteTrade, Trader, Haulier.</li></ul></li><li>Organisation Information:<ul><li>The organisation name must be logged for every action.</li><li>The organisation must be associated with the user performing the action.</li></ul></li><li>Role of User:<ul><li>The role must be logged and reflect the user's permissions and responsibilities.</li><li>Roles include but are not limited to: Super Admin, Admin, Buyer, Seller.</li></ul></li><li>Action Description:<ul><li>The action description must be detailed enough to understand what was performed.</li><li>Actions may include: login, logout, create listing, update profile, approve application, etc.</li><li>A predefined list of possible actions must be maintained for consistency.</li></ul></li><li>Log Storage:<ul><li>Logs must be stored securely and be accessible for audit purposes.</li><li>The storage solution must comply with relevant data protection regulations.</li><li>Logs must be kept for a minimum period of five years.</li></ul></li><li>Log Retrieval:<ul><li>Admin users must have the capability to search and retrieve logs based on various criteria (e.g., date range, user, action type).</li><li>The system must support exporting logs in a readable format (e.g., CSV, PDF).</li></ul></li><li>Error Handling:<ul><li>Any failure to log an action must trigger an alert to the admin team.</li><li>The system must ensure that logging does not significantly impact performance.</li></ul></li><li>Testing and Validation:<ul><li>The logging functionality must be thoroughly tested to ensure accuracy and reliability.</li><li>Regular audits must be conducted to verify the integrity of the logs.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use case** | **Error message** |
| --- | --- |
| Failed to Export | “Export failed, please try again later” |
| --- | --- |
| Network issues during interaction | "Network error detected. Please check your connection and try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
| Create an audit trail | [https://www.figma.com/design/Py0yzYKckJDBvSryfHKVBc/WT---Platform-(Copy)?node-id=11827-26262&t=BLHkfX1tX9O51wPp-0](https://www.figma.com/design/Py0yzYKckJDBvSryfHKVBc/WT---Platform-%28Copy%29?node-id=11827-26262&t=BLHkfX1tX9O51wPp-0) |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.6.9.2 Download audit trail

- The user will be able to download the audit trail
  - CSV format
- The user will be able to apply the following filters
  - Date Range
  - User
  - Organisation
  - Role
  - Action

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Download Functionality:<ul><li>The system must allow the user to download the audit trail in CSV format.</li><li>The CSV file must include all logged actions with the following details:<ul><li>Timestamp</li><li>Name of User</li><li>Type (WasteTrade, Trader, Haulier)</li><li>Organisation</li><li>Role of User</li><li>Action</li></ul></li></ul></li><li>Filter Options:<ul><li>The user must be able to apply the following filters before downloading the audit trail:<ul><li>Date Range: Users can select a start date and an end date to filter the logs within that specific range.</li><li>User: Users can filter the logs by a specific user.</li><li>Organisation: Users can filter the logs by a specific organisation.</li><li>Role: Users can filter the logs by a specific role (e.g., Super Admin, Admin, Buyer, Seller).</li><li>Action: Users can filter the logs by a specific action.</li></ul></li></ul></li><li>Date Range Filter:<ul><li>The date range filter must allow users to select both start and end dates.</li><li>The system must validate that the end date is not earlier than the start date.</li></ul></li><li>User Filter:<ul><li>The user filter must provide a searchable dropdown list of all users who have performed actions in the system.</li></ul></li><li>Organisation Filter:<ul><li>The organisation filter must provide a searchable dropdown list of all organisations recorded in the audit trail.</li></ul></li><li>Role Filter:<ul><li>The role filter must provide a dropdown list of predefined roles available in the system (e.g., Super Admin, Admin, Buyer, Seller).</li></ul></li><li>Action Filter:<ul><li>The action filter must provide a searchable dropdown list of predefined actions recorded in the audit trail.</li></ul></li><li>CSV Format:<ul><li>The CSV file must have a header row with the following columns:</li><li>Timestamp</li><li>Name of User</li><li>Type</li><li>Organisation</li><li>Role of User</li><li>Action</li><li>Each subsequent row must represent an individual log entry matching the applied filters.</li></ul></li><li>Error Handling:<ul><li>If there are no logs matching the applied filters, the system must display a message: "No audit logs found for the selected filters."</li><li>If the download fails, the system must display a message: "Error downloading audit trail. Please try again later."</li></ul></li><li>Download Button:<ul><li>The system must provide a "Download CSV" button which will initiate the download process.</li><li>The button must be disabled until at least one filter is applied.</li></ul></li><li>User Interface:<ul><li>The filter options must be displayed in a user-friendly manner.</li><li>The download button must be prominently displayed once filters are applied.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| Timestamp | Input Type: DateTime; Constraints: Mandatory; Format: YYYY-MM-DD HH:MM<br><br>, UTC |
| --- | --- |
| Name of User | Input Type: Text; Constraints: Mandatory; Character Limit: 255 |
| --- | --- |
| Type | Input Type: Text; Constraints: Mandatory; Options: WasteTrade, Trader, Haulier |
| --- | --- |
| Organisation | Input Type: Text; Constraints: Mandatory; Character Limit: 255 |
| --- | --- |
| Role of User | Input Type: Text; Constraints: Mandatory; Options: Super Admin, Admin, Buyer, Seller, etc.; Character Limit: 50 |
| --- | --- |
| Action | Input Type: Text; Constraints: Mandatory; Character Limit: 500; Predefined list of actions |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| No logs matching filters | "No audit logs found for the selected filters." |
| --- | --- |
| Download failure | "Error downloading audit trail. Please try again later." |
| --- | --- |
| Date range validation failure | "End date cannot be earlier than start date." |
| --- | --- |
| No filters applied | "Please apply at least one filter to download the audit trail." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

## 6.7 Master page and shared elements

This section describes the elements and components reused throughout the platform(s).

### 6.7.1 Master page (Trading and Hauliers)

#### 6.7.1.1 Master page layout

- The page master page will have a header
- The master page will have a footer

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Consistent Layout:<ul><li>The master page for both Trading and Hauliers platforms must include a uniform header and footer.</li><li>The layout must be consistent across all pages within each platform to maintain a coherent user experience.</li></ul></li><li>Header Design and Functionality:<ul><li>The header should prominently display the platform logo, which should be clickable and redirect to the homepage.</li><li>Include essential navigation links that are relevant to the platform's primary functions, such as trading operations, account settings, and support.</li><li>Ensure the header provides access to critical user information, like login/logout functionality and profile access.</li></ul></li><li>Footer Design and Functionality:<ul><li>The footer must include links to important information such as About Us, Contact Information, Privacy Policy, and Terms of Service.</li><li>Ensure the footer includes social media links if applicable, and provides a secondary navigation for ease of access to less frequently used resources.</li><li>The footer should be designed to be minimalistic yet functional, providing only necessary links to maintain clarity and usability.</li></ul></li><li>Performance and Optimization:<ul><li>The master page should be optimised for fast loading times, with minimal overhead for scripts and style sheets.</li><li>Use efficient code and server-side optimizations to enhance the speed and responsiveness of the page load.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the master page layout across multiple browsers and devices to ensure compatibility and uniformity.</li><li>Conduct user testing to gather feedback on the usability of the header and footer, adjusting design elements based on user preferences and behaviours.</li></ul></li><li>Security Features:<ul><li>Ensure all navigational elements in the header and footer are secure against common vulnerabilities such as cross-site scripting (XSS).</li><li>Regularly update and maintain security measures to protect user data accessible through the master page.</li></ul></li><li>Branding Consistency:<ul><li>The master page should reflect the platform's branding with appropriate use of colours, fonts, and imagery consistent with the platform's overall marketing strategy.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed page load | "Failed to load the page. Please refresh or try again later." |
| --- | --- |
| Navigation error | "Error navigating. Please try again or contact support if the issue persists." |
| --- | --- |
| Inaccessible link or resource | "This resource is currently unavailable. Please check back later or contact support." |
| --- | --- |
| Security or access violation | "You do not have permission to access this resource. Please contact support if you believe this is an error." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.7.1.2 Master page header

- The header will have the following elements
  - Quick action buttons
    - Buy
    - Sell
    - Wanted
  - The header will display the user’s Username and Account type (Buyer/Seller/Trader (buy/sell)/Haulier)
    - The user icon will reveal a sub-menu
      - Settings
      - Logout
  - Notifications icon

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Header Layout and Design:<ul><li>The header must include quick action buttons labelled "Buy", "Sell", and "Wanted". These buttons should be prominently displayed and easily accessible.</li><li>The header design should be consistent with the platform's overall branding and aesthetic guidelines.</li></ul></li><li>User Information Display:<ul><li>Display the user’s username prominently in the header to personalise the user experience.</li><li>Show the user’s account type next to the username, which can include classifications such as Buyer, Seller, Trader (buy/sell), or Haulier.</li></ul></li><li>User Icon and Sub-Menu:<ul><li>Include a user icon in the header, which when clicked, reveals a sub-menu.</li><li>The sub-menu must include the following options:</li><li>Settings: Directs the user to their account settings.</li><li>Logout: Allows the user to log out securely from the platform.</li><li>Notifications: A notification icon that when clicked, shows recent notifications in a dropdown or popup format.</li></ul></li><li>Functionality of Quick Action Buttons:<ul><li>Ensure that each quick action button (Buy, Sell, Wanted) leads the user directly to the respective section or functionality within the platform without delay.</li><li>These buttons should be responsive and provide immediate feedback when clicked.</li></ul></li><li>Security and Data Integrity:<ul><li>Secure the interactions within the header, especially actions like logging out, to prevent unauthorised access and ensure user data safety.</li><li>Ensure that user session information is handled securely, especially when transitioning between logged-in and logged-out states.</li></ul></li><li>Testing and Quality Assurance:<ul><li>Conduct thorough testing to ensure that all elements in the header work as expected across multiple browsers and devices.</li><li>Test the user sub-menu for correct functionality and that all links direct users appropriately without errors.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear error messages or feedback when network or access issues prevent the header from functioning correctly.</li><li>Ensure that the logout process confirms the action either through a confirmation dialog or a success message post-logout.</li></ul></li><li>Performance Optimization:<ul><li>Optimise the header for minimal load times, ensuring that it does not negatively impact the overall performance of the platform.</li><li>Use efficient coding practices to reduce overhead and enhance the user experience.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Logout failure | "Logout failed. Please try again." |
| --- | --- |
| Settings access denied | "Access denied. You do not have permission to view this page." |
| --- | --- |
| Notifications load failure | "Failed to load notifications. Please refresh the page." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.7.1.3 Master page footer

- The footer will have the following elements
  - Social media links (added through admin portal)
    - Icon
  - Accreditations (images uploaded from admin portal)
  - Menu
    - Links to
      - Homepage
      - Marketplace
  - Company pages
    - Links to
      - About
      - Vacancies
      - Privacy Policy
      - Terms & Conditions
  - Help
    - Links to
      - Resources
      - Contact form

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Footer Content and Structure:<ul><li>The footer must include designated areas for social media links, accreditations, and multiple link menus.</li><li>Social media icons must be clearly visible and linked to the respective company pages, managed and updated through the admin portal.</li><li>Accreditation logos or images should be displayed, with the ability to upload and update these images through the admin portal.</li></ul></li><li>Menu Links and Navigation:<ul><li>Ensure the footer contains structured link menus divided into relevant categories:<ul><li>Menu One: Links directly to the Homepage and Marketplace.</li><li>Menu Two: Contains links to About, Vacancies, Privacy Policy, Terms &amp; Conditions, and Help.</li><li>Menu Three: Provides links to Resources and a Contact form.</li></ul></li><li>Each link should direct the user accurately to the respective pages without errors.</li></ul></li><li>Design and Accessibility:<ul><li>The footer design should be consistent with the website's overall aesthetic and easy to navigate.</li><li>Ensure all footer links are accessible, with adequate spacing, legible fonts, and appropriate contrast.</li></ul></li><li>Responsiveness and Performance:<ul><li>The footer must be responsive, displaying correctly on various devices and screen sizes.</li><li>Performance optimisations should be in place to ensure the footer loads quickly without impacting the overall page load times.</li></ul></li><li>Security and Data Integrity:<ul><li>Secure all links, especially those handling user data such as the Contact form, to prevent security vulnerabilities.</li><li>Regularly update links and social media icons to ensure they point to the correct destinations and are free from redirects or malicious sites.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the footer on multiple browsers and devices to ensure all elements function correctly and are displayed as intended.</li><li>Validate that all links are up-to-date and lead to the correct pages, with special attention to external links for security.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear error messages or notifications if any links are broken or if pages are unavailable.</li><li>Implement monitoring to detect and report broken links or security issues within the footer to the admin portal.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Link fails to load | "Unable to load the page. Please check your connection and try again." |
| --- | --- |
| Broken link | "The link appears to be broken. Please contact support for assistance." |
| --- | --- |
| Missing content | "Some content is currently unavailable. Please visit later or contact support." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.7.1.4 Account status banner

- The account status banner is visible to users who have not completed their onboarding
- The account status banner shows the following messages
  - Complete account (all onboarding steps are not complete)
  - Your account is being verified
  - Warning messages
    - Verification failed, please contact the WasteTrade team at &lt;email&gt;
    - &lt;Document Name&gt; is due to expire on &lt;date&gt;. Please upload the latest version to keep your access.
    - Further messages to be decided
      - Example: Your waste permit &lt;Waste permit number&gt; is due to expire, please upload an updated copy
      - Example: Your waste carrier licence &lt;licence number&gt; is due to expire, please upload an updated copy

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Visibility and Display Conditions:<ul><li>The account status banner should be prominently displayed to users who have not completed their onboarding process.</li><li>The banner should be persistent across all relevant pages until the user completes the necessary steps or addresses the issues indicated.</li></ul></li><li>Dynamic Content Display:<ul><li>The banner must dynamically display different messages based on the current status of the user’s account:</li><li>"Complete account" if onboarding steps are incomplete(step 1 and step are not complete).</li><li>"Your account is being verified" during the verification process.</li><li>"Verification failed, please contact the WasteTrade team at [email address]" if verification fails.</li><li>Display specific warnings for document expirations, such as "Your waste permit [Waste permit number] is due to expire on [date], please upload an updated copy" or similar messages for other critical documents like waste carrier licences.<ul><li>Show 30 days from expiry till the document is updated</li></ul></li></ul></li><li>Interactive Elements:<ul><li>Include direct links or buttons within the banner for users to complete actions, such as uploading documents or contacting support.</li><li>Ensure that clicking on these links or buttons directs the user to the appropriate page or opens a pre-addressed email to the support team.</li></ul></li><li>Updating and Configuration:<ul><li>In the admin portal , there is a section to allow admin to update the wording for these case</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the banner for visibility and message accuracy across different user scenarios, including incomplete onboarding, pending verification, and document expiration warnings.</li><li>Validate that all links and interactive elements within the banner function correctly and lead to the intended actions.</li></ul></li><li>Performance and Optimization:<ul><li>Ensure that the banner does not significantly impact page load times or overall system performance.</li><li>Optimise the banner’s implementation to be lightweight and efficient in its resource usage.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Implement error handling for any failures in loading the banner or performing actions from it.</li><li>Provide clear, instructive error messages if the banner cannot display the correct information or if links within the banner fail.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Banner fails to load | "Error loading account status. Please refresh the page." |
| --- | --- |
| Failure to navigate from banner link | "Unable to complete the request. Please try again or contact support." |
| --- | --- |
| Document expiry without update action | "Your document is about to expire. Please update it immediately to maintain access." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

### 6.7.2 Navigation (Trading and Hauliers)

#### 6.7.2.1 Menu - trading platform

####

- The traders will see the following items on their burger menu
  - Create listing
  - Create wanted listing
  - My Listings
    - Sales
    - Wanted
  - My Offers
    - Selling
    - Buying
  - Recently viewed
  - Favourites

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Menu Layout and Accessibility:<ul><li>The trading platform must feature a 'burger' menu (often called a hamburger menu) that is easily accessible from all main interfaces of the platform.</li><li>This menu should be intuitive to use, with a clear icon indicating its presence and functionality.</li></ul></li><li>Menu Content:<ul><li>The menu must include the following items, each leading to the respective sections of the platform:<ul><li>Create listing -&gt; Create new Sell item</li><li>Create wanted listing -&gt; Create new Wanted Listing</li><li>My Listings -&gt; view the list Sell/Wanted item posted by user<ul><li>Sales</li><li>Wanted</li></ul></li><li>My Offers -&gt; view the list of Selling / Buying Offers<ul><li>Selling</li><li>Buying</li></ul></li><li>Recently viewed</li><li>Favourites</li></ul></li></ul></li><li>Functional Links:<ul><li>Each menu item should be linked correctly to its corresponding page or section within the platform. For example, 'Create listing' should direct users to the page where they can list a new item for sale.</li><li>Ensure that these links are tested and fully operational, with no dead links or incorrect redirections.</li></ul></li><li>User Role Verification:<ul><li>Verify that all menu items are appropriate and relevant to the traders' roles and permissions on the platform.</li></ul></li><li>Performance and Efficiency:<ul><li>Ensure the menu operates efficiently without causing delays in page loading or navigation.</li><li>Optimise the menu for quick access and minimal performance overhead to enhance the overall user experience.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed navigation from menu | "Error navigating to the requested section. Please try again." |
| --- | --- |
| Access denied to a section | "You do not have access to this section. Please contact support if this is an error." |
| --- | --- |
| Loading error for a menu item | "Failed to load the requested content. Please refresh the page or try again later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.7.2.2 Menu - hauliers platform

- The hauliers will see the following items on their burger menu
  - Available loads
  - Current offers
  - Edit profile

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Menu Layout and Accessibility:<ul><li>Ensure that the 'burger' menu is easily accessible on all main interfaces of the hauliers platform.</li><li>The menu should be intuitive, with a clear icon indicating its functionality and should be consistently located across different pages for ease of use.</li></ul></li><li>Menu Content:<ul><li>The menu must include the following items, tailored specifically for haulier users:</li><li>Available loads: Directs users to a list of available loads for transport.</li><li>Current offers: Shows offers that the haulier has either made or received.</li><li>Edit profile: Allows hauliers to update their profile information.</li></ul></li><li>Functional Links:<ul><li>Ensure each menu item is correctly linked to its corresponding page or section within the platform.</li><li>Links should be tested to ensure they lead users directly to the intended areas without error.</li></ul></li><li>Design Consistency:<ul><li>The design of the menu should be consistent with the overall aesthetic of the hauliers platform, using suitable fonts, colours, and styles that reflect the brand and enhance usability.</li></ul></li><li>Responsiveness:<ul><li>The menu must function correctly across different devices and screen sizes, ensuring a consistent and reliable user experience for all hauliers.</li><li>Design the menu to collapse or expand in a responsive manner, suitable for both mobile and desktop views.</li></ul></li><li>Error Handling:<ul><li>Provide clear and informative error messages if menu items fail to load or if navigation issues occur.</li><li>Errors should guide the user on how to resolve the issue or direct them to contact support for assistance.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Navigation failure from menu item | "Unable to navigate to the selected section. Please try again." |
| --- | --- |
| Load failure for menu content | "Failed to load content. Please refresh the page or try again later." |
| --- | --- |
| Unauthorised access | "You do not have permission to view this page. Please contact support if you believe this is an error." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.7.2.3 Admin menu

- The admin portal will have a burger menu
- The menu will have the following items
  - Homepage
  - Sales management
  - User management
  - Document management
  - Content management
  - Analytics (management information)
  - Settings
    - Materials
    - Currency/cost calculator
    - Notifications

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Menu Layout and Accessibility:<ul><li>Ensure the admin portal features a 'burger' menu that is easily accessible from all main interfaces of the admin section.</li><li>The menu should be intuitive, with a clear icon indicating its functionality and should be consistently located across different admin pages for ease of access.</li></ul></li><li>Menu Content:<ul><li>The menu must include the following items, each leading to their respective sections of the admin portal:<ul><li>Homepage</li><li>Sales management</li><li>User management</li><li>Document management</li><li>Content management</li><li>Analytics (management information)</li><li>Settings<ul><li>Materials</li><li>Currency/cost calculator</li><li>Notifications</li></ul></li></ul></li></ul></li><li>Functional Links:<ul><li>Ensure each menu item is correctly linked to its corresponding administrative function or page within the portal.</li><li>Links should be tested to ensure they direct admins to the intended areas without error, facilitating efficient management tasks.</li></ul></li><li>Design Consistency:<ul><li>The design of the menu should be consistent with the overall aesthetic of the admin portal, using suitable fonts, colours, and styles that reflect the brand and enhance usability.</li></ul></li><li>Responsiveness:<ul><li>The menu must function correctly across different devices and screen sizes, ensuring a consistent and reliable user experience for all administrators.</li><li>Design the menu to collapse or expand in a responsive manner, suitable for both mobile and desktop views.</li></ul></li><li>Performance and Efficiency:<ul><li>Ensure the menu is optimised for performance, with minimal load times and smooth transitions between menu activation and page navigation.</li><li>The menu should not impede the overall performance of the admin portal, ensuring quick access to its features.</li></ul></li><li>Testing and Validation:<ul><li>Conduct extensive testing to validate that the menu provides correct navigation and functions as expected across various administrative scenarios and device types.</li><li>Test for user acceptance to ensure the menu meets the needs and expectations of admin users, particularly in terms of ease of use and accessibility.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Navigation failure from menu item | "Unable to navigate to the requested section. Please try again." |
| --- | --- |
| Unauthorised access to a menu section | "You do not have permission to access this section. Please contact the administrator if this is an error." |
| --- | --- |
| Menu load failure | "Failed to load menu options. Please refresh the page or contact technical support." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

### 6.7.3 Shared Elements (Trading platform)

The shared elements will also be used within the trader’s app, the designs will be optimised for all device types.

#### 6.7.3.1 Filters panel

- On the trading platform, a search and filter panel is visible on the Buy, Sell, and Wanted pages
- The filter panel has the following elements
  - Search bar
  - Filter by
    - All of the following are type-ahead dropdown fields
      - Location
      - Material type/group
      - Material
      - Packed
    - The following are checkboxes
      - Stored
        - All
        - Indoors (show number of listings)
        - Outdoors (show the number of listings)
      - Sold listings
        - Hide sold listings
- There will be a button which will allow the user to “clear all filters”

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Panel Placement and Visibility:<ul><li>Ensure the search and filter panel is prominently placed on the Buy, Sell, and Wanted pages of the trading platform.</li><li>The panel must be easily accessible and visible without needing to scroll or navigate away from the main content.</li></ul></li><li>Design and Responsiveness:<ul><li>The design of the filter panel should be optimised for all device types, including desktops, tablets, and smartphones.</li><li>Ensure that the layout and functionality of the panel remain user-friendly and intuitive across different screen sizes and orientations.</li></ul></li><li>Functional Elements:<ul><li>Incorporate a search bar that allows users to enter keywords relevant to their interests in buying, selling, or wanted listings.</li><li>Include typeahead dropdown fields for:</li><li>Location: Allows users to type and select a location. (Location will be taken from the Warehouse location default to filter)</li><li>Materials:<ul><li>Lists all material type + item selections as “Material type - item”<ul><li>Defined in <a href="https://docs.google.com/spreadsheets/d/1_RqEAiolZMBvuzi-A5oO3d2dpISdIX5mgrBNy0z5bpY/edit?gid=0#gid=0">Materials Options</a></li><li>E.g. “Plastic - LDPE”, “Metal - Aluminium”, “Rubber - Natural Rubber”.</li></ul></li><li>Options will be listed alphabetically,</li></ul></li><li>Packed: Allows users to select packaging types.</li></ul></li><li>Checkbox Filters:<ul><li>Provide checkboxes for additional filter options such as:<ul><li>Stored: To filter listings based on their storage status.<ul><li>Indoors: Filters listings stored indoors, showing the number of available listings.</li><li>Outdoors: Filters listings stored outdoors, showing the number of available listings.<ul><li>The user will be able to select both options to display listings with storage defined as “both”.</li><li>Default display is both selected.</li></ul></li></ul></li><li>Show Sold Listings: Sold items will be hidden as default.<ul><li>Include an option to ‘Show sold listings', allowing users to show already sold items.</li></ul></li></ul></li></ul></li><li>Interaction and Usability:<ul><li>Ensure that all dropdowns and checkboxes are easy to interact with, including clear labelling and adequate spacing for touch inputs on mobile devices.</li><li>Dropdowns should provide immediate feedback and update the available listings based on the selected filters without page reloads.</li></ul></li><li>Clear All Filters Button:<ul><li>Include a 'Clear all filters' button that resets all selected filters to their default states, providing users with a quick way to start a new search without manually deselecting each option.</li></ul></li><li>Performance and Efficiency:<ul><li>Optimise the performance of the filter panel to ensure that filter updates are quick and do not hinder the user experience.</li><li>Ensure that the backend handling the filters can efficiently process requests, especially when multiple filters are applied simultaneously.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that the filter panel functions correctly across all specified devices and browsers.</li><li>Test the panel under various user conditions to ensure robustness, particularly with simultaneous multiple filter applications.</li></ul></li><li>Error Handling and Feedback:<ul><li>Provide informative error messages or feedback when filters fail to load or apply correctly.</li><li>Implement a system to gracefully handle and report errors without causing disruption to the user's navigation on the platform.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Filter application fails | "Failed to apply filters. Please try again." |
| --- | --- |
| Search with no results | "No results found. Please adjust your search criteria." |
| --- | --- |
| Mandatory filter not selected | "Please complete all required filter fields to proceed." |
| --- | --- |
| Error loading filter options | "Error loading options. Please refresh the page or try again later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=15014-19819&t=IVhglljfj5q67hEA-11> |
| --- | --- |

| **Client Approved** |     |
| --- | --- |

#### 6.7.3.2 Unsuccessful search

- If the search term does not return a result, the page will show a call to action
  - Heading: Not finding what you need?
  - Subheading: Click the button to list a required material
  - Button: [List wanted material](#_2xmyrdkvzaao)
    - Clicking on the button will lead the user to create a listing flow for wanted material

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Unsuccessful Search Result Handling:<ul><li>Ensure that when a search query returns no results, the page automatically displays a specific call to action to guide the user.</li><li>This should be implemented on all relevant search pages within the trading platform where user searches are possible.</li></ul></li><li>Content Display for No Results:<ul><li>Display a clear and prominent heading: "Not finding what you need?"</li><li>Follow the heading with a subheading: "Click the button to list a required material."</li><li>These messages should be displayed in a central location on the page to ensure maximum visibility.</li></ul></li><li>Call to Action Button:<ul><li>Include a button labelled "List wanted material" that is easily visible and accessible to users.</li><li>The design and placement of the button should be consistent with the platform’s UI guidelines to maintain design continuity.</li></ul></li><li>Button Functionality:<ul><li>Configure the button so that clicking it leads the user directly to the create listing flow specifically designed for listing wanted materials.</li><li>Ensure that the transition from the unsuccessful search result page to the listing flow is seamless and intuitive.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that the no results page and its elements function as expected under various scenarios, including different search terms and user states.</li><li>Validate that the redirection to the create listing flow works correctly and without errors.</li></ul></li><li>Error Handling and User Feedback:<ul><li>Provide clear, user-friendly error messages if there is an issue with the transition to the listing flow.</li><li>Implement error tracking to monitor and address any recurring issues users face during this process.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
|     |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed to load search results | "Failed to load results. Please check your connection and try again." |
| --- | --- |
| Button malfunction | "Unable to process the request. Please try again or contact support." |
| --- | --- |
| Navigation error to listing flow | "Error navigating to the listing page. Please try again." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.7.3.3 Listing card (product card)

- The product card is a summary view of each listing (buy/sell/wanted)
- The same basic card is used to display the listing
- The card has the following elements
  - Product name
  - Image/placeholder
  - Quantity available
  - Country
- The “wanted” card has the following additional items
  - Availability status
    - Required/required from
    - Fulfilled
- The “sales listing” card has the following additional items
  - Availability status
    - Available/available from
    - Expired
    - Sold
    - Ongoing
- Clicking on the card will redirect the user to the listing page (product page)

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>General Card Design and Layout:<ul><li>Ensure each product card (buy/sell/wanted) provides a summary view of the listing and is consistent in design across different listing types to maintain a uniform user experience.</li><li>The card must be visually appealing and easy to read, with a clean and organised layout.</li></ul></li><li>Mandatory Elements on All Cards:<ul><li>Product Name: Clearly displayed at the top of the card.</li><li>Image/Placeholder: Each card must include an image of the product or a placeholder if no image is available.</li><li>Material of Interest: Listings that match the users Materials of interest will display the Material of Interest icon and text:<ul><li><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZ4AAACGCAYAAADtjuxNAAAMSmlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU8kWnltSIQQIREBK6E0QkRJASggtgPQiiEpIAoQSY0JQsaOLCq5dRLCiqyCKHRCxYVcWxe5aFgsqK+tiwa68CQF02Ve+d75v7v3vP2f+OefcuWUAoLfzpdIcVBOAXEmeLCbYnzUuKZlF6gQIQAEVeAINvkAu5URFhQNoA+e/27ub0BvaNQel1j/7/6tpCUVyAQBIFMRpQrkgF+KDAOBNAqksDwCiFPLmU/OkSrwaYh0ZDBDiKiXOUOEmJU5T4St9PnExXIifAEBW5/NlGQBodEOelS/IgDp0mC1wkgjFEoj9IPbJzZ0shHguxDbQB85JV+qz037QyfibZtqgJp+fMYhVufQZOUAsl+bwp/+f5fjflpujGJjDGjb1TFlIjDJnWLcn2ZPDlFgd4g+StIhIiLUBQHGxsM9fiZmZipB4lT9qI5BzYc0AE+Ix8pxYXj8fI+QHhEFsCHG6JCcivN+nMF0cpPSB9UPLxHm8OIj1IK4SyQNj+31OyCbHDMx7M13G5fTzz/myvhiU+t8U2fEclT6mnSni9etjjgWZcYkQUyEOyBcnRECsAXGEPDs2rN8npSCTGzHgI1PEKHOxgFgmkgT7q/Sx0nRZUEy//85c+UDu2IlMMS+iH1/Ny4wLUdUKeyLg98UPc8G6RRJO/ICOSD4ufCAXoSggUJU7ThZJ4mNVPK4nzfOPUY3F7aQ5Uf3+uL8oJ1jJm0EcJ8+PHRibnwcXp0ofL5LmRcWp4sTLs/ihUap48L0gHHBBAGABBWxpYDLIAuLWrvoueKXqCQJ8IAMZQAQc+pmBEYl9PRJ4jAUF4E+IREA+OM6/r1cE8iH/dQir5MSDnOroANL7+5Qq2eApxLkgDOTAa0WfkmQwggTwBDLif0TEh00Ac8iBTdn/7/kB9jvDgUx4P6MYmJFFH/AkBhIDiCHEIKItboD74F54ODz6weaMs3GPgTy++xOeEtoIjwg3CO2EO5PEhbIhUY4F7VA/qL8+aT/WB7eCmq64P+4N1aEyzsQNgAPuAufh4L5wZlfIcvvjVlaFNUT7bxn8cIf6/ShOFJQyjOJHsRk6UsNOw3VQRVnrH+ujijVtsN7cwZ6h83N/qL4QnsOGemKLsAPYOewkdgFrwuoBCzuONWAt2FElHlxxT/pW3MBsMX3xZEOdoWvm+51VVlLuVOPU6fRF1ZcnmpanfBi5k6XTZeKMzDwWB34xRCyeROA4guXs5OwKgPL7o3q9vYnu+64gzJbv3PzfAfA+3tvbe+Q7F3ocgH3u8JVw+Dtnw4afFjUAzh8WKGT5Kg5XHgjwzUGHT58+MAbmwAbm4wzcgBfwA4EgFESCOJAEJsLoM+E6l4GpYCaYB4pACVgO1oBysAlsBVVgN9gP6kETOAnOgkvgCrgB7sLV0wFegG7wDnxGEISE0BAGoo+YIJaIPeKMsBEfJBAJR2KQJCQVyUAkiAKZicxHSpCVSDmyBalG9iGHkZPIBaQNuYM8RDqR18gnFEPVUR3UCLVCR6JslIOGoXHoBDQDnYIWoAvQpWgZWonuQuvQk+gl9Abajr5AezCAqWFMzBRzwNgYF4vEkrF0TIbNxoqxUqwSq8Ua4X2+hrVjXdhHnIgzcBbuAFdwCB6PC/Ap+Gx8CV6OV+F1+Gn8Gv4Q78a/EWgEQ4I9wZPAI4wjZBCmEooIpYTthEOEM/BZ6iC8IxKJTKI10R0+i0nELOIM4hLiBuIe4gliG/ExsYdEIumT7EnepEgSn5RHKiKtI+0iHSddJXWQPpDVyCZkZ3IQOZksIReSS8k7ycfIV8nPyJ8pmhRLiiclkiKkTKcso2yjNFIuUzoon6laVGuqNzWOmkWdRy2j1lLPUO9R36ipqZmpeahFq4nV5qqVqe1VO6/2UO2jura6nTpXPUVdob5UfYf6CfU76m9oNJoVzY+WTMujLaVV007RHtA+aDA0HDV4GkKNORoVGnUaVzVe0il0SzqHPpFeQC+lH6BfpndpUjStNLmafM3ZmhWahzVvafZoMbRGaUVq5Wot0dqpdUHruTZJ20o7UFuovUB7q/Yp7ccMjGHO4DIEjPmMbYwzjA4doo61Dk8nS6dEZ7dOq063rraui26C7jTdCt2juu1MjGnF5DFzmMuY+5k3mZ+GGQ3jDBMNWzysdtjVYe/1huv56Yn0ivX26N3Q+6TP0g/Uz9ZfoV+vf98AN7AziDaYarDR4IxB13Cd4V7DBcOLh+8f/pshamhnGGM4w3CrYYthj5GxUbCR1Gid0SmjLmOmsZ9xlvFq42PGnSYMEx8Tsclqk+Mmf7B0WRxWDquMdZrVbWpoGmKqMN1i2mr62czaLN6s0GyP2X1zqjnbPN18tXmzebeFicVYi5kWNRa/WVIs2ZaZlmstz1m+t7K2SrRaaFVv9dxaz5pnXWBdY33PhmbjazPFptLmui3Rlm2bbbvB9oodaudql2lXYXfZHrV3sxfbb7BvG0EY4TFCMqJyxC0HdQeOQ75DjcNDR6ZjuGOhY73jy5EWI5NHrhh5buQ3J1enHKdtTndHaY8KHVU4qnHUa2c7Z4FzhfP10bTRQaPnjG4Y/crF3kXkstHltivDdazrQtdm169u7m4yt1q3TncL91T39e632DrsKPYS9nkPgoe/xxyPJo+Pnm6eeZ77Pf/ycvDK9trp9XyM9RjRmG1jHnubefO9t3i3+7B8Un02+7T7mvryfSt9H/mZ+wn9tvs949hysji7OC/9nfxl/of833M9ubO4JwKwgOCA4oDWQO3A+MDywAdBZkEZQTVB3cGuwTOCT4QQQsJCVoTc4hnxBLxqXneoe+is0NNh6mGxYeVhj8LtwmXhjWPRsaFjV429F2EZIYmojwSRvMhVkfejrKOmRB2JJkZHRVdEP40ZFTMz5lwsI3ZS7M7Yd3H+ccvi7sbbxCvimxPoCSkJ1QnvEwMSVya2jxs5bta4S0kGSeKkhmRSckLy9uSe8YHj14zvSHFNKUq5OcF6wrQJFyYaTMyZeHQSfRJ/0oFUQmpi6s7UL/xIfiW/J42Xtj6tW8AVrBW8EPoJVws7Rd6ilaJn6d7pK9OfZ3hnrMrozPTNLM3sEnPF5eJXWSFZm7LeZ0dm78juzUnM2ZNLzk3NPSzRlmRLTk82njxtcpvUXlokbZ/iOWXNlG5ZmGy7HJFPkDfk6cAf/RaFjeInxcN8n/yK/A9TE6YemKY1TTKtZbrd9MXTnxUEFfwyA58hmNE803TmvJkPZ3FmbZmNzE6b3TzHfM6COR1zg+dWzaPOy573a6FT4crCt/MT5zcuMFowd8Hjn4J/qinSKJIV3VrotXDTInyReFHr4tGL1y3+ViwsvljiVFJa8mWJYMnFn0f9XPZz79L0pa3L3JZtXE5cLll+c4XviqqVWisLVj5eNXZV3WrW6uLVb9dMWnOh1KV001rqWsXa9rLwsoZ1FuuWr/tSnll+o8K/Ys96w/WL17/fINxwdaPfxtpNRptKNn3aLN58e0vwlrpKq8rSrcSt+VufbkvYdu4X9i/V2w22l2z/ukOyo70qpup0tXt19U7Dnctq0BpFTeeulF1Xdgfsbqh1qN2yh7mnZC/Yq9j7x77UfTf3h+1vPsA+UHvQ8uD6Q4xDxXVI3fS67vrM+vaGpIa2w6GHmxu9Gg8dcTyyo8m0qeKo7tFlx6jHFhzrPV5wvOeE9ETXyYyTj5snNd89Ne7U9dPRp1vPhJ05fzbo7KlznHPHz3ufb7rgeeHwRfbF+ktul+paXFsO/er666FWt9a6y+6XG654XGlsG9N27Krv1ZPXAq6dvc67fulGxI22m/E3b99KudV+W3j7+Z2cO69+y//t89259wj3iu9r3i99YPig8nfb3/e0u7UffRjwsOVR7KO7jwWPXzyRP/nSseAp7WnpM5Nn1c+dnzd1BnVe+WP8Hx0vpC8+dxX9qfXn+pc2Lw/+5fdXS/e47o5Xsle9r5e80X+z463L2+aeqJ4H73LffX5f/EH/Q9VH9sdznxI/Pfs89QvpS9lX26+N38K+3evN7e2V8mX8vl8BDCi3NukAvN4BAC0JAAbcN1LHq/aHfYao9rR9CPwnrNpD9pkbALXwnz66C/7d3AJg7zYArKA+PQWAKBoAcR4AHT16sA3s5fr2nUojwr3B5tivablp4N+Yak/6Q9xDz0Cp6gKGnv8F5qiDDL0N0vUAAAA4ZVhJZk1NACoAAAAIAAGHaQAEAAAAAQAAABoAAAAAAAKgAgAEAAAAAQAAAZ6gAwAEAAAAAQAAAIYAAAAAXSEE5wAAHNpJREFUeAHtnQeQFEUXx99xx8GREUVFARVQENHCHDHnHDFrmXPOOccy51QmFHPOCcX4aSlmDGBCEVAEiQcX9uv/4Bt6Z2fzbe/O3P9V3c3sTMdfz87r1/26typhRCgkQAIkQAIk4IhAG0f5MBsSIAESIAES8AhQ8fBBIAESIAEScEqAiscpbmZGAiRAAiRAxcNngARIgARIwCkBKh6nuJkZCZAACZAAFQ+fARIgARIgAacEqHic4mZmJEACJEACVDx8BkiABEiABJwSoOJxipuZkQAJkAAJUPHwGSABEiABEnBKgIrHKW5mRgIkQAIkQMXDZ4AESIAESMApASoep7iZGQmQAAmQABUPnwESIAESIAGnBKh4nOJmZiRAAiRAAlQ8fAZIgARIgAScEqDicYqbmZEACZAACVDx8BkgARIgARJwSoCKxyluZkYCJEACJEDFw2eABEiABEjAKQEqHqe4mRkJkAAJkAAVD58BEiABEiABpwSoeJziZmYkQAIkQAJUPHwGSIAESIAEnBKg4nGKm5mRAAmQAAlQ8fAZIAESIAEScEqAiscpbmZGAiRAAiRAxcNngARIgARIwCkBKh6nuJkZCZAACZAAFQ+fARIgARIgAacEqHic4mZmJEACJEACVDx8BkiABEiABJwSoOJxipuZkQAJkAAJUPHwGSABEiABEnBKgIrHKW5mRgIkQAIkQMXDZ4AESIAESMApASoep7iZGQmQAAmQABUPnwESIAESIAGnBKh4nOJmZiRAAiRAArFVPPU/PsvWJQESIAESqEACNRVYppyL1DRjgjRO/U6apo+Xppm/S/OcKZJomC3N9dO9NJpnTZSGyWOkTYeeUt15aanutpzU9Bgk1V1655wHA5IACZAACbQsgaqEkZZNsrSpNU4dK/MnjJb5E/8nzbP+zDmz6m79pKq61iiqsdKm05JS22stqe09zFNEOSfCgCRAAiRAAkUTiIzimf/bKKkf94I0/v1t0ZW2E6hZdEVp3387qe2zsX2Z5yRAAiRAAiUiUPGKp2HSpzL3mxHekFqJGHjJ1vQYKHWD95W2S6xWymyYNgmQAAm0egKVq3gSzTJ7zG0yz1g5LqWdsX46Dj1SpCq2fhcucTIvEiABEkghUJGKp2naOJn365vS9O+v0mQcBJpnT04peKkvdNn8Jqnp3r/U2TB9EiABEmh1BCpO8TQYp4FZH14uiaZ5ZW2Mqup20mmdM6Rtr7XLWg5mTgIkQAJxI1BRiqdh0mcyc/TZFcW4bsgBUjdoz4oqEwtDAiRAAlEmUDETGXBzrjSlg4ad+9X9Uj/2sSi3MctOAiRAAhVFoCIUT6OZ05nx5kkVBcYuTPO86YIyUkiABEiABIonUH7FA++1T64rviYlTKH+h6cXlNGUlUICJEACJFAcgbIrHrhMN03/qbhaOIiNMqKsFBIgARIggeIIlFXxYHFoIet02vZcWbpsdGVxNS8gNsqKMlMqn8CsWbMqv5AsIQm0UgJlVTzYkSBfgdLpbJROjTni3Km0qfF2UXCR5w033CAbb7yxbLPNNvLzzz/nnOW3334rW2yxhRf3gQceyDleXAI2NjbKTjvtJJ07d5Y111xTJk2a1OJVu+uuuzy+O+ywgzQ3l2/49euvv5YLLrhAhg8f7rX5pptuKn/+mdv+hW+//bZXB8SZOHFiizNigiSQiUDZdqfG3mvYWTofUaWjcWoWW1kapnypH0t/bG70yoyyl3pvt48//ljwcoAccsgh8sYbb0hVVZX3Od0/vHQPPPBA+eSTT7wgq666arqgsb0OZs8+u+AnMcBh5MiRcuKJJ7ZofT/77DO/baB42rRx33977rnnZMcdd0yp119//SVLLrlkyvXghXHjxvl1mDx5svTq1SsYhJ9JoGQE3H9j/qsKNvzMR4JKB3Eb/3KodKzC5lt2K2pBp2+99ZbcfffdWeNef/31vtLJGriIADNmzJDddttN0OMfPXp0ESm1fNTFFlssKdFFF1006XMcPkybNi1J6Sy33HKyxx57yEknnSR9+vSpqCp++umn3nMCK3TKlCkVVbZKKExr5VMWiwdrdvLZZTpM6eChcWrtWE8pyo464Ld9XMlhhx0mW265ZdoXy/fffy+nnnqqk+JMnz5dnnzySS+vrbfeWoYNG+Yk31wyWWWVVeSaa66Rp556StZbbz3Zddddc4kWqTAffPCBX97tt99eHn/8cWnXrp1/rZJOfvjhB3n++ee9Il188cXSs2fPSipe2cvSWvmURfHg93RylaDSaTRDa5jfgeBemLhQSKiDS8WDekL5vPzyyylDbk1NTXLwwQeHoWiV19Dzx19c5ffff/erdvzxx1es0vELyRMSCBAoy1AbfsQtV6lbcR8/6My3T/fPcQIng7A/Fx5v+dQhqdAFfFh55QUK9tVXX5X7778/JYXbb79d3n//fe/6JptsknKfF+JF4N9///Ur1LdvX/+cJyQQFQLOLR78XHU+vxyq1s3cbx7yhtagaLKJxskWrpj7qAPq4uJntO+77z5RR4HjjjtONt98c1lqqaW84sPj7ZhjjvHO4cl16623ysCBA3OqGibfMWT2008/ydSpU6Vjx45e3LXWWkt23nnnlEnzjz76yJu4x1CbyhNPPCG//fabfvTiwZssTDDxj2EXDAsiv/79+8uAAQM8LzRVrmHxoFh//fVXwTDannvu6eWHeS/8de3aVdZff33Ps0vjYj4M3n1I+8gjj9TLKccJEyYIPP9QHvV+W2GFFWTFFVeU/fff3+OREqmFLowZM0YeffRRwSQ/+C299NKCvPfZZx9ZaaWVUnKZP3++XH755VJfXy/vvvuuf/+6666TLl26eJ9ra2vljDPOkLq6Ov9+oSevvfaajBo1Sjp16iRnnXWWwIPuzTffFDhW/PHHH95zMmTIENlvv/1COT300ENenC+++MIvwrXXXitLLLGE9xmOMnD6CM7J4SacZMAGnSm0DRw40Jbgg/zSDdeBDRiBFeaU8Bx/+eWXXrk//PBDL41tt91W1l13Xb9MeoJ2ePDBB2Xs2LGC5wIOGssvv7xsuOGGguHkbIL2hAMQvo+Yy0J58bzib9CgQSnRi+GTklgUL+Cnr11K/U+vJaY+ulXOf1q2GaNO8+LgmO6vYfIXGjzn9PMpSzAs6lIq2XvvvfGT5N4f8jj33HP9z2Zc38vWfCETRgn51++9996EWb/ifzbDTaHFM1+MpHiaj31ce+21E999911S/AsvvNBP2w5rn1922WVJcfDBeFplzc8oz8S8efNS4uKCmTz38jXWXMJYfaFlaGho8OOuscYaXhijzPxr9gnCnnDCCaHpaF3Myy3x0ksv2dH88yOOOMKPa+frB8hwMnPmzIRR6n58zc8+Gs/EhHmJJqViPM8yxtH4v/zyS1K8dB+MS7ifnlEmKcHsOtphNR89GoWZMB2KlPgbbLCBn76GDR7fe++9lHimM+S3dzA8PpvOVeKOO+5IiYcLRmH4eV5yySWJ888/3/+saeEZssUouazPAr5jpnNgR/PP8V3C91HTDzsaBZvybBfKx8844ifuLZ7p403bFC6Z5m/UGoJ15EKavLps7iIrr9eJXqBORo4YMcLr2b3++ute/rCCDjjgAJkzZ07G8pgXpWy00UaeRaAB0bMzXwSZO3euZ5GYl6PAutlll128Hq5OXK+22mqy++67CxZnYq4JAksFPVEVWB+2wAMOThHoKUNglWFCvEePHvLNN994Vguu33zzzV7P+YorrsDHUFErJ3jTKBqpqcn9UYbVeNttC3ehQA96s8028ywFWBNgjF4r1lD9+OOPnmUWzLOQz+CLNG2LBZZl7969Zfz48fLiiy96ycLChUUIBwmtF6wYtBPaF0NtaCMIyg5LB4IjLJSWlkMPPdRLEpYgWP/9999+WTHfhPaEZWK7ceMarBvUS9sew8BodwgsHtTHFlhVCKN1g7ce1rK1bdvW856EFYt7hx9+uMcskyVy5ZVX+unYecAKsgWjBbCoVVDuZZdd1lsPBacNCL5je+21lxgF67cHrsMy22qrrfz64Rq+R4MHDxY4gMDagsAqxfIIo2i9z/hXCB8/chxOXCvOGe+cnZc1ouVTiydodejnOV+P0KAJnOv1Uh/9TFv4JGjxIHkzXJC2Z2WGy7wSZLN4zNCSnwZ6j+Ylm1Ry46qb1IMzCiHpPj6YYS8/DTO0l3LfvoCep/meeH/o5f3zzz/27YRRcP59hAvrfavFo+kYb7WEeRkk0NuEVWaUQ1KamSwehNV0cDRDhUlxYcHYlh2sk6DY1kA+Fs8tt9zi5406gaMtaAtYWlq+xx57zL7tn5vhJD+MWTDqX8/nxLZiwpjbdUR5zNxiAha2Cp43M/zrl8M4vuitpOPDDz/shzEv4qR7wQ+wRrTusNZttsjb5odn1yjypCRsi0fTMUrTe8bw3KGesL5VzFIAPz+kF7TwzZBiwihbP8xNN92kUb0jLGLNB1bq7Nmzk+7DSjVu7n6Yzz//POk+PuTDJyVyhC84dy5wMScStiMCPOCy/ZmHqKLFDH+FukzDWkAvLRfBYkFYHRAzNOeNRdvxunXrltQDhOVTqMC6uvHGG/3od955p3Tv3t3/jBP0QK+66ir/GhZGZhL0FNHzhIWC+QFYW5grylUwPwErAQLLJ+huDQvj7LPP9uZ5EAbj9i0h5h3hzT9oWrBqgmtuMC9gr9fKZP1pOi6OZ555pjfnZS9gxvMGC1wFbVKMfPXVV771C0vn0ksvTbIukPdRRx3lz7fA8rHdysPyBj88c3jG8NwNHTpU7HVdRpH40fCc2pY7bmBR7T333OOHeeSRR/xznGANjspFF10kHTp00I/eEc+ZGRb0r6lbuX+hFZ84VzxSoh2e6wYv8H4LG2ZbZI+XQ73fgh5xdYP3rfhHAVuk4IupgrUqpneqH7MeTznlFMHwl+mdpbx0NTK+cJqHDhfovXyOGKbCkBXk5JNPTuv0YOZb/PyyKR68IHT4KZ+yaFhMFkP5YtgLQyBhUl1d7Q1H4h5ecKa3HBYsr2uYdFY36IMOOsgbkglLAIoVw28QDFHZHmxh4V1cg8NDmEDhY4gXguFJTOoXKpj8V8FC6Pbt2+vHpCM6WSpwgEgneH7xzGWSV155xbsNxx04k4QJOnu6VAHODli8q2Lv9gCnhDBBRw7D4nCswFZWlAUEnCueUqz6txVG0Nqx72VrdFVe2cL596uc4/N6Vegtq6CHjBdlvhLsnQXj63g9PIUKFX3RIv4666yTNhmM4esiVCirdALPr2WWWSbd7byu48WWaasbtYqQqHF6yCvtsMB4Matg3iKTYP80FXhblVu0ExJWDttjq5hnBV6LKphHSicoi7YNvDHTCRhm6qBgnlLnktB5y/Qs2POW8HhTQSdBBfOYWLhsKya9B8UND7503p4arjUdc5+RbSkqBVo86jiQqRhh1o4qE9wLKiVNK7hIVa9nPRZYl6zpZgmACUx8yTH8oBPLWaKk3IYlggl2uFTjZW+/GFMCF3jBfmE/88wznqtquqTUssLLAO6zYS+CfIbU0uWj18EPrtToNaP+sEj0RaRhWvJop60vznTp2/fteOnCl/o6OgbpJJ1lki58uuv2s2LmcjIuioW1CrHd+oPpBocxg/dt6wyWpZmLDAbxP+uziQt2e2CoFwpFLWeMJuAPLtsYwt1uu+1C3cX9hFvxiXvFkydsKAxVHtmiBhWLbe0E72VLK5f77QfskEuwkoRRT7NCEsdQBr4wpRbM8ahguCFXwUsobC1KmDLKNU07HLzj4KWkw4D2vVKdY2hTJVvb2S9zO57Gj+PRflYyKQG77pk8OO35KDuOntv5YQhNF2Dr/XTHoFWHITRYMthVRJUSvBPVQxFWEearsOaJspBABBTPiJw2Aw1zs1aFFWYJLURQzFlVMZHLEhcKwFY6mE/ABpNw6cViTBUMD9g9Pb2ez9FWHnDF1cWDmdLAItZMPexMcXO5h7F4eygL4/twz4U1hYlnVW7oddtutrmknSmMXSdscZRJ7JdiNiWVKZ0o3bOfFVj0Nq909cD8S6FiK3dYmGGLdsPSxnBvULCoGTuFY4kBvl9PP/20HwQOBfjD3OSxxx7rX2/tJxWveNBAYUolW8PZ1k62sAXfL8McT8Fl/S8iNmpUMe6gvpeQXtOjrYT0Wr5H9Z5DPIx/Y81DucWenDaLcgXeSGGic1xh9wq5ZrPQnnG6dGyHglKsy0mXbzmv6+4LKAOsBZtXKcplc4XzgFn4XFQ2UJxY94Y/WKnY3goedThC4EGJ+SkMw1FEnM+O1/bNPLFaikYpxTBbdfd+0jxv4dYxpSh3S6eJeQydyzHrDtIqHeTbEkM89nYolfJjY+o1h15uOqWD+mcaxsH9fMX2gMrkQIF0zXoSP/lcrEQ/cIRPFl98cb/0Lp4VOOSocrOdYPxC5HCCDgIWzgbLC6sdCghec1dffbWfkm0J+Rdb6YlzxVPTdVknqHWYDbtZZ1q/U2hhmqaNF1d1KbSMwXjw5FHJ5B2GcJhwzUWwij2dYF2Kfrkxzp3pZY41EughYjV4KUWtCZQtk9irzDOFy/UehhpV8DLScug1PWKdka5rArs4bQKayS3d9mTDfmvpBMOUeJYyuVKnixu8ru7N2KMNuyKkE6zXQScl6LGGffGwLyL2TYRDTJhg7ZFKNgWXiY+mEZeje8XTY6BTdtgwNLhex/6MwuCXTAuRGsd1KaSMdpx+/fr5H9Hztz2J9Aa+2LpFil4LHhdZZBH/Eobr0n3pMF+C+SMIXF/NjgB+PPsESgeT/ZhrKfU4uG5Gislks6+ZXQz/HBut5jrZ7EfKcgL3deUKp4ZzzjknNMbRRx/tXweLbJPkfuAKPdEtclA8HXYKKyoUs7ptYwd2nZy3w2IRLoaswA7uy8EFnXbYXM6xkagKRgDCOj1QSHB/N/u+yeqrr67BvSMWpKq88MILepp0tBeZhnUicuWTlGgMPrhXPIsNkaqa4nfPzcYelk42UWvIto6yxdH7qEONqUuUBC8/3eUaFg0mceEKih2EsW8aen54MWf7QmN8XF1+sbMBPHYwX4JJ1GCvzX7BoiePhXrY5RjDSRh6wMsVSkcFv2paSrHXZKD+5513nrd3GtbLYHIYLrD2y78ly3Laaaf5yWGuCTstv/POO95wDZig7vqz3bB2dNdxP1IET+zODiwZvMThCYZhKNvJAmtu7HkWtAOeKTxf2MMNa9fgCINOAQR87LYsBA2cAnS/OCwrwB6G2B9P9xDEYm2UV+fksE+hLbrQF9fgXIBnGd8BdCywkwN2wLDndNDeQcmVTzBe1D+Xxbmgba+1Zf5vo0rKbob57R4MsYWJvSbIPp/77UNhwUOvoQ5RFPQm1bUTXzb8BQWeOxgK0i9c8D4+w+UVLqQQ9Ap1qALb8KD3qIIhPfQG8SKBQLnhL0ygBDNt/BgWJ99rUIR4OaC8GPqAs4XtcKHpoQeuddJrxR7hOYcXEl5wEHhAhbmZ46WKrXpa2sHBy9TxP7xYzb6DYvYk83JG/fEHwXyjPeQ5fPhw76Wv7YFnLMy1GnxgsYd5mHkJ5/gPyg6WFZQLnoVMbtVQUsE5Qcxh4llC/fBdQWfCdl6xiwGlGqYo8+Fjpxf1c+cWD4C16+Pmp5LhDRf2p41m/24PfmQuH++5UtdBvXzUstAyZzvauxhoGnYcuI2iBxnsvSEM8sLv16DHpy/HdN5tGDbCMBs8gvAiULG9hfQaen2wsMLyRBj0HLFlCrbOCRNsOwKx8wkLp9d03zp7wlrvoXx48Z1++ul6yT8ifZQVL0TdJgU3gy7N9lBjvkNh2LIHzgU67OZn/t8J+MONPdMqd5tDsGzB9NJ9tts1bBcL+9nJVEe7vdPtFGA2JPU6G/ZKf5QrLF+83LHY2J7z0Tqg3rAC0SHQ51Pv4Wi7SNvlt8MEz9EZwM7R6bbXQTmgNEeOHBm6WBsdKljvKFewzCgvFpJiuA373aWTfPikSyNq16uwwWk5Cv3vy4dJ08wJzrMO26UgX6WDjU67bnWn87K3dIZYDIetSrB3G3pe9gs137yw9gQvqHQvH00PDgaYWzG7BHvrZrB+KNeXhKbRUkeM6cMjyezw7E0QY5I400u2pfLVdJA/tmABfygC9OCz8dO4UT3idYNnBfXUNVPp6oJhWzwreGbg3YdnpVBFmy4P+zrKhfaA9QOlgech344f2hQON1CC2mGy88h2ng+fbGlV8v2yKZ55416Q2Z/d4pwN1vfonA4yz1fpIE7HVY+Wdv0XDB3hM4UESIAESCB3AmUZakPx8OKu7trXrCRyO83U+NdCp4NClA7KTKWT+wPGkCRAAiQQJFA2xYOC1A02Xh7NpV23Eaww5nHgzVaI0vHLHEyUn0mABEiABHImULahNi3h7E+ul3k/L9hWQq9V6rHdsltKxzXCJ8ArtcwsFwmQAAlUGoGyWjyA0WHVoxYMuVUamUB5MMSGslJIgARIgASKI1B2xVNVXWusiJOl/fILfnWxuOqULjbKiLJSSIAESIAEiiNQdsWD4tcsMkCq2i1Yq1FcdUoTu8sm13hlLE3qTJUESIAEWheBilA8QF43aA+pG3JAxdHvPOwSqVl04QaPFVdAFogESIAEIkag7M4FQV4NE/8nsz68XBJN84K3nH6uqm4nndY5Q6K6NY5TWMyMBEiABPIgUHGKB2VvnDZOZrzu/tf62nRcXKo79fKcHWr7bio13fvngZJBSYAESIAEciFQkYrHK3iiWWaPuU2ww4FLweLQjkOPFIngr4u65MS8SIAESKBQApWreP6rUcOkTwW/INo4deGvMhZa2Uzx8Ns62E6n7RKrZQrGeyRAAiRAAkUSqHjFo/XDzyjUG+un8e/0vxSoYfM5wnGgvbFyavu4/0nufMrJsCRAAiQQFwKRUTwKvHHqWJk/YbTMN04IzbP+lJoeg4wjwnxpmj5eg2Q9tum0pNT2Wktqew/z4meNwAAkQAIkQAItRiByiseuedOMCd4QHJRO08zfpXnOFGm7+FDPMkK4Nu27SVXbjtKmQ0+p7ry0VHfrZxTNQMHPGlBIgARIgATKQyDSiicdsvofn5X2A3ZMd5vXSYAESIAEykggloqnjDyZNQmQAAmQQBYCFbNzQZZy8jYJkAAJkEBMCFDxxKQhWQ0SIAESiAoBKp6otBTLSQIkQAIxIUDFE5OGZDVIgARIICoEqHii0lIsJwmQAAnEhAAVT0waktUgARIggagQoOKJSkuxnCRAAiQQEwJUPDFpSFaDBEiABKJCgIonKi3FcpIACZBATAhQ8cSkIVkNEiABEogKASqeqLQUy0kCJEACMSFAxROThmQ1SIAESCAqBKh4otJSLCcJkAAJxIQAFU9MGpLVIAESIIGoEKDiiUpLsZwkQAIkEBMCVDwxaUhWgwRIgASiQoCKJyotxXKSAAmQQEwIUPHEpCFZDRIgARKICgEqnqi0FMtJAiRAAjEhQMUTk4ZkNUiABEggKgSoeKLSUiwnCZAACcSEABVPTBqS1SABEiCBqBCg4olKS7GcJEACJBATAlQ8MWlIVoMESIAEokKAiicqLcVykgAJkEBMCFDxxKQhWQ0SIAESiAoBKp6otBTLSQIkQAIxIUDFE5OGZDVIgARIICoEqHii0lIsJwmQAAnEhAAVT0waktUgARIggagQoOKJSkuxnCRAAiQQEwJUPDFpSFaDBEiABKJCgIonKi3FcpIACZBATAhQ8cSkIVkNEiABEogKASqeqLQUy0kCJEACMSFAxROThmQ1SIAESCAqBKh4otJSLCcJkAAJxIQAFU9MGpLVIAESIIGoEKDiiUpLsZwkQAIkEBMC/wdFyZAaOVfg8wAAAABJRU5ErkJggg=="></li></ul></li><li>Quantity Available: Display the amount of product available for buy/sell.</li><li>Country: Show the country of the product’s origin or location.</li></ul></li><li>Additional Elements on 'Wanted' Cards:<ul><li>Availability Status: Indicate whether the item is still wanted or if the need has been met.<ul><li>For Wanted Listings<ul><li>Required/Required From: Display the date from which the item is required.</li><li>Fulfilled: Wanted listing has been fulfilled and is no longer active</li></ul></li><li>For Sales Listings<ul><li>Available/available from: Display the date from which the item is available.</li><li>Expired: The listing has expired after the set time</li><li>Sold: All loads of the listing have been sold</li><li>Ongoing: listing that has a defined number of loads until resetting at defined intervals.</li></ul></li></ul></li></ul></li><li>Additional Elements on 'Sales Listing' Cards:<ul><li>Availability Status: Indicate whether the item is available immediately or from a future date.</li><li>Available/Available From: Clearly state the availability status and the specific start date if applicable.</li></ul></li><li>Interactivity and Navigation:<ul><li>Clicking on the card should redirect the user to a detailed listing page for that specific product. This interaction should be smooth and quick, enhancing the user experience.</li><li>Ensure that the clickable area of the card is well-defined and does not overlap with other interactive elements like the star icon.</li></ul></li><li>Performance and Efficiency:<ul><li>Cards should load quickly and efficiently, with images optimised for fast loading without sacrificing quality.</li><li>Implement lazy loading for images if necessary to improve page load times.</li></ul></li><li>Error Handling and Feedback:<ul><li>Error messages should be informative and guide the user on how to resolve the issue.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all elements of the listing card function correctly across different browsers and devices.</li><li>Validate that the navigation to the listing page works correctly and that all additional elements display accurate information.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Description** |
| --- | --- |
| Product Name | Display Type: Text; Mandatory |
| --- | --- |
| Image/Placeholder | Display Type: Image; Mandatory |
| --- | --- |
| Material of Interest | Display Type: Icon & Text<br><br>Conditional display: only shown for materials matching the users Material of Interest settings. |
| --- | --- |
| Quantity Available | Display Type: Text; Mandatory |
| --- | --- |
| Country | Display Type: Text; Mandatory |
| --- | --- |
| Availability Status | Display Type: Text; Specific to 'Wanted' and 'Sales Listing' cards; Mandatory |
| --- | --- |
| Required/From Date | Display Type: Date; Specific to 'Wanted' cards; Mandatory |
| --- | --- |
| Available/From Date | Display Type: Date; Specific to 'Sales Listing' cards; Mandatory |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failure to load product image | "Failed to load image. Please try refreshing the page." |
| --- | --- |
| Navigation error to product page | "Failed to load product details. Please try again." |
| --- | --- |
| No available data for required fields | "Product information is currently unavailable." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     | <https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=15035-22403&t=0SLYsqA0RP3baCFG-11> |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.7.3.4 Listing page (product page)

- The listing page presents a detailed view of each listing (buy/sell/wanted)
- The page will display the following elements
  - Product name
  - Availability status (same as [product card](#_ipl5y36vjbnt))
  - Breadcrumb
  - Photo carousel
    - Manual change
    - Auto-change every 3 seconds
  - Material description section
    - Replicate current website
    - Request button
      - The request is sent to the Admin Portal ([request information](#_4cvwu7goe2va))
  - Share Listing
    - Facebook, LinkedIn, Twitter
    - WhatsApp
    - Email
  - [Seller Card](#_shxxu9cswa1p)
- The page will have a distinct call to action:
  - [Bid Now](#_yeihg1k429v2) (Buy) or
  - Sell material (Wanted)
- There will be a link to the “Material Page” through the product page
- Contact information for WasteTrade’s commercial or operations team will be present on the page

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Essential Content Display:<ul><li>The page must prominently display the Product Name at the top.</li></ul></li><li>Availability Status:<ul><li>Display the Availability Status clearly on the page, consistent with the information shown on the product card.</li></ul></li><li>Breadcrumb Navigation:<ul><li>Implement breadcrumb navigation at the top of the page to enhance user navigation and provide a clear path back to previous sections.</li></ul></li><li>Photo Carousel:<ul><li>Feature a photo carousel that displays multiple images of the product.</li><li>Allow users to manually cycle through images and implement auto-change functionality that switches images every 3 seconds.</li></ul></li><li>Material Description Section:<ul><li>Include a comprehensive description of the material, replicating the detail and layout found on the current website.</li><li>Ensure the description is well-organised and easy to read.</li></ul></li><li>Request Information Button:<ul><li>Provide a "Request Information" button that, when clicked, sends a request to the Admin Portal. Include details of the request process and what information is transmitted.</li></ul></li><li>Social Sharing Options:<ul><li>Incorporate sharing options for Facebook, LinkedIn, Twitter, WhatsApp, and Email.</li><li>Ensure each sharing option uses the appropriate API to format the shareable content correctly for each platform.</li></ul></li><li>Seller Card:<ul><li>Display a seller card that includes information about the seller or the listing company, such as contact details or other relevant information.</li></ul></li><li>Call to Action:<ul><li>Based on the type of listing, include appropriate call-to-action buttons:</li><li>"Bid Now" for Buy listings.</li><li>"Sell Material" for Wanted listings.</li><li>Ensure these buttons are prominent and clearly indicate the next action the user should take.</li></ul></li><li>Link to Material Page:<ul><li>Provide a link to a more detailed “Material Page” that offers extensive information about the material involved in the listing.</li></ul></li><li>Contact Information:<ul><li>Display contact information for WasteTrade’s commercial or operations team prominently on the page to facilitate easy communication.</li></ul></li><li>Accessibility and Usability:<ul><li>The page layout must be responsive, displaying effectively across various devices and screen sizes.</li></ul></li><li>Performance and Load Times:<ul><li>Optimise image and content loading to ensure the page loads efficiently without significant delays.</li><li>Consider using lazy loading for images if necessary to improve performance.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all elements on the page function correctly and that the design is consistent across different browsers and devices.</li><li>Validate the functionality of the social sharing features and the 'Request Information process to ensure they operate without errors.</li></ul></li><li>Error Handling:<ul><li>Provide clear error messages for any failures in loading page content or executing requests.</li><li>Implement fallbacks for missing data, such as displaying 'Information not available' where data cannot be retrieved.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Failed to load product details | "Failed to load product details. Please try reloading the page." |
| --- | --- |
| Failed to send request | "Failed to send a request. Please check your connection and try again." |
| --- | --- |
| Error sharing listing | "Sharing failed. Please ensure you are connected and try again." |
| --- | --- |
| Navigation error to material page | "Unable to load the material page. Please try again." |
| --- | --- |
| Contact information not available | "Contact details are currently unavailable. Please check back later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

#### 6.7.3.5 Listing page - buyer/seller card

- The listing page has a buyer/seller card, that gives the user some information about the listing owner
- The buyer card will have the following elements
  - Buyer icon
  - Account verification status (green tick)
  - Buyer ID
  - Buyer location
  - Listed on: dd/mm/yyyy
- The seller card will have the following elements
  - Seller icon
  - Account verification status (green tick)
  - Seller ID
  - Seller location
  - Listed on: dd/mm/yyyy

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Card Design and Content:<ul><li>Each buyer/seller card must clearly display an icon representing the buyer or seller.</li><li>Include an account verification status indicated by a green tick to show the user is verified.</li></ul></li><li>Specific Elements on the Card:<ul><li>Buyer Card:<ul><li>Buyer Icon: A graphical representation of the buyer.</li><li>Account Verification Status: A green tick to signify verified status.</li><li>Buyer ID: Unique identifier for the buyer.</li><li>Listed On: The date the buyer's account was created, formatted as dd/mm/yyyy.</li></ul></li><li>Seller Card:<ul><li>Seller Icon: A graphical representation of the seller.</li><li>Account Verification Status: A green tick to signify verified status.</li><li>Seller ID: Unique identifier for the seller.</li><li>Listed On: The date the seller's account was created, formatted as dd/mm/yyyy.</li></ul></li></ul></li><li>Responsiveness:<ul><li>The buyer/seller cards must be responsive and display correctly on various devices and screen sizes, ensuring a consistent user experience across platforms.</li></ul></li><li>Performance and Loading:<ul><li>Optimise the loading times of the buyer/seller cards to ensure that they do not impede the overall performance of the listing page.</li><li>Images and icons should be optimised for quick loading without sacrificing quality.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that all elements of the buyer/seller cards are displayed correctly and contain accurate information.</li><li>Validate the functionality across different browsers and devices to ensure consistency and reliability.</li></ul></li><li>Error Handling and Feedback:<ul><li>Provide clear and informative error messages if information fails to load on the buyer/seller cards.</li><li>Implement fallbacks for missing data, such as displaying 'Information not available' where data cannot be retrieved.</li></ul></li><li>Security and Data Integrity:<ul><li>Ensure that sensitive information such as buyer or seller ID is handled securely to prevent unauthorised access.</li><li>Confirm that all data displayed is up-to-date and accurately reflects the current status of the buyer or seller.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Information load failure | "Failed to load user information. Please refresh the page." |
| --- | --- |
| Image or icon load failure | "Error loading images. Please check your connection." |
| --- | --- |
| Data integrity issue | "Data mismatch detected. Please contact support." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.7.3.6. Listing page - Request information

- The user will be able to select what kind of information they would like
  - Request more pictures
  - Request specification data sheets
  - Request description
- The user will be able to add a free text message
- On submitting, the request will be sent to the admin

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Request Options:<ul><li>Provide users with checkboxes or similar controls to select the type of additional information they wish to request:<ul><li>More pictures</li><li>Specification data sheets</li><li>Additional description</li></ul></li></ul></li><li>Free Text Message:<ul><li>Include a text box where users can add a free text message to accompany their request. This message should allow for detailed queries or comments regarding the listing.</li><li>Ensure the text box supports a reasonable character limit to allow for thorough communication, typically 500-1000 characters.</li></ul></li><li>Submission Functionality:<ul><li>Include a clearly labelled submit button for sending the request to the admin.</li><li>The button should be easily accessible and distinct to avoid confusion with other buttons on the page.</li></ul></li><li>User Feedback and Confirmation:<ul><li>Upon submission, provide immediate feedback to the user that their request has been successfully sent. This could be in the form of a pop-up message or a temporary banner on the page.</li><li>If the request fails to send, display an error message explaining the issue and suggesting next steps (e.g., "Failed to send request. Please try again or contact support.").</li></ul></li><li>Admin Portal Notification:<ul><li>Ensure that the admin portal receives the request and notifies the appropriate admin or team to take action.</li><li>Admins should have the ability to view all details of the request and any accompanying user message.</li></ul></li><li>Performance and Reliability:<ul><li>Optimise the request submission process to ensure it is quick and does not hinder the user's experience on the site.</li><li>Ensure the system is reliable, with minimal downtime or errors in processing requests.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the request functionality to ensure it works as expected across all major browsers and devices.</li><li>Conduct user acceptance testing to validate that the feature meets user needs and expectations and is free from bugs.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Submission failure | "Failed to send your request. Please try again." |
| --- | --- |
| Network or server issue | "Unable to connect to the server. Please check your connection and try again later." |
| --- | --- |
| Exceeding character limit | "Your message is too long. Please limit it to 1000 characters." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### ~~6.7.3.6.2 Listing page - Request Sample~~

- ~~The user will be able to select what kind of sample they would like~~
  - ~~Number of Samples Required~~
  - ~~Sample Size~~
    - ~~1kg~~
    - ~~2kg~~
    - ~~5kg~~
  - ~~What is your estimate bidding price for this material?~~
  - ~~Would you be interested in regular loads of this material?~~
  - ~~Delivery Address (warehouse Selection)~~
  - ~~Message~~
- ~~Where necessary, the User will be directed to make a payment (Requires Stripe integration or invoicing).~~
  - ~~Users will be required to pay for:~~
    - ~~5kg+ samples~~
    - ~~Repeat samples~~
- ~~On submitting, the request will be sent to the admin~~

#### 6.7.3.7 Listing expiry alert - sales and wanted

- The expiry alert will be applied to “Sales” listings and “Wanted” listings
  - They will be visible to the listing owner
- The listing expiry alert will be displayed in three places
  - [Product card](#_ipl5y36vjbnt)
    - There will also be an element within the card’s design that will show the user that when the listing nearing expiry
  - [Product page](#_ly73gd56x0q1)
    - There will also be an element within the card’s design that will show the user that when the listing nearing expiry
  - The listing owner will receive an email notification
- By default, a sales listing will expire in 31 days, unless renewal has been activated
  - The expiry alert will be displayed in the final 7 days of the listing period

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Alert Visibility and Location:<ul><li>Ensure that the expiry alert is visible only to the listing owner to maintain privacy and relevance.</li><li>Display the expiry alert on the Product Card and Product Page of the relevant listing.</li><li>The message should show the date of the expiry when within the 7 day period</li></ul></li><li>Design Integration:<ul><li>Incorporate a design element within both the Product Card and Product Page that clearly indicates when a listing is nearing expiry. This could be a visual cue like a colour change, an icon, or a banner.</li><li>The design should be consistent across both locations to maintain a uniform user experience.</li></ul></li><li>Timing of Alerts:<ul><li>Set the expiry alert to become visible when the listing is in the final 7 days of its listing period.</li><li>This alert should be dynamic and updated each day to show the remaining days until expiry.</li></ul></li><li>Email Notification:<ul><li>Automate an email notification to the listing owner when their listing enters the final 7 days of its expiry period.</li><li>The email should contain details about the listing, the exact expiry date, and options for renewal if applicable.</li></ul></li><li>Default Expiry Duration:<ul><li>By default, both sales and wanted listings should expire after 31 days unless a renewal has been activated by the owner.</li><li>Provide clear information on the listing creation and editing interfaces about the default expiry period.</li></ul></li><li>Renewal Process:<ul><li>Include an option for listing renewal on the Product Page that becomes prominent during the final 7 days of the listing period.</li><li>Ensure the renewal process is straightforward, requiring minimal steps to complete.</li></ul></li><li>Testing and Validation:<ul><li>Thoroughly test the expiry alert system to ensure that alerts display correctly at the appropriate times and that email notifications are sent reliably.</li><li>Validate that the renewal options function correctly and that all user interactions with expiry alerts lead to the expected outcomes.</li></ul></li><li>Error Handling:<ul><li>Implement error handling mechanisms to alert users if there is a failure in updating or displaying the expiry alerts.</li><li>Provide users with clear instructions on how to rectify any issues or whom to contact for support.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
|     |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Email notification failure | "Failed to send expiry notification. Please ensure your email is up to date in your profile settings." |
| --- | --- |
| Renewal process error | "Error processing renewal. Please try again or contact customer support." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

####

####

- The listing alert will be applied to “Sales” listings and “Wanted” listings
  - They will be visible to the listing owner
- The listings alert informs the user if there are any issues with their listing
- There are two listing alerts
  - Listing rejected
    - This listing will not go live
    - The user will be able to use the replicate function
  - Requires action
    - The user is required to take some action to make the listing go live (subject to another verification)
- The listing alert will be displayed in three places
  - [Product card](#_ipl5y36vjbnt)
    - There will also be an element within the card’s design
  - [Product page](#_ly73gd56x0q1)
    - There will also be an element within the card’s design
  - The listing owner will receive an email notification

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>Alert Types and Conditions:<ul><li>Ensure that there are two specific types of alerts for the listing:</li><li>Listing Rejected: Indicates that the listing will not go live due to specific issues identified during the review process.</li><li>Requires Action: Alerts the user that certain actions must be taken for the listing to go live, pending another verification process.</li></ul></li><li>Visibility and Accessibility:<ul><li>Listing alerts must be visible only to the listing owner to maintain privacy and relevance.</li><li>Display the alerts prominently on both the Product Card and the Product Page.</li></ul></li><li>Design and Integration:<ul><li>Incorporate a distinct design element within the Product Card and Product Page that indicates the presence of a listing alert. This could be an icon, a colour change, or a banner.</li><li>The design should be intuitive, clearly indicating the nature of the alert (rejected or action required).</li></ul></li><li>Email Notification:<ul><li>Automate an email notification to the listing owner when an alert is triggered.</li><li>The email should detail the reasons for the alert and provide clear instructions on any actions required or appeal processes available.</li></ul></li><li>Interactivity and Functionality:<ul><li>Include a 'Replicate Function' for rejected listings, allowing users to easily duplicate and modify the listing to comply with requirements.</li><li>Provide direct links or buttons in the alert to guide users on how to take the necessary actions (e.g., updating listing details, contacting support).</li></ul></li><li>User Feedback and Support:<ul><li>Offer clear instructions and support links within the alert for users to understand and resolve the issues. This includes access to FAQ or direct contact with customer support.</li></ul></li><li>Responsiveness and Consistency:<ul><li>Ensure that the alerts and all related elements are responsive and display correctly across different devices and screen resolutions.</li><li>Maintain design and messaging consistency across all platforms and alert types to avoid user confusion.</li></ul></li><li>Performance and Reliability:<ul><li>Optimise the performance to ensure that alerts load quickly and do not impact the overall user experience on the page.</li><li>Ensure the reliability of the alert system, with minimal downtime or errors in alert delivery and display.</li></ul></li><li>Testing and Validation:<ul><li>Conduct thorough testing to ensure that alerts are triggered and displayed correctly under all relevant conditions.</li><li>Validate the functionality of the email notification system and the interactivity of the alerts on the product card and page.</li></ul></li><li>Security and Data Protection:<ul><li>Ensure all communications and data handling related to listing alerts adhere to privacy and data protection standards.</li><li>Secure the transmission of sensitive information, especially in emails and alerts that contain specific user data or actions.</li></ul></li></ul></th></tr></thead></table>

| **Field** | **Data Dictionary** |
| --- | --- |
| n/a |     |
| --- | --- |

| **Use Case** | **Error Message** |
| --- | --- |
| Listing alert fails to display | "Error displaying listing alert. Please refresh the page." |
| --- | --- |
| Failure in sending email notification | "Failed to send notification email. Please check your email settings and try again." |
| --- | --- |
| Replicate function unavailable | "Replicate function is currently unavailable. Please try again later." |
| --- | --- |

| **Design Name** | **Link** |
| --- | --- |
|     |     |
| --- | --- |

| **Client Approved** | YES |
| --- | --- |

#### 6.7.3.8 Admin communication - sales and wanted

- ~~The~~ [~~Product page~~](#_ly73gd56x0q1) ~~will have a section that displays the communication received from the admin~~
- ~~This will be a collapsible section that will have a visual indicator to show the user that a new message has been received~~
- ~~The following communications will be received~~
  - ~~Approved - the listing will go live once the admin has approved it, there will be no actions for the user~~
  - ~~Rejected - the listing will not go live,~~
    - ~~Triggers the listing alert~~
  - ~~Action required - the user will be able to see a message from the admin~~
    - ~~Triggers the listing alert~~

### 6.7.4 Messaging

#### 6.7.4.1 Messaging platform - trading/hauliers

- ~~The user will be able to view all of their conversations with the admin team within the messaging platform~~
- ~~The user will not be able to directly initiate contact with the admin team unless it is related to a listing~~
- ~~The messages will be displayed in reverse chronological order~~
- ~~The following information will be visible~~
  - ~~Associated listing~~
  - ~~Last message sent~~

#### 6.7.4.2 Messaging platform - Admin

- ~~The admin user will be able to view all of their conversations with the user through the Messages section within the~~ [~~Account File~~](#_jqfb2ph77w4q)
- ~~The following information will be visible~~
  - ~~Associated listing~~
  - ~~Last message received~~

### 6.7.5 Notifications (Trading platform)

This section describes the notifications that the system will send out a variety of alerts and notifications to the users (traders and hauliers). selection

#### 6.7.5.1 Notifications icon

- ~~There will be a notification icon within the header~~
- ~~The icon will indicate when there are new notifications~~
- ~~Clicking on the notifications will lead to the notification centre~~

#### 6.7.5.2 Notifications centre

- ~~The user will be able to view and manage all notifications in the notification centre~~
- ~~There will be a link to the~~ [~~notification settings~~](#_d6ngqqslnjp8)
- ~~The user will be able to view each notification in full detail~~
  - ~~Notifications will be displayed in reverse chronological order (latest first)~~
  - ~~There will be a timestamp on each notification~~
    - ~~dd/mm/yyyy HH: MM~~
- ~~The user will be able to mark the notifications as~~
  - ~~Read~~
  - ~~Unread~~
- ~~There will be pagination~~
  - ~~The user will be able to select the number of rows per page~~
    - ~~10~~
    - ~~20~~
      - ~~Default~~
    - ~~50~~
    - ~~All~~
- ~~By default, the page will display the latest notifications at the top~~

#### 6.7.5.3 Platform notifications - General (email)

- ~~The following notifications are sent to all users~~
  - ~~Complete registration~~
  - ~~Welcome email~~
- ~~These notifications will be sent to a user’s email address~~

#### 6.7.5.4 Platform notifications - buyer

- ~~The buyers will receive notifications at the following points~~
  - ~~Bid approved/rejected~~
  - ~~Received communication from the admin (listing requires attention; status: pending)~~
  - ~~Bid accepted~~
  - ~~Sample Sent - Tracking Number~~
  - ~~New Matching Listing~~
  - ~~Further points to be decided~~
- ~~All notifications will contain a link to the original listing~~
- ~~All notifications will be sent through the system and also to the user’s email address~~

#### 6.7.5.5 Platform notifications - seller

- ~~The buyers will receive notifications at the following points~~
  - ~~Listing approved/rejected~~
  - ~~A new haulage offer received~~
  - ~~Received communication from the admin (listing requires attention; status: pending)~~
  - ~~Documents generated~~
  - ~~Listing Renewed~~
  - ~~“Ongoing” listing confirmation notification~~
  - ~~Sample Requested~~
  - ~~Sample Received~~
  - ~~Further points to be decided~~
- ~~All notifications will contain a link to the original listing~~
- ~~All notifications will be sent to the system and also to the user’s email address~~

#### 6.7.5.6 Platform notifications - wanted listing owner

- ~~The listing owner will receive notifications at the following points~~
  - ~~Listing approved/rejected~~
  - ~~Documents generated~~
  - ~~Received communication from the admin (listing requires attention; status: pending)~~
  - ~~Further points to be decided~~
- ~~All notifications will contain a link to the original listing~~
- ~~All notifications will be sent to the system and also to the user’s email address~~

#### 6.7.5.7 Platform notifications - Haulier

- ~~The buyers will receive notifications at the following points~~
  - ~~Bid approved/rejected~~
  - ~~Received communication from the admin (Bid requires attention; status: pending)~~
  - ~~Bid accepted~~
  - ~~Won Offer~~
  - ~~New Haulage Opportunity~~
  - ~~Further points to be decided~~
- ~~All notifications will contain a link to the original listing~~
- ~~All notifications will be sent through the system and also to the user’s email address~~

#### 6.7.5.8 Platform notifications - Permit expiry

- ~~The system will identify when a permit (see:~~ [~~Company Documents~~](#_dviceqhm36h5)~~) is approaching its expiry date~~
- ~~The account owner will receive a notification containing the following information~~
  - ~~Document type~~
  - ~~Expiry date~~
  - ~~Link to the Company Documents section~~
- ~~The notification will be sent at the following intervals~~
  - ~~30 days before expiry~~
  - ~~20 days before expiry~~
  - ~~15 days before expiry~~
  - ~~10 days before expiry~~
  - ~~7 days before expiry~~
  - ~~5 days before expiry~~
  - ~~3 days before expiry~~
  - ~~Day of expiry~~
- ~~All notifications will be sent through the system and also to the user’s email address~~

### 6.7.6 Help and support

The user will be able to contact the WasteTrade team. This will be available to the Trading and Haulage platform users. The messages will be sent to a dedicated inbox for WasteTrade to review.

#### 6.7.6.1 Help floating button

- ~~The floating action button will be visible to the user on all pages (trading and haulage platforms)~~
- ~~On clicking the button, the user will be able to raise a query with the WasteTrade team~~

#### 6.7.6.2 Help form

- ~~The form will capture the following details~~
  - ~~Basic details (auto-filled)~~
  - ~~Select reason(s) for getting in touch~~
    - ~~List to be provided by the client~~
  - ~~A free text box for writing the message~~
  - ~~Attach files (upload from the device, maximum of 25MB total)~~
- ~~The user will click on the “send” button to submit their query~~

### 6.7.7 Resources

The Resources section will have various content pieces that help the user understand how to get the best out of the platform. The section will be available on both, the Traders and Hauliers platforms.

#### 6.7.7.1 Resources layout

- ~~The resources page will have a~~ [~~header~~](#_vqslxpp5r867)
- ~~The resources page will have a sub-menu~~
  - ~~Waste Trade Guides~~
  - ~~Plastics~~
  - ~~Paper~~
  - ~~Metals~~
  - ~~Recycling~~
- ~~The main body will have~~
  - ~~A sub-header (hero style: heading, body text, and an image)~~
  - ~~There will be a breadcrumb~~
  - ~~A main display area~~
    - ~~There will be sections~~
      - ~~Each section will have a title~~
      - ~~Each section will display three cards (articles)~~
      - ~~Each section will have its pagination~~

#### 6.7.7.2 Article card

- ~~The cards will be presented within the main display area’s sections~~
- ~~Each card will have~~
  - ~~An image~~
  - ~~A title~~
- ~~Clicking on the card will redirect the user to the article~~

#### 6.7.7.3 Article layout

- ~~The article’s structure will have the following elements~~
  - ~~Header~~
  - ~~Sub-menu (see~~ [~~Resources layout~~](#_t9h0sr3aixmn)~~)~~
  - ~~Article title (H1)~~
  - ~~Title image~~
    - ~~Alt text~~
  - ~~Body text~~
  - ~~Images~~
    - ~~Alt text~~
  - ~~Sub-headings~~
  - ~~Keywords~~
  - ~~Call-to-action card: Sell & buy material (get in touch)~~
    - ~~Links to a contact form~~
    - ~~This will be a floating element~~
  - ~~Share page~~
    - ~~WhatsApp~~
    - ~~Twitter~~
    - ~~Facebook~~
    - ~~LinkedIn~~
    - ~~Email~~

## 6.8 Trading Platform - Mobile App

This section describes the functionality exclusive to the trading platform users, through the mobile app.

### 6.8.1 Download and Installation

#### 6.8.1.1 Apple App Store

- ~~The User will download the app from the Apple App Store~~
- ~~Download the app and install it on an iPhone~~
  - ~~Free download~~

####

#### 6.8.1.2 Google Play Store

- ~~The User will download the app from the Google Play Store~~
- ~~Download the app and install it on an Android mobile phone~~
  - ~~Free download~~

### 6.8.2 Splash Screen

#### 6.8.2.1 Splash Screen

- ~~The User will see a splash screen while the app loads~~
- ~~The splash screen will display a static logo~~
- ~~The splash screen will be on the screen for 2 seconds~~
- ~~The user will then be directed to the landing page~~

###

### 6.8.3 Landing Page

#### 6.8.3.1 Landing page layout

- ~~The landing page will have a logo~~
- ~~The landing page will enable the user to log into their account~~
- ~~The user will allow the user to register if they do not have an account~~
  - ~~Redirect to~~ [~~web registration~~](#_1l88icfathxl)
- ~~There will be a~~ [~~forgotten password~~](#_uxa4uvexa9wk) ~~button~~

###

### 6.8.4 Registration - webview

The mobile app will use a “webview” component to embed the web versions of the registration directly into the app, without having to do a native rebuild.

#### 6.8.4.1 Registration - webview

- ~~The registration flow will be built so that it can be accessed and done through the mobile app~~
- ~~The following epics must be optimised for webview~~
  - [~~6.1.1 Registration - basic details~~](#_k8b0w7uyj12)
  - [~~6.1.2 Onboarding - capturing details for account verification~~](#_d8iyhohpt828)

###

### 6.8.5 Authentication

#### 6.8.5.1 Login

- ~~The user will be to log in with their~~
  - ~~Email address~~
  - ~~Password~~
- ~~The password field will be encrypted~~
  - ~~Entered characters will be displayed as bullet points~~
- ~~Validation of fields will be upon clicking the ‘Login” button~~
- ~~If the validation fails there will be inline error messages~~
  - ~~The required field is empty~~
    - ~~“This is a required field”~~
  - ~~Invalid credentials~~
    - ~~“Invalid email address and password”~~
- ~~If the validations pass, the user will be granted access to the~~ [~~app’s homepage  <br>~~](#_w1iw7uxflmf7)

#### 6.8.5.2 Manual logout

- ~~The user will log out manually using the logout button~~
- ~~The user will be redirected to the login page  
    ~~

#### 6.8.5.3 Automatic logout

- ~~The user will be automatically logged out upon closing the app~~
- ~~The user will be automatically logged out if they log in on another device~~
  - ~~There will be one concurrent session per user~~
- ~~The user will be automatically logged out if the app is open but has been inactive for more than two hours~~
  - ~~‘Activity’ will be defined as making a selection to edit a field or pressing a button to change the page~~
  - ~~‘Activity’ will not include scrolling on a single page~~
  - ~~Two minutes before the timeout, there will be a pop-up:~~
    - ~~“Would you like to remain logged in?”~~
      - ~~Yes~~
        - ~~The timer will reset~~
      - ~~No~~
        - ~~The user will be immediately logged out and redirected to the login page~~
      - ~~No answer in 120 seconds~~
        - ~~The user will be logged out and redirected to the login page~~
- ~~Upon logout, the user will be redirected to the login page  
    ~~

#### 6.8.5.4 Forgotten Password

- ~~The user will click on ‘Forgotten password’ on the log-in page~~
- ~~They will be directed to the Forgotten Password page~~
- ~~The User will enter their email address~~
- ~~All fields will be tagged and compatible with the device’s autocomplete~~
- ~~Press “Submit”~~
- ~~Validation of fields will be upon clicking the ‘Submit” button~~
  - ~~If the validation fails there will be inline error messages~~
    - ~~The required field is null~~
      - ~~“This is a required field”~~
  - ~~If the validation passes, there will be a message on the screen:~~
    - ~~“Please check your email with instructions on how to reset your password.”~~
    - ~~The user will be able to close the message and return to the login page~~
- ~~If the email address is valid, a verification token will be sent~~
  - ~~The link will be valid for 6h~~
  - ~~The expiry time will be set in the database~~
  - ~~There will be no front end to change the expiry time.~~
- ~~If the email address is invalid, a verification token will not be sent~~
- ~~If the email address is not on the system, a verification token will not be sent~~
- ~~Upon clicking a valid email token, the app will open and the user will be directed to the password reset page~~
- ~~The current password will be active until a new password is successfully set~~

### 6.8.6 Mobile trading homepage (buy)

#### 6.8.6.1 Trading Homepage Layout

- ~~This page will show a user all of the sales listings on the system~~
- ~~The page will have the following elements~~
  - ~~Logo~~
  - ~~Navigation~~
  - [~~Create listing button~~](#_gb7imbsf258j)
  - [~~Filters~~](#_nzsy29ljfkdq)
  - [~~Product cards~~](#_ipl5y36vjbnt)
    - ~~Clicking on the card redirects the user to the listing page (product page)~~
  - [~~Account Status~~](#_yxkzqcazfick)

#### 6.8.6.2 Mobile app navigation

- ~~The navigation will be a bottom bar~~
- ~~The navigation will contain the following elements~~
  - [~~Trade~~](#_w1iw7uxflmf7)
    - ~~Buy~~
    - ~~Sell~~
    - ~~Wanted~~
    - ~~Favourites~~
  - [~~My Offers~~](#_jpg04n6zw8z2)
    - ~~Bids~~
    - ~~Sales~~
    - ~~Wanted~~
  - [~~My Account~~](#_lkvx903bsf2q)
  - ~~Communications~~
    - [~~Messaging~~](#_55l78worsrgr)
    - [~~Notifications~~](#_55l78worsrgr)
  - [~~Settings~~](#_lkvx903bsf2q)
    - ~~Logout button~~

#### 6.8.6.3 Bidding on a Listing

- ~~The user will be able to click on any~~ [~~Product card~~](#_ipl5y36vjbnt) ~~to open the~~ [~~listing page~~](#_ly73gd56x0q1)
- ~~The page will have a distinct CTA: Bid Now~~
- ~~Clicking on the button will allow the user to make a bid on the listing~~
- ~~The user will be required to provide the following information~~
  - ~~Warehouse location~~
    - ~~Drop-down select~~
  - ~~Offer valid until~~
  - ~~Earliest delivery date~~
  - ~~Latest delivery date~~
  - ~~Number of loads bid on (min: 1)~~
  - ~~Currency~~
  - ~~Price per Metric Tonne~~
    - ~~The buyer’s bid includes a “best guess” for the haulage~~
      - ~~Example: If the buyer bids at £1000 per tonne, the amount would be broken down as follows:~~
        - ~~Material: £850 per tonne~~
        - ~~Haulage: £150 per tonne~~
  - ~~Incoterms~~
    - ~~Dropdown select~~
    - ~~There will be an information button to explain the various “incoterms options~~
      - ~~The content will be defined in the AC (client-led)~~
- ~~On submitting the bid, it is submitted for review to the WasteTrade Admin team~~
  - ~~The user will be able to track their bid through the~~ [~~My Offers section~~](#_jpg04n6zw8z2)

#### 6.8.6.4 Listings algorithm

- ~~The system will automatically suggest materials to buyers that are:~~
  - ~~Matching with their material preferences as per their profile~~
    - ~~Always display the newest listings first~~
  - ~~Similar to their “wanted listings”~~
  - ~~Similar to their existing listing~~
- ~~The system will then query the database for similar active listings by other sellers.~~
- ~~Details to be covered within the AC~~

### 6.8.7 Wanted section

#### 6.8.7.1 Wanted section layout

- ~~This page will show a user all of the wanted listings that are on the system~~
- ~~The page will have the following elements~~
  - [~~Filters~~](#_nzsy29ljfkdq)
  - [~~Product cards~~](#_ipl5y36vjbnt)
    - ~~Clicking on the card redirects the user to the listing page (product page)~~
  - [~~Account Status~~](#_yxkzqcazfick)
  - ~~The page will have a distinct call to action:~~
    - ~~List Wanted Material~~
    - ~~The CTA will be placed at the very top of the page~~

####

#### 6.8.7.2 Create a listing for wanted material

- ~~The user will be able to create a listing for wanted material~~
- ~~The form will be exactly the same as on the present website~~
- ~~The form will have the following sections~~
  - ~~Upload media~~
    - ~~There will be instructions guiding the user on the type of images they should provide~~
    - ~~Select “featured image” (i.e. cover image)~~
  - ~~Material wanted~~
  - ~~Quantity wanted~~
  - ~~Material required from (start date)~~
    - ~~There will be a date picker (calendar)~~
  - ~~Additional information~~
    - ~~Free text box~~
    - ~~This free text (and any free text for listings) should not allow telephone numbers, email addresses or urls~~
- ~~Set listing duration~~
  - ~~2 weeks (default)~~
  - ~~Custom (select days, weeks, or pick a date from a calendar)~~
- ~~There will be a “Submit” button~~
  - ~~On submitting, the form will be sent to the Admin for approval~~
- ~~A listing will stay live until~~
  - ~~The fulfilment process begins (i.e. a seller can provide the materials, and the creator of the Wanted listing accepts their bid)~~
  - ~~The listing is removed by the creator or the WasteTrade Admin~~
  - ~~The default listing period comes to an end~~

#### 6.8.7.3 Listing page (product page) - wanted

- ~~The listing page presents a detailed view of each listing (buy/sell/wanted)~~
- ~~The page will display the following elements~~
  - ~~Product name~~
  - ~~Availability status (same as~~ [~~product card~~](#_ipl5y36vjbnt)~~)~~
  - ~~Breadcrumb~~
  - ~~Photo carousel~~
    - ~~Manual change~~
    - ~~Auto-change every 3 seconds~~
  - ~~Material description section~~
    - ~~Replicate current website~~
    - ~~Request information~~
      - ~~The request is sent to the Admin Portal (~~[~~request information~~](#_4cvwu7goe2va)~~)~~
    - ~~Request sample~~
      - ~~The request is sent to the Admin portal.~~
  - ~~Share Listing~~
    - ~~Facebook, LinkedIn, Twitter~~
    - ~~WhatsApp~~
    - ~~Email~~
  - ~~Buyer~~ [~~Card~~](#_shxxu9cswa1p)
- ~~The page will have a distinct call to action:~~
  - ~~Sell Material~~
  - ~~Message buyer~~
- ~~There will be a link to the “Material Page” through the product page~~
- ~~Contact information for WasteTrade’s commercial or operations team will be present on the page~~

### 6.8.8 Sell section

A user will be able to sell material through the platform. Clicking on the sell button within the header takes the user to the “create a sales listing form”.

#### 6.8.8.1 Sell section layout

- ~~The page will have the following elements~~
  - [~~Create a sales listing form~~](#_gb7imbsf258j)

#### 6.8.8.2 Create a listing (sell material)

- ~~The user will be able to create a listing to sell material~~
- ~~The form will be exactly the same as on the present website~~
- ~~The form will have the following sections~~
  - ~~Warehouse~~
    - ~~Select location dropdown~~
    - ~~Add new location~~
  - ~~Upload media~~
    - ~~There will be instructions guiding the user on the type of images they should provide~~
    - ~~Select “featured image” (i.e. cover image)~~
    - ~~Do you have material specification data?~~
      - ~~Upload from the device - if yes~~
    - ~~All images will be watermarked~~
  - ~~Material~~
  - ~~Quantity (total quantity and loads)~~
  - ~~Select currency~~
  - ~~Material availability (start date)~~
    - ~~There will be a date picker (calendar)~~
  - ~~Set listing duration~~
    - ~~2 weeks (default)~~
    - ~~Custom (select days, weeks, or pick a date from a calendar)~~
  - ~~Additional information~~
    - ~~Free text box~~
    - ~~This free text (and any free text for listings) should not allow telephone numbers, email addresses or urls~~
- ~~There will be a “Submit” button~~
  - ~~On submitting, the form will be sent to the Admin for approval~~
  - ~~The listing can only go live once it has been approved by the admin~~
- ~~A listing will stay live until~~
  - ~~The fulfilment process begins (i.e. a seller can provide the materials, and the creator of the listing accepts their bid)~~
  - ~~The listing is removed by the creator or the WasteTrade Admin~~
  - ~~The default listing period comes to an end~~

### 6.8.9 My listings - sales

This section allows a user to see all of their sales listings.

#### 6.8.9.1 View all sales listings

- ~~This page will show a user all of the sales listings which they have created~~
- ~~The page will have the following elements~~
  - [~~Filters~~](#_nzsy29ljfkdq)
  - [~~Product cards~~](#_ipl5y36vjbnt)
    - ~~Clicking on the card redirects the user to the listing page (product page)~~
    - ~~The product cards will show an alert for listings which are due to expire~~
  - [~~Account Status~~](#_yxkzqcazfick)

#### 6.8.9.2 My sales - listing renewal

- ~~The user will be able to renew a listing that they have created through a listing’s~~ [~~Product page~~](#_ly73gd56x0q1)
- ~~When the listing is in the expiry period, there will be a message: “This listing is about to expire, do you want to renew it?”~~
- ~~The user will be able to click on the message to renew the listing~~
  - ~~The system will ask the user to confirm if they want to renew the listing~~
    - ~~Yes - set the new renewal period~~
      - ~~2 weeks (default)~~
      - ~~Custom (select days, weeks, or pick a date from a calendar)~~

#### 6.8.9.3 Remove a sales listing

- ~~The user will be able to remove any sales listings which they have created~~
- ~~The user will be able to delete the listing from the~~
  - ~~“View all sales listings” page (button)~~
  - ~~Listings card (icon)~~
- ~~The system will ask the user to confirm the removal~~
  - ~~Copy to be written~~
- ~~The user will be able to remove any listing which they have created~~

####

#### 6.8.9.4 Replicate an existing sales listing

- ~~The user will be able to create new sales listings by replicating an existing sales listing~~
- ~~There will be a duplicate button within the~~ [~~listing page~~](#_ly73gd56x0q1)
- ~~Clicking on the button will lead the user to a prepopulated~~ [~~new listing~~](#_gb7imbsf258j) ~~form~~
  - ~~The form will have the following sections, these sections will be editable~~
    - ~~Warehouse~~
      - ~~Select location dropdown~~
      - [~~Add new location~~](#_15m60bxdndtm)
    - ~~Upload media~~
      - ~~There will be instructions guiding the user on the type of images they should provide~~
      - ~~Select “featured image” (i.e. cover image)~~
      - ~~Do you have material specification data?~~
        - ~~Upload from the device - if yes~~
    - ~~Material~~
    - ~~Quantity~~
    - ~~Price~~
    - ~~Material availability (start date)~~
      - ~~There will be a date picker (calendar)~~
    - ~~Additional information~~
      - ~~Free text box~~
      - ~~This free text (and any free text for listings) should not allow telephone numbers, email addresses or urls~~
- ~~There will be a “Submit” button~~
  - ~~On submitting, the form will be sent to the Admin for approval~~
- ~~A listing will stay live until~~
  - ~~The fulfilment process begins (i.e. a buyer’s bid is accepted and the haulage bidding has begun for the sales listing)~~
  - ~~The listing is removed by the creator or the WasteTrade Admin~~
  - ~~The default listing period comes to an end~~

### 6.8.10 My listings - wanted

This section allows a user to see all of their wanted materials listings.

#### 6.8.10.1 View all wanted listings

- ~~This page will show a user all of the wanted listings which they have created~~
- ~~The page will have the following elements~~
  - [~~Filters~~](#_nzsy29ljfkdq)
  - [~~Product cards~~](#_ipl5y36vjbnt)
    - ~~Clicking on the card redirects the user to the listing page (product page)~~
    - ~~The product cards will show an alert for listings which are due to expire~~
  - [~~Account Status~~](#_yxkzqcazfick)
  - ~~My wanted offers~~
    - ~~This will be a link that redirects the user to the view wanted offers section~~

#### 6.8.10.2 Wanted materials - listing renewal

- ~~The user will be able to renew a listing that they have created through a listing’s~~ [~~Product page~~](#_ly73gd56x0q1)
- ~~When the listing is in the expiry period, there will be a message: “This listing is about to expire, do you want to renew it?”~~
- ~~The user will be able to click on the message to renew the listing~~
  - ~~The system will ask the user to confirm if they want to renew the listing~~
    - ~~Yes - set the new renewal period~~
      - ~~2 weeks (default)~~
      - ~~Custom (select days, weeks, or pick a date from a calendar)~~

#### 6.8.10.3 Remove a wanted materials listing

- ~~The user will be able to remove any wanted listings which they have created~~
- ~~The user will be able to delete the listing from the~~
  - ~~“View all wanted listings” page (button)~~
  - ~~Listings card (icon)~~
- ~~The system will ask the user to confirm the removal~~
  - ~~Copy to be written~~
- ~~The user will be able to remove any listing which they have created~~

####

#### 6.8.10.4 Replicate an existing listing for Wanted Material

- ~~The user will be able to create new wanted listings by replicating an existing wanted listing~~
- ~~There will be a duplicate button within the~~ [~~listing page~~](#_ly73gd56x0q1)
- ~~Clicking on the button will lead the user to a prepopulated~~ [~~new listing~~](#_rbcnz7ift8c7) ~~form~~
  - ~~The form will have the following sections, these sections will be editable~~
    - ~~Upload media~~
      - ~~There will be instructions guiding the user on the type of images they should provide~~
      - ~~Select “featured image” (i.e. cover image)~~
    - ~~Material wanted~~
    - ~~Quantity wanted~~
    - ~~Material required from (start date)~~
      - ~~There will be a date picker (calendar)~~
    - ~~Additional information~~
      - ~~Free text box~~
      - ~~This free text (and any free text for listings) should not allow telephone numbers, email addresses or urls~~
- ~~There will be a “Submit” button~~
  - ~~On submitting, the form will be sent to the Admin for approval~~
- ~~A listing will stay live until~~
  - ~~The fulfilment process begins (i.e. a seller can provide the materials, and the creator of the Wanted listing accepts their bid)~~
  - ~~The listing is removed by the creator or the WasteTrade Admin~~
  - ~~The default listing period comes to an end~~

### 6.8.11 My Offers

This section allows the users to view the offers that they have made and the offers that have been made for their listings.

#### 6.8.11.1 View a summary of offers received

- ~~There will be a table that displays a summary of all the offers received~~
- ~~The table will have the following columns~~
  - ~~Material name~~
  - ~~Weight~~
  - ~~Best offer~~
  - ~~Number of offers~~
  - ~~Loads remaining~~
  - ~~View offers~~
  - ~~Offer status~~
    - ~~Accepted~~
      - ~~Shipped~~
    - ~~Rejected~~
    - ~~Pending~~
  - ~~State~~
    - ~~Active~~
    - ~~Closed~~
- ~~The user will be able to click on a row to view the offer in detail~~

#### 6.8.11.2 View individual offers received for listings

- ~~On clicking on a row of the “~~[~~view a summary of offers received~~](#_vqwu3s2ptko3)~~” table the user will be redirected to a details page~~
- ~~The page will display the following information~~
  - ~~Material name - link to the original listing~~
  - ~~Weight~~
  - ~~Best offer~~
    - ~~The seller (listing owner) will see the total amount (price + haulage + any other charges)~~
  - ~~Number of offers~~
    - ~~List of other offers~~
      - ~~Date, Amount, Buyer ID, Buyer Status (Verified/unverified)~~
  - ~~Loads remaining~~
  - ~~Status~~
    - ~~Active~~
    - ~~Sold~~
      - ~~Shipped~~
- ~~The user will be able to perform certain actions~~
  - ~~Accept a bid~~
    - ~~Accepting one bid automatically marks the others as rejected~~
    - ~~The listing will be taken off the trading platform (no one will be able to see it or make new bids)~~
    - [~~Document generation~~](#_49v2ciouzfsr) ~~will kick off~~
  - ~~Reject a bid~~
    - ~~The listing will remain active until~~
      - ~~The default listing period finishes~~
      - ~~The listing is removed by the listing owner~~

#### 6.8.11.3 Mark a bid as shipped

- ~~For each~~ [~~individual listing~~](#_yblmpc97hdv)~~, the user will be able to “mark it as shipped”~~
- ~~To mark a listing as shipped, the user will be required to add mandatory evidence~~
- ~~The user will be able to upload files from their device~~
  - ~~Weighbridge ticket (pdf/image)~~
  - ~~Loading images~~
  - ~~Other~~
    - ~~The user will be able to provide the title~~

#### 6.8.11.4 Document generation for accepted bids

- ~~Once a seller accepts a bid, the system will automatically generate the documentation required~~
- ~~The user will be able to view the following information for each document~~
  - ~~Title~~
  - ~~Description~~
- ~~The user will be able to download the documents~~
- ~~This will include~~
  - ~~Annex vii~~
  - ~~CMR~~
  - ~~Packing List~~
  - ~~Green Sheet~~
  - ~~Duty of Care~~
  - ~~Sales Invoice~~
  - ~~Purchase order~~
  - ~~Good Photo Guide~~
- ~~See~~ [~~document management~~](#_3flov3pmlfxc) ~~for the admin side~~

#### 6.8.11.5 View a summary of offers made

- ~~There will be a table that displays a summary of all the offers made by a user~~
- ~~The table will have the following columns~~
  - ~~Material name~~
  - ~~Pick up location~~
  - ~~Destination~~
  - ~~Packaging~~
  - ~~No. of loads~~
  - ~~Weight per load~~
  - ~~Status~~
    - ~~Accepted~~
    - ~~Rejected~~
    - ~~Pending~~
- ~~The user will be able to click on a row to view the offer in detail~~

#### 6.8.11.6 View bid details

- ~~On clicking on a row of the “~~[~~view a summary of offers made~~](#_ntlrnavbi5zz)~~” table the user will be redirected to a details page~~
- ~~The page will show the following information~~
  - ~~Material name~~
  - ~~Pick up location~~
  - ~~Destination~~
  - ~~Packaging~~
  - ~~No. of loads~~
  - ~~Weight per load~~
  - ~~Price per MT (Price offered)~~
  - ~~Incoterms~~
  - ~~Bid status~~
    - ~~Approved~~
      - ~~Note: At this point, the client will be informed that the Haulage process kicks off~~
    - ~~Accepted~~
      - ~~Show final price, if accepted~~
    - ~~Shipped~~
    - ~~Rejected~~
    - ~~Pending~~
- ~~Admin communications~~
  - ~~The user will be able to see a trail of messages between the WasteTrade Administration team and themselves~~

#### 6.8.11.7 View documents for accepted bids

- ~~The documents will be available on the~~ [~~Bid Details~~](#_jgmwvqh3mnua) ~~page~~
- ~~The documents will be automatically generated by the system~~
- ~~The user will be able to view the following information for each document~~
  - ~~Title~~
  - ~~Description~~
- ~~The user will be able to download the documents~~
- [~~Document~~](#_49v2ciouzfsr) ~~list~~
  - ~~Annex vii~~
  - ~~CMR~~
  - ~~Packing List~~
  - ~~Green Sheet~~
  - ~~Duty of Care~~
  - ~~Sales Invoice~~
  - ~~Purchase order~~
  - ~~Weighbridge ticket (once uploaded by the seller)~~
- ~~The “Good Photo Guide” will also go live for sellers at this point~~

###

### 6.8.12 Favourites

#### 6.8.12.1 Favourites section layout

- ~~This page will show a user all of the listings (sales and wanted) that they have saved to their favourites on the system~~
- ~~The page will have the following elements~~
  - [~~Filters~~](#_nzsy29ljfkdq)
  - [~~Product cards~~](#_ipl5y36vjbnt)
    - ~~Clicking on the card redirects the user to the listing page (product page)~~
  - [~~Account Status~~](#_yxkzqcazfick)

#### 6.8.12.2 Remove from favourites

- ~~The user will be able to remove items from their favourites~~
- ~~The “star” icon on a~~ [~~product card~~](#_ipl5y36vjbnt)~~/~~[~~product page~~](#_ly73gd56x0q1) ~~will be highlighted when it has been favourited~~
- ~~The user will click on the “star” icon to remove it~~
- ~~The highlight will immediately disappear~~
- ~~The item will not be visible on the favourites page when it is refreshed~~

### 6.8.13 Account settings

This section allows the users to manage their account (for example: profile management, managing company details, and notification preferences)

#### 6.8.13.1 Account settings layout

- ~~The page will have a tabbed sub-menu~~
- ~~The main body will display the items associated with the selected sub-menu option~~

#### 6.8.13.2 Account settings - submenu

- ~~The sub-menu will have the following options~~
  - ~~My profile~~
  - ~~Company information~~
  - ~~Material preferences~~
  - ~~Notifications~~
  - ~~Company documents~~
  - ~~My locations~~
    - ~~Add site location~~

#### 6.8.13.3 My profile

- ~~The My Profile section displays the user’s personal information~~
  - ~~Account ID~~
  - ~~Prefix~~
  - ~~First Name~~
  - ~~Last Name~~
  - ~~Email Address~~
  - ~~Telephone~~
- ~~The user will also see an edit button allowing them to edit the profile~~
- ~~There will also be an option to change the password~~
  - ~~This will trigger the~~ [~~set password~~](#_5ti4ev9leqjr) ~~flow~~

#### 6.8.13.4 My profile - edit

- ~~The following items are editable~~
  - ~~Prefix~~
  - ~~First Name~~
  - ~~Last Name~~
  - ~~Email Address~~
  - ~~Telephone~~
- ~~The system will ask the user to confirm their changes before closing the “edit window”~~

#### 6.8.13.5 Company information

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~This section will have the following subsections~~
  - ~~Company information~~
  - ~~Business address~~
- ~~There will be an “information symbol” attached to any incomplete fields~~

####

#### 6.8.13.6 Company information - edit

- ~~The following sections will be editable individually (when the user clicks to edit Company Information, they will not see any information relating to the other sections)~~
  - ~~Company information~~
  - ~~Business address~~
  - ~~Socials (link to social profiles)~~
- ~~The system will ask the user to confirm their changes before closing the “edit window”~~

#### 6.8.13.7 Material preferences

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~The page will display a list of all the materials (selected initially during onboarding)~~
- ~~The user will also see an edit button allowing them to edit the material selection~~

#### 6.8.13.8 Material preferences - edit

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~On clicking on the edit button, the user will see a modal with all of the material choices~~
  - ~~The following categories will be displayed~~
    - ~~Plastic~~
    - ~~Fibre~~
    - ~~Rubber~~
    - ~~Metal~~
    - ~~Other~~
  - ~~Each category will have multiple materials within it~~
    - ~~There will be a checkbox with each material~~
    - ~~The user will be able to select/unselect each material~~
  - ~~There will be a “select all” button that will allow the user to select all the materials displayed~~
- ~~The system will ask the user to confirm their changes before closing the “edit window”~~

#### 6.8.13.9 Notifications preferences

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~The page will display the two notification categories and the user’s present selection~~
  - ~~Email me new listings that match my interests~~
    - ~~Yes/No~~
  - ~~Email me offers on my listings~~
    - ~~Yes/No~~
- ~~The user will also see an edit button allowing them to edit the notification preferences~~

#### 6.8.13.10 Notification preferences - edit

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~On clicking on the edit button, the user will see a modal with all of the notification choices~~
  - ~~The following categories will be displayed~~
    - ~~Email me new listings that match my interests~~
      - ~~Yes/No~~
    - ~~Email me offers on my listings~~
      - ~~Yes/No~~
- ~~The system will ask the user to confirm their changes before closing the “edit window”~~

#### 6.8.13.11 Company documents

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~The following information will be visible (along with the existing responses)~~
  - ~~Which licence/permit do you have?~~
  - ~~Waste Exemptions Upload~~
  - ~~Do you have a Waste Carriers Licence~~
- ~~The user will also see an edit button allowing them to edit the documents section~~

#### 6.8.13.12 Company documents - edit

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~On clicking on the edit button, the user will see a modal with all of the company document choices~~
  - ~~The following information will be editable~~
    - ~~Which licence/permit do you have?~~
      - ~~Environmental Permit~~
      - ~~Waste Exemptions~~
      - ~~Other~~
    - ~~Waste Exemptions Upload~~
      - ~~Upload from device~~
    - ~~Do you have a Waste Carriers Licence~~
      - ~~Yes~~
      - ~~Not applicable~~
- ~~The system will ask the user to confirm their changes before closing the “edit window”~~

#### 6.8.13.13 My locations

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~The user will be able to see all the locations associated with their account~~
  - ~~The following information will be displayed~~
  - ~~Site name, City~~
- ~~The HQ/Head office will always be at the top of the list~~
- ~~The user will be able to click on any location to open the edit location page~~
- ~~There will be a button to add a new location~~

#### 6.8.13.14 Edit a location

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~The following information will be displayed and all the fields will be editable~~
  - ~~Warehouse location~~
    - ~~Location name~~
    - ~~Site point of contact~~
    - ~~Position in company~~
    - ~~Phone number~~
    - ~~Site-specific instructions (optional):~~
      - ~~A space to provide site-specific information for the haulier~~
      - ~~Free-text (500 words max)~~
  - ~~Street Address~~
  - ~~Opening time~~
  - ~~Closing time~~
  - ~~List of accepted materials (checkboxes)~~
  - ~~On-site facilities~~
    - ~~Loading ramp~~
    - ~~Weighbridge~~
    - ~~Loading/unloading~~
    - ~~Types of vehicles/containers accepted on the site~~
  - ~~Licences/Permits~~
    - ~~Do you have a licence/permit on-site?~~
      - ~~If yes, upload it from the device~~
        - ~~The user will be able to add up to 25MB of files (PDFs or images)~~
    - ~~Do you have any access restrictions?~~
- ~~There will be an “update location” button~~
  - ~~If the user makes any changes and does not use the update location button, the system will ask the user to use the button before exiting the page~~

#### 6.8.13.15 Add a new location

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~The following information will be required to create a new location~~
  - ~~Warehouse location~~
    - ~~Location name~~
    - ~~Site point of contact~~
    - ~~Position in company~~
    - ~~Phone number~~
    - ~~Site-specific instructions (optional):~~
      - ~~A space to provide site-specific information for the haulier~~
      - ~~Free-text (500 words max)~~
  - ~~Street Address~~
  - ~~Opening time~~
  - ~~Closing time~~
  - ~~List of accepted materials (checkboxes)~~
  - ~~On-site facilities~~
    - ~~Loading ramp~~
    - ~~Weighbridge~~
    - ~~Loading/unloading~~
    - ~~Types of vehicles/containers accepted on the site~~
  - ~~Licences/Permits~~
    - ~~Do you have a licence/permit on-site?~~
      - ~~Upload site-specific licences from the device~~
        - ~~The user will be able to add up to 25MB of files (PDFs or images)~~
    - ~~Do you have any access restrictions?~~
- ~~There will be an “update location” button~~
  - ~~If the user makes any changes and does not use the update location button, the system will ask the user to use the button before exiting the page~~

#### 6.8.13.16 Delete location

- ~~The section will be built to replicate the current website, optimised for mobile~~
- ~~There will be a delete button within the “Edit a location” view~~
- ~~The system will ask the user to confirm their action:~~
  - ~~Are you sure you want to delete &lt;Site Name&gt; in &lt;Site location&gt; from the platform?~~
- ~~If the user selects yes, then the site will be deleted~~
- ~~If the user selects no, the user will go back to the edit a location page~~

#### 6.8.13.17 Expired documents - reduced access

- ~~If the account owner does not update their documents they will be locked out of their account~~
  - ~~The user will not be able to engage in commercial activities till their document(s) are updated~~
    - ~~Trader - will not be able to buy/sell/list~~
- ~~The~~ [~~account status banner~~](#_yxkzqcazfick) ~~will display a message asking the user to update the document(s)~~

### 6.8.14 Messaging and notifications

#### 6.8.14.1 Sub-navigation: messaging and notifications

- ~~The default page displayed will be notifications~~
- ~~The user will be able to use a sub-menu to go between notifications and messaging sections~~
- ~~The user will see a visual indicator if there is new activity in either section~~

#### 6.8.14.2 Messaging platform - trading app

- ~~The user will be able to view all of their conversations with the admin team within the messaging platform~~
- ~~The user will not be able to directly initiate contact with the admin team unless it is related to a listing~~
- ~~The messages will be displayed in reverse chronological order~~
- ~~The following information will be visible~~
  - ~~Associated listing~~
  - ~~Last message sent~~
- ~~The user will be able to mark the messages as~~
  - ~~Read~~
  - ~~Unread~~
- ~~There will be pagination~~
  - ~~The user will be able to select the number of rows per page~~
    - ~~10~~
    - ~~20~~
      - ~~Default~~
    - ~~50~~
    - ~~All~~
- ~~By default, the page will display the latest messages at the top~~

#### 6.8.14.3 User - Admin communications

- ~~The user will communicate directly with the Admin regarding a particular bid/listing page through the app~~
- ~~The communications trail will be visible~~
- ~~The messaging structure will be the same as a standard messaging service~~
  - ~~Admin messages will feature on the left side of the section~~
  - ~~Buyer messages will be on the right side of the section~~
  - ~~All messages will be time-stamped~~
  - ~~The native typing features will be used~~
  - ~~The user will be able to add attachments of up to 25MB (total) to their message~~
    - ~~Upload from device~~

#### 6.8.14.4 Notifications centre

- ~~The user will be able to view and manage all notifications in the notification centre~~
- ~~There will be a link to the~~ [~~notification settings~~](#_qx4kob2zdoua)
- ~~The user will be able to view each notification in full detail~~
  - ~~Notifications will be displayed in reverse chronological order (latest first)~~
  - ~~There will be a timestamp on each notification~~
    - ~~dd/mm/yyyy HH: MM~~
- ~~The user will be able to mark the notifications as~~
  - ~~Read~~
  - ~~Unread~~
- ~~There will be pagination~~
  - ~~The user will be able to select the number of rows per page~~
    - ~~10~~
    - ~~20~~
      - ~~Default~~
    - ~~50~~
    - ~~All~~
- ~~By default, the page will display the latest notifications at the top~~

#### 6.8.14.5 In-app notifications - buyer

- ~~The users will receive notifications at the following points related to buying/bids~~
  - ~~Bid approved/rejected~~
  - ~~Received communication from the admin (listing requires attention; status: pending)~~
  - ~~Bid accepted~~
  - ~~Further points to be decided~~
- ~~All notifications will contain a link to the original listing~~

#### 6.8.14.6 In-app notifications - seller

- ~~The users will receive notifications at the following points related to sales/listings~~
  - ~~Listing approved/rejected~~
  - ~~A new haulage offer received~~
  - ~~Received communication from the admin (listing requires attention; status: pending)~~
  - ~~Documents generated~~
  - ~~Further points to be decided~~
- ~~All notifications will contain a link to the original listing~~

#### 6.8.14.7 In-app notifications - wanted listing owner

- ~~The listing owner will receive notifications at the following points~~
  - ~~Listing approved/rejected~~
  - ~~Documents generated~~
  - ~~Received communication from the admin (listing requires attention; status: pending)~~
  - ~~Further points to be decided~~
- ~~All notifications will contain a link to the original listing~~

# 7 Appendix

## 7.1 Integrations

#### 7.1.0.1 CRM

- Salesforce

<table><thead><tr><th><p><strong>Acceptance criteria</strong></p><ul><li>The objective of integrating Salesforce with the new WasteTrade platform is to:<ul><li>Ensure centralised, real-time access to user and commercial data.</li><li>Maintain a single source of truth (the Wastetrade platform).</li><li>Eliminate duplication of data and admin effort.</li><li>Support full visibility and control over users, bids, listings, and commercial operations.</li><li>Enable bidirectional, secure, and scalable data exchange.</li></ul></li><li>Integration Architecture &amp; Behaviour<ul><li>Data Flow Overview<ul><li>The Wastetrade platform is the source of truth.</li><li>Auto-push new and updated data from the platform to Salesforce (on registration, onboarding, bid creation, listing, etc.)</li><li>Data is pulled from Salesforce to the platform, following Admin changes (e.g. member approvals, edits) are synced back</li></ul></li><li>Key Principles<ul><li>The platform is authoritative for user data, onboarding, and commercial records.</li><li>Salesforce must never overwrite core user or listing data unless explicitly configured (e.g., via an admin-verified action).</li><li>Existing Salesforce users (pre-integration) must be matched by Email<ul><li>If a match exists, update the existing record.</li><li>If not, create a new Lead or Account as per normal flow (see below).</li></ul></li></ul></li></ul></li><li>Data Structure &amp; Field Mapping<ul><li>All data fields used in registration, onboarding, bidding, listings, and haulier activities must be explicitly mapped to corresponding Salesforce fields, as defined in the<a href="https://docs.google.com/spreadsheets/d/1SCfseYAxfdTLStraLuf8BS8qxgGoFJzxk3noJRTSEwc/edit?gid=1833436046#gid=1833436046">Salesforce CRM data schema</a></li><li>Fields marked as required must be validated on the platform before sync.</li><li>Any changes to mapped fields must trigger a resync of the specific record.</li></ul></li><li>Synchronisation Logic<ul><li>Registration submitted: Create Lead<ul><li>Before creating a new record:<ul><li>Search for a matching email</li><li>If found, update existing record</li><li>If not found, create a new Lead/Account</li></ul></li></ul></li><li>Onboarding verified: Convert to Account</li><li>Listing created/updated: Push to Salesforce</li><li>Bid submitted: Push to Salesforce</li><li>Admin updates in CRM: Push to platform</li></ul></li><li>Core Functional Requirements<ul><li>The Admin will be able to carry out management functions within the platform, as defined within this document.</li><li>The Admin will be able to carry out management functions within the Salesforce CRM:<ul><li>Member Management<ul><li>View/search members (new, onboarding, verified)</li><li>Edit profiles and statuses</li><li>Approve/Reject/Request more info</li><li>Add internal notes or flags<ul><li>Platform Response:</li></ul></li></ul></li></ul></li></ul></li></ul><p><s>Trigger in-app notifications for user status updates</s></p><p>Lock/unlock features based on status</p><ul><li><ul><li><ul><li>Commercial Activity<ul><li>View all submitted bids (with full details), sales and wanted listings<ul><li>Each record must contain:</li></ul></li></ul></li></ul></li></ul></li></ul><p>Seller/Buyer details</p><p>Counterparty details</p><p>Full material and transport specs</p><p>Bid/List status</p><p>Admin communication logs</p><ul><li><ul><li><ul><li><ul><li>Change bid/listing statuses</li><li>Flag listings for review</li><li>Reject listings</li><li>View fulfilment status</li></ul></li></ul></li></ul></li><li>Security &amp; Compliance<ul><li>Encrypted API connections for all data exchanges (TLS 1.2+).</li><li>Only authenticated roles may access/update CRM data.</li><li>Fully GDPR-compliant, with auditability of consents.</li><li>All sensitive fields (e.g. emails, VAT numbers) must be encrypted in transit and stored per best practice.</li></ul></li></ul></th></tr></thead></table>

#### 7.1.0.2 VAT registration checker

- ~~UK VAT Registration~~

####

#### 7.1.0.3 Email client

#### 7.1.0.4 Exchange rate API

- ~~Exchange rate API~~

####

#### 7.1.0.5 WasteTrade Price Calculator

- Existing calculator built by WasteTrade that calculates and displays prices, taking into account all the factors
- The calculator takes into account the following:
  - Incoterms
  - PERN status
- The Exchange Rate API will work simultaneously (when multi-currency transactions are taking place)

####

#### 7.1.0.6 Product Database

- Integrate with existing product database (WasteTrade)

####

#### 7.1.0.7 SEO Integration

- ~~Enable SEO management (including backlinks management)~~
- ~~Ahref, Ubersuggest~~

#### 7.1.0.8 LinkedIn Analytics

- ~~B13 will perform the integration~~
- ~~The client will perform the setup~~

####

#### 7.1.0.9 Google Analytics

- ~~B13 will perform the integration~~
- ~~The client will perform the setup~~

#### 7.1.0.10 Google Tag Manager

- ~~B13 will perform the integration~~
- ~~The client will perform the setup~~

####

#### 7.1.0.11 Clarity (Microsoft)

- ~~B13 will perform the integration~~
- ~~The client will perform the setup~~

#### 7.1.0.12 Multi-language integration

- The integration will enable accurate multi-language translation (use the same tool as WasteTrade uses at present)  

#### 7.1.0.13 Data visualisation

- ~~PowerBI/Tableau~~

####

## 7.2 Web App Non-Functional Requirements

### 7.2.1 Browsers

#### 7.2.1.1 Browsers - Standard

- Chrome, Edge, Safari, Firefox
  - Latest versions at the start of development, to be defined in the SDS

#### 7.2.1.2 Browsers - Enhanced

- As Standard plus Opera, Samsung Internet
  - Latest versions at the start of development, to be defined in the SDS

###

### 7.2.2 Design

#### 7.2.2.1 Design - Standard

- Responsive design for higher resolution screens, most often found in desktop and laptop computers
  - Screen resolutions of 1920×1080, 1536×864 and 1366×768
  - Feb 2023 - this would cover 54.3% of desktops in Europe (source: <https://gs.statcounter.com/screen-resolution-stats>)

#### 7.2.2.2 Design - Enhanced

- As Standard, with the addition of smaller resolution screens, most often found in mobile and tablet devices
  - Screen resolutions of 768x1024, 1280x800, 810x1080, 390x844, 360x800, 414x896, and 393x873
  - Feb 2023 - this would cover 47.8% of tablets and 32.3% of mobile devices in Europe (source: <https://gs.statcounter.com/screen-resolution-stats>)

### 7.2.3 Version Management

#### 7.2.3.1 Version Management - Standard

- The browser cache will be refreshed each time a new version of the app is released
- This will prevent CSS and Javascript errors caused by old files in the browser cache

#### 7.2.3.2 Version Management - Enhanced

- The app version will be displayed at an appropriate place within the user interface
- This can be particularly useful for debugging, reporting issues and supporting users

###

### 7.2.4 Speed

#### 7.2.4.1 Speed - Standard

- Speed will be dependent on the network connection speed and geographical location, but assuming a reasonable connection all page loads and should be less than 2 seconds
- Any delays over 2 seconds will show a spinner

###

### 7.2.5 Language

#### 7.2.5.1 Language - Standard

- English only

#### 7.2.5.2 Language - Enhanced

- The system will be built with multi-language capabilities
  - Left to right languages only
  - Translations will be provided by the client
  - Note: the non-functional requirements relate to the setting up of language in the backend. There will only be a front end to change language if there is a specific user story relating to this.

###

### 7.2.6 Accessibility

#### 7.2.6.1 Accessibility - Standard

- None
  - There will be no additional testing or effort to ensure the application utilises any accessibility requirements (e.g. screen-readers)

###

### 7.2.7 Offline mode

#### 7.2.7.1 Offline mode - Standard

- No offline mode - a network connection will be required to access and use the system

###

### 7.2.8 Analytics

#### 7.2.8.1 Analytics - Standard

- Basic data capture on the app

#### 7.2.8.2 Analytics - Enhanced

- ~~Provide event tracking through Google Analytics~~

###

### 7.2.9 Testing

#### 7.2.9.1 Testing - Standard

- The offshore and onshore test teams will test each sprint before demos and delivery

#### 7.2.9.2 Testing - Enhanced

- ~~Automated integration scripts, unit testing, code coverage of 20%~~

###

### 7.2.10 Security

#### 7.2.10.1 Security - Standard

- Lock down the database server to approved IPs only
- Only expose necessary ports on the database and application server
- Control access using SSH
- Encrypted communication between the database and server
- Encrypted communication between the web app and the client (SSL)
- Passwords will be encrypted in the database
- Horizontally scalable servers for stability and resilience
- Use the latest version of the framework at the time of project initialisation
- Daily database backup

#### 7.2.10.2 Security - Enhanced

- ~~Encrypted database~~
- ~~AWS Security Hub Automated Response and Remediation~~
- ~~AWS Shield to protect against DoS attacks~~
- ~~Install Node.JS libraries for increased vulnerability protection~~
- ~~Redundancy protection - a secondary database to be used if the primary database fails~~
- ~~Use of Amazon CloudFront and Amazon S3 for caching~~

###

### 7.2.11 Infrastructure

#### 7.2.11.1 Infrastructure - Standard

- Infrastructure requirements will be defined by the technical lead depending on the complexity of the system

###

### 7.2.12 Deployment

#### 7.2.12.1 Deployment - Standard

- Single server

#### 7.2.12.2 Deployment - Enhanced

- ~~Horizontally scanned through the load balancer~~
- ~~There will be a load balancer and two or more application servers running the backend code~~

## 7.3 On-Going Costs and Subscriptions

- Extended Warranty
  - 12 % of build cost per year, paid monthly
- Emails
  - <https://sendgrid.com/en-us/pricing>
- SMS
  - <https://www.twilio.com/en-us/sms/pricing/gb>
- Firebase
  - <https://firebase.google.com/pricing>

## 7.4 Future Scope

_This section covers the future functionality that the WasteTrade team would like to target in future phases. This information should allow for appropriate technical choices from the start._

#### 7.4.0.1 Mobile App (Haulage)

- ~~The mobile app will replicate the entire functionality of the web platform~~
- ~~The user will be able to complete registration through the app~~
- ~~The user will be able to complete the onboarding process through the app~~
- ~~The users will be able to~~
- ~~Hauliers will be able to~~
  - ~~Bid on haulage jobs~~
  - ~~Manage haulage activity~~

#### 7.4.0.2 Delivery date arrangement

- ~~This functionality will allow the sellers, buyers, and hauliers to work together to establish convenient dates.~~
- ~~The dates will be set in platform and will be visible to all three parties~~
- ~~The system will notify the trader on the pick/delivery date~~

#### 7.4.0.3 Hauliers companion app

- ~~The app will not require a login but, just a unique ID to correctly identify the transaction~~
- ~~The app will be built to work offline~~
- ~~The app will get the haulier to confirm the details of the load (to ensure that the right material is being collected)~~
- ~~The app will enable haulier-led evidence capture (e.g. loading day photos)~~

#### 7.4.0.4 Document translation

- ~~The platform will have international users~~
- ~~The users will provide permits and licences that may not be in English~~
- ~~The WasteTrade Admin team will be able to use a tool to translate the document into English where possible~~

#### 7.4.0.5 Improving listings algorithm

- ~~The foundations for preference based listing display has been laid however, the future will see more nuanced improvements:~~
  - ~~For example: Not showing a metal listing to a buyer who is only interested in plastic or not showing international jobs to a haulier who only wants to work in their local area (haulier’s ability to select their operating area(s) )~~
  - ~~See~~ [~~Listings Algorithm~~](#_1rqgm7me2c6r)

#### 7.4.0.6 Haulage price estimator

- ~~The platform will provide hauliers with “guide prices” for their bids~~
- ~~The cost will be calculated using distance between pick-up and delivery locations~~
- ~~The WasteTrade team are exploring the use of a tool called SeaRoutes~~
  - ~~Routing API~~

####

#### 7.4.0.7 Co2 Emissions calculator

- ~~The platform will provide Co2 calculations for each trade~~
- ~~The WasteTrade team are exploring the use of a tool called SeaRoutes~~
  - ~~Sea routes Co2 API~~

####

#### 7.4.0.8 Management Information

- ~~WasteTrade team are developing concepts for MI dashboards~~
- ~~B13 team will work with WasteTrade to define the scope for this development~~

#### 7.4.0.9 Enhancing help and support

- ~~A ticketing system will be integrated into the platform enhancing the help and support experience for both end users and the WasteTrade team~~

####

#### 7.4.0.10 Robust onboarding

- ~~The registration and onboarding process will be made more secure and robust~~
- ~~The users will go through~~
  - ~~KYCs~~
  - ~~Credit checks~~
  - ~~Companies House Check~~

####

#### 7.4.0.11 AI integration

- ~~The platform will see AI enhance various aspects of the experience:~~
  - ~~Material recognition (support loading procedures)~~
  - ~~Trading assistant~~
    - ~~Profile management~~
    - ~~Listing creation~~

#### 7.4.0.12 Organisation management

- ~~The platform will have organisational management capabilities~~
- ~~Multiple users belonging to the same organisation, will be associated with the organisation (eliminating duplication of organisations, and sites)~~

#### ~~7.4.0.13. Admin Home Page Layout~~

- ~~This US is an expansion from the existing Admin home page (~~[~~6.6.1.1~~](#_535011t2xz2m)~~).~~
- ~~The Admin homepage will have additional tabs for:~~
  - ~~Sample Requests~~
    - ~~Will have sub-tabs for:~~
      - ~~New~~
      - ~~Sent~~
  - ~~MFI Tests~~
  - ~~Expiring Listings~~
  - ~~Expired Listings~~
  - ~~Haulage Calculator~~

#### ~~7.4.0.14. View Sample Requests~~

- ~~Sample requests will be shown in the Admin home page - New samples tab.~~
- ~~The table will show a list of the active (i.e. unsent) sample requests~~
- ~~The table will have the following columns~~
  - ~~Listing ID~~
  - ~~Material~~
  - ~~Requested~~
  - ~~Date~~
  - ~~Number of Samples~~
  - ~~Sample Size~~
  - ~~Buyer~~
  - ~~Buyer Location~~
  - ~~Seller~~
  - ~~Seller Warehouse~~
  - ~~Admin Requested~~
  - ~~Received~~
    - ~~Button for Admin to select~~
  - ~~Posted~~
    - ~~Button for Admin to select~~
    - ~~Moves sample to Sent table~~
  - ~~Label~~
    - ~~Buttom for Admin to download postage label~~
  - ~~Delete~~
    - ~~Button for Admin to remove the sample request~~
  - ~~Information tooltip~~
    - ~~Displays sample request message (if applicable)~~
  - ~~Notes~~
    - ~~Admin can select to open the notes modal with a button to save~~

#### ~~7.4.0.15. View Sent Sample Requests~~

- ~~Sent Ssmple requests will be shown in the Admin home page - Sent samples tab.~~
- ~~The table will show a list of the active (i.e. unsent) sample requests~~
- ~~The table will have the following columns~~
  - ~~Listing ID~~
  - ~~Material~~
  - ~~Requested~~
  - ~~Date~~
  - ~~Number of Samples~~
  - ~~Sample Size~~
  - ~~Buyer~~
  - ~~Buyer Location~~
  - ~~Seller~~
  - ~~Seller Warehouse~~
  - ~~Requested~~
  - ~~Received~~
  - ~~Posted~~

#### ~~7.4.0.16. View MFI Tests~~

- ~~The table will show a list of the active (i.e. unsent) sample requests~~
- ~~The table will have the following columns~~
  - ~~Listing ID~~
  - ~~Material~~
  - ~~Requested Date~~
  - ~~Buyer~~
  - ~~Seller~~
  - ~~Requested~~
    - ~~Button for Admin to select~~
  - ~~Received~~
  - ~~Tested~~
  - ~~Delete~~
    - ~~Button for Admin to remove the sample request~~
  - ~~Notes~~
    - ~~Admin can select to open the notes modal with a button to save~~

#### ~~7.4.0.17. View Expiring Listings~~

- ~~Expiring listings will be shown in the Admin home page - Expiring listings tab.~~
- ~~The table will show a list of the active (i.e. unsent) sample requests~~
- ~~The table will have the following columns~~
  - ~~Username (Admin Link)~~
  - ~~Name~~
  - ~~Company Name~~
  - ~~Email~~
  - ~~Waste Location~~
  - ~~Material Group~~
  - ~~Expiry Date~~
  - ~~Permalink~~
- ~~There will be functionality to download as CSV~~

#### ~~7.4.0.18. View Expired Listings~~

- ~~Expired listings will be shown in the Admin home page - Expired listings tab.~~
- ~~The table will show a list of the active (i.e. unsent) sample requests~~
- ~~The table will have the following columns~~
  - ~~Username (Admin Link)~~
  - ~~Name~~
  - ~~Company Name~~
  - ~~Email~~
  - ~~Waste Location~~
  - ~~Material Group~~
  - ~~Expiry Date~~
  - ~~Permalink~~
- ~~There will be functionality to download as CSV~~

#### ~~7.4.0.19. Assign Admin~~

- ~~Specific activity tables will have the ability to assign Admin.~~
  - ~~New samples~~
  - ~~MFI test requests~~
  - ~~New Haulage offers~~
  - ~~New listings~~
- ~~There will be a button to update~~
  - ~~Selecting this will update the corresponding activity table to reflect the new assigned admin.~~

#### ~~7.4.0.20. Notifications for Admins~~

- ~~There will be notification system to alert Admins of system changes.~~
- ~~Specific notifications for: Verify User, Approve Listing/Offer, etc.~~
- ~~There will be a Mark all read button.~~

#### ~~7.4.0.21. User Surveys~~

- ~~The user will be prompted to complete feedback surveys.~~
- ~~Feedback forms will be preseted to the user following:~~
  - ~~Create Listing~~
  - ~~Complete Account~~
  - ~~Place Offer~~
- ~~Forms will contain a 5 star likert option and a free-text box to provide feedback for the process.~~
- ~~Responses will be collated within a CSV spreadsheet containing:~~
  - ~~Process~~
  - ~~Date/Time~~
  - ~~Feedback message content~~
- ~~The CSV will be emailed to the client weekly.~~

#### ~~7.4.0.22. User can Book 1-2-1~~

- ~~The user will be presented with a “Book 1-2-1” button on the following pages:~~
  - ~~Create Listing~~
  - ~~Complete account~~
  - ~~Upload Documents~~
  - ~~Onboarding~~
- ~~The user can select the button to open the Wastetrade calendly in a new web page.~~
  - ~~Client to provide link.~~
  - ~~The web page will be opened in the user device default browser.~~
  - ~~Calendly invites will be managed offline by the client.~~

#### ~~7.4.0.23. Onboarding Tour~~

- ~~After first successful login after registration the user will be prompted to "Take a Tour".~~
- ~~This will start an interactive tour/sequence of the platform, highlighting key areas.~~
- ~~There will be a modal presenting core features of the platform.~~
  - [~~https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=14197-20469&t=QmO7yUX8btLICoIz-0~~](https://www.figma.com/design/fTRdQ8ibwzcY28S4FjFye5/WT---Platform?node-id=14197-20469&t=QmO7yUX8btLICoIz-0)
  - ~~There will be “Previous” and “Next” buttons to navigate between~~

## 7.5 Email content

#### 7.5.0.1 Register email


#### 7.5.0.5 New listing (as per material preferences)


#### 7.5.0.7 Listing approved by admin

#### ~~7.5.0.8 Ongoing Listing Renewal~~

- ~~There will be an email to the owner of an “Ongoing” listing every time the listing automatically renews.~~
- ~~The email will prompt the user to revisit the listing to make necessary updates.~~

#### ~~7.5.0.8 Renew Ongoing Listing Reminder~~

- ~~There will be an email to the owner of an “Ongoing” listing 3 months after creating the listing.~~
- ~~The email will prompt the user to revisit the listing to make necessary updates.~~

##