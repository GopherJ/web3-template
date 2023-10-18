import {BigNumber} from "ethers";
import {task} from "hardhat/config";
import {
  DRY_RUN,
  GLOBAL_OVERRIDES,
  TIME_LOCK_BUFFERING_TIME,
} from "../../helpers/constants";
import {increaseTime, waitForTx} from "../../helpers/misc-utils";

task("increase-to-execution-time", "Increase time to execution time").setAction(
  async (_, DRE) => {
    await DRE.run("set-DRE");
    const {getExecutorWithTimelock} = await import(
      "../../helpers/contracts-getters"
    );
    const timeLock = await getExecutorWithTimelock();
    const delay = await timeLock.getDelay();
    await increaseTime(delay.add(TIME_LOCK_BUFFERING_TIME).toNumber());
  }
);

task("decode-queued-txs", "Decode queued transactions").setAction(
  async (_, DRE) => {
    await DRE.run("set-DRE");
    const {getExecutorWithTimelock, getCurrentTime} = await import(
      "../../helpers/contracts-getters"
    );
    const {decodeInputData} = await import("../../helpers/contracts-helpers");
    const timeLock = await getExecutorWithTimelock();
    const time = await getCurrentTime();
    const gracePeriod = await timeLock.GRACE_PERIOD();
    const filter = timeLock.filters.QueuedAction();
    const events = await timeLock.queryFilter(filter);
    for (const e of events) {
      if (!(await timeLock.isActionQueued(e.args.actionHash))) {
        continue;
      }

      const expireTime = e.args.executionTime.add(gracePeriod);

      if (time.gt(expireTime)) {
        continue;
      }

      console.log(e.args.target.toString());
      console.log(
        JSON.stringify(decodeInputData(e.args.data.toString()), null, 4)
      );
      console.log();
    }
  }
);

task("decode-buffered-txs", "Decode buffered transactions").setAction(
  async (_, DRE) => {
    await DRE.run("set-DRE");
    const {getTimeLockDataInDb} = await import(
      "../../helpers/contracts-getters"
    );
    const {decodeInputData} = await import("../../helpers/contracts-helpers");
    const actions = await getTimeLockDataInDb();

    for (const a of actions) {
      const [target, , , data] = a.action;
      console.log(target);
      console.log(JSON.stringify(decodeInputData(data.toString()), null, 4));
      console.log();
    }
  }
);

task("queue-buffered-txs", "Queue buffered transactions").setAction(
  async (_, DRE) => {
    await DRE.run("set-DRE");
    const {getExecutorWithTimelock, getTimeLockDataInDb} = await import(
      "../../helpers/contracts-getters"
    );
    const timeLock = await getExecutorWithTimelock();
    const actions = await getTimeLockDataInDb();

    for (const a of actions) {
      console.log(a.actionHash);
      if (await timeLock.isActionQueued(a.actionHash)) {
        continue;
      }
      await waitForTx(
        await timeLock.queueTransaction(...a.action, GLOBAL_OVERRIDES)
      );
    }
  }
);

task("execute-buffered-txs", "Execute buffered transactions").setAction(
  async (_, DRE) => {
    await DRE.run("set-DRE");
    const {getExecutorWithTimelock, getTimeLockDataInDb} = await import(
      "../../helpers/contracts-getters"
    );
    const timeLock = await getExecutorWithTimelock();
    const actions = await getTimeLockDataInDb();

    for (const a of actions) {
      console.log(a.actionHash);
      if (!(await timeLock.isActionQueued(a.actionHash))) {
        continue;
      }
      await waitForTx(
        await timeLock.executeTransaction(...a.action, GLOBAL_OVERRIDES)
      );
    }
  }
);
