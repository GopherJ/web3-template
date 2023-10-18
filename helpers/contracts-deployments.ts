import {MultiSendCallOnly, ExecutorWithTimelock} from "../types";
import {getContractFactory} from "./contracts-getters";
import {withSaveAndVerify} from "./contracts-helpers";
import {eContractid} from "./types";

export const deployMultiSendCallOnly = async (verify?: boolean) => {
  return withSaveAndVerify(
    await getContractFactory("MultiSendCallOnly"),
    eContractid.MultiSendCallOnly,
    [],
    verify
  ) as Promise<MultiSendCallOnly>;
};

export const deployExecutorWithTimelock = async (
  args: string[],
  verify?: boolean
) => {
  return withSaveAndVerify(
    await getContractFactory("ExecutorWithTimelock"),
    eContractid.ExecutorWithTimelock,
    [...args],
    verify
  ) as Promise<ExecutorWithTimelock>;
};
