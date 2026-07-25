import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Suspense and lazy to react imports
if 'Suspense' not in content:
    content = re.sub(
        r"import\s*\{\s*(.*?)\s*\}\s*from\s*['\"]react['\"];", 
        r"import { \1, Suspense, lazy } from 'react';", 
        content, 
        count=1
    )

pages_to_lazy = [
    'WorkspacePage', 'ActivityDetailPage', 'EventDetailPage',
    'ActivitiesPage', 'EventsPage', 'AboutPage', 'TeamPage', 'ContactPage',
    'RoadmapsPage', 'ProjectsPage', 'CertificateVerifyPage', 'CollabPage',
    'PortfolioBuilder', 'PublicPortfolio', 'DashboardPage', 'AnalyticsPage'
]

for page in pages_to_lazy:
    # Find import page from '...'
    # Handle single or double quotes
    pattern = rf"import\s+{page}\s+from\s+['\"](.*?)['\"];"
    replacement = rf"const {page} = lazy(() => import('\1'));"
    content = re.sub(pattern, replacement, content)

suspense_fallback = "<Suspense fallback={<div className=\"loading-fallback\" style={{padding: '100px', textAlign: 'center', color: 'var(--t2)'}}>Loading Module...</div>}>"

if '<Suspense fallback' not in content:
    content = content.replace('<main style={{ paddingTop: nh, position: "relative", zIndex: 1 }}>', f'<main style={{{{ paddingTop: nh, position: "relative", zIndex: 1 }}}}>\n        {suspense_fallback}')
    content = content.replace('</main>', '      </Suspense>\n      </main>')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("App.jsx updated with lazy loading.")
