/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Companies,
    CompanyLocations,
    User,
    Listings,
    Offers,
    CompanyDocuments,
    CompanyLocationDocuments,
    HaulageOffers,
} from '../../models';
import { ListingImageType, CompanyUserStatusEnum, OfferStatusEnum, HaulageOfferStatus, ListingStatus } from '../../enum';
import {
    AccountFields,
    AccountTypeValues,
    AccountWasteTradeTypeValues,
    LeadFields,
    LeadStatusValues,
    LeadLeadDirectionValues,
    LeadLeadBuyerIntentionValues,
    LeadLeadRatingValues,
    LeadCompanyTypeValues,
    ContactFields,
    SalesListingFields,
    WantedListingFields,
    OffersFields,
    HaulageOffersFields,
    HaulageOffersHaulierListingStatusValues,
    HaulageLoadsFields,
    DocumentFields,
} from './generated';
import {
    addEnvironmentPrefix,
    addEnvironmentPrefixToExternalId,
    formatCurrencyValue,
    formatNumericValue,
    convertDateToSalesforceFormat,
    buildMaterialName,
    calculateSafeNumberOfLoads,
    isValidEmail,
    SalesforceLogger,
} from './salesforce-sync.utils';
import {
    mapLeadSource,
    mapWasteTradePublicationStatus,
    mapMaterialPicklist,
    mapPackagingTypePicklist,
    mapStorageTypePicklist,
    mapCountryCodeToFullName,
    mapDemurrage,
    mapTrailerOrContainer,
    mapTrailerType,
    mapContainerType,
} from './salesforce-mapping.utils';
import {
    mapCompanyRole,
    mapCompanyUserStatus,
    mapHaulageOfferStatus,
    mapTransportProvider,
    mapExpectedTransitTime,
    mapCustomsClearance,
    mapCurrency,
    mapListingStatus,
    mapOfferStatus,
    mapCompanyStatus,
    mapUserRole,
    mapUserStatus,
    mapLoadStatus,
} from './salesforce-bidirectional-mapping.utils';

