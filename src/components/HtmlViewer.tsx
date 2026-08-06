interface Props {
  html: string;
}

export default function HtmlViewer({ html }: Props) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
