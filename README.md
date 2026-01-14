# Hidn Frontend

Frontend cho Hidn — Công cụ AI học tập ẩn danh.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **HTTP Client**: Custom API Client (Fetch-based)
- **Authentication**: NextAuth.js + JWT
- **State Management**: React Context API
- **Form Validation**: Custom validators
- **File Upload**: Multipart form-data
- **Deployment**: Vercel

## Cấu trúc Project

```
hidn-fe/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Auth routes (login, register, verify-email, etc.)
│   │   ├── (dashboard)/     # Protected routes (tools, history, profile)
│   │   ├── admin/           # Admin dashboard routes
│   │   ├── api/             # API route handlers (NextAuth)
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── auth/            # Auth components (LoginForm, RegisterForm)
│   │   ├── common/          # Reusable UI components (Button, Card, Modal)
│   │   ├── credit/          # Credit system components
│   │   ├── layout/          # Layout components (Navbar, Sidebar, Footer)
│   │   └── tools/           # AI tool components (Summary, Questions, etc.)
│   ├── services/            # API services
│   │   ├── admin/           # Admin service (users, credits, logs)
│   │   ├── ai/              # AI service (all AI tools)
│   │   ├── api/             # HTTP client configuration
│   │   ├── auth/            # Auth service (login, register, profile)
│   │   ├── history/         # History service
│   │   ├── tool/            # Tool config service
│   │   ├── user/            # User service
│   │   ├── wallet/          # Wallet service
│   │   └── index.ts         # Central service exports
│   ├── types/               # TypeScript type definitions
│   │   ├── admin.types.ts   # Admin-related types
│   │   ├── ai.types.ts      # AI tool types
│   │   ├── auth.types.ts    # Auth types
│   │   ├── common.types.ts  # Shared types
│   │   ├── history.types.ts # History types
│   │   ├── tool.types.ts    # Tool config types
│   │   ├── wallet.types.ts  # Wallet types
│   │   └── index.ts         # Central type exports
│   ├── lib/                 # Utilities
│   │   ├── auth/            # Auth utilities
│   │   ├── constants/       # Constants
│   │   └── utils/           # Helper functions
│   ├── hooks/               # Custom React hooks
│   │   ├── useCreditCheck.ts
│   │   └── useToolConfig.ts
│   ├── context/             # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── providers/           # Provider wrappers
│   │   └── NextAuthProvider.tsx
│   └── middleware.ts        # Next.js middleware (auth protection)
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Tạo file `.env.local`:
```bash
cp .env.local.example .env.local
```

3. Cấu hình `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
```

4. Chạy development server:
```bash
npm run dev
```

5. Mở [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

### 🔐 Authentication & User Management
- Đăng ký tài khoản với email verification
- Đăng nhập / Đăng xuất
- Reset password flow
- Profile management
- NextAuth.js integration
- JWT-based session management
- Protected routes với middleware
- Role-based access (User/Admin)

### 🤖 AI Tools
- **Summarize** - Tóm tắt văn bản dài thành nội dung ngắn gọn
- **Questions** - Tạo câu hỏi trắc nghiệm từ nội dung
- **Explain** - Giải thích văn bản phức tạp dễ hiểu hơn
- **Rewrite** - Viết lại văn bản với phong cách khác
- **OCR** - Trích xuất text từ hình ảnh (upload file)
- Real-time credit checking
- Character limit validation
- Copy to clipboard functionality
- Loading states và error handling

### 💳 Credit System
- Free daily credits (mặc định 20 credits/ngày)
- Paid credits system
- Credit balance display
- Credit costs per tool
- Transaction history
- Low credit warnings
- Auto-refresh daily credits

### 📜 History & Tracking
- Lịch sử sử dụng AI tools
- Pagination support
- View detailed results
- Delete history entries
- Filter by tool type

### 👨‍💼 Admin Dashboard
- **Dashboard Overview**: Thống kê tổng quan
- **User Management**: Quản lý users, view details
- **Credit Management**: Cấu hình pricing, daily credits, bonus
- **Tool Configuration**: Settings cho từng tool (min/max chars, cooldown)
- **Tool Analytics**: Phân tích usage, popularity, trends
- **Credit Logs**: Xem chi tiết sử dụng credits
- **Security Logs**: Monitor security events, failed logins
- **System Logs**: System activity tracking
- Charts và data visualization

### 🎨 UI/UX
- Responsive design (mobile-first)
- Clean, modern interface
- Loading states
- Error notifications
- Success feedback
- Smooth transitions
- Accessible components

## Development Guidelines

### Components
- Functional components với TypeScript
- Props interface rõ ràng và exported
- Client Components (`'use client'`) khi cần state/effects/events
- Server Components by default cho static content
- Component composition over inheritance
- Keep components focused và single-responsibility

### Styling
- Tailwind CSS utility classes
- Responsive design (mobile-first: sm, md, lg, xl)
- Consistent spacing scale
- Reusable component variants
- No inline styles

### State Management
- React Context cho global state (AuthContext, ThemeContext)
- Custom hooks cho reusable logic
- Local state với useState cho component-specific data
- Server state với SWR hoặc React Query (if needed)

### Type Safety
- All function parameters typed
- Return types explicitly defined
- No `any` types (use `unknown` if necessary)
- Types imported from central `@/types`
- Interface over type for object shapes

### API Calls
- Always use services layer
- Never call API directly from components
- Error handling với try-catch
- Loading states với useState
- Type-safe responses
```typescript
try {
  setLoading(true);
  const result = await aiService.summarize(text);
  setData(result);
} catch (error) {
  setError(error.message);
} finally {
  setLoading(false);
}
```

### File Naming
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Services: camelCase (e.g., `aiService.ts`)
- Types: camelCase with .types suffix (e.g., `admin.types.ts`)
- Hooks: camelCase with use prefix (e.g., `useCreditCheck.ts`)
- Utils: camelCase (e.g., `formatDate.ts`)

### Import Organization
```typescript
// 1. External dependencies
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal services
import { aiService } from '@/services';

