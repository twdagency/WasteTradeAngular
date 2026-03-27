# Rovo Dev AI Rules and Guidelines

## Project Context

This is an Angular application called "rail-academy-frontend" using PrimeNG for UI components.

## Technology Stack

- Angular 20.3.0
- PrimeNG 20.2.0 with Aura theme
- TypeScript
- SCSS for styling

## Code Style Guidelines

### TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Use single quotes for strings (as configured in prettier)
- Print width: 100 characters
- Use Angular parser for HTML formatting

### Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images (does not work for inline base64 images)
- Prefer `provideX` functions in app.config.ts
- Use zoneless change detection

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

### State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

### Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

### Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

### PrimeNG Configuration

- Always use light theme (dark mode disabled)
- Import PrimeNG modules as needed in components
- Follow PrimeNG component patterns
- Use primeicons for icons
- Use ToastService for display Toast instead of MessageService
- **Always use PrimeNG Table (`p-table`) with `common-prime-table` class for all table implementations**

### bootstrap Best Practices

- Use bootstrap for layout, spacing, and utility styling
- Use PrimeNG for complex UI components (tables, calendars, etc.)
- Prefer bootstrap utility classes over custom CSS when possible
- **NEVER use inline styles** (e.g., `style="..."`) - use Tailwind classes or SCSS instead

### File Organization

- Keep components in src/app/
- Use .ts, .html, .scss file separation
- Follow Angular naming conventions

### Testing

- Write unit tests for components
- Use Jasmine and Karma for testing
- Test files should end with .spec.ts

## Refactoring Guidelines

### Code Migration Best Practices

- **ALWAYS check existing code** before creating new implementations
- **Move existing logic** to new files instead of rewriting from scratch
- **Preserve original functionality** including:
  - Color schemes and styling
  - Display names and terminology
  - Business logic and validation rules
  - Method signatures and behavior
- **Review the current implementation** thoroughly before refactoring
- **Test that refactored code maintains** the same visual and functional output
- **Never assume** - always inspect what's already implemented

### Example: Creating Shared Components

```typescript
// ❌ Wrong: Rewriting logic from scratch
export class UserTag {
  getRoleDisplayName(role: Role): string {
    switch (role) {
      case Role.Trainer:
        return 'Trainer'; // Wrong - original was 'Training Provider'
    }
  }
}

// ✅ Correct: Moving existing logic
// 1. Check original component for existing methods
// 2. Copy the exact implementation including colors, names, styling
// 3. Move to new shared component
// 4. Update original component to use new shared component
```

## Specific Rules for Rovo Dev

### When Making Changes

1. Always check existing code patterns before implementing
2. Maintain consistency with current architecture
3. Update tests when modifying components
4. Follow the established project structure

### File Naming

- Use kebab-case for file names
- Component files: `component-name.ts`, `component-name.html`, `component-name.scss`
- Service files: `service-name.service.ts`

### Dependencies

- Only add dependencies that are necessary
- Check if functionality exists in current stack before adding new packages
- Update package.json appropriately

### API Development Rules

- **All API request/response types** must be defined in `src/app/types/request.types.ts`
- **Follow the established naming pattern**: `Get[Entity]Params`, `Get[Entity]Response`, `Get[Entity]ResponseItem`
- **Use PaginatedResponse<T>** for paginated endpoints
- **Service methods** should follow the pattern established in existing services (e.g., course.service.ts)

### Common Tasks

- When adding PrimeNG components, import the module in the component
- When creating new routes, update app.routes.ts
- When adding global styles, use src/styles.scss
- When configuring services, use app.config.ts providers array
- When implement a task/feature "like" or "as same as" an existed feature, always inspect what's already implemented before

### i18n

- Always apply i18n when coding.
- Dont update the assets/i18n/\* files. We will use external platform to solve that so dont care about it
- use localized$ with "import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';"
- use "translate = inject(TranslatePipe);" for html translate pipe
- new route should define at src/app/constants/route.const.ts. when we navigateUrl / navigate route, we need to use ROUTES_WITH_SLASH or addLanguagePrefix to make the route works well with i18n

### Date time task

- Always use momentjs to solve task

### Layout

- always follow common layout like header, logo, footer when implement a new page
