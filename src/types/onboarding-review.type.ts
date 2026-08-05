// Types mirror the admin-side onboarding review API response.
// GET  /api/v1/restaurant/onboarding/review/?token=<token>
// POST /api/v1/restaurant/onboarding/publish/  body: { token }
//
// Tokenized, public — link is emailed to the Find A Table admin / sales
// team. Shape parallels the connect-portal owner-review response so the
// page can render the same comprehensive preview design.

export interface OnboardingReviewToken {
  expires_at: string;
  used_at: string | null;
  is_expired: boolean;
  is_consumable: boolean;
}

export interface OnboardingReviewRestaurant {
  id: number;
  slug: string;
  name: string;
  status: string;
  onboarding_state: string;
  is_active: boolean;
  is_featured: boolean;
  timezone: string;
}

export interface OnboardingReviewProfile {
  name: string;
  description: string;
  story: string;
  ambiance: string;
  dress_code: string | null;
}

export interface OnboardingReviewContact {
  phone_number: string;
  contact_email: string;
  website: string | null;
  owner_email: string;
}

export interface OnboardingReviewCoordinates {
  latitude: number;
  longitude: number;
}

export interface OnboardingReviewAddress {
  street_name: string;
  house_number: string;
  neighborhood: string | null;
  city: string;
  postal_code: string;
  country: string;
  map_link: string | null;
  coordinates: OnboardingReviewCoordinates | null;
  location_set: boolean;
}

export interface OnboardingReviewTaxonomy {
  id: number;
  name: string;
}

export interface OnboardingReviewAttributes {
  cuisines: OnboardingReviewTaxonomy[];
  amenities: OnboardingReviewTaxonomy[];
  dietary_options: OnboardingReviewTaxonomy[];
  features: OnboardingReviewTaxonomy[];
  accepted_payment_methods: OnboardingReviewTaxonomy[];
  tags: OnboardingReviewTaxonomy[];
  categories: OnboardingReviewTaxonomy[];
}

export interface OnboardingReviewImage {
  id: number;
  image: string; // path relative to media bucket OR full URL
  alt_text: string;
  is_primary: boolean;
}

export interface OnboardingReviewMedia {
  logo_url: string | null;
  primary_images: OnboardingReviewImage[];
  gallery_images: OnboardingReviewImage[];
}

export interface OnboardingReviewOpeningHour {
  id: number;
  day: string; // "monday" | "tuesday" | …
  open_time: string; // "HH:MM:SS"
  close_time: string;
  is_closed: boolean;
}

export interface OnboardingReviewSocialLink {
  platform?: string;
  url: string;
  label?: string;
}

export interface OnboardingReviewMenuCategory {
  id: number;
  name: string;
  description: string;
  order: number;
}

export interface OnboardingReviewMenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: string;
  pickup_price?: string | null;
  delivery_price?: string | null;
  availability_status: string;
  allow_pickup: boolean;
  allow_delivery: boolean;
  addon_ids: number[];
  dietary_tag_ids: number[];
  order: number;
}

export interface OnboardingReviewMenuAddon {
  id: number;
  name: string;
  description: string;
  price: string;
  is_available: boolean;
}

export interface OnboardingReviewMenuFile {
  id: number;
  file_url?: string;
  file_name?: string;
  file?: string;
  name?: string;
}

export interface OnboardingReviewMenuSummary {
  category_count: number;
  item_count: number;
  addon_count: number;
  file_count: number;
}

export interface OnboardingReviewMenu {
  categories: OnboardingReviewMenuCategory[];
  items: OnboardingReviewMenuItem[];
  addons: OnboardingReviewMenuAddon[];
  files: OnboardingReviewMenuFile[];
  summary: OnboardingReviewMenuSummary;
}

export interface OnboardingReviewDeliverySettings {
  allow_pickup: boolean;
  allow_delivery: boolean;
  delivery_type: string;
  delivery_charge_type: string;
  minimum_order_amount: string;
  delivery_radius_km: number;
}

export interface OnboardingReviewDeliveryZone {
  id?: number;
  name?: string;
  postal_codes?: string[];
  fee?: string | number;
}

export interface OnboardingReviewDelivery {
  settings: OnboardingReviewDeliverySettings;
  zones: OnboardingReviewDeliveryZone[];
}

export interface OnboardingReviewBilling {
  iban: string | null;
  kvk_number: string | null;
  btw: string | null;
}

export interface OnboardingReviewStripeConnect {
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements: unknown;
  requirements_ui: unknown;
}

export interface OnboardingReviewAgreement {
  accepted: boolean;
  details: {
    id: number;
    agreement_version: string;
    accepted_at: string;
    pdf_url: string;
  } | null;
}

export interface OnboardingReviewActor {
  id: number;
  email: string;
  role: string;
  full_name: string;
}

export interface OnboardingReviewActors {
  registered_by: OnboardingReviewActor | null;
  last_updated_by: OnboardingReviewActor | null;
  assigned_salesperson: OnboardingReviewActor | null;
}

export interface OnboardingReviewMeta {
  state: string;
  state_updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  owner_review_requested_at: string | null;
  owner_review_completed_at: string | null;
  published_at: string | null;
  quality_score: number;
}

export interface OnboardingReviewBlocker {
  code?: string;
  message: string;
  details?: { missing_required?: string[] } & Record<string, unknown>;
}

export interface OnboardingReviewData {
  /** Optional — present when the backend returns token validity metadata. */
  token?: OnboardingReviewToken;
  restaurant: OnboardingReviewRestaurant;
  profile: OnboardingReviewProfile;
  contact: OnboardingReviewContact;
  address: OnboardingReviewAddress;
  attributes: OnboardingReviewAttributes;
  media: OnboardingReviewMedia;
  opening_hours: OnboardingReviewOpeningHour[];
  social_media_links: OnboardingReviewSocialLink[];
  menu: OnboardingReviewMenu;
  delivery: OnboardingReviewDelivery;
  billing: OnboardingReviewBilling;
  stripe_connect: OnboardingReviewStripeConnect;
  agreement: OnboardingReviewAgreement;
  actors: OnboardingReviewActors;
  onboarding: OnboardingReviewMeta;
  publish_blockers: OnboardingReviewBlocker[];
  can_publish: boolean;
}
