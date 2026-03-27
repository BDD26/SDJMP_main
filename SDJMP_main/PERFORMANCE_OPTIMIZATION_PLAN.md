# SkillMatch Performance Optimization Plan

## Executive Summary
The website has poor performance, particularly on low-end machines. Analysis reveals bundle size issues (290 KB gzipped JS), heavy charting library (38% of JS), and untapped optimization opportunities.

---

## CRITICAL Issues Found

### 1. **RECHARTS BLOAT** ⚠️ CRITICAL
- **Impact**: 110.35 kB gzipped (~38% of total JS)
- **Usage**: AdminAnalytics, AdminDashboard, StudentDashboard, EmployerDashboard, chart.jsx wrapper
- **Problem**: Currently bundled for ALL users, but only needed for admin analytics
- **Solution**: Lazy-load recharts only when needed + consider lightweight alternative

### 2. **CSS File Size**
- **Impact**: 156.25 kB uncompressed (24.02 kB gzipped)
- **Problem**: Likely contains unused Tailwind classes
- **Solution**: PurgeCSS / TailwindCSS optimize + remove unused @radix-ui components

### 3. **Large App Bundle**
- **Impact**: 209.83 kB (63.29 kB gzipped)
- **Problem**: All pages imported upfront despite lazy router setup
- **Solution**: Already lazy-loaded well, but can be further optimized

### 4. **Forms Bundle**
- **Impact**: 81.29 kB (21.89 kB gzipped)
- **Problem**: react-hook-form + zod on all pages
- **Solution**: Lazy-load form pages separately

### 5. **Icon Bundling**
- **Impact**: Dozens of small icon files (0.18-0.54 kB each)
- **Problem**: lucide-react icons are tree-shaken but many unused icons still included
- **Solution**: Tree-shake more aggressively or use sprite sheets for common icons

---

## Performance Optimization Priorities

### Phase 1: HIGH IMPACT (Bundle Reduction - 60-80 KB savings)
- [ ] Lazy-load recharts (don't load on public pages)
- [ ] Optimize CSS with unused class removal
- [ ] Code-split admin-only pages more aggressively
- [ ] Enable gzip compression on server

### Phase 2: MEDIUM IMPACT (20-40 KB savings)
- [ ] Remove unused Radix UI components
- [ ] Optimize images/assets
- [ ] Lazy-load heavy pages (StudentResumeManager, JobPostForm)
- [ ] Minify inline styles

### Phase 3: LOW IMPACT (Server Performance)
- [ ] Database query optimization (N+1 prevention)
- [ ] Add Redis caching for frequently accessed data
- [ ] Optimize API endpoints
- [ ] Add service worker for offline caching

### Phase 4: Runtime Performance
- [ ] Implement React.memo for expensive components
- [ ] Optimize re-render patterns
- [ ] Use virtualization for long lists
- [ ] Implement route-based code splitting deeper

---

## Specific Implementation Steps

### Step 1: Lazy-Load Recharts
**Files to modify**: 
- `vite.config.js` - Add recharts to lazy chunk
- `src/components/ui/chart.jsx` - Dynamic import
- `src/pages/admin/*.jsx` - Add Suspense boundaries

**Expected savings**: ~110 KB gzipped

### Step 2: Optimize CSS
**Files to modify**:
- `tailwind.config.js` - Add content globs
- `globals.css` - Remove unused @imports

**Expected savings**: ~10-15 KB gzipped

### Step 3: Server Compression & Caching
**Files to modify**:
- `server/src/app.js` - Add compression middleware

**Expected savings**: ~30% bandwidth reduction

### Step 4: Database Optimization
**Areas to audit**:
- Check for N+1 queries in job browsing
- Add indexes on frequently queried fields
- Implement pagination

---

## Build Results Before & After
- **Before**: 290 KB gzipped JS + 24 KB CSS = 314 KB
- **Target**: ~180 KB gzipped JS + 12 KB CSS = 192 KB
- **Savings**: ~39% reduction in initial load

---

## Testing & Validation
- Run Lighthouse audit after each phase
- Test on low-end devices (simulate throttling)
- Monitor Core Web Vitals (LCP, FID, CLS)
- Test all chart-heavy pages for functionality

---

## Timeline
- **Phase 1**: 1-2 days (highest impact)
- **Phase 2**: 1-2 days  
- **Phase 3**: 2-3 days
- **Phase 4**: 3-5 days (ongoing)

