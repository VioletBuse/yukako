// testworker.ts
var testworker_default = {
  fetch: async (req, env) => {
    const path = env.ENVIRONMENT;
    return new Response(path, {
      status: 200,
      headers: {
        "content-type": "text/plain"
      }
    });
  },
  scheduled: async (event) => {
    console.log(event);
    console.log("scheduled");
  }
};
export {
  testworker_default as default
};
