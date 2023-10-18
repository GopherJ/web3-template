import {task} from "hardhat/config";
import {MULTI_SEND, MULTI_SIG, TIME_LOCK_SIGS} from "../../helpers/constants";
import {decodeMulti, MetaTransaction} from "ethers-multisend";
import {findLastIndex} from "lodash";
import {eContractid} from "../../helpers/types";

task("decode-safe-txs", "Decode safe txs").setAction(async (_, DRE) => {
  await DRE.run("set-DRE");
  const {getExecutorWithTimelock} = await import(
    "../../helpers/contracts-getters"
  );
  const {getContractAddressInDb, getSafeSdkAndService} = await import(
    "../../helpers/contracts-helpers"
  );
  const {decodeInputData} = await import("../../helpers/contracts-helpers");
  const timeLock = (await getContractAddressInDb(
    eContractid.ExecutorWithTimelock
  ))
    ? await getExecutorWithTimelock()
    : undefined;

  const {safeService} = await getSafeSdkAndService(MULTI_SIG);
  const res = (
    await safeService.getPendingTransactions(MULTI_SIG)
  ).results.sort((a, b) =>
    a.nonce > b.nonce
      ? 1
      : a.nonce === b.nonce &&
        new Date(a.submissionDate).valueOf() >
          new Date(b.submissionDate).valueOf()
      ? 1
      : -1
  );

  const txs = res
    .filter((x, i) => findLastIndex(res, (y) => y.nonce === x.nonce) === i)
    .reduce((ite, cur) => {
      if (!cur.data) {
        return ite;
      }

      const toConcatenate = (
        cur.to === MULTI_SEND
          ? decodeMulti(cur.data).map((x) => ({to: x.to, data: x.data}))
          : [{to: cur.to, data: cur.data}]
      ).map(({to, data}) => {
        if (to != timeLock?.address) {
          return {to, data};
        }

        const sig = TIME_LOCK_SIGS[data.slice(0, 10)];
        if (!sig) {
          return {to, data};
        }

        [to, , , data] = timeLock.interface.decodeFunctionData(sig, data);
        return {to, data};
      });

      ite = ite.concat(toConcatenate);

      return ite;
    }, [] as {to: string; data: string}[]);

  for (const tx of txs) {
    const {to, data} = tx;
    console.log(to);
    console.log(JSON.stringify(decodeInputData(data), null, 4));
    console.log();
  }
});

task(
  "propose-buffered-txs",
  "Propose buffered timelock transactions"
).setAction(async (_, DRE) => {
  await DRE.run("set-DRE");
  const {proposeMultiSafeTransactions} = await import(
    "../../helpers/contracts-helpers"
  );
  const {getTimeLockDataInDb, getTimeLockData} = await import(
    "../../helpers/contracts-getters"
  );
  const actions = await getTimeLockDataInDb();
  const transactions: MetaTransaction[] = [];

  for (const a of actions) {
    console.log(a.actionHash);
    const [target, , , data, executionTime] = a.action;
    const {newTarget, newData} = await getTimeLockData(
      target.toString(),
      data.toString(),
      executionTime.toString()
    );
    transactions.push({
      to: newTarget,
      value: "0",
      data: newData,
    });
  }

  await proposeMultiSafeTransactions(transactions);
});
