// testworker.ts
var testworker_default = {
  fetch: async (req, env) => {
    const site = env.SITE;
    return site.serve(req);
  },
  scheduled: async (event) => {
    console.log(event);
    console.log("scheduled");
  }
};
export {
  testworker_default as default
};
