import rawBRE from "hardhat";
import {getFirstSigner} from "../../helpers/contracts-getters";
import {rlp} from "ethereumjs-util";
import {utils} from "ethers/lib/ethers";
import {solidityKeccak256} from "ethers/lib/utils";

const adHoc = async () => {
  console.time("ad-hoc");
  const signer = await getFirstSigner();
  let msg = '"hello world"';
  const sig = await signer.signMessage(msg);
  console.log(
    solidityKeccak256(["string"], [msg]),
    utils.hashMessage(msg),
    utils.splitSignature(sig)
  );
  console.timeEnd("ad-hoc");
};

async function main() {
  await rawBRE.run("set-DRE");
  await adHoc();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
