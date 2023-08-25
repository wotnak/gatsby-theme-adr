import React from 'react';
import TagLink from './TagLink';

const TagList = ({ tags }: { tags: string[] }) => {
  return (
    <ul className="text-sm flex flex-wrap">
      {tags.map((tag, i) => (
        <li key={i} className="mr-0.5 mb-0.5">
          <TagLink
            tag={tag}
            className="px-2 py-0.5 text-xs font-bold bg-gray-200 text-charcoal-600 rounded-full font-sans"
          />
        </li>
      ))}
    </ul>
  );
};

export default TagList;
