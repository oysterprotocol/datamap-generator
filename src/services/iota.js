import utils from "iota.lib.js/lib/utils/utils";
import { IOTA_API } from "../config/index";

const toAddress = string => string.substr(0, IOTA_API.ADDRESS_LENGTH);

export default {
  toAddress,
  utils: utils
};
