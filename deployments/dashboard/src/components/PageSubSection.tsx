import classNames from "classnames";
import React from "react";

export type PageSectionHeaderProps = {
  title: string;
};

function PageSubSectionHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
}) {
  return <h3 className={classNames("text-gray-700", className)}>{children}</h3>;
}

function PageSubSectionContent({
  children,
  noPadding = false,
  className,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
}) {
  return <div className={classNames("rounded bg-gray-100 border", { "p-2": !noPadding }, className)}>{children}</div>;
}

export type PageSectionProps = {
  children: React.ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
};

export default function PageSubSection({ children, className }: PageSectionProps) {
  return <section className={className}>{children}</section>;
}

PageSubSection.Header = PageSubSectionHeader;
PageSubSection.Content = PageSubSectionContent;
