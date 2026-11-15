import { Routes } from '@angular/router';
import { PageSeo } from './core/seo.service';

const seo = (title: string, description: string): { seo: PageSeo } => ({ seo: { title, description } });

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home').then((m) => m.HomePage),
    data: seo(
      'Road transport, supply chain and 3PL from Indore',
      'North South Roadlines (NSRL) is an Indore-based logistics company offering road transportation, supply chain management and third-party logistics. Trucking value since 1994.',
    ),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about').then((m) => m.AboutPage),
    data: seo(
      'About us',
      'The story of North South Roadlines: a logistics company headquartered in Indore that grew from road transport in Central India into third-party logistics.',
    ),
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services').then((m) => m.ServicesPage),
    data: seo(
      'Our services',
      'Transportation and road logistics, supply chain management and third-party logistics (3PL) from North South Roadlines, Indore.',
    ),
  },
  {
    path: 'network',
    loadComponent: () => import('./pages/network').then((m) => m.NetworkPage),
    data: seo(
      'Our network',
      'NSRL head office in Indore, branches in Ahmedabad, Pune, Mumbai, Gurgaon, Chandigarh, Raipur and Bhopal, and the cities we serve across India.',
    ),
  },
  {
    path: 'clients',
    loadComponent: () => import('./pages/clients').then((m) => m.ClientsPage),
    data: seo(
      'Our clients',
      'Companies North South Roadlines works with, including Britannia, Bisleri, Samsung, Nilkamal, TATA and DMart.',
    ),
  },
  {
    path: 'enquiry',
    loadComponent: () => import('./pages/enquiry').then((m) => m.EnquiryPage),
    data: seo(
      'Request an enquiry',
      'Send a transport, supply chain or 3PL enquiry to North South Roadlines. Tell us the pickup and delivery locations and the Indore team will reply.',
    ),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact').then((m) => m.ContactPage),
    data: seo(
      'Contact us',
      'Contact North South Roadlines: 21/7, Gulab Bagh, Dewas Naka, Indore, Madhya Pradesh. Phone +91 94254-10665. Email northsouthrl@gmail.com.',
    ),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFoundPage),
    data: seo('Page not found', 'The page you were looking for is not on the North South Roadlines website.'),
  },
];
