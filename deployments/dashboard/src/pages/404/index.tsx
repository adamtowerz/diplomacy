import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@common/web-components";
import PageHero from "../../components/PageHero";
import PageSection from "../../components/PageSection";

export default function Page404() {
  return (
    <div className="space-y-4">
      <PageHero title="Missing Page"></PageHero>
      <PageSection>
        <Link to="/">
          <Button>Go home</Button>
        </Link>
      </PageSection>
    </div>
  );
}
