import React from 'react';
import { Link } from 'gatsby';
import slugify from '../util/slugify';

const TagLink = ({ tag, className }: { tag: string; className?: string }) => {
  return (
    <Link to={`/adrs/${slugify(tag)}`} className={className}>
      {tag}
    </Link>
  );
};

export default TagLink;
