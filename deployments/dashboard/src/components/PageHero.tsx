import React from "react";
import classNames from "classnames";

export type PageHeroProps =
  | (
      | {
          children: React.ReactNode;
        }
      | {
          title: string;
        }
    ) & { className?: string };

function PageHero(props: PageHeroProps) {
  const content = "title" in props ? props.title : props.children;

  return <h1 className={classNames("text-xl font-theme flex items-center", props.className)}>{content}</h1>;
}

export default PageHero;
