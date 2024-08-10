import Net from "net";

const isPortTaken = (port: number) =>
  new Promise<boolean>((resolve, reject) => {
    const tester = Net.createServer();
    tester
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .once("error", (err) => ((err as any).code == "EADDRINUSE" ? resolve(true) : reject(err)))
      .once("listening", () => tester.once("close", () => resolve(false)).close())
      .listen(port);
  });

export { isPortTaken };
