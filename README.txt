MONARCH TECH - NETLIFY DEPLOY (with working admin)

1. Install Node.js, then in this folder run:   npm install
2. Install the CLI:                            npm install -g netlify-cli
3. Log in and link the site:                   netlify login   then   netlify link   (choose your existing site)
4. Set your admin password (long and unique):  netlify env:set ADMIN_PASSWORD "your-long-password"
5. Deploy:                                     netlify deploy --prod

Then open https://YOUR-SITE/#admin, log in, edit, and click Publish changes.
Note: drag-and-drop deploys do NOT run the admin function. Use the CLI or connect a Git repo.
To change the hero video, replace public/monarch-bg.mp4 and redeploy.
