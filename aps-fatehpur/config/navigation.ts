export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Mission & Vision", href: "/about" },
      { label: "Director", href: "/about/director" },
      { label: "Chairman", href: "/about/chairman" },
      { label: "Principal", href: "/about/principal" },
      { label: "Infrastructure", href: "/about/infrastructure" },
    ],
  },
  {
    label: "Structure",
    href: "/structure/uniforms",
    children: [
      { label: "Uniforms", href: "/structure/uniforms" },
      { label: "Bus Routes", href: "/structure/bus-routes" },
      { label: "Calendar", href: "/structure/calendar" },
      { label: "Career Counseling", href: "/structure/career-counseling" },
      { label: "Awards", href: "/structure/awards" },
    ],
  },
  {
    label: "Academy",
    href: "/academy/admissions",
    children: [
      { label: "Admissions", href: "/academy/admissions" },
      { label: "Curriculum", href: "/academy/curriculum" },
      { label: "Affiliation", href: "/academy/affiliation" },
      { label: "RTE", href: "/academy/rte" },
      { label: "Fees", href: "/academy/fees" },
    ],
  },
  { label: "Facilities", href: "/facilities" },
  {
    label: "News",
    href: "/news",
    children: [
      { label: "Announcements", href: "/news" },
      { label: "Tours", href: "/news/tours" },
      { label: "Videos", href: "/news/videos" },
    ],
  },
  { label: "Toppers", href: "/toppers" },
  { label: "AICU", href: "/aicu" },
  { label: "Alumni", href: "/alumni" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];
