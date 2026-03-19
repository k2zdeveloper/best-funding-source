export interface NavLink {
  label: string;
  href: string;
}

export const MAIN_NAV_LINKS: NavLink[] = [
  { label: 'Intake Form', href: '/apply' },
  { label: 'Solutions', href: '/services' },
  { label: 'Pricing', href: '/pricing' } // Example addition
];