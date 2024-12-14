import stringByteSlice from 'string-byte-slice';
import { BskyPost } from '../lib/bluesky/types';
import { Link } from './ui/Link';

type FacetedTextProps = {
  text: string;
  facets: BskyPost['record']['facets'];
};

export const FacetedText = ({ text, facets }: FacetedTextProps) => {
  // Sort facets by start index to process them in order
  const sortedFacets = facets?.sort((a, b) => a.index.byteStart - b.index.byteStart) ?? [];

  if (sortedFacets.length === 0) {
    return <Text text={text} />;
  }

  const parts: React.ReactNode[] = [];

  // Add text before first facet
  parts.push(<Text text={stringByteSlice(text, 0, sortedFacets[0]?.index.byteStart)} />);

  for (let i = 0; i < sortedFacets.length; i++) {
    const facet = sortedFacets[i];

    // Render the facet
    const facetText = stringByteSlice(text, facet.index.byteStart, facet.index.byteEnd);

    // Determine rendering based on facet type
    const firstFeature = facet.features[0];
    switch (firstFeature.$type) {
      case 'app.bsky.richtext.facet#link':
        parts.push(
          <>
            <Text text={' '} />
            <ExternalLink key={`facet-${i}`} href={firstFeature.uri}>
              {facetText}
            </ExternalLink>
          </>,
        );
        break;
      case 'app.bsky.richtext.facet#mention':
        parts.push(
          <>
            <Text text={' '} />
            <Mention key={`facet-${i}`} handle={facetText.slice(1)} />
          </>,
        );
        break;
      case 'app.bsky.richtext.facet#tag':
        parts.push(
          <>
            <Text text={' '} />
            <HashTag key={facetText} tag={facetText.slice(1)} />
          </>,
        );
        break;
    }
  }

  // Add remaining text after the last facet
  parts.push(<Text text={stringByteSlice(text, sortedFacets[sortedFacets.length - 1]?.index.byteEnd)} />);

  return parts;
};

function ExternalLink({ href, children }: { key: string; href: string; children: React.ReactNode }) {
  return <Link href={href}>{children}</Link>;
}

function Mention({ key, handle }: { key: string; handle: string }) {
  return (
    <Link to="/profile/$handle" params={{ handle }}>
      <span key={key} className="text-purple-500 font-semibold">
        @{handle.replace('.bksy.social', '')}
      </span>
    </Link>
  );
}

function HashTag({ key, tag }: { key: string; tag: string }) {
  return (
    <Link to="/tag/$tag" params={{ tag }}>
      <span key={key} className="text-green-500">
        #{tag}
      </span>
    </Link>
  );
}

function Text({ text }: { text: string }) {
  // we need to make a new line work in the browser
  return (
    <span>
      {text.split('\n').map((line, index) => (
        <>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </>
      ))}
    </span>
  );
}
