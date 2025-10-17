# TypeScript Type Safety TODO

1. [x] Ground the shared domain types
   - Define a `SiteConfig` interface (e.g. `app/types/config.ts`) and use `satisfies` when importing `app/config.json` so config consumers get real types.
   - Reconcile `config` usage vs data (e.g. provide `social.twitter` or stop destructuring `twitter` in `app/utils/meta.ts`).
   - Add a focused `npx tsc --noEmit --pretty false --maxNodeModuleJsDepth 0` run to confirm no remaining config/meta errors.

2. [x] Type the MDX content pipeline
   - Extend `env.d.ts` with a typed `ArticleFrontmatter` export and update `import.meta.glob` usages in `app/routes/articles_._index/posts.server.ts` and `app/routes/articles/route.tsx`.
   - Introduce shared post/article types (e.g. `ArticleSummary`, `ArticleLoaderData`) and apply them to `app/layouts/post/*` and `app/routes/articles_._index/articles.tsx`.
   - Validate with `npx tsc --noEmit` so article routes compile without `any`.

3. [ ] Type the theme provider and global hooks
   - Create explicit `ThemeContextValue` types for `app/components/theme-provider/theme-provider.tsx` and annotate `useTheme`.
   - Add return types and generics to `useWindowSize`, `useScrollToHash`, and any other shared hooks feeding layout/components.
   - Re-run `npx tsc --noEmit` ensuring `hooks` and `theme` folders are clean.

4. [ ] Add prop interfaces for UI primitives
   - Author proper prop types for `Button`, `Link`, `Heading`, `Section`, `List`, `Loader`, and associated Storybook stories.
   - Leverage existing polymorphic helpers where relevant and patch tests/stories to satisfy stricter props.
   - Confirm `app/components/*` primitives pass with `npx tsc --noEmit`.

5. [ ] Normalize typed form + control components
   - Annotate props for `components/input` (both `Input` and `TextArea`), `segmented-control`, and any shared form helpers.
   - Update `app/routes/contact/contact.tsx` to consume the typed APIs without explicit casts.
   - Run `npx tsc --noEmit` to verify contact form stories and route compile.

6. [ ] Type media and animation components
   - Introduce precise prop/state types for `Image`, `Carousel`, `Model`, `Progress`, and `Code` components (plus their stories).
   - Ensure Three.js helpers (`app/routes/home/displacement-sphere.tsx`, `app/utils/three.ts`) expose typed contracts used by these components.
   - Validate via `npx tsc --noEmit` focusing on media-related modules.

7. [ ] Tighten layout modules with typed data
   - Apply typed props/state to `Navbar`, `NavToggle`, `ThemeToggle`, `Project`, `Profile`, `Post`, and the error layout, wiring them to the typed hooks/components from prior tasks.
   - Replace loose refs (`useRef()`) with explicit element types and model derived data shapes (e.g. project cards).
   - Verify layouts compile cleanly with `npx tsc --noEmit`.

8. [ ] Type route modules and loaders end-to-end
   - Use `LoaderFunctionArgs`, `MetaFunction`, and typed `useLoaderData` generics across `home`, `articles`, `contact`, `root`, and API routes.
   - Share route data types via `app/routes.ts` (or a new `app/types/routes.ts`) to eliminate duplicate shapes.
   - Confirm `npx tsc --noEmit` succeeds with no implicit `any` in routes.

9. [ ] Enforce strict compiler settings and tooling
   - Enable `strict: true`, add `noUncheckedIndexedAccess`, tighten `skipLibCheck` as feasible, and surface remaining errors.
   - Create a `typecheck` npm script (e.g. `"typecheck": "tsc --noEmit"`) and update CI/docs.
   - Address the `vite.config.ts` typing mismatch (plugin options) so the stricter compiler run is green.
