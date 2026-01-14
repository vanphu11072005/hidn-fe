# Services

Thư mục chứa business logic và API communication.

## Cấu trúc

### `api/`
HTTP client và API configuration:
- `client.ts` - Axios/Fetch wrapper với JWT handling
- `interceptors.ts` - Request/Response interceptors
- `endpoints.ts` - API endpoint constants

### `auth/`
Authentication services:
- `authService.ts` - Login, register, logout
- `tokenService.ts` - JWT token management
- `userService.ts` - User profile operations

### `credit/`
Credit system services:
- `creditService.ts` - Get credits, purchase, history
- `walletService.ts` - Wallet operations

### `ai/`
AI tool services (gọi backend API):
- `summaryService.ts` - AI Smart Summary
- `questionService.ts` - Question Generator
- `explanationService.ts` - AI Explanation
- `rewriteService.ts` - Academic Rewriting
- `estimateService.ts` - Estimate credits

## Quy tắc

- Services return typed responses
- Handle errors properly
- Use async/await
- Export service objects or functions
- No UI logic trong services
