import { newE2EPage } from "@stencil/core/testing";
describe("<reaction-pathway>", () => {
  it("should render full component", async () => {
    const page = await newE2EPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(`<reaction-pathway-test-wrapper type="general"></reaction-pathway-test-wrapper>`);
    await page.compareScreenshot("should render full component", {
      fullPage: false,
    });
  });
  it("should not render honeycombs when disabled by property", async () => {
    const page = await newE2EPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(`<reaction-pathway-test-wrapper type="general" display-honeycomb="false"></reaction-pathway-test-wrapper>`);
    await page.compareScreenshot("should not render honeycombs when disabled by property", {
      fullPage: false,
    });
  });
  it("should not render honeycombs when values are omitted", async () => {
    const page = await newE2EPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(`<reaction-pathway-test-wrapper type="honeycomb-omitted-data"></reaction-pathway-test-wrapper>`);
    await page.compareScreenshot("should not render honeycombs when values are omitted", {
      fullPage: false,
    });
  });
  it("should render regulated honeycomb", async () => {
    const page = await newE2EPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(`<reaction-pathway-test-wrapper type="honeycomb-regulated-data"></reaction-pathway-test-wrapper>`);
    await page.compareScreenshot("should render regulated honeycomb", {
      fullPage: false,
    });
  });
  it("should render protected honeycomb", async () => {
    const page = await newE2EPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(`<reaction-pathway-test-wrapper type="honeycomb-protected-data"></reaction-pathway-test-wrapper>`);
    await page.compareScreenshot("should render protected honeycomb", {
      fullPage: false,
    });
  });
  it("should render published honeycomb", async () => {
    const page = await newE2EPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(`<reaction-pathway-test-wrapper type="honeycomb-published-data"></reaction-pathway-test-wrapper>`);
    await page.compareScreenshot("should render published honeycomb", {
      fullPage: false,
    });
  });
  it("should not render score values", async () => {
    const page = await newE2EPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(`<reaction-pathway-test-wrapper type="general" display-score="false"></reaction-pathway-test-wrapper>`);
    await page.compareScreenshot("should not render score values", {
      fullPage: false,
    });
  });
  it("should not render references", async () => {
    const page = await newE2EPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(`<reaction-pathway-test-wrapper type="general" display-reaction-reference="false"></reaction-pathway-test-wrapper>`);
    await page.compareScreenshot("should not render references", {
      fullPage: false,
    });
  });
  it("should not render reaction name", async () => {
    const page = await newE2EPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(`<reaction-pathway-test-wrapper type="general" display-reaction-name="false"></reaction-pathway-test-wrapper>`);
    await page.compareScreenshot("should not render reaction name", {
      fullPage: false,
    });
  });
});
//# sourceMappingURL=reaction-pathway.e2e.js.map
