# TicketFlow: Angular to Next.js 15+ Conversion Plan

## Overview
Convert the existing Angular TicketFlow application to a modern Next.js 15+ application with TypeScript, maintaining all functionality while improving performance and user experience.

## Current Angular Architecture Analysis

### ✅ Completed Angular Components
- **Models**: Ticket, FormSchema, Comment, History, Shared types
- **Services**: TicketService, FormSchemaService, CommentService, HistoryService
- **Theme**: Custom TicketFlow blue theme (#0055AA) with Segoe UI typography
- **Features**: Dynamic forms, comments, history, file attachments

### 🎯 Target Next.js Architecture

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Next.js Project
```bash
npx create-next-app@latest ticketflow-nextjs --typescript --tailwind --eslint --app --src-dir
cd ticketflow-nextjs
```

### 1.2 Install Core Dependencies
```bash
# UI Components
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar
npm install @radix-ui/react-badge @radix-ui/react-button @radix-ui/react-card
npm install @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-form @radix-ui/react-input @radix-ui/react-label
npm install @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group
npm install @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-sheet
npm install @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-textarea
npm install @radix-ui/react-toast @radix-ui/react-tooltip

# shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add accordion alert-dialog avatar badge button card
npx shadcn-ui@latest add checkbox dialog dropdown-menu form input label
npx shadcn-ui@latest add popover progress radio-group select separator
npx shadcn-ui@latest add sheet switch tabs textarea toast tooltip

# Form Management
npm install react-hook-form @hookform/resolvers zod

# State Management & Data Fetching
npm install @tanstack/react-query axios zustand

# Utilities
npm install clsx tailwind-merge class-variance-authority
npm install date-fns lucide-react

# Development
npm install -D @types/node
```

### 1.3 Configure Tailwind with TicketFlow Theme
```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        ticketflow: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80c0ff',
          300: '#4da6ff',
          400: '#1a8dff',
          500: '#0055AA', // Primary TicketFlow blue
          600: '#004499',
          700: '#003388',
          800: '#002277',
          900: '#001166',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

## Phase 2: Type Definitions & Models

### 2.1 Convert Angular Models to TypeScript Types
- Convert Angular interfaces to TypeScript types
- Add Zod schemas for runtime validation
- Create API response types

### 2.2 File Structure
```
src/
├── types/
│   ├── ticket.ts
│   ├── form-schema.ts
│   ├── comment.ts
│   ├── history.ts
│   └── shared.ts
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── validations.ts
└── components/
    └── ui/ (shadcn components)
```

## Phase 3: API Layer & State Management

### 3.1 Convert Angular Services to React Hooks
- **TicketService** → `useTicket` hook with React Query
- **FormSchemaService** → `useFormSchema` hook
- **CommentService** → `useComments` hook
- **HistoryService** → `useHistory` hook

### 3.2 API Client Setup
```typescript
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

export const ticketApi = {
  getTicket: (id: string) => api.get(`/tickets/${id}`),
  updateTicket: (id: string, data: any) => api.put(`/tickets/${id}`, data),
  // ... other methods
}
```

### 3.3 React Query Setup
```typescript
// hooks/useTicket.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketApi.getTicket(id),
  })
}
```

## Phase 4: Component Architecture

### 4.1 Page Structure
```
app/
├── layout.tsx
├── page.tsx
└── tickets/
    └── [id]/
        ├── page.tsx (TicketFlowPage)
        └── components/
            ├── dynamic-form.tsx
            ├── ticket-summary.tsx
            ├── ticket-tabs.tsx
            └── action-bar.tsx
