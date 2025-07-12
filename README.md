# @networkpro/csp-endpoint

> CSP reporting endpoint for Network Pro Strategies.

This Netlify Function accepts `POST` requests at:  
<https://netwk.pro/.netlify/functions/csp-report>

## 🔐 Purpose

Captures and filters Content Security Policy (CSP) violation reports. It supports:

- High-risk violation detection
- Deduplicated alerting via [ntfy](https://ntfy.sh/)
- Basic filtering of low-value noise (e.g., browser extensions, eval, image loads)

## 📦 Deployment

This project is intended for deployment via Netlify.

```bash
netlify deploy --prod
```

## 📜 License

Licensed under [CC-BY-4.0](LICENSES/CC-BY-4.0.txt) OR [GPL-3.0-or-later](LICENSES/COPYING.txt)
