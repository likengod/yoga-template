/**
 * WebMCP (Model Context Protocol for Web Browsers) integration.
 * Registers tools with in-browser AI agents via `navigator.modelContext.registerTool`
 * and attaches declarative annotations for agent crawlers.
 */

export function registerWebMcpTools() {
  if (typeof window === 'undefined') return;

  const tools = [
    {
      name: 'search_classes',
      description: 'Search available yoga classes, schedules, and pricing at Shakti Yoga Studio',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Class type or keyword (e.g. beginner, meditation, vinyasa)' }
        }
      },
      execute: async ({ category = '' }: { category?: string }) => {
        return {
          studio: 'Shakti Yoga Studio',
          classes: [
            { title: 'Morning Hatha Yoga', time: '6:30 AM - 7:30 AM', level: 'All Levels', category: 'Hatha' },
            { title: 'Vinyasa Flow & Pranayama', time: '8:00 AM - 9:00 AM', level: 'Intermediate', category: 'Vinyasa' },
            { title: 'Evening Restorative & Meditation', time: '6:00 PM - 7:00 PM', level: 'All Levels', category: 'Meditation' }
          ].filter(c => !category || c.category.toLowerCase().includes(category.toLowerCase()) || c.title.toLowerCase().includes(category.toLowerCase()))
        };
      }
    },
    {
      name: 'get_contact_info',
      description: 'Get studio contact details, location, phone number, and operating hours',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        return {
          name: 'Shakti Yoga Studio',
          phone: '+91 87778 16410',
          email: 'info@shaktiyogaraai.com',
          address: 'Near Vivekananda Statue, Raiganj, West Bengal 733134, India',
          hours: 'Monday - Saturday: 6:00 AM - 8:00 PM, Sunday: 7:00 AM - 12:00 PM'
        };
      }
    },
    {
      name: 'get_instructors',
      description: 'List certified yoga instructors at Shakti Yoga Studio',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        return {
          instructors: [
            { name: 'Acharya Prasenjit', specialty: 'Hatha Yoga & Meditation', experience: '10+ years' },
            { name: 'Priya Sharma', specialty: 'Vinyasa Flow & Flexibility', experience: '6+ years' }
          ]
        };
      }
    }
  ];

  // Try standard navigator.modelContext.registerTool
  try {
    const nav = navigator as any;
    if (nav.modelContext && typeof nav.modelContext.registerTool === 'function') {
      tools.forEach(tool => {
        try {
          nav.modelContext.registerTool(tool);
        } catch (e) {
          console.debug('WebMCP tool register note:', e);
        }
      });
      console.log('✅ WebMCP tools registered with navigator.modelContext');
    }
  } catch (err) {
    console.debug('WebMCP registration error:', err);
  }

  // Also expose global window.__webMcpTools for agent inspection
  try {
    (window as any).__webMcpTools = tools;
  } catch {}
}
