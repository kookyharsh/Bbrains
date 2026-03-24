class Snowflake12 {
  constructor(workerId = 1) {
    if (workerId < 0 || workerId > 99) {
      throw new Error("workerId must be 0–99");
    }
    this.workerId = workerId;
    this.lastMs = 0;
    this.sequence = 0;
  }

  nextId() {
    let now = Date.now() % 100000000; // 8 digits time window

    if (now === this.lastMs) {
      this.sequence++;
      if (this.sequence > 99) {
        // wait for next ms
        while ((Date.now() % 100000000) === now) {}
        return this.nextId();
      }
    } else {
      this.sequence = 0;
    }

    this.lastMs = now;

    const t = String(now).padStart(8, "0");
    const w = String(this.workerId).padStart(2, "0");
    const s = String(this.sequence).padStart(2, "0");

    return t + w + s; // 12-digit string
  }
}

// usage
const gen = new Snowflake12(7);
let n=1
do {
  console.log(gen.nextId());
  n= n+1
} while (n<=1000000);