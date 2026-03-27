import dayjs from 'dayjs';
import { MyUserProfile } from '../authentication-strategies/type';
import { FE_BASE_URL } from '../config';
import { ListingType, MaterialType } from '../enum';
import { Companies, CompanyLocations, Listings, Offers, User } from '../models';

export function getResetPasswordEmailTemplate(user: User, resetPasswordUrl: string, isCreatedAdmin: boolean = false) {
    let html = `
        <p>Hi ${user.firstName} ${user.lastName},</p></br>
        <p>Someone has requested a new password for the following account on WasteTrade:</p></br>
        <p>Username: ${user.username}</p></br>
        <p>If you did not make this request, just ignore this email.</p></br>
        <p>To reset your password, visit the following link:</p></br>
        <p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a></p></br>
    `;

    if (isCreatedAdmin) {
        html = `
            <p>Hi ${user.firstName},</p></br>
            <p>Welcome to WasteTrade. Your admin has created an account for you.</p></br>
            <p>To get started, please set your password using <a href="${resetPasswordUrl}">this secure link</a>.</p></br>
            <p>This link does not expire. It will remain valid until you successfully set your password, after which it will be automatically invalidated.</p></br>
            <p>If you didn't expect this email, you can safely ignore it. Your account won't be accessible until a password is set.</p></br>
            <p>
                <div>Best regards,</div>
                <div>The WasteTrade Team</div>
            </p>
        `;
    }

    return html;
}

export function getAdminNotificationTemplate(company: Companies) {
    return `
    <p>Hi Admin,</p></br>
    <p>A new Company has finished onboarding process on WasteTrade:</p></br>
    <p>Company Id: ${company.id}</p>
    <p>Company Name: ${company.name}</p></br>
    <p>Company Registration Number: ${company.registrationNumber}</p></br>
    <p>Please check documents of ${company.name} in the admin pannel!</p></br>
    <p>Thank you!</p></br>
    `;
}

export function getEditProfileEmailTemplate(user: User) {
    return `
    <p>Dear ${user.firstName} ${user.lastName},</p></br>
    <p>Your profile information has successfully been updated.</p></br>
    <p>If you did not make these changes, please get in touch with our support team immediately to secure your account.</p></br>
    <p>Thank you for keeping your information up to date and helping us provide you with the best service possible.</p></br>
    <p>
        <div>Best regards,</div>
        <div>The WasteTrade Team</div>
    </p>
    
  `;
}

export function getOfferAcceptEmailTemplate(offer: Offers, user: User) {
    return `
    <p>Hi ${user.firstName} ${user.lastName},</p></br>
    <p>This is a notification email that your offer has been approved by admin</p></br>
    <p>Offer Id: ${offer?.id}</p></br>
    <p>Offer Price: ${offer?.offeredPricePerUnit}</p></br>
    <p>Offer Quantity: ${offer?.quantity}</p></br>
    <p>Offer Currency: ${offer?.currency}</p></br>
    <p>Offer Delivery Earliest Date: ${offer?.earliestDeliveryDate}</p></br>
    <p>Offer Delivery Latest Date: ${offer?.latestDeliveryDate}</p></br>
  `;
}

export function getOfferRejectionEmailTemplate(offer: Offers, user: User, rejectionReason?: string) {
    const reason = rejectionReason ?? 'Your offer does not meet the current requirements';
    return `
    <p>Hi ${user.firstName} ${user.lastName},</p></br>
    <p>This is a notification email that your offer has been rejected by admin</p></br>
    <p>Rejection Reason: ${reason}</p></br>
    <p>Offer Id: ${offer?.id}</p></br>
    <p>Offer Price: ${offer?.offeredPricePerUnit}</p></br>
    <p>Offer Quantity: ${offer?.quantity}</p></br>
    <p>Offer Currency: ${offer?.currency}</p></br>
    <p>Offer Delivery Earliest Date: ${offer?.earliestDeliveryDate}</p></br>
    <p>Offer Delivery Latest Date: ${offer?.latestDeliveryDate}</p></br>
  `;
}

