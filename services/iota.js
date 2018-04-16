import IOTA from "iota.lib.js";
import { IOTA_API } from "../config/index";

const Iota = new IOTA();
const toAddress = string => string.substr(0, IOTA_API.ADDRESS_LENGTH);

export default {
  toAddress,
  utils: Iota.utils
};
