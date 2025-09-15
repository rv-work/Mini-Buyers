# Buyer Lead Intake System

A comprehensive buyer lead management application built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 🎯 Project Overview

This application is designed to efficiently capture, manage, and track buyer leads for real estate businesses. It provides a complete CRUD interface with advanced filtering, search capabilities, CSV import/export functionality, and change tracking.

## ✨ Features

- **Complete Lead Management**: Create, read, update, and delete buyer leads
- **Advanced Search & Filtering**: Real-time search with multiple filter options
- **CSV Import/Export**: Bulk operations with validation and error reporting
- **Change History Tracking**: Comprehensive audit trail for all modifications
- **Server-Side Rendering**: Fast loading with real pagination
- **Rate Limiting**: API protection against abuse
- **Form Validation**: Client and server-side validation with Zod
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Demo Authentication**: Simple login system for demonstration purposes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd buyer-lead-intake
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` file in the root directory:

   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/buyer_leads?schema=public"

   # Auth (for demo purposes)
   AUTH_SECRET="your-secret-key-here"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed the database with demo data
   npx prisma db seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access the application**

   Open http://localhost:3000 and click "Continue as Demo User"

## 📊 Data Model

### Buyer Lead Fields

| Field        | Type   | Required    | Description                                                         |
| ------------ | ------ | ----------- | ------------------------------------------------------------------- |
| fullName     | String | Yes         | Lead's full name (2-80 chars)                                       |
| email        | String | No          | Valid email address                                                 |
| phone        | String | Yes         | Phone number (10-15 digits)                                         |
| city         | Enum   | Yes         | Chandigarh, Mohali, Zirakpur, Panchkula, Other                      |
| propertyType | Enum   | Yes         | Apartment, Villa, Plot, Office, Retail                              |
| bhk          | Enum   | Conditional | 1, 2, 3, 4, Studio (required for Apartment/Villa)                   |
| purpose      | Enum   | Yes         | Buy, Rent                                                           |
| budgetMin    | Number | No          | Minimum budget in INR                                               |
| budgetMax    | Number | No          | Maximum budget in INR (must be ≥ budgetMin)                         |
| timeline     | Enum   | Yes         | 0-3m, 3-6m, >6m, Exploring                                          |
| source       | Enum   | Yes         | Website, Referral, Walk-in, Call, Other                             |
| status       | Enum   | Yes         | New, Qualified, Contacted, Visited, Negotiation, Converted, Dropped |
| notes        | String | No          | Additional notes (≤ 1,000 chars)                                    |
| tags         | Array  | No          | Custom tags for categorization                                      |

## 🔧 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **File Processing**: PapaParse for CSV handling
- **Authentication**: Demo login system

## 📁 Project Structure

```
buyer-lead-intake/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── buyers/           # Buyer management pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── BuyerForm.tsx     # Lead creation/editing form
│   │   ├── BuyerList.tsx     # Lead listing with pagination
│   │   ├── SearchFilters.tsx # Search and filter interface
│   │   └── ImportExport.tsx  # CSV import/export functionality
│   ├── lib/
│   │   ├── prisma.ts         # Database connection
│   │   ├── validations.ts    # Zod schemas
│   │   ├── auth.ts           # Authentication helpers
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── __tests__/                # Unit tests
├── .env.local               # Environment variables
└── README.md
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with demo data
npm run db:studio        # Open Prisma Studio

# Testing
npm run test             # Run unit tests
npm run lint             # Run ESLint
```

## 📋 Key Features Explained

### Search & Filtering

- **Real-time search**: Debounced search across name, phone, and email fields
- **Multiple filters**: City, property type, status, and timeline filters
- **URL synchronization**: All filters and pagination state preserved in URL
- **Server-side filtering**: Efficient database queries with proper indexing

### CSV Import/Export

- **Import validation**: Row-by-row validation with detailed error reporting
- **Export with filters**: Export respects current search and filter settings
- **Transaction safety**: Failed imports don't partially corrupt data
- **Error handling**: Clear feedback for both successful and failed operations

### Change History

- **Comprehensive tracking**: Every create, update, and delete operation logged
- **User attribution**: All changes tracked with user information
- **Diff visualization**: Before/after values for all field changes
- **Audit trail**: Complete history accessible for compliance and debugging

### Rate Limiting

- **API protection**: Prevents abuse with configurable rate limits
- **Per-user limits**: Individual rate limiting for create/update operations
- **Graceful degradation**: Clear error messages when limits exceeded

## 🔐 Authentication & Authorization

The application uses a simplified demo authentication system:

- **Demo login**: Single-click access for demonstration purposes
- **Session management**: Secure cookie-based sessions
- **Ownership enforcement**: Users can only edit their own leads
- **Admin capabilities**: Framework ready for role-based permissions

## 🚀 Deployment

### Environment Setup

1. Set up PostgreSQL database (local or cloud)
2. Configure environment variables
3. Run database migrations
4. Build and deploy application

### Recommended Platforms

- **Vercel**: Seamless Next.js deployment with built-in PostgreSQL
- **Railway**: Simple database + app deployment
- **Digital Ocean**: Full control with App Platform or Droplets

## 🧪 Testing

The application includes unit tests for critical validation logic:

```bash
npm run test
```

Test coverage includes:

- Form validation schemas
- Business logic validations
- CSV parsing and validation
- Rate limiting functionality

## 🐛 Known Issues & Limitations

- **Single-user demo**: No multi-tenant support in current implementation
- **File upload**: No attachment support for buyer documents
- **Email notifications**: No automated email notifications for status changes
- **Advanced search**: No full-text search on notes field

## 🔮 Future Enhancements

- [ ] Multi-tenant support with proper user management
- [ ] Email notification system for status changes
- [ ] Advanced reporting and analytics dashboard
- [ ] Document attachment capabilities
- [ ] Integration with CRM systems
- [ ] Mobile app companion
- [ ] Advanced search with full-text capabilities
- [ ] Automated lead scoring and prioritization

## 🏗️ Design Decisions

### Server-Side Rendering

- **Real pagination**: Database-level pagination for performance
- **SEO friendly**: All pages properly indexed and linkable
- **Fast loading**: Reduced client-side JavaScript execution

### Validation Strategy

- **Zod schemas**: Single source of truth for validation rules
- **Client + Server**: Immediate feedback with server-side security
- **Business rules**: Complex validation rules properly enforced

### Database Design

- **Audit trails**: Complete history tracking without performance impact
- **Efficient queries**: Proper indexing for search and filter operations
- **Data integrity**: Foreign key constraints and validation at database level

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the existing documentation
- Review the test cases for usage examples

## 📄 License

This project is open source and available under the MIT License.
