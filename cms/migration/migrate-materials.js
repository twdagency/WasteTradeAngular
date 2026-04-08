import 'dotenv/config';
import axios from 'axios';

const REMOTE_URL = process.env.REMOTE_STRAPI_URL || 'https://cms-production-06af.up.railway.app';
const ADMIN_EMAIL = process.env.REMOTE_ADMIN_EMAIL || 'richard@twd.agency';
const ADMIN_PASSWORD = process.env.REMOTE_ADMIN_PASSWORD || '!nquisitioN666';

let jwt = null;

async function login() {
  const res = await axios.post(`${REMOTE_URL}/admin/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  jwt = res.data.data.token;
  return jwt;
}

function text(t, opts = {}) {
  return { type: 'text', text: t, ...opts };
}

function paragraph(children) {
  return { type: 'paragraph', children: Array.isArray(children) ? children : [children] };
}

function heading(level, t) {
  return { type: 'heading', level, children: [text(t)] };
}

const materials = [
  {
    title: 'Polyethylene Terephthalate (PET)',
    slug: 'pet-recycling',
    seoDescription: 'Buy & Sell PET plastic worldwide at WasteTrade. We specialise in PET Recycling in the UK, where you get the best prices for your PET plastic scrap materials.',
    content: [
      heading(1, 'PET Recycling'),
      paragraph([text('Buy & Sell PET plastic worldwide at WasteTrade. We specialise in PET Recycling in the UK, where you get the best prices for your PET plastic scrap materials.')]),
      heading(2, 'PET Recycling'),
      paragraph([text('The WasteTrade marketplace makes it easier than ever to access the most sustainable PET recycling services in the world. Through our fully-vetted global userbase, you gain direct exposure to the most reputable plastics reprocessors in the worldwide recycling industry. Through our platform, you will be connected directly with more potential PET recycling buyers than would ever be possible through traditional waste brokerage services.')]),
      paragraph([text('By connecting you directly with the buyers, WasteTrade also removes the need for you to go through a middleman – a waste broker. WasteTrade shows you the exact offer the end user makes you; you are no longer forced to trust that a waste broker is offering you prices that represent the true value of your materials. You also no longer have to trust that the broker is sending your materials to an ethical PET recycling company, as all recyclers on the WasteTrade platform have been fully vetted before being granted access to the marketplace.')]),
      paragraph([text('Creating your account on WasteTrade is totally free and you will be granted full access to the marketplace, just as soon as we complete our quick verification process – this usually happens within 24 hours. Creating listings on WasteTrade is also free and we charge no commissions on the materials you sell to PET recycling companies. WasteTrade is completely free to use, making it easier, more convenient and more profitable than it has ever been to recycle your plastic scrap.')]),
      heading(2, 'PET Plastic Recycling'),
      paragraph([text('There can be some variance in the exact process of PET plastic recycling from one recycler to the next, but the general process will remain the same. The first step is to sort through and remove all non-PET materials from the stock; any materials such as other polymers, metals, wood, cardboard and so on cannot be present during the recycling process.')]),
      paragraph([text('The second step in the PET plastic recycling process is to cleanse the PET to ensure there are no contaminating substances left on the plastic. These contaminants could be dirt or residual liquids, and they must be cleaned away otherwise the quality, and therefore the value, of the end product will diminish.')]),
      paragraph([text('The third and final step in the process of PET plastic recycling is shredding the material into small pieces so that it can be melted down and then shaped and cooled into recycled plastic pellet. This recycled pellet is then ready to be put back into manufacturing, keeping the valuable plastic resources out of landfill and in use within the economy.')]),
      heading(2, 'PET Bottle Recycling'),
      paragraph([text('Plastic beverage bottles are among the most common PET products found on the market; however, there is only around 3-15% recycled content currently being used in these bottles on average. Given that recycled content targets are becoming commonplace for drinks companies, with many of these businesses pledging to transition to 100% recycled content in their bottles, PET bottle recycling can be very lucrative for those who produce these waste streams.')]),
      paragraph([text('Given the rising demand from beverage companies for recycled material to go into the manufacturing of their bottles, recyclers are always in need of supply of this material. Therefore, they are always willing to pay good prices for PET waste. You can get the best value for your scrap bottles by selling them directly to the PET bottle recycling companies through the WasteTrade online marketplace.')]),
      heading(2, 'Recycling PET'),
      paragraph([text('Rather than recycling PET, many businesses choose to send their plastic waste to landfill or incineration. This is sometimes due to these businesses being unaware of the recycling options available to them, but is most often due to the convenience of it. Recycling PET can be a very complicated process, especially if exporting it overseas, and involves a large amount of red tape.')]),
      paragraph([text('However, thanks to WasteTrade, these obstacles no longer need to prevent businesses from receiving the environmental and financial benefits that come with recycling PET waste. WasteTrade handles all compliance and logistical issues and manages the entire process on behalf of the buyers and sellers to make recycling the most convenient means of waste disposal. Thanks to our secure transaction processing, you also no longer need to deal with the stress of chasing for payments. Recycling PET is safer, easier, faster and more profitable than ever before when using the WasteTrade online marketplace.')]),
    ],
  },
  {
    title: 'High-density Polyethylene (HDPE)',
    slug: 'hdpe-recycling',
    seoDescription: 'Buy & Sell HDPE plastic worldwide at WasteTrade. We specialise in HDPE Recycling in the UK, where you get the best prices for your HDPE plastic scrap materials.',
    content: [
      heading(1, 'HDPE Recycling'),
      paragraph([text('Buy & Sell HDPE plastic worldwide at WasteTrade. We specialise in HDPE Recycling in the UK, where you get the best prices for your HDPE plastic scrap materials.')]),
      heading(2, 'HDPE Recycling'),
      paragraph([text('HDPE recycling in the most sustainable way is now easier and more profitable than ever before thanks to the WasteTrade marketplace. We offer you, and the materials you have to sell, exposure to the global waste industry\'s most reputable recyclers, all of whom are fully vetted before being granted access to marketplace. The plastics you are looking to move onto HDPE recycling services will be available to far more potential buyers than could ever be achievable when using traditional brokerage firms.')]),
      paragraph([text('As well as making the process of HDPE recycling quick and effortless, WasteTrade also gives you the power to decide on the best offer for yourself. You need no longer worry if the prices your broker is showing you are representative of your materials\' true value, as the price WasteTrade shows you is the price they buyer is offering. Neither do you have to worry about whether your broker\'s end user is ethical, as all buyers on our platform have been through our verification process.')]),
      paragraph([text('WasteTrade does not take commissions or charge fees on materials sold to HDPE recycling services through the platform, so you keep all the money they sell for and don\'t have to split it with a middleman. Creating your WasteTrade account is completely free, and once we have completed our fast verification process, you will be granted full access to the marketplace and can begin selling your materials.')]),
      heading(2, 'HDPE Recycle'),
      paragraph([text('There are many reasons for a business to choose an HDPE recycle service to dispose of their waste, as opposed to disposing of it by incineration or landfill. The environmental benefits of this alone are numerous, such as reducing carbon emissions, minimising waste, preventing pollution and moving towards a circular economic business mode. As well as all of these, recyclers will actually pay businesses for their waste materials, unlike landfill and incineration sites who charge fees.')]),
      paragraph([text('Despite the financial and environmental incentives there for businesses to use an HDPE recycle service for their scrap materials, many of them still currently choose to pay for landfill or incineration. This is sometimes due to a simple lack of knowledge about their options for recycling, but more often it is due to the excessive amounts of red tape involved. There are many compliance and logistical issues that arise when sending plastic waste for recycling, and many businesses would rather pay for the convenience of incineration or landfill than deal with them all.')]),
      paragraph([text('However, with the entrance of WasteTrade into the industry, these issues no longer need prevent anyone from benefitting from HDPE recycle solutions for their plastic scrap. WasteTrade handles all logistics and compliance on behalf of the buyer and seller to remove these obstacles from the recycling process.')]),
      heading(2, 'HDPE Plastic Recycling'),
      paragraph([text('The exact process of HDPE plastic recycling can vary, but the general stages involved remain the same. The first step in HDPE plastic recycling is to separate out all non-HDPE substances from the HDPE, to ensure there are no contaminants present that would compromise the quality of the finished recycled product.')]),
      paragraph([text('The next step in the HDPE plastic recycling process is to separate the HDPE materials into grades, as HDPE can vary in durability and thickness. Once separated, the HDPE will be thoroughly cleaned to remove any residual contaminants, such as dirt or liquid. Once cleaned, the HDPE will be homogenised to guarantee that no other polymers are present.')]),
      paragraph([text('The final step in the HDPE plastic recycling process is to then shred the HDPE, melt it down, and then shape and cool it into recycled plastic pellet ready to go back into manufacturing.')]),
      heading(2, 'Recycle HDPE'),
      paragraph([text('Through WasteTrade, it has never been as easy or as rewarding for businesses to choose to recycle HDPE, rather than sending it to landfill or incineration. Our platform safely opens you up to our fully-vetted global userbase, so all you need do is create your listings and wait for the right offer to come in. Once you accept an offer, WasteTrade handles the entire process from there – just wait for our haulier to arrive, then load the materials.')]),
      paragraph([text('We remove from you the stress of chasing payments, as our secure transaction service ensures you receive the full amount. The buyer is required to make the payment for your materials to us before we release a vehicle to your site, then we release the payment to you as soon as the haulier has collected your materials. It does not need to be a laborious or time-consuming task to recycle HDPE anymore, thanks to the arrival of the WasteTrade global marketplace in the industry.')]),
    ],
  },
  {
    title: 'Low-Density Polyethylene (LDPE)',
    slug: 'ldpe-recycling',
    seoDescription: 'Buy & Sell LDPE plastic worldwide at WasteTrade. We specialise in LDPE Recycling in the UK, where you get the best prices for your LDPE plastic scrap materials.',
    content: [
      heading(1, 'LDPE Recycling'),
      paragraph([text('Buy & Sell LDPE plastic worldwide at WasteTrade. We specialise in LDPE Recycling in the UK, where you get the best prices for your LDPE plastic scrap materials.')]),
      heading(2, 'LDPE Recycling'),
      paragraph([text('Through WasteTrade, ethical LDPE recycling is now a quicker, simpler and more lucrative practice that it has ever been before. When selling through our marketplace, you expose your materials to our reliable, fully-vetted global user base. This opens up your plastic scrap to far more potential buyers, all of whom can offer your materials the most environmentally friendly LDPE recycling services.')]),
      paragraph([text('As well as making it easier for you to find the right buyer, WasteTrade also gives you the power to accept the right offer for yourself, rather than being reliant on a waste broker. You are no longer forced to trust that the LDPE recycling solutions your broker is offering you are the best solutions for you or for your materials. You know that all buyers on WasteTrade have been verified, and so can be trusted to be ethical, and the prices we show you are the actual prices being offered – which is simply not the case when using traditional brokerage services.')]),
      paragraph([text('It is completely free to create your account on WasteTrade, and you will be granted full access to the marketplace as soon as we have completed our quick verification process. We do not charge you fees to create listings, nor do we take commissions on any materials sold through the platform. WasteTrade is completely free to use and is the most trustworthy online platform to connect you with the most suitable outlets for your LDPE recycling needs.')]),
      heading(2, 'LDPE Plastic Recycling'),
      paragraph([text('The exact process of LDPE plastic recycling can vary from one recycler to the next, but the general stages remain the same. The first part of the process is to sort through the plastic to ensure that all non-LDPE materials have been removed, as other plastic types cannot be present for the recycling process.')]),
      paragraph([text('The second step in the LDPE plastic recycling process is the cleaning of the material to remove any contaminants from the stock. Removing contaminants such as dirt or residual liquid is a very important part of the process, as the presence of these substances would significantly reduce the quality, and therefore the value, of the end recycled product.')]),
      paragraph([text('The third and final stage in the process of LDPE plastic recycling is to shred the LDPE into small pieces before melting them to shape and cool into recycled plastic pellet, ready to go back into manufacturing.')]),
      heading(2, 'Recycle LDPE'),
      paragraph([text('Businesses looking to recycle LDPE waste can do so now with greater convenience than ever through the WasteTrade online marketplace. We take the burden of managing the entire process away from you; in making recycling the most convenient and most lucrative method of disposal for plastic waste, we are helping shift businesses, as well as the global waste industry, towards a more circular economic model.')]),
      paragraph([text('We also remove the stress of having to chase for payments from you as well, thanks to our secure transaction service. The buyer is required to release the payment to us before we send the vehicle to your site to collect the materials, then we release the funds to you as soon as the haulier has collected the plastic from your site. Through WasteTrade, it is now faster, easier, more convenient and more profitable to recycle LDPE waste than ever before.')]),
    ],
  },
  {
    title: 'Polypropylene (PP)',
    slug: 'pp-recycling',
    seoDescription: 'We connect buyers & sellers of Polypropylene around the world. Get the best prices for Polypropylene waste material throughout the world.',
    content: [
      heading(1, 'Polypropylene Recycling'),
      paragraph([text('We connect buyers & sellers of Polypropylene around the world. Get the best prices for Polypropylene waste material throughout the world.')]),
      heading(2, 'PP Recycling'),
      paragraph([text('Trustworthy PP recycling services have never been as easy to find as they are now thanks to the WasteTrade online marketplace. We verify all our users before granting them access to our platform, providing you with safe exposure to the global waste industry for the materials you have for sale. Through WasteTrade, you can reach far more ethical PP recycling outlets than you would ever be able to by using traditional waste brokerage firms.')]),
      paragraph([text('In providing you with this direct access, you are no longer forced to be dependent on waste brokers for PP recycling. You do not need to trust that the prices your broker is offering you are truthfully representative of the value of your materials, as the offer WasteTrade shows you is the offer the buyer has made. Neither do you have to trust that your broker is sending your materials to an ethical PP recycling company, as all WasteTrade users have had to meet the standards to pass our background check.')]),
      paragraph([text('This secure connection to the global waste industry can be accessed simply by creating a free account on WasteTrade. There are no fees to sign up, no fees to create listings, and no commissions are taken on materials sold through the marketplace. WasteTrade is completely free to use to make reliable PP recycling solutions as widely available as possible.')]),
      heading(2, 'Recycle PP'),
      paragraph([text('Despite the options available to businesses to recycle PP waste, many businesses still choose to send these materials to landfill or incineration. It is sometimes the case that these companies are not properly informed of all the options to recycle PP open to them. However, it is more often the case that these companies are choosing landfill or incineration due to all the red tape that comes with sending waste to recyclers – especially if exporting overseas.')]),
      paragraph([text('However, businesses no longer need to pay to send their materials to environmentally harmful waste disposal methods such as landfill and incineration. Thanks to WasteTrade, all barriers to ethical waste disposal are removed, as we handle all compliance and logistical issues on behalf of the buyers and sellers. It has never been quicker, easier or more profitable for companies to recycle PP waste than it is today because of WasteTrade.')]),
      heading(2, 'Recycling 5 PP UK'),
      paragraph([text('The exact process of recycling 5 PP UK can vary, depending on the methodology implemented by the specific recycler. However, the general steps involved will remain the same. The first step in the recycling 5 PP UK process is to sort the material, to ensure any non-PP materials, such as wood, metal, carboard or other plastics, are not present in the stock.')]),
      paragraph([text('The second step in the process of recycling 5 PP UK is to wash the material to remove any contaminants. These contaminants could be substances such as residual liquids or dirt on the materials, leftover from the use or storage of the PP; it is highly important that these contaminating substances are thoroughly cleansed as they will diminish the overall quality, and therefore value, of the end product.')]),
      paragraph([text('The final step in the recycling 5 PP UK process is to shred the PP into small enough pieces before then melting it down to be shaped and cooled into recycled plastic pellet. These recycled pellets are the ready to go back into manufacturing, keeping these valuable plastic resources in use within the economy and out of landfill.')]),
    ],
  },
  {
    title: 'Polyvinyl Chloride (PVC)',
    slug: 'pvc-recycling',
    seoDescription: 'Buy & Sell PVC plastic worldwide at WasteTrade. We specialise in PVC Recycling in the UK, where you get the best prices for your PVC plastic scrap materials.',
    content: [
      heading(1, 'Polyvinyl Chloride Recycling'),
      paragraph([text('Buy & Sell PVC plastic worldwide at WasteTrade. We specialise in PVC Recycling in the UK, where you get the best prices for your PVC plastic scrap materials.')]),
      heading(2, 'PVC Recycling'),
      paragraph([text('The WasteTrade marketplace makes it easier than ever to access the most ethical and sustainable PVC recycling solutions in the world. We have a global userbase of fully-vetted members to offer you worldwide exposure for the scrap materials you have for sale. WasteTrade connects you directly to far more PVC recycling outlets than could ever be achieved by using waste brokers.')]),
      paragraph([text('In connecting you directly with the PVC recycling outlets, WasteTrade removes any need for you to be reliant on the middleman waste brokers. You do not need to put your trust in brokers to offer you prices that honestly reflect the true value of your materials. Neither do you need to trust that brokers are sending your materials to ethical PVC recycling services, as all buyers on the WasteTrade marketplace have had to pass our verification process.')]),
      paragraph([text('You can reach this global audience of PVC recycling companies very easily, by simply creating your account on WasteTrade. WasteTrade is completely free to use; there are no fees to sign up, no fees to create listings, and we take no commissions on material sold through the platform. Once you register, you will be granted full access to the marketplace just as soon as we have completed our verification process – usually within 24 hours.')]),
      heading(2, 'PVC Recycle'),
      paragraph([text('There are two main PVC recycle processes; a feedstock recycling process and a mechanical recycling process. The feedstock PVC recycle process is used for mixed streams of PVC. This process involves using heat or chemical reactions to breakdown the PVC into its initial feedstocks – chlorine and ethylene.')]),
      paragraph([text('The mechanical PVC recycling process is split into three main steps, with the first being to sort through the scrap and remove all non-PVC materials, such as wood, metal, cardboard and other plastics. The second step in this PVC recycle process is to clean the material to make sure all contaminants, such as dirt or residual liquid, are washed away. The third and final step is to shred the PVC into small pieces so it can be melted, shaped and cooled into recycled plastic pellet, ready to go back into manufacturing.')]),
      heading(2, 'PVC Recyclers'),
      paragraph([text('The WasteTrade marketplace gives you direct access to the most reputable PVC recyclers in the world. There are numerous benefits that come with using WasteTrade to send your PVC scrap to recycling services, as opposed to sending it to landfill or incineration.')]),
      paragraph([text('For example, there are many environmental benefits to choosing this waste disposal method, such as reducing carbon emissions, preventing pollution and avoiding wasteful resource management. There are also the financial benefits to businesses of sending plastic scrap to PVC recyclers through WasteTrade, as the global reach of the marketplace allows you to get the best prices.')]),
      heading(2, 'PVC Recycling UK'),
      paragraph([text('Despite the multitude of benefits to businesses of using PVC recycling UK services to dispose of PVC waste, many companies still opt to pay for landfill or incineration. Some of these companies are simply uninformed of the recycling options open to them, but the majority choose these waste disposal methods to avoid the red tape that has typically come along with recycling – especially if exporting material.')]),
      paragraph([text('However, through WasteTrade, accessing PVC recycling UK services has never been easier. WasteTrade takes away the burden of handling the compliance and logistical challenges involved in recycling by handling it all inhouse. The platform also takes away the stress of chasing for payments, as our secure transaction service takes care of this for you. PVC recycling UK and globally has never been quicker, simpler or more profitable thanks to the WasteTrade online marketplace.')]),
    ],
  },
  {
    title: 'Expanded Polystyrene (EPS)',
    slug: 'eps-recycling',
    seoDescription: 'Buy & Sell EPS plastic worldwide at WasteTrade. We specialise in EPS Recycling in the UK, where you get the best prices for your EPS plastic scrap materials.',
    content: [
      heading(1, 'Expanded Polystyrene Recycling'),
      paragraph([text('Buy & Sell EPS plastic worldwide at WasteTrade. We specialise in EPS Recycling in the UK, where you get the best prices for your EPS plastic scrap materials.')]),
      heading(2, 'Expanded Polystyrene'),
      paragraph([text('Expanded polystyrene, often shortened to EPS, is a form of polystyrene plastic; it is a thermoplastic made by polymerising the monomer styrene into polymer chains. Polystyrene is made into expanded polystyrene by taking beads of polystyrene, circulating steam through them and then mixing in a small amount of pentane gas. This causes the beads to expand to approximately 40 times their original size, now being mostly filled with air.')]),
      paragraph([text('It is the airiness of expanded polystyrene that gives it its foam-like properties and makes it such a widely used material in packaging. It is very durable, extremely lightweight, and very easy to shape, making it the ideal choice for the packaging of electronics or other fragile items. Also, due to its low conductivity, it is frequently used for insulation.')]),
      paragraph([text('Due to its many advantageous properties, its low cost and how easily it can be produced, expanded polystyrene is one of the most commonly used foam materials in the world. Some more examples of its applications are in construction materials, consumer materials, geofoam in engineering, aquaculture, agriculture, medical equipment, sporting equipment and more.')]),
      heading(2, 'Expanded Polystyrene Recycling'),
      paragraph([text('The exact process used for expanded polystyrene recycling will vary from one recycler to the next, but the general stages in the process will remain the same. You can access the most ethical and sustainable expanded polystyrene recycling services directly through the WasteTrade marketplace.')]),
      paragraph([text('The first step in the expanded polystyrene recycling process is to sort through the material to ensure that no non-EPS materials are present, such as other plastics, wood, metals and carboard. Once sorted, the EPS will be washed to ensure no contaminants, such as dirt or residual liquid, are left on the material, as this will reduce the overall quality and value of the end product.')]),
      paragraph([text('The second step in the process of expanded polystyrene recycling is to shred the material into small pieces, before compressing it into blocks. These compressed blocks reduce the overall size of the EPS by 98%, to just one fiftieth (1/50) of its original volume.')]),
      paragraph([text('The third and final step in the expanded polystyrene recycling process is melting these compressed EPS blocks into lump. This lump is ready to go back into manufacturing for a wide range of potential applications, such as in products like picture frames and other household decorative items.')]),
      heading(2, 'EPS Recycling'),
      paragraph([text('Despite all the options available to businesses for EPS recycling services, and for PS recycling services, many companies still choose to send their scrap materials to landfill or incineration. It is sometimes the case that these businesses are not properly informed of all the recycling options available to them. However, it is more often the case that companies choose landfill or incineration because of all the red tape that comes with EPS recycling, especially if the material is being exported.')]),
      paragraph([text('However, businesses no longer need to miss out on the financial and environmental benefits of PS and EPS recycling, as WasteTrade removes all the barriers in the way of these services. WasteTrade handles all compliance and logistical issues, taking the burden off this away from the buyers and sellers. WasteTrade\'s secure transaction service also removes the stress of having to chase for payments for the material you sell. EPS recycling is easier, faster and more lucrative than ever before, all thanks to the WasteTrade online marketplace.')]),
    ],
  },
  {
    title: 'Polycarbonate (PC)',
    slug: 'pc-recycling',
    seoDescription: 'Buy & Sell PC plastic worldwide at WasteTrade. We specialise in PC Recycling in the UK, where you get the best prices for your PC plastic scrap materials.',
    content: [
      heading(1, 'Polycarbonate Recycling'),
      paragraph([text('Buy & Sell PC plastic worldwide at WasteTrade. We specialise in PC Recycling in the UK, where you get the best prices for your PC plastic scrap materials.')]),
      heading(2, 'PC Recycling'),
      paragraph([text('Accessing ethical PC recycling services is easier than ever thanks to the WasteTrade online marketplace. Our members gain direct access to our global, fully-vetted userbase, allowing them to get greater exposure on the plastic waste commodities they have for sale. This means WasteTrade connects you with more potential buyers offering PC recycling services than would ever be possible via traditional brokerage services.')]),
      paragraph([text('Not only does WasteTrade give you direct access to far more buyers, but we also give you the power to choose the right offer for yourself. Whatever your priorities are for PC recycling, such as getting the highest price or recycling domestically rather than exporting, you get the final decision. You are no longer dependent on having to trust a waste broker to be offering you fair prices, or that the end user they send your materials to is ethical.')]),
      paragraph([text('It is free to create your account on the WasteTrade platform, and you will have full access to the waste marketplace as soon as we complete our quick verification process – this is usually within 24 hours. It is also free for you to create listings on the marketplace, and we do not take commissions on the materials you sell. WasteTrade is completely free to use to make PC recycling as easy, convenient and rewarding as possible.')]),
      heading(2, 'Recycling PC'),
      paragraph([text('The process of recycling PC can vary from recycler to recycler, but the main steps in the process remain the same. The first part of the process is to sort the materials to ensure that only PC plastic is present, and that no other polymer types are in the stock.')]),
      paragraph([text('The second step in the process of recycling PC is to clean the PC to make sure there are no contaminants on the materials. These contaminants could be things such as residual fluids or dirt on the plastics; removing these is highly important to the overall quality of the recycled product produced at the end.')]),
      paragraph([text('The final step in recycling PC is to shred the plastic into small pieces so that it can be melted down and then shaped and cooled into recycled plastic pellet ready to go back into manufacturing.')]),
      heading(2, 'PC Plastic Recycling'),
      paragraph([text('PC plastic recycling is easier, quicker, more convenient and more profitable than ever before thanks to the WasteTrade marketplace. We take care of the entire process from start to finish, to remove the burden from you. In making recycling the most lucrative and most convenient option available to businesses, we are shifting the global waste industry towards a circular economic model.')]),
      paragraph([text('You also no longer have to worry about chasing for payments for the materials you sell to PC plastic recycling outlets, as the WasteTrade secure transaction service handles this for you. Before we release a vehicle to your site to collect your PC scrap, the buyer must make the full payment to us for your materials. Once payment has been made, we will release the funds to you as soon as the haulier has collected the materials from your site. Through WasteTrade, you can dispose of your PC waste more easily and more profitably than ever before.')]),
    ],
  },
  {
    title: 'Acrylonitrile Butadiene Styrene (ABS)',
    slug: 'abs-recycling',
    seoDescription: 'Buy & Sell ABS plastic worldwide at WasteTrade. We specialise in ABS Recycling in the UK, where you get the best prices for your ABS plastic scrap materials.',
    content: [
      heading(1, 'ABS Recycling'),
      paragraph([text('Buy & Sell ABS plastic worldwide at WasteTrade. We specialise in ABS Recycling in the UK, where you get the best prices for your ABS plastic scrap materials.')]),
      heading(2, 'ABS Recycling'),
      paragraph([text('ABS recycling can be done both profitably and sustainably by using the WasteTrade marketplace. WasteTrade exposes your ABS scrap to our fully vetted global userbase, increasing the pool of your potential buyers. On our platform, more parties interested in buying your materials for ABS recycling than would ever be reached by traditional waste brokering methods will come directly to you with their offers.')]),
      paragraph([text('This means finding the most suitable outlet for ABS recycling will not only be quicker and easier, but that you will now have the power to choose the best price. You do not have to trust that the prices your waste broker is offering you are fair, and you do no need to worry whether the end user is ethical as we verify all our users before granting them access to the marketplace.')]),
      paragraph([text('As well as this, creating an account on WasteTrade is free, and we charge no fees and take no commissions on materials sold through the platform. This means you will keep all the money your materials sell to ABS recycling plants for, rather than sharing it will a middleman.')]),
      heading(2, 'Recycling ABS'),
      paragraph([text('The first step in the process of recycling ABS is to ensure that all non-ABS contaminants are removed from the material; these contaminants can be other polymers, other materials such as wood or metal, or other general debris. On an industrial scale, this is usually done using a process called froth flotation, in which the ABS is separated from other materials using a water-oil mixture.')]),
      paragraph([text('Once the materials have been properly separated, the second step in recycling ABS is to grind the plastic into granular form. This will be done using a grinder with high torque and sharp teeth that makes light work of breaking ABS plastic down into granulate.')]),
      paragraph([text('The third and final step in the process of recycling ABS will be melting and reforming the material. This is a mostly automated process in which the granulate is fed into an extruder where it will be melted down and come out usually in the form of either plastic sheet or filament.')]),
      heading(2, 'ABS Plastic Recycling'),
      paragraph([text('ABS plastic recycling is not only the most sustainable way to handle this polymer once it becomes waste, but it is also often overlooked as a means for business to generate an additional stream of revenue. A business producing ABS scrap, ignoring the environmental impact, would have to pay to dispose of their waste via landfill or incineration.')]),
      paragraph([text('One of the major reasons businesses still often choose to use landfill or incineration, despite the cost to them, is for the convenience of it compared to recycling. The recycling industry has been notoriously difficult to navigate due to many the many obstacles, such as complicated compliance and logistical challenges, presented by excessive red tape.')]),
      paragraph([text('However, WasteTrade handles all of these inconveniences on behalf of buyers and sellers. This means businesses can reap the financial and environmental benefits of ABS plastic recycling, without being burdened by the regulatory issues.')]),
    ],
  },
  {
    title: 'Acrylic (PMMA)',
    slug: 'acrylic-recycling',
    seoDescription: 'Buy & Sell Acrylic plastic worldwide at WasteTrade. We specialise in Acrylic Recycling in the UK, where you get the best prices for your Acrylic plastic scrap materials.',
    content: [
      heading(1, 'Acrylic Recycling'),
      paragraph([text('Buy & Sell Acrylic plastic worldwide at WasteTrade. We specialise in Acrylic Recycling in the UK, where you get the best prices for your Acrylic plastic scrap materials.')]),
      heading(2, 'Acrylic Recycling'),
      paragraph([text('Acrylic recycling can be both lucrative and environmentally friendly when it is done through the WasteTrade marketplace. We have a global userbase that are fully vetted before being given access to our marketplace, offering a far greater exposure of your materials to potential buyers. This increased exposure will make your scrap materials available to far more acrylic recycling facilities than they ever could be while using traditional brokerage services.')]),
      paragraph([text('This will not only make the process of acrylic recycling quicker and easier for you, but it will also give you the power to choose the best offers for yourself. You are no longer dependent on trusting waste brokers to offer you prices representative of the true value of your materials, nor do you have to worry that your materials are being sent to an unethical end user. You see the true price the buyer is willing to pay, and you know they have been verified by the WasteTrade vetting process.')]),
      paragraph([text('Creating your account on the WasteTrade marketplace is completely free and we do not charge fees or take commissions on material sold on the platform. You get to keep the money that you sell your materials to acrylic recycling plants for, rather than sharing it with a third party.')]),
      heading(2, 'Recycling Acrylic'),
      paragraph([text('Acrylic is one of the least commonly recycled plastic, as the process is not as accessible as it is for other polymers. Recycling acrylic requires more specialised equipment and expertise than other plastics, many of which can be recycled by a simpler process of shredding, melting and pelletising.')]),
      paragraph([text('Recycling acrylic is done using a process pyrolysis, in which the acrylic is depolymerised. This process involves exposing the acrylic to molten lead, which breaks the polymer bonds and reduces the acrylic back to its base monomers.')]),
      paragraph([text('After the process of recycling acrylic has been completed, the recycled material has a wide range of applications. For example, the acrylic can be used in construction materials for soundproof windows and doors, or in medical equipment such as incubators and surgical devices.')]),
      heading(2, 'Recycle Acrylic'),
      paragraph([text('There are many reasons for businesses to choose to recycle acrylic waste rather than send it to landfill or incineration. There are the obvious environmental reasons to do so, as recycling reduces carbon emissions and prevents plastic pollution. However, there are also financial benefits that come with deciding to recycle acrylic waste.')]),
      paragraph([text('Sending acrylic waste to landfill or incineration comes with a cost to businesses, whereas reprocessors who recycle acrylic will pay businesses for the same materials. Recyclers need a constant feed of materials to make their businesses models viable, and they are prepared to offer competitive prices for them.')]),
      paragraph([text('As well as the expertise required, another major reason many businesses choose landfill or incineration instead of choosing to recycle acrylic is due to the complicated regulatory challenges it presents. However, WasteTrade handles all the compliance and logistics involved in deals agreed through the platform, removing these obstacles from both parties involved.')]),
    ],
  },
  {
    title: 'Tyres',
    slug: 'tyres-recycling',
    seoDescription: 'Buy & Sell Tyre waste worldwide at WasteTrade. We specialise in Tyres Recycling, where you get the best prices for scrap Tyre materials.',
    content: [
      heading(1, 'Tyres'),
      paragraph([text('Buy & Sell Tyre waste worldwide at WasteTrade. We specialise in Tyres Recycling, where you get the best prices for scrap Tyre materials.')]),
      heading(2, 'Tyre Recycling'),
      paragraph([text('Tyre recycling plays a critical role in managing one of the most durable and persistent waste materials produced by modern transport and industry. Tyres are engineered to withstand extreme wear, which makes them valuable in use but problematic at the end of their life.')]),
      paragraph([text('Because tyres cannot be landfilled and pose serious environmental and safety risks if stockpiled, they are regulated as a controlled waste stream. Recycling ensures that used tyres are collected, processed, and converted into reusable materials rather than becoming a long-term liability.')]),
      paragraph([text('WasteTrade supports tyre recycling by connecting businesses with verified recycling partners and end markets, helping tyres move efficiently from waste into productive reuse.')]),
      heading(2, 'Recycle Tyres'),
      paragraph([text('Businesses across many sectors need reliable ways to recycle tyres. These include tyre retailers, vehicle fleets, transport operators, agricultural sites, construction companies, and manufacturers that generate tyres as part of ongoing operations.')]),
      paragraph([text('Recycling tyres is not simply a disposal exercise. It involves compliant collection, appropriate storage, and transfer to licensed recycling facilities capable of handling tyre waste safely. Different tyres may require different recycling routes depending on size, construction, and condition.')]),
      paragraph([text('Through WasteTrade, businesses can recycle tyres by accessing a network of vetted buyers and recycling partners. This allows tyre waste to be handled responsibly while maintaining traceability and compliance throughout the process.')]),
      heading(2, 'Recycling Tyres'),
      paragraph([text('Recycling tyres involves breaking down a complex, composite product into recoverable materials. Once tyres enter the recycling system, they are typically collected and transported to specialist processing facilities.')]),
      paragraph([text('At a high level, recycling tyres includes size reduction, separation of materials, and preparation for reuse. Rubber is processed into reusable forms, steel reinforcement is recovered for metal recycling, and other components are removed as part of the process.')]),
      paragraph([text('Not all tyres follow the same route. Passenger car tyres, commercial tyres, and large industrial tyres can differ significantly in how they are processed and where their recycled materials are ultimately used. Understanding these differences is essential for efficient recycling and effective material recovery.')]),
      paragraph([text('WasteTrade helps streamline this process by connecting tyre waste with appropriate recycling routes and end markets, reducing friction between supply and demand.')]),
      heading(2, 'Recycled Tyres'),
      paragraph([text('Recycled tyres are not a single product but a source of multiple reusable materials. Once processed, tyres yield rubber, steel, and other fractions that are used across a range of industries.')]),
      paragraph([text('Recycled tyre materials are commonly used in construction products, surfacing, flooring, moulded goods, and other applications where durability and resilience are required. These materials help reduce reliance on virgin resources while keeping tyre-derived materials in circulation.')]),
    ],
  },
];

async function main() {
  console.log('Material Landing Pages Migration');
  console.log(`Remote: ${REMOTE_URL}`);
  console.log(`Pages to create: ${materials.length}\n`);

  await login();
  console.log('Logged in.\n');

  for (const mat of materials) {
    try {
      const res = await axios.post(
        `${REMOTE_URL}/content-manager/collection-types/api::material-landing-page.material-landing-page`,
        {
          title: mat.title,
          slug: mat.slug,
          content: mat.content,
          seoDescription: mat.seoDescription,
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      console.log(`  ✓ Created: ${mat.title} (${res.data?.data?.documentId || res.data?.documentId || 'ok'})`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.error(`  ✗ Failed: ${mat.title} — ${msg}`);
    }
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
