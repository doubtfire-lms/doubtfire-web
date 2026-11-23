import postcss from 'postcss';

// DOCX styles are user-controlled. Keep ordinary formatting, but reject CSS
// constructs that can fetch resources or create rules outside the parsed rule.
const SAFE_PROPERTY = /^(?:--docx-[a-z0-9-]+|-?[a-z][a-z0-9-]*)$/i;
const UNSAFE_VALUE =
  /\\|\/\*|@|(?:url|image(?:-set)?|cross-fade|element|paint|expression|attr)\s*\(|https?:|javascript:|data:|blob:|\/\//i;
const UNSAFE_SELECTOR = /\\|:host\b|::part\b|::slotted\b/i;

function safeDeclaration(property: string, value: string): boolean {
  return SAFE_PROPERTY.test(property) && !UNSAFE_VALUE.test(value);
}

export function sanitizeDocxStyles(styles: string[]): string[] {
  return styles.map((css) => {
    try {
      const parsed = postcss.parse(css);
      const safe = postcss.root();

      for (const node of parsed.nodes) {
        // docx-preview uses ordinary rules for document formatting. Dropping
        // at-rules also excludes @import and remote @font-face resources.
        if (node.type !== 'rule' || UNSAFE_SELECTOR.test(node.selector)) {
          continue;
        }

        const rule = postcss.rule({selector: node.selector});
        for (const child of node.nodes) {
          if (child.type === 'decl' && safeDeclaration(child.prop, child.value)) {
            rule.append(postcss.decl({prop: child.prop, value: child.value}));
          }
        }
        if (rule.nodes.length > 0) {
          safe.append(rule);
        }
      }
      return safe.toString();
    } catch {
      return '';
    }
  });
}

export function sanitizeDocxInlineStyles(root: HTMLElement): void {
  for (const element of root.querySelectorAll<HTMLElement>('[style]')) {
    const original = element.style;
    const safe = document.createElement('span').style;
    for (let index = 0; index < original.length; index++) {
      const property = original.item(index);
      const value = original.getPropertyValue(property);
      if (safeDeclaration(property, value)) {
        safe.setProperty(property, value);
      }
    }
    if (safe.length > 0) {
      element.setAttribute('style', safe.cssText);
    } else {
      element.removeAttribute('style');
    }
  }
}
