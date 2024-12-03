import ReactMarkdown from 'react-markdown';

const markdown = `
# 这是一个标题1

这是一些普通文本。

- 这是一个列表项
- 这是另一个列表项
---

[这是一个链接](https://example.com)
`;

export default function Home() {
  return (
    <div className="p-4">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
