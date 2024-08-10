import React from "react";
import classNames from "classnames";

export type PageSectionProps = {
  children: React.ReactNode;
  header?: boolean;
  padding?: "some" | "none";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const PageSection = React.forwardRef<HTMLDivElement, PageSectionProps>(function PageSection({ children, header, padding, className, ...rest }, ref) {
  return (
    <section
      className={classNames(
        "rounded border",
        {
          "bg-green-300": header,
          "p-4": !padding,
          "p-2": padding === "some",
        },
        className
      )}
      ref={ref}
      {...rest}
    >
      {children}
    </section>
  );
})

export type PageSectionHeaderProps = {
  title: string;
};

export function PageSectionHeader({ title }: PageSectionHeaderProps) {
  return <h2 className="font-bold text-lg">{title}</h2>;
}

export default PageSection;
