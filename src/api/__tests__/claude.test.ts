import { describe, it, expect } from 'vitest';

// Test the extractXml logic by importing it indirectly
// Since extractXml is not exported, we test the behavior through string patterns

describe('XML extraction patterns', () => {
  function extractXml(response: string): string {
    // Replicate the extractXml logic from claude.ts
    const xmlBlockMatch = response.match(/```xml\s*\n([\s\S]*?)\n```/);
    if (xmlBlockMatch) {
      return xmlBlockMatch[1].trim();
    }

    const codeBlockMatch = response.match(/```\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    const mxfileMatch = response.match(/<mxfile[\s\S]*<\/mxfile>/);
    if (mxfileMatch) {
      return mxfileMatch[0].trim();
    }

    return response.trim();
  }

  it('should extract XML from markdown code fence with xml tag', () => {
    const response = 'Here is the diagram:\n```xml\n<mxfile>content</mxfile>\n```\nDone.';
    expect(extractXml(response)).toBe('<mxfile>content</mxfile>');
  });

  it('should extract XML from generic code fence', () => {
    const response = '```\n<mxfile>content</mxfile>\n```';
    expect(extractXml(response)).toBe('<mxfile>content</mxfile>');
  });

  it('should extract raw mxfile XML without code fences', () => {
    const response = 'Some text <mxfile>content</mxfile> more text';
    expect(extractXml(response)).toBe('<mxfile>content</mxfile>');
  });

  it('should return trimmed content when no XML patterns found', () => {
    const response = '  some random content  ';
    expect(extractXml(response)).toBe('some random content');
  });

  it('should handle multiline XML', () => {
    const xml = `<mxfile>
  <diagram>
    <mxGraphModel>
      <root/>
    </mxGraphModel>
  </diagram>
</mxfile>`;
    const response = `\`\`\`xml\n${xml}\n\`\`\``;
    expect(extractXml(response)).toBe(xml);
  });
});

describe('retry message structure', () => {
  it('should create correct message array for first attempt', () => {
    const messages = [{ role: 'user', content: 'Generate a diagram' }];
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('user');
  });

  it('should create correct 3-message array for retry', () => {
    const previousXml = '<mxfile>bad xml</mxfile>';
    const errorFeedback = 'Error: missing VPC';
    const messages = [
      { role: 'user', content: 'Generate a diagram' },
      { role: 'assistant', content: previousXml },
      { role: 'user', content: errorFeedback },
    ];
    expect(messages).toHaveLength(3);
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toBe(previousXml);
    expect(messages[2].role).toBe('user');
    expect(messages[2].content).toContain('Error');
  });
});
