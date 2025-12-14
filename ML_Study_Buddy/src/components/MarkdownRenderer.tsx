"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { theme } = useTheme();

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");
          
          if (match) {
            return (
              <CodeBlock
                language={match[1]}
                code={codeString}
                theme={theme}
              />
            );
          }
          
          return (
            <code
              className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>;
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-foreground/20 pl-4 italic text-muted-foreground my-3">
              {children}
            </blockquote>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-border rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="px-4 py-2 bg-muted font-semibold text-left border-b border-border">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-4 py-2 border-b border-border">{children}</td>
          );
        },
        hr() {
          return <hr className="my-4 border-border" />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

interface CodeBlockProps {
  language: string;
  code: string;
  theme: "light" | "dark";
}

function CodeBlock({ language, code, theme }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </motion.button>
      </div>
      <SyntaxHighlighter
        style={theme === "dark" ? oneDark : oneLight}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.875rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
