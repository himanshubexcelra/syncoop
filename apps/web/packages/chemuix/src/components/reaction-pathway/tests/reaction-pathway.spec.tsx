import { newSpecPage } from "@stencil/core/testing";
import { ReactionPathway } from "../reaction-pathway";

describe("reaction-pathway", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [ReactionPathway],
      html: `<reaction-pathway></reaction-pathway>`,
    });
    expect(page.root).toEqualHtml(`
      <reaction-pathway>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </reaction-pathway>
    `);
  });
});
