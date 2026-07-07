/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand blue (logo, primary buttons, active nav)
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Dark navy sidebar (dashboard sidebar background)
        navy: {
          800: '#1E293B',
          900: '#0F172A',
          950: '#0A0F1C',
        },
        // Role accent colors (from user role icons)
        role: {
          client: '#2563EB',
          civil: '#16A34A',
          architect: '#7C3AED',
          structural: '#A855F7',
          mep: '#0D9488',
          contractor: '#F97316',
          admin: '#1E293B',
        },
        // Status colors
        status: {
          progress: '#2563EB',
          review: '#F59E0B',
          completed: '#16A34A',
          cancelled: '#EF4444',
          pending: '#F59E0B',
          accepted: '#16A34A',
        },
        ink: {
          900: '#0F172A',
          700: '#334155',
          500: '#64748B',
          300: '#CBD5E1',
          100: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.06), 0 1px 3px 0 rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '0.875rem',
      },
    },
  },
  plugins: [],
}
