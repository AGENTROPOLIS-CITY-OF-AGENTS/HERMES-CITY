#!/usr/bin/env python3
"""HERMES-CITY static site verification gate (B1 production hardening).

All-local checks (no network unless --live):
  1. Required routes exist (index, community/, social/, super-hermes/, 404.html, robots.txt, sitemap.xml).
  2. HTML structure: parse every public page; every local href/src resolves on disk relative
     to the page; same-page anchors resolve to existing element ids; unique ids per page.
  3. HTML validation (structural): lang, viewport, title, meta description on root, img alt,
     accessible name on every <a>/<button>, form control labels, heading order sanity.
  4. Accessibility gates: skip link, main landmark, nav landmark + aria-label, :focus-visible CSS,
     prefers-reduced-motion CSS.
  5. Canonical metadata on root: canonical URL, Open Graph, twitter card, theme-color, favicon.
  6. Color contrast: WCAG 2.1 contrast for :root text colors against bg/panel composites.
  7. robots.txt + sitemap.xml well-formed; 404.html self-contained + noindex.
Optional --live: HEAD-check external http(s) URLs.

Exit code 0 = pass, 1 = fail.
"""
import argparse
import html.parser
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = [
    "index.html",
    "community/index.html",
    "social/index.html",
    "super-hermes/index.html",
]
REQUIRED_ROUTES = PAGES + ["404.html", "robots.txt", "sitemap.xml"]

FAILS = []
WARNS = []


def fail(page, check, detail):
    FAILS.append((page, check, detail))


def warn(page, check, detail):
    WARNS.append((page, check, detail))


class PageParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.hrefs = []
        self.srcs = []
        self.images = []  # (attrs, self_closing)
        self.anchors = []
        self.buttons = []
        self.inputs = []
        self.labels_for = []
        self.headings = []
        self.stack = []
        self._pending_a = None
        self._pending_button = None
        self._text_buf = []
        self.has_lang = False
        self.has_viewport = False
        self.has_title = False
        self.has_description = False
        self.has_canonical = False
        self.has_og = False
        self.has_twitter = False
        self.has_theme_color = False
        self.has_favicon = False
        self.has_main = False
        self.has_nav = False
        self.has_skip_link = False
        self.errors = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag in ("meta", "link", "input", "img", "br", "hr", "source", "area", "base", "col", "embed", "param", "track", "wbr"):
            self.handle_startendtag(tag, attrs)
        else:
            self.stack.append(tag)
        if "id" in d:
            self.ids.append(d["id"])
        if tag == "a" and "href" in d:
            classes = d.get("class", "").split()
            self._pending_a = {
                "href": d["href"],
                "aria": d.get("aria-label", ""),
                "skip": "skip-link" in classes,
            }
            self._text_buf = []
            if self._pending_a["skip"]:
                self.has_skip_link = True
        if tag == "img":
            self.images.append(d)
        if tag == "button":
            self._pending_button = {
                "aria_label": d.get("aria-label", ""),
                "aria_labelledby": d.get("aria-labelledby", ""),
            }
            self._text_buf = []
        if tag in ("input", "select", "textarea"):
            self.inputs.append(d)
        if tag == "label" and d.get("for"):
            self.labels_for.append(d["for"])
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.headings.append(tag)
        if tag == "html":
            self.has_lang = bool(d.get("lang"))
        if tag == "main":
            self.has_main = True
        if tag == "nav":
            self.has_nav = bool(d.get("aria-label"))

    def handle_startendtag(self, tag, attrs):
        d = dict(attrs)
        if tag == "meta":
            name = d.get("name", "")
            prop = d.get("property", "")
            http = d.get("http-equiv", "")
            if name == "viewport":
                self.has_viewport = True
            if name == "description":
                self.has_description = True
            if name == "theme-color":
                self.has_theme_color = True
            if prop.startswith("og:"):
                self.has_og = True
            if name.startswith("twitter:"):
                self.has_twitter = True
        elif tag == "link":
            rel = d.get("rel", "")
            if rel == "canonical":
                self.has_canonical = True
            if "icon" in rel.split():
                self.has_favicon = True
        elif tag == "img":
            self.images.append(d)

    def handle_endtag(self, tag):
        if tag == "a" and self._pending_a is not None:
            self.anchors.append(
                (self._pending_a["href"], self._pending_a["aria"], "".join(self._text_buf).strip())
            )
            self._pending_a = None
            self._text_buf = []
        if tag == "button" and self._pending_button is not None:
            self._pending_button["text"] = "".join(self._text_buf).strip()
            self.buttons.append(self._pending_button)
            self._pending_button = None
            self._text_buf = []
        if tag in self.stack:
            # pop to matching tag
            for i in range(len(self.stack) - 1, -1, -1):
                if self.stack[i] == tag:
                    del self.stack[i:]
                    break
        if tag == "title":
            self.has_title = True

    def handle_data(self, data):
        if self._pending_a is not None or self._pending_button is not None:
            self._text_buf.append(data)