```

### 4.2 Component Conversion Map

| Angular Component | Next.js Component | Description |
|------------------|-------------------|-------------|
| `TicketFlowComponent` | `TicketFlowPage` | Main page layout |
| `DynamicFormComponent` | `DynamicForm` | Schema-driven form |
| `TicketSummaryComponent` | `TicketSummary` | Right panel summary |
| `TicketTabsComponent` | `TicketTabs` | Comments/History tabs |
| `ActionBarComponent` | `ActionBar` | Sticky bottom actions |

### 4.3 Dynamic Form Implementation
```typescript
// components/dynamic-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function DynamicForm({ schema, initialData }: DynamicFormProps) {
  const form = useForm({
    resolver: zodResolver(createZodSchema(schema)),
    defaultValues: initialData,
  })

  return (
    <Form {...form}>
      <Accordion type="multiple" className="w-full">
        {schema.sections.map((section) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionContent>
              {section.fields.map((field) => (
                <DynamicField key={field.id} field={field} form={form} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Form>
  )
}
```

## Phase 5: UI/UX Implementation

### 5.1 Responsive Layout
```typescript
// app/tickets/[id]/page.tsx
export default function TicketPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: 70% form, 30% summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 p-6">
        <div className="space-y-6">
          <DynamicForm />
          <TicketTabs />
        </div>
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <TicketSummary />
        </div>
      </div>
      <ActionBar />
    </div>
  )
}
```

### 5.2 Mobile Responsiveness
- Single column layout on mobile
- Collapsible summary drawer
- Sticky tab headers
- Touch-friendly interactions

### 5.3 Accessibility Features
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management
- High contrast mode

## Phase 6: Advanced Features

### 6.1 Form Features
- **Schema-driven rendering**: Convert Angular reactive forms to React Hook Form
- **Field types**: All existing field types (text, number, textarea, select, date, checkbox, radio, file)
- **Conditional logic**: Implement `visibleWhen` and `readOnlyWhen` conditions
- **Validation**: Client-side and server-side validation
- **Autosave**: Debounced auto-save functionality

### 6.2 Comments System
```typescript
// components/comments/comment-composer.tsx
export function CommentComposer() {
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  
  return (
    <Card>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-between items-center">
          <FileUpload onFilesSelected={setAttachments} />
          <Button onClick={handleSubmit}>Post Comment</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 6.3 History Timeline
```typescript
// components/history/history-timeline.tsx
export function HistoryTimeline({ events }: { events: HistoryEvent[] }) {
  const groupedEvents = groupEventsByDate(events)
  
  return (
    <div className="space-y-6">
      {Array.from(groupedEvents.entries()).map(([date, events]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {formatDate(date)}
          </h3>
          <div className="space-y-3">
            {events.map((event) => (
              <HistoryEventItem key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Phase 7: Performance Optimization

### 7.1 Next.js Optimizations
- Server-side rendering for initial page load
- Static generation for form schemas
- Image optimization for attachments
- Code splitting by route

### 7.2 React Optimizations
- `React.memo` for expensive components
- `useMemo` and `useCallback` for heavy computations
- Virtual scrolling for large comment/history lists
- Lazy loading for non-critical components

### 7.3 Bundle Optimization
- Tree shaking unused code
- Dynamic imports for heavy libraries
- Optimize Tailwind CSS purging
- Compress and minify assets

## Phase 8: Testing & Quality Assurance

### 8.1 Testing Strategy
```bash
# Testing Dependencies
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jest jest-environment-jsdom
npm install -D @playwright/test
```

### 8.2 Test Coverage
- Unit tests for hooks and utilities
- Component tests for UI interactions
- Integration tests for form workflows
- E2E tests for critical user journeys

## Phase 9: Migration Strategy

### 9.1 Gradual Migration
1. **Phase 1**: Set up Next.js project with basic routing
2. **Phase 2**: Migrate data models and API layer
3. **Phase 3**: Convert core components one by one
4. **Phase 4**: Implement advanced features
5. **Phase 5**: Performance optimization and testing

### 9.2 Data Migration
- Export existing form schemas
- Migrate user data and tickets
- Update API endpoints if needed
- Maintain backward compatibility

## Phase 10: Deployment & DevOps

### 10.1 Deployment Setup
```bash
# Vercel deployment
npm install -g vercel
vercel --prod

# Or Docker deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 10.2 Environment Configuration
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['api.ticketflow.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

## Success Metrics

### Performance Improvements
- **Bundle Size**: Reduce by 40-60% compared to Angular
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Core Web Vitals**: All green scores

### Developer Experience
- **Type Safety**: 100% TypeScript coverage
- **Build Time**: < 30s for development builds
- **Hot Reload**: < 200ms for component changes
- **Test Coverage**: > 80% for critical paths

### User Experience
- **Mobile Performance**: 90+ Lighthouse score
- **Accessibility**: WCAG 2.1 AA compliance
- **Cross-browser**: Support for modern browsers
- **Offline Support**: Basic offline functionality

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1-2: Setup & Models | 1-2 weeks | - |
| Phase 3-4: API & Components | 2-3 weeks | Phase 1-2 |
| Phase 5-6: UI & Features | 2-3 weeks | Phase 3-4 |
| Phase 7-8: Optimization & Testing | 1-2 weeks | Phase 5-6 |
| Phase 9-10: Migration & Deployment | 1 week | Phase 7-8 |

**Total Estimated Duration**: 7-11 weeks

## Risk Mitigation

### Technical Risks
- **Complex form logic**: Create comprehensive test suite
- **Performance issues**: Implement monitoring and profiling
- **Browser compatibility**: Use progressive enhancement

### Business Risks
- **Feature parity**: Maintain detailed feature comparison
- **User training**: Create migration guides and documentation
- **Downtime**: Plan for zero-downtime deployment strategy

## Conclusion

This conversion plan provides a comprehensive roadmap for migrating the Angular TicketFlow application to Next.js 15+ while maintaining all existing functionality and improving performance, developer experience, and user experience. The modular approach allows for gradual migration and reduces risk while ensuring a successful transition to the modern React ecosystem.
