


Wastetrade Phase 2 - Functional Overview v1.0![ref1]![ref1]

Date	Thursday 21st August 2025

Client	Wastetrade

Job Name	Wastetrade Rebuild

Requested by	Bevin Tumulty, Jason Loughlin

Written by	Paige Walczak		
# <a name="_yl9vht6mhb21"></a>**1. Table of Contents**
[**1. Table of Contents	1**](#_yl9vht6mhb21)

[**2. Background and Concept	3**](#_b398vhk8f1c6)

[2.1. Project Overview	3](#_h18otb85rvu0)

[**3. Glossary	4**](#_5ist5xl3njlw)

[**4. Users	5**](#_5x7gvu7enzwc)

[4.1. Permissions Table	5](#_sokywzgnlbka)

[**5. Integrations and Non-Functional Requirements	5**](#_a5bz4r1ah8kf)

[**6. Detailed Functional Requirements	6**](#_tp6s7yytcmn0)

[6.1. Trading Platform	6](#_tr11tj8zjxz5)

[6.1.1. Registration	6](#_8mxty49bu1k1)

[6.1.2. My Sales Listings	16](#_yhwq3di1vvki)

[6.1.3. My Wanted Listings	39](#_5xjp39gg6ufu)

[6.1.4. My Offers	42](#_biq18450u4wz)

[6.1.5. Marketplace	44](#_9w0uwacynruy)

[6.1.6. Trading Notifications	52](#_4709v4eustee)

[6.1.7. Account	65](#_chgrqsmd6b7z)

[6.2. Haulage Platform	73](#_y0x92s8wqolm)

[6.2.1. Registration	73](#_ar4j32xn1g83)

[6.2.2. Haulage Homepage	79](#_ct30v3yefpth)

[6.2.3. My Haulage Offers	91](#_uaxisbxm9vob)

[6.2.4. Haulier Profile	102](#_2bgy6khtnhb5)

[6.2.5. Haulier Notifications	112](#_rfznaarv8d8j)

[6.3. Master Elements	121](#_ck3150ajz2ik)

[6.3.1. Resources	121](#_n4d45x995wkf)

[6.3.2. Layout	122](#_3ntznfl523m4)

[6.3.3. Multi-User Company Accounts	123](#_1xbw0l9e4muh)

[6.4. Admin	151](#_87rc4smg8kbv)

[6.4.1 Admin Dashboard	151](#_uabqr1eljyt7)

[6.4.2. User Management	212](#_eu1j4ce7wdf0)

[6.4.3. Resource Content Management	224](#_yjsqrtw9j33j)

[6.4.4. Settings	227](#_oyn7r0qmfljs)

[6.5. Salesforce Integration	233](#_gx05pclx5dm4)

[6.5.1. Data Exchange	233](#_iko6sn1rhn9t)

[6.5.2. Document Generation	246](#_msw6k3ctm7d4)

[6.6. Trading Mobile App	247](#_31rtucueagsn)

[6.6.1. Download and Installation	247](#_o355t8xykayp)

[6.6.2. Splash Screen	247](#_b9f89zj9p5xe)

[6.6.3. Landing Page	248](#_oc311knyr5z3)

[6.6.4. Registration	248](#_oynzwbk5s0zd)

[6.6.5. Authentication	248](#_9ssis3xelfd7)

[6.6.6. Trading Homepage	249](#_w1iw7uxflmf7)

[6.6.7. Wanted Listings	251](#_fqomit75q1nw)

[6.6.8. Sales Listings	254](#_yvyncqb6f499)

[6.6.9. My Sales Listings	255](#_kgd2cau2d9r5)

[6.6.10 My Wanted Listings	256](#_be8j3blwqbmp)

[6.6.11. My Offers	258](#_jpg04n6zw8z2)

[6.6.12. Account	260](#_lkvx903bsf2q)

[6.6.13. Notifications	263](#_mx3m1ellitd)

[6.7. Design/UI Updates	264](#_923fdmp6h6y7)

[6.7.1. Design Updates	264](#_r16oc5u3359r)

[**7. Appendix	1**](#_je70fqvw58bd)

[7.1. Integrations	1](#_7g6d77yuww4k)

[7.2. Web App Non-Functional Requirements	1](#_kuz0v21fa22z)

[7.2.1. Browsers	1](#_9b8eo47k285r)

[7.2.2. Design	1](#_3hun3g2nblkt)

[7.2.3. Version Management	1](#_ust9ganeltvc)

[7.2.4. Speed	1](#_6kurlqitnvg8)

[7.2.5. Language	1](#_rm23zefe0klh)

[7.2.6. Accessibility	1](#_b4pdl650dayh)

[7.2.7. Offline mode	1](#_ttdfg3omfod)

[7.2.8. Analytics	1](#_xd3eg7rvmoyh)

[7.2.9. Testing	1](#_jzajd6mwhrfi)

[7.2.10. Security	1](#_iwtpqkclxa27)

[7.2.11. Infrastructure	1](#_lcb7dfm4zoem)

[7.2.12. Deployment	1](#_g3x7uioxtk2h)

[7.3. Mobile App Non-Functional Requirements	1](#_uzms16mo45fx)

[7.3.1. Devices	1](#_em32d7eb454w)

[7.3.2. Design	1](#_3fuxx65y0xnd)

[7.3.3. Version Management	1](#_lb0ypz7ryx16)

[7.3.4. Speed	1](#_31bactb2ldh7)

[7.3.5. Language	1](#_9t8zkatrodin)

[7.3.6. Accessibility	1](#_f4sev7s9ygue)

[7.3.7. Offline mode	1](#_ww6ji93dpgcn)

[7.3.8. Analytics	1](#_8s8kmiatq9zv)

[7.3.9. Testing	1](#_lyysxfbb4sin)

[7.3.10. Security	1](#_x6iuu4ol3nid)

[7.3.11. Infrastructure	1](#_wm5e2ploin5w)

[7.3.12. Deployment	1](#_44a5p2qezlj7)

[7.4. On-Going Costs and Subscriptions	1](#_5ovkz17zjhwd)

# <a name="_b398vhk8f1c6"></a>**2. Background and Concept**
WasteTrade is a Global Waste Marketplace. The website is <https://www.wastetrade.com/>. WasteTrade is an online marketplace to connect waste generators, such as manufacturers, with recyclers and end users of waste commodities around the globe. Users register to become Buyers, Sellers or Hauliers. Sellers list their waste on the site, and Buyers can search and bid for the listing. Hauliers bid to transport the traded waste. Buyers and Hauliers must be accredited and certified to be able to bid to purchase or transport the waste. Sellers are accredited, certified, and vetted to ensure accurate listings.

Phase 1 of the WasteTrade Rebuild delivers the core foundation for user registration, onboarding, trading, account management, and Admin oversight. The trading platform enables users to create, manage, and respond to listings for both sales and wanted materials. Offer functionality allows users to view and manage offers they’ve received or made on listings and review bid details. For admins, Phase 1 delivers oversight capabilities through the dashboard, approval workflows, CRM integration, and audit trails, enabling effective monitoring and governance. Collectively, this phase establishes a trusted, user-friendly, and controlled platform that connects Buyers, Sellers, and Hauliers while laying the groundwork for future expansion.\
\
[Wastetrade - Functional Overview](https://docs.google.com/document/d/1UIQh4lQkmkelTPbB9hwutt0s4EtgMEUfjn85RNVVoQw/edit?tab=t.0)

The purpose of this document is to describe the functional and non-functional requirements of the system. Technical requirements will be defined later in the process, once the functional requirements of the scope are defined. Any wireframes included in this document are not indicative of the final design. 
## <a name="_h18otb85rvu0"></a>**2.1. Project Overview**
Phase 2 looks to build on the foundation established in Phase 1 by significantly expanding WasteTrade’s functionality. The secondary phase introduces new user roles, notably Hauliers, who are responsible for bidding on and fulfilling transport jobs. This broadens the trading platform to support a fully integrated marketplace where Buyers, Sellers, and Hauliers interact seamlessly under a controlled and accredited environment. It includes enhanced tools for listing creation, offer management, bidding, notifications, and document management. ~~Phase 2 also introduces a mobile application that replicates the core marketplace features, with the intention of expanding its capabilities in future phases so that the mobile experience fully aligns with the website.~~ In parallel, Administrator tools are also enhanced to provide greater oversight of the marketplace and Hauliers, including support for listings, offers, and haulage bids, as well as broader platform management features such as resource and Admin user management. Collectively, Phase 2 is designed to transform WasteTrade from a foundational marketplace into a more complete, feature-rich platform that facilitates global waste trading, ensures compliance, and supports scalability for future growth.
# <a name="_5ist5xl3njlw"></a>**3. Glossary**
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
# <a name="_5x7gvu7enzwc"></a>**4. Users**
User numbers are indicative to give the development team an idea of the expected size of the system. These user numbers are not fixed limits.

|**Role Name**|**No. of Users**|**Responsibility / Activity**|
| :- | :- | :- |
|Super Admin|4|<p>- System settings</p><p>- All Admin user management</p><p>- Admin dashboard</p>|
|Admin|5 - 20|<p>- Admin/Sales Admin user management</p><p>- Admin Dashboard</p>|
|Sales Admin|5 - 20|- Admin dashboard only|
|Trader <br><br>(Buyer/Seller/<br>Both)|1000|<p>- Create/manage Sales listings</p><p>- Create/manage Wanted listings</p><p>- View/search marketplace</p><p>- Place bids and manage offers</p><p>- Manage company profile, documents, and locations.</p>|
|Haulier|500|<p>- View available loads</p><p>- Manage my offers</p><p>- Manage haulage profile</p>|

## <a name="_sokywzgnlbka"></a>**4.1. Permissions Table**
[Permissions for WasteTrade](https://docs.google.com/spreadsheets/d/1aQtwC2a-2Ab3IRhkyaL1CeaaHBsIgYnS0NvcZCv-KNQ/edit?usp=sharing)
# <a name="_a5bz4r1ah8kf"></a>**5. Integrations and Non-Functional Requirements**
Standard Non-Functional requirements will be included in the application development. Enhanced and Super Enhanced features will incur additional costs and will be defined as in-scope or out-of-scope during the MoSCoW session. 

- [Integration requirements](#_7g6d77yuww4k)
- [Web app non-functional requirements](#_kuz0v21fa22z)
- [Mobile app non-functional requirements](#_uzms16mo45fx)
# <a name="_tp6s7yytcmn0"></a>**6. Detailed Functional Requirements**
## <a name="_tr11tj8zjxz5"></a><a name="_87rc4smg8kbv"></a>**6.4. Admin**
### <a name="_uabqr1eljyt7"></a>6.4.1 Admin Dashboard 
#### <a name="_9tlqtjnx8l54"></a>**6.4.1.1. Admin Navigation Menu**
- This is an update to existing functionality within the Admin dashboard; updates are highlighted in yellow.
- The horizontal menu for the Dashboard (containing Users, Listings, Offers, Wanted) will be incorporated into the side menu, as a sub-selection within Dashboard.
- The sidebar menu will display:
  - Dashboard
    - Users
    - Listings
    - Wanted
    - Offers
    - Haulage Bids
    - Samples
    - MFI
      - Each dashboard element will have a horizontal menu.
  - User Management ([6.4.2](#_eu1j4ce7wdf0))
  - Support Content Management ([6.4.3](#_yjsqrtw9j33j))
  - Settings ([6.4.4](#_oyn7r0qmfljs))
- The horizontal tabs will act as filters for the selected table.
  - E.g. Selecting the “Unverified” horizontal tab within the “Users” view will update the users table to display only unverified users.
- The default selection for any page will be “All”.
  - E.g. Selecting “Users” from the side menu will open the user table to view “All” users within the table.

|<p>**Scope & Preconditions:**</p><p>- This is an update to existing functionality within the Admin dashboard; updates are highlighted in yellow.</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- The admin is viewing any page within the admin portal.</p><p></p><p>**Acceptance Criteria:**</p><p>- The existing side menu will be updated:</p><p>&emsp;- Dashboard</p><p>&emsp;&emsp;- Users</p><p>&emsp;&emsp;- Listings</p><p>&emsp;&emsp;- Wanted</p><p>&emsp;&emsp;- Offers</p><p>&emsp;&emsp;- Haulage Bids</p><p>&emsp;&emsp;- Samples</p><p>&emsp;&emsp;- MFI</p><p>&emsp;- User Management ([6.4.2](#_eu1j4ce7wdf0))</p><p>&emsp;- ~~Document Management~~</p><p>&emsp;- Support Content Management ([6.4.3](#_yjsqrtw9j33j))</p><p>&emsp;- ~~Analytics (management information)~~</p><p>- Then instead of a sub-menu within each of the dashboard areas, a contextual horizontal tab bar will be shown directly above the dashboard table; acting as a server-side filter.</p><p>&emsp;- Users ([6.4.1.2](#_3q8bhwn2jgnl))</p><p>&emsp;&emsp;- All (default): all users</p><p>&emsp;&emsp;- Unverified: awaiting review/needs more info (Phase 1 – 7.6.0.20)</p><p>&emsp;&emsp;- Verified: approved by admin (Phase 1 – 7.6.0.20)</p><p>&emsp;&emsp;- Rejected: rejected by admin (Phase 1 – 7.6.0.20)</p><p>&emsp;&emsp;- Inactive: (future scope)</p><p>&emsp;&emsp;- Blocked: (future scope)</p><p>&emsp;- Listings ([6.4.1.5](#_u2u1trwyjxj6))</p><p>&emsp;&emsp;- All (default)</p><p>&emsp;&emsp;- Unverified </p><p>&emsp;&emsp;- Verified: approved by admin (Phase 1 – 7.6.0.20)</p><p>&emsp;&emsp;- Approved (Phase 1 – 6.6.2.15)</p><p>&emsp;&emsp;- Rejected (Phase 1 – 6.6.2.15)</p><p>&emsp;&emsp;- Inactive: (future scope)</p><p>&emsp;&emsp;- Blocked: (future scope)</p><p>&emsp;- Wanted ([6.4.1.7](#_ihhvs12l52de))</p><p>&emsp;&emsp;- All (default)</p><p>&emsp;&emsp;- Unverified</p><p>&emsp;&emsp;- Verified</p><p>&emsp;&emsp;- Approved</p><p>&emsp;&emsp;- Rejected</p><p>&emsp;&emsp;- Inactive: (future scope)</p><p>&emsp;&emsp;- Blocked: (future scope)</p><p>&emsp;- Offers [(6.4.1.9](#_91yj68uyh5s7))</p><p>&emsp;&emsp;- All (default)</p><p>&emsp;&emsp;- Unverified </p><p>&emsp;&emsp;- Verified</p><p>&emsp;&emsp;- Pending: awaiting review/needs more info (Phase 1 – 6.6.2.11)</p><p>&emsp;&emsp;- Approved (by Admin, Phase 1 – 6.6.2.11)</p><p>&emsp;&emsp;- Rejected (by Admin, Phase 1 – 6.6.2.11)</p><p>&emsp;&emsp;- Accepted (Approved by Seller, Phase 1, 6.4.6.2)</p><p>&emsp;&emsp;- Unsuccessful (Rejected by Seller, Phase 1, 6.4.6.2)</p><p>&emsp;&emsp;- Inactive: (future scope)</p><p>&emsp;&emsp;- Blocked: (future scope)</p><p>&emsp;- Haulage Offers ([6.4.1.12](#_isf6t9nej4i))</p><p>&emsp;&emsp;- All (default)</p><p>&emsp;&emsp;- Unverified </p><p>&emsp;&emsp;- Verified</p><p>&emsp;&emsp;- Pending: awaiting review/needs more info ([6.4.1.14](#_xxwqkx8xqoo7))</p><p>&emsp;&emsp;- Approved ([6.4.1.14](#_xxwqkx8xqoo7))</p><p>&emsp;&emsp;- Rejected ([6.4.1.14](#_xxwqkx8xqoo7))</p><p>&emsp;&emsp;- Accepted: Seller accepted the offer (not in scope)</p><p>&emsp;&emsp;- Unsuccessful: Seller rejected the offer (not in scope)</p><p>&emsp;&emsp;- Inactive: (future scope)</p><p>&emsp;&emsp;- Blocked: (future scope)</p><p>&emsp;- Samples ([6.4.1.17](#_tfth3fo1s797))</p><p>&emsp;&emsp;- All (default)</p><p>&emsp;&emsp;- Unverified </p><p>&emsp;&emsp;- Verified</p><p>&emsp;&emsp;- Awaiting Payment</p><p>&emsp;&emsp;- Pending</p><p>&emsp;&emsp;- Sent</p><p>&emsp;&emsp;- Received</p><p>&emsp;&emsp;- Cancelled</p><p>&emsp;&emsp;- Inactive: (future scope)</p><p>&emsp;&emsp;- Blocked: (future scope)</p><p>&emsp;- MFI Tests ([6.4.1.18](#_ekn7f6mf2prs))</p><p>&emsp;&emsp;- All (default)</p><p>&emsp;&emsp;- Unverified </p><p>&emsp;&emsp;- Verified</p><p>&emsp;&emsp;- Awaiting Payment</p><p>&emsp;&emsp;- Pending</p><p>&emsp;&emsp;- Tested</p><p>&emsp;&emsp;- Inactive: (future scope)</p><p>&emsp;&emsp;- Blocked: (future scope)</p><p>- Selecting a tab:</p><p>&emsp;- Applies the corresponding filter to the table query.</p><p>&emsp;&emsp;- Works alongside additional filters e.g. Admin can select to view Unverified Users and then filter ([6.4.1.4](#_amauwxp3ubs5)) by user role.</p><p>&emsp;- Resets table pagination to page 1.</p><p>**Postconditions:**</p><p>- Admin can navigate entirely via the sidebar and refine each view using tabs as filters.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Load failure|“We couldn’t load this page. Please refresh and try again.”|

|**Design Name**|**Link**|
| :- | :- |
||<p><https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22254-111140&t=KlqmFd9tSzPRLOoC-4>  </p><p>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.002.png)</p>|
|<p>User</p><p>Listings</p><p>Wanted</p><p>Offers</p><p>Haulage Bids</p><p>Samples</p><p>MFI</p>|![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.003.png)|

|**Client Approved**|Yes|
| :- | :- |
####
#### <a name="_6swngvglc2gg"></a><a name="_3q8bhwn2jgnl"></a>**6.4.1.2. View Users Table**
- This is an update to existing functionality within the Admin dashboard; updates are highlighted in yellow.
- The users tab will be updated to include widgets showing user totals per tab.
- The users table will be updated to display all of the following information:
  - Account Type
    - Should also now include hauliers
  - User ID
  - User Name
  - Company
  - Country
  - Date of Registration
  - Overall Status
  - Registration Status
  - Onboarding Status 
    - Overall Status (Awaiting approval, In progress)
    - Registration Status (Complete, In progress)
    - Onboarding Status (Company information complete/in progress, Company documents added/in progress, Site location added/in progress)
  - Notes 
- User status (Overall, Registration, Onboarding) will be colour-coded to indicate status at a glance.
  - Complete/success statuses will be shown as green text.
  - Pending/Incomplete statuses will be shown as orange text.
  - Rejected statuses will be shown as red text.
- Admin will be able to select “View Detail” to open the Members Account page with all of the user details.
  - Selecting elsewhere on the row will not open the details page.

|<p>**Scope & Preconditions:**</p><p>- This is an update to existing functionality within the Admin dashboard (Phase 1 - 6.6.2.3 New members table); updates are highlighted in yellow.</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- Admin selects Dashboard > Users.</p><p></p><p>**Acceptance Criteria:**</p><p>- The admin user will be able to apply high-level filters to the user table via tabs at the top of the page ([6.4.1.1](#_9tlqtjnx8l54))</p><p>&emsp;- The selected tab will include a widgets showing user totals.</p><p>&emsp;&emsp;- All: Show the total number of users within the system.</p><p>&emsp;&emsp;- Unverified: Show the total number of unverified users (awaiting review/need more info)</p><p>&emsp;&emsp;- Verified: Show the total number of verified users</p><p>&emsp;&emsp;- Rejected: Show the total number of rejected users</p><p>&emsp;&emsp;- Inactive: Show the total number of inactive users</p><p>&emsp;&emsp;&emsp;- (Future scope)</p><p>&emsp;&emsp;- Blocked: show the total number of blocked users</p><p>&emsp;&emsp;&emsp;- (Future scope)</p><p>- Table Structure:</p><p>&emsp;- The table must display the following columns:</p><p>&emsp;&emsp;- Assign admin ([6.4.1.22](#_ssd15u92k6sn))</p><p>&emsp;&emsp;- User</p><p>&emsp;&emsp;&emsp;- Account Type </p><p>&emsp;&emsp;&emsp;&emsp;- Buyer</p><p>&emsp;&emsp;&emsp;&emsp;- Seller</p><p>&emsp;&emsp;&emsp;&emsp;- Dual (both)</p><p>&emsp;&emsp;&emsp;&emsp;- Trading Company Admin</p><p>&emsp;&emsp;&emsp;&emsp;- Haulier</p><p>&emsp;&emsp;&emsp;&emsp;- Haulage Company Admin</p><p>&emsp;&emsp;&emsp;- User ID </p><p>&emsp;&emsp;&emsp;- User name</p><p>&emsp;&emsp;&emsp;- Company Name</p><p>&emsp;&emsp;&emsp;- Country</p><p>&emsp;&emsp;- Date of Registration</p><p>&emsp;&emsp;- Overall Status </p><p>&emsp;&emsp;&emsp;- Complete</p><p>&emsp;&emsp;&emsp;- Awaiting approval</p><p>&emsp;&emsp;&emsp;&emsp;- When registration/onboarding status is Complete but waiting for Admin member approval. </p><p>&emsp;&emsp;&emsp;- In progress</p><p>&emsp;&emsp;&emsp;&emsp;- When any registration/onboarding status is In Progress.</p><p>&emsp;&emsp;- Registration Status</p><p>&emsp;&emsp;&emsp;- Complete</p><p>&emsp;&emsp;&emsp;- In progress</p><p>&emsp;&emsp;- Onboarding Status </p><p>&emsp;&emsp;&emsp;- Company information complete/in progress</p><p>&emsp;&emsp;&emsp;- Company documents added/in progress</p><p>&emsp;&emsp;&emsp;- Site location added/in progress</p><p>&emsp;&emsp;&emsp;&emsp;- User status (Overall, Registration, Onboarding) will be colour-coded to indicate status at a glance.</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Complete/success statuses will be shown as green text.</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Pending/Incomplete statuses will be shown as orange text.</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Rejected statuses will be shown as red text.</p><p>&emsp;&emsp;- Notes ([6.4.1.21](#_uqxxrgjvk3e8))</p><p>- Data Display:</p><p>&emsp;- Each row in the table must represent a unique user account.</p><p>&emsp;- The table will always be sorted in reverse chronological order (latest first) by default.</p><p>&emsp;- All data fields must be accurately displayed as per the latest database entries.</p><p>- Interactivity:</p><p>&emsp;- The table must support lazy loading, automatically loading more rows as the user scrolls down.</p><p>&emsp;- Clicking “View Details” on any row will open the detailed “account file” for that user.</p><p>&emsp;&emsp;&emsp;- Selecting elsewhere on the row will not open the details page.</p><p>- Member File</p><p>&emsp;- Selecting “View Details” for a trading platform user opens a multi-tab profile for admin to view personal information, company details, company documents etc.</p><p>&emsp;- Selecting “View Details” for a haulage platform user will open a single page profile.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Issue loading new members data|“Unable to load user data. Please try again.”|
|Clicking on a row fails to open account file|“Unable to open the account file. Please try again later.”|
|Network issues during interaction|"Network error detected. Please check your connection and try again."|

|**Design Name**|**Link**|
| :- | :- |
|Users table|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51179&t=GAfuMoCozzx39Zqo-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.004.png)|

|**Client Approved**|Yes|
| :- | :- |
####
#### <a name="_lxtd2j9hb002"></a><a name="_69n6t4xmcg3s"></a>**                                                               
#### <a name="_due5dpz5czmw"></a>**6.4.1.3. Search Users Table**
- The user will be able to search the users table
- The user will be able to search the table by User ID, Name, Company Name, and Account type
- Submit behaviour must also occur after the user selects “enter”.

|<p>**Preconditions:**</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- The user selects the search bar above the user table.</p><p></p><p>**Acceptance Criteria:**</p><p>- Search Functionality Integration:</p><p>&emsp;- The user table must include a search feature that allows admins to quickly locate specific entries based on key attributes.</p><p>&emsp;- Ensure that the search function is prominently displayed and easily accessible at the top of the activity table.</p><p>- Searchable Fields:</p><p>&emsp;- Admins must be able to search by:</p><p>&emsp;&emsp;- User ID</p><p>&emsp;&emsp;- User Email</p><p>&emsp;&emsp;- User Name</p><p>&emsp;&emsp;- Company Name</p><p>&emsp;&emsp;- Account type</p><p>&emsp;&emsp;- Country</p><p>- Dynamic Search Results:</p><p>&emsp;- Search results should update dynamically as the admin types or selects filters, providing immediate feedback on the filtered results.</p><p>&emsp;- Ensure that searches are case-insensitive and allow partial matches to maximise usability.</p><p>- Security and Data Protection:</p><p>&emsp;- Ensure that all search queries are processed in a way that prevents injection attacks and that user data is protected.</p><p>&emsp;- Implement adequate security measures to protect sensitive data from unauthorised access during search operations.</p><p></p><p>**Postconditions:**</p><p>- Search results should update dynamically as the admin types.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|No results found|"No results found for your search criteria."|
|Search query too long|"Search query exceeds maximum character limit."|
|Invalid input|"Invalid input. Please check your entries and try again."|
|Server error during search|"Unable to complete the search due to a server error. Please try again later."|
|Unauthorised search attempt|"You do not have permission to perform this search."|

|**Design Name**|**Link**|
| :- | :- |
|Search bar|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51179&t=GAfuMoCozzx39Zqo-4> <br>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.005.png)|

|**Client Approved**|Yes|
| :- | :- |
####
<a name="_jpqkg5qkv7lo"></a> 
#### <a name="_amauwxp3ubs5"></a>**6.4.1.4. Filter Users Table**
- The user will be able to filter the users table
- The user will be able to filter on the following parameters
  - Date of registration 
    - Date range picker
  - Account type dropdown
    - Buyer
    - Seller
    - Dual (Buyer/Seller)
    - Haulier
  - Status dropdowns
    - Overall
    - Registration
    - Onboarding
- Submit behaviour must also occur after the user selects “enter”.

|<p>**Scope & Preconditions:**</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- The user selects to filter the users table.</p><p></p><p>**Acceptance Criteria:**</p><p>- Filter Implementation:</p><p>&emsp;- Implement a dynamic filter system on the user table that allows users to refine results based on specific criteria without page reloading.</p><p>&emsp;- Ensure the filter interface is intuitive and accessible from the main interface of the wanted listings view.</p><p>- Filter Parameters:</p><p>&emsp;- Provide filtering capabilities based on the following criteria:</p><p>&emsp;&emsp;- Date of registration</p><p>&emsp;&emsp;&emsp;- Start - end date</p><p>&emsp;&emsp;- Account type</p><p>&emsp;&emsp;&emsp;- Buyer</p><p>&emsp;&emsp;&emsp;- Seller</p><p>&emsp;&emsp;&emsp;- Dual (Buyer/Seller)</p><p>&emsp;&emsp;&emsp;- Haulier</p><p>&emsp;&emsp;- Overall status</p><p>&emsp;&emsp;- Registration status</p><p>&emsp;&emsp;- Onboarding status </p><p>- Filter Usability:</p><p>&emsp;- Each filter should offer a clear method to apply or reset selections.</p><p>&emsp;- Filters should be easy to use and allow for quick adjustments to view different data sets.</p><p>- Tab Interaction</p><p>&emsp;- Tabs apply a single, mutually exclusive status scope for the current view (e.g., Users ▸ Verified).</p><p>&emsp;&emsp;- Filters refine the result within the selected tab.</p><p>&emsp;&emsp;- Results = Tab scope AND all active filters</p><p>&emsp;&emsp;&emsp;- e.g., Tab = Unverified, Filter for Account Type = Haulier, so only show unverified hauliers.</p><p>&emsp;- Changing tab retains currently applied filters.</p><p></p><p>**Postconditions:**</p><p>- Admin can select filters to see a refined list of users.</p><p></p>|
| :- |

|**Field** |**Data Dictionary**|
| :- | :- |
|Date of Registration|Date picker. Start and end dates. The end date cannot be before the start date. Optional.|
|Account Type|Dropdown. Options: Buyer, Seller, Dual, Haulier. Optional.|
|Account Status|Dropdown. Options: All, Complete, Awaiting Approval, In Progress. Default: All. Optional.|
|Registration Status|Dropdown. Options: All, Complete, In Progress. Default: All. Optional.|
|Onboarding status|Dropdown. Options: All, Company Information Complete, Company Information In Progress, Company Documents Added, Company Documents In Progress, Site Location Added, Site Location In Progress. Default: All. Optional.|

|**Use Case**|**Error Message**|
| :- | :- |
|Filter application fails|“Failed to apply filters. Please check your selections.”|
|No results found for the selected filters|“No results found. Adjust your filters to expand your search.”|
|Invalid input in filter fields|“Invalid input detected. Please correct your entries.”|
|Network or system error during filtering|“A system error occurred while applying filters. Please try again later.”|

|**Design Name**|**Link**|
| :- | :- |
|Filter User Table|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22260-113514&t=GAfuMoCozzx39Zqo-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.006.png)|

|**Client Approved**|Yes|
| :- | :- |
####
#### <a name="_64wjhyngvrjk"></a><a name="_u2u1trwyjxj6"></a>**6.4.1.5. View Listings Table**
- This is an update to existing functionality within the Admin dashboard; updates are highlighted in yellow.
- The listings table will be updated to display all of the following information:
  - Seller ID
    - Selecting this will open the corresponding user details page as a new tab in the default browser.
  - User Name
  - Company
  - Country
  - Material name (Product name schema)
  - Date
  - Best offer
  - Date available from
  - Remaining loads
  - Status
  - State
  - Notes
  - Assign admin 
- Admin will be able to select “View Detail” to open the Listing Details page.
  - Selecting elsewhere on the row will not open the details page.

|<p>**Scope & Preconditions:**</p><p>- This is an update to existing functionality within the Admin dashboard (Phase 1 - 6.6.2.12 View all seller activity); updates are highlighted in yellow.</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- Admin selects Dashboard > Listings.</p><p></p><p>**Acceptance Criteria:**</p><p>- Seller Activity Table:</p><p>&emsp;- A table will be available to view all seller activities.</p><p>&emsp;- The table will display listings as defined in the "View Listings" story.</p><p>- Table Columns:</p><p>&emsp;- The table will include the following columns:</p><p>&emsp;&emsp;- Assign admin ([6.4.1.22](#_ssd15u92k6sn))</p><p>&emsp;&emsp;- Seller</p><p>&emsp;&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;&emsp;- User Name</p><p>&emsp;&emsp;&emsp;- Company</p><p>&emsp;&emsp;&emsp;- Location</p><p>&emsp;&emsp;&emsp;- Country</p><p>&emsp;&emsp;&emsp;&emsp;- The Location value is a clickable link. </p><p>&emsp;&emsp;&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>&emsp;&emsp;- Material name (Product name schema)</p><p>&emsp;&emsp;- Date Listed</p><p>&emsp;&emsp;- Date Available From</p><p>&emsp;&emsp;- No. Offers</p><p>&emsp;&emsp;&emsp;- The number field will be a clickable link.</p><p>&emsp;&emsp;&emsp;- Selecting this will direct the user to the admin dashboard > Offers table ([6.4.1.9](#_91yj68uyh5s7)), with pre-filled search/filter terms to ensure only offers relating to this listing are shown.</p><p>&emsp;&emsp;&emsp;&emsp;- Search via Seller ID and the Listing Material name.</p><p>&emsp;&emsp;- Guide Price</p><p>&emsp;&emsp;&emsp;- Defined when the seller creates a listing, Price field ([6.1.2.3](#_shmhf2rsjm49))</p><p>&emsp;&emsp;&emsp;- Per metric tonne.</p><p>&emsp;&emsp;- Best Offer</p><p>&emsp;&emsp;&emsp;- Displays the highest offer price on the current listing.</p><p>&emsp;&emsp;&emsp;- Per metric tonne.</p><p>&emsp;&emsp;- Weight</p><p>&emsp;&emsp;- Remaining Loads</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;- Admin State</p><p>&emsp;&emsp;- Notes ([6.4.1.21](#_uqxxrgjvk3e8))</p><p>- Data Display:</p><p>&emsp;- Each row in the table must represent a unique listing.</p><p>&emsp;- The table will always be sorted in reverse chronological order (latest date listed first) by default.</p><p>&emsp;- All data fields must be accurately displayed as per the latest database entries.</p><p>- Interactivity:</p><p>&emsp;- The table must support lazy loading, automatically loading more rows as the user scrolls down.</p><p>&emsp;- Clicking “View Details” on any row will open the detailed listing page ([6.4.1.6](#_b232xtd67b9i))</p><p>&emsp;&emsp;&emsp;- Selecting elsewhere on the row will not open the details page.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Pagination Error|"Unable to load the next page. Please try again."|
|Detail View Navigation Error|"Unable to open the details for the selected listing. Please try again."|
|Data Load Error|"Unable to load seller activity data. Please try again."|
|Network issues during interaction|"Network error detected. Please check your connection and try again."|

|**Design Name**|**Link**|
| :- | :- |
|View sale listings|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51241&t=GAfuMoCozzx39Zqo-4>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.007.png)|

|**Client Approved**|Yes|
| :- | :- |


#### <a name="_b232xtd67b9i"></a>**6.4.1.6. View Listings Details**
- This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.
- The user will be able to see detailed information about each sales listing.
- Seller Information:
  - User ID
    - Selecting this will open the corresponding user details page as a new tab in the default browser.
  - Full Name: Display the first and last name of the Seller.
  - Company: Display the company name of the Seller.
- Material Information:
  - Images: Display images included within the listing.
  - Material Name: Material name (Product name schema)
  - Listing Date: Date the listing was made.
  - Description: Description associated with the listing.
  - Packaging: Display the packaging details of the material.
  - Number of loads remaining: Display the total number of loads available.
  - Weight per Load: Display the weight of each load.
  - Location/Warehouse: Display the location or warehouse where the material is stored.
    - The Location/Warehouse value is a clickable link. 
    - Selecting it opens a read-only modal titled “Location details – <Location name>”.
    - The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.
  - Currency: Display the currency in which the sale is being made.
  - Status
  - State

|<p>**Scope & Preconditions:**</p><p>- This is an update to existing functionality within the Admin dashboard (Phase 1 - 6.6.2.13 View details for a sales listing); updates are highlighted in yellow.</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- Admin selects View Details within the Listings table. </p><p></p><p>**Acceptance Criteria:**</p><p>- Sales Listing Detail Page:</p><p>&emsp;- The user will be able to see detailed information about each sales listing.</p><p>- Seller Information:</p><p>&emsp;- Seller ID</p><p>&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;- Full Name: Display the full name of the seller.</p><p>&emsp;- Company: Display the company name of the seller.</p><p>&emsp;- Location/Warehouse: Display the location or warehouse where the material is stored, including the country.</p><p>&emsp;&emsp;- The Location/Warehouse value is a clickable link. </p><p>&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>- Material Information:</p><p>&emsp;- Images: Display images included within the listing.</p><p>&emsp;- Material Name: Display the name of the material listed.</p><p>&emsp;- Packaging: Display the packaging details of the material.</p><p>&emsp;- Listing Date: Date the listing was made.</p><p>&emsp;- Date available from: Date the material is available from.</p><p>&emsp;- Description: Description associated with the listing.</p><p>&emsp;- Currency: Display the currency in which the sale is being made.</p><p>&emsp;- No. Offers</p><p>&emsp;&emsp;- The number field will be a clickable link.</p><p>&emsp;&emsp;- Selecting this will direct the user to the admin dashboard > Offers table ([6.4.1.9](#_91yj68uyh5s7)), with pre-filled search/filter terms to ensure only offers relating to this listing are shown.</p><p>&emsp;- Guide Price</p><p>&emsp;&emsp;- Defined when the seller creates a listing, Price field ([6.1.2.3](#_shmhf2rsjm49))</p><p>&emsp;&emsp;- Per metric tonne.</p><p>&emsp;- Best Offer</p><p>&emsp;&emsp;- Per metric tonne.</p><p>&emsp;- Number of Loads remaining: Display the number of loads available.</p><p>&emsp;- Weight per Load: Display the weight of each load.</p><p>&emsp;- Status</p><p>&emsp;- Admin State</p><p>- ~~Bid Status:~~</p><p>&emsp;- ~~Accepted: Indicate if the bid has been accepted.~~</p><p>&emsp;- ~~Rejected: Indicate if the bid has been rejected.~~</p><p>&emsp;- ~~Pending: Indicate if the bid is pending.~~</p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Data Load Error|"Unable to load sales listing details. Please try again."|
|Seller Information Error|"Unable to retrieve seller information. Please try again."|
|Material Information Error|"Unable to retrieve material information. Please try again."|
|Bid Status Error|"Unable to retrieve bid status. Please try again."|
|Admin Communications Error|"Unable to load admin communications. Please try again."|
|Network issues during interaction|"Network error detected. Please check your connection and try again."|

|**Design Name**|**Link**|
| :- | :- |
|View sales listing details|<p><https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51451&t=GAfuMoCozzx39Zqo-4></p><p>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.008.png)</p>|

|**Client Approved**|Yes|
| :- | :- |
####




#### <a name="_r3b78i76y538"></a><a name="_ihhvs12l52de"></a>**6.4.1.7. View Wanted Listings Table**
- This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.
- The listings table will be updated to display all of the following information:
  - Buyer ID
    - Selecting this will open the corresponding user details page as a new tab in the default browser.
  - User Name
  - Company
  - Country
  - Date required from
  - Date listed
  - Quantity required
  - Material name (Product name schema)
  - Packaging
  - Storage
  - Status
  - State
  - Notes 
  - Assign admin
- Admin will be able to select “View Detail” to open the Wanted Listing Details page.
  - Selecting elsewhere on the row will not open the details page.

|<p>**Scope & Preconditions:**</p><p>- This is an update to existing functionality within the Admin dashboard (Phase 1 - 6.6.2.16 View all wanted activity); updates are highlighted in yellow.</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- Admin selects Dashboard > Wanted.</p><p></p><p>**Acceptance Criteria:**</p><p>- Table Display:</p><p>&emsp;- The table will list all wanted listings.</p><p>&emsp;- The table will display the following columns:</p><p>&emsp;&emsp;- Assign admin ([6.4.1.22](#_ssd15u92k6sn))</p><p>&emsp;&emsp;- Buyer</p><p>&emsp;&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;&emsp;- User Name</p><p>&emsp;&emsp;&emsp;- Company</p><p>&emsp;&emsp;&emsp;- Location</p><p>&emsp;&emsp;&emsp;- Country</p><p>&emsp;&emsp;&emsp;&emsp;- The Location value is a clickable link. </p><p>&emsp;&emsp;&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>&emsp;&emsp;- Date of Listing</p><p>&emsp;&emsp;- Date Required From</p><p>&emsp;&emsp;- Required In: Country required in field when creating a wanted listing.</p><p>&emsp;&emsp;- Material Required</p><p>&emsp;&emsp;- Quantity Required</p><p>&emsp;&emsp;- Guide Price</p><p>&emsp;&emsp;- Packaging</p><p>&emsp;&emsp;- Storage</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;- Admin State</p><p>&emsp;&emsp;- Notes ([6.4.1.21](#_uqxxrgjvk3e8))</p><p>&emsp;- The table will show the latest 20 listings by default.</p><p>- Data Display:</p><p>&emsp;- Each row in the table must represent a unique listing.</p><p>&emsp;- The table will always be sorted in reverse chronological order (latest date listed first) by default.</p><p>&emsp;- All data fields must be accurately displayed as per the latest database entries.</p><p>- Interactivity:</p><p>&emsp;- The table must support lazy loading, automatically loading more rows as the user scrolls down.</p><p>&emsp;- Clicking “View Details” on any row will open the detailed wanted listing page ([6.4.1.6](#_b232xtd67b9i))</p><p>&emsp;&emsp;&emsp;- Selecting elsewhere on the row will not open the details page.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Pagination Error|"Unable to load the next page. Please try again."|
|Detail View Navigation Error|"Unable to open the details for the selected listing. Please try again."|
|Network issues during interaction|"Network error detected. Please check your connection and try again."|

|**Design Name**|**Link**|
| :- | :- |
|Wanted Listings Table|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51275&t=GAfuMoCozzx39Zqo-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.009.png)|

|**Client Approved**|Yes|
| :- | :- |
####
#### <a name="_5gv1nmw4bvuq"></a><a name="_8cccefdl7kj1"></a>**6.4.1.8. View Wanted Listings Details**
- This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.
- The user will be able to see updated detailed information about each wanted listing.
- Seller Information:
  - User ID
    - Selecting this will open the corresponding user details page as a new tab in the default browser.
  - Full Name: Display the first and last name of the Seller.
  - Company: Display the company name of the Seller.
- Material Information:
  - Material Name: Product name schema
  - Listing Date: Date the listing was made.
  - Quantity Required: Display the amount of material wanted.
  - Packaging: Display the packaging details of the material wanted.
  - Storage: Display the storage details of the material wanted.
  - Weight per Load: Display the weight of each load.
  - Location/Warehouse: Display the location or warehouse where the material is wanted.
    - The Location/Warehouse value is a clickable link. 
    - Selecting it opens a read-only modal titled “Location details – <Location name>”.
    - The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.
  - Currency: Display the currency in which the sale is being made.
  - Status
  - State

|<p>**Scope & Preconditions:**</p><p>- This is an update to existing functionality within the Admin dashboard (Phase 1 - 6.6.2.18 View wanted activity details); updates are highlighted in yellow.</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- Admin selects View Details within the Wanted table. </p><p></p><p>**Acceptance Criteria:**</p><p>- Wanted Listing Detail Page:</p><p>&emsp;- The user will be able to see detailed information about each wanted listing.</p><p>- Buyer Information:</p><p>&emsp;- Buyer ID</p><p>&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;- Full Name: Display the first and last name of the Seller.</p><p>&emsp;- Company: Display the company name of the Seller.</p><p>&emsp;- Location/Warehouse: Display the location or warehouse where the material is wanted.</p><p>&emsp;&emsp;- The Location/Warehouse value is a clickable link. </p><p>&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>- Material Information:</p><p>&emsp;- Images: Display images included within the listing.</p><p>&emsp;- Material Name: Product name schema.</p><p>&emsp;- Packaging: Display the packaging details of the material wanted.</p><p>&emsp;- Storage: Display the storage details of the material wanted.</p><p>&emsp;- Listing Date: Date the listing was made.</p><p>&emsp;- Required In: Country required in field when creating a wanted listing.</p><p>&emsp;- Date required from: Date the material is required from</p><p>&emsp;- Quantity Required: Display the amount of material wanted.</p><p>&emsp;- Weight per Load: Display the weight of each load.</p><p>&emsp;- Currency: Display the currency in which the sale is being made.</p><p>&emsp;- Guide price</p><p>&emsp;- Status</p><p>&emsp;- Admin State</p><p>- Details View:</p><p>&emsp;- Clicking on any row will lead the user to the detailed view page of the selected wanted listing.</p><p>- Approval & Reject button: </p><p>&emsp;- Admin to approve/reject the wanted listing</p><p>&emsp;&emsp;- Approve -> show the wanted on the wanted listing.</p><p>&emsp;&emsp;- Reject -> remove from the list.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Detail View Navigation Error|"Unable to open the details for the selected listing. Please try again."|
|Network issues during interaction|"Network error detected. Please check your connection and try again."|

|**Design Name**|**Link**|
| :- | :- |
||<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51688&t=alcajT9uqdXzzWTf-4> <br>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.010.png)|

|**Client Approved**|Yes|
| :- | :- |
####

#### <a name="_nr9vngqluk4q"></a><a name="_91yj68uyh5s7"></a>**6.4.1.9. View Offers Table**
- This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.
- The offers table will be updated to display all of the following information:
  - Buyer info
    - ID
      - Selecting this will open the corresponding user details page as a new tab in the default browser.
    - Name
    - Company
    - Country
  - Seller info
    - ID
      - Selecting this will open the corresponding user details page as a new tab in the default browser.
    - Name
    - Company
    - Country
  - Amount
  - Bid Date 
  - Valid until
  - Material name (Product name schema)
    - Selecting this will open the corresponding sales listing page as a new tab in the default browser.
  - Packaging
  - Number of loads bid on
  - Weight per load
  - Number of offers
  - Bid Status
  - State

|<p>**Scope & Preconditions:**</p><p>- This is an update to existing functionality within the Admin dashboard (Phase 1 - 6.6.2.9 View details for a bid (buyer activity)); updates are highlighted in yellow.</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- Admin selects Dashboard > Offers.</p><p></p><p>**Acceptance Criteria:**</p><p>- Page Layout:</p><p>&emsp;- The page will display comprehensive details for each bid related to buyer activity.</p><p>&emsp;- Information will be displayed in a clear, structured format with the following sections:</p><p>&emsp;&emsp;- Buyer Information</p><p>&emsp;&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;&emsp;- Name</p><p>&emsp;&emsp;&emsp;- Company</p><p>&emsp;&emsp;&emsp;- Location</p><p>&emsp;&emsp;&emsp;- Country</p><p>&emsp;&emsp;&emsp;&emsp;- The Location value is a clickable link. </p><p>&emsp;&emsp;&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>&emsp;&emsp;- Seller Information</p><p>&emsp;&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;&emsp;- Name</p><p>&emsp;&emsp;&emsp;- Company</p><p>&emsp;&emsp;&emsp;- Location</p><p>&emsp;&emsp;&emsp;- Country</p><p>&emsp;&emsp;&emsp;&emsp;- The Location value is a clickable link. </p><p>&emsp;&emsp;&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>&emsp;&emsp;- Bid Details</p><p>&emsp;&emsp;&emsp;- Material name (Product name schema)</p><p>&emsp;&emsp;&emsp;&emsp;- Selecting this will open the corresponding sales listing page as a new tab in the default browser.</p><p>&emsp;&emsp;&emsp;- Amount</p><p>&emsp;&emsp;&emsp;- Bid Date </p><p>&emsp;&emsp;&emsp;- Valid until</p><p>&emsp;&emsp;&emsp;- Packaging</p><p>&emsp;&emsp;&emsp;- Number of loads bid on</p><p>&emsp;&emsp;&emsp;- Weight per load</p><p>&emsp;&emsp;&emsp;- No. Haulage Offers</p><p>&emsp;&emsp;&emsp;&emsp;- The number field will be a clickable link.</p><p>&emsp;&emsp;&emsp;&emsp;- Selecting this will direct the user to the admin dashboard > Haulage Offers table ([6.4.1.12](#_isf6t9nej4i)), with pre-filled search/filter terms to ensure only haulage offers relating to this listing are shown.</p><p>&emsp;&emsp;&emsp;&emsp;- Search via Seller ID, Buyer ID and the Listing Material name.</p><p>&emsp;&emsp;&emsp;- Status</p><p>&emsp;&emsp;&emsp;- Admin State</p><p>- Data Display:</p><p>&emsp;- Each row in the table must represent a unique listing.</p><p>&emsp;- The table will always be sorted in reverse chronological order (latest date listed first) by default.</p><p>&emsp;- All data fields must be accurately displayed as per the latest database entries.</p><p>- Interactivity:</p><p>&emsp;- The table must support lazy loading, automatically loading more rows as the user scrolls down.</p><p>&emsp;- Clicking “View Details” on any row will open the detailed offer page ([6.4.1.6](#_b232xtd67b9i))</p><p>&emsp;&emsp;- Selecting elsewhere on the row will not open the details page.</p><p>&emsp;- Clicking “View Loads” on any row with an **accepted** haulage offer will open the haulage offer details [6.4.1.14](#_xxwqkx8xqoo7)</p><p>&emsp;&emsp;- The button will be hidden for offers without an accepted haulage offer.</p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Pagination Error|"Unable to load the next page. Please try again."|
|Detail View Navigation Error|"Unable to open the details for the selected offer. Please try again."|
|Data Load Error|"Unable to load offer data. Please try again."|
|Network issues during interaction|"Network error detected. Please check your connection and try again."|

|**Design Name**|**Link**|
| :- | :- |
|Offers Table|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51309&t=GAfuMoCozzx39Zqo-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.011.png)|

|**Client Approved**|Yes|
| :- | :- |
####


#### <a name="_uujlpfb12i5a"></a><a name="_q0cd1yu9fro7"></a>**6.4.1.10. View Offers Details**
- This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.
- The user will be able to see updated detailed information about each offer in revised sections:
  - Summary Information:
    - Bid amount
    - Bid currency
    - Status
    - State
    - Accept/Reject buttons
  - Buyer information:
    - ID
      - Selecting this will open the corresponding user details page as a new tab in the default browser.
    - Name
    - Company
    - Country
    - Destination warehouse
      - The Location/Warehouse value is a clickable link. 
      - Selecting it opens a read-only modal titled “Location details – <Location name>”.
      - The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.
    - Bid amount
    - Valid until
    - Number of loads bid on
    - Incoterms
    - Earliest + Latest Delivery
  - Seller Information:
    - ID
      - Selecting this will open the corresponding user details page as a new tab in the default browser.
    - Name
    - Company
    - Country
    - Pick up location
      - The Location/Warehouse value is a clickable link. 
      - Selecting it opens a read-only modal titled “Location details – <Location name>”.
      - The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.
    - Material name (Product name schema)
    - Packaging
    - PERN
    - Quantity available
    - Loads remaining
    - Avg weight per load
    - ~~Total price shared~~ Guide Price
    - ~~Price per tonne~~

|<p>**Scope & Preconditions:**</p><p>- This is an update to existing functionality within the Admin dashboard; updates are highlighted in yellow.</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- Admin selects View Details within the Offers table. </p><p></p><p>**Acceptance Criteria:**</p><p>- Summary banner</p><p>&emsp;&emsp;- Haulage total</p><p>&emsp;&emsp;&emsp;- Approved status will be shown as a green box.</p><p>&emsp;&emsp;&emsp;- Pending status will be shown as an orange box.</p><p>&emsp;&emsp;&emsp;- Rejected status will be shown as a red box.</p><p>&emsp;- Summary information </p><p>&emsp;&emsp;- Bid amount</p><p>&emsp;&emsp;- Bid currency</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;- State</p><p>&emsp;&emsp;- Accept/Reject buttons</p><p>&emsp;- Buyer information:</p><p>&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Company</p><p>&emsp;&emsp;- Country</p><p>&emsp;&emsp;- Destination warehouse</p><p>&emsp;&emsp;&emsp;- The Location/Warehouse value is a clickable link. </p><p>&emsp;&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>&emsp;&emsp;- Bid amount</p><p>&emsp;&emsp;- Valid until</p><p>&emsp;&emsp;- Number of loads bid on</p><p>&emsp;&emsp;- Incoterms</p><p>&emsp;&emsp;- Container Types</p><p>&emsp;&emsp;- Earliest + Latest Delivery</p><p>&emsp;- Seller Information:</p><p>&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Company</p><p>&emsp;&emsp;- Country</p><p>&emsp;&emsp;- Pick up location</p><p>&emsp;&emsp;&emsp;- The Location/Warehouse value is a clickable link. </p><p>&emsp;&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>&emsp;&emsp;- Material name (Product name schema)</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding sales listing page as a new tab in the default browser.</p><p>&emsp;&emsp;- Packaging</p><p>&emsp;&emsp;- PERN</p><p>&emsp;&emsp;- Container Types</p><p>&emsp;&emsp;- Quantity available</p><p>&emsp;&emsp;- Loads remaining</p><p>&emsp;&emsp;- Avg weight per load</p><p>&emsp;&emsp;- Guide price</p><p>- Admin Actions</p><p>&emsp;- Admin can Approve or Reject the buyer offer.</p><p>&emsp;- There will also be a button to “Make a Haulage Offer” ([6.4.1.16](#_rlnj1mkwakij)).</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Details page load failure|“We couldn’t load the load details page. Please refresh and try again.”|

|**Design Name**|**Link**|
| :- | :- |
|View Approved Offer Details|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22769-61714&t=alcajT9uqdXzzWTf-4> <br>![ref2]|
|View Pending Offer Details|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21855-9762&t=wJzAzRq7xzQToHmk-4> <br>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.013.png)|

|**Client Approved**|Yes|
| :- | :- |
####



#### <a name="_pyqr3m2d01ml"></a><a name="_2h1dd5wmnvn6"></a>**6.4.1.11. Listings/Offers/Wanted Search/Filters**
- This is an update to existing functionality within the Admin dashboard: updates are highlighted in yellow.
- Admin can search for items within the Listings/Wanted Listings/Offers/Haulage offers tables by entering keywords into the search bar.
  - The system must support tokenised search for user details (ID, Email, Name, Company Name, Country) and material (Material type, Item, Form, Grading, Colour, Finishing, Packing)
    - The search must match any word in the composite product name schema 
  - Support multi-word queries and partial token matches (case-insensitive).
  - Submit behaviour must also occur after the user selects the “enter” key.
- Admin can utilise different filter bars depending on the Admin dashboard selected:
  - Users 
    - Filter options defined in ([6.4.1.4](#_amauwxp3ubs5))
  - (Sales) Listings:
    - ~~Seller~~ 
      - ~~Type search~~
    - Material
      - Dropdown
        - EFW
        - Fibre
        - Metals
        - Plastic
        - Rubber
    - Location 
      - Dropdown
        - All Countries
          - Default
        - List the full names of all other countries
    - Status
      - Dropdown
        - Pending
        - Available
        - Rejected
        - Sold
    - State
      - Dropdown
        - Pending
        - Approved
        - Rejected
    - “Sort by” 
      - Dropdown
        - Available material
          - Default
        - Unavailable material
  - Wanted Listings:
    - Date Required From
      - Start date picker
      - End date picker
    - ~~Buyer~~
      - ~~Type search~~
    - Company
      - Dropdown
        - Lists all companies within the system
    - Material
      - Dropdown
        - EFW
        - Fibre
        - Metals
        - Plastic
        - Rubber
    - Location 
      - Dropdown
        - All Countries
          - Default
        - List the full names of all other countries
    - Status
      - Dropdown
        - Pending
        - Available
        - Rejected
        - Sold
    - State
      - Dropdown
        - Pending
        - Approved
        - Rejected
    - “Sort by” 
      - Dropdown
        - Available material
          - Default
        - Unavailable material
  - Offers:
    - ~~Buyer~~ 
      - ~~Type search~~
    - ~~Seller~~ 
      - ~~Type search~~
    - Material
      - Dropdown
        - EFW
        - Fibre
        - Metals
        - Plastic
        - Rubber
    - Location 
      - Dropdown
        - All Countries
          - Default
        - List the full names of all other countries
    - Packing
      - Dropdown
        - All
          - Default
        - Bags
        - Bales
        - Boxes
        - Bulk Bags
        - Loose
        - Octabins/Gaylords
        - Pallets
    - “Sort by” 
      - Dropdown
        - Available material
          - Default
        - Unavailable material
  - Haulage Offers
    - Defined in [6.4.1.13](#_o854mhihp6of).

|<p>**Scope & Preconditions:**</p><p>- This is an update to existing functionality within the Admin dashboard; updates are highlighted in yellow.</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- The user selects to filter/search when viewing one of the dashboard tabs.</p><p></p><p>**Acceptance Criteria:**</p><p>- Admin can search for items within the Listings/Wanted Listings/Offers/Haulage offers tables by entering keywords into the search bar.</p><p>&emsp;- The system must support tokenised search for user details (ID, User Email, Name, Company Name) and material (Material type, Item, Form, Grading, Colour, Finishing, Packing)</p><p>&emsp;&emsp;- The search must match any word in the composite product name schema </p><p>&emsp;- Support multi-word queries and partial token matches (case-insensitive).</p><p>&emsp;- Submit behaviour must also occur after the user selects the “enter” key.</p><p>- Admin can utilise different filter bars depending on the Admin dashboard selected:</p><p>&emsp;- Users </p><p>&emsp;&emsp;- Filter options defined in ([6.4.1.4](#_amauwxp3ubs5))</p><p>&emsp;- (Sales) Listings:</p><p>&emsp;&emsp;- ~~Seller~~ </p><p>&emsp;&emsp;&emsp;- ~~Type search~~</p><p>&emsp;&emsp;- Material</p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- EFW</p><p>&emsp;&emsp;&emsp;&emsp;- Fibre</p><p>&emsp;&emsp;&emsp;&emsp;- Metals</p><p>&emsp;&emsp;&emsp;&emsp;- Plastic</p><p>&emsp;&emsp;&emsp;&emsp;- Rubber</p><p>&emsp;&emsp;- Location </p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- All Countries</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Default</p><p>&emsp;&emsp;&emsp;&emsp;- List the full names of all other countries</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- Pending</p><p>&emsp;&emsp;&emsp;&emsp;- Available</p><p>&emsp;&emsp;&emsp;&emsp;- Rejected</p><p>&emsp;&emsp;&emsp;&emsp;- Sold</p><p>&emsp;&emsp;- State</p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- Pending</p><p>&emsp;&emsp;&emsp;&emsp;- Approved</p><p>&emsp;&emsp;&emsp;&emsp;- Rejected</p><p>&emsp;&emsp;- “Sort by” </p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- Available material</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Default</p><p>&emsp;&emsp;&emsp;&emsp;- Unavailable material</p><p>&emsp;- Wanted Listings:</p><p>&emsp;&emsp;- Date Required From</p><p>&emsp;&emsp;&emsp;- Start date picker</p><p>&emsp;&emsp;&emsp;- End date picker</p><p>&emsp;&emsp;&emsp;&emsp;- The end date cannot be before the start date.</p><p>&emsp;&emsp;- ~~Buyer~~</p><p>&emsp;&emsp;&emsp;- ~~Type search~~</p><p>&emsp;&emsp;- Company</p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- Lists all companies within the system</p><p>&emsp;&emsp;- Material</p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- EFW</p><p>&emsp;&emsp;&emsp;&emsp;- Fibre</p><p>&emsp;&emsp;&emsp;&emsp;- Metals</p><p>&emsp;&emsp;&emsp;&emsp;- Plastic</p><p>&emsp;&emsp;&emsp;&emsp;- Rubber</p><p>&emsp;&emsp;- Location </p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- All Countries</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Default</p><p>&emsp;&emsp;&emsp;&emsp;- List the full names of all other countries</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- Pending</p><p>&emsp;&emsp;&emsp;&emsp;- Available</p><p>&emsp;&emsp;&emsp;&emsp;- Rejected</p><p>&emsp;&emsp;&emsp;&emsp;- Sold</p><p>&emsp;&emsp;- State</p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- Pending</p><p>&emsp;&emsp;&emsp;&emsp;- Approved</p><p>&emsp;&emsp;&emsp;&emsp;- Rejected</p><p>&emsp;&emsp;- “Sort by” </p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- Available material</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Default</p><p>&emsp;&emsp;&emsp;&emsp;- Unavailable material</p><p>&emsp;- Offers:</p><p>&emsp;&emsp;- ~~Buyer~~ </p><p>&emsp;&emsp;&emsp;- ~~Type search~~</p><p>&emsp;&emsp;- ~~Seller~~ </p><p>&emsp;&emsp;&emsp;- ~~Type search~~</p><p>&emsp;&emsp;- Material</p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- EFW</p><p>&emsp;&emsp;&emsp;&emsp;- Fibre</p><p>&emsp;&emsp;&emsp;&emsp;- Metals</p><p>&emsp;&emsp;&emsp;&emsp;- Plastic</p><p>&emsp;&emsp;&emsp;&emsp;- Rubber</p><p>&emsp;&emsp;- Location </p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- All Countries</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Default</p><p>&emsp;&emsp;&emsp;&emsp;- List the full names of all other countries</p><p>&emsp;&emsp;- Packing</p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- All</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Default</p><p>&emsp;&emsp;&emsp;&emsp;- Bags</p><p>&emsp;&emsp;&emsp;&emsp;- Bales</p><p>&emsp;&emsp;&emsp;&emsp;- Boxes</p><p>&emsp;&emsp;&emsp;&emsp;- Bulk Bags</p><p>&emsp;&emsp;&emsp;&emsp;- Loose</p><p>&emsp;&emsp;&emsp;&emsp;- Octabins/Gaylords</p><p>&emsp;&emsp;&emsp;&emsp;- Pallets</p><p>&emsp;&emsp;- “Sort by” </p><p>&emsp;&emsp;&emsp;- Dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- Available material</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Default</p><p>&emsp;&emsp;&emsp;&emsp;- Unavailable material</p><p>&emsp;- Haulage Offers</p><p>&emsp;&emsp;- Defined in [6.4.1.13](#_o854mhihp6of).</p><p>- Filter Usability:</p><p>&emsp;- Each filter should offer a clear method to apply or reset selections.</p><p>&emsp;- Filters should be easy to use and allow for quick adjustments to view different data sets.</p><p>- Tab Interaction</p><p>&emsp;- Tabs apply a single, mutually exclusive status scope for the current view (e.g., Users ▸ Verified).</p><p>&emsp;&emsp;- Filters refine the result within the selected tab.</p><p>&emsp;&emsp;- Results = Tab scope AND all active filters</p><p>&emsp;&emsp;&emsp;- e.g., Tab = Unverified, Filter for Account Type = Haulier, so only show unverified hauliers.</p><p>&emsp;- Changing tab retains currently applied filters.</p><p></p><p>**Postconditions:**</p><p>- Admin can select filters or search to see a refined list of users/listings/offers etc.</p><p></p>|
| :- |

|**Client Approved**|Yes|
| :- | :- |
####
#### <a name="_q4ppzg9t80y7"></a><a name="_isf6t9nej4i"></a>**6.4.1.12. View Haulage Bids** 
- The table will list the haulage bids when the haulage bids tab is chosen 
- The table will have the following columns
  - Bid date
  - Buyer
    - ~~ID~~
      - ~~Selecting this will open the corresponding user details page as a new tab in the default browser.~~
    - ~~Name~~
    - ~~Company name~~
    - ~~Location~~
      - ~~The Location/Warehouse value is a clickable link.~~ 
      - ~~Selecting it opens a read-only modal titled “Location details – <Location name>”.~~
      - ~~The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.~~
    - Desired delivery date
  - Seller 
    - ~~ID~~
      - ~~Selecting this will open the corresponding user details page as a new tab in the default browser.~~
    - ~~Name~~
    - ~~Company name~~ 
    - ~~Location~~
      - ~~The Location/Warehouse value is a clickable link.~~ 
      - ~~Selecting it opens a read-only modal titled “Location details – <Location name>”.~~
      - ~~The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.~~
  - Haulier
    - Name
    - Company name
  - Material
    - Link to listing page
  - Number of loads
  - Quantity per load
  - Haulage total (per load x number of loads)
  - Status 
- The table will have pagination to navigate through multiple pages of activity.
- Admin will be able to select “View Detail” to open the Haulage Details page.
  - Selecting elsewhere on the row will not open the details page.

|<p>**Preconditions:**</p><p>- The user is authenticated as an admin.</p><p></p><p>**Triggers:**</p><p>- The Admin selects “Haulage Bids” from the Admin platform navigation menu.</p><p></p><p>**Acceptance Criteria:**</p><p>- Table Presentation:</p><p>&emsp;- Implement a table on the Admin platform to display the latest haulage loads.</p><p>&emsp;- The table must automatically refresh or provide an option to manually refresh to ensure it shows the most current data.</p><p>- Ensure the table includes the following</p><p>&emsp;- Bid Date</p><p>&emsp;- Buyer offer</p><p>&emsp;&emsp;- Listing bid value/MT</p><p>&emsp;&emsp;- Uses the amount/currency selected by the buyer when bidding on a listing (Phase 1 - 6.4.1.2 Bidding on a Listing).</p><p>&emsp;&emsp;&emsp;- Total weight (MT) = avg weight per load × number of loads.</p><p>&emsp;&emsp;&emsp;- Bid total (GBP) = buyer offer/MT × total weight.</p><p>&emsp;&emsp;&emsp;- If non-GBP, convert to USD/EUR via defined conversion rate. </p><p>&emsp;&emsp;&emsp;&emsp;- Use default conversion rate until the Exchange rate API is introduced to the system.</p><p>&emsp;&emsp;&emsp;- Apply 2% markup if non-GBP.</p><p>&emsp;- Haulage offer</p><p>&emsp;&emsp;- Haulage total </p><p>&emsp;&emsp;- Uses the amount/currency selected by the haulier when making an offer ([6.2.2.5](#_s0vnom53wust))</p><p>&emsp;&emsp;&emsp;- If non-GBP, convert to USD/EUR via defined conversion rate. </p><p>&emsp;&emsp;&emsp;&emsp;- Use default conversion rate until the Exchange rate API is introduced to the system.</p><p>&emsp;&emsp;&emsp;- Apply 2% markup if non-GBP.</p><p>&emsp;- Seller offer</p><p>&emsp;&emsp;- £/MT</p><p>&emsp;&emsp;- €/MT</p><p>&emsp;&emsp;&emsp;- Seller offer per MT (GBP/MT) = Final seller total (GBP) ÷ total\_weight.</p><p>&emsp;&emsp;&emsp;&emsp;- Convert to EUR via defined conversion rate. </p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Use default conversion rate until the Exchange rate API is introduced to the system.</p><p>&emsp;- Seller total</p><p>&emsp;&emsp;- £/MT</p><p>&emsp;&emsp;- €/MT</p><p>&emsp;&emsp;&emsp;- The material is eligible for a PERN fee:</p><p>&emsp;&emsp;&emsp;&emsp;- If the material origin = UK but destination ≠ UK</p><p>&emsp;&emsp;&emsp;&emsp;- AND material is defined as Packaging in the database.</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- PERN total defined as = <£5 default fee>/MT</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;- Until PERN can be managed within the system (Future scope - [6.4.4.3](#_76d9oli5t174)).</p><p>&emsp;&emsp;&emsp;- Final seller total (GBP) =</p><p>&emsp;&emsp;&emsp;&emsp;- PRN-eligible: PERN total (PERN/MT x Total MT)+ Bid total − Haulage total</p><p>&emsp;&emsp;&emsp;&emsp;- Not PRN-eligible: Bid total − Haulage total</p><p>&emsp;- Haulier</p><p>&emsp;&emsp;- Haulier User ID</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Company</p><p>&emsp;- Material name</p><p>&emsp;&emsp;- Clickable link to view listing page.</p><p>&emsp;- Bid status</p><p>&emsp;- “View Detail” button ([6.4.1.14](#_xxwqkx8xqoo7)).</p><p>- Dynamic Loading:</p><p>&emsp;- The table should load the latest 20 listings by default.</p><p>&emsp;- Include pagination or a scrolling feature to view more entries if there are more than 20 listings.</p><p>- Compliance with UI/UX Design:</p><p>&emsp;- The table's design should align with the overall Admin platform.</p><p>&emsp;- Maintain visual consistency in typography, colours, and layout with existing parts of the Admin dashboard.</p><p></p><p>**Postconditions:**</p><p>- The admin can view all haulage bids in the system.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Table fails to load|"Failed to load offers. Please refresh the page to try again."|
|No haulage offers found|"No haulage offers found. Check back later."|

|**Design Name**|**Link**|
| :- | :- |
|View Haulage Bids|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21854-79769&t=TzDhDk2ScPubsQGI-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.014.png)|

|**Client Approved**|Yes|
| :- | :- |
####

#### <a name="_pzvyymdu22i2"></a><a name="_o854mhihp6of"></a>**6.4.1.13. Filter Haulage Bids**
- The table will be filterable
- The user will be able to filter on the following parameters
  - Date (bid/desired delivery date)
  - Material
  - State
  - Status
- Submit behaviour must also occur after the user selects “enter”.

|<p>**Scope & Preconditions:**</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- The user selects to filter the haulage table.</p><p></p><p>**Acceptance Criteria:**</p><p>- Filter Implementation:</p><p>&emsp;- Implement a dynamic filter system on the user table that allows users to refine results based on specific criteria without page reloading.</p><p>&emsp;- Ensure the filter interface is intuitive and accessible from the main interface of the wanted listings view.</p><p>- Filter Parameters:</p><p>&emsp;- Provide filtering capabilities based on the following criteria:</p><p>&emsp;&emsp;- Bid Date</p><p>&emsp;&emsp;- Material</p><p>&emsp;&emsp;- State</p><p>&emsp;&emsp;- Status</p><p>- Filter Usability:</p><p>&emsp;- Each filter should offer a clear method to apply or reset selections.</p><p>&emsp;- Filters should be easy to use and allow for quick adjustments to view different data sets.</p><p>- Tab Interaction</p><p>&emsp;- Tabs apply a single, mutually exclusive status scope for the current view (e.g., Users ▸ Verified).</p><p>&emsp;&emsp;- Filters refine the result within the selected tab.</p><p>&emsp;&emsp;- Results = Tab scope AND all active filters</p><p>&emsp;&emsp;&emsp;- e.g., Tab = Rejected, Filter for Material = Plastic, so only show rejected offers for plastic materials.</p><p>&emsp;- Changing tab retains currently applied filters.</p><p></p><p>**Postconditions:**</p><p>- Admin can select filters to see a refined list of haulage offers.</p><p></p>|
| :- |

|**Field** |**Data Dictionary**|
| :- | :- |
|Date of Registration|Date picker. Start and end dates. The end date cannot be before the start date. Optional.|
|Account Type|Dropdown. Options: Buyer, Seller, Dual, Haulier. Optional.|
|Account Status|Dropdown. Options: All, Complete, Awaiting Approval, In Progress. Default: All. Optional.|
|Registration Status|Dropdown. Options: All, Complete, In Progress. Default: All. Optional.|

|**Use Case**|**Error Message**|
| :- | :- |
|Filter application fails|“Failed to apply filters. Please check your selections.”|
|No results found for the selected filters|“No results found. Adjust your filters to expand your search.”|
|Invalid input in filter fields|“Invalid input detected. Please correct your entries.”|
|Network or system error during filtering|“A system error occurred while applying filters. Please try again later.”|

|**Design Name**|**Link**|
| :- | :- |
|Filter Haulage in Admin Dashboard|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51240&t=GAfuMoCozzx39Zqo-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.015.png)|

|**Client Approved**|Yes|
| :- | :- |
####


#### <a name="_dpr3qmye2ady"></a><a name="_xxwqkx8xqoo7"></a>**6.4.1.14. View Haulage Bid Details**
- The user will be able to see updated detailed information about each offer in revised sections:
  - Summary Information
    - Bid amount (per load)
    - Bid currency
    - Number of loads
    - Quantity per load
    - Haulage total (per load x number of loads)
    - Incoterms
    - Status
    - CTA buttons ([6.4.1.15](#_7ly5u4j06b78)).
  - Buyer information:
    - ID
      - Selecting this will open the corresponding user details page as a new tab in the default browser.
    - Name
    - Company
    - Country
    - Destination warehouse
      - The Location/Warehouse value is a clickable link. 
      - Selecting it opens a read-only modal titled “Location details – <Location name>”.
      - The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.
    - Bid amount
    - Number of loads bid on
    - Incoterms
    - Earliest + Latest Delivery
  - Seller Information:
    - ID
      - Selecting this will open the corresponding user details page as a new tab in the default browser.
    - Name
    - Company
    - Country
    - Pick up location
      - The Location/Warehouse value is a clickable link. 
      - Selecting it opens a read-only modal titled “Location details – <Location name>”.
      - The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.
    - Material name (Product name schema)
      - Selecting this will open the corresponding sales listing page as a new tab in the default browser.
    - Packaging
    - PERN
    - Quantity available
    - Loads remaining
    - Avg weight per load
    - Total price shared
    - Price per tonne
  - Haulier card:
    - ID
    - Name
    - Company
- Admin actions
  - Approve, Reject, Request more information, ~~and Enable editing (allows the Haulier to amend before approval).~~
  - Mark as Shipped button appears only after the Seller has marked “Pickup Confirmed”; otherwise, the control is disabled with helper text.
  - ~~View Documents (when available): open a panel of haulage-related documents generated/attached after acceptance (read/download).~~

|<p>**Preconditions:**</p><p>- The user is authenticated as an administrator.</p><p>- The user is viewing the haulage bids area of the Admin dashboard.</p><p></p><p>**Triggers:**</p><p>- The Admin selects to “View Details” for a bid from the haulage bid table ([6.4.1.12](#_isf6t9nej4i)).</p><p></p><p>**Acceptance Criteria:**</p><p>- The page layout will replicate the existing “Offer details” screen, with the summary and haulage information added to it.</p><p>- The user will be able to see updated detailed information about each offer in revised sections:</p><p>&emsp;- Summary banner</p><p>&emsp;&emsp;- Haulage total (including currency, amount per load x number of loads)</p><p>&emsp;&emsp;&emsp;- Approved status will be shown as a green box.</p><p>&emsp;&emsp;&emsp;- Pending status will be shown as an orange box.</p><p>&emsp;&emsp;&emsp;- Rejected status will be shown as a red box.</p><p>&emsp;- Summary Information:</p><p>&emsp;&emsp;- Haulage bid Status</p><p>&emsp;&emsp;- Number of loads</p><p>&emsp;&emsp;- Bid currency</p><p>&emsp;&emsp;- Haulier bid amount (per load)</p><p>&emsp;&emsp;- Quantity per load (MT)</p><p>&emsp;- Seller Information:</p><p>&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Company</p><p>&emsp;&emsp;- Pick up location</p><p>&emsp;&emsp;&emsp;- The Location/Country value is a clickable link. </p><p>&emsp;&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>&emsp;&emsp;- Material name</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding sales listing page as a new tab in the default browser.</p><p>&emsp;&emsp;- Packaging</p><p>&emsp;&emsp;- Incoterms</p><p>&emsp;&emsp;- PERN</p><p>&emsp;&emsp;- Loads remaining</p><p>&emsp;&emsp;- Avg weight per load</p><p>&emsp;&emsp;- Total price shared (including currency)</p><p>&emsp;&emsp;- Price per metric tonne (including currency)</p><p>&emsp;- Haulier Information:</p><p>&emsp;&emsp;- User ID</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Company name</p><p>&emsp;&emsp;- Container type</p><p>&emsp;&emsp;- Number of loads </p><p>&emsp;&emsp;- Quantity per load (MT) </p><p>&emsp;&emsp;- Haulage cost per load (including currency)</p><p>&emsp;&emsp;- Haulage total (including currency)</p><p>&emsp;&emsp;- Transport provider</p><p>&emsp;&emsp;- Suggested collection date</p><p>&emsp;&emsp;- Expected transit time</p><p>&emsp;&emsp;- Demurrage at destination (days)</p><p>&emsp;&emsp;- Notes</p><p>&emsp;- Buyer information:</p><p>&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Company</p><p>&emsp;&emsp;- Destination </p><p>&emsp;&emsp;&emsp;- The Location/Country value is a clickable link. </p><p>&emsp;&emsp;&emsp;- Selecting it opens a read-only modal titled “Location details – <Location name>”.</p><p>&emsp;&emsp;&emsp;- The modal will contain the location information, as displayed in the Admin portal Members Account > Locations > View Location Details.</p><p>&emsp;&emsp;- Delivery window</p><p>&emsp;&emsp;- Incoterms</p><p>&emsp;&emsp;- Bid amount</p><p>&emsp;&emsp;- Number of loads bid on</p><p>&emsp;&emsp;- Price per metric tonne (including currency)</p><p>&emsp;- Load Details (Shown only for accepted offers)</p><p>&emsp;&emsp;- The system will show a load details card per load within a haulage offer i.e. if there are 3 loads, 3 load detail cards will be shown.</p><p>&emsp;&emsp;&emsp;- Load number</p><p>&emsp;&emsp;&emsp;&emsp;- X of X </p><p>&emsp;&emsp;&emsp;&emsp;- e.g. 1 of 3</p><p>&emsp;&emsp;&emsp;- Collection date</p><p>&emsp;&emsp;&emsp;&emsp;- When was the load picked up</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Pulled from SF</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- OR marked by the seller (Not in scope - [6.1.4.1](#_f3vhb721b3up))</p><p>&emsp;&emsp;&emsp;- Shipped date </p><p>&emsp;&emsp;&emsp;&emsp;- When was the load marked as shipped</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Pulled from SF</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- OR marked by admin [6.4.1.17.](#_mesuh14uw64o)</p><p>&emsp;&emsp;&emsp;- Gross weight</p><p>&emsp;&emsp;&emsp;&emsp;- Pulled from SF</p><p>&emsp;&emsp;&emsp;&emsp;- OR marked by the seller (Not in scope - [6.1.4.1](#_f3vhb721b3up))</p><p>&emsp;&emsp;&emsp;- Pallet weight</p><p>&emsp;&emsp;&emsp;&emsp;- Pulled from SF</p><p>&emsp;&emsp;&emsp;&emsp;- OR marked by the seller (Not in scope - [6.1.4.1](#_f3vhb721b3up))</p><p>&emsp;- Action buttons:</p><p>&emsp;&emsp;- To approve/reject/request more information for a haulage bid ([6.4.1.15](#_7ly5u4j06b78)).</p><p>&emsp;&emsp;- To “Mark as Shipped” ([6.4.1.17](#_mesuh14uw64o)).</p><p>&emsp;&emsp;&emsp;- The Mark as Shipped button is only shown when bid status = Approved.</p><p></p><p>**Postconditions:**</p><p>- The Admin will view full details for a haulage bid.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Data Load Error|"Unable to load haulage offer details. Please try again."|
|Information Error|"Unable to retrieve information. Please try again."|
|Network issues during interaction|"Network error detected. Please check your connection and try again."|

|**Design Name**|**Link**|
| :- | :- |
|View Pending Haulage Bid Details|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21855-9762&t=TzDhDk2ScPubsQGI-4> |
|View Approved Haulage Bid Details|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22121-88580&t=2VKx81HrYDas9Qay-4> |
|Location modal|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21921-54991&t=hEc5kX0tITAQtdG6-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.016.png)|

|**Client Approved**|yes|
| :- | :- |
####

#### <a name="_hx3f42fd5wgi"></a><a name="_7ly5u4j06b78"></a>**6.4.1.15. Haulier Bid Approval Actions**
- The following actions will be available through the details page.
  - The user will be able to approve the bid
    - The system will send an automated email to the Haulier informing them that their bid has been approved
      - Copy to be provided by the WasteTrade team
    - The status will be updated
  - The user will be able to reject the haulage bid
    - The system will send an automated email to the user informing them that their bid has been rejected
      - Pre-set list of reasons (to be defined within the AC)
    - The status will be updated
  - The user will be able to indicate if more information is required
    - The user will be able to send a message that will be sent to the applicant’s email address, and there will be an in-app notification
    - The user will be able to “open” the bid to edits, allowing the Haulier to make changes and resubmit

|<p>**Preconditions:**</p><p>- A haulage bid has been placed on an available load, and is shown to Admin ([6.4.1.12](#_isf6t9nej4i)).</p><p></p><p>**Triggers:**</p><p>- Admin selects “Approve”, “Reject” or “Request More Information”.</p><p></p><p>**Acceptance Criteria:**</p><p>- Page Actions:</p><p>&emsp;- Admin will be able to perform the following actions on the haulage bid details page:</p><p>&emsp;&emsp;- Approve</p><p>&emsp;&emsp;- Reject</p><p>&emsp;&emsp;- Request More Information</p><p>&emsp;- If the offer is already Approved or Rejected buttons will be hidden.</p><p>- Approve Bid</p><p>&emsp;- When the Admin approves a bid:</p><p>&emsp;&emsp;- The system will send an email/notification to the haulier informing them that their bid has been approved ([6.2.5.4](#_43ybjh64al27)).</p><p>&emsp;&emsp;- The system will send an email/notification to the seller informing them that their purchase has had a haulage offer approved ([6.1.6.6](#_sfqn4rjuuvb3))</p><p>&emsp;&emsp;- The haulage bid status will be updated to “Approved”</p><p>&emsp;&emsp;&emsp;- In the Admin portal ([6.4.1.12](#_isf6t9nej4i), [6.4.1.14](#_xxwqkx8xqoo7)).</p><p>&emsp;&emsp;&emsp;- In the haulier platform ([6.2.3.1](#_hm5q5mbqpkzc), [6.2.3.2](#_90dvikskb2k0)).</p><p>- Reject Bid</p><p>&emsp;- Admin will be required to select a reason for rejection.</p><p>&emsp;&emsp;- Incomplete documentation</p><p>&emsp;&emsp;- Invalid company registration</p><p>&emsp;&emsp;- Duplicate account</p><p>&emsp;&emsp;- Unverified contact information</p><p>&emsp;&emsp;- Other (Admin to provide a custom reason)</p><p>&emsp;&emsp;&emsp;- Input custom reason</p><p>&emsp;- Upon confirming rejection:</p><p>&emsp;&emsp;- The system will send an email/notification to the haulier informing them that their bid has been rejected ([6.2.5.4](#_43ybjh64al27)).</p><p>&emsp;&emsp;- The haulage bid status will be updated to “Rejected”</p><p>&emsp;&emsp;&emsp;- In the Admin portal ([6.4.1.12](#_isf6t9nej4i), [6.4.1.14](#_xxwqkx8xqoo7)).</p><p>&emsp;&emsp;&emsp;- In the haulier platform ([6.2.3.1](#_hm5q5mbqpkzc), [6.2.3.2](#_90dvikskb2k0)).</p><p>- Request More Information:</p><p>&emsp;- Admin will be required to request more information for a bid</p><p>&emsp;&emsp;- Additional company documentation required</p><p>&emsp;&emsp;- Clarification on provided details</p><p>&emsp;&emsp;- Update on business address</p><p>&emsp;&emsp;- Other (Provide a custom request)</p><p>&emsp;&emsp;&emsp;- Input custom request</p><p>&emsp;- Upon confirming:</p><p>&emsp;&emsp;- The system will send an email/notification to the haulier informing them that their bid requires more information ([6.2.5.4](#_43ybjh64al27)).</p><p>&emsp;&emsp;- The haulage bid status will be updated to “Rejected”</p><p>&emsp;&emsp;&emsp;- In the Admin portal ([6.4.1.12](#_isf6t9nej4i), [6.4.1.14](#_xxwqkx8xqoo7)).</p><p>&emsp;&emsp;&emsp;- In the haulier platform ([6.2.3.1](#_hm5q5mbqpkzc), [6.2.3.2](#_90dvikskb2k0)).</p><p></p><p>**Postconditions:**</p><p>- The bid reflects the selected decision (Approved, Rejected, or More Information Required) and the haulier is notified via email and Notification Centre.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Approve Action Failure|"Failed to approve the bid. Please try again."|
|Reject Action Failure|"Failed to reject the bid. Please try again."|
|Request Info Action Failure|"Failed to request more information. Please try again."|
|Email Sending Failure|"Failed to send email. Please check the email configuration."|

|**Design Name**|**Link**|
| :- | :- |
|Approval Actions|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21862-101995&t=hEc5kX0tITAQtdG6-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.017.png)![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.018.png)|

|**Client Approved**|yes|
| :- | :- |
####
####
#### <a name="_u3yrfi119ub2"></a><a name="_ex6b6v3ugq8a"></a><a name="_rlnj1mkwakij"></a>**6.4.1.16. Make an Offer on Behalf of a Haulier** 
- Reuses logic from [6.2.2.5.](#_s0vnom53wust)
- The user will be able to make a haulage offer on an “Available Load” on behalf of a Haulier.
- The user will be able to see the Load Details
  - There will be a Seller card, providing the following information
    - User ID, pickup location, average weight per load, material type, packaging, container type, loading times, site restrictions
  - There will be a Buyer card, providing the following information
    - User ID, destination location, site restrictions, loading times, desired delivery window, and number of loads bid on
- The user will provide the following details to make a bid on behalf of a Haulier registered within the system
  - Haulier
    - Searchable dropdown
    - Displays all Haulier names and companies within the system.
  - Trailer/container type
  - Are you completing Customs clearance?
    - Note there will be a message: “If not, WasteTrade will handle Customs Clearance for a fixed fee of £200. This will be added to the Haulage Total”
    - The user will input customs clearance per load, not as the total.
  - Currency
  - Number of loads - not editable, view only
  - Quantity per load (MT) - not editable, view only
  - Haulage cost per load
    - Note: Please include the Weighbridge price if required
  - Haulage total 
    - Automatic calculation (cost per load x number of loads)
  - Transport provider
    - Own haulage, third party, mixed
  - Suggested collection date
  - Expected transit time (drop-down selection)
  - Demurrage and destination (days)
    - Guidance text: “Please note this must be a minimum of 21 days.”
    - Input of 20 days or less will prevent validation and display an appropriate error message.
  - Notes
    - Free text box
    - This free text should not allow telephone numbers, email addresses or URLs.
- The user will be able to submit the bid
  - After submitting the bid, it will go to the Admin team for review 

|<p>**Preconditions:**</p><p>- The user is authenticated as an Admin.</p><p></p><p>**Triggers:**</p><p>- The user selects to “Make a Haulage offer” from the offer details page ([6.4.1.10](#_q0cd1yu9fro7)).</p><p></p><p>**Acceptance Criteria:**</p><p>- Admin users will be able to “Make a Haulage Offer” when viewing offer details ([6.4.1.10](#_q0cd1yu9fro7)).</p><p>&emsp;- Only for approved offers i.e. a buyer's offer on a sales listing has been accepted.</p><p>- Selecting to “Make an offer” will open the offer page with sections for:</p><p>&emsp;- Seller Card (Read-only)</p><p>&emsp;&emsp;- Seller User ID</p><p>&emsp;&emsp;- Pickup location (City, Country)</p><p>&emsp;&emsp;- Loading times (site hours if provided)</p><p>&emsp;&emsp;- Container types</p><p>&emsp;&emsp;- Site restrictions (if any)</p><p>&emsp;&emsp;- Material name</p><p>&emsp;&emsp;- Material item, type, packaging</p><p>&emsp;&emsp;- Average weight per load (MT) </p><p>&emsp;&emsp;- Incoterms</p><p>&emsp;- Buyer Card (Read-only)</p><p>&emsp;&emsp;- Buyer User ID</p><p>&emsp;&emsp;- Destination location</p><p>&emsp;&emsp;- Site restrictions (if any)</p><p>&emsp;&emsp;- Loading times (if provided)</p><p>&emsp;&emsp;- Container types</p><p>&emsp;&emsp;- Desired delivery window (dd/mm/yyyy - dd/mm/yyyy)</p><p>&emsp;&emsp;- Number of loads bid on</p><p>&emsp;&emsp;- Incoterms</p><p>&emsp;- Haulage Bid Information (Haulier-provided unless stated)</p><p>&emsp;&emsp;- Haulier</p><p>&emsp;&emsp;&emsp;- Searchable dropdown</p><p>&emsp;&emsp;&emsp;&emsp;- Searchable by Company name, User name, User ID, User email.</p><p>&emsp;&emsp;&emsp;&emsp;- Shown as “Name (Company name) - User ID”</p><p>&emsp;&emsp;&emsp;- Displays only approved Hauliers within the system.</p><p>&emsp;&emsp;&emsp;&emsp;- A haulier must be “Approved” by Admin (Phase 1 - 6.6.2.7 Member approval - approval actions) in order to make an offer.</p><p>&emsp;&emsp;&emsp;&emsp;- A guidance message must show: “Only approved hauliers are shown here. Please approve a haulier in order to make a bid on their behalf.”</p><p>&emsp;&emsp;- Trailer/Container Type</p><p>&emsp;&emsp;&emsp;- Options not applicable to the selected Haulier (per registration/profile) are greyed out/disabled.</p><p>&emsp;&emsp;&emsp;&emsp;- Tooltip on disabled options: “Only container types associated with the Haulier profile are enabled here.”</p><p>&emsp;&emsp;- Are you completing Customs clearance? </p><p>&emsp;&emsp;&emsp;- Guidance text: “Note: If not, WasteTrade will handle Customs Clearance for a fixed fee of £200 or currency equivalent. This will be added to the Haulage Total.”</p><p>&emsp;&emsp;&emsp;- Checkbox</p><p>&emsp;&emsp;&emsp;- Per-load logic: fee is applied once per offer (flat £200) only if the checkbox is not selected (i.e., the Haulier is not handling customs).</p><p>&emsp;&emsp;- Number of loads </p><p>&emsp;&emsp;&emsp;- Read-only</p><p>&emsp;&emsp;&emsp;- Admin must bid on the total number of loads from the Buyer.</p><p>&emsp;&emsp;- Quantity per load (MT) </p><p>&emsp;&emsp;&emsp;- Read-only</p><p>&emsp;&emsp;- Haulage cost per load</p><p>&emsp;&emsp;&emsp;- Guidance text: “Note: Please include the Weighbridge price if required.”</p><p>&emsp;&emsp;- Currency</p><p>&emsp;&emsp;&emsp;- Display/total shows in selected currency; the £200 customs fee text is fixed in UI copy but the amount applied must be currency-consistent with the offer.</p><p>&emsp;&emsp;- Haulage total</p><p>&emsp;&emsp;&emsp;- Read-only</p><p>&emsp;&emsp;&emsp;- Automatically calculated:</p><p>&emsp;&emsp;&emsp;&emsp;- (Haulage cost per load × number of loads) + customs fee</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- If “Are you completing Customs Clearance?” = Yes, customs fee = 0</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- If “Are you completing Customs Clearance?” = No, customs fee = £200 or EUR/USD equivalent.</p><p>&emsp;&emsp;&emsp;&emsp;- Recalculate live on any relevant change.</p><p>&emsp;&emsp;- Transport provider</p><p>&emsp;&emsp;- Suggested collection date</p><p>&emsp;&emsp;&emsp;- Must be within the Buyer’s Earliest/Latest delivery window (defined Phase 1 - 6.4.1.2 Bidding on a Listing).</p><p>&emsp;&emsp;&emsp;- All dates outside the Buyer’s window are blocked/disabled in the picker.</p><p>&emsp;&emsp;- Expected transit time</p><p>&emsp;&emsp;- Demurrage at destination (days)</p><p>&emsp;&emsp;&emsp;- Guidance text: “Note: This must be a minimum of 21 days.”</p><p>&emsp;&emsp;- Notes</p><p>- Submit Flow</p><p>&emsp;- On submit:</p><p>&emsp;&emsp;- The system validates input fields.</p><p>&emsp;&emsp;&emsp;- If validation fails displays inline errors.</p><p>&emsp;&emsp;&emsp;- If successful: </p><p>&emsp;&emsp;&emsp;&emsp;- Create Haulage Offer and route to Admin review ([6.4.1.12](#_isf6t9nej4i)).</p><p>&emsp;&emsp;&emsp;&emsp;- Show confirmation: “The haulage offer has been submitted for review.”</p><p>&emsp;&emsp;&emsp;&emsp;- Direct the Admin to view an updated Haulage Bid Details page ([6.4.1.14](#_xxwqkx8xqoo7))</p><p></p><p>**Postconditions:**</p><p>- A new Haulage Offer is created with the provided details and sent to Admin for review ([6.4.1.12](#_isf6t9nej4i)).</p><p></p>|
| :- |

|**Field** |**Data Dictionary**|
| :- | :- |
|Haulier|Searchable dropdown. Single selection. Displays all approved hauliers within the system. Mandatory.|
|Trailer/Container Type|Dropdown: options Curtain Sider, Containers, Tipper Trucks, Walking Floor; options not in the Haulier’s profile are disabled/greyed with tooltip. Mandatory.|
|Are you completing Customs clearance?|Checkbox. Optional. |
|Haulage cost per load|Text. Numeric input. Max 15 characters. Mandatory.|
|Currency|Dropdown. Options: GBP, EUR, USD. Mandatory.|
|Transport Provider|Radio buttons. Options: Own haulage, Third party, Mixed. Mandatory. |
|Suggested collection date|Date picker. Must fall within the Buyer delivery window, dates outside this window are disabled. Mandatory.|
|Expected transit time (days)|Dropdown. Options: 1, 2-3, 4-5, 6-7, 8-10, 11-14. Mandatory.|
|Demurrage at destination (days)|Text. Numeric input. Must be greater than 20. Mandatory.|
|Notes|Free text. Alphanunumeric input. Does not allow telephone numbers, email addresses or urls. Max characters 32000. Optional.|

|**Use Case**|**Error Message**|
| :- | :- |
|Offer page load failure|“We couldn’t load the offer form. Please refresh and try again.”|
|Load becomes unavailable between form open and submit|“This load is no longer available for offers.”|
|Required fields missing|“Some required information is missing. Please complete the highlighted fields.”|
|Invalid formats present|“Some entries are not in the correct format. Please correct the highlighted fields.”|
|Demurrage less than 21 days|“Demurrage must be at least 21 days.”|
|Submit failure|“We couldn’t submit this offer right now. Please try again. If the problem persists, contact support.”|

|**Design Name**|**Link**|
| :- | :- |
|Make an offer on behalf of a haulier|<p><https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22735-114938&t=TV9yQ37RETpfTfvp-4> ![ref2]</p><p></p><p></p><p></p>|
|Trailer or container|![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.019.png)|

|**Client Approved**|Yes|
| :- | :- |
####
#### <a name="_4vjiu3g3vmyx"></a><a name="_mesuh14uw64o"></a>**6.4.1.17. Mark Listing as Shipped** 
- There will be a button in the haulage bid details to “Mark as Shipped”
- Admin can mark a listing as “Shipped”
  - Only after pickup is confirmed by the Seller ([6.1.4.1](#_f3vhb721b3up))
    - Attempting to mark a listing as shipped without pickup confirmation will prompt an error message.

|<p>**Preconditions:**</p><p>- The haulage bid is Approved ([6.4.1.15](#_7ly5u4j06b78)).</p><p>- Admin is viewing the Haulage Bid Details page ([6.4.1.14](#_xxwqkx8xqoo7)).</p><p>- Seller marks Pickup Confirmed per load (out of scope for P2 - [6.1.4.1](#_f3vhb721b3up)).</p><p></p><p>**Triggers:**</p><p>- Admin selects “Mark as Shipped” next to a load when viewing Load Details ([6.4.1.14](#_xxwqkx8xqoo7)).</p><p></p><p>**Acceptance Criteria:**</p><p>- Control visibility & gating</p><p>&emsp;- The Mark as Shipped button is only shown when bid status = Approved.</p><p>&emsp;&emsp;- Not when the bid is Rejected or Withdrawn (no load details shown)</p><p>&emsp;&emsp;- Not when a load has already been Marked as Shipped.</p><p>&emsp;- Each load card within the Load Details has a button to “Mark as Shipped”</p><p>&emsp;&emsp;- Unless the load has previously been marked as shipped, in which case it will display a green “Shipped” label.</p><p>- Review pickup information</p><p>&emsp;- Selecting “Mark as Shipped” will open a confirmation modal containing:</p><p>&emsp;&emsp;- “Are you sure this load has been shipped and all relevant documentation is in order? This cannot be undone.”</p><p>&emsp;&emsp;- Confirm</p><p>&emsp;&emsp;&emsp;- The system defines haulage bid status as Partially Shipped, unless it is the final load (i.e. load 3 of 3), in which case the status will become “Shipped”.</p><p>&emsp;&emsp;&emsp;&emsp;- The current date is shown in the Shipped Date field for the selected load.</p><p>&emsp;&emsp;&emsp;&emsp;- The “Mark as Shipped” date is removed for the selected load.</p><p>&emsp;&emsp;- Cancel</p><p>&emsp;&emsp;&emsp;- Closes the modal without saving changes.</p><p></p><p>**Postconditions:**</p><p>- The haulage bid status and trader bid status shows Partially Shipped/Shipped status</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Modal load failure|“We couldn’t load the shipping modal. Please try again later.”|
|Status update failure|“We couldn’t update the shipping status right now. Please try again. If the problem persists, contact support.”|

|**Design Name**|**Link**|
| :- | :- |
|Mark load as shipped (when viewing accepted bid details)|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22121-88580&t=2VKx81HrYDas9Qay-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.020.png)|
|Mark as shipped modal|<p><https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21862-102016&t=hEc5kX0tITAQtdG6-4> </p><p>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.021.png)</p>|

|**Client Approved**|Yes|
| :- | :- |
####

#### <a name="_u57t25on1lrv"></a><a name="_tfth3fo1s797"></a>**6.4.1.18. View Sample Request Table**
- Sample requests will be shown in the Admin dashboard samples tab.
- The table will show a list of all sample requests
- The table will have the following columns
  - Material name (Product name schema)
    - Selecting this will open the corresponding sales listing page as a new tab in the default browser.
  - Date
  - Number of Samples
  - Sample Size
  - Buyer
    - ID
      - Selecting this will open the corresponding user details page as a new tab in the default browser.
    - ~~Name~~
    - ~~Company~~
    - Location
  - Seller
    - ID
      - Selecting this will open the corresponding user details page as a new tab in the default browser.
    - ~~Name~~
    - ~~Company~~
    - Location
  - Status
    - Unsent
    - Sent
  - Received
    - ~~If “Unsent” displays a button for the Admin to select~~
    - If “Sent” displays the date the sample was marked as received 
  - Posted
    - ~~If “Unsent” displays a button for the Admin to select~~
    - If “Sent” displays the date the sample was marked as posted 
  - Label
    - ~~Displays a button for the Admin to upload/remove the postage label~~
  - Cancel
    - ~~A button for the Admin to cancel the sample request~~
  - Information tooltip
    - ` `Displays sample request message (if applicable)
  - Notes
    - Admin can select to open the notes modal with a button to save

|<p>**Preconditions:**</p><p>- The user is authenticated as an administrator.</p><p>- The user is viewing the samples area of the Admin dashboard.</p><p></p><p>**Triggers:**</p><p>- The Admin selects to open Samples from the navigation bar ([6.4.1.1](#_9tlqtjnx8l54)).</p><p></p><p>**Acceptance Criteria:**</p><p>- Table Presentation:</p><p>&emsp;- Implement a read-only table on the Admin platform to display the latest sample request data.</p><p>&emsp;- The table must automatically refresh upon page load to ensure it shows the most current data.</p><p>- The read-only table includes the following:</p><p>&emsp;- Material name</p><p>&emsp;&emsp;- Product name schema</p><p>&emsp;&emsp;- Selecting this will open the corresponding sales listing page as a new tab in the default browser.</p><p>&emsp;- Date</p><p>&emsp;&emsp;- dd/mm/yyyy</p><p>&emsp;- Number of Samples</p><p>&emsp;- Sample Size </p><p>&emsp;&emsp;- e.g., 1kg, 10kg</p><p>&emsp;- Buyer </p><p>&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Location</p><p>&emsp;&emsp;- Country</p><p>&emsp;&emsp;- Info tooltip</p><p>&emsp;&emsp;&emsp;- Tooltip displays buyer message (if any)</p><p>&emsp;&emsp;&emsp;- Highlighted icon if message present</p><p>&emsp;&emsp;&emsp;- Disabled if no buyer message present</p><p>&emsp;- Seller </p><p>&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Location</p><p>&emsp;&emsp;- Country</p><p>&emsp;- Status</p><p>&emsp;&emsp;- Sample Requested</p><p>&emsp;&emsp;- Sample Approved</p><p>&emsp;&emsp;- Sample Dispatched</p><p>&emsp;&emsp;- Sample In Transit</p><p>&emsp;&emsp;- Customs Cleared</p><p>&emsp;&emsp;- Sample Delivered</p><p>&emsp;&emsp;- Customer Feedback Requested</p><p>&emsp;&emsp;- Feedback Provided</p><p>&emsp;- Sent</p><p>&emsp;&emsp;- If “Sent”, displays the date the sample was marked as sent</p><p>&emsp;&emsp;- Otherwise shows N/A</p><p>&emsp;- Received</p><p>&emsp;&emsp;- If “Received”, displays the date the sample was marked as received</p><p>&emsp;&emsp;- Otherwise shows N/A</p><p>&emsp;- Label</p><p>&emsp;- Notes ([6.4.1.21](#_uqxxrgjvk3e8))</p><p>- Data Flow</p><p>&emsp;- Sample request from a trade platform user (not in scope)</p><p>&emsp;&emsp;- When a user requests a sample, the system must generate a Sample ID.</p><p>&emsp;&emsp;- The system will push the Sample ID to Salesforce (as per the [WT Salesforce CRM data](https://docs.google.com/spreadsheets/d/1INMdcIWUkvxOB13M2xrz5qCVZsq8xSGlrX-6ioFHQfo/edit?gid=1355343183#gid=1355343183))</p><p>&emsp;- Salesforce will push the sample status (and dates for status changes relating to “Sent” and “Received”) back to the system.</p><p>- Dynamic Loading:</p><p>&emsp;- The table should load the latest 20 requests by default.</p><p>&emsp;- Include pagination to view more entries if there are more than 20 requests.</p><p>- Compliance with UI/UX Design:</p><p>&emsp;- The table's design should align with the overall Admin platform.</p><p>&emsp;- Maintain visual consistency in typography, colours, and layout with existing parts of the Admin dashboard.</p><p></p><p>**Postconditions:**</p><p>- The admin can view all sample requests in the system.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Table fails to load|"Failed to load sample requests. Please refresh the page to try again."|
|No sample requests found|"No sample requests found. Check back later."|

|**Design Name**|**Link**|
| :- | :- |
|Sample table|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51377&t=TV9yQ37RETpfTfvp-4> <br>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.022.png)|

|**Client Approved**|Yes|
| :- | :- |
####

#### <a name="_dqnyr5gzyibb"></a><a name="_ekn7f6mf2prs"></a>**6.4.1.19. View MFI Table**
- The table will have the following columns
  - Material name (Product name schema)
    - Selecting this will open the corresponding sales listing page as a new tab in the default browser.
  - Requested Date
  - Buyer
  - Seller
  - ~~Requested~~
    - ~~Button for Admin to select~~
  - ~~Received~~
  - Tested
  - Delete
    - ~~Button for the Admin to delete the MFI test~~
  - Notes
    - Admin can select to open the notes modal with a button to save

|<p>**Preconditions:**</p><p>- The user is authenticated as an administrator.</p><p>- The user is viewing the MFI area of the Admin dashboard.</p><p></p><p>**Triggers:**</p><p>- The Admin selects to open MFI from the navigation bar ([6.4.1.1](#_9tlqtjnx8l54)).</p><p></p><p>**Acceptance Criteria:**</p><p>- Table Presentation:</p><p>&emsp;- Implement a read-only table on the Admin platform to display the latest MFI requests.</p><p>&emsp;- The table must automatically refresh upon page load to ensure it shows the most current data.</p><p>- The read-only table includes the following:</p><p>&emsp;- Material name</p><p>&emsp;&emsp;- Product name schema</p><p>&emsp;&emsp;- Selecting this will open the corresponding sales listing page as a new tab in the default browser.</p><p>&emsp;- Date</p><p>&emsp;&emsp;- dd/mm/yyyy</p><p>&emsp;- Buyer </p><p>&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Location</p><p>&emsp;&emsp;- Country</p><p>&emsp;&emsp;- Info tooltip</p><p>&emsp;&emsp;&emsp;- Tooltip displays buyer message (if any)</p><p>&emsp;&emsp;&emsp;- Highlighted icon if message present</p><p>&emsp;&emsp;&emsp;- Disabled if no buyer message present</p><p>&emsp;- Seller </p><p>&emsp;&emsp;- ID</p><p>&emsp;&emsp;&emsp;- Selecting this will open the corresponding user details page as a new tab in the default browser.</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;- Location</p><p>&emsp;&emsp;- Country</p><p>&emsp;- Status</p><p>&emsp;&emsp;- Awaiting Payment</p><p>&emsp;&emsp;- Pending</p><p>&emsp;&emsp;- Tested</p><p>&emsp;- Tested Date</p><p>&emsp;&emsp;- If “Tested”, displays the date the MFI test was completed</p><p>&emsp;&emsp;- Otherwise shows N/A</p><p>&emsp;- Notes ([6.4.1.21](#_uqxxrgjvk3e8))</p><p>- Data Flow</p><p>&emsp;- MFI request from a trade platform user (not in scope)</p><p>&emsp;&emsp;- When a user requests an MFI test, the system must generate a MFI test ID.</p><p>&emsp;&emsp;- The system will push the MFI test ID ID to Salesforce (as per the [WT Salesforce CRM data](https://docs.google.com/spreadsheets/d/1INMdcIWUkvxOB13M2xrz5qCVZsq8xSGlrX-6ioFHQfo/edit?gid=1355343183#gid=1355343183))</p><p>&emsp;- Salesforce will push the MFI test status (and dates for status changes relating to “Tested”) back to the system.</p><p>- Dynamic Loading:</p><p>&emsp;- The table should load the latest 20 requests by default.</p><p>&emsp;- Include pagination to view more entries if there are more than 20 requests.</p><p>- Compliance with UI/UX Design:</p><p>&emsp;- The table's design should align with the overall Admin platform.</p><p>&emsp;- Maintain visual consistency in typography, colours, and layout with existing parts of the Admin dashboard.</p><p></p><p>**Postconditions:**</p><p>- Admin has a read-only view of MFI requests.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Table fails to load|"Failed to load MFI requests. Please refresh the page to try again."|
|No MFI requests found|"No MFI requests found. Check back later."|

|**Design Name**|**Link**|
| :- | :- |
|MFI Table|<p><https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-51414&t=GAfuMoCozzx39Zqo-4> </p><p>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.023.png)</p>|

|**Client Approved**|Yes|
| :- | :- |


#### <a name="_mcjdokaq4f5d"></a>**6.4.1.20. System Defined Status & State**
- This is an update to existing functionality within the system: updates are highlighted in yellow.
- Currently, there is a State and Status for all Listings/Wanted Listings/Offers.
  - Listings
    - Status
      - Available: If the listing is available from today or in the past
      - Available from <date>: Display the date from which the material is available.
      - Expired: The listing has expired after the set time
      - Sold: All loads of the listing have been sold (when the user marks the listing as ‘sold’)
      - Ongoing: Listing that has a defined number of loads until resetting at defined intervals.
      - Rejected: Admin rejection = listing/status is not shown to users
    - State
      - Pending: When the listing has just been created or is awaiting Admin approval / additional information
      - Approved: When the listing has been approved by Admin and is visible to Buyers
      - Rejected: When the listing has been rejected by admin
  - Wanted Listings
    - Status
      - Pending: Displayed if the listing is waiting for Admin approval (6...)
      - Material Required: Displayed if the required from date is today or in the past
      - Material Required from <date>: Displays the future date from which the material is required
      - Fulfilled: Approval = becomes required/required from
      - Rejected: Rejection = listing is not shown
    - State
      - Pending: When the Buyer creates a listing but it is awaiting Admin approval / additional information
      - Approved: When the listing has been approved by Admin and is visible to Sellers
      - Rejected: When the listing has been rejected by admin
  - Trade Offers
    - Status
      - Accepted (user accepted the bid already)
      - Rejected (user rejected the bid already)
      - Shipped (when marked as shipped)
      - Pending
    - State
      - Active: When the offer is still valid
      - Closed: When the offer has ended (Rejected or fully completed)
- This should be updated to reflect:
  - Listings
    - Status
      - Pending - Pending when Admin has not made an approval action or has requested More Information Required (6.6.2.15)
      - Available - Listing is available now (today or past start date).
      - Available from <date> - Listing becomes available on the future date shown.
      - Ongoing - Recurs/resets by configuration.
      - Sold - All loads sold.
      - Expired - End date reached; no longer available.
      - Rejected: Admin rejection = listing/status is not shown to users
    - State
      - Pending: When the listing has just been created or is awaiting Admin approval/additional information
      - Approved - Visible to Buyers; normal trading.
      - Rejected - Not visible
  - Wanted Listings
    - Status
      - Pending - Pending when Admin has requested More Information Required (6.6.2.18)
      - Material Required: Displayed if the required from date is today or in the past
      - Material Required from <date>: Displays the future date from which the material is required
      - Fulfilled: Approval = becomes required/required from
      - Rejected: Rejection = listing is not shown
    - State
      - Pending: When the listing has just been created or is awaiting Admin approval/additional information
      - Approved - Visible to Buyers; normal trading.
      - Rejected - Not visible
  - Trade Bid/Offers
    - Status
      - Pending (awaiting action)
      - Accepted (user accepted the bid already)
      - Rejected (user rejected the bid already)
      - Partially Shipped/Shipped (when marked as shipped)
  - Haulage Bids/Offers
    - Status
      - Accepted (user accepted the bid already)
      - Rejected (user rejected the bid already)
      - More Information Required (user required)
      - Partially Shipped/Shipped (when marked as shipped)

|<p>**Scope & Preconditions:**</p><p>- Applies to end-user surfaces (tables, cards, detail pages) and Admin views where Status/State are shown.</p><p></p><p>**Triggers:**</p><p>- Any read of an entity.</p><p>- Any status/state-changing event.</p><p></p><p>**Acceptance Criteria:**</p><p>- State indicators within the system should be updated to reflect:</p><p>&emsp;- Listings</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;&emsp;- Pending - Pending when Admin has requested More Information Required (6.4.2.15)</p><p>&emsp;&emsp;&emsp;- Available - Listing is available now (today or past start date).</p><p>&emsp;&emsp;&emsp;- Available from <date> - Listing becomes available on the future date shown.</p><p>&emsp;&emsp;&emsp;- Ongoing - Recurs/resets by configuration.</p><p>&emsp;&emsp;&emsp;- Sold - All loads sold.</p><p>&emsp;&emsp;&emsp;- Expired - End date reached; no longer available.</p><p>&emsp;&emsp;&emsp;- Rejected: Admin rejection = listing/status is not shown to users</p><p>&emsp;&emsp;- Admin State</p><p>&emsp;&emsp;&emsp;- Pending: When the listing has just been created or is awaiting Admin approval/additional information</p><p>&emsp;&emsp;&emsp;- Approved - Visible to Buyers; normal trading.</p><p>&emsp;&emsp;&emsp;- Rejected - Not visible</p><p>&emsp;- Wanted Listings</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;&emsp;- Pending - Pending when Admin has requested More Information Required (6.4.2.18)</p><p>&emsp;&emsp;&emsp;- Material Required: Displayed if the required from date is today or in the past</p><p>&emsp;&emsp;&emsp;- Material Required from <date>: Displays the future date from which the material is required</p><p>&emsp;&emsp;&emsp;- Fulfilled: Approval = becomes required/required from</p><p>&emsp;&emsp;&emsp;- Rejected: Rejection = listing is not shown</p><p>&emsp;&emsp;- Admin State</p><p>&emsp;&emsp;&emsp;- Pending: When the listing has just been created or is awaiting Admin approval/additional information</p><p>&emsp;&emsp;&emsp;- Approved - Visible to Buyers; normal trading.</p><p>&emsp;&emsp;&emsp;- Rejected - Not visible</p><p>&emsp;- Trade Bid/Offers</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;&emsp;- Pending (awaiting action)</p><p>&emsp;&emsp;&emsp;- Accepted (user accepted the bid already)</p><p>&emsp;&emsp;&emsp;- Rejected (user rejected the bid already)</p><p>&emsp;&emsp;&emsp;- Load <x of X> Shipped (when marked as shipped)</p><p>&emsp;- Haulage Bids/Offers</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;&emsp;- Accepted</p><p>&emsp;&emsp;&emsp;- Rejected</p><p>&emsp;&emsp;&emsp;- More Information Required</p><p>&emsp;&emsp;&emsp;- Load <x of X> Shipped (when marked as shipped)</p><p>- The field “State” throughout the admin portal should be updated to show “Admin State”.</p><p>&emsp;![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.024.png)</p><p></p><p>**Postconditions:**</p><p>- All surfaces consistently show the defined Status and Admin State values.</p><p></p>|
| :- |

|**Client Approved**|yes|
| :- | :- |
####



#### <a name="_s5idivcqay8b"></a><a name="_uqxxrgjvk3e8"></a>**6.4.1.21. Notes**
- As an admin, I want to access internal notes within tables in the Admin dashboard, so my team can capture context without leaving the platform.
- Notes buttons will be displayed in each Admin dashboard table
- Clicking Notes opens a notes modal for that specific record
- Admins can add/edit/clear notes in a multiline text area. 
  - Changes will save automatically when the modal is closed.
- There will be a brief saving state and a success toast after close/save; on error, the modal will remain open and show a retry message.
- The modal will display “Last edited by <Admin user name>, <date>, <timestamp>” in the modal footer for quick traceability.

|<p>**Preconditions:**</p><p>- The user is authenticated as a WasteTrade Admin.</p><p>- Admin is viewing one of the Admin dashboard tables:</p><p>&emsp;- Users ([6.4.1.2](#_3q8bhwn2jgnl))</p><p>&emsp;- Listings ([6.4.1.5](#_u2u1trwyjxj6))</p><p>&emsp;- Wanted Listings ([6.4.1.7](#_ihhvs12l52de))</p><p>&emsp;- Offers ([6.4.1.9](#_91yj68uyh5s7))</p><p>&emsp;- Haulage bids ([6.4.1.11](#_2h1dd5wmnvn6))</p><p>&emsp;- Samples ([6.4.1.18](#_tfth3fo1s797))</p><p>&emsp;- MFI ([6.4.1.19](#_ekn7f6mf2prs))</p><p></p><p>**Triggers:**</p><p>- Admin clicks the Notes button/icon on a specific table row.</p><p></p><p>**Acceptance Criteria:**</p><p>- Notes entry points</p><p>&emsp;- Each listed table (Users/Listings/Wanted/Offers/Haulage Bids/Samples/MFI) shows a Notes button/icon in the row actions.</p><p>&emsp;&emsp;- Tooltip on hover: “View/Add internal notes.”</p><p>&emsp;- Button is enabled for all rows; if a record has existing notes, show a subtle has-notes indicator = filled button.</p><p>- Notes modal</p><p>&emsp;- Opening the modal loads existing notes for that record ID.</p><p>&emsp;&emsp;- Modal title: “Notes” </p><p>&emsp;&emsp;- Multiline text area</p><p>&emsp;&emsp;- Footer meta: “Last edited by <Admin Name>, <dd/mm/yyyy>, HH:MM”.</p><p>&emsp;&emsp;- Close (X) in header </p><p>&emsp;&emsp;- “Save & Close” button</p><p>- Edit & save behaviour</p><p>&emsp;- The user can select “Save & Close” to save note changes and close the modal.</p><p>&emsp;- Success feedback: After successful save, close the modal and show a toast: “Notes saved.”</p><p>&emsp;&emsp;- The button Notes box will fill with the color light green.</p><p>&emsp;- No-change close: If nothing changed, close immediately (no toast).</p><p>&emsp;- Clear notes: If the text area is emptied and closed, persist as empty notes (i.e., clearing is allowed and saved).</p><p>- Concurrency & traceability</p><p>&emsp;- Meta update: After save, update Last edited by using the saving admin and server time.</p><p>- Table refresh cues</p><p>&emsp;- After a successful save/clear, the originating row updates its has-notes indicator (on/off) without a full page reload.</p><p>&emsp;- Pagination and filters remain intact after closing the modal.</p><p>- Security & scope</p><p>&emsp;- Notes are internal to admins; not visible to platform users.</p><p>&emsp;- Notes are stored per-record (scoped to the specific entity instance).</p><p>&emsp;- Notes are pushed to Salesforce per-record.</p><p></p><p>**Postconditions:**</p><p>- The record’s internal notes are created/updated/cleared as edited.</p><p>- The table row reflects note presence with the has-notes indicator.</p><p>- Audit/metadata shows who last edited and when.</p><p></p>|
| :- |

|**Field** |**Data Dictionary**|
| :- | :- |
|Notes area|Multiline text; Alphanumeric and support for special characters and punctuation. Max 4000 chars. Supports line breaks. Optional.|

|**Use Case**|**Error Message**|
| :- | :- |
|Load failure|“We couldn’t load notes for this record. Please try again.”|
|Save failure|“We couldn’t save your notes. Please try again.”|

|**Design Name**|**Link**|
| :- | :- |
|Notes modal|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22398-52025&t=GAfuMoCozzx39Zqo-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.025.png)|

|**Client Approved**|Yes|
| :- | :- |
####

#### <a name="_7ws4jc9odgq1"></a><a name="_ssd15u92k6sn"></a>**6.4.1.22. Assign Admin**
- As an admin, I want to assign a responsible Admin for any User, Listing, Wanted Listing, or Offer directly from the dashboard tables, so the team has clear context and ownership without leaving the platform.
- Assign Admin dropdowns will be displayed in each Admin dashboard table:
  - Users ([6.4.1.2](#_3q8bhwn2jgnl))
  - Listings ([6.4.1.5](#_u2u1trwyjxj6))
  - Wanted Listing ([6.4.1.7](#_ihhvs12l52de))
  - Offers ([6.4.1.9](#_91yj68uyh5s7))
  - Samples ([6.4.1.18](#_tfth3fo1s797))
  - MFI ([6.4.1.19](#_ekn7f6mf2prs))
- Assignee control (per row):
  - A dropdown at the start of each row lets admins set the Responsible admin.
  - The options list will display the first and last names of all active (not archived) Admin users.
- Selection autosaves with a brief saving state; on error, revert to the previous value and show a retry message.
- The first and last name of the selected assignee is shown in the dropdown.

|<p>**Preconditions:**</p><p>- The user is authenticated as a WasteTrade Admin.</p><p>- Admin is viewing one of the Admin dashboard tables:</p><p>&emsp;- Users ([6.4.1.2](#_3q8bhwn2jgnl))</p><p>&emsp;- Listings ([6.4.1.5](#_u2u1trwyjxj6))</p><p>&emsp;- Wanted Listings ([6.4.1.7](#_ihhvs12l52de))</p><p>&emsp;- Offers ([6.4.1.9](#_91yj68uyh5s7))</p><p>&emsp;- Haulage bids ([6.4.1.11](#_2h1dd5wmnvn6))</p><p>&emsp;- Samples ([6.4.1.18](#_tfth3fo1s797))</p><p>&emsp;- MFI ([6.4.1.19](#_ekn7f6mf2prs))</p><p></p><p>**Triggers:**</p><p>- Admin clicks the “Assign” dropdown on a specific table row.</p><p></p><p>**Acceptance Criteria:**</p><p>- Control placement & display</p><p>&emsp;- The control is present and behaves identically in each admin dashboard tab.</p><p>&emsp;&emsp;- Each table row shows an Assignee dropdown at the start of the row.</p><p>&emsp;&emsp;&emsp;- The control displays the selected Admin’s First Name + Last Name</p><p>&emsp;&emsp;&emsp;&emsp;- If unassigned, show as “Unassigned”.</p><p>&emsp;&emsp;&emsp;- Tooltip on hover: “Set responsible admin.”</p><p>- Options & filtering</p><p>&emsp;- Opening the dropdown lists all active Admin users (Super Admin, Admin, Sales Admin) that are not archived.</p><p>&emsp;- Options are shown as First Name Last Name; ordered A–Z by Last Name, then First Name.</p><p>&emsp;- Include a top option “Unassigned” to clear the assignee.</p><p>&emsp;- Selecting an option autosaves immediately for that record (no extra submit).</p><p>&emsp;&emsp;- On success:</p><p>&emsp;&emsp;&emsp;- Persist the new assignee.</p><p>&emsp;&emsp;&emsp;- Display the chosen Admin’s First Name Last Name below the dropdown selector.</p><p>&emsp;&emsp;&emsp;- Show a small success toast “Assignee updated.”</p><p>&emsp;&emsp;- On failure:</p><p>&emsp;&emsp;&emsp;- Revert the control to the previous value.</p><p>&emsp;&emsp;&emsp;- Show an inline message: “We couldn’t update the assignee. Try again.”</p><p>- Persistence & refresh</p><p>&emsp;- The selected assignee is stored with the record and survives reloads/pagination.</p><p>&emsp;- After save, the table updates in place (no full page refresh); pagination, filters, and scroll position remain unchanged.</p><p>- Security & scope</p><p>&emsp;- Notes are internal to admins; not visible to platform users.</p><p>&emsp;- Notes are stored per-record (scoped to the specific entity instance).</p><p></p><p>**Postconditions:**</p><p>- The chosen Responsible admin is persisted on the record and reflected in the control.</p><p></p>|
| :- |

|**Field** |**Data Dictionary**|
| :- | :- |
|Assigned|Dropdown; Options: all active Admin users + Unassigned. Shown as “Last name, First name”. default = Unassigned.|

|**Use Case**|**Error Message**|
| :- | :- |
|Load assignees failed (dropdown open)|“We couldn’t load admins. Please try again.”|
|Save failed |“We couldn’t update the assignee. Try again.”|

|**Design Name**|**Link**|
| :- | :- |
|Assign admin dropdown|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=22379-104695&t=GAfuMoCozzx39Zqo-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.026.png)|

|**Client Approved**|Yes|
| :- | :- |


### <a name="_eu1j4ce7wdf0"></a>6.4.2. User Management 
This section relates specifically to the management of admin-level users within the WasteTrade team.
#### <a name="_o1c3ons46dyl"></a>**6.4.2.1. View All Users**
- The users will be able to see a summary table of all the WasteTrade users in the Admin system.
- The table will have the following columns
  - Name
    - First name
    - Last name
  - Date of account creation
  - Email address
  - Role
    - Super Admin
    - Admin
    - Sales Admin
  - Status
    - Active
    - Archived 
- The table will have pagination
- The user will be able to select the number of rows per page
  - 10
  - 20
    - Default
  - 50
  - All
- By default, the table is sorted by First Name - ascending

|<p>**Preconditions:**</p><p>- The user is authenticated as a Super Admin or Admin.</p><p>- Admin users exist within the Admin portal.</p><p></p><p>**Triggers:**</p><p>- The user selects User Management from the navigation to open View All Users.</p><p></p><p>**Acceptance Criteria:**</p><p>- Table Contents</p><p>&emsp;- Render a summary table of all WasteTrade users.</p><p>&emsp;- Columns:</p><p>&emsp;&emsp;- Name</p><p>&emsp;&emsp;&emsp;- First name, Last name</p><p>&emsp;&emsp;- Date of account creation</p><p>&emsp;&emsp;&emsp;- dd/mm/yyyy</p><p>&emsp;&emsp;- Email address</p><p>&emsp;&emsp;- Role</p><p>&emsp;&emsp;&emsp;- Super Admin</p><p>&emsp;&emsp;&emsp;- Admin</p><p>&emsp;&emsp;&emsp;- Sales Admin</p><p>&emsp;&emsp;- Status</p><p>&emsp;&emsp;&emsp;- Active</p><p>&emsp;&emsp;&emsp;- Archived</p><p>&emsp;&emsp;- “View Details” button ([6.4.2.2](#_4wtijscn4nk6))</p><p>- Display Settings</p><p>&emsp;- Default sort: First name (ascending) on initial load.</p><p>&emsp;- The user will be able to select the number of rows per page:</p><p>&emsp;&emsp;- 10</p><p>&emsp;&emsp;- 20</p><p>&emsp;&emsp;&emsp;- Default</p><p>&emsp;&emsp;- 50</p><p>&emsp;&emsp;- 100</p><p>&emsp;- If applicable, pagination controls show “Previous” and “Next” buttons and page numbers; show total results and current range (e.g., “21-40 of 86”).</p><p></p><p>**Postconditions:**</p><p>- Super Admin can view a complete list of all Admin users.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|User management page load failure|"Failed to load Admin users. Please refresh the page to try again."|
|Unable to load users|"No Admin users found. Check back later."|

|**Design Name**|**Link**|
| :- | :- |
|View all users|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21855-63141&t=TzDhDk2ScPubsQGI-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.027.png)|

|**Client Approved**|yes|
| :- | :- |
####

#### <a name="_rsz9c1kmzac9"></a><a name="_4wtijscn4nk6"></a>**6.4.2.2. View User Details** 
- Users will be able to view details for Admin users
  - Super Admins and Admins can view details of all users
- The user will be able to click on a row within the table to access the record
- The following details will be displayed
  - First Name
  - Last Name
  - Email address
  - Phone number
  - Role
    - e.g. Super Admin, Admin,Sales Admin
  - Status
    - Active
    - Archived (visual differentiation required)
      - Time and date stamp for last app access
        - HH: MM, DD/MM/YYYY

|<p>**Preconditions:**</p><p>- The user is authenticated as a Super Admin or Admin.</p><p>- Admin users exist within the Admin portal.</p><p></p><p>**Triggers:**</p><p>- The user selects View Details on the user management table ([6.4.2.1](#_o1c3ons46dyl)).</p><p></p><p>**Acceptance Criteria:**</p><p>- The header will show the user full name and a “Return to users table” button.</p><p>- The user details page will contain:</p><p>&emsp;- First Name</p><p>&emsp;- Last Name</p><p>&emsp;- Email address</p><p>&emsp;- Phone number </p><p>&emsp;- Role</p><p>&emsp;&emsp;- Super Admin</p><p>&emsp;&emsp;- Admin</p><p>&emsp;&emsp;- Sales Admin</p><p>&emsp;- Status</p><p>&emsp;&emsp;- Active</p><p>&emsp;&emsp;- Archived</p><p>&emsp;- Last app access</p><p>&emsp;&emsp;- Timestamp in HH:MM, DD/MM/YYYY</p><p></p><p>**Postconditions:**</p><p>- The Admin successfully views the selected user’s read-only profile details; no edits occur in this story.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|User details fail to load|“We couldn’t load user details. Please refresh and try again.”|
|User details not found|“We couldn’t find this user.”|
|Missing last access timestamp|“Unable to find recent activity. Please check again later.”|

|**Design Name**|**Link**|
| :- | :- |
|View user details|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21864-108331&t=TzDhDk2ScPubsQGI-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.028.png)|

|**Client Approved**|yes|
| :- | :- |
####

#### <a name="_8vz7pl9i5sv5"></a><a name="_s436qevz6kjy"></a>**6.4.2.3. Add a New User**
- Only Super Admin/Admin users can add new users
- The following details will need to be provided when setting up a new account
  - First Name
  - Last Name
  - Email address
  - Phone number
  - Role
    - Super Admin (only Super Admins can add new Super Admins)
    - Admin
    - Sales Admin
- On submitting the data, the system will send an email containing the Set Password token

|<p>**Preconditions:**</p><p>- The user is authenticated as a Super Admin or Admin.</p><p>- Admin users exist within the Admin portal.</p><p></p><p>**Triggers:**</p><p>- The user selects “Add Admin” on the user management page ([6.4.2.1](#_o1c3ons46dyl)).</p><p></p><p>**Acceptance Criteria:**</p><p>- Upon selecting “Add Admin” a modal will open containing:</p><p>&emsp;- “Add New Admin” title</p><p>&emsp;- Fields for:</p><p>&emsp;&emsp;- First name</p><p>&emsp;&emsp;- Last name</p><p>&emsp;&emsp;- Email address</p><p>&emsp;&emsp;- Phone number</p><p>&emsp;&emsp;- Role</p><p>&emsp;&emsp;&emsp;- Super Admin</p><p>&emsp;&emsp;&emsp;- Admin</p><p>&emsp;&emsp;&emsp;- Sales Admin</p><p>&emsp;&emsp;&emsp;&emsp;- Only Super Admin can select “Super Admin”.</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Disabled with hover over tooltip displaying: “Only Super Admins can add other Super Admins.”</p><p>&emsp;- “Cancel” button</p><p>&emsp;&emsp;- Discards input without saving.</p><p>&emsp;- “Save” button</p><p>&emsp;&emsp;- Validates fields.</p><p>&emsp;&emsp;&emsp;- If validation fails, prevent submission and show inline errors.</p><p>&emsp;&emsp;&emsp;- If validation is successful:</p><p>&emsp;&emsp;&emsp;&emsp;- Admin user is created.</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Default status = Active.</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Show the new user in the Admin user management table ([6.4.2.1](#_o1c3ons46dyl)).</p><p>&emsp;&emsp;&emsp;&emsp;- Show success “Admin user created.”</p><p>&emsp;&emsp;&emsp;&emsp;- Returns admin to view the saved user details ([6.4.2.2](#_4wtijscn4nk6)).</p><p>&emsp;&emsp;&emsp;&emsp;- The new Admin user will receive an email to set their password. </p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Reuse existing logic for set password from trading/haulier platform (Phase 1 - 6.2.1.4 Set password).</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- After successful password reset, direct Admin users to the Admin homepage.</p><p>- Admin Set Password Email</p><p>&emsp;- Template:</p><p>&emsp;- Subject: “WasteTrade Admin - Set Your Password”</p><p>&emsp;- Body: “Hi <First Name>,<br>&emsp;  Welcome to WasteTrade. Your admin has created an account for you.</p><p>&emsp;&emsp;To get started, please set your password using this secure link.<br>&emsp;&emsp;This link does not expire. It will remain valid until you successfully set your password, after which it will be automatically invalidated.<br>&emsp;&emsp;If you didn’t expect this email, you can safely ignore it. Your account won’t be accessible until a password is set.<br>&emsp;&emsp;Best regards,<br>&emsp;&emsp;The WasteTrade Team”</p><p>&emsp;- Link:</p><p>&emsp;&emsp;- Link directs the admin to the password setup route defined in Phase 1 – 6.2.1.4.</p><p>&emsp;&emsp;- No time-based expiry; mark token “used” and invalidate immediately after successful password set.</p><p>- Permissions</p><p>&emsp;- Existing Admin users will retain Super Admin status.</p><p>&emsp;- Effective immediately after account creation.</p><p>&emsp;- Access:</p><p>&emsp;&emsp;- Super Admin: access to everything (Dashboard, User Management, Settings).</p><p>&emsp;&emsp;- Admin: access to Dashboard, User Management; no Settings.</p><p>&emsp;&emsp;- Sales Admin: Dashboard only.</p><p></p><p>**Postconditions:**</p><p>- Super Admin or Admin successfully add a new admin user, with the new admin user receiving an email to set their password.</p><p></p>|
| :- |

|**Field** |**Data Dictionary**|
| :- | :- |
|First Name|Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters. Mandatory.|
|Last Name|Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters. Mandatory.|
|Email Address|Input Type: Email; Constraints: Must include “@” Valid email format. Must be unique within the Admin platform. Mandatory.|
|Phone Number|Input Type: Text; Constraints: Numeric, Max 15 digits; Mandatory.|
|Role|Dropdown. Options: Super Admin, Admin, Sales Admin. Only Super Admin can select Super Admin. Mandatory.|

|**Use Case**|**Error Message**|
| :- | :- |
|Add new Admin modal failure to load|“Unable to load new user modal. Please try again.”|
|Missing mandatory field (generic for any field)|“Please complete all required fields.”|
|Invalid first/last name|“Enter a valid name, max 50 characters.”|
|Invalid phone number|“Enter a valid phone number (digits and +, up to 15).”|
|Invalid email format|“Please enter a valid email address.”|
|Existing email|“This email is already in use by another admin.”|
|Save failure|“We couldn’t create this user right now. Please try again. If the problem persists, contact support.”|

|**Design Name**|**Link**|
| :- | :- |
|Add new user|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21858-64558&t=TzDhDk2ScPubsQGI-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.029.png)|

|**Client Approved**|yes|
| :- | :- |
####

#### <a name="_wxs30kdt9b1u"></a><a name="_qn2to0ny2u33"></a>**6.4.2.4. Edit User Details** 
- Users will be able to edit user details.
  - Super Admins and Admins can edit the details of all users
- All users can edit their details 
  - First Name
  - Last Name
  - Phone number
- Only Super Admins can edit a user's role.
- The user will be asked to confirm the changes before exiting the “edit user details” functionality

|<p>**Preconditions:**</p><p>- The user is authenticated as a Super Admin or Admin.</p><p>- Admin users exist within the Admin portal.</p><p></p><p>**Triggers:**</p><p>- The user selects “Edit” on the user details page ([6.4.2.2](#_4wtijscn4nk6)).</p><p></p><p>**Acceptance Criteria:**</p><p>- Upon selecting “Edit” a modal will open containing:</p><p>&emsp;- “Edit Admin” title</p><p>&emsp;- Pre-filled fields for:</p><p>&emsp;&emsp;- First name</p><p>&emsp;&emsp;- Last name</p><p>&emsp;&emsp;- Email address</p><p>&emsp;&emsp;- Phone number</p><p>&emsp;&emsp;- Role</p><p>&emsp;&emsp;&emsp;- Super Admin</p><p>&emsp;&emsp;&emsp;- Admin</p><p>&emsp;&emsp;&emsp;- Sales Admin</p><p>&emsp;&emsp;&emsp;&emsp;- Only Super Admin can change an existing admin's role. </p><p>&emsp;&emsp;&emsp;&emsp;- Disabled for Admins with hover over tooltip displaying: “Only Super Admins can modify an existing user role.”</p><p>&emsp;- “Cancel” button</p><p>&emsp;&emsp;- Discards input without saving.</p><p>&emsp;- “Save” button</p><p>&emsp;&emsp;- Validates fields.</p><p>&emsp;&emsp;&emsp;- If validation fails, prevent submission and show inline errors.</p><p>&emsp;&emsp;&emsp;- If validation is successful:</p><p>&emsp;&emsp;&emsp;&emsp;- Admin user information is updated.</p><p>&emsp;&emsp;&emsp;&emsp;- Show success “Admin information updated.”</p><p>&emsp;&emsp;&emsp;&emsp;- Returns admin to view the saved user details ([6.4.2.2](#_4wtijscn4nk6)).</p><p></p><p>**Postconditions:**</p><p>- Super Admin or Admin successfully edit an admin user’s details.</p><p>&emsp;</p>|
| :- |

|**Field** |**Data Dictionary**|
| :- | :- |
|First Name|Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters. Mandatory.|
|Last Name|Input Type: Text; Support for Latin-1 Supplement, Latin Extended-A, Latin Extended B, Arabic, Cantonese Bopomofo, Mandarin, and support for special characters and punctuation,Script Constraints: Max 50 characters. Mandatory.|
|Email Address|Input Type: Email; Constraints: Must include “@” Valid email format. Must be unique within the Admin platform. Mandatory.|
|Phone Number|Input Type: Text; Constraints: Numeric, Max 15 digits; Mandatory.|
|Role|Dropdown. Options: Super Admin, Admin, Sales Admin. Only Super Admin can edit. Mandatory.|

|**Use Case**|**Error Message**|
| :- | :- |
|Edit Admin modal failure to load|“Unable to load edit user modal. Please try again.”|
|Missing mandatory field (generic for any field)|“Please complete all required fields.”|
|Invalid first/last name|“Enter a valid name, max 50 characters.”|
|Invalid phone number|“Enter a valid phone number (digits and +, up to 15).”|
|Invalid email format|“Please enter a valid email address.”|
|Existing email|“This email is already in use by another admin.”|
|Save failure|“We couldn’t save updates for this user right now. Please try again. If the problem persists, contact support.”|

|**Design Name**|**Link**|
| :- | :- |
|Edit User Details|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21858-64726&t=TzDhDk2ScPubsQGI-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.030.png)|

|**Client Approved**|yes|
| :- | :- |
####

#### <a name="_awjcx4vwz7eo"></a><a name="_xrlruj8k2ghr"></a>**6.4.2.5. Archive/Unarchive Users**
- Only Super Admins can archive/unarchive a user
- Once archived, the user will not be able to access their account until unarchived by a Super Admin
- The user will be asked to confirm the action:
  - Do you want to archive this user?
    - Yes: send an email to the user concerned. 
      - Copy to be written
    - No: return to the previous page
  - Do you want to unarchive this user?
    - ~~Yes: the user will be invited to set their password.~~ 
    - No: return to the previous page

|<p>**Preconditions:**</p><p>- The user is authenticated as a Super Admin or Admin.</p><p>- Admin users exist within the Admin portal.</p><p></p><p>**Triggers:**</p><p>- The user selects “Archive” or “Unarchive” on the user details page ([6.4.2.2](#_4wtijscn4nk6)).</p><p></p><p>**Acceptance Criteria:**</p><p>- Button Visibility</p><p>&emsp;- When viewing an “Active” user, the “Archive” button will be visible on the user details page ([6.4.2.2](#_4wtijscn4nk6)).</p><p>&emsp;- When viewing an “Archived” user, the “Unarchive” button will be visible on the user details page ([6.4.2.2](#_4wtijscn4nk6)).</p><p>- Archiving a User</p><p>&emsp;- Confirmation Dialog</p><p>&emsp;&emsp;- “Do you want to archive this user? This will remove any assignments, affected items will require re-assigning.”</p><p>&emsp;&emsp;- Cancel</p><p>&emsp;&emsp;&emsp;- Close dialogue; return to previous view with no changes.</p><p>&emsp;&emsp;- Confirm</p><p>&emsp;&emsp;&emsp;- Set status = Archived.</p><p>&emsp;&emsp;&emsp;- UI success toast: “User archived.”</p><p>&emsp;&emsp;&emsp;- Immediately revoke access:</p><p>&emsp;&emsp;&emsp;&emsp;- Block future logins.</p><p>&emsp;&emsp;&emsp;&emsp;- Invalidate active sessions/tokens for this user.</p><p>&emsp;&emsp;&emsp;&emsp;- Remove the user from the assignment dropdown/remove current assignment to items ([6.4.1.22](#_uy9gbayyajo5)).</p><p>&emsp;&emsp;&emsp;&emsp;- Send an email to the user informing them their account has been archived.</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Subject: “WasteTrade Admin - Your Account Has Been Archived”</p><p>&emsp;&emsp;&emsp;&emsp;&emsp;- Body: “Hi <First Name>,<br>&emsp;&emsp;&emsp;&emsp;&emsp;  We’re letting you know that your WasteTrade account has been archived by an administrator. While archived, you won’t be able to sign in or access the platform.<br>&emsp;&emsp;&emsp;&emsp;&emsp;  If you believe this was a mistake or have any questions, reply to this message or contact support@wastetrade.com.<br>&emsp;&emsp;&emsp;&emsp;&emsp;  Best regards,<br>&emsp;&emsp;&emsp;&emsp;&emsp;  The WasteTrade Team”</p><p>- Unarchiving a User</p><p>&emsp;- Confirmation Dialog</p><p>&emsp;&emsp;- “Do you want to archive this user?”</p><p>&emsp;&emsp;- Cancel</p><p>&emsp;&emsp;&emsp;- Close dialog; return to previous view with no changes.</p><p>&emsp;&emsp;- Confirm</p><p>&emsp;&emsp;&emsp;- Set status = Active.</p><p>&emsp;&emsp;&emsp;- UI success toast: “User unarchived. Original user credentials are now valid.”</p><p>- List & Details Behaviour</p><p>&emsp;- User management area (user table/user details) shows Status column reflecting Active/Archived.</p><p>&emsp;- Archived users remain visible to admins with the Archived status; end-users cannot access the platform.</p><p></p><p>**Postconditions:**</p><p>- Archive: User is Archived, cannot access their account, email notification sent, audit recorded.</p><p>- Unarchive: User is Active, can access admin platform using their existing credentials.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Concurrent user edits|“This user has changed since you opened it. Please refresh to review the latest version.”|
|Confirm failure|“We couldn’t update the user status right now. Please try again. If the problem persists, contact support.”|

|**Design Name**|**Link**|
| :- | :- |
|Confirm Archive|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21869-108356&t=TzDhDk2ScPubsQGI-4> <br>![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.031.png)|

|**Client Approved**||
| :- | :- |
####

### <a name="_xzoco2m0hiaz"></a><a name="_yjsqrtw9j33j"></a>~~6.4.3. Resource Content Management~~
#### <a name="_x3ghbfhguvq2"></a>**~~6.4.3.1. View all Resources~~**
- ~~The user will be able to see a master table that contains all the support resources~~
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
    - ~~Deleted~~
- ~~The user can open the details for any item by clicking on the row~~
- ~~The table will have pagination~~
- ~~The user will be able to select the number of rows per page~~
  - ~~10~~
  - ~~20~~
    - ~~Default~~
  - ~~50~~
  - ~~All~~
- ~~By default, the latest/newest content will be displayed first~~ 
- ~~The user will be able to click on any row to open the item~~

#### <a name="_a4amel5kifb5"></a>**~~6.4.3.2. Search Resources~~**
- ~~Reuses logic from [~~6.3.1.3.~~](#_ygkpzx7j8btn)~~
- ~~The user will be able to perform a search on the resources table~~
- ~~The user will be able to enter their search term in the search box~~
  - ~~Submit behaviour must also occur after the user selects “enter”.~~
  - ~~The system will search all data in the table~~
  - ~~Records will be matched by words within the article/FAQ title, question or keyword.~~
- ~~Deleted records will also be searched and displayed, but will be greyed out in the table~~\


#### <a name="_5ojgj8a60p30"></a>**~~6.4.3.3. Sort Resources~~**
- ~~The user will be able to view the “View all content” table~~
- ~~The user will be able to sort the user table on all the columns~~


#### <a name="_40mhq9jf0qqz"></a>**~~6.4.3.4. Filter Resources~~**
- ~~The user will be able to apply filters to the Resources table~~
- ~~The user will be able to filter all of the columns~~
- ~~Submit behaviour must also occur after the user selects “enter”.~~

#### <a name="_6bz50rysmp1f"></a>**~~6.4.3.5. Add a New Article~~**
- ~~The WasteTrade team will be able to add new pieces of content~~
- ~~The user will need to provide the following information:~~
  - ~~Type~~
    - ~~User guide article~~
    - ~~FAQ~~ 
  - ~~Article title~~ 
  - ~~Title image~~
    - ~~Alt text~~
  - ~~Body text~~
  - ~~Images/Videos ([~~6.4.3.7~~](#_pjdy7258dm20))~~
  - ~~Keywords~~
- ~~The user will be able to either~~
  - ~~Publish~~
  - ~~Save as draft~~
  - ~~If the user does not choose either option, they will be informed that the content will not be saved (when they try to leave the page)~~
- ~~The author will automatically be the person whose account is used to create the content.~~


#### <a name="_h3ehe3psp3ed"></a>**~~6.4.3.6. Add a New FAQ~~**
- ~~The user will be able to add a new FAQ~~
- ~~The user will need to provide the following information:~~
  - ~~Type~~
    - ~~Article~~ 
    - ~~FAQ~~ 
  - ~~Content~~
    - ~~Question (maximum 50 words)~~
    - ~~Answer (maximum 250 words)~~
    - ~~Images~~
  - ~~Keywords~~
- ~~The user will be able to either~~
  - ~~Broadcast (go-live)~~
  - ~~Save as draft~~
  - ~~If the user does not choose either option, they will be informed that the content will not be saved (when they try to leave the page)~~

#### <a name="_pjdy7258dm20"></a>**~~6.4.3.7. Add Images/Videos to Resources~~**
- ~~The user will be able to add images/videos as part of an article or FAQ~~
- ~~The user will be able to add images to articles and FAQs~~
  - ~~There will be a way for the user to position the imagery where it is needed~~
  - ~~The user will be able to resize the imagery~~
  - ~~The user will be able to upload from their device~~
    - ~~Accepted formats: JPEG, PNG, SVG, PDF~~
  - ~~The user must provide “alt text” for the images~~
- ~~The user will be able to add videos to articles~~ 
  - ~~The user will be able to select a cover photo from the video~~
  - ~~The user will be able to upload from their device~~
    - ~~Accepted formats: AVI, MP4, or MOV~~
  - ~~The user must provide “alt text” for the video~~


#### <a name="_pbazyyqy39q"></a>**~~6.4.3.8. View an Individual Resource Article/FAQ~~**
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

#### <a name="_w149b4ydlxx5"></a>**~~6.4.3.9. Edit an Individual Article/FAQ~~**
- ~~The user will be able to edit the following items~~
  - ~~Title~~
  - ~~Content~~ 
    - ~~As per the requirements defined in the Add a new Article and Add a new FAQ stories~~
    - ~~An FAQ cannot be transformed into an Article (and vice versa)~~
  - ~~If the user tries to leave the page without saving, a warning message will be shown:~~
    - ~~“Don’t forget to save your changes, or else they will be lost.”~~
      - ~~Save changes~~
        - ~~Saves changes and updates content (live or draft)~~
      - ~~Save as draft~~
        - ~~The article/FAQ will not be live in this case~~
      - ~~Discard changes~~
        - ~~No changes will be made to the live/draft content~~

#### <a name="_h5mz35rztrou"></a>**~~6.4.3.10. Delete an Article/FAQ~~**
- ~~The user will be able to delete the Article/FAQ from the Resources table or the item’s page~~
- ~~The user will be asked to confirm the deletion~~
  - ~~Yes - remove the article from the live view~~
    - ~~A draft article’s status will change to “deleted” and will not be visible unless searched for or isolated using the filters.~~

### <a name="_oyn7r0qmfljs"></a>6.4.4. Settings
#### <a name="_fyr4djpbwq6s"></a>**6.4.4.1. Create an Audit Trail**
- This is an update to existing functionality within the Admin portal; updates are highlighted in yellow.
- The capture of actions within the audit trail will be limited to remove unnecessary actions:
  - ~~Audit Trails~~
    - ~~View audit trail (/audit-trails)~~
    - ~~Export audit trail (/audit-trails/export)~~
  - Company Management
    - Manage new members (/companies/new-members)
    - Manage specific company (/companies/{id})
  - Company Documents
    - Access company documents (/company-documents)
    - ~~View personal documents (/company-documents/me)~~
    - Upload multiple files (/upload-multiple-files)
  - Company Locations
    - Manage locations (/company-locations)
  - Listing Management
    - ~~View all listings (/listings)~~
    - Manage sell listings (/listings/sell)
    - Manage wanted listings (/listings/wanted)
    - Manage user listings (/listings/user)
  - Admin review of company listings (/listings/admin/companies)
    - Manage specific listing (/listings/{id})
    - Accept listing (/listings/admin/{id}/accept)
    - Reject listing (/listings/admin/{id}/reject)
    - Request information on listing (/listings/admin/{id}/request\_information)
  - Offer Management
    - ~~View all offers (/offers)~~
    - Manage offers (/offers/admin)
  - Manage specific offer (/offers/{id})
    - Accept offer (/offers/{id}/accept or /offers/admin/{id}/accept)
    - Reject offer (/offers/{id}/reject or /offers/admin/{id}/reject)
  - User Management
    - Manage specific user (/users/admin/{id})
    - Approve user (/users/admin/{id}/approve)
  - Other
    - View listing requests (/listing-requests)
    - Login (/login)

|<p>**Scope & Preconditions:**</p><p>- Update to Create an audit trail (Phase 1 - 6.6.9.1) within the Admin portal.</p><p>- The existing audit views (list, filters, exports) remain available.</p><p></p><p>**Triggers:**</p><p>- A platform event occurs (login, create listing, approve application, etc.), and is logged in the audit trail.</p><p>- A super admin opens the Audit page.</p><p></p><p>**Acceptance Criteria:**</p><p>- Visibility</p><p>&emsp;- Currently when viewing the admin trail there is a column for “Action”.</p><p>- Phase 1 </p><p>&emsp;- Actions Catalogue</p><p>&emsp;&emsp;- The action description must be detailed enough to understand what was performed.</p><p>&emsp;&emsp;- Actions may include: login, logout, create listing, update profile, approve application, etc.</p><p>&emsp;&emsp;- A predefined list of possible actions must be maintained for consistency.</p><p>- Phase 2</p><p>&emsp;- The actions catalogue (shown in[WasteTrade Emails/Q&A](https://docs.google.com/spreadsheets/d/1u8Iu2vvNOFx4-wY9g6HXbobqzL2lxCJxPjzB94qeYOM/edit?gid=1782938586#gid=1782938586)) must be refined to remove unnecessary or irrelevant actions, relating to viewing.</p><p>&emsp;&emsp;- “View” actions are not needed.</p><p>&emsp;&emsp;- See Struck-through actions within the Action Log sheet for actions to be removed.</p><p>- Historical Records</p><p>&emsp;- Existing entries for deprecated actions remain visible, searchable, and exportable.</p><p>**Postconditions:**</p><p>- No new audit entries are created for deprecated (removed) actions.</p><p>- Admin can view a concise audit trail.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Network issues during interaction|"Network error detected. Please check your connection and try again."|

|**Design Name**|**Link**|
| :- | :- |
|Audit trail|<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21870-108445&t=TzDhDk2ScPubsQGI-4> ![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.032.png)|

|**Client Approved**|yes|
| :- | :- |
####
####
#### <a name="_fpksbii2j132"></a><a name="_aoey6urpzy1v"></a><a name="_pcghs353mrt0"></a>**6.4.4.2. Enhanced Filter Audit Trail**
- This is an update to existing functionality within the Admin portal: updates are highlighted in yellow.
- Audit Access:
  - Super Admins can access an ‘Audit’ area via settings to download audit logs within the system.
  - The settings page will include an ‘Audit Download’ section with functionality to filter and download an audit CSV.
- Download Functionality:
  - The system must allow the user to download the audit trail in CSV format.
  - The CSV file must include all logged actions with the following details:
    - Timestamp
    - Name of User
    - Type (WasteTrade, Trader, Haulier)
    - Organisation
    - Role of User
    - Action
- Filter Options:
  - The user must be able to apply the following filters before downloading audit trail:
    - Date Range: Users can select a start date and an end date to filter the logs within that specific range.
    - User: Users can filter the logs by a specific user.
    - Organisation: Users can filter the logs by a specific organisation.
    - Role: Users can filter the logs by a specific role (e.g., Super Admin, Admin, Buyer, Seller).
    - Action: Users can filter the logs by a specific action.
- Date Range Filter:
  - The date range filter must allow users to select both start and end dates.
  - The system must validate that the end date is not earlier than the start date.
- User Filter:
  - The user filter must provide a searchable dropdown list of all users who have performed actions in the system.
- Organisation Filter:
  - The organisation filter must provide a searchable dropdown list of all organisations recorded in the audit trail.
- Role Filter:
  - The role filter must provide a dropdown list of predefined roles available in the system (e.g., Super Admin, Admin, Buyer, Seller).
- Action Filter:
  - The action filter must provide a searchable dropdown list of predefined actions:
    - Company Management
      - Manage new members (/companies/new-members)
      - Manage specific company (/companies/{id})
    - Company Documents
      - Access company documents (/company-documents)
    - Company Locations
      - Manage locations (/company-locations)
    - Listing Management
      - Manage sell listings (/listings/sell)
      - Manage wanted listings (/listings/wanted)
      - Manage user listings (/listings/user)
    - Admin review of company listings (/listings/admin/companies)
      - Manage specific listing (/listings/{id})
      - Accept listing (/listings/admin/{id}/accept)
      - Reject listing (/listings/admin/{id}/reject)
      - Request information on listing (/listings/admin/{id}/request\_information)
    - Offer Management
      - Manage offers (/offers/admin)
    - Manage specific offer (/offers/{id})
      - Accept offer (/offers/{id}/accept or /offers/admin/{id}/accept)
      - Reject offer (/offers/{id}/reject or /offers/admin/{id}/reject)
    - User Management
      - Manage specific user (/users/admin/{id})
      - Approve user (/users/admin/{id}/approve)
    - Other
      - View listing requests (/listing-requests)
      - Login (/login)
      - Upload multiple files (/upload-multiple-files)

|<p>**Scope & Preconditions:**</p><p>- Update to Create an audit trail (Phase 1 - 6.6.9.1) within the Admin portal.</p><p>- The existing audit views (list, filters, exports) remain available.</p><p></p><p>**Triggers:**</p><p>- A platform event occurs (login, create listing, approve application, etc.), and is logged in the audit trail.</p><p>- An admin opens the Audit page.</p><p></p><p>**Acceptance Criteria:**</p><p>- Phase 1</p><p>&emsp;- Currently the admin can filter by:</p><p>&emsp;&emsp;- Date Range</p><p>&emsp;&emsp;- User</p><p>&emsp;&emsp;- Organisation</p><p>&emsp;&emsp;- Role</p><p>- Phase 2</p><p>&emsp;- This will be expanded to allow filtering by Action.</p><p>&emsp;&emsp;- The pre-defined actions list ([6.4.4.1](#_fyr4djpbwq6s)) will be shown as a dropdown.</p><p>&emsp;&emsp;&emsp;- There will also be an option for “All”</p><p>&emsp;&emsp;&emsp;&emsp;- Default selection.</p><p>&emsp;&emsp;- Admin can select an action from the list.</p><p>&emsp;- Existing filter behaviour will remain unchanged.</p><p></p><p>**Postconditions:**</p><p>- Admin can filter the audit trail by action.</p><p></p>|
| :- |

|**Field** |**Data Dictionary**|
| :- | :- |
|Action|Input Type: Dropdown. Options: Predefined list of actions. Single selection. Optional.|

|**Use Case**|**Error Message**|
| :- | :- |
|Network issues during interaction|"Network error detected. Please check your connection and try again."|
|Filtering operation fails|“Filtering failed. Please try again later.”|

|**Design Name**|**Link**|
| :- | :- |
|Audit Trail|![](Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.033.png)<https://www.figma.com/design/ncEIM81RwXqqXblFav5iYV/B13-WT---Phase-2?node-id=21675-67788&t=agaM0kh6K9gZbJyL-4> |

|**Client Approved**|Yes|
| :- | :- |
####


#### <a name="_qim7if1avcn"></a><a name="_76d9oli5t174"></a>**~~6.4.4.3. Define PERN~~**
- ~~Within settings, admins will be able to globally set the PERN value, the PERN Margin and the exchange rate margin.~~
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
- ~~The global PERN value will feed back into the WasteTrade Price Calculator for updated calculation ([~~7.1.0.4~~](#_ybh4j8lp0w1m)).~~

#### <a name="_nfl13neomwew"></a>**~~6.4.4.4. View Price Calculator~~**
- ~~Within settings, admins will be able to view the integrated price calculator.~~

#### <a name="_8pcrhgfghu8q"></a>**~~6.4.4.5. Edit Terms & Conditions/Privacy Policy~~**
- ~~As a Super Admin, I want to edit the single source of truth for the site’s Terms & Conditions and Privacy Policy.~~
- ~~Within settings, there will be a “Legal” section with two “Manage” buttons~~
  - ~~“Manage Terms & Conditions”~~
  - ~~“Manage Privacy Policy”~~
- ~~Selecting one of the buttons opens a rich-text editor~~
  - ~~Displays the current version by default.~~
  - ~~Super Admin can edit the text content.~~
- ~~There will be a confirmation modal for users to “Save” or “Discard Changes”~~
- ~~Upon “Save”, links to T&Cs and Privacy Policy always render the latest version.~~

## <a name="_gx05pclx5dm4"></a>**6.5. Salesforce Integration**
### <a name="_iko6sn1rhn9t"></a>6.5.1. Data Exchange
#### <a name="_vbckz6le2nu7"></a>**6.5.1.1. Push Haulier Data**
- The system will push all the Haulier data captured during the onboarding process into a CRM, ensuring there is no duplication of effort in customer relationship management.
- The following data will be pushed:
  - Onboarding data
  - Organisational details
  - Commercial activity
- The data to be captured and pushed includes:
  - Onboarding data
    - Pushed to SF as a Lead on Registration
    - Individual info updated in SF to a Contact upon Verification
    - Company info updated in SF to an Account upon Verification
  - Organisational details
  - Commercial activity
    - Including Sales and wanted listings
  - Transactional records (included within commercial activity)
- Data to be mapped according to [WT Salesforce CRM data](https://docs.google.com/spreadsheets/d/1INMdcIWUkvxOB13M2xrz5qCVZsq8xSGlrX-6ioFHQfo/edit?gid=917272669#gid=917272669)

- Must also reflect that accepting a haulage offer then generates Load Details 
  - Visible to hauliers via their offer details (6.2.3.2)
  - *SHOULD be visible to traders, not sure if thats defined for P1*
  - Visible to admins via offer details
- When accepted, the system should push load IDs to SF.
- Admins can input info within SF relevant to the load (collected/pickup confirmed, relevant pickup docs per load, mark load as shipped)
  - Collection date
  - Shipped date 
  - Gross weight
  - Pallet weight
- Displayed in load details

|<p>As a system, I want to synchronise Haulier onboarding and verification data between WasteTrade and Salesforce so that both systems hold accurate and consistent information without manual duplication. WasteTrade must push data to Salesforce when events occur and be able to receive inbound pushes from Salesforce when CRM-side updates are made to the same mapped entities.</p><p>This story covers the synchronisation of Haulier registration and verification data between WasteTrade and Salesforce. It includes:</p><p>- Outbound pushes from WasteTrade to Salesforce (Lead creation and conversion).</p><p>- Inbound pushes from Salesforce to WasteTrade (updates to mapped fields).</p><p>- There is no pull or polling from either system.</p><p></p><p>**Preconditions:**</p><p>- Salesforce integration credentials and endpoints are configured and authenticated.</p><p>- The WT Salesforce CRM data mapping is approved and the target fields exist in both systems.</p><p>- Phase 1 Registration and Verification workflows are operational.</p><p>- Both systems expose approved endpoints for secure inbound pushes.</p><p></p><p>**Triggers:**</p><p>- **Registration submitted (Stage 1) in WasteTrade → Upsert Lead in Salesforce.**</p><p>- **Verification completed in WasteTrade → Convert Lead to Account + Contact in Salesforce.**</p><p>- **Authorised update in Salesforce to mapped Haulier fields → Salesforce initiates inbound push to WasteTrade for the corresponding record.**</p><p></p><p>**Acceptance Criteria:**</p><p>- WasteTrade → Salesforce (Outbound)</p><p>&emsp;- **When a Haulier submits registration, WasteTrade sends a payload to Salesforce to create or update a Lead using fields defined in the schema sheet.**</p><p>&emsp;- **Deduplication: match on Email, then Company Name (case-insensitive). If found, update the existing Lead; if not found, create a new Lead.**</p><p>&emsp;- **The WasteTrade User ID is included in the payload so Salesforce can link subsequent records automatically.**</p><p>&emsp;- **WT nulls do not clear SF values.**</p><p>&emsp;- **Upon verification, WasteTrade triggers a Lead Conversion in Salesforce. Salesforce creates or updates the linked Account and Contact using native duplicate rules.**</p><p>&emsp;- **The WasteTrade User ID is written to the resulting Account and Contact.**</p><p>&emsp;- **WasteTrade stores the returned Salesforce IDs (Lead, Account, Contact) for future synchronisation.**</p><p>- Salesforce → WasteTrade (Inbound Push)</p><p>&emsp;- **When an authorised Salesforce user updates mapped Haulier fields (as defined in the schema), Salesforce pushes the change to WasteTrade via a secure API endpoint.**</p><p>&emsp;- **WasteTrade validates the inbound payload against the approved schema version and confirms matching IDs (Salesforce ID or WasteTrade User ID).**</p><p>&emsp;- **If valid, WasteTrade updates the relevant fields and records the change timestamp.**</p><p>&emsp;- **If validation fails (e.g. schema mismatch, missing ID, unauthorised source, or unsupported field), the change is rejected, logged, and returned to Salesforce with an error response.**</p><p>&emsp;- **WasteTrade does not poll Salesforce or import data on a schedule. All inbound updates must originate from Salesforce pushes.**</p><p>- Field Mapping</p><p>- Only fields defined in the [WT Salesforce CRM data](https://docs.google.com/spreadsheets/d/1INMdcIWUkvxOB13M2xrz5qCVZsq8xSGlrX-6ioFHQfo/edit?gid=1428329366#gid=1428329366) mapping are synchronised.</p><p>- Field names, data types, and object relationships must exactly match the approved mapping.</p><p>- The integration is built against the approved version of the mapping at the time of this work package.</p><p>- Any later change to the mapping or Salesforce schema will require review and may be delivered only through a separate change request.</p><p>- Inbound field constraints: Only fields marked as inbound-writable in the mapping are accepted from Salesforce. Attempts to update WasteTrade-only or computed fields are rejected with HTTP 400 “field\_not\_writable\_from\_sf”.</p><p>- Data Ownership and Direction of Data</p><p>&emsp;- **Data flow is push-based in both directions.**</p><p>&emsp;- WasteTrade remains authoritative for onboarding and verification data.</p><p>&emsp;- Salesforce remains authoritative for CRM-only data.</p><p>&emsp;- When both systems hold the same mapped field, the latest push (by timestamp) prevails.</p><p>&emsp;- There is no pull behaviour.</p><p>&emsp;- Edits made in Salesforce to WasteTrade-authoritative fields are accepted only through an authorised push.</p><p>&emsp;- Outbound pushes from WasteTrade carry an origin marker. Inbound pushes containing the same marker are ignored to prevent update loops.</p><p>- Logging and Monitoring</p><p>&emsp;- Every outbound and inbound push is recorded in a server-side integration log with:</p><p>&emsp;&emsp;- Timestamp</p><p>&emsp;&emsp;- Direction (Outbound or Inbound)</p><p>&emsp;&emsp;- Object type (Lead / Account / Contact)</p><p>&emsp;&emsp;- WasteTrade record ID and Salesforce ID</p><p>&emsp;&emsp;- Operation type (create / update / conversion)</p><p>&emsp;&emsp;- Result (success / failed with reason)</p><p>&emsp;- Logs are retained for a minimum of 12 months.</p><p>&emsp;- Personally identifiable information (PII) values are not stored in logs beyond what is necessary to diagnose issues.</p><p>&emsp;- No user-facing UI or manual controls are introduced.</p><p>- Error Handling and Retries</p><p>&emsp;- Outbound (WasteTrade → Salesforce)</p><p>&emsp;&emsp;- Transient errors (timeouts, API unavailability): retried automatically up to three times with exponential back-off.</p><p>&emsp;&emsp;- Rate limiting (HTTP 429): WasteTrade honours the Retry-After header where present and retries within the same attempt limit.</p><p>&emsp;&emsp;- Persistent errors (invalid data, schema mismatch): logged as “Push Failed” with payload reference. No manual re-push function.</p><p>&emsp;&emsp;- Partial conversion failure: If Lead conversion succeeds but Account or Contact update fails, the event is logged with both IDs and Salesforce’s error message.</p><p>&emsp;- Inbound (Salesforce → WasteTrade)</p><p>&emsp;&emsp;- Authentication or authorisation failure: WasteTrade responds 401 / 403 with error body; no data is changed.</p><p>&emsp;&emsp;- Schema or version mismatch: WasteTrade responds 400 “mapping\_version\_unsupported”; the payload reference is logged.</p><p>&emsp;&emsp;- Field not writable: WasteTrade responds 400 “field\_not\_writable\_from\_sf”.</p><p>&emsp;&emsp;- Stale or out-of-order events: Inbound payloads include LastModifiedDate; updates are applied only if newer than WasteTrade’s stored timestamp. Older events are discarded and logged as “stale\_event”.</p><p>&emsp;&emsp;- Inbound idempotency: Repeated inbound pushes with identical record IDs and unchanged values perform no update and are logged as “duplicate\_event”.</p><p>&emsp;&emsp;- Outbound retry collisions: If a concurrent WasteTrade push occurs for the same record, the later timestamp wins per last-update-wins logic.</p><p>- Non-Functional Constraints</p><p>&emsp;- All communication uses OAuth 2.0 over HTTPS (TLS 1.2+).</p><p>&emsp;- Integration credentials are stored securely via the existing secret-management system.</p><p>&emsp;- Only mapped fields are transmitted, ensuring compliance with UK GDPR and WasteTrade’s Data Protection Policy.</p><p>&emsp;- Logs and payloads are accessible only to authorised system administrators and developers.</p><p>- Success Criteria</p><p>&emsp;- Each submitted registration in WasteTrade creates or updates a single Salesforce Lead without duplication.</p><p>&emsp;- Each verified Haulier in WasteTrade converts to an Account and Contact in Salesforce, correctly linked and containing the WasteTrade User ID.</p><p>&emsp;- Salesforce-originated updates to mapped fields are successfully received and processed in WasteTrade.</p><p>&emsp;- Out-of-order, duplicate, unauthorised, or invalid inbound pushes are safely rejected and logged.</p><p>&emsp;- No duplicate or orphaned records exist in either system.</p><p>&emsp;- Integration logs provide full traceability of outbound and inbound events.</p><p>&emsp;- No polling, scheduled import, or manual re-push interface exists; all synchronisation is event-driven.</p><p>- Boundaries of this User Story</p><p>&emsp;- Covers the bidirectional push-based exchange of Haulier registration and verification data between WasteTrade and Salesforce.</p><p>&emsp;- Does not include transactional data (Listings, Offers, Loads) or any new UI functionality.</p><p>&emsp;- Establishes the foundations for consistent event-driven synchronisation without continuous background polling.</p>|
| :- |

|**Client Approved**|Yes|
| :- | :- |
####
#### <a name="_h39k39bo366x"></a><a name="_t56qqzwd1ppv"></a>**6.5.1.2. Basic User Management**
- The WasteTrade team will be able to use the CRM to update 
  - View all user details (regardless of verification status)
  - Edit individual profile fields
  - View/edit account status

|<p>As a system, I want WasteTrade and Salesforce to stay aligned on user information (including Haulier, Buyer, and Seller company and contact data) so that changes made by authorised users in either system are reflected accurately in the other, without duplication, delay, or manual intervention. The integration must operate by *push and receive push* only — there is no polling or pull behaviour.</p><p>This story covers the synchronisation of user and company (Account and Contact) data between WasteTrade and Salesforce for users who have completed registration and verification.<br>` `It includes:</p><p>- Outbound pushes from WasteTrade to Salesforce when mapped user data is added or updated.</p><p>- Inbound pushes from Salesforce to WasteTrade when mapped fields are changed in Salesforce.</p><p>- There is no scheduled import or pull operation.</p><p>**Preconditions:**</p><p>- Salesforce integration and authentication are configured.</p><p>- The WT Salesforce CRM data mapping is approved and defines which fields are synchronised and which are read-only in each system.</p><p>- All Lead → Account and Contact conversions are complete (from [6.5.1.1](#_vbckz6le2nu7)).</p><p>- Salesforce and WasteTrade both maintain a LastModifiedDate (Salesforce) or updated\_at (WasteTrade) timestamp for synchronised records.</p><p>- Both systems can accept authorised inbound pushes at secure endpoints.</p><p>**Triggers:**</p><p>- User or organisation details updated in WasteTrade (e.g. contact name, company name, address, phone, VAT number, approved materials) → Outbound push to Salesforce.</p><p>- Mapped field updated in Salesforce (e.g. CRM-side user or company field) → Inbound push to WasteTrade.</p><p>- Account or Contact status changes (e.g. Active / Inactive / Archived) in either system → corresponding push to the other system.</p><p>**Acceptance Criteria:**</p><p>- WasteTrade → Salesforce (Outbound Push)</p><p>&emsp;- When a mapped field on an Account or Contact is changed in WasteTrade, the system automatically pushes the updated data to Salesforce via API.</p><p>&emsp;- Only fields marked as outbound or bidirectional in the schema sheet are included.</p><p>&emsp;- Pushes include the WasteTrade User ID, Salesforce ID (if available), and updated\_at timestamp.</p><p>&emsp;- If Salesforce record IDs are missing, WasteTrade performs a one-time lookup by WasteTrade User ID or email to re-establish linkage.</p><p>&emsp;- Null values in WasteTrade do not clear existing values in Salesforce.</p><p>&emsp;- WasteTrade sends the most recent data for all updated fields in a single payload to minimise multiple calls.</p><p>- ` `Salesforce → WasteTrade (Inbound Push)</p><p>&emsp;- When an authorised Salesforce user edits a mapped field, Salesforce pushes the change to WasteTrade through a secure endpoint.</p><p>&emsp;- WasteTrade validates:</p><p>&emsp;&emsp;- Authentication and authorisation of the sender.</p><p>&emsp;&emsp;- Payload structure and version match to the approved schema.</p><p>&emsp;&emsp;- The record exists and is correctly linked via WasteTrade User ID or Salesforce ID.</p><p>&emsp;- If validation passes, the corresponding WasteTrade record is updated.</p><p>&emsp;- If validation fails (invalid token, unsupported field, invalid mapping version, etc.), the change is rejected and logged.</p><p>&emsp;- WasteTrade never polls Salesforce; all updates are event-driven inbound pushes.</p><p>- Field Mapping</p><p>&emsp;- Only fields defined in the [WT Salesforce CRM data](https://docs.google.com/spreadsheets/d/1INMdcIWUkvxOB13M2xrz5qCVZsq8xSGlrX-6ioFHQfo/edit?gid=1428329366#gid=1428329366) mapping are synchronised.</p><p>&emsp;- Field names, data types, and object relationships must match exactly.</p><p>&emsp;- The integration is built against the approved mapping version at the time of this work package.</p><p>&emsp;- Any later mapping or schema change will require review and may be subject to a change request.</p><p>- Directionality:</p><p>&emsp;- Fields are bidirectional push unless otherwise specified:</p><p>&emsp;&emsp;- Fields may be flagged as WT→SF, SF→WT.</p><p>&emsp;- WasteTrade rejects inbound updates to fields not designated as inbound-writable.</p><p>- Data Ownership and Direction of Data</p><p>&emsp;- Data flows only through push events, never through background polling or scheduled syncs.</p><p>&emsp;- WasteTrade is authoritative for operational and onboarding fields.</p><p>&emsp;- Salesforce is authoritative for CRM-only fields.</p><p>&emsp;- For bidirectional fields, the last update wins, based on updated\_at (WasteTrade) or LastModifiedDate (Salesforce).</p><p>&emsp;- Each outbound payload from either system carries an origin marker; inbound pushes containing the same marker are ignored to prevent loops.</p><p>&emsp;- Inbound events older than the last applied timestamp are discarded as stale.</p><p>- Logging and Monitoring</p><p>&emsp;- Every inbound and outbound push is recorded in the server-side integration log, capturing:</p><p>&emsp;&emsp;- Timestamp</p><p>&emsp;&emsp;- Direction (Outbound or Inbound)</p><p>&emsp;&emsp;- Object type (Account or Contact)</p><p>&emsp;&emsp;- Record IDs (WasteTrade and Salesforce)</p><p>&emsp;&emsp;- Fields updated</p><p>&emsp;&emsp;- Operation result (success / failed with reason)</p><p>&emsp;- Logs are retained for a minimum of 12 months.</p><p>&emsp;- PII values are redacted or masked in logs except where required for debugging.</p><p>&emsp;- There is no new user interface or manual synchronisation control.</p><p>- Error Handling and Retries</p><p>&emsp;- Outbound (WasteTrade → Salesforce)</p><p>&emsp;&emsp;- Transient errors (network timeout, API unavailable): retried up to three times with exponential back-off.</p><p>&emsp;&emsp;- Rate limiting (HTTP 429): system honours Salesforce Retry-After header before retrying.</p><p>&emsp;&emsp;- Validation or mapping errors: logged as “Push Failed” with the payload reference and error code.</p><p>&emsp;&emsp;- Partial failure: if some fields fail validation while others succeed, successful updates are applied; failed fields are logged individually.</p><p>&emsp;&emsp;- Duplicate payloads: handled idempotently - resending identical data does not apply changes.</p><p>- Inbound (Salesforce → WasteTrade)</p><p>&emsp;- Authentication or authorisation failure: 401 / 403 returned with error body; no data modified.</p><p>&emsp;- Schema or mapping mismatch: 400 “mapping\_version\_unsupported”.</p><p>&emsp;- Field not writable: 400 “field\_not\_writable\_from\_sf”.</p><p>&emsp;- Stale event: 409 “stale\_event” returned when inbound data is older than existing record.</p><p>&emsp;- Duplicate event: logged as “duplicate\_event”; no change applied.</p><p>&emsp;- Invalid record reference: 404 “record\_not\_found” returned if ID matching fails.</p><p>&emsp;- Out-of-order or concurrent updates: handled by timestamp; latest update wins.</p><p>&emsp;- Origin marker loop: inbound pushes with a matching outbound origin marker are ignored to prevent sync loops.</p><p>- Non-Functional Constraints</p><p>&emsp;- All communication uses OAuth 2.0 over HTTPS (TLS 1.2+).</p><p>&emsp;- Integration credentials are stored via WasteTrade’s secure secret-management system.</p><p>&emsp;- Payloads contain only mapped fields, ensuring UK GDPR compliance and adherence to the Data Protection Policy.</p><p>&emsp;- Both systems must maintain UTC-aligned timestamps to avoid conflicts in last-update comparisons.</p><p>&emsp;- Logs and credentials are accessible only to authorised personnel.</p><p>- Success Criteria</p><p>&emsp;- Updates made to mapped user or company data in WasteTrade appear correctly in Salesforce within near real-time, without duplication or overwriting CRM-only data.</p><p>&emsp;- Updates made to mapped fields in Salesforce appear correctly in WasteTrade via inbound push.</p><p>&emsp;- Both systems remain synchronised for all mapped bidirectional fields under the push-only model.</p><p>&emsp;- Transient failures recover automatically; invalid or unauthorised pushes are safely rejected.</p><p>&emsp;- No polling, background import, or manual re-push is required.</p><p>&emsp;- Integration logs confirm successful processing or recorded rejection of all pushes, inbound and outbound.</p><p>- Boundaries of this User Story</p><p>&emsp;- Covers synchronisation of mapped Account and Contact data between WasteTrade and Salesforce.</p><p>&emsp;- Includes both outbound pushes and inbound push handling.</p><p>&emsp;- Does not include transactional data (Listings, Offers, Loads) or new user interfaces.</p><p>&emsp;- Establishes stable, push-driven alignment of user and organisation information across both systems.</p>|
| :- |

|**Client Approved**|Yes|
| :- | :- |

#### <a name="_ikujb8r2rk23"></a>**6.5.1.3. Expanded User Management** 
- The WasteTrade team will be able to use the CRM to:
  - Approve members
  - Reject members
  - Ask for more information 
    - The Platform users (Trading/Haulier) will be informed on the portalThe WasteTrade team will be able to use the CRM to:
      - Approve members
      - Reject members
      - Ask for more information 
        - The Platform users (Trading/Haulier) will be informed on the portal

|<p>As a system, I want WasteTrade and Salesforce to remain aligned on expanded user and organisation data, and I want a Salesforce approval action to trigger the same WasteTrade approval flow as if a WT Admin had approved in the platform, so that operational and CRM teams can work in either system without duplication or divergence.</p><p>This story covers:</p><p>- Synchronisation of expanded mapped Account and Contact fields between WasteTrade and Salesforce by push and receive push only.</p><p>- A Salesforce flow or button (built in Salesforce, out of scope for B13) that, when used by a Salesforce user, pushes an approval instruction to WasteTrade, which then runs the existing WT approval flow and outcomes.</p><p>- There is no pull or polling in either direction.</p><p>**Preconditions:**</p><p>- Salesforce integration is configured and authenticated.</p><p>- The WT Salesforce CRM data mapping defines the expanded fields and their directionality.</p><p>- Records from registration and verification already exist and are linked (Lead → Account and Contact) as per [6.5.1.1.](#_vbckz6le2nu7)</p><p>- WasteTrade and Salesforce store UTC timestamps for change detection.</p><p>- WasteTrade exposes a secure inbound endpoint for Salesforce pushes, including the approval instruction. Salesforce exposes a secure endpoint for WT outbound pushes.</p><p>- The Salesforce approval UI and flow are implemented in Salesforce by the client team, not by B13. WasteTrade only receives and processes the inbound approval instruction.</p><p>**Triggers:**</p><p>- Expanded mapped field updated in WasteTrade → Outbound push to Salesforce.</p><p>- Expanded mapped field updated in Salesforce → Inbound push to WasteTrade.</p><p>- Salesforce user clicks Approve in Salesforce flow → Salesforce sends an approval instruction to WasteTrade to approve the user in WT and progress the existing approval workflow.</p><p>**Acceptance Criteria:**</p><p>- System Behaviour</p><p>&emsp;- WasteTrade → Salesforce (Outbound push)</p><p>&emsp;&emsp;- On change to any mapped expanded field, WasteTrade pushes the update to Salesforce with record IDs, the WasteTrade User ID, and the WT updated\_at timestamp.</p><p>&emsp;&emsp;- Only fields flagged outbound or bidirectional in the schema are included. Nulls in WT do not clear populated Salesforce fields.</p><p>&emsp;&emsp;- If a Salesforce ID is missing, a one-time lookup by WasteTrade User ID re-establishes linkage; if unresolved, the event is logged as a link not found.</p><p>&emsp;- Salesforce → WasteTrade (Inbound push, data updates)</p><p>&emsp;&emsp;- When authorised Salesforce users update mapped fields, Salesforce pushes the change to WasteTrade.</p><p>&emsp;&emsp;- WasteTrade validates authentication, schema version, directionality, record linkage, and timestamp.</p><p>&emsp;&emsp;- If valid and newer, WasteTrade applies the change and records the timestamp. Older events are rejected as stale.</p><p>&emsp;&emsp;- WasteTrade does not poll Salesforce.</p><p>&emsp;- Salesforce → WasteTrade (Inbound push, approval instruction)</p><p>&emsp;&emsp;- When a Salesforce user approves a user via the Salesforce flow, Salesforce sends an approval instruction payload to WasteTrade, including:</p><p>&emsp;&emsp;&emsp;- Target record identifiers (Salesforce Account/Contact IDs and the WasteTrade User ID)</p><p>&emsp;&emsp;&emsp;- Action type, for example approve\_user</p><p>&emsp;&emsp;&emsp;- Optional context fields defined in the mapping for approvals (for example, reason, approver identity, timestamp), if present in the mapping sheet</p><p>&emsp;&emsp;- WasteTrade validates the instruction and, on success, executes the existing WT approval workflow exactly as if a WT Admin approved in the Admin Portal, updating statuses, writing audit entries, and triggering any existing WT notifications and downstream effects.</p><p>&emsp;&emsp;- Following a successful approval in WT, WasteTrade performs its standard outbound push of the resulting mapped fields and statuses to Salesforce under this story’s rules and the mapping sheet.</p><p>&emsp;&emsp;- If the user is already approved, the operation is treated as idempotent and no changes are applied.</p><p>- Field Mapping</p><p>&emsp;- Only fields defined in the [WT Salesforce CRM data](https://docs.google.com/spreadsheets/d/1INMdcIWUkvxOB13M2xrz5qCVZsq8xSGlrX-6ioFHQfo/edit?gid=1428329366#gid=1428329366) mapping are synchronised or accepted. The mapping is the single source of truth.</p><p>&emsp;- Directionality per field is enforced. Fields not marked inbound-writable are rejected on inbound pushes.</p><p>&emsp;- The integration is built against the approved mapping version for this work package. Later changes to mapping or schema require review and may be subject to a change request.</p><p>- Data Ownership and Direction of Data</p><p>&emsp;- Synchronisation is push-based only in both directions.</p><p>&emsp;- WasteTrade remains authoritative for operational and onboarding fields; Salesforce is authoritative for CRM-only fields.</p><p>&emsp;- For bidirectional fields, the last update wins by timestamp.</p><p>&emsp;- Outbound pushes include an origin marker; inbound pushes that carry the same marker are ignored to prevent loops.</p><p>&emsp;- Listings, bids and transactions are not editable in Salesforce and do not flow back to WasteTrade as edits.</p><p>- Logging and Monitoring</p><p>&emsp;- Every inbound and outbound event is written to the server-side integration log, capturing: timestamp, direction, object, record IDs, fields or action type, and result.</p><p>&emsp;- PII values are masked in logs except where required for diagnosis.</p><p>&emsp;- No new front-end UI is introduced.</p><p>&emsp;- Error Handling and Retries</p><p>- Outbound (WasteTrade → Salesforce)</p><p>&emsp;- Transient errors and HTTP 429 are retried up to three times with exponential back-off, honouring Retry-After if present.</p><p>&emsp;- Validation or mapping errors are logged as Push Failed with a payload reference.</p><p>&emsp;- Partial success is recorded with successful fields applied and failed fields logged.</p><p>- Inbound data update (Salesforce → WasteTrade)</p><p>&emsp;- Unauthenticated or unauthorised: 401/403, no change.</p><p>&emsp;- Schema or mapping version mismatch: 400 mapping\_version\_unsupported.</p><p>&emsp;- Field not inbound-writable: 400 field\_not\_writable\_from\_sf.</p><p>&emsp;- Record not found by IDs: 404 record\_not\_found.</p><p>&emsp;- Stale event: 409 stale\_event if timestamp is older than stored value.</p><p>&emsp;- Duplicate event: no-op, logged as duplicate\_event.</p><p>&emsp;- Loop detection: inbound carrying the WT origin marker is ignored.</p><p>&emsp;- Inbound approval instruction (Salesforce → WasteTrade)</p><p>&emsp;- Unauthenticated or unauthorised: 401/403, instruction rejected.</p><p>&emsp;- Invalid or incomplete identifiers: 404 record\_not\_found.</p><p>&emsp;- Unsupported action type or not present in mapping: 400 unsupported\_action.</p><p>&emsp;- State conflict, for example user already approved or in a state that blocks approval: 409 invalid\_state.</p><p>&emsp;- Stale instruction: 409 stale\_event if the instruction timestamp precedes a later WT change.</p><p>&emsp;- On success, WT executes the native approval workflow and returns a success response including the resulting status for audit.</p><p>- Non-Functional Constraints</p><p>&emsp;- OAuth 2.0 over HTTPS (TLS 1.2+).</p><p>&emsp;- Secrets stored in the existing secret-management system.</p><p>&emsp;- Only mapped fields are transmitted. Processing complies with UK GDPR and the WasteTrade Data Protection Policy.</p><p>- Success Criteria</p><p>&emsp;- Expanded mapped fields remain aligned between WasteTrade and Salesforce without duplication.</p><p>&emsp;- A Salesforce approval action results in the user being approved in WasteTrade using the existing WT approval workflow, with all standard WT side-effects and audit preserved.</p><p>&emsp;- Resulting state changes are pushed back to Salesforce according to the mapping.</p><p>&emsp;- Invalid, stale, duplicate or unauthorised inbound events are safely rejected and logged.</p><p>&emsp;- No polling exists. All exchanges are event-driven pushes.</p><p>&emsp;- Integration logs provide full traceability of both data updates and approval instructions.</p>|
| :- |

|**Client Approved**|Yes|
| :- | :- |

####
#### <a name="_himq6x22ljua"></a><a name="_smaw5qyy8ww1"></a>**6.5.1.4. Listing/Bid Management** 
- All status-related information will be pushed into the CRM
  - Buyer details
  - Seller details 
  - Material details 
  - Bid details 
- Managing Sales Listings:
  - All sales listing-related information will be pushed into the CRM
    - Seller details 
    - Material details 
    - Bid status
- Managing Wanted Listings:
  - All wanted listings related information will be pushed into the CRM
    - Buyer details 
    - Material required 
    - Listing status 
- Managing Haulage Bids:
  - All haulage bid-related information will be pushed into the CRM
    - Buyer details 
    - Seller details 
    - Material details 
    - Bid details

|<p>As a system, I want WasteTrade and Salesforce to remain synchronised for Listings, Bids, Offers, and Load activity so that the CRM reflects the current commercial state of each transaction while WasteTrade retains operational control and record ownership. Synchronisation must be fully event-driven using push and receive-push behaviour, with no polling or pull mechanisms.</p><p>- This story covers bid, listing, offer, and load data exchange between WasteTrade and Salesforce.<br>  ` `It includes:</p><p>- Outbound pushes from WasteTrade to Salesforce when Listings, Bids, Offers, or Loads are created or updated.</p><p>- Inbound pushes from Salesforce to WasteTrade when authorised status changes occur in Salesforce (for example, Offer Accepted, Load Completed).</p><p>- It excludes any editing or creation of listings directly in Salesforce. Salesforce acts as a reporting and CRM interface, not an operational system.</p><p>**Preconditions:**</p><p>- Salesforce integration and authentication are configured.</p><p>- The WT Salesforce CRM data mapping defines all fields for Listings, Bids, Offers, and Loads, including data direction (WT→SF or Bi).</p><p>- WasteTrade maintains stable identifiers for Listing ID, Bid ID, Offer ID, and Load ID.</p><p>- WasteTrade has valid Account and Contact linkages for both Buyer and Seller (from [6.5.1.1](#_vbckz6le2nu7)–[6.5.1.3](#_wfjhmy9e3ad0)).</p><p>- Salesforce objects and relationships are established in accordance with the mapping sheet (for example, Listing linked to Account).</p><p>- Secure inbound endpoints are available for Salesforce pushes.</p><p>**Triggers:**</p><p>- Listing or Bid created or updated in WasteTrade → push to Salesforce.</p><p>- Offer or Load created or updated in WasteTrade → push to Salesforce.</p><p>- Authorised Salesforce users update a mapped transactional status field (for example, Bid Accepted, Load Completed) → Salesforce sends inbound push to WasteTrade to apply the same status change.</p><p>- Salesforce Approval Flow (if configured by client) changes a transactional status or approval state → pushes the update to WasteTrade for application to the relevant record.</p><p>**Acceptance Criteria:**</p><p>- System Behaviour</p><p>&emsp;- WasteTrade → Salesforce (Outbound Push)</p><p>&emsp;&emsp;- When a Listing, Bid, Offer, or Load is created or updated in WasteTrade, the system pushes the corresponding record to Salesforce.</p><p>&emsp;&emsp;- The payload includes identifiers (Listing ID, Bid ID, Offer ID, Load ID, Buyer Account ID, Seller Account ID) and all mapped fields per the schema.</p><p>&emsp;&emsp;- The push establishes or updates related Salesforce records:</p><p>&emsp;&emsp;&emsp;- Listing: includes type, material, quantity, price, currency, and status.</p><p>&emsp;&emsp;&emsp;- Bid: includes bid value, status, and associated listing.</p><p>&emsp;&emsp;&emsp;- Offer / Load: includes key details such as collection date, weight, status, and price.</p><p>&emsp;&emsp;- If a related Account or Contact record is missing in Salesforce, the push logs a linkage error but continues for the remaining fields.</p><p>&emsp;&emsp;- Outbound pushes are idempotent: re-sending identical payloads does not create duplicates or overwrite with the same data.</p><p>&emsp;&emsp;- If a transaction changes state in WasteTrade (for example, Bid Accepted → Load Created), the system pushes updated statuses for all linked records in Salesforce.</p><p>&emsp;- Salesforce → WasteTrade (Inbound Push)</p><p>&emsp;&emsp;- When a Salesforce user changes a mapped transactional status or field (for example, updates a Load status or records a CRM-side confirmation), Salesforce pushes that change to WasteTrade via the inbound API endpoint.</p><p>&emsp;&emsp;- WasteTrade validates authentication, mapping version, linkage, and directionality.</p><p>&emsp;&emsp;- If valid and newer, WasteTrade updates the relevant transactional record and triggers any downstream processes already defined in WasteTrade for that status (for example, marking the Bid as Closed).</p><p>&emsp;&emsp;- If the event represents a Salesforce approval of a transactional stage (for example, Admin Approval in Salesforce), WasteTrade processes it using the same logic as if the equivalent action were taken in the WasteTrade Admin Portal.</p><p>&emsp;&emsp;- WasteTrade does not poll Salesforce or permit Salesforce-initiated creation of Listings, Bids, or Offers; only updates to mapped fields are accepted.</p><p>- Field Mapping</p><p>&emsp;- Only fields defined in the [WT Salesforce CRM data](https://docs.google.com/spreadsheets/d/1INMdcIWUkvxOB13M2xrz5qCVZsq8xSGlrX-6ioFHQfo/edit?gid=1428329366#gid=1428329366) mapping are synchronised.</p><p>&emsp;- Only fields and objects defined in that mapping are transmitted or accepted.</p><p>&emsp;- Data types, field names, and relationships must exactly match the schema sheet.</p><p>&emsp;- The integration is built against the approved mapping version for this work package.</p><p>&emsp;- Any schema or mapping changes will require review and may be implemented only via a change request.</p><p>&emsp;- Fields not designated inbound-writable are rejected with HTTP 400 field\_not\_writable\_from\_sf.</p><p>- Data Ownership and Direction of Data</p><p>&emsp;- WasteTrade is the system of record for all transactional data and retains authoritative control.</p><p>&emsp;- Salesforce is a consumer and reporting system for those records.</p><p>&emsp;- For bidirectional fields (for example, status), last update wins, determined by timestamp.</p><p>&emsp;- Inbound pushes carrying older timestamps are rejected as stale.</p><p>&emsp;- Outbound pushes from WasteTrade include an origin marker; inbound pushes carrying the same marker are ignored to prevent loops.</p><p>&emsp;- Salesforce cannot create or delete Listings, Bids, or Offers; only update mapped fields.</p><p>- Logging and Monitoring</p><p>&emsp;- Every push event (inbound or outbound) is recorded in the server-side integration log, capturing:</p><p>&emsp;&emsp;- Timestamp</p><p>&emsp;&emsp;- Direction (Outbound / Inbound)</p><p>&emsp;&emsp;- Object (Listing / Bid / Offer / Load)</p><p>&emsp;&emsp;- Record IDs in both systems</p><p>&emsp;&emsp;- Operation (Create / Update / Status Change / Approval Trigger)</p><p>&emsp;&emsp;- Result (Success / Failed with reason)</p><p>&emsp;- PII values are masked in logs except where needed for debugging.</p><p>&emsp;- Logs are retained for a minimum of 12 months.</p><p>&emsp;- No new user interface is added for monitoring or manual retry.</p><p>- Error Handling and Retries</p><p>&emsp;- Outbound (WasteTrade → Salesforce)</p><p>&emsp;- Transient errors (network/API): retried up to three times with exponential back-off.</p><p>&emsp;- Rate limiting (HTTP 429): retries respect the Retry-After header.</p><p>&emsp;- Validation or mapping errors: logged as Push Failed with details.</p><p>&emsp;- Partial success: valid records applied; invalid objects logged individually.</p><p>&emsp;- Linkage failure: logged as link\_not\_found.</p><p>&emsp;- Duplicate push: ignored (idempotent).</p><p>&emsp;- Inbound (Salesforce → WasteTrade)</p><p>&emsp;- Authentication / authorisation failure: 401 or 403; event rejected, logged.</p><p>&emsp;- Schema or mapping mismatch: 400 mapping\_version\_unsupported.</p><p>&emsp;- Field not writable: 400 field\_not\_writable\_from\_sf.</p><p>&emsp;- Invalid or missing record IDs: 404 record\_not\_found.</p><p>&emsp;- Stale update (older timestamp): 409 stale\_event.</p><p>&emsp;- Duplicate event: logged as duplicate\_event, no update.</p><p>&emsp;- Invalid transition (for example, attempt to move Closed → Pending): 409 invalid\_state.</p><p>&emsp;- Unsupported object type or unrecognised payload: 400 unsupported\_object.</p><p>&emsp;- Loop detection: inbound events carrying the WT origin marker are ignored.</p><p>- Non-Functional Constraints</p><p>&emsp;- OAuth 2.0 over HTTPS (TLS 1.2+).</p><p>&emsp;- Secrets stored securely using WasteTrade’s secret-management system.</p><p>&emsp;- Only mapped fields transmitted, ensuring UK GDPR compliance.</p><p>&emsp;- UTC timestamps used for all change comparisons.</p><p>&emsp;- Logs and credentials accessible only to authorised administrators.</p><p>- Success Criteria</p><p>&emsp;- Listings, Bids, Offers, and Loads created or updated in WasteTrade appear correctly in Salesforce within near real-time, with correct relationships and statuses.</p><p>&emsp;- Authorised status changes made in Salesforce (for example, marking Load Completed) are successfully pushed to WasteTrade and reflected in the operational workflow.</p><p>&emsp;- Invalid, unauthorised, duplicate, or stale events are safely rejected and logged.</p><p>&emsp;- No duplicates or orphaned records exist in either system.</p><p>&emsp;- No polling or manual synchronisation is required.</p><p>&emsp;- Integration logs provide full traceability for all transactional sync events.</p><p>&emsp;- Boundaries of this User Story</p><p>&emsp;- Covers event-driven push synchronisation of Listing, Bid, Offer, and Load data between WasteTrade and Salesforce.</p><p>&emsp;- Includes authorised status and approval updates initiated in Salesforce.</p><p>&emsp;- Excludes any creation or editing of Listings or Bids directly in Salesforce.</p><p>&emsp;- Introduces no new UI or manual sync functionality.</p><p>&emsp;- Maintains WasteTrade as the authoritative source of transactional records.</p>|
| :- |

|**Client Approved**|Yes|
| :- | :- |
####


### <a name="_xpkaz34owfrl"></a><a name="_msw6k3ctm7d4"></a>6.5.2. Document Generation
#### <a name="_e5phjp1bt76u"></a>**~~6.5.2.1. Document Generation for Accepted Bids~~**
- ~~Must generate documents for viewing via the web or mobile app.~~
- ~~Automatic Document Generation:~~
  - ~~Ensure that the system automatically generates the required documentation once a bid is accepted by a Seller.~~
  - ~~The documentation generation should be triggered without manual intervention, ensuring a seamless process flow.~~
- ~~Document Details Display:~~
  - ~~Display the following information for each generated document:~~
  - ~~Title: The name of the document.~~
  - ~~Description: A brief description of the document’s purpose and contents.~~
  - ~~This information should be clear and concise to help users understand the significance of each document.~~
- ~~List of Documents to be Generated:~~
  - ~~Automatically generate and list the following documents, pertinent to the transaction:~~
    - ~~Annex VII~~
    - ~~CMR (Consignment Note)~~
    - ~~Packing List~~
    - ~~Green Sheet~~
    - ~~Duty of Care~~
    - ~~Sales Invoice~~
    - ~~Purchase Order~~
  - ~~Ensure all documents comply with the relevant legal and trade regulations.~~
- ~~Document Access and Download:~~
  - ~~Provide functionality for users to view and download each document directly from the platform.~~
  - ~~Ensure the download process is straightforward and secure, allowing users to easily obtain copies of the documents for their records.~~
- ~~Usability and Accessibility:~~
  - ~~Make sure that the document viewing and downloading interface is user-friendly and accessible to all users, including those with disabilities.~~
  - ~~Provide adequate instructions or tooltips to assist users in navigating the document management features.~~
- ~~Security and Privacy:~~
  - ~~Implement robust security measures to ensure that document access is restricted to authorised users only.~~
  - ~~Ensure that sensitive information within the documents is adequately protected, both in transit and at rest.~~
- ~~Error Handling and Notifications:~~
  - ~~Provide clear error messages if document generation fails or if documents cannot be accessed or downloaded.~~
  - ~~Notify the user immediately upon successful generation of documents and make them aware of where and how they can access these documents.~~
- ~~Performance Metrics:~~
  - ~~Optimise the system to handle document generation quickly and efficiently, minimising the wait time for users.~~
  - ~~Ensure that the system can handle multiple simultaneous document generations without degradation in performance.~~
- ~~Integration with Admin Side Document Management:~~
  - ~~Ensure that document generation is aligned with the document management functionalities as specified in the Admin side settings.~~
  - ~~Admins should be able to see and manage the lifecycle of each document, including updates or revocation as necessary.~~
- ~~Testing and Validation:~~
  - ~~Conduct thorough testing to ensure that all types of documents are generated correctly and are accessible as intended.~~
  - ~~Include security penetration testing to validate the protection mechanisms around sensitive documents.~~

# <a name="_31rtucueagsn"></a><a name="_je70fqvw58bd"></a>**7. Appendix**
## <a name="_7g6d77yuww4k"></a>**7.1. Integrations**
#### <a name="_au1s9p7uzh7a"></a>**7.1.0.1. Salesforce**
- Integration expanded as per [6.5.](#_gx05pclx5dm4)


#### <a name="_cj4xuaa5rcgm"></a>**~~7.1.0.2 VAT Sense~~** 
- ~~UK/EU VAT Registration Checker~~ 

#### <a name="_surh52nn2otf"></a>**7.1.0.3. SendGrid**
- Expanded to include email notifications 
####
#### <a name="_rqlg6df4jx0a"></a><a name="_ybh4j8lp0w1m"></a>**~~7.1.0.4. WasteTrade Price Calculator~~**
- ~~Expanded to take the following factors into account:~~
  - ~~Conversion rate~~ 
    - ~~Currently fixed conversion rates within the database.~~
    - ~~Scope for future phases to utilise an Exchange Rate API.~~
  - ~~Incoterms~~
  - ~~PERN status~~ 
    - ~~Defined by an Admin ([~~6.4.4.3~~](#_76d9oli5t174)).~~

####
#### <a name="_wp2a1uwh43qt"></a><a name="_knmybneiad8y"></a>**~~7.1.0.5. Product Database~~**
- ~~Integrate with existing product database (WasteTrade)~~
- ~~Integration with Existing Database:~~
  - ~~The B13 Team will establish a connection to the existing products database.~~
  - ~~The connection must be secure and comply with all relevant data protection regulations.~~
- ~~Automatic Process Setup:~~
  - ~~An automatic process will be implemented to regularly check for additions, removals, and edits in the products database.~~
  - ~~The process should run at predefined intervals (e.g., hourly, daily) to ensure up-to-date information.~~
  - ~~Any changes detected in the database should be reflected immediately in the system.~~
- ~~User Visibility:~~
  - ~~Materials within the products database must be visible to end users during their onboarding process.~~
  - ~~The materials should be available for selection during listing creation.~~
  - ~~The interface should allow users to search, filter, and select materials from the database.~~
- ~~Integration with Pricing System:~~
  - ~~The integration will work alongside the existing pricing system to calculate and display appropriate prices for the materials.~~
  - ~~Prices should be updated automatically based on the latest data from the products database and pricing system.~~
  - ~~The system should handle any errors in price calculation gracefully, providing meaningful error messages to the user.~~
- ~~Testing and Validation:~~
  - ~~Comprehensive testing must be conducted to ensure the integration works seamlessly with the existing database and pricing system.~~
  - ~~All functionalities must be validated to ensure data consistency and accuracy.~~
- ~~Error Handling and Notifications:~~
  - ~~The system should log any errors or issues encountered during the integration process.~~
  - ~~Notifications should be sent to the Admin team in case of critical errors that need immediate attention.~~


#### <a name="_4mn0shgynkwp"></a>**~~7.1.0.6. Google Analytics~~**
- ~~Tracks and reports user interactions on the platform to provide insights into usage and performance.~~

#### <a name="_grw5wwd58oie"></a>**~~7.1.0.7. Google Tag Manager~~**
- ~~Configure Tags to support user tracking.~~

#### <a name="_iyltmnnuuhou"></a>**7.1.0.8. DEEPL Multi-language Tool**
- The integration will be expanded to allow additional languages

|<p>**Scope & Preconditions:**</p><p>- Expands existing DeepL integration to support additional left-to-right (LTR) languages.</p><p>- The platform currently supports LTR only (Phase 1 - 7.2.5.2 Language - Enhanced).</p><p>- Existing supported languages: English (EN), Spanish (ES).</p><p></p><p>**Triggers:**</p><p>- A user selects a supported language from the website language switcher.</p><p></p><p>**Acceptance Criteria:**</p><p>- Languages in scope (Left to Right only)</p><p>&emsp;- The system must support the following additional languages:</p><p>&emsp;&emsp;- Belarusian (BE)</p><p>&emsp;&emsp;- Chinese (ZH)</p><p>&emsp;&emsp;- Chinese Hong Kong (ZH\_HK)</p><p>&emsp;&emsp;- Chinese Taiwan (ZH\_TW)</p><p>&emsp;&emsp;- Czech (CS)</p><p>&emsp;&emsp;- Dutch (NL)</p><p>&emsp;&emsp;- French (FR)</p><p>&emsp;&emsp;- German (DE)</p><p>&emsp;&emsp;- Greek (EL)</p><p>&emsp;&emsp;- Hungarian (HU)</p><p>&emsp;&emsp;- Italian (IT)</p><p>&emsp;&emsp;- Japanese (JA)</p><p>&emsp;&emsp;- Lithuanian (LT)</p><p>&emsp;&emsp;- Polish (PL)</p><p>&emsp;&emsp;- Portuguese (PT)</p><p>&emsp;&emsp;- Romanian (RO)</p><p>&emsp;&emsp;- Slovak (SK)</p><p>&emsp;&emsp;- Swedish (SV)</p><p>&emsp;&emsp;- Turkish (TR)</p><p>&emsp;&emsp;- Russian (RU)</p><p>&emsp;&emsp;- Ukrainian (UK)</p><p>&emsp;&emsp;&emsp;- Arabic (AR) is explicitly out of scope (RTL not supported without enhanced N</p><p>- UI/UX quality gates (per language)</p><p>&emsp;- For each language added, the release must pass:</p><p>&emsp;&emsp;- Layout integrity: No critical overlaps, clipped text, or broken components on supported breakpoints; long strings/character width handled (wrapping, truncation with tooltip).</p><p>&emsp;&emsp;- Typography & glyph support: Complex scripts render legibly with chosen fonts/fallbacks (no tofu □ glyphs).</p><p>&emsp;&emsp;- Input & validation review: Field validation patterns accept relevant characters for the language/script (e.g., names, addresses); numeric/phone/email rules remain unless specified.</p><p>**Postconditions:**</p><p>- Users can browse the site in any enabled LTR language listed above, with stable layout, readable typography, and valid inputs.</p><p></p>|
| :- |

|**Use Case**|**Error Message**|
| :- | :- |
|Language update failure|“Currently to update language selection. Please try again.”|

|**Client Approved**|yes|
| :- | :- |
####

## <a name="_rjh07h6vnrc0"></a><a name="_kuz0v21fa22z"></a>**7.2. Web App Non-Functional Requirements**
### <a name="_9b8eo47k285r"></a>7.2.1. Browsers	
#### <a name="_950elv2o5ulf"></a>**7.2.1.2 Browsers - Enhanced**
- As Standard plus Opera, Samsung Internet
  - Latest versions at the start of development, to be defined in the SDS
###
### <a name="_415hc86cwp8r"></a><a name="_3hun3g2nblkt"></a>7.2.2. Design
#### <a name="_jg8zatck1ahh"></a>**~~7.2.2.3. Design - Super Enhanced~~**
- ~~As Standard and Enhanced, with the addition of smaller resolution screens, most often found in mobile and tablet devices~~
  - ~~Desktop screens~~ 
    - ~~1920×1080, 1536×864 and 1366×768~~
    - ~~Aug 2025 - this would cover 49.7% of desktops in Europe (source: [~~https://gs.statcounter.com/screen-resolution-stats~~](https://gs.statcounter.com/screen-resolution-stats)~~
  - ~~Mobile devices~~
    - ~~Tablets~~ 
      - ~~768x1024, 1280x800, 800x1280 and 810x1080~~
    - ~~Mobile phones~~
      - ~~390x844, 393x873, 360x800, 414x896, 393x852, 384x832 and 360x780~~
        - ~~Specifically, 360x780 is the viewport size for many Android, Samsung S-model and LG devices.~~
    - ~~Aug 2025 - this would cover 48.25% of tablets and 37% of mobile devices in Europe (source: [~~https://gs.statcounter.com/screen-resolution-stats~~](https://gs.statcounter.com/screen-resolution-stats))~~
###
### <a name="_d00ncobrdjb3"></a><a name="_ust9ganeltvc"></a>7.2.3. Version Management
*No change from P1.*
###
### <a name="_zftmlyxrkfxc"></a><a name="_6kurlqitnvg8"></a>7.2.4. Speed
*No change from P1.*
###
### <a name="_50ea8crmnjg0"></a><a name="_rm23zefe0klh"></a>7.2.5. Language
#### <a name="_ilob92lcfm31"></a>**~~7.2.5.2. Language - Enhanced~~**
- ~~The system will be built with multi-language capabilities~~
  - ~~Left-to-right languages only~~
  - ~~Translations will be provided by the multi-language tool ([~~7.1.0.8~~](#_iyltmnnuuhou))~~
  - ~~Note: the non-functional requirements relate to the setting up of language in the backend.~~ 
###
### <a name="_blc6vk4pplj1"></a><a name="_b4pdl650dayh"></a>7.2.6. Accessibility
*No change from P1.*
###
### <a name="_k5bq01sh2ltr"></a><a name="_ttdfg3omfod"></a>7.2.7. Offline mode
*No change from P1.*
###
### <a name="_tyt9es4yn4bt"></a><a name="_xd3eg7rvmoyh"></a>7.2.8. Analytics
#### <a name="_rsvqlhtcnjkd"></a>**~~7.2.8.2. Analytics - Enhanced~~**
- ~~Provide event tracking through Google Analytics~~
###
### <a name="_bxi9fi92lxtj"></a><a name="_jzajd6mwhrfi"></a>7.2.9. Testing
#### <a name="_535qktp5po50"></a>**7.2.9.2 Testing - Enhanced**
- Automated integration scripts, unit testing, code coverage of 20%
###
### <a name="_ykvpuv8fk4sr"></a><a name="_iwtpqkclxa27"></a>7.2.10. Security
#### <a name="_cbc8pi8pia93"></a>**7.2.10.2 Security - Enhanced**
- Encrypted database
- AWS Security Hub Automated Response and Remediation
- AWS Shield to protect against DoS attacks
- Install Node.JS libraries for increased vulnerability protection
- Redundancy protection - a secondary database to be used if the primary database fails
- Use of Amazon CloudFront and Amazon S3 for caching
###
### <a name="_8itenm4hmvb3"></a><a name="_lcb7dfm4zoem"></a>7.2.11. Infrastructure
*No change from P1.*
###
### <a name="_33yk12rlamqn"></a><a name="_g3x7uioxtk2h"></a>7.2.12. Deployment
#### <a name="_hih2lsql5qxs"></a>**7.2.12.2 Deployment - Enhanced**
- Horizontally scanned through the load balancer
- There will be a load balancer and two or more application servers running the backend code

## <a name="_uzms16mo45fx"></a>**~~7.3. Mobile App Non-Functional Requirements~~**
### <a name="_em32d7eb454w"></a>~~7.3.1. Devices~~ 
#### <a name="_5m5uud4rbp99"></a>**~~7.3.1.1. Devices - Standard~~**
- ~~iOS and Android mobile devices~~
  - ~~Latest versions at the start of development, to be defined in the SDS~~
#### <a name="_la7fbgayrzpa"></a>**~~7.3.1.2. Devices - Enhanced~~**
- ~~iOS and Android tablet devices~~
  - ~~Latest versions at the start of development, to be defined in the SDS~~
###
### <a name="_84wdptd342k4"></a><a name="_3fuxx65y0xnd"></a>~~7.3.2. Design~~
#### <a name="_2y0u7i3x1x72"></a>**~~7.3.2.1. Design - Standard~~**
- ~~Responsive design for mobile screen sizes~~
  - ~~Screen sizes 4” to 7”~~
#### <a name="_f7nd0bxngfdf"></a>**~~7.3.2.2. Design - Enhanced~~**
- ~~Responsive design for tablet and mobile screen sizes~~
  - ~~Screen sizes 4” to 13”~~

### <a name="_lb0ypz7ryx16"></a>~~7.3.3. Version Management~~
#### <a name="_6c52z2ec4edd"></a>**~~7.3.3.1. Version Management - Standard~~**
- ~~The browser cache will be refreshed each time a new version of the app is released~~
- ~~This will prevent CSS and JavaScript errors caused by old files in the browser cache~~
###
### <a name="_uah9jzq0sb2r"></a><a name="_31bactb2ldh7"></a>~~7.3.4. Speed~~
#### <a name="_9ytr0wxwyynv"></a>**~~7.3.4.1. Speed - Standard~~**
- ~~Speed will be dependent on the network connection speed and geographical location, but assuming a reasonable connection, all page loads should be less than 2 seconds~~
- ~~Any delays over 2 seconds will show a spinner~~
###
### <a name="_urh7qm42acqe"></a><a name="_9t8zkatrodin"></a>~~7.3.5. Language~~
#### <a name="_830zkwr6j4bn"></a>**~~7.3.5.1. Language - Standard~~**
- ~~English only~~
###
### <a name="_kx1ortoiclkl"></a><a name="_f4sev7s9ygue"></a>~~7.3.6. Accessibility~~
#### <a name="_bl0kdw7pe1jx"></a>**~~7.3.6.1. Accessibility - Standard~~**
- ~~None~~
###
### <a name="_frr7gp5orw6w"></a><a name="_ww6ji93dpgcn"></a>~~7.3.7. Offline mode~~
#### <a name="_5m6n9zhy4yyt"></a>**~~7.3.7.1. Offline mode - Standard~~**
- ~~No offline mode - a network connection will be required to access and use the system~~
###
### <a name="_bggszwnz8oyb"></a><a name="_8s8kmiatq9zv"></a>~~7.3.8. Analytics~~
#### <a name="_25toxwokwzj3"></a>**~~7.3.8.1. Analytics - Standard~~**
- ~~Basic data capture on the app~~
#### <a name="_949qwt9ynldq"></a>**~~7.3.8.2. Analytics - Enhanced~~**
- ~~Provide event tracking through Google Analytics~~
###
### <a name="_juhfbfszhu2f"></a><a name="_lyysxfbb4sin"></a>~~7.3.9. Testing~~
#### <a name="_2rcpzitch9ir"></a>**~~7.3.9.1. Testing - Standard~~**
- ~~The offshore and onshore test teams will test each sprint before demos and delivery~~
###
### <a name="_hewxqh97ee7o"></a><a name="_x6iuu4ol3nid"></a>~~7.3.10. Security~~
#### <a name="_zfuvzkuigei7"></a>**~~7.3.10.1. Security - Standard~~** 
- ~~Lock down the database server to approved IPs only~~
- ~~Only expose necessary ports on the database and application server~~
- ~~Control access using SSH~~
- ~~Encrypted communication between the database and server~~
- ~~Encrypted communication between the web app and the client (SSL)~~
- ~~Passwords will be encrypted in the database~~
- ~~Horizontally scalable servers for stability and resilience~~
- ~~Use the latest version of the framework at the time of project initialisation~~
- ~~Daily database backup~~
###
### <a name="_7hn68asvdp0s"></a><a name="_wm5e2ploin5w"></a>~~7.3.11. Infrastructure~~
#### <a name="_ddj33b4pgxw3"></a>**~~7.3.11.1. Infrastructure - Standard~~** 
- ~~Infrastructure requirements will be defined by the technical lead, depending on the complexity of the system~~
###
### <a name="_30wun86fe2c6"></a><a name="_44a5p2qezlj7"></a>~~7.3.12. Deployment~~
#### <a name="_v8kk6q1ru9st"></a>**~~7.3.12.1. Deployment - Standard~~**
- ~~Single server~~

## <a name="_5ovkz17zjhwd"></a>**7.4. On-Going Costs and Subscriptions**
- Extended Warranty
  - 12 % of the build cost per year, paid monthly
- ~~VAT Sense~~
  - [~~https://vatsense.com/#pricing~~](https://vatsense.com/#pricing)~~ 
- ~~Google Analytics~~
  - ~~Free~~ 
  - ~~GA 360 - Paid version for greater functionality~~
    - [~~https://marketingplatform.google.com/intl/en_uk/about/analytics-360/features/~~](https://marketingplatform.google.com/intl/en_uk/about/analytics-360/features/)~~ 
- ~~Google Tag Manager~~
  - ~~Free~~
  - ~~Tag Manager 360 - Paid version for greater functionality~~
    - [~~https://marketingplatform.google.com/intl/en_uk/about/tag-manager/compare/~~](https://marketingplatform.google.com/intl/en_uk/about/tag-manager/compare/)~~ 

##
<a name="_yzm150rm7dvq"></a>2

[ref1]: Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.001.png
[ref2]: Aspose.Words.1099b20e-35e1-43d9-8aae-55e6498eb355.012.png
