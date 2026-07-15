export interface LocationData {
  id: string;
  name: string;
  phone: string;
  email: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  addressCountry: string;
  studioHoursWeekdays: string;
  studioHoursSaturday: string;
  studioHoursSunday: string;
  mapUrl: string;
}

export interface SiteSettingsData {
  locations?: LocationData[];
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
  // Certificate Overrides
  certificateSchoolName: string;
  certificateSignatureImage: string;
  certificateRegNoTemplate: string;
  certificateTitle: string;
  certificateIsoImage: string;
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
  razorpayKeySecret: '',
  certificateSchoolName: 'Shakti Yoga Vidya Peetham',
  certificateSignatureImage: '',
  certificateRegNoTemplate: 'Reg. No. {id}/ATTC/SYVP/{year}',
  certificateTitle: 'CERTIFICATE OF COMPLETION',
  certificateIsoImage: '',
  locations: [
    {
      id: 'default',
      name: 'Main Studio',
      phone: '+91 87778 16410',
      email: 'mumbai@shaktiyogaraai.com',
      addressStreet: '123 Wellness Street',
      addressCity: 'Mumbai',
      addressState: 'Maharashtra',
      addressZip: '400001',
      addressCountry: 'India',
      studioHoursWeekdays: 'Monday - Friday: 6:00 AM - 9:00 PM',
      studioHoursSaturday: 'Saturday: 7:00 AM - 8:00 PM',
      studioHoursSunday: 'Sunday: 8:00 AM - 6:00 PM',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.062402127265!2d72.8274719!3d18.9840289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce84fd099517%3A0xe9f70d55e0be30!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
    },
    {
      id: 'demo-1',
      name: 'Pune',
      phone: '+91 87778 16411',
      email: 'pune@shaktiyogaraai.com',
      addressStreet: '456 Lotus Path',
      addressCity: 'Pune',
      addressState: 'Maharashtra',
      addressZip: '411001',
      addressCountry: 'India',
      studioHoursWeekdays: 'Monday - Friday: 7:00 AM - 8:00 PM',
      studioHoursSaturday: 'Saturday: 8:00 AM - 5:00 PM',
      studioHoursSunday: 'Sunday: Closed',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1891.8340320499298!2d73.8567437!3d18.5204303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c06fa5b44279%3A0x889020f7507b5a1b!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000001'
    },
    {
      id: 'demo-2',
      name: 'Bengaluru',
      phone: '+91 87778 16412',
      email: 'bengaluru@shaktiyogaraai.com',
      addressStreet: '789 Nirvana Lane, Indiranagar',
      addressCity: 'Bengaluru',
      addressState: 'Karnataka',
      addressZip: '560038',
      addressCountry: 'India',
      studioHoursWeekdays: 'Monday - Friday: 6:00 AM - 9:00 PM',
      studioHoursSaturday: 'Saturday: 7:00 AM - 8:00 PM',
      studioHoursSunday: 'Sunday: 8:00 AM - 4:00 PM',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9255856428787!2d77.6408283!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000002'
    },
    {
      id: 'demo-3',
      name: 'Delhi',
      phone: '+91 87778 16413',
      email: 'delhi@shaktiyogaraai.com',
      addressStreet: '12 Shanti Enclave, Connaught Place',
      addressCity: 'New Delhi',
      addressState: 'Delhi',
      addressZip: '110001',
      addressCountry: 'India',
      studioHoursWeekdays: 'Monday - Saturday: 6:30 AM - 8:30 PM',
      studioHoursSaturday: 'Saturday: 6:30 AM - 8:30 PM',
      studioHoursSunday: 'Sunday: 8:00 AM - 1:00 PM',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.9961603517877!2d77.216721!3d28.630453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b830d129%3A0x673dbb93ec8ffb2a!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000003'
    },
    {
      id: 'demo-4',
      name: 'Goa',
      phone: '+91 87778 16414',
      email: 'goa@shaktiyogaraai.com',
      addressStreet: '88 Shanti Beach Road, Anjuna',
      addressCity: 'Anjuna',
      addressState: 'Goa',
      addressZip: '403509',
      addressCountry: 'India',
      studioHoursWeekdays: 'Monday - Saturday: 7:00 AM - 7:00 PM',
      studioHoursSaturday: 'Saturday: 7:00 AM - 7:00 PM',
      studioHoursSunday: 'Sunday: 9:00 AM - 12:00 PM',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3844.8219460295193!2d73.743128!3d15.580447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfebef86cf6f2b%3A0xc3b8398b1e4f4fb3!2sGoa!5e0!3m2!1sen!2sin!4v1700000000004'
    }
  ]
};