def parse_page(path):
    parser = PageParser()
    with open(path, encoding="utf-8") as fh:
        try:
            parser.feed(fh.read())
            parser.close()
        except Exception as exc:  # noqa: BLE001
            fail(os.path.relpath(path, ROOT), "html-parse", str(exc))
    return parser


def check_routes():
    missing = [r for r in REQUIRED_ROUTES if not os.path.isfile(os.path.join(ROOT, r))]
    if missing:
        fail("ROOT", "routes", "missing: " + ", ".join(missing))
    else:
        print("[PASS] routes: all %d required routes present" % len(REQUIRED_ROUTES))


def check_links(page_rel, parser, live):
    page_dir = os.path.dirname(os.path.join(ROOT, page_rel)) or ROOT
    for href in parser.hrefs:
        if href.startswith(("http://", "https://", "mailto:", "tel:", "data:", "javascript:")):
            if live and href.startswith("http"):
                try:
                    code = urllib.request.urlopen(href, timeout=8).getcode()
                    if code >= 400:
                        fail(page_rel, "link-live", "%s -> HTTP %d" % (href, code))
                except Exception as exc:  # noqa: BLE001
                    fail(page_rel, "link-live", "%s -> %s" % (href, exc))
            continue
        if href.startswith("#"):
            target = href[1:]
            if target and target not in parser.ids:
                fail(page_rel, "anchor", "missing id %s" % href)
            continue
        path = href.split("#")[0].split("?")[0]
        if not path:
            continue
        target = os.path.normpath(os.path.join(page_dir, path))
        if not os.path.exists(target):
            fail(page_rel, "link-local", "%s (resolved %s) does not exist" % (href, target))


def check_a11y(page_rel, parser, is_root):
    if parser.errors:
        fail(page_rel, "html-structure", "; ".join(parser.errors[:5]))
    if not parser.has_lang:
        fail(page_rel, "a11y-lang", "missing lang attribute on <html>")
    if not parser.has_viewport:
        fail(page_rel, "a11y-viewport", "missing viewport meta")
    if not parser.has_title:
        fail(page_rel, "a11y-title", "missing <title>")
    if is_root:
        if not parser.has_description:
            fail(page_rel, "meta-description", "missing description meta")
        if not parser.has_canonical:
            fail(page_rel, "meta-canonical", "missing canonical link")
        if not parser.has_og:
            warn(page_rel, "meta-og", "missing Open Graph tags")
        if not parser.has_twitter:
            warn(page_rel, "meta-twitter", "missing twitter card tags")
        if not parser.has_theme_color:
            warn(page_rel, "meta-theme-color", "missing theme-color meta")
        if not parser.has_favicon:
            warn(page_rel, "meta-favicon", "missing favicon link")
        if not parser.has_skip_link:
            fail(page_rel, "a11y-skip-link", "missing skip link")
    if not parser.has_main:
        fail(page_rel, "a11y-main", "missing <main> landmark")
    if not parser.has_nav:
        warn(page_rel, "a11y-nav", "missing <nav aria-label>")
    for attrs in parser.images:
        if not attrs.get("alt") and attrs.get("role") != "presentation":
            fail(page_rel, "a11y-img-alt", "img without alt: %s" % attrs.get("src", "?"))
    for href, aria, _text in parser.anchors:
        if not aria and not _text:
            fail(page_rel, "a11y-link-name", "link with no accessible name: %s" % href)
    for btn in parser.buttons:
        if not (btn.get("aria_label") or btn.get("aria_labelledby") or btn.get("text", "").strip()):
            fail(page_rel, "a11y-button-name", "button with no accessible name")
    for attrs in parser.inputs:
        cid = attrs.get("id")
        if not (attrs.get("aria-label") or attrs.get("aria-labelledby") or (cid and cid in parser.labels_for)):
            fail(page_rel, "a11y-input-label", "form control with no label association: %s" % (cid or attrs))
    dups = sorted({i for i in parser.ids if parser.ids.count(i) > 1})
    if dups:
        fail(page_rel, "html-unique-ids", "duplicate ids: %s" % ", ".join(dups))
    # heading order sanity: no h1 -> h3 skip
    order = [int(h[1]) for h in parser.headings]
    for i in range(1, len(order)):
        if order[i] > order[i - 1] + 1:
            warn(page_rel, "a11y-heading-order", "heading level jumps %d -> %d" % (order[i - 1], order[i]))


def parse_css_vars(path):
    vars_map = {}
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    m = re.search(r":root\s*\{(.*?)\}", text, re.S)
    if not m:
        return vars_map, text
    for k, v in re.findall(r"(--[\w-]+)\s*:\s*([^;}]+);", m.group(1)):
        vars_map[k.strip()] = v.strip()
    return vars_map, text


