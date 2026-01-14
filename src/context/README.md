# Context

React Context providers cho global state.

## Contexts dự kiến

### `AuthContext.tsx`
- User authentication state
- Login/logout actions
- Token management
- Protected route logic

### `CreditContext.tsx`
- Credit balance
- Daily free credits
- Paid credits
- Credit operations

### `ToastContext.tsx`
- Global toast/notification system
- Show success/error messages

## Quy tắc

- Mỗi Context 1 file
- Export Provider và custom hook (useAuth, useCredit...)
- Type-safe context
- Wrap app trong providers
