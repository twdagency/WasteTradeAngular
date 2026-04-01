import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  signal,
  WritableSignal,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { FooterComponent } from '../../layout/footer/footer.component';
import { LanguageSelectorComponent } from '../../layout/common/language-selector/language-selector.component';
import { SeoService } from 'app/services/seo.service';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';

interface MaterialItem {
  name: string;
  abbreviation: string;
  description: string;
  image: string;
  learnMoreUrl: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface NewsItem {
  title: string;
  date: string;
  excerpt: string;
  author: string;
  image: string;
  readTime: string;
}

interface ResourceItem {
  title: string;
  image: string;
}

interface ListingItem {
  materialType: string;
  materialItem: string;
  weight: number;
  unit: string;
  location: string;
  countryCode: string;
}

interface FeatureRow {
  number: string;
  title: string;
  description: string;
  image: string;
  reversed: boolean;
  stat: string;
}

interface EcoSolution {
  title: string;
  icon: string;
  description: string;
  area: string;
  color: string;
}

interface HeroStat {
  target: number;
  suffix: string;
  label: string;
  current: WritableSignal<number>;
}

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
}

interface TimelineStep {
  number: number;
  icon: string;
  title: string;
  description: string;
}

const WP = 'https://www.wastetrade.com/wp-content/uploads';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTabsModule,
    TranslateModule,
    FooterComponent,
    LanguageSelectorComponent,
  ],
  providers: [TranslatePipe],
})
export class HomeComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private seoService = inject(SeoService);
  private translate = inject(TranslatePipe);
  private sanitizer = inject(DomSanitizer);
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  menuOpen = signal(false);
  showBackToTop = signal(false);
  private scrollHandler: (() => void) | null = null;
  private observer: IntersectionObserver | null = null;
  private countersAnimated = false;

  constructor() {
    afterNextRender(() => {
      const host = this.el.nativeElement as HTMLElement;

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove('is-hidden');
              this.observer!.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      host.querySelectorAll('.animate-on-scroll, .reveal-stagger').forEach((el: Element) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) {
          el.classList.add('is-hidden');
        }
        this.observer!.observe(el);
      });

      this.animateCounters(host);
      this.setupStaggerAnimations(host);

      this.scrollHandler = () => {
        this.showBackToTop.set(window.scrollY > 600);
      };
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    });
  }

  private animateCounters(host: HTMLElement) {
    const statsEl = host.querySelector('.hero-stats');
    if (!statsEl) return;

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.countersAnimated) {
            this.countersAnimated = true;
            this.heroStats.forEach((stat) => this.countUp(stat.current, stat.target, 2000));
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    counterObserver.observe(statsEl);
  }

  private countUp(current: WritableSignal<number>, target: number, duration: number) {
    const start = performance.now();
    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current.set(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        current.set(target);
      }
    };
    requestAnimationFrame(step);
  }

  private setupStaggerAnimations(host: HTMLElement) {
    host.querySelectorAll('[data-stagger]').forEach((container) => {
      Array.from(container.children).forEach((child, i) => {
        (child as HTMLElement).style.setProperty('--stagger', `${i * 80}ms`);
      });
    });
  }

  formatNumber(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // --- Data ---

  missionVideoUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://player.vimeo.com/video/721384900'
  );

  heroStats: HeroStat[] = [
    { target: 100, suffix: '+', label: 'Countries', current: signal(0) },
    { target: 10000, suffix: '+', label: 'Tonnes Traded', current: signal(0) },
    { target: 500, suffix: '+', label: 'Verified Traders', current: signal(0) },
  ];

  marqueeItems = [
    'PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'EPS', 'ABS', 'PMMA', 'PC', 'PS',
    'BOPP', 'EVA', 'LLDPE', 'PA', 'PBT', 'POM', 'SAN', 'TPU', 'Silicone',
    'Aluminium', 'Copper', 'Brass', 'Stainless Steel',
    'Corrugated Board', 'Mixed Papers', 'Kraft', 'Newspapers',
    'Natural Rubber', 'EPDM', 'SBR',
    'EFW', 'Mixed Film', 'Mixed Rigids', 'Mixed Bottles',
  ];

  ecoSolutions: EcoSolution[] = [
    {
      title: 'Circular Economy',
      icon: 'recycling',
      description: 'Supporting a sustainable closed-loop system where waste materials are reprocessed and reused, reducing dependency on virgin resources.',
      area: 'a',
      color: '#10b981',
    },
    {
      title: 'Carbon Reduction',
      icon: 'co2',
      description: 'Partnered with ThinkCarbon, an AI-based carbon analysis tool to minimise the carbon footprint of the waste sector.',
      area: 'b',
      color: '#3b82f6',
    },
    {
      title: 'Trust & Reliability',
      icon: 'shield',
      description: 'WasteTrade eliminates the risks of dealing with unknown suppliers — we are the only entity you deal with.',
      area: 'c',
      color: '#6366f1',
    },
    {
      title: 'Compliance',
      icon: 'gavel',
      description: 'We handle all paperwork and ensure full compliance with regulations and legislation.',
      area: 'd',
      color: '#f59e0b',
    },
    {
      title: 'Profitability',
      icon: 'trending_up',
      description: 'Easily compare bids to find the most lucrative offers while reducing transport costs and guaranteeing payment.',
      area: 'e',
      color: '#14b8a6',
    },
    {
      title: 'Hand-Held Service',
      icon: 'support_agent',
      description: 'We guide you through every step — from buying to selling — providing support on all areas of the process.',
      area: 'f',
      color: '#ec4899',
    },
  ];

  steps: TimelineStep[] = [
    {
      number: 1,
      icon: 'inventory_2',
      title: 'List Your Materials',
      description: 'Sellers list waste materials for sale with full details — type, quantity, grading, location and images.',
    },
    {
      number: 2,
      icon: 'gavel',
      title: 'Buyers Place Bids',
      description: 'Verified buyers browse listings and place competitive bids to secure the materials they need.',
    },
    {
      number: 3,
      icon: 'local_shipping',
      title: 'Hauliers Bid on Transport',
      description: 'Hauliers compete to offer the best price for collection and delivery, keeping transport costs low.',
    },
    {
      number: 4,
      icon: 'verified',
      title: 'We Handle the Rest',
      description: 'WasteTrade manages compliance, documentation and secure payments from end to end.',
    },
  ];

  testimonials: TestimonialItem[] = [
    {
      quote: 'WasteTrade has transformed how we source recycled materials. The platform\'s transparency and global reach are unmatched in the industry.',
      author: 'Sarah Mitchell',
      role: 'Head of Procurement',
      company: 'EcoPlast Industries',
    },
    {
      quote: 'We\'ve reduced our waste disposal costs by 30% since joining. The bidding system ensures we always get fair market value for our materials.',
      author: 'Marcus Andersen',
      role: 'Operations Director',
      company: 'Nordic Recycling Group',
    },
    {
      quote: 'The compliance handling alone makes WasteTrade worth it. No more paperwork headaches when trading internationally.',
      author: 'Elena Vasquez',
      role: 'Sustainability Manager',
      company: 'GreenLoop Manufacturing',
    },
  ];

  materials: MaterialItem[] = [
    {
      name: 'Polyethylene Terephthalate',
      abbreviation: 'PET',
      description:
        'PET is formed when ethylene glycol and terephthalic acid are combined. It is a clear plastic that is both strong and lightweight enough to be popularly used for food and beverage packaging, with close to all single-use plastic drinks bottles being made from PET.',
      image: `${WP}/2022/04/PET-plastic-straps-baled.jpg`,
      learnMoreUrl: 'https://www.wastetrade.com/pet-recycling/',
    },
    {
      name: 'High-density Polyethylene',
      abbreviation: 'HDPE',
      description:
        'HDPE is made from the monomer ethylene. It is a thermoplastic that becomes softer when heated to be moulded and then hardens when cooled. The material is incredibly versatile as it is lightweight, strong, malleable, impact resistant and long lasting.',
      image: `${WP}/2022/04/hdpe-piping-1.jpg`,
      learnMoreUrl: 'https://www.wastetrade.com/hdpe-recycling/',
    },
    {
      name: 'Polyvinyl Chloride',
      abbreviation: 'PVC',
      description:
        'PVC is made by combining chlorine and ethylene to form vinyl chloride monomer. PVC is very strong, tough and can be easily shaped, giving it many different uses in construction, automotive and medical applications.',
      image: `${WP}/2022/05/PVC-Plastic-scaled-1-1-2.jpg`,
      learnMoreUrl: 'https://www.wastetrade.com/pvc-recycling/',
    },
    {
      name: 'Low-Density Polyethylene',
      abbreviation: 'LDPE',
      description:
        'LDPE is a thermoplastic made from the monomer ethylene. The plastic is lightweight, strong, impact resistant and chemical resistant. LDPE is ideal for manufacturing thin, flexible products such as plastic bags, shrink-wrap and stretch film.',
      image: `${WP}/2022/04/LDPE-on-a-roll-in-a-factory-1.jpg`,
      learnMoreUrl: 'https://www.wastetrade.com/ldpe-recycling/',
    },
    {
      name: 'Polypropylene',
      abbreviation: 'PP',
      description:
        'PP is a thermoplastic made from the monomer propylene. PP is tough, lightweight, chemical resistant and moisture resistant. The plastic is used for a wide range of products such as packaging, automotive parts and consumer goods.',
      image: `${WP}/2022/05/PP1-1-1-2.jpg`,
      learnMoreUrl: 'https://www.wastetrade.com/pp-recycling/',
    },
    {
      name: 'Expanded Polystyrene',
      abbreviation: 'EPS',
      description:
        'EPS is made from beads of Polystyrene expanded by gas. It is lightweight, tough and good for use as insulation. It is used in packaging material, furniture, sports equipment and construction.',
      image: `${WP}/2022/07/EPS-Preview.jpg`,
      learnMoreUrl: 'https://www.wastetrade.com/eps-recycling/',
    },
    {
      name: 'Polycarbonate',
      abbreviation: 'PC',
      description:
        'PC is an impact resistant thermoplastic with excellent optical clarity. It is widely used in electronics, automotive components, medical devices and safety equipment.',
      image: 'assets/images/product-placeholder-image.png',
      learnMoreUrl: 'https://www.wastetrade.com/pc-recycling/',
    },
    {
      name: 'Acrylonitrile Butadiene Styrene',
      abbreviation: 'ABS',
      description:
        'ABS is a polymer made from acrylonitrile, butadiene and styrene. It is stiff, strong, impact resistant and chemical resistant. Used for computer parts, tools, plug socket faces and toys.',
      image: `${WP}/2022/07/ABS-Preview.jpg`,
      learnMoreUrl: 'https://www.wastetrade.com/abs-recycling/',
    },
    {
      name: 'Acrylic (PMMA)',
      abbreviation: 'PMMA',
      description:
        'Acrylic is a transparent thermoplastic often used as a lightweight, shatter-resistant alternative to glass. Common in signage, displays, aquariums and medical devices.',
      image: 'assets/images/product-placeholder-image.png',
      learnMoreUrl: 'https://www.wastetrade.com/acrylic-recycling/',
    },
  ];

  listings: ListingItem[] = [
    { materialType: 'Plastic', materialItem: 'Acrylic', weight: 3, unit: 'MT', location: 'United Kingdom', countryCode: 'gb' },
    { materialType: 'Plastic', materialItem: 'PS', weight: 10, unit: 'MT', location: 'United Kingdom', countryCode: 'gb' },
    { materialType: 'Plastic', materialItem: 'PET', weight: 18, unit: 'MT', location: 'Lithuania', countryCode: 'lt' },
    { materialType: 'Plastic', materialItem: 'PET', weight: 20, unit: 'MT', location: 'Hungary', countryCode: 'hu' },
    { materialType: 'Plastic', materialItem: 'LDPE', weight: 20, unit: 'MT', location: 'Romania', countryCode: 'ro' },
    { materialType: 'Plastic', materialItem: 'PP', weight: 30, unit: 'MT', location: 'Romania', countryCode: 'ro' },
    { materialType: 'Plastic', materialItem: 'LDPE', weight: 20, unit: 'MT', location: 'Romania', countryCode: 'ro' },
    { materialType: 'Plastic', materialItem: 'PET', weight: 15, unit: 'MT', location: 'Poland', countryCode: 'pl' },
  ];

  news: NewsItem[] = [
    {
      title: 'Dinca Ionut | The Newest Member Of WasteTrade\'s Eastern Europe Team',
      date: '26 March, 2026',
      excerpt: 'You have recently joined WasteTrade as a Regional Manager covering parts of Eastern Europe. Can you start by telling us about your background?',
      author: 'WasteTrade',
      image: `${WP}/2024/10/Waste-Trade-YouTube-cover-image-01.jpg`,
      readTime: '5 mins read',
    },
    {
      title: 'Largest European Tyre Recycling Facility Opens In Netherlands',
      date: '26 March, 2026',
      excerpt: 'Circtec\'s tyre recycling plant in Delfzijl is now operating as Europe\'s largest facility of its kind.',
      author: 'George Kiernan',
      image: `${WP}/2024/10/Waste-Trade-YouTube-cover-image-01.jpg`,
      readTime: '4 mins read',
    },
    {
      title: 'Kristofer Zlatkovski | Bringing WasteTrade To The Balkans',
      date: '26 March, 2026',
      excerpt: 'Leading WasteTrade\'s growth across North Macedonia and the wider Balkans region.',
      author: 'George Kiernan',
      image: `${WP}/2024/10/Waste-Trade-YouTube-cover-image-01.jpg`,
      readTime: '5 mins read',
    },
    {
      title: 'Chris Dunn Interview | WasteTrade\'s Newest Logistics Team Member',
      date: '24 March, 2026',
      excerpt: 'Over 20 years in Freight Forwarding and Logistics — what first drew you into the industry?',
      author: 'George Kiernan',
      image: `${WP}/2024/10/Waste-Trade-YouTube-cover-image-01.jpg`,
      readTime: '4 mins read',
    },
  ];

  resources: ResourceItem[] = [
    { title: 'DIWASS Compliance (2026)', image: 'assets/images/product-placeholder-image.png' },
    { title: 'Polyethylene Terephthalate (PET)', image: 'assets/images/product-placeholder-image.png' },
    { title: 'Polypropylene (PP) Recycling', image: 'assets/images/product-placeholder-image.png' },
    { title: 'High Density Polyethylene (HDPE)', image: 'assets/images/product-placeholder-image.png' },
    { title: 'Low Density Polyethylene (LDPE)', image: 'assets/images/product-placeholder-image.png' },
    { title: 'Polyethylene (PE)', image: 'assets/images/product-placeholder-image.png' },
  ];

  featureRows: FeatureRow[] = [
    {
      number: '01',
      stat: '140+ countries',
      title: 'Plastic Recycling Made Easy',
      description:
        'At WasteTrade, we\'re transforming the way the world trades waste by connecting buyers and sellers from all corners of the globe. Our innovative online platform streamlines the entire process by automatically calculating shipping costs, documentation, exchange rates, and carbon footprint with just a click.',
      image: 'assets/images/create-account-bg.jpg',
      reversed: false,
    },
    {
      number: '02',
      stat: '30% cost reduction',
      title: 'Turning Trash into Treasure',
      description:
        'Our platform brings transparency and trust to waste trading. With WasteTrade, you can securely trade waste materials while mitigating risks, ensuring regulatory compliance, and making informed decisions backed by real data.',
      image: 'assets/images/create-account-bg.jpg',
      reversed: true,
    },
    {
      number: '03',
      stat: '500+ verified traders',
      title: 'Trade Waste with Confidence',
      description:
        'Join the global waste trading evolution. Partner with verified recyclers and manufacturers to achieve your sustainability goals while maximising the value of your waste commodities.',
      image: 'assets/images/create-account-bg.jpg',
      reversed: false,
    },
  ];

  faqs: FaqItem[] = [
    {
      question: 'What is WasteTrade?',
      answer:
        'WasteTrade is an online marketplace for the global waste industry. We bring both waste producers and processors together in a supportive virtual environment to make dealing in waste commodities as easy and profitable as possible.',
    },
    {
      question: 'What is the process of global waste trade?',
      answer:
        'To get started on WasteTrade, you must first complete the registration process. Once you have submitted your information and we have reviewed and verified it, you will have full access to the WasteTrade marketplace. You can list your own waste materials for sale or place bids on the listings of other users; once you agree to a deal, sit back and let WasteTrade handle the transport, the compliance and the payments.',
    },
    {
      question: 'What are the benefits of global waste trade?',
      answer:
        'Using WasteTrade makes recycling waste commodities easier and more profitable, therefore serving as an incentive for businesses to recycle their scrap materials. As well as increasing the amount of waste that is recycled, thanks to our partnership with ThinkCarbon, WasteTrade offers full carbon footprint visibility.',
    },
    {
      question: 'How can WasteTrade help you in waste trade globally?',
      answer:
        'The global waste industry presents many barriers to businesses trying to recycle their materials, including compliance and regulation issues, transport and secure payments. As WasteTrade handles all of these issues, it has never been easier or more rewarding for businesses to ethically dispose of their waste.',
    },
    {
      question: 'How do we connect buyers and sellers of waste materials?',
      answer:
        'On WasteTrade, buyers and sellers have full access to our marketplace. For sellers, we offer your materials exposure to our approved end users all around the world. For buyers, we provide the opportunity to source waste commodities from all around the world. For both parties, we organise transport, provide secure payments and ensure adherence to regulations.',
    },
    {
      question: 'How will you get paid for selling waste materials?',
      answer: "With WasteTrade, your money is safe — we secure payments from buyers before releasing the seller's materials.",
    },
  ];

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('The Global Waste Marketplace')),
      description: this.translate.transform(
        localized$(
          'WasteTrade is the pioneering online marketplace connecting waste generators with recyclers and end users of waste commodities around the globe.'
        )
      ),
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.scrollHandler && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  navigateToLogin() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.login);
  }

  navigateToRegister() {
    this.router.navigateByUrl('/create-account');
  }

  navigateToHaulierRegister() {
    this.router.navigateByUrl('/create-haulier-account');
  }
}
