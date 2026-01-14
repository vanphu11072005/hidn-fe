# Lib

Thư mục chứa utilities, types, và constants.

## Cấu trúc

### `types/`
TypeScript type definitions:
- `auth.types.ts` - User, Login, Register types
- `credit.types.ts` - Credit, Wallet, Transaction types
- `ai.types.ts` - AI tool request/response types
- `common.types.ts` - Shared types (ApiResponse, etc.)

### `constants/`
App constants:
- `routes.ts` - Route paths
- `api.ts` - API endpoints
- `credits.ts` - Credit costs, limits
- `tools.ts` - Tool configurations

### `utils/`
Utility functions:
- `format.ts` - Date, number formatting
- `validation.ts` - Input validation helpers
- `storage.ts` - localStorage helpers
- `error.ts` - Error handling utilities

## Quy tắc

- Pure functions trong utils
- Export individual functions/constants
- Strong typing
- No side effects