export function getOfferRequestInformationEmailTemplate(offer: Offers, user: User, messageFromAdmin?: string) {
    const message = messageFromAdmin ?? 'Please check your offer and provide more information';
    return `
    <p>Hi ${user.firstName} ${user.lastName},</p></br>
    <p>This is a notification email that your offer has been requested by admin</p></br>
    <p>Message from admin: ${message}</p></br>
    <p>Offer Id: ${offer?.id}</p></br>
    <p>Offer Price: ${offer?.offeredPricePerUnit}</p></br>
    <p>Offer Quantity: ${offer?.quantity}</p></br>
    <p>Offer Currency: ${offer?.currency}</p></br>
    <p>Offer Delivery Earliest Date: ${offer?.earliestDeliveryDate}</p></br>
    <p>Offer Delivery Latest Date: ${offer?.latestDeliveryDate}</p></br>
    `;
}

export function getListingApprovalEmailTemplate(listing: Listings, user: User) {
    return `
    <p>Hi ${user.firstName} ${user.lastName},</p></br>
    <p>This is a notification email that your listing has been approved by admin</p></br>
    <p>Listing Id: ${listing?.id}</p></br>
    `;
}

export function getListingRejectionEmailTemplate(listing: Listings, user: User, rejectionReason?: string) {
    const reason = rejectionReason ?? 'Your listing does not meet the current requirements';
    return `
    <p>Hi ${user.firstName} ${user.lastName},</p></br>
    <p>This is a notification email that your listing has been rejected by admin</p></br>
    <p>Rejection Reason: ${reason}</p></br>
    <p>Listing Id: ${listing?.id}</p></br>
    `;
}

export function getListingRequestInformationEmailTemplate(listing: Listings, user: User, messageFromAdmin?: string) {
    const message = messageFromAdmin ?? 'Please check your listing and provide more information';
    return `
    <p>Hi ${user.firstName} ${user.lastName},</p></br>
    <p>This is a notification email that your listing has been requested by admin</p></br>
    <p>Message from admin: ${message}</p></br>
    <p>Listing Id: ${listing?.id}</p></br>
    `;
}

export function getListingExpiryWarningEmailTemplate(listing: Listings, user: User, daysRemaining: number) {
    const listingType = listing.listingType === ListingType.SELL ? 'Sales' : 'Wanted';
    return `
    <p>Hi ${user.firstName ?? ''} ${user.lastName ?? ''},</p></br>
    <p>This is a notification that your ${listingType} listing is about to expire.</p></br>
    <p>Listing Details:</p>
    <ul>
        <li>Listing ID: ${listing?.id ?? ''}</li>
        <li>Title: ${listing?.title ?? ''}</li>
        <li>Material Type: ${listing?.materialType ?? ''}</li>
        <li>Days Remaining: ${daysRemaining ?? ''}</li>
    </ul></br>
    <p>Your listing will expire automatically unless you take action to renew it.</p></br>
    <p>Please log in to your WasteTrade account to manage your listing.</p></br>
    <p>Thank you for using WasteTrade!</p></br>
    `;
}

