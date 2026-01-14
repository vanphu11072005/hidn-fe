# Hooks

Custom React hooks để reuse logic.

## Hooks dự kiến

### Auth Hooks
- `useAuth.ts` - Authentication state và actions
- `useUser.ts` - User profile data

### Credit Hooks
- `useCredit.ts` - Credit balance và operations
- `useCreditHistory.ts` - Credit usage history

### AI Tool Hooks
- `useSummary.ts` - Summary tool logic
- `useQuestions.ts` - Question generator logic
- `useExplanation.ts` - Explanation tool logic
- `useRewrite.ts` - Rewrite tool logic

### Common Hooks
- `useLocalStorage.ts` - localStorage với TypeScript
- `useDebounce.ts` - Debounce input
- `useToast.ts` - Toast notifications

## Quy tắc

- Hook names bắt đầu với "use"
- Return object với clear naming
- Handle loading/error states
- Cleanup effects properly