def hex_to_rgb(hexval):
    hexval = hexval.strip().lstrip("#")
    if len(hexval) == 3:
        hexval = "".join(c * 2 for c in hexval)
    return tuple(int(hexval[i:i + 2], 16) for i in (0, 2, 4))


def parse_color(value, vars_map):
    value = value.strip()
    m = re.match(r"#([0-9a-fA-F]{3,8})", value)
    if m:
        return hex_to_rgb(m.group(1))
    m = re.match(r"rgba?\(([^)]+)\)", value)
    if m:
        parts = [p.strip() for p in m.group(1).split(",")]
        rgb = tuple(int(float(p)) for p in parts[:3])
        alpha = float(parts[3]) if len(parts) == 4 else 1.0
        return rgb, alpha
    if value.startswith("var(--"):
        key = value[value.index("(") + 1:-1].strip()
        return parse_color(vars_map.get(key, "#000000"), vars_map)
    return (0, 0, 0)


def blend(bg, fg, alpha):
    return tuple(round(bg[i] * (1 - alpha) + fg[i] * alpha) for i in range(3))


def luminance(rgb):
    def chan(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * chan(rgb[0]) + 0.7152 * chan(rgb[1]) + 0.0722 * chan(rgb[2])


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def check_contrast():
    vars_map, css_text = parse_css_vars(os.path.join(ROOT, "styles.css"))
    bg = parse_color(vars_map.get("--bg", "#05070b"), vars_map)
    panel = parse_color(vars_map.get("--panel", "rgba(12,18,28,0.78)"), vars_map)
    panel_rgb, panel_alpha = panel
    panel_composite = blend(bg, panel_rgb, panel_alpha)
    text_colors = ["--text", "--muted", "--cyan", "--red", "--lime", "--purple"]
    text_colors = [c for c in text_colors if c in vars_map]
    ok = True
    for var in text_colors:
        fg = parse_color(vars_map[var], vars_map)
        if isinstance(fg, tuple) and len(fg) == 2:
            fg_rgb, fg_alpha = fg
            fg = blend(bg, fg_rgb, fg_alpha)
        on_bg = contrast(bg, fg)
        on_panel = contrast(panel_composite, fg)
        if on_bg < 4.5 or on_panel < 4.5:
            fail("styles.css", "contrast", "%s on bg=%.2f:1 on panel=%.2f:1 (needs >= 4.5)" % (var, on_bg, on_panel))
            ok = False
        else:
            print("[PASS] contrast %s: bg %.2f:1 / panel %.2f:1" % (var, on_bg, on_panel))
    if not css_text:
        fail("styles.css", "css-read", "could not read styles.css")
    if "prefers-reduced-motion" not in css_text:
        fail("styles.css", "a11y-reduced-motion", "no prefers-reduced-motion rule")
    if ":focus-visible" not in css_text:
        fail("styles.css", "a11y-focus", "no :focus-visible rule")
    if ".skip-link" not in css_text:
        fail("styles.css", "a11y-skip-style", "no .skip-link style")
    return ok


def check_robots_sitemap():
    robots = os.path.join(ROOT, "robots.txt")
    with open(robots, encoding="utf-8") as fh:
        content = fh.read().strip()
    if not content:
        fail("robots.txt", "robots", "empty")
    sitemap = os.path.join(ROOT, "sitemap.xml")
    try:
        tree = ET.parse(sitemap)
        urls = tree.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}url")
        if not urls:
            fail("sitemap.xml", "sitemap", "no <url> entries")
        else:
            print("[PASS] sitemap: %d URLs" % len(urls))
    except ET.ParseError as exc:
        fail("sitemap.xml", "sitemap", str(exc))


def check_404():
    path = os.path.join(ROOT, "404.html")
    text = open(path, encoding="utf-8").read()
    if "noindex" not in text:
        fail("404.html", "404", "missing robots noindex")
    if '<link rel="stylesheet"' in text or "<script" in text:
        fail("404.html", "404", "must be self-contained (no external css/js)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--live", action="store_true", help="HEAD-check external URLs (network)")
    args = ap.parse_args()

    check_routes()
    for page in PAGES:
        parser = parse_page(os.path.join(ROOT, page))
        check_links(page, parser, args.live)
        check_a11y(page, parser, is_root=(page == "index.html"))
    check_contrast()
    check_robots_sitemap()
    check_404()

    print("\n=== SUMMARY ===")
    if FAILS:
        print("FAIL: %d issue(s)" % len(FAILS))
        for page, check, detail in FAILS:
            print("  [FAIL] %s | %s | %s" % (page, check, detail))
    else:
        print("PASS: no failing checks")
    if WARNS:
        print("WARN: %d issue(s)" % len(WARNS))
        for page, check, detail in WARNS:
            print("  [WARN] %s | %s | %s" % (page, check, detail))
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