export function getCompanyApprovedEmailTemplate(user: User): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 20px;">
              <div style="background-color: #00965B; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                  <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                      <svg width="32" height="32" viewBox="0 0 263 67" fill="currentColor" style="margin-right: 10px;">
                          <path d="M12.619 48.5449C12.7523 48.5447 12.8191 48.6113 12.8193 48.7446L12.8204 49.6046C12.8206 49.7379 12.754 49.8047 12.6207 49.8049L8.7007 49.8107C8.64737 49.8107 8.62074 49.8375 8.62081 49.8908L8.63744 62.3508C8.63762 62.4841 8.57104 62.5509 8.43771 62.5511L7.41771 62.5526C7.28437 62.5528 7.21762 62.4862 7.21744 62.3529L7.20081 49.8929C7.20074 49.8395 7.17403 49.8129 7.1207 49.813L3.36071 49.8185C3.22737 49.8187 3.16062 49.7522 3.16044 49.6188L3.15929 48.7588C3.15911 48.6255 3.22569 48.5587 3.35902 48.5585L12.619 48.5449ZM19.4907 52.2747C20.5574 52.2732 21.4045 52.5853 22.032 53.211C22.6728 53.8367 22.9939 54.6762 22.9953 55.7296L23.0041 62.3296C23.0043 62.4629 22.9377 62.5297 22.8044 62.5299L21.7844 62.5314C21.6511 62.5316 21.5843 62.465 21.5841 62.3317L21.5757 56.0117C21.5747 55.2783 21.3473 54.6787 20.8933 54.2127C20.4527 53.7467 19.879 53.5142 19.1724 53.5152C18.439 53.5163 17.846 53.7438 17.3933 54.1978C16.9406 54.6518 16.7147 55.2455 16.7157 55.9788L16.7241 62.3388C16.7243 62.4722 16.6577 62.5389 16.5244 62.5391L15.5044 62.5406C15.3711 62.5408 15.3043 62.4743 15.3042 62.3409L15.286 48.7409C15.2858 48.6076 15.3524 48.5409 15.4857 48.5407L16.5057 48.5391C16.6391 48.539 16.7058 48.6055 16.706 48.7389L16.7123 53.4789C16.7124 53.5055 16.7191 53.5255 16.7324 53.5388C16.7591 53.5521 16.7791 53.5454 16.7924 53.5187C17.3779 52.6912 18.2774 52.2765 19.4907 52.2747Z" fill="currentColor"/>
                          <path d="M63.5692 30.4384L59.4475 12.6039H59.3682L55.2464 30.4384H48.9053L41.7715 2.93359H48.9053L52.5515 20.8474H52.6307L56.6732 2.93359H62.0632L66.0264 20.9266H66.1057L69.8311 2.93359H76.9649L69.6726 30.4384H63.5692Z" fill="currentColor"/>
                          <path d="M93.6901 30.4393V28.2199H93.6108C92.7389 30.043 90.2818 31.1527 87.5075 31.1527C81.4041 31.1527 77.2031 26.3176 77.2031 20.135C77.2031 14.0316 81.6419 9.11719 87.5075 9.11719C90.044 9.11719 92.3426 10.1476 93.6108 12.05H93.6901V9.83059H99.8728V30.4393H93.6901ZM93.6901 20.0557C93.6901 17.1229 91.3122 14.8242 88.4587 14.8242C85.6051 14.8242 83.3857 17.2022 83.3857 20.135C83.3857 22.9885 85.6844 25.3664 88.5379 25.3664C91.4707 25.3664 93.6901 23.0677 93.6901 20.0557Z" fill="currentColor"/>
                          <path d="M18.2308 31.3086H15.2188V38.2046H18.2308V31.3086Z" fill="currentColor"/>
                          <path d="M3.09132 14.9017H15.2188V3.01206C8.87761 3.56691 3.8047 8.56057 3.09132 14.9017ZM18.1516 17.8345H0V16.4077C0 7.3716 7.37159 0 16.4077 0C16.487 0 16.5663 0 16.7248 0L18.1516 0.0792693V17.8345Z" fill="currentColor"/>
                          <path d="M3.09132 17.8351C3.8047 24.5726 9.51173 29.804 16.487 29.804C16.5663 29.804 16.6455 29.804 16.6455 29.804C23.4623 29.7248 29.0108 24.4933 29.8034 17.8351H3.09132ZM16.4077 32.8161C7.37159 32.8161 0 25.4445 0 16.4084V14.9023H32.8155V16.4084C32.8155 25.286 25.6024 32.6576 16.6455 32.8161C16.6455 32.8161 16.5663 32.8161 16.4077 32.8161Z" fill="currentColor"/>
                      </svg>
                      <h1 style="margin: 0; font-size: 28px;">WasteTrade</h1>
                  </div>
                  <p style="margin: 0; font-size: 16px;">The Global Waste Marketplace</p>
              </div>
              
              <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; border: 2px solid #e0e0e0;">
                  <div style="background-color: #00965B; color: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px auto; line-height: 60px; text-align: center;">
                      <span style="font-size: 30px;">✓</span>
                  </div>
                  
                  <h3 style="color: #00965B; font-size: 20px; margin-bottom: 10px;">Welcome to Wastetrade,</h3>
                  <h3 style="color: #00965B; font-size: 20px; margin-bottom: 20px;">You are now verified</h3>
                  
                  <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                      We are pleased to inform you that your WasteTrade account is now verified, and you have access to all features on our platform.
                  </p>
                  
                  <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                      With your account now verified, you can take advantage of all that WasteTrade has to offer. 
                      You are free to browse the marketplace, find materials of interest, request more information 
                      or samples, create listings of commodities you have for sales, and create Wanted listings 
                      for the commodities you desire.
                  </p>
                  
                  <p style="color: #333; line-height: 1.6; margin-bottom: 30px;">
                      You will be able to trade waste and recycled products with ease and security, thanks to 
                      WasteTrade's intuitive platform, internal haulage and compliance management, global user base, 
                      and thorough due diligence procedures.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${FE_BASE_URL || 'https://app.wastetrade.com'}" style="background-color: #00965B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                          GO TO THE PLATFORM
                      </a>
                  </div>
              </div>
              
              <div style="background-color: #00965B; color: white; padding: 30px; border-radius: 20px; margin-top: 20px; text-align: center;">
                  <div style="margin-bottom: 20px;">
                      <p style="margin: 0; font-weight: 500; font-size: 18px;">STAY CONNECTED</p>
                  </div>
                  
                  <div style="text-align: center; margin: 20px 0;">
                      <table style="margin: 0 auto;">
                          <tr>
                              <td style="padding: 0 10px;">
                                  <a href="https://www.instagram.com/_wastetrade" style="display: inline-block; text-decoration: none;">
                                      <img src="cid:group60" alt="Instagram" style="width: 58px; height: 58px;" />
                                  </a>
                              </td>
                              <td style="padding: 0 10px;">
                                  <a href="https://twitter.com/wastetrade" style="display: inline-block; text-decoration: none;">
                                      <img src="cid:group61" alt="Twitter" style="width: 58px; height: 58px;" />
                                  </a>
                              </td>
                              <td style="padding: 0 10px;">
                                  <a href="https://www.facebook.com/wastetrade" style="display: inline-block; text-decoration: none;">
                                      <img src="cid:group62" alt="Facebook" style="width: 58px; height: 58px;" />
                                  </a>
                              </td>
                              <td style="padding: 0 10px;">
                                  <a href="https://www.linkedin.com/company/wastetrade" style="display: inline-block; text-decoration: none;">
                                      <img src="cid:group63" alt="LinkedIn" style="width: 58px; height: 58px;" />
                                  </a>
                              </td>
                          </tr>
                      </table>
                  </div>
                  
                  <p style="margin: 10px 0 0 0; font-size: 14px; color: white;">
                      © 2025 WasteTrade, All rights reserved.
                  </p>
              </div>
              
              <div style="text-align: center; margin: 20px 0; color: #666;">
                  <p>Copyright © WasteTrade. All rights reserved.</p>
                  <p>Our mailing address is: <a href="mailto:info@wastetrade.com" style="color: #00965B;">info@wastetrade.com</a></p>
                  <p>This email has been sent to <a href="mailto:${user.email}" style="color: #00965B;">${user.email}</a></p>
                  <p>Want to change how you receive these emails?<br>
                     You can <a href="${FE_BASE_URL || 'https://app.wastetrade.com'}/account-settings" style="color: #00965B;">update your preferences</a> or <a href="${FE_BASE_URL || 'https://app.wastetrade.com'}/unsubscribe" style="color: #00965B;">unsubscribe</a> from this list.
                  </p>
              </div>
          </div>
      </div>
  `;
}

export function getCompanyRejectedEmailTemplate(user: User, rejectReason?: string) {
    const reason = rejectReason ?? 'Your application does not meet our current requirements';
    return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 20px;">
            <div style="background-color: #d32f2f; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 28px;">WasteTrade</h1>
                <p style="margin: 5px 0 0 0; font-size: 16px;">The Global Waste Marketplace</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; border: 2px solid #e0e0e0;">
                <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hi ${user.firstName} ${user.lastName},</h2>
                
                <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                    We regret to inform you that your <strong>WasteTrade</strong> account application has been rejected.
                </p>
                
                <div style="background-color: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0;">
                    <h3 style="color: #d32f2f; margin: 0 0 10px 0;">Rejection Reason:</h3>
                    <p style="color: #333; margin: 0; line-height: 1.5;">${reason}</p>
                </div>
                
                <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                    If you believe this decision was made in error or if you have additional information that may support your application, 
                    please contact our support team for further assistance.
                </p>
                
                <p style="color: #333; line-height: 1.6;">
                    Thank you for your interest in WasteTrade.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #666; font-size: 14px;">
                        For questions or support, please contact us at support@wastetrade.com
                    </p>
                </div>
            </div>
        </div>
    </div>
    `;
}

