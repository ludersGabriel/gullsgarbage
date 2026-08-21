#!/usr/bin/env bash
# Installs the gullsgarba.ge nginx site. Run as root:
#   sudo bash deploy/nginx/install-site.sh
#
# Reload only, never restart: nginx is already up serving astora.dev.br,
# kaima.dev.br, manager.kaima.dev.br and ldclinica.astora.dev.br. `nginx -t`
# runs first and aborts the script (set -e) before any reload if the config
# is bad.
set -euo pipefail

CONF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/gullsgarba.ge.conf"

ln -sf "$CONF" /etc/nginx/sites-available/gullsgarba.ge
ln -sf /etc/nginx/sites-available/gullsgarba.ge /etc/nginx/sites-enabled/gullsgarba.ge

nginx -t
systemctl reload nginx

echo
echo "Site installed. Next:"
echo "  sudo certbot --nginx -d gullsgarba.ge -d www.gullsgarba.ge"