// 3. Types
import type { AIResponse } from '@/types';

// 4. Components
import { Button } from '@/components/common';

// 5. Utils/constants
import { formatDate } from '@/lib/utils';
```

## Architecture

### Service Layer Pattern
Project sử dụng service layer để tách biệt business logic:
```typescript
// services/index.ts - Central exports
import { adminService } from './admin';
import { aiService } from './ai';

export { adminService, aiService };

// Usage in components
import { aiService } from '@/services';
const result = await aiService.summarize(text);
```

### Type Safety
Tất cả types được định nghĩa tập trung:
```typescript
// types/index.ts - Central type exports
export type { AdminUser, SecurityLog } from './admin.types';
export type { AIResponse } from './ai.types';

// Usage
import type { AdminUser } from '@/types';
```

### API Client
Custom API client với:
- Automatic JWT token handling
- Error handling và retry logic
- Request/response interceptors
- Type-safe responses

## Routing Structure

### Public Routes
- `/` - Landing page
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/forgot-password` - Quên mật khẩu
- `/verify-email` - Xác thực email

### Protected Routes (User)
- `/dashboard` - Dashboard
- `/dashboard/summarize` - AI Summarize tool
- `/dashboard/questions` - Question generator
- `/dashboard/explain` - AI Explanation
- `/dashboard/rewrite` - Rewriting tool
- `/dashboard/ocr` - OCR tool
- `/dashboard/history` - Usage history
- `/dashboard/profile` - User profile

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/credits` - Credit configuration
- `/admin/tools` - Tool settings
- `/admin/analytics` - Tool analytics
- `/admin/logs` - Credit logs
- `/admin/security` - Security logs
- `/admin/system` - System logs

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project vào Vercel
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
4. Deploy
5. Auto deploy on push to main branch

### Build Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## Testing

### Manual Testing Checklist
- [ ] Registration flow
- [ ] Login/logout
- [ ] Email verification
- [ ] Password reset
- [ ] All AI tools functionality
- [ ] Credit deduction
- [ ] History tracking
- [ ] Profile updates
- [ ] Admin dashboard (if admin user)
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Error states
- [ ] Loading states

### Test User Accounts
```
User Account:
- Email: user@test.com
- Password: test123

Admin Account:
- Email: admin@test.com
- Password: admin123
```

## Troubleshooting

### Common Issues

**CORS errors**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend CORS configuration includes frontend URL

**Authentication issues**
- Clear localStorage and cookies
- Check JWT token expiration
- Verify `NEXTAUTH_SECRET` is set

**API errors**
- Check network tab for request/response
- Verify backend is running
- Check API endpoint URLs

**Build errors**
- Run `npm run build` locally first
- Check TypeScript errors with `npm run lint`
- Verify all environment variables are set

## Performance Optimization

- Image optimization với Next.js Image component
- Route prefetching
- Code splitting automatic với App Router
- Lazy loading components khi cần
- Memoization với useMemo/useCallback khi phù hợp

## Environment Variables

### Development
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Optional
NEXT_PUBLIC_APP_NAME=Hidn
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Production
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENV=production

# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=strong-production-secret
```

### Generating NextAuth Secret
```bash
openssl rand -base64 32
```

## Project Philosophy

### Privacy First
- Không tự động lưu input/output (user phải chủ động save)
- Không lịch sử chat persistent
- Kín đáo, riêng tư
- One task → One result
- User có quyền xóa history bất cứ lúc nào

### User Experience
- Simple, intuitive interface
- Fast response times
- Clear error messages
- Helpful loading states
- Accessible design

### Code Quality
- Type-safe codebase
- Consistent code style
- Modular architecture
- Reusable components
- Clean code principles

## Contributing

1. Create feature branch from `main`
2. Make changes with clear commits
3. Test thoroughly
4. Update documentation if needed
5. Submit pull request

## License

Private - Not for redistribution

## Support

For issues or questions, contact the development team.