export function getCompanyRequestInformationEmailTemplate(user: User, messageFromAdmin?: string) {
    const message = messageFromAdmin ?? 'Please provide additional information to complete your application';
    const loginUrl = `${FE_BASE_URL}/login`;
    return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 20px;">
            <div style="background-color: #ff9800; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 28px;">WasteTrade</h1>
                <p style="margin: 5px 0 0 0; font-size: 16px;">The Global Waste Marketplace</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; border: 2px solid #e0e0e0;">
                <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hi ${user.firstName} ${user.lastName},</h2>
                
                <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                    We are reviewing your <strong>WasteTrade</strong> account application and require additional information to proceed.
                </p>
                
                <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
                    <h3 style="color: #ff9800; margin: 0 0 10px 0;">Message from Admin:</h3>
                    <p style="color: #333; margin: 0; line-height: 1.5;">${message}</p>
                </div>
                
                <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                    Please log in to your account and provide the requested information to continue the approval process. 
                    Our team will review your submission promptly.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginUrl}" style="background-color: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        UPDATE YOUR APPLICATION
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px; text-align: center;">
                    For questions or support, please contact us at support@wastetrade.com
                </p>
            </div>
        </div>
    </div>
    `;
}

export function getOfferStatusUpdatedEmailTemplate(offer: Offers, listing: Listings, user: User) {
    return `
        <p>Hi ${user.firstName} ${user.lastName},</p></br>
        <p>I'd like to provide a status update on the <strong>${listing.materialItem}</strong>.</p></br>
        <p>The Current Status is <strong>${offer.status}</strong>.</p></br>
        <p>Please feel free to reach out if you need further details or wish to discuss specific points.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getListingStatusUpdatedEmailTemplate(listing: Listings, user: User) {
    let listingName = '';

    switch (listing.materialType) {
        case MaterialType.METAL:
        case MaterialType.RUBBER:
            listingName = listing.materialItem ?? '';
            break;
        case MaterialType.FIBRE:
            listingName = `${listing.materialGrading} - ${listing.materialItem}`;
            break;
        case MaterialType.PLASTIC:
            listingName = `${listing.materialItem} - ${listing.materialForm} - ${listing.materialFinishing}`;
            break;
        case MaterialType.EFW:
            listingName = MaterialType.EFW.toUpperCase();
            break;

        default:
            listingName = listing.materialItem ?? '';
            break;
    }

    return `
        <p>Hi ${user.firstName} ${user.lastName},</p></br>
        <p>We're excited to let you know that a new <strong>${listing.materialItem}</strong> has just been added to our system</p></br>
        <p><strong>${listingName}</strong></p></br>
        <ul>
            <li>Material: ${listing.materialType}</li>
            <li>Load weight: ${(listing.quantity ?? 0) * (listing.materialWeightPerUnit ?? 0)}</li>
            <li>Availability : ${listing.remainingQuantity}</li>
            <li>Packaging: ${listing.materialPacking}</li>
            <li>Material Location: ${listing.locationOther}</li>
            <li>Added on: ${dayjs(listing.createdAt).format('DD/MM/YYYY')}</li>
        </ul>
        <p>View it now: <a href="${FE_BASE_URL}//wt_waste_listing/${listing.id}">${FE_BASE_URL}//wt_waste_listing/${listing.id}</a></p></br>
        <p>Stay tuned — we're constantly adding new opportunities to help you discover what matters most.</p></br>
        <p>If you have any questions or need assistance, feel free to contact us anytime.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getAccountVerificationRequiredEmailTemplate(user: User): string {
    return `
        <p>Dear ${user.firstName} ${user.lastName},</p></br>
        <p>Thank you for registering with WasteTrade.</p></br>
        <p>To verify your account we need you to make sure you have filled in all necessary fields and added the necessary documents:</p></br>
        <p>
            <span>Company registration number</span>
            <span>VAT Number</span>
            <span>Full address</span>
            <span>Upload any waste exemptions or environmental permits you have</span>
        </p></br>
        <p>Once you have added all information and your compliance documents, your account will be verified.</p></br>
        <p>You can then buy and sell materials with approved end users globally.</p></br>
        <p>If you have any questions, please do not hesitate to contact me.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getAccountVerificationApprovedEmailTemplate(user: User): string {
    return `
        <p>Dear ${user.firstName} ${user.lastName},</p></br>
        <p>Welcome to Wastetrade,</p></br>
        <p>You are now verified</p></br>
        <p>We are pleased to inform you that your WasteTrade account is now verified, and you have access to all features on our platform.</p></br>
        <p>With your account now verified, you can take advantage of all that WasteTrade has to offer. You are free to browse the marketplace, find materials of interest, request more information or samples, create listings of commodities you have for sales, and create Wanted listings for the commodities you desire. You will be able to trade waste and recycled products with ease and security, thanks to WasteTrade's intuitive platform, internal haulage and compliance management, global user base, and thorough due diligence procedures.</p></br>
        <p><a href="${FE_BASE_URL}">Go To The Platform</a></p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getCompleteAccountDraftEmailTemplate(draftUrl: string, userProfile: Partial<MyUserProfile>): string {
    return `
        <p>Dear${userProfile.firstName ? ` ${userProfile.firstName}` : 'User'}},</p></br>
        <p>You've saved your registration progress on WasteTrade. Use the link below to continue where you left off.</p></br>
        <p><a href="${draftUrl}">${draftUrl}</a></p></br>
        <p>What happens next</p>
        <ul>
            <li>Your link stays active for 31 days.</li>
            <li>You can use it multiple times until you submit your registration.</li>
            <li>If you save again later, we'll send you a new link, and the old one will stop working.</li>
        </ul>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getDocumentExpiryEmailTemplate(user: User, expiryDate: string) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>One of your documents is approaching expiry on ${expiryDate}.</br>
        <p>To keep your account in good standing, please review and update your document.</p></br>
        <p>If you've already updated this document, you can ignore this message. If you have questions, reply to this email or contact <a href="mailto:support@wastetrade.com">support@wastetrade.com</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getListingRenewedEmailTemplate(user: User, listingTitle: string, isManual: boolean = true) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>Your listing <strong>${listingTitle}</strong> has been renewed ${isManual ? 'manually' : 'automatically'}. To keep attracting buyers, please make sure your details and images are up to date.</br>
        <p>If you didn’t request this change, reply to this email or contact <a href="mailto:support@wastetrade.com">support@wastetrade.com</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getOfferApprovedEmailTemplate(user: User, listingTitle: string) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>Great news - the sale and haulage of ${listingTitle} has been approved. Buyer and haulage are confirmed.</br>
        <p>Next steps: review the agreed terms, prepare the required documents, and coordinate loading/collection as scheduled.</p></br>
        <p>If you have any questions, reply to this email or contact <a href="mailto:support@wastetrade.com">support@wastetrade.com</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getAccountArchivedEmailTemplate(user: User) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>We're letting you know that your WasteTrade account has been archived by an administrator. While archived, you won't be able to sign in or access the platform.</br>
        <p>If you believe this was a mistake or have any questions, reply to this message or contact <a href="mailto:support@wastetrade.com">support@wastetrade.com</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getHaulageOfferApprovedEmailTemplate(
    user: User,
    pickupLocation: Partial<CompanyLocations> | null,
    destinationLocation: Partial<CompanyLocations> | null,
) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>This is a notification that your haulage offer from ${pickupLocation?.country} to ${destinationLocation?.country} has been approved by admin. Wastetrade will be in touch shortly, all relevant documentation will be provided 3 days before the confirmed delivery date.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getHaulageOfferRejectedEmailTemplate(
    user: User,
    pickupLocation: Partial<CompanyLocations> | null,
    destinationLocation: Partial<CompanyLocations> | null,
    rejectionReason?: string,
) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>This is a notification that your haulage offer from ${pickupLocation?.country} to ${destinationLocation?.country} has been rejected by admin.</p></br>
        <p>Rejection reason: ${rejectionReason}</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getHaulageOfferRequestInformationEmailTemplate(
    user: User,
    pickupLocation: Partial<CompanyLocations> | null,
    destinationLocation: Partial<CompanyLocations> | null,
    message?: string,
) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>This is a notification that your haulage offer from ${pickupLocation?.country} to ${destinationLocation?.country} has been requested for more information by admin.</p></br>
        <p>Message from admin: ${message}</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getHaulageBidOpenForEditsEmailTemplate(user: User, haulageOffer: any, offer: any) {
    return `
        <p>Hi ${user.firstName} ${user.lastName},</p></br>
        <p>The buyer has opened your haulage bid for edits, allowing you to make changes and resubmit.</p></br>
        <p>Bid Details:</p>
        <p>• Bid ID: ${haulageOffer?.id}</p>
        <p>• Haulage Cost: ${haulageOffer?.haulageCostPerLoad} ${haulageOffer?.currency}</p>
        <p>• Suggested Collection Date: ${dayjs(haulageOffer?.suggestedCollectionDate).format('DD/MM/YYYY')}</p></br>
        <p>Please log in to your account to review and update your bid details as needed.</p></br>
        <p>If you have any questions about the requested changes, reply to this email or contact <a href="mailto:support@wastetrade.com">support@wastetrade.com</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getNewHaulageOpportunityEmailTemplate(user: User) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>A new haulage opportunity is available. Check out the available loads page and submit your offer.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getInvitedToJoinCompanyEmailTemplate(user: User, companyName: string, inviteUrl: string) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>You've been invited to join ${companyName} on WasteTrade.</p></br>
        <p>To get started, click <a href="${inviteUrl}">here</a> to set your password and join the company.</p></br>
        <p>Once you've joined, you'll be able to access your company workspace and start using WasteTrade.</p></br>
        <p>If you weren't expecting this, you can safely ignore this email.</p></br>
        <p>Need help? Reply to this message or contact <a href="mailto:support@wastetrade.com">support@wastetrade.com</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getCompanyAdminReceivRequestedJoinCompanyEmailTemplate(
    companyAdmin: { email: string; firstName: string; lastName: string },
    companyUser: { email: string; firstName: string; lastName: string },
    companyName: string,
    note: string,
) {
    const linkToIncomingRequests = `${FE_BASE_URL}/company-members/members`;
    return `
        <p>Hi ${companyAdmin.firstName},</p></br>
        <p>${companyUser.firstName} ${companyUser.lastName} (${companyUser.email}) requested to join ${companyName}.</p></br>
        <p>Notes: "${note}"</p></br>
        <p>Review the request here: <a href="${linkToIncomingRequests}">${linkToIncomingRequests}</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getCompanyAdminReceiveInviteAcceptedEmailTemplate(
    companyAdmin: { email: string; firstName: string; lastName: string },
    companyUser: { email: string; firstName: string; lastName: string; role: string },
    companyName: string,
) {
    const linkToMembers = `${FE_BASE_URL}/company-members/members`;
    return `
        <p>Hi ${companyAdmin.firstName},</p></br>
        <p>${companyUser.firstName} ${companyUser.lastName} has accepted the invitation and joined ${companyName} as ${companyUser.role}.</p></br>
        <p>You can review and manage members here: <a href="${linkToMembers}">${linkToMembers}</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getUserReceiveRejectedJoinCompanyEmailTemplate(
    user: { email: string; firstName: string; lastName: string },
    companyName: string,
    message: string,
) {
    const linkToMembers = `${FE_BASE_URL}/company-members/members`;
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>Your request to join ${companyName} was declined.</p></br>
        ${message ? `<p>${message}</p></br>` : ''}
        <p>If you believe this is an error, please contact the company admin or <a href="mailto:support@wastetrade.com">support@wastetrade.com</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getUserReceiveRoleChangeEmailTemplate(
    user: { email: string; firstName: string; lastName: string; role: string },
    companyName: string,
) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>Your role in ${companyName} is now ${user.role}. Your permissions and available actions have been updated.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}

export function getUserReceiveUnlinkedFromCompanyEmailTemplate(
    user: { email: string; firstName: string; lastName: string },
    companyName: string,
) {
    return `
        <p>Hi ${user.firstName},</p></br>
        <p>You've been removed from ${companyName}. You no longer have access to the company's listings, offers, or documents.</p></br>
        <p>Your personal account remains active on WasteTrade. If you need access again, please contact your company admin or <a href="mailto:support@wastetrade.com">support@wastetrade.com</a>.</p></br>
        <p>
            <div>Best regards,</div>
            <div>The WasteTrade Team</div>
        </p>
    `;
}
