import fs from "fs";
import {DB_PATH} from "../../helpers/constants";

export const step_00 = async (verify = false) => {
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
};
