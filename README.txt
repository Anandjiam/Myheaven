MYHEAVEN — UPDATED VERCEL + VENICE BUNDLE

This package contains:
- index.html — Sprk-inspired character gallery, profiles, situations, chats, and image studio
- api/auth.js — private access-code check
- api/chat.js — secure Venice text-chat proxy
- api/image.js — secure Venice image-edit proxy using each character’s own portrait URL
- six original, distinct fictional Indian-woman portraits (WebP)
- vercel.json — Vercel function settings

IMPORTANT BEFORE YOU START
The current live website is not changed by downloading this ZIP. Your existing GitHub/Vercel deployment stays as it is until you commit the new files.

EASIEST GITHUB UPLOAD METHOD
1. Download and extract Myheaven-Deploy-Bundle.zip on your Mac.
2. Open https://github.com/Anandjiam/Myheaven
3. Open the repository’s Code tab. Use Add file > Upload files.
4. From Finder, open the extracted myheaven_bundle folder. Select index.html, all six portrait-*.webp files, vercel.json, and the api folder. Drag the selected items to GitHub’s upload area. If GitHub does not preserve the api folder, create api/auth.js, api/chat.js, and api/image.js individually using Add file > Create new file and paste the matching files from the extracted folder.
5. Commit changes. Vercel should automatically redeploy the project. Check Deployments until the newest deployment says Ready.

VERCEL ENVIRONMENT VARIABLES
In Vercel > your Myheaven project > Settings > Environment Variables, add:
- VENICE_API_KEY = your Venice API key
- MYHEAVEN_ACCESS_CODE = a private passcode you choose
Optional:
- VENICE_CHAT_MODEL = venice-uncensored-1-2
- VENICE_IMAGE_EDIT_MODEL = qwen-edit-uncensored
Save them for Production, then go to Deployments and redeploy the latest deployment so the variables take effect.

SECURITY AND COST NOTES
- Never put the Venice API key in index.html or GitHub. It belongs only in Vercel Environment Variables.
- Venice API calls use API credits. Creating an API key does not add a balance.
- The access code protects the AI endpoints, but the public Vercel URL and static portrait files can still be opened by anyone who has their URLs. This is a simple private-use gate, not a full login system.
- Chat history and custom character data are stored in the browser that created them. They do not yet sync between Mac and iPhone.
- The six bundled portraits are original fictional characters and are individually linked to their built-in character IDs.
- Image generation uses the selected character’s saved portrait as a reference via Venice /image/edit. It can improve consistency but cannot guarantee an identical face in every generated image.
- Image-edit models have different prices. Check Venice’s current model pricing before repeated generation.
