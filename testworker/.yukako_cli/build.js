// testworker.ts
var testworker_default = {
  fetch: async (req, env) => {
    const site = env.SITE;
    return site.serve(req);
  }
};
export {
  testworker_default as default
};
