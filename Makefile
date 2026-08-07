# HERMES CITY — canonical test entry points
#
# `make` is the canonical runner on Linux/WSL/macOS. On hosts without make
# (e.g. this Windows git-bash host), use the documented Python commands:
#
#   python -m unittest discover -s hermes-bridge/tests -v   (bridge suite, if present)
#   python scripts/verify-site.py                           (static site gate)
#   python scripts/verify-hermes-bridge.py                  (bridge verification)
#
.PHONY: test verify verify-site

test:
	python -m unittest discover -s hermes-bridge/tests -v

verify-site:
	python scripts/verify-site.py

verify:
	python scripts/verify-site.py
	@if [ -d hermes-bridge ] && [ -f scripts/verify-hermes-bridge.py ]; then python scripts/verify-hermes-bridge.py; else echo "hermes-bridge verification not present on this branch — skipped"; fi
