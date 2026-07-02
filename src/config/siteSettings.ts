export interface SiteSettingsData {
  headerLogo: string;
  footerLogo: string;
  siteName: string;
  metaDescription: string;
  contactPhone: string;
  whatsappNumber: string;
  collaborationsContact: string;
  contactEmail: string;
  // Integrations & API
  googleSiteVerification: string;
  bingSiteVerification: string;
  googleAuthClientId: string;
  googleAuthSecret: string;
  facebookAuthAppId: string;
  facebookAuthSecret: string;
  linkedinAuthClientId: string;
  linkedinAuthSecret: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  githubRepoOwner: string;
  githubRepoName: string;
  githubToken: string;
  // Payment Gateways
  razorpayKeyId: string;
  razorpayKeySecret: string;
  // Address
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  addressCountry: string;
  // Hours
  studioHoursWeekdays: string;
  studioHoursSaturday: string;
  studioHoursSunday: string;
  // Social Media
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialLinkedin: string;
  socialSnapchat: string;
}

export const defaultSiteSettings: SiteSettingsData = {
  headerLogo: '/gorillatechsolution-uploads/001a3e79-c253-4f0f-8842-ed9a57850b57.png',
  footerLogo: '/gorillatechsolution-uploads/001a3e79-c253-4f0f-8842-ed9a57850b57.png',
  siteName: 'Shakti Yoga Raai',
  metaDescription: 'Transform your life through authentic yoga practice with expert guidance and personalized programs.',
  contactPhone: '+91 87778 16410',
  whatsappNumber: '+91 87778 16410',
  collaborationsContact: '',
  contactEmail: 'info@shaktiyogaraai.com',
  addressStreet: '123 Wellness Street',
  addressCity: 'Mumbai',
  addressState: 'Maharashtra',
  addressZip: '400001',
  addressCountry: 'India',
  studioHoursWeekdays: 'Monday - Friday: 6:00 AM - 9:00 PM',
  studioHoursSaturday: 'Saturday: 7:00 AM - 8:00 PM',
  studioHoursSunday: 'Sunday: 8:00 AM - 6:00 PM',
  socialFacebook: 'https://www.facebook.com/raaikotha/',
  socialInstagram: 'https://www.instagram.com/raaikotha/?hl=en',
  socialYoutube: 'https://www.youtube.com/c/RaaiKotha',
  socialLinkedin: '',
  socialSnapchat: '',
  googleSiteVerification: '',
  bingSiteVerification: '',
  googleAuthClientId: '',
  googleAuthSecret: '',
  facebookAuthAppId: '',
  facebookAuthSecret: '',
  linkedinAuthClientId: '',
  linkedinAuthSecret: '',
  firebaseApiKey: '',
  firebaseAuthDomain: '',
  firebaseProjectId: '',
  firebaseStorageBucket: '',
  firebaseMessagingSenderId: '',
  firebaseAppId: '',
  githubRepoOwner: '',
  githubRepoName: '',
  githubToken: '',
  razorpayKeyId: '',
  razorpayKeySecret: ''
};