// Map WasteTrade company to Salesforce Account
// Uses both standard Salesforce Account fields and existing custom fields
// Keeps existing custom fields to preserve functionality while using standard fields where appropriate
export function mapCompanyToAccount(
    company: Companies,
    locations?: CompanyLocations[],
    primaryUser?: User,
): Record<string, any> {
    const account: Record<string, any> = {
        [AccountFields.Name]: addEnvironmentPrefix(company.name),
        // Type = SF account category (Customer/Supplier/Haulier), not WT business type
        [AccountFields.Type]: company.isHaulier ? AccountTypeValues.Haulier : AccountTypeValues.Customer,
    };

    // WasteTrade_Type__c = WT business type (Recycler/Broker/Waste Generator etc.)
    if (company.companyType) {
        const wtTypeMap: Record<string, string> = {
            manufacturer: AccountWasteTradeTypeValues.Waste_Management_Facility,
            processor: AccountWasteTradeTypeValues.Waste_Management_Facility,
            recycler: AccountWasteTradeTypeValues.Recycler,
            broker: AccountWasteTradeTypeValues.Broker,
            waste_producer: AccountWasteTradeTypeValues.Waste_Generator,
        };
        account[AccountFields.WasteTrade_Type__c] = wtTypeMap[company.companyType] || AccountWasteTradeTypeValues.Other;
    }

    // Only include address fields when they have values (prevent clearing SF data with null)
    if (company.addressLine1?.trim()) account[AccountFields.BillingStreet] = company.addressLine1.trim();
    if (company.city?.trim()) account[AccountFields.BillingCity] = company.city.trim();
    if (company.country?.trim()) account[AccountFields.BillingCountry] = company.country.trim();
    if (company.postalCode?.trim()) account[AccountFields.BillingPostalCode] = company.postalCode.trim();
    if (company.stateProvince?.trim()) account[AccountFields.BillingState] = company.stateProvince.trim();

    // Use standard Phone field for primary phone number
    const primaryPhone = company.phoneNumber || company.mobileNumber;
    if (primaryPhone && primaryPhone.trim().length > 0) {
        account[AccountFields.Phone] = primaryPhone.trim();
    }

    // Use standard Fax field for mobile number if different from primary phone
    if (
        company.mobileNumber &&
        company.mobileNumber.trim().length > 0 &&
        company.mobileNumber !== company.phoneNumber
    ) {
        account[AccountFields.Fax] = company.mobileNumber.trim();
    }

    // Use standard Website field
    if (company.website && company.website.trim().length > 0) {
        let websiteUrl = company.website.trim();

        // Ensure URL is absolute (Salesforce requires absolute URLs)
        if (!websiteUrl.match(/^https?:\/\//i)) {
            websiteUrl = 'https://' + websiteUrl;
        }

        account[AccountFields.Website] = websiteUrl;
    }

    // Use standard Description field
    if (company.description && company.description.trim().length > 0) {
        account[AccountFields.Description] = company.description.trim();
    }

    // Add back existing custom fields that were removed
    if (company.vatNumber && company.vatNumber.trim().length > 0) {
        account[AccountFields.Company_VAT_Number__c] = company.vatNumber.trim();
    }
    if (company.registrationNumber && company.registrationNumber.trim().length > 0) {
        account[AccountFields.Company_Registration_Number__c] = company.registrationNumber.trim();
    }
    if (company.companyInterest) {
        account[AccountFields.WT_Company_Interest__c] = company.companyInterest;
    }
    // Map country code to full country name for Salesforce picklist
    if (company.vatRegistrationCountry) {
        account[AccountFields.VAT_Registration_Country__c] = mapCountryCodeToFullName(company.vatRegistrationCountry);
    }
    if (company.id) {
        account[AccountFields.WasteTrade_Company_Id__c] = addEnvironmentPrefixToExternalId(company.id.toString());
    }

    // Add sync origin marker for loop prevention (bidirectional sync)
    account[AccountFields.Last_Sync_Origin__c] = `WT_${Date.now()}`;

    // Add company status using bidirectional mapper for proper picklist values
    if (company.status) {
        account[AccountFields.Account_Status__c] = mapCompanyStatus(company.status, false);
    }

    // Add email using existing custom Email__c field (Account object doesn't have standard Email field)
    if (company.email && company.email.trim().length > 0) {
        account[AccountFields.Email__c] = company.email.trim();
    }

    // Buyer/Seller/Haulier flags (outbound only — SF visibility fields)
    account[AccountFields.WT_is_buyer__c] = company.isBuyer ?? false;
    account[AccountFields.WT_is_seller__c] = company.isSeller ?? false;
    account[AccountFields.WT_is_haulier__c] = company.isHaulier ?? false;

    // Haulier-specific fields
    if (company.isHaulier) {
        // Normalize legacy container type values to SF picklist values
        const containerTypeMap: Record<string, string> = {
            'Curtain Sider': 'Curtain Sider',
            'Containers': 'Containers',
            'Tipper Trucks': 'Tipper Trucks',
            'Walking Floor': 'Walking Floor',
            'shipping_container': 'Containers',
            'curtain_slider_standard': 'Curtain Sider',
            'curtain_slider_high_cube': 'Curtain Sider',
            'walking_floor': 'Walking Floor',
            'all': 'Curtain Sider;Containers;Tipper Trucks;Walking Floor',
        };
        const rawTypes = company.containerTypes ?? [];
        const normalizedTypes = [...new Set(
            rawTypes.flatMap((t: string) => (containerTypeMap[t] ?? t).split(';')),
        )];
        if (normalizedTypes.length > 0) {
            account[AccountFields.WT_Container_Types__c] = normalizedTypes.join(';');
        }

        // Fleet type (Freight Forwarder / Own Fleet)
        if (company.fleetType) {
            const fleetTypeMap: Record<string, string> = {
                freight_forwarder: 'Freight Forwarder',
                own_fleet: 'Own Fleet',
            };
            account[AccountFields.Fleet_Type__c] = fleetTypeMap[company.fleetType] ?? company.fleetType;
        }

        // Areas covered: separate top-level choice from EU countries list
        if (company.areasCovered && company.areasCovered.length > 0) {
            const topLevelAreas = ['uk_only', 'worldwide'];
            const topLevel = company.areasCovered.find((a: string) => topLevelAreas.includes(a));
            const euCountries = company.areasCovered.filter((a: string) => !topLevelAreas.includes(a));

            // Areas_Covered__c picklist: UK Only / Within EU / Worldwide
            if (topLevel === 'uk_only') {
                account[AccountFields.Areas_Covered__c] = 'UK Only';
            } else if (topLevel === 'worldwide') {
                account[AccountFields.Areas_Covered__c] = 'Worldwide';
            } else if (euCountries.length > 0) {
                account[AccountFields.Areas_Covered__c] = 'Within EU';
            }

            // EU_Countries__c multi-picklist (only when Within EU)
            if (euCountries.length > 0) {
                account[AccountFields.EU_Countries__c] = euCountries
                    .map((c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                    .join(';');
            }
        }
    }

    // Map additional company information to description field (keep this for redundancy)
    const additionalInfo = [];
    if (company.companyInterest) {
        additionalInfo.push(`Company Interest: ${company.companyInterest}`);
    }
    if (company.vatRegistrationCountry) {
        additionalInfo.push(`VAT Registration Country: ${mapCountryCodeToFullName(company.vatRegistrationCountry)}`);
    }
    if (company.email && company.email.trim().length > 0) {
        additionalInfo.push(`Email: ${company.email.trim()}`);
    }

    // Append additional info to description
    if (additionalInfo.length > 0) {
        const existingDescription = account[AccountFields.Description] || '';
        const separator = existingDescription ? '\n\n' : '';
        account[AccountFields.Description] = existingDescription + separator + additionalInfo.join('\n');
    }

    // Add shipping address using both standard fields AND custom fields for compatibility
    if (locations && locations.length > 0) {
        const mainLocation = locations.find((loc) => loc.mainLocation) ?? locations[0];
        if (mainLocation) {
            // Standard fields - Use street field if available, otherwise fall back to addressLine
            if (mainLocation.street || mainLocation.addressLine) {
                account[AccountFields.ShippingStreet] = mainLocation.street || mainLocation.addressLine;
            }
            if (mainLocation.city) {
                account[AccountFields.ShippingCity] = mainLocation.city;
            }
            if (mainLocation.country) {
                account[AccountFields.ShippingCountry] = mainLocation.country;
            }
            if (mainLocation.postcode) {
                account[AccountFields.ShippingPostalCode] = mainLocation.postcode;
            }
            if (mainLocation.stateProvince) {
                account[AccountFields.ShippingState] = mainLocation.stateProvince;
            }

            // Add back custom fields that existed
            // Use street field if available, otherwise fall back to addressLine
            account[AccountFields.Shipping_Street__c] = mainLocation.street || mainLocation.addressLine;
            account[AccountFields.Shipping_City__c] = mainLocation.city;
            account[AccountFields.Shipping_Country__c] = mainLocation.country;
            account[AccountFields.Shipping_Zip_Postal_Code__c] = mainLocation.postcode;
            account[AccountFields.Shipping_State_Province__c] = mainLocation.stateProvince;
            account[AccountFields.Has_Loading_Ramp__c] = mainLocation.loadingRamp ?? false;
            account[AccountFields.Has_Weigh_Bridge__c] = mainLocation.weighbridge ?? false;

            // Site contact info: use location data first, fallback to primary user
            const siteFirstName = mainLocation.firstName || primaryUser?.firstName;
            const siteLastName = mainLocation.lastName || primaryUser?.lastName;
            const sitePhone = mainLocation.phoneNumber || primaryUser?.phoneNumber || primaryUser?.mobileNumber;

            if (siteFirstName) {
                account[AccountFields.Site_Contact_First_Name__c] = siteFirstName;
            }
            if (siteLastName) {
                account[AccountFields.Site_Contact_Last_Name__c] = siteLastName;
            }
            if (sitePhone) {
                account[AccountFields.Site_Contact_Phone__c] = sitePhone;
            }

            // NOTE: Lead_First_Name__c, Lead_Last_Name__c, Lead_Phone__c are Lead-specific fields
            // and do NOT exist on Account object. Site_Contact_* fields already capture this data.

            if (mainLocation.locationName) {
                account[AccountFields.Primary_Location_Name__c] = mainLocation.locationName.trim();
                // FIXED: Remove non-existent field Primary_Site_Location__c
                // Using existing Primary_Location_Name__c field instead
            }
            if (mainLocation.positionInCompany) {
                account[AccountFields.Site_Contact_Position__c] = mainLocation.positionInCompany;
            }
            if (mainLocation.selfLoadUnLoadCapability !== undefined) {
                account[AccountFields.Self_Load_Unload__c] = mainLocation.selfLoadUnLoadCapability;
            }
            if (mainLocation.accessRestrictions) {
                account[AccountFields.Access_Restrictions__c] = mainLocation.accessRestrictions;
            }
            if (mainLocation.containerType && mainLocation.containerType.length > 0) {
                account[AccountFields.Container_Types__c] = mainLocation.containerType.join(';');
            }
            if (mainLocation.acceptedMaterials && mainLocation.acceptedMaterials.length > 0) {
                account[AccountFields.Site_Accepted_Materials__c] = mainLocation.acceptedMaterials.join(';');
            }
            if (mainLocation.sitePointContact && mainLocation.sitePointContact.trim().length > 0) {
                account[AccountFields.Site_Point_Contact__c] = mainLocation.sitePointContact.trim();
            }
            if (mainLocation.phoneNumber && mainLocation.phoneNumber.trim().length > 0) {
                account[AccountFields.Site_Contact_Phone__c] = mainLocation.phoneNumber.trim();
                // FIXED: Changed from non-existent Site_Phone__c to existing Site_Contact_Phone__c
            }

            // Add operating hours if available
            if (mainLocation.officeOpenTime && mainLocation.officeCloseTime) {
                account[AccountFields.Operating_Hours__c] = `${mainLocation.officeOpenTime}-${mainLocation.officeCloseTime}`;
            }
        }
    }

    return account;
}

// Map WasteTrade user to Salesforce Lead (for new registrations)
export async function mapUserToLead(
    user: User,
    company: Companies | undefined,
    materialUsersRepository: any,
): Promise<Record<string, any>> {
    const lead: Record<string, any> = {
        [LeadFields.FirstName]: user.firstName || 'Unknown',
        [LeadFields.LastName]: user.lastName || 'Unknown',
        // Add email validation
        [LeadFields.Email]: user.email,
        [LeadFields.Phone]: user.phoneNumber ?? user.mobileNumber, // Use phoneNumber first, fallback to mobileNumber
        [LeadFields.Company]: company?.name ? addEnvironmentPrefix(company.name) : addEnvironmentPrefix('Unknown'),
        [LeadFields.LeadSource]: mapLeadSource(user.whereDidYouHearAboutUs),
        // Omit standard Status field — SF uses default on create, preserves value on update.
        // Only set WasteTrade_User_Status__c which tracks WT-side status independently.
        [LeadFields.WasteTrade_User_Status__c]: mapUserStatus(user.status, false),
        // Required fields with valid picklist values
        [LeadFields.Lead_Direction__c]: LeadLeadDirectionValues.Inbound,
        [LeadFields.Lead_Buyer_Intention__c]: LeadLeadBuyerIntentionValues.High,
        [LeadFields.Lead_Rating__c]: LeadLeadRatingValues.Cold,
    };

    // Email
    if (!isValidEmail(user.email)) {
        lead[LeadFields.Email] = undefined;
    }

    // FIXED: Add title with proper capitalization
    if (user.prefix) {
        // Ensure title starts with uppercase
        const title = user.prefix.trim();
        lead[LeadFields.Title] = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    }

    // FIXED: Add job title with proper sync
    if (user?.jobTitle) {
        lead[LeadFields.Job_Title__c] = user.jobTitle;
    }

    // Map company type: hauliers use 'Haulier' picklist value, others use companyType
    if (company?.isHaulier) {
        lead[LeadFields.Company_Type__c] = LeadCompanyTypeValues.Haulier;
    } else if (company?.companyType) {
        lead[LeadFields.Company_Type__c] = company.companyType;
    }

    // FIXED: Add company interest from company data
    if (company?.companyInterest) {
        lead[LeadFields.WasteTrade_Company_Interest__c] = company.companyInterest;
    }

    // Lead source is now mapped directly to the standard LeadSource field above
    // No need for custom field WasteTrade_Lead_Source__c

    if (user.id) lead[LeadFields.WasteTrade_User_Id__c] = addEnvironmentPrefixToExternalId(user.id.toString());

    // Add sync origin marker for loop prevention (bidirectional sync)
    lead[LeadFields.Last_Sync_Origin__c] = `WT_${Date.now()}`;

    // Add material interests (checkboxes)
    if (user.id) {
        const materialUsers = await materialUsersRepository
            .find({
                where: { userId: user.id },
                include: ['material'],
            })
            .catch(() => []); // Fallback to empty array if fetch fails

        const hasMaterial = (materialName: string) =>
            materialUsers.some((mu: any) => mu.material?.name?.toLowerCase() === materialName.toLowerCase());

        // Add all material checkboxes
        lead[LeadFields.LDPE__c] = hasMaterial('LDPE');
        lead[LeadFields.PET__c] = hasMaterial('PET');
        lead[LeadFields.HDPE__c] = hasMaterial('HDPE');
        lead[LeadFields.PP__c] = hasMaterial('PP');
        lead[LeadFields.PS__c] = hasMaterial('PS');
        lead[LeadFields.PVC__c] = hasMaterial('PVC');
        lead[LeadFields.ABS__c] = hasMaterial('ABS');
        lead[LeadFields.ACRYLIC__c] = hasMaterial('Acrylic');
        lead[LeadFields.PC__c] = hasMaterial('PC') || hasMaterial('Polycarbonate');
        lead[LeadFields.PA__c] = hasMaterial('PA') || hasMaterial('Polyamide') || hasMaterial('Nylon');
        lead[LeadFields.OTHER_MIX__c] = hasMaterial('Other Mix');
        lead[LeadFields.Other__c] = hasMaterial('Other');
        lead[LeadFields.OTHER_SINGLE_SOURCES__c] = hasMaterial('Other Single Sources');
        lead[LeadFields.Granulates__c] = hasMaterial('Granulates');

        // Add missing fields that exist in Salesforce
        lead[LeadFields.EPS__c] = hasMaterial('EPS') || hasMaterial('Expanded Polystyrene');
        lead[LeadFields.PE__c] = hasMaterial('PE') || hasMaterial('Polyethylene');

        // Additional material fields
        lead[LeadFields.PAPER__c] = hasMaterial('PAPER');
        lead[LeadFields.CARDBOARD__c] = hasMaterial('CARDBOARD');
        lead[LeadFields.GLASS__c] = hasMaterial('GLASS');
        lead[LeadFields.METAL__c] = hasMaterial('METAL');
        lead[LeadFields.WOOD__c] = hasMaterial('WOOD');
        lead[LeadFields.TEXTILE__c] = hasMaterial('TEXTILE');
        lead[LeadFields.ELECTRONIC__c] = hasMaterial('ELECTRONIC');
        lead[LeadFields.BATTERY__c] = hasMaterial('BATTERY');
        lead[LeadFields.OIL__c] = hasMaterial('OIL');
        lead[LeadFields.TIRE__c] = hasMaterial('TIRE');
        lead[LeadFields.CONCRETE__c] = hasMaterial('CONCRETE');
        lead[LeadFields.ASPHALT__c] = hasMaterial('ASPHALT');
        lead[LeadFields.GYPSUM__c] = hasMaterial('GYPSUM');
        lead[LeadFields.CERAMIC__c] = hasMaterial('CERAMIC');
        lead[LeadFields.COMPOST__c] = hasMaterial('COMPOST');

        // FIXED: Set Other_Material__c for materials of interest (multiple selection)
        const otherMaterials = materialUsers
            .filter((mu: any) => mu.material?.name?.toLowerCase().includes('other'))
            .map((mu: any) => mu.material?.name)
            .join(', ');
        if (otherMaterials) {
            lead[LeadFields.Other_Material__c] = otherMaterials.substring(0, 100); // Limit to 100 chars
        }

        // FIXED: Add materials of interest summary for visibility
        const allMaterials = materialUsers
            .map((mu: any) => mu.material?.name)
            .filter(Boolean)
            .join(', ');
        if (allMaterials) {
            lead[LeadFields.Materials_of_Interest__c] = allMaterials.substring(0, 255); // Limit to 255 chars
        }
    }

    return lead;
}

// Map WasteTrade user to Salesforce Contact (after verification)
export function mapUserToContact(user: User, accountId: string): Record<string, any> {
    const contact: Record<string, any> = {
        [ContactFields.FirstName]: user.firstName,
        [ContactFields.LastName]: user.lastName,
        [ContactFields.Email]: user.email,
        [ContactFields.AccountId]: accountId,
    };

    // Phone fields: Phone = phoneNumber, MobilePhone = mobileNumber (per field mapping config)
    if (user.phoneNumber) contact[ContactFields.Phone] = user.phoneNumber;
    if (user.mobileNumber) contact[ContactFields.MobilePhone] = user.mobileNumber;

    // Add optional fields
    if (user.prefix) {
        contact[ContactFields.Title] = user.prefix;
        contact[ContactFields.Salutation] = user.prefix;
    }
    if (user.jobTitle) contact[ContactFields.Job_Title__c] = user.jobTitle;
    if (user.id) contact[ContactFields.WasteTrade_User_Id__c] = addEnvironmentPrefixToExternalId(user.id.toString());

    // Add sync origin marker for loop prevention (bidirectional sync)
    contact[ContactFields.Last_Sync_Origin__c] = `WT_${Date.now()}`;

    return contact;
}

// Map CompanyUsers (membership) to Contact fields
// Used when syncing company user relationships to Salesforce
export function mapCompanyUserToContact(
    user: User,
    companyUser: any,
    accountId: string,
    primaryLocation?: CompanyLocations,
): Record<string, any> {
    const contact: Record<string, any> = {
        [ContactFields.FirstName]: user.firstName,
        [ContactFields.LastName]: user.lastName,
        [ContactFields.Email]: user.email,
        [ContactFields.AccountId]: accountId,
    };

    // Phone fields: Phone = phoneNumber, MobilePhone = mobileNumber (per field mapping config)
    if (user.phoneNumber) contact[ContactFields.Phone] = user.phoneNumber;
    if (user.mobileNumber) contact[ContactFields.MobilePhone] = user.mobileNumber;

    // Add optional user fields
    if (user.prefix) {
        contact[ContactFields.Title] = user.prefix;
        contact[ContactFields.Salutation] = user.prefix;
    }
    if (user.jobTitle) contact[ContactFields.Job_Title__c] = user.jobTitle;
    if (user.id) contact[ContactFields.WasteTrade_User_Id__c] = addEnvironmentPrefixToExternalId(user.id.toString());

    // Add CompanyUsers-specific fields
    if (companyUser.companyRole) {
        // Map to Company_Role__c field using bidirectional mapper
        contact[ContactFields.Company_Role__c] = mapCompanyRole(companyUser.companyRole, false);
    }

    // Map isPrimaryContact to Is_Primary_Contact__c
    if (companyUser.isPrimaryContact !== undefined) {
        contact[ContactFields.Is_Primary_Contact__c] = companyUser.isPrimaryContact;
    }

    // Map status to Company_User_Status__c using bidirectional mapper
    if (companyUser.status) {
        contact[ContactFields.Company_User_Status__c] = mapCompanyUserStatus(companyUser.status, false);
    }

    // Map No_Longer_With_Company__c for rejected users
    if (companyUser.status === CompanyUserStatusEnum.REJECTED) {
        contact[ContactFields.No_Longer_With_Company__c] = true;
    }

    if (primaryLocation) {
        contact[ContactFields.Site_Location_Address__c] = primaryLocation.locationName;
        // Build full address string for description or other field
        const addressParts = [
            primaryLocation.addressLine,
            primaryLocation.city,
            primaryLocation.stateProvince,
            primaryLocation.postcode,
            primaryLocation.country,
        ].filter(Boolean);
        if (addressParts.length > 0) {
            // Store in MailingStreet since Site_Location_Address__c doesn't exist on Contact
            contact[ContactFields.MailingStreet] = addressParts.join(', ');
        }
    }

    // Add sync origin marker for loop prevention (bidirectional sync)
    contact[ContactFields.Last_Sync_Origin__c] = `WT_${Date.now()}`;

    return contact;
}

// Map WasteTrade listing to Salesforce Sales Listing (custom object)
export async function mapListingToSalesListing(
    listing: Listings,
    listingDocuments?: any[],
    location?: CompanyLocations,
): Promise<Record<string, any>> {
    // Generate the listing URL for Sales Listing Link
    const baseUrl = process.env.FRONTEND_URL ?? 'https://app.wastetrade.com';
    const listingUrl = `${baseUrl}/listing/${listing.id}`;

    // Use the listing's numberOfLoads field directly (not calculated from quantity/weightPerUnit)
    const numberOfLoads = listing.numberOfLoads ?? calculateSafeNumberOfLoads(listing.quantity, listing.materialWeightPerUnit);

    // Extract featured images from documents
    let featuredImageUrl: string | undefined;
    let featuredImageUrl2: string | undefined;
    let featuredImageUrl3: string | undefined;

    if (listingDocuments && listingDocuments.length > 0) {
        const featureImages = listingDocuments
            .filter((doc) => doc.documentType === ListingImageType.FEATURE_IMAGE)
            .map((doc) => {
                const url = doc.documentUrl;
                if (url && !url.match(/^https?:\/\//i)) {
                    return `https://${url}`;
                }
                return url;
            })
            .filter(Boolean)
            .slice(0, 3); // Take only first 3 images

        featuredImageUrl = featureImages[0];
        featuredImageUrl2 = featureImages[1];
        featuredImageUrl3 = featureImages[2];
    }

    // Ensure title respects Salesforce field limits
    const salesListingName = listing.title
        ? listing.title.substring(0, 80) // Sales_Listing_Name__c has 80 char limit
        : `Listing ${listing.id}`;

    let locationAddress: string | undefined;
    if (location) {
        const addressParts = [
            location.locationName,
            location.street || location.addressLine,
            location.city,
            location.stateProvince,
            location.postcode,
            location.country,
        ].filter(Boolean);
        locationAddress = addressParts.join(', ');
    }

    return {
        // Basic identification fields
        [SalesListingFields.Name]: listing.title ? addEnvironmentPrefix(listing.title) : addEnvironmentPrefix(`Listing ${listing.id}`),
        [SalesListingFields.WasteTrade_Listing_Id__c]: listing.id ? addEnvironmentPrefixToExternalId(listing.id.toString()) : undefined,
        [SalesListingFields.Sales_Listing_Name__c]: salesListingName, // Field Name fix with length limit
        [SalesListingFields.Sales_Listing_Link__c]: listingUrl,

        // User and location information
        [SalesListingFields.WasteTrade_User_Id__c]: listing.createdByUserId
            ? addEnvironmentPrefixToExternalId(listing.createdByUserId.toString())
            : undefined,
        [SalesListingFields.WasteTrade_Site_Id__c]: listing.locationId
            ? addEnvironmentPrefixToExternalId(listing.locationId.toString())
            : undefined,

        [SalesListingFields.Pickup_Location_Address__c]: locationAddress,

        // Material information
        [SalesListingFields.Material_Type__c]: listing.materialType,
        [SalesListingFields.Material_Packing__c]: listing.materialPacking,
        [SalesListingFields.Material__c]: mapMaterialPicklist(listing.materialType),
        [SalesListingFields.Group__c]: listing.materialType,

        // Packaging
        [SalesListingFields.Packaging_Type__c]: mapPackagingTypePicklist(listing.materialPacking),

        // Quantity and weight information - use totalWeight for total weight, fallback to materialWeight
        [SalesListingFields.Material_Weight__c]: formatNumericValue(listing.totalWeight ?? listing.materialWeight ?? listing.quantity),
        [SalesListingFields.Number_of_Loads__c]: numberOfLoads,

        // Pricing information
        [SalesListingFields.Price_Per_Tonne__c]: formatCurrencyValue(listing.pricePerMetricTonne),
        [SalesListingFields.Indicated_Price__c]: formatCurrencyValue(listing.pricePerMetricTonne),
        [SalesListingFields.CurrencyIsoCode]: mapCurrency(listing.currency),

        // Date information
        [SalesListingFields.Available_From_Date__c]: listing.startDate ? new Date(listing.startDate).toISOString().split('T')[0] : undefined,
        [SalesListingFields.Available_Until__c]: listing.endDate ? new Date(listing.endDate).toISOString().split('T')[0] : undefined,
        [SalesListingFields.Created_Date__c]: listing.createdAt ? new Date(listing.createdAt).toISOString() : undefined,

        // Status information
        [SalesListingFields.Listing_Status__c]: mapListingStatus(listing.status),
        [SalesListingFields.WasteTrade_Publication_Status__c]: mapWasteTradePublicationStatus(listing.status),

        // Description and additional information
        [SalesListingFields.Description__c]: listing.description,
        [SalesListingFields.Additional_Information__c]: listing.additionalNotes, // New field for additional information

        // Storage information
        [SalesListingFields.Storage_Type__c]: mapStorageTypePicklist(listing.wasteStoration),

        // Country restrictions
        [SalesListingFields.Material_Origin_Country_Restricted__c]: listing.materialRemainInCountry,

        // Image fields - now populated with actual data
        [SalesListingFields.Sales_Listing_Featured_Image_Link__c]: featuredImageUrl,
        [SalesListingFields.Sales_Listing_Featured_Image_Link_2__c]: featuredImageUrl2,
        [SalesListingFields.Sales_Listing_Featured_Image_Link_3__c]: featuredImageUrl3,

        // Email engagement fields - set defaults
        [SalesListingFields.Send_Engagement_Email__c]: false,
        [SalesListingFields.Generate_Engagement_Campaign__c]: false,

        // Sync origin marker for loop prevention (bidirectional sync)
        [SalesListingFields.Last_Sync_Origin__c]: `WT_${Date.now()}`,
    };
}

// Map WasteTrade offer to Salesforce custom Offers__c object
export async function mapOfferToSalesforceOffer(
    offer: Offers,
    repositories: {
        listingsRepository: any;
        userRepository: any;
        companiesRepository: any;
        companyLocationsRepository: any;
    },
): Promise<Record<string, unknown>> {
    // Fetch related data for comprehensive mapping
    let listing;
    let buyerUser;
    let sellerUser;
    let buyerCompany;
    let sellerCompany;
    let buyerLocation;
    let sellerLocation;

    try {
        // Fetch listing details
        if (offer.listingId) {
            try {
                listing = await repositories.listingsRepository.findById(offer.listingId);
            } catch (error) {
                SalesforceLogger.warn(
                    `⚠️  Listing ${offer.listingId} not found for offer ${offer.id}, skipping listing details`,
                );
                listing = null;
            }
        }

        // Fetch buyer details
        if (offer.buyerUserId) {
            try {
                buyerUser = await repositories.userRepository.findById(offer.buyerUserId);
            } catch (error) {
                SalesforceLogger.warn(
                    `⚠️  Buyer user ${offer.buyerUserId} not found for offer ${offer.id}, skipping buyer user details`,
                );
                buyerUser = null;
            }
        }
        if (offer.buyerCompanyId) {
            try {
                buyerCompany = await repositories.companiesRepository.findById(offer.buyerCompanyId);
            } catch (error) {
                SalesforceLogger.warn(
                    `⚠️  Buyer company ${offer.buyerCompanyId} not found for offer ${offer.id}, skipping buyer company details`,
                );
                buyerCompany = null;
            }
        }
        if (offer.buyerLocationId) {
            try {
                buyerLocation = await repositories.companyLocationsRepository.findById(offer.buyerLocationId);
            } catch (error) {
                SalesforceLogger.warn(
                    `⚠️  Buyer location ${offer.buyerLocationId} not found for offer ${offer.id}, skipping buyer location details`,
                );
                buyerLocation = null;
            }
        }

        // Fetch seller details
        if (offer.sellerUserId) {
            try {
                sellerUser = await repositories.userRepository.findById(offer.sellerUserId);
            } catch (error) {
                SalesforceLogger.warn(
                    `⚠️  Seller user ${offer.sellerUserId} not found for offer ${offer.id}, skipping seller user details`,
                );
                sellerUser = null;
            }
        }
        if (offer.sellerCompanyId) {
            try {
                sellerCompany = await repositories.companiesRepository.findById(offer.sellerCompanyId);
            } catch (error) {
                SalesforceLogger.warn(
                    `⚠️  Seller company ${offer.sellerCompanyId} not found for offer ${offer.id}, skipping seller company details`,
                );
                sellerCompany = null;
            }
        }
        if (offer.sellerLocationId) {
            try {
                sellerLocation = await repositories.companyLocationsRepository.findById(offer.sellerLocationId);
            } catch (error) {
                SalesforceLogger.warn(
                    `⚠️  Seller location ${offer.sellerLocationId} not found for offer ${offer.id}, skipping seller location details`,
                );
                sellerLocation = null;
            }
        }
    } catch (error) {
        SalesforceLogger.warn('⚠️  Unexpected error fetching related data for offer mapping:', error);
        // Continue with null values for missing related data
    }

    return {
        [OffersFields.Name]: addEnvironmentPrefix(`Offer ${offer.id}`),
        [OffersFields.WasteTrade_Offer_Id__c]: offer.id ? addEnvironmentPrefixToExternalId(offer.id.toString()) : undefined,

        // FIXED: Use existing Salesforce fields to avoid duplicates
        [OffersFields.listing__c]: offer.listingId ? addEnvironmentPrefixToExternalId(offer.listingId.toString()) : undefined,
        [OffersFields.Related_Listing__c]: offer.listingId ? addEnvironmentPrefixToExternalId(offer.listingId.toString()) : undefined,

        // Quantity and pricing
        [OffersFields.Quantity__c]: formatNumericValue(offer.quantity),
        [OffersFields.Offered_Price_Per_Unit__c]: formatCurrencyValue(offer.offeredPricePerUnit),
        [OffersFields.Total_Price__c]: formatCurrencyValue(offer.totalPrice),
        [OffersFields.Currency__c]: mapCurrency(offer.currency),

        // Status and state
        [OffersFields.Offer_Status__c]: mapOfferStatus(offer.status, false),
        [OffersFields.Offer_State__c]: offer.state,

        // Communication
        [OffersFields.Message__c]: offer.message ? offer.message.substring(0, 255) : undefined,

        // Dates
        [OffersFields.Earliest_Delivery_Date__c]: offer.earliestDeliveryDate
            ? new Date(offer.earliestDeliveryDate).toISOString().split('T')[0]
            : undefined,
        [OffersFields.Latest_Delivery_Date__c]: offer.latestDeliveryDate
            ? new Date(offer.latestDeliveryDate).toISOString().split('T')[0]
            : undefined,
        [OffersFields.Expires_At__c]: offer.expiresAt ? new Date(offer.expiresAt).toISOString() : undefined,
        [OffersFields.Created_Date__c]: offer.createdAt ? new Date(offer.createdAt).toISOString() : undefined,

        // Logistics and terms
        [OffersFields.Incoterms__c]: offer.incoterms,
        [OffersFields.Shipping_Port__c]: offer.shippingPort,
        [OffersFields.Needs_Transport__c]: offer.needsTransport,

        // REUSE EXISTING: Use existing bid fields
        [OffersFields.bid_status__c]: mapOfferStatus(offer.status, false),
        [OffersFields.bid_currency__c]: mapCurrency(offer.currency),
        [OffersFields.bid_value__c]: formatCurrencyValue(offer.offeredPricePerUnit),
        [OffersFields.bid_accepted__c]: offer.status === OfferStatusEnum.ACCEPTED,

        // Buyer information
        [OffersFields.Buyer_Country__c]: offer.buyerCountry,
        [OffersFields.Buyer_User_Id__c]: offer.buyerUserId
            ? addEnvironmentPrefixToExternalId(offer.buyerUserId.toString())
            : undefined,
        [OffersFields.Buyer_Full_Name__c]: buyerUser ? `${buyerUser.firstName} ${buyerUser.lastName}` : undefined,
        [OffersFields.Buyer_Company__c]: buyerCompany ? buyerCompany.name : undefined,
        [OffersFields.Buyer_Company_Id__c]: offer.buyerCompanyId
            ? addEnvironmentPrefixToExternalId(offer.buyerCompanyId.toString())
            : undefined,

        // Buyer location details
        [OffersFields.Buyer_Location__c]: buyerLocation ? buyerLocation.locationName : undefined,
        [OffersFields.Buyer_Location_Id__c]: offer.buyerLocationId
            ? addEnvironmentPrefixToExternalId(offer.buyerLocationId.toString())
            : undefined,

        // warehouse_address__c contains buyer's delivery location
        [OffersFields.warehouse_address__c]: buyerLocation
            ? `${buyerLocation.locationName || ''}\n${buyerLocation.addressLine || ''}${buyerLocation.street ? ', ' + buyerLocation.street : ''}\n${buyerLocation.city || ''}, ${buyerLocation.country || ''}`.trim()
            : undefined,

        // Pickup/seller and delivery/buyer location addresses
        [OffersFields.Pickup_Location_Address__c]: sellerLocation
            ? `${sellerLocation.addressLine || ''}${sellerLocation.street ? ', ' + sellerLocation.street : ''}, ${sellerLocation.city || ''}, ${sellerLocation.country || ''}`.trim()
            : undefined,
        [OffersFields.Delivery_Location_Address__c]: buyerLocation
            ? `${buyerLocation.addressLine || ''}${buyerLocation.street ? ', ' + buyerLocation.street : ''}, ${buyerLocation.city || ''}, ${buyerLocation.country || ''}`.trim()
            : undefined,

        // Seller information
        [OffersFields.Seller_Country__c]: offer.sellerCountry,
        [OffersFields.Seller_User_Id__c]: offer.sellerUserId
            ? addEnvironmentPrefixToExternalId(offer.sellerUserId.toString())
            : undefined,
        [OffersFields.Seller_Full_Name__c]: sellerUser ? `${sellerUser.firstName} ${sellerUser.lastName}` : undefined,
        [OffersFields.Seller_Company__c]: sellerCompany ? sellerCompany.name : undefined,
        [OffersFields.Seller_Company_Id__c]: offer.sellerCompanyId
            ? addEnvironmentPrefixToExternalId(offer.sellerCompanyId.toString())
            : undefined,

        // REUSE EXISTING: Use existing fields for location details
        [OffersFields.Seller_Location__c]: sellerLocation ? sellerLocation.locationName : undefined,
        [OffersFields.Seller_Location_Id__c]: offer.sellerLocationId
            ? addEnvironmentPrefixToExternalId(offer.sellerLocationId.toString())
            : undefined,

        // Material information from listing
        [OffersFields.Material_Name__c]: listing ? buildMaterialName(listing) : undefined,
        [OffersFields.Material_Type__c]: listing?.materialType,
        [OffersFields.Material_Packing__c]: listing?.materialPacking,

        // REUSE EXISTING: Use existing fields for packaging and weight
        [OffersFields.Material_Weight__c]: listing ? formatNumericValue(listing.materialWeightPerUnit || listing.quantity) : undefined,

        // Number of loads (calculated from quantity if available)
        [OffersFields.number_of_loads_bid_on__c]: listing?.materialWeightPerUnit
            ? calculateSafeNumberOfLoads(offer.quantity, listing.materialWeightPerUnit)
            : calculateSafeNumberOfLoads(offer.quantity, listing?.quantity),

        // Rejection information
        [OffersFields.Rejection_Reason__c]: offer.rejectionReason ? offer.rejectionReason.substring(0, 255) : undefined,
        [OffersFields.Rejection_Source__c]: offer.rejectionSource,

        // Admin tracking
        [OffersFields.Rejected_By_User_Id__c]: offer.rejectedByUserId
            ? addEnvironmentPrefixToExternalId(offer.rejectedByUserId.toString())
            : undefined,
        [OffersFields.Accepted_By_User_Id__c]: offer.acceptedByUserId
            ? addEnvironmentPrefixToExternalId(offer.acceptedByUserId.toString())
            : undefined,
        [OffersFields.Accepted_At__c]: offer.acceptedAt ? new Date(offer.acceptedAt).toISOString() : undefined,

        // REUSE EXISTING: Use existing admin and profile fields
        [OffersFields.wt_offer_admin__c]: offer.acceptedByUserId
            ? `Accepted by: ${offer.acceptedByUserId}`
            : offer.rejectedByUserId
              ? `Rejected by: ${offer.rejectedByUserId}`
              : undefined,
        [OffersFields.bidder_profile__c]:
            buyerUser && buyerCompany
                ? `${buyerUser.firstName} ${buyerUser.lastName} - ${buyerCompany.name}${buyerLocation ? ` (${buyerLocation.locationName})` : ''}`.substring(
                      0,
                      255,
                  )
                : undefined,
        [OffersFields.bid_final_value__c]: offer.status === OfferStatusEnum.ACCEPTED && offer.totalPrice ? offer.totalPrice : undefined,

        // REUSE EXISTING: Consolidate additional info in post_notes__c
        [OffersFields.post_notes__c]: (() => {
            const notes = [];
            if (listing?.incoterms) notes.push(`Incoterms: ${listing.incoterms}`);
            if (listing?.materialWeightPerUnit) notes.push(`Weight/Load: ${listing.materialWeightPerUnit}`);
            if (listing?.materialRemainInCountry) notes.push('Material restricted to country');
            if (offer.needsTransport) notes.push('Transport required');
            return notes.length > 0 ? notes.join(' | ').substring(0, 255) : undefined;
        })(),

        // REUSE EXISTING: Link to listing
        [OffersFields.listing_link__c]: listing
            ? `${process.env.FRONTEND_URL ?? 'https://app.wastetrade.com'}/listing/${listing.id}`
            : undefined,

        // Sync origin marker for loop prevention (bidirectional sync)
        [OffersFields.Last_Sync_Origin__c]: `WT_${Date.now()}`,
    };
}

// Map WasteTrade company document to Salesforce Document
export function mapCompanyDocumentToSalesforceDocument(doc: CompanyDocuments): Record<string, unknown> {
    return {
        [DocumentFields.Name]: addEnvironmentPrefix(doc.documentName),
        [DocumentFields.WasteTrade_Document_Id__c]: doc.id ? addEnvironmentPrefixToExternalId(doc.id.toString()) : undefined,
        [DocumentFields.Document_Type__c]: doc.documentType,
        [DocumentFields.Document_URL__c]: doc.documentUrl,
        [DocumentFields.Document_Status__c]: doc.status,
        [DocumentFields.Uploaded_By__c]: doc.uploadedByUserId
            ? addEnvironmentPrefixToExternalId(doc.uploadedByUserId.toString())
            : undefined,
        [DocumentFields.Reviewed_By__c]: doc.reviewedByUserId
            ? addEnvironmentPrefixToExternalId(doc.reviewedByUserId.toString())
            : undefined,
        [DocumentFields.Rejection_Reason__c]: doc.rejectionReason,
        [DocumentFields.Expiry_Date__c]: convertDateToSalesforceFormat(doc.expiryDate),
        [DocumentFields.Reviewed_At__c]: doc.reviewedAt ? new Date(doc.reviewedAt).toISOString() : undefined,
        [DocumentFields.Created_Date__c]: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    };
}

// Map WasteTrade company location document to Salesforce Document
export function mapLocationDocumentToSalesforceDocument(doc: CompanyLocationDocuments): Record<string, unknown> {
    return {
        [DocumentFields.Name]: addEnvironmentPrefix(doc.documentName),
        [DocumentFields.WasteTrade_Document_Id__c]: doc.id ? addEnvironmentPrefixToExternalId(doc.id.toString()) : undefined,
        [DocumentFields.Document_Type__c]: doc.documentType,
        [DocumentFields.Document_URL__c]: doc.documentUrl,
        [DocumentFields.Document_Status__c]: doc.status,
        [DocumentFields.Uploaded_By__c]: doc.uploadedByUserId
            ? addEnvironmentPrefixToExternalId(doc.uploadedByUserId.toString())
            : undefined,
        [DocumentFields.Reviewed_By__c]: doc.reviewedByUserId
            ? addEnvironmentPrefixToExternalId(doc.reviewedByUserId.toString())
            : undefined,
        [DocumentFields.Rejection_Reason__c]: doc.rejectionReason,
        [DocumentFields.Expiry_Date__c]: convertDateToSalesforceFormat(doc.expiryDate),
        [DocumentFields.Reviewed_At__c]: doc.reviewedAt ? new Date(doc.reviewedAt).toISOString() : undefined,
        [DocumentFields.Created_Date__c]: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    };
}

// Map WasteTrade listing to Salesforce Wanted Listing (for wanted listings)
export function mapListingToWantedListing(listing: Listings): Record<string, unknown> {
    return {
        [WantedListingFields.Name]: listing.title
            ? addEnvironmentPrefix(listing.title)
            : addEnvironmentPrefix(`Wanted Listing ${listing.id}`),
        [WantedListingFields.WasteTrade_Listing_Id__c]: listing.id ? addEnvironmentPrefixToExternalId(listing.id.toString()) : undefined,
        [WantedListingFields.Wt_Author_ID__c]: listing.createdByUserId
            ? addEnvironmentPrefixToExternalId(listing.createdByUserId.toString())
            : undefined,
        [WantedListingFields.Company_Name__c]: listing.title ? addEnvironmentPrefix(listing.title) : addEnvironmentPrefix('Company'),
        [WantedListingFields.Material_Group__c]: listing.materialType,
        [WantedListingFields.Material_Type__c]: listing.materialType,
        [WantedListingFields.Quantity__c]: formatNumericValue(listing.quantity),
        [WantedListingFields.How_its_packaged__c]: listing.materialPacking,
        [WantedListingFields.Available_From__c]: listing.startDate?.toISOString(),
        [WantedListingFields.Comments__c]: listing.description,
        [WantedListingFields.Listing_Status__c]: mapListingStatus(listing.status),
        [WantedListingFields.Created_Date__c]: listing.createdAt?.toISOString(),
        // Sync origin marker for loop prevention (bidirectional sync)
        [WantedListingFields.Last_Sync_Origin__c]: `WT_${Date.now()}`,
    };
}

// Map WasteTrade haulage offer to Salesforce Haulage_Offers__c object
export async function mapHaulageOfferToSalesforce(
    haulageOffer: HaulageOffers,
    repositories: {
        offersRepository: any;
        listingsRepository: any;
        userRepository: any;
        companiesRepository: any;
        companyLocationsRepository: any;
    },
): Promise<Record<string, unknown>> {
    // Fetch related data
    let offer;
    let listing;
    let haulierUser;
    let haulierCompany;
    let buyerUser;
    let sellerUser;
    let buyerCompany;
    let sellerCompany;

    try {
        // Fetch the parent offer
        if (haulageOffer.offerId) {
            try {
                offer = await repositories.offersRepository.findById(haulageOffer.offerId);

                // Fetch listing from offer
                if (offer?.listingId) {
                    listing = await repositories.listingsRepository.findById(offer.listingId);
                }

                // Fetch buyer details from offer
                if (offer?.buyerUserId) {
                    buyerUser = await repositories.userRepository.findById(offer.buyerUserId);
                }
                if (offer?.buyerCompanyId) {
                    buyerCompany = await repositories.companiesRepository.findById(offer.buyerCompanyId);
                }

                // Fetch seller details from offer
                if (offer?.sellerUserId) {
                    sellerUser = await repositories.userRepository.findById(offer.sellerUserId);
                }
                if (offer?.sellerCompanyId) {
                    sellerCompany = await repositories.companiesRepository.findById(offer.sellerCompanyId);
                }
            } catch (error) {
                SalesforceLogger.warn(`⚠️  Offer ${haulageOffer.offerId} not found for haulage offer ${haulageOffer.id}`);
            }
        }

        // Fetch haulier details
        if (haulageOffer.haulierUserId) {
            try {
                haulierUser = await repositories.userRepository.findById(haulageOffer.haulierUserId);
            } catch (error) {
                SalesforceLogger.warn(`⚠️  Haulier user ${haulageOffer.haulierUserId} not found`);
            }
        }
        if (haulageOffer.haulierCompanyId) {
            try {
                haulierCompany = await repositories.companiesRepository.findById(haulageOffer.haulierCompanyId);
            } catch (error) {
                SalesforceLogger.warn(`⚠️  Haulier company ${haulageOffer.haulierCompanyId} not found`);
            }
        }
    } catch (error) {
        SalesforceLogger.warn('⚠️  Error fetching related data for haulage offer mapping:', error);
    }

    return {
        // Standard fields
        [HaulageOffersFields.Name]: addEnvironmentPrefix(`Haulage Offer ${haulageOffer.id}`),

        // External ID for upsert
        [HaulageOffersFields.WasteTrade_Haulage_Offers_ID__c]: haulageOffer.id
            ? addEnvironmentPrefixToExternalId(haulageOffer.id.toString())
            : undefined,

        // Link to parent offer and listing (using existing fields)
        [HaulageOffersFields.bid_id__c]: haulageOffer.offerId ? addEnvironmentPrefixToExternalId(haulageOffer.offerId.toString()) : undefined,
        [HaulageOffersFields.listing_id__c]: offer?.listingId ? addEnvironmentPrefixToExternalId(offer.listingId.toString()) : undefined,

        // Haulage details (using existing fields)
        // WT only uses Trailer - always set trailer_or_container__c to 'Trailer' and use trailer_type__c
        [HaulageOffersFields.trailer_or_container__c]: mapTrailerOrContainer(haulageOffer.trailerContainerType),
        [HaulageOffersFields.trailer_type__c]: mapTrailerType(haulageOffer.trailerContainerType),
        [HaulageOffersFields.container_type__c]: undefined, // WT doesn't use containers
        [HaulageOffersFields.Customs_Clearance__c]: mapCustomsClearance(haulageOffer.completingCustomsClearance) as string,
        [HaulageOffersFields.Transport_Provider__c]: mapTransportProvider(haulageOffer.transportProvider),

        // Pricing (using existing fields)
        // Note: haulage__c and haulage_total__c are STRING fields in Salesforce, not currency
        [HaulageOffersFields.haulage__c]: haulageOffer.haulageCostPerLoad?.toString(),
        [HaulageOffersFields.haulage_currency__c]: mapCurrency(haulageOffer.currency),
        [HaulageOffersFields.haulage_total__c]: haulageOffer.haulageTotal?.toString(),
        [HaulageOffersFields.destination_charges__c]: undefined,
        [HaulageOffersFields.haulage_extras__c]: haulageOffer.customsFee ? `Customs fee: ${haulageOffer.customsFee}` : undefined,

        // Dates
        [HaulageOffersFields.suggested_collection_date__c]: haulageOffer.suggestedCollectionDate
            ? new Date(haulageOffer.suggestedCollectionDate).toISOString().split('T')[0]
            : undefined,
        [HaulageOffersFields.expected__c]: mapExpectedTransitTime(haulageOffer.expectedTransitTime),
        [HaulageOffersFields.demurrage__c]: mapDemurrage(haulageOffer.demurrageAtDestination),

        // Status (using existing fields)
        // Show listing terminal status (Sold/Expired) when applicable, otherwise haulage offer status
        [HaulageOffersFields.haulier_listing_status__c]: listing?.status === ListingStatus.SOLD
            ? HaulageOffersHaulierListingStatusValues.Sold
            : listing?.status === ListingStatus.EXPIRED
                ? HaulageOffersHaulierListingStatusValues.Expired
                : mapHaulageOfferStatus(haulageOffer.status),
        [HaulageOffersFields.offer_accepted__c]: haulageOffer.status === HaulageOfferStatus.ACCEPTED,
        [HaulageOffersFields.offer_rejected__c]: haulageOffer.status === HaulageOfferStatus.REJECTED,
        [HaulageOffersFields.listing_sold__c]: listing?.status === ListingStatus.SOLD,

        // Rejection
        [HaulageOffersFields.haulage_rejection_reason__c]: haulageOffer.rejectionReason || haulageOffer.customRejectionReason,

        // Admin and notes (using existing fields)
        [HaulageOffersFields.wt_haulage_admin__c]: haulageOffer.assignedAdminId ? `Admin ID: ${haulageOffer.assignedAdminId}` : undefined,
        [HaulageOffersFields.haulage_notes__c]: haulageOffer.notes,
        [HaulageOffersFields.post_notes__c]: (() => {
            const notes = [];
            if (haulageOffer.adminMessage) notes.push(`Admin: ${haulageOffer.adminMessage}`);
            if (haulageOffer.numberOfLoads) notes.push(`Loads: ${haulageOffer.numberOfLoads}`);
            if (haulageOffer.quantityPerLoad) notes.push(`Qty/Load: ${haulageOffer.quantityPerLoad}`);
            if (haulageOffer.shippedLoads) notes.push(`Shipped: ${haulageOffer.shippedLoads}`);
            if (listing?.materialType) notes.push(`Material: ${listing.materialType}`);
            return notes.length > 0 ? notes.join(' | ').substring(0, 255) : undefined;
        })(),

        // SO details (consolidate info)
        [HaulageOffersFields.so_details__c]: (() => {
            const details = [];
            if (buyerCompany) details.push(`Buyer: ${buyerCompany.name}`);
            if (sellerCompany) details.push(`Seller: ${sellerCompany.name}`);
            if (haulierCompany) details.push(`Haulier: ${haulierCompany.name}`);
            return details.length > 0 ? details.join(' | ').substring(0, 255) : undefined;
        })(),

        // Sync origin marker for loop prevention (bidirectional sync)
        [HaulageOffersFields.Last_Sync_Origin__c]: `WT_${Date.now()}`,
    };
}

// Map WasteTrade haulage load to Salesforce Haulage_Loads__c object
// Only use fields that exist in SF (see docs/salesforce/fields/Haulage_Loads.md)
export function mapHaulageLoadToSalesforce(load: any, haulageOffer?: HaulageOffers): Record<string, unknown> {
    return {
        // Standard fields
        [HaulageLoadsFields.Name]: addEnvironmentPrefix(`Load ${load.loadNumber || load.id}`),

        // TODO: Link to parent haulage offer (lookup field) - can not sync with id for lookup field
        // Haulage_Offer__c: haulageOffer?.salesforceId,

        // WasteTrade IDs for reference
        [HaulageLoadsFields.WasteTrade_Load_Id__c]: load.id ? addEnvironmentPrefixToExternalId(load.id.toString()) : undefined,
        // haulage_bid_id__c must match WasteTrade_Haulage_Offers_ID__c format (with env prefix)
        // This allows SF webhook to find parent offer by: WHERE WasteTrade_Haulage_Offers_ID__c = :load.haulage_bid_id__c
        [HaulageLoadsFields.haulage_bid_id__c]: haulageOffer?.id ? addEnvironmentPrefixToExternalId(haulageOffer.id.toString()) : undefined,

        // Load details (existing fields in SF)
        [HaulageLoadsFields.load_number__c]: load.loadNumber,
        [HaulageLoadsFields.collection_date__c]: load.collectionDate
            ? new Date(load.collectionDate).toISOString().split('T')[0]
            : undefined,
        [HaulageLoadsFields.gross_weight__c]: load.grossWeight?.toString(), // SF field is string type
        [HaulageLoadsFields.pallet_weight__c]: load.palletWeight?.toString(), // SF field is string type
        [HaulageLoadsFields.load_status__c]: mapLoadStatus(load.loadStatus),

        // Sync origin marker for loop prevention (bidirectional sync)
        [HaulageLoadsFields.Last_Sync_Origin__c]: `WT_${Date.now()}`,
    };
}
